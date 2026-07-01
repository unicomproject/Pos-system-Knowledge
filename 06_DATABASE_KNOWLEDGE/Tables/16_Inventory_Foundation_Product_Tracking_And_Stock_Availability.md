<!-- title: Inventory Foundation, Product Tracking & Stock Availability -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 16. Inventory Foundation, Product Tracking & Stock Availability

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `inventory_locations` | Stores inventory locations records for this module. |
| `product_inventory_settings` | Stores product inventory settings records for this module. |
| `product_batches` | Stores product batches records for this module. |
| `inventory_balances` | Stores inventory balances records for this module. |
| `inventory_channel_allocations` | Stores inventory channel allocations records for this module. |
| `serial_numbers` | Stores serial numbers records for this module. |
| `inventory_cost_layers` | Stores inventory cost layers records for this module. |
| `inventory_reorder_rules` | Stores inventory reorder rules records for this module. |

## inventory_locations

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores inventory locations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| outlet_id | uuid | FK NULL | References `outlets(id)`. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| location_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(tenant_id, location_code)
```

## product_inventory_settings

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores product inventory settings records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | FK NULL UNIQUE | References `product_variants(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(product_id, product_variant_id)
```

## product_batches

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores product batches records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| batch_number | varchar(80) | UNIQUE | Unique business key. |
| manufactured_date | date | NULL CHECK | CHECK(expiry_date IS NULL OR expiry_date >= manufactured_date) |
| expiry_date | date | NULL CHECK | CHECK(expiry_date IS NULL OR expiry_date >= manufactured_date) |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | FK NULL UNIQUE | References `product_variants(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(tenant_id, product_id, product_variant_id, batch_number)
CHECK(expiry_date IS NULL OR expiry_date >= manufactured_date)
```

## inventory_balances

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores inventory balances records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inventory_location_id | uuid | FK NOT UNIQUE | References `inventory_locations(id)`. Unique business key. |
| on_hand_quantity | numeric(18,4) | CHECK | CHECK(on_hand_quantity >= 0) |
| product_batch_id | uuid | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| reserved_quantity | numeric(18,4) | CHECK | CHECK(reserved_quantity >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(product_id) REFERENCES products(id)
UNIQUE(inventory_location_id, product_id, product_variant_id, product_batch_id)
CHECK(on_hand_quantity >= 0)
CHECK(reserved_quantity >= 0)
```

## inventory_channel_allocations

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores inventory channel allocations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| allocation_limit_quantity | numeric(18,4) | CHECK | CHECK(allocation_limit_quantity >= 0) |
| inventory_location_id | uuid | FK NOT UNIQUE | References `inventory_locations(id)`. Unique business key. |
| product_id | uuid | UNIQUE | Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| sales_channel_id | uuid | FK NOT UNIQUE | References `sales_channels(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
UNIQUE(inventory_location_id, product_id, product_variant_id, sales_channel_id)
CHECK(allocation_limit_quantity >= 0)
```

## serial_numbers

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores serial numbers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_id | uuid | FK NOT | References `products(id)`. |
| serial_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(product_id) REFERENCES products(id)
UNIQUE(tenant_id, serial_number)
```

## inventory_cost_layers

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores inventory cost layers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_batch_id | uuid | FK NULL | References `product_batches(id)`. |
| quantity_remaining | numeric(18,4) | CHECK | CHECK(quantity_remaining >= 0) |
| unit_cost | numeric(18,2) | CHECK | CHECK(unit_cost >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(product_batch_id) REFERENCES product_batches(id)
CHECK(quantity_remaining >= 0)
CHECK(unit_cost >= 0)
```

## inventory_reorder_rules

Module: Inventory Foundation, Product Tracking & Stock Availability

Purpose: Stores inventory reorder rules records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inventory_location_id | uuid | FK NOT UNIQUE | References `inventory_locations(id)`. Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| reorder_point_quantity | numeric(18,4) | CHECK | CHECK(reorder_point_quantity >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(product_id) REFERENCES products(id)
UNIQUE(inventory_location_id, product_id, product_variant_id)
CHECK(reorder_point_quantity >= 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
