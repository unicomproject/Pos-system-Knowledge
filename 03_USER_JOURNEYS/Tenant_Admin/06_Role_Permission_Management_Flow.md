<!-- title: Tenant Admin Role Permission Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Role Permission Management Flow

## Purpose

Defines how Tenant Admin creates roles and assigns feature/outlet permissions.

## Actor

Tenant Admin

## Source

Derived from `Slide 6 - Role & Permission Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens role and permissions management.

## Preconditions

- Tenant Admin has role/permission permission.
- Tenant entitlements are loaded.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open roles and permissions | System opens role management. |
| 2 | View role list | System displays roles. |
| 3 | Click add role | Tenant Admin starts role creation. |
| 4 | Enter role name | Tenant Admin names the role. |
| 5 | Select modules | Tenant Admin selects enabled modules for role. |
| 6 | Assign feature permissions | Tenant Admin assigns permitted actions. |
| 7 | Set outlet scope if needed | Tenant Admin restricts access to outlets/locations. |
| 8 | Validate permissions | System checks entitlements and required constraints. |
| 9 | Save role | System saves role. |
| 10 | Role ready for user assignment | Role can be assigned to tenant users. |

## Data Used Or Captured

- Role name
- Modules
- Permission codes
- Outlet scope
- Role status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Permissions must be feature-based, not hardcoded by role name.
- Role cannot grant features tenant is not entitled to use.

## Validation And Error Cases

- Permission selection invalid
- Entitlement missing
- Duplicate role name
- Cannot remove required admin access

## Outcome

Role is ready for tenant user assignment.

## Related Modules

- 05_Tenant_User_Permission_Access
- 03_Subscription_Catalog_Entitlements

## Related Files

- 02_ACCESS_CONTROL/Permission_Code_List.md
- 02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md
