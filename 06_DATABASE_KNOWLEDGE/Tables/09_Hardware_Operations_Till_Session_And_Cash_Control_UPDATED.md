<!-- title: Hardware Operations, Till Session & Cash Control -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->
<!-- source: Updated from uploaded ERD image: 09_Hardware Operations, Till Session & Cash Control.png -->

# 09. Hardware Operations, Till Session & Cash Control

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module. It is aligned to the uploaded ERD image.

These tables are defined in schema/migration source. No complete Cashier
cash-movement mutation API or hardware-test logging workflow was verified.
Schema presence therefore does not make either journey operational. Live applied
database state was not verified.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD. Custom enum/domain datatypes are not used; domain fields are represented as `varchar(...)` with constraints/notes.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `hardware_devices` | Stores tenant outlet hardware devices such as printers, scanners, cash drawers, customer displays, payment terminals, or scales. |
| `hardware_device_assignments` | Assigns hardware devices to exactly one till or POS device, with release lifecycle. |
| `hardware_test_logs` | Stores append-only hardware test logs and result payloads. |
| `till_sessions` | Stores till opening/closing session lifecycle, operator, device, currency and float data. |
| `cash_movement_types` | Stores tenant/system cash movement type catalog and whether the type affects expected cash. |
| `cash_movements` | Stores cash in/out movements linked to till session and optional order/payment/refund reference. |
| `cash_reconciliations` | Stores cash reconciliation summary per till session. |
| `cash_count_denominations` | Stores counted cash denominations for a reconciliation. |

## `hardware_devices`

Purpose: Stores tenant outlet hardware devices such as printers, scanners, cash drawers, customer displays, payment terminals, or scales.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `hardware_profile_id` | uuid | FK | NULL | References hardware_profiles(id). |
| `hardware_device_code` | varchar(80) |  | NOT NULL | Tenant-scoped hardware device code. |
| `hardware_device_name` | varchar(150) |  | NOT NULL | Display name. |
| `hardware_device_type` | varchar(40) | CHECK | NOT NULL | Device type domain value; no enum datatype used. |
| `connection_type` | varchar(40) | CHECK | NOT NULL | Connection type domain value; no enum datatype used. |
| `manufacturer` | varchar(120) |  | NULL | Manufacturer name. |
| `model` | varchar(120) |  | NULL | Model name/number. |
| `serial_number` | varchar(120) |  | NULL | Manufacturer serial number. |
| `asset_tag` | varchar(100) |  | NULL | Internal asset tag. |
| `firmware_version` | varchar(80) |  | NULL | Firmware version. |
| `config_json` | jsonb |  | NULL | Device configuration payload. |
| `last_seen_at` | timestamptz |  | NULL | Last seen timestamp. |
| `status` | varchar(40) | CHECK | NOT NULL | Hardware device status domain value; no enum datatype used. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(hardware_profile_id) REFERENCES hardware_profiles(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, hardware_device_code)
CHECK(hardware_device_type <> '')
CHECK(connection_type <> '')
CHECK(status <> '')
```

## `hardware_device_assignments`

Purpose: Assigns hardware devices to exactly one till or POS device, with release lifecycle.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `hardware_device_id` | uuid | FK | NOT NULL | References hardware_devices(id). |
| `till_id` | uuid | FK | NULL | References tills(id). Exactly one of till_id or pos_device_id is required. |
| `pos_device_id` | uuid | FK | NULL | References pos_devices(id). Exactly one of till_id or pos_device_id is required. |
| `is_primary` | boolean | DEFAULT false | NOT NULL | Marks primary assignment for the target device/till. |
| `assigned_at` | timestamptz |  | NOT NULL | Assignment timestamp. |
| `assigned_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `released_at` | timestamptz |  | NULL | Release timestamp. |
| `released_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `release_reason` | text |  | NULL | Release reason. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(hardware_device_id) REFERENCES hardware_devices(id)
FK(till_id) REFERENCES tills(id)
FK(pos_device_id) REFERENCES pos_devices(id)
FK(assigned_by_tenant_user_id) REFERENCES tenant_users(id)
FK(released_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(num_nonnulls(till_id, pos_device_id) = 1)
UNIQUE(hardware_device_id) WHERE released_at IS NULL
```

## `hardware_test_logs`

