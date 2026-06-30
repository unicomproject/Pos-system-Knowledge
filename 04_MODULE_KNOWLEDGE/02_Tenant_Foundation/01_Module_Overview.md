<!-- title: Tenant Foundation Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Tenant Foundation Module Overview

## Purpose

Create and control tenant identity, tenant profile, business type, currency, domains, addresses, and tenant-level settings for events, stalls, food, beverage, merchandising, and temporary retail businesses.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Tenant_Foundation` |
| Module number | 02 |
| Primary users | Platform Admin, Tenant Admin |
| Frontend surfaces | Tenant creation wizard, Tenant profile/detail page, Tenant settings screen |
| API groups | `/api/v1/platform-admin/tenants`, `/api/v1/tenants`, `/api/v1/tenant-admin/context`, `/api/v1/tenant-admin/settings` |

## Main Tables

| Table | Role |
|---|---|
| `currencies` | Used by this module |
| `business_types` | Used by this module |
| `tenants` | Used by this module |
| `tenant_profiles` | Used by this module |
| `tenant_addresses` | Used by this module |
| `tenant_domains` | Used by this module |
| `setting_definitions` | Used by this module |
| `tenant_settings` | Used by this module |

## Core Business Rules

- Tenant is the root owner for tenant business data.
- Tenant code and primary domain are unique.
- Tenant status controls POS, online store, checkout, offline sync, and admin access.
- Currency and decimal rules are selected at tenant foundation level.
- Tenant settings must use typed setting definitions, not random key-value behavior.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../01_Platform_Administration/01_Module_Overview]]
- [[../04_Subscription_Billing_Usage/01_Module_Overview]]

## Out Of Scope

- Product inventory logic
- Subscription payment settlement
- Customer authentication internals
- Delivery marketplace setup

## Related Files

- [[04_MODULE_KNOWLEDGE/02_Tenant_Foundation/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/02_Tenant_Foundation/03_Technical_Contract]]
