<!-- title: Pricing & Tax Management -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 14. Pricing & Tax Management

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `price_lists` | Stores price lists records for this module. |
| `price_list_outlets` | Stores price list outlets records for this module. |
| `price_list_channels` | Stores price list channels records for this module. |
| `price_list_items` | Stores price list items records for this module. |
| `tax_jurisdictions` | Stores tax jurisdictions records for this module. |
| `tax_classes` | Stores tax classes records for this module. |
| `tax_rates` | Stores tax rates records for this module. |
| `tax_class_rates` | Stores tax class rates records for this module. |
| `product_tax_assignments` | Stores product tax assignments records for this module. |

## price_lists

Module: Pricing & Tax Management

Purpose: Stores price lists records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| price_list_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, price_list_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## price_list_outlets

Module: Pricing & Tax Management

Purpose: Stores price list outlets records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| price_list_id | uuid | FK NOT UNIQUE | References `price_lists(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(price_list_id, outlet_id)
```

## price_list_channels

Module: Pricing & Tax Management

Purpose: Stores price list channels records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| price_list_id | uuid | FK NOT UNIQUE | References `price_lists(id)`. Unique business key. |
| sales_channel_id | uuid | FK NOT UNIQUE | References `sales_channels(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
UNIQUE(price_list_id, sales_channel_id)
```

## price_list_items

Module: Pricing & Tax Management

Purpose: Stores price list items records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| price_amount | numeric(18,2) | CHECK | CHECK(price_amount >= 0) |
| price_list_id | uuid | FK NOT UNIQUE | References `price_lists(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | FK NULL UNIQUE | References `product_variants(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(price_list_id, product_id, product_variant_id)
CHECK(price_amount >= 0)
```

## tax_jurisdictions

Module: Pricing & Tax Management

Purpose: Stores tax jurisdictions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| jurisdiction_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, jurisdiction_code)
```

## tax_classes

Module: Pricing & Tax Management

Purpose: Stores tax classes records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| tax_class_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, tax_class_code)
```

## tax_rates

Module: Pricing & Tax Management

Purpose: Stores tax rates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| rate_percent | numeric(9,4) | CHECK | CHECK(rate_percent >= 0) |
| tax_jurisdiction_id | uuid | FK NOT UNIQUE | References `tax_jurisdictions(id)`. Unique business key. |
| tax_rate_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tax_jurisdiction_id) REFERENCES tax_jurisdictions(id)
UNIQUE(tax_jurisdiction_id, tax_rate_code)
CHECK(rate_percent >= 0)
```

## tax_class_rates

Module: Pricing & Tax Management

Purpose: Stores tax class rates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| tax_class_id | uuid | FK NOT UNIQUE | References `tax_classes(id)`. Unique business key. |
| tax_rate_id | uuid | FK NOT UNIQUE | References `tax_rates(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tax_class_id) REFERENCES tax_classes(id)
FK(tax_rate_id) REFERENCES tax_rates(id)
UNIQUE(tax_class_id, tax_rate_id)
```

## product_tax_assignments

Module: Pricing & Tax Management

Purpose: Stores product tax assignments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| tax_class_id | uuid | FK NOT UNIQUE | References `tax_classes(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(tax_class_id) REFERENCES tax_classes(id)
UNIQUE(product_id, product_variant_id, tax_class_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
