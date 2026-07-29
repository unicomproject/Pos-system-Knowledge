<!-- title: Storefront Fulfillment Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Storefront Fulfillment Implementation Status

## Purpose

Track backend implementation status for storefront outlet selection and
collection-option reads used by Click & Collect checkout.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce Storefront / Fulfillment Pickup |
| Feature | Storefront Fulfillment Store And Collection Options |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Controller/service coverage exists; relational repository harness follow-up remains |

## Feature Summary

Storefront fulfillment APIs expose available collection stores and generated
collection options from outlet business-hours configuration. Checkout uses these
options as requested collection windows; Release 1 does not reserve pickup-slot
capacity.

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| GET | `/api/v1/ecommerce/storefront/fulfillment/stores` | Read available collection stores | Public tenant-scoped read |
| GET | `/api/v1/ecommerce/storefront/fulfillment/stores/{outletId}/collection-options` | Generate collection dates/times | Public tenant-scoped read |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/ECommerce/Storefront/StorefrontFulfillmentController.cs
src/E_POS.Application/Modules/ECommerce/Storefront/Contracts/IStorefrontFulfillmentService.cs
src/E_POS.Application/Modules/ECommerce/Storefront/Services/StorefrontFulfillmentService.cs
src/E_POS.Infrastructure/Modules/ECommerce/Storefront/Repositories/StorefrontFulfillmentRepository.cs
tests/E_POS.ApiTests/ECommerce/Storefront/StorefrontControllerTests.cs
tests/E_POS.UnitTests/ECommerce/Storefront/StorefrontServiceTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | N/A | Public storefront read. |
| Tenant status | Done | Tenant header required; active tenant expected by service/repository rules. |
| Feature entitlement | Done/Needs review | Collection-option rules require `online_store` and `click_collect`; verify consistency on stores list. |
| Permission | N/A | No tenant staff permission. |
| Outlet scope | Done | Collection options require outlet within tenant. |

## Database Tables Used

| Table | Usage |
|---|---|
| `outlets` | Store list and outlet lookup. |
| `outlet_business_hours` | Collection window generation. |
| `outlet_closures` / date-specific rules | Closure handling where configured. |
| `fulfillment_methods` / `fulfillment_method_outlets` | Collection enablement/configuration. |
| `tenants` | Tenant status/timezone/currency context. |

## Test Result Summary

Controller validation and service collection-window tests exist. Repository
coverage for raw SQL/store listing needs a relational provider harness before
this can be marked Completed.

## Known Follow-up

- Add relational provider tests for fulfillment store repository behavior.
- Confirm active/effective `online_store` and `click_collect` enforcement for both endpoints.
- Record latest full regression before marking Completed.

## Related Files

- [[../../../10_TESTING_QA/Test_Case/21_Cart_Checkout/Storefront_Checkout_Test_Cases]]
- [[Storefront_Checkout_Implementation_Status]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]