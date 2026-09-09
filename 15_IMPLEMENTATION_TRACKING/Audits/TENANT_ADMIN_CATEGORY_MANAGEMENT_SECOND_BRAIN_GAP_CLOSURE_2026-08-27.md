<!-- title: Tenant Admin Category Management Second Brain Gap Closure -->
<!-- status: Historical — Department OPEN BLOCKER superseded 2026-08-27 -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->
<!-- verification: Backend Unified-Commerce and Flutter Nytroz-POS-App inspected read-only; documentation-only update -->

# Tenant Admin Category Management Second Brain Gap Closure (2026-08-27)

> **SUPERSEDED (Department decision only).** CAT-DEPT-001 is **RESOLVED** by Product Owner decision: Category is decoupled from Department. Canonical authority: [[ADR_010_Category_Decoupled_From_Department]] and [[TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_FINAL_CONTRACT_CLOSURE_2026-08-27]]. Product Setup Category source vs `/categories/tree` was later **LOCKED** in [[TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]] — do not treat “tree OR create-options” wording below as current. This file remains historical evidence of the pre-decision audit. Do not treat “OPEN ARCHITECTURE BLOCKER” below as current.

## 0. Purpose

Second-pass correction of remaining Category Management contract gaps after the 2026-08-27 canonicalization pass.

This document is the audit/closure record. Operational authority remains:

- [[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Category_Management_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Category_Management_Flutter_Implementation_Specification]]

Historical first pass (not overwritten): [[TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_CANONICALIZATION_2026-08-27]]

**Runtime code was not changed.**

## 1. Classification Legend

| Class | Meaning |
|---|---|
| CURRENT | Verified in runtime Backend/Flutter/DB |
| CURRENT BUT DOCUMENTATION STALE | Runtime exists; prior Second Brain text was wrong or incomplete |
| TARGET GAP | Approved target not implemented |
| TARGET CHANGE | Approved target differs from current runtime and requires a future change |
| CONFLICT | Two current authorities disagree |
| OPEN BLOCKER | Evidence does not authorize a product/architecture choice |
| NOT REQUIRED | Evaluated and rejected for this phase |

## 2. Kept Canonical Model

```text
Category
→ optional Parent Category
→ zero or many Child Categories
```

Kept rules:

- no separate SubCategory entity/table
- one direct parent maximum
- multiple children allowed
- Category can be both parent and child
- root = `parent_category_id = NULL`
- circular hierarchy forbidden
- maximum hierarchy depth = 5 (TARGET)
- ACTIVE / INACTIVE / DELETED lifecycle
- soft delete
- only ACTIVE categories selectable for **new** Product Setup mappings
- child count derived
- product count derived
- permissions: `catalog.categories.view|create|update|delete|manage`
- entitlement: `product_catalog`

## 3. P0 — Department Model

| Item | Class |
|---|---|
| Department entity and CRUD exist | CURRENT |
| `categories.department_id` NOT NULL | CURRENT |
| Category create/update DTO requires `DepartmentId` | CURRENT |
| Category validator does **not** reject `Guid.Empty` | CURRENT GAP |
| Approved Category UI journey has no Department field | CURRENT |
| Flutter Category/Product Setup has no Department | CURRENT |
| Product maps through `product_categories`, not `department_id` | CURRENT |
| Dev seed may create a GENERAL department for one tenant | CURRENT (dev only; not a product default) |

**Decision:** `OPEN ARCHITECTURE BLOCKER`

Evidence does not authorize:

```text
OPTION A — Department remains mandatory for Category
OPTION B — Category is decoupled from Department
```

Do **not**:

- remove Department silently
- make `department_id` nullable without an approved decision
- invent a hidden/default “General Department”
- make Flutter send unexplained Department IDs

Until this decision exists, Tenant Admin Category **create/edit is not implementation-ready**.

Conditional future requirement:

- If OPTION A: Category UI/API must collect a same-tenant allowed Department; uniqueness remains **tenant-scoped** (not tenant+department).
- If OPTION B: TARGET MIGRATION REQUIRED to drop/relax `department_id` and the department unique index; Category UI remains Department-free.

## 4. P0 — Department Tenant Isolation

| Layer | Finding | Class |
|---|---|---|
| EF FK | `department_id → departments(id)` only | CURRENT |
| DB doc previously claimed composite `FK(tenant_id, department_id)` | False vs runtime | CURRENT BUT DOCUMENTATION STALE |
| CategoryService/Repository Department tenant check | Absent | CURRENT GAP |
| Media FK | Composite `(TenantId, ImageMediaAssetId)` | CURRENT (good pattern) |

