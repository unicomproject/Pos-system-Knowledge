# Tenant Admin Barcode & SKU Step 5 Second Brain Readiness Audit
**Date:** 2026-08-14

## 1. Canonical User Journey
- Step 1 to Step 4 are completed depending on the product structure.
- Step 5 (Barcode & SKU) requires users to define unique SKU and Barcodes.
- `SIMPLE` and `BUNDLE` structures use a Base SKU.
- `VARIANT` structures require an explicit SKU for every sellable variant.

## 2. Functional Rules
- Base SKU is mapped to the default variant row for `SIMPLE` and `BUNDLE` products.
- Variant SKUs are explicitly mapped to their respective `product_variants` rows.
- Duplicate SKUs and Barcodes within the request are rejected with specific field errors.
- Duplicate SKUs and Barcodes in the database (tenant-scoped) are rejected with `product.duplicate_sku` and `product.duplicate_barcode`.
- Barcodes can be assigned at the product level (`product_variant_id = NULL`) or the variant level.
- Additional barcodes support specific UOMs and scan quantities.

## 3. Business Rules & Validation
- **Save Draft:** Allows incomplete states. SKUs are not strictly required. Validates lengths (max 100 chars) and uniqueness.
- **Save & Continue:** Requires Base SKU for `SIMPLE`/`BUNDLE`. Requires SKU for every included `VARIANT`.
- Barcode Types: `EAN-13`, `UPC-A`, `CODE-128`, etc.

## 4. API Contract Status
- `SaveProductDraftRequest` explicitly supports `BaseSku`, `ParentProductBarcode`, `VariantIdentifiers`, and `AdditionalBarcodes`.
- The draft response DTOs (`ProductDraftResponseDto` and `ProductSetupWizardDto`) expose these fields to restore the UI state.
- **Status:** IMPLEMENTATION READY.

## 5. Database Contract Status
- Identifier persistence leverages: `product_variants` for SKUs and `product_barcodes` for barcodes.
- Primary barcodes use `is_primary_barcode = true`.
- Historical identifiers are soft-deleted (`status = "DELETED"`) rather than physically deleted, maintaining ledger integrity.
- **Status:** IMPLEMENTATION READY.

## 6. Duplicate Semantics
- `ValidateBarcodeSkuDraft` uses `HashSet<string>` with `StringComparer.Ordinal` to catch in-flight duplicates instantly.
- `ApplyBarcodeSkuAsync` uses `SkuExistsOnOtherVariantAsync` and `BarcodeExistsOnOtherBarcodeRecordAsync` for robust DB-level concurrency and duplication checks.

## 7. Atomicity & Concurrency
- `expectedRowVersion` vs `products.row_version` matching is strictly required.
- Stale saves return HTTP 409 `product.concurrency_conflict`.
- Step 5 saves execute atomically, applying SKUs, Barcodes, soft-deletions, and bumping `row_version` in a single pipeline.

## 8. Backend Implementation Readiness
- **Verdict**: IMPLEMENTATION READY
- The backend C# implementation explicitly matches the Second Brain spec.

## 9. Flutter Implementation Readiness
- **Verdict**: IMPLEMENTATION READY
- Step 5 UI forms and controllers are structured to handle the detailed identifier DTOs.
