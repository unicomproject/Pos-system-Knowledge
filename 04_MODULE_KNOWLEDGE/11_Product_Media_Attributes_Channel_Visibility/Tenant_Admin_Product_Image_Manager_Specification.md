<!-- title: Tenant Admin Product Image Manager Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS Unified Commerce Scope -->
<!-- last_updated: 2026-08-08 -->

# Tenant Admin Product Image Manager Implementation Specification

## 1. Overview & Architectural Purpose

This specification defines the canonical UI/UX, state management, API lifecycle, authorization, database mapping, and technical contracts for the **Product Image Manager** in the **Tenant Admin Add Product Wizard (Step 1)**.

It replaces the legacy permanently expanded, large inline image drop-zone gallery (Reference Image 2 style) with the approved **Reference Image 1** compact interaction pattern:

- **Step 1 View**: A compact **Product Image upload card** containing the primary action button `"Upload Product Image"`.
- **Panel Overlay / Slide-out**: Clicking `"Upload Product Image"` opens a compact, floating/overlay **Product Images Manager** panel alongside the Step 1 form without navigating away from the wizard or resetting form state.
- **Image Staging & Persistence**: Images uploaded during a fresh Add Product wizard session are safely staged or linked to a draft product transactionally.
- **Canonical Terminology**: All UI and backend references use **Primary Image** (legacy term `Cover` is deprecated).

---

## 2. Canonical Target UI & Interaction Flow

### 2.1 Step 1 Normal View (Compact Card)
The Add Product Step 1 main form displays:
- Left Column: Product Name, Short Name / Internal Code, Category, Brand, Short Description, Long Description.
- Right Column: Status & Options Card (Top) and **Product Image Upload Card** (Bottom).
- Product Image Upload Card Details:
  - Header: `Product Image`
  - Action Button: `Upload Product Image` (Primary Outlined / Filled Button)
  - Helper Subtext: `PNG, JPG up to 5MB`
  - Thumbnail Preview Strip: If images exist, displays up to 3 compact 40x40px round-corner thumbnails with a small `Primary` indicator badge on the first image.

> [!NOTE]
> The main Step 1 form MUST NOT permanently render the legacy expanded black drop-zone gallery or empty grid tiles.

### 2.2 Upload Product Image Click Behaviour
Clicking `Upload Product Image`:
1. Opens the **Product Images Manager** overlay/slide-out panel.
2. The main Step 1 form remains visible underneath/beside the panel.
3. No route navigation occurs (`/tenant-admin/products/add` route is preserved).
4. Unsaved wizard form fields (Product Name, Category, etc.) are strictly preserved in Riverpod state.

---

## 3. Product Images Manager Panel Specification

### 3.1 Panel Layout & Header
- **Title**: `Product Images`
- **Close Button**: `X` icon on top-right. Clicking `X` closes only the panel overlay and returns focus to the Step 1 upload card.
- **Image Counter**: Displays `N / 10` (e.g., `0 / 10`, `5 / 10`). Maximum allowed images: **10**.
- **Helper Instruction**: `Drag & drop to reorder images`.

### 3.2 Compact Thumbnail Grid & Tile Actions
The panel renders a compact grid of image tiles (maximum 10 items):
- **Image Tile Anatomy**:
  - Image Preview (aspect ratio 1:1, object-fit cover, subtle border).
  - **Drag Handle** (`Icons.drag_indicator` or `Icons.reorder`): Enables mouse drag and touch drag to reorder.
  - **Primary Badge**: Visible pill badge labeled `Primary` on the current primary image tile.
  - **Delete Icon**: `Icons.delete_outline` overlay on hover/touch.
  - **Click Action**: Clicking a non-primary image tile sets it as Primary.

### 3.3 Upload More Tile & Guidelines Card
- **Upload More Tile**: Rendered as the final grid slot when `current_count < 10`.
  - Icon: `Icons.add_photo_alternate_outlined`
  - Label: `Upload More`
  - Subtext: `PNG, JPG up to 5MB`
  - Disabled State: When counter reaches `10 / 10`, `Upload More` becomes disabled with tooltip `"Maximum 10 product images allowed"`.
