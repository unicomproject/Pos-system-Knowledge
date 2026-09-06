<!-- title: Flutter Cash Payment Screen Implementation Specification -->
<!-- status: CANONICALIZED — IMPLEMENTATION PENDING -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Flutter Cash Payment Screen Implementation Specification

## Canonical decision and journey

`Current Sale -> Customer Find/Add/Skip -> Payment Method -> select Cash -> Continue Payment -> Cash Payment -> Complete Sale -> Payment Success`

Cash Payment never opens directly from a cart method card. Cash must first be
returned as eligible, selected on Payment Method, and confirmed with Continue.

Cash Payment reuses the **same shared Sale Summary panel** as Payment Method:

```text
Payment Method Screen ---+
                         +--> Shared Sale Summary Panel
Cash Payment Screen ------+
```

The old independent Cash `ORDER SUMMARY` and fixed Cash-specific `2/5 + 3/5`
layout are superseded. Width and responsive behavior follow the shared Payment
Method Sale Summary contract. Cash-specific widgets own only right-side tender UI.

## Shared Sale Summary ownership

Shared payment/checkout presentation owns `SALE SUMMARY`, item count, lines,
supported image/reference, name, variant, SKU, quantity, amount, subtotal,
discount, tax, `TOTAL DUE`, selected customer or Guest/Walk-in, and customer
change. Both screens consume the same state/component. Cash must not duplicate
line, financial, customer, or change-customer widgets or issue a redundant
summary call merely to render them.

Changing customer reuses the full-screen checkout-customer journey, preserves
cart state, forces authoritative summary recalculation, and returns to checkout.

## Cash right panel and functional requirements

The right panel contains `CASH PAYMENT`, Back to Payment Methods, authoritative
Due, Amount Received, dynamic Quick/Exact Cash, numeric keypad, Backspace,
Clear, exact/change state and Complete Sale.

1. Open only after Cash selection plus Continue Payment.
2. Back preserves cart, customer, discount and safe tender intent.
3. Keypad edits Amount Received; Backspace removes its last digit; Clear resets it.
4. Exact Cash sets received to Total Due.
5. Quick Cash derives dynamically from Total Due, never screenshot values.
6. Manual entry clears active Quick Cash selection where state requires it.
7. Under-tender disables Complete; exact shows Exact Cash; over-tender shows Change Due.
8. Complete reuses current Cash checkout submission and blocks double submission.
9. Failure preserves cart/customer/tender; only backend success navigates.

## Typed states

`loading`, `ready-empty`, `ready-under-tender`, `ready-exact`,
`ready-over-tender`, `submitting`, `known-rejected`, `unknown-outcome`,
`summary-error`, `permission-denied`, `till-invalid`, `device-invalid`,
`customer-invalid`, and `stock/price-changed` are explicit states.

## Amount and Quick Cash rules

Flutter may preview `changeDue = max(cashReceived - totalDue, 0)`. Backend
independently rejects negative/under-tender cash and returns final authoritative
`cashReceived` and `changeDue`. Exact means received equals Total Due; displayed
change never becomes negative.

Reuse existing `generateCashQuickAmounts(...)` or its actual equivalent. Values
derive from current Total Due and canonical currency rounding. Do not duplicate
the helper or hardcode LKR amounts. Regenerate after summary changes.

## Business rules

- Checkout summary is backend-authoritative. Customer is optional; Walk-in sends
  `customerId = null`; selected customer persists and changes recalculate summary.
- Cash requires tenant-enabled/executable method, tenant context, trusted device,
  valid open till and effective canonical permissions.
- Received/change cannot be negative; under-tender cannot complete; Exact/Quick
  Cash derives from Total Due.
- One stable idempotency key belongs to one intent. Recoverable retries preserve
  it; unknown outcomes require reconciliation, never blind new-intent retry.
- Failure never clears cart. Confirmed success persists authoritative sale,
  payment, stock and receipt state before navigation.
- Receipt/printer and Cash-drawer post-commit behavior follows existing hardware
  policy; the drawer operation is Cash-success-only.

## Authorization and deep-permission decision

Mandatory format is `domain.module.feature.action`. Current approved minimum:

- `pos.sales.checkout.execute`
- `pos.payments.cash.accept`
- `pos.customers.management.view` / `.create` only for corresponding customer actions
- `pos.notifications.alerts.view` only for notification access

Legacy `sales.checkout`, `payments.cash.accept`, `customers.view` and
`notifications.view` are not authority.

