<!-- title: Cart & Checkout -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->
<!-- source: Unified_Commerce_Databse_Design.docx -->


# 22. Cart & Checkout

## Purpose

This file documents the database tables and attributes for this module.

## Entity Tables

| Table | Purpose |
| --- | --- |
| `shopping_carts` | Stores active customer/online shopping cart headers. |
| `shopping_cart_items` | Stores shopping cart items records for this module. |
| `shopping_cart_item_options` | Stores shopping cart item options records for this module. |
| `shopping_cart_item_components` | Stores shopping cart item components records for this module. |
| `checkout_sessions` | Stores checkout attempts and calculated checkout totals. |
| `checkout_session_lines` | Stores checkout session lines records for this module. |
| `checkout_session_line_options` | Stores checkout session line options records for this module. |
| `checkout_session_line_components` | Stores checkout session line components records for this module. |
| `checkout_events` | Stores checkout events records for this module. |

## shopping_carts

Module: Cart & Checkout

Purpose: Stores active customer/online shopping cart headers.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | FK NOT UNIQUE | References `tenants(id)`. Unique business key. |
| cart_status | varchar(30) | CHECK | CHECK(cart_status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED', 'EXPIRED', 'CANCELLED')) |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| cart_number | varchar(80) | UNIQUE | Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(tenant_id) REFERENCES tenants(id)
UNIQUE(tenant_id, cart_number)
CHECK(cart_status IN ('ACTIVE', 'CHECKED_OUT', 'ABANDONED', 'EXPIRED', 'CANCELLED'))
```

## shopping_cart_items

Module: Cart & Checkout

Purpose: Stores shopping cart items records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| shopping_cart_id | uuid | FK NOT UNIQUE | References `shopping_carts(id)`. Unique business key. |

Source constraints from uploaded design:

```text
PK(id)
FK(shopping_cart_id) REFERENCES shopping_carts(id)
CHECK(quantity > 0)
UNIQUE(shopping_cart_id, line_number)
```

## shopping_cart_item_options

Module: Cart & Checkout

Purpose: Stores shopping cart item options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| shopping_cart_item_id | uuid | FK NOT | References `shopping_cart_items(id)`. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(shopping_cart_item_id) REFERENCES shopping_cart_items(id)
CHECK(quantity > 0)
```

## shopping_cart_item_components

Module: Cart & Checkout

Purpose: Stores shopping cart item components records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| shopping_cart_item_id | uuid | FK NOT | References `shopping_cart_items(id)`. |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(shopping_cart_item_id) REFERENCES shopping_cart_items(id)
CHECK(quantity > 0)
```

## checkout_sessions

Module: Cart & Checkout

Purpose: Stores checkout attempts and calculated checkout totals.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| tenant_id | uuid | UNIQUE | Unique business key. |
| status | varchar(30) | NOT CHECK | Lifecycle status; allowed values must be enforced with CHECK/backend constants. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_number | varchar(80) | UNIQUE | Unique business key. |
| shopping_cart_id | uuid | FK NOT | References `shopping_carts(id)`. |
| total_amount | numeric(18,2) | CHECK | CHECK(total_amount >= 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(shopping_cart_id) REFERENCES shopping_carts(id)
UNIQUE(tenant_id, checkout_number)
CHECK(total_amount >= 0)
```

## checkout_session_lines

Module: Cart & Checkout

Purpose: Stores checkout session lines records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_session_id | uuid | FK NULL UNIQUE | References `checkout_sessions(id)`. Unique business key. |
| line_number | varchar(80) | UNIQUE | Unique business key. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
CHECK(quantity > 0)
UNIQUE(checkout_session_id, line_number)
```

## checkout_session_line_options

Module: Cart & Checkout

Purpose: Stores checkout session line options records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_session_line_id | uuid | FK NOT | References `checkout_session_lines(id)`. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(checkout_session_line_id) REFERENCES checkout_session_lines(id)
CHECK(quantity > 0)
```

## checkout_session_line_components

Module: Cart & Checkout

Purpose: Stores checkout session line components records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_session_line_id | uuid | FK NOT | References `checkout_session_lines(id)`. |
| quantity | numeric(18,4) | CHECK | CHECK(quantity > 0) |
| sort_order | integer | NOT DEFAULT 0 | Display order. |

Source constraints from uploaded design:

```text
PK(id)
FK(checkout_session_line_id) REFERENCES checkout_session_lines(id)
CHECK(quantity > 0)
```

## checkout_events

Module: Cart & Checkout

Purpose: Stores checkout events records for this module.

| Attribute | Type | Key / Constraint | Reference / Note |
| --- | --- | --- | --- |
| id | uuid | PK | Primary key. Primary key / source design key. |
| created_at | timestamptz | NOT | Creation timestamp. |
| updated_at | timestamptz | NOT | Last update timestamp. |
| checkout_session_id | uuid | FK NULL UNIQUE | References `checkout_sessions(id)`. Unique business key. |
| sequence_number | integer | UNIQUE CHECK | Unique business key. CHECK(sequence_number > 0) |

Source constraints from uploaded design:

```text
PK(id)
FK(checkout_session_id) REFERENCES checkout_sessions(id)
UNIQUE(checkout_session_id, sequence_number)
CHECK(sequence_number > 0)
```

## Related Files

- [[../Database_Overview]]
- [[../Status_And_Type_Check_Rules]]
- [[../Migration_Rules]]
