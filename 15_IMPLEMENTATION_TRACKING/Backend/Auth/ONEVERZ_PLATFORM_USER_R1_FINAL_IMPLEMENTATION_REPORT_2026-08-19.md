<!-- title: OneVerz Platform User R1 Final Implementation Report -->
<!-- status: Complete -->
<!-- system: OneVerz POS Platform Admin -->
<!-- date: 2026-08-19 -->

# ONEVERZ PLATFORM USER R1 — FINAL IMPLEMENTATION REPORT

## 1. Executive Summary

Platform User R1 completes the end-to-end invitation flow for internal Platform Administrator accounts. The feature has been implemented, validated, and merged into backend main, and pushed on the frontend feature branch `feature/platform-user-r1-invite-ui` (commit `365e0a2a92e28263a4835ffcd01c9bdfe5ca5559`).

Both **Platform User Invitation** and **Admin Password Reset** emails have been verified arriving at real mailboxes (`mailnesia.com`) via Azure Communication Services (ACS).

---

## 2. R1 Locked Scope & Journey

```
Super Admin / Authorized Platform Admin
  │
  ├── 1. Click "Add Platform User" CTA (/admin/platform-users)
  ├── 2. Enter Full Name, Email, optional Phone, select Platform Role(s)
  ├── 3. Click "Save & Send Invite"
  │     └─> POST /api/v1/platform-admin/users { fullName, email, phone, roleIds }
  │
  ├── 4. Atomic DB Transaction (Unit of Work)
  │     ├── INSERT platform_users (status = INVITED, password_hash = NULL)
  │     ├── INSERT platform_user_roles
  │     ├── INSERT platform_user_invitations (status = PENDING, token_hash = SHA256(token))
  │     └── INSERT integration_outbox_messages (event = platform.user_invited, status = PENDING, AES-GCM protected token)
  │
  ├── 5. Immediate HTTP 200 Response
  │     └─> Toast: "Platform user <name> created. Invitation queued."
  │
  └── 6. Asynchronous Background Dispatch (TenantOnboardingOutboxWorker)
        ├── Poll outbox for platform.user_invited
        ├── Decrypt protected token in memory using AesGcmInvitationDeliverySecretProtector
        ├── Compose HTML email via PlatformUserInvitationEmailComposer
        ├── Call shared IApplicationEmailSender (AzureCommunicationEmailSender)
        ├── ACS operation executes and awaits WaitForCompletionAsync()
        ├── ACS status == Succeeded
        ├── Update outbox status -> DELIVERED
        ├── Update invitation status -> SENT (sent_at timestamp)
        └── Recipient receives email: "Set up your OneVerz Platform Admin account"
```

---

## 3. Contract Specifications

### Frontend Create Contract (`feature/platform-user-r1-invite-ui`)
- **Fields**: `fullName` (required), `email` (required), `phone` (optional), `roleIds` (required, array of UUIDs).
- **Excluded Fields**: `password`, `confirmPassword`, `status`.
- **UI Behavior**: Inline R1 Create form replaces legacy create drawer. Legacy drawer retained for Edit-only actions (Status update & Role reassignment).

### Backend API Contract (`POST /api/v1/platform-admin/users`)
- **Headers**: Authorization: Bearer `<Platform_JWT>` (requires `platform.users.create`).
- **Initial Status**: Always `INVITED`.
- **Password**: `NULL` (no initial password stored).
- **Response**: `PlatformUserDetailResponse` with `invitePending = true`.

### Database Schema Contract
- `platform_users`: `password_hash` column changed to `NULLABLE`.
- `platform_user_invitations`: New table added in Migration `20260817113600_AddPlatformUserInvitation` storing `token_hash` (SHA-256), `status` (`PENDING`/`SENT`/`ACCEPTED`/`EXPIRED`/`REVOKED`), `expires_at`, `sent_at`.

---

## 4. Security & Cryptographic Guarantees

1. **Raw Token Ephemerality**: Raw invitation tokens exist ONLY in memory during HTTP handling and worker dispatch. Raw tokens are NEVER stored as plaintext on disk or in the DB.
2. **Deterministic Hash**: DB stores `token_hash` = SHA-256(rawToken) for fast indexing during setup link validation.
3. **AES-GCM Protection**: Outbox payload encrypts the token using `AesGcmInvitationDeliverySecretProtector`.
4. **Order of Parameters**: `Unprotect` parameter order fixed: `nonce`, `ciphertext`, `tag`, `plaintext`, `associatedData`.
5. **No Secret Leaks**: Real connection strings, raw tokens, and secrets are NEVER logged, audited, or committed to source/documentation.

---

## 5. Email Infrastructure & ACS Completion Semantics

- **Shared Gateway**: Platform User Invitations and Admin Password Resets share the exact same `IApplicationEmailSender` (`AzureCommunicationEmailSender`).
- **ACS Send Operation Wait**: `EmailClientAcsEmailSendGateway` calls `operation.WaitForCompletionAsync()` to ensure the message is accepted and successfully submitted through the ACS email transport. `WaitUntil.Started` is NOT treated as final send success.
- **ACS Succeeded Definition**: ACS `EmailSendStatus.Succeeded` means the send operation successfully completed and the message was submitted through the ACS transport. It does NOT by itself prove recipient mailbox delivery.
- **Outbox Status Definition**: `integration_outbox_messages = DELIVERED` represents successful processing and submission of the integration outbox message through the configured transport workflow.
- **Invitation Status Transition**: `platform_user_invitations.status` updates from `PENDING` to `SENT` (meaning successfully submitted through ACS transport) ONLY when the ACS send operation returns `Succeeded`.

---

## 6. Runtime Verification Evidence

Recipient mailbox delivery was independently verified during R1 runtime acceptance using an accessible DEV/test mailbox.

| Flow | Recipient Mailbox | Subject | Outbox Status | Invitation Status | Mailbox Delivery Verified |
|------|-------------------|---------|---------------|-------------------|---------------------------|
| Admin Password Reset | `mathur1test@mailnesia.com` | **Reset your OneVerz password** | N/A (direct) | — | ✅ Yes |
| Platform User Invite | `mathur1test@mailnesia.com` | **Set up your OneVerz Platform Admin account** | `DELIVERED` | `SENT` | ✅ Yes |
| Platform User Invite | `r1compare_*@mailnesia.com` | **Set up your OneVerz Platform Admin account** | `DELIVERED` | `SENT` | ✅ Yes |

---

## 7. R1 Scope Boundary

> [!IMPORTANT]
> **R1 ENDS AT INVITATION EMAIL DELIVERY.**
> The following capabilities are explicitly OUT OF R1 (Next Phase):
> - Recipient clicking `/setup-account?token=` link
> - Setup Account Angular page & token validation API — TBD (Next Phase API Contract)
> - Setting first password API — TBD (Next Phase API Contract)
> - Status transition from `INVITED` to `ACTIVE` — Next Phase
> - Invited user sign-in & session establishment — Next Phase
