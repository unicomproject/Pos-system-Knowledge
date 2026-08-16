# Tenant Admin Add Product — Barcode & SKU Specification

<!-- title: Tenant Admin Add Product — Barcode & SKU Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-14 -->

## 1. Executive Summary & Purpose

This document is the authoritative canonical specification for **Step 5 — Barcode & SKU** of the Tenant Admin Add Product wizard. It explicitly defines the functional rules, business logic, persistence models, mapping of identifiers by Product Structure, API payload schemas, and uniqueness validation logic for identifiers.

**Actor**: Tenant Admin or authorized Catalog Manager.
**Entry Conditions**: Step 1 (Basic Details) must be completed. For Tracked Simple products, Step 3 (Units) must be completed. For Variant products, Step 4 (Variant Configuration) must be completed. For Bundle products, Step 4 (Kit Composition) must be completed.
**Preconditions**: Valid authenticated user with required permissions within a specified tenant.

---

## 2. Product Structure Matrix: Base SKU Persistence Rule

The canonical rule for identifier storage is that **every sellable product must possess at least one `product_variants` row**. Therefore, there is NO dummy variant creation logic needed solely for the SKU. 

| Structure | SKU Storage | Barcode Storage | Description |
|---|---|---|---|
| **SIMPLE** | `product_variants.sku` (on the default variant row) | `product_barcodes` (linked to `product_variant_id`) | 1 Base SKU per product. Auto-mapped to the single default variant created for the simple product. Base SKU is mandatory on Save & Continue. |
| **BUNDLE** | `product_variants.sku` (on the default variant row) | `product_barcodes` (linked to `product_variant_id`) | 1 Bundle SKU. Handled identical to SIMPLE for persistence of its own unique SKU representing the kit parent. |
| **VARIANT** | `product_variants.sku` (per actual variant row) | `product_barcodes` (linked to `product_variant_id`) | Step 5 "Base SKU" acts only as an auto-generation seed or prefix for child variants. Every included/sellable variant requires its own unique SKU. Parent-level barcodes can exist where `product_variant_id = NULL`. Excluded variants are skipped and do not require SKUs. |

*Note: `products.product_code` is strictly used for "Short Name / Internal Code" in Step 1, NOT for SKU.*

---

## 3. Main Flows & Validations

### 3.1 Main Flow
1. **Load State**: API returns existing identifier configuration including the auto-generated Base SKU or explicitly set SKUs/barcodes, plus additional barcode mappings by UOM.
2. **Assign Identifiers**: User enters SKU/Barcode values for the Base SKU or specific Variant SKUs.
3. **Scanner Interaction Boundary**: Barcode scanners act as standard HID keyboard emulators. The UI input fields process the trailing Enter/Return keystroke to finalize the scanned value. 
4. **Save Draft / Save & Continue**: Client triggers validation and persistence via `PUT /api/v1/tenant-admin/products/{productId}/draft`.

### 3.2 Alternate Flows
- **Auto Generate SKU**: System generates an SKU sequence based on the internal `product_code` (e.g. `PRODCODE-001`). If clicked, overrides the current value.
- **Add Additional Barcode**: User opens the "Add Additional Barcode" drawer to assign an alternative barcode (e.g., EAN vs UPC, or for an Outer Pack UOM).
- **Edit / Delete Barcode**: User modifies or removes an additional barcode via drawers/modals.

### 3.3 Duplicate Barcode Details Drawer (Projection)
We utilize **Approach B: Structured conflict metadata returned by the Step 5 validation/save response.**
If a duplicate barcode or SKU is detected, the API returns a `409 Conflict` containing a structured duplicate projection payload:
```json
{
  "errorCode": "product.duplicate_barcode",
  "message": ".",
  "conflictDetails": {
    "barcode": "8901234567890",
    "barcodeType": "EAN-13",
    "productId": "...",
    "productName": "Conflicting Product",
    "productStructure": "SIMPLE",
    "productVariantId": null,
    "sku": "SKU-999",
    "assignedLevel": "PRODUCT",
    "status": "ACTIVE"
  }
}
```
*Note: Stock Status and Created By are omitted from the projection to prevent leakage. View Product is conditional on `catalog.products.view`.*

---

## 4. Barcode Persistence Contract

