<!-- title: Storefront Cart Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Storefront Cart Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 21 Cart Checkout / E-Commerce Storefront Cart |
| Feature | Storefront Cart Management APIs |
| Feature Type | Read / Create / Update / Delete / Workflow |
| API Endpoint | `GET/POST/PATCH/DELETE /api/v1/ecommerce/storefront/cart` |
| Application Service | `IStorefrontCartService` / `StorefrontCartService` |
| Required Permission | Public guest cart with tenant and cart-session headers |
| Tenant Scoped | Yes, via `X-Tenant-Id` and repository tenant filters |
| Idempotency Required | No; repeated add merges quantity safely |
| Criticality | High |

## Purpose

Validate the storefront cart APIs used before customer login and checkout. The
cart is scoped by tenant and `X-Cart-Session-Id`; it must price items server-side,
respect available inventory, support guest-session continuity, and never expose
cross-tenant cart lines or trust frontend totals.

## Preconditions

- Tenant exists and is active.
- Storefront request includes `X-Tenant-Id` and `X-Cart-Session-Id`.
- Active sellable products and variants exist for success scenarios.
- Active price list items exist for the tenant base currency.
- Inventory balance exists where stock validation is required.

## API Surface

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/ecommerce/storefront/cart` | Read current session cart. |
| POST | `/api/v1/ecommerce/storefront/cart/items` | Add product or variant to cart. |
| PATCH | `/api/v1/ecommerce/storefront/cart/items/{itemId}` | Update cart line quantity. |
| DELETE | `/api/v1/ecommerce/storefront/cart/items/{itemId}` | Remove one cart line. |
| DELETE | `/api/v1/ecommerce/storefront/cart` | Clear all active cart lines. |

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-CART-001 | Add valid product | API / Integration | Critical | Cart created or reused; line added; totals calculated server-side. |
| ECOM-CART-002 | Add same product twice | Integration | High | Existing line quantity merges; no duplicate active line. |
| ECOM-CART-003 | Read cart by session | API / Unit | High | Current session cart returned only inside tenant scope. |
| ECOM-CART-004 | Update quantity | API / Integration | High | Quantity and totals update when stock is available. |
| ECOM-CART-005 | Update above stock | Unit / Integration | Critical | 409 conflict and existing line unchanged. |
| ECOM-CART-006 | Remove item | Integration | High | Owned line is marked removed and cart totals recalculate. |
| ECOM-CART-007 | Clear cart | Integration | Medium | Active lines removed and totals reset. |
| ECOM-CART-008 | Tenant currency pricing | Integration | High | Cart uses tenant base-currency price list only. |

## Success Test Cases

| Test Case ID | Scenario | Expected Result | Automated |
|---|---|---|---|
| ECOM-CART-SUCCESS-001 | Add product with valid tenant/session | Data envelope returns updated cart | Done |
| ECOM-CART-SUCCESS-002 | Re-add same product/session | Quantity merges and totals recalculate | Done |
| ECOM-CART-SUCCESS-003 | Use tenant base USD price list | `currencyCode=USD` and USD price used | Done |
| ECOM-CART-SUCCESS-004 | Clear cart | Empty cart and zero grand total | Done |

## Validation And Conflict Test Cases

| Test Case ID | Scenario | Expected Error | Automated |
|---|---|---|---|
| ECOM-CART-VALIDATION-001 | Missing cart session | `storefront_cart.invalid_session` | Done |
| ECOM-CART-VALIDATION-002 | Quantity is zero or negative | `storefront_cart.invalid_quantity` | Done |
| ECOM-CART-VALIDATION-003 | Product does not exist or is not sellable | 404 `storefront_cart.product_not_found` | Not Started |
| ECOM-CART-VALIDATION-004 | Variant does not exist or mismatches product | 404 `storefront_cart.variant_not_found` | Not Started |
| ECOM-CART-CONFLICT-001 | Quantity exceeds available stock | 409 `storefront_cart.insufficient_stock` | Done |
| ECOM-CART-CONFLICT-002 | Cart expired | 409 `storefront_cart.expired` | Not Started |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Expected Result | Automated |
|---|---|---|---|
| ECOM-CART-TENANT-001 | Tenant A reads Tenant A session | Allowed | Partial |
| ECOM-CART-TENANT-002 | Tenant B uses Tenant A session/item id | Not found; Tenant A line unchanged | Done |
| ECOM-CART-TENANT-003 | Product belongs to another tenant | Product not found inside allowed scope | Not Started |
| ECOM-CART-TENANT-004 | Currency price list belongs to another tenant | Other-tenant price ignored | Not Started |

## Database Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| ECOM-CART-DB-001 | Add first item | One `shopping_carts` row and one `shopping_cart_items` row created | Done |
| ECOM-CART-DB-002 | Re-add same item | Same line quantity increases; no duplicate active line | Done |
| ECOM-CART-DB-003 | Stock conflict | Existing line quantity remains unchanged | Done |
| ECOM-CART-DB-004 | Remove item | Line status changes to removed | Done |
| ECOM-CART-DB-005 | Clear cart | Active lines removed and totals reset | Done |

## Current Automated Test Coverage

| Test Project | Test File | Current Coverage | Status |
|---|---|---|---|
| E_POS.ApiTests | `ECommerce/CartCheckout/StorefrontCartControllerTests.cs` | Header forwarding, data envelope, stock conflict mapping. | Present |
| E_POS.UnitTests | `ECommerce/CartCheckout/StorefrontCartServiceTests.cs` | Session validation, quantity validation, context normalization, safe error mapping. | Present |
| E_POS.IntegrationTests | `ECommerce/CartCheckout/StorefrontCartRepositoryTests.cs` | Add/merge, currency pricing, stock rejection, cross-tenant item denial, clear cart. | Present |

## Test Commands

```powershell
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-restore --filter StorefrontCart
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-restore --filter StorefrontCart
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-restore --filter StorefrontCart
dotnet test E_POS.sln --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Existing coverage present; latest run not recorded in this update |
| API Tests | Existing coverage present; latest run not recorded in this update |
| Integration Tests | Existing coverage present; latest run not recorded in this update |
| Known Gaps | Add API tests for GET, remove, clear, missing headers, product/variant not found, cart expired, and other-tenant product pricing. |

## Related Files

- [[Storefront_Checkout_Test_Cases]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/ECommerce/Storefront_Cart_Implementation_Status]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/22_Cart_And_Checkout_UPDATED]]
- [[../../API_Testing_Standards]]
- [[../../Tenant_Isolation_Test_Cases]]