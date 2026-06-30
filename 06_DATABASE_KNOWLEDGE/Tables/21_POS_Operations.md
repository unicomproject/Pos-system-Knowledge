<!-- title: POS Operations -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 21. POS Operations

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `pos_order_holds` | Stores pos order holds records for this module. |
| `receipts` | Stores receipts records for this module. |
| `receipt_print_logs` | Stores receipt print logs records for this module. |
| `receipt_templates` | Stores receipt templates records for this module. |
| `receipt_template_versions` | Stores receipt template versions records for this module. |
| `receipt_template_assignments` | Stores receipt template assignments records for this module. |
| `till_session_summaries` | Stores till session summaries records for this module. |
| `till_session_payment_summaries` | Stores till session payment summaries records for this module. |
| `till_session_events` | Stores till session events records for this module. |
| `till_cash_movements` | Stores till cash movements records for this module. |

## pos_order_holds

Module: POS Operations

Purpose: Stores pos order holds records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| hold_number | varchar(80) | UNIQUE | Unique business key. |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
UNIQUE(tenant_id, hold_number)
```

## receipts

Module: POS Operations

Purpose: Stores receipts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| document_number_sequence_id | uuid | FK NOT | References `document_number_sequences(id)`. |
| receipt_number | varchar(80) | UNIQUE | Unique business key. |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| total_amount | numeric(18,2) | CHECK | CHECK(total_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
UNIQUE(tenant_id, receipt_number)
CHECK(total_amount >= 0)
```

## receipt_print_logs

Module: POS Operations

Purpose: Stores receipt print logs records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| attempt_number | integer | UNIQUE CHECK | Unique business key. CHECK(attempt_number > 0) |
| receipt_id | uuid | FK NOT UNIQUE | References `receipts(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(receipt_id) REFERENCES receipts(id)
UNIQUE(receipt_id, attempt_number)
CHECK(attempt_number > 0)
```

## receipt_templates

Module: POS Operations

Purpose: Stores receipt templates records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| template_code | varchar(80) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| parent_template_id | uuid | FK NULL | References `receipt_templates(id)`. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, template_code)
FK(parent_template_id) REFERENCES receipt_templates(id)
```

## receipt_template_versions

Module: POS Operations

Purpose: Stores receipt template versions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| receipt_template_id | uuid | FK NOT UNIQUE | References `receipt_templates(id)`. Unique business key. |
| version_number | integer | UNIQUE CHECK | Unique business key. CHECK(version_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(receipt_template_id) REFERENCES receipt_templates(id)
UNIQUE(receipt_template_id, version_number)
CHECK(version_number > 0)
```

## receipt_template_assignments

Module: POS Operations

Purpose: Stores receipt template assignments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| outlet_id | uuid | CHECK | CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL)) |
| till_id | uuid | CHECK | CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL)) |
| pos_device_id | uuid | CHECK | CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL)) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| assignment_scope | varchar(40) | CHECK | CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL)) |
| receipt_template_version_id | uuid | FK NOT | References `receipt_template_versions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(receipt_template_version_id) REFERENCES receipt_template_versions(id)
CHECK((assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL) OR (assignment_scope = 'TILL' AND till_id IS NOT NULL) OR (assignment_scope = 'POS_DEVICE' AND pos_device_id IS NOT NULL))
```

## till_session_summaries

Module: POS Operations

Purpose: Stores till session summaries records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| order_count | integer | CHECK | CHECK(order_count >= 0) |
| refund_count | integer | CHECK | CHECK(refund_count >= 0) |
| till_session_id | uuid | FK NOT UNIQUE | References `till_sessions(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_id) REFERENCES till_sessions(id)
UNIQUE(till_session_id)
CHECK(order_count >= 0)
CHECK(refund_count >= 0)
```

## till_session_payment_summaries

Module: POS Operations

Purpose: Stores till session payment summaries records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| payment_method_id | uuid | FK NOT UNIQUE | References `payment_methods(id)`. Unique business key. |
| till_session_summary_id | uuid | FK NOT UNIQUE | References `till_session_summaries(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_summary_id) REFERENCES till_session_summaries(id)
FK(payment_method_id) REFERENCES payment_methods(id)
UNIQUE(till_session_summary_id, payment_method_id)
```

## till_session_events

Module: POS Operations

Purpose: Stores till session events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount IS NULL OR amount >= 0) |
| till_session_id | uuid | FK NOT | References `till_sessions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_id) REFERENCES till_sessions(id)
CHECK(amount IS NULL OR amount >= 0)
```

## till_cash_movements

Module: POS Operations

Purpose: Stores till cash movements records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount > 0) |
| till_session_id | uuid | FK NOT | References `till_sessions(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(till_session_id) REFERENCES till_sessions(id)
CHECK(amount > 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
