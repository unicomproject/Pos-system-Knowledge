<!-- title: Park Recall Sale Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-07 -->

# Park Recall Sale Feature

## Purpose and Scope

Approved cashier Park/Recall contract. Terms: **Park Sale**, **Parked Sales**,
**Recall Sale**, **Cancel Reason**. Routes `/api/v1/pos/holds` may keep Hold names.
Controller: `PosHoldsController`.

## Implementation vs verification

| Layer | Status |
|---|---|
| Code + automated tests | **Implemented** (see tracking docs) |
| Authenticated full cashier runtime E2E | **Runtime Verification Pending** |
| Feature Completed / 100% | **Not claimed** |

## Approved UI Contract

- Park modal: pause icon, `Park Sale`, short description, close X.
- Park Reference read-only until success: `Generated automatically after parking`.
- One optional `Short Note` (max 250 trimmed). Active-cart customer only.
- Message: `This parked sale will be available for 24 hours.`
- Footer Cancel + Park Sale; submit disabled while in flight; Cancel/X keep cart.
- Do not expose cashier, status, outlet, till, device, totals, expiry or tenant inputs.
- After `201 Created`: cart clears **before** the success dialog; Done closes the
  success modal only (no second API); double-tap submit is guarded.
- Home `/pos/parked-sales` is `PosParkedSalesScreen` (same provider as New Sale
  Parked Sales). Recall navigates to New Sale with restored cart.

### Dedicated Parked Sales screen target

The approved Dashboard screen adds Today (default), This Shift and All Parked
Sales filters; Park Reference/Customer/Items/Parked Time/Amount/Actions columns;
View, Recall Sale and Cancel Parked Sale actions; authoritative count/value
summary; and Start New Sale. It excludes a repetitive Cashier column and never
uses Delete. Current cards do not yet implement that target. Full current/target
contract: [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].

Backend Chunk 1 is implemented on the existing GET route: Today (default) uses
the open till session business date, This Shift uses its session ID, and All
Parked Sales means all-active within the base authority scope. Page defaults are
1/25 with maximum 100. Filtered `totalCount`, `totalValue` and session currency
are computed before pagination. Flutter table/filter/summary work remains pending.

### Park Sale / Recall Sale visibility (Decision A)

| Valid cart lines | Park Sale | Recall Sale |
|---|---|---|
| ≥ 1 | Show | Hide |
| 0 | Hide | Show |

Empty cart = no valid lines. Customer-only or discount-only remains empty.
Do not hide unrelated New Sale actions. Successful recall → cart non-empty →
show Park Sale / hide Recall Sale. Never silently overwrite a non-empty cart.

### Parked Sales card summary (Decision B)

- 1 line: that product name. 2 lines: both names. >2: first two + `+N more`.
- Example: `Items: Training Jersey, Match Shorts +2 more`.
- Backend line order; no display-only API; wrap/truncate safely.
- Keep `itemCount` and the name summary as separate display elements.

### Cancel confirmation (Decision C)

Confirmation must show Park Reference, cancellation warning, **Cancel Reason**,
Back/Close and Confirm Cancel. Reason required (trim; reject blank/whitespace;
max 250); inline validation; one in-flight submit; preserve reason after
retryable failure; clear only after success or intentional close.
**Implemented:** service rejects blank cancel reason. Cancel authorization remains
`sales.park.create` (no separate cancel permission).

### List scope (Decision D)

**Approved / implemented predicate:** tenant + current till (trusted device +
open till session) + holding cashier + `HELD` + non-expired. Home parked-sales
count uses the same active-hold predicate. Till/session change reloads the list.
Flutter must not own authoritative till ID.

## Functional Requirements

