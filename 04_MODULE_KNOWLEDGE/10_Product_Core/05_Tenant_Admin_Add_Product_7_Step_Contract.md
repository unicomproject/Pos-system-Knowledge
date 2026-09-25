
<!-- title: Tenant Admin Add Product 7-Step Implementation Contract -->
<!-- status: SUPERSEDED -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-11 -->
<!-- superseded_by: 06_Tenant_Admin_Add_Product_6_Step_Contract.md (2026-09-20) -->
<!-- supersedes: basic_details_first_standalone_barcode_sku_step -->

## ⚠️ SUPERSEDED DOCUMENT

**This 7-step contract has been superseded as of 2026-09-20.**

**New Authority:** [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]]

**Decision:** [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]]

All active references must use the new 6-step contract.

Historical references to the 7-step flow should link to this archived document and note that it is superseded.

---

# Tenant Admin Add Product 7-Step Implementation Contract

## 1. Executive Summary & Scope

This contract defines the authoritative specification for the **Tenant Admin Add Product / Product Setup** feature in OneVerz POS Unified Commerce. It replaces the legacy 4-step Product Add UI with a **FIXED 7-STEP WIZARD** aligned with **Reference UI 2**, remumbered **scanner-first** (2026-09-11).

This document serves as the single source of truth for Frontend (Flutter), Backend (.NET Web API), Database Schema, Access Control, and QA teams.

Decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].  
Scan: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].  
Identifiers: [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]].

> **Authority:** §2 is locked. Step 1 detail → [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]. Identifier detail → [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]]. Initial Tracking collection → global **Step 3**.
---

## 2. Fixed 7-Step Wizard Lifecycle

The Add Product experience is structured into exactly 7 sequential steps:

1. **Step 1 — Scan Barcode** (acquire/validate/duplicate discovery/optional external lookup/no-barcode bootstrap; pre-draft until creation path)
2. **Step 2 — Basic Details** (General info, mandatory Category, optional Brand, Product Image upload, Channel Availability toggles)
3. **Step 3 — Product Type & Tracking** (`SIMPLE`, `VARIANT` selection, tracking combinations, and optional Initial Tracking Details after type is selected)
4. **Step 4 — Unit & Pack Conversion** (Base UOM, purchase/sales UOM, and conversion factors)
5. **Step 5 — Product Configuration** (Simple: matrix N/A + identifier section; Variant: Variant Matrix & Options + identifiers). Standalone **Barcode & SKU** step is superseded.
6. **Step 6 — Pricing & Tax** (SIMPLE: single selling + tax + preview; VARIANT: per-variant selling prices + common tax — see §6.1–6.5)
7. **Step 7 — Review & Create** (Verification summary across all sections, inline edit links, final atomic publish)

### Step 5 Canonical Naming Rule
- Canonical step title is **"Product Configuration"**.
- Do NOT label Step 5 as "Variants Configuration" globally.
- Simple Products mark variant matrix as **Not Applicable**; identifier section still applies under Step 5.
- Variant Products render Variant Matrix configuration inside Step 5 plus identifier section.

---

## 3. Step 2 — Basic Details Contract (Reference UI 2 Alignment)

### Form Fields & Traceability Matrix

| UI Field Label | Mandatory | Data Type | Validation Rules | Default Value | API Request Property | Entity Property | Database Column | Notes |
|---|---|---|---|---|---|---|---|---|
| Product Name | YES | String | Max 200 chars, Non-empty | None | `productName` | `Product.ProductName` | `products.product_name` | Mandatory |
| Short Name / Internal Code | YES | String | Max 80 chars, Alphanumeric/dash | Auto-slug | `shortName` / `productCode` | `Product.ProductCode` | `products.product_code` | Mandatory, no auto-generation fallback |
| Category | YES | UUID | Must exist in `categories`; effectively selectable ACTIVE only (**BR-CAT-PRODUCT-SELECT-001**: Category + all ancestors ACTIVE) | None | `categoryId` | `Product.CategoryId` | `product_categories.category_id` | Primary category map. Canonical picker source: **`GET /api/v1/tenant-admin/products/create-options`** (`product_catalog` + `catalog.products.create`). Do **not** call `/api/v1/categories/tree` or require `catalog.categories.view`. **IMPLEMENTED backend:** recursive ACTIVE hierarchy depth 1–5 from single hierarchy-aware `categories[]`; persist selected `CategoryId` only. **HISTORICAL / LEGACY COMPATIBILITY:** prior `categories` + `subCategories` was a flat child-Category list, not a SubCategory entity. |
| Brand | NO (Optional) | UUID | Must exist in `brands` | NULL | `brandId` | `Product.BrandId` | `products.brand_id` | **Optional** |
| Short Description | NO | String | Max 500 chars | NULL | `shortDescription` | `Product.ShortDescription` | `products.short_description` | Text |
| Long Description | NO | String | Max 4000 chars | NULL | `longDescription` | `Product.LongDescription` | `products.long_description` | Rich text / markdown |
| Product Image | NO | File/URL | Max 10 images, ≤5MB each, PNG/JPG | Compact Card / Overlay | `mediaAssetId` / `stagedMediaAssets` | `ProductImage.MediaAssetId` | `product_images.media_asset_id` | Compact upload card opens Product Images Manager panel |
| In-Store POS | NO | Boolean | - | True | `posSellable` | `Product.IsSellable` | `products.is_sellable` | Channel Availability toggle |
| Online Store | NO | Boolean | - | False | `allowOnlineSale` | `Product.AllowOnlineSale` | - | Channel Availability toggle |

> [!IMPORTANT]
> Step 1 owns barcode **acquisition** only (see Scan Barcode spec). Final SKU/Barcode assignment belongs to **Step 5 Product Configuration** identifier section. Unit Type belongs to Step 4. Variant Templates belong to Step 5. Initial Tracking Details are collected on **Step 3** after Product Type is selected.
> Do **not** persist Initial Tracking Details as `products.batch_number`, `products.expiry_date`, or `products.serial_number`.
> Canonical TARGET contract: [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]] (filename historical; collection = Step 3).

---

## 3A. Step 1 — Scan Barcode (summary)

Full state machine, resolve/external APIs, and no-barcode bootstrap: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].

No-barcode **Auto Generate SKU** remains inside Step 1. It allocates one backend
Product base from selected Category Code plus a tenant sequence. Step 3 does not
allocate again: SIMPLE retains the base; VARIANT Step 5 extends it with ordered
stable Variant Value codes. There is no new global SKU step.

Pre-draft until creation path → then DRAFT with normally `current_setup_step = 2` and `product_setup_scan_context` persisted.

---

## 4. Product Image Upload Contract (Reference Image 1 Alignment)

- **UI Interaction Pattern**: **Step 2 Basic Details** displays a compact **Product Image upload card**. Clicking `"Upload Product Image"` or `"Click to Upload Product Images"` opens native file browse dialogs.
- **Drag & Drop Removal**: Drag & Drop functionality and related UI hints/handles have been completely removed. Image upload relies exclusively on standard file selection.
- **Legacy UI Deprecation**: The permanently expanded large black gallery and multiple main-form empty Add Image tiles (Reference Image 2 style) are **LEGACY UI** and MUST NOT be used for Add Product Step 2.
- **Maximum Image Count**: Up to **10** product images (`TARGET — MAXIMUM 10 PRODUCT IMAGES`).
- **File Validation**: PNG, JPG (image/png, image/jpeg). Max file size **5 MB** per image. Recommended dimensions: 2000x2000 px.
- **Primary Image Rule**: First uploaded image automatically becomes Primary (`is_primary_image = true`). Reordering does not silently change Primary. Deleting Primary auto-designates the next remaining image as Primary.
- **Fresh Wizard Staging Strategy**: Fresh Add Product uploads use staged session uploads (`POST /api/v1/tenant-admin/products/images/stage`, permission `catalog.product_media.manage`) which are transactionally attached to the Product on explicit `Save Draft` or `Create Product` (not on Continue/Skip).
- **Detailed Specification**: Refer to canonical document [[04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/Tenant_Admin_Product_Image_Manager_Specification]].

