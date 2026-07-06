<!-- title: Unified Order & Sales -->
<!-- status: Updated -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-04 -->
<!-- source: Final fixed Unified Order & Sales ERD design -->

# 20. Unified Order & Sales

## Purpose

This file documents the final fixed unified order and sales tables for POS and click-and-collect orders.

## Design Rules Applied

- Common document numbering uses `document_number_sequences`.
- Address snapshot table is excluded for the current click-and-collect-only scope.
- `sales_order_charges` is added because order `charge_amount` exists.
- `sales_orders.sales_channel` is replaced by `sales_channel_id`.
- Fulfilment selection uses `fulfillment_method_outlet_id`; no direct `fulfillment_method` field is stored on order.
- No database enum datatypes are used; status/type fields use `varchar(...)` with `CHECK(...)` constraints.

## Entity Tables

| # | Table | Purpose |
|---|---|---|
| 1 | `document_number_sequences` | Common document number generator configuration. |
| 2 | `sales_orders` | Unified order header. |
| 3 | `sales_order_lines` | Order product/variant line snapshots. |
| 4 | `sales_order_line_options` | Selected line option/choice snapshots. |
| 5 | `sales_order_line_components` | Combo component/group item snapshots. |
| 6 | `sales_order_discounts` | Header/line discount applications. |
| 7 | `sales_order_taxes` | Header/line tax snapshots. |
| 8 | `sales_order_charges` | Header/line charge rows. |
| 9 | `sales_order_status_history` | Order status history. |
| 10 | `sales_order_line_status_history` | Order line status history. |

---

