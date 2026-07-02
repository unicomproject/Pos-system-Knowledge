<!-- title: Till Device Session -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Till Device Session

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| tills | Cash register/till master assigned to an outlet. | 11 |
| pos_devices | Registered POS/admin device after activation or pairing. | 17 |
| till_activation_codes | Short-lived activation codes used to bind a POS device to a till. | 11 |
| device_pairing_requests | Device pairing approval workflow and audit trail. | 10 |
| till_sessions | Open/close session per till. | 18 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `tills`

**Purpose:** Cash register/till master assigned to an outlet.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.1`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| code | varchar(60) | NOT NULL | Till code unique inside tenant/outlet. |
| name | varchar(150) | NOT NULL | Till name. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, maintenance. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| default_hardware_profile_id | uuid | NULL FK | References hardware_profiles(id). |
| opening_cash_required | boolean | NOT NULL DEFAULT true | Whether opening float is required. |
| internal_note | text | NULL | Till setup note from admin UI. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, code) |

### Design Notes

- No explicit design note was provided.


## Entity: `pos_devices`

**Purpose:** Registered POS/admin device after activation or pairing.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.2`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_id | uuid | NULL FK | References tills(id); required for POS devices. |
| device_code | varchar(80) | NOT NULL | Human-readable device code. |
| device_name | varchar(150) | NOT NULL | Device name. |
| device_type | varchar(40) | NOT NULL CHECK | fixed_pos_tablet, portable_mobile, admin_browser. |
| platform | varchar(30) | NOT NULL CHECK | android, ios, web, windows. |
| device_fingerprint | varchar(255) | NOT NULL | Device/browser fingerprint. |
| is_trusted | boolean | NOT NULL DEFAULT false | Trusted after pairing. |
| paired_at | timestamptz | NULL | Pairing time. |
| paired_by | uuid | NULL FK | References users(id). |
| app_version | varchar(50) | NULL | App version. |
| last_seen_at | timestamptz | NULL | Last online time. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, blocked. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, device_code) |
| Unique / Index | UNIQUE(tenant_id, device_fingerprint) |

### Design Notes

- No explicit design note was provided.


## Entity: `till_activation_codes`

**Purpose:** Short-lived activation codes used to bind a POS device to a till.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.3`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_id | uuid | NOT NULL FK | References tills(id). |
| activation_code_hash | varchar(255) | NOT NULL UNIQUE | Hashed activation code. |
| issued_by_user_id | uuid | NOT NULL FK | References users(id). |
| status | varchar(30) | NOT NULL CHECK | active, used, expired, revoked. |
| expires_at | timestamptz | NOT NULL | Expiry time. |
| used_by_device_id | uuid | NULL FK | References pos_devices(id). |
| used_at | timestamptz | NULL | Use time. |
| created_at | timestamptz | NOT NULL | Creation time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(activation_code_hash) |

### Design Notes

- No explicit design note was provided.


## Entity: `device_pairing_requests`

**Purpose:** Device pairing approval workflow and audit trail.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.4`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_id | uuid | NULL FK | References tills(id). |
| device_id | uuid | NULL FK | References pos_devices(id). |
| device_fingerprint | varchar(255) | NOT NULL | Fingerprint from requesting device. |
| requested_by_user_id | uuid | NULL FK | References users(id). |
| status | varchar(30) | NOT NULL CHECK | pending, approved, rejected, expired. |
| requested_at | timestamptz | NOT NULL | Request time. |
| resolved_at | timestamptz | NULL | Decision time. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, device_fingerprint) WHERE status = pending |

### Design Notes

- No explicit design note was provided.


## Entity: `till_sessions`

**Purpose:** Open/close session per till.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.5`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NOT NULL FK | References outlets(id). |
| till_id | uuid | NOT NULL FK | References tills(id). |
| business_date | date | NOT NULL | Operational date. |
| opened_by | uuid | NOT NULL FK | References users(id). |
| closed_by | uuid | NULL FK | References users(id). |
| opened_device_id | uuid | NULL FK | References pos_devices(id). |
| closed_device_id | uuid | NULL FK | References pos_devices(id). |
| opening_float | numeric(12,2) | NOT NULL CHECK >= 0 | Opening cash. |
| expected_cash | numeric(12,2) | NULL | System expected cash. |
| counted_cash | numeric(12,2) | NULL | Counted cash. |
| variance | numeric(12,2) | NULL | Cash variance. |
| status | varchar(20) | NOT NULL CHECK | open, closed. |
| opened_at | timestamptz | NOT NULL | Open time. |
| closed_at | timestamptz | NULL | Close time. |
| close_note | text | NULL | Close note. |
| opening_note | text | NULL | Optional note entered when opening till. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, till_id) WHERE status = open |

### Design Notes

- No explicit design note was provided.


## Related Files

- [[../Database_Overview]]
- [[../Tenant_Id_Rules]]
- [[../Table_Naming_Standards]]
- [[../Migration_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/DTO_And_Mapping_Rules]]
