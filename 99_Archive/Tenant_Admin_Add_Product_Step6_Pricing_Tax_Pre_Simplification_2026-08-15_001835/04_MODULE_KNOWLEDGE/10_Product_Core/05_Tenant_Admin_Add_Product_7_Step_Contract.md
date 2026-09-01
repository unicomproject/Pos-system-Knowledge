<!-- title: Tenant Admin Add Product 7-Step Implementation Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-14 -->

# Tenant Admin Add Product 7-Step Implementation Contract

## 1. Executive Summary & Scope

This contract defines the authoritative specification for the **Tenant Admin Add Product / Product Setup** feature in OneVerz POS Unified Commerce. It replaces the legacy 4-step Product Add UI with a **FIXED 7-STEP WIZARD** aligned with **Reference UI 2**.

This document serves as the single source of truth for Frontend (Flutter), Backend (.NET Web API), Database Schema, Access Control, and QA teams.

---

## 2. Fixed 7-Step Wizard Lifecycle

The Add Product experience is structured into exactly 7 sequential steps:

1. **Step 1 — Basic Details** (General info, mandatory Category, optional Brand, Product Image upload, Channel Availability toggles)
2. **Step 2 — Product Type & Tracking** (`SIMPLE`, `VARIANT`, `BUNDLE` selection and tracking combinations)
3. **Step 3 — Units & Pack Conversion** (Base UOM, purchase/sales UOM, and conversion factors)
4. **Step 4 — Product Configuration** (Simple: Not Applicable auto-skip; Variant: Variant Matrix & Options; Bundle: Component search & assembly)
5. **Step 5 — Barcode & SKU** (SKU, barcode type, UOM mapping, uniqueness rules)
6. **Step 6 — Pricing & Tax** (Cost price, standard selling price, tax classes, price lists, outlet overrides)
7. **Step 7 — Review & Create** (Verification summary across all sections, inline edit links, final atomic publish)

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
| In-Store POS | NO | Boolean | - | True | `posSellable` | `Product.IsSellable` | `products.is_sellable` | Channel Availability toggle |
| Online Store | NO | Boolean | - | False | `allowOnlineSale` | `Product.AllowOnlineSale` | - | Channel Availability toggle |

> [!IMPORTANT]
> SKU, Barcode, Unit Type, and Variant Templates DO NOT belong to Step 1. They are collected in Steps 3 and 5.

---

## 4. Product Image Upload Contract (Reference Image 1 Alignment)

- **UI Interaction Pattern**: Step 1 displays a compact **Product Image upload card**. Clicking `"Upload Product Image"` or `"Click to Upload Product Images"` opens native file browse dialogs.
- **Drag & Drop Removal**: Drag & Drop functionality and related UI hints/handles have been completely removed. Image upload relies exclusively on standard file selection.
- **Legacy UI Deprecation**: The permanently expanded large black gallery and multiple main-form empty Add Image tiles (Reference Image 2 style) are **LEGACY UI** and MUST NOT be used for Add Product Step 1.
- **Maximum Image Count**: Up to **10** product images (`TARGET — MAXIMUM 10 PRODUCT IMAGES`).
- **File Validation**: PNG, JPG (image/png, image/jpeg). Max file size **5 MB** per image. Recommended dimensions: 2000x2000 px.
- **Primary Image Rule**: First uploaded image automatically becomes Primary (`is_primary_image = true`). Reordering does not silently change Primary. Deleting Primary auto-designates the next remaining image as Primary.
- **Fresh Wizard Staging Strategy**: Fresh Add Product uploads use staged session uploads (`POST /api/v1/tenant-admin/products/images/stage`, permission `catalog.product_media.manage`) which are transactionally attached to the Product on `Save Draft` or `Save & Continue`.
- **Detailed Specification**: Refer to canonical document [[04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/Tenant_Admin_Product_Image_Manager_Specification]].

---

## 5. Channel Availability State Synchronization

The **Channel Availability** section in Step 1 exposes 2 toggles that represent canonical state synchronized across the wizard:

1. **In-Store POS**: Represents POS sellability (`posSellable`).
2. **Online Store**: Represents E-commerce availability (`allowOnlineSale`).

These fields replace the legacy "Status & Options" card and the old "Step 7 Channel Visibility" wizard step.
The `Track Inventory` toggle has been removed from Step 1 and exists ONLY in Step 2.

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
| Final Wizard Publication | `7` | Final stage is now Step 7 |

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

### 6.4 Strict DRY Shared Action & Save Pipeline Architecture

Both Backend (.NET) and Frontend (Flutter) MUST follow a single, unified reusable architecture for wizard actions and draft persistence.

