<!-- title: Storefront Currency Pipeline Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-22 -->

# Storefront Currency Pipeline Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 22 Online Store Cart Checkout / E-Commerce Storefront |
| Feature | Tenant Currency Pipeline |
| Feature Type | Read / Workflow / Integration |
| API Endpoint | Product listing/detail/search/best-sellers, wishlist, cart, checkout |
| Application Service | Storefront, CustomerWishlist, StorefrontCart, StorefrontCheckout |
| Required Permission | Public browse for storefront; CustomerOnly for wishlist/checkout |
| Tenant Scoped | Yes |
| Idempotency Required | Checkout confirm only; currency pipeline itself is not idempotency-specific |
| Criticality | High |

## Purpose

Validate that e-commerce price displays and order snapshots use the tenant-selected currency consistently. The frontend should format with the tenant currency code, while backend price selection must only read prices from active/valid price lists matching `tenants.base_currency_code`.

## Preconditions

- Tenant exists and is active.
- Tenant has a configured `base_currency_code`.
- Active/valid `price_lists` exist for product pricing.
- Product prices exist in the tenant currency before storefront/cart/checkout use.
- Customer is authenticated for wishlist and checkout flows.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-CURRENCY-001 | Product listing uses tenant base currency | Integration | High | Product price and `currencyCode` match tenant currency |
| ECOM-CURRENCY-002 | Product details and variant prices use tenant base currency | Integration | High | Detail/variant DTOs return same currency code |
| ECOM-CURRENCY-003 | Best sellers map currency code | Unit / Integration | Medium | Best seller DTO includes price and `currencyCode` |
| ECOM-CURRENCY-004 | Wishlist item uses tenant currency price list | Integration | High | Wishlist item ignores other-currency price list rows |
| ECOM-CURRENCY-005 | Cart add item uses tenant currency price list | Integration | High | Cart currency and item unit price match tenant currency |
| ECOM-CURRENCY-006 | Checkout from-cart accepts only current-currency carts | Integration | High | Stale different-currency carts are not reused |
| ECOM-CURRENCY-007 | Frontend contract models accept currency code | Build | Medium | Angular build succeeds with `currencyCode` fields |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| ECOM-CURRENCY-SUCCESS-001 | Tenant base USD with LKR price also present | USD default price list + LKR non-default price list | `GET /catalog/products?categoryId=...` | Fetch listing | Price is USD amount and `currencyCode=USD` | Done |
| ECOM-CURRENCY-SUCCESS-002 | Wishlist item with LKR and USD price rows | Tenant resolves to LKR | Add wishlist item | Read wishlist | LKR price returned and USD row ignored | Done |
| ECOM-CURRENCY-SUCCESS-003 | Cart add item with tenant base USD | USD tenant + USD/LKR price rows | `POST /cart/items` | Add item | Cart `currencyCode=USD`, unit price uses USD | Done |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| ECOM-CURRENCY-VALIDATION-001 | No matching currency price list item | Product has no valid item in tenant currency | Price-not-configured path for cart/checkout; storefront price defaults safely | Covered by existing cart/checkout validation tests |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-CURRENCY-PERMISSION-001 | Public storefront currency reads | Anonymous with valid tenant context | Allowed | Covered by storefront tests |
| ECOM-CURRENCY-PERMISSION-002 | Customer wishlist/checkout currency reads | CustomerOnly JWT | Allowed only for owning customer/tenant | Covered by wishlist/checkout tests |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-CURRENCY-TENANT-001 | Other-tenant product/price rows exist | Tenant A and Tenant B data present | Tenant A never receives Tenant B price | Covered by storefront/wishlist/cart integration tests |
| ECOM-CURRENCY-TENANT-002 | Same product has another-currency price row | LKR and USD price lists exist for tenant | Only tenant base currency row is selected | Done |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-CURRENCY-RULE-001 | Storefront listing currency selection | Use `tenants.base_currency_code` | `currencyCode` equals tenant currency | Done |
| ECOM-CURRENCY-RULE-002 | Price list date/status filtering | Active and valid price lists/items only | Inactive/expired rows ignored | Covered by existing pricing/current-price tests |
| ECOM-CURRENCY-RULE-003 | Frontend formatting | No frontend FX conversion | Amount is formatted with tenant code/symbol from tenant context | Build verified |

## Idempotency Test Cases

Use this section only when `Idempotency Required = Yes`.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| ECOM-CURRENCY-IDEMPOTENCY-001 | Checkout confirm repeat | Completed checkout already has order | Existing order returned without duplicate | Covered by checkout confirm tests |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-CURRENCY-DB-001 | Product price query joins price list | `price_list_items.price_list_id` resolves to matching active `price_lists.currency_code` | Done |
| ECOM-CURRENCY-DB-002 | Cart currency snapshot | `shopping_carts.currency_code` equals current tenant currency | Done |
| ECOM-CURRENCY-DB-003 | Checkout currency snapshot | `checkout_sessions.currency_code` is copied from current-currency cart | Covered by checkout integration tests |
| ECOM-CURRENCY-DB-004 | Order currency snapshot | `sales_orders.currency_code` is copied from checkout | Covered by checkout/order tests |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `tests/E_POS.UnitTests/ECommerce/Storefront/StorefrontServiceTests.cs` | `GetBestSellersAsync_MapsPriceImageAndRatingWithFallbacks` includes `CurrencyCode` mapping | Done |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/ECommerce/Storefront/StorefrontRepositoryTests.cs` | `GetProductsAsync_UsesTenantBaseCurrencyPriceListAndReturnsCurrencyCode` | Done |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/ECommerce/CartCheckout/StorefrontCartRepositoryTests.cs` | `AddItemAsync_UsesTenantBaseCurrencyPriceList` | Done |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/ECommerce/CustomerWishlist/CustomerWishlistRepositoryTests.cs` | Wishlist item maps LKR currency and ignores USD row | Done |

## Test Commands

```powershell
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
npm run build
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | 554 passed |
| Integration Tests | 357 passed |
| API Tests | 329 passed |
| Frontend Build | Passed with existing budget/CommonJS warnings |
| Known Gaps | No FX conversion; currency amount values must be configured in price lists |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service mapping exists.
- [x] Integration tests added where database price-list filtering matters.
- [x] API tests covered through existing storefront/cart/checkout endpoint tests.
- [x] Permission denied case evaluated through existing public/customer endpoint coverage.
- [x] Tenant isolation case tested.
- [x] Idempotency tested where checkout confirm applies.
- [x] Regression impact checked.
- [x] Test commands and results recorded.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Permission_Test_Cases]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../Idempotency_Test_Cases]]
- [[../../Regression_Checklist]]