---

## 5. Channel Availability State Synchronization

The **Channel Availability** section in **Step 2 Basic Details** exposes 2 toggles that represent canonical state synchronized across the wizard:

1. **In-Store POS**: Represents POS sellability (`posSellable`).
2. **Online Store**: Represents E-commerce availability (`allowOnlineSale`).

These fields replace the legacy "Status & Options" card and the old "Step 7 Channel Visibility" wizard step.
The `Track Inventory` toggle does not belong on Scan Barcode or Basic Details; it exists ONLY in **Step 3 Product Type & Tracking**.

---

## 6. Persistence Lifecycle Architecture (Canonicalized 2026-09-19)

### 6.0 Three States: LOCAL_UNSAVED → EXPLICIT_DRAFT → PUBLISHED

Product Setup follows the canonical three-state model defined in [[Tenant_Admin_Add_Product_Draft_Lifecycle_Specification]]:

1. **LOCAL_UNSAVED**: User enters data; no backend writes. Wizard state remains in client/session.
2. **EXPLICIT_DRAFT**: User clicks Save Draft; backend creates/updates DRAFT Product.
3. **PUBLISHED**: User clicks Create Product; backend atomically publishes final Product.

Direct flow LOCAL_UNSAVED → PUBLISHED is supported (Skip Save Draft).

### 6.1 Step 1 (Scan Barcode) — PRE-DRAFT

- Random scan/lookup/SKU-candidate preview does NOT create or Save Draft a Product row.
- There is NO automatic "Save Draft Step 1 stores Product Name / Basic Details" rule.
- Pre-draft actions are LOCAL_UNSAVED state only (no backend writes).
- **First Product persistence** happens only at the committed creation-path boundary (Use This Product / Create Manually / Continue with this barcode / Continue to Basic Details from no-barcode) via **`POST /api/v1/tenant-admin/products/draft`**, which creates `status = DRAFT`, `current_setup_step = 2`, and `product_setup_scan_context`.

### 6.2 Steps 2–7 — LOCAL_UNSAVED or EXPLICIT_DRAFT

#### Continue / Next (LOCAL_UNSAVED Only)
- Does NOT call backend.
- Validates current step locally.
- Updates wizard state locally.
- Advances current step.
- All state remains in LOCAL_UNSAVED.

#### Save Draft (Server Persistence)
- Explicit user action: click "Save Draft" button.
- Endpoint: `PUT /api/v1/tenant-admin/products/{id}/draft` (for existing draft) or implied POST for fresh draft.
- **Backend Persistence**:
  - `products.status` = `DRAFT`
  - `products.current_setup_step` set to currently-saved step (does NOT auto-advance)
  - `products.draft_saved_at` = `DateTime.UtcNow`
  - `products.row_version` incremented
  - Optimistic concurrency check via `expectedRowVersion`
- Do NOT automatically advance step on Save Draft success.
- User remains on current step; may Save Draft again or Continue.

#### Nullable Constraints for EXPLICIT_DRAFT
Database permits NULL for `product_type`, `product_code`, `product_slug` while `status = 'DRAFT'`. Mandatory checks are enforced only on **Publish** (Step 7).

### 6.3 `current_setup_step` Canonical Rules

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode *(UI / resume projection only — no product row while still LOCAL_UNSAVED)* |
| 2 | Basic Details |
| 3 | Product Type & Tracking |
| 4 | Unit & Pack Conversion |
| 5 | Product Configuration (incl. identifiers) |
| 6 | Pricing & Tax |
| 7 | Review & Create |

| Operation | LOCAL_UNSAVED Step | EXPLICIT_DRAFT current_setup_step | Notes |
|---|---|---|---|
| Step 1 pre-draft scans / resolve / external-lookup / SKU generation | 1 (local) | *(no product row)* | Resolve/lookup are side-effect free; SKU candidate stored locally only; no backend |
| Creation-path from Step 1 → Basic Details | 2 (local) | `2` | **`POST .../products/draft`** + `product_setup_scan_context` creates first DRAFT |
| Step 2 Continue | 3 (local) | *(unchanged)* | Local navigation only; does NOT change server `current_setup_step` |
| Step 2 Save Draft | 2 (local)  | `2` | Persists Step 2 data; does NOT auto-advance |
| Step 3 Continue | 4 or 5 (local) | *(unchanged)* | Local navigation; Step 4 bypass for Track Inventory OFF |
| Step 3 Save Draft | 3 (local) | `3` | Persists Step 3 data; does NOT auto-advance |
| Step 4 Continue | 5 (local) | *(unchanged)* | Local navigation only |
| Step 4 Save Draft | 4 (local) | `4` | Persists Step 4 data; does NOT auto-advance |
| Step 5 Continue | 6 (local) | *(unchanged)* | Local navigation only |
| Step 5 Save Draft | 5 (local) | `5` | Persists Step 5 data; does NOT auto-advance |
| Step 6 Continue | 7 (local) | *(unchanged)* | Local navigation only |
| Step 6 Save Draft | 6 (local) | `6` | Persists Step 6 data; does NOT auto-advance |
| Save Draft from Step N (via `PUT .../draft`, `CurrentSetupStep=N`) | N (local) | `N` | Persists current step without advancing. Generic draft must NOT hard-reset to `1` or `2` |
| Final Wizard Publication | 7 (local) | `7` → PUBLISHED | Create Product via `POST .../{id}/publish`; atomically validates all steps |
| Legacy resume (old Basic Details was 1) | (N/A) | remap per Draft Lifecycle | Read-time compatibility in `GET .../setup` |

### 6.4 Save Draft Product Name Placeholder Policy

When Product Name is empty during **Step 2 Save Draft** (draft already exists):

- Backend MAY persist the deterministic draft placeholder: **`Untitled Product`**.
- The placeholder is **draft-only**.
- **Step 2 Continue to Step 3** MUST reject blank names locally in Flutter validation.
- An auto-generated placeholder MUST NOT satisfy **Step 2 Basic Details** Product Name completion for final Create validation.

### 6.5 Continue, Skip, and Save Draft Distinction — All Seven Steps

| Step | Meaning | Continue (LOCAL_UNSAVED) | Skip (when eligible) | Save Draft (EXPLICIT_DRAFT) |
|---:|---|---|---|---|
| 1 | Scan Barcode | **N/A** — creation-path actions bootstrap to Step 2 DRAFT | **N/A** | **N/A** — pre-draft; use creation-path instead |
| 2 | Basic Details | Product Name valid (non-empty); Category supplied; then Step 3 (local) | **N/A** — not eligible | Product Name optional (placeholder); Category optional; persists Step 2 snapshot; remains Step 2 |
| 3 | Product Type & Tracking | Structure selected; tracking valid; then Step 4 or Step 5 (local) | **N/A** — not eligible | Structure/tracking snapshot; persists Step 3 snapshot; remains Step 3 |
| 4 | Unit & Pack | Applicable unit model entered; then Step 5 (local) | **N/A** — not eligible; if NOT_APPLICABLE auto-bypassed | Partial UOM allowed; persists Step 4 snapshot; remains Step 4 |
| 5 | Product Configuration + identifiers | Matrix/bundle + identifiers valid; then Step 6 (local) | **N/A** — not eligible | Partial matrix/identifiers allowed; persists Step 5 snapshot; remains Step 5 |
| 6 | Pricing & Tax | Price + tax valid for structure; then Step 7 (local) | **N/A** — not eligible | Partial price/tax allowed; persists Step 6 snapshot; remains Step 6 |
| 7 | Review & Create | **N/A** — terminal step | **N/A** | **N/A** — use Create Product instead |

**Rule:** Batch Number / Expiry Date / Serial Number are collected on **Step 3**, never on Step 1 or Step 2.

**Rule:** All Continue actions are LOCAL_UNSAVED state only. Save Draft is the only server persistence action before final Create.

