<!-- title: Customer Orders Implementation Status -->
<!-- status: Completed -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-29 -->

# Customer Orders Implementation Status

## Purpose

Use this template for every completed or in-progress feature status file.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce |
| Feature | Customer Order Tracking & Cancellation |
| Status | Completed |
| Completed Date | 2026-07-19 |
| Developer | - |
| Reviewer | - |
| PR / Commit | e-commerce-tracking |
| Tests | Passed |

## Feature Summary

Implements the Backend APIs for the E-Commerce Click & Collect order flow.
Includes fetching order lists (My Orders), retrieving detailed order metadata (Order Details & QR codes), and allowing customers to cancel their own orders before preparation starts. It also supports Tenant-side status updates.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../04_MODULE_KNOWLEDGE/ECommerce/01_Module_Overview]] |
| User journey (Tracking) | [[../../../03_USER_JOURNEYS/E-commerce/03_Order_Tracking_Collection_Flow]] |
| User journey (Cancel) | [[../../../03_USER_JOURNEYS/E-commerce/02_Order_Cancellation_Flow]] |
| Full Stack Status | [[../../Online_Store/01_ECommerce_Implementation_Status]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/06_Sales_Orders_And_Fulfillment.md]] |
| Architecture | [[../../../05_BACKEND_ARCHITECTURE/Backend_Overview]] |

## Files Changed

```text
src/E_POS.Api/Controllers/V1/ECommerce/CustomerOrders/CustomerOrdersController.cs
src/E_POS.Api/Controllers/V1/Tenant/ECommerce/ClickCollectOrdersController.cs
src/E_POS.Application/Modules/ECommerce/CustomerOrders/Services/CustomerOrderService.cs
src/E_POS.Application/Modules/ECommerce/CustomerOrders/Services/ClickCollectOrderStatusService.cs
src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/CustomerOrderRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/ClickCollectOrderStatusRepository.cs
src/E_POS.Domain/Modules/Tenant/Orders/Entities/SalesOrder.cs
tests/E_POS.UnitTests/ECommerce/CustomerOrders/
tests/E_POS.ApiTests/ECommerce/CustomerOrders/
tests/E_POS.IntegrationTests/ECommerce/CustomerOrders/
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | `CustomerOnly` for Storefront, `TenantOnly` for Admin |
| Tenant status | Done | |
| Feature entitlement | N/A | |
| Permission | Done | Required `fulfillment.orders.manage` for Admin updates |
| Outlet access | Done | |
| Trusted device | N/A | |
| Assigned till | N/A | |
| Open till session | N/A | |

## Database Tables Used

| Table | Usage |
|---|---|
| `sales_orders` | read/write |
| `sales_order_lines` | read |
| `product_images` | reference |
| `sales_order_status_history` | ledger/write |

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Unit | `tests/E_POS.UnitTests/ECommerce/CustomerOrders/` | Passed |
| Integration | `tests/E_POS.IntegrationTests/ECommerce/CustomerOrders/` | Passed |
| API | `tests/E_POS.ApiTests/ECommerce/CustomerOrders/` | Passed |

## Test Commands Run

```text
dotnet test tests/E_POS.ApiTests/
dotnet test tests/E_POS.IntegrationTests/
```

## Test Result Summary

All tests passed successfully. Full Middleware/API/Integration Tests Added for customer and tenant authorization layers.

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| `Full_Feature_Status_Index.md` | Added E-Commerce Full Stack tracking row |
| `Online_Store/01_ECommerce_Implementation_Status.md` | Created central tracking for frontend & backend |

---

## API Details (Reference)

### Customer order list
```http
GET /api/v1/ecommerce/storefront/orders?status=all&page=1&pageSize=10
```
- Powers the My Orders list screen.
- Returns only the logged-in customer orders for the current tenant.

### Customer order details
```http
GET /api/v1/ecommerce/storefront/orders/{orderId}
```
- Powers the Pending Confirmation / Accepted Order Details screens.
- Returns order metadata, collection outlet, payment label, pickup window, items, totals, and QR payload when allowed.

### Customer order cancel
```http
POST /api/v1/ecommerce/storefront/orders/{orderId}/cancel
```
- Allows the logged-in customer to cancel their own click & collect order before preparation starts.
- Allowed in `PENDING_CONFIRMATION` and `ACCEPTED` states.

### Tenant click & collect status update
```http
PATCH /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/status
```
- Allows store staff to update order status through to `COMPLETED`.