<!-- title: Exchanges Customer Credit -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Exchanges Customer Credit

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| exchanges | Exchange header created from a return. | 15 |
| exchange_lines | New items issued in exchange. | 10 |
| exchange_payment_allocations | Additional collection payment for exchange difference. | 5 |
| exchange_refund_allocations | Refund allocation for exchange difference. | 5 |
| customer_credits | Customer store-credit / credit-note balance created by refunds or exchange differences. | 14 |
| customer_credit_transactions | Immutable ledger for customer store-credit issue, redemption, reversal and expiry. | 12 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `exchanges`

**Purpose:** Exchange header created from a return.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| exchange_number | varchar(80) | NOT NULL | Business exchange number. |
| source_return_id | uuid | NOT NULL FK | References returns(id). |
| original_outlet_id | uuid | NULL FK | Original outlet. |
| exchange_outlet_id | uuid | NULL FK | Processing outlet. |
| status | varchar(30) | NOT NULL CHECK | draft, completed, cancelled. |
| old_value_total | numeric(12,2) | NOT NULL DEFAULT 0 | Returned value. |
| new_value_total | numeric(12,2) | NOT NULL DEFAULT 0 | New item value. |
| difference_total | numeric(12,2) | NOT NULL DEFAULT 0 | Net difference. |
| difference_direction | varchar(20) | NOT NULL CHECK | collect, refund, none. |
| created_by | uuid | NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Creation time. |
| completed_at | timestamptz | NULL | Completion time. |
| updated_at | timestamptz | NOT NULL | Update time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, exchange_number) |
| Unique / Index | UNIQUE(tenant_id, source_return_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `exchange_lines`

**Purpose:** New items issued in exchange.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| exchange_id | uuid | NOT NULL FK | References exchanges(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| line_no | int | NOT NULL | Line number. |
| qty | numeric(14,3) | NOT NULL CHECK > 0 | Quantity. |
| unit_price | numeric(12,2) | NOT NULL CHECK >= 0 | Unit price. |
| tax_total | numeric(12,2) | NOT NULL DEFAULT 0 | Tax. |
| line_total | numeric(12,2) | NOT NULL | Line total. |
| pricing_snapshot | jsonb | NOT NULL | Frozen pricing/tax snapshot. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, exchange_id, line_no) |

### Design Notes

- No explicit design note was provided.


## Entity: `exchange_payment_allocations`

**Purpose:** Additional collection payment for exchange difference.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| exchange_id | uuid | NOT NULL FK | References exchanges(id). |
| payment_id | uuid | NOT NULL FK | References payments(id). |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Allocated amount. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, exchange_id, payment_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `exchange_refund_allocations`

**Purpose:** Refund allocation for exchange difference.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| exchange_id | uuid | NOT NULL FK | References exchanges(id). |
| refund_id | uuid | NOT NULL FK | References refunds(id). |
| amount | numeric(12,2) | NOT NULL CHECK > 0 | Allocated amount. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, exchange_id, refund_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `customer_credits`

**Purpose:** Customer store-credit / credit-note balance created by refunds or exchange differences.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| customer_id | uuid | NOT NULL FK | References customers(id). |
| credit_number | varchar(80) | NOT NULL | Business credit note number. |
| currency | char(3) | NOT NULL | Currency. |
| original_amount | numeric(12,2) | NOT NULL CHECK > 0 | Initial credit amount. |
| remaining_amount | numeric(12,2) | NOT NULL CHECK >= 0 | Remaining usable amount. |
| status | varchar(30) | NOT NULL CHECK | active, fully_used, expired, cancelled. |
| source_return_id | uuid | NULL FK | References returns(id). |
| source_exchange_id | uuid | NULL FK | References exchanges(id). |
| issued_by | uuid | NULL FK | References users(id). |
| expires_at | timestamptz | NULL | Optional expiry timestamp. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, credit_number) |

### Design Notes

- No explicit design note was provided.


## Entity: `customer_credit_transactions`

**Purpose:** Immutable ledger for customer store-credit issue, redemption, reversal and expiry.

**Source module:** Returns, Refunds and Exchanges

**Data dictionary section:** `8.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| customer_credit_id | uuid | NOT NULL FK | References customer_credits(id). |
| transaction_type | varchar(30) | NOT NULL CHECK | issue, redeem, reverse, expire, adjust. |
| amount_delta | numeric(12,2) | NOT NULL | Positive for issue/adjust-in, negative for redeem/expire. |
| sale_id | uuid | NULL FK | References sales(id). |
| return_id | uuid | NULL FK | References returns(id). |
| exchange_id | uuid | NULL FK | References exchanges(id). |
| payment_id | uuid | NULL FK | References payments(id). |
| reason | text | NULL | Reason/note. |
| created_by | uuid | NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Ledger timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Append-only. Do not update/delete ledger rows.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