### 6.6 Strict DRY Shared Action & Persistence Pipeline Architecture (Canonicalized 2026-09-19)

Both Backend (.NET) and Frontend (Flutter) MUST follow a single, unified reusable architecture for wizard actions and explicit draft persistence.

#### A. BACKEND — ONE COMMON SAVE PIPELINE
- **No Step-Specific Save Methods**: The backend MUST NOT implement separate repository save methods such as `SaveStep1DraftAsync`, `SaveStep2DraftAsync`, `SaveStep3DraftAsync`, etc.
- **Unified Repository Save Pipeline**: All wizard step **Save Draft** requests are executed through a single repository pipeline method: `ITenantAdminProductRepository.SaveProductDraftAsync(tenantId, userId, command, now, ct)`.
- **Unified Save Command & Result**: All explicit Save Draft requests construct `SaveProductDraftCommand` (carrying `ProductId`, `CurrentSetupStep`, `ExpectedRowVersion`, and step payload data) and return `SaveProductDraftResult`. **Do NOT include `advanceStep` flag** — Save Draft never auto-advances; local Continue handles navigation.
- **Centralized Pipeline Enforcement**: Access policy evaluation (`ProductWizardAccessPolicy`), feature entitlement (`product_catalog`), concurrency validation (`expectedRowVersion`), entity creation/loading, category mapping, channel visibility, inventory settings, media asset linking, transactional audit logging (`AuditLog`), EF `SaveChangesAsync`, and DTO projection exist ONCE in the shared pipeline.
- **Business Processors**: After a Product DRAFT exists, step-specific rules for Steps 2–7 are executed by dedicated step processors (`IProductWizardStepProcessor` implementations, e.g. illustrative `Step2WizardProcessor` / `Step3WizardProcessor`) selected dynamically based on `CurrentSetupStep`. **Step 1 Scan is PRE-DRAFT** — barcode resolve, external lookup, and SKU-candidate generation are owned by those side-effect-free discovery endpoints/services, **not** by a Product Draft save processor. Do not invent mandated production class names from these examples.
- **Continue Endpoint**: Continue does NOT require a backend endpoint. Flutter performs local validation and state updates only.
- **Legacy Compatibility**: Existing `advanceStep` parameter may remain in backend for backward compatibility with old clients, but current Product Setup (2026-09-19 onward) does NOT invoke it.

#### B. FRONTEND (FLUTTER) — ONE SHARED ACTION FOOTER & CONTROLLER
- **Single Actions Footer Widget**: `ProductWizardActionsFooter` is shared across all 7 wizard steps. Creating independent button widgets per step (`Step1ContinueButton`, `Step2ContinueButton`, etc.) is strictly FORBIDDEN.
- **Single Controller Actions**: 
  - `productWizardController.continueToNextStep(currentStep)` — local navigation only; no backend call.
  - `productWizardController.saveDraft(currentStep)` — explicit server persistence; no auto-advance.
  - `productWizardController.skipStep(currentStep)` — local skip (when eligible); no backend call.
- **Continue vs Save Draft Semantics**: `continueToNextStep()` updates local state and advances step WITHOUT backend call. `saveDraft()` persists to server and does NOT auto-advance step. Both may be called independently.

---

## 7. Product Summary Card Rules

- **Fresh Add Product**: Summary card is hidden before the first draft persistence.
- **After First Save Draft / Resume / Edit**: Summary card is displayed on the top right showing:
  - Setup Status (`DRAFT` / `ACTIVE`)
  - Cover Image Thumbnail
  - Product Name (or placeholder `Untitled Product`)
  - Internal Product Code (or `Product Code: Pending`)
  - Product Structure Badge (`SIMPLE`, `VARIANT`)
  - Primary Category & Brand
  - Inventory Tracking Badge (`Tracked` / `Not Tracked`)
  - Step Progress Indicator (e.g., "Step 2 of 7 Completed (28%)")
- **SKU Note**: SKU is assigned in **Step 5 Product Configuration** identifier section. Product Summary displays `"SKU: Pending"` or placeholder prior to assignment.

---

## 7A. Skip Eligibility Matrix (Release 1 — Canonicalized 2026-09-19)

**CANONICAL RULE:** Skip is a **navigation action** allowing users to defer step completion, not a **requirement waiver**. Steps with Skip buttons remain mandatory for final Product creation; validation enforced on Create Product.

| Step | Step Name | Skip Button | Footer | Skip Destination | Local Status After Skip | Final Create Blocks If Missing |
|---:|---|---|---|---|---|---|
| **1** | Scan Barcode | **NO** | Per existing scanner/manual paths (no Skip CTA) | N/A | N/A | Create does not block; barcode optional |
| **2** | Basic Details | **YES** | `Back \| Save Draft \| Skip \| Continue` | → Step 3 | INCOMPLETE / SKIPPED | Create **BLOCKED**: Name + Category mandatory |
| **3** | Product Type & Tracking | **YES** | `Back \| Save Draft \| Skip \| Continue` | → Step 4/5 (defaults: SIMPLE, Track OFF) | INCOMPLETE / SKIPPED; defaults applied for routing | Create **BLOCKED**: Structure must be confirmed (cannot remain at defaults) |
| **4** | Unit & Pack Conversion | **YES** | `Back \| Save Draft \| Skip \| Continue` | → Step 5 | INCOMPLETE / SKIPPED | Create **BLOCKED** if Track Inventory ON and UOM missing |
| **5** | Product Configuration + Identifiers | **YES** | `Back \| Save Draft \| Skip \| Continue` | → Step 6 | INCOMPLETE / SKIPPED | Create **BLOCKED**: SKU mandatory per sellable variant |
| **6** | Pricing & Tax | **YES** | `Back \| Save Draft \| Skip \| Continue` | → Step 7 | INCOMPLETE / SKIPPED | Create **BLOCKED**: Selling Price + Tax Class mandatory |
| **7** | Review & Create | **NO** | `Back \| Save Draft \| Create Product` | N/A (terminal) | N/A | Full revalidation; all data must be complete |

**Canonical Skip Rules:**

1. **Skip Semantics:** Pressing `Skip` defers step completion. Partial values preserved locally as INCOMPLETE/SKIPPED. **Zero backend persistence**.
2. **Navigation:** User may navigate past incomplete/skipped steps using Skip, Back, or Continue.
3. **Review Display:** Step 7 shows status of each step (COMPLETE / INCOMPLETE / SKIPPED) with edit links for return.
4. **Step 3 Routing Defaults:** When Step 3 is skipped:
   - Wizard assumes `SIMPLE` structure (for Step 4 routing)
   - Wizard assumes `Track Inventory OFF` (Step 4 auto-bypassed)
   - Navigation proceeds to Step 5
   - **User MUST confirm actual structure/tracking before Create Product** — temporary defaults do not satisfy final validation
5. **Final Create Validation:** All mandatory fields must be complete. Missing data from any step (including skipped) blocks publication. User guided back to incomplete sections.
6. **Skip ≠ Optional:** Skipped data still required for final Product creation.

---

## 8. Step 3 — Product Type & Tracking Setup Detailed Contract

### 8.1 Target Functional Overview
**Step 3** configures the product structure classification and inventory tracking rules for the product.

- **Title**: Product Type & Tracking Setup
- **Subtitle**: Choose the product type and how this product should be tracked.
- **Product Type Cards (2 Cards)**:
  1. **Simple Product**: Single item with one SKU. No variants.
  2. **Variant Product**: Items with multiple variants such as size, color, material.
- **Initial Tracking Details** (after Product Type is selected, **before** Tracking & Stock Rules): optional Batch Number, Expiry Date, Serial Number for SIMPLE and VARIANT. Does not auto-enable the toggles below.
- **Tracking & Stock Rules (4 Toggles)**:
  1. **Track Inventory** (Master stock toggle)
  2. **Batch / Lot Tracking**
  3. **Expiry Tracking**
  4. **Serial Number Tracking**
- **Footer Actions**: `Back`, `Save Draft`, `Skip`, `Continue`.

---

