<!-- title: 18. Stock Adjustment, Transfer & Stocktake -->
<!-- source: 18_Stock Adjustment, Transfer, Stocktake & Operational.png -->
<!-- status: ERD image aligned -->

# 18. Stock Adjustment, Transfer & Stocktake

Source of truth: `18_Stock Adjustment, Transfer, Stocktake & Operational.png`.

## Purpose

This module handles adjustment reasons/lines, stock transfers, transfer status history, stocktake sessions, stocktake lines and serial count results.

## Entity Tables

| Table | Purpose |
|---|---|
| `stock_adjustment_reasons` | Tenant stock adjustment reason catalog. |
| `stock_adjustment_lines` | Adjustment quantity lines by product/variant/batch. |
| `stock_transfers` | Stock transfer header between source and destination inventory locations. |
| `stock_transfer_lines` | Transfer requested/shipped/received/damaged/missing quantities. |
| `stock_transfer_status_history` | Transfer status change audit trail. |
| `stocktake_sessions` | Physical count/stocktake session header. |
| `stocktake_lines` | Expected/counted/variance quantities per product/variant/batch. |
| `stocktake_line_serials` | Serial scan result rows for stocktake lines. |

## External Reference Entities

`tenants`, `tenant_users`, `inventory_locations`, `products`, `product_variants`, `product_batches`, `serial_numbers`


## Notes

- The uploaded ERD image shows `stock_adjustment_lines.stock_adjustment_id` and `stocktake_sessions.generated_stock_adjustment_id` as FKs, but the `stock_adjustments` entity box is not visible in this image. I did not invent its attributes inside the updated MD.


## stock_adjustment_reasons

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `reason_code` | varchar(80) | NOT NULL UNIQUE | Tenant-unique reason code. |
| `reason_name` | varchar(150) | NOT NULL | Reason name. |
| `direction` | varchar(40) | NOT NULL | Adjustment direction. |
| `requires_manager_approval` | boolean | NOT NULL DEFAULT false | Whether approval is required. |
| `is_system_reason` | boolean | NOT NULL DEFAULT false | System-defined reason flag. |
| `status` | varchar(30) | NOT NULL CHECK | Lifecycle status. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, reason_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## stock_adjustment_lines

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_adjustment_id` | uuid | FK NOT NULL | References `stock_adjustments(id)`. Parent table is referenced by the image but its entity box is not visible in the uploaded image. |
| `line_number` | int | NOT NULL | Line number. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `product_batch_id` | uuid | FK NULL | References `product_batches(id)`. |
| `quantity_before` | numeric(18,4) | NOT NULL | Quantity before adjustment. |
| `quantity_change` | numeric(18,4) | NOT NULL | Signed adjustment quantity. |
| `quantity_after` | numeric(18,4) | NOT NULL | Quantity after adjustment. |
| `unit_cost` | numeric(18,4) | NULL | Unit cost. |
| `line_note` | text | NULL | Line note. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_adjustment_id) REFERENCES stock_adjustments(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_batch_id) REFERENCES product_batches(id)
UNIQUE(tenant_id, stock_adjustment_id, line_number)
UNIQUE NULLS NOT DISTINCT(tenant_id, stock_adjustment_id, product_id, product_variant_id, product_batch_id)
```

## stock_transfers

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `transfer_number` | varchar(80) | NOT NULL UNIQUE | Tenant-unique transfer number. |
| `source_location_id` | uuid | FK NOT NULL | References `inventory_locations(id)`. |
| `destination_location_id` | uuid | FK NOT NULL | References `inventory_locations(id)`. |
| `transfer_status` | varchar(40) | NOT NULL CHECK | Transfer status. |
| `requested_at` | timestamptz | NOT NULL | Requested timestamp. |
| `approved_at` | timestamptz | NULL | Approved timestamp. |
| `shipped_at` | timestamptz | NULL | Shipped timestamp. |
| `received_at` | timestamptz | NULL | Received timestamp. |
| `cancelled_at` | timestamptz | NULL | Cancelled timestamp. |
| `approved_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `shipped_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `received_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `cancelled_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `transfer_note` | text | NULL | Transfer note. |
| `cancellation_reason` | text | NULL | Cancellation reason. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(source_location_id) REFERENCES inventory_locations(id)
FK(destination_location_id) REFERENCES inventory_locations(id)
FK(approved_by_tenant_user_id) REFERENCES tenant_users(id)
FK(shipped_by_tenant_user_id) REFERENCES tenant_users(id)
FK(received_by_tenant_user_id) REFERENCES tenant_users(id)
FK(cancelled_by_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, transfer_number)
CHECK(source_location_id <> destination_location_id)
```

## stock_transfer_lines

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_transfer_id` | uuid | FK NOT NULL | References `stock_transfers(id)`. |
| `line_number` | int | NOT NULL | Line number. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `product_batch_id` | uuid | FK NULL | References `product_batches(id)`. |
| `requested_quantity` | numeric(18,4) | NOT NULL | Requested quantity. |
| `shipped_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 | Shipped quantity. |
| `received_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 | Received quantity. |
| `damaged_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 | Damaged quantity. |
| `missing_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 | Missing quantity. |
| `line_status` | varchar(40) | NOT NULL | Transfer line status. |
| `line_note` | text | NULL | Line note. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_transfer_id) REFERENCES stock_transfers(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_batch_id) REFERENCES product_batches(id)
UNIQUE(tenant_id, stock_transfer_id, line_number)
UNIQUE NULLS NOT DISTINCT(tenant_id, stock_transfer_id, product_id, product_variant_id, product_batch_id)
```

## stock_transfer_status_history

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stock_transfer_id` | uuid | FK NOT NULL | References `stock_transfers(id)`. |
| `sequence_number` | int | NOT NULL | Status sequence number. |
| `old_status` | varchar(40) | NULL | Old transfer status. |
| `new_status` | varchar(40) | NOT NULL | New transfer status. |
| `changed_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `changed_at` | timestamptz | NOT NULL | Status change timestamp. |
| `change_reason` | text | NULL | Reason/note for change. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stock_transfer_id) REFERENCES stock_transfers(id)
FK(changed_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, stock_transfer_id, sequence_number)
```

