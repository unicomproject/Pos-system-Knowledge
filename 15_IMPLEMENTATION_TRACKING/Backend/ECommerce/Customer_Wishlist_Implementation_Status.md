<!-- title: Customer Wishlist Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Customer Wishlist Implementation Status

## Purpose

Track backend implementation status for authenticated customer wishlist APIs used
by product listing and product detail heart actions.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce CustomerWishlist |
| Feature | Customer Wishlist APIs |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Focused tests exist; latest full regression/exception acceptance pending |

## Feature Summary

CustomerOnly endpoints support reading the default wishlist, adding a product or
variant, removing an owned item, and clearing the wishlist. The implementation
uses the customer JWT `tenant_id` and `sub` claims only; tenant/customer identity
is not accepted from the request body.

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/wishlist` | Read default wishlist | `CustomerOnly` |
| POST | `/api/v1/ecommerce/storefront/wishlist/items` | Add product/variant | `CustomerOnly` |
| DELETE | `/api/v1/ecommerce/storefront/wishlist/items/{itemId}` | Remove owned item | `CustomerOnly` |
| DELETE | `/api/v1/ecommerce/storefront/wishlist` | Clear wishlist | `CustomerOnly` |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/ECommerce/CustomerWishlist/CustomerWishlistController.cs
src/E_POS.Application/Modules/ECommerce/CustomerWishlist/
src/E_POS.Domain/Modules/ECommerce/Customer/Entities/CustomerWishlist.cs
src/E_POS.Domain/Modules/ECommerce/Customer/Entities/CustomerWishlistItem.cs
src/E_POS.Infrastructure/Modules/ECommerce/CustomerWishlist/Repositories/CustomerWishlistRepository.cs
tests/E_POS.UnitTests/ECommerce/CustomerWishlist/CustomerWishlistServiceTests.cs
tests/E_POS.ApiTests/ECommerce/CustomerWishlist/CustomerWishlistControllerTests.cs
tests/E_POS.IntegrationTests/ECommerce/CustomerWishlist/CustomerWishlistRepositoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | `CustomerOnly` policy. |
| Tenant status | Done | JWT tenant and repository tenant filters. |
| Feature entitlement | Needs review | Confirm explicit `online_store` entitlement handling for wishlist actions. |
| Permission | N/A | Customer flow, not tenant staff permission. |
| Ownership | Done | Item removal and clear are scoped to current customer. |

## Database Tables Used

| Table | Usage |
|---|---|
| `customer_wishlists` | Default wishlist header. |
| `customer_wishlist_items` | Wishlist lines. |
| `customers` / `customer_auth_sessions` | Authenticated customer context. |
| `products` / `product_variants` | Product validation and display data. |
| `product_images` / `media_assets` | Product/variant image projection. |
| `price_lists` / `price_list_items` | Current tenant price projection. |
| `inventory_balances` | Stock/availability projection. |

## Test Result Summary

Focused wishlist unit, API, and integration tests exist. Previous documentation
records focused tests passing, with unrelated storefront image regression noted.
This implementation status remains `Testing` until current regression evidence
and PR/commit reference are recorded.

## Known Follow-up

- Add middleware-level invalid staff/platform identity test.
- Add inactive/wrong-product and cross-tenant variant coverage.
- Add repeated clear idempotency coverage.
- Record latest full regression and accepted exceptions before marking Completed.

## Related Files

- [[../../../10_TESTING_QA/Test_Case/22_ECommerce/Customer_Wishlist_API_Test_Cases]]
- [[../Customer_Wishlist_API_Testing_Status]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]