### 8.2 Product Type Domain Mapping (Canonical Rule)

The 2 UI options ("Simple Product", "Variant Product") map canonically to **Product Structure**, NOT `products.product_type`.

| UI Option Card | API Property (`productStructure`) | Domain Entity Enum (`ProductStructure`) | Database Column (`products.product_structure`) | Description |
|---|---|---|---|---|
| **Simple Product** | `"SIMPLE"` | `ProductStructure.SIMPLE` | `'SIMPLE'` | Single item with one SKU. No variants. |
| **Variant Product** | `"VARIANT"` | `ProductStructure.VARIANT` | `'VARIANT'` | Items with multiple variants (size, color, etc.). |

> [!IMPORTANT]
> **Product Type vs Product Structure**:
> - `products.product_structure`: Represents physical catalog structure (`SIMPLE`, `VARIANT`).
> - `products.product_type`: Represents merchandise type classification (e.g. `STANDARD`, `DIGITAL`, `SERVICE`). During wizard setup, `products.product_type` defaults to `'STANDARD'`.
> - The UI term "Product Type" refers to structure (SIMPLE/VARIANT), not the database `product_type` field.

---

### 8.3 Step 3 Implementation Traceability Matrix

| UI Field / Control | Flutter State / DTO | API Property | Backend Request DTO | Domain Entity & Property | Database Table | Database Column | Validation Rules | Permission Code | Audit Event Field |
|---|---|---|---|---|---|---|---|---|---|
| **Product Structure** | `productStructure` | `productStructure` | `UpdateProductDraftStepRequestDto.ProductStructure` | `Product.ProductStructure` | `products` | `product_structure` | Required; Enum `SIMPLE`, `VARIANT` | Initial Draft: `catalog.products.create`<br>Edit: `catalog.products.update` | `newProductStructure` |
| **Track Inventory** | `trackInventory` | `trackInventory` | `UpdateProductDraftStepRequestDto.TrackInventory` | `ProductInventorySetting.IsStockTracked` | `product_inventory_settings` | `is_stock_tracked` | Boolean; Wizard default `false` (`OFF`) | Same as above | `newTrackInventory` |
| **Batch / Lot Tracking** | `batchTracking` | `batchTracking` | `UpdateProductDraftStepRequestDto.BatchTracking` | `ProductInventorySetting.RequiresBatchTracking` | `product_inventory_settings` | `requires_batch_tracking` | Requires `TrackInventory = true`; Mutually exclusive with Serial | Same as above | `newBatchTracking` |
| **Expiry Tracking** | `expiryTracking` | `expiryTracking` | `UpdateProductDraftStepRequestDto.ExpiryTracking` | `ProductInventorySetting.RequiresExpiryTracking` | `product_inventory_settings` | `requires_expiry_tracking` | Requires `TrackInventory = true` AND `BatchTracking = true`; Mutually exclusive with Serial | Same as above | `newExpiryTracking` |
| **Serial Number Tracking** | `serialTracking` | `serialTracking` | `UpdateProductDraftStepRequestDto.SerialTracking` | `ProductInventorySetting.RequiresSerialTracking` | `product_inventory_settings` | `requires_serial_tracking` | Requires `TrackInventory = true`; Mutually exclusive with Batch and Expiry | Same as above | `newSerialTracking` |
| **Current Setup Step** | `currentSetupStep` | `currentSetupStep` | `UpdateProductDraftStepRequestDto.CurrentSetupStep` | `Product.CurrentSetupStep` | `products` | `current_setup_step` | 1 to 7; Set to 4 (Units) or 5 (Units NOT_APPLICABLE) on `Continue` from Step 3 | Same as above | N/A |
| **Draft Saved At** | N/A | `draftSavedAt` | N/A | `Product.DraftSavedAt` | `products` | `draft_saved_at` | Server UTC timestamp | Same as above | `timestamp` |
| **Row Version** | `rowVersion` | `expectedRowVersion` | `UpdateProductDraftStepRequestDto.ExpectedRowVersion` | `Product.RowVersion` | `products` | `row_version` | Optimistic concurrency token | Same as above | `rowVersion` |
| **Updated By** | N/A | N/A | N/A | `Product.UpdatedByTenantUserId` | `products` | `updated_by_tenant_user_id` | Server authenticated User ID | Same as above | `actorUserId` |
| **Updated At** | N/A | N/A | N/A | `Product.UpdatedAt` | `products` | `updated_at` | Server UTC timestamp | Same as above | `timestamp` |

---

### 8.4 Canonical Default State & Step 2 Synchronization

**Step 3 Canonical Default State**:
- `Product Structure`: `SIMPLE` (unconfirmed until the user selects a type)
- `Track Inventory`: `false` (`OFF`)
- `Batch / Lot Tracking`: `false` (`OFF`)
- `Expiry Tracking`: `false` (`OFF`)
- `Serial Number Tracking`: `false` (`OFF`)

**Synchronization with Step 2 (Basic Details)**:
- The `Track Inventory` toggle does not belong on Step 1 Scan Barcode or Step 2 Basic Details.
- Step 3 is the sole source of truth for the inventory tracking toggle during setup.
- Optional Initial Tracking Details are collected on Step 3 **after Product Type is selected**. They are **not** policy. Entering Batch/Expiry/Serial must not auto-enable tracking toggles.
- When Step 3 is saved, reconcile identity values using the matrix in [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]. Incompatible values require confirmation before clearing (`confirmClearIncompatibleInitialTracking`).
- Step 3 UI shows the identity card **above** SIMPLE / VARIANT tracking toggles. Hide tracking tiles until Product Type is selected.

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

### 8.7 Footer Actions & Navigation Logic (Canonicalized 2026-09-19)

#### BACK
- Local navigation from Step 3 to Step 2 Basic Details.
- Preserves current local state in Flutter form state.
- Does NOT call backend.
- Does NOT change server `current_setup_step`.

#### CONTINUE
1. Validates Step 3 rules completely against the truth table locally.
2. Normalizes dependent tracking fields locally.
3. Updates local wizard state.
4. Advances to Step 4 (Units applicable) or Step 5 (Units `NOT_APPLICABLE`) locally.
5. Does NOT call backend.
6. User may now Save Draft to persist Step 3 changes if desired, or continue to Step 4/5, or navigate away.

#### SAVE DRAFT
- Validates Step 3 field syntax and tracking combination rules.
- Persists Step 3 values to the database via `PUT /api/v1/tenant-admin/products/{id}/draft`.
- Keeps client on Step 3 (does NOT advance step automatically).
- Updates `draft_saved_at`, `updated_at`, `updated_by_tenant_user_id` on server.
- Increments `row_version` and returns the latest `rowVersion` in response.
- Server `current_setup_step` remains `3` (does not auto-increment).
- User may now Continue to next step or Save Draft again with new changes.

#### SKIP
- **Canonical Decision**: Step 3 **SHOWS Skip button** (see §7A).
- Pressing `Skip` means: "I do not want to configure Product Structure and Tracking now; proceed to the next step."
- **Local behavior:**
  - Preserves any partially-entered Product Structure or tracking values.
  - Marks Step 3 locally as SKIPPED/INCOMPLETE.
  - Wizard navigates using **temporary routing defaults**: `SIMPLE` structure, `Track Inventory OFF`.
    - If defaults lead to Step 4 applicability, navigates to Step 4.
    - If defaults lead to Step 4 bypass, navigates to Step 5.
  - **These defaults are temporary** — not user confirmation.
- **No backend call**. No server persistence.
- **Review & Create behavior:** Step 3 displays as SKIPPED/INCOMPLETE. User may click to return and confirm actual Structure and Tracking configuration.
- **Final Create:** Product Structure **MUST be explicitly confirmed** (cannot use temporary routing defaults). Tracking rules **MUST be valid**. Create is **BLOCKED** if user skipped Step 3 and structure remains unconfirmed.

---

### 8.8 Step 3 API Contract

