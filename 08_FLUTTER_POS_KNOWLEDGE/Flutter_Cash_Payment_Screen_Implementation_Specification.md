<!-- title: Flutter Cash Payment Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-04 -->

# Flutter Cash Payment Screen Implementation Specification

## Overview
This specification details the frontend implementation strategy for the Cash Payment screen. It enforces separation of concerns, strict state management, and component boundaries aligned with the OneVerz POS Flutter architecture.

## Feature-Owned Flutter Layering
- **Widgets:** Purely presentational components responsible for layout and interaction. Must not contain direct HTTP calls or complex business logic.
- **Controllers/Providers (Riverpod):** Manage screen state, calculate Quick Amounts, handle keypad entry, and orchestrate API calls.
- **Repositories:** Responsible for the actual data fetching and submission (already existing).

## Screen / Component Composition
Require component-wise separation (do not write one monolithic screen file):
- `CashPaymentScreen` (Main scaffolding, shared header/footer usage. Order Summary is flex 2, Cash Payment is flex 3). Fixed viewport — no page scroll; compact spacing/fonts.
- `OrderSummarySection` (Displays cart totals and items as a single independent card with light-orange Total Due footer).
- `CashPaymentTenderPanel` (Single card: Amount Received + Quick Amount chips + NumericKeypad + Change Due + Complete Sale).
- `QuickAmountChips` (Exact + next 1000 + next+1000; selected orange border).
- `AmountEntrySection` (Shows entered amount and Due hint).
- `NumericKeypad` (Digits 0-9, 00, disabled decimal, tall backspace, clear).
- `PaymentActionFooter` (Complete Sale only inside tender panel; no pre-sale Print Receipt).

## State Management (Typed View State)
State must be typed and explicitly managed via Riverpod:
- **Backend Summary State:** Holds the authoritative data from `POST /api/v1/pos/checkout/summary`. Flutter widgets strictly display this data and must not calculate authoritative totals.
- **Amount Entry State:** Tracks the current raw numeric input (`amountReceived`).
- **Generated Quick Amount State:** A derived list of amounts (Exact Total and next 1000 boundary) based on the summary state.
- **Print Preference State:** Tracks the boolean `printReceiptRequested` toggle.
- **Submission Lock:** A boolean indicating an in-flight API request to prevent duplicate taps.
- **Success/Error States:** Explicit representation of UI state (e.g., `PaymentLoading`, `PaymentSuccess`, `PaymentError(message, correlationRef)`).

## API Integration Ownership
- Widgets trigger controller methods (e.g., `controller.submitPayment()`).
- Controllers use existing repository methods to call:
  - `POST /api/v1/pos/checkout/summary`
  - `POST /api/v1/pos/checkout/start-payment`
- Authoritative calculation for change and totals is strictly deferred to the backend.

## Responsive Behavior & Widget Boundaries
- Must support tablet, desktop, and mobile viewports.
- No `RenderFlex` overflow permitted (use scrolling/wrapping where necessary).
- The existing POS shell (header/footer) must not be duplicated inside the feature widget.

## Testing Responsibilities
- Widgets must be tested for visual alignment and interaction (duplicate taps blocked, correct values displayed).
- Controllers must be unit tested for state transitions, Quick Amount calculation logic, and error handling.
- Refer to [[../10_TESTING_QA/Test_Case/24_Payment_Refund/POS_Cash_Payment_Screen_Test_Cases]] for exhaustive requirements.

## Current Status
**Status:** Documentation Ready / Implementation Pending.
(Flutter implementation has not been performed by this task.)

## Related Documents
- [[../04_MODULE_KNOWLEDGE/24_Payment_Refund/04_Cash_Payment_Screen_Feature]]
