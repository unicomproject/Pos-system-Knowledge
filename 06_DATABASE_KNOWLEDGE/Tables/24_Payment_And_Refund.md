<!-- title: Payment & Refund -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 24. Payment & Refund

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `payment_methods` | Stores payment methods records for this module. |
| `sales_payments` | Stores sales payments records for this module. |
| `sales_payment_transactions` | Stores sales payment transactions records for this module. |
| `sales_payment_events` | Stores sales payment events records for this module. |
| `sales_refunds` | Stores sales refunds records for this module. |
| `sales_refund_payment_allocations` | Stores sales refund payment allocations records for this module. |
| `sales_refund_lines` | Stores sales refund lines records for this module. |

## payment_methods

Module: Payment & Refund

Purpose: Stores payment methods records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| method_code | varchar(40) | UNIQUE | Unique business key. |
| name | varchar(200) | NOT | Display name. |
| description | text | NULL | Description or notes. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| method_type | varchar(40) | CHECK | CHECK(method_type IN ('CASH', 'CARD', 'QR', 'BANK_TRANSFER', 'MANUAL', 'OTHER')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, method_code)
CHECK(method_type IN ('CASH', 'CARD', 'QR', 'BANK_TRANSFER', 'MANUAL', 'OTHER'))
```

## sales_payments

Module: Payment & Refund

Purpose: Stores sales payments records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| paid_amount | numeric(18,2) | CHECK | CHECK(paid_amount >= 0) |
| payment_method_id | uuid | FK NOT | References `payment_methods(id)`. |
| payment_number | varchar(80) | UNIQUE | Unique business key. |
| requested_amount | numeric(18,2) | CHECK | CHECK(requested_amount >= 0) |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(payment_method_id) REFERENCES payment_methods(id)
UNIQUE(tenant_id, payment_number)
CHECK(requested_amount >= 0)
CHECK(paid_amount >= 0)
```

## sales_payment_transactions

Module: Payment & Refund

Purpose: Stores sales payment transactions records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount >= 0) |
| idempotency_key | varchar(120) | UNIQUE | Unique business key. Partial unique where idempotency_key IS NOT NULL. |
| sales_payment_id | uuid | FK NOT | References `sales_payments(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_payment_id) REFERENCES sales_payments(id)
CHECK(amount >= 0)
UNIQUE(idempotency_key) WHERE idempotency_key IS NOT NULL
```

## sales_payment_events

Module: Payment & Refund

Purpose: Stores sales payment events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_payment_id | uuid | FK NOT UNIQUE | References `sales_payments(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_payment_id) REFERENCES sales_payments(id)
UNIQUE(sales_payment_id, sequence_number)
CHECK(sequence_number > 0)
```

## sales_refunds

Module: Payment & Refund

Purpose: Stores sales refunds records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| refund_number | varchar(80) | UNIQUE | Unique business key. |
| refunded_amount | numeric(18,2) | CHECK | CHECK(refunded_amount >= 0) |
| requested_amount | numeric(18,2) | CHECK | CHECK(requested_amount >= 0) |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| sales_return_id | uuid | FK NULL | References `sales_returns(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_return_id) REFERENCES sales_returns(id)
UNIQUE(tenant_id, refund_number)
CHECK(requested_amount >= 0)
CHECK(refunded_amount >= 0)
```

## sales_refund_payment_allocations

Module: Payment & Refund

Purpose: Stores sales refund payment allocations records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| allocated_amount | numeric(18,2) | CHECK | CHECK(allocated_amount > 0) |
| original_sales_payment_id | uuid | FK NOT | References `sales_payments(id)`. |
| sales_refund_id | uuid | FK NOT | References `sales_refunds(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_refund_id) REFERENCES sales_refunds(id)
FK(original_sales_payment_id) REFERENCES sales_payments(id)
CHECK(allocated_amount > 0)
```

## sales_refund_lines

Module: Payment & Refund

Purpose: Stores sales refund lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| amount | numeric(18,2) | CHECK | CHECK(amount >= 0) |
| sales_refund_id | uuid | FK NOT | References `sales_refunds(id)`. |
| sales_return_line_id | uuid | FK NOT | References `sales_return_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_refund_id) REFERENCES sales_refunds(id)
FK(sales_return_line_id) REFERENCES sales_return_lines(id)
CHECK(amount >= 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