#### Update Draft Step 3 Endpoint
`PUT /api/v1/tenant-admin/products/{productId}/draft`

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body (`UpdateProductDraftStepRequestDto`)**:
```json
{
  "currentSetupStep": 3,
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
- `currentSetupStep` (int, required): Current step being submitted (`3`).
- `productStructure` (string, required): Allowed enum values: `"SIMPLE"`, `"VARIANT"`.
- `trackInventory` (boolean, required): Default `true`.
- `batchTracking` (boolean, required): Default `false`.
- `expiryTracking` (boolean, required): Default `false`.
- `serialTracking` (boolean, required): Default `false`.
- `advanceStep` (boolean, required): `false` for Save Draft; `true` for Continue.
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
  "currentSetupStep": 4,
  "draftSavedAt": "2026-08-09T01:49:07Z",
  "rowVersion": 5
}
```

> When Units are `NOT_APPLICABLE` (e.g. Track Inventory OFF), the advanced `currentSetupStep` is `5` instead of `4`.

#### Get Wizard Setup State (Resume Endpoint)
`GET /api/v1/tenant-admin/products/{productId}/setup`

**Response Body (`ProductSetupWizardDto` — HTTP 200 OK)**:
Exposes all persisted Step 2 Basic Details and Step 3 Type & Tracking state (including `productStructure`, `trackInventory`, `batchTracking`, `expiryTracking`, `serialTracking`, `currentSetupStep`, `rowVersion`, category/brand metadata) to restore the wizard.

---

### 8.9 Step-Aware Backend Architecture & Atomic Persistence

- Step 3 processing MUST NOT be routed through Step 2-only commands or generic unvalidated updaters.
- Backend architecture defines dedicated step processing:
  - Command: `SaveStep2DraftCommand`
  - Validators: `ValidateStep2Draft`, `ValidateStep2SaveAndContinue`
  - Service/Repo Method: `SaveStep2DraftAsync`
- **Atomic Database Transaction Scope**:
  Updating Step 3 executes inside a single PostgreSQL transaction:
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
  - When Step 2 draft exists before Step 4 (where UOMs are explicitly chosen), the backend resolves the tenant's default system base UOM (e.g. `PIECE` or `EACH` from `unit_of_measures` table where `uom_code = 'PIECE'`).
  - This system default UOM is set silently in `product_inventory_settings.inventory_uom_id`.
  - When the user completes Step 4 (Units & Pack Conversion), the selected Stock Counting UOM overwrites `inventory_uom_id`.
  - This internal fallback default is NOT exposed as an explicit user selection in Step 3 UI.

---

### 8.12 Draft Nullability & Default Fields

- `products.product_code`: Auto-slugged draft code generated on Step 2 Basic Details (e.g., `PROD-DRAFT-XXXXX`).
- `products.product_slug`: Auto-generated slug.
- `products.product_type`: Defaults to `'STANDARD'` for merchandise items.
- `products.product_structure`: Defaults to `'SIMPLE'` until changed in Step 3.
- All 4 columns retain valid `NOT NULL` strings in PostgreSQL during draft states.

---

### 8.13 Product Structure Change Rules (Destructive Transitions)

When a user navigates back to Step 3 and changes `productStructure` after downstream data exists (from Steps 4–7):

| Transition | Impact on Downstream Data | Invalidation / Cleanup Action | User Prompt Required |
|---|---|---|---|
| **VARIANT $\rightarrow$ SIMPLE** | Destroys Variant Matrix, Option Values, Variant SKUs/Prices | Invalidates Step 5 Variant Options & Matrix. Archives/deletes draft `product_variants` rows (except default). Resets Step 5 matrix to N/A. Forces revalidation of Steps 5 identifiers & 6. | **YES** ("Changing to Simple Product will remove all configured variants and option matrix. Proceed?") |
| **SIMPLE $\rightarrow$ VARIANT** | Requires Variant Matrix configuration | Re-enables Step 5 (Product Configuration) for Variant setup. Requires completing Step 5 before publish. | No data loss warning needed, but alerts user Step 5 is now required. |

---

### 8.14 Edit-Mode Safety Rules (Active Products with History)

When Step 3 is edited for an existing **`ACTIVE`** product (outside initial wizard draft):
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
  - Product Structure Badge (`SIMPLE`, `VARIANT`)
  - Primary Category & Brand
  - Inventory Tracking Badge (`Tracked` / `Not Tracked`)
  - Setup Step Progress Indicator (e.g. "Step 3 of 7 Completed")
- **SKU Note**: SKU is NOT assigned until Step 5. Product Summary displays `"SKU: Step 5"` or placeholder prior to Step 5.

---

### 8.17 Permission & Entitlement Model

- **Initial Wizard Creation (Steps 1–7)**: Authorized by `catalog.products.create`. A user with `catalog.products.create` can create drafts and execute `PUT /draft` calls on their own tenant **initial wizard drafts** without requiring `catalog.products.update`.
- **Product List Edit Mode / published product**: Authorized by `catalog.products.update`.
- **Resume GET `/setup`**: `catalog.products.view` **OR** `catalog.products.create` **OR** `catalog.products.update`.
- **Tenant Entitlement (Product Setup)**: Requires active feature entitlement **`product_catalog`**. `product_management` is the platform **module_code** only — it is not a runtime entitlement check.
- **Advanced Inventory Tracking Entitlement**: Non-empty Initial Tracking, Batch/Expiry/Serial policy ON, and publish identity rows require **`inventory_tracking`**. Quantity Track Inventory ON/OFF remains `product_catalog`. `inventory_management` is a documentation group name for stock operations — not a Product Setup runtime key.
- **Canonical permission authority**: `catalog.*` only. See [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].
- **Specialized permissions (required in addition to create/update where the subgraph is mutated):**
  - Images: `catalog.product_media.manage`
  - Channels: `catalog.product_channels.manage` (unauthorized channel fields ignored; defaults preserved)
  - VARIANT: `catalog.variants.manage`
  - BUNDLE: `catalog.combo_components.manage`
  - Barcode/SKU: `catalog.barcodes.manage`
  - Pricing/tax assignment: `catalog.product_pricing.manage`
  - Cost view/mutate: `catalog.product_cost.view`
  - Tax lookup TARGET: `pricing.tax_classes.view` / `pricing.tax_rates.view` (CURRENT runtime `tax.classes.view` / `tax.rates.view`, one-way map)
- **Publish**: `catalog.products.publish` **plus subgraph recheck** (BR-TRACK-018). Initial identity does **not** require `inventory.stock.adjust`.
- **Start eligibility**: wizard opens only with create + barcodes.manage + product_pricing.manage + tax-class view. VARIANT card disabled without variants.manage.
- **Missing Permission / Entitlement Failure**: Returns `403 Forbidden` (`product.permission_denied` / `product.entitlement_denied` / envelope `auth.forbidden`). Draft is not silently destroyed (BR-TRACK-020).

---

### 8.18 Audit Logging Requirements

Event logged on material Step 3 update: `PRODUCT_DRAFT_STEP3_UPDATED` (legacy audit name `PRODUCT_DRAFT_STEP2_UPDATED` may remain during migration).
- **Logged Properties**: `tenantId`, `productId`, `actorUserId`, `timestamp`, `oldProductStructure`, `newProductStructure`, `oldTrackInventory`, `newTrackInventory`, `oldBatchTracking`, `newBatchTracking`, `oldExpiryTracking`, `newExpiryTracking`, `oldSerialTracking`, `newSerialTracking`, `rowVersion`.

