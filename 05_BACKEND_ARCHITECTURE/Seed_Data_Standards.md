<!-- title: Seed Data Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Seed Data Standards

## Purpose

This file defines seed data standards for TM-EPOS MVP backend.

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
