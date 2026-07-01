<!-- title: Module Based Folder Structure -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->


# Module Based Folder Structure

## Purpose

This file defines backend folder structure for TM-EPOS MVP modules.

The structure must support POS, online store, cart/checkout, orders, click and
collect, offline sync, reporting, notification, and integration modules.

## Solution Structure

```text
src/
  E_POS.Api/
  E_POS.Application/
  E_POS.Domain/
  E_POS.Infrastructure/
tests/
  E_POS.UnitTests/
  E_POS.IntegrationTests/
  E_POS.ApiTests/
```

## Module Structure

```text
E_POS.Application/
  Modules/
    Orders/
      Contracts/
      Dtos/
      Services/
      Validators/
```

```text
E_POS.Domain/
  Modules/
    Orders/
      Constants/
      Entities/
      Repositories/
      Services/
      ValueObjects/
```

```text
E_POS.Infrastructure/
  Modules/
    Orders/
      Configurations/
      Persistence/
      Repositories/
```

## MVP Backend Modules

| Module | Purpose |
|---|---|
| PlatformAdministration | Platform users, roles, tenants, billing setup |
| TenantFoundation | Tenants, profiles, addresses, domains, settings |
| SubscriptionBilling | Plans, add-ons, invoices, payment links, usage |
| AccessControl | Users, roles, permissions, outlet access |
| OutletTillDevice | Outlets, tills, devices, assignments |
| HardwareCash | Hardware operations, till sessions, cash control |
| CatalogProduct | Products, variants, categories, attributes, images |
| PricingTax | Price lists, price assignments, tax classes, tax rates |
| Discount | Discount policies, targeting, expiry discount rules, approvals |
| Inventory | Locations, balances, stock movements, adjustments |
| Orders | Unified sales order model |
| POSOperations | Holds, receipts, till summaries, POS events |
| CartCheckout | Shopping carts and checkout sessions |
| FulfilmentPickup | Fulfilment methods, pickup slots, pickup orders |
| Payment | Payment methods, sales payments, transactions, events |
| Refund | Sales refunds, refund lines, refund payment allocations |
| ReturnExchange | Return, inspection, exchange workflows |
| OfflineSync | Offline clients, number blocks, sync batches |
| Notification | Events, templates, messages, delivery attempts |
| Integration | Providers, credentials, webhooks, request logs |
| Reports | Operational read models and report exports |

## Naming Rule

Use module names that match business capability, not UI page names.

## Route Group Rule

Route groups may differ from module names, but controllers must map clearly to
module ownership.

## Related Files

- [[Backend_Overview]]
- [[API_ENDPOINTS]]
- [[Seed_Data_Standards]]