Initial Tracking TARGET events (existing `audit_logs` family; GAP until implemented): `PRODUCT_DRAFT_INITIAL_TRACKING_UPDATED`, `PRODUCT_DRAFT_INITIAL_TRACKING_CLEARED`, `PRODUCT_DRAFT_INITIAL_TRACKING_VARIANT_ASSIGNED`, `PRODUCT_PUBLISH_INITIAL_BATCH_CREATED`, `PRODUCT_PUBLISH_INITIAL_SERIAL_CREATED`. See Initial Tracking spec Audit Contract.

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
| **403** | `auth.forbidden` | Missing required permission or entitlement. | Envelope when specialized mapping is not used. |
| **403** | `product.permission_denied` | Missing required Product Setup permission. | Canonical Product Wizard 403. |
| **403** | `product.entitlement_denied` | Missing `product_catalog` or `inventory_tracking`. | Entitlement failure. |
| **404** | `product.not_found` | Product was not found or inaccessible. | Tenant isolation / invalid ID. |
| **409** | `product.concurrency_conflict` | Product was modified by another user. Refresh and try again. | Concurrency check failure. |
| **400** | `product.initial_tracking.incompatible_values_require_confirmation` | Incompatible identity values and confirm flag false. | Initial Tracking reconciliation. |
| **400** | `product.initial_tracking.batch_required_for_expiry` | Identity finalization with expiry and no Batch. | Distinct from toggle `BATCH_REQUIRED_FOR_EXPIRY`. |
| **400** | `product.initial_tracking.invalid_expiry_date` | Malformed expiry. | Initial Tracking. |
| **400** | `product.initial_tracking.variant_assignment_required` | VARIANT identity without assigned variant. | Option 2. |
| **400** | `product.initial_tracking.invalid_variant_assignment` | Variant not included/sellable/wrong product. | Option 2. |
| **400** | `product.initial_tracking.bundle_parent_not_supported` | Identity on BUNDLE parent. | BR-TRACK-015. |
| **409** | `product.initial_tracking.duplicate_batch` | Batch uniqueness vs `product_batches`. | Publish identity. |
| **409** | `product.initial_tracking.duplicate_serial` | Serial uniqueness vs `serial_numbers`. | Publish identity. |

---

### 8.20 Optimistic Concurrency Control

- Every Step 3 update request MUST supply `expectedRowVersion`.
- Server compares `expectedRowVersion` against `products.row_version`.
- If mismatched, request fails with `409 Conflict`. Response returns latest server `rowVersion` and updated draft state for reload.

---

### 8.21 Non-Functional Requirements (NFR)

- **Atomicity**: Step 3 structure and tracking flags save in a single PostgreSQL transaction.
- **Consistency**: UI, API, Domain entity, and Database columns must remain strictly synchronized.
- **Tenant Isolation**: All queries filter by authenticated `tenant_id`.
- **Performance**: Save Step 3 operation executes under 100ms (no N+1 queries). Wizard-wide NFRs including Initial Tracking: see Initial Tracking spec NFR-SEC/CON/TXN/IDEM/PERF/AUD/OBS/UX/ACC.
- **Idempotency**: Submitting the same Step 3 state repeatedly produces identical results without corrupting data.

---

### 8.22 Step 3 Automated Test Matrix

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
| **Navigation** | Save Draft from Step 3 | Step remains 3. `current_setup_step = 3`. `draft_saved_at` updated. |
| **Navigation** | Continue from Step 3 | Step advances based on structure (Units ON → Step 4; Units NOT_APPLICABLE → Step 5). |
| **Concurrency** | Stale `expectedRowVersion` | API returns `409 product.concurrency_conflict`. |
| **Security** | Missing `catalog.products.create` | API returns `403 auth.forbidden`. |
| **Transitions** | `VARIANT` $\rightarrow$ `SIMPLE` with existing variants | Destructive prompt shown; draft variants cleared upon confirmation. |
| **Audit** | Step 3 update success | Audit event `PRODUCT_DRAFT_STEP3_UPDATED` written (legacy name may remain). |

---

## 9. Cross-Step Business Rules (Steps 3 - 7)

### Step 4 — Unit & Pack Conversion Contract
- **Detailed Specification**: Refer to canonical specification [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]].
- **Unit Models**: Supports `SINGLE_UNIT` (Single Unit Only) and `MULTIPLE_UNITS` (Multiple Units & Pack Conversion).
- **Product-Specific Rule**: Unit package sizes and conversion multipliers are strictly PRODUCT-SPECIFIC. 1 Pack = 6 Pieces for Product A does NOT dictate 1 Pack for Product B. Global `unit_of_measures` stores UOM master types only (`PCS`, `PK`, `CTN`, etc.). Product conversion factors are stored in `product_unit_settings` and `product_unit_conversions`.
- **Applicability & Navigation Matrix** (Step 4 = Unit & Pack Conversion):
  - `SIMPLE` + Track Inventory ON: Step 4 REQUIRED → target Step 5.
  - `VARIANT` + Track Inventory ON: Step 4 REQUIRED at parent product level (variants inherit) → target Step 5.
  - `SIMPLE` + Track Inventory OFF: Step 4 `NOT_APPLICABLE` → target Step 5.
  - `VARIANT` + Track Inventory OFF: Step 4 `NOT_APPLICABLE` → target Step 5.
  - `BUNDLE` (Release 1): Parent tracking is forced `false` / component-based → Step 4 `NOT_APPLICABLE` → target Step 5.
- **Selling Unit Constraint**: Selling Unit MUST match Base Unit, Purchase Unit, or Outer Pack Unit.
- **Base Unit & Stock Ledger**: Base Unit serves as primary stock ledger unit (`inventory_uom_id` in `product_inventory_settings` synchronizes with `base_uom_id`).
- **Conversion Mathematics**: purchaseToBaseFactor = itemsPerPurchaseUnit; outerPackToBaseFactor = itemsPerPurchaseUnit * purchaseUnitsPerOuterPack.



### Step 5 — Product Configuration (matrix / bundle / identifiers)
- `SIMPLE`: Matrix N/A; identifier section still applies under Step 5.
- `VARIANT`: Generates Cartesian product of selected option values. Displays **Estimated Variant Count** live preview during attribute/value configuration (frontend-only; not authoritative). See [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification#3.4 Estimated Variant Count (Live UX Preview)]].
- `BUNDLE`: Selects component variants and fixed component quantities.

### Step 5 — Identifier section (standalone Barcode & SKU superseded)
- Canonical detail: [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]].
- SKU & Barcode uniqueness enforced tenant-wide (case-sensitive SKU after trim; barcode as string with leading zeros preserved).
- Every sellable product must have at least one `product_variants` row. Base SKU for `SIMPLE` / `BUNDLE` is stored on the default variant row.
- **VARIANT**: table-first Step 5 listing all included/sellable variants from the Step 5 matrix. Manual SKU only — **no Auto-generate SKUs** (except controlled no-barcode Step 1 candidate for one identity). Row checkbox selection is UI-only and must not change sellability.
- **SIMPLE / BUNDLE**: compact editors + one-row assignment table (green selected dot, Scan column, pencil). Apply commits then clears SKU/barcode inputs. Edit drawer hides Barcode Type in UI but still persists `barcodeType` / `identifierStandard`.
- Assignments must carry `barcodeType` and `identifierStandard` end-to-end; never hard-code `EAN13` on persist; never persist `GTIN14` as `barcodeType`.
- Continue validates **authoritative** Step 5 identifier coverage (not only client-submitted subset). SKU mandatory per included sellable variant; barcode optional when blank.
- `product_barcodes.barcode_type` already exists → **EF migration not required** for barcodeType DTO alignment. **`identifier_standard` is IMPLEMENTED** in Backend source via `20260912085454_AddProductSetupScannerIdentifierContext` (nullable; locally PostgreSQL-verified). **Production/shared apply not claimed.**

### Step 6 — Pricing & Tax

Canonical wizard step for commercial price + tax assignment. Structure-aware: SIMPLE/BUNDLE ≠ VARIANT.

Authority: [[../14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]] (TA-UJ-069).  
Inclusive/Exclusive ADR: [[../../13_DECISIONS_AND_CHANGES/TENANT_ADMIN_PRODUCT_TAX_INCLUSIVE_EXCLUSIVE_DECISION_2026-08-27]].

#### 6.1 Shared Pricing & Tax Rules

