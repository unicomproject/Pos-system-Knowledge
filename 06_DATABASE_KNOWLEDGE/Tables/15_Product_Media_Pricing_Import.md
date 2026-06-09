<!-- title: Product Media Pricing Import -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Product Media Pricing Import

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| product_images | Product and optional variant images. | 9 |
| price_lists | Named POS price lists. | 10 |
| price_list_items | Variant prices inside a price list. | 9 |
| product_import_batches | CSV product import batch header. | 11 |
| product_import_rows | Per-row CSV validation/import result. | 11 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `product_images`

**Purpose:** Product and optional variant images.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.12`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| product_id | uuid | NOT NULL FK | References products(id). |
| variant_id | uuid | NULL FK | References product_variants(id). |
| storage_key | varchar(500) | NOT NULL | Object storage key. |
| alt_text | varchar(250) | NULL | Alt text. |
| sort_order | int | NOT NULL DEFAULT 0 | Sort order. |
| is_primary | boolean | NOT NULL DEFAULT false | Primary image flag. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `price_lists`

**Purpose:** Named POS price lists.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.13`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| name | varchar(150) | NOT NULL | Price list name. |
| currency | char(3) | NOT NULL | Currency. |
| starts_at | timestamptz | NULL | Start. |
| ends_at | timestamptz | NULL | End. |
| priority | int | NOT NULL DEFAULT 0 | Evaluation priority. |
| is_active | boolean | NOT NULL DEFAULT true | Active flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, name) |

### Design Notes

- No explicit design note was provided.


## Entity: `price_list_items`

**Purpose:** Variant prices inside a price list.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.14`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| price_list_id | uuid | NOT NULL FK | References price_lists(id). |
| variant_id | uuid | NOT NULL FK | References product_variants(id). |
| outlet_id | uuid | NULL FK | Optional outlet override. |
| list_price | numeric(12,2) | NOT NULL CHECK >= 0 | List price. |
| sale_price | numeric(12,2) | NULL CHECK >= 0 | Sale price. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, price_list_id, variant_id, outlet_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `product_import_batches`

**Purpose:** CSV product import batch header.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.15`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| file_name | varchar(255) | NOT NULL | Uploaded file name. |
| storage_key | varchar(500) | NULL | Stored import file. |
| import_status | varchar(30) | NOT NULL CHECK | uploaded, validating, validated, importing, completed, failed, partially_completed. |
| total_rows | int | NOT NULL DEFAULT 0 | Total rows. |
| success_rows | int | NOT NULL DEFAULT 0 | Success rows. |
| failed_rows | int | NOT NULL DEFAULT 0 | Failed rows. |
| uploaded_by | uuid | NOT NULL FK | References users(id). |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `product_import_rows`

**Purpose:** Per-row CSV validation/import result.

**Source module:** Catalog, Pricing, Tax and Product Import

**Data dictionary section:** `4.16`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| batch_id | uuid | NOT NULL FK | References product_import_batches(id). |
| row_no | int | NOT NULL | CSV row number. |
| raw_payload | jsonb | NOT NULL | Raw row data. |
| status | varchar(30) | NOT NULL CHECK | pending, valid, imported, failed, skipped. |
| error_message | text | NULL | Validation/import error. |
| product_id | uuid | NULL FK | Created/updated product. |
| variant_id | uuid | NULL FK | Created/updated variant. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, batch_id, row_no) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
