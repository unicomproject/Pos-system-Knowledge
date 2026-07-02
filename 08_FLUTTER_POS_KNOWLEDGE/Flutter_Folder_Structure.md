<!-- title: Flutter Folder Structure -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Folder Structure

## Purpose

This file defines the Flutter folder structure for TM-EPOS MVP.

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
```

## Feature Structure

```text
features/pos/
  data/
    datasources/
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
```

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
