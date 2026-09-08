<!-- title: POS Payment Method Selection Implementation Specification -->
<!-- status: CANONICALIZED — IMPLEMENTATION PENDING -->
<!-- last_updated: 2026-09-03 -->

# POS Payment Method Selection Implementation Specification

## Scope and canonical journey

`Current Sale -> Proceed to Payment -> Find/Add/Skip Customer -> Payment Method -> Payment Execution`

This screen selects a method; it does not execute payment. Tapping a card only
selects it and shows selected state. `Continue Payment` is the explicit transition
to the selected execution flow. Reuse the accepted POS shell and live store,
till, till-session and notification values. No sidebar or hardcoded shell data.

Current target methods are Cash, Card, QR Payment and Split Payment. Store Credit
and Credit Sale/Pay Later are **NOT IN CURRENT IMPLEMENTATION SCOPE**. Older
prototypes showing either are non-authoritative.

## Screen contract

The Sale Summary and Select Payment Method panels are grouped inside one shared
white payment workspace card. The parent card owns only the common surface,
border, radius and outer padding; the two child panels retain their independent
content, state and interaction ownership. Wide layouts place them side by side,
while narrow layouts stack the same components inside the same parent surface.
Do not duplicate either panel or move financial/payment authority into the
visual workspace wrapper.

The Sale Summary renders only backend-authoritative/current-cart item and line
counts where supported; supported product image/reference, name, variant, SKU,
quantity, price and line total; and Subtotal, Discount, Tax and TOTAL DUE.
Flutter never owns financial totals.

The customer area shows the supported selected-customer name and phone, or
`Guest` / `Walk-in Customer` when `customerId` is null. Never create a synthetic
walk-in customer. `Change Customer` reuses checkout Find/Add/Skip, preserves sale
lines, causes authoritative summary recalculation, then returns here. Do not use
the Customer Management Attach-to-Sale API.

The right panel uses `SELECT PAYMENT METHOD`, `Choose how you would like to
receive payment.`, `Back to Sale`, an authoritative Total Due card, the dynamic
method grid and `Continue Payment`. Back preserves lines, quantities, customer
and safe checkout context. Method labels/icons/subtitles are presentation only.

## Authorization and availability

Screen access requires `pos.sales.checkout.execute`. Each offered method also requires its
existing permission:

| Method | Permission |
| --- | --- |
| Cash | `pos.payments.cash.accept` |
| Card | `pos.payments.card.accept` |
| QR Payment | `pos.payments.qr.accept` |
| Split Payment | `pos.payments.split.accept` |

No new permission is required for visibility, selection, Continue or Back.
Eligibility combines effective permission, tenant configuration, outlet/till
applicability and provider/capability availability. Backend responses must omit
unauthorized methods; Flutter renders the returned authorized list. Frontend
hide-only authorization is insufficient.

Continue revalidates a non-empty cart, authoritative valid summary,
`pos.sales.checkout.execute`, method permission, till/session/device and capability. A stale
or removed selection fails closed.

## States and behavior

- `loading`: authoritative summary pending; Continue disabled.
- `ready-no-selection`: methods shown; Continue disabled.
- `ready-selected`: one still-eligible method selected; Continue enabled.
- `error`: safe explanation/Retry; Continue disabled.
- `no-methods`: canonical unavailable state; Continue disabled.
- `permission-denied`: fail closed without protected data.

Selecting another method replaces the previous selection. Card tap never
auto-navigates. Protect Continue against duplicate taps and stale responses.

## Responsive grid

| Visible methods | Tablet/desktop arrangement |
| ---: | --- |
| 4 | 2 x 2 |
| 3 | Two on row one; one clean full-width or approved centred card on row two |
| 2 | Two equal-width cards in one row |
| 1 | One full-width or appropriately centred card |
| 0 | Empty/unavailable state |

The same widget is count-driven; positions are not hardcoded by method name.
Narrow layouts stack/adapt under existing POS rules. Use shared tokens,
accessible touch/selected/disabled states, scrollable sale lines and no clipping,
overflow or text-scale breakage.

## Business rules

