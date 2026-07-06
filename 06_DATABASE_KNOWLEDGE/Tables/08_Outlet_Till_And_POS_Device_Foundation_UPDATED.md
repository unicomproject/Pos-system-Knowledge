<!-- title: 08. Outlet, Till & POS Device Foundation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-06 -->
<!-- source: Updated from uploaded ERD image -->

# 08. Outlet, Till & POS Device Foundation

## Purpose

This module documents outlet, outlet address, business-hours, till/register, POS device, till-device assignment, and hardware profile tables exactly from the uploaded ERD image.

## Entity Tables

| Table | Purpose |
|---|---|
| `outlets` | Stores tenant outlet/store/collection-point master records. |
| `outlet_addresses` | Stores physical/contact address records for outlets. |
| `outlet_business_hours` | Stores outlet opening/closing schedules. |
| `tills` | Stores tills/registers under outlets. |
| `pos_devices` | Stores POS application devices assigned to outlets. |
| `till_device_assignments` | Stores active/history assignment between tills and POS devices. |
| `hardware_profiles` | Stores tenant hardware profile/configuration templates. |

## Table Details

## `outlets`

Purpose: Stores tenant outlet/store/collection-point master records.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the outlet. |
| `outlet_code` | varchar(60) | UNIQUE | NOT NULL | Unique outlet code within tenant. |
| `outlet_name` | varchar(200) |  | NOT NULL | Outlet display name. |
| `outlet_type` | varchar(40) |  | NOT NULL | Original ERD domain: outlet_type. |
| `phone` | varchar(40) |  | NULL | Outlet phone number. |
| `email` | varchar(255) |  | NULL | Outlet email address. |
| `timezone` | varchar(80) |  | NOT NULL | Outlet timezone. |
| `is_default_outlet` | boolean |  | NOT NULL DEFAULT false | Whether this is the default outlet for the tenant. |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: outlet_status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created the outlet. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who last updated the outlet. |


Constraints / Notes:

```text
UNIQUE(tenant_id, outlet_code)
```

Relationships:

- outlets.tenant_id -> tenants(id)
- outlets.created_by_tenant_user_id -> tenant_users(id)
- outlets.updated_by_tenant_user_id -> tenant_users(id)

## `outlet_addresses`

Purpose: Stores physical/contact address records for outlets.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the address. |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). Outlet for this address. |
| `address_type` | varchar(40) |  | NOT NULL | Original ERD domain: outlet_address_type. |
| `address_line1` | varchar(255) |  | NOT NULL | Address line 1. |
| `address_line2` | varchar(255) |  | NULL | Address line 2. |
| `city` | varchar(120) |  | NOT NULL | City. |
| `state_or_province` | varchar(120) |  | NULL | State/province/region. |
| `postal_code` | varchar(30) |  | NULL | Postal code. |
| `country_code` | char(2) |  | NOT NULL | Country code. |
| `contact_name` | varchar(150) |  | NULL | Address contact name. |
| `contact_phone` | varchar(40) |  | NULL | Address contact phone. |
| `is_primary` | boolean |  | NOT NULL DEFAULT false | Whether this is primary address for the outlet/address type. |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created the address. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who last updated the address. |


Constraints / Notes:

```text
One primary address can be selected by is_primary per outlet/address type.
```

Relationships:

- outlet_addresses.tenant_id -> tenants(id)
- outlet_addresses.outlet_id -> outlets(id)
- outlet_addresses.created_by_tenant_user_id -> tenant_users(id)
- outlet_addresses.updated_by_tenant_user_id -> tenant_users(id)

## `outlet_business_hours`

Purpose: Stores outlet opening/closing schedules.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the business-hours row. |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). Outlet for this business-hours row. |
| `day_of_week` | smallint |  | NOT NULL | Day of week number. |
| `opening_time` | time |  | NULL | Opening time for the day. |
| `closing_time` | time |  | NULL | Closing time for the day. |
| `is_closed` | boolean |  | NOT NULL DEFAULT false | Whether outlet is closed on this day/date range. |
| `valid_from` | date |  | NULL | Start date for this schedule row. |
| `valid_until` | date |  | NULL | End date for this schedule row. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |


Constraints / Notes:

```text
CHECK(day_of_week BETWEEN 0 AND 6)
CHECK(valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from)
```

Relationships:

- outlet_business_hours.tenant_id -> tenants(id)
- outlet_business_hours.outlet_id -> outlets(id)

## `tills`

