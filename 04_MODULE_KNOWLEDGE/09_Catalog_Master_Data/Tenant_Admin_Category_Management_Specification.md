<!-- title: Tenant Admin Category Management Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-30 -->

# Tenant Admin Category Management Specification

## 1. Module Overview

Operational Category Management contract. **Backend is IMPLEMENTED and VERIFIED** (2026-08-27). **Flutter and end-to-end journeys remain PENDING** (TA-UJ-035 … TA-UJ-039 NOT COMPLETE).

Recursive hierarchy only:

```text
Category
→ optional Parent Category
→ zero or many Child Categories
```

Maximum depth **5**. Root = level 1. There is **no** separate SubCategory entity, table, API resource, or Flutter domain model.

**Subcategory** is a business/UI label for a child Category. Sidebar may show **Categories & Subcategories**.

```text
CANONICAL BACKEND MODULE:
src/E_POS.{Domain|Application|Infrastructure}/Modules/Tenant/CatalogProduct/
src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/CategoriesController.cs
```

Do not create a parallel `CategoryManagement` bounded context.

```text
Department Model:
RESOLVED — CATEGORY DECOUPLED FROM DEPARTMENT (IMPLEMENTED)
```

ADR: [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]

Department remains a Catalog Master Data entity for **unrelated** modules only. It is **not** part of Category Create, Edit, Details, hierarchy, API, Flutter, or Product Setup Category selection.

## 2. Implementation Status Snapshot

| Layer | Status |
|---|---|
| Canonical contract | READY |
| Backend API / service / DB | **IMPLEMENTED / VERIFIED** |
| Flutter Category Management | **PENDING** |
| End-to-end journeys TA-UJ-035 … 039 | **NOT COMPLETE** |

| Concern | Current implemented backend |
|---|---|
| Recursive parent/child | Yes |
| Separate SubCategory entity | No |
| Department on Category | **Removed** — no `department_id`, no `DepartmentId` |
| Code uniqueness | Tenant-wide `UNIQUE (tenant_id, category_code)`; NormalizeCode = trim + uppercase |
| Name uniqueness | Tenant-wide including DELETED; `UNIQUE INDEX (tenant_id, LOWER(BTRIM(category_name)))` |
| Max depth 5 | Enforced including subtree moves |
| New/re-parent parent status | ACTIVE only |
| Entitlement `product_catalog` | Enforced at CategoryService |
| Tree API | `GET /api/v1/categories/tree` — ACTIVE+INACTIVE, DELETED excluded |
| Product Setup picker | Recursive ACTIVE `categories[]` depth 1–5 via create-options only |
| Category media | Upload/remove via tenant-admin media APIs; no write `imageUrl` on Create/Update |

## 3. Canonical Entity

```text
Category
├─ id
├─ tenant_id
├─ parent_category_id nullable
├─ category_code
├─ category_name
├─ category_slug
├─ description
├─ image_media_asset_id
├─ sort_order
├─ status
├─ created_at
├─ created_by_tenant_user_id
├─ updated_at
└─ updated_by_tenant_user_id
```

No Department fields.

## 4. Canonical Business Rules (BR-CAT)

