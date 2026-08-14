<!-- title: Payment Method Screen Redesign Implementation Status -->
<!-- status: CHUNK 7 DEFERRED — PHYSICAL HARDWARE UNAVAILABLE; SOURCE AND AUTOMATED HARDWARE INTEGRATION VERIFIED -->

# Payment Method Screen Redesign Implementation Status

## Decision (2026-08-02)

Status: **CHUNK 7 DEFERRED — PHYSICAL HARDWARE UNAVAILABLE; SOURCE AND AUTOMATED HARDWARE INTEGRATION VERIFIED**.

The 2026-08-02 runtime screenshot proved that the earlier source-only status was
premature. Confirmed gaps were the wrong sidebar shell, incomplete Sale Summary,
missing product/customer/discount composition, wrong primary action/theme,
excess empty space, card overflow and missing target bottom navigation. The
status must not become fully implemented until a new runtime screenshot is
captured and compared without overflow.

The current POS Payment Method screen contains only Cash, Card, QR Pay and Split
Payment. Pay Later is excluded. Cash remains the only executable method in this
implementation; Card requires a proven real provider, while QR Pay and Split
Payment remain unavailable. An incomplete method must never fake success, fall
back to Cash, create a completed sale or receipt, or trigger the Cash drawer.

The existing `POST /api/v1/pos/checkout/summary` and
`POST /api/v1/pos/checkout/start-payment` controller/service/repository chains
exist. Flutter Cash checkout uses those real APIs. Cash sale/payment/stock/receipt
persistence and post-success receipt/drawer orchestration exist; physical printer
and drawer acceptance remain separate runtime verification.

## Responsive Equal-Card Rule

Every visible method card has equal width, height, padding, icon size, radius,
border thickness and typography, with equal horizontal and vertical gaps. Layout
is derived from visible-card count: one is full width; two share one row; three
share one row; four use a 2 x 2 grid; five use three cards followed by two
same-size centred cards. The final two never stretch. Release scope uses four
methods, so it renders a 2 x 2 grid and Split Payment is not full width.

## Contract And Data Decision

No backend schema change or database migration is required. Backend payment
method strings remain authoritative. Flutter owns presentation-only mappings
such as icon, colour and description.

## Verified Implementation Result

> Correction: this section records source and automated verification only. It is
> not runtime visual acceptance. The current status remains partially implemented
> until an authenticated target-route screenshot is captured and compared.

- Four visible methods: Cash, Card, QR Pay and Split Payment; no Pay Later.
- Cash is selectable and Continue Payment opens the existing Cash route once.
- Card, QR Pay and Split Payment are visible but non-executable with safe reasons.
- The reusable count-derived grid supports 1 through 5 equal cards.
- Existing checkout summary, Cash start-payment, success, receipt, print and
  drawer business logic was not replaced.
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
