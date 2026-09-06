<!-- title: Cash Payment Screen Redesign Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-04 -->

# Cash Payment Screen Redesign Implementation Status

## Chunk 1 canonicalization

| Area | Status |
| --- | --- |
| Second Brain | **100% CANONICALIZED / READY** |
| Frontend target redesign | **IMPLEMENTED / AUTOMATED-VERIFIED** |
| Shared Sale Summary refactor/reuse | **VERIFIED — exact `LeftPaymentSummaryColumn` reuse** |
| Backend | **UNCHANGED — existing checkout stack reused** |
| New API/table/column/migration | **NO** |
| Runtime E2E | **PENDING** |

## Chunk 3 authenticated runtime acceptance (2026-09-04)

| Acceptance area | Result |
| --- | --- |
| Authenticated E2E | **PASS** — `cashier001@gmail.com`, open Front Till 01, real Training Shoes cart, Walk-in, Cash, completed receipt `RCP-000178` |
| Visual acceptance | **PASS** — current POS shell preserved; shared `SALE SUMMARY`; no overflow or clipping on Pixel Tablet landscape |
| Under / exact / over tender | **PASS** — 4,000 blocked with 875 remaining; 4,875 exact with zero change; 5,000 completed with 125 change |
| Backend-authoritative success | **PASS** — success response rendered Cash Received 5,000, Change Due 125, Total Paid 4,875 |
| Direct DB inspection | **PASS** — read-only verification linked `SO-000208`, `PAY-000178`, `RCP-000178`, its single line, successful transaction/event, stock movement and one accepted drawer operation under the same tenant/till/device/session context |
| Physical printer acceptance | **BLOCKED / NOT EXECUTED** — no physical printer was available |
| Physical Cash drawer acceptance | **BLOCKED / NOT EXECUTED** — no physical drawer was available |
| Backend regression | **PASS** — solution build 0 warnings/errors; 20 `PosCheckoutRepositoryTests` passed |
| Flutter regression rerun | **PASS** — sandbox-safe elevated SDK execution resolved the SDK lockfile restriction; analyzer clean, focused closure set 90 passed, full suite 1520 passed and 1 skipped |
| Backend focused regression | **PASS** — 20 checkout repository integration tests and 23 permission/capability/completed-payment unit tests passed |

No closure product-code redesign or fix was required. The prior manual sequence
did not retain sufficiently isolated evidence for Back-navigation and customer
change, and no safe restricted-role runtime identity or shared-environment theme
mutation was available. Same-key idempotency, submit locking, known rejection
preservation and unknown-outcome intent retention remain automated evidence only.
Physical hardware was not available. These items must not be represented as
runtime passing; Software Production Readiness remains **BLOCKED**.

## Chunk 4 visual redesign — target right panel matching (2026-09-04)

- Redesigned Cash Payment right panel to visually match approved target UI (Image 2):
  - **Amount Received Section**: Upper row features `AMOUNT RECEIVED` on left and `Due: <currency> <totalDue>` on right. Large bordered card features dynamic currency prefix on left, prominent amount in center, and circular `(X)` reset button with `ValueKey('cash-amount-reset')`. Persistent error banner retained.
  - **Quick Cash Section**: Uppercase `QUICK CASH` label, left-aligned horizontal scroll list with target-styled `_ExactCashCard` (prominent theme accent border, subtle tinted background, cash icon, `EXACT`, amount, and top-right circular checkmark badge when selected) and `_StandardQuickAmountCard`.
  - **Keypad Section**: 4-column layout matching Image 2 (`1..9`, `00`, `0`, `.`). Column 4 features [Backspace] at Row 1 height and a dedicated tall [Clear] button (prominent red 'C' with 'Clear' subtitle) spanning Rows 2..4.
  - **Two-Column Middle Body**: Left side hosts numeric keypad (~62% flex); right side hosts vertical Status Card (~38% flex) with circular icon badge, status title (`EXACT CASH RECEIVED`, `AMOUNT REMAINING`, `CHANGE DUE`), status subtitle (`NO CHANGE REQUIRED`, `MORE CASH REQUIRED`, `RETURN TO CUSTOMER`), divider line, and bold formatted amount, paired with the target `CashPaymentInfoCard` below.
  - **Bottom CTA**: Full-width, ~54px tall `COMPLETE SALE` button with circular check badge, bold title, and `Complete payment and proceed` subtitle.
  - **Header**: Preserved POS top bar, with panel header featuring cash icon, title, subtitle, and pill-shaped `< Back to Payment Methods` button.
