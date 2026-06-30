<!-- title: Discount & Expiry Discount Management -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 15. Discount & Expiry Discount Management

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `discount_types` | Stores discount types records for this module. |
| `discount_policies` | Stores discount policies records for this module. |
| `discount_policy_outlets` | Stores discount policy outlets records for this module. |
| `discount_policy_channels` | Stores discount policy channels records for this module. |
| `discount_policy_targets` | Stores discount policy targets records for this module. |
| `discount_policy_conditions` | Stores discount policy conditions records for this module. |
| `expiry_discount_rules` | Stores expiry discount rules records for this module. |
| `expiry_discount_rule_tiers` | Stores expiry discount rule tiers records for this module. |
| `expiry_discount_applications` | Stores expiry discount applications records for this module. |

## discount_types

Module: Discount & Expiry Discount Management

Purpose: Stores discount types records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| discount_type_code | varchar(40) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, discount_type_code)
```

## discount_policies

Module: Discount & Expiry Discount Management

Purpose: Stores discount policies records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| discount_code | varchar(80) | UNIQUE | Unique business key. |
| discount_type_id | uuid | FK NOT | References `discount_types(id)`. |
| discount_value | numeric(18,2) | CHECK | CHECK(discount_value >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(discount_type_id) REFERENCES discount_types(id)
UNIQUE(tenant_id, discount_code)
CHECK(discount_value >= 0)
```

## discount_policy_outlets

Module: Discount & Expiry Discount Management

Purpose: Stores discount policy outlets records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| discount_policy_id | uuid | FK NOT UNIQUE | References `discount_policies(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(discount_policy_id, outlet_id)
```

## discount_policy_channels

Module: Discount & Expiry Discount Management

Purpose: Stores discount policy channels records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| discount_policy_id | uuid | FK NOT UNIQUE | References `discount_policies(id)`. Unique business key. |
| sales_channel_id | uuid | FK NOT UNIQUE | References `sales_channels(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
UNIQUE(discount_policy_id, sales_channel_id)
```

## discount_policy_targets

Module: Discount & Expiry Discount Management

Purpose: Stores discount policy targets records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| discount_policy_id | uuid | FK NOT UNIQUE | References `discount_policies(id)`. Unique business key. |
| target_id | uuid | UNIQUE | Unique business key. |
| target_type | varchar(40) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
UNIQUE(discount_policy_id, target_type, target_id)
```

## discount_policy_conditions

Module: Discount & Expiry Discount Management

Purpose: Stores discount policy conditions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| condition_sequence | integer | CHECK | CHECK(condition_sequence > 0) |
| discount_policy_id | uuid | FK NOT | References `discount_policies(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
CHECK(condition_sequence > 0)
```

## expiry_discount_rules

Module: Discount & Expiry Discount Management

Purpose: Stores expiry discount rules records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| rule_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, rule_code)
```

## expiry_discount_rule_tiers

Module: Discount & Expiry Discount Management

Purpose: Stores expiry discount rule tiers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| days_before_expiry | integer | CHECK | CHECK(days_before_expiry >= 0) |
| discount_value | numeric(18,2) | CHECK | CHECK(discount_value >= 0) |
| expiry_discount_rule_id | uuid | FK NOT | References `expiry_discount_rules(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(expiry_discount_rule_id) REFERENCES expiry_discount_rules(id)
CHECK(days_before_expiry >= 0)
CHECK(discount_value >= 0)
```

## expiry_discount_applications

Module: Discount & Expiry Discount Management

Purpose: Stores expiry discount applications records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| expiry_discount_rule_id | uuid | FK NOT UNIQUE | References `expiry_discount_rules(id)`. Unique business key. |
| product_batch_id | uuid | FK NULL UNIQUE | References `product_batches(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(expiry_discount_rule_id) REFERENCES expiry_discount_rules(id)
FK(product_batch_id) REFERENCES product_batches(id)
UNIQUE(product_batch_id, expiry_discount_rule_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
