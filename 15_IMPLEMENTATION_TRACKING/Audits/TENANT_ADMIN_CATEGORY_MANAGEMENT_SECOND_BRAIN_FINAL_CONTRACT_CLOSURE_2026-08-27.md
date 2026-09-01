<!-- title: Tenant Admin Category Management Second Brain Final Contract Closure -->
<!-- status: Historical / Superseded by post-backend sync 2026-08-30 -->
<!-- superseded_by: TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_POST_BACKEND_SYNC_2026-08-30 -->

# Tenant Admin Category Management Second Brain Final Contract Closure (2026-08-27)

## 0. Purpose

Closes CAT-DEPT-001 after the Product Owner decision that **Category is decoupled from Department**.

Historical evidence (do not rewrite): [[TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_GAP_CLOSURE_2026-08-27]]  
Canonicalization first pass (historical): [[TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_CANONICALIZATION_2026-08-27]]  
ADR: [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]  
Later hardening (tree vs create-options, physical uniqueness indexes, CAT-MIG-PREFLIGHT-001): [[TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]

Where this closure said `UNIQUE(tenant_id, normalized category_name)` conceptually, the locked physical TARGET is `UNIQUE INDEX ON categories (tenant_id, LOWER(BTRIM(category_name)))` with **no** extra column. Product Setup Category source is **LOCKED** to create-options, not `/categories/tree`.

**Runtime code was not changed in this phase.**

## 1. CAT-DEPT-001

| ID | Prior status | New status | Reason |
|---|---|---|---|
| CAT-DEPT-001 | OPEN ARCHITECTURE BLOCKER | **RESOLVED** | Product Owner decision: Category is decoupled from Department. |

```text
Department Model:
RESOLVED — CATEGORY DECOUPLED FROM DEPARTMENT
```

Scope is **Category ↔ Department** only. The global Department feature is not deleted.

## 2. TARGET Category Model

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

`department_id` is CURRENT runtime only. It is **not** in the TARGET model.

No TARGET DTO fields: `departmentId`, `departmentCode`, `departmentName`.

## 3. CURRENT vs TARGET Department Surface

| Layer | CURRENT | TARGET |
|---|---|---|
| `CategoryCreateRequest.DepartmentId` | Mandatory | Remove |
| `CategoryUpdateRequest.DepartmentId` | Mandatory | Remove |
| `CategoryResponse` | No department fields | Keep none |
| Validator DepartmentId | Not validated (Guid.Empty possible) | Field absent |
| Domain `Category.DepartmentId` | Required | Remove |
| `Category.Create` / `UpdateProfile` | Require departmentId | Remove parameter |
| Repository | Persists DepartmentId | Stop persisting |
| Service | Passes request.DepartmentId | No Department logic |
| EF `CategoryConfiguration` | Required FK to departments | Drop FK and column |
| API | Write body includes departmentId | No Department parameters |
| Tests | Department-bound Category fixtures | Create/update/detail without Department |
| Flutter | No Department (Coming Soon) | No Department field/state/hidden ID |

## 4. TARGET MIGRATION REQUIRED

In-place schema decoupling. **No Category ID regeneration. No product_categories remapping caused solely by Department removal.**

```text
1. Drop Category → Department FK.
2. Drop Department-based Category indexes/uniqueness
   (uq_categories_tenant_id_department_id_category_code,
    uq_categories_tenant_id_department_id_id).
3. Remove categories.department_id.
4. Create UNIQUE(tenant_id, category_code)
   and UNIQUE(tenant_id, normalized category_name) tenant-wide.
5. Preserve Category IDs.
6. Preserve parent_category_id relationships.
7. Preserve product_categories mappings.
8. Preserve image_media_asset_id / media.
9. Preserve audit fields.
```

Do not execute this migration in the Second Brain phase.

## 5. Uniqueness (final)

| Rule | CURRENT | TARGET |
|---|---|---|
| Category Code | App: tenant-wide; DB: tenant+department | `tenant_id + NormalizeCode` (trim+upper). 409 `category.duplicate_code` |
| Category Name | Not enforced | Tenant-wide `tenant_id + trimmed case-insensitive name`. Includes DELETED. 409 `category.duplicate_name` |

A deleted Category does **not** free the canonical name or code for reuse.

## 6. Product Setup

CURRENT create-options `categories` (roots) + `subCategories` (children) is a **LEGACY FLAT REPRESENTATION OF CHILD CATEGORY**, not a SubCategory entity.

TARGET: recursive ACTIVE picker depth 1–5. Persist selected `CategoryId` only. Any ACTIVE Category is selectable (not leaf-only). Existing inactive mappings are preserved.

## 7. Final gap verification

| Area | Status |
|---|---|
| Department Model | RESOLVED — decoupled |
| Department tenant isolation on Category | NOT APPLICABLE (relationship removed) |
| Code uniqueness | READY — tenant-wide |
| Name uniqueness | READY — tenant-wide |
| Validation lengths | READY — 80 / 150 / 180 / 2000 |
| Entitlement | READY — `product_catalog` at CategoryService |
| ACTIVE parent | READY |
| Depth 5 | READY |
| API / DTO / traceability / DB target | READY FOR IMPLEMENTATION |
| Product Setup recursive integration | READY |
| Backend / Flutter ownership | READY |
| NFR / QA | READY |

READY means canonical contract ready for permission-first implementation, not that runtime already matches.

## 8. Verdict

```text
CATEGORY MANAGEMENT SECOND BRAIN
READY FOR PERMISSION-FIRST IMPLEMENTATION
```

Journeys TA-UJ-035 … TA-UJ-039 remain NOT_STARTED (implementation pending).
