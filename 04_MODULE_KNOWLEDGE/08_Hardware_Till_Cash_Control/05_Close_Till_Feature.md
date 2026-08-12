<!-- title: Close Till Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Close Till Feature

## Purpose

Defines the production contract for closing the cashier's currently assigned
till, reconciling cash and optionally ending the authenticated shift. This is
the canonical Close Till contract; current-code gaps are stated explicitly.

## Current Readiness

| Area | Finding |
|---|---|
| Flutter screen and route | Implemented |
| Close API and permission | Implemented |
| CLOSED session/event write | Implemented |
| Backend-authoritative expected cash | **Missing — release blocker** |
| `cash_reconciliations` persistence | **Missing — release blocker** |
| Authenticated production E2E | Not accepted after required backend changes |

The existing implementation is reusable but is **not production complete**.
Documentation is ready for implementation; this status is not runtime acceptance.

## Entry Paths And Modes

- Normal close: `/pos/cash-drawer/close-till`.
- End Shift: `/pos/cash-drawer/close-till?endShift=true`.
- End Shift must never clear authentication before a successful close response.
- If no open session exists, show the explicit no-open-session state and do not
  expose a successful local close.

## Approved UI Contract

Reuse the Cashier Dashboard top bar and shell context. The content area contains:

1. Close Till page header and short reconciliation guidance.
2. Till information bar: till, opened by, opened time and currency.
3. Counted Cash form field.
4. Read-only backend-authoritative Expected Cash.
5. Difference badge and variance-reason control when difference is non-zero.
6. Optional Closing Notes, maximum 500 characters in Flutter and backend.
7. Close summary card.
8. Bottom actions: Save Draft and Close Till.

Use the established OneVerz orange primary action, navy text, white cards, subtle
grey borders and semantic green/warning/error states. Do not introduce the legacy
purple/blue gradient theme.

## Reusable Component Contract

Keep the current component split:

```text
lib/features/cash_drawer/presentation/
  screens/pos_close_till_screen.dart
  providers/close_till_provider.dart
  widgets/close_till_page_header.dart
  widgets/close_till_till_info_bar.dart
  widgets/close_till_form_card.dart
  widgets/close_till_difference_badge.dart
  widgets/close_till_mismatch_warning_card.dart
  widgets/close_till_summary_card.dart
  widgets/close_till_bottom_actions.dart
```

Extend these components; do not create a second Close Till screen or duplicate
the dashboard top bar.

## Functional Requirements

- Load the trusted device's current open session and authoritative close summary.
- Display monetary values in the session currency.
- Accept non-negative counted cash with currency precision.
- Calculate the displayed difference as counted minus authoritative expected.
- Require one approved reason for every non-zero difference.
- Balanced means zero; Short means negative; Over means positive.
- Disable repeated submission while the close request is processing.
- Refresh/bootstrap session state only after normal close success.
- Clear auth and navigate to tenant login only after End Shift close success.
- Preserve the open till and authenticated session on API/network failure.

## Business Rules

- `pos.till.close` is required; no new permission is needed.
- The device must be trusted, ACTIVE and actively assigned to the requested till.
- The till must be ACTIVE and have exactly one open session in tenant scope.
- Flutter must never supply authoritative Expected Cash for persistence.
- The backend calculates Expected Cash from canonical session cash activity.
- A non-zero variance requires a backend-approved reason code/value.
- Closing notes are optional and separate from the variance reason in the API.
- Final close is online and backend-authoritative; no offline fake CLOSED state.
- A successful close is immutable from the cashier flow.

## Expected Cash Contract

Target Expected Cash is calculated server-side from the opening float plus
canonical cash-affecting activity for that till session, including accepted cash
payments/refunds and `till_cash_movements` according to configured movement
effect. The read summary and close command must use the same calculator and
transactional snapshot.

Current repository behavior is unsafe: it uses request `ExpectedCash` when
provided and otherwise uses only `OpeningFloatAmount`. This is a release blocker.

## API Contract

| Method | Route | Decision |
|---|---|---|
| GET | `/api/v1/tills/current-session?deviceId=` | Reuse and extend/add close-summary fields; no separate route required unless response compatibility requires it |
| POST | `/api/v1/tills/close` | Reuse but modify implementation for authoritative calculation and atomic reconciliation |

Current request fields are `deviceId`, `tillId`, `countedCash`, optional
`expectedCash`, `mismatchReason` and `closingNote`. Target callers must omit
`expectedCash`; it remains transition-only until removed or ignored server-side.

The success response keeps the closed session: identifiers, opening float,
expected cash, counted cash, difference, `CLOSED`, opened/closed timestamps and
closing note. Existing controller error codes remain canonical: authentication,
permission, device/assignment/till, no-open-session and validation failures.

## Atomic Persistence Contract

One database transaction must atomically:

1. lock/revalidate the open till session;
2. calculate authoritative expected cash;
3. validate counted cash and variance reason;
4. update `till_sessions` to CLOSED;
5. insert one `cash_reconciliations` row;
6. insert one `till_session_events` row with `event_type = CLOSED`;
7. commit once, or roll back every change.

Concurrent/repeated close must not create two reconciliations or two CLOSED
events. Existing schema constraints are reused; no new table, attribute or
migration is required for this contract.

## Database Contract

| Table | Close Till responsibility |
|---|---|
| `till_sessions` | Set status, closer, closing device/note and closed timestamp; cash amounts belong in reconciliation |
| `cash_reconciliations` | Persist expected, counted, difference, currency, status/reason and calculation evidence |
| `till_session_events` | Append one CLOSED audit event |
| `till_cash_movements` | Canonical session cash-movement input; do not rename to `cash_movements` |
| `cash_movement_types` | Defines whether a movement affects expected cash |
| `till_session_payment_summaries` | Optional derived summary input/output; not a substitute for reconciliation |

## Current Audit Finding

The current close repository updates `till_sessions` and calls
`TillSessionEvent.RecordClosed`, so a CLOSED event is written in the same
`SaveChanges` operation. It does **not** insert `cash_reconciliations`. The event
records actor, device, counted amount, currency, timestamp and note; richer
calculation evidence belongs in reconciliation data.

## Save Draft Contract

Current Flutter draft is in-memory provider state. Because the provider is
auto-disposed, it is not durable across route disposal or app restart. Label it
as temporary same-lifetime convenience only. Durable close drafts are not an
approved Release 1 requirement; do not imply persistence.

## Error And Recovery Rules

- Inline form errors: invalid counted cash, missing variance reason, note length.
- Full content state: no open till, permission denied or summary load failure.
- Submission failure: keep entered values and open/authenticated session; allow
  intentional retry only after the response is known unsuccessful.
- End Shift logout failure after confirmed close must not submit another close;
  recover by re-bootstrap/session-clear handling.

## Responsive And Accessibility Rules

- Desktop/tablet: two-column form and summary where width permits.
- Compact widths: one-column stacking with bottom actions remaining reachable.
- Avoid nested full-page scrolling; allow content scroll only when viewport or
  text scale requires it.
- Meet 44 logical-pixel targets, keyboard traversal, semantic labels, visible
  focus and non-colour variance indicators.

## Verification Gate

Production completion requires focused backend tests, Flutter widget/provider
tests and one authenticated real E2E for balanced and variance close. Verify one
session, one reconciliation and one CLOSED event, no duplicate close, correct
normal-close bootstrap and End Shift logout. Until then status remains blocked.

## Related Files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[04_Open_Till_Feature]]
- [[../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Close_Till_Screen_Implementation_Specification]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Sales/End_Shift_And_Close_Till_Implementation_Status]]
