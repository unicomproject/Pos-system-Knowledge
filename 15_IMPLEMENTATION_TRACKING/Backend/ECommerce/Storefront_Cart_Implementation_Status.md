<!-- title: Storefront Cart Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Storefront Cart Implementation Status

## Purpose

Track backend implementation status for storefront cart management APIs used
before checkout. This is separate from checkout-session creation and order
confirmation.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce CartCheckout |
| Feature | Storefront Cart Management |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Partial automated coverage present; latest full regression not recorded in this update |

## Feature Summary

The backend exposes guest-session cart APIs to read, add, update, remove, and
clear cart lines. Cart state is scoped by tenant and `X-Cart-Session-Id`. Pricing,
stock validation, line merge behavior, currency selection, and totals are handled
server-side. Checkout later consumes the cart through the separate storefront
checkout flow.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../../04_MODULE_KNOWLEDGE/22_Online_Store_Cart_Checkout/01_Module_Overview]] |
| User journey | [[../../../03_USER_JOURNEYS/E-commerce/01_New_Customer_Order_Flow]] |
| Test cases | [[../../../10_TESTING_QA/Test_Case/21_Cart_Checkout/Storefront_Cart_Test_Cases]] |
| Checkout status | [[Storefront_Checkout_Implementation_Status]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/22_Cart_And_Checkout_UPDATED]] |
| API authorization | [[../../../02_ACCESS_CONTROL/API_Authorization_Rules]] |
| Full stack status | [[../../Online_Store/01_ECommerce_Implementation_Status]] |

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/cart` | Read current cart | Tenant and cart-session headers |
| POST | `/api/v1/ecommerce/storefront/cart/items` | Add product/variant | Tenant and cart-session headers |
| PATCH | `/api/v1/ecommerce/storefront/cart/items/{itemId}` | Update quantity | Tenant and cart-session headers |
| DELETE | `/api/v1/ecommerce/storefront/cart/items/{itemId}` | Remove item | Tenant and cart-session headers |
| DELETE | `/api/v1/ecommerce/storefront/cart` | Clear cart | Tenant and cart-session headers |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontCartController.cs
src/E_POS.Application/Modules/ECommerce/CartCheckout/Contracts/IStorefrontCartService.cs
src/E_POS.Application/Modules/ECommerce/CartCheckout/Contracts/IStorefrontCartRepository.cs
src/E_POS.Application/Modules/ECommerce/CartCheckout/Dtos/StorefrontCartModels.cs
src/E_POS.Application/Modules/ECommerce/CartCheckout/Services/StorefrontCartService.cs
src/E_POS.Infrastructure/Modules/ECommerce/CartCheckout/Repositories/StorefrontCartRepository.cs
tests/E_POS.ApiTests/ECommerce/CartCheckout/StorefrontCartControllerTests.cs
tests/E_POS.UnitTests/ECommerce/CartCheckout/StorefrontCartServiceTests.cs
tests/E_POS.IntegrationTests/ECommerce/CartCheckout/StorefrontCartRepositoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | N/A | Cart is guest-session based before login. |
| Tenant status | Partial | Tenant id is required and repository is tenant scoped; explicit active-tenant gate should be reviewed. |
| Feature entitlement | Needs review | Confirm whether cart endpoints require explicit `online_store` entitlement gate. |
| Permission | N/A | No tenant staff permission applies. |
| Outlet/device/till/session | N/A | Not POS/device/till scoped. |
| Cart session | Done | `X-Cart-Session-Id` required and normalized by service. |

## Database Tables Used

| Table | Usage |
|---|---|
| `shopping_carts` | Guest-session cart header/state. |
| `shopping_cart_items` | Cart lines and removed status. |
| `products` | Product validation and display data. |
| `product_variants` | Optional variant validation and display data. |
| `product_images` / `media_assets` | Product/variant image projection. |
| `price_lists` / `price_list_items` | Server-side tenant currency pricing. |
| `inventory_balances` | Stock availability validation. |

## Tests Written

| Test Type | File / Coverage | Result |
|---|---|---|
| API | `StorefrontCartControllerTests.cs` | Present |
| Unit | `StorefrontCartServiceTests.cs` | Present |
| Integration | `StorefrontCartRepositoryTests.cs` | Present |

## Test Result Summary

Latest test command was not run or recorded during this documentation update.
Keep status as `Testing` until full cart API coverage and regression evidence are
recorded.

## Known QA Gaps

- Add controller tests for GET, remove item, clear cart, missing tenant, and missing cart session.
- Add product-not-found, variant-not-found, expired-cart, and inactive-product scenarios.
- Confirm explicit active-tenant and `online_store` entitlement behavior for cart APIs.
- Record latest `dotnet test` commands before marking Completed.

## Completion Checklist

| Check | Status |
|---|---|
| Implementation completed | Present in backend |
| Tests written | Partial |
| Tests run | Not recorded in this update |
| PR/commit recorded | No |
| Second Brain updated | Yes |
| Completed date added | No; status remains Testing |
| No unsupported scope added | Yes |