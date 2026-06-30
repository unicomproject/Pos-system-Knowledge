<!-- title: Product Option Templates & Variant Configuration -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 12. Product Option Templates & Variant Configuration

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `product_option_templates` | Stores product option templates records for this module. |
| `product_option_template_values` | Stores product option template values records for this module. |
| `business_type_option_templates` | Stores business type option templates records for this module. |
| `product_options` | Stores product options records for this module. |
| `product_option_values` | Stores product option values records for this module. |
| `product_variant_option_values` | Stores product variant option values records for this module. |

## product_option_templates

Module: Product Option Templates & Variant Configuration

Purpose: Stores product option templates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| template_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, template_code)
```

## product_option_template_values

Module: Product Option Templates & Variant Configuration

Purpose: Stores product option template values records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_option_template_id | uuid | FK NOT UNIQUE | References `product_option_templates(id)`. Unique business key. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |
| value_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_option_template_id) REFERENCES product_option_templates(id)
UNIQUE(product_option_template_id, value_code)
CHECK(sort_order >= 0)
```

## business_type_option_templates

Module: Product Option Templates & Variant Configuration

Purpose: Stores business type option templates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| business_type_id | uuid | FK NOT UNIQUE | References `business_types(id)`. Unique business key. |
| product_option_template_id | uuid | FK NOT UNIQUE | References `product_option_templates(id)`. Unique business key. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(business_type_id) REFERENCES business_types(id)
FK(product_option_template_id) REFERENCES product_option_templates(id)
UNIQUE(business_type_id, product_option_template_id)
```

## product_options

Module: Product Option Templates & Variant Configuration

Purpose: Stores product options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| option_code | varchar(80) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_option_template_id | uuid | FK NOT | References `product_option_templates(id)`. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(product_option_template_id) REFERENCES product_option_templates(id)
UNIQUE(product_id, option_code)
CHECK(sort_order >= 0)
```

## product_option_values

Module: Product Option Templates & Variant Configuration

Purpose: Stores product option values records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| option_value_code | varchar(80) | UNIQUE | Unique business key. |
| product_option_id | uuid | FK NOT UNIQUE | References `product_options(id)`. Unique business key. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(product_option_id) REFERENCES product_options(id)
UNIQUE(product_option_id, option_value_code)
CHECK(sort_order >= 0)
```

## product_variant_option_values

Module: Product Option Templates & Variant Configuration

Purpose: Stores product variant option values records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_option_value_id | uuid | FK NOT UNIQUE | References `product_option_values(id)`. Unique business key. |
| product_variant_id | uuid | FK NULL UNIQUE | References `product_variants(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_option_value_id) REFERENCES product_option_values(id)
UNIQUE(product_variant_id, product_option_value_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
