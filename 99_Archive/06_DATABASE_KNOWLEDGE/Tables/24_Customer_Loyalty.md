<!-- title: Customer Loyalty -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Customer Loyalty

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| customers | Tenant-scoped customer profile for POS loyalty and checkout. | 11 |
| loyalty_programs | Tenant-owned loyalty program master. | 12 |
| loyalty_earning_rules | How customers earn loyalty points. | 13 |
| loyalty_redemption_rules | How customers redeem loyalty points. | 12 |
| customer_memberships | Customer membership and current points projection. | 12 |
| loyalty_transactions | Immutable loyalty points ledger. | 13 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `customers`

**Purpose:** Tenant-scoped customer profile for POS loyalty and checkout.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| email | citext | NULL | Customer email. |
| normalized_email | citext | NULL | Normalized email. |
| phone | varchar(40) | NULL | Customer phone. |
| normalized_phone | varchar(40) | NULL | Normalized phone. |
| full_name | varchar(200) | NULL | Full name. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, blocked, guest. |
| source | varchar(30) | NOT NULL CHECK | pos, import, api. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, normalized_email) WHERE normalized_email IS NOT NULL |
| Unique / Index | UNIQUE(tenant_id, normalized_phone) WHERE normalized_phone IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `loyalty_programs`

**Purpose:** Tenant-owned loyalty program master.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Program code. |
| name | varchar(150) | NOT NULL | Program name. |
| points_expiry_days | int | NULL | Points expiry days. |
| rounding_method | varchar(20) | NOT NULL CHECK | floor, round, ceil. |
| is_default | boolean | NOT NULL DEFAULT false | Default program flag. |
| status | varchar(30) | NOT NULL CHECK | draft, active, inactive, archived. |
| starts_at | timestamptz | NULL | Start. |
| ends_at | timestamptz | NULL | End. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `loyalty_earning_rules`

**Purpose:** How customers earn loyalty points.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| program_id | uuid | NOT NULL FK | References loyalty_programs(id). |
| rule_name | varchar(150) | NOT NULL | Rule name. |
| spend_amount | numeric(12,2) | NOT NULL CHECK > 0 | Spend threshold. |
| earn_points | numeric(14,2) | NOT NULL CHECK > 0 | Earned points. |
| minimum_bill_amount | numeric(12,2) | NULL | Minimum bill. |
| valid_from | timestamptz | NULL | Start. |
| valid_to | timestamptz | NULL | End. |
| priority | int | NOT NULL DEFAULT 0 | Priority. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, archived. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `loyalty_redemption_rules`

**Purpose:** How customers redeem loyalty points.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| program_id | uuid | NOT NULL FK | References loyalty_programs(id). |
| rule_name | varchar(150) | NOT NULL | Rule name. |
| points_required | numeric(14,2) | NOT NULL CHECK > 0 | Points required. |
| discount_type | varchar(30) | NOT NULL CHECK | fixed_amount, percentage. |
| discount_value | numeric(12,2) | NOT NULL CHECK > 0 | Discount value. |
| minimum_bill_amount | numeric(12,2) | NULL | Minimum bill. |
| maximum_discount_amount | numeric(12,2) | NULL | Discount cap. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, archived. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `customer_memberships`

**Purpose:** Customer membership and current points projection.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.12`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| customer_id | uuid | NOT NULL FK | References customers(id). |
| loyalty_program_id | uuid | NOT NULL FK | References loyalty_programs(id). |
| membership_no | varchar(80) | NOT NULL | Membership number. |
| points_balance | numeric(14,2) | NOT NULL DEFAULT 0 | Available points. |
| lifetime_points | numeric(14,2) | NOT NULL DEFAULT 0 | Lifetime earned. |
| join_date | date | NOT NULL | Join date. |
| expiry_date | date | NULL | Expiry date. |
| status | varchar(30) | NOT NULL CHECK | active, expired, suspended, closed. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, membership_no) |
| Unique / Index | UNIQUE(tenant_id, customer_id, loyalty_program_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `loyalty_transactions`

**Purpose:** Immutable loyalty points ledger.

**Source module:** Discount, Expiry Discount, Customer and Loyalty

**Data dictionary section:** `7.13`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| customer_membership_id | uuid | NOT NULL FK | References customer_memberships(id). |
| source_sale_id | uuid | NULL FK | References sales(id). |
| source_return_id | uuid | NULL FK | References returns(id). |
| transaction_type | varchar(30) | NOT NULL CHECK | earn, redeem, adjust, expire, reverse. |
| points_delta | numeric(14,2) | NOT NULL | Positive or negative movement. |
| monetary_value | numeric(12,2) | NULL | Redeemed money value. |
| expires_at | timestamptz | NULL | Expiry for earned points. |
| reversed_transaction_id | uuid | NULL FK | References loyalty_transactions(id). |
| reason | text | NULL | Reason. |
| created_by | uuid | NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Append-only; corrections are reverse transactions.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
