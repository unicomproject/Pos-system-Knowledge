<!-- title: Platform User Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

# Platform User Management Flow

## Purpose

Defines how Platform Admin lists, creates, updates, and assigns roles to internal platform-side users through `PlatformAdminUsersController` and the secure invitation outbox pipeline.

## Actor

Platform Admin (Super Admin / authorized Platform Admin)

## Source

Derived from `Slide 8 - Platform User Management Flow` in `SYSTEM_USER_JOURNEY.pptx`, aligned to OneVerz POS Platform User R1 scope, backend implementation, and Angular Platform Admin UI (`feature/platform-user-r1-invite-ui`).

## Trigger

Platform Admin opens **Platform Users** (`/admin/platform-users`).

## Preconditions

- Platform Admin is authenticated with a valid platform JWT (`PlatformOnly` policy).
- Route guard requires `platform.users.view`.
- Create, status update, and role assignment actions require their respective granular permissions (`platform.users.create`, `platform.users.update`, `platform.users.roles.assign`).

## Canonical R1 Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open platform users | Angular loads `GET /api/v1/platform-admin/users` and `GET /api/v1/platform-admin/roles` in parallel. |
| 2 | View existing users | Table shows email, display name, status, role names, permission count, last login, created date. Client-side search filters by email, role, or status. |
| 3 | Click Add Platform User | Inline R1 Create Form expands in header area when caller has `platform.users.create`. |
| 4 | Enter user details | Platform Admin enters **Full Name** (required), **Email Address** (required), optional **Phone Number**, and selects one or more **Platform Role(s)** (required). Form excludes Password, Confirm Password, and Status fields. |
| 5 | Click Save & Send Invite | Angular posts `POST /api/v1/platform-admin/users` with `{ fullName, email, phone, roleIds }`. |
| 6 | Atomic DB persistence | Backend creates `platform_users` (`status = INVITED`, `password_hash = NULL`), inserts `platform_user_roles`, generates in-memory invitation token, inserts `platform_user_invitations` (`status = PENDING`, `token_hash`), encrypts token via AES-GCM, inserts `integration_outbox_messages` (`event = platform.user_invited`, `status = PENDING`), and commits transaction. |
| 7 | Immediate HTTP response | Backend returns HTTP 200 with created `PlatformUserDetailResponse`. UI displays toast: `"Platform user <name> created. Invitation queued."` and cancels inline form. |
| 8 | Asynchronous Outbox Worker | `TenantOnboardingOutboxWorker` polls `integration_outbox_messages` for `platform.user_invited`, decrypts protected token in memory using `AesGcmInvitationDeliverySecretProtector`, composes HTML invitation email using `PlatformUserInvitationEmailComposer`, and calls `IApplicationEmailSender.SendAsync`. |
| 9 | ACS Transport Processing | `AzureCommunicationEmailSender` sends email via Azure Communication Services. Sender awaits `operation.WaitForCompletionAsync()` until ACS send operation reaches terminal status `Succeeded` (indicating successful message submission through the ACS email transport). |
| 10 | Invitation State Update | Upon ACS final send operation = `Succeeded`, outbox message updates to `DELIVERED` (transport message processing completed), invitation updates to `SENT` (`sent_at` timestamp recorded), and audit log `platform_user.invitation_sent` is created. |
| 11 | Recipient receives email | Recipient mailbox receipt was independently verified during R1 runtime acceptance using an accessible DEV/test mailbox, receiving `"Set up your OneVerz Platform Admin account"` containing secure link `/setup-account?token=<rawToken>`. (R1 Ends Here). |

## R1 Form vs Edit Drawer Scope

- **Add Platform User CTA**: Activates inline R1 form (Full Name, Email, Phone, RoleIds, Save & Send Invite). Does NOT open legacy create drawer.
- **Legacy Create Drawer**: Removed for Create; slide-over drawer remains for Edit-only actions (Status update via `PUT /api/v1/platform-admin/users/{userId}` and Role reassignment via `PUT /api/v1/platform-admin/users/{userId}/roles`).
- **Send Password Reset**: Initiated from user row/detail via `POST /api/v1/platform-admin/users/{userId}/password-reset` using the same shared `AzureCommunicationEmailSender`.

## Permissions

