<!-- title: Cashier POS Canonical Permission Registry — Chunk 2 -->
<!-- status: Active — Definitions Complete; Runtime Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 2

## Scope

Chunk 2 finalizes canonical permission **definitions**, parent→child hierarchy,
semantic types, and sensitive-data metadata for the Cashier POS inventory
classified in [[Cashier_POS_Canonical_Permission_Registry_Chunk_1]].

This chunk does **not** seed permissions, assign roles, change effective-permission
resolution, alter API authorization, filter DTOs, or hide/show Flutter UI.

Naming authority remains [[Permission_Code_List]] and ADR_007:
`domain.module.feature.action` (exactly four lowercase tiers).
Phone, Tablet, and Desktop share the same codes — no device prefixes.

## Final counts

| Metric | Count |
| --- | ---: |
| Total requested capabilities (Chunk 1) | 366 |
| EXACT existing (unchanged classification) | 8 |
| EQUIVALENT existing (unchanged classification) | 56 |
| New canonical codes finalized | 14 |
| Split child codes finalized | 280 |
| Documented-only resolved | 1 (`pos.sales.held_sales.cancel`) |
| Pre-auth exclusions | 7 |
| Duplicate requested entries (Chunk 1) | 3 |
| Role-assignable catalog entries (existing+new+split+resolved) | 333 |

### Difference from Chunk 1

- Chunk 1 proposed namespaces; Chunk 2 approves exact leaf codes.
- `sales.park.cancel` (DOCUMENTED_ONLY) is approved as `pos.sales.held_sales.cancel`.
- Existing SoT parents use `pos.till.session.*` and `pos.cash_drawer.position.view` / `physical.manage` (not draft `tills` / `dashboard.view` / `physical.open` names).
- Pre-auth capabilities use `pre_auth.login.*` classification codes outside role assignment.

## Machine catalog

- Backend Architecture: Cashier POS canonical permissions are physically split by functional module, while `CashierPosCanonicalPermissionCatalog` remains the single canonical aggregation entry point.
- Core Types:
  - `CashierPosPermissionSemanticType.cs`
  - `CashierPosPermissionDefinitionKind.cs`
  - `CashierPosPermissionDefinition.cs`
- Central Aggregation Entry Point: `E_POS.Domain/.../Catalog/CashierPos/CashierPosCanonicalPermissionCatalog.cs`
- Module Files (`Catalog/CashierPos/Modules/`):
  - `PreAuthPermissions.cs`
  - `ShellPermissions.cs`
  - `NotificationPermissions.cs`
  - `HomePermissions.cs`
  - `CatalogPermissions.cs`
  - `CartPermissions.cs`
  - `HeldSalesPermissions.cs`
  - `CheckoutPermissions.cs`
  - `DiscountPermissions.cs`
  - `CashPaymentPermissions.cs`
  - `SaleCompletePermissions.cs`
  - `ReceiptPermissions.cs`
  - `CustomerPermissions.cs`
  - `CashDrawerPermissions.cs`
  - `CashMovementPermissions.cs`
  - `TillPermissions.cs`
  - `ReturnPermissions.cs`
  - `HardwarePermissions.cs`
  - `OnlineOrderPermissions.cs`
- JSON mirror: `cashier_pos_canonical_permissions.chunk2.json`
- Flutter: `lib/core/access/cashier_pos/cashier_pos_canonical_permission_codes.dart`

## New + documented-resolved codes

