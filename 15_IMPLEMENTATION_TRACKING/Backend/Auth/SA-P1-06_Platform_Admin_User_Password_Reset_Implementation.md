<!-- title: SA-P1-06 Platform Admin User Password Reset Implementation -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: PlatformAdministration / Auth -->
<!-- feature: Platform Admin User Password Reset -->
<!-- last_updated: 2026-07-20 -->

# SA-P1-06 — Platform Admin User Password Reset Implementation

## Implementation Status

| Item | Value |
|---|---|
| Ticket | SA-P1-06 |
| Feature | Platform Admin user password reset (admin-initiated) |
| Module | PlatformAdministration / Auth |
| Platform | Backend + Angular Platform Admin |
| Status | **COMPLETE_WITH_MINOR_GAPS** |
| Completed Date | 2026-07-20 |
| Tests | Passed |
| User journey | [[03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]] |

## Decision Record

| Phase | Outcome |
|---|---|
| Pre-implementation | **NO_APPROVED_FLOW** — no signed-off user journey or API contract existed in Second Brain |
| Release 1 design | Secure admin-initiated flow defined and implemented: one-time hashed token, public validate/complete endpoints, session revocation, audit events, `admin_secure_link` delivery to authorized admin |
| Email | **Minor gap** — automated email not wired; `AdminSecureLinkPasswordResetDeliveryService` returns reset URL to initiating admin only |

## Feature Summary

Authorized Platform Admins with `platform.users.update` initiate password reset for eligible platform users. The backend creates a one-hour one-time token (hash-only storage), returns the reset URL to the admin (`admin_secure_link`), and the target user completes reset on `/reset-password?token=`. Successful completion updates the password hash, consumes the token, revokes pending tokens, revokes all sessions/refresh tokens, and writes platform login audit entries.

Not in scope: self-service forgot password, tenant/customer reset, plaintext passwords.

## API Contract

| Operation | Method | Route | Auth | Permission | Request | Response |
|---|---|---|---|---|---|---|
| Initiate | POST | `/api/v1/platform-admin/users/{userId}/password-reset` | Platform JWT | `platform.users.update` | none | `InitiatePlatformPasswordResetResponse` with `resetUrl` (`admin_secure_link`) |
| Validate | POST | `/api/v1/platform-auth/password-reset/validate` **and** legacy `/api/v1/auth/platform-password-reset/validate` | Anonymous + rate limit | — | `{ token }` | `{ isValid, status, expiresAt }` |
| Complete | POST | `/api/v1/platform-auth/password-reset/complete` **and** legacy `/api/v1/auth/platform-password-reset/complete` | Anonymous + rate limit | — | `{ token, newPassword, confirmPassword }` | `{ success, message }` |

### Initiate response shape (legacy envelope)

```json
{
  "success": true,
  "data": {
    "userId": "guid",
    "email": "staff@nytroz.local",
    "expiresAt": "2026-07-20T13:00:00Z",
    "deliveryMode": "admin_secure_link",
    "resetUrl": "https://admin.example/reset-password?token=...",
    "message": "Copy this secure link and share it with the user through your approved channel."
  }
}
```

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

| Mode | Release 1 status |
|---|---|
| `admin_secure_link` | **Implemented** — reset URL returned in initiate response to authorized admin |
| `pending_email` | **Not wired** — reserved constant; no transactional email provider hookup |

## Backend Files (primary)

```text
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformAdminUsersController.cs
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformPasswordResetController.cs
src/E_POS.Api/Controllers/V1/Platform/PlatformAdmin/PlatformPasswordResetLegacyController.cs
src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformPasswordResetService.cs
src/E_POS.Application/Modules/Platform/PlatformAdmin/Validators/PlatformPasswordPolicyValidator.cs
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
| Unit | `tests/E_POS.UnitTests/PlatformAdministration/PlatformPasswordPolicyValidatorTests` | Password policy min/max length |
| Unit / service | `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformPasswordResetServiceTests.cs` | Service edge cases |
| Integration | `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformPasswordResetFlowTests.cs` | Full initiate → complete → session revoke → token reuse blocked → audit assertions |
| API | `tests/E_POS.ApiTests/PlatformAdministration/PlatformPasswordResetControllerTests.cs` | Controller validate/complete/forbidden initiate |
| Angular | `platform-users-page.spec.ts`, `reset-password-page.spec.ts`, `platform-user-api.service.spec.ts`, `auth-api.service.spec.ts` | Initiate UI, public reset page, API wiring |

## Database Tables

| Table | Usage |
|---|---|
| `platform_password_reset_tokens` | Hash-only pending/used/expired/revoked tokens |
| `platform_users` | Password hash update, status unlock |
| `platform_auth_sessions` | Revoked on complete |
| `platform_refresh_tokens` | Revoked on complete |
| `platform_login_audits` | Reset and session-revocation audit rows |

## Final Status

**COMPLETE_WITH_MINOR_GAPS** — core admin-initiated reset flow, API, UI, token security, session revocation, and tests are implemented. **Gap:** automated email delivery not wired; Release 1 relies on admin secure link handoff.

## Score Impact (proposed pending audit pack merge)

The committed Second Brain does not include the full Release 1 weighted scoring denominator (that model lives in the untracked `99_AUDITS` pack). Using the same baseline cited there:

| Metric | Before SA-P1-06 | Proposed after close |
|---|---:|---:|
| Release 1 Super Admin | 83% | **~85%** |
| Full planned Super Admin | 66% | **~68%** |

**Rationale:** SA-P1-06 was an open P1 gap under users/auth (`No platform user password-reset`). Closing it modestly improves the weighted Release 1 and full-planned scores without changing the payment-links or other open gaps. **Exact recalculation pending audit pack merge** into committed tracking docs.

## Related Second Brain Updates (2026-07-20)

| File | Update |
|---|---|
| `03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow.md` | Created |
| `03_USER_JOURNEYS/Platform_Admin/13_Platform_User_Management_Flow.md` | Password reset step + permission |
| `03_USER_JOURNEYS/Platform_Admin/00_Platform_Admin_User_Flow_Analysis.md` | Journey index |
| `04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract.md` | Reset API rows |
| `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md` | Three operations documented |
| `01_RELEASE_SCOPE/Included_Features.md` | R1 admin-initiated platform password reset |
| `09_ANGULAR_ADMIN_KNOWLEDGE/Routing_And_Guards.md` | `/reset-password` public route |

## Related Files

- [[03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]]
- [[03_USER_JOURNEYS/Platform_Admin/13_Platform_User_Management_Flow]]
- [[Platform_Admin_Login_Implementation_Status]]
- [[../Full_Feature_Status_Index]]
