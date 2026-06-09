<!-- title: Product Core -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Product Core

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| products | Product master shared by fixed and portable POS. | 17 |
| product_variants | Sellable SKU/barcode unit. | 10 |
| product_attributes | Tenant-defined product attributes. | 8 |
| attribute_values | Allowed values for select attributes. | 7 |
| variant_attribute_values | Selected attribute values per variant. | 5 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `products`

**Purpose:** Product master shared by fixed and portable POS.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| category_id | uuid | NULL FK | References categories(id). |
| brand_id | uuid | NULL FK | References brands(id). |
| tax_class_id | uuid | NULL FK | References tax_classes(id). |
| return_policy_id | uuid | NOT NULL FK | References return_policies(id). |
| product_type | varchar(30) | NOT NULL CHECK | simple, variant_parent, service. |
| code | varchar(80) | NOT NULL | Product code. |
| name | varchar(250) | NOT NULL | Product name. |
| slug | varchar(250) | NOT NULL | Product slug. |
| short_description | varchar(500) | NULL | Short description. |
| status | varchar(30) | NOT NULL CHECK | draft, active, archived. |
| is_sellable_pos | boolean | NOT NULL DEFAULT true | POS sellable flag. |
| track_inventory | boolean | NOT NULL DEFAULT true | Inventory tracking flag. |
| is_expirable | boolean | NOT NULL DEFAULT false | Expiry tracking flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |
| Unique / Index | UNIQUE(tenant_id, slug) |

### Design Notes

- No explicit design note was provided.


## Entity: `product_variants`

**Purpose:** Sellable SKU/barcode unit.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| product_id | uuid | NOT NULL FK | References products(id). |
| sku | varchar(100) | NOT NULL | Tenant-unique SKU. |
| barcode | varchar(120) | NULL | Tenant-unique barcode. |
| name | varchar(250) | NOT NULL | Variant name. |
| variant_signature | varchar(500) | NULL | Canonical attribute signature. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, archived. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, sku) |
| Unique / Index | UNIQUE(tenant_id, barcode) WHERE barcode IS NOT NULL |
| Unique / Index | UNIQUE(product_id, variant_signature) WHERE variant_signature IS NOT NULL |

### Design Notes

- No explicit design note was provided.


## Entity: `product_attributes`

**Purpose:** Tenant-defined product attributes.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(100) | NOT NULL | Attribute code. |
| name | varchar(150) | NOT NULL | Attribute name. |
| data_type | varchar(30) | NOT NULL CHECK | text, number, boolean, select. |
| is_variant_defining | boolean | NOT NULL DEFAULT false | Variant-defining flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `attribute_values`

**Purpose:** Allowed values for select attributes.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.10`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| attribute_id | uuid | NOT NULL FK | References product_attributes(id). |
| value_code | varchar(100) | NOT NULL | Internal code. |
| value_text | varchar(150) | NOT NULL | Display value. |
| sort_order | int | NOT NULL DEFAULT 0 | Display order. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, attribute_id, value_code) |

### Design Notes

- No explicit design note was provided.


## Entity: `variant_attribute_values`

**Purpose:** Selected attribute values per variant.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| attribute_id | uuid | NOT NULL FK | References product_attributes(id). |
| attribute_value_id | uuid | NOT NULL FK | References attribute_values(id). |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, variant_id, attribute_id) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
