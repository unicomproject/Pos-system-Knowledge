<!-- title: Tenant Foundation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Tenant Foundation

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| tenants | Root customer business account. | 12 |
| tenant_profiles | Detailed tenant business profile captured in the Super Admin Create Tenant - Business Details UI. | 14 |
| tenant_addresses | Tenant-level registered/billing address captured during tenant onboarding. | 11 |
| tenant_domains | Tenant web routing/domain setup from the Super Admin domain setup UI. | 7 |
| tenant_storefront_settings | Listed in the Release 1 table inventory; detailed attributes were not provided in the uploaded data dictionary section. | 0 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `tenants`

**Purpose:** Root customer business account.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| code | varchar(60) | NOT NULL UNIQUE | Human-readable tenant code. |
| name | varchar(200) | NOT NULL | Tenant business name. |
| status | varchar(30) | NOT NULL CHECK | pending_payment, setup_pending, active, suspended, inactive. |
| base_currency | char(3) | NOT NULL | ISO currency, e.g. LKR. |
| default_timezone | varchar(100) | NOT NULL | IANA timezone. |
| default_locale | varchar(20) | NOT NULL | Default locale. |
| operating_mode | varchar(30) | NOT NULL CHECK | pos_only for Release 1. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| business_type | varchar(80) | NULL | Business type selected in tenant onboarding. |
| billing_status | varchar(30) | NOT NULL DEFAULT pending | pending, paid, failed, overdue, waived. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(code) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_profiles`

**Purpose:** Detailed tenant business profile captured in the Super Admin Create Tenant - Business Details UI.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.13`

### Attributes

| Attribute                | Type         | Key / Constraint | Reference / Note                      |
| ------------------------ | ------------ | ---------------- | ------------------------------------- |
| id                       | uuid         | PK               | Primary key.                          |
| tenant_id                | uuid         | NOT NULL FK      | References tenants(id).               |
| legal_name               | varchar(250) | NULL             | Registered/legal business name.       |
| business_registration_no | varchar(120) | NULL             | Business/company registration number. |
| tax_registration_no      | varchar(120) | NULL             | VAT/TIN/GST/tax registration number.  |
| business_category        | varchar(120) | NULL             | Retail category or business type.     |
| primary_contact_name     | varchar(200) | NULL             | Primary business contact.             |
| primary_email            | citext       | NULL             | Primary business email.               |
| primary_phone            | varchar(40)  | NULL             | Primary business phone.               |
| website_url              | varchar(255) | NULL             | Business website if provided.         |
| logo_storage_key         | varchar(500) | NULL             | Optional uploaded logo/object key.    |
| internal_note            | text         | NULL             | Platform admin internal note.         |
| created_at               | timestamptz  | NOT NULL         | Creation timestamp.                   |
| updated_at               | timestamptz  | NOT NULL         | Last update timestamp.                |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_addresses`

**Purpose:** Tenant-level registered/billing address captured during tenant onboarding.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.14`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| address_type | varchar(30) | NOT NULL CHECK | registered, billing. |
| line1 | varchar(250) | NOT NULL | Address line 1. |
| line2 | varchar(250) | NULL | Address line 2. |
| city | varchar(120) | NOT NULL | City. |
| state | varchar(120) | NULL | Province/state. |
| postal_code | varchar(30) | NULL | Postal code. |
| country_code | char(2) | NOT NULL | ISO country code. |
| is_primary | boolean | NOT NULL DEFAULT true | Primary address flag. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, address_type) |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_domains`

**Purpose:** Tenant web routing/domain setup from the Super Admin domain setup UI.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `1.15`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| subdomain | varchar(80) | NULL | Requested tenant subdomain. |
| status | varchar(30) | NOT NULL CHECK | pending, available, active, suspended, failed. |
| verified_at | timestamptz | NULL | Verification timestamp. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id) WHERE is_primary = true |

### Design Notes

- No explicit design note was provided.


## Entity: `tenant_storefront_settings`

**Purpose:** Listed in the Release 1 table inventory; detailed attributes were not provided in the uploaded data dictionary section.

**Source module:** Platform Admin, Tenant Foundation and Settings

**Data dictionary section:** `inventory_only`

### Attributes

Detailed attributes were not provided in the uploaded data dictionary section.

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- Treat as future/deferred unless confirmed as active Release 1 implementation scope.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