- **7-step wizard only.** No parallel Pricing module. No Product Setup currency dropdown.
- **Multi-country currency (LOCKED):** tenant-owned `tenants.base_currency_code` via `currencies` (ISO-4217). `GET create-options` returns `currencyCode`. UI uses it as prefix/label only — **do not hard-code `LKR`**. Backend may fall back to `LKR` only if tenant base currency is blank.
- **Persistence architecture (existing — do not invent new tables):**
  - Selling / compare prices → `price_list_items` on the tenant **default** price list (`selling_price`, `compare_at_price`, nullable `product_variant_id`).
  - Cost → `products.reference_cost_price` (**product-level only**; no variant cost column).
  - Tax mode → `products.is_tax_exclusive` (`taxExclusive` / TaxPriceMode; product-owned).
  - Tax assignment → `product_tax_assignments` (`tax_class_id` alias TaxSetupId/TaxClassId; nullable `product_variant_id`).
- **Tax Management owns** Tax Class, Tax Rate, Tax Treatment masters. Product Setup only **references** ACTIVE tax configuration. Product Setup must not create tax rates.
- **Inactive tax already assigned:** DEC-TAX-012 Option B — retain; cannot newly assign INACTIVE.
- **Exclusions:** No Margin %, no Price List picker on Step 6, no outlet price overrides, no Used For / Goods / Services on Product Setup tax UI.
- **Permissions:** `catalog.product_pricing.manage`; cost redaction `catalog.product_cost.view`; tax lookup `pricing.tax_classes.view` / `pricing.tax_rates.view`. Backend is authoritative for tenant/product/variant/tax ownership.
- **Draft vs Continue:** Save Draft may leave Step 6 incomplete. Continue / publish require structure-specific completeness below. Wire uses existing draft/wizard-create pipeline (no new Step 6 endpoint required).

#### 6.2 SIMPLE Product Pricing & Tax (CONFIRMED)

Journey: Scan → Basic Details → Type & Tracking → Unit & Pack → **Product Configuration identifiers** (matrix N/A for SIMPLE) → **Pricing & Tax** → Review.

One sellable identity (default `product_variants` row for SKU/barcode). **No variant price matrix.**

**UI (canonical):** Standard Selling Price *; Tax Class * (rate in dropdown label, e.g. `Standard Rate (15%)`); Tax Presentation Exclusive (default) / Inclusive; client Tax Preview. **No Cost Price, Discount Price, Effective Tax Rate field, or currency banner on this screen.**

**Persist mapping:**
| UI / DTO | Storage |
|---|---|
| `standardSellingPrice` (no discount) | `price_list_items.selling_price` (variant or product-null row for default identity) |
| `discountPrice` when present and &lt; standard | `selling_price` = discount; `compare_at_price` = standard |
| `costPrice` (optional; not on SIMPLE UI) | `products.reference_cost_price` when sent |
| `taxClassId` / `taxId` | `product_tax_assignments` |
| `taxExclusive` | `products.is_tax_exclusive` |

**Continue / wizard-create:** `standardSellingPrice > 0`; TaxClassId required; Cost **not** required. Tax Preview is Flutter-only estimate; sale-time tax is server-authoritative.

#### 6.3 VARIANT Product Pricing & Tax (CANONICAL TARGET)

**Business rule:** A VARIANT product has multiple independently sellable `ProductVariant` identities. Attributes (size, capacity, colour, pack, …) **may** change commercial value. Different variants **MAY** have different selling prices. Do **not** force one final selling price for all variants.

**Entry:** Step 5 Product Configuration matrix produces included/sellable combinations; Step 5 identifier section assigns SKU/barcode. Step 6 **prices existing variants only** — must not generate variants, change combinations, or generate SKU/barcode.

**Authoritative sell price** belongs to the sellable variant identity (`product_variants.id` / stable `clientCombinationKey` → `productVariantId`). Never use UI row index as identity.

**Set Same Price for All Variants** on this screen is a **bulk-entry helper only**. It is **not** the parent product’s authoritative sale price and must **not** be persisted as a substitute for per-variant prices. Entering a bulk amount alone must **not** silently overwrite existing variant prices. **Apply to All** is an explicit action; afterwards each row owns its value independently; editing one row does not affect others. Do **not** use the label “Default Selling Price” for this helper (misleading parent-price implication).

**UI contract — “Pricing & Tax — Variant Product”**  
Subtitle: “Set pricing and tax details for each variant. Prices are managed at variant level.”

| Section | Content |
|---|---|
| Product summary | Name, Variant Product badge, included variant count |
| Pricing status | Priced / Pending counts; **Price Range** derived from valid priced included variants (single price if only one; empty/pending if none) — never from the bulk helper input alone |
| Set Same Price for All Variants | Tenant currency prefix + amount + **Apply to All** only (no redundant toggle; no persisted `applyToAll` flag) |
| Variant pricing table | Variant, SKU, Selling Price (edit), Status (Priced/Pending — **derived**, not a DB enum), Actions — **no** “Default Price” column |
| Tax settings | Tax Class *; Effective Tax Rate (**read-only**, derived from selected Tax Class); note that tax applies with each variant’s selling price |
| Note | Each variant can have its own selling price; Apply to All sets a starting price then rows may be overridden |
| Footer | Back | Save Draft | Skip | Continue |

**Field ownership (architecture-locked):**

| Field | Ownership | Notes |
|---|---|---|
| Selling Price | **Per ProductVariant** → `price_list_items.selling_price` where `product_variant_id` set | Required for each **included/sellable** variant on Continue |
| Set Same Price for All Variants | UI helper only (`bulkSellingPrice` local state) | Not authoritative parent price; never serialize as product selling price |
| Cost Price | **Product-level** `products.reference_cost_price` | Not on VARIANT matrix UI for this contract; optional on persist |
| Discount Price | Not on VARIANT Step 6 R1 UI | Storage can use `compare_at_price` later; do not invent unsupported UI fields from screenshots alone |
| Tax Class + TaxPriceMode | **Product-common** values | Persist tax mode on product; fan-out same `tax_class_id` onto per-variant `product_tax_assignments` (existing pattern). No per-row Tax Class unless Tax Management later requires variant override |

**Status:** PRICED = included variant has selling price &gt; 0 and valid; PENDING = incomplete. Draft may save with mix of PRICED/PENDING. Continue requires **all included/sellable** variants PRICED + Tax Class + TaxPriceMode.

**Reconciliation with Step 5 Product Configuration (variant matrix):** Stable ProductVariantId / combination key preserves prices; excluded/tombstoned variants do not leak prices; new included variants start PENDING unless Apply to All is used. Never remap by display label alone.

**Conceptual wire shape (adapt to existing DTO names; extend — do not invent parallel APIs):**

```text
PricingTax {
  taxClassId, taxExclusive,
  costPrice?,                         // product-level optional
  // SIMPLE:
  standardSellingPrice?, discountPrice?,
  // VARIANT:
  // bulk helper is Flutter-only — do NOT send bulkSellingPrice / setSamePriceForAll
  variantPrices: [
    { productVariantId | clientCombinationKey, sellingPrice }
  ]
}
```

**CURRENT IMPLEMENTATION STATUS (2026-09-04):** Backend VARIANT per-variant pricing is implemented. Flutter VARIANT Step 6 UI is implemented; bulk helper wording is **Set Same Price for All Variants** (not Default Selling Price). Evidence: backend closure 2026-09-03; Flutter closure 2026-09-04; bulk UX refinement [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_STEP6_VARIANT_BULK_PRICE_UX_REFINEMENT_CLOSURE_2026-09-04]].

#### 6.4 Tax Management Integration

- Select Tax Class from ACTIVE create-options taxes.
- Effective rate / Exempt / 0% is **derived** from Tax Setup (Tax Class + effective Tax Rate + Tax Treatment).
- Inclusive (`taxExclusive = false`) / Exclusive (`taxExclusive = true`) is **product-owned**.
- SIMPLE may show client Tax Preview; VARIANT tax panel shows class + effective rate (sale calc still server-side using each variant price).

#### 6.5 Draft / Resume / Validation

