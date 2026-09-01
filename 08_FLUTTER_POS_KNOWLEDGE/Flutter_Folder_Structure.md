<!-- title: Flutter Folder Structure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-14 -->


# Flutter Folder Structure

## Purpose

This file defines the Flutter folder structure for OneVerz POS MVP.

The structure supports POS, tenant admin, device integration, offline sync,
virtual caching, order fulfilment, pickup, and reporting.

## Recommended Structure

```text
lib/
  core/
    api/
    auth/
    cache/
    config/
    errors/
    local_db/
    network/
    routing/
    security/
    sync/
    utils/
  shared/
    components/
    formatters/
    models/
    widgets/
  features/
    auth/
    pos/
    tenant_admin/
    products/
    inventory/
    orders/
    fulfilment_pickup/
    payments/
    returns_exchanges/
    reports/
    hardware/
    offline_sync/
    discount/
```

## Feature Structure

```text
features/[feature_name]/
  data/
    datasources/
      remote/
      local/
    repositories/
    dtos/
  domain/
    entities/
    repositories/
    usecases/
  presentation/
    providers/
    screens/
    widgets/
    utils/
```

### Canonical Discount Feature Structure Example

```text
features/discount/
  data/
    datasources/
      local/
        pos_discount_offline_coordinator.dart
        pos_pending_sale_recovery_store.dart
      remote/
        pos_discount_remote_datasource.dart
    dtos/
      pos_discount_dtos.dart
    repositories/
      pos_discount_repository_impl.dart
  domain/
    entities/
      pos_cart_discount.dart
      pos_discount_api_models.dart
    repositories/
      pos_discount_repository.dart
    usecases/
      apply_pos_discount.dart
      cancel_pos_discount.dart
      rebind_discount_after_customer_change.dart
      restore_pending_discount_sale.dart
      sync_pending_pos_discounts.dart
      validate_pos_discount.dart
  presentation/
    providers/
      pos_discount_catalog_provider.dart
      pos_discount_provider.dart
    utils/
      pos_discount_error_mapper.dart
    widgets/
      discount_controller.dart
      discount_item_picker.dart
      discount_sections.dart
      discount_state.dart
      discount_sync_conflict_panel.dart
      pos_discount_dialog.dart
```

### Canonical Cash Drawer Feature Ownership

```text
features/cash_drawer/
  data/
    datasources/
      cash_drawer_remote_datasource.dart
    repositories/
      cash_drawer_repository_impl.dart
  domain/
    entities/                 # summary, movement and reason models
    repositories/
  presentation/
    providers/                # summary/history and mutation state
    screens/                  # management, Cash In, Cash Drop, Close Till
    widgets/                  # header, summary, actions and recent movements
```

`features/cash_drawer` owns Cash Drawer financial management UI and data flow.
It reuses till-session state from `features/till` and physical drawer transport
from the hardware integration. Do not create a duplicate Cash Drawer feature
under `hardware`, `pos`, or `tenant_admin`. Widgets must not call Dio directly.

Canonical specification:
[[Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]].

## Core Folder Meaning

| Folder | Purpose |
|---|---|
| `api` | Dio clients, API route helpers |
| `cache` | Memory cache policies and cache keys |
| `local_db` | Persistent local database/store |
| `sync` | Offline sync outbox and status support |
| `routing` | GoRouter route definitions and guards |
| `security` | Secure storage and token safety |
| `errors` | App error mapping and display models |

## Rule

No direct API calls in widgets.

Widgets use providers.
Providers call use cases/repositories.
Repositories choose API, memory cache, local DB, or sync outbox.

## New MVP Feature Folders

Add or align these folders:

- `orders`
- `fulfilment_pickup`
- `offline_sync`
- `hardware`
- `reports`

## Related Files

- [[Flutter_App_Architecture]]
- [[Flutter_Virtual_Caching_Strategy]]
- [[Flutter_Offline_Operation_Sync]]
