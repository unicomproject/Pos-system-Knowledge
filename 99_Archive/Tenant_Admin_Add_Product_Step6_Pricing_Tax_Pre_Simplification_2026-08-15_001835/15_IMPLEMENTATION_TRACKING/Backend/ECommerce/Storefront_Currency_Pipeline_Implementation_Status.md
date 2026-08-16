<!-- title: Storefront Currency Pipeline Implementation Status -->
<!-- status: Completed -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-29 -->

# Storefront Currency Pipeline Implementation Status

## Purpose

Use this template for every completed or in-progress feature status file.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce Storefront / Cart Checkout / Wishlist |
| Feature | Tenant Currency Pipeline |
| Status | Completed |
| Completed Date | 2026-07-22 |
| Developer | - |
| Reviewer | - |
| PR / Commit | - |
| Tests | Passed |

## Feature Summary

Implements Tenant-selected currency mapping across all storefront pricing APIs (Product Listing, Detail, Wishlist, Cart, and Checkout). Ensures price amounts returned to the frontend match the active price list specifically configured for the tenant's base currency.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../04_MODULE_KNOWLEDGE/Storefront/01_Module_Overview]] |
| User journey | [[../../../03_USER_JOURNEYS/E-commerce/01_New_Customer_Order_Flow]] |
| Full Stack Status | [[../../Online_Store/01_ECommerce_Implementation_Status]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/05_Pricing_And_Taxes.md]] |
| Architecture | [[../../../05_BACKEND_ARCHITECTURE/Backend_Overview]] |

## Files Changed

```text
src/E_POS.Application/Modules/ECommerce/Storefront/Dtos/StorefrontModels.cs
src/E_POS.Application/Modules/ECommerce/Storefront/Mappers/StorefrontProductMapper.cs
src/E_POS.Application/Modules/ECommerce/Storefront/Contracts/IStorefrontProductRepository.cs
src/E_POS.Application/Modules/ECommerce/CustomerWishlist/Dtos/CustomerWishlistModels.cs
src/E_POS.Infrastructure/Modules/ECommerce/Storefront/Repositories/StorefrontProductRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/Storefront/Repositories/StorefrontRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/CartCheckout/Repositories/StorefrontCartRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/CartCheckout/Repositories/StorefrontCheckoutRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/CustomerWishlist/Repositories/CustomerWishlistRepository.cs
src/app/core/models/product.model.ts
src/app/core/models/product-detail.model.ts
src/app/core/models/search.model.ts
src/app/core/models/wishlist.models.ts
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | Standard Auth flows apply for specific modules |
| Tenant status | Done | Verified |
| Feature entitlement | N/A | |
| Permission | N/A | |
| Outlet access | N/A | |
| Trusted device | N/A | |
| Assigned till | N/A | |
| Open till session | N/A | |

## Database Tables Used

| Table | Usage |
|---|---|
| `tenants` | reference (`base_currency_code`) |
| `price_lists` | read |
| `price_list_items` | read |

*Note: No database migration was required.*

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Unit | `E_POS.UnitTests` | Passed (554 total) |
| API | `E_POS.ApiTests` | Passed (329 total) |
| Integration | `E_POS.IntegrationTests` | Passed (357 total) |

## Test Commands Run

```text
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
npm run build
```

## Test Result Summary

Passed with 0 warnings, 0 errors in backend. npm run build passed with existing Angular budget/CommonJS warnings.

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| `Full_Feature_Status_Index.md` | Added E-Commerce Full Stack tracking row |
| `Online_Store/01_ECommerce_Implementation_Status.md` | Created central tracking for frontend & backend |

---

## Technical Notes (Reference)

### Business Rules
- The tenant master currency is the source of truth: `tenants.base_currency_code`.
- Price amounts are not converted by frontend code. Backend must return prices already stored/configured for the tenant currency.
- If another currency price list exists for the same product, storefront/cart/wishlist/checkout must not accidentally select it.
- Price list eligibility requires active status plus valid effective date range on both `price_lists` and `price_list_items`.
- One active default price list per tenant remains the preferred source; priority is used as tie-breaking/fallback within the same tenant currency.

### Implemented Scope Details
- Storefront product listing, product details, best sellers, and search now resolve the tenant `BaseCurrencyCode` and return `currencyCode` with product price DTOs.
- Active cart lookup now reuses only carts whose `currency_code` matches the current tenant currency, preventing stale carts after a tenant currency change.
- Cart `is_tax_inclusive` now comes from the effective active price list for the current currency instead of a currency-agnostic default list.
- Frontend product/search/detail/wishlist TypeScript models now include optional `currencyCode` fields for backend contract compatibility.