- Resume restores structure-aware pricing graph, tax assignment, `taxExclusive`, and `rowVersion`.
- VARIANT resume restores per-variant selling prices keyed by ProductVariantId, derived Priced/Pending and price range.
- Security: reject cross-tenant / cross-product / stale variant IDs and inactive tax on **new** assignment.
- Monetary rules: valid decimals; tenant currency precision; if Discount used (SIMPLE path), Discount ≤ Standard Selling when both set.

### Step 7 — Review & Create
- Performs full server-side validation graph. Atomically updates `status` to `ACTIVE` or `INACTIVE`, sets `published_at`, and returns final Product DTO.
- Includes Channel Availability summary from **Step 2 Basic Details**.
- TARGET: display applicable **Initial Tracking Details** from remaining draft values (Batch + Expiry, or Serial) according to **Step 3** tracking policy. Do not display cleared/incompatible fields.
- VARIANT + remaining identities: require `initialTrackingAssignedVariantId` before publish (Option 2). SIMPLE identities use `product_variant_id` NULL. BUNDLE parent identities must already have been cleared.
- Publish MAY create identity-only `product_batches` / `serial_numbers` rows. It MUST NOT invent on-hand quantity, `stock_movements`, or cost layers. Opening Stock remains quantity owner.
- **Pricing on Review:** SIMPLE shows selling + tax presentation; VARIANT shows priced count / price range / tax class (per-variant detail as UI allows). Do not show a fake single parent selling price for VARIANT when variants differ.
- **Post-create success (canonical):** On Create Product HTTP success, Flutter shows the Product Created Successfully screen. Do **not** toast-only and do **not** auto-navigate to Product List. View Product → product detail. Add Another Product → fresh Step 1. Back to Products → list. List providers still invalidate so FR-RC-015 holds.

---

## 10. API Contract Summary

| Operation | Endpoint | Method | Permission | DTO / Contract |
|---|---|---|---|---|
| Create Options | `/api/v1/tenant-admin/products/create-options` | GET | `catalog.products.create` + `product_catalog` | `TenantProductCreateOptionsDto`. Canonical Product Setup Category source. Includes `taxes[]`, `barcodeTypes[]`, and **`currencyCode`** from `tenants.base_currency_code` (tenant ISO currency; blank tenant may backend-fallback `LKR`). **IMPLEMENTED:** single ACTIVE hierarchy-aware `categories[]` (levels 1–5). Apply **BR-CAT-PRODUCT-SELECT-001** for effective selectability. Do not call `/api/v1/categories/tree`. |
| Save Draft (create) | `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` + `product_catalog` | `SaveProductDraftRequestDto` -> `ProductDraftResponseDto` |
| Resume Draft | `/api/v1/tenant-admin/products/{id}/setup` | GET | view **OR** create **OR** update + `product_catalog` | `ProductSetupWizardDto` (redact cost/stock) |
| Update Draft Step | `/api/v1/tenant-admin/products/{id}/draft` | PUT | create (initial draft) **or** update + step specialized perms | `UpdateProductDraftStepRequestDto` |
| Stage Image | `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | Multipart -> `StagedImageResponseDto` |
| Final Publish | `/api/v1/tenant-admin/products/{id}/publish` | POST | `catalog.products.publish` + subgraph recheck + `product_catalog` | `PublishProductRequestDto` -> `TenantProductDetailDto` |

Canonical Product Wizard permissions (`catalog.*` only — no dual `tenant.products.*` authority):

- `catalog.products.view`
- `catalog.products.create`
- `catalog.products.update`
- `catalog.products.publish`
- `catalog.product_media.manage`
- `catalog.product_channels.manage`
- `catalog.variants.manage`
- `catalog.combo_components.manage`
- `catalog.barcodes.manage`
- `catalog.product_pricing.manage`
- `catalog.product_cost.view`
- Tax lookup TARGET: `pricing.tax_classes.view`, `pricing.tax_rates.view` (Tax Setup domain; see Tax Management canonical permissions)
- Bundle stock leak: `inventory.stock.view`

Full matrix: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

**Superseded (not canonical for Tenant Admin Add Product):**

- `POST /api/v1/tenant/catalog/media/stage`
- `POST /api/v1/media/stage`
- `tenant.products.create` / `tenant.products.update` as first-class wizard authorization (compatibility map only; see permission matrix)

---

## 11. Database Ownership & Traceability

- `products`: `current_setup_step`, `draft_saved_at`, `published_at`, `row_version`, `status`, `desired_publish_status`, `product_structure`
- `product_variants`: Variant sellable identities & SKUs
- `product_barcodes`: Barcode strings & UOM links
- `media_assets` + `product_images`: Canonical normalized Product media model (`STAGED` → `ACTIVE` on link)
- `product_channel_visibility`: POS and Online visibility flags
- `product_inventory_settings`: Track stock (`is_stock_tracked`), batch (`requires_batch_tracking`), expiry (`requires_expiry_tracking`), serial (`requires_serial_tracking`) flags
- **EXISTING** `product_setup_initial_tracking`: provisional **Step 3** Batch/Expiry/Serial draft values (not Product master identity). Migration: `20260824095742_AddProductSetupInitialTracking`. **Not** scanner-first B1.
- `product_setup_scan_context` schema/model is **IMPLEMENTED in B1** (`20260912085454_AddProductSetupScannerIdentifierContext`; local test DB verified; prod/shared apply not claimed). Remaining **TARGET** is **B8** draft-bootstrap write path / later hydration wiring — **not** the table itself. Final barcode ownership remains `product_barcodes`.

---

## 12. Validation Matrix

| Trigger | Rules Enforced | Failure Result |
|---|---|---|
| **Step 1 pre-draft** | Resolve / external-lookup / SKU-candidate only; **no** Product Save Draft | 401/403/422 as applicable; business outcomes are 200 |
| **Step 1 creation-path** | `POST .../products/draft` creates DRAFT + scan context; `current_setup_step = 2` | Pre-draft scans do not create rows |
| **Save Draft (Step 2 Basic Details)** | Category optional; Brand optional; blank Product Name → persist `Untitled Product`; no Initial Tracking fields | HTTP 400 with field errors |
| **Continue (Step 2 Basic Details)** | Real Product Name required; Category required; Brand optional; then `current_setup_step = 3` | Advances to Step 3 on success |
| **Save Draft (Step 3 Type & Tracking)** | Structure valid enum; Tracking combination valid; incompatible identity values require confirmation; `advanceStep = false` | Keeps on Step 3; returns updated `rowVersion` |
| **Continue (Step 3)** | Structure valid; Product Type confirmed; Tracking matrix valid; identity reconciliation complete; `advanceStep = true` | Advances to Step 4 or Step 5 (Units NOT_APPLICABLE) upon HTTP 200 OK |
| **Publish (Step 7)** | All 7 steps valid; SKU/Barcode unique; Price >= 0; Channels configured; initial tracking ownership/uniqueness/variant assignment/Bundle restriction | HTTP 400/409 error envelope, transaction rolls back |

---

## 13. Related Documents
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]]
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit]]
- [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]

## Step 4 — Unit & Pack Conversion (NOT_APPLICABLE for BUNDLE)
For `BUNDLE`: **Step 4** = `NOT_APPLICABLE`.
The Bundle parent does not configure Base Unit, Purchase Unit, Stock Unit, Selling Unit Conversion, Outer Pack, Pack Conversion, Multiple Unit Conversion, or Parent inventory conversion.
The user must NEVER enter the Step 4 Unit & Pack form. Save & Continue from Step 3 navigates directly to Step 5.

## Step 5 — Bundle / Kit Composition

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
- Save Draft allows 0, 1, or 2+ components. `currentSetupStep = 5`, `advanceStep = false`. Remains on **Step 5**.
- Save & Continue requires minimum 2 valid distinct components. On success: `currentSetupStep = 5`, `advanceStep = true`, `targetSetupStep = 6` (Pricing & Tax).
- Step 3 → Step 5 bypass of Step 4 for BUNDLE is unchanged (Units remain NOT_APPLICABLE).
