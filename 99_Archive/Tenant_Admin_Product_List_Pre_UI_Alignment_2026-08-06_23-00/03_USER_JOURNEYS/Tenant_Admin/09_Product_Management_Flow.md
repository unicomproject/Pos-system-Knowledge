<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->
<!-- archived_version_backed_up_at: 99_Archive/Product_Management_Pre_Final_Update_2026-08-06_05-17/03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md -->

# Tenant Admin Product Management Flow

> [!IMPORTANT]
> This document is part of the final Tenant Admin Product Management source of truth.

## Purpose

Defines manual product creation via the canonical 8-step wizard, draft saving, resuming incomplete setups, product details overview, editing, duplicating, archiving, restoring, and manual popular product curation.

## Actor

Tenant Admin

## Trigger

Tenant Admin opens product management.

## Preconditions

- Tenant Admin has product management permissions (`catalog.products.*`).
- Categories and brands are seeded or editable.

## Main Flow (Wizard Steps)

| Step | Action / Step name | System Behavior |
|---:|---|---|
| 1 | **Step 1 — Basic Details** | User inputs Name, Category (mandatory), Brand, Short Name, Internal Code, Description, and Images (Max 5MB per file). Primary Image replacement is transactional. |
| 2 | **Step 2 — Product Type & Tracking** | User selects Product Type (SIMPLE, VARIANT, BUNDLE) and Tracking. ON enables Batch, Expiry, Serial combinations. OFF disables them. Changing type prompts a confirmation warning. |
| 3 | **Step 3 — Units & Pack Conversion** | Configures Single Unit or Multiple Units with conversion factors. Stored in Base Unit. Skips for Bundles or when inventory tracking is OFF. |
| 4 | **Step 4 — Product Configuration** | Auto-skips for Simple Products. Generates Cartesian options for Variants. Controls Component candidate search and availability calculation for Bundles. |
| 5 | **Step 5 — Barcode & SKU** | User sets SKU and Barcodes. System enforces uniqueness tenant-wide and displays the conflict details drawer on duplicate match. |
| 6 | **Step 6 — Pricing & Tax** | Inputs Cost Price, Standard Selling Price, promotional pricing, tax classes. Calculates margins using standard formulas. Supports overrides. |
| 7 | **Step 7 — Channel Visibility** | Sets global and outlet-specific availability for POS and Online Store (Click & Collect is a fulfillment option). |
| 8 | **Step 8 — Review & Create** | Displays verification status of all sections. User clicks Create, triggering atomic publish, idempotency checks, and audit logging. |

## Post-Create Journey

Once created, user is redirected to **Product Details Overview**.
- **Overview**: Displays Product Info, Selling/Cost Prices, Channel Visibility, Stock Summary, and Outlets.
- **Audit**: Immutabilized Audit logs tracking all field mutations.
- **Actions**: Edit, Duplicate (resets identifiers and quantities, opens as DRAFT), and Archive.

## Status Lifecycles

- **Product Lifecycle**: `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`. (Replaces legacy `DELETED` status).
- **Stock Status**: `NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` (calculated server-side).

## Product List View States

- **First-Use Empty State**: Triggered when `catalogTotalCount = 0` and no filters are active. Renders first-use empty illustration with "Add Product" and "Import CSV" buttons.
- **Filtered Empty State**: Triggered when `catalogTotalCount > 0` but `totalCount = 0` due to active filters or search queries. Displays "No matching products found" and a "Reset Filters" button.
- **Populated List State**: Triggered when `totalCount > 0`. Displays a paginated product grid showing Product name/image, SKU, Category, Variant count, Price (or Range), Stock Quantity, Product Status, Stock Status, and Actions (View/Edit/Archive).

## Product Import Journey

- **Workflow**:
  1. Download CSV template.
  2. Upload CSV file (requires size/hash/mime-type validations).
  3. Validate rows (database & file duplicates check).
  4. User commits valid rows. Invalid rows remain in failure log.
  5. Generate Error CSV for download.
  6. Emit audit events.

## Access and Security Rules

- Enforces tenant-isolation context server-side.
- Hiding UI elements is for UX assistance; backend token/permission checks are mandatory.
- All pricing and stock validations are calculated on the backend.

## Related Files

- [[04_Tenant_Admin_Product_List_And_Import_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/15_Product_Import_Batches_And_Rows]]
- [[../../10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_And_Import_Test_Cases]]


