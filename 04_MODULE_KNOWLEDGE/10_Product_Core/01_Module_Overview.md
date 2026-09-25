<!-- title: Product Core Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: initial_tracking_step2_numbering_pre_scanner_first -->
<!-- extended: 2026-09-24 — VARIANT Quantity opening stock & outlet allocation documented -->

# Product Core Module Overview

## Purpose

Manage products and variants that can be sold in mobile POS, desktop POS, online store, click and collect, and temporary retail locations.

This module is part of the new OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Core` |
| Module number | 10 |
| Primary users | Tenant Admin, Store Manager, Cashier consumer |
| Frontend surfaces | Product list, Product form, Variant management, POS product grid/search |
| API groups | `/api/v1/tenant-admin/products`, `/api/v1/tenant-admin/products/imports`, `/api/v1/pos/products`, `/api/v1/storefront/products` |

## Main Tables

| Table | Role |
|---|---|
| `products` | Stores parent product records, setup steps, status, and audit parameters. |
| `product_variants` | Stores sellable variant details, SKU, and barcode links. |
| `product_import_batches` | Stores metadata for CSV product import runs. |
| `product_setup_initial_tracking` | **EXISTING** 1:1 draft for Initial Tracking Details (collected on CURRENT Step 3). Migration: `20260824095742_AddProductSetupInitialTracking`. Not scanner-first B1. |
| `product_setup_scan_context` | **IMPLEMENTED IN BACKEND SOURCE** — 1:1 draft for Step 1 Scan Barcode acquisition/bootstrap context. Migration `20260912085454_AddProductSetupScannerIdentifierContext`; local test DB applied; prod/shared apply not claimed. ≠ B8 bootstrap. |

## TARGET FUNCTIONAL OVERVIEW (6-Step Wizard — LOCKED 2026-09-20)

The canonical TARGET Add Product wizard is **exactly 6 steps**:

| Step | Name | Functional Ownership |
|---:|---|---|
| 1 | Scan Barcode | Primary barcode acquisition (pre-draft) |
| 2 | Basic Details | Product name, category, brand, description, images, channel visibility |
| 3 | Product Type & Configuration | Product type selection (SIMPLE / VARIANT); type-specific configuration: SIMPLE → Base Unit + Packs + SKU (reuse Step 1 barcode); VARIANT → Attribute Matrix + Variant SKU/Barcode |
| 4 | Pricing & Tax | Selling price + tax class per product/variant |
| 5 | Product Tracking | **OPTIONAL.** Tracking method selection: Quantity / Batch / Lot / Batch + Expiry. Skip navigates to Step 6. **SIMPLE Quantity:** Opening Stock (>= 0) + Outlet Allocation (if > 0). **VARIANT Quantity:** Per-Variant Opening Stock (>= 0 per Variant) + per-Variant Outlet Allocation (exact per-Variant reconciliation; product-total is informational only). Batch → Initial Batch identity. Batch + Expiry → Initial Batch + Expiry identity. |
| 6 | Review & Create | Full review summary; atomic publish |

**TARGET ownership rules:**
- Step 3 owns: Product Type selection, SIMPLE Base Unit/Packs/SKU, VARIANT Attribute Matrix and Variant SKU/Barcode.
- Step 3 does **NOT** own: Tracking Policy, Initial Batch, Initial Expiry, Serial. These belong to Step 5.
- Step 5 owns: Optional tracking method, Initial Batch/Expiry identity onboarding, Opening Stock (Quantity only).
- Serial tracking is **LEGACY/DEFERRED** — not in active 6-step UI.
- Final SKU/barcode configuration is Step 3 context (SIMPLE reuses Step 1 barcode; VARIANT assigns per variant).
- Only Quantity tracking creates initial stock during Product Setup. Future stock belongs to Inventory Module.

Authority: [[../../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]], [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]].

## Core Business Rules

- Product and variant identifiers are tenant-scoped.
- SKU and barcode uniqueness must be enforced by tenant and variant rules.
- Variants carry sellable identity; price and stock remain separate modules.
- Inactive products cannot be sold through POS or online store.
- POS may cache product reference data, but backend remains final authority.
- Product Setup must not invent stock quantity. Initial Batch/Expiry identity (without quantity) belongs to Step 5 tracking onboarding at publish.
- Step 1 is Scan Barcode (acquisition). Final SKU/barcode configuration belongs to Step 3 (not a standalone global step). See [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].

## CURRENT IMPLEMENTATION SNAPSHOT

> **⚠ TO BE VERIFIED / RECONCILED IN CHUNK 3 BACKEND AUDIT**

The following describes the CURRENT backend implementation reality, which may differ from the 6-step TARGET above. Do NOT treat this as the target business contract.

| Current Backend Fact | Notes |
|---|---|
| `product_setup_initial_tracking` table | **EXISTING** — 1:1 draft store for Step 3 `initialBatchNumber` / `initialExpiryDate` / `initialSerialNumber`. Migration: `20260824095742_AddProductSetupInitialTracking`. Not Product master identity. Not scanner-first B1. |
| `product_setup_scan_context` | **IMPLEMENTED IN BACKEND SOURCE** — 1:1 draft for Step 1 Scan Barcode acquisition/bootstrap context. Migration `20260912085454_AddProductSetupScannerIdentifierContext`; local test DB applied; prod/shared apply not claimed. |
| `current_setup_step` backend values | Backend currently uses values 1–7 for legacy 7-step processor mapping. Scanner-first write mapper translates public 6-step API step numbers to legacy processor constants. Exact reconciliation pending Chunk 3. |
| Initial Tracking collection UI | Was collected at Step 3 (Product Type & Tracking) in legacy implementation. TARGET is Step 5. |
| Step 5 Product Configuration (legacy) | Legacy Step 5 was "Product Configuration" (VARIANT matrix + identifiers). TARGET Step 5 is "Product Tracking". |
| Tracking policy | Lives in `product_inventory_settings`. Current collection step to be reconciled in Chunk 3. |

### Bundle / Kit Core Domain Rules
- Bundle / Kit is defined as one sellable parent Product, one parent SKU, one parent Barcode, one Bundle selling price, and multiple existing Product / exact Variant components.
- Inventory is component-based; there is NO Bundle parent physical stock.
- The Bundle parent MUST have:
  - `products.product_structure = 'BUNDLE'`
  - `product_inventory_settings.is_stock_tracked = false`
  - `product_inventory_settings.requires_batch_tracking = false`
  - `product_inventory_settings.requires_expiry_tracking = false`
  - `product_inventory_settings.requires_serial_tracking = false`
- A Bundle parent MUST NOT have a physical stock ledger (`inventory_balances` directly for the bundle parent is non-existent). Inventory tracking at the parent level is strictly disabled. Component stock deduction does NOT imply parent stock tracking is enabled.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../09_Catalog_Master_Data/01_Module_Overview]]
- [[../14_Pricing_Tax_Management/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]

## Out Of Scope

- Price list calculation
- Tax rule ownership (see [[../14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]; Product owns TaxSetupId + TaxPriceMode only)
- Stock movement ledger
- Customer cart persistence

## Related Files

- [[04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract]]
- [[04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]]
- [[04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] — PRIMARY TARGET AUTHORITY
- [[04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] — Step 5 TARGET authority
- [[04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] — SIMPLE Quantity (Part A) & VARIANT Quantity (Part B) canonical specification (updated 2026-09-24)
- [[04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] — Step 3 TARGET authority
- [[04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification.md]] — Step 6 TARGET authority
- [[02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] — CURRENT TARGET permission authority
- [[13_DECISIONS_AND_CHANGES/SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md]] — SIMPLE Quantity decision record (NEW 2026-09-24)

**Legacy / Historical (do NOT use as current target authority):**
- [[04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md]] — SUPERSEDED as active tracking authority; retained for migration reference
- [[13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]] — historical decision
- [[02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md]] — SUPERSEDED; retained for legacy reference only
