<!-- title: Tenant Admin Category Management Permission-First Backend Implementation Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->
<!-- verification: Backend + EF Core + PostgreSQL + tests executed -->

# Tenant Admin Category Management Permission-First Backend Implementation Closure (2026-08-27)

## Verdict

**CATEGORY MANAGEMENT BACKEND READY FOR FLUTTER IMPLEMENTATION**

Flutter Category Management journeys **TA-UJ-035 … TA-UJ-039 remain NOT COMPLETE**. This closure covers Backend + EF Core + PostgreSQL + Backend tests only.

The Second Brain contract was not redesigned. This report is implementation evidence.

---

## 1. Contract

Source of truth used:

- `Tenant_Admin_Category_Management_Specification.md`
- `ADR_010_Category_Decoupled_From_Department`
- `TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27.md`
- Canonical permission / entitlement contracts
- Backend architecture, API, audit, and migration rules

Locked contract implemented:

| Rule | Implementation |
|---|---|
| Category stays in CatalogProduct | No `Modules/Tenant/CategoryManagement` bounded context |
| No SubCategory entity | Recursive `ParentCategoryId` only |
| Department decoupled from Category | `DepartmentId` removed from Category domain/API/table |
| Max depth 5 | Root = level 1; subtree move validated |
| ACTIVE parent for new/replacement parent | Cross-tenant parent → `category.parent_not_found` |
| Tenant-wide code uniqueness including DELETED | `UNIQUE (tenant_id, category_code)` |
| Tenant-wide name uniqueness including DELETED | `UNIQUE (tenant_id, LOWER(BTRIM(category_name)))` |
| Lengths | Code 80 / Name 150 / Slug 180 / Description 2000 |
| Permissions | `catalog.categories.{view,create,update,delete,manage}` |
| Entitlement | `product_catalog` before permission |
| Tree API | `GET /api/v1/categories/tree` for Category Management only |
| Product Setup source | `GET /api/v1/tenant-admin/products/create-options` |
| Soft delete | `DELETED`; blocked by children or product mappings |
| No redundant endpoints | No `GET /{id}/children`; no `PATCH /{id}/status` |

Tenant lifecycle enforcement point:

- `TenantOnly` authenticates JWT tenant context only.
- `CategoryService.ValidateAccessAsync` additionally requires `GetTenantStatusAsync` + `TenantAuthConstants.IsTenantLoginStatusAllowed`.
- Missing/disallowed tenant status → `401 category.invalid_tenant_context`.

---

## 2. Implementation

Canonical module:

```text
src/E_POS.{Domain|Application|Infrastructure}/Modules/Tenant/CatalogProduct/
src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/CategoriesController.cs
```

### Domain

- `Category` no longer stores `DepartmentId`.
- `CategoryConstants.NormalizeCode` = Trim + ToUpperInvariant.
- `CategoryConstants.NormalizeNameForComparison` = Trim + ToLowerInvariant.
- `CategoryHierarchy` computes Level, HierarchyPath, subtree relative depth.

### Application

- `CategoryService` orchestrates entitlement, permission/manage fallback, parent/cycle/depth, tenant-wide duplicates, media, audit, and atomic `SaveChanges`.
- Request DTOs have no `DepartmentId`.
- Detail/list/tree DTOs expose derived Level, HierarchyPath, ChildCount, ProductCount, HasChildren.
- Product Setup create-options returns a single ACTIVE `categories[]` with hierarchy fields. `subCategories` removed.
- Existing Product draft mapping to an INACTIVE Category remains valid when unchanged. New/replacement selection requires ACTIVE.

### API

| Method | Route | Auth |
|---|---|---|
| GET | `/api/v1/categories` | `product_catalog` + view OR manage |
| GET | `/api/v1/categories/tree` | `product_catalog` + view OR manage |
| GET | `/api/v1/categories/{id}` | `product_catalog` + view OR manage |
| POST | `/api/v1/categories` | `product_catalog` + create OR manage |
| PUT | `/api/v1/categories/{id}` | `product_catalog` + update OR manage |
| DELETE | `/api/v1/categories/{id}` | `product_catalog` + delete OR manage |
| GET | `/api/v1/tenant-admin/products/create-options` | Product Setup: `product_catalog` + `catalog.products.create` |

List filters: `pageNumber`, `pageSize` (max 100), `search`, `status`, `parentCategoryId`, `rootOnly`. No Department filter.

### Infrastructure

- Efficient list/tree/create-options projections (tenant-scoped load + in-memory hierarchy, no per-row N+1).
- `CategoryAuditLogger` stages create/update/parent-move/status-change/archive into existing `AuditLog` in the same transaction.
- Composite recommended FK implemented: `(tenant_id, parent_category_id) → categories(tenant_id, id)`.

### Runtime seed

Historical `DevelopmentMerchandiseCatalogSeedData.UpSql` still includes `department_id` so migration `20260710063007` remains valid on fresh databases.

Development host uses `CurrentSchemaUpSql` after `department_id` is dropped.

