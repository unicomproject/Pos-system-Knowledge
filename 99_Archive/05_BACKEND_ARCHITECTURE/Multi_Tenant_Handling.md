<!-- title: Multi Tenant Handling -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Multi Tenant Handling

## Purpose

This file defines multi-tenant backend handling for SCS-TIX EPOS Release 1.

Tenant isolation is mandatory.

Tenant-owned data must not leak between tenants.

## Tenant Isolation Rule

All tenant-owned tables must include `tenant_id`.

Platform-owned catalog/configuration tables do not require tenant ID unless they
store tenant-specific data.

## Tenant Context Source

Tenant context must be resolved from server-side authenticated context.

Do not trust frontend-provided `tenant_id` for tenant-owned APIs.

Tenant context may come from:

- Authenticated tenant user.
- Auth session.
- Trusted POS device.
- Server-side tenant management context for Platform Admin actions.

## Tenant-Owned Areas

Tenant-owned data includes:

- Users and roles.
- Outlets and tills.
- POS devices.
- Products and variants.
- Inventory.
- Sales and sale lines.
- Payments and refunds.
- Returns and exchanges.
- Customers and loyalty.
- Reports.
- Notifications.
- Hardware records.

## Platform-Owned Areas

Platform-owned data includes:

- Platform users.
- Platform roles.
- Platform permissions.
- Platform modules.
- Platform features.
- Subscription plan definitions.
- Platform settings.

Tenant-specific assignments are tenant-owned.

## Query Filtering Rule

Repositories must filter tenant-owned queries by tenant ID.

List, search, detail, update, and delete/deactivate operations must stay inside
tenant scope.

A not-found result inside tenant scope should not reveal another tenant's data.

## Unique Index Rule

Use tenant-aware unique constraints for tenant data.

Examples:

| Data | Uniqueness |
|---|---|
| Role code | Tenant-scoped |
| Product code | Tenant-scoped |
| SKU | Tenant-scoped |
| Barcode | Tenant-scoped |
| Outlet code | Tenant-scoped |
| Till code | Tenant and outlet scoped |
| Business document number | Tenant-scoped or tenant/outlet scoped |

## POS Tenant Safety

POS operations must validate that the user, outlet, till, device, sale, payment,
and inventory records all belong to the same tenant.

Never complete a sale using mixed-tenant records.

## Document Number Rule

Use `document_sequences` for business numbers such as sale, return, exchange,
receipt, invoice, stock adjustment, and stocktake numbers.

Document numbers must be generated inside tenant/outlet boundaries.

## Audit Tenant Rule

Audit logs must include tenant ID for tenant actions.

Platform actions may have null tenant ID unless managing a specific tenant.

## Related Files

- [[Authorization_And_Permissions]]
- [[API_Standards]]
- [[Audit_Log_Standards]]
- [[../06_DATABASE_KNOWLEDGE/Tenant_Id_Rules]]
