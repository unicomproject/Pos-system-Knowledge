<!-- title: Brand Collection CRUD Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Brand CRUD / Collection CRUD -->
<!-- last_updated: 2026-07-03 -->

# Brand CRUD / Collection CRUD Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Brand CRUD / Collection CRUD |
| Module | CatalogProduct |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-03 |
| Tests | Passed |
| PR / Commit | - |

## Implemented Scope

- Tenant-protected Brand CRUD under `/api/v1/brands`.
- Tenant-protected Collection CRUD under `/api/v1/collections`.
- Server-side tenant context from JWT claims; request body does not accept `tenant_id`.
- DTO-based responses only; EF entities are not returned directly.
- Brand permissions: `catalog.brands.view`, `catalog.brands.create`, `catalog.brands.update`, `catalog.brands.delete`, `catalog.brands.manage`.
- Collection permissions: `catalog.collections.view`, `catalog.collections.create`, `catalog.collections.update`, `catalog.collections.delete`, `catalog.collections.manage`.
- Soft delete for brands and collections by status `DELETED`.
- Collection delete conflict when active products are linked through `product_collections`.
- Migration seeds brand/collection permission definitions and development tenant role permissions.

## Not Included

- Product CRUD.
- Brand-product linking because current product entity has no brand relationship.
- Collection-product assignment APIs.
- Brand/collection import/export.
- Image/icon/media handling for brands or collections.