Purpose: Stores append-only hardware test logs and result payloads.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `hardware_device_id` | uuid | FK | NOT NULL | References hardware_devices(id). |
| `initiated_from_pos_device_id` | uuid | FK | NULL | References pos_devices(id). |
| `tested_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `test_type` | varchar(40) | CHECK | NOT NULL | Hardware test type domain value; no enum datatype used. |
| `test_status` | varchar(40) | CHECK | NOT NULL | Hardware test status domain value; no enum datatype used. |
| `result_message` | text |  | NULL | Human-readable test result message. |
| `result_payload_json` | jsonb |  | NULL | Test result payload. |
| `tested_at` | timestamptz |  | NOT NULL | Test execution timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(hardware_device_id) REFERENCES hardware_devices(id)
FK(initiated_from_pos_device_id) REFERENCES pos_devices(id)
FK(tested_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(test_type <> '')
CHECK(test_status <> '')
Append-only log
```

## `till_sessions`

Purpose: Stores till opening/closing session lifecycle, operator, device, currency and float data.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `till_id` | uuid | FK | NOT NULL | References tills(id). |
| `session_number` | varchar(80) |  | NOT NULL | Tenant-scoped till session number. |
| `business_date` | date |  | NOT NULL | Business date for the till session. |
| `opened_by_tenant_user_id` | uuid | FK | NOT NULL | References tenant_users(id). |
| `closed_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `opened_from_pos_device_id` | uuid | FK | NOT NULL | References pos_devices(id). |
| `closed_from_pos_device_id` | uuid | FK | NULL | References pos_devices(id). |
| `opening_float_amount` | numeric(18,4) | DEFAULT 0 CHECK | NOT NULL | Opening cash float amount. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `status` | varchar(40) | CHECK | NOT NULL | Till session status domain value; no enum datatype used. |
| `opened_at` | timestamptz |  | NOT NULL | Opened timestamp. |
| `closed_at` | timestamptz |  | NULL | Closed timestamp. |
| `opening_note` | text |  | NULL | Opening note. |
| `closing_note` | text |  | NULL | Closing note. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(till_id) REFERENCES tills(id)
FK(opened_by_tenant_user_id) REFERENCES tenant_users(id)
FK(closed_by_tenant_user_id) REFERENCES tenant_users(id)
FK(opened_from_pos_device_id) REFERENCES pos_devices(id)
FK(closed_from_pos_device_id) REFERENCES pos_devices(id)
FK(currency_code) REFERENCES currencies(currency_code)
UNIQUE(tenant_id, session_number)
UNIQUE(till_id) WHERE closed_at IS NULL
CHECK(opening_float_amount >= 0)
CHECK(status <> '')
```

## `cash_movement_types`

Purpose: Stores tenant/system cash movement type catalog and whether the type affects expected cash.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NULL | References tenants(id). NULL can support system/default types. |
| `movement_type_code` | varchar(60) |  | NOT NULL | Movement type code. |
| `movement_type_name` | varchar(150) |  | NOT NULL | Movement type name. |
| `direction` | varchar(40) | CHECK | NOT NULL | Cash movement direction domain value; no enum datatype used. |
| `affects_expected_cash` | boolean |  | NOT NULL | Whether this movement changes expected cash. |
| `requires_reason` | boolean |  | NOT NULL | Whether reason is mandatory. |
| `is_system_type` | boolean |  | NOT NULL | System-defined movement type flag. |
| `status` | varchar(40) | CHECK | NOT NULL | Record status domain value; no enum datatype used. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, movement_type_code)
CHECK(direction <> '')
CHECK(status <> '')
```

## `cash_movements`

Purpose: Stores cash in/out movements linked to till session and optional order/payment/refund reference.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `till_id` | uuid | FK | NOT NULL | References tills(id). |
| `till_session_id` | uuid | FK | NOT NULL | References till_sessions(id). |
| `pos_device_id` | uuid | FK | NULL | References pos_devices(id). |
| `movement_type_id` | uuid | FK | NOT NULL | References cash_movement_types(id). |
| `movement_number` | varchar(80) |  | NOT NULL | Tenant-scoped movement number. |
| `amount` | numeric(18,4) | CHECK | NOT NULL | Cash movement amount. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `reason` | text |  | NULL | Movement reason. |
| `order_id` | uuid | FK | NULL | References orders(id). |
| `payment_id` | uuid | FK | NULL | References payments(id). |
| `refund_id` | uuid | FK | NULL | References refunds(id). |
| `performed_by_tenant_user_id` | uuid | FK | NOT NULL | References tenant_users(id). |
| `performed_at` | timestamptz |  | NOT NULL | Performed timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(till_id) REFERENCES tills(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(pos_device_id) REFERENCES pos_devices(id)
FK(movement_type_id) REFERENCES cash_movement_types(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(order_id) REFERENCES orders(id)
FK(payment_id) REFERENCES payments(id)
FK(refund_id) REFERENCES refunds(id)
FK(performed_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, movement_number)
CHECK(amount > 0)
CHECK(num_nonnulls(order_id, payment_id, refund_id) <= 1)
```

