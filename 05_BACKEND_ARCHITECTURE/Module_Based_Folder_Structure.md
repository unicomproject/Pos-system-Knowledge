<!-- title: Module Based Folder Structure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-06-30 -->


# Module Based Folder Structure

## Purpose

This file defines backend folder structure for OneVerz POS MVP modules.

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

## Proposed Full Folder Structure

```text
c:\POS_PROPJECT\BACKEND\src\
│
├── E_POS.Api/
│   ├── Controllers/
│   │   └── V1/
│   │       ├── Platform/
│   │       │   ├── PlatformAdmin/
│   │       │   │   └── PlatformTenantController.cs
│   │       │   └── Subscription/
│   │       │       └── SubscriptionPlanController.cs
│   │       ├── Tenant/
│   │       │   ├── TenantAuth/
│   │       │   │   └── TenantAuthController.cs
│   │       │   ├── PricingTax/
│   │       │   │   └── PricingTaxController.cs
│   │       │   ├── CatalogProduct/
│   │       │   │   └── CatalogProductController.cs
│   │       │   ├── Inventory/
│   │       │   │   └── InventoryController.cs
│   │       │   └── Orders/
│   │       │       └── OrdersController.cs
│   │       ├── ECommerce/
│   │       │   ├── CustomerAuth/
│   │       │   │   └── CustomerAuthController.cs
│   │       │   ├── Customer/
│   │       │   │   └── CustomerController.cs
│   │       │   └── Storefront/
│   │       │       └── StorefrontController.cs     ← Customer product browsing
│   │       └── Shared/
│   │           ├── Notification/
│   │           │   └── NotificationController.cs
│   │           └── ReturnExchange/
│   │               └── ReturnExchangeController.cs
│   ├── Extensions/                     ← Utility extension classes
│   ├── Filters/                        ← API Action/Exception Filters
│   ├── Middleware/
│   │   └── GlobalExceptionHandlingMiddleware.cs
│   ├── Models/                         ← API specific request/response models
│   └── Program.cs
│
├── E_POS.Application/
│   ├── Common/
│   └── Modules/
│       ├── Platform/
│       │   ├── PlatformAdmin/
│       │   └── Subscription/
│       │
│       ├── Tenant/
│       │   ├── TenantAuth/
│       │   ├── AccessControl/
│       │   ├── CatalogProduct/
│       │   ├── Discount/
│       │   ├── HardwareCash/
│       │   ├── Inventory/
│       │   ├── OfflineSync/            ← POS devices only
│       │   ├── OutletTillDevice/
│       │   ├── Payment/
│       │   ├── POSOperations/
│       │   ├── PricingTax/             ← [EXPANDED EXAMPLE]
│       │   │   ├── Contracts/
│       │   │   │   ├── Repositories/   ← IPricingTaxRepository
│       │   │   │   └── Services/       ← ITaxCalculationService
│       │   │   ├── Dtos/
│       │   │   ├── Mappers/
│       │   │   ├── Services/
│       │   │   └── Validators/
│       │   ├── Reports/
│       │   ├── TenantFoundation/
│       │   └── Orders/
│       │
│       ├── ECommerce/
│       │   ├── CustomerAuth/
│       │   ├── Customer/
│       │   ├── Storefront/             ← Customer product browsing (READ-only)
│       │   ├── CartCheckout/
│       │   └── FulfilmentPickup/
│       │
│       └── Shared/                     ← Cross-cutting modules
│           ├── Notification/
│           ├── Integration/
│           ├── ReturnExchange/            ← POS + Online returns
│           └── Refund/                    ← POS + Online refunds
│
├── E_POS.Domain/
│   ├── Common/
│   │   ├── Entities/
│   │   ├── Repositories/
│   │   ├── Tenancy/
│   │   └── ValueObjects/
│   └── Modules/
│       ├── Platform/
│       │   ├── PlatformAdmin/
│       │   └── Subscription/
│       │
│       ├── Tenant/
│       │   ├── TenantAuth/
│       │   ├── AccessControl/
│       │   ├── CatalogProduct/
│       │   ├── Discount/
│       │   ├── HardwareCash/
│       │   ├── Inventory/
│       │   ├── OfflineSync/            ← POS devices only
│       │   ├── OutletTillDevice/
│       │   ├── Payment/
│       │   ├── POSOperations/
│       │   ├── PricingTax/             ← [EXPANDED EXAMPLE]
│       │   │   ├── Constants/
│       │   │   └── Entities/
│       │   ├── Reports/
│       │   ├── TenantFoundation/
│       │   └── Orders/
│       │
│       ├── ECommerce/
│       │   ├── CustomerAuth/
│       │   ├── Customer/
│       │   ├── Storefront/             ← Customer product browsing (READ-only)
│       │   ├── CartCheckout/
│       │   └── FulfilmentPickup/
│       │
│       └── Shared/                     ← Cross-cutting modules
│           ├── Notification/
│           ├── Integration/
│           ├── ReturnExchange/            ← POS + Online returns
│           └── Refund/                    ← POS + Online refunds
│
└── E_POS.Infrastructure/
    ├── Common/
    │   └── Security/
    │       └── AuthSessionValidator.cs
    ├── Persistence/
    │   ├── Configurations/
    │   ├── Migrations/
    │   ├── Seeders/
    │   └── EPosDbContext.cs
    ├── Integrations/                   ← Third-Party Integrations
    │   ├── Payments/                   ← Payment Gateways (Stripe,)
    │   └── Email/                      ← Email Providers (azure email services)
    └── Modules/
        ├── Platform/
        │   ├── PlatformAdmin/
        │   └── Subscription/
        │
        ├── Tenant/
        │   ├── TenantAuth/
        │   ├── AccessControl/
        │   ├── CatalogProduct/
        │   ├── Discount/
        │   ├── HardwareCash/
        │   ├── Inventory/
        │   ├── OfflineSync/
        │   ├── OutletTillDevice/
        │   ├── Payment/
        │   ├── POSOperations/
        │   ├── PricingTax/
        │   │   ├── Configurations/
        │   │   └── Repositories/
        │   ├── Reports/
        │   ├── TenantFoundation/
        │   └── Orders/
        │
        ├── ECommerce/
        │   ├── CustomerAuth/
        │   ├── Customer/
        │   ├── Storefront/             ← Customer product browsing (READ-only)
        │   ├── CartCheckout/
        │   └── FulfilmentPickup/
        │
        └── Shared/                     ← Cross-cutting modules
            ├── Notification/
            ├── Integration/
            ├── ReturnExchange/
            └── Refund/
```

