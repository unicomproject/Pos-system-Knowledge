<!-- title: Tenant Admin Tax Management Second Brain Canonical Contract Closure -->
<!-- status: CLOSED / CANONICAL CONTRACT READY -->
<!-- date: 2026-09-03 -->
<!-- system: OneVerz POS MVP -->

# Tenant Admin Tax Management — Second Brain Canonical Contract Closure

## Verdict

```text
TAX MANAGEMENT SECOND BRAIN — CANONICAL CONTRACT READY
```

This closure is **documentation-only**. It does **not** claim backend or Flutter implementation complete.

## Objective

Establish one canonical Tax Management / Tax Setup contract as the source of truth for later backend, Flutter, Product Setup, POS calculation, and refund workstreams.

## Phase 0 audit (summary)

| Area | Before | Action |
|---|---|---|
| Tax journey | Single-page Tax Type + % form | SUPERSEDE → list/add/edit/schedule |
| Tax Type VAT/GST or PERCENTAGE/amount | Active UX | SUPERSEDE → Treatment TAXABLE/ZERO_RATED/EXEMPT |
| Used For / Goods / Services | Risk of dual models | REMOVE / forbid |
| Inclusive/Exclusive | Product-owned ADR | KEEP |
| Rate schedule / history / product count | Gaps | CREATE |
| Snapshot / refund after rate change | Underspecified | CREATE / sync |
| Permissions | Incomplete TARGET set | MODIFY `pricing.tax_*` |
| Journey IDs | None for Tax | CREATE TA-UJ-063…069 |

## Files created

1. `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md`
2. `13_DECISIONS_AND_CHANGES/TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03.md`
3. `15_IMPLEMENTATION_TRACKING/99_AUDITS/TENANT_ADMIN_TAX_MANAGEMENT_SECOND_BRAIN_CANONICAL_CONTRACT_2026-09-03.md` (this file)

## Files modified (synchronized)

- `03_USER_JOURNEYS/Tenant_Admin/10_Tax_Management_Flow.md`
- `03_USER_JOURNEYS/Tenant_Admin/CANONICAL_USER_JOURNEY_INDEX.md`
- `03_USER_JOURNEYS/00_Global_User_Journey_Register.md`
- `03_USER_JOURNEYS/Cashier/08_Return_Refund_Flow.md`
- `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `06_DATABASE_KNOWLEDGE/Tables/14_Pricing_And_Tax_Management.md`
- `06_DATABASE_KNOWLEDGE/Tables/20_Unified_Order_And_Sales_UPDATED.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Tax_Management.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Tax_Management_Implementation.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/API_Authorization_Rules.md`
- `02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md`
- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Project_Glossary.md`
- `13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27.md`
- `13_DECISIONS_AND_CHANGES/Scope_Change_Log.md`

## Superseded (as Tax Management UX/journey authority)

Pre-2026-09-03 single-page Tax Type form content in Tax Flow / UI / Flutter Tax docs — replaced in-place with canonical pointers. Historical Inclusive/Exclusive closure audit (2026-08-27) remains **historical evidence** and is **not** contradicted (Product TaxPriceMode KEPT).

## Counts

| Item | Count |
|---|---:|
| Functional requirements FR-TAX-* | 33 |
| Business rules BR-TAX-* | 27 |
| Business logic BL-TAX-* | 12 |
| Decisions DEC-TAX-* | 18 LOCKED |
| Journey IDs | TA-UJ-063 … TA-UJ-069 |

## Remaining implementation gaps (not Second Brain blockers)

1. Backend: `tax_treatment` column / treatment semantics vs legacy `tax_type`
2. Backend: schedule APIs, product count, status Option B, create-options ACTIVE taxes
3. `sales_order_taxes.tax_treatment_snapshot` TARGET column
4. Flutter: rebuild Tax Setup screens to list/add/edit/schedule model
5. Permission seed alignment `tax.classes.*` → `pricing.tax_*`

## Final closure table

| Area | Before | After | Status |
|---|---|---|---|
| Tax User Journey | Form+table Tax Type | TA-UJ-063…069 Tax Setup | READY |
| Tax List | Tax Type / % | Name, Current, Next, Products, Status | READY |
| Add Tax | Inline form | Add Tax Setup sections | READY |
| Edit Tax | Inline edit | Edit + history + schedule | READY |
| Tax Treatment | VAT/GST or PERCENTAGE | TAXABLE/ZERO_RATED/EXEMPT | READY |
| Rate Schedule | End-date on update only | Explicit Schedule Rate Change | READY |
| Rate History | Implicit | HISTORICAL/CURRENT/SCHEDULED | READY |
| Inclusive/Exclusive | Product ADR | Product TaxPriceMode KEPT | READY |
| Product Setup Integration | TaxClassId | TaxSetupId + ACTIVE options | READY |
| Product Count | Missing | Derived DISTINCT count | READY |
| Status Lifecycle | Soft delete focus | ACTIVE/INACTIVE Option B | READY |
| Transaction Snapshot | Partial | + treatment TARGET | READY |
| Refund Tax | Underspecified | Original snapshot | READY |
| Permission | Incomplete | pricing.tax_* TARGET | READY |
| API Contract | Mixed paths | Extend `/api/v1/tax` | READY |
| Attributes / DTO | Partial | Matrices in canonical | READY |
| Tables/Data Model | ERD + overlay | Documented | READY |
| Validation / BR / BL / NFR | Partial | Numbered sets | READY |
| Tenant Isolation | Stated | BR-TAX-001/019 | READY |
