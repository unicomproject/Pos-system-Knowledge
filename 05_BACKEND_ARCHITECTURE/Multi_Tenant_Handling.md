<!-- title: Multi Tenant Handling -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Multi Tenant Handling

## Purpose

This file defines multi-tenant handling rules for TM-EPOS MVP backend.

Tenant isolation must protect platform admin data, business admin data, POS data,
online store data, orders, payments, fulfilment, notifications, integrations, and
offline sync records.

## Tenant Rule

Every tenant-owned table and query must be tenant scoped.

The backend must not trust frontend-provided tenant IDs as final authority.

Tenant context must be resolved from authenticated context, domain, route,
trusted device, sales channel, or verified token depending on the use case.

## Tenant-Owned Areas

| Area | Tenant Isolation Applies |
|---|---|
| Users/roles/permissions | Yes |
| Outlets/tills/devices | Yes |
| Products/prices/taxes/discounts | Yes |
| Inventory/stock movements | Yes |
| Carts/checkouts/orders | Yes |
| Payments/refunds/returns/exchanges | Yes |
| Fulfilment/pickup | Yes |
| Notifications/integrations | Yes |
| Offline clients/sync batches | Yes |
| Reports | Yes |

## Public Storefront Rule

Online store reads must resolve tenant by verified domain, route, channel, or
storefront context.

Do not expose another tenant's catalogue, price list, tax rules, pickup slots,
or order data.

## POS Device Rule

POS device requests must validate tenant, outlet, till, and device assignment.

A trusted device does not remove the need for user permission.

## Offline Rule

Offline sync records must include tenant and offline client context.

Sync item payload must not be applied outside the owning tenant.

Offline ID mapping must never map one tenant's client record to another tenant's
server record.

## Cache Key Rule

Tenant-owned cache keys must include tenant ID.
Outlet/till/device cache must include outlet/till/device identifiers where
needed.

## Query Rule

Repositories must apply tenant filters before returning tenant-owned data.

Avoid "admin shortcut" queries that skip tenant filters unless the use case is a
platform admin use case and explicitly audited.

## Related Files

- [[Virtual_Caching_Architecture]]
- [[Offline_Operation_Architecture]]
- [[Authorization_And_Permissions]]
