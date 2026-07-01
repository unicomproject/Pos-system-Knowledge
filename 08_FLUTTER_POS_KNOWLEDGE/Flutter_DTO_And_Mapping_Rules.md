<!-- title: Flutter DTO And Mapping Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter DTO And Mapping Rules

## Purpose

This file defines Flutter DTO and mapping rules for TM-EPOS MVP.

DTOs belong to the data layer.
UI must use view models or domain models, not raw API DTOs.

## Mapping Rule

```text
API JSON -> DTO -> Domain/View Model -> Widget
```

For local cache:

```text
Local DB Row -> Cache Model -> Domain/View Model
```

## Do Not Expose

Do not expose internal backend fields, token hashes, payment secrets, raw sync
payload internals, or provider credential values to UI.

## Offline DTO Rule

Offline sync DTOs must carry local IDs, idempotency keys, operation type, payload
version, and sync status.

The UI should show safe status information, not raw payload internals.

## Order DTO Rule

Order models should separate header, lines, options, totals, payment state,
fulfilment state, pickup state, and status history where needed.

## Cache Mapping Rule

Cached data must include tenant and freshness metadata where needed.

## Related Files

- [[Flutter_API_Integration]]
- [[Flutter_Local_Storage_Cache]]