```text
CURRENT GAP:
Cross-tenant Department IDs are not sufficiently protected by the Category
application/database contract.
```

**TARGET** (required if Department remains on Category):

```text
Selected Department must:
- exist
- belong to current tenant (Category.TenantId == Department.TenantId)
- be allowed for use (not DELETED; ACTIVE required for new assignment)
```

Preferred enforcement aligned with existing OneVerz multi-tenant media pattern:

```text
Application: CategoryService validates Department tenant + status
Database TARGET MIGRATION: composite unique principal on departments(tenant_id, id)
  + FK(categories.tenant_id, categories.department_id)
```

## 5. P0 — Category Code Uniqueness

| Layer | Rule | Class |
|---|---|---|
| Application `CategoryCodeExistsAsync(tenantId, code)` | Unique within Tenant (all departments; includes DELETED rows) | CURRENT |
| Database unique index | `(tenant_id, department_id, category_code)` | CURRENT |
| Mismatch | Application enforcement != Database enforcement | CONFLICT |
| Approved journey | Unique within Tenant | TARGET CHANGE |

**Canonical TARGET rule:**

```text
Category Code is unique within Tenant.
Normalized: trim + ToUpperInvariant (existing CategoryConstants.NormalizeCode).
Duplicate HTTP: 409 category.duplicate_code
Update excludes current Category ID.
Same code in another tenant: allowed.
```

Future implementation:

```text
Application: keep tenant-scoped duplicate check (already current)
Database TARGET MIGRATION: UNIQUE(tenant_id, category_code)
  replace uq_categories_tenant_id_department_id_category_code
API: 409 category.duplicate_code
Flutter: display duplicate-code validation safely
```

Do not describe this as “UI versus DB”. It is **application versus database**.

## 6. P0 — Category Name Uniqueness

| Layer | Finding | Class |
|---|---|---|
| Repository/service name duplicate check | Absent | CURRENT |
| Database unique index on name | Absent | CURRENT |
| Brand name uniqueness | Also absent (Brand unique is code/slug only) | CURRENT |

```text
CURRENT:
Category Name uniqueness is NOT enforced.
```

**Canonical TARGET:**

```text
Category Name unique within Tenant among non-DELETED rows.
Normalization: trim; uniqueness compare case-insensitive (ToUpperInvariant / ILIKE),
matching existing Category search convention. Internal whitespace is preserved after trim.
Do not invent Unicode folding beyond existing ToUpperInvariant/ILIKE.
HTTP: 409 category.duplicate_name
Update excludes current Category ID.
Same name in another tenant: allowed.
DELETED names may be reused.
```

Brand has no name uniqueness; this is a Category-specific TARGET CHANGE, not a copied Brand CURRENT.

## 7. P0 — Validation Length Alignment

| Field | Flutter CURRENT | Request Validator CURRENT | Domain | EF / PostgreSQL | Final Canonical TARGET |
|---|---:|---:|---|---|---:|
| Category Code | none (no form) | 40 | trim+upper string | varchar(80) | **80** |
| Category Name | none (no form) | 200 | trim string | varchar(150) | **150** |
| Description | none (no form) | none | trim optional | text | optional; API/Flutter max **2000**; DB remains text |
| Slug | none (not user-facing) | none | trim+lower | varchar(180) UNIQUE(tenant_id, slug) | **180**; auto from code if omitted |

Rationale:

- No request may pass the validator and then fail because the DB is shorter.
- Name CURRENT validator 200 > DB 150 is a live failure path. TARGET lowers validator to 150.
- Code CURRENT validator 40 < DB 80. Canonical follows Brand/DB master-data width **80**.
- Description stays `text` in PostgreSQL. API/Flutter bound 2000 prevents unbounded payloads without a schema change.
- Slug is persisted but **not** a Category UI field. Backend generates from normalized code when omitted.

## 8. P0 — Entitlement Enforcement

Canonical entitlement: `product_catalog`  
Canonical permissions: `catalog.categories.view|create|update|delete|manage`

### CURRENT (proven)

