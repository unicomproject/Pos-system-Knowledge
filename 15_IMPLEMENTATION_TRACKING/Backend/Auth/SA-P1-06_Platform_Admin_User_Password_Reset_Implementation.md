<!-- title: SA-P1-06 Platform Admin User Password Reset Implementation -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: PlatformAdministration / Auth -->
<!-- feature: Platform Admin User Password Reset -->
<!-- last_updated: 2026-07-24 -->

# SA-P1-06 — Platform Admin User Password Reset Implementation

## Implementation Status

| Item | Value |
|---|---|
| Ticket | SA-P1-06 |
| Feature | Platform Admin user password reset (admin-initiated) |
| Module | PlatformAdministration / Auth |
| Platform | Backend + Angular Platform Admin |
| Status | **COMPLETE** |
| ACS Email delivery | **COMPLETE** |
| Real Azure E2E verification | **PASSED** |
| Completed Date | 2026-07-20 (core flow); 2026-07-24 (ACS email) |
| Tests | Passed |
| User journey | [[03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]] |

## Decision Record

| Phase | Outcome |
|---|---|
| Pre-implementation | **NO_APPROVED_FLOW** — no signed-off user journey or API contract existed in Second Brain |
| Release 1 design | Secure admin-initiated flow: one-time hashed token, public validate/complete endpoints, session revocation, audit events |
| ACS Email (2026-07-24) | **COMPLETE** — `AcsPlatformPasswordResetDeliveryService` sends ACS email; `deliveryMode: email`, `resetUrl: null`. Dev may fall back to `admin_secure_link` when ACS unset |

## Feature Summary

Authorized Platform Admins with `platform.users.update` initiate password reset for eligible platform users. The backend creates a one-hour one-time token (hash-only storage), delivers the reset link via ACS Email, and the target user completes reset on `/reset-password?token=`. Successful completion updates the password hash, consumes the token, revokes pending tokens, revokes all sessions/refresh tokens, and writes platform login audit entries.

Not in scope: self-service forgot password, tenant/customer reset, plaintext passwords, production outbox/retry, custom email domain.

## API Contract

| Operation | Method | Route | Auth | Permission | Request | Response |
|---|---|---|---|---|---|---|
| Initiate | POST | `/api/v1/platform-admin/users/{userId}/password-reset` | Platform JWT | `platform.users.update` | none | `InitiatePlatformPasswordResetResponse` — email mode: `deliveryMode=email`, `resetUrl=null` |
| Validate | POST | `/api/v1/platform-auth/password-reset/validate` **and** legacy `/api/v1/auth/platform-password-reset/validate` | Anonymous + rate limit | — | `{ token }` | `{ isValid, status, expiresAt }` |
| Complete | POST | `/api/v1/platform-auth/password-reset/complete` **and** legacy `/api/v1/auth/platform-password-reset/complete` | Anonymous + rate limit | — | `{ token, newPassword, confirmPassword }` | `{ success, message }` |

### Initiate response shape (email mode)

```json
{
  "success": true,
  "data": {
    "userId": "guid",
    "email": "staff@example.local",
    "expiresAt": "2026-07-24T13:00:00Z",
    "deliveryMode": "email",
    "resetUrl": null,
    "message": "A password reset email has been sent to the user."
  }
}
```

Email provider failures map to HTTP 502.

## Token And Session Rules

| Rule | Implementation |
|---|---|
| Storage | Raw token never persisted; HMAC hash via existing `ITokenHashService` + platform JWT signing key |
| Lifetime | 1 hour (`PlatformPasswordResetConstants.DefaultLifetimeHours`) |
| Status lifecycle | `PENDING` → `USED` / `EXPIRED` / `REVOKED` |
| Re-initiate | Prior pending tokens revoked before new token issued |
| Eligibility | `ACTIVE` or `LOCKED` with real password hash; not invite-pending, inactive, or deleted |
| Session revocation | `RevokeAllSessionsForUserAsync` with `revokeReason: PASSWORD_RESET` |
| Locked recovery | Successful reset sets status back to `ACTIVE` |

## Audit Events (`platform_login_audits`)

Written via `authentication_method`:

