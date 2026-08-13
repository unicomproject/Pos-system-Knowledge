<!-- title: Tenant Admin Add Product 8-Step Implementation Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-08 -->

# Tenant Admin Add Product 8-Step Implementation Contract

## 1. Executive Summary & Scope

This contract defines the authoritative specification for the **Tenant Admin Add Product / Product Setup** feature in OneVerz POS Unified Commerce. It replaces the legacy 4-step Product Add UI with a **FIXED 8-STEP WIZARD** aligned with **Reference UI 2**.

This document serves as the single source of truth for Frontend (Flutter), Backend (.NET Web API), Database Schema, Access Control, and QA teams.

---

## 2. Fixed 8-Step Wizard Lifecycle

The Add Product experience is structured into exactly 8 sequential steps:

1. **Step 1 — Basic Details** (General info, mandatory Category, optional Brand, Product Image upload, Status & Options quick toggles)
2. **Step 2 — Product Type & Tracking** (`SIMPLE`, `VARIANT`, `BUNDLE` selection and tracking combinations)
3. **Step 3 — Units & Pack Conversion** (Base UOM, purchase/sales UOM, and conversion factors)
4. **Step 4 — Product Configuration** (Simple: Not Applicable auto-skip; Variant: Variant Matrix & Options; Bundle: Component search & assembly)
5. **Step 5 — Barcode & SKU** (SKU, barcode type, UOM mapping, uniqueness rules)
6. **Step 6 — Pricing & Tax** (Cost price, standard selling price, tax classes, price lists, outlet overrides)
7. **Step 7 — Channel Visibility** (In-Store POS, Online Store matrices)
8. **Step 8 — Review & Create** (Verification summary across all sections, inline edit links, final atomic publish)

### Step 4 Canonical Naming Rule
- Canonical step title is **"Product Configuration"**.
- Do NOT label Step 4 as "Variants Configuration" globally.
- Simple Products mark Step 4 as **Not Applicable** and auto-skip to Step 5.
- Variant Products render Variant Matrix configuration inside Step 4.
- Bundle Products render Kit Component configuration inside Step 4.

---

## 3. Step 1 — Basic Details Contract (Reference UI 2 Alignment)

### Form Fields & Traceability Matrix

| UI Field Label | Mandatory | Data Type | Validation Rules | Default Value | API Request Property | Entity Property | Database Column | Notes |
|---|---|---|---|---|---|---|---|---|
| Product Name | YES | String | Max 200 chars, Non-empty | None | `productName` | `Product.ProductName` | `products.product_name` | Mandatory |
| Short Name / Internal Code | NO | String | Max 80 chars, Alphanumeric/dash | Auto-slug | `shortName` / `productCode` | `Product.ProductCode` | `products.product_code` | Auto-generated if blank upon Save |
| Category | YES | UUID | Must exist in `categories` | None | `categoryId` | `Product.CategoryId` | `product_categories.category_id` | Primary category map |
| Brand | NO (Optional) | UUID | Must exist in `brands` | NULL | `brandId` | `Product.BrandId` | `products.brand_id` | **Optional** |
| Short Description | NO | String | Max 500 chars | NULL | `shortDescription` | `Product.ShortDescription` | `products.short_description` | Text |
| Long Description | NO | String | Max 4000 chars | NULL | `longDescription` | `Product.LongDescription` | `products.long_description` | Rich text / markdown |
| Product Image | NO | File/URL | Max 5MB, JPG/PNG/WEBP | Default Icon | `imageStorageKey` | `ProductImage.StorageKey` | `product_images.image_storage_key` | Image upload card |

> [!IMPORTANT]
> SKU, Barcode, Unit Type, and Variant Templates DO NOT belong to Step 1. They are collected in Steps 3 and 5.

---

## 4. Product Image Upload Contract

- **State Management**: Image state is held within transient wizard state during Step 1.
- **Upload Timing**: Staged via multipart POST `/api/v1/tenant-admin/products/images/stage` or uploaded directly on Save Draft.
- **File Validation**: JPG, JPEG, PNG, WEBP. Max size **5 MB**. Recommended dimensions: 2000x2000 px.
- **Primary Image**: First uploaded image defaults to `is_primary_image = true`.
- **Replacement Safety**: Old image storage key is retained until the API mutation succeeds. On error, old image is restored.

---

## 5. Status & Options Card & Cross-Step Synchronization

The right-side **Status & Options** card in Step 1 exposes 4 quick toggles that represent canonical state synchronized across the wizard:

