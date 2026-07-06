<!-- title: 23. Fulfilment & Pickup -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-05 -->
<!-- source: 23_Fulfilment & Pickup ERD(3).png -->

# 23. Fulfilment & Pickup

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, indexes, and constraints were updated to match the ERD as closely as possible.

**Datatype rule:** application status/type domains are documented as `varchar(...)` plus `CHECK(...)` constraints. Database enum datatypes are not used.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `fulfillment_methods` | Stores fulfillment method master records. |
| `fulfillment_method_outlets` | Maps fulfillment methods to outlets. |
| `pickup_slots` | Stores pickup slots per fulfillment outlet. |
| `pickup_slot_reservations` | Stores reservation records for pickup slots. |
| `fulfillment_orders` | Stores fulfillment execution headers. |
| `fulfillment_order_lines` | Stores fulfillment order line execution quantities. |
| `fulfillment_order_events` | Stores append-only fulfillment event history. |
| `pickup_orders` | Stores customer pickup execution headers. |
| `pickup_order_events` | Stores append-only pickup event history. |

## `fulfillment_methods`

Purpose: Stores fulfillment method master records.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `method_code` | varchar(40) |  | NOT NULL | Tenant-scoped method code. |
| `method_name` | varchar(120) |  | NOT NULL | Display name. |
| `method_type` | varchar(40) |  | NOT NULL | Fulfillment method type. |
| `description` | text |  | NULL | Description or notes. |
| `requires_slot` | boolean |  | NOT NULL | Whether pickup slot is required. |
| `requires_preparation` | boolean |  | NOT NULL | Whether preparation is required. |
| `is_default` | boolean |  | NOT NULL | Default method flag. |
| `status` | varchar(30) |  | NOT NULL | Lifecycle status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, method_code)
CHECK(method_type IN ('IMMEDIATE', 'PICKUP'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `fulfillment_method_outlets`

Purpose: Maps fulfillment methods to outlets.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `fulfillment_method_id` | uuid | FK | NOT NULL | References fulfillment_methods(id). |
| `outlet_id` | uuid | FK | NOT NULL | References outlets(id). |
| `preparation_lead_minutes` | int |  | NULL | Preparation lead time. |
| `pickup_window_minutes` | int |  | NULL | Pickup window duration. |
| `cutoff_time` | time |  | NULL | Order cutoff time. |
| `status` | varchar(30) |  | NOT NULL | Lifecycle status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(fulfillment_method_id) REFERENCES fulfillment_methods(id)
FK(outlet_id) REFERENCES outlets(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, fulfillment_method_id, outlet_id)
CHECK(preparation_lead_minutes IS NULL OR preparation_lead_minutes >= 0)
CHECK(pickup_window_minutes IS NULL OR pickup_window_minutes > 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

## `pickup_slots`

Purpose: Stores pickup slots per fulfillment outlet.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `fulfillment_method_outlet_id` | uuid | FK | NOT NULL | References fulfillment_method_outlets(id). |
| `slot_code` | varchar(50) |  | NOT NULL | Slot code. |
| `slot_date` | date |  | NOT NULL | Slot date. |
| `window_start` | time |  | NOT NULL | Slot start time. |
| `window_end` | time |  | NOT NULL | Slot end time. |
| `capacity` | int |  | NOT NULL | Slot capacity. |
| `reserved_count` | int |  | NOT NULL | Reserved capacity count. |
| `slot_status` | varchar(40) |  | NOT NULL | Slot lifecycle status. |
| `row_version` | bigint |  | NOT NULL | Concurrency row version. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(fulfillment_method_outlet_id) REFERENCES fulfillment_method_outlets(id)
UNIQUE(tenant_id, fulfillment_method_outlet_id, slot_code)
CHECK(window_end > window_start)
CHECK(capacity >= 0)
CHECK(reserved_count >= 0)
CHECK(reserved_count <= capacity)
CHECK(row_version >= 0)
CHECK(slot_status IN ('OPEN', 'FULL', 'CLOSED', 'CANCELLED'))
```

## `pickup_slot_reservations`

Purpose: Stores reservation records for pickup slots.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `pickup_slot_id` | uuid | FK | NOT NULL | References pickup_slots(id). |
| `checkout_session_id` | uuid | FK | NULL | References checkout_sessions(id). |
| `sales_order_id` | uuid | FK | NULL | References sales_orders(id). |
| `reserved_capacity` | int |  | NOT NULL | Reserved capacity count. |
| `reservation_status` | varchar(40) |  | NOT NULL | Reservation lifecycle status. |
| `expires_at` | timestamptz |  | NULL | Reservation expiry timestamp. |
| `confirmed_at` | timestamptz |  | NULL | Confirmation timestamp. |
| `released_at` | timestamptz |  | NULL | Release timestamp. |
| `release_reason` | varchar(250) |  | NULL | Release reason. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(pickup_slot_id) REFERENCES pickup_slots(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
FK(sales_order_id) REFERENCES sales_orders(id)
CHECK(reserved_capacity > 0)
CHECK(checkout_session_id IS NOT NULL OR sales_order_id IS NOT NULL)
CHECK(reservation_status IN ('PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED', 'CANCELLED'))
Active reservation per checkout session business rule.
```

## `fulfillment_orders`

Purpose: Stores fulfillment execution headers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `document_number_sequence_id` | uuid | FK | NULL | References document_number_sequences(id). |
| `sales_order_id` | uuid | FK | NOT NULL | References sales_orders(id). |
| `fulfillment_number` | varchar(80) |  | NOT NULL | Tenant-scoped fulfillment number. |
| `fulfillment_method_outlet_id` | uuid | FK | NOT NULL | References fulfillment_method_outlets(id). |
| `source_inventory_location_id` | uuid | FK | NULL | References inventory_locations(id). |
| `fulfillment_status` | varchar(40) |  | NOT NULL | Fulfillment lifecycle status. |
| `requested_fulfillment_date` | date |  | NULL | Requested fulfillment date. |
| `scheduled_at` | timestamptz |  | NULL | Scheduled timestamp. |
| `picked_at` | timestamptz |  | NULL | Picked timestamp. |
| `packed_at` | timestamptz |  | NULL | Packed timestamp. |
| `ready_at` | timestamptz |  | NULL | Ready timestamp. |
| `fulfilled_at` | timestamptz |  | NULL | Fulfilled timestamp. |
| `cancelled_at` | timestamptz |  | NULL | Cancelled timestamp. |
| `cancellation_reason` | text |  | NULL | Cancellation reason. |
| `assigned_to_tenant_user_id` | uuid | FK | NULL | Assigned tenant user. |
| `fulfillment_note` | text |  | NULL | Fulfillment note. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(fulfillment_method_outlet_id) REFERENCES fulfillment_method_outlets(id)
FK(source_inventory_location_id) REFERENCES inventory_locations(id)
FK(assigned_to_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, fulfillment_number)
CHECK(fulfillment_status IN ('PENDING', 'ALLOCATED', 'PICKING', 'PICKED', 'PACKED', 'READY', 'FULFILLED', 'CANCELLED'))
```

## `fulfillment_order_lines`

Purpose: Stores fulfillment order line execution quantities.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `fulfillment_order_id` | uuid | FK | NOT NULL | References fulfillment_orders(id). |
| `sales_order_line_id` | uuid | FK | NOT NULL | References sales_order_lines(id). |
| `sales_order_line_component_id` | uuid | FK | NULL | References sales_order_line_components(id). |
| `requested_quantity` | numeric(18,4) |  | NOT NULL | Requested quantity. |
| `picked_quantity` | numeric(18,4) |  | NOT NULL | Picked quantity. |
| `packed_quantity` | numeric(18,4) |  | NOT NULL | Packed quantity. |
| `fulfilled_quantity` | numeric(18,4) |  | NOT NULL | Fulfilled quantity. |
| `cancelled_quantity` | numeric(18,4) |  | NOT NULL | Cancelled quantity. |
| `line_status` | varchar(40) |  | NOT NULL | Fulfillment line status. |
| `picked_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `packed_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(sales_order_line_component_id) REFERENCES sales_order_line_components(id)
FK(picked_by_tenant_user_id) REFERENCES tenant_users(id)
FK(packed_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(requested_quantity > 0)
CHECK(picked_quantity >= 0)
CHECK(packed_quantity >= 0)
CHECK(fulfilled_quantity >= 0)
CHECK(cancelled_quantity >= 0)
CHECK(line_status IN ('PENDING', 'PICKING', 'PICKED', 'PACKED', 'FULFILLED', 'CANCELLED'))
Combo component row when sales_order_line_component_id is present.
```

## `fulfillment_order_events`

Purpose: Stores append-only fulfillment event history.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `fulfillment_order_id` | uuid | FK | NOT NULL | References fulfillment_orders(id). |
| `sequence_number` | int |  | NOT NULL | Event sequence number. |
| `event_type` | varchar(40) |  | NOT NULL | Fulfillment event type. |
| `old_status` | varchar(40) |  | NULL | Previous fulfillment status. |
| `new_status` | varchar(40) |  | NULL | New fulfillment status. |
| `event_note` | text |  | NULL | Event note. |
| `event_payload_json` | jsonb |  | NULL | Event payload. |
| `event_at` | timestamptz |  | NOT NULL | Event timestamp. |
| `event_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
FK(event_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, fulfillment_order_id, sequence_number)
CHECK(sequence_number > 0)
Append-only event history.
```

## `pickup_orders`

Purpose: Stores customer pickup execution headers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `document_number_sequence_id` | uuid | FK | NULL | References document_number_sequences(id). |
| `fulfillment_order_id` | uuid | FK | NOT NULL | References fulfillment_orders(id). |
| `pickup_slot_reservation_id` | uuid | FK | NULL | References pickup_slot_reservations(id). |
| `pickup_number` | varchar(80) |  | NOT NULL | Tenant-scoped pickup number. |
| `pickup_contact_name` | varchar(150) |  | NOT NULL | Pickup contact name. |
| `pickup_contact_phone` | varchar(50) |  | NULL | Pickup contact phone. |
| `pickup_contact_email` | varchar(150) |  | NULL | Pickup contact email. |
| `pickup_contact_channel` | varchar(40) |  | NULL | Pickup contact channel. |
| `pickup_status` | varchar(40) |  | NOT NULL | Pickup lifecycle status. |
| `pickup_note` | text |  | NULL | Pickup note. |
| `pickup_qr_token_hash` | varchar(255) |  | NULL | Pickup QR token hash. |
| `pickup_qr_version` | int |  | NULL | Pickup QR version. |
| `pickup_qr_expires_at` | timestamptz |  | NULL | Pickup QR expiry. |
| `verification_method` | varchar(40) |  | NULL | Pickup verification method. |
| `verified_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `verified_at` | timestamptz |  | NULL | Verified timestamp. |
| `collected_at` | timestamptz |  | NULL | Collected timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
FK(pickup_slot_reservation_id) REFERENCES pickup_slot_reservations(id)
FK(verified_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, pickup_number)
UNIQUE(tenant_id, fulfillment_order_id)
CHECK(pickup_status IN ('PENDING', 'READY', 'VERIFIED', 'COLLECTED', 'CANCELLED', 'EXPIRED'))
CHECK(pickup_qr_version IS NULL OR pickup_qr_version > 0)
```

## `pickup_order_events`

Purpose: Stores append-only pickup event history.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `pickup_order_id` | uuid | FK | NOT NULL | References pickup_orders(id). |
| `sequence_number` | int |  | NOT NULL | Event sequence number. |
| `event_type` | varchar(40) |  | NOT NULL | Pickup event type. |
| `old_status` | varchar(40) |  | NULL | Previous pickup status. |
| `new_status` | varchar(40) |  | NULL | New pickup status. |
| `event_note` | text |  | NULL | Event note. |
| `event_payload_json` | jsonb |  | NULL | Event payload. |
| `event_at` | timestamptz |  | NOT NULL | Event timestamp. |
| `event_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(pickup_order_id) REFERENCES pickup_orders(id)
FK(event_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, pickup_order_id, sequence_number)
CHECK(sequence_number > 0)
Append-only pickup event history.
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |
| `checkout_sessions` | id uuid PK, tenant_id uuid FK | Checkout reservation reference |
| `sales_orders` | id uuid PK, tenant_id uuid FK | Sales order reference |
| `sales_order_lines` | id uuid PK, tenant_id uuid FK | Order line reference |
| `sales_order_line_components` | id uuid PK, tenant_id uuid FK | Combo component reference |
| `outlets` | id uuid PK, tenant_id uuid FK | Outlet reference |
| `inventory_locations` | id uuid PK, tenant_id uuid FK | Inventory location reference |
| `document_number_sequences` | id uuid PK, tenant_id uuid FK | Document number sequence reference |

## Module Notes

- This file follows the uploaded image, which contains 9 main tables.
- All event tables are append-only histories.
- All type/status fields are written as `varchar(...)` plus CHECK constraints instead of database enum datatypes.

## Related Files

- [[20_Unified_Order_And_Sales]]
- [[22_Cart_And_Checkout]]
- [[28_Offline_Operation_And_Sync]]
