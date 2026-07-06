<!-- title: 24. Payment & Refund -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-05 -->
<!-- source: 24_Payment & Refund ERD(3).png -->

# 24. Payment & Refund

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, indexes, and constraints were updated to match the ERD as closely as possible.

**Datatype rule:** application status/type domains are documented as `varchar(...)` plus `CHECK(...)` constraints. Database enum datatypes are not used.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `payment_methods` | Stores tenant-level payment methods. |
| `sales_payments` | Stores payment headers for sales orders. |
| `sales_payment_transactions` | Stores gateway/manual payment transaction attempts. |
| `sales_payment_events` | Stores append-only payment audit events. |
| `sales_refunds` | Stores refund headers. |
| `sales_refund_payment_allocations` | Stores refund allocation to original sales payments or refund methods. |
| `sales_refund_lines` | Stores refund line rows. |

## `payment_methods`

Purpose: Stores tenant-level payment methods.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `method_code` | varchar(80) |  | NOT NULL | Tenant-scoped method code. |
| `method_name` | varchar(150) |  | NOT NULL | Display name. |
| `method_type` | varchar(40) |  | NOT NULL | Payment method type. |
| `is_active_for_pos` | boolean |  | NOT NULL DEFAULT true | Active for POS payments. |
| `is_active_for_online` | boolean |  | NOT NULL DEFAULT false | Active for online payments. |
| `requires_manual_confirmation` | boolean |  | NOT NULL DEFAULT false | Manual confirmation required flag. |
| `supports_refund` | boolean |  | NOT NULL DEFAULT true | Refund support flag. |
| `requires_reference` | boolean |  | NOT NULL DEFAULT false | External/manual reference required flag. |
| `allows_change` | boolean |  | NOT NULL DEFAULT false | Allows cash change flag. |
| `sort_order` | int |  | NOT NULL DEFAULT 0 | Display order. |
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
CHECK(method_type IN ('CASH', 'CARD', 'QR', 'BANK_TRANSFER', 'MANUAL', 'OTHER'))
CHECK(sort_order >= 0)
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
Tenant-level payment methods only; no payment_method_outlets table.
```

## `sales_payments`

Purpose: Stores payment headers for sales orders.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `document_number_sequence_id` | uuid | FK | NULL | References document_number_sequences(id). |
| `sales_order_id` | uuid | FK | NOT NULL | References sales_orders(id). |
| `payment_number` | varchar(80) |  | NOT NULL | Tenant-scoped payment number. |
| `payment_method_id` | uuid | FK | NOT NULL | References payment_methods(id). |
| `till_id` | uuid | FK | NULL | References tills(id). |
| `till_session_id` | uuid | FK | NULL | References till_sessions(id). |
| `payment_status` | varchar(40) |  | NOT NULL | Payment lifecycle status. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(code). |
| `requested_amount` | numeric(18,4) |  | NULL | Requested amount. |
| `tendered_amount` | numeric(18,4) |  | NULL | Tendered amount. |
| `paid_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Paid amount. |
| `change_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Change amount. |
| `refunded_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Refunded amount. |
| `external_reference` | varchar(150) |  | NULL | External/manual reference. |
| `idempotency_key` | varchar(100) |  | NULL | Idempotency key. |
| `payment_note` | text |  | NULL | Payment note. |
| `initiated_at` | timestamptz |  | NOT NULL | Payment initiated timestamp. |
| `paid_at` | timestamptz |  | NULL | Payment paid timestamp. |
| `cancelled_at` | timestamptz |  | NULL | Payment cancelled timestamp. |
| `cancellation_reason` | text |  | NULL | Cancellation reason. |
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
FK(payment_method_id) REFERENCES payment_methods(id)
FK(till_id) REFERENCES tills(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(currency_code) REFERENCES currencies(code)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, payment_number)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
CHECK(requested_amount > 0)
CHECK(paid_amount >= 0)
CHECK(change_amount >= 0)
CHECK(refunded_amount >= 0)
CHECK(refunded_amount <= paid_amount)
CHECK(payment_status IN ('PENDING', 'AUTHORIZED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED', 'CANCELLED'))
remaining_refundable_amount is derived, not stored.
```

## `sales_payment_transactions`

Purpose: Stores gateway/manual payment transaction attempts.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `sales_payment_id` | uuid | FK | NOT NULL | References sales_payments(id). |
| `parent_transaction_id` | uuid | FK | NULL | Self reference. |
| `transaction_type` | varchar(40) |  | NOT NULL | Transaction type. |
| `transaction_status` | varchar(40) |  | NOT NULL | Transaction status. |
| `amount` | numeric(18,4) |  | NOT NULL | Transaction amount. |
| `currency_code` | char(3) |  | NOT NULL | Currency code. |
| `external_transaction_reference` | varchar(180) |  | NULL | External provider transaction reference. |
| `provider_name` | varchar(100) |  | NULL | Payment provider name. |
| `provider_response_json` | jsonb |  | NULL | Provider response snapshot. |
| `idempotency_key` | varchar(100) |  | NULL | Idempotency key. |
| `processed_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `processed_at` | timestamptz |  | NOT NULL | Processed timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_payment_id) REFERENCES sales_payments(id)
FK(parent_transaction_id) REFERENCES sales_payment_transactions(id)
FK(processed_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL
UNIQUE(tenant_id, provider_name, external_transaction_reference) WHERE external_transaction_reference IS NOT NULL
CHECK(transaction_type IN ('AUTHORIZE', 'CAPTURE', 'SALE', 'REFUND', 'VOID', 'REVERSAL'))
CHECK(transaction_status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED'))
CHECK(amount > 0)
Self-reference via parent_transaction_id.
```

## `sales_payment_events`

Purpose: Stores append-only payment audit events.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `sales_payment_id` | uuid | FK | NOT NULL | References sales_payments(id). |
| `sequence_number` | int |  | NOT NULL | Event sequence number. |
| `event_type` | varchar(40) |  | NOT NULL | Payment event type. |
| `old_status` | varchar(40) |  | NULL | Previous payment status. |
| `new_status` | varchar(40) |  | NULL | New payment status. |
| `event_note` | text |  | NULL | Event note. |
| `event_payload_json` | jsonb |  | NULL | Event payload snapshot. |
| `event_at` | timestamptz |  | NOT NULL | Event timestamp. |
| `event_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_payment_id) REFERENCES sales_payments(id)
FK(event_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, sales_payment_id, sequence_number)
CHECK(sequence_number > 0)
Append-only audit table.
```

## `sales_refunds`

Purpose: Stores refund headers.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `document_number_sequence_id` | uuid | FK | NULL | References document_number_sequences(id). |
| `sales_order_id` | uuid | FK | NOT NULL | References sales_orders(id). |
| `sales_return_id` | uuid | FK | NULL | References sales_returns(id). |
| `refund_number` | varchar(80) |  | NOT NULL | Tenant-scoped refund number. |
| `refund_mode` | varchar(40) |  | NOT NULL | Refund mode. |
| `refund_status` | varchar(40) |  | NOT NULL | Refund lifecycle status. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(code). |
| `requested_amount` | numeric(18,4) |  | NOT NULL | Requested refund amount. |
| `approved_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Approved refund amount. |
| `refunded_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Refunded amount. |
| `refund_reason` | text |  | NULL | Refund reason. |
| `requested_at` | timestamptz |  | NOT NULL | Requested timestamp. |
| `approved_at` | timestamptz |  | NULL | Approved timestamp. |
| `completed_at` | timestamptz |  | NULL | Completed timestamp. |
| `cancelled_at` | timestamptz |  | NULL | Cancelled timestamp. |
| `cancellation_reason` | text |  | NULL | Cancellation reason. |
| `approved_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
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
FK(sales_return_id) REFERENCES sales_returns(id)
FK(currency_code) REFERENCES currencies(code)
FK(approved_by_tenant_user_id) REFERENCES tenant_users(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, refund_number)
CHECK(refund_mode IN ('ORIGINAL_PAYMENT', 'CASH', 'MIXED', 'MANUAL'))
CHECK(refund_status IN ('REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED'))
CHECK(requested_amount > 0)
CHECK(approved_amount <= requested_amount)
CHECK(refunded_amount <= approved_amount)
```

## `sales_refund_payment_allocations`

Purpose: Stores refund allocation to original sales payments or refund methods.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `sales_refund_id` | uuid | FK | NOT NULL | References sales_refunds(id). |
| `original_sales_payment_id` | uuid | FK | NOT NULL | References sales_payments(id). |
| `refund_payment_method_id` | uuid | FK | NOT NULL | References payment_methods(id). |
| `refund_transaction_id` | uuid | FK | NULL | References sales_payment_transactions(id). |
| `allocated_amount` | numeric(18,4) |  | NOT NULL | Allocated refund amount. |
| `allocation_status` | varchar(40) |  | NOT NULL | Allocation lifecycle status. |
| `external_reference` | varchar(150) |  | NULL | External refund reference. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_refund_id) REFERENCES sales_refunds(id)
FK(original_sales_payment_id) REFERENCES sales_payments(id)
FK(refund_payment_method_id) REFERENCES payment_methods(id)
FK(refund_transaction_id) REFERENCES sales_payment_transactions(id)
CHECK(allocated_amount > 0)
CHECK(allocation_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'))
Handles both return refunds and exchange balance refunds; do not create separate return_payment_allocations or exchange_payment_allocations tables.
```

## `sales_refund_lines`

Purpose: Stores refund line rows.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `sales_refund_id` | uuid | FK | NOT NULL | References sales_refunds(id). |
| `sales_return_line_id` | uuid | FK | NULL | References sales_return_lines(id). |
| `refund_line_type` | varchar(40) |  | NOT NULL | Refund line type. |
| `description_snapshot` | varchar(200) |  | NOT NULL | Description snapshot. |
| `quantity` | numeric(18,4) |  | NULL | Refund quantity. |
| `amount` | numeric(18,4) |  | NOT NULL | Refund line amount. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_refund_id) REFERENCES sales_refunds(id)
FK(sales_return_line_id) REFERENCES sales_return_lines(id)
CHECK(refund_line_type IN ('ITEM', 'TAX', 'CHARGE', 'ROUNDING', 'GENERAL'))
CHECK(quantity IS NULL OR quantity > 0)
CHECK(amount > 0)
sales_return_line_id NULL for tax, charge, rounding, or general refund rows.
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |
| `document_number_sequences` | id uuid PK, tenant_id uuid FK | Document number sequence reference |
| `currencies` | code char(3) PK | Currency reference |
| `sales_orders` | id uuid PK, tenant_id uuid FK | Sales order reference |
| `sales_returns` | id uuid PK, tenant_id uuid FK | Sales return reference |
| `sales_return_lines` | id uuid PK, sales_return_id uuid FK | Sales return line reference |
| `tills` | id uuid PK, tenant_id uuid FK | Till reference |
| `till_sessions` | id uuid PK, till_id uuid FK | Till session reference |

## Module Notes

- This file follows the uploaded image, which contains 7 main tables.
- `sales_payment_transactions` is the payment transaction log table.
- `sales_payment_events` is the payment status/event audit log table.
- All type/status fields are written as `varchar(...)` plus CHECK constraints instead of database enum datatypes.

## Related Files

- [[20_Unified_Order_And_Sales]]
- [[21_POS_Operations]]
- [[25_Return_Inspection_And_Exchange]]
