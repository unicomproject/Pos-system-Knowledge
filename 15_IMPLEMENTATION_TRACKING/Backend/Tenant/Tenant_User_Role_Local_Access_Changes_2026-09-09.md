<!-- title: Tenant User Role Local Access Changes -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Tenant User Role Local Access Changes

## Evidence boundary

Source inspection: September 9, 2026, Unified-Commerce working tree.
These are local changes relative to the merged CI fix.
This note records implementation intent and observed code, not acceptance.
The full local change set has not been independently certified.
Earlier isolated CI test counts must not be reused as proof for this set.

## User options and mutations

TenantAdminUserService filters role, outlet, till and override options by actor permissions.
Status-only access must not return unrelated assignment/override options.
Role assignment requires the dedicated permission or existing manage authority.
Outlet and till assignments have separate authorization checks.
Supported status and scope choices are filtered for the caller.
User status updates require the dedicated disable/status authority.
Invitation resend and revoke use distinct permissions.
The older general invite permission alone is not treated as sufficient in the new tests.
Tenant-admin role creation behavior includes an admin user type regression case.

## Role management

Status mutation uses the dedicated role status permission.
User membership and outlet scope mutations are evaluated separately.
Read access for editing screens includes relevant action permissions.
Permission-update access alone must not allow unrelated assignment mutations.
Existing role permissions can be retained when absent from the actor token.
New permissions must still satisfy delegation checks.
Canonical permission validation remains in the service.
These authorization changes need review together, not as independent UI flags.

## Permission presentation

TenantPermissionPresentationModuleCatalog is a new untracked local mapper.
It groups permission codes into UI modules such as Dashboard, Outlets, Tills and Users.
TenantAdminRoleRepository uses those presentation groups for the returned catalog.
Commercial subscription modules remain a separate concern.
This mapper is distinct from TenantAdminBootstrapPermissionCatalog.
The bootstrap catalog already has historical Second Brain coverage.

## Source map

Paths below are relative to Unified-Commerce/src.

- E_POS.Application/Modules/Tenant/AccessControl/Services/TenantAdminUserService.cs
- E_POS.Application/Modules/Tenant/AccessControl/Services/TenantAdminRoleService.cs
- E_POS.Application/Modules/Tenant/AccessControl/Mappers/TenantPermissionPresentationModuleCatalog.cs
- E_POS.Infrastructure/Modules/Tenant/AccessControl/Repositories/TenantAdminRoleRepository.cs
- E_POS.Domain/Modules/Tenant/AccessControl/Constants/TenantAdminUserPermissions.cs
- E_POS.Domain/Modules/Tenant/AccessControl/Constants/TenantWorkspacePermissions.cs

## Regression cases observed in local tests

- GetCreateOptions_StatusPermissionOnly_ReturnsNoAssignmentOrOverrideData.
- UpdateAsync_RoleChange_RequiresRoleAssignmentPermission.
- UpdateAsync_OutletChange_RequiresOutletAssignmentPermission.
- UpdateAsync_TillChange_RequiresTillAssignmentPermission.
- SaveSetup_RetainsExistingPermissionMissingFromActorToken.
- SaveSetup_StillRejectsNewPermissionMissingFromActorToken.
- ReplaceAssignments_OutletChangesRequireOutletsAssignPermission.

Test presence is verified; this documentation task did not run them.
Review existing assertions and run affected tests before declaring completion.
Do not grant new permissions or change production state based on this note.

## Related records

[[15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Outlet_Till_Local_Access_Changes_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Backend/Tenant/Permission_Migration_Local_Inventory_2026-09-09]]