#### A. BACKEND — ONE COMMON SAVE PIPELINE
- **No Step-Specific Save Methods**: The backend MUST NOT implement separate repository save methods such as `SaveStep1DraftAsync`, `SaveStep2DraftAsync`, `SaveStep3DraftAsync`, etc.
- **Unified Repository Save Pipeline**: All wizard step save requests are executed through a single repository pipeline method: `ITenantAdminProductRepository.SaveProductDraftAsync(tenantId, userId, command, now, ct)`.
- **Unified Save Command & Result**: All wizard save requests construct `SaveProductDraftCommand` (carrying `ProductId`, `CurrentSetupStep`, `AdvanceStep`, `ExpectedRowVersion`, and step payload data) and return `SaveProductDraftResult`.
- **Centralized Pipeline Enforcement**: Access policy evaluation (`ProductWizardAccessPolicy`), feature entitlement (`product_catalog`), concurrency validation (`expectedRowVersion`), entity creation/loading, category mapping, channel visibility, inventory settings, media asset linking, transactional audit logging (`AuditLog`), EF `SaveChangesAsync`, and DTO projection exist ONCE in the shared pipeline.
- **Business Processors**: Step-specific rules are executed by dedicated step processors (`IProductWizardStepProcessor` implementations like `Step1WizardProcessor`, `Step2WizardProcessor`) selected dynamically based on `CurrentSetupStep`.

#### B. FRONTEND (FLUTTER) — ONE SHARED ACTION FOOTER & CONTROLLER
- **Single Actions Footer Widget**: `ProductWizardActionsFooter` is shared across all 8 wizard steps. Creating independent button widgets per step (`Step1ContinueButton`, `Step2ContinueButton`, etc.) is strictly FORBIDDEN.
- **Single Controller Action**: `ProductWizardController.saveDraft()` handles saving for every step. The controller inspects `currentStep` and constructs the payload.
- **Save Draft vs Save & Continue**: `saveDraft()` sends `advanceStep: false` (persists state without step increment), while `saveAndContinue()` sends `advanceStep: true` (validates completion and advances `currentSetupStep` to `N + 1`).

---

## 7. Product Summary Card Rules

- **Fresh Add Product**: Summary card is hidden before the first draft persistence.
- **After First Save Draft / Resume / Edit**: Summary card is displayed on the top right showing:
  - Setup Status (`DRAFT` / `ACTIVE`)
  - Cover Image Thumbnail
  - Product Name (or placeholder `Untitled Product`)
  - Internal Product Code (or `Product Code: Pending`)
  - Product Structure Badge (`SIMPLE`, `VARIANT`, `BUNDLE`)
  - Primary Category & Brand
  - Inventory Tracking Badge (`Tracked` / `Not Tracked`)
  - Step Progress Indicator (e.g., "Step 2 of 7 Completed (28%)")
- **SKU Note**: SKU is assigned in Step 5. Product Summary displays `"SKU: Step 5"` or placeholder prior to Step 5.

---

## 8. Step 2 — Product Type & Tracking Setup Detailed Contract

### 8.1 Target Functional Overview
Step 2 configures the product structure classification and inventory tracking rules for the product.

- **Title**: Product Type & Tracking Setup
- **Subtitle**: Choose the product type and how this product should be tracked.
- **Product Type Cards (3 Cards)**:
  1. **Simple Product**: Single item with one SKU. No variants or components.
  2. **Variant Product**: Items with multiple variants such as size, color, material.
  3. **Bundle / Kit**: Pre-packaged items sold together as a bundle.
- **Tracking & Stock Rules (4 Toggles)**:
  1. **Track Inventory** (Master stock toggle)
  2. **Batch / Lot Tracking**
  3. **Expiry Tracking**
  4. **Serial Number Tracking**
- **Footer Actions**: `Back`, `Save Draft`, `Skip` (Disabled/Hidden — Step 2 is NON-SKIPPABLE), `Save & Continue`.

---

### 8.2 Product Type Domain Mapping (Canonical Rule)

The 3 UI options ("Simple Product", "Variant Product", "Bundle / Kit") map canonically to **Product Structure**, NOT `products.product_type`.

| UI Option Card | API Property (`productStructure`) | Domain Entity Enum (`ProductStructure`) | Database Column (`products.product_structure`) | Description |
|---|---|---|---|---|
| **Simple Product** | `"SIMPLE"` | `ProductStructure.SIMPLE` | `'SIMPLE'` | Single item with one SKU. No variants or components. |
| **Variant Product** | `"VARIANT"` | `ProductStructure.VARIANT` | `'VARIANT'` | Items with multiple variants (size, color, etc.). |
| **Bundle / Kit** | `"BUNDLE"` | `ProductStructure.BUNDLE` | `'BUNDLE'` | Assembly referencing component products/variants. |

> [!IMPORTANT]
> **Product Type vs Product Structure**:
> - `products.product_structure`: Represents physical catalog structure (`SIMPLE`, `VARIANT`, `BUNDLE`).
> - `products.product_type`: Represents merchandise type classification (e.g. `STANDARD`, `DIGITAL`, `SERVICE`). During wizard setup, `products.product_type` defaults to `'STANDARD'`.
> - The Second Brain NEVER uses "Product Type = SIMPLE/VARIANT/BUNDLE" when referring to database schema or backend domain models.

---

### 8.3 Step 2 Implementation Traceability Matrix

