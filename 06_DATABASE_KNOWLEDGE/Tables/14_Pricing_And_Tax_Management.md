<!-- title: Pricing & Tax Management -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: 14_Pricing & Tax Management(1).png -->

# 14. Pricing & Tax Management

## Purpose

This module defines price lists, outlet/channel price list mapping, product/variant/UOM prices, tax jurisdictions, tax classes, tax rates, and product tax assignments.

## Entity Tables

| No | Table | Purpose |
|---|---|---|
| 1 | `price_lists` | Tenant price list headers. |
| 2 | `price_list_outlets` | Assigns price lists to outlets. |
| 3 | `price_list_channels` | Assigns price lists to sales channels. |
| 4 | `price_list_items` | Product/variant/UOM price rows inside a price list. |
| 5 | `tax_jurisdictions` | Tax jurisdiction hierarchy and location matching. |
| 6 | `tax_classes` | Tenant tax class master. |
| 7 | `tax_rates` | Tax rates per jurisdiction. |
| 8 | `tax_class_rates` | Links tax classes to tax rates in calculation order. |
| 9 | `product_tax_assignments` | Assigns tax classes to products or variants. |

## Reference Entities

`tenants`, `tenant_users`, `currencies`, `sales_channels`, `outlets`, `products`, `product_variants`, `unit_of_measures`

## price_lists

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `price_list_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique price list code. |
| `price_list_name` | varchar(150) | NOT NULL | Display name. |
| `price_list_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: price_list_type. |
| `currency_code` | char(3) | FK NOT NULL | References currencies(currency_code). |
| `price_includes_tax` | boolean | NOT NULL DEFAULT false | Whether prices include tax. |
| `is_default_price_list` | boolean | NOT NULL DEFAULT false | Marks tenant default price list. |
| `priority` | int | NOT NULL DEFAULT 0 CHECK | Priority order. |
| `valid_from` | timestamptz | NULL CHECK | Effective start. |
| `valid_until` | timestamptz | NULL CHECK | Effective end. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, price_list_code)
UNIQUE(tenant_id, id)
CHECK(priority >= 0)
CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## price_list_outlets

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `price_list_id` | uuid | FK NOT NULL | References price_lists(id). |
| `outlet_id` | uuid | FK NOT NULL | References outlets(id). |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(outlet_id) REFERENCES outlets(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, price_list_id, outlet_id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## price_list_channels

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `price_list_id` | uuid | FK NOT NULL | References price_lists(id). |
| `sales_channel_id` | uuid | FK NOT NULL | References sales_channels(id). |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, price_list_id, sales_channel_id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## price_list_items

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `price_list_id` | uuid | FK NOT NULL | References price_lists(id). |
| `product_id` | uuid | FK NOT NULL | References products(id). |
| `product_variant_id` | uuid | FK NULL | References product_variants(id). |
| `uom_id` | uuid | FK NULL | References unit_of_measures(id). |
| `selling_price` | numeric(18,4) | NOT NULL CHECK | Selling price. |
| `compare_at_price` | numeric(18,4) | NULL CHECK | Original compare/list price. |
| `min_quantity` | numeric(18,4) | NOT NULL DEFAULT 1 CHECK | Minimum quantity tier. |
| `valid_from` | timestamptz | NULL CHECK | Effective start. |
| `valid_until` | timestamptz | NULL CHECK | Effective end. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(uom_id) REFERENCES unit_of_measures(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, price_list_id, product_id, uom_id, min_quantity) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, price_list_id, product_variant_id, uom_id, min_quantity) WHERE product_variant_id IS NOT NULL
CHECK(selling_price >= 0)
CHECK(compare_at_price IS NULL OR compare_at_price >= selling_price)
CHECK(min_quantity > 0)
CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tax_jurisdictions

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `parent_jurisdiction_id` | uuid | FK NULL CHECK | Self reference to tax_jurisdictions(id). |
| `jurisdiction_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique jurisdiction code. |
| `jurisdiction_name` | varchar(150) | NOT NULL | Display name. |
| `jurisdiction_type` | varchar(40) | NOT NULL CHECK | Logical ERD type: tax_jurisdiction_type. |
| `country_code` | char(2) | NOT NULL | Country code. |
| `region_code` | varchar(50) | NULL | Region/state code. |
| `locality_name` | varchar(120) | NULL | Locality/city name. |
| `postal_code_pattern` | varchar(100) | NULL | Optional postal matching pattern. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(parent_jurisdiction_id) REFERENCES tax_jurisdictions(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, jurisdiction_code)
UNIQUE(tenant_id, id)
CHECK(parent_jurisdiction_id IS NULL OR parent_jurisdiction_id <> id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tax_classes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `tax_class_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique tax class code. |
| `tax_class_name` | varchar(150) | NOT NULL | Display name. |
| `description` | text | NULL | Optional description. |
| `is_default_tax_class` | boolean | NOT NULL DEFAULT false | Marks tenant default tax class. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, tax_class_code)
UNIQUE(tenant_id, id)
UNIQUE(tenant_id) WHERE is_default_tax_class = true AND status = 'ACTIVE'
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tax_rates

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `tax_jurisdiction_id` | uuid | FK NOT NULL | References tax_jurisdictions(id). |
| `tax_rate_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique tax rate code. |
| `tax_rate_name` | varchar(150) | NOT NULL | Display name. |
| `rate_percent` | numeric(8,4) | NOT NULL CHECK | Tax rate percentage. |
| `is_compound` | boolean | NOT NULL DEFAULT false | Compound tax flag. |
| `valid_from` | date | NULL CHECK | Effective start date. |
| `valid_until` | date | NULL CHECK | Effective end date. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tax_jurisdiction_id) REFERENCES tax_jurisdictions(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, tax_rate_code)
UNIQUE(tenant_id, id)
CHECK(rate_percent >= 0)
CHECK(rate_percent <= 100)
CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## tax_class_rates

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `tax_class_id` | uuid | FK NOT NULL | References tax_classes(id). |
| `tax_rate_id` | uuid | FK NOT NULL | References tax_rates(id). |
| `sort_order` | int | NOT NULL DEFAULT 0 CHECK | Calculation order. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(tax_class_id) REFERENCES tax_classes(id)
FK(tax_rate_id) REFERENCES tax_rates(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, tax_class_id, tax_rate_id)
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_tax_assignments

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References tenants(id). |
| `product_id` | uuid | FK NOT NULL | References products(id). |
| `product_variant_id` | uuid | FK NULL | References product_variants(id). |
| `tax_class_id` | uuid | FK NOT NULL | References tax_classes(id). |
| `applies_from` | timestamptz | NULL CHECK | Effective start. |
| `applies_until` | timestamptz | NULL CHECK | Effective end. |
| `status` | varchar(30) | NOT NULL CHECK | Logical ERD type: record_status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References tenant_users(id). |

Source constraints / rules from uploaded ERD image:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(tax_class_id) REFERENCES tax_classes(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(applies_until IS NULL OR applies_from IS NULL OR applies_until >= applies_from)
UNIQUE(tenant_id, product_id) WHERE product_variant_id IS NULL AND status = 'ACTIVE'
UNIQUE(tenant_id, product_variant_id) WHERE product_variant_id IS NOT NULL AND status = 'ACTIVE'
No overlapping active tax assignments per product/variant.
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

