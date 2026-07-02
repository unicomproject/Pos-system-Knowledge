<!-- title: Flutter Testing -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Testing

## Purpose

This file defines Flutter testing rules for TM-EPOS MVP.

Testing must cover POS speed, offline behavior, sync safety, permissions, cache,
hardware state, and staff pickup workflows.

## Test Types

| Test Type | Coverage |
|---|---|
| Unit tests | Use cases, repositories, cache policy, validators |
| Widget tests | POS cart, product grid, permission UI, offline banners |
| Integration tests | Login, POS sale, sync queue, pickup flow |
| Golden tests | Important responsive screens where useful |
| Mock hardware tests | Printer/scanner/drawer/payment state handling |

## Must Test

- Product grid loads from API and cache fallback.
- Barcode lookup uses cache safely.
- Active cart persists after app restart.
- Offline cash sale is queued.
- Card/QR payment is blocked offline.
- Refund/exchange cannot finalize offline.
- Sync conflict shows correct UI.
- Permission-denied actions are hidden/disabled.
- Till open/close guard behavior.
- Pickup status change permission and backend validation.

## Test Data Rule

Use test fixtures.
Do not use real customer/payment/tenant data.

## Offline Test Rule

Simulate network unavailable and network restored.

Verify sync outbox state transitions: pending, syncing, synced, failed, conflict.

## Security Test Rule

Confirm logs do not expose tokens, PINs, card data, provider secrets, or raw
credentials.

## Related Files

- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Virtual_Caching_Strategy]]
- [[Flutter_Security_Guardrails]]