| UI Field / Control | Flutter State / DTO | API Property | Backend Request DTO | Domain Entity & Property | Database Table | Database Column | Validation Rules | Permission Code | Audit Event Field |
|---|---|---|---|---|---|---|---|---|---|
| **Product Structure** | `productStructure` | `productStructure` | `UpdateProductDraftStepRequestDto.ProductStructure` | `Product.ProductStructure` | `products` | `product_structure` | Required; Enum `SIMPLE`, `VARIANT`, `BUNDLE` | Initial Draft: `catalog.products.create`<br>Edit: `catalog.products.update` | `newProductStructure` |
| **Track Inventory** | `trackInventory` | `trackInventory` | `UpdateProductDraftStepRequestDto.TrackInventory` | `ProductInventorySetting.IsStockTracked` | `product_inventory_settings` | `is_stock_tracked` | Boolean; Default `true` (`ON`) | Same as above | `newTrackInventory` |
| **Batch / Lot Tracking** | `batchTracking` | `batchTracking` | `UpdateProductDraftStepRequestDto.BatchTracking` | `ProductInventorySetting.RequiresBatchTracking` | `product_inventory_settings` | `requires_batch_tracking` | Requires `TrackInventory = true`; Mutually exclusive with Serial | Same as above | `newBatchTracking` |
| **Expiry Tracking** | `expiryTracking` | `expiryTracking` | `UpdateProductDraftStepRequestDto.ExpiryTracking` | `ProductInventorySetting.RequiresExpiryTracking` | `product_inventory_settings` | `requires_expiry_tracking` | Requires `TrackInventory = true` AND `BatchTracking = true`; Mutually exclusive with Serial | Same as above | `newExpiryTracking` |
| **Serial Number Tracking** | `serialTracking` | `serialTracking` | `UpdateProductDraftStepRequestDto.SerialTracking` | `ProductInventorySetting.RequiresSerialTracking` | `product_inventory_settings` | `requires_serial_tracking` | Requires `TrackInventory = true`; Mutually exclusive with Batch and Expiry | Same as above | `newSerialTracking` |
| **Current Setup Step** | `currentSetupStep` | `currentSetupStep` | `UpdateProductDraftStepRequestDto.CurrentSetupStep` | `Product.CurrentSetupStep` | `products` | `current_setup_step` | 1 to 7; Set to 3 on `Save & Continue` | Same as above | N/A |
| **Draft Saved At** | N/A | `draftSavedAt` | N/A | `Product.DraftSavedAt` | `products` | `draft_saved_at` | Server UTC timestamp | Same as above | `timestamp` |
| **Row Version** | `rowVersion` | `expectedRowVersion` | `UpdateProductDraftStepRequestDto.ExpectedRowVersion` | `Product.RowVersion` | `products` | `row_version` | Optimistic concurrency token | Same as above | `rowVersion` |
| **Updated By** | N/A | N/A | N/A | `Product.UpdatedByTenantUserId` | `products` | `updated_by_tenant_user_id` | Server authenticated User ID | Same as above | `actorUserId` |
| **Updated At** | N/A | N/A | N/A | `Product.UpdatedAt` | `products` | `updated_at` | Server UTC timestamp | Same as above | `timestamp` |

---

### 8.4 Canonical Default State & Step 1 Synchronization

**Step 2 Canonical Default State**:
- `Product Structure`: `SIMPLE`
- `Track Inventory`: `true` (`ON`)
- `Batch / Lot Tracking`: `false` (`OFF`)
- `Expiry Tracking`: `false` (`OFF`)
- `Serial Number Tracking`: `false` (`OFF`)

**Synchronization with Step 1**:
- The `Track Inventory` toggle has been completely removed from Step 1.
- Step 2 is now the sole source of truth for the inventory tracking toggle during setup.

---

### 8.5 Full Tracking Business Rule Matrix

- **Rule 1 (Inventory Off Lock)**: If `Track Inventory = OFF` (`false`):
  - `Batch Tracking` MUST be set to `OFF` (`false`).
  - `Expiry Tracking` MUST be set to `OFF` (`false`).
  - `Serial Tracking` MUST be set to `OFF` (`false`).
  - UI controls for Batch, Expiry, and Serial tracking MUST become disabled/locked.
- **Rule 2 (Batch Requirement)**: `Batch Tracking = ON` requires `Track Inventory = ON`.
- **Rule 3 (Expiry Dependency)**: `Expiry Tracking = ON` requires `Track Inventory = ON` AND `Batch Tracking = ON`. Expiry tracking cannot be enabled independently without Batch tracking.
- **Rule 4 (Serial Requirement)**: `Serial Tracking = ON` requires `Track Inventory = ON`.
- **Rule 5 (Serial Mutual Exclusivity)**: In Release 1, `Serial Tracking` is **mutually exclusive** with both `Batch Tracking` and `Expiry Tracking`.
  - Serial + Batch $\rightarrow$ **FORBIDDEN**.
  - Serial + Expiry $\rightarrow$ **FORBIDDEN**.
- **Rule 6 (Serial Precedence Atomic Reset)**: If `Serial Tracking` is toggled `ON`:
  - `Batch Tracking` MUST automatically be forced to `OFF` (`false`).
  - `Expiry Tracking` MUST automatically be forced to `OFF` (`false`).
- **Rule 7 (Atomic Clearing on Inventory Off)**: If `Track Inventory` changes from `ON` to `OFF`, the system MUST atomically clear `Batch Tracking`, `Expiry Tracking`, and `Serial Tracking` to `false` before persisting. Invalid hidden combinations MUST NEVER be stored in the database.

---

### 8.6 Tracking Truth Table

