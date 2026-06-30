<!-- title: Tenant User Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant User Management Flow

## Purpose

Defines how Platform Admin creates tenant users, assigns roles/outlet access, confirms feature permissions, and sends invites.

## Actor

Platform Admin

## Source

Derived from `Slide 5 - Tenant User Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens tenant user management.

## Preconditions

- Tenant exists.
- Tenant roles exist.
- Platform Admin has tenant user management permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant users | System opens tenant users from settings. |
| 2 | Click add user | System opens add user form. |
| 3 | Enter user details | Platform Admin enters name, email, phone, and user details. |
| 4 | Select role | Platform Admin assigns tenant role. |
| 5 | Assign outlet access | Platform Admin assigns one or more outlets or collection points. |
| 6 | Confirm feature permissions | Platform Admin reviews feature permissions inherited from role/scope. |
| 7 | Review and save | System validates and saves tenant user. |
| 8 | Send invite | System sends invitation email when tenant activation allows it. |
| 9 | Set user status | System marks user ready or pending invite. |

## Data Used Or Captured

- Name
- Email
- Phone
- Role
- Outlet access
- Feature permission context
- Invite status
- User status

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Tenant user is different from platform user.
- Invite email is sent after tenant activation unless setup mode allows earlier invite.

## Validation And Error Cases

- Duplicate email
- Invalid role
- Invalid outlet access
- Tenant not active for invite
- Email delivery failure

## Outcome

Tenant user can access only assigned features and outlets.

## Related Modules

- 05_Tenant_User_Permission_Access
- 06_Auth_Tokens_Security_Audit
- 07_Outlet_Till_POS_Device_Foundation

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/06_Tenant_Users_Roles_Permissions_And_Outlet_Access.md
