<!-- title: Sales Core -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Sales Core

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| sales | POS sale header for fixed and portable POS. | 27 |
| sale_lines | POS sale line items. | 15 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `sales`

**Purpose:** POS sale header for fixed and portable POS.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_session_id | uuid | NOT NULL FK | References till_sessions(id). |
| sale_number | varchar(80) | NOT NULL | Business sale number. |
| sales_channel | varchar(30) | NOT NULL CHECK | fixed_pos, portable_pos. |
| business_date | date | NOT NULL | Operational date. |
| customer_id | uuid | NULL FK | References customers(id). |
| status | varchar(30) | NOT NULL CHECK | draft, held, completed, voided, cancelled. |
| parked_by_user_id | uuid | NULL FK | References users(id). User who parked / held the sale. |
| parked_at | timestamptz | NULL | Sale parked / held time. |
| recalled_by_user_id | uuid | NULL FK | References users(id). User who recalled the parked sale. |
| recalled_at | timestamptz | NULL | Parked sale recalled time. |
| currency | char(3) | NOT NULL | Currency. |
| subtotal | numeric(12,2) | NOT NULL DEFAULT 0 | Subtotal. |
| discount_total | numeric(12,2) | NOT NULL DEFAULT 0 | Discount. |
| tax_total | numeric(12,2) | NOT NULL DEFAULT 0 | Tax. |
| grand_total | numeric(12,2) | NOT NULL DEFAULT 0 | Final total. |
| paid_total | numeric(12,2) | NOT NULL DEFAULT 0 | Paid amount. |
| change_total | numeric(12,2) | NOT NULL DEFAULT 0 | Change. |
| source_device_id | uuid | NULL FK | References pos_devices(id). |
| completed_by | uuid | NULL FK | References users(id). |
| completed_at | timestamptz | NULL | Completion time. |
| voided_by | uuid | NULL FK | References users(id). |
| void_reason | text | NULL | Void reason. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, sale_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `sale_lines`

**Purpose:** POS sale line items.

**Source module:** Sales, Payments and Receipts

**Data dictionary section:** `6.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| sale_id | uuid | NOT NULL FK | References sales(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| batch_id | uuid | NULL FK | References product_batches(id). |
| line_no | int | NOT NULL | Line number. |
| description | varchar(250) | NOT NULL | Frozen item text. |
| qty | numeric(14,3) | NOT NULL CHECK > 0 | Quantity. |
| returned_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Already returned quantity. |
| unit_price | numeric(12,2) | NOT NULL CHECK >= 0 | Unit price. |
| discount_total | numeric(12,2) | NOT NULL DEFAULT 0 | Line discount. |
| tax_total | numeric(12,2) | NOT NULL DEFAULT 0 | Line tax. |
| line_total | numeric(12,2) | NOT NULL DEFAULT 0 | Line total. |
| tax_rate_id | uuid | NULL FK | References tax_rates(id). |
| pricing_snapshot | jsonb | NOT NULL | Frozen pricing/tax context. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, sale_id, line_no) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
