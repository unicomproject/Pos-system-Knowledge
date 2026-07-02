<!-- title: Platform User Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Platform User Management Flow

## Purpose

Defines how Platform Admin creates and controls internal platform-side users.

## Actor

Platform Admin

## Source

Derived from `Slide 8 - Platform User Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens platform user management.

## Preconditions

- Platform Admin has internal platform user management permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open platform users | System opens internal platform user management. |
| 2 | View existing users | System lists current platform-side users. |
| 3 | Click add platform user | System starts new internal user record. |
| 4 | Enter user details | Platform Admin enters name, email, phone, and job details. |
| 5 | Assign platform role | Platform Admin selects Super Admin, Support Admin, Finance Admin, or Implementation Admin. |
| 6 | Configure permissions | Platform Admin selects allowed actions. |
| 7 | Send invite | System sends internal invitation email. |
| 8 | Set user status | System marks user active or pending invite. |

## Data Used Or Captured

- Name
- Email
- Phone
- Platform role
- Permission scope
- Status

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Platform users are internal staff and different from tenant users.
- Platform role permissions must be explicit and auditable.

## Validation And Error Cases

- Duplicate platform user email
- Invalid platform role
- Permission denied
- Invite delivery failure

## Outcome

Internal platform users are ready for role-based access to platform functions.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- 02_ACCESS_CONTROL/Platform_Admin_Role_Management.md
