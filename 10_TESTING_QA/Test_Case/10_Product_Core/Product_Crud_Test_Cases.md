<!-- title: Product CRUD And Wizard Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

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

## 2. Step 1 Initial Tracking Details Test Knowledge (TARGET / GAP)

Canonical rules: [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

| ID | Case | Expected |
|---|---|---|
| PROD-TRACK-001 | Step 1 accepts Batch Number | Syntax valid; optional; not required for Continue |
| PROD-TRACK-002 | Step 1 accepts Expiry Date | Date picker; malformed date rejected |
| PROD-TRACK-003 | Step 1 accepts Serial Number | Optional; trim; max 150 |
| PROD-TRACK-004 | Step 1 accepts all three provisionally | Saved without enabling Step 2 toggles |
| PROD-TRACK-005 | Save Draft preserves all values | Draft store returns same three fields |
| PROD-TRACK-006 | Resume preserves all values | GET setup restores values |
| PROD-TRACK-007 | Step 2 Batch ON preserves Batch | `initialBatchNumber` retained |
| PROD-TRACK-008 | Step 2 Batch + Expiry preserves both | Batch and Expiry retained |
| PROD-TRACK-009 | Step 2 Serial ON preserves Serial only | Serial retained when only serial entered |
| PROD-TRACK-010 | Step 2 Serial conflicts with Batch | Confirmation required; Batch cleared only after confirm |
| PROD-TRACK-011 | Step 2 Serial conflicts with Expiry | Confirmation required; Expiry cleared only after confirm |
| PROD-TRACK-012 | Track Inventory OFF | Confirmation then clear tracking values |
| PROD-TRACK-013 | Expiry ON without Batch identity | Finalization blocked until Batch Number supplied |
| PROD-TRACK-014 | SIMPLE final ownership | `product_batches`/`serial_numbers` use `product_variant_id` NULL |
| PROD-TRACK-015 | VARIANT ownership resolution | Publish blocked until assigned included Variant; parent rows forbidden |
| PROD-TRACK-016 | Bundle restriction | Warning; confirm clear; no parent identity rows |
| PROD-TRACK-017 | Duplicate Batch | Publish rejects per tenant/product/(variant) uniqueness |
| PROD-TRACK-018 | Duplicate Serial | Publish rejects per `UNIQUE(tenant_id, product_id, serial_number)` |
| PROD-TRACK-019 | Final Review display | Shows only applicable remaining tracking fields |
| PROD-TRACK-020 | Back navigation preserves compatible values | Step 1 still shows them |
| PROD-TRACK-021 | Explicit confirmation before clearing | No silent discard |
| PROD-TRACK-022 | No stock quantity from identity | `inventory_balances.on_hand_quantity` unchanged/not invented |
| PROD-TRACK-023 | No fake inventory balance | No fabricated balance row with positive qty |
| PROD-TRACK-024 | No fake stock movement | No `stock_movements` from Product Setup identity |

CURRENT: these cases are not implemented. TARGET for the implementation phase.

---

## 4. Product Wizard Permission Test Matrix (TARGET)

Canonical matrix: [[../../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

| ID | Case | Expected |
|---|---|---|
| PROD-PERM-001 | Create without `catalog.products.create` | 403 `product.permission_denied` |
| PROD-PERM-002 | Resume without view/create/update | 403 |
| PROD-PERM-003 | Edit published product without `catalog.products.update` | 403 (initial-draft PUT still allowed with create) |
| PROD-PERM-004 | Publish without `catalog.products.publish` | 403; draft preserved |
| PROD-PERM-005 | Non-empty Initial Tracking without `inventory_tracking` | 403 `product.entitlement_denied` |
| PROD-PERM-006 | Initial Tracking with stock.adjust missing but create+inventory_tracking present | Allowed (identity, no quantity) |
| PROD-PERM-007 | Image stage without `catalog.product_media.manage` | 403; product still savable without images |
| PROD-PERM-008 | Channel fields without `catalog.product_channels.manage` | Ignored; defaults/existing preserved; Step 1 save 200 |
| PROD-PERM-009 | VARIANT config without `catalog.variants.manage` | 403; no silent SIMPLE downgrade |
| PROD-PERM-010 | BUNDLE config without `catalog.combo_components.manage` | 403 |
| PROD-PERM-011 | Barcode mutation without `catalog.barcodes.manage` | 403 even with product update |
| PROD-PERM-012 | Pricing mutation without `catalog.product_pricing.manage` | 403 |
| PROD-PERM-013 | GET setup without `catalog.product_cost.view` | `costPrice` omitted/null; never authentic `0` |
| PROD-PERM-014 | `costPrice` present without cost.view | 403; existing cost preserved |
| PROD-PERM-015 | Tax lookup without TARGET `pricing.tax_classes.view` (compat: `tax.classes.view`) | 403 / empty lookup |
| PROD-PERM-016 | Crafted draft payload with specialized fields the caller cannot mutate | Fields not persisted (BR-TRACK-017) |
| PROD-PERM-017 | Publish with privileged subgraph and only publish permission | 403 subgraph recheck; draft intact |
| PROD-PERM-018 | Permission revoked between Step 1 and Step 7 | Next mutation 403; draft not destroyed |
| PROD-PERM-019 | Inactive permission definition | Denied immediately |
| PROD-PERM-020 | Cross-tenant product / variant assignment | 404 `product.not_found` / invalid assignment |
| PROD-PERM-021 | Tenant isolation on `product_setup_initial_tracking` | Other tenant 404 |
| PROD-PERM-022 | Legacy `tenant.products.create` grant during compatibility window | Satisfies canonical `catalog.products.create` via one-way map |
| PROD-PERM-023 | Dual-check ambiguity (catalog AND tenant as two authorities) | Forbidden; one canonical check only |
| PROD-PERM-024 | Start wizard without barcodes.manage or pricing.manage | Flutter hides Add Product; create-options 403 if attempted |

Flutter widget/unit: capability model derived before start; VARIANT/BUNDLE cards disabled with explanation; cost field never shows fake zero.

## 5. Related Specifications
- [[../../../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[../../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