- **Image Guidelines Card**:
  - `Front image is recommended as primary.`
  - `Use high quality images for better visibility.`
  - `Supported formats: PNG, JPG.`
  - `Maximum file size: 5MB per image.`

### 3.4 Replace Images Action
- **Header Button**: `Replace Images` (Outlined action button in panel header).
- **Behaviour**: Triggers native file selection dialog. When new file(s) are selected, replaces either the currently active/selected image tile or prompts confirmation `"Replace all existing product images with selected files?"` before overriding the staging queue.

---

## 4. Business Rules & Domain Lifecycle (IMG-BR)

| Rule ID | Name | Description & Technical Enforcement |
|---|---|---|
| **IMG-BR-001** | Tenant Isolation | Product images are strictly scoped to `tenant_id`. Cross-tenant media linking is prohibited at API and DB FK layers. |
| **IMG-BR-002** | Maximum Image Count | Maximum **10** images per product. Client disables upload at 10; server rejects 11th image with HTTP 400 (`media.max_images_exceeded`). |
| **IMG-BR-003** | File Size Limit | Maximum file size is **5 MB** (5,242,880 bytes). Server rejects oversized files with HTTP 413 or HTTP 400 (`media.file_size_exceeded`). |
| **IMG-BR-004** | Allowed Formats & MIME | UI displays `PNG, JPG`. Server validates MIME type strictly allowing `image/png`, `image/jpeg`. `image/webp` may be accepted only as **LEGACY COMPATIBILITY** and is **not** part of the new Add Product UI contract. |
| **IMG-BR-005** | Primary Image Uniqueness | Exactly **one** image must have `is_primary_image = true` when image set is non-empty. Enforced by partial unique index `uq_product_images_tenant_product_primary`. |
| **IMG-BR-006** | Automatic Primary Assignment | The first successfully added/uploaded image automatically receives `is_primary_image = true`. |
| **IMG-BR-007** | Reorder Independence | Drag-and-drop reordering updates `sort_order` (1, 2, 3...) but DOES NOT silently change the Primary image unless the user explicitly drags an item to position 1 AND primary auto-reassign rule is enabled. |
| **IMG-BR-008** | Primary Deletion Rule | If the Primary image is deleted, the system automatically designates the next remaining image (lowest `sort_order`) as the new Primary image. |
| **IMG-BR-009** | Atomic Replacement Safety | Failed image replacements restore the previous valid image state without partial data loss or broken image URLs. |
| **IMG-BR-010** | Staging Cleanup | Unlinked media assets staged during abandoned Add Product wizard sessions are soft-deleted or cleaned via background job after 24 hours. |
| **IMG-BR-011** | Wizard State Isolation | Opening or closing the Product Images Manager panel MUST NOT mutate or discard unrelated Step 1 fields (Product Name, Category, etc.). |

---

## 5. Fresh Product vs Staged Media Lifecycle (Resolution)

When the merchant creates a **fresh product** (`productId` is NULL):

1. **Option Selected: Staged Session Upload Architecture (`IMPLEMENTED — CANONICAL`)**:
   - Clicking `Upload Product Image` / selecting files invokes `POST /api/v1/tenant-admin/products/images/stage`.
   - The backend validates the file, stores it in tenant blob storage, inserts a record into `media_assets` (`status = 'STAGED'`, `asset_purpose = 'PRODUCT_IMAGE'`), and returns `mediaAssetId`, `publicUrl`, `mimeType`, `fileSizeBytes`, and `status = STAGED`.
   - The Flutter wizard controller holds `stagedMediaAssets` array in `AddProductWizardState`.
   - When the user clicks `Save Draft` or `Save & Continue`:
     1. Minimal `Product` entity is persisted in DB (`status = 'DRAFT'`).
     2. Staged media items are transactionally linked into `product_images` (`product_id = newProduct.Id`, `media_asset_id = mediaAssetId`, `is_primary_image = true/false`, `sort_order = index`).
     3. Backend updates `media_assets.status = 'ACTIVE'`.
