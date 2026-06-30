<!-- title: Flutter Local Storage Cache -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Flutter Local Storage Cache

## Purpose

This file defines local persistent cache rules for TM-EPOS Flutter apps.

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

## Do Not Store As Final Truth

Do not treat local cache as final source for payment result, refund approval,
exchange approval, loyalty/store credit balance, final stock, final sale total,
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

## Recovery Rule

On app restart, restore active cart, selected outlet/till/device context where
safe, pending sync queue, and last known product/catalogue data.

## Related Files

- [[Flutter_Virtual_Caching_Strategy]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]
