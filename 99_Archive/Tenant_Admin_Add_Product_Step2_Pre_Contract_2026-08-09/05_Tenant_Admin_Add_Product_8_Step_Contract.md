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
| Product Image | NO | File/URL | Max 10 images, ≤5MB each, PNG/JPG | Compact Card / Overlay | `mediaAssetId` / `stagedMediaAssets` | `ProductImage.MediaAssetId` | `product_images.media_asset_id` | Compact upload card opens Product Images Manager panel |

> [!IMPORTANT]
> SKU, Barcode, Unit Type, and Variant Templates DO NOT belong to Step 1. They are collected in Steps 3 and 5.

---

## 4. Product Image Upload Contract (Reference Image 1 Alignment)

- **UI Interaction Pattern**: Step 1 displays a compact **Product Image upload card**. Clicking `"Upload Product Image"` opens the **Product Images Manager** panel alongside Step 1 without navigating away or losing form state.
- **Legacy UI Deprecation**: The permanently expanded large black drag-and-drop gallery and multiple main-form empty Add Image tiles (Reference Image 2 style) are **LEGACY UI** and MUST NOT be used for Add Product Step 1.
- **Maximum Image Count**: Up to **10** product images (`TARGET — MAXIMUM 10 PRODUCT IMAGES`).
- **File Validation**: PNG, JPG (image/png, image/jpeg). Max file size **5 MB** per image. Recommended dimensions: 2000x2000 px.
- **Primary Image Rule**: First uploaded image automatically becomes Primary (`is_primary_image = true`). Reordering does not silently change Primary. Deleting Primary auto-designates the next remaining image as Primary.
- **Fresh Wizard Staging Strategy**: Fresh Add Product uploads use staged session uploads (`POST /api/v1/tenant-admin/products/images/stage`, permission `catalog.product_media.manage`) which are transactionally attached to the Product on `Save Draft` or `Save & Continue`.
- **Detailed Specification**: Refer to canonical document [[04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/Tenant_Admin_Product_Image_Manager_Specification]].

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
  - `products.current_setup_step` updated according to the rules below
  - `products.draft_saved_at` updated
  - `products.row_version` incremented
- **Nullable Constraints for DRAFT**: Database permits NULL for `product_type`, `product_code`, `product_slug` while `status = 'DRAFT'`. Mandatory checks are enforced only on **Publish** (Step 8).

### 6.1 `current_setup_step` Canonical Rules

| Operation | Result `current_setup_step` | Notes |
|---|---|---|
| Fresh Step 1 `POST .../draft` (Save Draft) | `1` | New incomplete draft |
| Step 1 Save Draft | `1` | Do **not** advance |
| Step 1 Save & Continue (`AdvanceStep=true`) | `2` | Only after Step 1 validation succeeds |
| Save Draft from Step N (via `PUT .../draft`, `CurrentSetupStep=N`) | `N` | Generic draft must **not** hard-reset to `1` |

### 6.2 Save Draft Product Name Placeholder Policy

When Product Name is empty during **Save Draft**:

- Backend MAY persist the deterministic draft placeholder: **`Untitled Product`**.
- The placeholder is **draft-only**.
- **Save & Continue** MUST reject blank names and MUST reject the literal placeholder `Untitled Product` (case-insensitive).
- An auto-generated placeholder MUST NOT satisfy Step 1 Product Name completion for Save & Continue.

### 6.3 Step 1 Save Draft vs Save & Continue Field Rules

| Field | Save Draft | Save & Continue (Step 1) |
|---|---|---|
| Product Name | Optional (placeholder if blank) | Required (real name; placeholder rejected) |
| Category | Optional (validate if supplied) | Required |
| Brand | Optional | Optional |
| Descriptions / Internal Code | Optional (+ length limits) | Optional (+ length limits) |

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
| Save Draft (create) | `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` | `SaveProductDraftRequestDto` -> `ProductDraftResponseDto` |
| Resume Draft | `/api/v1/tenant-admin/products/{id}/setup` | GET | `catalog.products.view` | `ProductSetupWizardDto` |
| Update Draft Step | `/api/v1/tenant-admin/products/{id}/draft` | PUT | `catalog.products.update` | `UpdateProductDraftStepRequestDto` |
| Stage Image | `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | Multipart -> `StagedImageResponseDto` |
| Final Publish | `/api/v1/tenant-admin/products/{id}/publish` | POST | `catalog.products.publish` | `PublishProductRequestDto` -> `TenantProductDetailDto` |

Canonical Product permissions for this wizard (no `tenant.products.*` fallback):

- `catalog.products.view`
- `catalog.products.create`
- `catalog.products.update`
- `catalog.products.publish`
- `catalog.product_media.manage`
- `catalog.product_channels.manage`

**Superseded (not canonical for Tenant Admin Add Product):**

- `POST /api/v1/tenant/catalog/media/stage`
- `POST /api/v1/media/stage`
- `tenant.products.create` / `tenant.products.update` as wizard authorization

---

## 10. Database Ownership & Traceability

- `products`: `current_setup_step`, `draft_saved_at`, `published_at`, `row_version`, `status`, `desired_publish_status`
- `product_variants`: Variant sellable identities & SKUs
- `product_barcodes`: Barcode strings & UOM links
- `media_assets` + `product_images`: Canonical normalized Product media model (`STAGED` → `ACTIVE` on link)
- `product_channel_visibility`: POS and Online visibility flags
- `product_inventory_settings`: Track stock (`is_stock_tracked`), batch, expiry, serial flags

---

## 11. Validation Matrix

| Trigger | Rules Enforced | Failure Result |
|---|---|---|
| **Save Draft** | Category optional (validate if supplied); Brand optional (validate if supplied); blank Product Name → persist `Untitled Product`; length limits | HTTP 400 with field errors |
| **Save & Continue (Step 1)** | Real Product Name required (placeholder rejected); Category required; Brand optional; then `current_setup_step = 2` | UI stays on Step 1; step not advanced |
| **Publish (Step 8)** | All 8 steps valid; SKU/Barcode unique; Price >= 0; Channels configured | HTTP 400/409 error envelope, transaction rolls back |

---

## 12. Related Documents
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
