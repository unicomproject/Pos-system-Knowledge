# Full Macro-Modules Architecture (All 23 Modules)

This document categorizes all 23 existing modules of the E-POS project into four distinct Bounded Contexts: **Platform**, **Tenant (Core POS)**, **E-Commerce**, and **Shared**.
*(The **PricingTax** module is expanded to show its internal folder structure as an example).*

---

## 📦 Module Categorization

| Module | Category | Reason |
|--------|----------|---------|
| `PlatformAdmin` | **Platform** | SuperAdmin, Tenant management |
| `Subscription` | **Platform** | SaaS Plans & Billing |
| `TenantAuth` | **Tenant** | Staff login authentication, OTP & JWT |
| `AccessControl` | **Tenant** | Staff Roles & Permissions |
| `CatalogProduct` | **Tenant** | Products, Variants, Categories (Admin CRUD) |
| `Discount` | **Tenant** | Offers & Promotions |
| `HardwareCash` | **Tenant** | Printers, Cash drawers |
| `Inventory` | **Tenant** | Stock management |
| `OfflineSync` | **Tenant** | POS devices offline mode only |
| `OutletTillDevice` | **Tenant** | Stores, Tills/Registers |
| `Payment` | **Tenant** | Payment terminals & gateways |
| `POSOperations` | **Tenant** | Cash shifts, Till transactions |
| `PricingTax` | **Tenant** | Price lists, Tax rules |
| `Reports` | **Tenant** | Sales analytics, EOD reports |
| `TenantFoundation` | **Tenant** | Tenant profile, Sales Channels |
| `Orders` | **Tenant** | In-store & Online Sales Orders processing |
| `CustomerAuth` | **ECommerce** | Customer login, OTP, Registration |
| `Customer` | **ECommerce** | CRM, Loyalty, Customer profiles |
| `Storefront` | **ECommerce** | Customer-facing product browsing (READ-only) |
| `CartCheckout` | **ECommerce** | Shopping cart & checkout |
| `FulfilmentPickup` | **ECommerce** | Click & Collect, Delivery |
| `Notification` | **Shared** | Used by Platform + Tenant + ECommerce |
| `Integration` | **Shared** | Accounting tools (Xero, QuickBooks) |
| `ReturnExchange` | **Shared** | POS + Online returns |
| `Refund` | **Shared** | POS + Online refunds |

---

## 📂 Proposed Full Folder Structure

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