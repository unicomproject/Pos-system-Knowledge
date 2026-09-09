<!-- title: Tenant Admin Category Management Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-30 -->

# Tenant Admin Category Management Flutter Implementation Specification

## 1. Introduction

Permission-first Flutter contract for Tenant Admin Category Management.

```text
CANONICAL FLUTTER FEATURE ROOT:
lib/features/tenant_admin/categories/
```

This is a **new sibling** of `lib/features/tenant_admin/brands/`. It is **not** nested under `products/` and **not** under a fictional `catalog/` folder.

**CURRENT runtime:** no Category CRUD feature exists. `/tenant-admin/categories` renders `ProductsComingSoonScreen`. Product Setup pickers live in `products/` and stay there.

**Backend:** IMPLEMENTED / VERIFIED (2026-08-27). Flutter implementation **PENDING**.

## 2. CURRENT vs TARGET Ownership

| Location | CURRENT | TARGET |
|---|---|---|
| `lib/features/tenant_admin/categories/` | Absent | Feature root |
| `lib/features/tenant_admin/catalog/` | Absent (do not create) | NOT REQUIRED |
| `lib/features/tenant_admin/products/` | Coming Soon route + Product Setup pickers | Pickers only |
| Route | `/tenant-admin/categories` | Keep |
| Sidebar label | Categories & Subcategories | Keep (UI label) |
| Route title | Categories | Keep |

Target folders (Brand convention) — **PENDING implementation**:

```text
lib/features/tenant_admin/categories/
  data/datasources/category_remote_datasource.dart
  data/mappers/category_mapper.dart
  data/models/category_dto.dart
  data/repositories/category_repository_impl.dart
  domain/entities/category.dart
  domain/entities/category_list_query.dart
  domain/repositories/category_repository.dart
  presentation/providers/category_providers.dart
  presentation/providers/category_visibility_provider.dart
  presentation/screens/category_list_screen.dart
  presentation/widgets/category_table.dart
  presentation/widgets/category_tree_view.dart
  presentation/widgets/category_details_side_panel.dart
```

Wire `tenant_admin_router.dart` the same way Brand is wired (replace Coming Soon). Host in `TenantAdminSharedShell`.

## 3. Permission And Entitlement Matrix

Canonical backend permissions: `catalog.categories.view|create|update|delete|manage`  
Canonical entitlement: `product_catalog`

CURRENT Flutter:

- Route `permissionCode`: `tenant.categories.view`
- Aliases: `catalog.categories.view`, `category.view`
- `canViewCategoriesNav()` only
- Route `featureCode`: `catalog.product` (legacy UI key, **not** `product_catalog`)
- No create/update/delete Category checkers

TARGET Flutter (mirror Brand):

| Action | Visible when | Deep link without permission |
|---|---|---|
| Route / list / search / tree / details | `catalog.categories.view` OR `manage` (via aliases) **and** `product_catalog` | Forbidden / 403 state |
| Add Category | `catalog.categories.create` OR `manage` | Forbidden |
| Edit / parent change / status | `catalog.categories.update` OR `manage` | Forbidden |
| Delete / Archive | `catalog.categories.delete` OR `manage` | Forbidden |

`catalog.categories.manage` allows all Category management actions.

Entitlement check must resolve `product_catalog`. Map legacy route feature key one-way to `product_catalog`.

Product Setup pickers remain authorized by the Product Setup contract, not by `catalog.categories.manage`.

## 4. API Usage (IMPLEMENTED backend)

Datasource path: `/api/v1/categories` (same family as Brand `/api/v1/brands`).

| UI need | Call |
|---|---|
| Management list | `GET /categories` with `pageNumber`, `pageSize`, `search`, optional `status`, `parentCategoryId`, `rootOnly` |
| Hierarchy | `GET /categories/tree` (ACTIVE+INACTIVE; DELETED excluded) |
| Details / Edit prefill | `GET /categories/{id}` |
| Create | `POST /categories` — **no `departmentId`, no write `imageUrl`** |
| Edit / status / parent | `PUT /categories/{id}` — **no `departmentId`** |
| Archive | `DELETE /categories/{id}` |
| Image upload/replace | `POST /tenant-admin/categories/{id}/image` |
| Image remove | `DELETE /tenant-admin/categories/{id}/image` |

Product Setup picker is **not** owned by this feature. It stays in `lib/features/tenant_admin/products/` and calls `GET /api/v1/tenant-admin/products/create-options` only.

Do not call a children or PATCH-status endpoint.

Architecture: Presentation → Riverpod Provider → Use Case → Repository → Remote Data Source → Backend API. No Department field, state, or provider.

## 5. Form Limits

| Field | maxLength |
|---|---:|
| Code | 80 |
| Name | 150 |
| Description | 2000 |
| Slug | not a form field |

Department is **not** on the form, DTO, or request. Backend **does not** accept `departmentId`.

## 6. Media State Machine (TARGET Flutter)

```text
Saving Category
→ POST/PUT Category succeeds
→ optional image uploading (POST .../image)
→ success

OR

Category saved
→ image upload failed
→ partial-success state
→ allow Retry Image Upload (same Category id; do not recreate Category)
```

**BR-CAT-MEDIA-001:** Optional image failure must not rollback master Category save.

## 7. UI Rules

- Riverpod state. Widgets do not own business rules or call Dio.
- Loading, empty, error, duplicate, max-depth, delete-conflict, permission, entitlement, partial-success states.
- Tablet-first `1024 × 768` via shared shell (Brand list + side panel).
- Status not colour-only.
- Parent selector: ACTIVE only for create/re-parent; exclude self and descendants; depth ≤ 5.
- Product Setup picker: apply **BR-CAT-PRODUCT-SELECT-001** (Category + all ancestors ACTIVE).

## 8. Related Files

- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
- [[Brands_Management_Screen_Specification]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]
- [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]
