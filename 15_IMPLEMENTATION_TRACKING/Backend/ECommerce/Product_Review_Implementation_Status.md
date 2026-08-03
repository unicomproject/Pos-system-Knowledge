<!-- title: Product Review Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Product Review Implementation Status

## Purpose

Track backend implementation status for public product review reads and
authenticated customer review create/update/delete operations.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce ProductReviews |
| Feature | Product Reviews APIs |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Focused tests exist; latest full regression/exception acceptance pending |

## Feature Summary

The review feature exposes public approved review reads for product detail pages
and CustomerOnly mutation APIs. Mutations require customer ownership, verified
purchase for create, one active review per customer/product, and immediate rating
summary rebuild.

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/catalog/products/{productId}/reviews` | Read approved reviews and rating summary | Public tenant-scoped read |
| POST | `/api/v1/ecommerce/storefront/catalog/products/{productId}/reviews` | Create verified-purchase review | `CustomerOnly` |
| PATCH | `/api/v1/ecommerce/storefront/reviews/{reviewId}` | Update owned review | `CustomerOnly` |
| DELETE | `/api/v1/ecommerce/storefront/reviews/{reviewId}` | Soft-delete owned review | `CustomerOnly` |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/ECommerce/ProductReviews/ProductReviewsController.cs
src/E_POS.Application/Modules/ECommerce/ProductReviews/
src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductReview.cs
src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductRatingSummary.cs
src/E_POS.Infrastructure/Modules/ECommerce/ProductReviews/Repositories/ProductReviewRepository.cs
tests/E_POS.UnitTests/ECommerce/ProductReviews/ProductReviewServiceTests.cs
tests/E_POS.ApiTests/ECommerce/ProductReviews/ProductReviewsControllerTests.cs
tests/E_POS.IntegrationTests/ECommerce/ProductReviews/ProductReviewRepositoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | Required for POST/PATCH/DELETE. |
| Tenant status | Done | Reads and mutations stay tenant scoped. |
| Feature entitlement | Done | Public reads verify active/effective `online_store` at repository boundary. |
| Permission | N/A | Customer operation; no tenant staff moderation API included. |
| Ownership | Done | Update/delete only current customer review. |
| Verified purchase | Done | Create requires fulfilled purchase evidence. |

## Database Tables Used

| Table | Usage |
|---|---|
| `product_reviews` | Review rows and soft-delete status. |
| `product_rating_summaries` | Aggregated rating totals. |
| `products` | Product validation. |
| `sales_orders` / `sales_order_lines` | Verified purchase evidence. |
| `customers` | Customer identity and display-name masking. |
| `tenant_feature_entitlements` | Effective online-store entitlement checks where implemented. |

## Test Result Summary

Focused unit/API/integration tests exist and previous docs record them passing.
This file remains `Testing` until current full regression evidence, migration
application decision, and PR/commit reference are recorded.

## Known Follow-up

- Add middleware-level staff/platform identity denial tests.
- Add PostgreSQL relational checks for unique/check constraints.
- Add concurrent rating-summary mutation coverage.
- Decide future moderation API scope separately; not included here.

## Related Files

- [[../../../10_TESTING_QA/Test_Case/22_ECommerce/Product_Review_API_Test_Cases]]
- [[../Product_Review_API_Testing_Status]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]