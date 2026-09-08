<!-- title: Payment Method Screen Redesign Implementation Status -->
<!-- status: IMPLEMENTED AND AUTOMATED-VERIFIED — RUNTIME VISUAL AND NOTIFICATION API PENDING -->

# Payment Method Screen Redesign Implementation Status

## Cash final-closure update (2026-09-04)

- Current analyzer is clean; combined Cash, Payment Method and customer/checkout
  focused regression passed 90 tests; full Flutter passed 1520 with 1 skip.
- Authenticated Cash happy path and read-only database persistence are verified.
- An isolated Back-to-Payment-Methods runtime round-trip was not captured, so it
  remains pending and is not inferred from ordinary navigation.
- No Payment Method production code, API or persistence contract changed.

## Runtime regression update (2026-09-04)

- Authenticated Pixel Tablet flow reached Payment Method with the real backend,
  authoritative LKR 4,875 total and Walk-in customer.
- Cash appeared as the sole executable method, selected normally, and Continue
  opened the redesigned Cash Payment screen without duplicate navigation or
  shell replacement.
- Runtime visual acceptance for this Cash path is **PASS**. Card/QR/Split provider
  execution remains outside this Cash acceptance and physical hardware remains
  blocked.

## Canonicalization Status (2026-09-04)

| Area | Status |
| --- | --- |
| Second Brain | **READY / CANONICALIZED** |
| Flutter selection UI against target UI | **IMPLEMENTED / AUTOMATED-VERIFIED** (38/38 tests pass, 0 analyzer issues) |
| Current Top & Bottom Shell Preservation | **VERIFIED** (`PosTopBar` & `PosCashierBottomNavigation` preserved) |
| Dynamic Payment Grid (4/3/2/1/0) | **VERIFIED** (equal sizing, checkmark selection, capability gating) |
| Authoritative Sale Summary & Financial Totals | **VERIFIED** (Dynamic currency, SKU, variant, tax info, customer initials) |
| Cash execution | Existing; runtime/hardware acceptance separately tracked |
| Card execution | Safe provider-neutral boundary; real provider unverified |
| QR execution | Non-executable safe message boundary verified |
| Split execution | Non-executable safe message boundary verified |
| Backend authorized-method availability | **IMPLEMENTED**; permission/configuration filtered (Cash, Card, QR, Split only) |
| Store Credit / Credit Sale / Pay Later | **STRICTLY EXCLUDED** (not rendered) |

## Shared summary consumer verification (2026-09-04)

Cash Payment now imports and renders the exact same
`LeftPaymentSummaryColumn` plus `PaymentMethodWorkspaceCard` composition used by
this screen. No Cash-specific item/totals/customer summary remains. Payment
Method responsive regression tests passed as part of the Cash Chunk 2 run.

Current scope is strictly Cash, Card, QR Payment, and Split Payment. Store Credit,
Credit Sale, and Pay Later are strictly excluded and not rendered. No new permission,
API, table, column, or migration is required for selection. See
[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_POS_Payment_Method_Selection_Implementation_Specification]].

Permission migration uses canonical `pos.sales.checkout.execute`,
`pos.payments.{cash|card|qr|split}.accept`,
`pos.notifications.alerts.view`, and `pos.customers.management.{view|create|update}`.

## Decision (2026-08-02)

Status: **CHUNK 7 DEFERRED — PHYSICAL HARDWARE UNAVAILABLE; SOURCE AND AUTOMATED HARDWARE INTEGRATION VERIFIED**.

The 2026-08-02 runtime screenshot proved that the earlier source-only status was
premature. Confirmed gaps were the wrong sidebar shell, incomplete Sale Summary,
missing product/customer/discount composition, wrong primary action/theme,
excess empty space, card overflow and missing target bottom navigation. The
status must not become fully implemented until a new runtime screenshot is
captured and compared without overflow.

The current POS Payment Method screen contains only Cash, Card, QR Pay and Split
Payment. Pay Later is excluded. Availability now resolves dynamically from
tenant-enabled configuration, canonical permission, and registered backend
execution capability. Cash has a registered executable capability; Card's
default provider is unavailable, while QR Pay and Split Payment have no complete
execution capability registered. An incomplete method must never fake success, fall
back to Cash, create a completed sale or receipt, or trigger the Cash drawer.

The existing `POST /api/v1/pos/checkout/summary` and
`POST /api/v1/pos/checkout/start-payment` controller/service/repository chains
exist. Flutter Cash checkout uses those real APIs. Cash sale/payment/stock/receipt
persistence and post-success receipt/drawer orchestration exist; physical printer
and drawer acceptance remain separate runtime verification.

## Responsive Equal-Card Rule

