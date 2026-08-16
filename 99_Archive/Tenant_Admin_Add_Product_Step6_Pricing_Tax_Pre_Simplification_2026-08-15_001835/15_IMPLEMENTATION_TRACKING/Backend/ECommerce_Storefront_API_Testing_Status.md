# E-Commerce Storefront API Testing Status

Last updated: 2026-07-29
Repo area: BACKEND / E_POS
Status: Verified passing

## Scope Covered

- Public tenant slug resolution: validates blank slug, returns 404 for inactive/missing tenant, returns tenant id for active tenant.
- Public banner API: validates X-Tenant-Id and bannerType, delegates valid request to storefront service.
- Public catalog API: validates X-Tenant-Id for featured categories, root categories, child categories, category-by-slug, product listing, search, and best sellers.
- Public fulfillment API: validates X-Tenant-Id and returns available stores from service.
- Category Level 1 API: returns active root categories for current tenant, sorted by SortOrder/name, with active sellable item counts.
- Category Level 2 API: returns active child categories for selected parent category, current tenant only, with active sellable item counts.
- Product Listing Level 3 API: returns paged lightweight product cards for selected category without variant details.
- Product Details API: returns active sellable product details by slug with variants, colour/size options, images, price, stock, rating, highlights, delivery info, and return info.
- Storefront service mapping/delegation: banners, featured categories, root categories, child categories, product listing, product details, best sellers, stores, and tenant resolution.
- Storefront repository filtering: active uppercase banners, active categories, lowercase tenant active status, best-seller product/price/image/rating selection, product listing filtering/sorting/pagination, and product detail aggregation.

## Files Covered

- tests/E_POS.ApiTests/ECommerce/Storefront/StorefrontControllerTests.cs
- tests/E_POS.UnitTests/ECommerce/Storefront/StorefrontServiceTests.cs
- tests/E_POS.IntegrationTests/ECommerce/Storefront/StorefrontRepositoryTests.cs

## Implementation Adjustments

- StorefrontRepository.GetBestSellersAsync was refactored from one complex join into product-first multi-query aggregation.
- Root and child category list APIs share repository category mapping logic and item count aggregation.
- Product Listing API intentionally excludes product variants; Product Details API now returns variant-level colour/size/price/stock data.
- Product Details API aggregates product gallery, active option values, sellable variants, current prices, inventory, rating, attributes, and return policy.

## Current APIs Verified

| UI area | API | Status |
| --- | --- | --- |
| Home | GET /api/v1/ecommerce/storefront/tenant/resolve?slug=... | Verified |
| Home | GET /api/v1/ecommerce/storefront/banners?bannerType=... | Verified |
| Home | GET /api/v1/ecommerce/storefront/catalog/categories/featured | Verified |
| Home | GET /api/v1/ecommerce/storefront/catalog/products/best-sellers | Verified |
| Outlet selection | GET /api/v1/ecommerce/storefront/fulfillment/stores | Verified |
| Category Level 1 | GET /api/v1/ecommerce/storefront/catalog/categories | Verified |
| Category Level 2 | GET /api/v1/ecommerce/storefront/catalog/categories/{categoryId}/children | Verified |
| Category by slug | GET /api/v1/ecommerce/storefront/catalog/categories/by-slug/{slug} | Needs explicit test-case coverage |
| Product Listing Level 3 | GET /api/v1/ecommerce/storefront/catalog/products?categoryId=... | Verified |
| Search | GET /api/v1/ecommerce/storefront/catalog/search?... | Needs explicit test-case coverage |
| Product Details | GET /api/v1/ecommerce/storefront/catalog/products/{slug} | Verified |

## Verification

- dotnet build E_POS.sln: passed, 0 warnings, 0 errors.
- dotnet test E_POS.sln --no-build: passed.
- Current test totals:
  - E_POS.ApiTests: 195 passed.
  - E_POS.UnitTests: 268 passed.
  - E_POS.IntegrationTests: 216 passed.

## Known Follow-up

- Search and category-by-slug endpoint coverage has now been documented as required, but current focused test evidence still needs to be added/run.

- Storefront fulfillment store repository uses raw SQL and needs a relational provider test harness before direct repository-level coverage is meaningful. Current coverage verifies controller validation and service delegation.