| Check | Evidence | Result |
|---|---|---|
| CategoryService authorization | `ValidateAccess` → `TenantRequestContext.HasPermission` | Permission claims only |
| CategoriesController | `[Authorize(Policy = "TenantOnly")]` + service errors | No entitlement evaluator |
| JWT permission issuance | `TenantEffectivePermissionCodesQuery` unions role/direct/outlet grants | **Does not filter by entitlement** |
| Product Setup entitlement | `ProductWizardAccessPolicy` calls `ITenantFeatureEntitlementEvaluator` for `product_catalog` | Independent of CategoryService |
| Flutter route featureCode | `/tenant-admin/categories` uses `catalog.product` | Not `product_catalog` |
| Flutter nav permission | `tenant.categories.view` aliased to `catalog.categories.view` | View-only; no create/update/delete checkers |

```text
CURRENT:
catalog.categories.* can remain effective when product_catalog is disabled,
because JWT/effective permissions are not entitlement-filtered and
CategoryService does not evaluate product_catalog.
```

### TARGET

```text
Authenticated Tenant User
→ Valid Tenant Context
→ Active Tenant
→ product_catalog entitlement
→ required Category permission OR catalog.categories.manage
→ same-tenant resource
→ operation
```

**Authoritative enforcement point:** Backend `CategoryService` (or a shared Catalog master-data access policy used by CategoryService), using `ITenantFeatureEntitlementEvaluator` for `product_catalog`, mirroring Product Setup. Do **not** assume JWT already guarantees entitlement.

Flutter TARGET: hide/block the Categories module when `product_catalog` is disabled. Treat Flutter `catalog.product` as a **legacy route feature key**, not the commercial entitlement. One-way map `catalog.product` → `product_catalog` at the entitlement check. Do not hardcode roles.

HTTP TARGET for missing entitlement: `403` `category.entitlement_denied` (aligned with `product.entitlement_denied`; do not invent a second family).

## 9. P1 — ACTIVE Parent

| Behavior | Class |
|---|---|
| Parent must exist, same tenant, not DELETED | CURRENT |
| INACTIVE parent accepted | CURRENT |
| Self-parent / cycle rejected | CURRENT |
| New parent / re-parent must be ACTIVE | TARGET CHANGE |

```text
CURRENT:
ACTIVE or INACTIVE parent accepted, DELETED rejected.

TARGET:
new parent or re-parent target must be ACTIVE.
```

Historical hierarchy: if an ACTIVE parent later becomes INACTIVE, children remain valid. **Do not cascade INACTIVE to children.** Product Setup still cannot newly select the INACTIVE parent.

Error TARGET: `400` `category.parent_inactive`.

## 10. P1 — Maximum Depth 5

| Item | Class |
|---|---|
| Cycle detection | CURRENT |
| Depth / level cap | Absent | TARGET GAP |

**BR-CAT-DEPTH-001**

```text
Root = Level 1
Maximum = Level 5
newParentLevel + movedSubtreeRelativeDepth <= 5
```

- Create: new category level = 1 if root, else parent.level + 1; reject if > 5.
- Update/move: compute relative depth of the moved subtree (1 for a leaf; max descendant distance + 1 otherwise). Reject if `newParentLevel + subtreeRelativeDepth > 5`.
- Failed depth validation = no partial mutation.
- Error: `400` `category.max_depth_exceeded`.

## 11. P1 — Response DTO

`CategoryResponse` CURRENT fields: Id, CategoryCode, CategoryName, ImageUrl, ImageMediaAssetId, Status, ParentCategoryId, ParentCategoryCode, ParentCategoryName, SortOrder, CreatedAt, UpdatedAt.

Missing vs Edit/Detail UI:

| Field | Need | Class |
|---|---|---|
| Description | Edit prefill | TARGET API RESPONSE CHANGE |
| CategorySlug | Details; not a UI input | TARGET API RESPONSE CHANGE |
| DepartmentId/Code/Name | Only if OPTION A | OPEN BLOCKER |
| childCount, productCount, hasChildren | List/Detail | TARGET API RESPONSE CHANGE |
| level, hierarchyPath | List/Detail/tree | TARGET API RESPONSE CHANGE |

Flutter Edit must not invent fields the backend never returns.

## 12. P1 — API Surface Review

| Endpoint | Classification | Decision |
|---|---|---|
| `GET /api/v1/categories` | REQUIRED | Keep; extend query contract |
| `GET /api/v1/categories/{id}` | REQUIRED | Keep; complete response |
| `POST /api/v1/categories` | REQUIRED | Keep |
| `PUT /api/v1/categories/{id}` | REQUIRED | Owns attributes, parent move, and status |
| `DELETE /api/v1/categories/{id}` | REQUIRED | Soft delete |
| `GET /api/v1/categories/tree` | REQUIRED | Management recursive projection; **not** ACTIVE-only by default |
| `GET /api/v1/categories/{id}/children` | REDUNDANT | Replace with `GET /categories?parentCategoryId={id}` |
| `PATCH /api/v1/categories/{id}/status` | REDUNDANT | Replace with existing `PUT /{id}` |

