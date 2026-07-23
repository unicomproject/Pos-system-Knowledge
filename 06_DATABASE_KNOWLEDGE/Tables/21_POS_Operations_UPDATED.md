<!-- title: POS Operations -->
<!-- status: Updated -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->
<!-- source: 21_POS Operations ERD image -->

# 21. POS Operations

## Purpose

This file documents POS hold, receipt, receipt template, till closing summary, till event, and cash movement tables.

`pos_order_holds` and `till_cash_movements` are defined schema foundations.
Current Flutter Park/Recall uses device-local secure storage rather than the
backend Holds API, and no Cashier Cash In/Out mutation API was verified. Defined
in migration source; live applied state not verified.

## Design Rules Applied

- No database enum datatypes are used in this markdown.
- Status/type columns use `varchar(...)` with `CHECK(...)` constraints.
- Receipt data is immutable snapshot data stored with `receipt_data_json`.
- Payment-method till summaries are stored in child table `till_session_payment_summaries`.

## Entity Tables

| # | Table | Purpose |
|---|---|---|
| 1 | `pos_order_holds` | POS order hold lifecycle. |
| 2 | `receipts` | Receipt immutable header and totals. |
| 3 | `receipt_print_logs` | Receipt print attempts. |
| 4 | `receipt_templates` | Receipt template master records. |
| 5 | `receipt_template_versions` | Versioned template data. |
| 6 | `receipt_template_assignments` | Scope-based template assignment. |
| 7 | `till_session_summaries` | Till closing summary. |
| 8 | `till_session_payment_summaries` | Till summary split by payment method. |
| 9 | `till_session_events` | Till session event/audit log. |
| 10 | `till_cash_movements` | Cash drawer cash movement records. |

---

