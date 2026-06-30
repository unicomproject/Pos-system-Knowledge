<!-- title: Platform Administration Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Platform Administration Module Overview

## Purpose

Manage platform users, platform roles, platform permissions, platform sessions, platform settings, and platform audit needed to operate the TM-EPOS SaaS business.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Platform_Administration` |
| Module number | 01 |
| Primary users | Platform Owner, Super Admin, Platform Support Admin |
| Frontend surfaces | Platform Admin Web dashboard, Platform role/permission management, Platform settings and audit screens |
| API groups | `/api/v1/platform-admin/users`, `/api/v1/platform-admin/roles`, `/api/v1/platform-admin/permissions`, `/api/v1/platform-admin/settings`, `/api/v1/platform-admin/audit` |

## Main Tables

| Table | Role |
|---|---|
| `platform_users` | Used by this module |
| `platform_roles` | Used by this module |
| `platform_permissions` | Used by this module |
| `platform_user_roles` | Used by this module |
| `platform_role_permissions` | Used by this module |
| `platform_user_permissions` | Used by this module |
| `platform_auth_sessions` | Used by this module |
| `platform_refresh_tokens` | Used by this module |
| `platform_password_reset_tokens` | Used by this module |
| `platform_login_audits` | Used by this module |
| `platform_settings` | Used by this module |
| `audit_logs` | Used by this module |

## Core Business Rules

- Platform users are separate from tenant users and customers.
- Platform permissions control SaaS administration only, not tenant POS actions.
- Platform refresh tokens and reset tokens are stored as hashes only.
- Platform login audits record success, failure, and locked login outcomes.
- System platform roles cannot be deleted or silently changed by tenant flows.

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

- [[../03_Subscription_Catalog_Entitlements/01_Module_Overview]]
- [[../02_Tenant_Foundation/01_Module_Overview]]
- [[../26_Notification/01_Module_Overview]]

## Out Of Scope

- Tenant staff login
- Customer login
- POS sale operation
- Tenant-owned operational data mutation except through approved setup/support APIs

## Related Files

- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
