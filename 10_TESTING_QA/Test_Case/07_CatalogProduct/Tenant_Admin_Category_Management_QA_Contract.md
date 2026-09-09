<!-- title: Tenant Admin Category Management QA Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-30 -->
<!-- verification: Backend executed; Flutter E2E pending -->

# Tenant Admin Category Management QA Contract

Backend-focused QA matrix for Tenant Admin Category Management. **Backend cases EXECUTED** (2026-08-27 closure). **Flutter E2E NOT EXECUTED.** Journeys TA-UJ-035 … TA-UJ-039 **NOT COMPLETE**.

Authority: [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]], [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]

**HISTORICAL:** [[Department_Category_CRUD_Test_Cases]] (2026-07-03) covers pre-decoupling Department-era CRUD subset. Superseded for current Category contract by this file and backend closure evidence.

## CRUD (no Department)

| Case | Expected | Backend |
|---|---|---|
| Create without Department | Succeeds; request has no `departmentId` | EXECUTED |
| Update without Department | Succeeds | EXECUTED |
| Detail without Department fields | Response has no `departmentId` / code / name | EXECUTED |
| Hidden/default Department in Flutter | Fail — must not exist | PENDING (Flutter) |

## Hierarchy

| Case | Expected | Backend |
|---|---|---|
| Create root | `parent_category_id` NULL, level 1 | EXECUTED |
| Create child | Parent linked; parent code/name on response | EXECUTED |
| Multiple children | Allowed | EXECUTED |
| Category is child and parent | Allowed | EXECUTED |
| Self-parent | `400 category.parent_self_reference` | EXECUTED |
| Circular parent | `400 category.parent_cycle` | EXECUTED |
| Depth 5 allowed | Create/move at level 5 succeeds | EXECUTED |
| Level 6 rejected | `400 category.max_depth_exceeded`; no partial write | EXECUTED |
| Re-parent valid subtree | Succeeds when `newParentLevel + subtreeRelativeDepth ≤ 5` | EXECUTED |
| Re-parent subtree causing >5 | `400 category.max_depth_exceeded`; no partial write | EXECUTED |

## Parent Status

| Case | Expected | Backend |
|---|---|---|
| ACTIVE parent (create/re-parent) | Allowed | EXECUTED |
| INACTIVE new parent | `400 category.parent_inactive` | EXECUTED |
| DELETED parent | `404 category.parent_not_found` | EXECUTED |
| Parent later INACTIVE; edit child without parent change | Success (**P1-1**, **BR-CAT-PARENT-EDIT-001**) | EXECUTED |
| Re-parent to INACTIVE | `400 category.parent_inactive` | EXECUTED |
| Parent later INACTIVE | Children remain; no cascade | EXECUTED |

## Tenant Isolation

| Case | Expected | Backend |
|---|---|---|
| Cross-tenant Category id | `404 category.not_found` | EXECUTED |
| Cross-tenant Parent id | `404 category.parent_not_found` | EXECUTED |
| Cross-tenant media id | Reject; composite media FK | EXECUTED |

## Uniqueness

| Case | Expected | Backend |
|---|---|---|
| Duplicate Category Code same tenant | `409 category.duplicate_code` | EXECUTED |
| Same code different tenant | Allowed | EXECUTED |
| Duplicate Category Name same tenant (case-insensitive, trimmed), including vs DELETED | `409 category.duplicate_name` | EXECUTED |
| Same name different tenant | Allowed | EXECUTED |
| Update excluding current id | Allowed | EXECUTED |
| Concurrent duplicate create/update (**P1-4**) | DB unique violation → `category.duplicate_code` or `category.duplicate_name`, not generic `data_conflict` | EXECUTED |

## Permissions And Entitlement

| Case | Expected | Backend |
|---|---|---|
| view only | List/tree/details; mutations hidden/403 | EXECUTED |
| create / update / delete | Matching action allowed | EXECUTED |
| manage fallback | All Category management actions | EXECUTED |
| permission denied | `403 category.permission_denied` | EXECUTED |
| entitlement disabled | `403 category.entitlement_denied` | EXECUTED |
| entitlement infra failure | `500 category.unexpected_failure` | EXECUTED |
| Category image auth | `product_catalog` + update/manage | EXECUTED |
| No role-name checks | Fail if code checks `role == TenantAdmin` | EXECUTED |

## API

| Case | Expected | Backend |
|---|---|---|
| list / search / pagination | Server-side; name and code search; `status`, `parentCategoryId`, `rootOnly` | EXECUTED |
| tree | ACTIVE+INACTIVE; DELETED excluded; no fake-root promotion (**P1-3**) | EXECUTED |
| details | Description, slug, derived fields | EXECUTED |
| create / update / parent move / status via PUT / archive | Per specification | EXECUTED |
| media POST/DELETE | Dedicated tenant-admin endpoints | EXECUTED |
| no write `imageUrl` on create/update | Enforced | EXECUTED |
| children endpoint | Must not exist; use `parentCategoryId` | EXECUTED |
| PATCH status | Must not exist | EXECUTED |
| validation / duplicate / delete conflict | Canonical error codes | EXECUTED |

