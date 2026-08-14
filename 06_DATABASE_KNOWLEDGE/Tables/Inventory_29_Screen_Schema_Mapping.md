<!-- title: Inventory 29-Screen Schema Mapping -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Inventory 29-Screen Schema Mapping

**DATABASE MAPPING CONTRACT: LOCKED.** Schema/architecture contract only. Do not create EF Core migrations in this lock.

## Contract lock

```text
Inventory Contract Version: v1.0
Status: LOCKED
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

Reuse existing tables first. Document required headers that the ERD already references but does not fully specify. **No EF migrations in this audit.**

## Mapping

| Business concept | Existing / specified table | Status | Gap |
|---|---|---|---|
| Stock-holding location | `inventory_locations` | READY | Map UI outlet/warehouse to this table |
| Tracking flags | `product_inventory_settings` | READY | |
| On-hand / reserved / available | `inventory_balances` | READY | Authoritative current qty |
| Channel promise limits | `inventory_channel_allocations` | READY | Model B |
| Serial identity | `serial_numbers` | READY | Unique (tenant, product, serial) |
| Batch / expiry | `product_batches` | READY | |
| Ledger | `stock_movements` | READY | Append-only; `idempotency_key` exists |
| Movement links | `stock_movement_references` | READY | |
| Movement serials | `stock_movement_serials` | READY | |
| Cost layers | `inventory_cost_layers` | READY | Opening/receiving unit cost |
| Adjustment reasons | `stock_adjustment_reasons` | READY | Configurable catalog |
| Adjustment lines | `stock_adjustment_lines` | READY | FK to header |
| Adjustment header | `stock_adjustments` | **DOCUMENTATION GAP — specified below** | ERD references it; attributes were missing |
| Opening document | `stock_opening_entries` | **DOCUMENTATION GAP — specified below** | No table in ERD; required for draft/post/duplicate rule |
| Receiving document | `stock_receipts` + `stock_receipt_lines` | **DOCUMENTATION GAP — specified below** | No goods-receipt header in ERD |
| Transfer / stocktake | `stock_transfers*`, `stocktake_*` | DEFERRED | Out of 29-screen scope |
| Reservations | `inventory_reservations*` | DEFERRED for TA UI | POS/order owned |
| Reorder | `inventory_reorder_rules` | DEFERRED | |

## Specified missing headers (documentation only)

These are canonical attributes for a future migration. They are not created in this phase.

### `stock_adjustments`

| Attribute | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| adjustment_number | varchar(80) | Tenant unique (e.g. ADJ-…) |
| inventory_location_id | uuid FK | |
| stock_adjustment_reason_id | uuid FK | |
| status | varchar(30) | `DRAFT`, `POSTED` |
| adjustment_date | date | |
| notes | text NULL | |
| idempotency_key | varchar(150) NULL | Unique per tenant when set |
| posted_at | timestamptz NULL | |
| posted_by_tenant_user_id | uuid NULL | |
| row_version | bigint | |
| created/updated audit columns | | |

### `stock_opening_entries`

| Attribute | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| reference_number | varchar(80) | Tenant unique (e.g. OS-…) |
| inventory_location_id | uuid FK | |
| product_id | uuid FK | |
| product_variant_id | uuid NULL | |
| quantity | numeric(18,4) | > 0 |
| unit_cost | numeric(18,4) | >= 0 |
| opening_date | date | |
| notes | text NULL | |
| product_batch_id | uuid NULL | |
| status | varchar(30) | `DRAFT`, `POSTED` |
| idempotency_key | varchar(150) NULL | |
| posted_at / posted_by | | |
| Unique POSTED | | UNIQUE (tenant, location, product) WHERE variant NULL AND status POSTED; UNIQUE (tenant, location, variant) WHERE variant NOT NULL AND status POSTED |

### `stock_receipts`

| Attribute | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| receipt_number | varchar(80) | Tenant unique (e.g. RCV-…) |
| inventory_location_id | uuid FK | |
| receipt_mode | varchar(40) | `PURCHASE_RECEIPT` |
| supplier_name | varchar(200) | Required; not full supplier master |
| supplier_product_id | uuid NULL | Optional FK |
| invoice_number | varchar(80) | |
| purchase_order_number | varchar(80) NULL | |
| received_date | date | |
| notes | text NULL | |
| status | varchar(30) | `DRAFT`, `POSTED` |
| idempotency_key | varchar(150) NULL | |
| posted_at / posted_by | | |

### `stock_receipt_lines`

| Attribute | Type | Notes |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| stock_receipt_id | uuid FK | |
| line_number | int | |
| product_id / product_variant_id | | |
| quantity | numeric(18,4) > 0 | |
| unit_cost | numeric(18,4) | |
| product_batch_id | uuid NULL | |

`stock_movement_references.reference_type` values for this release: `OPENING_STOCK`, `STOCK_RECEIPT`, `STOCK_ADJUSTMENT`.

## Ledger vs balance

- Authoritative current stock: `inventory_balances`
- Authoritative history: `stock_movements` (append-only)
- Channel limits are not ledger movements
