<!-- title: Tenant Role And Permission Setup Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Role And Permission Setup Flow

## Purpose

Defines how Platform Admin configures tenant roles, module access, feature permissions, and outlet scope.

## Actor

Platform Admin

## Source

Derived from `Slide 5 - Tenant Role & Permission Setup Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens tenant roles and permissions.

## Preconditions

- Tenant exists.
- Feature entitlement catalog exists.
- Platform Admin has role/permission setup rights.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant roles and permissions | System opens tenant role configuration. |
| 2 | View roles list | System displays existing roles, counts, and quick actions. |
| 3 | Create role or use template | Platform Admin creates a role or chooses a predefined template. |
| 4 | Enter role name | Platform Admin provides clear role name. |
| 5 | Choose enabled modules | Platform Admin selects modules the role can access. |
| 6 | Assign feature permissions | Platform Admin enables specific actions within modules. |
| 7 | Set scope or outlet access if needed | Platform Admin restricts access to outlets, business units, or locations. |
| 8 | Save role | System validates and saves role. |

## Data Used Or Captured

- Role name
- Enabled modules
- Permission codes
- Outlet/location scope
- Role status

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Permissions are feature-based, not fixed only by role name.
- Do not hardcode role checks in backend or frontend.

## Validation And Error Cases

- Duplicate role name
- Permission not available for tenant entitlement
- Invalid outlet scope
- Cannot remove required admin permission from only admin role

## Outcome

Role is ready for tenant user assignment.

## Related Modules

- 05_Tenant_User_Permission_Access
- 03_Subscription_Catalog_Entitlements

## Related Files

- 02_ACCESS_CONTROL/Permission_Code_List.md
- 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md
