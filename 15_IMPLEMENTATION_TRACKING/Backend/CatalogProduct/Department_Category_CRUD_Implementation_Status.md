<!-- title: Department Category CRUD Implementation Status -->
<!-- status: Superseded -->
<!-- superseded_by: Tenant Admin Category Management backend closure 2026-08-27 -->
<!-- last_updated: 2026-08-30 -->

# Department CRUD / Category CRUD Implementation Status

> **Status: SUPERSEDED** — This document reflects the **2026-07-03 Department-based Category architecture**. It is retained as **historical audit evidence** only. Do **not** treat it as current runtime authority for Category Management.
>
> **Current authority:**
> - [[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
> - [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_PERMISSION_FIRST_BACKEND_IMPLEMENTATION_CLOSURE_2026-08-27]]
> - [[../../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_BACKEND_GAP_FIX_CLOSURE_2026-08-27]]
> - ADR 010 — Category decoupled from Department; migration `20260827140000_DecoupleCategoryFromDepartment`

## Implementation Status

| Item | Value |
|---|---|
| Feature | Department CRUD / Category CRUD |
| Module | CatalogProduct |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-03 |
| Tests | Passed |
| PR / Commit | - |

## Implemented Scope

- Tenant-protected Department CRUD under `/api/v1/departments`.
- Tenant-protected Category CRUD under `/api/v1/categories`.
- Server-side tenant context from JWT claims; request body does not accept `tenant_id`.
- DTO-based responses only; EF entities are not returned directly.
- Department permissions: `catalog.departments.view`, `catalog.departments.create`, `catalog.departments.update`, `catalog.departments.delete`, `catalog.departments.manage`.
- Category permissions: `catalog.categories.view`, `catalog.categories.create`, `catalog.categories.update`, `catalog.categories.delete`, `catalog.categories.manage`.
- Category root support with nullable `parent_category_id`.
- Category parent validation: missing parent, self-parent, and cycle prevention.
- Soft delete for departments and categories by status `DELETED`.
- Migration seeds department/category permission definitions and development tenant role permissions.

## Not Included

- Product CRUD.
- Department/category import/export.
- Image/icon handling for departments/categories.
- Category reorder bulk API.