### Tree semantics

Do **not** define `GET /categories/tree = ACTIVE only` for every use case.

| Context | Status set | Mechanism |
|---|---|---|
| Category Management | ACTIVE + INACTIVE; exclude DELETED | `GET /categories/tree` default, optional `status` |
| Product Setup selection | ACTIVE only | Existing `GET /api/v1/tenant-admin/products/create-options` (CURRENT) |

Canonical management tree:

```text
GET /api/v1/categories/tree?status=ACTIVE
GET /api/v1/categories/tree?status=INACTIVE
GET /api/v1/categories/tree            → ACTIVE+INACTIVE, exclude DELETED
```

## 13. List / Query Contract

CURRENT list query: `pageNumber`, `pageSize` (1–100, default 50), `search` on name/code (ILIKE).

TARGET list query:

| Param | Required | Notes |
|---|---|---|
| pageNumber | yes | default 1 |
| pageSize | yes | default 50, max 100 |
| search | no | Category Name and Category Code |
| status | no | ACTIVE or INACTIVE; omit = both non-DELETED |
| parentCategoryId | no | immediate children |
| rootOnly | no | `parent_category_id IS NULL`; mutually exclusive with parentCategoryId |
| sortBy / sortDirection | NOT REQUIRED v1 | Server default: roots first, then `sort_order`, then `category_code` |

Management pagination remains server-side. Do not paginate in Flutter after downloading the full dataset.

## 14. Derived Hierarchy Data

| Field | Persisted? | Meaning |
|---|---|---|
| level | NO | Root = 1; walk parent chain |
| hierarchyPath | NO | Display path from root names/codes |
| childCount | NO | Non-DELETED immediate children |
| hasChildren | NO | `childCount > 0` |
| productCount | NO | **Direct** `product_categories` rows for this Category whose product is not DELETED |

Projection strategy (document only; not implemented): one tenant-scoped query with LEFT JOIN aggregates for child counts and product counts; parent code/name via the existing parent join; level/path computed in a bounded recursive CTE (`MaxRecursion`/depth 5) or application walk of the already-loaded tenant subset. Forbidden: N+1 parent, child, or product count queries.

## 15. Product Count And Inactive Mappings

`productCount` = direct mappings only. Not descendant rollup.

`product_categories` remains many-to-many. Do not change multi-category Product mapping rules.

```text
Product A mapped to Category X
Category X becomes INACTIVE
→ do not delete the mapping
→ Category X is not selectable for NEW Product Setup mapping
→ existing relation remains
```

Product Edit TARGET:

- may preserve an existing inactive mapping
- cannot newly select an INACTIVE/DELETED Category
- replacement options come from ACTIVE create-options

CURRENT Product draft save calls `ActiveCategoryExistsAsync` whenever `CategoryId` is present, so re-saving an existing inactive mapping currently fails. That is a TARGET CHANGE on Product Setup validation, not a Category table change.

## 16. Ownership

```text
CANONICAL BACKEND MODULE:
src/E_POS.{Domain|Application|Infrastructure}/Modules/Tenant/CatalogProduct/
src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/CategoriesController.cs
```

Do not create `CategoryManagement/` as a parallel bounded context.

```text
CANONICAL FLUTTER FEATURE ROOT:
lib/features/tenant_admin/categories/
```

Mirror `lib/features/tenant_admin/brands/`:

```text
categories/
  data/datasources|mappers|models|repositories
  domain/entities|repositories
  presentation/providers|screens|widgets
```

Route remains `/tenant-admin/categories` under the Products sidebar. Product Setup pickers stay in `lib/features/tenant_admin/products/`. Do not create `lib/features/tenant_admin/catalog/`.

## 17. User Journeys

TA-UJ-035 … TA-UJ-039 remain **NOT_STARTED**.

Backend Category CRUD exists (2026-07-03). That is **not** the Tenant Admin Category Management journey. The journey stays NOT_STARTED/BLOCKED because hierarchy/UI/permission/database contracts are not implementation-complete, Flutter is Coming Soon, and the Department blocker is open.

## 18. Contradiction Scan

