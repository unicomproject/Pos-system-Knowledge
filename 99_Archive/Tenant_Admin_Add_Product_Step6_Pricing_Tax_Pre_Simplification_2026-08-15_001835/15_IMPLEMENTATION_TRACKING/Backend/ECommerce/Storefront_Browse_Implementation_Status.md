<!-- title: Storefront Browse Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Storefront Browse Implementation Status

## Purpose

Track backend implementation status for public e-commerce storefront browse APIs:
tenant resolution, banners, categories, products, search, best sellers, product
details, and fulfillment store reads.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce Storefront |
| Feature | Public Storefront Browse APIs |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Existing coverage present; search/category-by-slug focused evidence pending |

## Feature Summary

Public browse APIs return active current-tenant storefront data for home,
category, product listing, product details, best sellers, search, and outlet
selection. Responses must stay tenant-scoped and expose safe DTOs only.

## API Surface

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/ecommerce/storefront/tenant/resolve?slug=...` | Resolve active tenant slug. |
| GET | `/api/v1/ecommerce/storefront/banners?bannerType=...` | Read active banners by type. |
| GET | `/api/v1/ecommerce/storefront/catalog/categories/featured` | Read featured categories. |
| GET | `/api/v1/ecommerce/storefront/catalog/categories` | Read root categories. |
| GET | `/api/v1/ecommerce/storefront/catalog/categories/{categoryId}/children` | Read child categories. |
| GET | `/api/v1/ecommerce/storefront/catalog/categories/by-slug/{slug}` | Read category by slug. |
| GET | `/api/v1/ecommerce/storefront/catalog/products` | Read paged products by category. |
| GET | `/api/v1/ecommerce/storefront/catalog/products/best-sellers` | Read best sellers. |
| GET | `/api/v1/ecommerce/storefront/catalog/search` | Search products with filters. |
| GET | `/api/v1/ecommerce/storefront/catalog/products/{slug}` | Read product details. |
| GET | `/api/v1/ecommerce/storefront/fulfillment/stores` | Read available stores. |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontTenantController.cs
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontBannersController.cs
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontCategoriesController.cs
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontProductsController.cs
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontFulfillmentController.cs
src/E_POS.Application/Modules/ECommerce/Storefront/
src/E_POS.Infrastructure/Modules/ECommerce/Storefront/
tests/E_POS.ApiTests/ECommerce/Storefront/StorefrontControllerTests.cs
tests/E_POS.UnitTests/ECommerce/Storefront/StorefrontServiceTests.cs
tests/E_POS.IntegrationTests/ECommerce/Storefront/StorefrontRepositoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | N/A | Public read APIs. |
| Tenant status | Done | Tenant slug resolution and repository filters use active tenant state. |
| Feature entitlement | Partial | Some storefront reads use active/effective online-store rules; confirm consistency per endpoint. |
| Permission | N/A | No tenant staff permission for public browse. |
| Tenant isolation | Done | Queries are scoped by tenant id or tenant slug. |

## Database Tables Used

| Table | Usage |
|---|---|
| `tenants` | Tenant slug/status resolution. |
| `storefront_banners` | Banner reads. |
| `categories` / product-category links | Category tree and category lookup. |
| `products` / `product_variants` | Listing and product detail reads. |
| `product_images` / `media_assets` | Product, category, and banner image projection. |
| `price_lists` / `price_list_items` | Current tenant currency pricing. |
| `inventory_balances` | Stock/availability projection. |
| `product_reviews` / `product_rating_summaries` | Ratings and review counts. |
| `outlets` / fulfillment configuration | Store selection data. |

## Test Result Summary

Prior storefront documentation records passing build/test evidence, but this file
is marked `Testing` because search and category-by-slug focused evidence was only
recently documented as required and still needs a recorded latest run.

## Known Follow-up

- Add focused tests for `/catalog/search` validation, filters, paging, and tenant scope.
- Add focused tests for `/catalog/categories/by-slug/{slug}` success, missing tenant, inactive category, and unknown slug.
- Confirm entitlement behavior across every public browse endpoint.
- Record latest `dotnet test` output before marking Completed.

## Related Files

- [[../../../10_TESTING_QA/Test_Case/22_ECommerce/ECommerce_Storefront_API_Test_Cases]]
- [[../ECommerce_Storefront_API_Testing_Status]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]