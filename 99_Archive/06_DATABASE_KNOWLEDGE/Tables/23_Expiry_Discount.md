<!-- title: Expiry Discount -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Expiry Discount

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| expiry_discount_rules | Rules for discounting batches near expiry. | 14 |
| expiry_discount_applications | Concrete batch-level expiry discount used by price calculation. | 14 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `expiry_discount_rules`

**Purpose:** Rules for discounting batches near expiry.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| name | varchar(150) | NOT NULL | Rule name. |
| days_before_expiry | int | NOT NULL CHECK >= 0 | Threshold before expiry. |
| discount_type_id | smallint | NOT NULL FK | References discount_types(id). |
| discount_value | numeric(12,2) | NOT NULL CHECK > 0 | Discount value. |
| apply_to | varchar(30) | NOT NULL CHECK | product, category, brand, all_expirable. |
| product_id | uuid | NULL FK | References products(id). |
| category_id | uuid | NULL FK | References categories(id). |
| brand_id | uuid | NULL FK | References brands(id). |
| is_auto_apply | boolean | NOT NULL DEFAULT true | Auto apply flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `expiry_discount_applications`

**Purpose:** Concrete batch-level expiry discount used by price calculation.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| batch_id | uuid | NOT NULL FK | References product_batches(id). |
| product_id | uuid | NOT NULL FK | References products(id). |
| variant_id | uuid | NULL FK | References product_variants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| rule_id | uuid | NOT NULL FK | References expiry_discount_rules(id). |
| original_price | numeric(12,2) | NOT NULL | Price before discount. |
| discounted_price | numeric(12,2) | NOT NULL | Final price. |
| discount_amount | numeric(12,2) | NOT NULL | Discount amount. |
| start_date | date | NOT NULL | Discount start. |
| end_date | date | NOT NULL | Discount end. |
| status | varchar(30) | NOT NULL CHECK | active, expired, cancelled. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, batch_id, outlet_id, rule_id, start_date) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
