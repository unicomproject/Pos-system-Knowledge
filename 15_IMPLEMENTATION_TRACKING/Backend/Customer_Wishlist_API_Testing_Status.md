<!-- title: Customer Wishlist API Testing Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-16 -->

# Customer Wishlist API Testing Status

| Field | Value |
|---|---|
| Module | E-Commerce Customer Wishlist |
| Feature | Authenticated default wishlist read/add/remove/clear APIs |
| Status | Implemented; Wishlist focused verification passing; global regression has 3 documented unrelated failures |
| Completed Date | Not marked complete until global regression policy is satisfied or exceptions are formally accepted |
| Repo Area | `BACKEND / E_POS` |
| PR / Commit | Not committed in the current worktree |
| Second Brain Update | Wishlist feature test-case and this tracking note created on 2026-07-16 |

## Scope Implemented

- Read the authenticated customer's default `My Wishlist` without creating a database row on an empty GET.
- Lazily create the default wishlist on first valid add.
- Add an active, sellable current-tenant product or optional product variant.
- Treat repeated add of the same product/variant as an idempotent safe no-op.
- Remove an item only from the authenticated customer's wishlist.
- Clear all items from the authenticated customer's wishlist.
- Enrich wishlist items with product name, slug, current price, primary image, stock state, and availability.
- Resolve tenant/customer identity only from JWT `tenant_id` and `sub` claims.
- Protect every endpoint with the ASP.NET Core `CustomerOnly` policy.

## APIs Implemented

| Method | Endpoint | Purpose | Authorization | Verification |
|---|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/wishlist` | Read default customer wishlist | `CustomerOnly` | Repository empty-read coverage; controller policy/claims coverage |
| POST | `/api/v1/ecommerce/storefront/wishlist/items` | Add product/variant | `CustomerOnly` | Unit, API, and integration coverage |
| DELETE | `/api/v1/ecommerce/storefront/wishlist/items/{itemId}` | Remove owned item | `CustomerOnly` | Unit, API, and integration coverage |
| DELETE | `/api/v1/ecommerce/storefront/wishlist` | Clear owned wishlist | `CustomerOnly` | Integration coverage and route contract |

## Files Changed

### API / Application

- `src/E_POS.Api/Controllers/V1/ECommerce/CustomerWishlist/CustomerWishlistController.cs`
- `src/E_POS.Application/Modules/ECommerce/CustomerWishlist/Contracts/ICustomerWishlistService.cs`
- `src/E_POS.Application/Modules/ECommerce/CustomerWishlist/Contracts/ICustomerWishlistRepository.cs`
- `src/E_POS.Application/Modules/ECommerce/CustomerWishlist/Dtos/CustomerWishlistModels.cs`
- `src/E_POS.Application/Modules/ECommerce/CustomerWishlist/Services/CustomerWishlistService.cs`
- `src/E_POS.Application/DependencyInjection.cs`

### Domain / Infrastructure

- `src/E_POS.Domain/Modules/ECommerce/Customer/Entities/CustomerWishlist.cs`
- `src/E_POS.Domain/Modules/ECommerce/Customer/Entities/CustomerWishlistItem.cs`
- `src/E_POS.Infrastructure/Modules/ECommerce/CustomerWishlist/Repositories/CustomerWishlistRepository.cs`
- `src/E_POS.Infrastructure/DependencyInjection.cs`

### Automated Tests

- `tests/E_POS.UnitTests/ECommerce/CustomerWishlist/CustomerWishlistServiceTests.cs`
- `tests/E_POS.ApiTests/ECommerce/CustomerWishlist/CustomerWishlistControllerTests.cs`
- `tests/E_POS.IntegrationTests/ECommerce/CustomerWishlist/CustomerWishlistRepositoryTests.cs`

## Automated Verification

| Verification | Result |
|---|---|
| Wishlist unit tests | 4 passed, 0 failed |
| Wishlist API tests | 4 passed, 0 failed |
| Wishlist integration tests | 4 passed, 0 failed |
| Solution build | Passed, 0 warnings, 0 errors |
| EF pending model changes | None |
| Full API test project | 285 passed, 0 failed |
| Full unit test project | 398 passed, 2 failed |
| Full integration test project | 284 passed, 1 failed |
| Full regression total | 967 passed, 3 failed |

## Documented Unrelated Regression Failures

The three full-regression failures are pre-existing Storefront placeholder-image expectation mismatches. Wishlist focused tests have no failures.

- `StorefrontServiceTests.GetFeaturedCategoriesAsync_MapsImageUrlAndPlaceholder`
- `StorefrontServiceTests.GetBestSellersAsync_MapsPriceImageAndRatingWithFallbacks`
- `StorefrontRepositoryTests.GetProductsAsync_ReturnsPagedCurrentTenantActiveSellableProductsForCategoryWithDetails`

Expected placeholder URLs are asserted by the tests, while the current Storefront mapping returns an empty image URL. These failures were not changed as part of the Wishlist scope.

## Known Follow-up

- Add an end-to-end authorization middleware test using an invalid staff/platform identity against Wishlist endpoints.
- Add dedicated tests for inactive, wrong-product, and cross-tenant variants.
- Add a mixed-tenant/mixed-customer Wishlist GET repository test.
- Add repeated-clear idempotency coverage.
- Add PostgreSQL relational-provider coverage for the nullable `product_variant_id` unique index and concurrent add behavior.
- Perform manual API verification with a real customer access token after the application is running.

## Second Brain Updates

- [[../../10_TESTING_QA/Test_Case/22_ECommerce/Customer_Wishlist_API_Test_Cases]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/25_ECommerce_Storefront_And_Customer_Features]]

## Status Decision

Wishlist implementation and focused automated verification are complete. This tracking item remains `Active` rather than `Completed` because the Backend tracking completion rule requires a fully passing regression suite or a formally accepted exception for the three unrelated Storefront failures.
