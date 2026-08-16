<!-- title: Tenant Admin Test Cases -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->
<!-- last_verified: 2026-06-18 -->

# Tenant Admin — Test Cases

> Full inventory of Tenant Admin automated tests (Backend + Flutter).
> Last verified: **2026-06-18** — all listed tests passing.

## Summary

| Platform | Project / Folder | Tests | Status |
|---|---|---:|---|
| Backend | `SCS.UnitTests` — TenantAdmin | 35 | Passed |
| Backend | `SCS.ApiTests` — TenantAdmin | 13 | Passed |
| Flutter | `test/features/tenant_admin/` | 30 | Passed |
| **Total** | | **78** | **Passed** |

## Run Commands

```powershell
# Backend — all Tenant Admin unit tests
Set-Location "c:\Users\User\Desktop\pos final wep\Back end\Nytroz-POS-Backend"
dotnet test tests/SCS.UnitTests/SCS.UnitTests.csproj --filter "FullyQualifiedName~TenantAdmin"

# Backend — all Tenant Admin API tests
dotnet test tests/SCS.ApiTests/SCS.ApiTests.csproj --filter "FullyQualifiedName~TenantAdmin"

# Flutter — Tenant Admin feature tests
Set-Location "c:\Users\User\Desktop\pos final wep\Tenantadmin\Nytroz-POS-App"
flutter test test/features/tenant_admin/
```

---

## Backend — Unit Tests (35)

### TenantAdminOutletServiceTests.cs (12)

| Test Case | Verifies |
|---|---|
| `GetSummaryAsync_WithoutSummaryPermission_ReturnsForbidden` | Summary blocked without `outlet.summary.view` |
| `GetOutletsAsync_WithoutOutletView_ReturnsForbidden` | List blocked without `outlet.view` |
| `CreateOutletAsync_WithoutCreatePermission_ReturnsForbidden` | Create blocked without `outlet.create` |
| `CreateOutletAsync_WithoutFeatureEntitlement_ReturnsForbidden` | Create blocked without `outlet_management` feature |
| `CreateOutletAsync_WithDuplicateCode_ReturnsConflict` | Duplicate outlet code → 409 |
| `CreateOutletAsync_WithInvalidEmail_ReturnsValidationFailure` | Invalid email validation |
| `CreateOutletAsync_WithPermissionAndFeature_ReturnsSuccess` | Happy path create + audit |
| `UpdateOutletAsync_WithoutUpdatePermission_ReturnsForbidden` | Update permission gate |
| `UpdateOutletStatusAsync_WithoutStatusUpdatePermission_ReturnsForbidden` | Status update permission gate |
| `DeleteOutletAsync_WithoutDeletePermission_ReturnsForbidden` | Delete permission gate |
| `GetOutletAsync_ForDifferentTenantOutlet_ReturnsNotFound` | Cross-tenant isolation |
| `GetOutletsAsync_HidesSalesWhenPermissionMissing` | Field-level permission filtering |

### TenantAdminOutletPermissionFilterTests.cs (6)

| Test Case | Verifies |
|---|---|
| `FilterSummary_WithoutSummaryPermission_ReturnsEmptyResponse` | Summary fields hidden |
| `FilterSummary_WithSummaryPermission_ReturnsCounts` | Summary counts visible |
| `FilterPagedList_HidesTodaySalesWithoutSalesPermission` | Sales column hidden |
| `FilterPagedList_ShowsSensitiveFieldsWithMatchingPermissions` | Sensitive fields with permission |
| `FilterPagedList_HidesTillCountsWithoutTillPermission` | Till counts hidden |
| `FilterPagedList_HidesStaffCountsWithoutUserPermission` | Staff counts hidden |

### TenantAdminContextServiceTests.cs (4)

| Test Case | Verifies |
|---|---|
| `GetContextAsync_WithTenantContextPermission_ReturnsContext` | Context happy path |
| `GetContextAsync_WithoutAuthentication_ReturnsUnauthorized` | Auth required |
| `GetContextAsync_WithoutTenantContextPermission_ReturnsForbidden` | Permission gate |
| `GetContextAsync_WithInactiveTenantUser_ReturnsForbidden` | Inactive user blocked |

### DashboardSummaryServiceTests.cs (6)

| Test Case | Verifies |
|---|---|
| `GetSummaryAsync_WithoutDashboardPermission_ReturnsAccessDenied` | Dashboard permission gate |
| `FilterSummary_ReturnsTodaySalesOnlyWhenSalesSummaryPermissionExists` | Sales KPI visibility |
| `FilterSummary_DoesNotExposeBillingWithoutBillingPermission` | Billing hidden |
| `FilterSummary_DoesNotExposeStockAlertsWithoutInventoryPermission` | Stock alerts hidden |
| `FilterSummary_AcceptsLegacyDashboardViewPermission` | Legacy permission alias |
| `FilterSummary_ReturnsNeedsAttentionItemsBasedOnItemPermissions` | Needs-attention filtering |

### TenantAdminPermissionSeedTests.cs (7)

