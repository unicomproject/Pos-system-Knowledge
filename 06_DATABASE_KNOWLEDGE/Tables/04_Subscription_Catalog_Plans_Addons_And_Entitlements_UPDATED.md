<!-- title: 04. Subscription Catalog, Plans, Add-ons & Entitlements -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- source: Updated from uploaded ERD image: 04_Subscription Catalog, Plans, Add-ons & Entitlements.png -->

# 04. Subscription Catalog, Plans, Add-ons & Entitlements

## Purpose

This file documents the entity tables, attributes, keys, nullability, constraints, and external references for this ERD module. Enum/domain data types from the image are represented as `varchar(...)` plus CHECK/notes, not database enum types.

## Entity Tables

| Table | Purpose |
|---|---|
| `platform_modules` | Stores platform module catalog. |
| `platform_features` | Stores feature catalog under platform modules. |
| `feature_limit_definitions` | Stores limit definitions for platform features. |
| `subscription_plans` | Stores subscription plan catalog. |
| `subscription_plan_features` | Maps subscription plans to included features. |
| `subscription_addons` | Stores subscription add-on catalog. |
| `subscription_plan_addons` | Maps plans to allowed add-ons and quantity rules. |
| `subscription_plan_feature_limits` | Stores feature limit values for a plan. |
| `subscription_addon_features` | Maps add-ons to enabled features. |
| `subscription_addon_limits` | Stores add-on feature limit increments. |
| `tenant_feature_entitlements` | Stores effective feature access for each tenant. |
| `feature_flags` | Stores feature rollout flags and tenant/platform overrides. |

## `platform_modules`

Purpose: Stores platform module catalog.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `module_key` | varchar(80) |  | NOT NULL |  |
| `module_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `is_core_module` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(module_key)
```

## `platform_features`

Purpose: Stores feature catalog under platform modules.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `module_id` | uuid | FK | NOT NULL | References platform_modules(id) |
| `feature_key` | varchar(100) |  | NOT NULL |  |
| `feature_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `is_core_feature` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(feature_key)
```

Relationships:

- platform_features.module_id -> platform_modules.id

## `feature_limit_definitions`

Purpose: Stores limit definitions for platform features.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `feature_id` | uuid | FK | NOT NULL | References platform_features(id) |
| `limit_key` | varchar(80) |  | NOT NULL |  |
| `limit_name` | varchar(150) |  | NOT NULL |  |
| `value_type` | varchar(30) |  | NOT NULL |  |
| `unit_code` | varchar(40) |  | NULL |  |
| `default_limit_value` | numeric(18,4) |  | NULL |  |
| `is_hard_limit` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(feature_id, limit_key)
```

Relationships:

- feature_limit_definitions.feature_id -> platform_features.id

## `subscription_plans`

Purpose: Stores subscription plan catalog.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `plan_code` | varchar(80) |  | NOT NULL |  |
| `plan_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `billing_cycle` | varchar(40) |  | NOT NULL | Original ERD domain: billing_cycle |
| `base_currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `base_price` | numeric(18,4) |  | NOT NULL |  |
| `trial_days` | int |  | NOT NULL |  |
| `is_public` | boolean |  | NOT NULL |  |
| `is_custom_plan` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(plan_code)
CHECK(base_price >= 0)
CHECK(trial_days >= 0)
```

Relationships:

- subscription_plans.base_currency_code -> currencies.currency_code

## `subscription_plan_features`

Purpose: Maps subscription plans to included features.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `plan_id` | uuid | FK | NOT NULL | References subscription_plans(id) |
| `feature_id` | uuid | FK | NOT NULL | References platform_features(id) |
| `config_json` | jsonb |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(plan_id, feature_id)
```

Relationships:

- subscription_plan_features.plan_id -> subscription_plans.id
- subscription_plan_features.feature_id -> platform_features.id

## `subscription_addons`

Purpose: Stores subscription add-on catalog.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `addon_code` | varchar(80) |  | NOT NULL |  |
| `addon_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `addon_type` | varchar(40) |  | NOT NULL | Original ERD domain: addon_type |
| `billing_cycle` | varchar(40) |  | NOT NULL | Original ERD domain: billing_cycle |
| `base_currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code) |
| `base_price` | numeric(18,4) |  | NOT NULL |  |
| `quantity_based` | boolean |  | NOT NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(addon_code)
CHECK(base_price >= 0)
```

Relationships:

- subscription_addons.base_currency_code -> currencies.currency_code

## `subscription_plan_addons`