## stocktake_sessions

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stocktake_number` | varchar(80) | NOT NULL UNIQUE | Tenant-unique stocktake number. |
| `inventory_location_id` | uuid | FK NOT NULL | References `inventory_locations(id)`. |
| `stocktake_type` | varchar(40) | NOT NULL | Stocktake type. |
| `stocktake_status` | varchar(40) | NOT NULL | Stocktake status. |
| `is_blind_count` | boolean | NOT NULL DEFAULT false | Whether expected quantities are hidden during count. |
| `snapshot_at` | timestamptz | NOT NULL | Snapshot timestamp. |
| `started_at` | timestamptz | NULL | Started timestamp. |
| `completed_at` | timestamptz | NULL | Completed timestamp. |
| `posted_at` | timestamptz | NULL | Posted timestamp. |
| `started_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `completed_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `posted_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `generated_stock_adjustment_id` | uuid | FK NULL | References `stock_adjustments(id)`. |
| `notes` | text | NULL | Notes. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(inventory_location_id) REFERENCES inventory_locations(id)
FK(started_by_tenant_user_id) REFERENCES tenant_users(id)
FK(completed_by_tenant_user_id) REFERENCES tenant_users(id)
FK(posted_by_tenant_user_id) REFERENCES tenant_users(id)
FK(generated_stock_adjustment_id) REFERENCES stock_adjustments(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, stocktake_number)
```

## stocktake_lines

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stocktake_session_id` | uuid | FK NOT NULL | References `stocktake_sessions(id)`. |
| `line_number` | int | NOT NULL | Line number. |
| `product_id` | uuid | FK NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK NULL | References `product_variants(id)`. |
| `product_batch_id` | uuid | FK NULL | References `product_batches(id)`. |
| `expected_quantity` | numeric(18,4) | NOT NULL DEFAULT 0 | Expected quantity. |
| `counted_quantity` | numeric(18,4) | NULL | Counted quantity. |
| `variance_quantity` | numeric(18,4) | GENERATED / CACHED | Calculated from counted quantity minus expected quantity. |
| `counted_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `counted_at` | timestamptz | NULL | Count timestamp. |
| `line_status` | varchar(40) | NOT NULL | Stocktake line status. |
| `line_note` | text | NULL | Line note. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz | NOT NULL | Last update timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stocktake_session_id) REFERENCES stocktake_sessions(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(product_batch_id) REFERENCES product_batches(id)
FK(counted_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, stocktake_session_id, line_number)
UNIQUE NULLS NOT DISTINCT(tenant_id, stocktake_session_id, product_id, product_variant_id, product_batch_id)
```

## stocktake_line_serials

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| `id` | uuid | PK NOT NULL | Primary key. |
| `tenant_id` | uuid | FK NOT NULL | References `tenants(id)`. |
| `stocktake_line_id` | uuid | FK NOT NULL | References `stocktake_lines(id)`. |
| `serial_number_id` | uuid | FK NULL | References `serial_numbers(id)`. |
| `scanned_serial_number` | varchar(150) | NOT NULL | Scanned serial number text. |
| `count_result` | varchar(40) | NOT NULL | Serial count result. |
| `scanned_by_tenant_user_id` | uuid | FK NULL | References `tenant_users(id)`. |
| `scanned_at` | timestamptz | NOT NULL | Scan timestamp. |
| `created_at` | timestamptz | NOT NULL | Creation timestamp. |

### Constraints

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(stocktake_line_id) REFERENCES stocktake_lines(id)
FK(serial_number_id) REFERENCES serial_numbers(id)
FK(scanned_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, stocktake_line_id, scanned_serial_number)
```
