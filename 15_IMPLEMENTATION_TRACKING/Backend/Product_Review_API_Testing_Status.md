<!-- title: Product Review API Testing Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-16 -->

# Product Review API Testing Status

| Field | Value |
|---|---|
| Module | E-Commerce Product Reviews |
| Feature | Public review read and authenticated customer create/update/delete APIs |
| Status | Implemented; Product Review focused verification passing; global regression has 3 documented unrelated failures |
| Completed Date | Not marked complete until global regression exceptions are accepted and a PR/commit reference exists |
| Repo Area | `BACKEND / E_POS` |
| PR / Commit | Not committed in the current worktree |
| Second Brain Update | Product Review test-case, this tracking note, and status-index row updated on 2026-07-16 |

## Scope Implemented

- Public paged review read for an active, sellable current-tenant product.
- Sort options: `newest`, `oldest`, `highest`, and `lowest`.
- Live average, total, and 1-5 star breakdown.
- Active-tenant and effective `online_store` entitlement verification at the repository boundary.
- Customer-only review creation using JWT `tenant_id` and `sub` claims.
- Verified-purchase check using a completed, fulfilled sales order and fulfilled product line.
- Immediate publication as `APPROVED` after a valid create or update.
- One review per tenant/customer/product with repository duplicate handling and a database unique constraint.
- Owner-only update and owner-only soft delete.
- Immediate rating-summary rebuild after create, update, and delete.
- Customer display-name privacy through a masked name or `Verified customer` fallback.
- Rating, status, non-negative summary, nullability, and unique-index schema hardening.

## APIs Implemented

| Method | Endpoint | Purpose | Authorization | Success |
|---|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/catalog/products/{productId}/reviews` | Read approved paged reviews and rating summary | Anonymous; verified tenant header plus active `online_store` entitlement | 200 |
| POST | `/api/v1/ecommerce/storefront/catalog/products/{productId}/reviews` | Create verified-purchase review | `CustomerOnly`; JWT tenant/customer | 201 |
| PATCH | `/api/v1/ecommerce/storefront/reviews/{reviewId}` | Update owned review | `CustomerOnly`; JWT tenant/customer and ownership | 200 |
| DELETE | `/api/v1/ecommerce/storefront/reviews/{reviewId}` | Soft-delete owned review | `CustomerOnly`; JWT tenant/customer and ownership | 204 |

## Files Changed

### API / Application

- `src/E_POS.Api/Controllers/V1/ECommerce/ProductReviews/ProductReviewsController.cs`
- `src/E_POS.Application/Modules/ECommerce/ProductReviews/Contracts/IProductReviewService.cs`
- `src/E_POS.Application/Modules/ECommerce/ProductReviews/Contracts/IProductReviewRepository.cs`
- `src/E_POS.Application/Modules/ECommerce/ProductReviews/Dtos/ProductReviewModels.cs`
- `src/E_POS.Application/Modules/ECommerce/ProductReviews/Services/ProductReviewService.cs`
- `src/E_POS.Application/DependencyInjection.cs`

### Domain / Infrastructure

- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Constants/ProductReviewConstants.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductReview.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductRatingSummary.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Configurations/ProductReviewConfiguration.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Configurations/ProductRatingSummaryConfiguration.cs`
- `src/E_POS.Infrastructure/Modules/ECommerce/ProductReviews/Repositories/ProductReviewRepository.cs`
- `src/E_POS.Infrastructure/DependencyInjection.cs`
- `src/E_POS.Infrastructure/Persistence/Migrations/20260716124534_AddCustomerProductReviewApis.cs`
- `src/E_POS.Infrastructure/Persistence/Migrations/20260716124534_AddCustomerProductReviewApis.Designer.cs`
- `src/E_POS.Infrastructure/Persistence/Migrations/EPosDbContextModelSnapshot.cs`

### Automated Tests

- `tests/E_POS.UnitTests/ECommerce/ProductReviews/ProductReviewServiceTests.cs`
- `tests/E_POS.ApiTests/ECommerce/ProductReviews/ProductReviewsControllerTests.cs`
- `tests/E_POS.IntegrationTests/ECommerce/ProductReviews/ProductReviewRepositoryTests.cs`

## Automated Verification

| Verification | Result |
|---|---|
| Product Review unit tests | 6 passed, 0 failed |
| Product Review API tests | 6 passed, 0 failed |
| Product Review integration tests | 6 passed, 0 failed |
| Solution build | Passed, 0 warnings, 0 errors |
| EF pending model changes | None |
| Full API test project | 291 passed, 0 failed |
| Full unit test project | 404 passed, 2 failed |
| Full integration test project | 290 passed, 1 failed |
| Full regression total | 985 passed, 3 failed |

## Security and Tenant Decision

- GET does not require a customer/staff permission, but the client-supplied tenant header is only lookup input; the repository verifies that the tenant is active and has an effective active `online_store` entitlement.
- POST, PATCH, and DELETE never accept tenant or customer identity from the body or tenant header. They derive both from the authenticated customer JWT.
- Cross-tenant products return not found.
- Cross-customer review mutations return the same safe not-found result as a missing review.
- No tenant-admin Product Review permission or seed-data change was added because these four APIs are customer storefront operations, not moderation APIs.

## Database Decision

- New reviews are immediately `APPROVED`; no moderation queue is included in this scope.
- DELETE is a status change to `DELETED`, preserving audit fields.
- Optional review title/text are nullable; service validation limits title to 150 and text to 5000 characters.
- Database checks enforce rating 1-5, allowed review statuses, average 0-5, and non-negative summary counts.
- A unique tenant/product/customer index enforces the single-review rule.
- Rating summaries are rebuilt in the same repository operation as the review mutation.
- The migration was generated and reviewed but was not applied by this implementation task.

## Documented Unrelated Regression Failures

The three full-regression failures are pre-existing Storefront placeholder-image expectation mismatches. All 18 Product Review focused tests pass.

- `StorefrontServiceTests.GetFeaturedCategoriesAsync_MapsImageUrlAndPlaceholder`
- `StorefrontServiceTests.GetBestSellersAsync_MapsPriceImageAndRatingWithFallbacks`
- `StorefrontRepositoryTests.GetProductsAsync_ReturnsPagedCurrentTenantActiveSellableProductsForCategoryWithDetails`

Expected placeholder URLs are asserted by the tests, while current Storefront mapping returns an empty image URL. Product Review implementation did not modify those paths.

## Known Follow-up

- Apply `AddCustomerProductReviewApis` through the deployment migration process after checking existing review rows for tenant/customer/product duplicates.
- Add an end-to-end authorization middleware test using staff/platform identities against mutation endpoints.
- Add real PostgreSQL relational tests for the unique and check constraints.
- Add concurrent multi-customer mutation coverage for per-product summary consistency.
- Add manual API verification with a running application, effective tenant entitlement, customer access token, and completed purchase data.
- Decide whether later moderation APIs should support `PENDING` and `REJECTED`; they are intentionally outside these first four APIs.

## Second Brain Updates

- [[../../10_TESTING_QA/Test_Case/22_ECommerce/Product_Review_API_Test_Cases]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../Full_Feature_Status_Index]]

## Status Decision

Product Review implementation, focused automated verification, migration scaffolding, and Second Brain documentation are complete. This tracking item remains `Active` rather than `Completed` because no PR/commit reference exists and the global suite still has three documented unrelated Storefront failures that have not been formally accepted as exceptions.