| Permission Code | Parent | Module | Type | Sensitive | Reason |
| --- | --- | --- | --- | --- | --- |
| `pos.sales.held_sales.cancel` | `pos.sales.held_sales.create` | HeldSales | ACTION | NO | Approve independent cancel; historical create-alias insufficient for fine-grained target |
| `pos.shell.navigation.settings` | `pos.sales.dashboard.view` | Shell | NAVIGATION | NO | Settings destination — no existing business permission |
| `pos.customers.management.attach_sale` | `pos.customers.management.view` | Customers | ACTION | NO | Attach customer to active sale |
| `pos.customers.management.deactivate` | `pos.customers.management.update` | Customers | ACTION | NO | Deactivate customer |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_drawer.movements.create` | CashDrawer | ACTION | NO | Independent Cash In action |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_drawer.movements.create` | CashDrawer | ACTION | NO | Independent Cash Out action |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_drawer.movements.create` | CashDrawer | ACTION | NO | Independent Cash Drop action |
| `pos.cash_drawer.open_reason.provide_change` | `pos.cash_drawer.physical.manage` | CashDrawer | CONTROL | NO | Open reason: provide change |
| `pos.cash_drawer.open_reason.till_check` | `pos.cash_drawer.physical.manage` | CashDrawer | CONTROL | NO | Open reason: till check |
| `pos.cash_drawer.open_reason.cash_count` | `pos.cash_drawer.physical.manage` | CashDrawer | CONTROL | NO | Open reason: cash count |
| `pos.cash_drawer.open_reason.manager_operation` | `pos.cash_drawer.physical.manage` | CashDrawer | CONTROL | NO | Open reason: manager operation |
| `pos.cash_drawer.open_reason.other` | `pos.cash_drawer.physical.manage` | CashDrawer | CONTROL | NO | Open reason: other |
| `pos.shell.navigation.offline_banner` | `pos.sales.dashboard.view` | Shell | MESSAGE | NO | Offline/connectivity banner surface |
| `pos.home.actions.online_orders_entry` | `commerce.online_order.orders.access` | Home | NAVIGATION | NO | Home Online Orders entry chrome under commerce access |
| `pos.home.actions.returns_entry` | `pos.returns.search_sale.view` | Home | NAVIGATION | NO | Home Returns entry chrome under returns view |

## Split child codes (280)

Full leaf list is in the machine catalog. Summary by parent:

| Parent | Child count |
| --- | ---: |
| `pos.cash_drawer.movements.cash_drop` | 12 |
| `pos.cash_drawer.movements.cash_in` | 12 |
| `pos.cash_drawer.movements.cash_out` | 12 |
| `pos.cash_drawer.physical.manage` | 3 |
| `pos.cash_drawer.position.view` | 11 |
| `pos.customers.management.view` | 16 |
| `pos.notifications.alerts.view` | 10 |
| `pos.payments.card.accept` | 1 |
| `pos.payments.cash.accept` | 35 |
| `pos.payments.qr.accept` | 1 |
| `pos.payments.split.accept` | 1 |
| `pos.receipts.digital.view` | 25 |
| `pos.sales.cart.manage` | 13 |
| `pos.sales.catalog.search` | 5 |
| `pos.sales.catalog.view` | 27 |
| `pos.sales.checkout.execute` | 11 |
| `pos.sales.dashboard.view` | 19 |
| `pos.sales.held_sales.create` | 4 |
| `pos.sales.held_sales.view` | 10 |
| `pos.sales.manual_discount.apply` | 5 |
| `pos.sales.new_sale.view` | 7 |
| `pos.till.session.close` | 15 |
| `pos.till.session.open` | 25 |

## Parent / child hierarchy (domain groups)

```text
pos.cash_drawer.movements.cash_drop
  ├── pos.cash_movements.cash_drop.amount_entry
  ├── pos.cash_movements.cash_drop.available_cash
  ├── pos.cash_movements.cash_drop.cancel
  ├── pos.cash_movements.cash_drop.confirm
  ├── pos.cash_movements.cash_drop.expected_cash
  ├── pos.cash_movements.cash_drop.manager_pin
  ├── pos.cash_movements.cash_drop.note
  ├── pos.cash_movements.cash_drop.reason
  ├── pos.cash_movements.cash_drop.resulting_balance
  ├── pos.cash_movements.cash_drop.summary
  ├── pos.cash_movements.cash_drop.till
  └── pos.cash_movements.cash_drop.validation_message
