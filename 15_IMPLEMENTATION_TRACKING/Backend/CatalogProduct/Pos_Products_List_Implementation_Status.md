<!-- title: POS Products List Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-11 -->


# POS Products List Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | CatalogProduct / POS |
| Feature | `GET /api/v1/pos/products` |
| Status | In Review |
| Completed Date | - |
| Branch | `Sale_Screen` (uncommitted at audit) |
| PR / Commit | - |
| Tests | Pass (`PosProductsControllerTests`, `PosProductCatalogRepositoryTests`, `PosProductCatalogServiceTests`) |

## Feature Summary

Cashier New Sale product grid reads active sellable products from the tenant
database. The endpoint validates `deviceId`, enforces `products.view` (or
`catalog.products.view`), optional `products.search` when `search` is present,
and returns `{ data: [...] }` summaries for Flutter.

From 2026-07-11, `products.search` is enforced strictly for search queries.
`products.view` alone does not grant search.

No POS catalog product seed data was added. Empty database returns an empty list.

## API Contract

| Method | Route | Query | Permission |
|---|---|---|---|
| GET | `/api/v1/pos/products` | `deviceId`, optional `categoryId`, `search` | `products.view` |

Response fields used by Flutter: `id`, `variantId`, `name`, `description`,
`imageStorageKey`, `categoryName`, `basePrice`, `hasVariants`.

## Integration Status

| Layer | Status | Notes |
|---|---|---|
| Backend route | Implemented | `PosProductsController` |
| Database read | Implemented | `products`, `product_variants`, `price_list_items`, categories, images |
| Flutter datasource | Wired | `pos_catalog_remote_datasource.dart` |
| Flutter provider | Wired | Real API only; mock fallback removed 2026-07-10 |
| End-to-end sale | Blocked | Checkout APIs not in Unified-Commerce yet |

## Files Changed

```text
src/E_POS.Api/Controllers/V1/Tenant/PosProductsController.cs
src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/PosProductCatalogService.cs
src/E_POS.Application/Modules/Tenant/CatalogProduct/Contracts/IPosProductCatalog*
src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/PosProductCatalogRepository.cs
tests/E_POS.ApiTests/CatalogProduct/PosProductsControllerTests.cs
tests/E_POS.IntegrationTests/CatalogProduct/PosProductCatalogRepositoryTests.cs
```

## Pending Work

- `GET /api/v1/pos/products/{id}` and `GET /api/v1/pos/catalog/categories`
- Development product seed is intentionally excluded; use Tenant Admin product CRUD
- Merge branch, apply migrations, verify on seeded tenant with real products

## Related Files

- [[../../Flutter/Sales/Start_Sale_UI_Implementation_Status]]
- [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract]]
- [[../Full_Feature_Status_Index]]
