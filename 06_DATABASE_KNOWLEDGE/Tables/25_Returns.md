<!-- title: Returns -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Returns

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| return_reason_codes | Tenant-owned return reasons. | 5 |
| returns | Return header for POS sale. | 17 |
| return_lines | Returned line items. | 13 |
| return_refund_allocations | Allocates refunds to return documents. | 5 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `return_reason_codes`

**Purpose:** Tenant-owned return reasons.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Reason code. |
| name | varchar(150) | NOT NULL | Reason label. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `returns`

**Purpose:** Return header for POS sale.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| return_number | varchar(80) | NOT NULL | Business return number. |
| customer_id | uuid | NULL FK | References customers(id). |
| source_sale_id | uuid | NOT NULL FK | References sales(id). |
| original_outlet_id | uuid | NULL FK | Original sale outlet. |
| return_outlet_id | uuid | NULL FK | Processing outlet. |
| status | varchar(30) | NOT NULL CHECK | initiated, approved, received, partially_refunded, refunded, completed, rejected, cancelled. |
| reason_code_id | uuid | NULL FK | References return_reason_codes(id). |
| refund_total | numeric(12,2) | NOT NULL DEFAULT 0 | Total refund amount. |
| created_by | uuid | NULL FK | References users(id). |
| approved_by | uuid | NULL FK | References users(id). |
| approved_at | timestamptz | NULL | Approval time. |
| received_at | timestamptz | NULL | Receipt time. |
| refunded_at | timestamptz | NULL | Refund time. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, return_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `return_lines`

**Purpose:** Returned line items.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| return_id | uuid | NOT NULL FK | References returns(id). |
| line_no | int | NOT NULL | Line number. |
| source_sale_line_id | uuid | NOT NULL FK | References sale_lines(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| qty | numeric(14,3) | NOT NULL CHECK > 0 | Return quantity. |
| received_qty | numeric(14,3) | NOT NULL DEFAULT 0 | Received quantity. |
| condition_status | varchar(30) | NOT NULL CHECK | sellable, damaged, opened, expired. |
| unit_refund | numeric(12,2) | NOT NULL | Unit refund. |
| tax_refund | numeric(12,2) | NOT NULL | Tax refund. |
| line_refund_total | numeric(12,2) | NOT NULL | Line refund total. |
| restock_action | varchar(30) | NOT NULL CHECK | restock, quarantine, discard. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, return_id, line_no) |

### Design Notes

- No explicit design note was provided.


## Entity: `return_refund_allocations`

**Purpose:** Allocates refunds to return documents.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| return_id | uuid | NOT NULL FK | References returns(id). |
| refund_id | uuid | NOT NULL FK | References refunds(id). |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Allocated amount. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, return_id, refund_id) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
