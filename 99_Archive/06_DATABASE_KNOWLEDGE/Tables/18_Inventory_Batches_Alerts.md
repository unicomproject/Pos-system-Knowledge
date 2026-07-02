<!-- title: Inventory Batches Alerts -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Inventory Batches Alerts

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| product_batches | Product batch/lot records for expiry and batch selling. | 14 |
| inventory_batch_stocks | Outlet stock balance by product batch. | 13 |
| inventory_alerts | Low stock, near-expiry and expiry alerts. | 14 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `product_batches`

**Purpose:** Product batch/lot records for expiry and batch selling.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| product_id | uuid | NOT NULL FK | References products(id). |
| variant_id | uuid | NULL FK | References product_variants(id). |
| batch_no | varchar(120) | NULL | Batch/lot number. |
| barcode | varchar(120) | NULL | Batch barcode. |
| manufactured_date | date | NULL | Manufactured date. |
| expiry_date | date | NULL | Expiry date. |
| received_date | date | NULL | Received date. |
| cost_price | numeric(12,4) | NULL | Cost price. |
| selling_price_override | numeric(12,2) | NULL | Batch price override. |
| status | varchar(30) | NOT NULL CHECK | active, near_expiry, expired, recalled, sold_out. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, product_id, variant_id, batch_no) WHERE batch_no IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `inventory_batch_stocks`

**Purpose:** Outlet stock balance by product batch.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| product_id | uuid | NOT NULL FK | References products(id). |
| variant_id | uuid | NULL FK | References product_variants(id). |
| batch_id | uuid | NOT NULL FK | References product_batches(id). |
| qty_available | numeric(14,3) | NOT NULL DEFAULT 0 | Available quantity. |
| qty_reserved | numeric(14,3) | NOT NULL DEFAULT 0 | Reserved quantity. |
| qty_damaged | numeric(14,3) | NOT NULL DEFAULT 0 | Damaged quantity. |
| qty_expired | numeric(14,3) | NOT NULL DEFAULT 0 | Expired quantity. |
| last_counted_at | timestamptz | NULL | Last count time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, product_id, variant_id, batch_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `inventory_alerts`

**Purpose:** Low stock, near-expiry and expiry alerts.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| product_id | uuid | NULL FK | References products(id). |
| variant_id | uuid | NULL FK | References product_variants(id). |
| batch_id | uuid | NULL FK | References product_batches(id). |
| alert_type | varchar(40) | NOT NULL CHECK | low_stock, near_expiry, expired, overstock. |
| severity | varchar(20) | NOT NULL CHECK | low, medium, high, critical. |
| message | text | NOT NULL | Alert message. |
| status | varchar(30) | NOT NULL CHECK | open, acknowledged, resolved, ignored. |
| triggered_at | timestamptz | NOT NULL | Trigger time. |
| acknowledged_by | uuid | NULL FK | References users(id). |
| resolved_at | timestamptz | NULL | Resolution time. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
