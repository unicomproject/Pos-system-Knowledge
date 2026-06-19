<!-- title: Flutter Folder Structure -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Flutter Folder Structure

## Purpose

This file defines the Release 1 Flutter folder structure.

Use feature-first Clean Architecture.

## Root Structure

```text
lib/
  app/
  core/
  shared/
  features/
  flavors/
```

## Main Folders

| Folder | Responsibility |
|---|---|
| `app/` | Startup, bootstrap, providers, router, theme |
| `core/` | Network, storage, security, permissions, errors, device, logging |
| `shared/` | Reusable widgets, components, models, enums, extensions, services |
| `features/` | Feature-first POS and Tenant Admin modules |
| `flavors/` | Development, staging, production entry/config files |

Shared widgets must be reusable and business-logic free.

## Feature Folders

```text
lib/features/
  auth/
  device_activation/
  tenant_config/
  tenant_admin/
  session/
  outlet_selection/
  till/
  pos_shell/
  product_lookup/
  cart/
  customer/
  loyalty/
  pricing/
  discount/
  checkout/
  payment/
  sale/
  held_sales/
  receipt/
  refund/
  exchange/
  till_cash/
  hardware/
  stock_view/
  reports/
  settings/
  audit/
```

## Feature Template

```text
features/<feature_name>/
  presentation/
    screens/
    widgets/
    controllers/
    providers/
  application/
    usecases/
    state/
    services/
  domain/
    entities/
    repositories/
    services/
  data/
    models/
    datasources/
    repositories/
```

## Placement Rules

| Item | Location |
|---|---|
| Screen/widget | `presentation/` |
| Controller/provider | `presentation/controllers` or `presentation/providers` |
| Use case/state/service | `application/` |
| Entity/repository contract | `domain/` |
| DTO/datasource/repository implementation | `data/` |

## Anti-Patterns

- No API calls from widgets.
- No duplicated Dio instances.
- No business rules inside UI.
- No hardcoded role checks.
- No secrets in flavors.

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Tenant_Admin_Layout]]
