<!-- title: Tenant Admin User Management Add New User Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin User Management Add New User Flow

## Purpose

Defines how Tenant Admin creates users and sends invites for account activation.

## Actor

Tenant Admin

## Source

Derived from `Slide 7 - User Management Add New User Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens user management.

## Preconditions

- Tenant Admin has user management permission.
- At least one role exists.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open user management | System opens user list. |
| 2 | Click add user | System opens new user form. |
| 3 | Enter user details | Tenant Admin enters name, email, phone. |
| 4 | Assign user role | Tenant Admin selects role. |
| 5 | Assign outlet or tenant access | Tenant Admin selects outlet or tenant scope as needed. |
| 6 | Set user status | Tenant Admin selects ready/pending invite state. |
| 7 | Validate user details | System validates user record. |
| 8 | Send invite | System sends invite email if valid. |
| 9 | User created | System creates pending/ready user. |
| 10 | User can later login | User follows setup link and login path. |

## Data Used Or Captured

- Name
- Email
- Phone
- Role
- Outlet access
- User status
- Invite email

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Tenant user is tenant-scoped.
- Do not mix tenant user with platform user or customer account.

## Validation And Error Cases

- Validation error
- Email already exists
- Invalid role
- Invalid outlet access
- Email send failure

## Outcome

Tenant user is created and invited according to status.

## Related Modules

- 05_Tenant_User_Permission_Access
- 06_Auth_Tokens_Security_Audit

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/06_Tenant_Users_Roles_Permissions_And_Outlet_Access.md
