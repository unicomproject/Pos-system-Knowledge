<!-- title: Subscription Catalog, Plans, Add-ons & Entitlements Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Subscription Catalog, Plans, Add-ons & Entitlements Module Overview

## Purpose

Define sellable SaaS plans, add-ons, feature limits, platform modules, platform features, tenant entitlements, and feature flags used to activate MVP modules.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Subscription_Catalog_Entitlements` |
| Module number | 03 |
| Primary users | Platform Admin, Tenant Admin viewer |
| Frontend surfaces | Subscription plan builder, Plan feature matrix, Tenant entitlement screen, Feature flag control |
| API groups | `/api/v1/platform/subscription-plans`, `/api/v1/platform/subscription-addons`, `/api/v1/platform/features`, `/api/v1/platform/entitlements` |

## Main Tables

| Table | Role |
|---|---|
| `platform_modules` | Used by this module |
| `platform_features` | Used by this module |
| `feature_limit_definitions` | Used by this module |
| `subscription_plans` | Used by this module |
| `subscription_plan_features` | Used by this module |
| `subscription_addons` | Used by this module |
| `subscription_plan_addons` | Used by this module |
| `subscription_plan_feature_limits` | Used by this module |
| `subscription_addon_features` | Used by this module |
| `subscription_addon_limits` | Used by this module |
| `tenant_feature_entitlements` | Used by this module |
| `feature_flags` | Used by this module |

## Core Business Rules

- Platform modules and features form the permission/entitlement catalog.
- Plan features and add-ons determine what a tenant can use.
- Tenant entitlements must be checked before permissions.
- Feature limits must be non-negative when set.
- Do not duplicate the old subscription catalog module; this module is the single catalog source.

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
- [[../02_Tenant_Foundation/01_Module_Overview]]

## Out Of Scope

- Invoice collection
- Tenant staff role assignment
- POS cart behavior
- Customer order status

## Related Files

- [[04_MODULE_KNOWLEDGE/03_Subscription_Catalog_Entitlements/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/03_Subscription_Catalog_Entitlements/03_Technical_Contract]]
