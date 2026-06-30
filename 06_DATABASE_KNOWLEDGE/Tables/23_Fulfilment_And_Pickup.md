<!-- title: Fulfilment & Pickup -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 23. Fulfilment & Pickup

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `fulfillment_methods` | Stores fulfillment methods records for this module. |
| `fulfillment_method_outlets` | Stores fulfillment method outlets records for this module. |
| `pickup_slots` | Stores pickup slots records for this module. |
| `pickup_slot_reservations` | Stores pickup slot reservations records for this module. |
| `fulfillment_orders` | Stores fulfillment orders records for this module. |
| `fulfillment_order_lines` | Stores fulfillment order lines records for this module. |
| `fulfillment_order_events` | Stores fulfillment order events records for this module. |
| `pickup_orders` | Stores customer pickup workflow headers for click and collect. |
| `pickup_order_events` | Stores pickup order events records for this module. |

## fulfillment_methods

Module: Fulfilment & Pickup

Purpose: Stores fulfillment methods records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| method_code | varchar(40) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| method_type | varchar(40) | CHECK | CHECK(method_type IN ('IMMEDIATE', 'PICKUP')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, method_code)
CHECK(method_type IN ('IMMEDIATE', 'PICKUP'))
```

## fulfillment_method_outlets

Module: Fulfilment & Pickup

Purpose: Stores fulfillment method outlets records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | FK NULL UNIQUE | References `outlets(id)`. Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| fulfillment_method_id | uuid | FK NOT UNIQUE | References `fulfillment_methods(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(fulfillment_method_id) REFERENCES fulfillment_methods(id)
FK(outlet_id) REFERENCES outlets(id)
UNIQUE(fulfillment_method_id, outlet_id)
```

## pickup_slots

Module: Fulfilment & Pickup

Purpose: Stores pickup slots records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| capacity | integer | CHECK | CHECK(capacity >= 0) |
| fulfillment_method_outlet_id | uuid | FK NOT UNIQUE | References `fulfillment_method_outlets(id)`. Unique business key. |
| reserved_count | integer | CHECK | CHECK(reserved_count >= 0) CHECK(reserved_count <= capacity) |
| slot_date | date | UNIQUE | Unique business key. |
| window_end | time | UNIQUE | Unique business key. |
| window_start | time | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(fulfillment_method_outlet_id) REFERENCES fulfillment_method_outlets(id)
UNIQUE(fulfillment_method_outlet_id, slot_date, window_start, window_end)
CHECK(capacity >= 0)
CHECK(reserved_count >= 0)
CHECK(reserved_count <= capacity)
```

## pickup_slot_reservations

Module: Fulfilment & Pickup

Purpose: Stores pickup slot reservations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_session_id | uuid | CHECK | CHECK(checkout_session_id IS NOT NULL OR sales_order_id IS NOT NULL) |
| pickup_slot_id | uuid | FK NOT | References `pickup_slots(id)`. |
| reserved_capacity | integer | CHECK | CHECK(reserved_capacity > 0) |
| sales_order_id | uuid | CHECK | CHECK(checkout_session_id IS NOT NULL OR sales_order_id IS NOT NULL) |

Source constraints from uploaded design:

```text
PK(id)
FK(pickup_slot_id) REFERENCES pickup_slots(id)
CHECK(reserved_capacity > 0)
CHECK(checkout_session_id IS NOT NULL OR sales_order_id IS NOT NULL)
```

## fulfillment_orders

Module: Fulfilment & Pickup

Purpose: Stores fulfillment orders records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| fulfillment_method_outlet_id | uuid | FK NOT | References `fulfillment_method_outlets(id)`. |
| fulfillment_number | varchar(80) | UNIQUE | Unique business key. |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(fulfillment_method_outlet_id) REFERENCES fulfillment_method_outlets(id)
UNIQUE(tenant_id, fulfillment_number)
```

## fulfillment_order_lines

Module: Fulfilment & Pickup

Purpose: Stores fulfillment order lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| fulfillment_order_id | uuid | FK NOT | References `fulfillment_orders(id)`. |
| requested_quantity | numeric(18,4) | CHECK | CHECK(requested_quantity > 0) |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(requested_quantity > 0)
```

## fulfillment_order_events

Module: Fulfilment & Pickup

Purpose: Stores fulfillment order events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| fulfillment_order_id | uuid | FK NOT UNIQUE | References `fulfillment_orders(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
UNIQUE(fulfillment_order_id, sequence_number)
CHECK(sequence_number > 0)
```

## pickup_orders

Module: Fulfilment & Pickup

Purpose: Stores customer pickup workflow headers for click and collect.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| fulfillment_order_id | uuid | FK NOT | References `fulfillment_orders(id)`. |
| pickup_number | varchar(80) | UNIQUE | Unique business key. |
| pickup_slot_reservation_id | uuid | FK NOT | References `pickup_slot_reservations(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(fulfillment_order_id) REFERENCES fulfillment_orders(id)
FK(pickup_slot_reservation_id) REFERENCES pickup_slot_reservations(id)
UNIQUE(tenant_id, pickup_number)
```

## pickup_order_events

Module: Fulfilment & Pickup

Purpose: Stores pickup order events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| pickup_order_id | uuid | FK NOT UNIQUE | References `pickup_orders(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(pickup_order_id) REFERENCES pickup_orders(id)
UNIQUE(pickup_order_id, sequence_number)
CHECK(sequence_number > 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