pos.cash_drawer.movements.cash_in
  ├── pos.cash_movements.cash_in.amount_entry
  ├── pos.cash_movements.cash_in.available_cash
  ├── pos.cash_movements.cash_in.cancel
  ├── pos.cash_movements.cash_in.confirm
  ├── pos.cash_movements.cash_in.expected_cash
  ├── pos.cash_movements.cash_in.manager_pin
  ├── pos.cash_movements.cash_in.note
  ├── pos.cash_movements.cash_in.reason
  ├── pos.cash_movements.cash_in.resulting_balance
  ├── pos.cash_movements.cash_in.summary
  ├── pos.cash_movements.cash_in.till
  └── pos.cash_movements.cash_in.validation_message
pos.cash_drawer.movements.cash_out
  ├── pos.cash_movements.cash_out.amount_entry
  ├── pos.cash_movements.cash_out.available_cash
  ├── pos.cash_movements.cash_out.cancel
  ├── pos.cash_movements.cash_out.confirm
  ├── pos.cash_movements.cash_out.expected_cash
  ├── pos.cash_movements.cash_out.manager_pin
  ├── pos.cash_movements.cash_out.note
  ├── pos.cash_movements.cash_out.reason
  ├── pos.cash_movements.cash_out.resulting_balance
  ├── pos.cash_movements.cash_out.summary
  ├── pos.cash_movements.cash_out.till
  └── pos.cash_movements.cash_out.validation_message
pos.cash_drawer.physical.manage
  ├── pos.cash_drawer.open_popup.cancel
  ├── pos.cash_drawer.open_popup.continue
  ├── pos.cash_drawer.open_popup.view
  ├── pos.cash_drawer.open_reason.provide_change  [NEW/RESOLVED]
  ├── pos.cash_drawer.open_reason.till_check  [NEW/RESOLVED]
  ├── pos.cash_drawer.open_reason.cash_count  [NEW/RESOLVED]
  ├── pos.cash_drawer.open_reason.manager_operation  [NEW/RESOLVED]
  └── pos.cash_drawer.open_reason.other  [NEW/RESOLVED]
pos.cash_drawer.position.view
  ├── pos.cash_drawer.movements.amount_view
  ├── pos.cash_drawer.movements.cashier
  ├── pos.cash_drawer.movements.date
  ├── pos.cash_drawer.movements.list
  ├── pos.cash_drawer.movements.time
  ├── pos.cash_drawer.movements.type
  ├── pos.cash_drawer.summary.cash_sales
  ├── pos.cash_drawer.summary.expected_cash
  ├── pos.cash_drawer.summary.opening_cash
  ├── pos.cash_drawer.summary.status
  └── pos.cash_drawer.summary.till
pos.customers.management.view
  ├── pos.customers.details.average_order_value
  ├── pos.customers.details.joined_date
  ├── pos.customers.history.purchase_amounts
  ├── pos.customers.history.purchase_history
  ├── pos.customers.history.recent_purchases
  ├── pos.customers.list.email
  ├── pos.customers.list.filters
  ├── pos.customers.list.id
  ├── pos.customers.list.name
  ├── pos.customers.list.order_count
  ├── pos.customers.list.pagination
  ├── pos.customers.list.phone
  ├── pos.customers.list.search
  ├── pos.customers.list.source
  ├── pos.customers.list.status
  ├── pos.customers.list.total_spend
  └── pos.customers.management.attach_sale  [NEW/RESOLVED]
pos.notifications.alerts.view
  ├── pos.notifications.messages.body
  ├── pos.notifications.messages.dismiss
  ├── pos.notifications.messages.list
  ├── pos.notifications.messages.mark_all_read
  ├── pos.notifications.messages.mark_read
  ├── pos.notifications.messages.open
  ├── pos.notifications.messages.timestamp
  ├── pos.notifications.messages.title
  ├── pos.notifications.panel.unread_count
  └── pos.notifications.panel.view
pos.payments.card.accept
  └── pos.checkout.methods.card_tile