| Test Case | Verifies |
|---|---|
| `DevelopmentDashboardPermissions_DoNotContainDuplicates` | Seed SQL no dupes |
| `OutletPermissionsSeed_DoNotContainDuplicates` | Outlet seed no dupes |
| `OutletPermissionsSeed_SqlIsIdempotent` | Idempotent seed |
| `DevelopmentDashboardPermissions_IncludeOutletPermissions` | Outlet perms in seed |
| `CanonicalPermissions_AreIncludedInDevelopmentDashboardPermissions` | Canonical codes present |
| `DevelopmentDashboardPermissions_IncludeRequiredSidebarPermissions` | Sidebar perms present |
| `PermissionAliases_MatchLegacyDashboardViewCode` | Alias compatibility |

---

## Backend — API Tests (13)

### TenantAdminOutletsControllerTests.cs (5)

| Test Case | Verifies |
|---|---|
| `TenantAdminOutletsController_UsesExpectedRoute` | Route = `api/v1/tenant-admin/outlets` |
| `GetSummary_WithoutPermission_ReturnsForbidden` | GET summary → 403 |
| `GetOutlets_WithoutPermission_ReturnsForbidden` | GET list → 403 |
| `CreateOutlet_WithoutAuthentication_ReturnsUnauthorized` | POST create → 401 |
| `CreateOutlet_WithSuccess_ReturnsCreated` | POST create → 201 |

### TenantAdminContextControllerTests.cs (4)

| Test Case | Verifies |
|---|---|
| `GetContext_WithGrantedPermission_ReturnsOk` | GET context → 200 |
| `GetContext_WithoutAuthentication_ReturnsUnauthorized` | No JWT → 401 |
| `GetContext_WithoutTenantContextPermission_ReturnsForbidden` | No permission → 403 |

### TenantAdminDashboardSummaryControllerTests.cs (4)

| Test Case | Verifies |
|---|---|
| `GetSummary_WithGrantedPermission_ReturnsOk` | GET dashboard → 200 |
| `GetSummary_WithoutDashboardPermission_ReturnsForbidden` | No permission → 403 |
| `GetSummary_WithoutAuthentication_ReturnsUnauthorized` | No JWT → 401 |

---

## Flutter — Feature Tests (30)

### outlet_dto_test.dart (2)

| Test Case | Verifies |
|---|---|
| `parses paged API payload` | `OutletListResultDto` JSON parsing |
| `maps form fields to backend JSON keys` | `CreateOutletRequestDto` mapping |

### tenant_dashboard_summary_dto_test.dart (2)

| Test Case | Verifies |
|---|---|
| `parses wrapped ApiResponse payload` | Dashboard DTO envelope |
| `maps summary metrics for dashboard cards` | KPI field mapping |

### outlet_api_errors_test.dart (3)

| Test Case | Verifies |
|---|---|
| `maps backend field names to form field keys` | Validation error mapping |
| `returns first field error for submit message` | Submit error message |
| `returns earliest wizard step for field errors` | Wizard step navigation |

### outlet_list_filters_test.dart (4)

| Test Case | Verifies |
|---|---|
| `filters active outlets` | Active filter logic |
| `filters inactive outlets` | Inactive filter logic |
| `defaults empty status to active label` | Default status label |
| `maps status filter to API values` | API query param mapping |

### outlet_list_visibility_test.dart (11)

| Test Case | Verifies |
|---|---|
| `blocks outlet page when outlet.view is missing` | Page access gate |
| `renders list when outlet.view exists` | List renders |
| `shows Add outlet button only with outlet.create` | Create button gate |
| `shows summary cards only with outlet.summary.view` | Summary cards gate |
| `shows city column only with outlet.location.view` | City column visible |
| `hides city column without outlet.location.view` | City column hidden |
| `shows row actions only with matching action permissions` | Row actions gate |
| `hides actions column when no row action permission exists` | Actions column hidden |
| `mobile card hides restricted fields` | Mobile field filtering |
| `does not crash when permission list is empty` | Empty permission safety |

### outlet_list_screen_test.dart (7 widget tests)

| Test Case | Verifies |
|---|---|
| `shows unauthorized state when outlet.view is missing` | Unauthorized UI |
| `renders outlet list when outlet.view exists` | List screen render |
| `shows Add outlet button only with outlet.create` | Create button widget |
| `shows summary cards only with outlet.summary.view` | Summary cards widget |
| `hides City column without location permission` | Column visibility |
| `does not crash when user has only outlet.view` | Minimal permission stability |
| `filters bottom nav items by permission` | Bottom nav filtering |

### outlet_details_screen_test.dart (2 widget tests)

| Test Case | Verifies |
|---|---|
| `renders outlet panel sections for full permissions` | Details screen sections |
| `hides sales tab without sales permission` | Sales tab gate |

---

## Missing Coverage (Known Gaps)

| Area | Gap |
|---|---|
| Flutter | Add/Edit outlet form widget tests |
| Flutter | Router / route guard integration tests |
| Flutter | Dashboard screen widget tests |
| Flutter | `TenantAdminAccessService` unit tests (file not present in repo) |
| Backend | Outlet update/delete API controller tests |
| Backend | Integration tests against real PostgreSQL |

## Related Files

- [[Tenant_Admin_Full_Codebase_Report]]
- [[../../Backend/Tenant/Outlet_Create_Implementation_Status]]
- [[../Full_Feature_Status_Index]]
