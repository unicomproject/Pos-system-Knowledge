<!-- title: Storefront Checkout Implementation Status -->
<!-- status: Completed -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-29 -->

# Storefront Checkout Implementation Status

## Purpose

Use this template for every completed or in-progress feature status file.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce CartCheckout |
| Feature | Storefront Checkout / Requested Collection Window |
| Status | Completed |
| Completed Date | 2026-07-17 |
| Developer | - |
| Reviewer | - |
| PR / Commit | - |
| Tests | Passed |

## Feature Summary

Implements CustomerOnly protected checkout endpoints to create, read, update (outlet selection & pickup time), and confirm a Click & Collect checkout session from an existing cart. Includes server-side price/tax recalculation, real-time inventory validation/reservation, and outlet business hour dynamic collection slot handling.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../04_MODULE_KNOWLEDGE/CartCheckout/01_Module_Overview]] |
| User journey | [[../../../03_USER_JOURNEYS/E-commerce/01_New_Customer_Order_Flow]] |
| Full Stack Status | [[../../Online_Store/01_ECommerce_Implementation_Status]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/06_Sales_Orders_And_Fulfillment.md]] |
| Architecture | [[../../../05_BACKEND_ARCHITECTURE/Backend_Overview]] |

## Files Changed

```text
src/E_POS.Api/Controllers/V1/ECommerce/CartCheckout/
src/E_POS.Application/Modules/ECommerce/CartCheckout/
src/E_POS.Infrastructure/Modules/ECommerce/CartCheckout/Repositories/StorefrontCheckoutRepository.cs
src/E_POS.Domain/Modules/Tenant/Orders/Entities/CheckoutSession.cs
tests/E_POS.UnitTests/ECommerce/CartCheckout/
tests/E_POS.ApiTests/ECommerce/CartCheckout/
tests/E_POS.IntegrationTests/ECommerce/CartCheckout/
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | `CustomerOnly` protected endpoints |
| Tenant status | Done | Verified via JWT |
| Feature entitlement | Done | Storefront reads require effective `online_store` and `click_collect` |
| Permission | N/A | |
| Outlet access | Done | Validated against outlet business hours and availability |
| Trusted device | N/A | |
| Assigned till | N/A | |
| Open till session | N/A | |

## Database Tables Used

| Table | Usage |
|---|---|
| `checkout_sessions` | read/write/snapshot |
| `sales_orders` | write (on confirm) |
| `fulfillment_method_outlets` | reference (for collection configuration) |

*Note: Database Migration `20260717053528_AddStorefrontRequestedCollectionWindow` was executed.*

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Unit | `E_POS.UnitTests` | Passed (430 total) |
| API | `E_POS.ApiTests` | Passed (297 total) |
| Integration | `E_POS.IntegrationTests` | Passed (308 total) |

## Test Commands Run

```text
dotnet build E_POS.sln -c Release
dotnet test E_POS.sln -c Release --no-build
```

## Test Result Summary

All tests passed successfully with 0 warnings and 0 errors. EF pending-model check confirms no new migrations required beyond the collection window migration.

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| `Full_Feature_Status_Index.md` | Added E-Commerce Full Stack tracking row |
| `Online_Store/01_ECommerce_Implementation_Status.md` | Created central tracking for frontend & backend |

---

## API Details (Reference)

### API Surface
| Endpoint | Purpose |
|---|---|
| `POST /api/v1/ecommerce/storefront/checkout/from-cart` | Create checkout session from cart and reserve selected outlet inventory. |
| `GET /api/v1/ecommerce/storefront/checkout/{sessionId}` | Read checkout session. |
| `PATCH /api/v1/ecommerce/storefront/checkout/{sessionId}/collection` | Select/change collection outlet and requested collection time. |
| `POST /api/v1/ecommerce/storefront/checkout/{sessionId}/confirm` | Confirm checkout into sales order. |
| `GET /api/v1/ecommerce/storefront/fulfillment/stores/{outletId}/collection-options?days=5` | Generate available collection dates/times from outlet configuration. |

### Technical Notes
- Atomic outlet-change reservation move with rollback when the newly selected outlet has insufficient stock.
- Idempotent checkout confirmation using completed session/order state and `Idempotency-Key`.
- Requested collection start/end/timezone snapshot copied from checkout session to sales order on confirmation.
- Expiry handling that releases inventory reservation.
- **Not Included:** Payment capture, Buy Now checkout, Delivery/Shipping checkout.