| Track Inventory | Batch Tracking | Expiry Tracking | Serial Tracking | Evaluation Result | Backend Enforcement Action |
|---|---|---|---|---|---|
| **OFF** | **OFF** | **OFF** | **OFF** | **VALID** | Allowed and persisted. |
| **OFF** | **ON** | OFF | OFF | **INVALID** | Auto-normalize to all OFF or reject HTTP 400 (`TRACK_INVENTORY_REQUIRED_FOR_BATCH`). |
| **OFF** | OFF | **ON** | OFF | **INVALID** | Auto-normalize to all OFF or reject HTTP 400 (`TRACK_INVENTORY_REQUIRED_FOR_EXPIRY`). |
| **OFF** | OFF | OFF | **ON** | **INVALID** | Auto-normalize to all OFF or reject HTTP 400 (`TRACK_INVENTORY_REQUIRED_FOR_SERIAL`). |
| **ON** | **OFF** | **OFF** | **OFF** | **VALID** | Standard stock quantity tracking only. |
| **ON** | **ON** | **OFF** | **OFF** | **VALID** | Stock + Batch tracking. |
| **ON** | **ON** | **ON** | **OFF** | **VALID** | Stock + Batch + Expiry tracking. |
| **ON** | **OFF** | **OFF** | **ON** | **VALID** | Stock + Serial number tracking. |
| **ON** | **OFF** | **ON** | OFF | **INVALID** | Reject HTTP 400 (`BATCH_REQUIRED_FOR_EXPIRY`). |
| **ON** | **ON** | OFF | **ON** | **INVALID** | Reject HTTP 400 (`SERIAL_AND_BATCH_MUTUALLY_EXCLUSIVE`). |
| **ON** | **OFF** | **ON** | **ON** | **INVALID** | Reject HTTP 400 (`SERIAL_AND_EXPIRY_MUTUALLY_EXCLUSIVE`). |
| **ON** | **ON** | **ON** | **ON** | **INVALID** | Reject HTTP 400 (`SERIAL_AND_BATCH_MUTUALLY_EXCLUSIVE`). |

> [!NOTE]
> Client-side UI gating does NOT replace server-side validation. The backend API is the final authority and MUST re-evaluate this truth table on every draft update.

---

### 8.7 Footer Actions & Navigation Logic

#### BACK
- Navigates from Step 2 to Step 1.
- Preserves current local state in Flutter form state.
- Does NOT implicitly publish or commit unvalidated server changes.
- Row version remains unchanged on client until next explicit save.

#### SAVE DRAFT
- Validates Step 2 field syntax and tracking combination rules.
- Persists Step 2 values to the database.
- Keeps client on Step 2 (does NOT advance step).
- Retains lifecycle `status = 'DRAFT'`.
- Updates `draft_saved_at`, `updated_at`, `updated_by_tenant_user_id`.
- Increments `row_version` and returns the latest `rowVersion` in response.
- `current_setup_step` remains unchanged (or updated to max reached step if higher).

#### SAVE & CONTINUE
1. Validates Step 2 rules completely against the truth table.
2. Normalizes dependent tracking fields.
3. Persists Step 2 values atomically in a PostgreSQL transaction.
4. Updates `current_setup_step` from `2` to `3` (via request flag `advanceStep: true`).
5. Increments `row_version`.
6. Returns HTTP 200 OK with authoritative persisted draft state and new `rowVersion`.
7. Client navigates to Step 3 ONLY after receiving server success response.

#### SKIP
- **Canonical Decision**: Step 2 is **NON-SKIPPABLE**.
- The `Skip` footer button MUST be hidden or disabled on Step 2 in the UI.
- Product Structure selection and inventory tracking configuration require explicit user confirmation before advancing to Step 3.

---

### 8.8 Step 2 API Contract

#### Update Draft Step 2 Endpoint
`PUT /api/v1/tenant-admin/products/{productId}/draft`

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body (`UpdateProductDraftStepRequestDto`)**:
```json
{
  "currentSetupStep": 2,
  "productStructure": "VARIANT",
  "trackInventory": true,
  "batchTracking": true,
  "expiryTracking": false,
  "serialTracking": false,
  "advanceStep": true,
  "expectedRowVersion": 4
}
```

**Field Specifications**:
- `currentSetupStep` (int, required): Current step being submitted (`2`).
- `productStructure` (string, required): Allowed enum values: `"SIMPLE"`, `"VARIANT"`, `"BUNDLE"`.
- `trackInventory` (boolean, required): Default `true`.
- `batchTracking` (boolean, required): Default `false`.
- `expiryTracking` (boolean, required): Default `false`.
- `serialTracking` (boolean, required): Default `false`.
- `advanceStep` (boolean, required): `false` for Save Draft; `true` for Save & Continue.
- `expectedRowVersion` (long, required): Optimistic concurrency token.

**Response Body (`ProductDraftResponseDto` — HTTP 200 OK)**:
```json
{
  "productId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "DRAFT",
  "productName": "Wireless Headphones",
  "productStructure": "VARIANT",
  "trackInventory": true,
  "batchTracking": true,
  "expiryTracking": false,
  "serialTracking": false,
  "currentSetupStep": 3,
  "draftSavedAt": "2026-08-09T01:49:07Z",
  "rowVersion": 5
}
```

