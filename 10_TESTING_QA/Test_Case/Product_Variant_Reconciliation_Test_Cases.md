<!-- title: Product Variant Reconciliation Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Product Variant Reconciliation Test Cases

## Purpose
Specifies the automated integration test cases for Step 4 Variant Configuration, strictly enforcing stable Option/Value/Variant identities.

## TC-01: ProductOption Stable Identity
**Scenario:**
1. Select Attribute (e.g. Size).
2. Backend creates exactly one logical active `ProductOption`.
3. Save Draft multiple times.
4. Remove Attribute.
5. Re-add identical Attribute (Size).
**Assertion:**
- Backend does NOT create a duplicate `ProductOption`.
- The identical `ProductOption` ID is reused/reactivated across all saves.

## TC-02: ProductOptionValue Stable Identity
**Scenario:**
1. Select Value (e.g. Red) for an Attribute (e.g. Colour).
2. Backend creates active `ProductOptionValue`.
3. Save Draft multiple times.
4. Remove Value.
5. Re-add identical Value (Red).
**Assertion:**
- Backend does NOT create a duplicate `ProductOptionValue`.
- The identical `ProductOptionValue` ID is reused/reactivated.
- Values from other templates or inactive values are rejected.

## TC-03: Variant Identity and `clientCombinationKey`
**Scenario:**
1. Generate Variants on frontend.
2. Verify frontend payload uses `clientCombinationKey` instead of fake `productVariantId`.
3. Save Draft.
4. Backend returns real `productVariantId` mapped to `clientCombinationKey`.
5. Modify a non-identifying property (e.g. Display Label) and Save again.
**Assertion:**
- First save returns real `productVariantId`.
- Repeated saves reuse the same `productVariantId`.
- Canonical hash remains strictly identical.

## TC-04: Tombstone Permanence (No Resurrection)
**Scenario:**
1. Generate combinations `Red / S` and `Red / M`.
2. Delete `Red / M` on the UI (frontend explicitly removes it or sends `deletedCombinations`).
3. Save Draft.
4. Re-generate combinations with same matrix.
**Assertion:**
- `Red / M` is excluded from the regenerated matrix.
- `Red / M` `productVariantId` remains `ARCHIVED`.
- Matrix modification and subsequent return to original matrix still excludes `Red / M`.

## TC-05: Variant Lifecycle Correctness
**Scenario:**
1. Create new Included Variant.
2. Toggle Include Variant OFF.
3. Toggle Include Variant ON.
4. Complete Wizard (Step 7).
**Assertion:**
- Included variants remain in `DRAFT` status with `is_sellable=true` until Step 7.
- Excluded variants remain in `DRAFT` status with `is_sellable=false`.
- Step 4 NEVER publishes variants.

## TC-06: UOM Resolution
**Scenario A (Track Inventory ON):**
1. Step 3 sets Parent Stock UOM to Box and Sales UOM to Piece.
2. Save Step 4 Variant.
**Assertion:** Variant inherits Box and Piece respectively.

**Scenario B (Track Inventory OFF):**
1. Track Inventory is OFF (Step 3 skipped).
2. Save Step 4 Variant.
**Assertion:** Backend canonical Product Wizard UOM resolver automatically sets both Stock and Sales UOM. No error or missing UOM.

## TC-07: Idempotency and Concurrency
**Scenario:**
1. Submit identical payload twice.
2. Submit stale payload with old `expectedRowVersion`.
**Assertion:**
- Identical payload returns 200 without creating duplicates.
- Stale payload is rejected with 409 Concurrency Conflict.

## TC-08: Permissions
**Scenario:**
1. Call initial draft with `catalog.products.create` and `catalog.variants.manage`.
2. Call edit with `catalog.products.update` and `catalog.variants.manage`.
3. Call without `product_catalog` entitlement.
**Assertion:**
- Both valid calls succeed.
- Call without entitlement is rejected with HTTP 403.
