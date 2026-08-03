<!-- title: Customer Profile POS Customer Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Customer Profile POS Customer Implementation Status

## Purpose

Track backend implementation status for tenant/POS customer management APIs.
These APIs live in the ECommerce Customer application module but are tenant/POS
operational APIs, not anonymous online-store customer auth APIs.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce Customer |
| Feature | POS Customer Profile, Listing, Orders, And Attach To Sale |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Unit/integration tests exist; latest full regression not recorded here |

## Feature Summary

Tenant-authenticated users can create/list/update customers, read customer
summary and order history, and attach a customer to a POS sale. The service
validates tenant context, permissions, trusted device/till context where needed,
duplicate identity rules, and same-tenant customer/sale scope.

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| POST | `/api/v1/customers?deviceId=...` | Create POS customer | `TenantOnly` plus service checks |
| GET | `/api/v1/customers/summary?deviceId=...` | Read customer summary | `TenantOnly` plus service checks |
| GET | `/api/v1/customers` | List/search/filter customers | `TenantOnly` plus service checks |
| GET | `/api/v1/customers/{customerId}` | Read customer details | `TenantOnly` plus service checks |
| GET | `/api/v1/customers/{customerId}/orders` | Read customer order history | `TenantOnly` plus service checks |
| POST | `/api/v1/customers/{customerId}/attach-to-sale` | Attach customer to sale | `TenantOnly` plus POS context checks |
| PUT | `/api/v1/customers/{customerId}` | Update customer | `TenantOnly` plus service checks |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/Tenant/CustomersController.cs
src/E_POS.Application/Modules/ECommerce/Customer/Contracts/IPosCustomerService.cs
src/E_POS.Application/Modules/ECommerce/Customer/Contracts/IPosCustomerRepository.cs
src/E_POS.Application/Modules/ECommerce/Customer/Dtos/PosCustomerListDtos.cs
src/E_POS.Application/Modules/ECommerce/Customer/Services/PosCustomerService.cs
src/E_POS.Infrastructure/Modules/ECommerce/Customer/Repositories/PosCustomerRepository.cs
tests/E_POS.UnitTests/Customer/PosCustomerServiceTests.cs
tests/E_POS.IntegrationTests/Customer/PosCustomerRepositoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | `TenantOnly` controller policy. |
| Tenant status | Done | Tenant request context and repository tenant filters. |
| Feature entitlement | Needs review | Confirm customer/loyalty/online-store entitlement mapping for each action. |
| Permission | Done | Service checks customer create/update/list/view/attach permissions. |
| Trusted device | Done where required | Device id is validated for POS-context operations. |
| Assigned till/open till | Done where required | Attach/list/detail operations validate till context where required. |
| Tenant isolation | Done | Customer and sales lookups are tenant scoped. |

## Database Tables Used

| Table | Usage |
|---|---|
| `customers` | Customer identity/profile records. |
| `sales_orders` / `sales_order_lines` | Customer order history and attach-to-sale validation. |
| `pos_devices` / `tills` / assignments | POS context validation. |
| `tenant_users` / permissions | Tenant user access checks. |

## Test Result Summary

Unit and integration test files exist for POS customer service/repository. This
status remains `Testing` because a current full regression and PR/commit evidence
were not recorded during this documentation update.

## Known Follow-up

- Add/update formal QA markdown if not already present for POS customer APIs.
- Record latest unit, integration, API, and full regression results.
- Confirm entitlement mapping for customer module actions.
- Verify attach-to-sale behavior with real sale state in manual API testing.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/01_Module_Overview]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/19_Customer_Basic_Authentication_And_Consent_UPDATED]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]