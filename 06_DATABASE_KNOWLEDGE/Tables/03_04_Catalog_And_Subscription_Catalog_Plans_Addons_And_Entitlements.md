<!-- title: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 03_04. Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

## Purpose

This file documents the database tables and attributes for this module.

Modules 03 and 04 from the uploaded design are combined here because they contain the same table set.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `platform_modules` | Stores platform modules records for this module. |
| `platform_features` | Stores platform features records for this module. |
| `feature_limit_definitions` | Stores feature limit definitions records for this module. |
| `subscription_plans` | Stores subscription plans records for this module. |
| `subscription_plan_features` | Stores subscription plan features records for this module. |
| `subscription_addons` | Stores subscription addons records for this module. |
| `subscription_plan_addons` | Stores subscription plan addons records for this module. |
| `subscription_plan_feature_limits` | Stores subscription plan feature limits records for this module. |
| `subscription_addon_features` | Stores subscription addon features records for this module. |
| `subscription_addon_limits` | Stores subscription addon limits records for this module. |
| `tenant_feature_entitlements` | Stores tenant feature entitlements records for this module. |
| `feature_flags` | Stores feature flags records for this module. |

## platform_modules

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores platform modules records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| module_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(module_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## platform_features

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores platform features records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| feature_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_module_id | uuid | FK NOT UNIQUE | References `platform_modules(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_module_id) REFERENCES platform_modules(id)
UNIQUE(platform_module_id, feature_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## feature_limit_definitions

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores feature limit definitions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| limit_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| default_limit_value | integer | CHECK | CHECK(default_limit_value IS NULL OR default_limit_value >= 0) |
| platform_feature_id | uuid | FK NOT UNIQUE | References `platform_features(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(platform_feature_id, limit_code)
CHECK(default_limit_value IS NULL OR default_limit_value >= 0)
```

## subscription_plans

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription plans records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| plan_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| billing_interval | varchar(255) | CHECK | CHECK(billing_interval IN ('MONTHLY', 'YEARLY', 'ONE_TIME')) |
| price_amount | numeric(18,2) | CHECK | CHECK(price_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(plan_code)
CHECK(billing_interval IN ('MONTHLY', 'YEARLY', 'ONE_TIME'))
CHECK(price_amount >= 0)
```

## subscription_plan_features

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription plan features records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_feature_id | uuid | FK NOT UNIQUE | References `platform_features(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |
| subscription_plan_id | uuid | FK NOT UNIQUE | References `subscription_plans(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_plan_id) REFERENCES subscription_plans(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(subscription_plan_id, platform_feature_id)
```

## subscription_addons

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription addons records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| addon_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| price_amount | numeric(18,2) | CHECK | CHECK(price_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(addon_code)
CHECK(price_amount >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## subscription_plan_addons

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription plan addons records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| subscription_addon_id | uuid | FK NOT UNIQUE | References `subscription_addons(id)`. Unique business key. |
| subscription_plan_id | uuid | FK NOT UNIQUE | References `subscription_plans(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_plan_id) REFERENCES subscription_plans(id)
FK(subscription_addon_id) REFERENCES subscription_addons(id)
UNIQUE(subscription_plan_id, subscription_addon_id)
```

## subscription_plan_feature_limits

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription plan feature limits records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| feature_limit_definition_id | uuid | FK NOT UNIQUE | References `feature_limit_definitions(id)`. Unique business key. |
| limit_value | integer | CHECK | CHECK(limit_value IS NULL OR limit_value >= 0) |
| subscription_plan_feature_id | uuid | FK NOT UNIQUE | References `subscription_plan_features(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_plan_feature_id) REFERENCES subscription_plan_features(id)
FK(feature_limit_definition_id) REFERENCES feature_limit_definitions(id)
UNIQUE(subscription_plan_feature_id, feature_limit_definition_id)
CHECK(limit_value IS NULL OR limit_value >= 0)
```

## subscription_addon_features

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription addon features records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| platform_feature_id | uuid | FK NOT UNIQUE | References `platform_features(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |
| subscription_addon_id | uuid | FK NOT UNIQUE | References `subscription_addons(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_addon_id) REFERENCES subscription_addons(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(subscription_addon_id, platform_feature_id)
```

## subscription_addon_limits

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores subscription addon limits records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| feature_limit_definition_id | uuid | FK NOT UNIQUE | References `feature_limit_definitions(id)`. Unique business key. |
| limit_value | integer | CHECK | CHECK(limit_value IS NULL OR limit_value >= 0) |
| subscription_addon_feature_id | uuid | FK NOT UNIQUE | References `subscription_addon_features(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(subscription_addon_feature_id) REFERENCES subscription_addon_features(id)
FK(feature_limit_definition_id) REFERENCES feature_limit_definitions(id)
UNIQUE(subscription_addon_feature_id, feature_limit_definition_id)
CHECK(limit_value IS NULL OR limit_value >= 0)
```

## tenant_feature_entitlements

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores tenant feature entitlements records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| entitlement_status | varchar(30) | CHECK | CHECK(entitlement_status IN ('ENABLED', 'DISABLED', 'EXPIRED')) |
| platform_feature_id | uuid | FK NOT UNIQUE | References `platform_features(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(tenant_id, platform_feature_id)
CHECK(entitlement_status IN ('ENABLED', 'DISABLED', 'EXPIRED'))
```

## feature_flags

Module: Catalog + Subscription Catalog, Plans, Add-ons & Entitlements

Purpose: Stores feature flags records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| flag_code | varchar(80) | UNIQUE | Unique business key. |
| platform_feature_id | uuid | FK NOT | References `platform_features(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(platform_feature_id) REFERENCES platform_features(id)
UNIQUE(flag_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