Purpose: Maps plans to allowed add-ons and quantity rules.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `plan_id` | uuid | FK | NOT NULL | References subscription_plans(id) |
| `addon_id` | uuid | FK | NOT NULL | References subscription_addons(id) |
| `min_quantity` | int |  | NOT NULL |  |
| `max_quantity` | int |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(plan_id, addon_id)
CHECK(min_quantity >= 1)
CHECK(max_quantity IS NULL OR max_quantity >= min_quantity)
```

Relationships:

- subscription_plan_addons.plan_id -> subscription_plans.id
- subscription_plan_addons.addon_id -> subscription_addons.id

## `subscription_plan_feature_limits`

Purpose: Stores feature limit values for a plan.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `plan_id` | uuid | FK | NOT NULL | References subscription_plans(id) |
| `feature_limit_id` | uuid | FK | NOT NULL | References feature_limit_definitions(id) |
| `limit_value` | numeric(18,4) |  | NULL |  |
| `is_unlimited` | boolean |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(plan_id, feature_limit_id)
```

Relationships:

- subscription_plan_feature_limits.plan_id -> subscription_plans.id
- subscription_plan_feature_limits.feature_limit_id -> feature_limit_definitions.id

## `subscription_addon_features`

Purpose: Maps add-ons to enabled features.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `addon_id` | uuid | FK | NOT NULL | References subscription_addons(id) |
| `feature_id` | uuid | FK | NOT NULL | References platform_features(id) |
| `config_json` | jsonb |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(addon_id, feature_id)
```

Relationships:

- subscription_addon_features.addon_id -> subscription_addons.id
- subscription_addon_features.feature_id -> platform_features.id

## `subscription_addon_limits`

Purpose: Stores add-on feature limit increments.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `addon_id` | uuid | FK | NOT NULL | References subscription_addons(id) |
| `feature_limit_id` | uuid | FK | NOT NULL | References feature_limit_definitions(id) |
| `increment_value` | numeric(18,4) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NOT NULL |  |

Constraints / Notes:

```text
UNIQUE(addon_id, feature_limit_id)
CHECK(increment_value > 0)
```

Relationships:

- subscription_addon_limits.addon_id -> subscription_addons.id
- subscription_addon_limits.feature_limit_id -> feature_limit_definitions.id

## `tenant_feature_entitlements`

Purpose: Stores effective feature access for each tenant.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `feature_id` | uuid | FK | NOT NULL | References platform_features(id) |
| `source_type` | varchar(40) |  | NOT NULL | Original ERD domain: entitlement_source_type |
| `source_reference_id` | uuid |  | NULL | Polymorphic source reference |
| `is_enabled` | boolean |  | NOT NULL |  |
| `effective_from` | timestamptz |  | NOT NULL |  |
| `effective_until` | timestamptz |  | NULL |  |
| `config_json` | jsonb |  | NULL |  |
| `revoked_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_at` | timestamptz |  | NULL |  |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `revoked_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
UNIQUE(tenant_id, feature_id, source_type, source_reference_id) WHERE revoked_at IS NULL
```

Relationships:

- tenant_feature_entitlements.tenant_id -> tenants.id
- tenant_feature_entitlements.feature_id -> platform_features.id

## `feature_flags`

Purpose: Stores feature rollout flags and tenant/platform overrides.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NULL | References tenants(id); NULL for platform-wide flag |
| `environment` | varchar(30) |  | NOT NULL |  |
| `flag_key` | varchar(120) |  | NOT NULL |  |
| `flag_name` | varchar(150) |  | NOT NULL |  |
| `target_scope` | varchar(40) |  | NOT NULL |  |
| `target_reference_id` | uuid |  | NULL |  |
| `is_enabled` | boolean |  | NOT NULL |  |
| `rollout_percentage` | int |  | NOT NULL |  |
| `config_json` | jsonb |  | NULL |  |
| `starts_at` | timestamptz |  | NULL |  |
| `ends_at` | timestamptz |  | NULL |  |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status |
| `created_at` | timestamptz |  | NOT NULL |  |
| `created_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |
| `updated_at` | timestamptz |  | NULL |  |
| `updated_by_platform_user_id` | uuid | FK | NULL | References platform_users(id) |

Constraints / Notes:

```text
CHECK(rollout_percentage BETWEEN 0 AND 100)
UNIQUE(environment, tenant_id, flag_key, target_scope, target_reference_id)
```

Relationships:

- feature_flags.tenant_id -> tenants.id

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `tenants` | id uuid PK | Tenant reference |
| `platform_users` | id uuid PK | Platform audit user reference |
| `currencies` | currency_code char(3) PK | Currency reference |

## Module Notes

- Dashed grey lines in the ERD indicate external audit/reference relationships.

