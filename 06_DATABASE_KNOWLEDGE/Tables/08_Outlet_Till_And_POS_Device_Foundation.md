<!-- title: Outlet, Till & POS Device Foundation -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 08. Outlet, Till & POS Device Foundation

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `outlets` | Stores outlets records for this module. |
| `outlet_addresses` | Stores outlet addresses records for this module. |
| `outlet_business_hours` | Stores outlet business hours records for this module. |
| `tills` | Stores tills records for this module. |
| `pos_devices` | Stores pos devices records for this module. |
| `till_device_assignments` | Stores till device assignments records for this module. |
| `hardware_profiles` | Stores hardware profiles records for this module. |

## outlets

Module: Outlet, Till & POS Device Foundation

Purpose: Stores outlets records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| outlet_code | varchar(80) | UNIQUE | Unique business key. |
| outlet_type | varchar(40) | NOT CHECK DEFAULT | CHECK(outlet_type IN ('STORE', 'WAREHOUSE')); default `STORE`. |
| is_online_visible | boolean | NOT DEFAULT | Whether outlet can be shown on online/customer-facing surfaces; default `false`. |
| contact_phone | varchar(40) | NULL | Outlet contact phone. |
| contact_email | varchar(255) | NULL | Outlet contact email. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, outlet_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
CHECK(outlet_type IN ('STORE', 'WAREHOUSE'))
```

## outlet_addresses

Module: Outlet, Till & POS Device Foundation

Purpose: Stores outlet addresses records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | FK NULL | References `outlets(id)`. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| address_type | varchar(40) | CHECK | CHECK(address_type IN ('PHYSICAL', 'BILLING', 'PICKUP')) |
| address_line_1 | varchar(255) | NOT DEFAULT | Physical address line 1; default empty for existing rows. |
| address_line_2 | varchar(255) | NULL | Physical address line 2. |
| city | varchar(120) | NOT DEFAULT | City; default empty for existing rows. |
| state_or_province | varchar(120) | NULL | State, province, or region. |
| postal_code | varchar(30) | NULL | Postal code. |
| country_code | char(2) | NOT DEFAULT | ISO-style country code; default `LK` for existing rows. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
CHECK(address_type IN ('PHYSICAL', 'BILLING', 'PICKUP'))
```

## outlet_business_hours

Module: Outlet, Till & POS Device Foundation

Purpose: Stores outlet business hours records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| day_of_week | integer | UNIQUE CHECK | Unique business key. CHECK(day_of_week BETWEEN 0 AND 6) |
| open_time | time | CHECK | CHECK(open_time < close_time) |
| close_time | time | CHECK | CHECK(open_time < close_time) |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(outlet_id, day_of_week)
CHECK(day_of_week BETWEEN 0 AND 6)
CHECK(open_time < close_time)
```

## tills

Module: Outlet, Till & POS Device Foundation

Purpose: Stores tills records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| till_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(tenant_id, outlet_id, till_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## pos_devices

Module: Outlet, Till & POS Device Foundation

Purpose: Stores pos devices records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| outlet_id | uuid | FK NOT | References `outlets(id)`. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| device_code | varchar(80) | UNIQUE | Unique business key. |
| device_serial_number | varchar(80) | UNIQUE | Unique business key. Partial unique where device_serial_number IS NOT NULL. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(tenant_id, device_code)
UNIQUE(device_serial_number) WHERE device_serial_number IS NOT NULL
```

## till_device_assignments

Module: Outlet, Till & POS Device Foundation

Purpose: Stores till device assignments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| till_id | uuid | FK NULL UNIQUE | References `tills(id)`. Unique business key. |
| pos_device_id | uuid | FK NULL UNIQUE | References `pos_devices(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| effective_from | varchar(255) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_id) REFERENCES tills(id)
FK(pos_device_id) REFERENCES pos_devices(id)
UNIQUE(till_id, pos_device_id, effective_from)
```

## hardware_profiles

Module: Outlet, Till & POS Device Foundation

Purpose: Stores hardware profiles records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| name | varchar(200) | NOT | Display name. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| profile_code | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, profile_code)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