| ID | Requirement | Current |
|---|---|---|
| PRK-01 | Park only when ≥1 valid line; preserve cart while modal open | Implemented |
| PRK-02 | Use cart customer and optional discount context | Implemented |
| PRK-03 | Optional park note ≤250 trimmed characters | Implemented |
| PRK-04 | Backend generates `PS-{UTC_YEAR}-{5 digit}`; server UTC +24h expiry | Implemented |
| PRK-05 | DB + request idempotency; disable double tap | Implemented |
| PRK-06 | Clear cart after `201 Created`, before success dialog | Implemented |
| PRK-07 | Show returned reference; refresh list/count; clean New Sale | Implemented |
| PRK-08 | List/count active accessible non-expired holds (aligned predicate) | Implemented |
| PRK-09 | Soft stock validate on park; recall returns StockWarnings; checkout hard | Implemented |
| PRK-10 | Cancel via DELETE; atomic `CANCELLED`; mandatory reason at service | Implemented |
| PRK-11 | Loading/empty/success/validation/denied/conflict/expired/network states | Implemented (code) |
| PRK-12 | Mutually exclusive Park Sale / Recall Sale visibility | Implemented (code) |
| PRK-13 | Product-name summary: first two names + `+N more` | Target; verify in UI E2E |
| PRK-14 | Cancel confirmation with mandatory Cancel Reason | Implemented |
| PRK-15 | Partially paid source sale cannot park | Implemented |
| PRK-16 | Lazy expiry: `ExpireDueHolds` persists `EXPIRED` on list/count/recall/cancel | Implemented |
| PRK-17 | Recall leaves SalesOrder `DRAFT` intentionally | Implemented |
| PRK-18 | Audit events on `pos_order_hold_events` | Implemented |

## Validation Matrix

| Input/context | Rule |
|---|---|
| Cart/lines | ≥1 line for Park; VariantId valid; qty > 0 |
| Empty cart definition | No valid lines; customer/discount alone ≠ non-empty |
| DeviceId | Required; trusted and assigned |
| Park note | Optional; trim; max 250 |
| Cancel Reason | Required at service; trim; max 250 |
| Idempotency key | Required; stable; max 100; DB unique per tenant when not null |
| Request fingerprint | Same key + same fingerprint → replay; different fingerprint → conflict |
| SourceSaleId | Optional; if partially paid → `pos_holds.sale_partially_paid_cannot_be_parked` |
| Till/session | From trusted context; list/recall scoped to current till |
| Stock on park | Soft validate only; no reserve/deduct |
| Stock on recall | Soft warnings returned; checkout remains hard authority |
| Pricing | Backend-valid on create; revalidated on recall |

## Permissions and API

| Permission | Behaviour |
|---|---|
| `sales.park.create` | Park Sale; cancel authorization |
| `sales.park.view` | List/count (incl. home count) |
| `sales.park.recall` | Recall |

Canonical codes only for Flutter home/Park actions. Legacy `pos.sale.park*` are
compatibility/demoted aliases, not the authorizing contract.

| Operation | Route | Notes |
|---|---|---|
| Create | `POST /api/v1/pos/holds` | 201; PS reference; idempotent |
| List | `GET /api/v1/pos/holds?deviceId=&scope=&page=&pageSize=` | Active scoped/paged holds; runs `ExpireDueHolds` |
| Recall | `POST /api/v1/pos/holds/{holdId}/recall` | 200; recalculated cart + StockWarnings |
| Cancel | `DELETE /api/v1/pos/holds/{holdId}?reason=` | 204; reason mandatory at service |

Lifecycle: `HELD → RELEASED|CANCELLED|EXPIRED`. Create/recall/cancel atomic.
Audit event types: `PARK_CREATED`, `PARK_IDEMPOTENT_REPLAY`, `PARK_RECALLED`,
`PARK_CANCELLED`, `PARK_EXPIRED`.
Migration: `20260806190000_AddPosHoldIdempotencyAndEvents`.
No payment, receipt, print or drawer on park/recall/cancel. No cross-cashier
override. No silent merge of legacy local storage with backend records.

## Stock and payment boundaries

- Park does **not** reserve or deduct stock.
- Soft validation on park; recall may return `StockWarnings`; checkout is the
  hard stock authority.
- Partially paid sales cannot be parked
  (`pos_holds.sale_partially_paid_cannot_be_parked` via optional `SourceSaleId`).
- After recall, the related SalesOrder remains `DRAFT` by design.

## Remaining verification (not code gaps)

- Full authenticated cashier E2E (Park → list → recall → cancel) still pending.
- Do not mark feature Fully Completed without that runtime evidence.
- See [[../../../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Park_Recall_Sale_Implementation_Status]]
  and [[../../../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Pos_Park_Recall_Sale_Implementation_Status]].

## Related Files

- [[../../03_USER_JOURNEYS/Cashier/12_Park_Recall_Sale_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Park_Recall_Sale_Implementation_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
