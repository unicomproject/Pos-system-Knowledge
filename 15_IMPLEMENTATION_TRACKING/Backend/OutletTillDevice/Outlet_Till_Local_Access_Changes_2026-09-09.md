<!-- title: Outlet Till Local Access Changes -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Outlet Till Local Access Changes

## Evidence boundary

Source inspection: September 9, 2026, Unified-Commerce working tree.
These changes remain local and are not declared completed by this note.
The earlier CI fix shipped missing options contracts, not this entire authorization set.
No new runtime tests were executed during this documentation update.

## Outlet CRUD authorization

OutletService now accepts a required action permission for each operation.
View, create, update and delete are evaluated separately.
Existing manage permission remains an umbrella permission in the inspected code.
Legacy aliases are matched to the corresponding operation.
Update permission alone must not authorize delete.
The local tests cover canonical create/delete permission behavior.
Operational tenant checks remain part of the service access path.

## Outlet secondary actions

Manager assignment uses its dedicated permission or manage authority.
Image changes use dedicated image-update permission or manage authority.
Status changes use dedicated status-update permission or manage authority.
OutletImageService also contains a related local permission change.
These changes should be reviewed with controller policies and permission seeds.
Options endpoint availability alone does not prove all mutation rules correct.

## Till outlet reassignment

TenantAdminTillService checks whether the requested outlet differs from the current outlet.
Changing it requires AssignOutlet or Manage permission.
Existing outlet ownership validation follows this check.
The local integration test file contains allowed and denied reassignment cases.

## User access to outlets and tills

TenantAdminTillRepository no longer treats UserType == admin as blanket outlet access.
It considers AllOutlets scope, the user's outlet and role assignment mappings.
The cashier options query applies the corresponding outlet-scoping rule.
This affects which users can be assigned or selected for an outlet.
Review this together with role/user scope migrations and existing tenant isolation rules.

## Source references

Paths below are relative to Unified-Commerce/src.

- E_POS.Application/Modules/Tenant/OutletTillDevice/Services/OutletService.cs
- E_POS.Application/Modules/Tenant/OutletTillDevice/Services/OutletImageService.cs
- E_POS.Application/Modules/Tenant/OutletTillDevice/Services/TenantAdminOutletService.cs
- E_POS.Application/Modules/Tenant/OutletTillDevice/Services/TenantAdminTillService.cs
- E_POS.Infrastructure/Modules/Tenant/OutletTillDevice/Repositories/TenantAdminTillRepository.cs

## Tests and pending validation

OutletServiceTests includes status/image rejection with update-only authority.
OutletServiceTests includes create/delete canonical permission cases.
TenantAdminOutletServiceOverviewTests contains affected options/action cases.
TenantAdminTillCrudIntegrationTests contains reassignment permission cases.
Untracked TenantAdminTillPostgresIntegrationTests requires separate review.
Run the affected unit/API suites and intended PostgreSQL integration tests.
Then verify relevant Flutter flows with restricted and authorized users.
No successful test count is claimed here for these uncommitted changes.

## Excluded cosmetic change

The inspected Flutter tax_setup_table.dart diff adds only a leading blank line.
It is not a tax feature or business-rule change.

## Related records

[[15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_User_Role_Local_Access_Changes_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Backend/Tenant/Permission_Migration_Local_Inventory_2026-09-09]]