## 1. `document_number_sequences`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `document_type` | varchar(40) | CHECK | NOT NULL | Document type. |
| `document_subtype` | varchar(40) |  | NULL | Optional subtype. |
| `sales_channel_id` | uuid | FK | NULL | References `sales_channels(id)`. |
| `outlet_id` | uuid | FK | NULL | References `outlets(id)`. |
| `prefix` | varchar(30) |  | NOT NULL | Number prefix. |
| `suffix` | varchar(30) |  | NULL | Number suffix. |
| `padding_length` | int | CHECK | NOT NULL DEFAULT 6 | Number padding length. |
| `current_value` | bigint | CHECK | NOT NULL DEFAULT 0 | Current generated value. |
| `reset_rule` | varchar(40) | CHECK | NOT NULL | Reset rule. |
| `last_reset_at` | timestamptz |  | NULL | Last reset timestamp. |
| `last_generated_at` | timestamptz |  | NULL | Last generated timestamp. |
| `row_version` | bigint | CHECK | NOT NULL DEFAULT 0 | Optimistic concurrency version. |
| `status` | varchar(40) | CHECK | NOT NULL | Record status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(outlet_id) REFERENCES outlets(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE NULLS NOT DISTINCT(tenant_id, document_type, document_subtype, sales_channel_id, outlet_id)
CHECK(document_type IN ('SALES_ORDER', 'RECEIPT', 'PAYMENT', 'RETURN', 'REFUND', 'EXCHANGE', 'FULFILLMENT', 'PICKUP', 'INVOICE', 'CREDIT_NOTE'))
CHECK(reset_rule IN ('NONE', 'DAILY', 'MONTHLY', 'YEARLY'))
CHECK(status IN ('ACTIVE', 'INACTIVE', 'DELETED'))
CHECK(padding_length > 0)
CHECK(current_value >= 0)
CHECK(row_version >= 0)
```

---

## 2. `sales_orders`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `document_number_sequence_id` | uuid | FK | NULL | References `document_number_sequences(id)`. |
| `order_number` | varchar(80) | UNIQUE | NOT NULL | Permanent business order number. |
| `external_order_reference` | varchar(100) |  | NULL | External order reference. |
| `sales_channel_id` | uuid | FK | NOT NULL | References `sales_channels(id)`. |
| `order_type` | varchar(40) | CHECK | NOT NULL | Order type. |
| `fulfillment_method_outlet_id` | uuid | FK | NULL | References `fulfillment_method_outlets(id)`. |
| `fulfillment_method_code_snapshot` | varchar(40) |  | NULL | Fulfilment method snapshot. |
| `customer_id` | uuid | FK | NULL | References `customers(id)`. |
| `customer_name_snapshot` | varchar(150) |  | NULL | Customer name snapshot. |
| `customer_email_snapshot` | varchar(150) |  | NULL | Customer email snapshot. |
| `customer_phone_snapshot` | varchar(50) |  | NULL | Customer phone snapshot. |
| `till_id` | uuid | FK | NULL | References `tills(id)`. |
| `till_session_id` | uuid | FK | NULL | References `till_sessions(id)`. |
| `price_list_id` | uuid | FK | NULL | References `price_lists(id)`. |
| `currency_code` | char(3) | FK | NOT NULL | References `currencies(currency_code)`. |
| `subtotal_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Subtotal amount. |
| `discount_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Total discount. |
| `tax_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Total tax. |
| `charge_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Total charges. |
| `rounding_amount` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Rounding amount. |
| `total_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Order total. |
| `paid_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Paid amount. |
| `refunded_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Refunded amount. |
| `balance_due` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Balance due. |
| `order_status` | varchar(40) | CHECK | NOT NULL | Order status. |
| `payment_status` | varchar(40) | CHECK | NOT NULL | Payment status. |
| `fulfillment_status` | varchar(40) | CHECK | NOT NULL | Fulfilment status. |
| `customer_note` | text |  | NULL | Customer note. |
| `internal_note` | text |  | NULL | Internal note. |
| `placed_at` | timestamptz |  | NULL | Order placed timestamp. |
| `confirmed_at` | timestamptz |  | NULL | Confirmed timestamp. |
| `completed_at` | timestamptz |  | NULL | Completed timestamp. |
| `cancelled_at` | timestamptz |  | NULL | Cancelled timestamp. |
| `cancellation_reason` | text |  | NULL | Cancellation reason. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |
| `updated_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(document_number_sequence_id) REFERENCES document_number_sequences(id)
FK(sales_channel_id) REFERENCES sales_channels(id)
FK(fulfillment_method_outlet_id) REFERENCES fulfillment_method_outlets(id)
FK(customer_id) REFERENCES customers(id)
FK(till_id) REFERENCES tills(id)
FK(till_session_id) REFERENCES till_sessions(id)
FK(price_list_id) REFERENCES price_lists(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
FK(updated_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, order_number)
CHECK(order_type IN ('POS_SALE', 'CLICK_AND_COLLECT', 'EXCHANGE_ORDER', 'MANUAL_ORDER'))
CHECK(order_status IN ('DRAFT', 'PLACED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'VOIDED'))
CHECK(payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED'))
CHECK(fulfillment_status IN ('NOT_REQUIRED', 'PENDING', 'READY_FOR_PICKUP', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED'))
CHECK(subtotal_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(charge_amount >= 0)
CHECK(total_amount >= 0)
CHECK(paid_amount >= 0)
CHECK(refunded_amount >= 0)
```

---

## 3. `sales_order_lines`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `line_number` | int | CHECK | NOT NULL | Line number. |
| `product_id` | uuid | FK | NOT NULL | References `products(id)`. |
| `product_variant_id` | uuid | FK | NULL | References `product_variants(id)`. |
| `uom_id` | uuid | FK | NOT NULL | References `unit_of_measures(id)`. |
| `price_list_item_id` | uuid | FK | NULL | References `price_list_items(id)`. |
| `sku_snapshot` | varchar(100) |  | NULL | SKU snapshot. |
| `product_name_snapshot` | varchar(200) |  | NOT NULL | Product name snapshot. |
| `variant_name_snapshot` | varchar(200) |  | NULL | Variant name snapshot. |
| `uom_code_snapshot` | varchar(50) |  | NOT NULL | UOM code snapshot. |
| `uom_name_snapshot` | varchar(100) |  | NOT NULL | UOM name snapshot. |
| `product_type_snapshot` | varchar(40) |  | NOT NULL | Product type snapshot. |
| `product_structure_snapshot` | varchar(40) |  | NOT NULL | Product structure snapshot. |
| `quantity` | numeric(18,4) | CHECK | NOT NULL | Ordered quantity. |
| `fulfilled_quantity` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Fulfilled quantity. |
| `cancelled_quantity` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Cancelled quantity. |
| `returned_quantity` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Returned quantity. |
| `original_unit_price` | numeric(18,4) | CHECK | NOT NULL | Original unit price. |
| `unit_price` | numeric(18,4) | CHECK | NOT NULL | Actual unit price. |
| `line_subtotal_amount` | numeric(18,4) | CHECK | NOT NULL | Line subtotal. |
| `line_discount_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Line discount. |
| `line_tax_amount` | numeric(18,4) | CHECK | NOT NULL DEFAULT 0 | Line tax. |
| `line_total_amount` | numeric(18,4) | CHECK | NOT NULL | Line total. |
| `line_status` | varchar(40) | CHECK | NOT NULL | Line status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
FK(uom_id) REFERENCES unit_of_measures(id)
FK(price_list_item_id) REFERENCES price_list_items(id)
UNIQUE(sales_order_id, line_number)
CHECK(line_number > 0)
CHECK(quantity > 0)
CHECK(fulfilled_quantity >= 0)
CHECK(cancelled_quantity >= 0)
CHECK(returned_quantity >= 0)
CHECK(original_unit_price >= 0)
CHECK(unit_price >= 0)
CHECK(line_subtotal_amount >= 0)
CHECK(line_discount_amount >= 0)
CHECK(line_tax_amount >= 0)
CHECK(line_total_amount >= 0)
CHECK(line_status IN ('ACTIVE', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'RETURNED'))
```

---

## 4. `sales_order_line_options`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_line_id` | uuid | FK | NOT NULL | References `sales_order_lines(id)`. |
| `product_choice_group_id` | uuid | FK | NULL | References `product_choice_groups(id)`. |
| `product_choice_option_id` | uuid | FK | NULL | References `product_choice_options(id)`. |
| `choice_group_name_snapshot` | varchar(150) |  | NOT NULL | Choice group snapshot. |
| `choice_option_name_snapshot` | varchar(150) |  | NOT NULL | Choice option snapshot. |
| `quantity` | numeric(18,4) | CHECK | NOT NULL DEFAULT 1 | Option quantity. |
| `unit_price_adjustment` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Unit price adjustment. |
| `total_price_adjustment` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Total adjustment. |
| `sort_order` | int | CHECK | NOT NULL DEFAULT 0 | Sort order. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(product_choice_group_id) REFERENCES product_choice_groups(id)
FK(product_choice_option_id) REFERENCES product_choice_options(id)
CHECK(quantity > 0)
CHECK(sort_order >= 0)
```

---

## 5. `sales_order_line_components`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_line_id` | uuid | FK | NOT NULL | References `sales_order_lines(id)`. |
| `combo_definition_id` | uuid | FK | NOT NULL | References `combo_definitions(id)`. |
| `combo_component_id` | uuid | FK | NULL | Fixed component reference. |
| `combo_group_item_id` | uuid | FK | NULL | Configurable group item reference. |
| `item_source_type` | varchar(40) | CHECK | NOT NULL | Component source type. |
| `item_product_id` | uuid | FK | NOT NULL | Component product. |
| `item_variant_id` | uuid | FK | NULL | Component variant. |
| `item_uom_id` | uuid | FK | NOT NULL | Component UOM. |
| `item_sku_snapshot` | varchar(100) |  | NULL | SKU snapshot. |
| `item_name_snapshot` | varchar(200) |  | NOT NULL | Item name snapshot. |
| `item_variant_name_snapshot` | varchar(200) |  | NULL | Variant name snapshot. |
| `item_uom_code_snapshot` | varchar(50) |  | NOT NULL | UOM code snapshot. |
| `item_uom_name_snapshot` | varchar(100) |  | NOT NULL | UOM name snapshot. |
| `quantity` | numeric(18,4) | CHECK | NOT NULL | Component quantity. |
| `unit_price_adjustment` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Unit adjustment. |
| `total_price_adjustment` | numeric(18,4) |  | NOT NULL DEFAULT 0 | Total adjustment. |
| `sort_order` | int | CHECK | NOT NULL DEFAULT 0 | Sort order. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NOT NULL | Last update timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(combo_definition_id) REFERENCES combo_definitions(id)
FK(combo_component_id) REFERENCES combo_components(id)
FK(combo_group_item_id) REFERENCES combo_group_items(id)
FK(item_product_id) REFERENCES products(id)
FK(item_variant_id) REFERENCES product_variants(id)
FK(item_uom_id) REFERENCES unit_of_measures(id)
CHECK(item_source_type IN ('FIXED_COMPONENT', 'GROUP_ITEM'))
CHECK(quantity > 0)
CHECK(sort_order >= 0)
CHECK(
    (item_source_type = 'FIXED_COMPONENT' AND combo_component_id IS NOT NULL AND combo_group_item_id IS NULL)
    OR
    (item_source_type = 'GROUP_ITEM' AND combo_group_item_id IS NOT NULL AND combo_component_id IS NULL)
)
```

---

## 6. `sales_order_discounts`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `sales_order_line_id` | uuid | FK | NULL | References `sales_order_lines(id)`. |
| `discount_policy_id` | uuid | FK | NULL | References `discount_policies(id)`. |
| `discount_type_id` | uuid | FK | NOT NULL | References `discount_types(id)`. |
| `discount_target_scope` | varchar(40) | CHECK | NOT NULL | Header or line discount. |
| `application_sequence` | int | CHECK | NOT NULL DEFAULT 1 | Application sequence. |
| `discount_code_snapshot` | varchar(80) |  | NULL | Discount code snapshot. |
| `discount_name_snapshot` | varchar(150) |  | NOT NULL | Discount name snapshot. |
| `calculation_method_snapshot` | varchar(40) |  | NOT NULL | Calculation method snapshot. |
| `discount_value` | numeric(18,4) | CHECK | NOT NULL | Discount configured value. |
| `discount_amount` | numeric(18,4) | CHECK | NOT NULL | Applied discount amount. |
| `manual_discount_reason` | text |  | NULL | Manual discount reason. |
| `applied_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `applied_at` | timestamptz |  | NOT NULL | Applied timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(discount_policy_id) REFERENCES discount_policies(id)
FK(discount_type_id) REFERENCES discount_types(id)
FK(applied_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(discount_target_scope IN ('ORDER', 'LINE'))
CHECK(application_sequence > 0)
CHECK(discount_value >= 0)
CHECK(discount_amount >= 0)
```

---

## 7. `sales_order_taxes`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `sales_order_line_id` | uuid | FK | NULL | References `sales_order_lines(id)`. |
| `tax_jurisdiction_id` | uuid | FK | NULL | References `tax_jurisdictions(id)`. |
| `tax_class_id` | uuid | FK | NULL | References `tax_classes(id)`. |
| `tax_rate_id` | uuid | FK | NULL | References `tax_rates(id)`. |
| `tax_class_code_snapshot` | varchar(80) |  | NULL | Tax class code snapshot. |
| `tax_rate_code_snapshot` | varchar(80) |  | NULL | Tax rate code snapshot. |
| `tax_name_snapshot` | varchar(150) |  | NOT NULL | Tax name snapshot. |
| `jurisdiction_name_snapshot` | varchar(150) |  | NULL | Jurisdiction snapshot. |
| `tax_rate_percent` | numeric(7,4) | CHECK | NOT NULL | Tax percent. |
| `taxable_amount` | numeric(18,4) | CHECK | NOT NULL | Taxable amount. |
| `tax_amount` | numeric(18,4) | CHECK | NOT NULL | Tax amount. |
| `is_tax_included` | boolean |  | NOT NULL DEFAULT false | Tax included flag. |
| `calculation_sequence` | int | CHECK | NOT NULL DEFAULT 1 | Tax calculation sequence. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(tax_jurisdiction_id) REFERENCES tax_jurisdictions(id)
FK(tax_class_id) REFERENCES tax_classes(id)
FK(tax_rate_id) REFERENCES tax_rates(id)
CHECK(tax_rate_percent >= 0)
CHECK(tax_rate_percent <= 100)
CHECK(taxable_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(calculation_sequence > 0)
```

---

## 8. `sales_order_charges`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `sales_order_line_id` | uuid | FK | NULL | References `sales_order_lines(id)`. |
| `charge_scope` | varchar(40) | CHECK | NOT NULL | Order or line charge. |
| `charge_type` | varchar(40) | CHECK | NOT NULL | Charge type. |
| `charge_name_snapshot` | varchar(150) |  | NOT NULL | Charge name snapshot. |
| `charge_amount` | numeric(18,4) | CHECK | NOT NULL | Charge amount. |
| `is_taxable` | boolean |  | NOT NULL DEFAULT false | Taxable flag. |
| `applied_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `applied_at` | timestamptz |  | NOT NULL | Applied timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(applied_by_tenant_user_id) REFERENCES tenant_users(id)
CHECK(charge_scope IN ('ORDER', 'LINE'))
CHECK(charge_type IN ('SERVICE_FEE', 'PACKAGING_FEE', 'ROUNDING', 'OTHER'))
CHECK(charge_amount >= 0)
```

---

## 9. `sales_order_status_history`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_id` | uuid | FK | NOT NULL | References `sales_orders(id)`. |
| `sequence_number` | int | CHECK | NOT NULL | Status event sequence. |
| `status_type` | varchar(40) | CHECK | NOT NULL | Which status changed. |
| `old_status` | varchar(40) |  | NULL | Old status. |
| `new_status` | varchar(40) |  | NOT NULL | New status. |
| `changed_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `changed_at` | timestamptz |  | NOT NULL | Changed timestamp. |
| `change_reason` | text |  | NULL | Reason. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_id) REFERENCES sales_orders(id)
FK(changed_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, sales_order_id, sequence_number)
CHECK(sequence_number > 0)
CHECK(status_type IN ('ORDER_STATUS', 'PAYMENT_STATUS', 'FULFILLMENT_STATUS'))
```

---

## 10. `sales_order_line_status_history`

| Attribute | Type | Key | Null | Reference / Note |
|---|---|---|---|---|
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References `tenants(id)`. |
| `sales_order_line_id` | uuid | FK | NOT NULL | References `sales_order_lines(id)`. |
| `sequence_number` | int | CHECK | NOT NULL | Status event sequence. |
| `old_status` | varchar(40) |  | NULL | Old status. |
| `new_status` | varchar(40) |  | NOT NULL | New status. |
| `affected_quantity` | numeric(18,4) | CHECK | NULL | Quantity affected by status change. |
| `changed_by_tenant_user_id` | uuid | FK | NULL | References `tenant_users(id)`. |
| `changed_at` | timestamptz |  | NOT NULL | Changed timestamp. |
| `change_reason` | text |  | NULL | Reason. |

Constraints:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(sales_order_line_id) REFERENCES sales_order_lines(id)
FK(changed_by_tenant_user_id) REFERENCES tenant_users(id)
UNIQUE(tenant_id, sales_order_line_id, sequence_number)
CHECK(sequence_number > 0)
CHECK(affected_quantity IS NULL OR affected_quantity >= 0)
```

## External Reference Entities

`tenants`, `tenant_users`, `customers`, `sales_channels`, `fulfillment_method_outlets`, `outlets`, `tills`, `till_sessions`, `currencies`, `price_lists`, `price_list_items`, `products`, `product_variants`, `unit_of_measures`, `product_choice_groups`, `product_choice_options`, `combo_definitions`, `combo_components`, `combo_group_items`, `discount_policies`, `discount_types`, `tax_jurisdictions`, `tax_classes`, `tax_rates`.
