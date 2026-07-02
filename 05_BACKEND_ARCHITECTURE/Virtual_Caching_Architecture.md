<!-- title: Virtual Caching Architecture -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Virtual Caching Architecture

## Purpose

This file defines backend virtual caching rules for TM-EPOS MVP.

Virtual cache is used for speed, reduced repeated reads, and operational
resilience.

It is not the final authority for protected business decisions.

## Cache Principle

```text
Cache = speed + reference resilience
Backend database = final business truth
```

## Cacheable Areas

| Area | Cache Use |
|---|---|
| Product catalogue | Fast product grid/search/reference reads |
| Categories | Product browsing and filtering |
| Barcode lookup | Fast scan-to-product lookup |
| Price rules | Read reference for display/calculation support |
| Tax rules | Read reference for display/calculation support |
| Permission context | UI/menu/action visibility support |
| Feature entitlement | Feature visibility support |
| Tenant settings | Config lookup |
| Outlet/till/device config | POS startup and session support |
| Hardware config | Printer/scanner/drawer/card reader setup |
| Receipt template | Fast receipt preview/print |
| Recent customer basic data | Limited lookup where allowed |

## Not Cache-Final Areas

Do not use cache as final authority for:

- Final sale total.
- Final inventory quantity.
- Card/QR payment result.
- Refund approval.
- Exchange approval.
- Loyalty/store credit balance.
- Till final close.
- Sync conflict resolution.
- Tenant access or permission final decision.

## Cache Key Rule

Tenant-owned cache keys must include tenant ID.

Outlet/till/device cache keys must include outlet ID, till ID, and device ID
where relevant.

Sales-channel cache must include sales channel, outlet, and tenant context where
pricing/visibility differs.

## Invalidation Rule

Invalidate or refresh cache when product, price, tax, permission, entitlement,
tenant setting, outlet, till, device, hardware, or receipt template changes.

## Security Rule

Never cache raw passwords, tokens, POS PINs, card data, provider secrets, payment
credentials, raw activation tokens, or setup links.

## Backend Cache Technology Rule

Do not introduce Redis or a new distributed cache dependency unless approved by
architecture decision.

Start with controlled in-process/reference caching and database-backed sync
state where appropriate.

## Related Files

- [[Offline_Operation_Architecture]]
- [[Multi_Tenant_Handling]]
- [[API_Standards]]
