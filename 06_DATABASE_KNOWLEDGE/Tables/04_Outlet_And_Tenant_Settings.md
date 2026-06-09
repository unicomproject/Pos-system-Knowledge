<!-- title: Outlet And Tenant Settings -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Outlet And Tenant Settings

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| outlets | Tenant physical sales location or stock location. | 15 |
| outlet_addresses | Operational address for each outlet. | 14 |
| tenant_settings | Tenant/outlet runtime settings that do not deserve separate relational tables. | 8 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `outlets`

**Purpose:** Tenant physical sales location or stock location.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| code | varchar(60) | NOT NULL | Outlet code unique inside tenant. |
| name | varchar(200) | NOT NULL | Outlet name. |
| outlet_type | varchar(40) | NOT NULL CHECK | store, warehouse. |
| is_central_outlet | boolean | NOT NULL DEFAULT false | Main outlet flag. |
| timezone | varchar(100) | NOT NULL | Outlet timezone. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| manager_user_id | uuid | NULL FK | References users(id), optional outlet manager. |
| phone | varchar(40) | NULL | Outlet phone. |
| email | citext | NULL | Outlet email. |
| image_storage_key | varchar(500) | NULL | Outlet image/banner key. |
| opening_hours | jsonb | NULL | Opening hours used by tenant dashboard/UI. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `outlet_addresses`

**Purpose:** Operational address for each outlet.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.9`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| line1 | varchar(250) | NOT NULL | Address line 1. |
| line2 | varchar(250) | NULL | Address line 2. |
| city | varchar(120) | NOT NULL | City. |
| state | varchar(120) | NULL | Province/state. |
| postal_code | varchar(30) | NULL | Postal code. |
| country_code | char(2) | NOT NULL | ISO country code. |
| is_primary | boolean | NOT NULL DEFAULT true | Primary address flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| contact_name | varchar(200) | NULL | Outlet contact person. |
| phone | varchar(40) | NULL | Address/contact phone. |
| email | citext | NULL | Address/contact email. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(outlet_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_settings`

**Purpose:** Tenant/outlet runtime settings that do not deserve separate relational tables.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.11`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| setting_key | varchar(120) | NOT NULL | Setting key. |
| setting_value | jsonb | NOT NULL | Validated JSON value. |
| scope | varchar(20) | NOT NULL CHECK | tenant, outlet. |
| outlet_id | uuid | NULL FK | Required when scope=outlet. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, scope, COALESCE(outlet_id, 00000000-0000-0000-0000-000000000000), setting_key) |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
