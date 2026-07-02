<!-- title: Subscription Plans Feature Catalog -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Subscription Plans Feature Catalog

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| platform_modules | Platform-owned module catalog. | 8 |
| platform_features | Feature catalog that can be entitled to tenants and assigned to roles. | 9 |
| subscription_plans | Platform subscription/package definitions. | 13 |
| subscription_plan_features | Features and limits included in each subscription plan. | 8 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `platform_modules`

**Purpose:** Platform-owned module catalog.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| module_key | varchar(80) | NOT NULL UNIQUE | pos, portable_pos, inventory, loyalty, reporting, admin, hardware. |
| name | varchar(150) | NOT NULL | Display name. |
| description | text | NULL | Description. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| sort_order | int | NOT NULL | Display order. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(module_key) |

### Design Notes

- No explicit design note was provided.


## Entity: `platform_features`

**Purpose:** Feature catalog that can be entitled to tenants and assigned to roles.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| module_id | uuid | NOT NULL FK | References platform_modules(id). |
| feature_key | varchar(120) | NOT NULL UNIQUE | Feature key, e.g. pos.sale.create. |
| name | varchar(150) | NOT NULL | Feature name. |
| description | text | NULL | Feature explanation. |
| is_core | boolean | NOT NULL DEFAULT false | Core feature flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(feature_key) |

### Design Notes

- No explicit design note was provided.


## Entity: `subscription_plans`

**Purpose:** Platform subscription/package definitions.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| plan_code | varchar(80) | NOT NULL UNIQUE | Plan code. |
| name | varchar(150) | NOT NULL | Plan name. |
| description | text | NULL | Description. |
| billing_cycle | varchar(30) | NOT NULL CHECK | monthly, yearly, custom, trial, demo. |
| base_currency | char(3) | NOT NULL | Billing currency. |
| base_price | numeric(12,2) | NOT NULL CHECK >= 0 | Base price. |
| max_outlets | int | NULL | Null means unlimited. |
| max_tills | int | NULL | Null means unlimited. |
| max_users | int | NULL | Null means unlimited. |
| status | varchar(30) | NOT NULL CHECK | draft, active, retired. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(plan_code) |

### Design Notes

- No explicit design note was provided.


## Entity: `subscription_plan_features`

**Purpose:** Features and limits included in each subscription plan.

**Source module:** Subscription, Feature Entitlement and Tenant Identity

**Data dictionary section:** `2.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| plan_id | uuid | NOT NULL FK | References subscription_plans(id). |
| feature_id | uuid | NOT NULL FK | References platform_features(id). |
| enabled | boolean | NOT NULL DEFAULT true | Plan entitlement flag. |
| limit_value | numeric(14,3) | NULL | Feature-specific limit. |
| config | jsonb | NULL | Non-secret config. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(plan_id, feature_id) |

### Design Notes

- No explicit design note was provided.


## Platform Admin List API Notes (Implemented 2026-06-17)

The Super Admin subscription plans list page uses:

- `GET /api/v1/platform/subscription-plans`
- Permission: `platform.subscription_plans.view`
- Existing Release 1 tables only; no new plan/module/add-on tables were added for this task.
- API status values exposed to frontend: `draft`, `active`, `retired`.
- Database status values remain: `draft`, `active`, `retired`.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]

## Subscription Wizard Feature Save Notes (Implemented 2026-06-25)

- Catalog read source: `GET /api/v1/platform-admin/permission-catalog`.
- Feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`.
- No duplicate subscription module/feature catalog read endpoint is required for Release 1.
- API status values exposed to frontend are `draft`, `active`, and `retired`; stale `published`/`archived` wording is UI-label/filter-alias language only and must not describe backend response status values.
- `included` features are stored as enabled rows in `subscription_plan_features`.
- `not_available` features are removed/not persisted in `subscription_plan_features`.
- `addon` is rejected/out of scope unless real add-on pricing is implemented.
- The wizard selects module/feature entitlement only; permissions remain role-permission responsibility.

## Subscription Catalog Architecture Correction 2026-06-25

Supersedes earlier guidance that the subscription wizard should read `GET /api/v1/platform-admin/permission-catalog` directly.

Final catalog read source: `GET /api/v1/platform/subscription-plans/catalog`.

Final feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`.

Rules:

- Permission Catalog = technical access-control hierarchy for role-permission assignment.
- Subscription Catalog = commercial entitlement hierarchy for subscription plan creation.
- Subscription wizard selects commercial modules/features only; it must not select permissions.
- Core/default subscription features are locked included and protected by backend validation.
- Optional features support only `included` and `not_available`.
- `addon` is out of Release 1 and must not be rendered or sent.
- `included` persists enabled rows in `subscription_plan_features`.
- `not_available` removes or does not persist rows in `subscription_plan_features`.
- Status truth remains `draft`, `active`, `retired`.
- POS Online Orders / E-commerce is Release 2/deferred and must not appear in the R1 subscription wizard.

Commercial modules returned to UI:

- Core POS: locked included.
- Tenant Operations: locked included.
- Inventory: optional.
- Customers & Loyalty: optional.
- Returns & Exchanges: optional.
- Reports: optional.

See [[04_Subscription_Catalog_Model]] for the final contract, metadata fields, response shape, validation behavior, and verification results.