* **BR-CAT-001:** Zero or one direct parent.
* **BR-CAT-002:** Zero or many children.
* **BR-CAT-003:** A category may be both child and parent.
* **BR-CAT-004:** `parent_category_id = NULL` = root (level 1).
* **BR-CAT-005:** A category cannot be its own parent.
* **BR-CAT-006:** Circular hierarchy is forbidden.
* **BR-CAT-007:** Parent and child must belong to the same tenant. Cross-tenant parent → `404 category.parent_not_found`.
* **BR-CAT-008:** Parent selection must not permit DELETED categories.
* **BR-CAT-009:** New parent or re-parent target must be **ACTIVE**. Applies when creating a child or changing `ParentCategoryId`. Does **not** block unrelated field edits when the existing parent later becomes INACTIVE.
* **BR-CAT-010:** Status: `ACTIVE`, `INACTIVE`, `DELETED`.
* **BR-CAT-011:** `DELETED` is soft-delete. Normal Tenant Admin management does not physically delete.
* **BR-CAT-012:** Only ACTIVE categories are selectable for **new** Product Setup mapping subject to **BR-CAT-PRODUCT-SELECT-001**. Any effectively selectable ACTIVE Category may be chosen (not leaf-only).
* **BR-CAT-013:** INACTIVE does not cascade to children and does not delete product mappings.
* **BR-CAT-014:** Cannot delete while non-DELETED children exist.
* **BR-CAT-015:** Cannot delete while non-DELETED product links exist.
* **BR-CAT-016:** `sort_order >= 0`.
* **BR-CAT-017:** Tenant is the ownership boundary. No Department ownership on Category.
* **BR-CAT-018:** `childCount` derived (non-DELETED immediate children).
* **BR-CAT-019:** `productCount` = **direct** valid `product_categories` mappings. Not descendant rollup.
* **BR-CAT-020:** `level` derived. Root = 1. Maximum = 5.
* **BR-CAT-021:** `hierarchyPath` derived. Do not persist. Do not persist path as Product identity.
* **BR-CAT-022:** Parent change updates derived path/level of the category and descendants.
* **BR-CAT-023:** Leaf = zero children. Not a second entity type.
* **BR-CAT-024:** Product mapping stores canonical `CategoryId` only. Selecting path `A > B > C` persists `C`. Do not auto-map ancestors.
* **BR-CAT-025 / BR-CAT-DEPTH-001:** Create: `newCategoryLevel <= 5`. Move: `newParentLevel + movedSubtreeRelativeDepth <= 5`. Failed validation = no partial mutation.
* **BR-CAT-026:** Category Code unique within Tenant (`NormalizeCode` = trim + ToUpperInvariant). 409 `category.duplicate_code`.
* **BR-CAT-027:** Category Name unique within Tenant (trim; case-insensitive compare). **Tenant-wide, including DELETED.** 409 `category.duplicate_name`.
* **BR-CAT-028:** Category has **no** Department relationship.
* **BR-CAT-029:** Inactivating a Category does not delete `product_categories`. The Category cannot be newly selected for Product Setup.
* **BR-CAT-030:** Media must be same-tenant (composite FK).
* **BR-CAT-PARENT-EDIT-001:** **EXECUTED IN BACKEND.** If parent P becomes INACTIVE, child C remains linked to P. Editing C's name/description/sort/image without changing `ParentCategoryId` is **allowed**. Changing C's parent to an INACTIVE Category is **denied** (`400 category.parent_inactive`).
* **BR-CAT-PRODUCT-SELECT-001:** **Backend: ENFORCED.** **Flutter: PENDING.** A Category is effectively selectable for Product Setup only when the Category itself is ACTIVE **and every ancestor in its hierarchy path is ACTIVE**. Enforced in `GET /tenant-admin/products/create-options`, Product create, and new/replacement Product category assignment. Example: Parent A = INACTIVE, Child B = ACTIVE → **B is not selectable** and direct API assignment with B is rejected.
* **BR-CAT-MEDIA-001:** Category image is optional. If Category create/update succeeds but image upload fails, the Category remains saved; show image failure and allow retry. Do not rollback master-data save for optional media failure.

Writes: ACTIVE or INACTIVE. Archive: → DELETED.

## 5. Functional Requirements (FR-CAT)

* **FR-CAT-001 … FR-CAT-024:** Browse, search, pagination, tree, details, create root/child, edit, move parent, activate/inactivate, archive, child count, product count, permission-based actions, tenant isolation, loading/error contracts.
* **FR-CAT-025:** Create/update/detail without Department.
* **FR-CAT-026:** Product Setup recursive ACTIVE picker depth 1–5 via create-options; apply **BR-CAT-PRODUCT-SELECT-001** when determining selectable options.
* **FR-CAT-027:** Category image upload/replace/remove via dedicated media APIs.
* **FR-CAT-028:** Partial-success UX when master save succeeds but optional image upload fails (**BR-CAT-MEDIA-001**).