2. **Draft Product Edit/Resume**:
   - Uploads directly call `POST /api/v1/products/{productId}/images` against the existing `productId` (permission: `catalog.product_media.manage`).

> [!WARNING]
> **Superseded routes (NOT canonical for Tenant Admin Add Product):**
> - `POST /api/v1/tenant/catalog/media/stage` — historical draft wording; do not implement as alternate current contract.
> - `POST /api/v1/media/stage` — task-only duplicate; removed / not canonical.

---

## 6. Backend API Contracts & Endpoints

### 6.1 Upload Staged Image (Fresh Wizard) — CANONICAL
`POST /api/v1/tenant-admin/products/images/stage` `[IMPLEMENTED — CANONICAL]`
- **Permission**: `catalog.product_media.manage`
- **Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <guid>`
- **Content-Type**: `multipart/form-data`
- **Request Body**: `file` (IFormFile), `uploadSessionId` (Guid?)
- **Success Response (200 OK)**:
```json
{
  "data": {
    "mediaAssetId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "publicUrl": "https://cdn.oneverz.com/tenants/tenant-123/media/img_001.png",
    "fileName": "product_front.png",
    "mimeType": "image/png",
    "fileSizeBytes": 1420500,
    "createdAt": "2026-08-08T16:30:17Z",
    "status": "STAGED"
  }
}
```

### 6.2 Upload Product Image (Existing Draft/Product)
`POST /api/v1/products/{productId}/images` `[EXISTS — REUSE / EXISTING SHARED]`
- **Permission**: `catalog.product_media.manage`
- **Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <guid>`
- **Content-Type**: `multipart/form-data`
- **Request Body**: `file` (IFormFile), `productVariantId` (Guid?), `altText` (string?), `sortOrder` (int?), `isPrimaryImage` (bool?)
- **Success Response (200 OK)**:
```json
{
  "data": {
    "productImageId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "mediaAssetId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "productId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "publicUrl": "https://cdn.oneverz.com/tenants/tenant-123/media/img_001.png",
    "isPrimaryImage": true,
    "sortOrder": 1,
    "fileName": "product_front.png",
    "mimeType": "image/png",
    "fileSizeBytes": 1420500
  }
}
```

### 6.3 Batch Reorder & Set Primary Endpoint
`PUT /api/v1/products/{productId}/images/reorder` `[IMPLEMENTED — EXISTING SHARED]`
- **Permission**: `catalog.product_media.manage`
- **Request DTO**:
```json
{
  "expectedRowVersion": 3,
  "primaryProductImageId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "items": [
    { "productImageId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "sortOrder": 1 },
    { "productImageId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", "sortOrder": 2 }
  ]
}
```
- **Success Response (200 OK)**: Returns updated list of `ProductImageDto` and new `rowVersion`.

### 6.4 Delete Product Image Endpoint
`DELETE /api/v1/products/{productId}/images/{productImageId}` `[IMPLEMENTED — EXISTING SHARED]`
- **Permission**: `catalog.product_media.manage`
- **Response**: `200 OK` or `204 No Content`. If Primary is deleted, returns remaining items with the updated Primary marked.

---

## 7. Database Mapping & Ownership

### 7.1 Entity Relationship Diagram Concept
`media_assets` (1) ───< `product_images` (N) >─── (1) `products`

### 7.2 Table Schemas
- `media_assets` table (`EXISTS — REUSE`):
  - `id` (UUID, PK)
  - `tenant_id` (UUID, FK -> tenants)
  - `storage_key` (VARCHAR 500, UNIQUE with container)
  - `public_url` (VARCHAR 1000)
  - `asset_type` (VARCHAR 50, CHECK 'IMAGE')
  - `asset_purpose` (VARCHAR 50)
  - `file_size_bytes` (BIGINT, CHECK > 0)
  - `mime_type` (VARCHAR 100)
  - `status` (VARCHAR 50, CHECK IN 'ACTIVE', 'INACTIVE', 'STAGED', 'DELETED')
