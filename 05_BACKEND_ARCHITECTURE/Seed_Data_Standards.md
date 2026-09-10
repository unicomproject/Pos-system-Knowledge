<!-- title: Seed Data Standards -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-06-29 -->


# Seed Data Standards

## Purpose

This file defines seed data standards for OneVerz POS MVP backend.

Seed data must be deterministic, safe, reviewable, and aligned with the current
MVP scope.

## Seed Data Rule

Do not seed random or tenant-specific production data.

Do not seed secrets.

Use stable codes for modules, features, permissions, settings, payment method
types, fulfilment methods, notification event types, and integration providers.

## Required Seed Groups

| Group | Purpose |
|---|---|
| Platform modules | Feature grouping |
| Platform features | Entitlement catalog |
| Feature limits | Usage and plan limits |
| Subscription plans | Commercial plans |
| Permission definitions | Backend-driven authorization |
| Role templates | Optional starting role templates |
| Setting definitions | Tenant/system setting keys |
| Business types | Target business categories |
| Currency | Currency master data |
| Payment method types | Cash, card, QR, bank transfer, manual |
| Fulfilment methods | Immediate and pickup |
| Notification channels | Email, SMS, WhatsApp, push, in-app |
| Notification event types | Order, pickup, sync, payment events |
| Integration providers | Payment, SMS, email, WhatsApp, accounting, analytics |
| Offline sync settings | Offline client and sync defaults |

## Permission Seed Rule

Every permission must have:

- Stable permission code.
- Name.
- Module/feature grouping.
- Status.
- Description.
- Intended user type where helpful.

## Entitlement Seed Rule

Feature entitlements must support mobile POS, desktop EPOS, online store,
cart/checkout, click collect, order management, payment/refund, return/exchange,
offline sync, reporting, notifications, integrations, product, inventory, and
hardware/device operations.

## Test Seed Rule

Development seed data may include test tenants, users, outlets, tills, devices,
products, and orders only when clearly marked as development/test data.

## Click & Collect Fixture Parity Rule

Development Click & Collect fixture builders must populate the same mandatory
order-line snapshots as the production order-ingestion path. A fixture must not
bypass `BarcodeSnapshot` population for barcode-pickable lines. Prefer joining
the authoritative primary `product_barcodes` row at seed time; Development-only
data-repair migrations may backfill NULL fixture snapshots when the
product/variant mapping is unambiguous. Do not hardcode a single order number
as the permanent repair strategy.

## Historical NULL Barcode Snapshot Repair Rule

Do not blindly backfill historical production `sales_order_lines.barcode_snapshot`
NULL values from current catalogue barcodes. That can fabricate order-time
truth. Historical repair is allowed only when the original product/variant
mapping is authoritative and unambiguous. Otherwise retain the NULL and surface
barcode verification unavailable at pick time.

## Secret Rule

Do not seed real API keys, card credentials, payment credentials, passwords,
activation codes, or customer data.

## Migration Rule

Seed changes must be migration-safe and idempotent.

Do not create duplicate permission/module/feature codes.

## Related Files

- [[Module_Based_Folder_Structure]]
- [[Authorization_And_Permissions]]
- [[Virtual_Caching_Architecture]]