## 6. Permission And Entitlement

```text
Authenticated Tenant User
→ Valid Tenant Context
→ Active Tenant
→ product_catalog
→ catalog.categories.{view|create|update|delete}
   OR catalog.categories.manage
→ same-tenant Category validation
→ operation
```

Category media upload/remove additionally requires `catalog.categories.update` OR `catalog.categories.manage` plus `product_catalog`.

Product Setup category lookup uses Product Setup contract (`catalog.products.create` + `product_catalog`). Category management permission is not required to pick a category on a product.

Entitlement behavior:

| Condition | Result |
|---|---|
| `product_catalog` disabled | 403 `category.entitlement_denied` |
| Category permission missing | 403 `category.permission_denied` |
| Entitlement evaluator infrastructure failure | Safe 500 `category.unexpected_failure` |
| Cancellation | Propagate |

## 7. API Contract

Base: `/api/v1/categories` · `CategoriesController` · `TenantOnly`

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/v1/categories` | IMPLEMENTED |
| GET | `/api/v1/categories/tree` | IMPLEMENTED |
| POST | `/api/v1/categories` | IMPLEMENTED |
| GET | `/api/v1/categories/{id}` | IMPLEMENTED |
| PUT | `/api/v1/categories/{id}` | IMPLEMENTED |
| DELETE | `/api/v1/categories/{id}` | IMPLEMENTED |
| POST | `/api/v1/tenant-admin/categories/{categoryId}/image` | IMPLEMENTED |
| DELETE | `/api/v1/tenant-admin/categories/{categoryId}/image` | IMPLEMENTED |
| GET | `/api/v1/categories/{id}/children` | REDUNDANT — use `parentCategoryId` |
| PATCH | `/api/v1/categories/{id}/status` | REDUNDANT — PUT owns status |

List query: `pageNumber`, `pageSize`, `search` (Name and Code), `status`, `parentCategoryId`, `rootOnly`. **No Department filter.** Default sort: roots first, then `sort_order`, then `category_code`.

Tree:

```text
GET /api/v1/categories/tree
Returns: ACTIVE + INACTIVE
Excludes: DELETED
Authorization: product_catalog + catalog.categories.view OR catalog.categories.manage
```

The optional `status` query parameter is **removed** from the implemented API. Canonical contract:

```http
GET /api/v1/categories/tree
```

Returns ACTIVE+INACTIVE, DELETED excluded, real hierarchy preserved (no fake-root promotion).

Product Setup:

```text
GET /api/v1/tenant-admin/products/create-options
Statuses: ACTIVE categories[] only (apply BR-CAT-PRODUCT-SELECT-001 for effective selectability)
Hierarchy: levels 1–5
Identity persisted: CategoryId
Authorization: product_catalog + catalog.products.create
```

Product Setup **must not** call `GET /categories/tree`.

## 8. Request / Response

Create/Update request: `categoryCode`, `name`, `parentCategoryId?`, `status`, `description?`, `sortOrder`. Optional `categorySlug` (else generated). **No `departmentId`. No write `imageUrl`.**

Detail/Edit response:

```text
id
parentCategoryId, parentCategoryCode, parentCategoryName
categoryCode, categoryName, categorySlug, description
imageMediaAssetId, imageUrl (derived from media)
status, sortOrder
createdAt, updatedAt
level, hierarchyPath, childCount, productCount, hasChildren (derived)
```

## 9. Error Contract

| Code | HTTP | When |
|---|---|---|
| `category.validation_failed` | 400 | Field validation |
| `category.parent_inactive` | 400 | New/re-parent to INACTIVE parent |
| `category.parent_self_reference` | 400 | Self-parent |
| `category.parent_cycle` | 400 | Cycle |
| `category.max_depth_exceeded` | 400 | Depth > 5 |
| `category.permission_denied` | 403 | Missing permission |
| `category.entitlement_denied` | 403 | `product_catalog` disabled |
| `category.unexpected_failure` | 500 | Entitlement infra failure |
| `category.not_found` / `category.parent_not_found` | 404 | Cross-tenant or missing |
| `category.duplicate_code` | 409 | Tenant-wide code conflict |
| `category.duplicate_name` | 409 | Tenant-wide name conflict |
| `category.delete_conflict` | 409 | Children or product links |
| `media.save_failed` / `media.unexpected_failure` | 500 | Safe media errors |

Database unique violations map deterministically via `DatabaseExceptionMapper`: `uq_categories_tenant_id_category_code` → `category.duplicate_code`; `uq_categories_tenant_id_normalized_category_name` → `category.duplicate_name`.

## 10. Canonical Lengths (IMPLEMENTED)

| Field | Max |
|---|---:|
| Category Code | **80** |
| Category Name | **150** |
| Category Slug | **180** |
| Description | **2000** |

Validator, domain, EF, and PostgreSQL are aligned.

## 11. Field Traceability

| Concern | Backend | DB | Flutter |
|---|---|---|---|
| Core persisted fields | IMPLEMENTED | IMPLEMENTED | PENDING |
| Derived hierarchy fields | IMPLEMENTED | N/A (derived) | PENDING |
| Media via dedicated APIs | IMPLEMENTED | IMPLEMENTED | PENDING |
| Department fields | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE |

No `normalized_category_name` column. Name uniqueness uses expression index `LOWER(BTRIM(category_name))`.

## 12. Database (IMPLEMENTED)

Migration: **`20260827140000_DecoupleCategoryFromDepartment`**

Current schema:

* No `department_id`
* `UNIQUE (tenant_id, category_code)`
* `UNIQUE INDEX (tenant_id, LOWER(BTRIM(category_name)))`
* Composite parent FK `(tenant_id, parent_category_id) → categories(tenant_id, id)`
* Description `varchar(2000)` + CHECK
* `product_categories` mappings preserved

**CAT-MIG-PREFLIGHT-001** checks before migration:

* Duplicate normalized code/name per tenant
* Dangling parent, cross-tenant parent, self-parent, parent cycle, hierarchy depth > 5

On conflict: **STOP SAFELY**. No silent merge/rename/delete/ID regeneration/product remapping.

Rollback: **forward-only**. Restore from database backup.

## 13. Product Setup Integration (IMPLEMENTED backend)

Canonical source: **`GET /api/v1/tenant-admin/products/create-options`** only.

* Single hierarchy-aware `categories[]` depth 1–5
* Fields: `id`, `categoryCode`, `categoryName`, `parentCategoryId`, `level`, `hierarchyPath`, `hasChildren`, `sortOrder`
* Backend enforces **BR-CAT-PRODUCT-SELECT-001** in create-options and Product create/update (new/replacement mapping)
* Persist selected `categoryId` only
* Existing inactive mapping may remain on Product Edit; replacement uses effectively selectable ACTIVE Category only

**HISTORICAL:** prior two-list `categories` + `subCategories` was a LEGACY FLAT child-Category representation, not a SubCategory entity.

## 14. NFR

* Security, performance, transaction, audit, observability, accessibility, and tablet-first rules unchanged from gap-closure lock.
* Audit covers create, update, parent move, status change, archive, image upload, image remove.

## 15. Journey Status

TA-UJ-035 … TA-UJ-039: **NOT COMPLETE**. Backend contract + implementation complete. Flutter implementation pending. Do not mark journeys COMPLETE because backend exists.

## 16. Related Files

- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]
- [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_PERMISSION_FIRST_BACKEND_IMPLEMENTATION_CLOSURE_2026-08-27]]
- [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]
- [[../../03_USER_JOURNEYS/Tenant_Admin/08_Category_Brand_Management_Flow]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Category_Management_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Category_Management_Flutter_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/07_CatalogProduct/Tenant_Admin_Category_Management_QA_Contract]]
