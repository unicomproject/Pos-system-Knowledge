<!-- title: Outlet Create Implementation Status -->
<!-- status: Completed -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->

# Outlet Create — Backend Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Outlet Create |
| Module | Tenant / Outlet |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-06-18 |
| Tests | Passed (18 unit + 5 API outlet tests) |
| PR / Commit | dashboard_tenant branch |

## API

- `POST /api/v1/tenant-admin/outlets`
- Permission: `outlet.create` (alias `outlets.create`)
- Feature entitlement: `outlet_management`
- Tenant/user resolved from JWT only (never from request body)

## Behaviour

- Validates name, code, optional email
- Duplicate tenant outlet code → `409 Conflict`
- Missing permission → `403 Forbidden`
- Missing feature entitlement → `403 Feature Not Enabled`
- Creates `outlets` row and optional primary `outlet_addresses` row
- Writes `audit_logs` with action `OUTLET_CREATED`

## Key Files

| Layer | Path |
|---|---|
| API | `SCS.Api/Modules/TenantAdmin/TenantAdminOutletsController.cs` |
| Application | `SCS.Application/Modules/TenantAdmin/Services/TenantAdminOutletService.cs` |
| Infrastructure | `SCS.Infrastructure/Modules/TenantAdmin/TenantAdminOutletRepository.cs` |
| Tests | `tests/SCS.UnitTests/Modules/TenantAdmin/TenantAdminOutletServiceTests.cs` |

## Test Cases

Full inventory: [[../../Flutter/Tenant_Admin/Tenant_Admin_Test_Cases]]

### Outlet Create — Unit (5 tests)

| Test Case | Expected |
|---|---|
| `CreateOutletAsync_WithoutCreatePermission_ReturnsForbidden` | 403 without `outlet.create` |
| `CreateOutletAsync_WithoutFeatureEntitlement_ReturnsForbidden` | 403 without `outlet_management` |
| `CreateOutletAsync_WithDuplicateCode_ReturnsConflict` | 409 duplicate code |
| `CreateOutletAsync_WithInvalidEmail_ReturnsValidationFailure` | Validation error |
| `CreateOutletAsync_WithPermissionAndFeature_ReturnsSuccess` | Success + `OUTLET_CREATED` audit |

### Outlet Create — API (2 tests)

| Test Case | Expected |
|---|---|
| `CreateOutlet_WithoutAuthentication_ReturnsUnauthorized` | 401 |
| `CreateOutlet_WithSuccess_ReturnsCreated` | 201 Created |

### Flutter Create Coverage

| File | Test Case |
|---|---|
| `outlet_dto_test.dart` | `maps form fields to backend JSON keys` |
| `outlet_api_errors_test.dart` | validation error mapping (3 tests) |
| `outlet_list_screen_test.dart` | `shows Add outlet button only with outlet.create` |

**Verified:** 2026-06-18

## Related Files

- [[../../03_USER_JOURNEYS/Tenant_Admin/03_Outlet_Management_Flow]]
- [[../../04_MODULE_KNOWLEDGE/Outlet/01_Module_Overview]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/04_Outlet_And_Tenant_Settings]]
- [[../Flutter/Tenant_Admin/Tenant_Admin_Full_Codebase_Report]]