- `product_images` table (`EXISTS — REUSE`):
  - `id` (UUID, PK)
  - `tenant_id` (UUID, FK)
  - `product_id` (UUID, FK -> products)
  - `media_asset_id` (UUID, FK -> media_assets)
  - `is_primary_image` (BOOLEAN, DEFAULT FALSE)
  - `sort_order` (INT, DEFAULT 0)
  - `image_purpose` (VARCHAR 50)
  - `status` (VARCHAR 50, DEFAULT 'ACTIVE')

---

## 8. Authorization & Permissions Matrix

| Operation | Canonical Permission Required | Authorization Scope | Notes |
|---|---|---|---|
| Stage Image (Fresh Wizard) | `catalog.product_media.manage` | Tenant Admin / Merchant | Plus tenant ownership of staged asset |
| Upload Product Image (Draft/Published) | `catalog.product_media.manage` | Tenant Admin / Merchant | Plus product tenant ownership |
| Reorder / Set Primary | `catalog.product_media.manage` | Tenant Admin / Merchant | `catalog.products.update` alone is **not** sufficient |
| Delete Product Image | `catalog.product_media.manage` | Tenant Admin / Merchant | Same as above |
| Replace Images | `catalog.product_media.manage` | Tenant Admin / Merchant | Atomic replace |

> [!IMPORTANT]
> **Superseded permissions (NOT current for Product Image Manager):**
> `tenant.products.create`, `tenant.products.update`, and any `create OR update OR media.manage` fallback.
> Use only the canonical catalogue in [[02_ACCESS_CONTROL/Permission_Code_List]].

---

## 9. Flutter Implementation Architecture

### 9.1 File Structure & Component Composition
```text
lib/features/tenant_admin/products/presentation/widgets/
├── product_image_upload_card.dart     [NEW] Step 1 compact upload card
├── product_images_manager_panel.dart  [NEW] Overlay / slide-out panel
├── product_image_tile.dart            [NEW] Grid item thumbnail & actions
└── product_image_guidelines_card.dart [NEW] Guideline info widget
```

### 9.2 State Machine States
1. `IDLE`: Normal Step 1 compact card.
2. `MANAGER_OPEN`: Floating panel open; user interacting with grid.
3. `UPLOADING`: Progress indicator on tile / upload button.
4. `ERROR`: Validation error banner shown inside panel; previous state intact.
5. `REORDERING`: Drag action in progress; optimistic UI update.

---

## 10. Traceability Matrix

| Requirement | UI Element | Controller Action | API Endpoint | DB Table.Column | Status |
|---|---|---|---|---|---|
| Compact Upload Card | `ProductImageUploadCard` | `openImageManager()` | N/A | N/A | TARGET |
| Panel Overlay | `ProductImagesManagerPanel` | `closeImageManager()` | N/A | N/A | TARGET |
| Fresh Image Staging | `Upload More Tile` | `stageImage(file)` | `POST /api/v1/tenant-admin/products/images/stage` | `media_assets.status='STAGED'` | IMPLEMENTED |
| Upload Product Image | `Upload Product Image` button | `uploadImage(productId, file)` | `POST /api/v1/products/{id}/images` | `product_images` | EXISTS |
| Reorder Images | Drag handle | `reorderImages(items)` | `PUT /api/v1/products/{id}/images/reorder` | `product_images.sort_order` | IMPLEMENTED |
| Set Primary | Tile click / Badge | `setPrimary(imageId)` | `PUT /api/v1/products/{id}/images/reorder` | `product_images.is_primary_image` | IMPLEMENTED |
| Delete Image | Delete icon | `deleteImage(imageId)` | `DELETE /api/v1/products/{id}/images/{imageId}` | `product_images.status='DELETED'` | IMPLEMENTED |
