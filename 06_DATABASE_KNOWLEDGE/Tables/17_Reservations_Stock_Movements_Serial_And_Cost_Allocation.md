<!-- title: 17. Reservations, Stock Movements, Serial & Cost Allocation -->
<!-- source: 17_Reservations, Stock Movements, Serial & Cost Allocation.png -->
<!-- status: ERD image aligned -->

# 17. Reservations, Stock Movements, Serial & Cost Allocation

Source of truth: `17_Reservations, Stock Movements, Serial & Cost Allocation.png`.

## Purpose

This module tracks inventory reservations, allocation to stock balances/serials, immutable stock movements, references, serials and cost allocations.

## Entity Tables

| Table | Purpose |
|---|---|
| `inventory_reservations` | Reservation header for demand from orders/channels/customers. |
| `inventory_reservation_lines` | Reservation lines by product/variant. |
| `inventory_reservation_allocations` | Reservation allocation to inventory balance and optional serial. |
| `stock_movements` | Append-only immutable stock ledger movement. |
| `stock_movement_references` | Links a stock movement to source business documents. |
| `stock_movement_serials` | Serial numbers included in a stock movement. |
| `stock_movement_cost_allocations` | Cost layer allocation per stock movement. |

## External Reference Entities

`tenants`, `tenant_users`, `customers`, `sales_channels`, `outlets`, `products`, `product_variants`, `inventory_balances`, `serial_numbers`, `inventory_cost_layers`


