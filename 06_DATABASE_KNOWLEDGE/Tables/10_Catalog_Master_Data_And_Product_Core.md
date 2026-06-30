<!-- title: Catalog Master Data & Product Core -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 10. Catalog Master Data & Product Core

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `departments` | Stores departments records for this module. |
| `categories` | Stores categories records for this module. |
| `brands` | Stores brands records for this module. |
| `collections` | Stores collections records for this module. |
| `unit_of_measures` | Stores unit of measures records for this module. |
| `return_policies` | Stores return policies records for this module. |
| `products` | Stores products records for this module. |
| `product_variants` | Stores product variants records for this module. |

## departments

Module: Catalog Master Data & Product Core

Purpose: Stores departments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| department_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, department_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## categories

Module: Catalog Master Data & Product Core

Purpose: Stores categories records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| category_code | varchar(40) | UNIQUE | Unique business key. |
| parent_category_id | uuid | FK NOT | References `categories(id)`. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(parent_category_id) REFERENCES categories(id)
UNIQUE(tenant_id, category_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## brands

Module: Catalog Master Data & Product Core

Purpose: Stores brands records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| brand_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, brand_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## collections

Module: Catalog Master Data & Product Core

Purpose: Stores collections records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| collection_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, collection_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## unit_of_measures

Module: Catalog Master Data & Product Core

Purpose: Stores unit of measures records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| conversion_factor | numeric(18,4) | CHECK | CHECK(conversion_factor IS NULL OR conversion_factor > 0) |
| uom_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, uom_code)
CHECK(conversion_factor IS NULL OR conversion_factor > 0)
```

## return_policies

Module: Catalog Master Data & Product Core

Purpose: Stores return policies records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| policy_code | varchar(80) | UNIQUE | Unique business key. |
| return_window_days | integer | CHECK | CHECK(return_window_days IS NULL OR return_window_days >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, policy_code)
CHECK(return_window_days IS NULL OR return_window_days >= 0)
```

## products

Module: Catalog Master Data & Product Core

Purpose: Stores products records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, product_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_variants

Module: Catalog Master Data & Product Core

Purpose: Stores product variants records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. Partial unique where sku IS NOT NULL. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| sku | varchar(255) | UNIQUE | Unique business key. Partial unique where sku IS NOT NULL. |
| variant_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
UNIQUE(tenant_id, sku) WHERE sku IS NOT NULL
UNIQUE(tenant_id, product_id, variant_code)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
