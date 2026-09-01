<!-- title: Tenant Admin Category Management UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-30 -->

# Tenant Admin Category Management UI/UX Specification

## 1. Introduction

UI states, interactions, and permission visibility for Tenant Admin Category Management.

Host: `TenantAdminSharedShell` (same composition as Brands).
Sidebar: Products expanded; child label **Categories & Subcategories**.
Route title: **Categories**.
Viewport: tablet-first **1024 × 768**. NFR-CAT-UX-001: no unnecessary whole-page vertical scrolling where the shared standard requires fixed-tablet layout.

**Subcategory** is a UI label for a child Category. It is not a second screen, entity, or form type.

## 2. Permission Visibility

| Permission | UI |
|---|---|
| `catalog.categories.view` (or manage) | Route, list, search, tree, details |
| `catalog.categories.create` (or manage) | Add Category |
| `catalog.categories.update` (or manage) | Edit, parent change, status |
| `catalog.categories.delete` (or manage) | Delete/Archive |
| `catalog.categories.manage` | All of the above |
| Entitlement `product_catalog` missing | Entire module inaccessible |

View-only hides Add/Edit/Delete. Deep links without permission show the existing Tenant Admin forbidden/403 pattern. No role-name checks.

## 3. Category List / Management Screen

* Hierarchy: indentation or tree-table; max visual depth 5.
* Read-only derived badges: child count, **direct** product count.
* Status indicator for ACTIVE/INACTIVE (not colour-only).
* Server-side pagination. Search debounce on Name and Code.
* Management dataset: ACTIVE and INACTIVE. DELETED excluded.
* Do not fetch Product Setup create-options to render this screen.

## 4. Add / Edit Category Screen

Fields: Category Name, Category Code, Parent Category (optional ACTIVE selector), Status, Description, Category Image (optional), Sort Order.

There is **no** Department, DepartmentId, Department selector, hidden Department field, default Department, or General Department.

Parent selector: searchable ACTIVE tree. Exclude the category being edited and its descendants. Max depth 5.

Slug is not a user field.

**Category media lifecycle (backend IMPLEMENTED):**

* **Create:** Step 1 `POST /categories` → master saved. Step 2 if image selected: `POST /tenant-admin/categories/{id}/image`.
* **Edit:** `PUT /categories/{id}` for master fields; `POST .../image` to upload/replace; `DELETE .../image` to remove.

**BR-CAT-MEDIA-001:** Category image is optional. If Category creation succeeds but image upload fails, Category remains saved. Show image upload failure and allow retry. Do not show overall Category create as failed when only optional media failed.

## 5. Delete / Archive Flow

Confirmation required. `409 category.delete_conflict` shows the server message (children vs product links). Do not silently reassign products.

## 6. UI States

* Loading: skeletons for table/tree and form.
* Empty: Add Category CTA if permitted.
* No search results: “No categories found for '…'”.
* Permission denied / entitlement disabled.
* Inline validation for required fields and canonical max lengths (Code 80, Name 150, Description 2000).
* Duplicate: `category.duplicate_code` / `category.duplicate_name`.
* Hierarchy: cycle and `category.max_depth_exceeded`.
* Parent inactive on create/re-parent: `category.parent_inactive`.
* Partial success: Category saved, image upload failed — show retry (**BR-CAT-MEDIA-001**).
* Success toasts for create, update, status, archive.

## 7. Product Setup Interaction

Product Setup **must** load categories from `GET /api/v1/tenant-admin/products/create-options` (`product_catalog` + `catalog.products.create`). Do not use Category Management `/categories/tree` or Category Flutter repositories.

**IMPLEMENTED backend:** recursive ACTIVE `categories[]` depth 1–5 (`id`, `categoryCode`, `categoryName`, `parentCategoryId`, `level`, `hierarchyPath`, `hasChildren`, `sortOrder`). Persist selected `categoryId` only.

**BR-CAT-PRODUCT-SELECT-001:** A Category is effectively selectable only when it is ACTIVE **and every ancestor is ACTIVE**. Example: Parent INACTIVE, Child ACTIVE → Child is **not** selectable. This does not change stored child status.

**HISTORICAL / LEGACY COMPATIBILITY:** prior create-options `categories` + `subCategories` was a flat child-Category representation, not a SubCategory entity.

Existing mapping to a later-inactivated Category may remain on Product Edit until the user chooses a replacement effectively selectable ACTIVE Category. No automatic reassignment.

## 8. Related Files

- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
- [[Brands_Management_Screen_Specification]]
- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]