pos.payments.cash.accept
  ├── pos.cash_payment.completion.execute
  ├── pos.cash_payment.controls.backspace
  ├── pos.cash_payment.controls.clear
  ├── pos.cash_payment.line.item
  ├── pos.cash_payment.line.item_total
  ├── pos.cash_payment.line.price
  ├── pos.cash_payment.line.quantity
  ├── pos.cash_payment.numpad.container
  ├── pos.cash_payment.numpad.decimal
  ├── pos.cash_payment.numpad.digit_0
  ├── pos.cash_payment.numpad.digit_00
  ├── pos.cash_payment.numpad.digit_1
  ├── pos.cash_payment.numpad.digit_2
  ├── pos.cash_payment.numpad.digit_3
  ├── pos.cash_payment.numpad.digit_4
  ├── pos.cash_payment.numpad.digit_5
  ├── pos.cash_payment.numpad.digit_6
  ├── pos.cash_payment.numpad.digit_7
  ├── pos.cash_payment.numpad.digit_8
  ├── pos.cash_payment.numpad.digit_9
  ├── pos.cash_payment.quick_amounts.container
  ├── pos.cash_payment.quick_amounts.slot_1
  ├── pos.cash_payment.quick_amounts.slot_2
  ├── pos.cash_payment.quick_amounts.slot_3
  ├── pos.cash_payment.summary.discount
  ├── pos.cash_payment.summary.order
  ├── pos.cash_payment.summary.subtotal
  ├── pos.cash_payment.summary.tax
  ├── pos.cash_payment.summary.total_due
  ├── pos.cash_payment.tender.amount_received_entry
  ├── pos.cash_payment.tender.amount_received_view
  ├── pos.cash_payment.tender.change_due
  ├── pos.cash_payment.tender.due_amount
  ├── pos.cash_payment.tender.exact
  └── pos.checkout.methods.cash_tile
pos.payments.qr.accept
  └── pos.checkout.methods.qr_tile
pos.payments.split.accept
  └── pos.checkout.methods.split_tile
pos.receipts.digital.view
  ├── pos.receipts.details.cashier
  ├── pos.receipts.details.change_due
  ├── pos.receipts.details.customer
  ├── pos.receipts.details.datetime
  ├── pos.receipts.details.discount
  ├── pos.receipts.details.item_quantity
  ├── pos.receipts.details.item_rate
  ├── pos.receipts.details.item_value
  ├── pos.receipts.details.items
  ├── pos.receipts.details.paid_amount
  ├── pos.receipts.details.payment_method
  ├── pos.receipts.details.receipt_number
  ├── pos.receipts.details.store
  ├── pos.receipts.details.subtotal
  ├── pos.receipts.details.terminal
  ├── pos.receipts.details.total
  ├── pos.sale_complete.details.cash_received
  ├── pos.sale_complete.details.cashier
  ├── pos.sale_complete.details.change_due
  ├── pos.sale_complete.details.customer
  ├── pos.sale_complete.details.datetime
  ├── pos.sale_complete.details.payment_method
  ├── pos.sale_complete.details.receipt_number
  ├── pos.sale_complete.details.total_paid
  └── pos.sale_complete.message.success
pos.sales.cart.manage
  ├── pos.cart.lines.image
  ├── pos.cart.lines.line_total
  ├── pos.cart.lines.list
  ├── pos.cart.lines.name
  ├── pos.cart.lines.note
  ├── pos.cart.lines.quantity
  ├── pos.cart.lines.unit_price
  ├── pos.cart.summary.discount
  ├── pos.cart.summary.item_count
  ├── pos.cart.summary.subtotal
  ├── pos.cart.summary.tax
  ├── pos.cart.summary.total
  └── pos.cart.summary.view
pos.sales.catalog.search
  ├── pos.catalog.search.bar
  ├── pos.catalog.search.clear
  ├── pos.catalog.search.empty_state
  ├── pos.catalog.search.results
  └── pos.catalog.search.scanner_hint