## MVP Backend Modules

The modules are organized into four macro Bounded Contexts: Platform, Tenant (Core POS), E-Commerce, and Shared.

### Platform Modules
| Module | Purpose |
|---|---|
| PlatformAdmin | SuperAdmin, platform users, roles, and tenant onboarding/management |
| Subscription | SaaS plans, add-ons, subscription billing, and usage tracking |

### Tenant Modules (Core POS)
| Module | Purpose |
|---|---|
| TenantAuth | Staff and cashier login authentication, OTP & JWT |
| AccessControl | Staff roles, permissions, and outlet assignment controls |
| CatalogProduct | Core products, categories, variants, and catalog management (Admin CRUD) |
| Discount | Dynamic discount rules, promotions, and expiry discount rules |
| HardwareCash | Hardware configurations (printers, drawers) and till cash movements |
| Inventory | Location stock balances, stock adjustments, and stock movement logs |
| OfflineSync | Offline client device sync queue and offline operation boundaries |
| OutletTillDevice | Outlets (stores), tills (registers), and POS device definitions |
| Payment | Payment method configurations, POS terminal payments, and transactions |
| POSOperations | Held sales, receipt templates, print logs, and till session summaries |
| PricingTax | Price lists, tier pricing, tax categories, and tax rates |
| Reports | Operational sales reporting, read models, and export generation |
| TenantFoundation | Tenant profile, business settings, and sales channels setup |
| Orders | Unified in-store (POS) and online sales order processing |

### E-Commerce Modules
| Module | Purpose |
|---|---|
| CustomerAuth | Storefront consumer registration, OTP, and login authentication |
| Customer | Customer profiles, address books, and CRM loyalty tier data |
| Storefront | Optimized customer catalog read-only browsing |
| CartCheckout | Customer shopping carts and online checkout sessions |
| FulfilmentPickup | Click & collect slots, pickup methods, and pickup order tracking |

### Shared Modules (Cross-Cutting)
| Module | Purpose |
|---|---|
| Notification | Transactional notification templates, emails, and SMS alerts |
| Integration | External third-party integrations (e.g., accounting Xero/QuickBooks sync) |
| ReturnExchange | Shared POS and online storefront return and exchange processing |
| Refund | Shared POS and online storefront refund logic and allocations |

## Naming Rule

Use module names that match business capability, not UI page names.

## Route Group Rule

Route groups may differ from module names, but controllers must map clearly to
module ownership.

## Related Files

- [[Backend_Overview]]
- [[API_ENDPOINTS]]
- [[Seed_Data_Standards]]