## `cash_reconciliations`

Purpose: Stores cash reconciliation summary per till session.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `till_session_id` | uuid | FK | NOT NULL | References till_sessions(id). |
| `reconciliation_number` | varchar(80) |  | NOT NULL | Tenant-scoped reconciliation number. |
| `expected_cash_amount` | numeric(18,4) | CHECK | NOT NULL | Expected cash amount. |
| `counted_cash_amount` | numeric(18,4) | CHECK | NOT NULL | Counted cash amount. |
| `difference_amount` | numeric(18,4) |  | NOT NULL | Difference amount. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `reconciliation_status` | varchar(40) | CHECK | NOT NULL | Reconciliation status domain value; no enum datatype used. |
| `difference_reason` | text |  | NULL | Reason for difference. |
| `calculation_details_json` | jsonb |  | NULL | Reconciliation calculation details. |
| `submitted_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `submitted_at` | timestamptz |  | NULL | Submitted timestamp. |
| `approved_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `approved_at` | timestamptz |  | NULL | Approved timestamp. |
| `approval_note` | text |  | NULL | Approval note. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(submitted_by_tenant_user_id) REFERENCES tenant_users(id)
FK(approved_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, reconciliation_number)
UNIQUE(tenant_id, till_session_id)
CHECK(expected_cash_amount >= 0)
CHECK(counted_cash_amount >= 0)
CHECK(reconciliation_status <> '')
```

## `cash_count_denominations`

Purpose: Stores counted cash denominations for a reconciliation.

| Attribute | Type | Key / Constraint | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `cash_reconciliation_id` | uuid | FK | NOT NULL | References cash_reconciliations(id). |
| `count_type` | varchar(40) | CHECK | NOT NULL | Cash count type domain value; no enum datatype used. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `denomination_value` | numeric(18,4) | CHECK | NOT NULL | Denomination value. |
| `quantity` | int | CHECK | NOT NULL | Counted quantity. |
| `line_total` | numeric(18,4) | CHECK | NOT NULL | Line total amount. |
| `counted_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `counted_at` | timestamptz |  | NOT NULL | Counted timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(cash_reconciliation_id) REFERENCES cash_reconciliations(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(counted_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, cash_reconciliation_id, count_type, currency_code, denomination_value)
CHECK(count_type <> '')
CHECK(denomination_value > 0)
CHECK(quantity >= 0)
CHECK(line_total >= 0)
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `outlets` | id uuid PK, tenant_id uuid FK | Outlet reference |
| `tills` | id uuid PK, outlet_id uuid FK | Till reference |
| `pos_devices` | id uuid PK, tenant_id uuid FK | POS device reference |
| `hardware_profiles` | id uuid PK, tenant_id uuid FK | Hardware profile reference |
| `tenant_users` | id uuid PK | User/audit reference |
| `currencies` | currency_code char(3) PK | Currency reference |
| `orders` | id uuid PK | Order reference |
| `payments` | id uuid PK | Payment reference |
| `refunds` | id uuid PK | Refund reference |

## Correct Relationship Summary

```text
hardware_devices 1 -> many hardware_device_assignments
hardware_devices 1 -> many hardware_test_logs
till_sessions 1 -> many cash_movements
till_sessions 1 -> 0..1 cash_reconciliations
cash_movement_types 1 -> many cash_movements
cash_reconciliations 1 -> many cash_count_denominations
```

## Module Notes

- Show only core operational relationships in the ERD; tenant/audit FK arrows may be omitted in diagrams for readability.
- `hardware_test_logs` is append-only.
- `cash_movements` allows at most one business reference among `order_id`, `payment_id`, and `refund_id`.
- A hardware assignment must target exactly one of `till_id` or `pos_device_id`.
- One active/open till session is allowed per till by `UNIQUE(till_id) WHERE closed_at IS NULL`.

## Related Files

- [[08_Outlet_Till_And_POS_Device_Foundation]]
- [[20_Unified_Order_And_Sales]]
- [[21_POS_Operations]]
- [[24_Payment_And_Refund]]
