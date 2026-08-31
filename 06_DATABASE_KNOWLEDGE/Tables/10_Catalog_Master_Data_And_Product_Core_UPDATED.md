<!-- title: Catalog Master Data & Product Core -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->
<!-- source: Updated from uploaded ERD image: 10_Catalog Master Data & Product Core(3).png -->

# 10. Catalog Master Data & Product Core

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for the Catalog Master Data & Product Core module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Entity tables, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD. Enum/domain datatypes from the ERD are written as `varchar(40)` with CHECK constraints where applicable.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `business_types` | Stores system/product business type classifications. |
| `departments` | Stores tenant departments used to group categories. |
| `categories` | Stores tenant categories with department and parent category hierarchy. |
| `brands` | Stores tenant brand master records. |
| `collections` | Stores tenant product collections and effective date windows. |
| `unit_of_measures` | Stores global and tenant-specific unit of measure records. |
| `return_policies` | Stores tenant product return policy records. |
| `products` | Stores tenant product master records. |
| `product_setup_initial_tracking` | TARGET 1:1 Product Setup draft for Initial Batch/Expiry/Serial (GAP until migration). |
| `product_variants` | Stores sellable product variants. |
| `product_reviews` | Stores 1-5 star customer ratings and text reviews for products. |
| `product_rating_summaries` | Stores the aggregated rating summary for fast loading on product pages. |

## `business_types`

Purpose: Stores system/product business type classifications.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `business_type_key` | varchar(100) |  | NOT NULL | Unique system/business type key |
| `business_type_name` | varchar(150) |  | NOT NULL | Display name |
| `description` | text |  | NULL | Optional description |
| `is_system_type` | boolean |  | NOT NULL DEFAULT true | True for system supplied type |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |

Indexes / Constraints / Notes:

```text
PK(id)
UNIQUE(business_type_key)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `departments`

Purpose: Stores tenant departments used to group categories.

| Attribute                   | Type         | Key | Null               | Reference / Note              |     |     |
| --------------------------- | ------------ | --- | ------------------ | ----------------------------- | --- | --- |
| `id`                        | uuid         | PK  | NOT NULL           | Primary key                   |     |     |
| `tenant_id`                 | uuid         | FK  | NOT NULL           | References tenants(id)        |     |     |
| `department_code`           | varchar(80)  |     | NOT NULL           | Tenant-scoped department code |     |     |
| `department_name`           | varchar(150) |     | NOT NULL           | Display name                  |     |     |
| `description`               | text         |     | NULL               | Optional description          |     |     |
| `sort_order`                | int          |     | NOT NULL DEFAULT 0 | Display order                 |     |     |
| `status`                    | varchar(40)  |     | NOT NULL           | Record status                 |     |     |
| `created_at`                | timestamptz  |     | NOT NULL           | Created timestamp             |     |     |
| `created_by_tenant_user_id` | uuid         | FK  | NULL               | References tenant_users(id)   |     |     |
| `updated_at`                | timestamptz  |     | NOT NULL           | Updated timestamp             |     |     |
| `updated_by_tenant_user_id` | uuid         | FK  | NULL               | References tenant_users(id)   |     |     |
|                             |              |     |                    |                               |     |     |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, department_code)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `categories`

Purpose: Stores tenant categories with department and parent category hierarchy.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `department_id` | uuid | FK | NOT NULL | References departments(id) |
| `parent_category_id` | uuid | FK | NULL | Self reference to categories(id); NULL means root |
| `category_code` | varchar(80) |  | NOT NULL | Category code |
| `category_name` | varchar(150) |  | NOT NULL | Display name |
| `category_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | text |  | NULL | Optional description |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, department_id) REFERENCES departments(tenant_id, id)
FK(parent_category_id) REFERENCES categories(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, department_id, category_code)
UNIQUE(tenant_id, category_slug)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, department_id, id)
CHECK(parent_category_id IS NULL OR parent_category_id <> id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `brands`

Purpose: Stores tenant brand master records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `brand_code` | varchar(80) |  | NOT NULL | Tenant-scoped brand code |
| `brand_name` | varchar(150) |  | NOT NULL | Display name |
| `brand_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | text |  | NULL | Optional description |
| `logo_url` | varchar(500) |  | NULL | Brand logo URL |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, brand_code)
UNIQUE(tenant_id, brand_slug)
UNIQUE(tenant_id, id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `collections`

Purpose: Stores tenant product collections and effective date windows.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `collection_code` | varchar(80) |  | NOT NULL | Tenant-scoped collection code |
| `collection_name` | varchar(150) |  | NOT NULL | Display name |
| `collection_slug` | varchar(180) |  | NOT NULL | URL/display slug |
| `description` | text |  | NULL | Optional description |
| `collection_type` | varchar(40) |  | NOT NULL | Collection type |
| `starts_at` | timestamptz |  | NULL | Collection start timestamp |
| `ends_at` | timestamptz |  | NULL | Collection end timestamp |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, collection_code)
UNIQUE(tenant_id, collection_slug)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `unit_of_measures`

Purpose: Stores global and tenant-specific unit of measure records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NULL | References tenants(id); NULL for global/system UOM |
| `uom_code` | varchar(30) |  | NOT NULL | UOM code |
| `uom_name` | varchar(100) |  | NOT NULL | Display name |
| `uom_type` | varchar(40) |  | NOT NULL | UOM type |
| `symbol` | varchar(20) |  | NULL | Display symbol |
| `base_uom_id` | uuid | FK | NULL | Self reference to unit_of_measures(id) |
| `conversion_factor` | numeric(18,6) |  | NOT NULL DEFAULT 1 | Conversion factor to base UOM |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(base_uom_id) REFERENCES unit_of_measures(id)
UNIQUE(uom_code) WHERE tenant_id IS NULL
UNIQUE(tenant_id, uom_code) WHERE tenant_id IS NOT NULL
CHECK(conversion_factor > 0)
CHECK(base_uom_id IS NULL OR base_uom_id <> id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `return_policies`

Purpose: Stores tenant product return policy records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `return_policy_code` | varchar(80) |  | NOT NULL | Tenant-scoped return policy code |
| `return_policy_name` | varchar(150) |  | NOT NULL | Display name |
| `description` | text |  | NULL | Optional description |
| `return_window_days` | int |  | NOT NULL | Allowed return window in days |
| `exchange_window_days` | int |  | NOT NULL | Allowed exchange window in days |
| `requires_receipt` | boolean |  | NOT NULL DEFAULT true | Receipt required flag |
| `allow_defective_return` | boolean |  | NOT NULL DEFAULT true | Defective return allowed flag |
| `requires_manager_approval` | boolean |  | NOT NULL DEFAULT false | Manager approval required flag |
| `is_default_policy` | boolean |  | NOT NULL DEFAULT false | Default policy flag |
| `status` | varchar(40) |  | NOT NULL | Record status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, return_policy_code)
UNIQUE(tenant_id, id)
CHECK(return_window_days >= 0)
CHECK(exchange_window_days >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
One active default policy per tenant.
```

## `products`

Purpose: Stores tenant product master records.

| Attribute                   | Type         | Key | Null                  | Reference / Note               |
| --------------------------- | ------------ | --- | --------------------- | ------------------------------ |
| `id`                        | uuid         | PK  | NOT NULL              | Primary key                    |
| `tenant_id`                 | uuid         | FK  | NOT NULL              | References tenants(id)         |
| `product_code`              | varchar(80)  |     | NOT NULL              | Tenant-scoped product code     |
| `product_name`              | varchar(200) |     | NOT NULL              | Product name                   |
| `product_slug`              | varchar(220) |     | NOT NULL              | URL/display slug               |
| `product_type`              | varchar(40)  |     | NOT NULL              | Product type                   |
| `product_structure`         | varchar(40)  |     | NOT NULL              | Product structure              |
| `business_type_id`          | uuid         | FK  | NULL                  | References business_types(id)  |
| `brand_id`                  | uuid         | FK  | NULL                  | References brands(id)          |
| `return_policy_id`          | uuid         | FK  | NULL                  | References return_policies(id) |
| `short_description`         | text         |     | NULL                  | Short description              |
| `long_description`          | text         |     | NULL                  | Long description               |
| `is_sellable`               | boolean      |     | NOT NULL DEFAULT true | Sellable flag                  |
| `is_taxable`                | boolean      |     | NOT NULL DEFAULT true | Taxable flag                   |
| `status`                    | varchar(40)  |     | NOT NULL              | Product status                 |
| `reference_cost_price`      | numeric(18,4)|     | NULL                  | Reference cost price           |
| `current_setup_step`        | int          |     | NOT NULL DEFAULT 1    | Wizard setup step progress     |
| `draft_saved_at`            | timestamptz  |     | NULL                  | Draft creation timestamp       |
| `published_at`              | timestamptz  |     | NULL                  | Timestamp of publication       |
| `published_by_tenant_user_id`| uuid        | FK  | NULL                  | References tenant_users(id)    |
| `archived_at`               | timestamptz  |     | NULL                  | Timestamp of soft delete       |
| `archived_by_tenant_user_id` | uuid        | FK  | NULL                  | References tenant_users(id)    |
| `row_version`               | bigint       |     | NOT NULL DEFAULT 1    | Optimistic concurrency token   |
| `created_at`                | timestamptz  |     | NOT NULL              | Created timestamp              |
| `created_by_tenant_user_id` | uuid         | FK  | NULL                  | References tenant_users(id)    |
| `updated_at`                | timestamptz  |     | NOT NULL              | Updated timestamp              |
| `updated_by_tenant_user_id` | uuid         | FK  | NULL                  | References tenant_users(id)    |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(business_type_id) REFERENCES business_types(id)
FK(tenant_id, brand_id) REFERENCES brands(tenant_id, id)
FK(tenant_id, return_policy_id) REFERENCES return_policies(tenant_id, id)
FK(published_by_tenant_user_id) REFERENCES tenant_users(id)
FK(archived_by_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_code)
UNIQUE(tenant_id, product_slug)
UNIQUE(tenant_id, id)
CHECK(status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'))
CHECK(current_setup_step BETWEEN 1 AND 7)
CHECK(row_version >= 0)
```

CURRENT EF already enforces `ck_products_setup_step` as `BETWEEN 1 AND 7`
(migration `ConsolidateProductWizardTo7Steps`). Stale `1 AND 8` documentation
is superseded.

Do **not** add `products.batch_number`, `products.expiry_date`, or
`products.serial_number`. Initial Tracking Details are TARGET draft data on
`product_setup_initial_tracking` (GAP until migration). Final identity remains
`product_batches` / `serial_numbers`.

## `product_setup_initial_tracking` (TARGET — GAP until migration)

Purpose: 1:1 Product Setup draft store for optional Step 1 Initial Tracking
Details. Not Product master identity. Not inventory quantity.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Own primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(tenant_id, id); 1:1 |
| `initial_batch_number` | varchar(100) |  | NULL | Provisional Batch |
| `initial_expiry_date` | date |  | NULL | Provisional Expiry |
| `initial_serial_number` | varchar(150) |  | NULL | Provisional Serial |
| `assigned_product_variant_id` | uuid | FK | NULL | VARIANT assignment at Step 7 |
| `incompatible_clear_confirmed_at` | timestamptz |  | NULL | Last explicit incompatible clear |
| `consumed_at` | timestamptz |  | NULL | Set when publish creates inventory identity |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `row_version` | bigint |  | NOT NULL DEFAULT 1 | Internal increment with `products.row_version`. API token remains `products.row_version` / `expectedRowVersion` |

Indexes / Constraints / Notes:

```text
PK(id)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id)
FK(tenant_id) REFERENCES tenants(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
  ON DELETE CASCADE
  NAME fk_product_setup_initial_tracking_product_id_products
FK(tenant_id, assigned_product_variant_id) REFERENCES product_variants(tenant_id, id)
  NAME fk_product_setup_initial_tracking_assigned_variant
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_created_by
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
  NAME fk_product_setup_initial_tracking_updated_by
CHECK(row_version >= 1)
INDEX(tenant_id, product_id)
INDEX(tenant_id, consumed_at) WHERE consumed_at IS NULL
```

Do **not** add a CHECK that forbids Batch+Expiry+Serial together. Combination
validation is application/domain until Step 2. Tenant isolation: every query
filters `tenant_id`. Optimistic concurrency for clients uses parent
`products.row_version` only.

Authority:
[[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]].

## `product_variants`

Purpose: Stores sellable product variants.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `variant_code` | varchar(80) |  | NOT NULL | Product-scoped variant code |
| `sku` | varchar(100) |  | NULL | SKU, unique when present |
| `variant_name` | varchar(150) |  | NOT NULL | Display name |
| `stock_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `sales_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `option_combination_hash` | char(64) |  | NULL | Hash for duplicate option-combination prevention |
| `is_default_variant` | boolean |  | NOT NULL DEFAULT false | Default variant flag |
| `is_sellable` | boolean |  | NOT NULL DEFAULT true | Sellable flag |
| `allow_fractional_quantity` | boolean |  | NOT NULL DEFAULT false | Fractional quantity flag |
| `status` | varchar(40) |  | NOT NULL | Product variant status |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz |  | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id, product_id) REFERENCES products(tenant_id, id)
FK(tenant_id, stock_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(tenant_id, sales_uom_id) REFERENCES unit_of_measures(tenant_id, id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, variant_code)
UNIQUE(tenant_id, sku) WHERE sku IS NOT NULL
UNIQUE(tenant_id, id)
UNIQUE(tenant_id, product_id, id)
One active default variant per product.
UNIQUE(tenant_id, product_id, option_combination_hash) WHERE option_combination_hash IS NOT NULL
CHECK(status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'))
```

## `product_reviews`

Purpose: Stores 1-5 star customer ratings and text reviews for products.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `customer_id` | uuid | FK | NOT NULL | References customers(id) |
| `rating_value` | int |  | NOT NULL | Rating 1 to 5 |
| `review_title` | varchar(150) |  | NULL | Short summary of review |
| `review_text` | text |  | NULL | Detailed review content |
| `status` | varchar(30) |  | NOT NULL | Status (PENDING, APPROVED, REJECTED) |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by` | uuid | FK | NULL | Creator ID |
| `updated_at` | timestamptz |  | NULL | Updated timestamp |
| `updated_by` | uuid | FK | NULL | Updater ID |

Indexes / Constraints / Notes:
- FK(tenant_id)
- FK(product_id) CASCADE
- FK(customer_id)

## `product_rating_summaries`

Purpose: Stores the aggregated rating summary for fast loading on product pages.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `average_rating` | numeric(3,2)|  | NOT NULL | Pre-calculated average |
| `total_reviews` | int |  | NOT NULL | Total review count |
| `five_star_count` | int |  | NOT NULL | Count of 5 stars |
| `four_star_count` | int |  | NOT NULL | Count of 4 stars |
| `three_star_count`| int |  | NOT NULL | Count of 3 stars |
| `two_star_count` | int |  | NOT NULL | Count of 2 stars |
| `one_star_count` | int |  | NOT NULL | Count of 1 stars |
| `created_at` | timestamptz |  | NOT NULL | Created timestamp |
| `created_by` | uuid | FK | NULL | Creator ID |
| `updated_at` | timestamptz |  | NULL | Updated timestamp |
| `updated_by` | uuid | FK | NULL | Updater ID |

Indexes / Constraints / Notes:
- UNIQUE(product_id) - One summary per product
- FK(tenant_id)
- FK(product_id) CASCADE

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |

## Module Notes

- Every sellable product must have at least one `product_variants` row. Therefore, for `SIMPLE` and `BUNDLE` products, their Base SKU is stored in `product_variants.sku` on their single default variant row.
- Only entity tables visible in the uploaded ERD image are included.
- Tenant-owned tables include `tenant_id` for data isolation.

## `product_unit_settings`

Purpose: Stores product-specific unit model setup and pack conversion attributes.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id); UNIQUE per product |
| `unit_model` | varchar(40) | | NOT NULL | CHECK ('SINGLE_UNIT', 'MULTIPLE_UNITS') |
| `base_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `selling_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `purchase_uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `outer_pack_uom_id` | uuid | FK | NULL | References unit_of_measures(id) |
| `items_per_purchase_unit` | numeric(18,4) | | NULL | Items in 1 Purchase Unit |
| `purchase_units_per_outer_pack` | numeric(18,4) | | NULL | Purchase Units in 1 Outer Pack |
| `allow_decimal_quantity` | boolean | | NOT NULL DEFAULT false | Controls fractional quantities |
| `status` | varchar(30) | | NOT NULL DEFAULT 'ACTIVE' | Status |
| `created_at` | timestamptz | | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz | | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

## `product_unit_conversions`

Purpose: Stores pre-calculated conversion factors to Base Unit for every active unit level of a product.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id) |
| `product_id` | uuid | FK | NOT NULL | References products(id) |
| `uom_id` | uuid | FK | NOT NULL | References unit_of_measures(id) |
| `unit_level` | varchar(40) | | NOT NULL | CHECK ('BASE', 'SELLING', 'PURCHASE', 'OUTER_PACK') |
| `conversion_to_base_factor` | numeric(18,4) | | NOT NULL | Multiplier to get Base Units |
| `is_base_unit` | boolean | | NOT NULL DEFAULT false | Base Unit marker |
| `is_selling_unit` | boolean | | NOT NULL DEFAULT false | Selling Unit marker |
| `is_purchase_unit` | boolean | | NOT NULL DEFAULT false | Purchase Unit marker |
| `is_outer_pack_unit` | boolean | | NOT NULL DEFAULT false | Outer Pack Unit marker |
| `status` | varchar(30) | | NOT NULL DEFAULT 'ACTIVE' | Status |
| `created_at` | timestamptz | | NOT NULL | Created timestamp |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |
| `updated_at` | timestamptz | | NOT NULL | Updated timestamp |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id) |

## Related Files

- [[11_Product_Mapping_Media_Attributes_And_Channel_Visibility]]
- [[12_Product_Option_Templates_And_Variant_Configuration]]
- [[14_Pricing_And_Tax_Management]]
- [[16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[15_Product_Import_Batches_And_Rows]]
# Product barcode POS lookup note (2026-07-22)

`product_barcodes` supports tenant-scoped exact POS lookup through the unique
`(tenant_id, barcode)` constraint. The lookup preserves the barcode as a string,
requires `ACTIVE` status, and returns `barcode_type`, `quantity_per_scan`, and
the exact matched barcode. `product_variant_id` may be null: one active/sellable
variant resolves successfully, multiple valid variants are ambiguous, and no
valid variant is unavailable.