#### Get Wizard Setup State (Resume Endpoint)
`GET /api/v1/tenant-admin/products/{productId}/setup`

**Response Body (`ProductSetupWizardDto` — HTTP 200 OK)**:
Exposes all persisted Step 1 and Step 2 state (including `productStructure`, `trackInventory`, `batchTracking`, `expiryTracking`, `serialTracking`, `currentSetupStep`, `rowVersion`, category/brand metadata) to restore the wizard.

---

### 8.9 Step-Aware Backend Architecture & Atomic Persistence

- Step 2 processing MUST NOT be routed through Step 1-only commands or generic unvalidated updaters.
- Backend architecture defines dedicated step processing:
  - Command: `SaveStep2DraftCommand`
  - Validators: `ValidateStep2Draft`, `ValidateStep2SaveAndContinue`
  - Service/Repo Method: `SaveStep2DraftAsync`
- **Atomic Database Transaction Scope**:
  Updating Step 2 executes inside a single PostgreSQL transaction:
  ```sql
  BEGIN TRANSACTION;
  -- 1. Validate tenant ownership & lock product row FOR UPDATE
  -- 2. Verify expected row version (Product.row_version == expectedRowVersion)
  -- 3. Update products table: product_structure, current_setup_step, draft_saved_at, updated_at, updated_by_tenant_user_id, row_version = row_version + 1
  -- 4. Upsert product_inventory_settings: is_stock_tracked, requires_batch_tracking, requires_expiry_tracking, requires_serial_tracking, updated_at, updated_by_tenant_user_id
  -- 5. Write audit log entry (PRODUCT_DRAFT_STEP2_UPDATED)
  COMMIT TRANSACTION;
  ```
  *On any error, the entire transaction rolls back completely.*

---

### 8.10 Database Invariants & Constraints

In `product_inventory_settings`, database integrity is protected by:
```sql
-- Expiry requires Batch
CHECK (requires_expiry_tracking = FALSE OR requires_batch_tracking = TRUE),

-- Batch requires Stock Tracking
CHECK (requires_batch_tracking = FALSE OR is_stock_tracked = TRUE),

-- Serial requires Stock Tracking
CHECK (requires_serial_tracking = FALSE OR is_stock_tracked = TRUE),

-- RELEASE 1 INVARIANT: Serial cannot coexist with Batch or Expiry
CHECK (
  NOT (
    requires_serial_tracking = TRUE AND 
    (requires_batch_tracking = TRUE OR requires_expiry_tracking = TRUE)
  )
)
```

---

### 8.11 Inventory UOM Cross-Step Dependency Resolution

- `product_inventory_settings.inventory_uom_id` is mandatory (`NOT NULL` in DB schema).
- **Draft Creation Strategy**:
  - When Step 1/2 saves a new product draft before Step 3 (where UOMs are explicitly chosen), the backend resolves the tenant's default system base UOM (e.g. `PIECE` or `EACH` from `unit_of_measures` table where `uom_code = 'PIECE'`).
  - This system default UOM is set silently in `product_inventory_settings.inventory_uom_id`.
  - When the user completes Step 3 (Units & Pack Conversion), the selected Stock Counting UOM overwrites `inventory_uom_id`.
  - This internal fallback default is NOT exposed as an explicit user selection in Step 2 UI.

---

### 8.12 Draft Nullability & Default Fields

- `products.product_code`: Auto-slugged draft code generated on Step 1 (e.g., `PROD-DRAFT-XXXXX`).
- `products.product_slug`: Auto-generated slug.
- `products.product_type`: Defaults to `'STANDARD'` for merchandise items.
- `products.product_structure`: Defaults to `'SIMPLE'` until changed in Step 2.
- All 4 columns retain valid `NOT NULL` strings in PostgreSQL during draft states.

---

### 8.13 Product Structure Change Rules (Destructive Transitions)

When a user navigates back to Step 2 and changes `productStructure` after downstream data exists (from Steps 4–7):

| Transition | Impact on Downstream Data | Invalidation / Cleanup Action | User Prompt Required |
|---|---|---|---|
| **VARIANT $\rightarrow$ SIMPLE** | Destroys Variant Matrix, Option Values, Variant SKUs/Prices | Invalidates Step 4 Variant Options & Matrix. Archives/deletes draft `product_variants` rows (except default). Resets Step 4 to N/A. Forces revalidation of Steps 5 & 6. | **YES** ("Changing to Simple Product will remove all configured variants and option matrix. Proceed?") |
| **BUNDLE $\rightarrow$ SIMPLE** | Destroys Kit Component mappings | Invalidates Step 4 Kit Assembly. Clears `combo_components` records. Resets Step 4 to N/A. | **YES** ("Changing to Simple Product will remove all bundle component selections. Proceed?") |
| **SIMPLE $\rightarrow$ VARIANT** | Requires Variant Matrix configuration | Re-enables Step 4 (Product Configuration) for Variant setup. Requires completing Step 4 before publish. | No data loss warning needed, but alerts user Step 4 is now required. |
| **SIMPLE $\rightarrow$ BUNDLE** | Requires Kit Component assembly | Re-enables Step 4 (Product Configuration) for Component selection. | Alerts user Step 4 is now required. |
| **VARIANT $\rightarrow$ BUNDLE** | Destroys Variant Matrix, requires Components | Clears `product_variants` matrix. Switches Step 4 to Kit Component mode. | **YES** ("Changing from Variant to Bundle will remove all variant options. Proceed?") |
| **BUNDLE $\rightarrow$ VARIANT** | Destroys Components, requires Variant Matrix | Clears `combo_components` mappings. Switches Step 4 to Variant Matrix mode. | **YES** ("Changing from Bundle to Variant will remove all bundle components. Proceed?") |