---

## 3. Migration

Name: `20260827140000_DecoupleCategoryFromDepartment`

Preflight: `CAT-MIG-PREFLIGHT-001` runs first. Duplicate normalized code or name within a tenant (including DELETED) raises and stops. Silent merge/rename/delete/ID regeneration is forbidden.

Order:

1. CAT-MIG-PREFLIGHT-001 duplicate scan
2. Stop if conflicts exist
3. Drop Department-scoped Category unique indexes and Category → Department FK
4. Drop `categories.department_id`
5. Create tenant-wide `uq_categories_tenant_id_category_code`
6. Create expression unique index `uq_categories_tenant_id_normalized_category_name` on `(tenant_id, LOWER(BTRIM(category_name)))`
7. Description `varchar(2000)` + `ck_categories_description_length`
8. Parent/status indexes + composite tenant-parent FK
9. Preserve Category IDs, `product_categories`, media FKs

EF pending model changes: **NONE**

`dotnet ef migrations has-pending-model-changes` → `No changes have been made to the model since the last migration.`

---

## 4. Tests

| Suite | Result |
|---|---|
| Focused unit (`FullyQualifiedName~Category`) | **57/57 PASS** |
| Focused API (`Category` + `GetCreateOptions`) | **22/22 PASS** |
| Focused PostgreSQL (`CategoryPostgreSqlTests`) | **5/5 PASS** (real PostgreSQL, not skipped) |
| Product Setup / inactive mapping unit extras | PASS |
| Storefront + POS catalog + create-options repository | PASS |
| Full unit | **1193/1193 PASS** |
| Full API | **488/488 PASS** |
| Full integration | **581/581 PASS** |
| Full solution (`E_POS.sln`) | **2329/2329 PASS** |
| `git diff --check` | clean |

PostgreSQL coverage executed:

- Preflight duplicate code (`DRINK` across two departments, same tenant) stops with `P0001` / `CAT-MIG-PREFLIGHT-001`
- Preflight duplicate name (`Beverages` vs `" beverages "`) stops
- Same values across tenants allowed
- TARGET schema: `department_id` absent, tenant-wide code unique including DELETED, normalized name unique, description max 2000, composite parent FK, Category IDs preserved
- `product_categories` mappings preserved

---

## 5. Remaining Frontend work

Do **not** mark TA-UJ-035 … TA-UJ-039 COMPLETE.

Pending Flutter (later phase):

- Category Management list/tree/create/edit/archive screens
- Providers, routing, permission mapping
- Product Setup picker consuming hierarchy-aware `categories[]` (no `subCategories`)
- Angular is unchanged and out of scope

---

## 6. Final verification matrix

| Area | Result | Evidence |
|---|---|---|
| Clean Architecture alignment | PASS | API → Application → Domain; repository has no business rules |
| CatalogProduct folder alignment | PASS | No second Category bounded context |
| Department decoupling | PASS | Domain/API/EF/snapshot have no Category.DepartmentId |
| Recursive hierarchy | PASS | ParentCategoryId self-reference, max 5 |
| Max depth 5 | PASS | Create + subtree move |
| ACTIVE parent | PASS | INACTIVE/DELETED/cross-tenant rejected |
| Cycle prevention | PASS | Self-parent + descendant parent |
| Tenant isolation | PASS | Tenant-scoped queries; cross-tenant 404 |
| Code uniqueness | PASS | Tenant-wide including DELETED |
| Name uniqueness | PASS | LOWER(BTRIM) including DELETED |
| Canonical lengths | PASS | Validator + domain + EF + PostgreSQL |
| Permission enforcement | PASS | view/create/update/delete + manage fallback |
| `product_catalog` entitlement | PASS | `ITenantFeatureEntitlementEvaluator` |
| Manage fallback | PASS | `catalog.categories.manage` |
| List API filters | PASS | search/status/parent/rootOnly/pagination |
| Tree API | PASS | `GET /api/v1/categories/tree` |
| Derived hierarchy fields | PASS | Level/path/childCount/productCount/hasChildren |
| Product direct count | PASS | Direct mappings only |
| Delete protection | PASS | Children and product links → 409 |
| Soft delete | PASS | Status = DELETED |
| Product Setup create-options | PASS | Single ACTIVE hierarchy `categories[]` |
| Existing inactive Product mapping | PASS | Unchanged mapping allowed; replacement ACTIVE only |
| Migration preflight | PASS | CAT-MIG-PREFLIGHT-001 |
| PostgreSQL migration | PASS | `20260827140000_DecoupleCategoryFromDepartment` |
| Audit | PASS | create/update/parent/status/archive |
| Unit tests | PASS | 1193/1193 |
| API tests | PASS | 488/488 |
| PostgreSQL tests | PASS | 5/5 focused + 581/581 integration |
| Affected regression | PASS | POS catalog, Storefront, Product Setup, bootstrap |
| Full backend build | PASS | `dotnet build E_POS.sln` |

Flutter changed: **NO**  
Angular changed: **NO**