Every visible method card has equal width, height, padding, icon size, radius,
border thickness and typography, with equal horizontal and vertical gaps. Layout
is derived from the authorized available-card count: one is full-width or
appropriately centred; two share one row; three use two cards followed by one
clean full-width or approved centred card; four use a 2 x 2 grid; zero renders the
unavailable state. Current scope contains no fifth method.

## Contract And Data Decision

No payment-business schema change is required. A corrective permission-code
migration is required and updates rows in place so assignment UUID references
survive. Backend payment method strings remain authoritative. Flutter owns
presentation-only mappings such as icon, colour and description.

## Verified Implementation Result

> Correction: this section records source and automated verification only. It is
> not runtime visual acceptance. The current status remains partially implemented
> until an authenticated target-route screenshot is captured and compared.

- The UI renders exactly the backend-authorized and backend-executable method
  list; the current production-ready result is Cash only.
- Cash is selectable and Continue Payment opens the existing Cash route once.
- Card, QR Pay and Split Payment are visible but non-executable with safe reasons.
- The reusable count-derived grid supports zero through four cards; three uses
  two cards followed by one centered card.
- Existing checkout summary, Cash start-payment, success, receipt, print and
drawer business logic was not replaced.

## 2026-08-13 — Authoritative Pricing Gate

- Payment Method now accepts summary data only when its pricing-input
  fingerprint matches the current cart/customer/discount inputs.
- Refresh/reload is rendered as loading instead of reusing Riverpod's retained
  prior data; stale and failed states cannot enable Continue Payment.
- Summary/network failure provides Retry and never substitutes local cart totals.
- Automated pricing/payment regressions pass, but authenticated runtime payment
  acceptance remains required before the screen is called release-complete.
- Backend and database were not modified.

Flutter files changed:

- `lib/features/sale/domain/entities/pos_payment_method_type.dart`
- `lib/features/sale/presentation/screens/pos_payment_method_screen.dart`
- `lib/features/sale/presentation/widgets/payment/payment_action_bar.dart`
- `lib/features/sale/presentation/widgets/payment/payment_method_card.dart`
- `lib/features/sale/presentation/widgets/payment/payment_method_capability.dart`
- `lib/features/sale/presentation/widgets/payment/payment_method_equal_grid.dart`
- `test/features/sale/payment_method_equal_grid_test.dart`

Verification on 2026-08-02:

- Full `flutter analyze`: no issues.
- Payment Method layout/capability/interaction tests: 21 passed.
- Existing Cash, permission, drawer and receipt/print regression tests: 50 passed.
- Runtime authenticated screenshot comparison: not run.
- Physical printer verification: not run.
- Physical Cash drawer verification: not run.

## Target Rearrangement Follow-up (2026-08-02)

- Added a route-local black target shell and removed the standard left sidebar
  only on `/pos/new-sale/payment`.
- Added target-style real branding/connectivity/notification header and existing
  routed cashier bottom navigation.
- Replaced separate Billing Summary/Sale Details cards with one Sale Summary
  containing real cart product rows, images/fallbacks, variants, quantities,
  unit prices, line totals, customer and real applied discount state.
- Moved authoritative subtotal/discount/tax/total into the right payment panel.
- Replaced the purple action with a target-style orange Continue Payment button.
- Removed permanent unavailable strings from method cards; disabled taps show a
  transient message and cannot select or navigate.
- Full analyzer passed; 21 payment tests and 50 Cash/permission/receipt/drawer
  regression tests passed.
- Emulator screenshot `C:\tmp\payment-method-runtime.png` captured the login
  screen because no authenticated runtime session was available. Payment-route
  visual comparison therefore remains pending and status stays partial.

## Chunk 7 Verification Status (2026-08-04)

Status: **CHUNK 7 DEFERRED — PHYSICAL HARDWARE UNAVAILABLE; SOURCE AND AUTOMATED HARDWARE INTEGRATION VERIFIED**.

Verification summary:
- **Receipt Printing & Cash Drawer Flow Traced**: Verified code pathways for automatic printing, print retry, print recovery, print auditing, cash drawer auto-open and cash drawer recovery.
- **Post-Commit Ordering**: Verified that receipt printing and cash drawer opening occur post-commit and failures do not roll back the completed checkout transaction.
- **Unavailable Behavior**: Verified safe UI failure displays and proper error handling. No fake successful results are shown.
- **Duplicate Prevention**: Verified built-in checks preventing duplicate print/drawer pulses on route navigation or widget rebuilds.
- **Local Print Agent**: Verified raw printing endpoints, diagnostics/health endpoints, local authentication, and request validators.
- **Tests**: Checked test results (48 tests passed on local print agent; 8 tests passed on Flutter cash payment intent; 7 tests passed on cash payment observability).
- **Physical Acceptance**: Kept pending due to the lack of physical hardware.