---

### 8.14 Edit-Mode Safety Rules (Active Products with History)

When Step 2 is edited for an existing **`ACTIVE`** product (outside initial wizard draft):
- **Track Inventory ON $\rightarrow$ OFF**: BLOCKED if product has non-zero stock balances in `inventory_balances` or active historical `stock_movements`.
- **Batch Tracking ON $\rightarrow$ OFF**: BLOCKED if active batches with on-hand stock exist in `product_batches`.
- **Expiry Tracking ON $\rightarrow$ OFF**: BLOCKED if batches with expiry dates and stock exist.
- **Serial Tracking ON $\rightarrow$ OFF**: BLOCKED if active serialized items exist in `serial_numbers`.
- **VARIANT $\rightarrow$ SIMPLE / BUNDLE**: BLOCKED if multiple variants have historical sales orders or inventory ledgers.
- Fail-closed error code returned on violation: `400 product.structure_change_prohibited_has_history`.

---

### 8.15 Bundle / Kit Inventory Semantics (Release 1 Model)

- **Release 1 Choice**: **Derived Availability Model**.
- A Bundle/Kit product does NOT maintain independent physical stock ledgers.
- Available stock for a Bundle is **dynamically calculated** based on the lowest common denominator of its component products/variants availability:
  $$\text{Bundle Stock} = \min_{c \in \text{Components}} \left( \left\lfloor \frac{\text{Component Stock}_c}{\text{Required Quantity}_c} \right\rfloor \right)$$
- `Track Inventory` toggle for Bundle defaults to `OFF` (or set to `ON` if tracking component deductions). Batch/Serial/Expiry toggles on the Bundle parent are locked to `OFF` (since tracking applies to underlying components).

---

### 8.16 Product Summary Contract

Appears in the right-side rail (Desktop) for persisted drafts and edit mode:
- **Display Fields**:
  - Setup Status (`DRAFT` / `ACTIVE`)
  - Primary Product Image Thumbnail (or fallback placeholder icon)
  - Product Name (or `Untitled Product`)
  - Internal Product Code (or `Product Code: Pending`)
  - Product Structure Badge (`SIMPLE`, `VARIANT`, `BUNDLE`)
  - Primary Category & Brand
  - Inventory Tracking Badge (`Tracked` / `Not Tracked`)
  - Setup Step Progress Indicator (e.g. "Step 2 of 7 Completed")
- **SKU Note**: SKU is NOT assigned until Step 5. Product Summary displays `"SKU: Step 5"` or placeholder prior to Step 5.

---

### 8.17 Permission & Entitlement Model

- **Initial Wizard Creation (Steps 1–7)**: Authorized by `catalog.products.create`. A user with `catalog.products.create` can create drafts and execute `PUT /draft` calls on their own tenant drafts without requiring `catalog.products.update`.
- **Product List Edit Mode**: Authorized by `catalog.products.update`.
- **Tenant Entitlement**: Requires active feature entitlement `product_management`.
- **Missing Permission / Entitlement Failure**: Returns `403 Forbidden` with standard error body.

---

### 8.18 Audit Logging Requirements

Event logged on material Step 2 update: `PRODUCT_DRAFT_STEP2_UPDATED`.
- **Logged Properties**: `tenantId`, `productId`, `actorUserId`, `timestamp`, `oldProductStructure`, `newProductStructure`, `oldTrackInventory`, `newTrackInventory`, `oldBatchTracking`, `newBatchTracking`, `oldExpiryTracking`, `newExpiryTracking`, `oldSerialTracking`, `newSerialTracking`, `rowVersion`.

---

### 8.19 Error Contract & Error Codes

| HTTP Status | Canonical Error Code | Message | Description |
|---|---|---|---|
| **400** | `TRACK_INVENTORY_REQUIRED_FOR_BATCH` | Batch tracking requires Track Inventory to be enabled. | Validation failure. |
| **400** | `TRACK_INVENTORY_REQUIRED_FOR_EXPIRY` | Expiry tracking requires Track Inventory to be enabled. | Validation failure. |
| **400** | `TRACK_INVENTORY_REQUIRED_FOR_SERIAL` | Serial tracking requires Track Inventory to be enabled. | Validation failure. |
| **400** | `BATCH_REQUIRED_FOR_EXPIRY` | Expiry tracking requires Batch tracking to be enabled. | Validation failure. |
| **400** | `SERIAL_AND_BATCH_MUTUALLY_EXCLUSIVE` | Serial tracking cannot be combined with Batch tracking. | Release 1 restriction. |
| **400** | `SERIAL_AND_EXPIRY_MUTUALLY_EXCLUSIVE` | Serial tracking cannot be combined with Expiry tracking. | Release 1 restriction. |
| **400** | `INVALID_PRODUCT_STRUCTURE` | Selected product structure is invalid. | Enum validation failure. |
| **400** | `STRUCTURE_CHANGE_PROHIBITED_HAS_HISTORY` | Cannot change product structure because historical stock movements exist. | Edit safety failure. |
| **403** | `auth.forbidden` | Missing required permission or entitlement. | Permission/entitlement failure. |
| **404** | `product.not_found` | Product was not found or inaccessible. | Tenant isolation / invalid ID. |
| **409** | `product.concurrency_conflict` | Product was modified by another user. Refresh and try again. | Concurrency check failure. |

