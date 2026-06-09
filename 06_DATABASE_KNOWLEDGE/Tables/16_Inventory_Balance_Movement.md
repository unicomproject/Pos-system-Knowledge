<!-- title: Inventory Balance Movement -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Inventory Balance Movement

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| inventory_balances | Current stock projection by outlet and variant. | 9 |
| stock_movement_types | Reference movement types. Quantity is always positive; direction controls effect. | 4 |
| stock_movements | Immutable inventory ledger. | 16 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `inventory_balances`

**Purpose:** Current stock projection by outlet and variant.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| on_hand_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Physical stock. |
| reserved_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Reserved stock. |
| available_qty | numeric(14,3) | GENERATED | on_hand_qty - reserved_qty. |
| reorder_level | numeric(14,3) | NULL | Low stock threshold. |
| updated_at | timestamptz | NOT NULL | Last update. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, variant_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `stock_movement_types`

**Purpose:** Reference movement types. Quantity is always positive; direction controls effect.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | smallint | PK | Primary key. |
| code | varchar(60) | NOT NULL UNIQUE | opening_balance, sale_out, return_in, exchange_out, exchange_in, adjustment_in, adjustment_out, stocktake_gain, stocktake_loss, damage_out. |
| direction | varchar(20) | NOT NULL CHECK | in, out, neutral. |
| name | varchar(150) | NOT NULL | Display label. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `stock_movements`

**Purpose:** Immutable inventory ledger.

**Source module:** Inventory, Stock and Expiry Control

**Data dictionary section:** `5.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| movement_type_id | smallint | NOT NULL FK | References stock_movement_types(id). |
| quantity | numeric(14,3) | NOT NULL CHECK > 0 | Positive quantity. |
| sale_id | uuid | NULL FK | References sales(id). |
| return_id | uuid | NULL FK | References returns(id). |
| exchange_id | uuid | NULL FK | References exchanges(id). |
| stock_adjustment_id | uuid | NULL FK | References stock_adjustments(id). |
| stocktake_id | uuid | NULL FK | References stocktakes(id). |
| source_channel | varchar(20) | NOT NULL CHECK | pos, portable_pos, backoffice. |
| source_device_id | uuid | NULL FK | References pos_devices(id). |
| occurred_at | timestamptz | NOT NULL | Ledger time. |
| created_by | uuid | NULL FK | References users(id). |
| metadata | jsonb | NULL | Extra metadata. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Append-only. Never store negative quantity.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
