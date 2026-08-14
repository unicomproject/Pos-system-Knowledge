# Tenant Admin Bundle Kit Step 4 Second Brain Readiness Audit
**Date:** 2026-08-14

## 1. Canonical User Journey
- Step 1 (Basic Details) -> Step 2 (Product Type & Tracking)
- Step 2 `productStructure` = `BUNDLE` -> Step 4 (Product Configuration)
- Step 3 (Units & Pack) is completely skipped and NEVER rendered.
- Step 4 Back navigates to Step 2.
- Step 4 Skip is unavailable.

## 2. Functional Rules
- `SIMPLE` structure auto-skips Step 4.
- `VARIANT` structure renders Variant Configuration.
- `BUNDLE` structure renders Bundle Configuration.
- Legacy draft normalizes: `currentSetupStep = 3` for a `BUNDLE` product automatically routes to Step 4.

## 3. Business Rules
- Bundle parent inventory tracking is FORCED OFF (inventory deduction is component-based).
- Minimum 2 distinct valid components required for Save & Continue.
- Zero-stock components are still configuration-eligible.

## 4. Navigation
- Back from Step 4 goes to Step 2.
- Stale QA "Step 3 -> Step 4" is replaced with legacy draft normalization tests.

## 5. Permissions
- Canonical permission for Step 4 Bundle Configuration is `catalog.combo_components.manage`.
- `catalog.bundle_components.manage` has been thoroughly eradicated.

## 6. Entitlement
- Runtime entitlement is `product_catalog`.
- Module grouping code `product_management` is strictly separate and does not override.

## 7. Duplicate Semantics
- **UI / Drawer Layer**: Identical components are merged (Add mode increments existing row, Edit mode replaces quantity).
- **Backend Layer**: Enforces strict unique identity checking (`componentProductId` for SIMPLE, `componentProductId + componentVariantId` for VARIANT). Rejects duplicates with `product.bundle.duplicate_component`.

## 8. Combo Lifecycle Rule
- First Step 4 SAVE_DRAFT with 0 components creates one empty `combo_definitions` row, zero `combo_components` rows.
- First non-empty Save creates/updates `combo_definitions` and inserts `combo_components`.
- Repeated Save updates `combo_components`.
- All components removed keeps `combo_definitions` row, physically deletes all `combo_components` rows.
- Removing a component **physically deletes** the `combo_components` row (no ambiguous "logically retires" wording).
- Structure change (e.g., BUNDLE -> SIMPLE) explicitly destroys the component mappings.

## 9. API Contract Status
- Candidate Search API endpoint and response envelopes explicitly defined.
- Exact Variant Selector API explicitly defined.
- Draft Resume endpoint defined, restoring deterministic exact identities without injecting stale stock counts.
- **Status:** IMPLEMENTATION READY.

## 10. Database Contract Status
- Canonical persistence explicitly uses: `products`, `combo_definitions`, `combo_components`, `product_variants`, `product_inventory_settings`, `unit_of_measures`.
- Validates identity at domain level, overriding any looser unique DB indexes that might include UOM.
- **Status:** IMPLEMENTATION READY.

## 11. Estimated Component Cost Decision
- **Estimated Component Cost = BLOCKED / NOT IMPLEMENTATION READY**
- Backend and Flutter MUST NOT fabricate zero or a guessed cost until an authoritative rule (Weighted Average, FIFO, etc.) is canonicalized via pricing and inventory ledgers.

## 12. QA Coverage
- Test cases updated to remove Step 3 navigation, test legacy normalization, enforce back navigation, test 403 against `catalog.combo_components.manage`, test 409 rowVersion, zero stock, exact variant selection, duplicate merging, API rejection of duplicates, etc.
- **Status:** IMPLEMENTATION READY.

## 13. Atomicity & Concurrency
- `expectedRowVersion` vs `products.row_version` matching required.
- Stale saves return HTTP 409 `product.bundle.row_version_conflict`.
- Step 4 saves execute atomically across combo_definitions, combo_components, products.current_setup_step, draft timestamp, and rowVersion. No partial saves.

## 14. Remaining Blockers
- **Derived Cost Projection**: BLOCKED. This does NOT block core validation/persistence phase.

## 15. Backend Implementation Readiness
- **Verdict**: IMPLEMENTATION READY

## 16. Flutter Implementation Readiness
- **Verdict**: IMPLEMENTATION READY
