<!-- title: Return, Inspection & Exchange -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 25. Return, Inspection & Exchange

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `return_reasons` | Stores return reasons records for this module. |
| `sales_returns` | Stores sales returns records for this module. |
| `sales_return_lines` | Stores sales return lines records for this module. |
| `return_inspections` | Stores return inspections records for this module. |
| `sales_return_events` | Stores sales return events records for this module. |
| `sales_exchanges` | Stores sales exchanges records for this module. |
| `sales_exchange_lines` | Stores sales exchange lines records for this module. |
| `sales_exchange_events` | Stores sales exchange events records for this module. |

## return_reasons

Module: Return, Inspection & Exchange

Purpose: Stores return reasons records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| reason_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| applies_to | varchar(255) | CHECK | CHECK(applies_to IN ('RETURN', 'EXCHANGE', 'BOTH')) |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, reason_code)
CHECK(applies_to IN ('RETURN', 'EXCHANGE', 'BOTH'))
```

## sales_returns

Module: Return, Inspection & Exchange

Purpose: Stores sales returns records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| return_number | varchar(80) | UNIQUE | Unique business key. |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| total_refund_amount | numeric(18,2) | CHECK | CHECK(total_refund_amount >= 0) |
| total_return_amount | numeric(18,2) | CHECK | CHECK(total_return_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
UNIQUE(tenant_id, return_number)
CHECK(total_return_amount >= 0)
CHECK(total_refund_amount >= 0)
```

## sales_return_lines

Module: Return, Inspection & Exchange

Purpose: Stores sales return lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| requested_quantity | numeric(18,4) | CHECK | CHECK(requested_quantity > 0) |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |
| sales_return_id | uuid | FK NULL | References `sales_returns(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_return_id) REFERENCES sales_returns(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(requested_quantity > 0)
```

## return_inspections

Module: Return, Inspection & Exchange

Purpose: Stores return inspections records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| inspected_quantity | numeric(18,4) | CHECK | CHECK(inspected_quantity >= 0) |
| inspection_number | varchar(80) | UNIQUE | Unique business key. |
| sales_return_line_id | uuid | FK NOT | References `sales_return_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_return_line_id) REFERENCES sales_return_lines(id)
UNIQUE(tenant_id, inspection_number)
CHECK(inspected_quantity >= 0)
```

## sales_return_events

Module: Return, Inspection & Exchange

Purpose: Stores sales return events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_return_id | uuid | FK NULL UNIQUE | References `sales_returns(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_return_id) REFERENCES sales_returns(id)
UNIQUE(sales_return_id, sequence_number)
CHECK(sequence_number > 0)
```

## sales_exchanges

Module: Return, Inspection & Exchange

Purpose: Stores sales exchanges records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| additional_amount | numeric(18,2) | CHECK | CHECK(additional_amount >= 0) |
| exchange_number | varchar(80) | UNIQUE | Unique business key. |
| refund_amount | numeric(18,2) | CHECK | CHECK(refund_amount >= 0) |
| replacement_order_id | uuid | FK NOT | References `sales_orders(id)`. |
| sales_return_id | uuid | FK NULL | References `sales_returns(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_return_id) REFERENCES sales_returns(id)
FK(replacement_order_id) REFERENCES sales_orders(id)
UNIQUE(tenant_id, exchange_number)
CHECK(additional_amount >= 0)
CHECK(refund_amount >= 0)
```

## sales_exchange_lines

Module: Return, Inspection & Exchange

Purpose: Stores sales exchange lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| replacement_quantity | numeric(18,4) | CHECK | CHECK(replacement_quantity >= 0) |
| returned_quantity | numeric(18,4) | CHECK | CHECK(returned_quantity > 0) |
| sales_exchange_id | uuid | FK NOT | References `sales_exchanges(id)`. |
| sales_return_line_id | uuid | FK NOT | References `sales_return_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_exchange_id) REFERENCES sales_exchanges(id)
FK(sales_return_line_id) REFERENCES sales_return_lines(id)
CHECK(returned_quantity > 0)
CHECK(replacement_quantity >= 0)
```

## sales_exchange_events

Module: Return, Inspection & Exchange

Purpose: Stores sales exchange events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_exchange_id | uuid | FK NOT UNIQUE | References `sales_exchanges(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_exchange_id) REFERENCES sales_exchanges(id)
UNIQUE(sales_exchange_id, sequence_number)
CHECK(sequence_number > 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
