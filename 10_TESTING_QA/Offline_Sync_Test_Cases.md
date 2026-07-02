<!-- title: Offline Sync Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Offline Sync Test Cases

## Purpose

This file defines test cases for offline operation and sync behavior in TM-EPOS MVP.

## Offline Safety Rule

Offline sync must preserve tenant isolation, idempotency, ordering, conflict safety, and server authority for final state.

## Standard Cases

| Case | Expected Result |
|---|---|
| Registered offline client syncs valid batch | batch accepted |
| Unknown offline client | rejected |
| Offline client from another tenant | rejected |
| Duplicate sync batch idempotency key | not duplicated |
| Sync item has invalid entity name | rejected |
| Sync item references another tenant data | rejected |
| Conflict detected | sync conflict record created |
| Conflict resolved | resolution status updated safely |
| Offline number block exhausted | new numbers not issued from exhausted range |
| Client/server version moves forward | device sync state updated |

## POS Offline Flow Cases

Critical POS offline scenarios must include:

- Offline sale created and later synced.
- Payment reference synced without duplicate payment.
- Inventory-sensitive operations validated by server on sync.
- Replayed payload does not create duplicate order/payment records.

## Database Assertions

Tests should verify:

- `offline_clients` tenant and device ownership.
- `sync_batches` idempotency behavior.
- `sync_items` payload tracking.
- `offline_id_mappings` client/server id mapping.
- `sync_conflicts` creation when server state disagrees.

## Related Files

- [[../05_BACKEND_ARCHITECTURE/Offline_Operation_Architecture]]
- [[../06_DATABASE_KNOWLEDGE/Tables/28_Offline_Operation_And_Sync]]
- [[Idempotency_Test_Cases]]