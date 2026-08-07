<!-- title: ADR 008 Park Recall Sale Authority And Expiry -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# ADR 008 Park Recall Sale Authority And Expiry

## Context

Park/Recall must be backend-authoritative online, with clear cashier UX for
visibility, list scope, card summary and cancel confirmation. Gap-closure work
on 2026-08-06 added stock non-reservation, partial-pay rejection, DB
idempotency, hold events, and lazy `EXPIRED` persistence.

## Decision

### Core authority (prior)

- Backend is authoritative for online Park/Recall (`PosHoldsController`).
- Cashier terms: Park Sale, Parked Sales, Recall Sale; `/holds` internal names OK.
- Park Reference `PS-{UTC_YEAR}-{5 digit}` generated only after successful create;
  Flutter is display-only for the reference.
- Expiry = backend server UTC + 24 hours; no editable Flutter expiry.
- Optional park short note ≤250 characters; customer from active cart.
- Cart clears only after confirmed 201 success (before success dialog).
- No payment, receipt, printer or cash-drawer action on park/recall/cancel.
- No cross-cashier or manager override; no silent local/backend merge.
- Offline/outbox is a separate contract.
- Cancel uses `sales.park.create`; no separate cancel permission.
- Canonical permissions: `sales.park.create|view|recall`. Legacy `pos.sale.park*`
  demoted to compatibility aliases.

### Approved product decisions — 2026-08-06

| ID | Decision |
|---|---|
| A | Park Sale and Recall Sale are mutually exclusive by valid cart lines. Non-empty → Park Sale only. Empty (including customer-only or discount-only) → Recall Sale only. Successful recall switches back to Park Sale. No silent cart overwrite. |
| B | Parked Sales cards show product-name summary: one name; two names; or first two + `+N more`. Backend line order; separate from `itemCount`; no display-only API. |
| C | Cancel opens confirmation with required Cancel Reason (trim; not blank; max 250). Service enforces mandatory reason. No new cancel permission. |
| D | Active Parked Sales list and home count use current tenant + current till (trusted device/open session) + holding cashier + HELD + non-expired. Till/session change reloads the list. |

### Gap-closure decisions — 2026-08-06

| ID | Decision |
|---|---|
| E | **Stock non-reservation.** Park does not reserve or deduct stock. Soft validate on park; recall may return `StockWarnings`; checkout remains the hard stock authority. |
| F | **Partial-pay cannot park.** Optional `SourceSaleId`; if the source sale is partially paid, reject with `pos_holds.sale_partially_paid_cannot_be_parked`. |
| G | **DB idempotency.** Persist `idempotency_key` and `request_fingerprint` on `pos_order_holds`. Partial unique index `UNIQUE (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL`. Same key + same fingerprint → replay; same key + different fingerprint → conflict. PostgreSQL concurrency tests cover races. |
| H | **Lazy EXPIRED.** `ExpireDueHolds` persists `EXPIRED` status and is invoked from list, count, recall, and cancel paths. |
| I | **Recall leaves DRAFT.** Recalled SalesOrder remains `DRAFT` intentionally until checkout. |
| J | **Hold audit events.** Table `pos_order_hold_events` records `PARK_CREATED`, `PARK_IDEMPOTENT_REPLAY`, `PARK_RECALLED`, `PARK_CANCELLED`, `PARK_EXPIRED`. Migration `20260806190000_AddPosHoldIdempotencyAndEvents`. |

## Alternatives Rejected

| Alternative | Reason |
|---|---|
| Device-local final authority | Unreliable lifecycle and recalculation |
| Client-generated reference / `HOLD-######` as current | Fabrication/collision; superseded by `PS-{UTC_YEAR}-{5 digit}` |
| Client-selected expiry | Client clock not authoritative |
| Show Park and Recall together | Allows overwrite risk and unclear primary action |
| Optional Cancel Reason as final product rule | Weak audit/operator intent |
| Cashier-picked till filter | Till must come from trusted session |
| Display-only products API | Redundant; lines already returned |
| Reserve/deduct stock on park | Blocks inventory for unpaid drafts; checkout must own hard authority |
| Allow parking partially paid sales | Partial payments must stay on payment/checkout paths |
| Eager background-only expiry without list/recall/cancel touch | Active views would show stale HELD rows |
| Separate cancel permission | Unnecessary; create already gates destructive park ops |

## Consequences

- Flutter Done closes success modal only; cart already cleared after 201.
- Home `/pos/parked-sales` is real `PosParkedSalesScreen`, same provider; recall → New Sale.
- Tracking docs: code + automated tests Implemented; authenticated runtime E2E
  remains Runtime Verification Pending — not Fully Completed.
- Scope log entry: 2026-08-06 gap closure implementation.

## Related Files

- [[../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]
- [[../Scope_Change_Log]]