| Method constant | When |
|---|---|
| `PLATFORM_USER_PASSWORD_RESET_REQUESTED` | Successful admin initiation |
| `PLATFORM_USER_PASSWORD_RESET_COMPLETED` | Successful password set |
| `PLATFORM_USER_PASSWORD_RESET_FAILED` | Permission denied, invalid state, bad token, policy failure, etc. |
| `PLATFORM_USER_SESSIONS_REVOKED` | After successful complete, with session count in failure reason field |

## Email / Delivery

| Mode | Status |
|---|---|
| `email` | **COMPLETE** — ACS Email via `IApplicationEmailSender` / `AzureCommunicationEmailSender`; bare verified MailFrom; `resetUrl` omitted from API |
| `admin_secure_link` | **Dev fallback only** when ACS unset and `AllowAdminSecureLinkFallback: true` |
| Tenant / self-service email | **PENDING / OUT OF CURRENT PHASE** |

## Backend Files (primary)

```text
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformAdminUsersController.cs
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformPasswordResetController.cs
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformPasswordResetLegacyController.cs
src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformPasswordResetService.cs
src/E_POS.Application/Modules/Platform/PlatformAdmin/Email/PlatformPasswordResetEmailComposer.cs
src/E_POS.Application/Common/Email/*
src/E_POS.Infrastructure/Integrations/Email/*
src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Services/PlatformPasswordResetDelivery.cs
src/E_POS.Infrastructure/Modules/Platform/PlatformAdmin/Repositories/PlatformPasswordResetRepository.cs
src/E_POS.Domain/Modules/Platform/PlatformAdmin/Constants/PlatformPasswordResetConstants.cs
src/E_POS.Domain/Modules/Platform/PlatformAdmin/Entities/PlatformPasswordResetToken.cs
```

## Frontend Files (primary)

```text
nytroz-pos-platform-admin/src/app/features/admin/pages/platform-users-page/platform-users-page.ts
nytroz-pos-platform-admin/src/app/features/admin/services/platform-user-api.service.ts
nytroz-pos-platform-admin/src/app/features/auth/pages/reset-password-page/reset-password-page.ts
nytroz-pos-platform-admin/src/app/features/auth/services/auth-api.service.ts
nytroz-pos-platform-admin/src/app/app.routes.ts  (path: reset-password)
```

## Tests

| Layer | File | Coverage |
|---|---|---|
| Unit | ACS sender, options validation, delivery, email-flow unit tests | ACS + delivery modes |
| Unit | `PlatformPasswordPolicyValidatorTests` | Password policy |
| Integration | `PlatformPasswordResetFlowTests.cs` / `PlatformPasswordResetServiceTests.cs` | Initiate → complete → revoke → reuse blocked |
| API | `PlatformPasswordResetControllerTests` / `PlatformPasswordResetApiSurfaceTests` | Controllers; no tenant reset surface |
| Angular | `platform-users-page.spec.ts`, `reset-password-page.spec.ts`, API specs | Initiate UI, public reset page |

## Database Tables

| Table | Usage |
|---|---|
| `platform_password_reset_tokens` | Hash-only pending/used/expired/revoked tokens |
| `platform_users` | Password hash update, status unlock |
| `platform_auth_sessions` | Revoked on complete |
| `platform_refresh_tokens` | Revoked on complete |
| `platform_login_audits` | Reset and session-revocation audit rows |

No new migration was required for ACS email delivery.

## Final Status

**COMPLETE** — admin-initiated reset flow, ACS Email delivery, API, UI, token security, session revocation, automated tests, and real Azure E2E verification are done.

### Manual E2E (PASSED)

- ACS email received
- `deliveryMode=email`
- `resetUrl=null`
- reset link completed successfully
- old password rejected
- new password accepted
- token reuse rejected
- previous refresh session revoked

## Related Second Brain Updates

| File | Update |
|---|---|
| `03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow.md` | ACS email journey |
| `03_USER_JOURNEYS/Platform_Admin/13_Platform_User_Management_Flow.md` | Email delivery step |
| `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md` | Email-mode response shape |
| `01_RELEASE_SCOPE/Included_Features.md` | ACS email included; self-service/tenant still out |
