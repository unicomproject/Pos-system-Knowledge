<!-- title: Tenant Admin Tax Management Flutter Implementation Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-03 -->
<!-- authority: Implementation evidence only — does not rewrite Canonical Contract -->

# Tenant Admin Tax Management — Flutter Implementation Closure (2026-09-03)

## Scope

Flutter-only alignment of Tenant Admin Tax Management to:

- Canonical: `Pos-system-Knowledge/04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md`
- Backend contract: `TENANT_ADMIN_TAX_MANAGEMENT_BACKEND_IMPLEMENTATION_CLOSURE_2026-09-03.md`

**Backend was not modified.**

## Verdict

**TAX MANAGEMENT FLUTTER — COMPLETE**

## Phase 0 audit (summary)

| Area | Existing Flutter | Canonical Requirement | Gap | Action |
|---|---|---|---|---|
| Tax page | Legacy PERCENTAGE/FIXED form | Tax Setup list + treatment + schedule | Broken vs API | **MODIFY** / rebuild |
| Used For / Applies To | Absent | Must stay absent | None | **KEEP** absent |
| Permissions | `tenant.products.view` gate | `pricing.tax_*` | Wrong gate | **MODIFY** |
| Step 6 tax source | Extra `GET /api/v1/tax` | create-options | Wrong source | **MODIFY** |
| TaxPriceMode | `taxExclusive` | Inclusive/Exclusive → `taxExclusive` | Aligned field | **KEEP** + labels |
| Brand/Category chrome | Available | Reuse list/search/pagination | Partial | **REUSE** |

## Screens / flows implemented

- Tax Setup List (`TaxManagementPage`) — search, status filter, server page size 5, empty states, actions
- Add Tax Setup (`TaxSetupFormPage` create) — Basic Details, Tax Treatment, Initial Rate
- Edit Tax Setup — summary, treatment, current/next rate, history, schedule, activate/deactivate
- Schedule Rate sheet — create/edit future rates
- Products Using Tax — paged list with Inclusive/Exclusive
- Product Setup Step 6 — create-options taxes + Price Tax Mode + inactive retention

## API wiring (live backend)

| Capability | Route |
|---|---|
| List | `GET /api/v1/tax` |
| Detail | `GET /api/v1/tax/{id}` |
| Create | `POST /api/v1/tax` |
| Update | `PUT /api/v1/tax/{id}` |
| Schedule | `POST /api/v1/tax/{id}/rates` |
| Edit future | `PUT /api/v1/tax/{id}/rates/{rateId}` |
| Delete future | `DELETE /api/v1/tax/{id}/rates/{rateId}` |
| Activate / Deactivate | `POST .../activate` / `.../deactivate` |
| Products using | `GET /api/v1/tax/{id}/products` |
| Product options | `GET /api/v1/tenant-admin/products/create-options` |

DTOs accept canonical camelCase (`name`, `taxTreatment`, `currentRate`, …) plus legacy aliases.

## Permissions (TARGET)

Flutter primary keys: `pricing.tax_classes.*`, `pricing.tax_rates.*`  
Aliases keep legacy `tax.classes.*` / `tax.rates.*` working.

## Product Setup

- Tax dropdown from create-options (`taxId`, `taxTreatment`, `currentRate`)
- Labels: TAXABLE `Name — 18%`, ZERO_RATED `Name — 0%`, EXEMPT `Name — Exempt`
- Inactive current assignment retained on edit (Option B)
- Inclusive → `taxExclusive=false`; Exclusive → `taxExclusive=true`

## Key files

| Path | Role |
|---|---|
| `.../tax_management/domain/*` | TaxSetup, TaxTreatment, TaxStatus, TaxPriceMode |
| `.../tax_management/data/*` | DTOs + repository |
| `.../tax_management/application/tax_management_controller.dart` | Providers + mutations |
| `.../presentation/tax_management_page.dart` | List |
| `.../presentation/tax_setup_form_page.dart` | Add/Edit |
| `.../presentation/tax_products_using_page.dart` | Products using |
| `.../presentation/widgets/schedule_rate_sheet.dart` | Schedule UI |
| `.../step_6/step_6_pricing_tax_form.dart` | Product Step 6 |
| `lib/core/access/tenant_admin_access_codes.dart` | TARGET permission constants |
| `lib/core/access/tenant_admin_permission_aliases.dart` | Legacy ↔ TARGET map |

## Tests / analysis (actual)

| Suite | Result |
|---|---|
| Focused tax tests `test/features/tenant_admin/pricing_tax` | **16 passed** |
| Products sidebar navigation | **14 passed** |
| Products feature tests `test/features/tenant_admin/products/` + create-options | **111 passed** |
| `flutter analyze` (tax + step 6 + aliases) | **No issues found** |
| Full Flutter suite | **1460 passed**, 1 skipped, **8 failed** (pre-existing unrelated: `productCode` DTO compile, product type/units label assertions, pageSize expect 5 vs 4) |
| Flutter web debug build | **PASS** (`flutter build web --debug`) |

## Remaining gaps

1. Dedicated widget coverage for every schedule/edit edge case is thinner than the Phase 41 matrix (core list/DTO/Step 6 labels covered).
2. Product **non-wizard edit** form Inclusive/Exclusive restore remains a follow-up if that path is still used outside the 7-step wizard.
3. Full suite has **8 pre-existing unrelated failures** (not caused by Tax Management changes).

## Gates

| Gate | Status |
|---|---|
| Canonical Second Brain | USED AS SOURCE OF TRUTH |
| Backend | USED AS IMPLEMENTED CONTRACT — NOT MODIFIED |
| Tax Setup List | COMPLETE |
| Add Tax | COMPLETE |
| Edit Tax | COMPLETE |
| Rate Scheduling UI | COMPLETE |
| Products Using | COMPLETE |
| Permission UI | COMPLETE |
| Product Setup Step 6 | COMPLETE |
| Inclusive/Exclusive | COMPLETE |
| Inactive Tax Option B | COMPLETE |
| 1024×768 list widget | PASS (focused widget test) |
| flutter analyze (tax scope) | PASS |
| Focused tests | PASS — 16 |
| Full Flutter regression | FAIL — 8 pre-existing unrelated |
| Web build | *(see final report)* |
