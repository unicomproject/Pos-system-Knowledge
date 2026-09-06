<!-- title: Cashier POS Canonical Permission Registry — Chunk 3 -->
<!-- status: Active — Seed + Compatibility Migration; Runtime Deferred -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cashier POS Canonical Permission Registry — Chunk 3

## Scope

Chunk 3 seeds **role-assignable** Cashier POS canonical permission definitions
into `permission_definitions` and performs **backward-compatible parent→child
assignment backfill** for existing tenant role and user grants.

This chunk does **not** implement runtime authorization, Flutter visibility,
DTO filtering, effective-permission resolution, or Tenant Admin assignment UI.

Canonical source: [[Cashier_POS_Canonical_Permission_Registry_Chunk_2]] /
`CashierPosCanonicalPermissionCatalog`.

## Strict four-tier format rule (BLOCKING)

Every seeded code MUST match:

`domain.module.feature.action`

Exactly four lowercase non-empty segments. Wildcards (`*`), slashes (`/`),
whitespace, empty segments, and shorthand patterns are **forbidden** as seed values.

Validation helper: `CashierPosPermissionCodeTaxonomy`.

## Seed mechanism

| Item | Value |
| --- | --- |
| Mechanism | EF migration SQL via seed builder (existing architecture) |
| Migration | `20260904140000_SeedCashierPosChunk3CanonicalPermissions` |
| Seed class | `CashierPosChunk3PermissionSeedData` |
| Catalog source | `CashierPosCanonicalPermissionCatalog.RoleAssignable` |
| Upsert key | `permission_code` (`ON CONFLICT DO UPDATE`) |
| New row IDs | `md5('cashier-pos-chunk3-permission:' \|\| code)::uuid` |
| Schema change | None |

## Counts

| Metric | Count |
| --- | ---: |
| Role-assignable catalog codes | 333 |
| Existing catalog codes reused (upsert) | 38 |
| Fine-grained codes (new/split/resolved) | 295 |
| Pre-auth excluded from seed | 7 |
| Parent→child compatibility pairs | 295 |

## Pre-auth exclusions

Not inserted into `permission_definitions` role catalog:

- `pre_auth.login.screen.view`
- `pre_auth.login.branding.view`
- `pre_auth.login.email.input`
- `pre_auth.login.password.input`
- `pre_auth.login.password_visibility.toggle`
- `pre_auth.login.submit.execute`
- `pre_auth.login.validation.message`

No separate pre-auth configuration store was created in Chunk 3.

## Compatibility migration rule

MIGRATION TIME ONLY:

1. If a tenant role has parent permission granted (`revoked_at IS NULL`),
   grant each catalog child of that parent to the **same** `(tenant_id, role_id)`.
2. If a tenant user has parent permission granted (`revoked_at IS NULL`),
   grant each catalog child to the **same** `(tenant_id, user_id)`.
3. If parent is absent for a tenant/role/user → **do not** grant children.
4. Idempotent: `ON CONFLICT DO NOTHING` / deterministic backfill IDs.
5. Role backfill rows are marked with notes:
   `Chunk 3 parent→child compatibility backfill.`

This is **not** permanent auto-grant semantics. After migration, parent and
child grants are independently configurable. Runtime
`effective(child) = effective(parent) AND effective(child)` remains deferred.

## Tenant safety

- Backfill copies only existing authorization intent within the same tenant.
- No cross-tenant grants.
- No global grant-all-roles behaviour.

## Idempotency

- Definition upsert is conflict-safe on `permission_code`.
- Assignment backfill is conflict-safe; second run inserts zero duplicates.

## Rollback

Down migration:

1. Deletes role assignments with Chunk 3 compatibility notes for fine-grained codes.
2. Deletes user assignments whose deterministic Chunk 3 compat IDs match.
3. Deletes fine-grained `permission_definitions` rows whose IDs match the
   Chunk 3 md5 prefix (does **not** delete historically seeded existing parents).

## Parent → child backfill matrix