- **Automated Verification**:
  - `pos_cash_payment_target_layout_test.dart`: 4/4 passed (including 1200x700 and 900x800 responsive layout tests without overflow).
  - Full Cash Payment & Checkout Suite (50 tests): 50/50 passed.
  - Analyzer: 0 issues found (`flutter analyze lib/features/sale/ test/features/sale/`).
  - Formatter: clean (`dart format`).

## Chunk 2 implementation result (2026-09-04)

- Cash Payment now consumes the same `LeftPaymentSummaryColumn` and
  `PaymentMethodWorkspaceCard` used by Payment Method; the four former
  Cash-only order-summary files were removed.
- The right panel implements runtime-currency Amount Received/Due, reset,
  existing dynamic quick amounts including Exact, integer keypad in `1..9`,
  `00`, `0` order, Backspace, Clear, and accessible under/exact/over status.
- Complete Sale remains wired to the existing submit lock, stable payment
  intent/idempotency identity, `start-payment` repository flow, backend response
  mapping, success route, receipt and post-commit Cash drawer orchestration.
- Customer selection reuses the existing checkout-customer route. Any changed
  authoritative total is re-read by the Cash screen and Complete eligibility is
  recalculated from current `cashReceived >= totalPayable`.
- Cash-specific target widgets resolve colors from the active Flutter
  `ColorScheme`; no direct feature color literal was added.
- Focused target/responsive tests: **4 passed** at 1200x700 and 900x800.
- Cash logic/intent/submission/authority plus Payment Method regression:
  **50 passed**. Target production/test analyzer scope: **no issues found**.
- Full Flutter regression: **1520 passed, 1 skipped**; full analyzer:
  **no issues found**.
- Authenticated emulator/device completion, screenshot comparison and physical
  printer/drawer acceptance remain pending; this is not runtime sign-off.

## Superseded claims

The former `Complete` status and fixed independent `ORDER SUMMARY` (`2/5`) plus
Cash panel (`3/5`) target are no longer approved. They remain only in Git history.

## Approved target

- Payment Method selects Cash; Continue opens Cash Payment.
- Left reuses the exact shared Payment Method `SALE SUMMARY` component/state.
- Right owns Cash header, Back, Amount Received, Due, dynamic Quick/Exact Cash,
  keypad, Backspace, Clear, exact/change state and Complete Sale.
- Existing summary/start-payment APIs and backend-authoritative values are reused.
- No duplicate summary, fixed quick values, new backend stack or schema.
- Failure preserves intent/cart/customer/tender; unknown outcome follows stable
  idempotency reconciliation; confirmed success alone navigates.

## Permissions

Current authority is `pos.sales.checkout.execute` plus
`pos.payments.cash.accept`. No approved granular Cash view/manual/quick/exact/
change/complete codes exist in the active catalog. Deep Cash permission design is
a separately governed gap; this chunk creates no code, seed or migration.

## Required implementation evidence

- Shared summary reuse/identity tests across both screens.
- Cash right-panel state and interaction tests.
- Permission, authority, idempotency and failure-preservation tests.
- Runtime-theme and responsive no-overflow tests.
- Authenticated E2E through Payment Success and hardware post-commit behavior.

## Canonical reference

[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Payment_Screen_Implementation_Specification]]