pos.sales.catalog.view
  ├── pos.catalog.product_card.discount_badge
  ├── pos.catalog.product_card.image
  ├── pos.catalog.product_card.name
  ├── pos.catalog.product_card.open_details
  ├── pos.catalog.product_card.regular_price
  ├── pos.catalog.product_card.sale_price
  ├── pos.catalog.product_detail.available_qty
  ├── pos.catalog.product_detail.cancel
  ├── pos.catalog.product_detail.close
  ├── pos.catalog.product_detail.description
  ├── pos.catalog.product_detail.image
  ├── pos.catalog.product_detail.name
  ├── pos.catalog.product_detail.note_entry
  ├── pos.catalog.product_detail.note_view
  ├── pos.catalog.product_detail.price
  ├── pos.catalog.product_detail.quantity_display
  ├── pos.catalog.product_detail.recommendations
  ├── pos.catalog.product_detail.sku
  ├── pos.catalog.product_detail.stock
  ├── pos.catalog.product_detail.variant_select
  ├── pos.catalog.product_detail.variants
  ├── pos.catalog.product_detail.view
  ├── pos.catalog.sections.frequently_sold
  ├── pos.catalog.sections.offers
  ├── pos.catalog.sections.popular
  ├── pos.catalog.sections.quick_products
  └── pos.catalog.sections.sort
pos.sales.checkout.execute
  ├── pos.checkout.customer.summary
  ├── pos.checkout.methods.container
  ├── pos.checkout.summary.discount
  ├── pos.checkout.summary.items
  ├── pos.checkout.summary.line_total
  ├── pos.checkout.summary.payment
  ├── pos.checkout.summary.price
  ├── pos.checkout.summary.quantity
  ├── pos.checkout.summary.subtotal
  ├── pos.checkout.summary.tax
  └── pos.checkout.summary.total
pos.sales.dashboard.view
  ├── pos.home.profile.avatar
  ├── pos.home.profile.name
  ├── pos.home.profile.role
  ├── pos.home.profile.view
  ├── pos.home.session_summary.discounts
  ├── pos.home.session_summary.net_sales
  ├── pos.home.session_summary.returns
  ├── pos.home.session_summary.total_sales
  ├── pos.home.session_summary.transaction_count
  ├── pos.home.session_summary.view
  ├── pos.shell.bottom_nav.container
  ├── pos.shell.topbar.brand
  ├── pos.shell.topbar.clock
  ├── pos.shell.topbar.connectivity
  ├── pos.shell.topbar.container
  ├── pos.shell.topbar.notification_bell
  ├── pos.shell.topbar.outlet
  ├── pos.shell.topbar.session_status
  ├── pos.shell.topbar.till
  ├── pos.shell.navigation.settings  [NEW/RESOLVED]
  └── pos.shell.navigation.offline_banner  [NEW/RESOLVED]
pos.sales.held_sales.create
  ├── pos.held_sales.popup.expiry
  ├── pos.held_sales.popup.note
  ├── pos.held_sales.popup.reference
  ├── pos.held_sales.popup.view
  └── pos.sales.held_sales.cancel  [NEW/RESOLVED]
pos.sales.held_sales.view
  ├── pos.held_sales.list.active_count
  ├── pos.held_sales.list.customer
  ├── pos.held_sales.list.expiry_time
  ├── pos.held_sales.list.filters
  ├── pos.held_sales.list.item_count
  ├── pos.held_sales.list.items
  ├── pos.held_sales.list.pagination
  ├── pos.held_sales.list.parked_time
  ├── pos.held_sales.list.summary
  └── pos.held_sales.list.value
pos.sales.manual_discount.apply
  ├── pos.discount.panel.amount_entry
  ├── pos.discount.panel.apply_action
  ├── pos.discount.panel.cancel_action
  ├── pos.discount.panel.reason_entry
  └── pos.discount.panel.view
