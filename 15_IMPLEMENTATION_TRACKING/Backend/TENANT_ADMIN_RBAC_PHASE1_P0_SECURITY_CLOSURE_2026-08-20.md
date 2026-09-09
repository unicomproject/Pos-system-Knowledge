# Tenant Admin RBAC Phase 1 P0 Security Closure — 2026-08-20

## A. Original 3 P0 gaps

Source: `TENANT_ADMIN_CASHIER_ROLE_ACCESS_FE_BE_GAP_AUDIT_2026-08-20.md`

1. **Single canonical effective permission resolver used everywhere** — `PARTIAL`
2. **Revoked grants excluded on all context paths** — `MISSING`
3. **Tenant isolation consistently enforced on all resolution paths** — `PARTIAL`

Audit evidence:

- `TENANT_ADMIN_CASHIER_ROLE_ACCESS_FE_BE_GAP_AUDIT_2026-08-20.md:444`
- `TENANT_ADMIN_CASHIER_ROLE_ACCESS_FE_BE_GAP_AUDIT_2026-08-20.md:445`
- `TENANT_ADMIN_CASHIER_ROLE_ACCESS_FE_BE_GAP_AUDIT_2026-08-20.md:446`

## B. Root cause

### P0-1 — Canonical resolver reuse was incomplete

`TenantAdminContextRepository` and `TenantAuthRepository` each contained their own ad-hoc permission aggregation logic instead of sharing one canonical query path.

### P0-2 — Revoked-grant filtering was incomplete

The duplicated aggregation logic did not consistently enforce active-state filtering across:

- `tenant_user_roles.revoked_at`
- `tenant_user_permissions.revoked_at`
- `tenant_role_permissions.revoked_at`
- `outlet_user_roles.revoked_at`
- `outlet_user_permissions.revoked_at`

### P0-3 — Tenant isolation evidence was not strong enough

Several joins relied on related entity IDs without consistently enforcing assignment-row `tenant_id == current tenant`, which left context resolution short of a clean tenant-isolation proof.

## C. Files changed

### Added

1. `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Queries/TenantEffectivePermissionCodesQuery.cs`
   - **Reason:** introduce one shared canonical effective-permission query path
   - **Change:** centralizes effective permission code aggregation for tenant-admin/auth resolution with active-state + tenant filters

2. `Unified-Commerce/tests/E_POS.IntegrationTests/TenantAuth/TenantAuthRepositoryPermissionTests.cs`
   - **Reason:** add focused coverage for canonical auth permission resolution
   - **Change:** verifies revoked grants are excluded and cross-tenant leakage is blocked

### Modified

1. `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Repositories/TenantAdminContextRepository.cs`
   - **Reason:** remove ad-hoc context permission aggregation
   - **Change:** routes context permissions through canonical query helper; adds missing `TenantId` and `RevokedAt == null` filters on role projection

2. `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/TenantAuth/Repositories/TenantAuthRepository.cs`
   - **Reason:** remove second duplicated permission resolver
   - **Change:** routes active permission code resolution through canonical query helper

3. `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/AccessControl/Repositories/TenantAdminRoleRepository.cs`
   - **Reason:** harden last-admin checks to use active permission definitions only
   - **Change:** filters critical administrative permission IDs by `permission.IsActive`

4. `Unified-Commerce/tests/E_POS.IntegrationTests/PlatformAdministration/TenantAdminContextRepositoryTests.cs`
   - **Reason:** add direct context-path security regression coverage
   - **Change:** verifies revoked role/direct/outlet grants are excluded and tenant-mismatched rows do not leak

5. `Unified-Commerce/tests/E_POS.IntegrationTests/AccessControl/TenantAdminRoleRepositoryPostgreSqlTests.cs`
   - **Reason:** verify last-admin logic ignores inactive administrative permission definitions
   - **Change:** adds PostgreSQL integration coverage for active-definition requirement

## D. Permission resolver before / after

### Before

- `tenant-admin/context` used ad-hoc effective permission aggregation in `TenantAdminContextRepository`
- auth permission resolution also used separate aggregation in `TenantAuthRepository`
- revoked rows were not consistently excluded on every path
- tenant isolation was not enforced strongly enough on every assignment row

### After

Both `tenant-admin/context` and tenant auth permission resolution now share:

- `TenantEffectivePermissionCodesQuery.Build(...)`

That canonical query only treats a permission as active when it comes from:

- an active direct tenant-user permission with `revoked_at IS NULL`
- an active tenant role assignment with `revoked_at IS NULL`
- an active tenant role permission mapping with `revoked_at IS NULL`
- an active outlet role assignment with `revoked_at IS NULL`
- an active direct outlet-user permission with `revoked_at IS NULL`
- an active `permission_definitions` row
- a tenant-matching assignment/grant row
- an active role where applicable

## E. Revocation behavior

The effective resolver now excludes revoked paths for:

- `tenant_user_roles`
- `tenant_user_permissions`
- `tenant_role_permissions`
- `outlet_user_roles`
- `outlet_user_permissions`

Behavior verified:

- revoked role permission does **not** contribute access
- revoked role assignment does **not** contribute access
- revoked direct tenant-user permission does **not** contribute access
- revoked outlet-role assignment does **not** contribute outlet-derived access
- revoked outlet direct permission does **not** contribute access
- duplicate active permission codes remain deduplicated by union semantics
- permission still survives when another active valid grant path exists

## F. Tenant isolation

The canonical resolver now enforces tenant safety on assignment/grant rows rather than relying only on related IDs.

Evidence:

- context projection test covering mismatched tenant rows
- auth repository projection test covering mismatched tenant rows

Result:

- tenant-admin context no longer accepts permission contribution from rows whose `TenantId` does not match the authenticated tenant

## G. Delegation ceiling

No new delegation model was introduced.

Phase 1 requirement was to ensure delegation cannot rely on stale/revoked effective permissions.

Evidence:

- the active permission set consumed by shared auth/context resolution is now revocation-safe
- actor effective permission calculation can no longer inherit permissions through revoked rows on the shared resolver path

## H. Last-admin protection

The existing last-admin protection foundation was preserved.

Hardening added:

- critical administrative permission IDs are now resolved only from active permission definitions

This prevents inactive administrative permission definitions from being counted as surviving admin paths.

## I. Tests added / updated

### Added

- `TenantAuthRepositoryPermissionTests.GetActivePermissionCodesAsync_ExcludesRevokedAssignmentsAcrossAllPaths`
- `TenantAuthRepositoryPermissionTests.GetActivePermissionCodesAsync_DoesNotLeakAssignmentsFromMismatchedTenantRows`

### Updated with new coverage

- `TenantAdminContextRepositoryTests.GetContextDataAsync_ExcludesRevokedPermissionsAndRevokedRolesFromAllResolutionPaths`
- `TenantAdminContextRepositoryTests.GetContextDataAsync_DoesNotLeakMismatchedTenantPermissionAssignments`
- `TenantAdminRoleRepositoryPostgreSqlTests.WouldRemoveLastAdminAsync_IgnoresInactiveAdministrativePermissionDefinitions`

## J. Validation

### Audit source

- `TENANT_ADMIN_CASHIER_ROLE_ACCESS_FE_BE_GAP_AUDIT_2026-08-20.md` reviewed

### Git state

Commands run:

```powershell
git -C 'Unified-Commerce' status --short
git -C 'Unified-Commerce' branch --show-current
git -C 'Unified-Commerce' log -5 --oneline
```

Current branch:

- `prmissionscreen`

Recent commits:

- `5a95d03 Merge pull request #96 from unicomproject/permissin`
- `5f92e1a Fix OutletServiceTests constructor error`
- `29d544b Fix syntax error in TenantAdminProductRepository`
- `866c2b8 Fix syntax errors in tenant admin product service and repository`
- `ff4d747 Merge branch 'main' into permissin`

Observed pre-existing unrelated dirty file:

- `Unified-Commerce/src/E_POS.Api/appsettings.json`

### Build

Command:

```powershell
dotnet build 'Unified-Commerce/E_POS.sln' --configuration Release -m:1
```

Result:

- **PASS**

Notes:

- build succeeded
- one pre-existing nullable warning remained in `CurrentStockController.cs`

### Focused tests

Command:

```powershell
dotnet test 'Unified-Commerce/tests/E_POS.IntegrationTests/E_POS.IntegrationTests.csproj' --configuration Release -m:1 --filter "FullyQualifiedName~TenantAdminContextRepositoryTests|FullyQualifiedName~TenantAuthRepositoryPermissionTests|FullyQualifiedName~TenantAdminRoleRepositoryPostgreSqlTests"
```

Result:

- **PASS**
- Passed: `9`
- Failed: `0`
- Skipped: `0`

### Full backend tests

Command:

```powershell
dotnet test 'Unified-Commerce/E_POS.sln' --configuration Release -m:1
```

Result:

- **BLOCKED / FAILING OUTSIDE P0 SCOPE**

Summary:

- `E_POS.UnitTests`: Passed `1135`
- `E_POS.IntegrationTests`: Passed `558`, Failed `9`
- `E_POS.ApiTests`: Passed `474`
- `E_POS.Flow4FixtureCli.Tests`: Passed `17`
- `E_POS.LocalPrintAgent.Tests`: Passed `50`

Observed failures were not caused by the Phase 1 P0 permission resolver changes. They were dominated by broader PostgreSQL suite/environment issues such as:

- `53200: out of shared memory`
- PostgreSQL read timeouts during unrelated cleanup/concurrency tests
- pre-existing clean-migration failure at `20260710143000_SeedDevelopmentVariableProductCatalog`

Relevant note:

- focused P0 security tests on the touched RBAC/context paths passed cleanly

### EF pending model check

Command:

```powershell
dotnet ef migrations has-pending-model-changes --project 'Unified-Commerce/src/E_POS.Infrastructure/E_POS.Infrastructure.csproj' --startup-project 'Unified-Commerce/src/E_POS.Api/E_POS.Api.csproj'
```

Result:

- **No changes have been made to the model since the last migration**

## K. Deferred P1 / P2 gaps

Intentionally untouched in Phase 1:

- Flutter role wizard issues
- setup-options/setup final-save contract closure
- frontend hardcoded role/module presentation behavior
- review-screen display contract gaps
- role-list page-size canonical alignment
- broader P1/P2 audit items outside P0 security closure

No Flutter files were changed.

## Phase 1 verdict

### P0-1

**Fixed** — tenant-admin/auth effective permission resolution now reuses a canonical shared query path.

### P0-2

**Fixed** — revoked role/direct/outlet grant paths are excluded from runtime context/auth effective permissions.

### P0-3

**Fixed** — tenant isolation is now enforced consistently on the affected resolution paths and regression-tested.

## Final status

- `tenant-admin/context` active effective permission projection: **PASS**
- revoked-grant exclusion on affected context/auth paths: **PASS**
- tenant isolation on affected context/auth paths: **PASS**
- delegation ceiling stale-access exposure risk: **PASS for Phase 1 scope**
- last-admin active-definition hardening: **PASS for Phase 1 scope**
- soft-revoke/reactivation architecture: **PASS / preserved**

