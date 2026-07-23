<!-- title: Return, Inspection & Exchange -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-17 -->
<!-- source: Updated from uploaded ERD image: 25_Return, Inspection & Exchange ERD(1).png -->

# 25. Return, Inspection & Exchange

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, and notes were updated to match the ERD.

## Entity Tables

| Table                   | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `return_reasons`        | Stores return/exchange reason setup.                            |
| `sales_returns`         | Stores sales return headers.                                    |
| `sales_return_lines`    | Stores returned line quantities and values.                     |
| `return_inspections`    | Stores inspection and restock decisions for returned lines.     |
| `return_inspection_drafts` | Durable Step 6 inspection draft before final return lines.   |
| `return_inspection_draft_lines` | Per-line condition/notes for inspection drafts.         |
| `return_inspection_conditions` | Tenant condition master data for Step 6.                 |
| `return_inspection_media_staging` | Temporary photo staging with lifecycle status.         |
| `return_inspection_media` | Final photo links to `return_inspections`.                    |
| `sales_return_events`   | Stores append-only return lifecycle audit.                      |
| `sales_exchanges`       | Stores exchange headers linked to return and replacement order. |
| `sales_exchange_lines`  | Stores line-level exchange mapping.                             |
| `sales_exchange_events` | Stores append-only exchange lifecycle audit.                    |

## `return_reasons`

Purpose: Stores return/exchange reason setup.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `reason_code` | varchar(80) |  | NOT NULL |  |
| `reason_name` | varchar(150) |  | NOT NULL |  |
| `description` | varchar(500) |  | NULL | Optional cashier guidance |
| `applies_to` | varchar(40) |  | NOT NULL | `RETURN` / `EXCHANGE` / `BOTH` |
| `requires_note` | boolean |  | NOT NULL DEFAULT false | Database-driven note requirement |
| `requires_inspection` | boolean |  | NOT NULL DEFAULT false |  |
| `requires_manager_approval` | boolean |  | NOT NULL DEFAULT false | Reason-level approval flag |
| `is_active` | boolean |  | NOT NULL DEFAULT true |  |
| `sort_order` | int |  | NOT NULL DEFAULT 0 |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, reason_code)
UNIQUE(tenant_id, id)
CHECK(applies_to IN ('RETURN', 'EXCHANGE', 'BOTH'))
CHECK(sort_order >= 0)
```

Migration: `20260717140000_HardenReturnReasonsConfigurableFlags`

## `return_inspection_conditions`

Purpose: Tenant condition master catalog for Step 6.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `condition_code` | varchar(40) |  | NOT NULL |  |
| `display_name` | varchar(150) |  | NOT NULL |  |
| `description` | text |  | NULL |  |
| `status_category` | varchar(30) |  | NOT NULL | `GOOD` / `WARNING` / `DANGER` |
| `is_resellable` | boolean |  | NOT NULL | Drives restock vs reject at completion |
| `refund_impact` | varchar(30) |  | NOT NULL | `NONE` / `PARTIAL` / `FULL_DENIAL` |
| `requires_notes` | boolean |  | NOT NULL |  |
| `requires_photo` | boolean |  | NOT NULL |  |
| `requires_approval` | boolean |  | NOT NULL | Blocks completion when set |
| `is_active` | boolean |  | NOT NULL DEFAULT true |  |
| `sort_order` | int |  | NOT NULL DEFAULT 0 |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, condition_code)
UNIQUE(tenant_id, id)
CHECK(sort_order >= 0)
CHECK(status_category IN ('GOOD', 'WARNING', 'DANGER'))
CHECK(refund_impact IN ('NONE', 'PARTIAL', 'FULL_DENIAL'))
```

Migration: `20260717150000_HardenReturnInspectionDraftMediaLifecycle` (CHECK restoration + composite FK support index)

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
| `idempotency_key` | varchar(120) |  | NULL | Durable refund completion idempotency (nullable for legacy/exchange-linked returns). |
| `created_by_tenant_user_id` | uuid | FK | NULL |  |
| `updated_by_tenant_user_id` | uuid | FK | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |
| `updated_at` | timestamptz |  | NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, return_number)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
```

Migration: `20260718120000_AddSalesReturnRefundIdempotencyKey`

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
| `sales_return_line_id` | uuid | FK | NOT NULL | Created only after final `sales_return_lines` exist |
| `inspected_by_tenant_user_id` | uuid | FK | NULL |  |
| `inventory_location_id` | uuid | FK | NULL |  |
| `inspection_status` | varchar(30) |  | NOT NULL |  |
| `condition_code` | varchar(40) |  | NULL | Snapshot from condition catalog |
| `restock_decision` | varchar(30) |  | NOT NULL | `RESTOCK` / `REJECT` |
| `restock_quantity` | numeric(18,4) |  | NULL | Non-negative when present |
| `reject_quantity` | numeric(18,4) |  | NULL | Non-negative when present |
| `inspection_notes` | text |  | NULL |  |
| `inspected_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
Inspection / restock decision support
CHECK(restock_quantity IS NULL OR restock_quantity >= 0)
CHECK(reject_quantity IS NULL OR reject_quantity >= 0)
Finalized from validated return_inspection_drafts during CompleteReturnAsync
```

## `return_inspection_drafts`

Purpose: Durable Step 6 inspection draft before final return lines exist.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `outlet_id` | uuid | FK | NOT NULL |  |
| `sale_id` | uuid |  | NOT NULL | Original `sales_orders.id`; FK `(tenant_id, sale_id)` |
| `status` | varchar(20) |  | NOT NULL | `DRAFT` / `VALIDATED` / `CONSUMED` / `CANCELLED` |
| `version` | int |  | NOT NULL DEFAULT 1 | Optimistic concurrency; incremented on mutation/validate |
| `expires_at` | timestamptz |  | NOT NULL | Default `created_at + 24h`; refreshed on save/validate |
| `validated_at` | timestamptz |  | NULL |  |
| `validated_by_tenant_user_id` | uuid |  | NULL |  |
| `created_by_tenant_user_id` | uuid |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, outlet_id, sale_id)
UNIQUE(tenant_id, id)
FK(tenant_id, outlet_id) → outlets(tenant_id, id)
FK(tenant_id, sale_id) → sales_orders(tenant_id, id)
CHECK(status IN ('DRAFT', 'VALIDATED', 'CONSUMED', 'CANCELLED'))
CHECK(version >= 1)
CHECK(expires_at > created_at)
Line/media mutation resets status to DRAFT and bumps version
CompleteReturnAsync requires status = VALIDATED then marks CONSUMED
Expired drafts cancelled by cleanup hosted service
```

