<!-- title: Offline Operation Architecture -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Offline Operation Architecture

## Purpose

This file defines backend offline operation rules for TM-EPOS MVP.

Offline operation allows limited POS continuity during network issues.
It does not mean every business action is final offline.

## Offline Principle

```text
Offline = limited operation
Sync = pending backend submission
Backend = final validation and final truth
```

## Offline Database Areas

The backend supports offline operation using records such as offline clients,
device sync states, offline number blocks, sync batches, sync items, offline ID
mappings, and sync conflicts.

These records track device/client sync state and do not replace normal business
tables.

## Allowed Offline Actions

| Area | Allowed Offline Behavior |
|---|---|
| Product lookup | Cached product/category/barcode lookup |
| Price/tax | Cached price and tax calculation support |
| Basket/cart | Active basket save and restore |
| Cash sale | Capture allowed offline cash sale |
| Receipt | Print offline receipt where template exists |
| Held sale | Park/hold sale locally |
| Till session | Continue current till session state |
| Customer | Recent basic customer lookup where allowed |
| Inventory | Pending inventory movement |
| Sync | Queue operations in outbox/pending sync queue |

## Backend-Final Actions

The following cannot be finalized offline:

- Final inventory quantity.
- Card payment.
- QR payment.
- Refund.
- Exchange.
- Loyalty/store credit.
- Till final close.
- Final sale total.

## Offline Client Rule

Offline operation requires trusted device/offline client.

Offline client must be tied to tenant, outlet, and POS device where applicable.

## Offline Number Block Rule

Offline clients may use assigned number blocks for offline documents.

Number blocks must avoid collisions and must be reconciled during sync.

## Sync Batch Rule

Sync upload must validate client, tenant, idempotency, payload hash, operation
type, version, and authorization before applying changes.

## Conflict Rule

When server state conflicts with offline payload, create a sync conflict instead
of silently overwriting final backend state.

## Audit Rule

Audit sync batch upload, sync item applied/rejected, sync conflict opened/resolved,
offline cash sale synced, and offline client status changes.

## Related Files

- [[Virtual_Caching_Architecture]]
- [[API_Standards]]
- [[Error_Response_Standards]]