1. **Active Status**: Represents desired state AFTER publication (`desired_publish_status` = `ACTIVE` / `INACTIVE`). During setup, DB `products.status` remains `DRAFT`.
2. **POS Sellable**: Synchronized with **Step 7 In-Store POS** channel visibility (`is_visible` & `is_orderable`).
3. **Track Inventory**: Synchronized with **Step 2 Inventory Tracking** toggle (`track_inventory`).
4. **Allow Online Sale**: Synchronized with **Step 7 Online Store** channel visibility (`is_visible` & `is_orderable`).

---

## 6. Save Draft & Resume Architecture

- **Save Draft Action**: User can save draft at any step (e.g. Step 1).
- **Backend Persistence**:
  - `products.status` = `DRAFT`
  - `products.current_setup_step` updated
  - `products.draft_saved_at` updated
  - `products.row_version` incremented
- **Nullable Constraints for DRAFT**: Database permits NULL for `product_type`, `product_code`, `product_slug` while `status = 'DRAFT'`. Mandatory checks are enforced only on **Publish** (Step 8).

---

## 7. Product Summary Card Rules

- **Fresh Add Product**: Summary card is hidden before the first draft persistence.
- **After First Save Draft / Resume / Edit**: Summary card is displayed on the top right showing:
  - Setup Status (`DRAFT` / `ACTIVE`)
  - Cover Image Thumbnail
  - Product Name
  - Primary Category & Brand
  - SKU (when assigned)
  - Current Step Progress Indicator

---

## 8. Cross-Step Business Rules (Steps 2 - 8)

### Step 2 — Tracking Matrix Rules
- `Inventory OFF` -> Batch OFF, Expiry OFF, Serial OFF (locked).
- `Expiry ON` -> Requires Batch ON (locked).
- `Serial ON` -> Batch OFF, Expiry OFF. Batch + Serial combination is NOT allowed in Release 1.

### Step 3 — UOM & Conversions
- Base Unit maintains single stock ledger. Selling/Purchase UOMs convert via `conversion_factor`.

### Step 4 — Configuration
- `SIMPLE`: Auto-skips to Step 5.
- `VARIANT`: Generates Cartesian product of selected option values.
- `BUNDLE`: Selects component variants and fixed component quantities.

### Step 5 — Identifiers
- SKU & Barcode uniqueness enforced tenant-wide.

### Step 6 — Pricing & Tax
- Standard Selling Price, Cost Price, Tax Class assignment, Margin calculation.

### Step 7 — Channel Visibility
- In-Store POS and Online Store visibility matrices.

### Step 8 — Review & Publish
- Performs full server-side validation graph. Atomically updates `status` to `ACTIVE` or `INACTIVE`, sets `published_at`, and returns final Product DTO.

---

## 9. API Contract Summary

| Operation | Endpoint | Method | Permission | DTO / Contract |
|---|---|---|---|---|
| Create Options | `/api/v1/tenant-admin/products/create-options` | GET | `catalog.products.create` | `TenantProductCreateOptionsDto` |
| Save Draft | `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` | `SaveProductDraftRequestDto` -> `ProductDraftResponseDto` |
| Resume Draft | `/api/v1/tenant-admin/products/{id}/setup` | GET | `catalog.products.view` | `ProductSetupWizardDto` |
| Update Draft Step | `/api/v1/tenant-admin/products/{id}/draft` | PUT | `catalog.products.update` | `UpdateProductDraftStepRequestDto` |
| Stage Image | `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | Multipart -> `StagedImageResponseDto` |
| Final Publish | `/api/v1/tenant-admin/products/{id}/publish` | POST | `catalog.products.publish` | `PublishProductRequestDto` -> `TenantProductDetailDto` |

---

## 10. Database Ownership & Traceability

- `products`: `current_setup_step`, `draft_saved_at`, `published_at`, `row_version`, `status`
- `product_variants`: Variant sellable identities & SKUs
- `product_barcodes`: Barcode strings & UOM links
- `product_images`: Storage keys, primary flag, channel link
- `product_channel_visibility`: POS and Online visibility flags
- `product_inventory_settings`: Track stock, batch, expiry, serial flags

---

## 11. Validation Matrix

| Trigger | Rules Enforced | Failure Result |
|---|---|---|
| **Save Draft** | Product Name non-empty (or default placeholder generated if empty), valid Category UUID if supplied | HTTP 400 with field errors |
| **Save & Continue (Step N)** | Step N mandatory fields must pass validation | UI displays step error, stays on Step N |
| **Publish (Step 8)** | All 8 steps valid; SKU/Barcode unique; Price >= 0; Channels configured | HTTP 400/409 error envelope, transaction rolls back |

---

## 12. Related Documents
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
