<!-- title: Platform User Password Reset Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Platform User Password Reset Flow

## Purpose

Defines how an authorized Platform Admin initiates a password reset for an internal platform user, how the one-time reset token is delivered in Release 1, and how the target user sets a new password on the public reset page.

This is **admin-initiated** platform user recovery only. It is not self-service forgot-password, not tenant staff reset, and not customer reset.

## Actor

- **Initiator:** Platform Admin with `platform.users.update`
- **Target:** Internal platform user (`platform_users`) who receives the reset link

## Source

SA-P1-06 secure Release 1 design — no pre-approved journey existed (`NO_APPROVED_FLOW`); implemented contract documented here and in [[15_IMPLEMENTATION_TRACKING/Backend/Auth/SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]].

## Trigger

Platform Admin opens **Platform Users** (`/admin/platform-users`), selects a user in the detail slide-over, and clicks **Send Password Reset**.

## Preconditions

- Initiator is authenticated with a platform JWT.
- Initiator has `platform.users.update`.
- Target user exists, is not deleted/inactive, and is not invite-pending (no password hash yet).
- Target user status is `ACTIVE` or `LOCKED` (locked users may reset and are reactivated on successful completion).

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open platform user detail | Angular loads `GET /api/v1/platform-admin/users/{userId}` in the slide-over editor. |
| 2 | Click Send Password Reset | Confirmation modal; action visible only when caller has `platform.users.update` and user is eligible. |
| 3 | Confirm initiation | Angular posts `POST /api/v1/platform-admin/users/{userId}/password-reset` (no body). Backend revokes any prior pending tokens for that user, creates a new one-time token (hash stored only), TTL 1 hour. |
| 4 | Receive reset link (R1) | Response `InitiatePlatformPasswordResetResponse` includes `deliveryMode: admin_secure_link` and `resetUrl` returned to the authorized admin. Automated email delivery is **not wired** in Release 1; admin copies link to the user through an out-of-band channel. |
| 5 | User opens reset URL | Public route `/reset-password?token=` loads; Angular calls validate endpoint with the token query param. |
| 6 | Validate token | `POST /api/v1/platform-auth/password-reset/validate` (legacy alias: `/api/v1/auth/platform-password-reset/validate`) — anonymous, rate-limited. Returns `{ isValid, status, expiresAt }`. |
| 7 | Set new password | User enters new password and confirmation; Angular posts complete endpoint with `{ token, newPassword, confirmPassword }`. |
| 8 | Complete reset | Backend validates policy, marks token `USED`, revokes remaining pending tokens, updates password hash, unlocks `LOCKED` users to `ACTIVE`, revokes all platform sessions/refresh tokens with reason `PASSWORD_RESET`, writes audit rows. |
| 9 | Sign in | User navigates to `/login` and authenticates with the new password. |

## Permissions

| Action | Permission code |
|---|---|
| Initiate reset for another platform user | `platform.users.update` |
| View user detail (prerequisite UI) | `platform.users.view` |
| Validate / complete reset (public) | None (anonymous + rate limit) |

## Data Used Or Captured

| Field | Notes |
|---|---|
| Target `userId` | Route param on initiate |
| One-time raw token | Generated server-side; only hash persisted via `ITokenHashService` (HMAC with platform JWT signing key) |
| Token status | `PENDING` → `USED` / `EXPIRED` / `REVOKED` |
| `resetUrl` | Built from configured public app base URL + `/reset-password?token=` |
| New password | Never stored or logged in plaintext; bcrypt (or platform hash service) at rest |
| Audit | `platform_login_audits.authentication_method`: `PLATFORM_USER_PASSWORD_RESET_REQUESTED`, `PLATFORM_USER_PASSWORD_RESET_COMPLETED`, `PLATFORM_USER_PASSWORD_RESET_FAILED`, `PLATFORM_USER_SESSIONS_REVOKED` |

## Access And Security Rules

- Initiate requires platform JWT and `platform.users.update`; backend is final authority.
- Public validate/complete endpoints are `[AllowAnonymous]` with auth login rate limiting.
- Raw tokens are never persisted; only HMAC token hashes in `platform_password_reset_tokens`.
- A new initiate revokes prior pending tokens for the same user.
- On successful complete, `RevokeAllSessionsForUserAsync` invalidates existing sessions and refresh tokens.
- Do not expose password, raw token, token hash, or internal lockout details in API responses.
- Platform-level actions must not trust frontend-provided `tenant_id`.

## Validation And Error Cases

- Target not found → HTTP 404 `platform_users.not_found`
- Permission denied on initiate → HTTP 403 `platform_users.access_denied`
- Invite-pending, inactive, or deleted user → HTTP 400 `platform_password_reset.invalid_user_state`
- Invalid / used / revoked / expired token on complete → HTTP 400 with documented error codes
- Password mismatch → HTTP 400 `platform_password_reset.password_mismatch`
- Password policy failure → HTTP 400 validation error
- Rate limit exceeded on public endpoints → HTTP 429

## Angular Implementation

| Artifact | Path |
|---|---|
| Initiate UI | `platform-users-page.ts` — Send Password Reset button, confirm modal, admin secure link display |
| Initiate API | `platform-user-api.service.ts` — `POST .../users/{id}/password-reset` |
| Public reset page | `/reset-password` — `reset-password-page.ts` (guest route, no auth guard) |
| Public reset API | `auth-api.service.ts` — validate/complete via legacy auth group paths |

## Out Of Scope (Release 1)

- Self-service **forgot password** on platform login
- Plaintext password storage or display
- Tenant staff or customer password reset
- Automated transactional email (delivery mode reserved; `admin_secure_link` only in R1)

## Outcome

An authorized Platform Admin can securely reset another platform user's password via a one-time link. The user sets a new password on a public page; prior sessions are invalidated; the user signs in with the new credential.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- [[13_Platform_User_Management_Flow]]
- [[15_IMPLEMENTATION_TRACKING/Backend/Auth/SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[09_ANGULAR_ADMIN_KNOWLEDGE/Routing_And_Guards]]