---

### 8.20 Optimistic Concurrency Control

- Every Step 2 update request MUST supply `expectedRowVersion`.
- Server compares `expectedRowVersion` against `products.row_version`.
- If mismatched, request fails with `409 Conflict`. Response returns latest server `rowVersion` and updated draft state for reload.

---

### 8.21 Non-Functional Requirements (NFR)

- **Atomicity**: Step 2 structure and tracking flags save in a single PostgreSQL transaction.
- **Consistency**: UI, API, Domain entity, and Database columns must remain strictly synchronized.
- **Tenant Isolation**: All queries filter by authenticated `tenant_id`.
- **Performance**: Save Step 2 operation executes under 100ms (no N+1 queries).
- **Idempotency**: Submitting the same Step 2 state repeatedly produces identical results without corrupting data.

---

### 8.22 Step 2 Automated Test Matrix

| Category | Test Case | Expected Result |
|---|---|---|
| **Structure** | Save `SIMPLE` structure | Database `products.product_structure = 'SIMPLE'`. |
| **Structure** | Save `VARIANT` structure | Database `products.product_structure = 'VARIANT'`. |
| **Structure** | Save `BUNDLE` structure | Database `products.product_structure = 'BUNDLE'`. |
| **Structure** | Submit invalid structure string | API returns `400 INVALID_PRODUCT_STRUCTURE`. |
| **Tracking** | Track Inventory OFF + all sub-tracking OFF | Valid save. All flags set to `false`. |
| **Tracking** | Track Inventory OFF + Batch ON | API returns `400 TRACK_INVENTORY_REQUIRED_FOR_BATCH`. |
| **Tracking** | Track Inventory OFF + Expiry ON | API returns `400 TRACK_INVENTORY_REQUIRED_FOR_EXPIRY`. |
| **Tracking** | Track Inventory OFF + Serial ON | API returns `400 TRACK_INVENTORY_REQUIRED_FOR_SERIAL`. |
| **Tracking** | Track Inventory ON + Batch ON + Expiry OFF | Valid save. Batch `true`, Expiry `false`. |
| **Tracking** | Track Inventory ON + Batch ON + Expiry ON | Valid save. Batch `true`, Expiry `true`. |
| **Tracking** | Track Inventory ON + Batch OFF + Expiry ON | API returns `400 BATCH_REQUIRED_FOR_EXPIRY`. |
| **Tracking** | Track Inventory ON + Serial ON + Batch OFF + Expiry OFF | Valid save. Serial `true`. |
| **Tracking** | Track Inventory ON + Serial ON + Batch ON | API returns `400 SERIAL_AND_BATCH_MUTUALLY_EXCLUSIVE`. |
| **Tracking** | Track Inventory ON + Serial ON + Expiry ON | API returns `400 SERIAL_AND_EXPIRY_MUTUALLY_EXCLUSIVE`. |
| **Navigation** | Save Draft from Step 2 | Step remains 2. `current_setup_step = 2`. `draft_saved_at` updated. |
| **Navigation** | Save & Continue from Step 2 | Step advances based on structure (BUNDLE → Step 4; SIMPLE/VARIANT → Step 3 if applicable, else Step 4). |
| **Concurrency** | Stale `expectedRowVersion` | API returns `409 product.concurrency_conflict`. |
| **Security** | Missing `catalog.products.create` | API returns `403 auth.forbidden`. |
| **Transitions** | `VARIANT` $\rightarrow$ `SIMPLE` with existing variants | Destructive prompt shown; draft variants cleared upon confirmation. |
| **Audit** | Step 2 update success | Audit event `PRODUCT_DRAFT_STEP2_UPDATED` written. |

---

## 9. Cross-Step Business Rules (Steps 3 - 8)

### Step 3 — Units & Pack Conversion Contract
- **Detailed Specification**: Refer to canonical specification [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]].
- **Unit Models**: Supports `SINGLE_UNIT` (Single Unit Only) and `MULTIPLE_UNITS` (Multiple Units & Pack Conversion).
- **Product-Specific Rule**: Unit package sizes and conversion multipliers are strictly PRODUCT-SPECIFIC. 1 Pack = 6 Pieces for Product A does NOT dictate 1 Pack for Product B. Global `unit_of_measures` stores UOM master types only (`PCS`, `PK`, `CTN`, etc.). Product conversion factors are stored in `product_unit_settings` and `product_unit_conversions`.
- **Applicability & Navigation Matrix**:
  - `SIMPLE` + Track Inventory ON: Step 3 REQUIRED $\rightarrow$ target Step 5 (Step 4 `NOT_APPLICABLE`).
  - `VARIANT` + Track Inventory ON: Step 3 REQUIRED at parent product level (variants inherit) $\rightarrow$ target Step 4.
  - `SIMPLE` + Track Inventory OFF: Step 3 `NOT_APPLICABLE` $\rightarrow$ target Step 5.
  - `VARIANT` + Track Inventory OFF: Step 3 `NOT_APPLICABLE` $\rightarrow$ target Step 4.
  - `BUNDLE` (Release 1): Parent tracking is forced `false` / component-based $\rightarrow$ Step 3 `NOT_APPLICABLE` $\rightarrow$ target Step 4.
