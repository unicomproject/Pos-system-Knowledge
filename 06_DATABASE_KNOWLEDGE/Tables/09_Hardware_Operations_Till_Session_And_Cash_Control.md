<!-- title: Hardware Operations, Till Session & Cash Control -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 09. Hardware Operations, Till Session & Cash Control

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `hardware_devices` | Stores hardware devices records for this module. |
| `hardware_device_assignments` | Stores hardware device assignments records for this module. |
| `hardware_test_logs` | Stores hardware test logs records for this module. |
| `till_sessions` | Stores till sessions records for this module. |
| `cash_movement_types` | Stores cash movement types records for this module. |
| `cash_movements` | Stores cash movements records for this module. |
| `cash_reconciliations` | Stores cash reconciliations records for this module. |
| `cash_count_denominations` | Stores cash count denominations records for this module. |

## hardware_devices

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores hardware devices records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| outlet_id | uuid | FK NOT | References `outlets(id)`. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| hardware_device_code | varchar(80) | UNIQUE | Unique business key. |
| serial_number | varchar(80) | UNIQUE | Unique business key. Partial unique where serial_number IS NOT NULL. |

Source constraints from uploaded design:

```text
PK(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(tenant_id, hardware_device_code)
UNIQUE(serial_number) WHERE serial_number IS NOT NULL
```

## hardware_device_assignments

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores hardware device assignments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| pos_device_id | uuid | FK NULL UNIQUE | References `pos_devices(id)`. Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| effective_from | varchar(255) | UNIQUE | Unique business key. |
| hardware_device_id | uuid | FK NOT UNIQUE | References `hardware_devices(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(hardware_device_id) REFERENCES hardware_devices(id)
FK(pos_device_id) REFERENCES pos_devices(id)
UNIQUE(hardware_device_id, pos_device_id, effective_from)
```

## hardware_test_logs

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores hardware test logs records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| hardware_device_id | uuid | FK NOT | References `hardware_devices(id)`. |
| test_result | varchar(255) | CHECK | CHECK(test_result IN ('SUCCESS', 'FAILED', 'WARNING')) |

Source constraints from uploaded design:

```text
PK(id)
FK(hardware_device_id) REFERENCES hardware_devices(id)
CHECK(test_result IN ('SUCCESS', 'FAILED', 'WARNING'))
```

## till_sessions

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores till sessions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| till_id | uuid | FK NULL UNIQUE | References `tills(id)`. Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| closing_cash_amount | numeric(18,2) | CHECK | CHECK(closing_cash_amount IS NULL OR closing_cash_amount >= 0) |
| opened_by_tenant_user_id | uuid | FK NOT | References `tenant_users(id)`. |
| session_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_id) REFERENCES tills(id)
FK(opened_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, till_id, session_number)
CHECK(closing_cash_amount IS NULL OR closing_cash_amount >= 0)
```

## cash_movement_types

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores cash movement types records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| status | varchar(30) | CHECK | CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| movement_type_code | varchar(40) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, movement_type_code)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## cash_movements

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores cash movements records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount > 0) |
| cash_movement_type_id | uuid | FK NOT | References `cash_movement_types(id)`. |
| till_session_id | uuid | FK NOT | References `till_sessions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(cash_movement_type_id) REFERENCES cash_movement_types(id)
CHECK(amount > 0)
```

## cash_reconciliations

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores cash reconciliations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| counted_cash_amount | numeric(18,2) | CHECK | CHECK(counted_cash_amount >= 0) |
| expected_cash_amount | numeric(18,2) | CHECK | CHECK(expected_cash_amount >= 0) |
| till_session_id | uuid | FK NOT UNIQUE | References `till_sessions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_id) REFERENCES till_sessions(id)
UNIQUE(till_session_id)
CHECK(expected_cash_amount >= 0)
CHECK(counted_cash_amount >= 0)
```

## cash_count_denominations

Module: Hardware Operations, Till Session & Cash Control

Purpose: Stores cash count denominations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| cash_reconciliation_id | uuid | FK NOT UNIQUE | References `cash_reconciliations(id)`. Unique business key. |
| denomination_value | numeric(18,2) | UNIQUE CHECK | Unique business key. CHECK(denomination_value > 0) |
| quantity | numeric(18,4) | CHECK | CHECK(quantity >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(cash_reconciliation_id) REFERENCES cash_reconciliations(id)
CHECK(denomination_value > 0)
CHECK(quantity >= 0)
UNIQUE(cash_reconciliation_id, denomination_value)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