pos.sales.new_sale.view
  ├── pos.new_sale.chrome.checkout_action
  ├── pos.new_sale.chrome.clear_cart_action
  ├── pos.new_sale.chrome.customer_chip
  ├── pos.new_sale.chrome.empty_cart
  ├── pos.new_sale.chrome.header
  ├── pos.new_sale.chrome.held_count
  └── pos.new_sale.chrome.park_action
pos.till.session.close
  ├── pos.till.closing.back
  ├── pos.till.closing.balance_status
  ├── pos.till.closing.counted_cash_entry
  ├── pos.till.closing.counted_cash_summary
  ├── pos.till.closing.difference
  ├── pos.till.closing.difference_summary
  ├── pos.till.closing.expected_cash
  ├── pos.till.closing.expected_cash_summary
  ├── pos.till.closing.mismatch_reason
  ├── pos.till.closing.notes
  ├── pos.till.closing.opened_by
  ├── pos.till.closing.opened_time
  ├── pos.till.closing.status_summary
  ├── pos.till.closing.summary
  └── pos.till.closing.till
pos.till.session.open
  ├── pos.till.opening.backspace
  ├── pos.till.opening.clear
  ├── pos.till.opening.confirm_message
  ├── pos.till.opening.key_0
  ├── pos.till.opening.key_00
  ├── pos.till.opening.key_1
  ├── pos.till.opening.key_2
  ├── pos.till.opening.key_3
  ├── pos.till.opening.key_4
  ├── pos.till.opening.key_5
  ├── pos.till.opening.key_6
  ├── pos.till.opening.key_7
  ├── pos.till.opening.key_8
  ├── pos.till.opening.key_9
  ├── pos.till.opening.key_decimal
  ├── pos.till.opening.note_entry
  ├── pos.till.opening.note_view
  ├── pos.till.opening.numpad
  ├── pos.till.opening.quick_amounts
  ├── pos.till.opening.quick_slot_1
  ├── pos.till.opening.quick_slot_2
  ├── pos.till.opening.quick_slot_3
  ├── pos.till.opening.starting_cash_entry
  ├── pos.till.opening.starting_cash_view
  └── pos.till.opening.validation_message
