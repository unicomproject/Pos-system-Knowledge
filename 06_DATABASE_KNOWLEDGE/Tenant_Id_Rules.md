<!-- title: Tenant Id Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Tenant ID Rules

## Purpose

This file defines how `tenant_id` must be used in SCS-TIX EPOS Release 1.

Tenant isolation is mandatory.

Tenant-owned data must not leak across tenants.

## Main Rule

Every tenant-owned table must include `tenant_id`.

Platform-owned catalog/configuration tables may omit `tenant_id` only when the
record is truly global.

## Tenant-Owned Areas

Tenant-owned data includes tenant profiles, addresses, outlets, users, roles,
feature flags, POS devices, tills, hardware records, products, inventory, sales,
payments, receipts, returns, refunds, exchanges, customers, loyalty, reports,
notifications, and all tenant operational records.

## Platform-Owned Tables

| Table | Reason |
|---|---|
| `platform_users` | Platform identity |
| `platform_roles` | Platform role catalog |
| `platform_permissions` | Platform permission catalog |
| `platform_modules` | Platform module catalog |
| `platform_features` | Platform feature catalog |
| `subscription_plans` | Platform package definitions |
| `payment_method_types` | Global payment method reference |
| `discount_types` | Global discount type reference |
| `discount_scopes` | Global discount scope reference |
| `stock_movement_types` | Global stock movement reference |
| `cash_movement_types` | Global cash movement reference |

## Tenant Context Source

Tenant context must come from server-side authenticated context.

Do not trust frontend-provided `tenant_id` for tenant-owned APIs.

Tenant context may be resolved from authenticated tenant user, active auth
session, trusted POS device, or explicit Platform Admin tenant management context.

## Query Rule

All read/write/update/deactivate operations for tenant-owned tables must filter
by `tenant_id`.

A record found under another tenant must behave as not found or forbidden.

Do not reveal cross-tenant existence.

## Unique Index Rule

Use tenant-aware uniqueness.

| Data | Uniqueness |
|---|---|
| Tenant role code | `UNIQUE(tenant_id, code)` |
| Outlet code | `UNIQUE(tenant_id, code)` |
| Till code | `UNIQUE(tenant_id, outlet_id, code)` |
| Product code | `UNIQUE(tenant_id, code)` |
| Variant SKU | `UNIQUE(tenant_id, sku)` |
| Variant barcode | `UNIQUE(tenant_id, barcode)` where barcode exists |
| Sale number | `UNIQUE(tenant_id, sale_number)` |
| Receipt number | `UNIQUE(tenant_id, receipt_number)` |

## POS Tenant Safety

POS operations must validate that user, outlet, till, device, sale, payment,
receipt, stock, return, refund, exchange, and customer records belong to the same
tenant.

Mixed-tenant records must never be accepted in one transaction.

## Related Files

- [[Database_Overview]]
- [[Migration_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Multi_Tenant_Handling]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
