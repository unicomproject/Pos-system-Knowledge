<!-- title: Hardware Configuration -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Hardware Configuration

## Purpose

This file groups related SCS-TIX EPOS Release 1 database entities into one
module-level document.

It contains multiple tables with their attributes, constraints, notes, and entity
rules from the updated database design.

## Module Table Summary

| Entity | Purpose | Attribute Count |
|---|---|---|
| hardware_profiles | Named hardware setup assigned to a POS device or outlet. | 9 |
| hardware_devices | Individual hardware peripherals such as printer, scanner, cash drawer or card reader. | 16 |
| hardware_test_logs | Hardware test result log from POS hardware testing flow. | 10 |

## Implementation Rules

- Use table and attribute names exactly as listed.
- Preserve the listed data types, constraints, and tenant-aware unique indexes.
- Tenant-owned data must be filtered by `tenant_id`.
- Token, code, password, POS PIN, and provider secret values must not be exposed.
- Database presence alone does not activate Release 2 features.

## Entities

## Entity: `hardware_profiles`

**Purpose:** Named hardware setup assigned to a POS device or outlet.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.6`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| profile_name | varchar(150) | NOT NULL | Profile name. |
| device_id | uuid | NULL FK | References pos_devices(id). |
| is_default | boolean | NOT NULL DEFAULT false | Default profile flag. |
| status | varchar(30) | NOT NULL CHECK | active, inactive. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |

### Entity Rules

| Rule Type | Rule |
|---|---|
| Unique / Index | UNIQUE(tenant_id, outlet_id, profile_name) |

### Design Notes

- No explicit design note was provided.


## Entity: `hardware_devices`

**Purpose:** Individual hardware peripherals such as printer, scanner, cash drawer or card reader.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.7`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| hardware_profile_id | uuid | NULL FK | References hardware_profiles(id). |
| device_id | uuid | NULL FK | References pos_devices(id). |
| hardware_type | varchar(40) | NOT NULL CHECK | receipt_printer, barcode_scanner, cash_drawer, card_reader. |
| name | varchar(150) | NOT NULL | Peripheral name. |
| connection_type | varchar(40) | NOT NULL CHECK | usb, bluetooth, network, printer_rj11, sdk. |
| connection_config | jsonb | NULL | Non-secret connection configuration. |
| status | varchar(30) | NOT NULL CHECK | active, inactive, error. |
| created_at | timestamptz | NOT NULL | Creation timestamp. |
| updated_at | timestamptz | NOT NULL | Last update timestamp. |
| serial_no | varchar(160) | NULL | Peripheral serial number if known. |
| model | varchar(160) | NULL | Peripheral model. |
| last_test_status | varchar(30) | NULL CHECK | success, failed, unknown. |
| last_tested_at | timestamptz | NULL | Last hardware test time. |

### Entity Rules

No additional rule table was provided for this entity.

### Design Notes

- No explicit design note was provided.


## Entity: `hardware_test_logs`

**Purpose:** Hardware test result log from POS hardware testing flow.

**Source module:** Till, Device, Hardware and Cash Session Control

**Data dictionary section:** `3.8`

### Attributes

| Attribute | Type | Key / Constraint | Reference / Note |
|---|---|---|---|
| id | uuid | PK | Primary key. |
| tenant_id | uuid | NOT NULL FK | References tenants(id). |
| outlet_id | uuid | NULL FK | References outlets(id). |
| hardware_device_id | uuid | NULL FK | References hardware_devices(id). |
| pos_device_id | uuid | NULL FK | References pos_devices(id). |
| test_type | varchar(50) | NOT NULL CHECK | printer, scanner, cash_drawer, card_reader, full_test. |
| status | varchar(30) | NOT NULL CHECK | success, failed, skipped. |
| result_message | text | NULL | Test result. |
| tested_by | uuid | NULL FK | References users(id). |
| tested_at | timestamptz | NOT NULL | Test time. |

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
