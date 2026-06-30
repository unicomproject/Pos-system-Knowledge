<!-- title: Module Based Folder Structure -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Module Based Folder Structure

## Purpose

This file defines the Release 1 backend folder structure.

The backend uses four production layers and a testing layer.

Inside each layer, module name must come first.

## Structure Rule

Each business module owns its own controllers, services, DTOs, validators,
entities, repositories, permission constants, and tests.

Do not place all files in generic folders.

Do not create Release 1 modules for e-commerce, kiosk, supplier, delivery,
coupon, AI, or offline sync.

## Solution Layout

```text
src/
  SCS.Api/
  SCS.Application/
  SCS.Domain/
  SCS.Infrastructure/
tests/
  SCS.UnitTests/
  SCS.IntegrationTests/
  SCS.ApiTests/
```

## Layer Examples

```text
SCS.Api/Modules/Sales/
  PosSalesController.cs
  PaymentsController.cs
  ReceiptsController.cs

SCS.Application/Modules/Sales/
  PosSalesService.cs
  PaymentService.cs
  DTOs/
  Validators/

SCS.Domain/Modules/Sales/
  Sale.cs
  Payment.cs
  SalesPermissionCodes.cs

SCS.Infrastructure/Modules/Sales/
  SalesRepository.cs
  PaymentRepository.cs

SCS.Infrastructure/Shared/Persistence/
  AppDbContext.cs
  Migrations/
  Seed/
```

## Release 1 Module List

| Module | Scope |
|---|---|
| Auth | Login, setup, refresh, logout |
| Platform/Tenant | Tenant profile and status |
| Subscription/Billing | Plan, invoice, payment link |
| Entitlement/Permission | Features, roles, permissions |
| Outlet/Till/Device | POS operating context |
| Catalog/Inventory | Product, stock, expiry |
| Discount | POS/product/expiry discounts |
| Sales/Payment/Receipt | Checkout and receipt |
| Return/Refund/Exchange | Post-sale flows |
| Loyalty/Reports/Hardware | Basic loyalty, reports, hardware records |

## File Placement Rule

| File Type | Location |
|---|---|
| Controller | API module folder |
| Service/DTO/Validator | Application module folder |
| Entity/Permission constants | Domain module folder |
| Repository interface | Application module folder |
| Repository implementation | Infrastructure module folder |
| DbContext/Migration/Seed | Infrastructure Shared/Persistence |

## Related Files

- [[Clean_Architecture_Layers]]
- [[Backend_Coding_Principles]]
- [[Seed_Data_Standards]]
