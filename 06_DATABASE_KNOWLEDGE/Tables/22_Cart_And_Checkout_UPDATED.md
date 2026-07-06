<!-- title: 22. Cart & Checkout -->
<!-- status: ERD aligned -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-05 -->
<!-- source: 22_Cart & Checkout ERD(3).png -->

# 22. Cart & Checkout

## Purpose

This file documents the database tables, attributes, keys, nullability, indexes, constraints, and external reference entities for this module.

## ERD Update Rule

This markdown version follows the uploaded ERD image as the source of truth. Table names, column names, data types, PK/FK markers, NULL/NOT NULL rules, indexes, and constraints were updated to match the ERD as closely as possible.

**Datatype rule:** application status/type domains are documented as `varchar(...)` plus `CHECK(...)` constraints. Database enum datatypes are not used.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `shopping_carts` | Stores active/converted online shopping carts. |
| `shopping_cart_items` | Stores shopping cart line items. |
| `shopping_cart_item_options` | Stores selected options for cart items. |
| `checkout_sessions` | Stores checkout attempts and calculated checkout totals. |
| `checkout_session_lines` | Stores checkout line snapshots. |
| `checkout_session_line_options` | Stores selected options for checkout lines. |
| `checkout_session_addresses` | Stores billing/shipping/pickup address snapshots for checkout. |
| `checkout_events` | Stores checkout lifecycle audit events. |

## `shopping_carts`

