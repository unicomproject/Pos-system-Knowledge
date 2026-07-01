<!-- title: Unified Order & Sales -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 20. Unified Order & Sales

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `document_number_sequences` | Stores document number sequences records for this module. |
| `sales_orders` | Stores unified sales order headers for POS and online store orders. |
| `sales_order_lines` | Stores sales order lines records for this module. |
| `sales_order_line_options` | Stores sales order line options records for this module. |
| `sales_order_line_components` | Stores sales order line components records for this module. |
| `sales_order_discounts` | Stores sales order discounts records for this module. |
| `sales_order_taxes` | Stores sales order taxes records for this module. |
| `sales_order_charges` | Stores sales order charges records for this module. |
| `sales_order_status_history` | Stores sales order status history records for this module. |
| `sales_order_line_status_history` | Stores sales order line status history records for this module. |

## document_number_sequences

Module: Unified Order & Sales

Purpose: Stores document number sequences records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| outlet_id | uuid | UNIQUE | Unique business key. |
| document_type | varchar(40) | UNIQUE | Unique business key. |
| document_subtype | varchar(40) | UNIQUE | Unique business key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| current_value | integer | CHECK | CHECK(current_value >= 0) |
| padding_length | integer | CHECK | CHECK(padding_length > 0) |
| sales_channel_id | uuid | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
UNIQUE(tenant_id, document_type, document_subtype, sales_channel_id, outlet_id)
CHECK(padding_length > 0)
CHECK(current_value >= 0)
```

## sales_orders

Module: Unified Order & Sales

Purpose: Stores unified sales order headers for POS and online store orders.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| document_number_sequence_id | uuid | FK NOT | References `document_number_sequences(id)`. |
| order_number | varchar(80) | UNIQUE | Unique business key. |
| paid_amount | numeric(18,2) | CHECK | CHECK(paid_amount >= 0) |
| total_amount | numeric(18,2) | CHECK | CHECK(total_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
UNIQUE(tenant_id, order_number)
CHECK(total_amount >= 0)
CHECK(paid_amount >= 0)
```

## sales_order_lines

Module: Unified Order & Sales

Purpose: Stores sales order lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| line_total_amount | numeric(18,2) | CHECK | CHECK(line_total_amount >= 0) |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sales_order_id | uuid | FK NULL UNIQUE | References `sales_orders(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
UNIQUE(sales_order_id, line_number)
CHECK(quantity > 0)
CHECK(line_total_amount >= 0)
```

## sales_order_line_options

Module: Unified Order & Sales

Purpose: Stores sales order line options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(quantity > 0)
CHECK(sort_order >= 0)
```

## sales_order_line_components

Module: Unified Order & Sales

Purpose: Stores sales order line components records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |
| sort_order | integer | CHECK | CHECK(sort_order >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(quantity > 0)
CHECK(sort_order >= 0)
```

## sales_order_discounts

Module: Unified Order & Sales

Purpose: Stores sales order discounts records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| application_sequence | integer | CHECK | CHECK(application_sequence > 0) |
| discount_amount | numeric(18,2) | CHECK | CHECK(discount_amount >= 0) |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(discount_amount >= 0)
CHECK(application_sequence > 0)
```

## sales_order_taxes

Module: Unified Order & Sales

Purpose: Stores sales order taxes records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |
| tax_amount | numeric(18,2) | CHECK | CHECK(tax_amount >= 0) |
| tax_rate_percent | numeric(9,4) | CHECK | CHECK(tax_rate_percent >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(tax_rate_percent >= 0)
CHECK(tax_amount >= 0)
```

## sales_order_charges

Module: Unified Order & Sales

Purpose: Stores sales order charges records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| charge_amount | numeric(18,2) | CHECK | CHECK(charge_amount >= 0) |
| sales_order_id | uuid | FK NULL | References `sales_orders(id)`. |
| sales_order_line_id | uuid | FK NULL | References `sales_order_lines(id)`. |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
CHECK(charge_amount >= 0)
```

## sales_order_status_history

Module: Unified Order & Sales

Purpose: Stores sales order status history records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_order_id | uuid | FK NULL UNIQUE | References `sales_orders(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_id) REFERENCES sales_orders(id)
UNIQUE(sales_order_id, sequence_number)
CHECK(sequence_number > 0)
```

## sales_order_line_status_history

Module: Unified Order & Sales

Purpose: Stores sales order line status history records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| sales_order_line_id | uuid | FK NULL UNIQUE | References `sales_order_lines(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
UNIQUE(sales_order_line_id, sequence_number)
CHECK(sequence_number > 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
