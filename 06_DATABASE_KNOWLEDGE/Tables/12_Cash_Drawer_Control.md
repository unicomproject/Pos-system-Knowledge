<!-- title: Cash Drawer Control -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Cash Drawer Control

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| cash_movement_types | Reference values for non-sale cash movements. | 4 |
| cash_movements | Non-sale cash movement within a till session. | 12 |
| cash_count_denominations | Denomination-level cash count for till close. | 7 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `cash_movement_types`

**Purpose:** Reference values for non-sale cash movements.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | smallint | PK | Primary key. |
| code | varchar(50) | NOT NULL UNIQUE | cash_in, cash_out, safe_drop, float_add, paid_out. |
| name | varchar(150) | NOT NULL | Display label. |
| direction | varchar(20) | NOT NULL CHECK | in, out. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `cash_movements`

**Purpose:** Non-sale cash movement within a till session.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| till_session_id | uuid | NOT NULL FK | References till_sessions(id). |
| cash_movement_type_id | smallint | NOT NULL FK | References cash_movement_types(id). |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Movement amount. |
| reason | text | NOT NULL | Business reason. |
| status | varchar(30) | NOT NULL CHECK | pending, approved, rejected, posted. |
| performed_by | uuid | NOT NULL FK | References users(id). |
| approved_by | uuid | NULL FK | References users(id). |
| source_device_id | uuid | NULL FK | References pos_devices(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `cash_count_denominations`

**Purpose:** Denomination-level cash count for till close.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| till_session_id | uuid | NOT NULL FK | References till_sessions(id). |
| denomination | numeric(12,2) | NOT NULL CHECK > 0 | Currency denomination. |
| quantity | int | NOT NULL CHECK >= 0 | Count. |
| amount | numeric(12,2) | NOT NULL CHECK >= 0 | denomination * quantity. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, till_session_id, denomination) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
