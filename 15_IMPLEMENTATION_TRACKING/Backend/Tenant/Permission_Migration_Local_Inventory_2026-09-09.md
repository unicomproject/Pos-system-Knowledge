<!-- title: Permission Migration Local Inventory -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Permission Migration Local Inventory

## Scope

This is a September 9 source-control inventory, not migration execution approval.
The following files are untracked in the inspected Unified-Commerce checkout.
Untracked does not mean unapplied, invalid, newly authored or safe to delete.
Their contents, model discovery and database history require individual review.

## Local migration files

- `20260728063715_SyncTillManagementFoundation.cs`
- `20260728103522_AddBrandSortOrder.cs`
- `20260731174850_SeedOneverceTillManagementEntitlement.cs`
- `20260903090000_RepairTenantUserAccessAndOnlineOrderPermissions.cs`
- `20260903100000_CompleteTenantAdminGranularPermissions.cs`
- `20260903153000_CompleteRoleAccessActionPermissions.cs`
- `20260903170000_CompleteUserActionPermissions.cs`
- `20260903173000_BackfillUserCreateAssignmentPermissions.cs`
- `20260903180000_CompleteOutletAndWorkspacePermissions.cs`
- `20260904150000_AlignPermissionDefinitionModulesWithFeatures.cs`

## Location

Unified-Commerce/src/E_POS.Infrastructure/Persistence/Migrations/.
The older foundation, brand-sort and entitlement migrations also have local Designer files.
The permission-repair filenames cover user access, granular permissions and role actions.
Other names cover user actions, assignment backfill and outlet/workspace permissions.
Module alignment is represented by AlignPermissionDefinitionModulesWithFeatures.
These descriptions identify the files; they do not certify their SQL behavior.

## Verification boundary

The earlier local database update completed successfully after authentication recovery.
That result does not demonstrate that every file in this list was discovered or applied.
The earlier EF model gate passed for the separately verified CI commit.
Do not transfer that result to all current untracked migrations.
A new migration must be checked against the target database history before use.
Do not blindly delete, regenerate, rename or run these migrations from this inventory.

## Related regression sources

- tests/E_POS.UnitTests/AccessControl/TenantPermissionPresentationModuleCatalogTests.cs.
- tests/E_POS.IntegrationTests/AccessControl/TenantAdminRoleRepositoryPostgreSqlTests.cs.
- tests/E_POS.IntegrationTests/AccessControl/TenantAdminUserCreateOptionsPostgreSqlTests.cs.
- tests/E_POS.IntegrationTests/OutletTillDevice/TenantAdminTillPostgresIntegrationTests.cs.

Tests exist locally; this documentation update did not execute them.
Their commit status and intended database fixtures need review with the migrations.

## Remaining review

Check EF discovery metadata and migration ordering.
Compare permission seeds with the actual canonical catalog.
Verify tenant isolation and pre-existing assignment preservation.
Back up the target database before an authorized application.
Record concrete run results separately from source inspection.
Review and commit related code/tests as coherent changes.
No production authorization or completion status is implied here.

## Related records

[[15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_User_Role_Local_Access_Changes_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Outlet_Till_Local_Access_Changes_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Backend/Backend_CI_And_Local_Database_Fixes_2026-09-09]]
