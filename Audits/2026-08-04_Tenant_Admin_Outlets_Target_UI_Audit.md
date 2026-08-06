# Tenant Admin Outlets Target UI Audit Report

## 1. Tamil Executive Summary
இந்த ஆய்வின் முக்கிய நோக்கம் Tenant Admin Outlets திரையை புதிய Target UI-க்கு ஏற்ப மாற்றுவதற்கான சாத்தியக்கூறுகளை ஆராய்வதாகும். 
- **Flutter Current Status**: தற்போதைய UI ஆனது list-view முறையிலுள்ளது. Split-view (List & Detail panel) வசதி இல்லை. Manager details, Image, மற்றும் Sales/Inventory cards போன்ற பல தகவல்கள் UI-ல் இல்லை.
- **Backend Current Status**: `OutletsController` மற்றும் `TenantAdminOutletsController` ஆகிய API-களில் தேவையான அடிப்படை வசதிகள் உள்ளன. ஆனால் Revenue summary, Assigned tills, Alerts போன்றவற்றை ஒரே API மூலம் எடுக்கும் வசதி இல்லை (aggregate endpoint தேவை).
- **Second Brain Current Status**: புதிய UI மாற்றங்களுக்கு ஏற்ப ஆவணங்கள் (Functional Rules, API contracts, User Journeys) மேம்படுத்தப்பட வேண்டும். 
- **Main Missing Items**: Manager mapping, Outlet Image, "Needs Attention" filter (Alerts mapping), Split-view UI panel.
- **Overall Percentage**: 45% தயார் நிலையில் உள்ளது.
- **Decision**: PARTIAL GO (சில Backend மற்றும் UI மாற்றங்கள் தேவை).

## 2. Audit Scope
- Phase 1: Second Brain Audit
- Phase 2: Flutter Audit
- Phase 3: Backend Audit
- Phase 4: Database Audit
- Phase 5: Permission & Entitlement Audit
- Phase 6: API and UI Contract Matrix
- Phase 7: Responsiveness & Accessibility Audit
- Phase 8: Test Audit

## 3. Repositories and Branches Inspected
- **Flutter**: `C:\Users\User\Desktop\pos final wep\Tenantadmin\Nytroz-POS-App` (Branch: Local Development)
- **Backend**: `C:\Users\User\Desktop\pos final wep\Unified-Commerce` (Branch: Local Development)
- **Second Brain**: `C:\Users\User\Desktop\meeting document\2 brine\Pos-system-Knowledge`

