<!-- title: Tenant Admin Category Management Final Contract Hardening -->
<!-- status: Historical / Superseded by post-backend sync 2026-08-30 -->
<!-- superseded_by: TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_POST_BACKEND_SYNC_2026-08-30 -->

# Tenant Admin Category Management Final Contract Hardening (2026-08-27)

## Purpose

Remove the last implementation ambiguities before permission-first Backend work.

Does **not** reopen: recursive Category, no SubCategory entity, Department decoupling, tenant-wide uniqueness, lengths, permissions, entitlement, depth 5, ACTIVE parent.

Prior authority remains:

- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]
- [[TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_FINAL_CONTRACT_CLOSURE_2026-08-27]]

Runtime code was not changed.

## 1. Product Setup Category source — LOCKED

Ambiguity **removed**: Product Setup must **not** call `GET /api/v1/categories/tree`.

| Use case | Canonical API | Statuses | Authorization |
|---|---|---|---|
| Category Management tree | `GET /api/v1/categories/tree` | ACTIVE + INACTIVE (DELETED excluded) | `product_catalog` + `catalog.categories.view` OR `manage` |
| Product Setup picker | `GET /api/v1/tenant-admin/products/create-options` | ACTIVE only | Product Setup: `product_catalog` + `catalog.products.create` |

Backend may share **internal** Category query services. Authorization stays use-case-owned.

`catalog.categories.view` is **not** required for Product Setup category selection.

## 2. Create-options TARGET shape

CURRENT LEGACY RUNTIME:

- `categories` = ACTIVE roots
- `subCategories` = ACTIVE non-roots (`parentCategoryId`)
- Classification: legacy flat child-Category representation, not a SubCategory entity

TARGET API CHANGE (no invented compatibility window):

- Single collection `categories` of hierarchy-aware options covering levels 1–5
- C# TARGET: extend `TenantAdminProductCategoryOptionResponse` (JSON `categories[]`)
- Fields: `id`, `categoryCode`, `categoryName`, `parentCategoryId`, `level`, `hierarchyPath`, `hasChildren`, `sortOrder`
- `level` / `hierarchyPath` / `hasChildren` are derived; not persisted
- Flutter Product Setup stays in `lib/features/tenant_admin/products/` and consumes create-options only

Persist selected `categoryId` only. No ancestor auto-mapping. Any ACTIVE Category selectable.

## 3. Normalization — LOCKED

No persisted `normalized_category_name` column. Project pattern: persist codes already-normalized (Brand/Category `ToUpperInvariant`); names stay display-cased with expression unique indexes when case-insensitive uniqueness is required. Do not introduce `citext` for Category.

### Category Code

- Input: `CategoryConstants.NormalizeCode` = trim + `ToUpperInvariant`
- Persisted: uppercase trimmed code (`varchar(80)`)
- App duplicate check: same normalized value, tenant-wide, including DELETED
- DB TARGET: `UNIQUE (tenant_id, category_code)` on the **stored** column
- `ABC` and `abc` both persist as `ABC` → conflict. 409 `category.duplicate_code`

### Category Name

- Input: trim (existing `Category.Create` / `UpdateProfile`)
- Persisted: trimmed original casing (`varchar(150)`)
- Comparison / duplicate check: `LOWER(BTRIM(name))` equivalent (`ToLowerInvariant` after trim)
- DB TARGET: unique index `(tenant_id, LOWER(BTRIM(category_name)))` — **no extra column**
- Includes DELETED. `Beverages` / `beverages` / ` Beverages ` conflict. 409 `category.duplicate_name`

Application and database must use the same comparison.

## 4. CAT-MIG-PREFLIGHT-001

Before creating tenant-wide unique indexes, migration **must** scan for duplicate normalized codes and names per tenant **including DELETED**.

If conflicts exist: **stop**. Produce internal evidence (`TenantId`, `CategoryId`, Code, Name, current `DepartmentId`, conflict type). Do not merge, delete, rename, regenerate IDs, or remap products.

Conceptual order: preflight → stop on conflict → drop department uniques/FK → drop `department_id` → create tenant-wide code unique → create name expression unique → tenant/parent/status indexes → verify parent/product/media refs.

## 5. Parent tenant integrity

CURRENT: application `ParentCategoryExistsAsync` filters `TenantId`. DB FK is `parent_category_id → categories(id)` only. `UNIQUE(tenant_id, id)` already exists.

| Layer | Classification |
|---|---|
| Application same-tenant parent | ALREADY ENFORCED |
| Composite DB FK `(tenant_id, parent_category_id) → (tenant_id, id)` | **RECOMMENDED** (matches media composite FK; not CURRENT) |

Not a Product blocker. Server-side tenant check remains mandatory either way.

## 7. Documents updated

Canonical (operational):

- `Tenant_Admin_Category_Management_Specification.md`
- `Tenant_Admin_Category_Management_Flutter_Implementation_Specification.md`
- `Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification.md` (§1.1 Category picker)
- `Tenant_Admin_Category_Management_UI_UX_Specification.md`
- `API_ENDPOINTS.md`
- `10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `Tenant_Admin_Category_Management_QA_Contract.md`
- `ADR_010_Category_Decoupled_From_Department.md` (decision unchanged; consequences + CAT-MIG-PREFLIGHT-001)
- `Current_Source_Of_Truth.md`
- `08_Category_Brand_Management_Flow.md`

Historical pointers only (not rewritten as operational authority):

- `TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_FINAL_CONTRACT_CLOSURE_2026-08-27.md`
- `TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_GAP_CLOSURE_2026-08-27.md`

## 8. Remaining contract blockers

0

Runtime Backend / Flutter / Database / EF migrations: **not changed**.

Three ambiguity areas locked. No new architecture blocker.

```text
CATEGORY MANAGEMENT SECOND BRAIN
HARDENED AND READY FOR
PERMISSION-FIRST BACKEND IMPLEMENTATION
```
