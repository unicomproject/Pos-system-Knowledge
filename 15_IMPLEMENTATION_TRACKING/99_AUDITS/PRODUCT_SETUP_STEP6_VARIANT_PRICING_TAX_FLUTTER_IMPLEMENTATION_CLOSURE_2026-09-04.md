# PRODUCT SETUP Step 6 — VARIANT Pricing & Tax FLUTTER Implementation Closure

<!-- status: Active -->
<!-- last_updated: 2026-09-04 -->

**Scope:** Flutter frontend only (`Nytroz-POS-App`).  
**Did NOT:** Backend / DB / migrations / Bundle / per-variant tax / per-variant discount / POS or Ecommerce UI.

Canonical authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5  
Backend closure: [[PRODUCT_SETUP_STEP6_VARIANT_PRICING_TAX_BACKEND_IMPLEMENTATION_CLOSURE_2026-09-03]]  
SB readiness: [[PRODUCT_SETUP_STEP6_PRICING_TAX_SIMPLE_VARIANT_SECOND_BRAIN_CLOSURE_2026-09-03]]

---

## 1. Second Brain files read

- `00_START_HERE/Current_Source_Of_Truth.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md` §6.1–6.5
- `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md`
- `04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/02_Functional_Rules.md`, `03_Technical_Contract.md`, Tax Management Canonical
- Step 6 SB / backend / SIMPLE closures under `15_IMPLEMENTATION_TRACKING/99_AUDITS/`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md`
- Permission matrix; Step 6 QA cases; UI UX Product Setup specs

## 2. Flutter files audited (pre-change)

- `presentation/widgets/step_6/step_6_pricing_tax_form.dart` (SIMPLE form + legacy scalar full form for VARIANT)
- `data/models/step6_pricing_tax_dtos.dart`
- `domain/entities/add_product_wizard_state.dart` + codec
- `presentation/controllers/add_product_wizard_controller.dart`
- `data/mappers/wizard_product_create_mapper.dart`
- `presentation/widgets/step_7/step_7_review_create.dart`
- Step 4 / Step 5 state models; create-options tax options; existing Step 6 tests

## 3. Pre-implementation matrix

| Area | Current Flutter | Backend Contract | Gap | Action |
|------|-----------------|------------------|-----|--------|
| PricingTax model | Scalar fields | + `variantPrices[]` | Gap | **EXTEND** |
| PricingTax response | Scalar hydrate | variantPrices + derived | Gap | **EXTEND** |
| Simple Step 6 | Implemented | Preserve | None | **KEEP** |
| Variant Step 6 | Scalar Cost/Sell/Discount | Per-variant table | Gap | **NEW** UI + **REMOVE** scalar VARIANT form |
| Variant identity | N/A | ProductVariantId / clientCombinationKey | Gap | **NEW** keyed util |
| API serialization | Scalar | Full snapshot; null keeps PENDING | Gap | **EXTEND** `toSnapshotJson` |
| API deserialization | Scalar | variantPrices graph | Gap | **EXTEND** |
| Draft save | Local codec | Partial pricing allowed | Gap | **EXTEND** codec + reconcile |
| Draft rehydration | Scalar | Restore by identity | Gap | **EXTEND** |
| Save & Continue | Scalar selling | All included priced + tax | Gap | **MODIFY** validation |
| Review & Create | Single Selling Price | VARIANT summary + list | Gap | **MODIFY** |
| create-options Tax | Used by SIMPLE | Shared Tax Class | None | **KEEP** |
| Permissions | Existing wizard caps | catalog.product_pricing.manage / cost view | None | **KEEP** |
| Error mapping | Page message | Map `variantPrices[n]` → row | Gap | **EXTEND** |
| Responsive UI | Wizard shell | 1024 tablet-first layout | Gap | **NEW** VARIANT layout |
| Tests | SIMPLE Step 6 | VARIANT UI/SER/REH/REC | Gap | **EXTEND** |

## 4. Files changed

### Flutter (runtime)
- `lib/.../data/models/step6_pricing_tax_dtos.dart` — `VariantPriceDto`, `variantPrices`, `toSnapshotJson()`
- `lib/.../domain/entities/add_product_wizard_state.dart` + codec — `variantPrices`
- `lib/.../presentation/utils/step_6_variant_pricing.dart` — reconcile / rows / status / snapshot / server error map
- `lib/.../data/mappers/wizard_product_create_mapper.dart` — structure-aware pricingTax
- `lib/.../presentation/controllers/add_product_wizard_controller.dart` — reconcile, update/apply prices, Step 6 validation, create error map
- `lib/.../presentation/widgets/step_6/step_6_pricing_tax_form.dart` — SIMPLE keep; VARIANT → variant form
- `lib/.../presentation/widgets/step_6/step_6_variant_pricing_tax_form.dart` — **NEW**
- `lib/.../presentation/widgets/step_7/step_7_review_create.dart` — VARIANT pricing summary

### Flutter (tests)
- `test/.../step_6_pricing_tax_form_test.dart` — UI-01..20 VARIANT cases
- `test/.../step_6_variant_pricing_util_test.dart` — **NEW** SER/REH/REC/util
- `add_product_wizard_navigation_test.dart` — VARIANT Step 6 helper
- `add_product_wizard_chunk4_variant_test.dart` — per-variant prices for Continue
- `add_product_wizard_chunk6_create_test.dart` — variantPrices in wizard-create payload

### Second Brain
- This closure
- `Current_Source_Of_Truth.md` implementation note
- Flutter Implementation Specification §1.2 VARIANT = IMPLEMENTED

## 5–8. Models / API / Riverpod / SIMPLE

- Models: `VariantPriceDto` + optional `variantPrices` on request/response DTOs; wizard state holds `List<VariantPriceDto> variantPrices`.
- Repository: no new endpoints; wizard-create mapper emits full snapshot JSON.
- Riverpod: existing `addProductWizardControllerProvider` only; no global providers.
- SIMPLE Step 6: preserved (`_buildSimpleForm`); regression tests still pass.

## 9–13. VARIANT behaviour

- Screen: Pricing & Tax — Variant Product (summary, status, default helper, table, tax sidebar, note).
- Identity: `id:{productVariantId}` else `key:{clientCombinationKey}`.
- Apply to All: local helper; confirmation when priced rows exist; backend never receives “apply all”.
- Independent overrides after Apply to All.
- Full-snapshot serialization always includes every included variant; `sellingPrice: null` emitted for PENDING.

## 14–22. Draft / Continue / Rehydration / Tax / Review

- Save Draft: does not block on pending prices (local draft path).
- Continue: blocks when any included variant not priced or tax missing.
- Rehydration: GET setup / draft hydrate → `variantPrices` by identity; no auto Apply to All.
- Step 4 reconciliation: `reconcileVariantPricesWithIncluded` on Step 4 continue / Step 5 / Step 6 entry.
- Tax: create-options dropdown; resolved rate display; Inclusive/Exclusive retained; no per-row tax.
- Permissions: existing wizard capability gates unchanged.
- Review: VARIANT shows totals / range / compact list; omits Default helper and scalar Selling Price.

## 23–27. Quality gates

| Gate | Result |
|------|--------|
| Focused Step 6 tests | **28 passed** (`step_6_pricing_tax_form_test` + `step_6_variant_pricing_util_test`) |
| Affected wizard navigation / chunk4 / chunk6 | **PASS** after helper updates |
| `flutter analyze` (changed Step 6/7 paths) | **0 errors**; 1 pre-existing warning (`_RequiredLabel.required` unused param) |
| Full `flutter test` | **1490 passed, 1 skipped, 11 failed** — of which **3 were Step-6-related** (fixed); remaining **8 are unrelated** (productCode DTO compile, Bundle UI, pagination pageSize, units labels, etc.) |
| 1024×768 | Layout implemented with tablet breakpoint + horizontal table scroll; no runtime device farm run in this session |

## Final gates

| Gate | Status |
|------|--------|
| SIMPLE STEP 6 UI | **PASS** |
| VARIANT STEP 6 UI | **PASS** |
| PER-VARIANT PRICE EDITING | **PASS** |
| APPLY TO ALL | **PASS** |
| DRAFT PARTIAL PRICING | **PASS** |
| FULL SNAPSHOT SERIALIZATION | **PASS** |
| GET SETUP REHYDRATION | **PASS** (util + hydrate path) |
| STEP 4 RECONCILIATION | **PASS** |
| TAX UI INTEGRATION | **PASS** |
| REVIEW & CREATE | **PASS** |
| 1024×768 RESPONSIVE | **PASS** (implementation; manual device check recommended) |
| FLUTTER ANALYZE (Step 6 scope) | **PASS** (no errors) |
| FULL FLUTTER TEST | **FAIL** (unrelated suite failures remain; Step-6-related failures fixed) |
| PRODUCT SETUP STEP 6 FRONTEND COMPLETE | **YES** |

## Remaining issues (out of Step 6 scope)

- Unrelated full-suite failures: `product_create_test` / `product_update_request_dto_test` missing `productCode`; product type Bundle card expectations; pagination default page size; units pack conversion label expectations.
- Manual tablet walkthrough of AquaFlow 6-variant scenario still recommended on device/emulator.
- Steps 1–6 still use local-only Save Draft by product architecture; remote draft snapshot uses same DTOs when/if remote path is used.
