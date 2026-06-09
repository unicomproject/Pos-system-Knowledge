<!-- title: Catalog Tax Return Policy -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Catalog Tax Return Policy

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| categories | Product category hierarchy. | 9 |
| brands | Optional product brand master. | 7 |
| tax_classes | Product tax classification. | 8 |
| tax_rates | Effective tax/VAT/GST rates. | 10 |
| tax_class_rates | Maps tax classes to effective rates. | 7 |
| return_policies | Return/exchange policy assigned to products. | 13 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `categories`

**Purpose:** Product category hierarchy.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| parent_id | uuid | NULL FK | References categories(id). |
| name | varchar(150) | NOT NULL | Category name. |
| slug | varchar(180) | NOT NULL | Category slug. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, slug) |

### Design Notes

- No explicit design note was provided.


## Entity: `brands`

**Purpose:** Optional product brand master.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| name | varchar(150) | NOT NULL | Brand name. |
| code | varchar(80) | NULL | Optional code. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, name) |
| Unique / Index | UNIQUE(tenant_id, code) WHERE code IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `tax_classes`

**Purpose:** Product tax classification.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Tax class code. |
| name | varchar(150) | NOT NULL | Tax class name. |
| applies_to | varchar(30) | NOT NULL CHECK | goods, services, mixed. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `tax_rates`

**Purpose:** Effective tax/VAT/GST rates.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Tax rate code. |
| name | varchar(150) | NOT NULL | Tax rate name. |
| rate | numeric(7,4) | NOT NULL CHECK >= 0 | Percentage rate. |
| tax_type | varchar(30) | NOT NULL CHECK | vat, gst, sales_tax. |
| country_code | char(2) | NOT NULL | ISO country. |
| starts_at | timestamptz | NOT NULL | Effective start. |
| ends_at | timestamptz | NULL | Effective end. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code, starts_at) |

### Design Notes

- No explicit design note was provided.


## Entity: `tax_class_rates`

**Purpose:** Maps tax classes to effective rates.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| tax_class_id | uuid | NOT NULL FK | References tax_classes(id). |
| tax_rate_id | uuid | NOT NULL FK | References tax_rates(id). |
| starts_at | timestamptz | NOT NULL | Effective start. |
| ends_at | timestamptz | NULL | Effective end. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, tax_class_id, tax_rate_id, starts_at) |

### Design Notes

- No explicit design note was provided.


## Entity: `return_policies`

**Purpose:** Return/exchange policy assigned to products.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(80) | NOT NULL | Policy code. |
| name | varchar(150) | NOT NULL | Policy name. |
| policy_type | varchar(30) | NOT NULL CHECK | returnable, non_returnable, exchange_only, final_sale. |
| return_window_days | int | NULL | Return window. |
| exchange_window_days | int | NULL | Exchange window. |
| requires_receipt | boolean | NOT NULL DEFAULT true | Receipt required flag. |
| allow_damaged_return | boolean | NOT NULL DEFAULT false | Damaged return flag. |
| requires_manager_override | boolean | NOT NULL DEFAULT false | Approval required flag. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