Purpose: Stores active/converted online shopping carts.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `online_store_id` | uuid | FK | NULL | References online_stores(id). |
| `customer_id` | uuid | FK | NULL | References customers(id). |
| `anonymous_session_id` | varchar(120) |  | NULL | Anonymous browser/session identifier. |
| `cart_number` | varchar(60) |  | NOT NULL | Tenant-scoped cart number. |
| `sales_channel` | varchar(40) |  | NOT NULL | Sales channel code/snapshot. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `cart_status` | varchar(30) |  | NOT NULL | Cart lifecycle status. |
| `subtotal_amount` | numeric(18,4) |  | NOT NULL | Subtotal before discounts/taxes/charges. |
| `discount_amount` | numeric(18,4) |  | NOT NULL | Total discount amount. |
| `tax_amount` | numeric(18,4) |  | NOT NULL | Total tax amount. |
| `charge_amount` | numeric(18,4) |  | NOT NULL | Total charge amount. |
| `total_amount` | numeric(18,4) |  | NOT NULL | Grand total. |
| `expires_at` | timestamptz |  | NULL | Cart expiry timestamp. |
| `converted_checkout_session_id` | uuid |  | NULL | Converted checkout session reference/snapshot. |
| `converted_order_id` | uuid |  | NULL | Converted sales order reference/snapshot. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(online_store_id) REFERENCES online_stores(id)
FK(customer_id) REFERENCES customers(id)
FK(currency_code) REFERENCES currencies(currency_code)
UNIQUE(tenant_id, cart_number)
CHECK(cart_status IN ('ACTIVE', 'ABANDONED', 'CONVERTED', 'EXPIRED', 'CANCELLED'))
CHECK(subtotal_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(charge_amount >= 0)
CHECK(total_amount >= 0)
```

## `shopping_cart_items`

Purpose: Stores shopping cart line items.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `shopping_cart_id` | uuid | FK | NOT NULL | References shopping_carts(id). |
| `line_number` | int |  | NOT NULL | Line sequence number in cart. |
| `product_id` | uuid | FK | NOT NULL | References products(id). |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id). |
| `sku_snapshot` | varchar(100) |  | NULL | SKU snapshot. |
| `product_name_snapshot` | varchar(200) |  | NOT NULL | Product name snapshot. |
| `product_structure` | varchar(40) |  | NULL | Product structure snapshot. |
| `quantity` | numeric(18,4) |  | NOT NULL | Cart quantity. |
| `unit_price` | numeric(18,4) |  | NOT NULL | Unit price snapshot. |
| `line_subtotal_amount` | numeric(18,4) |  | NOT NULL | Line subtotal. |
| `line_discount_amount` | numeric(18,4) |  | NOT NULL | Line discount amount. |
| `line_tax_amount` | numeric(18,4) |  | NOT NULL | Line tax amount. |
| `line_total_amount` | numeric(18,4) |  | NOT NULL | Line total amount. |
| `line_status` | varchar(30) |  | NOT NULL | Line lifecycle status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(shopping_cart_id) REFERENCES shopping_carts(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(shopping_cart_id, line_number)
CHECK(line_number > 0)
CHECK(quantity > 0)
CHECK(unit_price >= 0)
CHECK(line_subtotal_amount >= 0)
CHECK(line_discount_amount >= 0)
CHECK(line_tax_amount >= 0)
CHECK(line_total_amount >= 0)
CHECK(line_status IN ('ACTIVE', 'REMOVED', 'UNAVAILABLE', 'PRICE_CHANGED'))
```

## `shopping_cart_item_options`

Purpose: Stores selected options for cart items.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `shopping_cart_item_id` | uuid | FK | NOT NULL | References shopping_cart_items(id). |
| `choice_group_id` | uuid | FK | NOT NULL | References choice_groups(id). |
| `choice_option_id` | uuid | FK | NOT NULL | References choice_options(id). |
| `choice_group_name_snapshot` | varchar(150) |  | NULL | Choice group display snapshot. |
| `choice_option_name_snapshot` | varchar(150) |  | NULL | Choice option display snapshot. |
| `price_adjustment` | numeric(18,4) |  | NOT NULL | Option price adjustment. |
| `sort_order` | int |  | NULL | Display order. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(shopping_cart_item_id) REFERENCES shopping_cart_items(id)
FK(choice_group_id) REFERENCES choice_groups(id)
FK(choice_option_id) REFERENCES choice_options(id)
CHECK(sort_order IS NULL OR sort_order >= 0)
```

## `checkout_sessions`

Purpose: Stores checkout attempts and calculated checkout totals.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `online_store_id` | uuid | FK | NULL | References online_stores(id). |
| `cart_id` | uuid | FK | NOT NULL | References shopping_carts(id). |
| `customer_id` | uuid | FK | NULL | References customers(id). |
| `anonymous_session_id` | varchar(120) |  | NULL | Anonymous browser/session identifier. |
| `checkout_number` | varchar(60) |  | NOT NULL | Tenant-scoped checkout number. |
| `checkout_status` | varchar(30) |  | NOT NULL | Checkout lifecycle status. |
| `sales_channel` | varchar(40) |  | NOT NULL | Sales channel code/snapshot. |
| `fulfillment_method_code` | varchar(40) |  | NULL | Selected fulfillment method code snapshot. |
| `selected_outlet_id` | uuid | FK | NULL | References outlets(id). |
| `selected_pickup_slot_id` | uuid |  | NULL | Selected pickup slot reference/snapshot. |
| `pickup_contact_name` | varchar(150) |  | NULL | Pickup contact name. |
| `pickup_contact_phone` | varchar(50) |  | NULL | Pickup contact phone. |
| `pickup_contact_email` | varchar(255) |  | NULL | Pickup contact email. |
| `currency_code` | char(3) | FK | NOT NULL | References currencies(currency_code). |
| `subtotal_amount` | numeric(18,4) |  | NOT NULL | Checkout subtotal. |
| `discount_amount` | numeric(18,4) |  | NOT NULL | Checkout discount amount. |
| `tax_amount` | numeric(18,4) |  | NOT NULL | Checkout tax amount. |
| `charge_amount` | numeric(18,4) |  | NOT NULL | Checkout charge amount. |
| `total_amount` | numeric(18,4) |  | NOT NULL | Checkout total amount. |
| `inventory_reservation_id` | uuid |  | NULL | Inventory reservation reference/snapshot. |
| `converted_order_id` | uuid | FK | NULL | References sales_orders(id). |
| `completed_at` | timestamptz |  | NULL | Checkout completion timestamp. |
| `expired_at` | timestamptz |  | NULL | Checkout expiry timestamp. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |
| `updated_at` | timestamptz |  | NULL | Last update timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(online_store_id) REFERENCES online_stores(id)
FK(cart_id) REFERENCES shopping_carts(id)
FK(customer_id) REFERENCES customers(id)
FK(selected_outlet_id) REFERENCES outlets(id)
FK(currency_code) REFERENCES currencies(currency_code)
FK(converted_order_id) REFERENCES sales_orders(id)
UNIQUE(tenant_id, checkout_number)
CHECK(checkout_status IN ('STARTED', 'PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'FAILED'))
CHECK(subtotal_amount >= 0)
CHECK(discount_amount >= 0)
CHECK(tax_amount >= 0)
CHECK(charge_amount >= 0)
CHECK(total_amount >= 0)
```

## `checkout_session_lines`

Purpose: Stores checkout line snapshots.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `checkout_session_id` | uuid | FK | NOT NULL | References checkout_sessions(id). |
| `line_number` | int |  | NOT NULL | Line sequence number. |
| `product_id` | uuid | FK | NOT NULL | References products(id). |
| `product_variant_id` | uuid | FK | NULL | References product_variants(id). |
| `sku_snapshot` | varchar(100) |  | NULL | SKU snapshot. |
| `product_name_snapshot` | varchar(200) |  | NOT NULL | Product name snapshot. |
| `quantity` | numeric(18,4) |  | NOT NULL | Checkout quantity. |
| `unit_price` | numeric(18,4) |  | NOT NULL | Unit price snapshot. |
| `line_subtotal_amount` | numeric(18,4) |  | NOT NULL | Line subtotal. |
| `line_discount_amount` | numeric(18,4) |  | NOT NULL | Line discount amount. |
| `line_tax_amount` | numeric(18,4) |  | NOT NULL | Line tax amount. |
| `line_total_amount` | numeric(18,4) |  | NOT NULL | Line total amount. |
| `line_status` | varchar(30) |  | NOT NULL | Line lifecycle status. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
FK(product_id) REFERENCES products(id)
FK(product_variant_id) REFERENCES product_variants(id)
UNIQUE(checkout_session_id, line_number)
CHECK(line_number > 0)
CHECK(quantity > 0)
CHECK(unit_price >= 0)
CHECK(line_subtotal_amount >= 0)
CHECK(line_discount_amount >= 0)
CHECK(line_tax_amount >= 0)
CHECK(line_total_amount >= 0)
```

## `checkout_session_line_options`

Purpose: Stores selected options for checkout lines.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `checkout_session_line_id` | uuid | FK | NOT NULL | References checkout_session_lines(id). |
| `choice_group_id` | uuid | FK | NOT NULL | References choice_groups(id). |
| `choice_option_id` | uuid | FK | NOT NULL | References choice_options(id). |
| `choice_group_name_snapshot` | varchar(150) |  | NULL | Choice group display snapshot. |
| `choice_option_name_snapshot` | varchar(150) |  | NULL | Choice option display snapshot. |
| `quantity` | numeric(18,4) |  | NOT NULL | Selected option quantity. |
| `price_adjustment` | numeric(18,4) |  | NOT NULL | Option price adjustment. |
| `sort_order` | int |  | NULL | Display order. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(checkout_session_line_id) REFERENCES checkout_session_lines(id)
FK(choice_group_id) REFERENCES choice_groups(id)
FK(choice_option_id) REFERENCES choice_options(id)
CHECK(quantity > 0)
CHECK(sort_order IS NULL OR sort_order >= 0)
```

## `checkout_session_addresses`

Purpose: Stores billing/shipping/pickup address snapshots for checkout.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `checkout_session_id` | uuid | FK | NOT NULL | References checkout_sessions(id). |
| `address_type` | varchar(30) |  | NOT NULL | Address type snapshot. |
| `contact_name` | varchar(150) |  | NULL | Contact name. |
| `contact_phone` | varchar(50) |  | NULL | Contact phone. |
| `address_line1` | varchar(200) |  | NOT NULL | Address line 1. |
| `address_line2` | varchar(200) |  | NULL | Address line 2. |
| `city` | varchar(100) |  | NULL | City. |
| `state_or_province` | varchar(100) |  | NULL | State/province. |
| `postal_code` | varchar(20) |  | NULL | Postal code. |
| `country_code` | char(2) |  | NOT NULL | Country code. |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
CHECK(address_type IN ('BILLING', 'SHIPPING', 'PICKUP'))
```

## `checkout_events`

Purpose: Stores checkout lifecycle audit events.

| Attribute | Type | Key | Null | Reference / Note |
| --- | --- | --- | --- | --- |
| `id` | uuid | PK | NOT NULL | Primary key. |
| `tenant_id` | uuid | FK | NOT NULL | References tenants(id). |
| `checkout_session_id` | uuid | FK | NOT NULL | References checkout_sessions(id). |
| `event_type` | varchar(40) |  | NOT NULL | Checkout event type. |
| `event_status` | varchar(30) |  | NULL | Event/result status. |
| `event_payload_json` | jsonb |  | NULL | Event payload snapshot. |
| `event_at` | timestamptz |  | NOT NULL | Event timestamp. |
| `created_by_tenant_user_id` | uuid | FK | NULL | References tenant_users(id). |
| `created_at` | timestamptz |  | NOT NULL | Creation timestamp. |

Indexes / Constraints / Notes:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
FK(created_by_tenant_user_id) REFERENCES tenant_users(id)
Append-only audit trail for checkout lifecycle.
```

## Reference Entities (External)

| Table | Key Fields | Note |
| --- | --- | --- |
| `tenants` | id uuid PK | Tenant reference |
| `tenant_users` | id uuid PK, tenant_id uuid FK | User/audit reference |
| `online_stores` | id uuid PK, tenant_id uuid FK | Online store reference |
| `customers` | id uuid PK, tenant_id uuid FK | Customer reference |
| `products` | id uuid PK, tenant_id uuid FK | Product reference |
| `product_variants` | id uuid PK, product_id uuid FK | Product variant reference |
| `choice_groups` | id uuid PK | Choice group reference |
| `choice_options` | id uuid PK, choice_group_id uuid FK | Choice option reference |
| `outlets` | id uuid PK, tenant_id uuid FK | Outlet reference |
| `sales_orders` | id uuid PK, tenant_id uuid FK | Order reference |
| `currencies` | currency_code char(3) PK | Currency reference |

## Module Notes

- This file follows the uploaded image, which contains 8 main tables.
- Component tables are not included in this ERD image.
- All type/status fields are written as `varchar(...)` plus CHECK constraints instead of database enum datatypes.

## Related Files

- [[19_Customer_Basic_Authentication_And_Consent]]
- [[20_Unified_Order_And_Sales]]
- [[23_Fulfilment_And_Pickup]]
- [[24_Payment_And_Refund]]
