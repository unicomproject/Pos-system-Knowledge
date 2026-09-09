<!-- title: Backend CI And Local Database Fixes -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Backend CI And Local Database Fixes

## Scope

This note records the verified September 8 fixes and September 9 repository state.
The work was tested in an isolated checkout to exclude unrelated local changes.
This is not production database or production email acceptance.

## Reproduced build failures

Three controller dependencies were missing from committed backend contracts:

- ValidateTenantAdminSetupTokenResponse.Code.
- ITenantAdminRoleService.GetAssignmentOptionsAsync.
- ITenantAdminOutletService.GetManagerOptionsAsync.

The fix includes DTOs, service/repository contracts and implementations.
Test fakes were updated to implement the new interfaces.
Role options limit included users/outlets according to assignment permissions.
Manager options require manager-assignment or existing manage permission.
Repository queries are tenant scoped.
Focused authorization cases were added to unit tests.

## Additional blockers discovered by verification

Development configuration contained duplicate AzureBlobStorage sections.
The merged configuration uses one section and external storage credentials.
DecoupleCategoryFromDepartment added the same discount-category foreign key twice.
The duplicate addition was removed while preserving the intended constraint.
The existing migration regression test verifies a single rebuilt foreign key.

## CI workflow

Source: Unified-Commerce/.github/workflows/backend-ci.yml.
The EF CLI install is pinned to 10.0.0, matching the declared EF Design package.
The startup project has an explicit Release build step.
The EF model check uses --configuration Release --no-build.
This exposes compiler errors separately from the model check.
The local installed EF CLI used for verification was 10.0.10.

## Recorded local verification

| Check | Result |
|---|---|
| Release solution build | Pass, zero errors |
| Unit suite | 1,529 passed |
| API suite | 512 passed |
| EF pending model changes | No changes since last migration |

Existing nullable warnings remained; the final rebuilt solution reported 11.
These counts belong to the isolated verified commit, not every current local edit.
GitHub Actions final green status was not independently observed in this session.

## Git delivery

- ad859559: missing contracts, tests, configuration/migration and CI fixes.
- aa0b3db1: remote configuration merge with credentials kept external.
- Push to fix/postgres-category-migration succeeded.
- September 9 local history contains merge commit 3529f4ad for PR #117.
- Unrelated local changes were preserved and not included wholesale.

## Local PostgreSQL authentication recovery

Development credentials failed with SQLSTATE 28P01.
The base local connection authenticated and UnifiedCommerceDb existed.
The verified connection was stored in User Secrets as DefaultConnection.
UserSecretsId: epos-api-development-secrets.
No credential value is recorded here.
A pg_dump backup was taken before the update.
A fresh Debug API build passed with zero warnings/errors.
The Development database update completed with exit code zero and Done.
This changes the local development database only.

## Documentation boundary

TenantAdminBootstrapPermissionCatalog already has earlier Second Brain coverage.
Do not describe that catalog as newly created by this CI repair.
Broader uncommitted Role/User/Outlet changes require separate review and testing.
This note does not mark those changes completed.

## Related evidence

[[15_IMPLEMENTATION_TRACKING/Backend/Auth/Tenant_Admin_Phase_B_Local_Verification_2026-09-09]]
[[15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Phase_B_Android_Handoff_2026-09-09]]