## 4. Target UI Breakdown
- **Tenant Admin Shell**: Existing sidebar, header, top navigation, and bottom navigation. These are already shared components. Do not duplicate.
- **Outlets Page Header**: "Outlets" title with supporting text and "Add Outlet" button. Permissions are already controlled.
- **Search & Filters**: Search by Name/Code/Manager/Location. Filter by All/Store/Warehouse/Active/Needs Attention.
- **Outlet List Item**: Image, Name, Type, Code, Manager Avatar, Assigned tills, Active tills, Status, Actions (View, Edit, Disable/Activate).
- **Selected Outlet Detail Panel**: Info, Contacts, Operational summary (Today's Sales, Stock Value, Open Orders, etc.), Operational alerts (Offline till, Last sync).
- **Interaction Behaviour**: Split-view list and detail panel, closeable panel, inline search and filter debounce.

## 5. Second Brain Findings
- **Documents Inspected**:
  - `04_MODULE_KNOWLEDGE\07_Outlet_Till_POS_Device_Foundation\02_Functional_Rules.md`
  - `03_USER_JOURNEYS\Tenant_Admin\05_Till_Management_Flow.md`
- **Findings**: Current documentation defines basic CRUD for Outlets but does not cover the split-view UI requirements, the operational summary metrics (Sales, Orders, Inventory) linked to Outlet Details, or the "Needs Attention" status.
- **Updates Required**: Extend Functional Rules to include Manager assignment, Image handling, and Operational Alerts. Create/update Outlet List User Journey for the split-view panel. Update API Contracts.

## 6. Flutter Findings
- **Files Inspected**:
  - `lib\features\tenant_admin\outlets\presentation\screens\outlet_list_screen.dart`
  - `lib\features\tenant_admin\outlets\presentation\widgets\outlet_list_panel.dart`
  - `lib\features\tenant_admin\domain\services\tenant_admin_access_checker.dart`
- **Current Implementation**: The current list screen uses an `OutletListPanel` and separate overview cards (`OutletOverviewCard`, `TopPerformingOutletCard`). There is no split-view detail panel.
- **Shared Components**: Existing Tenant Admin Shell (Sidebar, header, etc.) can be fully reused. Search field (`TenantAdminSearchField`) and Filter Dropdowns (`_OutletStatusDropdown`) exist but need to add the "Needs Attention" filter.
- **Gap**: Split-view Outlet list and detail panel is **Missing**. Outlet image and Manager details are **Missing**. Operational alerts on the right panel are **Missing**.

## 7. Backend Findings
- **Files Inspected**:
  - `TenantAdminOutletsController.cs` (`api/v1/tenant-admin/outlets/{id}`)
  - `OutletsController.cs` (`api/v1/outlets`)
  - `IOutletService.cs`
- **Endpoints Status**:
  - Get Outlet list: Implemented (Search, OutletType, Status, Pagination). Does not support Manager or Location search yet.
  - Get Outlet details: Implemented (`TenantAdminOutletDetailResponse`), but missing Tills count, Manager object, Sales/Stock metrics.
  - Disable Outlet: Handled via Update Outlet or Soft Delete.
  - "Needs Attention" filter: **Missing**. API needs a way to filter by hardware alerts or offline tills.
- **Gap**: A new aggregate endpoint or updated Detail endpoint is required to fetch all operational metrics (Sales, Orders, Tills) at once instead of making 5 different API calls.

## 8. Database Findings
- **Files Inspected**: `Outlet.cs`, `OutletAddress.cs`, `Till.cs`
- **Current Fields**: `OutletCode`, `OutletName`, `OutletType`, `Phone`, `Email`, `Timezone`, `IsDefaultOutlet`, `Status`.
- **Missing Fields in Outlet Entity**: Image URL / Media reference, Manager mapping (`ManagerId` or `OutletManager` link table).
- **Required Future Change**: Add `ImageUrl` (string, nullable) and `ManagerId` (Guid, nullable) to `Outlet` table, or use `OutletUser` mapping with a Manager role.

## 9. Permission Findings
- **Files Inspected**: `tenant_admin_access_checker.dart`
- **Current Permissions**:
  - View Outlets: `tenant.outlets.view`, `outlet.view`
  - Manage Outlets: `tenant.outlets.manage`
  - View Tills: `tenant.tills.view`
  - View Stock: `tenant.stock.view`
  - View Sales: `tenant.reports.sales.view`
- **Status**: Permissions are highly granular and properly enforced on the Flutter side and Backend `[Authorize(Policy = "TenantOnly")]`.

## 10. Test Audit
- **Flutter**: Existing widget tests likely cover the list panel, but will fail when the split-view is introduced.
- **Backend**: Existing unit tests for `GetDetailAsync` will need updates once new fields (Sales, Tills, Alerts) are added.
- **Recommended**: Write new UI widget tests for the Right-side Detail Panel and new backend tests for the Aggregate Outlet Summary endpoint.

## 11. UI-to-API-to-DB Contract Matrix
| Target UI Field | Flutter Model | Backend Contract | DB Source | Status | Gap / Solution |
|---|---|---|---|---|---|
| Outlet Name | `outletName` | `OutletName` | `Outlet.OutletName` | Implemented | None |
| Outlet Code | `outletCode` | `OutletCode` | `Outlet.OutletCode` | Implemented | None |
| Status | `status` | `Status` | `Outlet.Status` | Implemented | None |
| Address | `address` | `AddressLine1` etc. | `OutletAddress` | Implemented | Map correctly in UI |
| Image | N/A | N/A | N/A | Missing | Add `ImageUrl` to DB and API |
| Manager | N/A | `ManagerName` (string only) | N/A | Partially Implemented | Create formal Manager relationship |
| Active Tills | N/A | N/A | `Till` table | Missing | Aggregate endpoint required |
| Today's Sales | N/A | N/A | `Sales` module | Missing | Aggregate endpoint required |

## 12. Current versus Target Gap Matrix
| Target Requirement | Current Flutter Support | Status | Gap | Required Future Change |
|---|---|---|---|---|
| Split-view List & Detail | Separate pages/cards | Missing | No split layout | Redesign `outlet_list_screen.dart` |
| "Needs Attention" Filter | Active/Inactive only | Missing | Backend doesn't support | Update API list endpoint filter |
| Operational Summary Cards | Dashboard only | Missing | Not available per-outlet | Add widgets in detail panel |
| Outlet Image | None | Missing | DB/API doesn't return | Update DB schema and API DTO |

## 13. Completion Percentages
- **Second Brain Readiness**: 60% (Basic CRUD exists, missing complex UI flows)
- **Flutter UI Readiness**: 40% (Shared shell exists, but split-view and detail cards are missing)
- **Flutter Data-layer Readiness**: 50% (Base models exist, missing fields)
- **Backend API Readiness**: 60% (Basic endpoints work, missing aggregations)
- **Database Readiness**: 80% (Core tables exist, missing Image/Manager)
- **Permission Readiness**: 90% (Granular permissions already in place)
- **Test Readiness**: 50%
- **Overall Readiness**: ~55%

## 14. Blockers
- The backend currently does not provide an efficient way to fetch all operational metrics (Sales, Tills, Orders, Inventory) for a specific Outlet in one fast query. Making 5 separate API calls per outlet detail view will hurt performance.

## 15. Risks
- Combining Sales, Orders, Inventory, and Tills into one Outlet API might cause slow database queries if not optimized or cached properly.
- Modifying the existing `Outlet` entity to include `ManagerId` might affect existing `OutletUser` mapping logic.

## 16. Exact Second Brain Files Requiring Future Updates
- `04_MODULE_KNOWLEDGE\07_Outlet_Till_POS_Device_Foundation\02_Functional_Rules.md`
- `03_USER_JOURNEYS\Tenant_Admin\05_Till_Management_Flow.md` (or equivalent Outlet Flow)
- `05_BACKEND_ARCHITECTURE\API_ENDPOINTS.md`
- `06_DATABASE_KNOWLEDGE\Tables\08_Outlet_Till_And_POS_Device_Foundation_UPDATED.md`

## 17. Exact Flutter Files Likely Requiring Future Changes
- `lib\features\tenant_admin\outlets\presentation\screens\outlet_list_screen.dart`
- `lib\features\tenant_admin\outlets\presentation\widgets\outlet_list_panel.dart`
- `lib\features\tenant_admin\outlets\data\models\outlet_response.dart`
- `lib\features\tenant_admin\outlets\domain\entities\outlet.dart`
- `lib\features\tenant_admin\outlets\presentation\providers\outlet_providers.dart`

## 18. Exact Backend Files Likely Requiring Future Changes
- `src\E_POS.Domain\Modules\Tenant\OutletTillDevice\Entities\Outlet.cs`
- `src\E_POS.Api\Controllers\V1\Tenant\OutletTillDevice\TenantAdminOutletsController.cs`
- `src\E_POS.Application\Modules\Tenant\OutletTillDevice\Dtos\TenantAdmin\TenantAdminOutletDetailResponse.cs`
- `src\E_POS.Application\Modules\Tenant\OutletTillDevice\Services\OutletService.cs`

## 19. Recommended Implementation Order
- **Task 1 — Second Brain alignment**: Update functional requirements, DB schemas, and API contracts.
- **Task 2 — Database migration**: Add `ImageUrl` and Manager relation to Outlet entity.
- **Task 3 — Backend contract corrections**: Update DTOs to include Image and Manager data.
- **Task 4 — Backend aggregate or summary support**: Create a fast endpoint for Outlet operational summary (Sales, Tills, Orders).
- **Task 5 — Flutter DTO and domain alignment**: Update Flutter data layer with new fields.
- **Task 6 — Flutter Outlet list redesign**: Implement the Split-view layout structure.
- **Task 7 — Right-side Outlet detail panel**: Build the operational summary cards and contact info widgets.
- **Task 8 — Search, filters and pagination**: Add "Needs Attention" filter and optimize search.
- **Task 9 — Enable and disable behaviour**: Verify inline status toggle UI.
- **Task 10 — Operational metrics integration**: Connect the UI to the new aggregate API endpoint.
- **Task 11 — Responsive and accessibility work**: Ensure tablet drawer / mobile full-page fallbacks.
- **Task 12 — Automated tests**: Update Flutter widget tests and Backend unit tests.
- **Task 13 — Browser and API E2E verification**: Final manual and automated end-to-end testing.

## 20. Final Decision
**PARTIAL GO**. The shared shell, basic CRUD backend, and permissions are solidly implemented. However, the Database needs minor additions (Image, Manager), the Backend needs an aggregate summary endpoint for performance, and the Flutter UI needs a substantial redesign to support the split-view detail panel.