| Topic | Classification |
|---|---|
| Separate SubCategory entity | RESOLVED — no; UI label only |
| “Sub Category” globally deprecated | SUPERSEDED — UI still says Categories & Subcategories |
| Department labeled Legacy | SUPERSEDED — restored to current master-data entity + open decision |
| `GET /tree` = ACTIVE only | SUPERSEDED — management vs Product Setup split |
| `/{id}/children` and `PATCH /status` as required APIs | SUPERSEDED — redundant |
| Flutter feature under `catalog/` | SUPERSEDED — `tenant_admin/categories/` |
| DB doc composite Department FK | HISTORICAL / STALE vs runtime |
| Department mandatory vs UI | OPEN BLOCKER |
| Code unique tenant vs tenant+department | CONFLICT — TARGET tenant-scoped |
| Name uniqueness | TARGET GAP |
| Validator name 200 vs DB 150 | CONFLICT — TARGET 150 |
| Max depth 5 | TARGET GAP |
| product_catalog on CategoryService | TARGET GAP |
| Flutter `catalog.product` vs `product_catalog` | CURRENT BUT DOCUMENTATION STALE |

## 19. Final Gap Matrix

| Area | Current | Target | Gap | Severity | Decision | Future Implementation Requirement |
|---|---|---|---|---|---|---|
| Department model | NOT NULL `department_id`; UI/Flutter omit it | Option A or B | Unchosen | P0 | OPEN BLOCKER | Product/architecture ADR before create/edit UI |
| Department tenant isolation | FK to `departments(id)` only; no service check | Same-tenant + allowed Department | CURRENT GAP | P0 | TARGET if Department remains | App check + composite FK migration |
| Code uniqueness | App tenant-wide; DB tenant+department | Unique within Tenant | CONFLICT | P0 | TARGET locked | Replace unique index; keep 409 `duplicate_code` |
| Name uniqueness | Not enforced | Unique within Tenant, non-DELETED, case-insensitive trim | TARGET GAP | P0 | TARGET locked | App check + unique index; 409 `duplicate_name` |
| Validation lengths | Code 40 / Name 200 vs DB 80 / 150 | Code 80 / Name 150 / Slug 180 / Description 2000 | CONFLICT | P0 | TARGET locked | Align validator + Flutter maxLength to canonical |
| Entitlement enforcement | Permission claims only; JWT not entitlement-filtered | `product_catalog` then `catalog.categories.*` | TARGET GAP | P0 | TARGET locked | CategoryService entitlement evaluator |
| Parent ACTIVE rule | INACTIVE parent allowed | New parent must be ACTIVE | TARGET CHANGE | P1 | TARGET locked | Parent status check; `parent_inactive` |
| Max depth | Not enforced | Level 1–5 including subtree move | TARGET GAP | P1 | TARGET locked | BR-CAT-DEPTH-001 |
| Response DTO | No description/slug/counts/level/path | Edit/Detail complete projection | TARGET CHANGE | P1 | TARGET locked | Extend CategoryResponse/Summary |
| Tree API | Absent | `GET /tree` with status semantics | TARGET GAP | P1 | REQUIRED | Management tree; not Product Setup |
| Children API | Absent | Do not add | NOT REQUIRED | P1 | REDUNDANT | Use list `parentCategoryId` |
| Status API | PUT owns status | Keep PUT; no PATCH | NOT REQUIRED | P1 | REDUNDANT | Flutter status via PUT |
| Derived counts | Not returned | Direct productCount; childCount; level; path | TARGET GAP | P1 | TARGET locked | Projected query; never persist |
| Product Setup | create-options ACTIVE roots/subs; draft requires ACTIVE | Preserve existing inactive mapping; new select ACTIVE only | TARGET CHANGE | P1 | TARGET locked | Relax unchanged CategoryId on edit |
| Flutter ownership | Coming Soon under products router | `lib/features/tenant_admin/categories/` | TARGET GAP | P1 | TARGET locked | New feature sibling of brands |
| Backend ownership | CatalogProduct | Same path | CURRENT | P1 | LOCKED | No new bounded context |
| NFR | Partial one-liners | Full NFR-CAT-* set | TARGET GAP | P1 | TARGET locked | See specification |
| QA | CRUD cases only | Hierarchy/permission/entitlement/Flutter matrix | TARGET GAP | P1 | TARGET locked | See QA document |

## 20. Verdict

```text
CATEGORY MANAGEMENT SECOND BRAIN STILL HAS CONTRACT BLOCKERS
```

Reason: Department model Option A vs Option B is unchosen. Create/edit implementation must not proceed until that ADR exists.