## inventory_reservations

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `reservation_number` | varchar(80) | NOT NULL UNIQUE | Tenant-unique reservation number. |
| `reservation_source` | varchar(40) | NOT NULL | Reservation source. |
| `source_reference_id` | uuid | NULL | Source document ID. |
| `source_reference_number` | varchar(100) | NULL | Source document number. |
| `sales_channel_id` | uuid | FK NULL | References `sales_channels(id)`. |
| `fulfillment_outlet_id` | uuid | FK NULL | References `outlets(id)`. |
| `customer_id` | uuid | FK NULL | References `customers(id)`. |
| `reservation_status` | varchar(40) | NOT NULL CHECK | Reservation status. |
| `reserved_at` | timestamptz | NOT NULL | Reservation timestamp. |
| `expires_at` | timestamptz | NULL CHECK | Expiry timestamp. |
| `released_at` | timestamptz | NULL CHECK | Release timestamp. |
| `release_reason` | varchar(250) | NULL | Release reason. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(fulfillment_outlet_id) REFERENCES outlets(id)
FK(customer_id) REFERENCES customers(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, reservation_number)
CHECK(expires_at IS NULL OR expires_at >= reserved_at)
CHECK(released_at IS NULL OR released_at >= reserved_at)
```

## inventory_reservation_lines

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `inventory_reservation_id` | uuid | FK NOT NULL | References `inventory_reservations(id)`. |
| `line_number` | int | NOT NULL CHECK | Line sequence number. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `requested_quantity` | numeric(18,4) | NOT NULL CHECK | Requested quantity. |
| `reserved_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Reserved quantity. |
| `released_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Released quantity. |
| `fulfilled_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Fulfilled quantity. |
| `line_status` | varchar(40) | NOT NULL CHECK | Reservation line status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_reservation_id) REFERENCES inventory_reservations(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(tenant_id, inventory_reservation_id, line_number)
CHECK(line_number > 0)
CHECK(requested_quantity > 0)
CHECK(reserved_quantity >= 0)
CHECK(released_quantity >= 0)
CHECK(fulfilled_quantity >= 0)
CHECK(reserved_quantity <= requested_quantity)
CHECK(released_quantity + fulfilled_quantity <= reserved_quantity)
```

## inventory_reservation_allocations

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `inventory_reservation_line_id` | uuid | FK NOT NULL | References `inventory_reservation_lines(id)`. |
| `inventory_balance_id` | uuid | FK NOT NULL | References `inventory_balances(id)`. |
| `serial_number_id` | uuid | FK NULL | References `serial_numbers(id)`. |
| `allocated_quantity` | numeric(18,4) | NOT NULL CHECK | Allocated quantity. |
| `released_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Released quantity. |
| `fulfilled_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 CHECK | Fulfilled quantity. |
| `allocation_status` | varchar(40) | NOT NULL CHECK | Reservation allocation status. |
| `allocated_at` | timestamptz | NOT NULL | Allocation timestamp. |
| `released_at` | timestamptz | NULL | Release timestamp. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_reservation_line_id) REFERENCES inventory_reservation_lines(id)
FK(inventory_balance_id) REFERENCES inventory_balances(id)
FK(serial_number_id) REFERENCES serial_numbers(id)
UNIQUE(tenant_id, inventory_reservation_line_id, inventory_balance_id) WHERE serial_number_id IS NULL
UNIQUE(tenant_id, inventory_reservation_line_id, serial_number_id) WHERE serial_number_id IS NOT NULL
CHECK(allocated_quantity > 0)
CHECK(released_quantity >= 0)
CHECK(fulfilled_quantity >= 0)
CHECK(released_quantity + fulfilled_quantity <= allocated_quantity)
CHECK(released_at IS NULL OR released_at >= allocated_at)
Rule: if serial_number_id is not null, allocated_quantity = 1
```

## stock_movements

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `movement_number` | varchar(80) | NOT NULL UNIQUE | Tenant-unique movement number. |
| `inventory_balance_id` | uuid | FK NOT NULL | References `inventory_balances(id)`. |
| `movement_type` | varchar(40) | NOT NULL | Stock movement type. |
| `quantity_before` | numeric(18,4) | NOT NULL CHECK | Quantity before movement. |
| `quantity_change` | numeric(18,4) | NOT NULL CHECK | Signed quantity change. |
| `quantity_after` | numeric(18,4) | NOT NULL CHECK | Quantity after movement. |
| `unit_cost` | numeric(18,4) | NULL CHECK | Unit cost. |
| `total_cost` | numeric(18,4) | NULL CHECK | Total cost. |
| `idempotency_key` | varchar(150) | NULL UNIQUE | Idempotency key for duplicate prevention. |
| `movement_note` | text | NULL | Movement note. |
| `occurred_at` | timestamptz | NOT NULL | Business occurrence timestamp. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_balance_id) REFERENCES inventory_balances(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, movement_number)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
CHECK(quantity_change <> 0)
CHECK(quantity_after = quantity_before + quantity_change)
CHECK(unit_cost IS NULL OR unit_cost >= 0)
CHECK(total_cost IS NULL OR total_cost >= 0)
APPEND ONLY
```

## stock_movement_references

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_movement_id` | uuid | FK NOT NULL | References `stock_movements(id)`. |
| `reference_type` | varchar(40) | NOT NULL | Business reference type. |
| `reference_id` | uuid | NOT NULL | Business document ID. |
| `reference_line_id` | uuid | NULL | Business document line ID. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
UNIQUE NULLS NOT DISTINCT(tenant_id, stock_movement_id, reference_type, reference_id, reference_line_id)
```

## stock_movement_serials

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_movement_id` | uuid | FK NOT NULL | References `stock_movements(id)`. |
| `serial_number_id` | uuid | FK NOT NULL | References `serial_numbers(id)`. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
FK(serial_number_id) REFERENCES serial_numbers(id)
UNIQUE(tenant_id, stock_movement_id, serial_number_id)
Rule: serialized movement linked serial count = ABS(stock_movements.quantity_change)
```

## stock_movement_cost_allocations

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_movement_id` | uuid | FK NOT NULL | References `stock_movements(id)`. |
| `inventory_cost_layer_id` | uuid | FK NOT NULL | References `inventory_cost_layers(id)`. |
| `allocated_quantity` | numeric(18,4) | NOT NULL CHECK | Allocated quantity from cost layer. |
| `unit_cost` | numeric(18,4) | NOT NULL CHECK | Unit cost. |
| `total_cost` | numeric(18,4) | NOT NULL CHECK | Total allocated cost. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
FK(inventory_cost_layer_id) REFERENCES inventory_cost_layers(id)
UNIQUE(tenant_id, stock_movement_id, inventory_cost_layer_id)
CHECK(allocated_quantity > 0)
CHECK(unit_cost >= 0)
CHECK(total_cost >= 0)
Calculation: total_cost = allocated_quantity * unit_cost
```
