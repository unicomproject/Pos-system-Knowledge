<!-- title: Platform Admin Login Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Platform Admin Login Flow

## Purpose

Defines secure Platform Admin login before accessing platform-level administration features.

## Actor

Platform Admin

## Source

Derived from `Slide 2 - Super Admin Login Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens the platform login page.

## Preconditions

- Platform admin account exists.
- Account is active and not locked.
- Platform login endpoint is available.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open platform URL | System shows platform login page. |
| 2 | Enter email or username | System accepts registered platform admin identifier. |
| 3 | Enter password | System accepts password securely. |
| 4 | Click login | System submits credentials for validation. |
| 5 | Validate credentials | System verifies username/email and password. |
| 6 | Check user status and role | System confirms account is active and has Platform Admin access. |
| 7 | Load permissions and access rights | System loads platform role, permissions, and allowed platform actions. |
| 8 | Open dashboard | System redirects to Platform Dashboard. |

## Data Used Or Captured

- Email or username
- Password
- Platform admin user status
- Platform role
- Platform permission context
- Login audit event

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Do not expose password, raw token, token hash, or lockout internals.
- Failed login must not reveal whether email or password was wrong.

## Validation And Error Cases

- Invalid password
- Inactive user
- Account locked
- No platform admin permission
- 403 forbidden

## Outcome

Platform Admin securely reaches the platform dashboard.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- 05_BACKEND_ARCHITECTURE/Authentication.md
- 05_BACKEND_ARCHITECTURE/Authorization_And_Permissions.md
- 02_ACCESS_CONTROL/Platform_Admin_Role_Management.md
