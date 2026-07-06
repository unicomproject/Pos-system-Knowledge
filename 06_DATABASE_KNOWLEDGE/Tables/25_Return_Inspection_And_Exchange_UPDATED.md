<!-- title: Return, Inspection & Exchange -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Updated from uploaded ERD image: 25_Return, Inspection & Exchange ERD(1).png -->

# 25. Return, Inspection & Exchange

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `return_reasons` | Stores return/exchange reason setup. |
| `sales_returns` | Stores sales return headers. |
| `sales_return_lines` | Stores returned line quantities and values. |
| `return_inspections` | Stores inspection and restock decisions for returned lines. |
| `sales_return_events` | Stores append-only return lifecycle audit. |
| `sales_exchanges` | Stores exchange headers linked to return and replacement order. |
| `sales_exchange_lines` | Stores line-level exchange mapping. |
| `sales_exchange_events` | Stores append-only exchange lifecycle audit. |

## `return_reasons`

Purpose: Stores return/exchange reason setup.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `reason_code` | varchar(80) |  | NOT NULL |  |
| `reason_name` | varchar(150) |  | NOT NULL |  |
| `applies_to` | varchar(40) |  | NOT NULL |  |
| `requires_inspection` | boolean |  | NOT NULL DEFAULT false |  |
| `is_active` | boolean |  | NOT NULL DEFAULT true |  |
| `sort_order` | int |  | NOT NULL DEFAULT 0 |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, reason_code)
```

## `sales_returns`

Purpose: Stores sales return headers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `document_number_sequence_id` | uuid | FK | NULL |  |
| `sales_order_id` | uuid | FK | NOT NULL |  |
| `customer_id` | uuid | FK | NULL |  |
| `outlet_id` | uuid | FK | NULL |  |
| `return_reason_id` | uuid | FK | NULL |  |
| `return_number` | varchar(80) |  | NOT NULL |  |
| `return_channel` | varchar(40) |  | NOT NULL |  |
| `return_status` | varchar(30) |  | NOT NULL |  |
| `requested_at` | timestamptz |  | NOT NULL |  |
| `approved_at` | timestamptz |  | NULL |  |
| `received_at` | timestamptz |  | NULL |  |
| `completed_at` | timestamptz |  | NULL |  |
| `cancelled_at` | timestamptz |  | NULL |  |
| `total_requested_qty` | numeric(18,4) |  | NOT NULL |  |
| `total_received_qty` | numeric(18,4) |  | NOT NULL |  |
| `total_refund_amount` | numeric(18,4) |  | NOT NULL |  |
| `total_exchange_amount` | numeric(18,4) |  | NOT NULL |  |
| `notes` | text |  | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, return_number)
```

## `sales_return_lines`

Purpose: Stores returned line quantities and values.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sales_return_id` | uuid | FK | NOT NULL |  |
| `sales_order_line_id` | uuid | FK | NOT NULL |  |
| `return_reason_id` | uuid | FK | NULL |  |
| `quantity_requested` | numeric(18,4) |  | NOT NULL |  |
| `quantity_received` | numeric(18,4) |  | NULL |  |
| `unit_price_snapshot` | numeric(18,4) |  | NOT NULL |  |
| `unit_tax_amount_snapshot` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `line_subtotal_amount` | numeric(18,4) |  | NOT NULL |  |
| `line_tax_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `disposition_status` | varchar(30) |  | NULL |  |
| `notes` | text |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
One line per returned sales_order_line item
```

## `return_inspections`

Purpose: Stores inspection and restock decisions for returned lines.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sales_return_line_id` | uuid | FK | NOT NULL |  |
| `inspected_by_tenant_user_id` | uuid | FK | NULL |  |
| `inventory_location_id` | uuid | FK | NULL |  |
| `inspection_status` | varchar(30) |  | NOT NULL |  |
| `condition_code` | varchar(40) |  | NULL |  |
| `restock_decision` | varchar(30) |  | NOT NULL |  |
| `restock_quantity` | numeric(18,4) |  | NULL |  |
| `reject_quantity` | numeric(18,4) |  | NULL |  |
| `inspection_notes` | text |  | NULL |  |
| `inspected_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
Inspection / restock decision support
```

## `sales_return_events`