| Action | Permission code |
|---|---|
| View list / open page | `platform.users.view` |
| Create user & queue invite | `platform.users.create` |
| Update status | `platform.users.update` |
| Initiate password reset | `platform.users.update` |
| Replace assigned roles | `platform.users.roles.assign` |

Role options for create/edit come from `GET /api/v1/platform-admin/roles` (`platform.roles.view`). The UI does not hardcode static role lists.

## Data Used Or Captured (R1 Create Contract)

| Field | Create DTO | Edit Status | Edit Roles | Notes |
|---|---|---|---|---|
| `fullName` | Required | — | — | Saved as `display_name` |
| `email` | Required | Read-only | — | Server-side normalized & uniqueness enforced |
| `phone` | Optional | — | — | Saved as `phone` |
| `roleIds` | Required (≥ 1) | — | Required (≥ 1) | Array of UUIDs from roles API |
| `password` | **Prohibited** | — | — | Initial password is set by user during setup phase (Next Phase) |
| `status` | **Prohibited** | Required | — | Default initial status is always `INVITED` |

## Cryptographic & Security Rules

1. **Token In-Memory Only**: Raw invitation token is generated only in memory, never written to disk/DB as plaintext.
2. **Deterministic Hash**: `token_hash` (SHA-256) is stored in `platform_user_invitations`.
3. **AES-GCM Protection**: Token is encrypted using `AesGcmInvitationDeliverySecretProtector` before inserting into `integration_outbox_messages` (`protectedToken`, `keyVersion`).
4. **Order of Arguments**: `Unprotect` uses `nonce`, `ciphertext`, `tag`, `plaintext`, `associatedData` in exact order.
5. **No Exposure**: Raw tokens, connection strings, and secrets are NEVER logged, audited, returned via API, or written to documentation/Second Brain.

## Async Outbox & ACS Send Semantics

- **Transaction Isolation**: ACS network calls occur strictly AFTER database transaction commit.
- **Shared Infrastructure**: Both Platform User Invitations and Admin Password Resets use the same singleton `IApplicationEmailSender` (`AzureCommunicationEmailSender`).
- **ACS Operation Wait**: ACS `WaitUntil.Started` is NOT treated as success. The gateway invokes `WaitForCompletionAsync()` and validates ACS final send operation = `Succeeded` (message successfully submitted to transport).
- **Outbox Status**: `integration_outbox_messages = DELIVERED` represents successful transport workflow processing of the integration message.
- **Invitation Status**: `platform_user_invitations.status` transitions from `PENDING` to `SENT` (meaning successfully submitted through ACS transport) ONLY after ACS send operation = `Succeeded`. Failed or canceled ACS operations keep the invitation `PENDING` for retry and preserve user status `INVITED`.

## R1 Boundary (Scope Termination)

> [!IMPORTANT]
> **R1 ENDS AT INVITATION EMAIL DELIVERY.**
> The following capabilities are explicitly OUT OF R1 (Next Phase):
> - Recipient clicking `/setup-account?token=` link
> - Setup Account Angular page & token validation API — TBD (Next Phase API Contract)
> - Setting first password API — TBD (Next Phase API Contract)
> - Status transition from `INVITED` to `ACTIVE` — Next Phase
> - Invited user sign-in & session establishment — Next Phase

## Validation & Error Cases

- Duplicate platform user email → HTTP 409 `platform_users.conflict`
- Missing required fields (fullName, email, roleIds) → HTTP 400 `platform_users.validation_failed`
- At least one role not found → HTTP 400 `platform_users.validation_failed`
- Permission denied → HTTP 403 `platform_users.access_denied`
- Protected role / super-admin lockout → HTTP 403/409 with documented error codes

## Angular Implementation Summary

| Artifact | Path / Component |
|---|---|
| Route | `/admin/platform-users` — `app.routes.ts`, `requiredPermission: platform.users.view` |
| Page | `platform-users-page.ts` — inline R1 create form, list, status edit, role edit |
| API Service | `platform-user-api.service.ts` — `createUser({ fullName, email, phone, roleIds })` |
| Models | `platform-user.model.ts`, `platform-user.mapper.ts` |

## Related Modules

- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
- [[06_DATABASE_KNOWLEDGE/Tables/01_Platform_Administration_UPDATED]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
