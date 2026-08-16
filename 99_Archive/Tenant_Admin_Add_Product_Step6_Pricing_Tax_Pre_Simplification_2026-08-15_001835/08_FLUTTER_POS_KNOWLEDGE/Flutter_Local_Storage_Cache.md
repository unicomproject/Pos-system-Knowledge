<!-- title: Flutter Local Storage Cache -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->


# Flutter Local Storage Cache

## Purpose

This file defines local persistent cache rules for OneVerz POS Flutter apps.

Local storage keeps important reference data and offline state available after app
restart, crash, or temporary internet failure.

## Storage Layers

```text
Memory cache -> Local persistent cache -> Backend API
```

Memory is fast but temporary.
Local persistent cache survives restart.
Backend remains final truth.

## Cacheable Data

| Data | Local Persistent Cache |
|---|---|
| Product catalogue | Yes |
| Categories | Yes |
| Barcode lookup | Yes |
| Price reference | Yes |
| Tax rule reference | Yes |
| Permission / feature context | Yes |
| Outlet / till / device config | Yes |
| Hardware config | Yes |
| Receipt template | Yes |
| Active cart / basket | Yes |
| Parked sale quick data | Yes |
| Recent customer basic data | Limited |
| Offline cash sale queue | Yes |
| Pending inventory movement | Yes |
| Sync outbox | Yes |
| Discount authority/reference snapshot | Yes, limited and freshness-controlled |
| Provisional manual Discount intent | Yes, pending sync |

## Do Not Store As Final Truth

Do not treat local cache as final source for payment result, refund approval,
exchange approval, future/deferred loyalty or store-credit balance, final stock, final sale total,
or till final close.

## Secure Storage Rule

Tokens and sensitive credentials must use secure storage.

Do not store raw passwords, PINs, card data, or provider secrets in local cache.

## Cache Metadata

Local cache records should store:

- Tenant ID.
- Outlet ID where applicable.
- Till/device ID where applicable.
- Dataset name.
- Last refreshed time.
- Data version or server version where available.
- Expiry/freshness policy.

## Discount Authority Snapshot

Offline Discount requires the latest safe snapshot of `sales.discount.apply`,
feature entitlement, tenant/outlet/till/current-session/device/requester context,
`maxPercentage`, `maxFixedAmount`, `currencyCode`, product/variant identity, and
pricing/tax/cart references needed for provisional calculation. Store
`lastSyncedAt`, data/server version where available, freshness/expiry policy, and
ownership context. The snapshot is not final authority and is revalidated on sync.

The local outbox retains scope/method/value/target/optional reason, authority and
cart/line snapshots, cart fingerprint/hash, currency, stable idempotency key,
created time, sync status, retry count, and last safe error. Do not add raw PINs,
secrets, or card data.

## Recovery Rule

On app restart, restore active cart, selected outlet/till/device context where
safe, pending sync queue, and last known product/catalogue data.

## Related Files

- [[Flutter_Virtual_Caching_Strategy]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]
