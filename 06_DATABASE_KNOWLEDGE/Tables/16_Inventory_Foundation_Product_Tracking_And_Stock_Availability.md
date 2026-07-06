<!-- title: 16. Inventory Foundation, Product Tracking & Stock Availability -->
<!-- source: 16_Inventory Foundation, Product Tracking & Stock.png -->
<!-- status: ERD image aligned -->

# 16. Inventory Foundation, Product Tracking & Stock Availability

Source of truth: `16_Inventory Foundation, Product Tracking & Stock.png`.

## Purpose

This module defines inventory locations, product tracking settings, batch/serial tracking, stock balances, channel allocations, cost layers and reorder rules.

## Entity Tables

| Table | Purpose |
|---|---|
| `inventory_locations` | Outlet inventory storage/stock locations with parent-child hierarchy. |
| `product_inventory_settings` | Product or variant inventory tracking setup. |
| `product_batches` | Product or variant batch identity and expiry metadata. |
| `inventory_balances` | Current on-hand/reserved/damaged/quarantine quantities. |
| `inventory_channel_allocations` | Optional sales-channel stock allocation rules. |
| `serial_numbers` | Serialized item identity and current balance tracking. |
| `inventory_cost_layers` | Cost layer records for costing and allocation. |
| `inventory_reorder_rules` | Reorder point/quantity and supplier reorder setup. |

## External Reference Entities

`tenants`, `tenant_users`, `outlets`, `products`, `product_variants`, `unit_of_measures`, `sales_channels`, `supplier_products`, `stock_movements`


## inventory_locations

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `outlet_id` | uuid | FK NOT NULL | References `outlets(id)`. One outlet can have many inventory locations. |
| `parent_inventory_location_id` | uuid | FK NULL | Self reference to `inventory_locations(id)` for nested storage/location hierarchy. |
| `location_code` | varchar(80) | NOT NULL | Tenant/outlet unique location code. |
| `location_name` | varchar(150) | NOT NULL | Display name. |
| `location_type` | varchar(40) | NOT NULL | Inventory location type. Allowed values must be enforced using CHECK/backend constants. |
| `is_sellable_location` | boolean | NOT NULL DEFAULT true | Whether stock from this location can be sold. |
| `is_return_location` | boolean | NOT NULL DEFAULT false | Whether returns can be received here. |
| `is_receiving_location` | boolean | NOT NULL DEFAULT false | Whether supplier/transfer receiving is allowed here. |
| `is_quarantine_location` | boolean | NOT NULL DEFAULT false | Whether this is a quarantine/non-sellable location. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(parent_inventory_location_id) REFERENCES inventory_locations(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, outlet_id, location_code)
UNIQUE(tenant_id, id)
CHECK(parent_inventory_location_id IS NULL OR parent_inventory_location_id <> id)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_inventory_settings

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. NULL means product-level settings. |
| `inventory_uom_id` | uuid | FK NOT NULL | References `unit_of_measures(id)`. |
| `is_stock_tracked` | boolean | NOT NULL DEFAULT true | Whether inventory is tracked for this product/variant. |
| `allow_negative_stock` | boolean | NOT NULL DEFAULT false | Whether sales can reduce stock below zero. |
| `requires_batch_tracking` | boolean | NOT NULL DEFAULT false | Whether batch tracking is required. |
| `requires_expiry_tracking` | boolean | NOT NULL DEFAULT false | Whether expiry tracking is required. |
| `requires_serial_tracking` | boolean | NOT NULL DEFAULT false | Whether serial tracking is required. |
| `costing_method` | varchar(40) | NOT NULL | Costing method. Allowed values must be enforced using CHECK/backend constants. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(inventory_uom_id) REFERENCES unit_of_measures(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_variant_id) WHERE product_variant_id IS NOT NULL
CHECK(requires_expiry_tracking = false OR requires_batch_tracking = true)
CHECK(requires_batch_tracking = false OR is_stock_tracked = true)
CHECK(requires_serial_tracking = false OR is_stock_tracked = true)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## product_batches

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. NULL means batch belongs to base product. |
| `batch_number` | varchar(100) | NOT NULL | Tenant/product scoped batch number. |
| `supplier_batch_number` | varchar(100) | NULL | Supplier/manufacturer batch reference. |
| `manufactured_at` | date | NULL | Manufacture date. |
| `expiry_date` | date | NULL CHECK | Expiry date. |
| `first_received_at` | timestamptz | NULL | First time this batch was received. |
| `status` | varchar(40) | NOT NULL CHECK | Batch lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, batch_number) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, product_id, product_variant_id, batch_number) WHERE product_variant_id IS NOT NULL
CHECK(expiry_date IS NULL OR manufactured_at IS NULL OR expiry_date >= manufactured_at)
```

## inventory_balances

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `inventory_location_id` | uuid | FK NOT NULL | References `inventory_locations(id)`. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `product_batch_id` | uuid | FK NULL | References `product_batches(id)`. |
| `on_hand_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Physical quantity on hand. |
| `reserved_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Quantity reserved for orders. |
| `damaged_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Damaged quantity. |
| `quarantine_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Quarantine quantity. |
| `available_quantity` | numeric(18,4) | GENERATED / CACHED | Calculated as on hand minus reserved, damaged and quarantine quantities. |
| `row_version` | bigint | NOT NULL DEFAULT 0 CHECK | Optimistic concurrency version. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_batch_id) REFERENCES product_batches(id)
UNIQUE NULLS NOT DISTINCT(tenant_id, inventory_location_id, product_id, product_variant_id, product_batch_id)
CHECK(on_hand_quantity >= 0)
CHECK(reserved_quantity >= 0)
CHECK(damaged_quantity >= 0)
CHECK(quarantine_quantity >= 0)
CHECK(row_version >= 0)
available_quantity = on_hand_quantity - reserved_quantity - damaged_quantity - quarantine_quantity
```

