<!-- title: Discount Core -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Discount Core

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| discount_types | Discount calculation type reference. | 4 |
| discount_scopes | Discount scope reference. | 4 |
| discount_policies | Tenant/outlet cashier discount limits for line-item and full-bill discounts. | 10 |
| product_discounts | Tenant-admin configured discount for a product or a specific product variant. | 15 |
| pos_discount_applications | Cashier-applied discount for a sale line or the full bill during POS checkout. | 13 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `discount_types`

**Purpose:** Discount calculation type reference.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | smallint | PK | Primary key. |
| code | varchar(40) | NOT NULL UNIQUE | percentage, fixed_amount, price_override. |
| name | varchar(150) | NOT NULL | Display label. |
| is_active | boolean | NOT NULL DEFAULT true | Active/inactive flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Seed Data | percentage, fixed_amount, price_override |
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `discount_scopes`

**Purpose:** Discount scope reference.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | smallint | PK | Primary key. |
| code | varchar(40) | NOT NULL UNIQUE | product, variant, sale_line, bill, expiry. |
| name | varchar(150) | NOT NULL | Display label. |
| is_active | boolean | NOT NULL DEFAULT true | Active/inactive flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Seed Data | product, variant, sale_line, bill, expiry |
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `discount_policies`

**Purpose:** Tenant/outlet cashier discount limits for line-item and full-bill discounts.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id); null means tenant-level default policy. |
| max_line_discount_percent | numeric(7,4) | NULL CHECK >= 0 | Maximum cashier percentage discount for one sale line. |
| max_line_discount_amount | numeric(12,2) | NULL CHECK >= 0 | Maximum cashier fixed amount discount for one sale line. |
| max_bill_discount_percent | numeric(7,4) | NULL CHECK >= 0 | Maximum cashier percentage discount for full bill. |
| max_bill_discount_amount | numeric(12,2) | NULL CHECK >= 0 | Maximum cashier fixed amount discount for full bill. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `product_discounts`

**Purpose:** Tenant-admin configured discount for a product or a specific product variant.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | Optional outlet-specific discount. |
| product_id | uuid | NULL FK | References products(id). Required when discount scope is product. |
| variant_id | uuid | NULL FK | References product_variants(id). Required when discount scope is variant. |
| discount_type_id | smallint | NOT NULL FK | References discount_types(id). |
| discount_scope_id | smallint | NOT NULL FK | References discount_scopes(id); product or variant. |
| name | varchar(150) | NOT NULL | Discount display name. |
| discount_value | numeric(12,2) | NOT NULL CHECK > 0 | Percentage, fixed amount, or override price. |
| starts_at | timestamptz | NULL | Discount start time. |
| ends_at | timestamptz | NULL | Discount end time. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, expired. |
| created_by | uuid | NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `pos_discount_applications`

**Purpose:** Cashier-applied discount for a sale line or the full bill during POS checkout.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_session_id | uuid | NOT NULL FK | References till_sessions(id). |
| sale_id | uuid | NOT NULL FK | References sales(id). |
| sale_line_id | uuid | NULL FK | References sale_lines(id); null means full bill discount. |
| discount_type_id | smallint | NOT NULL FK | References discount_types(id). |
| discount_scope_id | smallint | NOT NULL FK | References discount_scopes(id); sale_line or bill. |
| discount_value | numeric(12,2) | NOT NULL CHECK > 0 | Cashier-entered percentage or fixed amount. |
| amount_applied | numeric(12,2) | NOT NULL CHECK >= 0 | Final calculated discount amount. |
| reason | text | NULL | Optional cashier reason. |
| applied_by | uuid | NOT NULL FK | References users(id). |
| applied_at | timestamptz | NOT NULL | Applied timestamp. |

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