Migration: `20260717150000_HardenReturnInspectionDraftMediaLifecycle`

## `return_inspection_draft_lines`

Purpose: Per sale-line condition/notes for the inspection draft.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `return_inspection_draft_id` | uuid | FK | NOT NULL |  |
| `sale_line_id` | uuid |  | NOT NULL | Original `sales_order_lines.id` |
| `condition_id` | uuid |  | NULL | Catalog FK when resolved |
| `condition_code_snapshot` | varchar(40) |  | NOT NULL |  |
| `inspection_notes` | text |  | NULL | Max 200 chars |
| `inspection_status` | varchar(20) |  | NOT NULL | `PENDING` / `INSPECTED` |
| `inspected_by_tenant_user_id` | uuid |  | NULL |  |
| `inspected_at` | timestamptz |  | NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(tenant_id, return_inspection_draft_id, sale_line_id)
UNIQUE(tenant_id, id)
FK(tenant_id, return_inspection_draft_id) → return_inspection_drafts(tenant_id, id)
FK(tenant_id, sale_line_id) → sales_order_lines(tenant_id, id)
FK(tenant_id, condition_id) → return_inspection_conditions(tenant_id, id)
CHECK(inspection_status IN ('PENDING', 'INSPECTED'))
CHECK(inspection_notes IS NULL OR char_length(inspection_notes) <= 200)
```

## `return_inspection_media`

Purpose: Final inspection photo links after completion.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `return_inspection_id` | uuid | FK | NOT NULL |  |
| `storage_key` | varchar(500) |  | NOT NULL | Same key as staged file |
| `file_name` | varchar(255) |  | NOT NULL |  |
| `content_type` | varchar(100) |  | NOT NULL |  |
| `size_bytes` | bigint |  | NOT NULL |  |
| `uploaded_by_tenant_user_id` | uuid |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
INDEX(tenant_id, return_inspection_id)
Physical file is not duplicated; staging row becomes CONSUMED
```

## `return_inspection_media_staging`

Purpose: Temporary upload staging keyed to original sale line / draft line.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL |  |
| `tenant_id` | uuid | FK | NOT NULL |  |
| `outlet_id` | uuid | FK | NULL | Till session outlet; enforced on read/delete |
| `sale_id` | uuid |  | NOT NULL | Original sale |
| `sale_line_id` | uuid |  | NOT NULL | Original sale line |
| `inspection_draft_id` | uuid | FK | NULL | Linked draft |
| `inspection_draft_line_id` | uuid | FK | NULL | Linked draft line |
| `status` | varchar(20) |  | NOT NULL | `STAGED` / `CONSUMED` / `EXPIRED` / `DELETED` |
| `expires_at` | timestamptz |  | NOT NULL | Aligned with draft lifetime (default 24h) |
| `consumed_at` | timestamptz |  | NULL | Set on finalization |
| `deleted_at` | timestamptz |  | NULL | Set on cashier delete (soft delete) |
| `storage_key` | varchar(500) |  | NOT NULL | UNIQUE; same key reused in final media |
| `file_name` | varchar(255) |  | NOT NULL |  |
| `content_type` | varchar(100) |  | NOT NULL |  |
| `size_bytes` | bigint |  | NOT NULL | Max 5242880 (5 MiB) |
| `uploaded_by_tenant_user_id` | uuid |  | NOT NULL |  |
| `created_at` | timestamptz |  | NOT NULL |  |

Indexes / Constraints / Notes:

```text
UNIQUE(storage_key)
CHECK(status IN ('STAGED', 'CONSUMED', 'EXPIRED', 'DELETED'))
CHECK(size_bytes > 0 AND size_bytes <= 5242880)
CHECK(expires_at > created_at)
DELETE sets DELETED + deleted_at and removes physical file
Cleanup hosted service marks orphan STAGED past expires_at as EXPIRED and deletes file
CONSUMED rows are never deleted (final return_inspection_media references storage_key)
```

Migrations: `20260716190000_AddReturnInspectionDraftsAndMediaFinalization`, `20260717150000_HardenReturnInspectionDraftMediaLifecycle`

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