Table: `product_barcodes`
- **Ownership Scope**: `UNIQUE(tenant_id, barcode)`. The same string value CANNOT be used for both a parent barcode and a variant barcode. It is completely unique across the tenant.
- **UOM Integration**: `uom_id` links to the `unit_of_measures` table. `quantity_per_scan` is strictly derived/validated backend-side using the `product_unit_conversions` configurations mapped in Step 3. (e.g., 1 Pack = 6 Pieces, `quantity_per_scan = 6`).
- **Primary Scope**: One primary barcode per `product_variant_id` (or one for the parent product if `product_variant_id IS NULL`).
- **Deletion/Deactivation**: If an identifier was used in historical sales, it is soft-deleted (`status = DELETED`). Primary barcodes cannot be deleted unless another barcode takes its place.
- **Parent vs Variant**: Parent-level barcodes have `product_variant_id = NULL`. Variant-level barcodes explicitly link to `product_variants.id`.

### Barcode Type Catalogue
Types: `EAN-13`, `EAN-8`, `UPC-A`, `CODE-128`, `CODE-39`. (Backend constants returned via `create-options`). Leading zeroes MUST be preserved (string data type).

---

## 5. SKU Business Rules
- **Formatting**: Max 100 characters, leading/trailing whitespace trimmed, case-sensitive uniqueness comparison.
- **Auto-Generate**: Generates based on `{ProductCode}-{Counter}` or `{ProductCode}-{VariantOptionA}-{VariantOptionB}`. Suffix is deterministic, checking for collisions and retrying up to 5 times.
- **Global Namespace**: SKUs must be unique across all Simple, Bundle, and Variant SKUs (`UNIQUE(tenant_id, sku)`).
- **Required Rules**: 
  - Save Draft: Not required. Incomplete states are allowed.
  - Save & Continue: Required for Simple, Bundle, and all sellable variants.

---

## 6. Permissions and Entitlement
- **Role/Permissions**: 
  - New Add Product: `catalog.products.create` + `catalog.barcodes.manage`
  - Edit Existing Step 5: `catalog.products.update` + `catalog.barcodes.manage`
  - View Duplicate Details / Setup: `catalog.products.view`
- **Feature Entitlement**: `product_catalog`. 

---

## 7. API Contract & Payload Schema
`PUT /api/v1/tenant-admin/products/{productId}/draft`

**Request Payload (`UpdateProductDraftStep5RequestDto`)**:
```json
{
  "currentSetupStep": 5,
  "wizardAction": "SAVE_AND_CONTINUE",
  "advanceStep": true,
  "expectedRowVersion": 10,
  "baseSku": "MAIN-SKU-01",
  "parentProductBarcode": "8901234567890",
  "variantIdentifiers": [
    {
      "productVariantId": "guid...",
      "sku": "VAR-SKU-01",
      "barcode": "8901234567891"
    }
  ],
  "additionalBarcodes": [
    {
      "barcodeId": "guid...", 
      "barcode": "8901234567892",
      "barcodeType": "EAN-13",
      "productVariantId": null,
      "uomId": "guid...",
      "quantityPerScan": 6,
      "isPrimary": false,
      "status": "ACTIVE"
    }
  ]
}
```

---

## 8. Save Draft vs Save & Continue
- **Save Draft**: Allows missing SKUs or Barcodes. Rejects malformed IDs, cross-tenant references, and duplicates. Leaves `current_setup_step = 5`. Updates `draft_saved_at`.
- **Save & Continue**: Validates completion of all active rows. Sets `current_setup_step = 6` upon success. 

---

## 9. Transaction, Concurrency & Security
- **Atomicity**: The request executes within a single PostgreSQL transaction covering Base SKU, Variant SKUs, Barcode swaps, primary toggling, and Product `rowVersion` bumping.
- **Concurrency**: Relies on `expectedRowVersion`. A mismatch returns HTTP 409 Conflict.
- **Tenant Isolation**: `tenant_id` is authoritative from JWT. Conflict details omit cross-tenant data. 

---

## 10. Performance / NFR
- Response times must be <= 150ms (95th percentile).
- Bulk validation is implemented (No N+1 query checks for variant/barcode uniqueness; uses `IN` queries and DB constraints).

---

## 11. Audit Logging
Events logged: `PRODUCT_DRAFT_STEP5_UPDATED`. Logs include `tenantId`, `productId`, `actorUserId`, `rowVersion`, and lists of added/changed/removed barcodes and SKUs. Does not log keystrokes or cross-tenant conflict info.

---

## 12. Test Matrix (QA)
- **Functional**: Simple, Variant, Bundle saves.
- **Validation**: Missing SKUs on Save & Continue, Malformed barcodes, Duplicate SKU within request, Duplicate SKU in DB.
- **Primary Barcode**: Set primary, change primary, atomic replacement, rejecting deletion of only primary.
- **Security**: Cross-tenant injection, Missing permissions.
- **Concurrency**: Stale rowVersion, Simultaneous duplicate creation (enforced by DB index).
