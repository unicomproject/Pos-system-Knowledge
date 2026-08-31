<!-- title: ADR 010 - Category Decoupled From Department -->
<!-- status: Accepted -->
<!-- date: 2026-08-27 -->
<!-- system: OneVerz POS MVP -->

# ADR 010 — Tenant Admin Category Management Is Decoupled From Department

## Status

Accepted — Product Owner decision 2026-08-27.

Resolves `CAT-DEPT-001`.

## Context

Runtime Category (`Modules/Tenant/CatalogProduct`) currently requires `DepartmentId` / `categories.department_id` NOT NULL. Database code uniqueness is `(tenant_id, department_id, category_code)`.

The approved Tenant Admin Category Management user journey does **not** include Department. Category is a tenant-owned recursive hierarchy:

```text
Category → optional Parent Category → zero or many Child Categories
```

Keeping Department on Category would force Flutter to invent a hidden/default Department ID, which is forbidden.

## Decision

```text
DECISION:
Tenant Admin Category Management is decoupled from Department.

RATIONALE:
The approved Category User Journey defines Category as a tenant-owned recursive
hierarchy and does not include Department.

SCOPE:
Category only.

Department remains available to unrelated modules if still required.
```

Category does **not** require `DepartmentId`. Department is not part of Category Create, Edit, Details, hierarchy, API request, API response, Flutter model, or Product Setup Category selection.

## Consequences

**IMPLEMENTED** (2026-08-27 backend closure):

- Removed `DepartmentId` from Category Create/Update request DTOs, validators, domain, service, repository, and tests.
- No `departmentId` / `departmentCode` / `departmentName` on Category response DTOs.
- Migration `20260827140000_DecoupleCategoryFromDepartment`: dropped Category → Department FK, department-based indexes, and `categories.department_id`; tenant-scoped uniqueness applied. Category IDs, parent links, `product_categories`, media, and audit fields preserved.
- Category Code uniqueness: `UNIQUE (tenant_id, category_code)` on stored `CategoryConstants.NormalizeCode` (trim + `ToUpperInvariant`).
- Category Name uniqueness: `UNIQUE INDEX uq_categories_tenant_id_normalized_category_name ON categories (tenant_id, LOWER(BTRIM(category_name)))`. Includes DELETED.
- **CAT-MIG-PREFLIGHT-001:** Executed before migration; stops on conflicts.
- Flutter Category forms/models: still **PENDING** — no Department field when implemented.
- Composite DB FK `(tenant_id, parent_category_id) → categories(tenant_id, id)` **IMPLEMENTED**.

Hardening authority (does not change this ADR’s decision): [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]

## Runtime Status

**IMPLEMENTED** (2026-08-27 permission-first backend + gap fix closure).

Migration `20260827140000_DecoupleCategoryFromDepartment` applied. Category domain, API, EF, and PostgreSQL schema have **no** `department_id`. Tenant-wide code and normalized name uniqueness enforced. Flutter Category Management remains **PENDING**.

Evidence: [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_PERMISSION_FIRST_BACKEND_IMPLEMENTATION_CLOSURE_2026-08-27]], [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]

**HISTORICAL:** Pre-2026-08-27 runtime required `department_id`. See superseded [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Department_Category_CRUD_Implementation_Status]].

## Authority

- Product Owner decision for Tenant Admin Category Management (2026-08-27)
- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_SECOND_BRAIN_FINAL_CONTRACT_CLOSURE_2026-08-27]]
- Hardening (does not change this decision): [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]
