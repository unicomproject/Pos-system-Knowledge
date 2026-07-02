<!-- title: Flutter Virtual Caching Strategy -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Virtual Caching Strategy

## Purpose

This file defines Flutter virtual caching strategy for TM-EPOS MVP.

Virtual caching means the app keeps frequently used reference/config data in
memory and local cache so the POS feels fast and can survive temporary network
issues.

## Core Rule

```text
Memory cache = fast current session
Local DB cache = offline survival
Backend database = final business truth
```

## Memory Cache Usage

Use memory cache for fast UI:

- Product grid.
- Category chips.
- Barcode lookup.
- Current cart.
- Permission/feature context.
- Outlet/till/device context.
- Hardware state.
- Receipt preview state.
- Pickup/order list loaded state.

## Local Cache Backup

Memory cache must be backed by local persistent cache for offline-capable data.

App close, device restart, or crash clears memory.
Local cache allows restore.

## Repository Pattern

Widgets must not read cache directly.

```text
Widget -> Provider -> Repository -> Memory cache / Local cache / API
```

## Cacheable Reference Data

- Product catalogue.
- Category list.
- Barcode lookup.
- Price reference.
- Tax rules.
- Permission and feature context.
- Outlet/till/device config.
- Hardware config.
- Receipt template.
- Active cart.
- Parked sale quick data.
- Recent customer basic data.

## Non-Final Cache Data

Cache must never be final authority for final sale total, final inventory,
card/QR payment, refund, exchange, loyalty/store credit, or till final close.

## Invalidation Rule

Refresh or invalidate cache when backend reports updated products, prices, tax,
permissions, entitlements, outlet/till/device config, hardware config, or receipt
template.

## Related Files

- [[Flutter_Local_Storage_Cache]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_API_Integration]]
