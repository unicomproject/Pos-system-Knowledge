<!-- title: Stock Adjustment, Transfer & Stocktake -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 18. Stock Adjustment, Transfer & Stocktake

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `stock_adjustment_reasons` | Stores stock adjustment reasons records for this module. |
| `stock_adjustments` | Stores stock adjustments records for this module. |
| `stock_adjustment_lines` | Stores stock adjustment lines records for this module. |
| `stock_transfers` | Stores stock transfers records for this module. |
| `stock_transfer_lines` | Stores stock transfer lines records for this module. |
| `stock_transfer_status_history` | Stores stock transfer status history records for this module. |
| `stocktake_sessions` | Stores stocktake sessions records for this module. |
| `stocktake_lines` | Stores stocktake lines records for this module. |
| `stocktake_line_serials` | Stores stocktake line serials records for this module. |

## stock_adjustment_reasons

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock adjustment reasons records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| reason_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, reason_code)
```

## stock_adjustments

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock adjustments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| adjustment_number | varchar(80) | UNIQUE | Unique business key. |
| adjustment_status | varchar(30) | CHECK | CHECK(adjustment_status IN ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED')) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, adjustment_number)
CHECK(adjustment_status IN ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED'))
```

## stock_adjustment_lines

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock adjustment lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| adjustment_quantity | numeric(18,4) | CHECK | CHECK(adjustment_quantity <> 0) |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT | References `products(id)`. |
| stock_adjustment_id | uuid | FK NOT UNIQUE | References `stock_adjustments(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_adjustment_id) REFERENCES stock_adjustments(id)
FK(product_id) REFERENCES products(id)
CHECK(adjustment_quantity <> 0)
UNIQUE(stock_adjustment_id, line_number)
```

## stock_transfers

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock transfers records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| destination_inventory_location_id | uuid | FK NOT | References `inventory_locations(id)`. |
| source_inventory_location_id | uuid | FK NOT CHECK | References `inventory_locations(id)`. CHECK(source_inventory_location_id <> destination_inventory_location_id) |
| transfer_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(source_inventory_location_id) REFERENCES inventory_locations(id)
FK(destination_inventory_location_id) REFERENCES inventory_locations(id)
UNIQUE(tenant_id, transfer_number)
CHECK(source_inventory_location_id <> destination_inventory_location_id)
```

## stock_transfer_lines

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock transfer lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT | References `products(id)`. |
| requested_quantity | numeric(18,4) | CHECK | CHECK(requested_quantity > 0) |
| stock_transfer_id | uuid | FK NOT UNIQUE | References `stock_transfers(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_transfer_id) REFERENCES stock_transfers(id)
FK(product_id) REFERENCES products(id)
CHECK(requested_quantity > 0)
UNIQUE(stock_transfer_id, line_number)
```

## stock_transfer_status_history

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stock transfer status history records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |
| stock_transfer_id | uuid | FK NOT UNIQUE | References `stock_transfers(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stock_transfer_id) REFERENCES stock_transfers(id)
CHECK(sequence_number > 0)
UNIQUE(stock_transfer_id, sequence_number)
```

## stocktake_sessions

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stocktake sessions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inventory_location_id | uuid | FK NOT | References `inventory_locations(id)`. |
| stocktake_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
UNIQUE(tenant_id, stocktake_number)
```

## stocktake_lines

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stocktake lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| product_batch_id | uuid | UNIQUE | Unique business key. |
| product_id | uuid | FK NOT UNIQUE | References `products(id)`. Unique business key. |
| product_variant_id | uuid | UNIQUE | Unique business key. |
| stocktake_session_id | uuid | FK NOT UNIQUE | References `stocktake_sessions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stocktake_session_id) REFERENCES stocktake_sessions(id)
FK(product_id) REFERENCES products(id)
UNIQUE(stocktake_session_id, product_id, product_variant_id, product_batch_id)
```

## stocktake_line_serials

Module: Stock Adjustment, Transfer & Stocktake

Purpose: Stores stocktake line serials records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| serial_number_id | uuid | FK NOT UNIQUE | References `serial_numbers(id)`. Unique business key. |
| stocktake_line_id | uuid | FK NOT UNIQUE | References `stocktake_lines(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(stocktake_line_id) REFERENCES stocktake_lines(id)
FK(serial_number_id) REFERENCES serial_numbers(id)
UNIQUE(stocktake_line_id, serial_number_id)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
