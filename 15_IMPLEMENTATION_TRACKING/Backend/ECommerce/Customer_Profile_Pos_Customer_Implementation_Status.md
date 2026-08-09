<!-- title: Customer Profile POS Customer Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

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
| Status | Complete |
| Completed Date | 2026-08-08 |
| PR / Commit | - |
| Tests | 2026-08-08 Release build and full Unit/API/Integration regressions pass |

### `customers.create` Permission Restoration — 2026-08-07

Status: **IMPLEMENTED / DATABASE APPLIED / AUTHENTICATED VERIFIED**.

- Restored the canonical `customers.create` definition to
  `DevelopmentPosNewSalePermissionsSeedData` with historical ID
  `77777777-0312-4000-8000-000000000001`.
- Restored its normal development Cashier assignment through the canonical
  aggregated Cashier permission seed.
- Added forward migration
  `20260807143000_RestorePosCustomerCreatePermission`; the historical removal
  migration remains unchanged.
- Upsert and role mapping are duplicate-safe. The fix targets the canonical
  development Cashier role and does not rewrite tenant-custom roles.
- `customers.view` remains search/select permission. `customers.create` remains
  the service-enforced create permission. Attach-to-Sale is unchanged.
- The earlier ordered migration
  `20260807120000_SeedPhase4DefaultTenantSettingDefinitions` was inspected as a
  non-destructive, conflict-safe seed migration and applied before the corrective
  migration through the normal EF flow.
- Development DB verification: the permission definition exists exactly once,
  is active/system-owned, and the canonical Cashier has exactly one effective
  `customers.create` and one `customers.view` assignment. No custom role or
  unrelated administrative grant was broadened.
- Authenticated runtime verification: canonical Cashier resolved both approved
  permissions; customer search returned HTTP 200 and one controlled POS customer
  create returned HTTP 201. A legitimate tenant principal without
  `customers.create` received HTTP 403 with
  `pos_customers.create_permission_denied`; no negative-request row persisted.
- Controlled evidence customer: `f937fb64-4072-4ffc-8ddd-148722da3ac2`, tenant
  `55555555-0000-4000-8000-000000000001`, status `ACTIVE`, source `POS`, generated
  code `CUS000003`. Retained for local acceptance evidence.

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
| Feature entitlement | Needs review | Current POS customer service has no explicit customer entitlement gate; Loyalty is deferred and unrelated to Release 1 Customer Management. |
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

2026-08-08 backend completion evidence:

- Release solution build: passed with 0 warnings and 0 errors.
- Focused customer/permission tests: service and seed 35/35, controller 6/6,
  repository 3/3.
- Full regression: Unit 919/919, API 366/366, Integration 492/492.
- EF database update completed and reported the development database already
  up to date; corrective migration
  `20260807143000_RestorePosCustomerCreatePermission` is applied.
- Direct read-only DB verification found exactly one definition row for each of
  `customers.view`, `customers.create`, `customers.update`, and
  `sales.cart.manage`. The development `CASHIER` role has exactly one active
  mapping for each of the four permissions.
- Customer source data currently contains `POS` and `ECOMMERCE` records only;
  no `CLICK_AND_COLLECT`, `MANUAL`, or `IMPORT` producer/data was proven.
- Fresh authenticated runtime acceptance for all seven APIs and real
  editable-sale attachment passed on 2026-08-08; evidence is recorded below.

### Till Name Order-History Gap — 2026-08-08

Status: **IMPLEMENTED / AUTOMATED VERIFIED / AUTHENTICATED RUNTIME VERIFIED**.

- Extended the existing `PosCustomerOrderItemDto` with nullable `tillName`.
- Projected it through the existing `sales_orders.till_id -> tills.id`
  relationship alongside `outletDisplayName`.
- No table, column, customer endpoint, or migration was added.
- Historical orders without a till remain safe and return `null`.
- Focused integration coverage verifies both outlet and till names.

### Final Authenticated Runtime Acceptance — 2026-08-08

Status: **PASS — BACKEND STEP 1 COMPLETE**.

- Fresh normal tenant login returned HTTP 200 for the seeded development
  Cashier. No authentication bypass, forged token, or claim override was used.
- Runtime effective permissions included `customers.view`, `customers.create`,
  `customers.update`, and `sales.cart.manage`.
- Tenant `55555555-0000-4000-8000-000000000001` resolved trusted active device
  `bbbbbbbb-0003-4000-8000-000000000001`, assigned `Front Till 01`, and open
  session `0d64b097-4ef4-43f5-b601-38d685aa91f9`.
- Summary, list, detail, orders, create, update, and attach endpoints returned
  their canonical successful status codes.
- Authenticated order-history JSON retained `outletDisplayName` as
  `Development Main Store` and returned `tillName` as `Front Till 01`.
- Controlled customer `f7d93b45-96e0-4a16-b48e-6fb167758893` was created by
  API as `CUS000009`, source `POS`, status `ACTIVE`; edit and read-back passed.
- A genuine Park API call created editable DRAFT sale
  `33464da3-6d90-4e6f-aef5-2e2135349b3f`. ACTIVE attach returned HTTP 200 with
  `SALE_ASSIGNED`; Park-list read-back and a read-only DB query both confirmed
  the customer persisted on the intended sale, till, and session.
- Normal update changed the controlled customer to `INACTIVE`; attach returned
  HTTP 422 with `pos_customers.customer_inactive`. Normal update then changed it
  to `BLOCKED`; attach returned HTTP 422 with
  `pos_customers.customer_blocked`.
- A nonexistent sale attach returned HTTP 409 with
  `pos_customers.sale_not_editable`.
- DELETED, wrong-tenant, and missing-permission cases remain covered by the
  passing automated suites because recreating those principals/states in the
  shared runtime DB was unnecessary or unsafe.

## Known Follow-up

- Formal QA contract: [[../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Customer_Management_Test_Cases]].
- No explicit customer entitlement gate exists in the current controller/service;
  no canonical Customer-specific entitlement was found, so none was invented.
- Current verified customer source producers are `POS` and `ECOMMERCE`.
  The repository accepts canonical source values, but
  `CLICK_AND_COLLECT`, `MANUAL`, and `IMPORT` producers/data remain unproven.
- Loyalty, membership tiers, and points are deferred Release 1 scope, not
  Customer Management completion dependencies.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/01_Module_Overview]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/19_Customer_Basic_Authentication_And_Consent_UPDATED]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]