- BR-01: Checkout/payment totals are backend-authoritative.
- BR-02: Customer is optional; walk-in sends `customerId = null`.
- BR-03: Changing customer requires checkout-summary revalidation.
- BR-04: Only authorized methods may be offered.
- BR-05: Only configured/available methods may be offered.
- BR-06: Card tap selects only; it does not execute payment.
- BR-07: Continue explicitly transitions to execution.
- BR-08: Revalidate selection at Continue time.
- BR-09: Back to Sale preserves cart state.
- BR-10: Zero eligible methods prevents continuation.
- BR-11: Do not create a synthetic walk-in customer.
- BR-12: Do not use stale customer-dependent totals.

## API and response contract

Reuse `POST /api/v1/pos/checkout/summary` and
`POST /api/v1/pos/checkout/start-payment`. No selection-only API is required.
Summary owns lines, financials, customer validation and method availability to
the extent its current contract exposes them.

Preferred structured `paymentMethods[]` information is code, display name,
method type, enabled/available state, optional unavailable reason and configured
sort order. Current authority confirms backend method strings but not this whole
rich shape. The richer form is an **IMPLEMENTATION CONTRACT ENHANCEMENT**, not an
existing-contract claim.

## Database decision

Reuse `payment_methods`, `sales_orders`, `sales_order_lines`, `sales_payments`,
`sales_payment_transactions`, `sales_payment_events`, `customers`,
`till_sessions` and `pos_devices`. New table: NO. New column: NO. Migration: NO.

Verified `payment_methods` attributes include `id`, `tenant_id`, `method_code`,
`method_name`, `method_type`, POS/online active flags, manual confirmation,
refund/reference/change capability flags, `sort_order` and `status`. Verified
`sales_payments` includes method reference, amount/status fields and optional
idempotency key. Do not infer Store Credit or Credit Sale schema.

## Ownership

Flutter remains under `lib/features/sale/`, reusing existing data/domain/
repository/provider layers. Use `presentation/screens/pos_payment_method_screen.dart`
and componentized `presentation/widgets/payment/` header, sale summary/line/
customer, total, dynamic grid/card and action widgets. Execution remains in
separate Cash/Card/QR/Split screens. Do not build a giant screen or duplicate
checkout layers.

Backend remains `API -> Application -> Domain -> Infrastructure`, extending the
existing `PosCheckoutController`, `PosCheckoutService`, `PosCheckoutRepository`
and payment domain contracts when needed. Do not create a duplicate module.

## Deep permission and notification filtering

`pos.notifications.alerts.view` enables notification capability, not every feature record.
The backend applies effective feature permissions before returning notification
payloads and before unread-count calculation. Sales-only users must not receive
Online Order, Return or unrelated notifications. Flutter renders only the
authorized response. No new notification permission is introduced.

## Current execution reality

| Method | Verified status |
| --- | --- |
| Cash | Existing transactional Flutter/backend path; hardware/runtime acceptance separately tracked |
| Card | Provider-neutral safe boundary exists; production provider unverified/unavailable |
| QR Payment | Selection/permission may exist; execution/provider lifecycle unverified |
| Split Payment | Groundwork may exist; true multi-tender allocation/completion unverified |

Unavailable methods never fake success, fall back to Cash, complete a sale or
receipt, or trigger the Cash drawer.

## Loading, error and acceptance contract

Handle summary loading/error/Retry, empty cart, zero permitted/available methods,
invalid till/session/device, permission denial, provider unavailable, invalid
customer and changed price/stock. Continue stays disabled without authoritative
valid checkout state.

Future tests cover entry from Customer; walk-in/real customer; Change Customer
round-trip and recalculation; Back preservation; 4/3/2/1/0 layouts; backend and
Flutter omission of every unauthorized method; select-only card taps; Continue
gating/reselection/correct route; stale permission and summary failure; filtered
notification payload/count; responsive overflow; and absence of production mocks,
hardcoded availability/totals and direct colour literals.

## Non-functional requirements

Use shared design tokens; support approved tablet/desktop/smaller layouts; keep
totals/actions reachable; make selection and unavailable reasons accessible;
protect duplicate taps and stale requests; fail closed without backend authority;
and avoid unnecessary PII/payment-data logging.