Purpose: Stores tills/registers under outlets.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the till. |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). Outlet where till is located. |
| `till_code` | varchar(60) | UNIQUE | NOT NULL | Unique till code within tenant and outlet. |
| `till_name` | varchar(150) |  | NOT NULL | Till display name. |
| `till_type` | varchar(40) |  | NOT NULL | Original ERD domain: till_type. |
| `default_opening_float_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Default opening cash float amount. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). Till cash currency. |
| `is_cash_managed` | boolean |  | NOT NULL DEFAULT true | Whether this till manages cash. |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: till_status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created the till. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who last updated the till. |


Constraints / Notes:

```text
UNIQUE(tenant_id, outlet_id, till_code)
```

Relationships:

- tills.tenant_id -> tenants(id)
- tills.outlet_id -> outlets(id)
- tills.currency_code -> currencies(currency_code)
- tills.created_by_tenant_user_id -> tenant_users(id)
- tills.updated_by_tenant_user_id -> tenant_users(id)

## `pos_devices`

Purpose: Stores POS application devices assigned to outlets.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the POS device. |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). Outlet where POS device is assigned. |
| `device_code` | varchar(80) | UNIQUE | NOT NULL | Unique POS device code within tenant. |
| `device_name` | varchar(150) |  | NOT NULL | POS device display name. |
| `device_type` | varchar(40) |  | NOT NULL | Original ERD domain: pos_device_type. |
| `platform` | varchar(40) |  | NULL | Device operating platform. |
| `app_version` | varchar(50) |  | NULL | POS application version. |
| `device_fingerprint_hash` | varchar(255) |  | NULL | Hashed device fingerprint. |
| `is_trusted` | boolean |  | NOT NULL DEFAULT false | Whether this POS device is trusted. |
| `paired_at` | timestamptz |  | NULL | Timestamp when device was paired. |
| `paired_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who paired the device. |
| `unpaired_at` | timestamptz |  | NULL | Timestamp when device was unpaired. |
| `unpaired_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who unpaired the device. |
| `last_seen_at` | timestamptz |  | NULL | Last activity timestamp for POS device. |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: pos_device_status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created the POS device. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who last updated the POS device. |


Constraints / Notes:

```text
UNIQUE(tenant_id, device_code)
```

Relationships:

- pos_devices.tenant_id -> tenants(id)
- pos_devices.outlet_id -> outlets(id)
- pos_devices.paired_by_tenant_user_id -> tenant_users(id)
- pos_devices.unpaired_by_tenant_user_id -> tenant_users(id)
- pos_devices.created_by_tenant_user_id -> tenant_users(id)
- pos_devices.updated_by_tenant_user_id -> tenant_users(id)

## `till_device_assignments`

Purpose: Stores active/history assignment between tills and POS devices.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the assignment. |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). Outlet where assignment applies. |
| `till_id` | uuid | FK | NOT NULL | References tills(id). Assigned till. |
| `pos_device_id` | uuid | FK | NOT NULL | References pos_devices(id). Assigned POS device. |
| `assigned_at` | timestamptz |  | NOT NULL | Timestamp when till and POS device were assigned. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created assignment. |
| `released_at` | timestamptz |  | NULL | Timestamp when assignment was released. |
| `released_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who released assignment. |
| `release_reason` | text |  | NULL | Reason for releasing assignment. |


Constraints / Notes:

```text
UNIQUE(pos_device_id) WHERE released_at IS NULL
UNIQUE(till_id) WHERE released_at IS NULL
```

Relationships:

- till_device_assignments.tenant_id -> tenants(id)
- till_device_assignments.outlet_id -> outlets(id)
- till_device_assignments.till_id -> tills(id)
- till_device_assignments.pos_device_id -> pos_devices(id)
- till_device_assignments.assigned_by_tenant_user_id -> tenant_users(id)
- till_device_assignments.released_by_tenant_user_id -> tenant_users(id)

## `hardware_profiles`

Purpose: Stores tenant hardware profile/configuration templates.

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). Tenant that owns the hardware profile. |
| `profile_name` | varchar(150) | UNIQUE | NOT NULL | Hardware profile name unique within tenant. |
| `profile_type` | varchar(40) |  | NOT NULL | Original ERD domain: hardware_profile_type. |
| `description` | text |  | NULL | Hardware profile description. |
| `configuration_json` | jsonb |  | NULL | Hardware profile configuration JSON. |
| `status` | varchar(40) |  | NOT NULL | Original ERD domain: record_status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who created the hardware profile. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). Tenant user who last updated the hardware profile. |


Constraints / Notes:

```text
UNIQUE(tenant_id, profile_name)
```

Relationships:

- hardware_profiles.tenant_id -> tenants(id)
- hardware_profiles.created_by_tenant_user_id -> tenant_users(id)
- hardware_profiles.updated_by_tenant_user_id -> tenant_users(id)

## Reference Entities (External)

| Table | Key Fields | Note |
|---|---|---|
| `tenants` | id uuid PK | Tenant reference for outlets, tills, POS devices, assignments, and hardware profiles. |
| `tenant_users` | id uuid PK | Tenant user audit reference for create/update/pair/release actions. |
| `currencies` | currency_code char(3) PK | Currency reference for till opening-float/cash currency. |

## Double-check Summary

```text
Tables checked: 7
Total attribute rows checked: 98
outlets: 14 attributes
outlet_addresses: 18 attributes
outlet_business_hours: 11 attributes
tills: 14 attributes
pos_devices: 20 attributes
till_device_assignments: 10 attributes
hardware_profiles: 11 attributes
Missing tables: None
Extra tables: None
Enum/domain datatype remaining: None
Blank Reference / Note cells: 0
```

## Module Notes

- Active rule from the ERD: 1 Till ↔ 1 active POS Device.
- Enum/domain names shown in the ERD image are represented as varchar(40) plus notes; no database enum datatype is used.

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