## 1. `pos_order_holds`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `hold_number` | varchar(80) | UNIQUE | NOT NULL | Hold business number. |
| `hold_status` | varchar(40) | CHECK | NOT NULL | Hold status. |
| `hold_reason` | varchar(250) |  | NULL | Hold reason. |
| `held_by_tenant_user_id` | uuid | FK | NOT NULL | User who held the order. |
| `held_at` | timestamptz |  | NOT NULL | Held timestamp. |
| `released_by_tenant_user_id` | uuid | FK | NULL | User who released hold. |
| `released_at` | timestamptz |  | NULL | Released timestamp. |
| `expires_at` | timestamptz |  | NULL | Hold expiry. |
| `cancelled_at` | timestamptz |  | NULL | Cancelled timestamp. |
| `cancellation_reason` | varchar(250) |  | NULL | Cancellation reason. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(held_by_tenant_user_id) REFERENCES tenant_users(id)
FK(released_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, hold_number)
CHECK(hold_status IN ('HELD', 'RELEASED', 'EXPIRED', 'CANCELLED'))
```

---

## 2. `receipts`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `document_number_sequence_id` | uuid | FK | NULL | References `document_number_sequences(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `receipt_number` | varchar(80) | UNIQUE | NOT NULL | Receipt business number. |
| `receipt_type` | varchar(40) | CHECK | NOT NULL | Receipt type. |
| `receipt_status` | varchar(40) | CHECK | NOT NULL | Receipt status. |
| `outlet_id` | uuid | FK | NOT NULL | References `outlets(id)`. |
| `till_id` | uuid | FK | NOT NULL | References `tills(id)`. |
| `till_session_id` | uuid | FK | NOT NULL | References `till_sessions(id)`. |
| `business_date` | date |  | NOT NULL | Business date. |
| `issued_at` | timestamptz |  | NOT NULL | Issued timestamp. |
| `issued_by_tenant_user_id` | uuid | FK | NOT NULL | Issuing user. |
| `receipt_template_version_id` | uuid | FK | NULL | Template version used. |
| `currency_code` | char(3) | FK | NOT NULL | References `currencies(currency_code)`. |
| `subtotal_amount` | numeric(18,4) | CHECK | NOT NULL | Subtotal amount. |
| `discount_amount` | numeric(18,4) | CHECK | NOT NULL | Discount amount. |
| `tax_amount` | numeric(18,4) | CHECK | NOT NULL | Tax amount. |
| `charge_amount` | numeric(18,4) | CHECK | NOT NULL | Charge amount. |
| `rounding_amount` | numeric(18,4) |  | NOT NULL | Rounding amount. |
| `total_amount` | numeric(18,4) | CHECK | NOT NULL | Total amount. |
| `paid_amount` | numeric(18,4) | CHECK | NOT NULL | Paid amount. |
| `change_amount` | numeric(18,4) | CHECK | NOT NULL | Change amount. |
| `receipt_data_json` | jsonb |  | NOT NULL | Receipt immutable snapshot. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(outlet_id) REFERENCES outlets(id)
FK(till_id) REFERENCES tills(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(issued_by_tenant_user_id) REFERENCES tenant_users(id)
FK(receipt_template_version_id) REFERENCES receipt_template_versions(id)
FK(currency_code) REFERENCES currencies(currency_code)
UNIQUE(tenant_id, receipt_number)
CHECK(receipt_type IN ('SALE', 'REFUND', 'EXCHANGE', 'REPRINT'))
CHECK(receipt_status IN ('ISSUED', 'VOIDED', 'CANCELLED'))
CHECK(subtotal_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(charge_amount >= 0)
CHECK(total_amount >= 0)
CHECK(paid_amount >= 0)
CHECK(change_amount >= 0)
```

---

## 3. `receipt_print_logs`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `receipt_id` | uuid | FK | NOT NULL | References `receipts(id)`. |
| `attempt_number` | int | CHECK | NOT NULL | Print attempt number. |
| `printer_device_id` | uuid | FK | NULL | References `hardware_devices(id)`. |
| `printed_copy_type` | varchar(40) | CHECK | NOT NULL | Copy type. |
| `print_status` | varchar(40) | CHECK | NOT NULL | Print status. |
| `printed_at` | timestamptz |  | NULL | Printed timestamp. |
| `operator_tenant_user_id` | uuid | FK | NULL | Operator user. |
| `error_code` | varchar(80) |  | NULL | Error code. |
| `error_message` | text |  | NULL | Error message. |
| `print_result_json` | jsonb |  | NULL | Print result payload. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(receipt_id) REFERENCES receipts(id)
FK(printer_device_id) REFERENCES hardware_devices(id)
FK(operator_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, receipt_id, attempt_number)
CHECK(attempt_number > 0)
CHECK(printed_copy_type IN ('CUSTOMER_COPY', 'MERCHANT_COPY', 'DUPLICATE_COPY'))
CHECK(print_status IN ('PENDING', 'PRINTED', 'FAILED', 'CANCELLED'))
```

---

## 4. `receipt_templates`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `template_code` | varchar(50) | UNIQUE | NOT NULL | Template code. |
| `template_name` | varchar(100) |  | NOT NULL | Template name. |
| `template_type` | varchar(40) | CHECK | NOT NULL | Template type. |
| `description` | text |  | NULL | Description. |
| `is_base_template` | boolean |  | NOT NULL | Base template flag. |
| `parent_template_id` | uuid | FK | NULL | Self-reference. |
| `status` | varchar(40) | CHECK | NOT NULL | Record status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | Created by user. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | Updated by user. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(parent_template_id) REFERENCES receipt_templates(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, template_code)
CHECK(template_type IN ('POS_RECEIPT', 'REFUND_RECEIPT', 'EXCHANGE_RECEIPT'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
```

---

## 5. `receipt_template_versions`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `receipt_template_id` | uuid | FK | NOT NULL | References `receipt_templates(id)`. |
| `version_number` | int | CHECK | NOT NULL | Version number. |
| `template_data` | jsonb |  | NOT NULL | Template layout/data. |
| `page_size` | varchar(20) |  | NULL | Page size. |
| `is_active` | boolean |  | NOT NULL | Active version flag. |
| `effective_from` | timestamptz |  | NULL | Effective from timestamp. |
| `effective_to` | timestamptz |  | NULL | Effective to timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | Created by user. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | Updated by user. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(receipt_template_id) REFERENCES receipt_templates(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, receipt_template_id, version_number)
CHECK(version_number > 0)
CHECK(effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from)
```

---

## 6. `receipt_template_assignments`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `receipt_template_version_id` | uuid | FK | NOT NULL | References `receipt_template_versions(id)`. |
| `assignment_scope` | varchar(40) | CHECK | NOT NULL | Assignment scope. |
| `outlet_id` | uuid | FK | NULL | Outlet scope. |
| `till_id` | uuid | FK | NULL | Till scope. |
| `pos_device_id` | uuid | FK | NULL | POS device scope. |
| `is_default` | boolean |  | NOT NULL | Default assignment flag. |
| `effective_from` | timestamptz |  | NOT NULL | Effective from timestamp. |
| `effective_to` | timestamptz |  | NULL | Effective to timestamp. |
| `status` | varchar(40) | CHECK | NOT NULL | Record status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | Created by user. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | Updated by user. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(receipt_template_version_id) REFERENCES receipt_template_versions(id)
FK(outlet_id) REFERENCES outlets(id)
FK(till_id) REFERENCES tills(id)
FK(pos_device_id) REFERENCES pos_devices(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(assignment_scope IN ('OUTLET', 'TILL', 'POS_DEVICE'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
CHECK(effective_to IS NULL OR effective_to >= effective_from)
CHECK(
    (assignment_scope = 'OUTLET' AND outlet_id IS NOT NULL AND till_id IS NULL AND pos_device_id IS NULL)
    OR
    (assignment_scope = 'TILL' AND outlet_id IS NULL AND till_id IS NOT NULL AND pos_device_id IS NULL)
    OR
    (assignment_scope = 'POS_DEVICE' AND outlet_id IS NULL AND till_id IS NULL AND pos_device_id IS NOT NULL)
)
```

---

## 7. `till_session_summaries`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `outlet_id` | uuid | FK | NOT NULL | References `outlets(id)`. |
| `till_id` | uuid | FK | NOT NULL | References `tills(id)`. |
| `till_session_id` | uuid | FK UNIQUE | NOT NULL | References `till_sessions(id)`. |
| `cashier_tenant_user_id` | uuid | FK | NOT NULL | Cashier user. |
| `session_opened_at` | timestamptz |  | NOT NULL | Session opened timestamp. |
| `session_closed_at` | timestamptz |  | NULL | Session closed timestamp. |
| `opening_cash_amount` | numeric(18,4) | CHECK | NOT NULL | Opening cash. |
| `expected_cash_amount` | numeric(18,4) | CHECK | NOT NULL | Expected cash. |
| `counted_cash_amount` | numeric(18,4) | CHECK | NOT NULL | Counted cash. |
| `cash_difference_amount` | numeric(18,4) |  | NOT NULL | Cash difference. |
| `gross_sales_amount` | numeric(18,4) | CHECK | NOT NULL | Gross sales. |
| `discount_amount` | numeric(18,4) | CHECK | NOT NULL | Discount amount. |
| `tax_amount` | numeric(18,4) | CHECK | NOT NULL | Tax amount. |
| `charge_amount` | numeric(18,4) | CHECK | NOT NULL | Charge amount. |
| `net_sales_amount` | numeric(18,4) | CHECK | NOT NULL | Net sales. |
| `refund_amount` | numeric(18,4) | CHECK | NOT NULL | Refund amount. |
| `void_amount` | numeric(18,4) | CHECK | NOT NULL | Void amount. |
| `order_count` | int | CHECK | NOT NULL | Order count. |
| `refund_count` | int | CHECK | NOT NULL | Refund count. |
| `void_count` | int | CHECK | NOT NULL | Void count. |
| `summary_status` | varchar(40) | CHECK | NOT NULL | Summary status. |
| `generated_at` | timestamptz |  | NOT NULL | Generated timestamp. |
| `approved_at` | timestamptz |  | NULL | Approved timestamp. |
| `approved_by_tenant_user_id` | uuid | FK | NULL | Approved by user. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(outlet_id) REFERENCES outlets(id)
FK(till_id) REFERENCES tills(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(cashier_tenant_user_id) REFERENCES tenant_users(id)
FK(approved_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, till_session_id)
CHECK(summary_status IN ('GENERATED', 'APPROVED', 'REJECTED'))
CHECK(opening_cash_amount >= 0)
CHECK(expected_cash_amount >= 0)
CHECK(counted_cash_amount >= 0)
CHECK(gross_sales_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(charge_amount >= 0)
CHECK(net_sales_amount >= 0)
CHECK(refund_amount >= 0)
CHECK(void_amount >= 0)
CHECK(order_count >= 0)
CHECK(refund_count >= 0)
CHECK(void_count >= 0)
```

---

## 8. `till_session_payment_summaries`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `till_session_summary_id` | uuid | FK | NOT NULL | References `till_session_summaries(id)`. |
| `payment_method_id` | uuid | FK | NOT NULL | References `payment_methods(id)`. |
| `sales_amount` | numeric(18,4) | CHECK | NOT NULL | Sales amount. |
| `refund_amount` | numeric(18,4) | CHECK | NOT NULL | Refund amount. |
| `net_amount` | numeric(18,4) |  | NOT NULL | Net amount. |
| `transaction_count` | int | CHECK | NOT NULL | Transaction count. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(till_session_summary_id) REFERENCES till_session_summaries(id)
FK(payment_method_id) REFERENCES payment_methods(id)
UNIQUE(tenant_id, till_session_summary_id, payment_method_id)
CHECK(sales_amount >= 0)
CHECK(refund_amount >= 0)
CHECK(transaction_count >= 0)
```

---

## 9. `till_session_events`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `till_session_id` | uuid | FK | NOT NULL | References `till_sessions(id)`. |
| `event_type` | varchar(40) | CHECK | NOT NULL | Event type. |
| `event_at` | timestamptz |  | NOT NULL | Event timestamp. |
| `event_by_tenant_user_id` | uuid | FK | NULL | Event user. |
| `amount` | numeric(18,4) | CHECK | NULL | Optional amount. |
| `currency_code` | char(3) | FK | NULL | References `currencies(currency_code)`. |
| `reference_type` | varchar(50) |  | NULL | Related reference type. |
| `reference_id` | uuid |  | NULL | Related reference id. |
| `event_payload_json` | jsonb |  | NULL | Event payload. |
| `pos_device_id` | uuid | FK | NULL | References `pos_devices(id)`. |
| `ip_address` | inet |  | NULL | IP address. |
| `notes` | text |  | NULL | Notes. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(event_by_tenant_user_id) REFERENCES tenant_users(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(pos_device_id) REFERENCES pos_devices(id)
CHECK(event_type IN ('OPENED', 'CLOSED', 'PAUSED', 'RESUMED', 'CASH_IN', 'CASH_OUT', 'NOTE'))
CHECK(amount IS NULL OR amount >= 0)
```

---

## 10. `till_cash_movements`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `till_session_id` | uuid | FK | NOT NULL | References `till_sessions(id)`. |
| `movement_type` | varchar(40) | CHECK | NOT NULL | Cash movement type. |
| `amount` | numeric(18,4) | CHECK | NOT NULL | Cash amount. |
| `currency_code` | char(3) | FK | NOT NULL | References `currencies(currency_code)`. |
| `reason` | varchar(250) |  | NULL | Reason. |
| `reference_number` | varchar(100) |  | NULL | External reference number. |
| `performed_by_tenant_user_id` | uuid | FK | NOT NULL | Performed by user. |
| `performed_at` | timestamptz |  | NOT NULL | Performed timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(performed_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(movement_type IN ('CASH_IN', 'CASH_OUT', 'OPENING_FLOAT', 'CLOSING_REMOVE'))
CHECK(amount > 0)
```

## External Reference Entities

`tenants`, `sales_orders`, `document_number_sequences`, `outlets`, `tills`, `till_sessions`, `tenant_users`, `currencies`, `payment_methods`, `pos_devices`, `hardware_devices`.