```

## Sensitive permission registry

| Permission | Data Protected | Parent |
| --- | --- | --- |
| `pos.home.session_summary.total_sales` | Total sales | `pos.sales.dashboard.view` |
| `pos.home.session_summary.discounts` | Discounts | `pos.sales.dashboard.view` |
| `pos.home.session_summary.net_sales` | Net sales | `pos.sales.dashboard.view` |
| `pos.held_sales.list.value` | Value | `pos.sales.held_sales.view` |
| `pos.held_sales.list.summary` | Summary values | `pos.sales.held_sales.view` |
| `pos.cart.summary.discount` | Cart discount | `pos.sales.cart.manage` |
| `pos.cart.summary.total` | Cart total | `pos.sales.cart.manage` |
| `pos.discount.panel.amount_entry` | Discount amount entry | `pos.sales.manual_discount.apply` |
| `pos.checkout.summary.discount` | Discount | `pos.sales.checkout.execute` |
| `pos.checkout.summary.total` | Total | `pos.sales.checkout.execute` |
| `pos.cash_payment.summary.discount` | Discount | `pos.payments.cash.accept` |
| `pos.cash_payment.summary.total_due` | Total due | `pos.payments.cash.accept` |
| `pos.cash_payment.tender.amount_received_view` | Amount received display | `pos.payments.cash.accept` |
| `pos.cash_payment.tender.amount_received_entry` | Amount received entry | `pos.payments.cash.accept` |
| `pos.cash_payment.tender.due_amount` | Due amount | `pos.payments.cash.accept` |
| `pos.cash_payment.tender.change_due` | Change due | `pos.payments.cash.accept` |
| `pos.sale_complete.details.customer` | Customer | `pos.receipts.digital.view` |
| `pos.sale_complete.details.cash_received` | Cash received | `pos.receipts.digital.view` |
| `pos.sale_complete.details.change_due` | Change due | `pos.receipts.digital.view` |
| `pos.sale_complete.details.total_paid` | Total paid | `pos.receipts.digital.view` |
| `pos.receipts.details.customer` | Customer | `pos.receipts.digital.view` |
| `pos.receipts.details.payment_method` | Payment method | `pos.receipts.digital.view` |
| `pos.receipts.details.discount` | Discount | `pos.receipts.digital.view` |
| `pos.receipts.details.total` | Total | `pos.receipts.digital.view` |
| `pos.receipts.details.paid_amount` | Paid amount | `pos.receipts.digital.view` |
| `pos.receipts.details.change_due` | Change due | `pos.receipts.digital.view` |
| `pos.customers.list.phone` | Phone | `pos.customers.management.view` |
| `pos.customers.list.email` | Email | `pos.customers.management.view` |
| `pos.customers.list.total_spend` | Total spend | `pos.customers.management.view` |
| `pos.customers.details.average_order_value` | AOV | `pos.customers.management.view` |
| `pos.customers.history.recent_purchases` | Recent purchases | `pos.customers.management.view` |
| `pos.customers.history.purchase_amounts` | Purchase amounts | `pos.customers.management.view` |
| `pos.customers.history.purchase_history` | Purchase history | `pos.customers.management.view` |
| `pos.cash_drawer.summary.opening_cash` | Opening cash | `pos.cash_drawer.position.view` |
| `pos.cash_drawer.summary.cash_sales` | Cash sales | `pos.cash_drawer.position.view` |
| `pos.cash_drawer.summary.expected_cash` | Expected cash | `pos.cash_drawer.position.view` |
| `pos.cash_drawer.movements.amount_view` | Movement amount | `pos.cash_drawer.position.view` |
| `pos.till.opening.starting_cash_view` | Starting cash view | `pos.till.session.open` |
| `pos.till.opening.starting_cash_entry` | Starting cash entry | `pos.till.session.open` |
| `pos.till.closing.expected_cash` | Expected cash | `pos.till.session.close` |
| `pos.till.closing.counted_cash_entry` | Counted cash entry | `pos.till.session.close` |
| `pos.till.closing.difference` | Difference | `pos.till.session.close` |
| `pos.till.closing.expected_cash_summary` | Expected cash summary | `pos.till.session.close` |
| `pos.till.closing.counted_cash_summary` | Counted cash summary | `pos.till.session.close` |
| `pos.till.closing.difference_summary` | Difference summary | `pos.till.session.close` |
| `pos.cash_movements.cash_in.expected_cash` | cash_in Expected cash | `pos.cash_drawer.movements.cash_in` |
| `pos.cash_movements.cash_in.available_cash` | cash_in Available/opening cash | `pos.cash_drawer.movements.cash_in` |
| `pos.cash_movements.cash_in.amount_entry` | cash_in Amount entry | `pos.cash_drawer.movements.cash_in` |
| `pos.cash_movements.cash_in.manager_pin` | cash_in Manager PIN | `pos.cash_drawer.movements.cash_in` |
| `pos.cash_movements.cash_in.resulting_balance` | cash_in Resulting balance | `pos.cash_drawer.movements.cash_in` |
| `pos.cash_movements.cash_out.expected_cash` | cash_out Expected cash | `pos.cash_drawer.movements.cash_out` |
| `pos.cash_movements.cash_out.available_cash` | cash_out Available/opening cash | `pos.cash_drawer.movements.cash_out` |
| `pos.cash_movements.cash_out.amount_entry` | cash_out Amount entry | `pos.cash_drawer.movements.cash_out` |
| `pos.cash_movements.cash_out.manager_pin` | cash_out Manager PIN | `pos.cash_drawer.movements.cash_out` |
| `pos.cash_movements.cash_out.resulting_balance` | cash_out Resulting balance | `pos.cash_drawer.movements.cash_out` |
| `pos.cash_movements.cash_drop.expected_cash` | cash_drop Expected cash | `pos.cash_drawer.movements.cash_drop` |
| `pos.cash_movements.cash_drop.available_cash` | cash_drop Available/opening cash | `pos.cash_drawer.movements.cash_drop` |
| `pos.cash_movements.cash_drop.amount_entry` | cash_drop Amount entry | `pos.cash_drawer.movements.cash_drop` |
| `pos.cash_movements.cash_drop.manager_pin` | cash_drop Manager PIN | `pos.cash_drawer.movements.cash_drop` |
| `pos.cash_movements.cash_drop.resulting_balance` | cash_drop Resulting balance | `pos.cash_drawer.movements.cash_drop` |

## Pre-auth exclusions (PRE_AUTH_CONFIGURATION)

These are not logged-in cashier role permissions:

- `pre_auth.login.screen.view` — Login screen container
- `pre_auth.login.branding.view` — Login branding
- `pre_auth.login.email.input` — Email input
- `pre_auth.login.password.input` — Password input
- `pre_auth.login.password_visibility.toggle` — Password visibility
- `pre_auth.login.submit.execute` — Login submit
- `pre_auth.login.validation.message` — Validation message

Assigning login controls through cashier roles would be circular and is forbidden.

## Existing permissions reused (representative)

| Capability family | Existing canonical | Decision |
| --- | --- | --- |
| POS Home / dashboard | `pos.sales.dashboard.view` | REUSE |
| New Sale route | `pos.sales.new_sale.view` | REUSE |
| Create sale | `pos.sales.new_sale.create` | REUSE |
| Catalog view/search | `pos.sales.catalog.view` / `search` | REUSE |
| Cart mutations | `pos.sales.cart.*` | REUSE |
| Checkout execute | `pos.sales.checkout.execute` | REUSE |
| Held sales create/view/recall | `pos.sales.held_sales.*` | REUSE |
| Cash/Card/QR/Split accept | `pos.payments.*.accept` | REUSE — remain independent |
| Receipts view/print/reprint | `pos.receipts.*` | REUSE |
| Customers view/create/update | `pos.customers.management.*` | REUSE |
| Notifications inbox | `pos.notifications.alerts.view` | REUSE parent |
| Cash drawer view/open/movements | `pos.cash_drawer.*` | REUSE parents; movement types NEW |
| Till open/close/view | `pos.till.session.*` | REUSE |
| Online orders entry | `commerce.online_order.orders.access` | REUSE |
| Returns entry | `pos.returns.search_sale.view` | REUSE |
| Print again | `pos.receipts.physical.print` / `history.reprint` | REUSE |
| Start new sale (success) | `pos.sales.new_sale.create` | REUSE |

## Runtime semantics (contract only)

Future Chunk 3+ expected evaluation:

`effective(child) = effective(parent) AND effective(child)`

Parent grant does **not** auto-grant all children forever without an explicit
migration/default policy. Resolver implementation is deferred.

## Implementation status

| Item | Status |
| --- | --- |
| Leaf code approval | DONE |
| Parent/child metadata | DONE |
| Sensitive flags | DONE |
| Pre-auth classification | DONE |
| Backend/Flutter catalog sync | DONE |
| Integrity tests | DONE |
| DB migration / seeds / role assignment | **Chunk 3 DONE** (definition seed + compatibility backfill only) |
| Effective permission resolver | DEFERRED |
| API authorization / DTO filtering | DEFERRED |
| Flutter PermissionGate / UI hide | DEFERRED |

## Deferred to Chunk 3+

- `permission_definitions` migration/seed for new+split codes — **completed in [[Cashier_POS_Canonical_Permission_Registry_Chunk_3]]**
- Role/user assignment defaults and migration behavior — **compatibility backfill completed in Chunk 3; ongoing assignment UX deferred**
- Effective permission resolver
- Backend HasPermission checks and DTO field filtering
- Flutter UI visibility / route guards for fine-grained children
- Tenant Admin permission configuration UI