## inventory_channel_allocations

| Attribute                   | Type          | Key / Constraint         | Reference / Note                            |
| --------------------------- | ------------- | ------------------------ | ------------------------------------------- |
| `id`                        | uuid          | PK NOT NULL              | Primary key.                                |
| `tenant_id`                 | uuid          | FK NOT NULL              | References `tenants(id)`.                   |
| `inventory_location_id`     | uuid          | FK NOT NULL              | References `inventory_locations(id)`.       |
| `product_id`                | uuid          | FK NOT NULL              | References `products(id)`.                  |
| `product_variant_id`        | uuid          | FK NULL                  | References `product_variants(id)`.          |
| `sales_channel_id`          | uuid          | FK NOT NULL              | References `sales_channels(id)`.            |
| `allocation_limit_quantity` | numeric(18,4) | NOT NULL CHECK           | Maximum quantity allocated to this channel. |
| `safety_stock_quantity`     | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Safety stock kept aside.                    |
| `is_enabled`                | boolean       | NOT NULL DEFAULT true    | Whether allocation is active.               |
| `status`                    | varchar(30)   | NOT NULL CHECK           | Lifecycle status.                           |
| `created_at`                | timestamptz   | NOT NULL                 | Creation timestamp.                         |
| `created_by_tenant_user_id` | uuid          | FK NULL                  | References `tenant_users(id)`.              |
| `updated_at`                | timestamptz   | NOT NULL                 | Last update timestamp.                      |
| `updated_by_tenant_user_id` | uuid          | FK NULL                  | References `tenant_users(id)`.              |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, inventory_location_id, product_id, sales_channel_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, inventory_location_id, product_variant_id, sales_channel_id) WHERE product_variant_id IS NOT NULL
CHECK(allocation_limit_quantity >= 0)
CHECK(safety_stock_quantity >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## serial_numbers

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `product_batch_id` | uuid | FK NULL | References `product_batches(id)`. |
| `current_inventory_balance_id` | uuid | FK NULL | References `inventory_balances(id)`. |
| `serial_number` | varchar(150) | NOT NULL | Serial number value. |
| `serial_status` | varchar(40) | NOT NULL CHECK | Serial lifecycle/status. |
| `received_at` | timestamptz | NULL | Received timestamp. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_batch_id) REFERENCES product_batches(id)
FK(current_inventory_balance_id) REFERENCES inventory_balances(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, product_id, serial_number)
UNIQUE(tenant_id, id)
```

## inventory_cost_layers

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `inventory_balance_id` | uuid | FK NOT NULL | References `inventory_balances(id)`. |
| `source_stock_movement_id` | uuid | FK NOT NULL | References `stock_movements(id)`. |
| `received_quantity` | numeric(18,4) | NOT NULL CHECK | Quantity received into this layer. |
| `remaining_quantity` | numeric(18,4) | NOT NULL CHECK | Remaining quantity in this layer. |
| `unit_cost` | numeric(18,4) | NOT NULL CHECK | Unit cost. |
| `total_cost` | numeric(18,4) | NOT NULL CHECK | Total layer cost. |
| `received_at` | timestamptz | NOT NULL | Received timestamp. |
| `status` | varchar(40) | NOT NULL CHECK | Cost layer status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_balance_id) REFERENCES inventory_balances(id)
FK(source_stock_movement_id) REFERENCES stock_movements(id)
CHECK(received_quantity > 0)
CHECK(remaining_quantity >= 0)
CHECK(remaining_quantity <= received_quantity)
CHECK(unit_cost >= 0)
CHECK(total_cost >= 0)
total_cost = received_quantity * unit_cost
```

## inventory_reorder_rules

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `inventory_location_id` | uuid | FK NOT NULL | References `inventory_locations(id)`. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `reorder_method` | varchar(40) | NOT NULL | Reorder calculation method. |
| `reorder_point_quantity` | numeric(18,4) | NOT NULL CHECK | Reorder point. |
| `reorder_quantity` | numeric(18,4) | NULL CHECK | Quantity to reorder. |
| `min_stock_quantity` | numeric(18,4) | NULL CHECK | Minimum stock quantity. |
| `max_stock_quantity` | numeric(18,4) | NULL CHECK | Maximum stock quantity. |
| `safety_stock_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Safety stock quantity. |
| `lead_time_days` | int | NULL CHECK | Supplier lead time in days. |
| `supplier_product_id` | uuid | FK NULL | References `supplier_products(id)`. |
| `is_auto_reorder` | boolean | NOT NULL DEFAULT false | Whether system can create reorder automatically. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(supplier_product_id) REFERENCES supplier_products(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, inventory_location_id, product_id) WHERE product_variant_id IS NULL
UNIQUE(tenant_id, inventory_location_id, product_variant_id) WHERE product_variant_id IS NOT NULL
CHECK(reorder_point_quantity >= 0)
CHECK(reorder_quantity > 0)
CHECK(safety_stock_quantity >= 0)
CHECK(max_stock_quantity IS NULL OR min_stock_quantity IS NULL OR max_stock_quantity >= min_stock_quantity)
CHECK(lead_time_days IS NULL OR lead_time_days >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```