Purpose: Stores append-only return lifecycle audit.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sales_return_id` | uuid | FK | NOT NULL |  |
| `event_type` | varchar(40) |  | NOT NULL |  |
| `old_status` | varchar(30) |  | NULL |  |
| `new_status` | varchar(30) |  | NULL |  |
| `event_notes` | text |  | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
Append-only return lifecycle audit
```

## `sales_exchanges`

Purpose: Stores exchange headers linked to return and replacement order.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `document_number_sequence_id` | uuid | FK | NULL |  |
| `sales_return_id` | uuid | FK | NULL |  |
| `replacement_sales_order_id` | uuid | FK | NULL |  |
| `exchange_number` | varchar(80) |  | NOT NULL |  |
| `exchange_status` | varchar(30) |  | NOT NULL |  |
| `exchange_mode` | varchar(30) |  | NOT NULL |  |
| `price_difference_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `additional_payment_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `refund_back_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `completed_at` | timestamptz |  | NULL |  |
| `cancelled_at` | timestamptz |  | NULL |  |
| `notes` | text |  | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, exchange_number)
```

## `sales_exchange_lines`

Purpose: Stores line-level exchange mapping.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sales_exchange_id` | uuid | FK | NOT NULL |  |
| `sales_return_line_id` | uuid | FK | NULL |  |
| `replacement_product_id` | uuid | FK | NULL |  |
| `replacement_product_variant_id` | uuid | FK | NULL |  |
| `replacement_sales_order_line_id` | uuid | FK | NULL |  |
| `quantity` | numeric(18,4) |  | NOT NULL |  |
| `original_line_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `replacement_line_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `net_difference_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 |  |
| `exchange_action_type` | varchar(40) |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
Line-level exchange mapping
```

## `sales_exchange_events`

Purpose: Stores append-only exchange lifecycle audit.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `sales_exchange_id` | uuid | FK | NOT NULL |  |
| `event_type` | varchar(40) |  | NOT NULL |  |
| `old_status` | varchar(30) |  | NULL |  |
| `new_status` | varchar(30) |  | NULL |  |
| `event_notes` | text |  | NULL |  |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
Append-only exchange lifecycle audit
```



## Status And Type Check Constraints

```text
CHECK(return_reasons.sort_order >= 0)
CHECK(sales_returns.total_requested_qty >= 0)
CHECK(sales_returns.total_received_qty >= 0)
CHECK(sales_returns.total_refund_amount >= 0)
CHECK(sales_returns.total_exchange_amount >= 0)
CHECK(sales_return_lines.quantity_requested > 0)
CHECK(sales_return_lines.quantity_received IS NULL OR sales_return_lines.quantity_received >= 0)
CHECK(return_inspections.restock_quantity IS NULL OR return_inspections.restock_quantity >= 0)
CHECK(return_inspections.reject_quantity IS NULL OR return_inspections.reject_quantity >= 0)
CHECK(sales_exchanges.price_difference_amount >= 0)
CHECK(sales_exchanges.additional_payment_amount >= 0)
CHECK(sales_exchanges.refund_back_amount >= 0)
CHECK(sales_exchange_lines.quantity > 0)
CHECK(sales_exchange_lines.original_line_amount >= 0)
CHECK(sales_exchange_lines.replacement_line_amount >= 0)
CHECK(sales_exchange_lines.net_difference_amount >= 0)
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |
| `document_number_sequences` | id uuid PK, tenant_id uuid FK | Document number sequence reference |
| `customers` | id uuid PK, tenant_id uuid FK | Customer reference |
| `outlets` | id uuid PK, tenant_id uuid FK | Outlet reference |
| `sales_orders` | id uuid PK, tenant_id uuid FK | Sales order reference |
| `sales_order_lines` | id uuid PK, sales_order_id uuid FK | Order line reference |
| `inventory_locations` | id uuid PK, tenant_id uuid FK | Inventory location reference |
| `products` | id uuid PK, tenant_id uuid FK | Product reference |
| `product_variants` | id uuid PK, product_id uuid FK | Product variant reference |

## Related Files

- [[20_Unified_Order_And_Sales]]
- [[24_Payment_And_Refund]]
- [[23_Fulfilment_And_Pickup]]