The active catalog has no separately approved Cash screen-view, manual-entry,
Quick Cash, Exact Cash, Change Due-view, or Complete-Cash codes. This is a
**permission canonicalization gap**, not authority to invent codes. Until a
separate governance decision approves/seeds deeper permissions,
`pos.payments.cash.accept` governs Cash tender actions as one capability. Do not
create digit-button permissions.

Enforcement is backend authorization + backend data filtering + frontend route/
action guard. Hiding alone is insufficient. A future financial-data restriction
must prevent unauthorized payload data, not merely hide it in Flutter.

## Existing API/backend contracts

Reuse `POST /api/v1/pos/checkout/summary` and
`POST /api/v1/pos/checkout/start-payment`. No Cash-specific API/controller/
service/repository stack is required.

Verified request concepts: `deviceId`, `saleType`, `lines[]`, `paymentMethod =
CASH`, `cashReceived`, optional `customerId`, optional `discountApplicationId`,
and `idempotencyKey`. Backend returns authoritative sale/payment identity, grand
total, cash received, change due and receipt identity/settings where supported.
Do not invent fields.

Backend remains `PosCheckoutController -> PosCheckoutService ->
PosCheckoutRepository`, capability resolution, Cash execution, domain
persistence and existing hardware orchestration.

## Database decision

New table: **NO**. New business column: **NO**. Migration: **NO**. Reuse
`payment_methods`, `sales_orders`, `sales_order_lines`, `sales_payments`,
`sales_payment_transactions`, `sales_payment_events`, `customers`,
`inventory_balances`, `stock_movements`, `receipts`, `cash_drawer_operations`,
`till_sessions`, and `pos_devices`.

Use only verified mapped order customer/totals/status; line product/variant,
quantity, price/discount/tax/total snapshots; payment method, requested/
tendered/paid/change/status/idempotency; transaction/event identity/audit;
receipt snapshot; and drawer-operation attributes. Any future permission-only
migration is separately approved and is not a Cash schema change.

## Frontend ownership

```text
sale/
  data/datasources/pos_checkout_remote_datasource.dart
  presentation/providers/
    pos_checkout_summary_provider.dart
    pos_cash_payment_provider.dart
    pos_cash_payment_intent_provider.dart
  presentation/screens/
    pos_payment_method_screen.dart
    pos_cash_payment_screen.dart
    pos_cash_payment_success_screen.dart
  presentation/widgets/
    payment/       # shared Sale Summary/line/financial/customer presentation
    cash_payment/  # Cash header, amount, quick cash, keypad, status and actions
```

Follow actual repository naming. Do not mechanically create duplicate files when
existing components already own a responsibility.

## Theme, responsive, reliability and errors

Tenant config flows through backend/theme provider to resolved POS ThemeData/
tokens. Cash accent, selected Quick/Exact, Total Due, Complete CTA and status use
runtime shared tokens—no Cash-specific hex or login-branding color.

Preserve POS header/footer. Wide layout gives Cash the remaining width beside
the shared summary; smaller supported sizes adapt without keypad clipping,
header/footer overlap or overflow. Lines scroll internally. Keypad, Backspace,
Clear, Exact, Quick, Complete and status require accessible semantics/targets.

No redundant customer/summary load, production mocks, hardcoded product/customer/
total/quick amount, sensitive logging, or success before backend confirmation.
Known rejection stays on Cash and preserves state with safe persistent feedback.
Timeout/unknown outcome preserves the intent and blocks blind retry until
reconciliation. Cart clears only after confirmed success.

## Acceptance-test contract

Future tests cover: Cash selection/Continue entry; identical shared Sale Summary
on both screens and no Cash duplicate; cart/customer/Walk-in/change/recalculation;
Back preservation; dynamic Quick/Exact/manual/backspace/clear; under/exact/over
and authoritative change; double-submit/idempotency; known/unknown failure
preservation; success-only navigation; receipt/drawer policy; canonical/deep
permissions; runtime theme; responsive overflow; and absence of mocks, fixed
amounts/totals/customer data and direct feature colors.

## Chunk 1 status

- Second Brain: **100% CANONICALIZED / READY**
- Frontend target redesign: **PENDING**
- Shared Sale Summary refactor/reuse: **PENDING**
- Backend changes: **EXPECTED REUSE / verify during implementation**
- New API/table/column/migration: **NO**
- Runtime E2E: **PENDING**

## Related documents

- [[../04_MODULE_KNOWLEDGE/24_Payment_Refund/04_Cash_Payment_Screen_Feature]]
- [[Flutter_POS_Payment_Method_Selection_Implementation_Specification]]
- [[../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../10_TESTING_QA/Test_Case/24_Payment_Refund/POS_Cash_Payment_Screen_Test_Cases]]
