<!-- title: Offline Operation Architecture -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->


# Offline Operation Architecture

## Purpose

This file defines backend offline operation rules for OneVerz POS MVP.

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
| Manual cashier Discount | Provisional eligible intent using safe cached authority/cart reference; backend revalidates |
| Sync | Queue operations in outbox/pending sync queue |

## Backend-Final Actions

The following cannot be finalized offline:

- Final inventory quantity.
- Card payment.
- QR payment.
- Refund.
- Exchange.
- Future/deferred loyalty or store credit; not Release 1.
- Till final close.
- Final synchronized sale/Discount total (offline preview remains provisional).

## Discount Offline Operation

Current Release permits one provisional MANUAL Discount: Order Percentage/Fixed
or Item Percentage with exact cached cart target. Item Fixed, POLICY selection,
stacking, and above-cached-authority requests are blocked locally.

The generic outbox payload retains local operation/type, tenant/outlet/till/
session/device/requester, scope/method/value/target/reason, authority and cart
snapshots, cart hash, currency, idempotency key, timestamp, status, retries, and
last error. Exact operation enum naming is not yet canonical.

Sync validates ownership/client/device/session, permission, feature, authority,
currency, cart/target, scope matrix, one-discount rule, calculation, idempotency,
and related offline cash sale. Rejections use existing sync conflict/error
infrastructure; they are never silently accepted or overwritten. See
[[../13_DECISIONS_AND_CHANGES/POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]].

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