| Existing Parent Permission | New Child Permission | Migration Rule | Reason |
| --- | --- | --- | --- |
| `commerce.online_order.orders.access` | `pos.home.actions.online_orders_entry` | If parent granted → grant child (same tenant/role or user) | Home Online Orders entry chrome under commerce access |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.amount_entry` | If parent granted → grant child (same tenant/role or user) | cash_drop Amount entry |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.available_cash` | If parent granted → grant child (same tenant/role or user) | cash_drop Available/opening cash |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.cancel` | If parent granted → grant child (same tenant/role or user) | cash_drop Cancel |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.confirm` | If parent granted → grant child (same tenant/role or user) | cash_drop Confirm |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.expected_cash` | If parent granted → grant child (same tenant/role or user) | cash_drop Expected cash |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.manager_pin` | If parent granted → grant child (same tenant/role or user) | cash_drop Manager PIN |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.note` | If parent granted → grant child (same tenant/role or user) | cash_drop Note |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.reason` | If parent granted → grant child (same tenant/role or user) | cash_drop Reason |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.resulting_balance` | If parent granted → grant child (same tenant/role or user) | cash_drop Resulting balance |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.summary` | If parent granted → grant child (same tenant/role or user) | cash_drop Summary |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.till` | If parent granted → grant child (same tenant/role or user) | cash_drop Till |
| `pos.cash_drawer.movements.cash_drop` | `pos.cash_movements.cash_drop.validation_message` | If parent granted → grant child (same tenant/role or user) | cash_drop Validation |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.amount_entry` | If parent granted → grant child (same tenant/role or user) | cash_in Amount entry |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.available_cash` | If parent granted → grant child (same tenant/role or user) | cash_in Available/opening cash |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.cancel` | If parent granted → grant child (same tenant/role or user) | cash_in Cancel |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.confirm` | If parent granted → grant child (same tenant/role or user) | cash_in Confirm |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.expected_cash` | If parent granted → grant child (same tenant/role or user) | cash_in Expected cash |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.manager_pin` | If parent granted → grant child (same tenant/role or user) | cash_in Manager PIN |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.note` | If parent granted → grant child (same tenant/role or user) | cash_in Note |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.reason` | If parent granted → grant child (same tenant/role or user) | cash_in Reason |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.resulting_balance` | If parent granted → grant child (same tenant/role or user) | cash_in Resulting balance |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.summary` | If parent granted → grant child (same tenant/role or user) | cash_in Summary |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.till` | If parent granted → grant child (same tenant/role or user) | cash_in Till |
| `pos.cash_drawer.movements.cash_in` | `pos.cash_movements.cash_in.validation_message` | If parent granted → grant child (same tenant/role or user) | cash_in Validation |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.amount_entry` | If parent granted → grant child (same tenant/role or user) | cash_out Amount entry |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.available_cash` | If parent granted → grant child (same tenant/role or user) | cash_out Available/opening cash |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.cancel` | If parent granted → grant child (same tenant/role or user) | cash_out Cancel |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.confirm` | If parent granted → grant child (same tenant/role or user) | cash_out Confirm |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.expected_cash` | If parent granted → grant child (same tenant/role or user) | cash_out Expected cash |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.manager_pin` | If parent granted → grant child (same tenant/role or user) | cash_out Manager PIN |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.note` | If parent granted → grant child (same tenant/role or user) | cash_out Note |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.reason` | If parent granted → grant child (same tenant/role or user) | cash_out Reason |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.resulting_balance` | If parent granted → grant child (same tenant/role or user) | cash_out Resulting balance |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.summary` | If parent granted → grant child (same tenant/role or user) | cash_out Summary |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.till` | If parent granted → grant child (same tenant/role or user) | cash_out Till |
| `pos.cash_drawer.movements.cash_out` | `pos.cash_movements.cash_out.validation_message` | If parent granted → grant child (same tenant/role or user) | cash_out Validation |
| `pos.cash_drawer.movements.create` | `pos.cash_drawer.movements.cash_drop` | If parent granted → grant child (same tenant/role or user) | Independent Cash Drop action |
| `pos.cash_drawer.movements.create` | `pos.cash_drawer.movements.cash_in` | If parent granted → grant child (same tenant/role or user) | Independent Cash In action |
| `pos.cash_drawer.movements.create` | `pos.cash_drawer.movements.cash_out` | If parent granted → grant child (same tenant/role or user) | Independent Cash Out action |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_popup.cancel` | If parent granted → grant child (same tenant/role or user) | Cancel |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_popup.continue` | If parent granted → grant child (same tenant/role or user) | Continue |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_popup.view` | If parent granted → grant child (same tenant/role or user) | Open drawer popup |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_reason.cash_count` | If parent granted → grant child (same tenant/role or user) | Open reason: cash count |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_reason.manager_operation` | If parent granted → grant child (same tenant/role or user) | Open reason: manager operation |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_reason.other` | If parent granted → grant child (same tenant/role or user) | Open reason: other |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_reason.provide_change` | If parent granted → grant child (same tenant/role or user) | Open reason: provide change |
| `pos.cash_drawer.physical.manage` | `pos.cash_drawer.open_reason.till_check` | If parent granted → grant child (same tenant/role or user) | Open reason: till check |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.amount_view` | If parent granted → grant child (same tenant/role or user) | Movement amount |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.cashier` | If parent granted → grant child (same tenant/role or user) | Movement cashier |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.date` | If parent granted → grant child (same tenant/role or user) | Movement date |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.list` | If parent granted → grant child (same tenant/role or user) | Movement list |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.time` | If parent granted → grant child (same tenant/role or user) | Movement time |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.movements.type` | If parent granted → grant child (same tenant/role or user) | Movement type |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.summary.cash_sales` | If parent granted → grant child (same tenant/role or user) | Cash sales |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.summary.expected_cash` | If parent granted → grant child (same tenant/role or user) | Expected cash |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.summary.opening_cash` | If parent granted → grant child (same tenant/role or user) | Opening cash |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.summary.status` | If parent granted → grant child (same tenant/role or user) | Status |
| `pos.cash_drawer.position.view` | `pos.cash_drawer.summary.till` | If parent granted → grant child (same tenant/role or user) | Till |
| `pos.customers.management.update` | `pos.customers.management.deactivate` | If parent granted → grant child (same tenant/role or user) | Deactivate customer |
| `pos.customers.management.view` | `pos.customers.details.average_order_value` | If parent granted → grant child (same tenant/role or user) | AOV |
| `pos.customers.management.view` | `pos.customers.details.joined_date` | If parent granted → grant child (same tenant/role or user) | Joined date |
| `pos.customers.management.view` | `pos.customers.history.purchase_amounts` | If parent granted → grant child (same tenant/role or user) | Purchase amounts |
| `pos.customers.management.view` | `pos.customers.history.purchase_history` | If parent granted → grant child (same tenant/role or user) | Purchase history |
| `pos.customers.management.view` | `pos.customers.history.recent_purchases` | If parent granted → grant child (same tenant/role or user) | Recent purchases |
| `pos.customers.management.view` | `pos.customers.list.email` | If parent granted → grant child (same tenant/role or user) | Email |
| `pos.customers.management.view` | `pos.customers.list.filters` | If parent granted → grant child (same tenant/role or user) | Filters |
| `pos.customers.management.view` | `pos.customers.list.id` | If parent granted → grant child (same tenant/role or user) | ID |
| `pos.customers.management.view` | `pos.customers.list.name` | If parent granted → grant child (same tenant/role or user) | Name |
| `pos.customers.management.view` | `pos.customers.list.order_count` | If parent granted → grant child (same tenant/role or user) | Order count |
| `pos.customers.management.view` | `pos.customers.list.pagination` | If parent granted → grant child (same tenant/role or user) | Pagination |
| `pos.customers.management.view` | `pos.customers.list.phone` | If parent granted → grant child (same tenant/role or user) | Phone |
| `pos.customers.management.view` | `pos.customers.list.search` | If parent granted → grant child (same tenant/role or user) | Search |
| `pos.customers.management.view` | `pos.customers.list.source` | If parent granted → grant child (same tenant/role or user) | Source |
| `pos.customers.management.view` | `pos.customers.list.status` | If parent granted → grant child (same tenant/role or user) | Status |
| `pos.customers.management.view` | `pos.customers.list.total_spend` | If parent granted → grant child (same tenant/role or user) | Total spend |
| `pos.customers.management.view` | `pos.customers.management.attach_sale` | If parent granted → grant child (same tenant/role or user) | Attach customer to active sale |
| `pos.notifications.alerts.view` | `pos.notifications.messages.body` | If parent granted → grant child (same tenant/role or user) | Message body |
| `pos.notifications.alerts.view` | `pos.notifications.messages.dismiss` | If parent granted → grant child (same tenant/role or user) | Dismiss |
| `pos.notifications.alerts.view` | `pos.notifications.messages.list` | If parent granted → grant child (same tenant/role or user) | Message list |
| `pos.notifications.alerts.view` | `pos.notifications.messages.mark_all_read` | If parent granted → grant child (same tenant/role or user) | Mark all read |
| `pos.notifications.alerts.view` | `pos.notifications.messages.mark_read` | If parent granted → grant child (same tenant/role or user) | Mark read |
| `pos.notifications.alerts.view` | `pos.notifications.messages.open` | If parent granted → grant child (same tenant/role or user) | Open message |
| `pos.notifications.alerts.view` | `pos.notifications.messages.timestamp` | If parent granted → grant child (same tenant/role or user) | Message timestamp |
| `pos.notifications.alerts.view` | `pos.notifications.messages.title` | If parent granted → grant child (same tenant/role or user) | Message title |
| `pos.notifications.alerts.view` | `pos.notifications.panel.unread_count` | If parent granted → grant child (same tenant/role or user) | Unread count |
| `pos.notifications.alerts.view` | `pos.notifications.panel.view` | If parent granted → grant child (same tenant/role or user) | Notification panel |
| `pos.payments.card.accept` | `pos.checkout.methods.card_tile` | If parent granted → grant child (same tenant/role or user) | Card method tile chrome |
| `pos.payments.cash.accept` | `pos.cash_payment.completion.execute` | If parent granted → grant child (same tenant/role or user) | Complete sale |
| `pos.payments.cash.accept` | `pos.cash_payment.controls.backspace` | If parent granted → grant child (same tenant/role or user) | Backspace |
| `pos.payments.cash.accept` | `pos.cash_payment.controls.clear` | If parent granted → grant child (same tenant/role or user) | Clear |
| `pos.payments.cash.accept` | `pos.cash_payment.line.item` | If parent granted → grant child (same tenant/role or user) | Item |
| `pos.payments.cash.accept` | `pos.cash_payment.line.item_total` | If parent granted → grant child (same tenant/role or user) | Item total |
| `pos.payments.cash.accept` | `pos.cash_payment.line.price` | If parent granted → grant child (same tenant/role or user) | Price |
| `pos.payments.cash.accept` | `pos.cash_payment.line.quantity` | If parent granted → grant child (same tenant/role or user) | Quantity |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.container` | If parent granted → grant child (same tenant/role or user) | Numpad container |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.decimal` | If parent granted → grant child (same tenant/role or user) | Decimal |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_0` | If parent granted → grant child (same tenant/role or user) | Key 0 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_00` | If parent granted → grant child (same tenant/role or user) | Key 00 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_1` | If parent granted → grant child (same tenant/role or user) | Key 1 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_2` | If parent granted → grant child (same tenant/role or user) | Key 2 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_3` | If parent granted → grant child (same tenant/role or user) | Key 3 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_4` | If parent granted → grant child (same tenant/role or user) | Key 4 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_5` | If parent granted → grant child (same tenant/role or user) | Key 5 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_6` | If parent granted → grant child (same tenant/role or user) | Key 6 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_7` | If parent granted → grant child (same tenant/role or user) | Key 7 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_8` | If parent granted → grant child (same tenant/role or user) | Key 8 |
| `pos.payments.cash.accept` | `pos.cash_payment.numpad.digit_9` | If parent granted → grant child (same tenant/role or user) | Key 9 |
| `pos.payments.cash.accept` | `pos.cash_payment.quick_amounts.container` | If parent granted → grant child (same tenant/role or user) | Quick Amount container |
| `pos.payments.cash.accept` | `pos.cash_payment.quick_amounts.slot_1` | If parent granted → grant child (same tenant/role or user) | Quick Amount slot 1 |
| `pos.payments.cash.accept` | `pos.cash_payment.quick_amounts.slot_2` | If parent granted → grant child (same tenant/role or user) | Quick Amount slot 2 |
| `pos.payments.cash.accept` | `pos.cash_payment.quick_amounts.slot_3` | If parent granted → grant child (same tenant/role or user) | Quick Amount slot 3 |
| `pos.payments.cash.accept` | `pos.cash_payment.summary.discount` | If parent granted → grant child (same tenant/role or user) | Discount |
| `pos.payments.cash.accept` | `pos.cash_payment.summary.order` | If parent granted → grant child (same tenant/role or user) | Order summary |
| `pos.payments.cash.accept` | `pos.cash_payment.summary.subtotal` | If parent granted → grant child (same tenant/role or user) | Subtotal |
| `pos.payments.cash.accept` | `pos.cash_payment.summary.tax` | If parent granted → grant child (same tenant/role or user) | Tax |
| `pos.payments.cash.accept` | `pos.cash_payment.summary.total_due` | If parent granted → grant child (same tenant/role or user) | Total due |
| `pos.payments.cash.accept` | `pos.cash_payment.tender.amount_received_entry` | If parent granted → grant child (same tenant/role or user) | Amount received entry |
| `pos.payments.cash.accept` | `pos.cash_payment.tender.amount_received_view` | If parent granted → grant child (same tenant/role or user) | Amount received display |
| `pos.payments.cash.accept` | `pos.cash_payment.tender.change_due` | If parent granted → grant child (same tenant/role or user) | Change due |
| `pos.payments.cash.accept` | `pos.cash_payment.tender.due_amount` | If parent granted → grant child (same tenant/role or user) | Due amount |
| `pos.payments.cash.accept` | `pos.cash_payment.tender.exact` | If parent granted → grant child (same tenant/role or user) | Exact Cash |
| `pos.payments.cash.accept` | `pos.checkout.methods.cash_tile` | If parent granted → grant child (same tenant/role or user) | Cash method tile chrome |
| `pos.payments.qr.accept` | `pos.checkout.methods.qr_tile` | If parent granted → grant child (same tenant/role or user) | QR method tile chrome |
| `pos.payments.split.accept` | `pos.checkout.methods.split_tile` | If parent granted → grant child (same tenant/role or user) | Split method tile chrome |
| `pos.receipts.digital.view` | `pos.receipts.details.cashier` | If parent granted → grant child (same tenant/role or user) | Cashier |
| `pos.receipts.digital.view` | `pos.receipts.details.change_due` | If parent granted → grant child (same tenant/role or user) | Change due |
| `pos.receipts.digital.view` | `pos.receipts.details.customer` | If parent granted → grant child (same tenant/role or user) | Customer |
| `pos.receipts.digital.view` | `pos.receipts.details.datetime` | If parent granted → grant child (same tenant/role or user) | Date/time |
| `pos.receipts.digital.view` | `pos.receipts.details.discount` | If parent granted → grant child (same tenant/role or user) | Discount |
| `pos.receipts.digital.view` | `pos.receipts.details.item_quantity` | If parent granted → grant child (same tenant/role or user) | Item quantity |
| `pos.receipts.digital.view` | `pos.receipts.details.item_rate` | If parent granted → grant child (same tenant/role or user) | Item rate |
| `pos.receipts.digital.view` | `pos.receipts.details.item_value` | If parent granted → grant child (same tenant/role or user) | Item value |
| `pos.receipts.digital.view` | `pos.receipts.details.items` | If parent granted → grant child (same tenant/role or user) | Items |
| `pos.receipts.digital.view` | `pos.receipts.details.paid_amount` | If parent granted → grant child (same tenant/role or user) | Paid amount |
| `pos.receipts.digital.view` | `pos.receipts.details.payment_method` | If parent granted → grant child (same tenant/role or user) | Payment method |
| `pos.receipts.digital.view` | `pos.receipts.details.receipt_number` | If parent granted → grant child (same tenant/role or user) | Receipt number |
| `pos.receipts.digital.view` | `pos.receipts.details.store` | If parent granted → grant child (same tenant/role or user) | Store |
| `pos.receipts.digital.view` | `pos.receipts.details.subtotal` | If parent granted → grant child (same tenant/role or user) | Subtotal |
| `pos.receipts.digital.view` | `pos.receipts.details.terminal` | If parent granted → grant child (same tenant/role or user) | Terminal |
| `pos.receipts.digital.view` | `pos.receipts.details.total` | If parent granted → grant child (same tenant/role or user) | Total |
| `pos.receipts.digital.view` | `pos.sale_complete.details.cash_received` | If parent granted → grant child (same tenant/role or user) | Cash received |
| `pos.receipts.digital.view` | `pos.sale_complete.details.cashier` | If parent granted → grant child (same tenant/role or user) | Cashier |
| `pos.receipts.digital.view` | `pos.sale_complete.details.change_due` | If parent granted → grant child (same tenant/role or user) | Change due |
| `pos.receipts.digital.view` | `pos.sale_complete.details.customer` | If parent granted → grant child (same tenant/role or user) | Customer |
| `pos.receipts.digital.view` | `pos.sale_complete.details.datetime` | If parent granted → grant child (same tenant/role or user) | Date/time |
| `pos.receipts.digital.view` | `pos.sale_complete.details.payment_method` | If parent granted → grant child (same tenant/role or user) | Payment method |
| `pos.receipts.digital.view` | `pos.sale_complete.details.receipt_number` | If parent granted → grant child (same tenant/role or user) | Receipt number |
| `pos.receipts.digital.view` | `pos.sale_complete.details.total_paid` | If parent granted → grant child (same tenant/role or user) | Total paid |
| `pos.receipts.digital.view` | `pos.sale_complete.message.success` | If parent granted → grant child (same tenant/role or user) | Success message |
| `pos.returns.search_sale.view` | `pos.home.actions.returns_entry` | If parent granted → grant child (same tenant/role or user) | Home Returns entry chrome under returns view |
| `pos.sales.cart.manage` | `pos.cart.lines.image` | If parent granted → grant child (same tenant/role or user) | Line product image |
| `pos.sales.cart.manage` | `pos.cart.lines.line_total` | If parent granted → grant child (same tenant/role or user) | Line total |
| `pos.sales.cart.manage` | `pos.cart.lines.list` | If parent granted → grant child (same tenant/role or user) | Cart lines list |
| `pos.sales.cart.manage` | `pos.cart.lines.name` | If parent granted → grant child (same tenant/role or user) | Line product name |
| `pos.sales.cart.manage` | `pos.cart.lines.note` | If parent granted → grant child (same tenant/role or user) | Line note display |
| `pos.sales.cart.manage` | `pos.cart.lines.quantity` | If parent granted → grant child (same tenant/role or user) | Line quantity display |
| `pos.sales.cart.manage` | `pos.cart.lines.unit_price` | If parent granted → grant child (same tenant/role or user) | Line unit price |
| `pos.sales.cart.manage` | `pos.cart.summary.discount` | If parent granted → grant child (same tenant/role or user) | Cart discount |
| `pos.sales.cart.manage` | `pos.cart.summary.item_count` | If parent granted → grant child (same tenant/role or user) | Cart item count |
| `pos.sales.cart.manage` | `pos.cart.summary.subtotal` | If parent granted → grant child (same tenant/role or user) | Cart subtotal |
| `pos.sales.cart.manage` | `pos.cart.summary.tax` | If parent granted → grant child (same tenant/role or user) | Cart tax |
| `pos.sales.cart.manage` | `pos.cart.summary.total` | If parent granted → grant child (same tenant/role or user) | Cart total |
| `pos.sales.cart.manage` | `pos.cart.summary.view` | If parent granted → grant child (same tenant/role or user) | Cart summary container |
| `pos.sales.catalog.search` | `pos.catalog.search.bar` | If parent granted → grant child (same tenant/role or user) | Search bar |
| `pos.sales.catalog.search` | `pos.catalog.search.clear` | If parent granted → grant child (same tenant/role or user) | Clear search |
| `pos.sales.catalog.search` | `pos.catalog.search.empty_state` | If parent granted → grant child (same tenant/role or user) | Empty search state |
| `pos.sales.catalog.search` | `pos.catalog.search.results` | If parent granted → grant child (same tenant/role or user) | Search results |
| `pos.sales.catalog.search` | `pos.catalog.search.scanner_hint` | If parent granted → grant child (same tenant/role or user) | Scanner hint |
| `pos.sales.catalog.view` | `pos.catalog.product_card.discount_badge` | If parent granted → grant child (same tenant/role or user) | Discount badge |
| `pos.sales.catalog.view` | `pos.catalog.product_card.image` | If parent granted → grant child (same tenant/role or user) | Card image |
| `pos.sales.catalog.view` | `pos.catalog.product_card.name` | If parent granted → grant child (same tenant/role or user) | Card name |
| `pos.sales.catalog.view` | `pos.catalog.product_card.open_details` | If parent granted → grant child (same tenant/role or user) | Open details |
| `pos.sales.catalog.view` | `pos.catalog.product_card.regular_price` | If parent granted → grant child (same tenant/role or user) | Regular price |
| `pos.sales.catalog.view` | `pos.catalog.product_card.sale_price` | If parent granted → grant child (same tenant/role or user) | Sale price |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.available_qty` | If parent granted → grant child (same tenant/role or user) | Available quantity |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.cancel` | If parent granted → grant child (same tenant/role or user) | Cancel detail |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.close` | If parent granted → grant child (same tenant/role or user) | Close detail |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.description` | If parent granted → grant child (same tenant/role or user) | Description |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.image` | If parent granted → grant child (same tenant/role or user) | Detail image |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.name` | If parent granted → grant child (same tenant/role or user) | Detail name |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.note_entry` | If parent granted → grant child (same tenant/role or user) | Note entry |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.note_view` | If parent granted → grant child (same tenant/role or user) | Note view |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.price` | If parent granted → grant child (same tenant/role or user) | Detail price |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.quantity_display` | If parent granted → grant child (same tenant/role or user) | Quantity display |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.recommendations` | If parent granted → grant child (same tenant/role or user) | Recommendations |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.sku` | If parent granted → grant child (same tenant/role or user) | Detail SKU |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.stock` | If parent granted → grant child (same tenant/role or user) | Detail stock |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.variant_select` | If parent granted → grant child (same tenant/role or user) | Variant selection |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.variants` | If parent granted → grant child (same tenant/role or user) | Variants |
| `pos.sales.catalog.view` | `pos.catalog.product_detail.view` | If parent granted → grant child (same tenant/role or user) | Detail view |
| `pos.sales.catalog.view` | `pos.catalog.sections.frequently_sold` | If parent granted → grant child (same tenant/role or user) | Frequently sold |
| `pos.sales.catalog.view` | `pos.catalog.sections.offers` | If parent granted → grant child (same tenant/role or user) | Offers |
| `pos.sales.catalog.view` | `pos.catalog.sections.popular` | If parent granted → grant child (same tenant/role or user) | Popular |
| `pos.sales.catalog.view` | `pos.catalog.sections.quick_products` | If parent granted → grant child (same tenant/role or user) | Quick products |
| `pos.sales.catalog.view` | `pos.catalog.sections.sort` | If parent granted → grant child (same tenant/role or user) | Sort |
| `pos.sales.checkout.execute` | `pos.checkout.customer.summary` | If parent granted → grant child (same tenant/role or user) | Customer summary |
| `pos.sales.checkout.execute` | `pos.checkout.methods.container` | If parent granted → grant child (same tenant/role or user) | Payment methods container |
| `pos.sales.checkout.execute` | `pos.checkout.summary.discount` | If parent granted → grant child (same tenant/role or user) | Discount |
| `pos.sales.checkout.execute` | `pos.checkout.summary.items` | If parent granted → grant child (same tenant/role or user) | Items |
| `pos.sales.checkout.execute` | `pos.checkout.summary.line_total` | If parent granted → grant child (same tenant/role or user) | Line total |
| `pos.sales.checkout.execute` | `pos.checkout.summary.payment` | If parent granted → grant child (same tenant/role or user) | Payment summary |
| `pos.sales.checkout.execute` | `pos.checkout.summary.price` | If parent granted → grant child (same tenant/role or user) | Price |
| `pos.sales.checkout.execute` | `pos.checkout.summary.quantity` | If parent granted → grant child (same tenant/role or user) | Quantity |
| `pos.sales.checkout.execute` | `pos.checkout.summary.subtotal` | If parent granted → grant child (same tenant/role or user) | Subtotal |
| `pos.sales.checkout.execute` | `pos.checkout.summary.tax` | If parent granted → grant child (same tenant/role or user) | Tax |
| `pos.sales.checkout.execute` | `pos.checkout.summary.total` | If parent granted → grant child (same tenant/role or user) | Total |
| `pos.sales.dashboard.view` | `pos.home.profile.avatar` | If parent granted → grant child (same tenant/role or user) | Avatar |
| `pos.sales.dashboard.view` | `pos.home.profile.name` | If parent granted → grant child (same tenant/role or user) | Cashier name |
| `pos.sales.dashboard.view` | `pos.home.profile.role` | If parent granted → grant child (same tenant/role or user) | Cashier role |
| `pos.sales.dashboard.view` | `pos.home.profile.view` | If parent granted → grant child (same tenant/role or user) | Cashier profile |
| `pos.sales.dashboard.view` | `pos.home.session_summary.discounts` | If parent granted → grant child (same tenant/role or user) | Discounts |
| `pos.sales.dashboard.view` | `pos.home.session_summary.net_sales` | If parent granted → grant child (same tenant/role or user) | Net sales |
| `pos.sales.dashboard.view` | `pos.home.session_summary.returns` | If parent granted → grant child (same tenant/role or user) | Returns metric |
| `pos.sales.dashboard.view` | `pos.home.session_summary.total_sales` | If parent granted → grant child (same tenant/role or user) | Total sales |
| `pos.sales.dashboard.view` | `pos.home.session_summary.transaction_count` | If parent granted → grant child (same tenant/role or user) | Transaction count |
| `pos.sales.dashboard.view` | `pos.home.session_summary.view` | If parent granted → grant child (same tenant/role or user) | Session summary |
| `pos.sales.dashboard.view` | `pos.shell.bottom_nav.container` | If parent granted → grant child (same tenant/role or user) | Bottom navigation container |
| `pos.sales.dashboard.view` | `pos.shell.navigation.offline_banner` | If parent granted → grant child (same tenant/role or user) | Offline/connectivity banner surface |
| `pos.sales.dashboard.view` | `pos.shell.navigation.settings` | If parent granted → grant child (same tenant/role or user) | Settings destination — no existing business permission |
| `pos.sales.dashboard.view` | `pos.shell.topbar.brand` | If parent granted → grant child (same tenant/role or user) | Brand/logo |
| `pos.sales.dashboard.view` | `pos.shell.topbar.clock` | If parent granted → grant child (same tenant/role or user) | Clock |
| `pos.sales.dashboard.view` | `pos.shell.topbar.connectivity` | If parent granted → grant child (same tenant/role or user) | Connectivity state |
| `pos.sales.dashboard.view` | `pos.shell.topbar.container` | If parent granted → grant child (same tenant/role or user) | Top bar container |
| `pos.sales.dashboard.view` | `pos.shell.topbar.notification_bell` | If parent granted → grant child (same tenant/role or user) | Notification bell chrome |
| `pos.sales.dashboard.view` | `pos.shell.topbar.outlet` | If parent granted → grant child (same tenant/role or user) | Outlet |
| `pos.sales.dashboard.view` | `pos.shell.topbar.session_status` | If parent granted → grant child (same tenant/role or user) | Till session status |
| `pos.sales.dashboard.view` | `pos.shell.topbar.till` | If parent granted → grant child (same tenant/role or user) | Till |
| `pos.sales.held_sales.create` | `pos.held_sales.popup.expiry` | If parent granted → grant child (same tenant/role or user) | Park expiry |
| `pos.sales.held_sales.create` | `pos.held_sales.popup.note` | If parent granted → grant child (same tenant/role or user) | Park note |
| `pos.sales.held_sales.create` | `pos.held_sales.popup.reference` | If parent granted → grant child (same tenant/role or user) | Park reference |
| `pos.sales.held_sales.create` | `pos.held_sales.popup.view` | If parent granted → grant child (same tenant/role or user) | Park popup |
| `pos.sales.held_sales.create` | `pos.sales.held_sales.cancel` | If parent granted → grant child (same tenant/role or user) | Approve independent cancel; historical create-alias insufficient for fine-grained target |
| `pos.sales.held_sales.view` | `pos.held_sales.list.active_count` | If parent granted → grant child (same tenant/role or user) | Active count |
| `pos.sales.held_sales.view` | `pos.held_sales.list.customer` | If parent granted → grant child (same tenant/role or user) | Customer |
| `pos.sales.held_sales.view` | `pos.held_sales.list.expiry_time` | If parent granted → grant child (same tenant/role or user) | Expiry time |
| `pos.sales.held_sales.view` | `pos.held_sales.list.filters` | If parent granted → grant child (same tenant/role or user) | Filters |
| `pos.sales.held_sales.view` | `pos.held_sales.list.item_count` | If parent granted → grant child (same tenant/role or user) | Item count |
| `pos.sales.held_sales.view` | `pos.held_sales.list.items` | If parent granted → grant child (same tenant/role or user) | Items |
| `pos.sales.held_sales.view` | `pos.held_sales.list.pagination` | If parent granted → grant child (same tenant/role or user) | Pagination |
| `pos.sales.held_sales.view` | `pos.held_sales.list.parked_time` | If parent granted → grant child (same tenant/role or user) | Parked time |
| `pos.sales.held_sales.view` | `pos.held_sales.list.summary` | If parent granted → grant child (same tenant/role or user) | Summary values |
| `pos.sales.held_sales.view` | `pos.held_sales.list.value` | If parent granted → grant child (same tenant/role or user) | Value |
| `pos.sales.manual_discount.apply` | `pos.discount.panel.amount_entry` | If parent granted → grant child (same tenant/role or user) | Discount amount entry |
| `pos.sales.manual_discount.apply` | `pos.discount.panel.apply_action` | If parent granted → grant child (same tenant/role or user) | Apply discount control |
| `pos.sales.manual_discount.apply` | `pos.discount.panel.cancel_action` | If parent granted → grant child (same tenant/role or user) | Cancel discount control |
| `pos.sales.manual_discount.apply` | `pos.discount.panel.reason_entry` | If parent granted → grant child (same tenant/role or user) | Discount reason |
| `pos.sales.manual_discount.apply` | `pos.discount.panel.view` | If parent granted → grant child (same tenant/role or user) | Discount panel |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.checkout_action` | If parent granted → grant child (same tenant/role or user) | Proceed to checkout chrome |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.clear_cart_action` | If parent granted → grant child (same tenant/role or user) | Clear cart chrome |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.customer_chip` | If parent granted → grant child (same tenant/role or user) | Customer chip |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.empty_cart` | If parent granted → grant child (same tenant/role or user) | Empty cart message |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.header` | If parent granted → grant child (same tenant/role or user) | New sale header |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.held_count` | If parent granted → grant child (same tenant/role or user) | Held sales count badge |
| `pos.sales.new_sale.view` | `pos.new_sale.chrome.park_action` | If parent granted → grant child (same tenant/role or user) | Park action chrome |
| `pos.till.session.close` | `pos.till.closing.back` | If parent granted → grant child (same tenant/role or user) | Back |
| `pos.till.session.close` | `pos.till.closing.balance_status` | If parent granted → grant child (same tenant/role or user) | Balance status |
| `pos.till.session.close` | `pos.till.closing.counted_cash_entry` | If parent granted → grant child (same tenant/role or user) | Counted cash entry |
| `pos.till.session.close` | `pos.till.closing.counted_cash_summary` | If parent granted → grant child (same tenant/role or user) | Counted cash summary |
| `pos.till.session.close` | `pos.till.closing.difference` | If parent granted → grant child (same tenant/role or user) | Difference |
| `pos.till.session.close` | `pos.till.closing.difference_summary` | If parent granted → grant child (same tenant/role or user) | Difference summary |
| `pos.till.session.close` | `pos.till.closing.expected_cash` | If parent granted → grant child (same tenant/role or user) | Expected cash |
| `pos.till.session.close` | `pos.till.closing.expected_cash_summary` | If parent granted → grant child (same tenant/role or user) | Expected cash summary |
| `pos.till.session.close` | `pos.till.closing.mismatch_reason` | If parent granted → grant child (same tenant/role or user) | Mismatch reason |
| `pos.till.session.close` | `pos.till.closing.notes` | If parent granted → grant child (same tenant/role or user) | Notes |
| `pos.till.session.close` | `pos.till.closing.opened_by` | If parent granted → grant child (same tenant/role or user) | Opened by |
| `pos.till.session.close` | `pos.till.closing.opened_time` | If parent granted → grant child (same tenant/role or user) | Opened time |
| `pos.till.session.close` | `pos.till.closing.status_summary` | If parent granted → grant child (same tenant/role or user) | Status summary |
| `pos.till.session.close` | `pos.till.closing.summary` | If parent granted → grant child (same tenant/role or user) | Summary |
| `pos.till.session.close` | `pos.till.closing.till` | If parent granted → grant child (same tenant/role or user) | Till |
| `pos.till.session.open` | `pos.till.opening.backspace` | If parent granted → grant child (same tenant/role or user) | Backspace |
| `pos.till.session.open` | `pos.till.opening.clear` | If parent granted → grant child (same tenant/role or user) | Clear |
| `pos.till.session.open` | `pos.till.opening.confirm_message` | If parent granted → grant child (same tenant/role or user) | Confirm message |
| `pos.till.session.open` | `pos.till.opening.key_0` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 0 |
| `pos.till.session.open` | `pos.till.opening.key_00` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 00 |
| `pos.till.session.open` | `pos.till.opening.key_1` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 1 |
| `pos.till.session.open` | `pos.till.opening.key_2` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 2 |
| `pos.till.session.open` | `pos.till.opening.key_3` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 3 |
| `pos.till.session.open` | `pos.till.opening.key_4` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 4 |
| `pos.till.session.open` | `pos.till.opening.key_5` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 5 |
| `pos.till.session.open` | `pos.till.opening.key_6` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 6 |
| `pos.till.session.open` | `pos.till.opening.key_7` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 7 |
| `pos.till.session.open` | `pos.till.opening.key_8` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 8 |
| `pos.till.session.open` | `pos.till.opening.key_9` | If parent granted → grant child (same tenant/role or user) | Open till numpad key 9 |
| `pos.till.session.open` | `pos.till.opening.key_decimal` | If parent granted → grant child (same tenant/role or user) | Open till numpad key decimal |
| `pos.till.session.open` | `pos.till.opening.note_entry` | If parent granted → grant child (same tenant/role or user) | Note entry |
| `pos.till.session.open` | `pos.till.opening.note_view` | If parent granted → grant child (same tenant/role or user) | Note view |
| `pos.till.session.open` | `pos.till.opening.numpad` | If parent granted → grant child (same tenant/role or user) | Numpad |
| `pos.till.session.open` | `pos.till.opening.quick_amounts` | If parent granted → grant child (same tenant/role or user) | Quick amounts |
| `pos.till.session.open` | `pos.till.opening.quick_slot_1` | If parent granted → grant child (same tenant/role or user) | Quick slot 1 |
| `pos.till.session.open` | `pos.till.opening.quick_slot_2` | If parent granted → grant child (same tenant/role or user) | Quick slot 2 |
| `pos.till.session.open` | `pos.till.opening.quick_slot_3` | If parent granted → grant child (same tenant/role or user) | Quick slot 3 |
| `pos.till.session.open` | `pos.till.opening.starting_cash_entry` | If parent granted → grant child (same tenant/role or user) | Starting cash entry |
| `pos.till.session.open` | `pos.till.opening.starting_cash_view` | If parent granted → grant child (same tenant/role or user) | Starting cash view |
| `pos.till.session.open` | `pos.till.opening.validation_message` | If parent granted → grant child (same tenant/role or user) | Validation |

## Special business migration decisions

| Capability | Decision |
| --- | --- |
| Held Sale Cancel | Backfill from `pos.sales.held_sales.create` |
| Cash In / Out / Drop | Backfill from `pos.cash_drawer.movements.create` |
| Customer Attach to Sale | Backfill from `pos.customers.management.view` |
| Customer Deactivate | Backfill from `pos.customers.management.update` only |
| Settings navigation | Backfill from `pos.sales.dashboard.view` |
| Returns home entry | Backfill from `pos.returns.search_sale.view` |
| Online Orders home entry | Backfill from `commerce.online_order.orders.access` |

## Implementation status

| Item | Status |
| --- | --- |
| Definition seed | DONE |
| Compatibility backfill | DONE |
| Format validation tests | DONE |
| Idempotency / tenant-scope SQL contract tests | DONE |
| Runtime authorization | DEFERRED Chunk 4+ |
| Flutter PermissionGate / UI hide | DEFERRED |
| Effective permission resolver | DEFERRED |
| Tenant Admin assignment UI | DEFERRED |

## Deferred to Chunk 4+

- Ongoing role-assignment workflows
- Effective permission resolver
- Backend endpoint HasPermission expansion for fine-grained codes
- Flutter visibility gates
- Sensitive DTO filtering
- Tenant Admin permission configuration UI

