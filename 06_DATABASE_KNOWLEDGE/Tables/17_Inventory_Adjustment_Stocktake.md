<!-- title: Inventory Adjustment Stocktake -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Inventory Adjustment Stocktake

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| stock_adjustments | Manual inventory adjustment document. | 11 |
| stock_adjustment_lines | Manual adjustment lines. | 8 |
| stocktakes | Stock count session header. | 9 |
| stocktake_lines | Count results by variant. | 7 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `stock_adjustments`

**Purpose:** Manual inventory adjustment document.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| adjustment_number | varchar(80) | NOT NULL | Business number. |
| status | varchar(30) | NOT NULL CHECK | draft, approved, posted, rejected, cancelled. |
| reason | text | NOT NULL | Reason. |
| created_by | uuid | NOT NULL FK | References users(id). |
| approved_by | uuid | NULL FK | References users(id). |
| posted_at | timestamptz | NULL | Post time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, adjustment_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `stock_adjustment_lines`

**Purpose:** Manual adjustment lines.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| stock_adjustment_id | uuid | NOT NULL FK | References stock_adjustments(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| line_no | int | NOT NULL | Line number. |
| adjustment_type | varchar(20) | NOT NULL CHECK | increase, decrease. |
| qty | numeric(14,3) | NOT NULL CHECK > 0 | Quantity. |
| reason | text | NULL | Line reason. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, stock_adjustment_id, line_no) |

### Design Notes

- No explicit design note was provided.


## Entity: `stocktakes`

**Purpose:** Stock count session header.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| stocktake_number | varchar(80) | NOT NULL | Business number. |
| status | varchar(30) | NOT NULL CHECK | draft, counting, posted, cancelled. |
| counted_at | timestamptz | NULL | Count time. |
| posted_at | timestamptz | NULL | Post time. |
| created_by | uuid | NOT NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, stocktake_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `stocktake_lines`

**Purpose:** Count results by variant.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| stocktake_id | uuid | NOT NULL FK | References stocktakes(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| expected_qty | numeric(14,3) | NOT NULL | System quantity. |
| counted_qty | numeric(14,3) | NOT NULL | Physical count. |
| delta_qty | numeric(14,3) | NOT NULL | counted_qty - expected_qty. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, stocktake_id, variant_id) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
