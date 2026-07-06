<!-- title: Department Category CRUD Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Department CRUD / Category CRUD -->
<!-- last_updated: 2026-07-03 -->

# Department CRUD / Category CRUD Implementation Status

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