## Derived Data

| Case | Expected | Backend |
|---|---|---|
| childCount | Immediate non-DELETED children only | EXECUTED |
| productCount | Direct `product_categories` only; not descendants | EXECUTED |
| hasChildren | `childCount > 0` | EXECUTED |
| level / hierarchyPath | Derived; not stored | EXECUTED |

## Product Setup create-options

Canonical source: `GET /api/v1/tenant-admin/products/create-options`. Authorization: `product_catalog` + `catalog.products.create`. Do **not** require `catalog.categories.view`.

| Case | Expected | Backend |
|---|---|---|
| ACTIVE only in response | Returned options exclude INACTIVE and DELETED | EXECUTED |
| Levels 1–5 | Hierarchy-aware `categories[]` | EXECUTED |
| Parent/path metadata | `id`, `categoryCode`, `categoryName`, `parentCategoryId`, `level`, `hierarchyPath`, `hasChildren`, `sortOrder` | EXECUTED |
| No `catalog.categories.view` | Create-options succeeds with Product Setup permission only | EXECUTED |
| Persist selected `categoryId` only | Path A→B→C selected C stores C only | EXECUTED |
| INACTIVE ancestor + ACTIVE child (**P1-2**, **BR-CAT-PRODUCT-SELECT-001**) | Child not in create-options; Product create/new mapping rejected | EXECUTED |
| CURRENT LEGACY RUNTIME `subCategories` | HISTORICAL flat child-Category representation | N/A |

## Category normalized uniqueness

| Case | Expected | Backend |
|---|---|---|
| `Beverages` vs `beverages` | 409 `category.duplicate_name` | EXECUTED |
| `Beverages` vs `" Beverages "` | 409 `category.duplicate_name` | EXECUTED |
| Same normalized name, different tenants | Allowed | EXECUTED |
| Duplicate vs DELETED name in same tenant | 409 `category.duplicate_name` | EXECUTED |
| `ABC` vs `abc` code | 409 `category.duplicate_code` | EXECUTED |
| App check and DB index | Same comparison; no split-brain | EXECUTED |

## Migration preflight CAT-MIG-PREFLIGHT-001

| Case | Expected | Backend |
|---|---|---|
| Same tenant, duplicate normalized code | Detected; migration stops | EXECUTED |
| Same tenant, duplicate normalized name including DELETED | Detected; migration stops | EXECUTED |
| Dangling/cross-tenant parent, self-parent, cycle, depth >5 | Detected; migration stops | EXECUTED |
| Silent rename / merge / delete / ID regeneration / product remapping | FORBIDDEN | EXECUTED |

## Media partial success (**BR-CAT-MEDIA-001**)

| Case | Expected | Layer |
|---|---|---|
| Category create succeeds; image upload fails | Category saved; show image failure; allow retry | PENDING (Flutter) |
| Retry image upload | No duplicate Category record | PENDING (Flutter) |

## Flutter

| Case | Expected | Status |
|---|---|---|
| no Department field / no hidden Department ID | Required | NOT EXECUTED |
| hierarchy picker depth 1–5 | Required | NOT EXECUTED |
| Route guard | `catalog.categories.view` or manage + `product_catalog` | NOT EXECUTED |
| Button visibility | create/update/delete/manage matrix | NOT EXECUTED |
| loading / empty / error | Shared Tenant Admin patterns | NOT EXECUTED |
| duplicate / max-depth / delete conflict | Safe messages | NOT EXECUTED |
| successful create/update/status/archive | Toasts | NOT EXECUTED |
| tree rendering | Depth 5 | NOT EXECUTED |
| 1024×768 | Shared shell | NOT EXECUTED |
| Product Setup effective ACTIVE filter (Flutter UX) | **BR-CAT-PRODUCT-SELECT-001** display parity | NOT EXECUTED |

## P1 Regression Cases

| ID | Scenario | Expected |
|---|---|---|
| **P1-1** | Parent becomes INACTIVE; child keeps same `ParentCategoryId`; edit unrelated field | Success |
| **P1-2** | Parent INACTIVE, Child ACTIVE | Child not selectable in Product Setup |
| **P1-3** | Management tree | Real hierarchy preserved; no fake-root promotion from filtering |
| **P1-4** | Concurrent duplicate create/update | `category.duplicate_code` or `category.duplicate_name`, not generic conflict |

## Execution status

| Suite | Status | Evidence |
|---|---|---|
| Focused unit (Category P1 + service/media/audit/migration) | **EXECUTED** | 91/91 PASS (2026-08-30 P1 closure) |
| Focused API (Category + create-options) | **EXECUTED** | 56/56 PASS |
| Focused PostgreSQL (`CategoryPostgreSqlTests`) | **EXECUTED** | 11/11 PASS |
| Full backend regression | **EXECUTED** | 2380/2380 PASS |
| Flutter E2E | **NOT EXECUTED / PENDING** | — |
| Journey TA-UJ-035 … 039 | **NOT COMPLETE** | Backend only |
