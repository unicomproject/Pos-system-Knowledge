<!-- title: Reservations, Stock Movements, Serial & Cost Allocation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 17. Reservations, Stock Movements, Serial & Cost Allocation

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `inventory_reservations` | Stores inventory reservations records for this module. |
| `inventory_reservation_lines` | Stores inventory reservation lines records for this module. |
| `inventory_reservation_allocations` | Stores inventory reservation allocations records for this module. |
| `stock_movements` | Stores stock movements records for this module. |
| `stock_movement_references` | Stores stock movement references records for this module. |
| `stock_movement_serials` | Stores stock movement serials records for this module. |
| `stock_movement_cost_allocations` | Stores stock movement cost allocations records for this module. |

## inventory_reservations

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores inventory reservations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| reservation_status | varchar(30) | CHECK | CHECK(reservation_status IN ('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED', 'CANCELLED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| reservation_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, reservation_number)
CHECK(reservation_status IN ('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED', 'CANCELLED'))
```

## inventory_reservation_lines

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores inventory reservation lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inventory_reservation_id | uuid | FK NOT UNIQUE | References `inventory_reservations(id)`. Unique business key. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT | References `products(id)`. |
| requested_quantity | numeric(18,4) | CHECK | CHECK(requested_quantity > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_reservation_id) REFERENCES inventory_reservations(id)
FK(product_id) REFERENCES products(id)
CHECK(requested_quantity > 0)
UNIQUE(inventory_reservation_id, line_number)
```

## inventory_reservation_allocations

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores inventory reservation allocations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| allocated_quantity | numeric(18,4) | CHECK | CHECK(allocated_quantity > 0) |
| inventory_balance_id | uuid | FK NOT | References `inventory_balances(id)`. |
| inventory_reservation_line_id | uuid | FK NOT | References `inventory_reservation_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_reservation_line_id) REFERENCES inventory_reservation_lines(id)
FK(inventory_balance_id) REFERENCES inventory_balances(id)
CHECK(allocated_quantity > 0)
```

## stock_movements

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores stock movements records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| movement_number | varchar(80) | UNIQUE | Unique business key. |
| movement_quantity | numeric(18,4) | CHECK | CHECK(movement_quantity <> 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, movement_number)
CHECK(movement_quantity <> 0)
```

## stock_movement_references

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores stock movement references records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| reference_type | varchar(40) | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| reference_id | uuid | UNIQUE | Unique business key. |
| stock_movement_id | uuid | FK NOT UNIQUE | References `stock_movements(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
UNIQUE(stock_movement_id, reference_type, reference_id)
```

## stock_movement_serials

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores stock movement serials records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| serial_number_id | uuid | FK NOT UNIQUE | References `serial_numbers(id)`. Unique business key. |
| stock_movement_id | uuid | FK NOT UNIQUE | References `stock_movements(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
FK(serial_number_id) REFERENCES serial_numbers(id)
UNIQUE(stock_movement_id, serial_number_id)
```

## stock_movement_cost_allocations

Module: Reservations, Stock Movements, Serial & Cost Allocation

Purpose: Stores stock movement cost allocations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| allocated_cost_amount | numeric(18,2) | CHECK | CHECK(allocated_cost_amount >= 0) |
| allocated_quantity | numeric(18,4) | CHECK | CHECK(allocated_quantity > 0) |
| inventory_cost_layer_id | uuid | FK NOT | References `inventory_cost_layers(id)`. |
| stock_movement_id | uuid | FK NOT | References `stock_movements(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_movement_id) REFERENCES stock_movements(id)
FK(inventory_cost_layer_id) REFERENCES inventory_cost_layers(id)
CHECK(allocated_quantity > 0)
CHECK(allocated_cost_amount >= 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
