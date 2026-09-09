# PRODUCT SETUP Step 6 — VARIANT Bulk Price UX Refinement Closure

<!-- status: Active -->
<!-- last_updated: 2026-09-04 -->

**Scope:** Terminology / UX refinement only (Second Brain + Flutter VARIANT Step 6).  
**Did NOT:** Backend, DB, API, SIMPLE Step 6 redesign, Tax logic, identity model.

Related:
- [[PRODUCT_SETUP_STEP6_VARIANT_PRICING_TAX_FLUTTER_IMPLEMENTATION_CLOSURE_2026-09-04]]
- [[PRODUCT_SETUP_STEP6_VARIANT_PRICING_TAX_BACKEND_IMPLEMENTATION_CLOSURE_2026-09-03]]
- Canonical: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.3

---

## Change

| Previous wording | New wording |
|---|---|
| Default Selling Price | **Set Same Price for All Variants** |
| Default Price (table column) | **Removed** |
| Apply default toggle (if any) | **Not present** — single **Apply to All** button only |

**Reason:** VARIANT has no authoritative parent selling price. The control is a Flutter-only bulk-entry convenience.

## Behaviour (unchanged semantics)

1. User enters amount in bulk helper.
2. **Apply to All** copies into each included variant Selling Price (overwrite confirm when rows already priced).
3. User may override individual rows.
4. Backend receives only resulting `variantPrices[]`.
5. Never serialize `bulkSellingPrice` / `setSamePriceForAll` / `applyToAll` / default helper fields.

Price Range / Priced / Pending derive from **actual row prices only**.

## Files updated

### Second Brain (canonical)
- `Current_Source_Of_Truth.md`
- `05_Tenant_Admin_Add_Product_7_Step_Contract.md` §6.3
- `Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md` §4.3.3
- `Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md` §1.2
- `02_Functional_Rules.md` (Pricing)
- Review Create / Permission Matrix / Journey / QA cases (terminology)

### Flutter
- `step_6_variant_pricing_tax_form.dart` — labels, note, remove Default Price column, `_bulkPriceController`
- `step_6_variant_pricing.dart` — drop `referenceDefaultPrice`
- `add_product_wizard_controller.dart` — `applyBulkSellingPriceToAllVariants` (+ legacy alias)
- Focused tests updated

## Quality gates (2026-09-04)

| Check | Result |
|------|--------|
| `dart format` (affected) | Clean (0 changes) |
| `flutter analyze` (Step 6 + controller) | 1 pre-existing warning in SIMPLE `step_6_pricing_tax_form.dart` (`unused_element_parameter`) — not introduced by this UX task |
| Focused Step 6 form + util + chunk4 | **48 passed** (includes UX-09 overwrite + UX-11/12 Review no bulk helper) |
| Full Flutter suite | Not claimed clean — prior ~8 unrelated failures remain (productCode DTO, Bundle UI, pagination, units labels, etc.) |

### Remaining (out of this UX wording scope)

Step 7 VARIANT `Pricing & Tax` card passes summary rows into `_ReviewSectionCard`, but when `customContent` (`Variant Prices` list) is set the card currently renders **only** customContent — so Priced/Pending/Price Range/Tax rows may not appear in the Review UI. Bulk helper is correctly absent. Follow-up if Review summary rows are required on-screen.

## Gates

| Gate | Status |
|------|--------|
| SECOND BRAIN UPDATED | **PASS** |
| DEFAULT SELLING PRICE TERMINOLOGY REMOVED | **PASS** |
| SET SAME PRICE FOR ALL VARIANTS | **PASS** |
| DEFAULT PRICE TABLE COLUMN REMOVED | **YES** |
| APPLY TO ALL | **PASS** (behaviour unchanged) |
| PER-VARIANT SELLING PRICE | **PASS** |
| SERIALIZATION UNCHANGED | **PASS** |
| SIMPLE STEP 6 REGRESSION | **PASS** |
| TAX REGRESSION | **PASS** (no tax changes) |
| REVIEW & CREATE REGRESSION | **PASS** (no bulk helper; actual Variant Prices list shown) |
| 1024×768 | **PASS** (table column removed; layout flexed; viewport smoke in form tests) |
| BACKEND CHANGES | **NONE** |
| DATABASE MIGRATION | **NONE** |
| UX REFINEMENT COMPLETE | **YES** |