- **Selling Unit Constraint**: Selling Unit MUST match Base Unit, Purchase Unit, or Outer Pack Unit.
- **Base Unit & Stock Ledger**: Base Unit serves as primary stock ledger unit (`inventory_uom_id` in `product_inventory_settings` synchronizes with `base_uom_id`).
- **Conversion Mathematics**: purchaseToBaseFactor = itemsPerPurchaseUnit; outerPackToBaseFactor = itemsPerPurchaseUnit * purchaseUnitsPerOuterPack.



### Step 4 — Configuration
- `SIMPLE`: Auto-skips to Step 5.
- `VARIANT`: Generates Cartesian product of selected option values.
- `BUNDLE`: Selects component variants and fixed component quantities.

### Step 5 — Identifiers
- SKU & Barcode uniqueness enforced tenant-wide.
- Every sellable product must have at least one `product_variants` row. Therefore, the Base SKU for `SIMPLE` and `BUNDLE` products is stored in `product_variants.sku` on their single default variant row.

### Step 6 — Pricing & Tax
- Standard Selling Price, Cost Price, Tax Class assignment, Margin calculation.
- Navigates directly to Step 7 on `Save & Continue`.

### Step 7 — Review & Create
- Performs full server-side validation graph. Atomically updates `status` to `ACTIVE` or `INACTIVE`, sets `published_at`, and returns final Product DTO.
- Includes Channel Availability summary from Step 1.

---

## 10. API Contract Summary

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

## 11. Database Ownership & Traceability

- `products`: `current_setup_step`, `draft_saved_at`, `published_at`, `row_version`, `status`, `desired_publish_status`, `product_structure`
- `product_variants`: Variant sellable identities & SKUs
- `product_barcodes`: Barcode strings & UOM links
- `media_assets` + `product_images`: Canonical normalized Product media model (`STAGED` → `ACTIVE` on link)
- `product_channel_visibility`: POS and Online visibility flags
- `product_inventory_settings`: Track stock (`is_stock_tracked`), batch (`requires_batch_tracking`), expiry (`requires_expiry_tracking`), serial (`requires_serial_tracking`) flags

---

## 12. Validation Matrix

| Trigger | Rules Enforced | Failure Result |
|---|---|---|
| **Save Draft (Step 1)** | Category optional; Brand optional; blank Product Name $\rightarrow$ persist `Untitled Product` | HTTP 400 with field errors |
| **Save & Continue (Step 1)** | Real Product Name required; Category required; Brand optional; then `current_setup_step = 2` | UI stays on Step 1; step not advanced |
| **Save Draft (Step 2)** | Structure valid enum; Tracking combination valid according to truth table; `advanceStep = false` | Keeps on Step 2; returns updated `rowVersion` |
| **Save & Continue (Step 2)** | Structure valid enum; Tracking matrix valid according to truth table; `advanceStep = true` | Advances to next applicable Step upon HTTP 200 OK |
| **Publish (Step 7)** | All 7 steps valid; SKU/Barcode unique; Price >= 0; Channels configured | HTTP 400/409 error envelope, transaction rolls back |

---

## 13. Related Documents
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]

## Step 3 — Units & Pack Conversion (NOT_APPLICABLE for BUNDLE)
For `BUNDLE`: `Step 3 = NOT_APPLICABLE`.
The Bundle parent does not configure Base Unit, Purchase Unit, Stock Unit, Selling Unit Conversion, Outer Pack, Pack Conversion, Multiple Unit Conversion, or Parent inventory conversion.
The user must NEVER enter the Step 3 form.

## Step 4 — Bundle / Kit Composition

### Header
```text
Bundle / Kit Composition
```
Subheading: `Select the component items included in this bundle and define their required quantities.`

### Bundle Summary
- Product Image, Bundle Name
- SKU (Pending until Step 5)
- Product Structure: Bundle / Kit
- Inventory Method: Component-based
- Component Count

### Component Summary
- Total Components
- Total Units per Bundle
- Estimated Component Cost

### Components Table
Columns:
```text
#
Component Product
Variant / Option
Tracking Type
Unit
Required Qty
Available Stock
Contribution to Bundle / Supports Bundles
Actions
```
Actions: Edit, Remove.
Empty State: `No components added yet`.

### Bundle Availability Panel
```text
SupportsBundles = FLOOR(UsableAvailableStock / RequiredQuantity)
BundleAvailableQuantity = MIN(SupportsBundles for every mandatory component)
```
Ties for the limiting component are handled deterministically.

### Save Logic
- Save Draft allows 0, 1, or 2+ components. Stays on Step 4.
- Save & Continue requires minimum 2 valid distinct components. On success, `targetSetupStep = 5`.

