# Product CRUD & Wizard Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 10_Product_Core / 12_Product_Option_Variant_Configuration |
| Feature | Product Wizard Setup Flow — Step 4 Variant Configuration |
| Feature Type | End-to-End / API / Unit / Integration |
| API Endpoint | `/api/v1/tenant-admin/products/{id}/draft`, `/api/v1/tenant-admin/products/{id}/setup` |
| Required Permission | `catalog.products.create` / `catalog.products.update` + `catalog.variants.manage` |
| Feature Entitlement | `product_catalog` |
| Tenant Scoped | Yes |

---

## 1. Step 4 Variant Configuration Test Matrix

### 1.1 Backend API & Integration Test Cases
- **PROD-VAR-001 (Cartesian Matrix Generation)**: 3 Sizes $\times$ 2 Colours $\times$ 1 Material produces exactly 6 combinations with unique deterministic `option_combination_hash` values.
- **PROD-VAR-002 (Idempotency)**: Submitting identical attributes and values twice retains existing variant GUIDs, custom display labels, and `Include Variant` states without creating duplicates.
- **PROD-VAR-003 (Validation Errors)**: Rejects Save & Continue with HTTP 400 when 0 attributes defined (`product.variant_options_required`), an attribute has 0 values (`product.option_values_required`), or 0 variants are included (`product.included_variant_required`).
- **PROD-VAR-004 (Include Variant Semantics)**: Toggling `Include Variant = OFF` sets `is_sellable = false`. Variant remains in matrix but is excluded from downstream Step 5 SKU requirements.
- **PROD-VAR-005 (Delete & Tombstone Safety)**: Deleting variant `Red / M` archives variant (`status = 'ARCHIVED'`). Regenerating matrix does NOT recreate deleted `Red / M`.
- **PROD-VAR-006 (Operational History Delete Protection)**: Deleting a variant with existing sales/stock history is blocked with HTTP 400 (`variant.has_operational_history`).
- **PROD-VAR-007 (Image Hierarchy Resolution)**: Validates priority order: Exact Variant Override $\rightarrow$ Colour Group Image $\rightarrow$ Step 1 Primary Image $\rightarrow$ Standard Placeholder.
- **PROD-VAR-008 (UOM Inheritance)**: VARIANT + Track Inventory ON inherits parent base UOM as `stock_uom_id` and selling UOM as `sales_uom_id`. Track Inventory OFF resolves system default UOM (`PCS`).
- **PROD-VAR-009 (Concurrency & Tenant Isolation)**: Stale `expectedRowVersion` returns HTTP 409 Conflict. Cross-tenant option/media IDs return HTTP 403.
- **PROD-VAR-010 (Downstream Cleanup)**: Deleting a variant in Step 4 cleans up linked draft barcodes, variant price overrides, and channel visibility records atomically.

### 1.2 Flutter Unit & Widget Test Cases
- **FLUT-VAR-001**: Step 4 main screen rendering, configuration summary card counts, and Cartesian preview updates.
- **FLUT-VAR-002**: Edit Variant Drawer sliding animation, pre-filled display label, `Include Variant` toggle interaction, and `Cancel` (discards local drawer edits).
- **FLUT-VAR-003**: Delete Variant Modal dialog display, cancellation, and destructive delete confirmation.
- **FLUT-VAR-004**: Field error placement on attribute rows and Save & Continue CTA button state.

---

## 2. Related Specifications
- [[../../../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
