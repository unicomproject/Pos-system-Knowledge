<!-- title: POS Checkout Find Or Add Customer Implementation Status -->
<!-- status: Active -->
<!-- last_updated: 2026-09-03 -->

# POS Checkout Find Or Add Customer Implementation Status

## Current Status

| Layer | Status | Evidence / next gate |
|---|---|---|
| Second Brain | **READY / CANONICALIZED** | Seven-state mobile-only full-screen journey, FR-01–26, BR-01–08, permissions, APIs, DB, ownership, NFRs and 30 acceptance cases are normative. |
| Flutter | **IMPLEMENTED & VERIFIED** | Complete end-to-end POS checkout journey (Cart -> Customer -> Payment Method -> Payment Execution) fully implemented and verified. All unit, integration, and journey tests pass 22/22. Analyzer 0 issues. |
| Backend | **READY / VERIFIED** | Normalized-phone search contract, quick-create, revalidation with CustomerId, and start-payment with nullable CustomerId verified against contracts. |
| Database | **NONE CURRENTLY REQUIRED** | Existing customers and nullable sales-order customer association suffice. |
| Automated Journey | **VERIFIED (22/22 FOCUSED; FULL SUITE GREEN)** | Focused customer/journey/payment tests pass 22/22. Full Flutter suite passes 1508 with one intentional skip. Authenticated runtime E2E remains pending. |

## Canonical Authority

[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Checkout_Customer_Selection_Implementation_Specification]]

## Confirmed Boundaries

- Entry is the Payment Method Customer card; destination is full-screen, not
  Customer Management or a dialog.
- Search is mobile-only; a found customer requires explicit confirmation.
- Quick-create collects phone and name only.
- `customers.view` selects; `customers.create` creates; checkout requires
  `pos.sales.checkout.execute` plus the chosen canonical payment-method permission.
- No `customers.update`, `sales.cart.manage`, or Attach-to-Sale path is required
  solely for checkout selection.
- No new endpoint, table, column, or migration is approved by this task.

## Backend Exact-Phone Verification

Verified on 2026-09-03: phone-shaped `GET /api/v1/customers?search=...` input
with at least seven digits is normalized and matched by exact tenant-scoped
`normalized_phone` equality. Generic name/email/code discovery retains partial
matching. Repository integration coverage passes.

## Chunk 2 Verified Evidence — 2026-09-03

- Customer-owned provider implements phoneEntry, searching, customerFound,
  customerNotFound, addCustomer, createReady and creating, plus recoverable
  search/create/revalidation/permission states.
- Customer-owned full-screen widgets provide numeric and alphabet keyboards,
  semantic labels, explicit confirmation, read-only carried phone, Change
  Number, and shared theme-token usage.
- Checkout never invokes Customer Management Attach-to-Sale. Cart customer is
  set only on explicit confirmation/create success and is rolled back when
  authoritative summary revalidation fails.
- Existing `totalOrderCount` is authoritative and shown only when greater than
  zero. Start-payment CustomerId/walk-in behaviour remains covered by existing
  handoff tests.
- Focused tests: **12/12 passed**. Full analysis/test status is recorded in the
  final Chunk 2 report.

## Target UI Redesign Evidence — 2026-09-03

- **Target Visual Authority Achieved**: Replaced centered isolated keypad layout
  with the canonical two-column tablet/desktop interface.
- **Top Header**: Implemented `CheckoutCustomerHeader` with orange customer icon
  badge (`TenantAdminColors.primary`), **FIND OR ADD CUSTOMER** bold title,
  subtitle, separate **Back to Cart**, and top-right **SKIP** actions.
- **Left Search Panel**: Implemented `CustomerMobileInput` with phone icon,
  `Search by Mobile Number` title, country code selector (`+94` default), mobile
  field, auto-search hint, dynamic state cards (searching, found, not found, error),
  and bottom information box (`Only mobile number is required to find a customer.`).
- **Right Keypad Panel**: Implemented 4-column structured `CustomerNumericKeypad`
  with header (`Enter Mobile Number`), Row 1 (`1`, `2/ABC`, `3/DEF`, `Backspace`),
  Row 2 (`4/GHI`, `5/JKL`, `6/MNO`, tall red `CLEAR`), Row 3 (`7/PQRS`, `8/TUV`,
  `9/WXYZ`), and Row 4 (`+94`, `0/+`).
- **Add Customer Flow**: Retained two-column shell using `AddCustomerForm` and
  `CustomerNameKeyboard`.
- **Zero Direct Color Literals**: Consumed `TenantAdminColors`, `TenantAdminSpacing`,
  and `TenantAdminRadius` exclusively.
- **Verification**: `flutter analyze` passed with 0 issues; all 14 unit and handoff
  tests passed clean (10/10 checkout customer tests + 4/4 payment handoff tests).

## Complete POS Checkout Journey Evidence — 2026-09-03

- **Canonical Journey Implemented**:
  - `Current Sale (Cart)` -> `Proceed to Payment` -> `Find or Add Customer (/pos/new-sale/customer)` -> `Payment Method (/pos/new-sale/payment)` -> `Payment Execution`.
- **Top Header Actions**:
  - `CheckoutCustomerHeader` includes **Back to Cart** (`ValueKey('checkout-customer-back')`) to return to Cart without customer mutation.
  - Initial phone entry mode renders **SKIP** button (`ValueKey('checkout-customer-skip')`) to advance directly to Payment Method with `CustomerId = null` (Walk-in).
  - Create mode renders **Back** (`ValueKey('checkout-customer-back')`) to cancel back to phone entry.
- **Payment Method Integration**:
  - `PaymentTopBarContent` includes a back button (`ValueKey('payment-top-bar-back')`) to pop back to Customer selection.
  - `CustomerCard` displays `Walk-in Customer` & `Guest` when `CustomerId = null`, or verified customer name and status when attached.
- **Provider Methods**:
  - `CheckoutCustomerNotifier.skip()` rebinds discounts and revalidates checkout summary with `CustomerId = null`.
  - `CheckoutCustomerNotifier.confirmFound()` commits found customer and revalidates.
  - `CheckoutCustomerNotifier.createAndContinue()` creates new customer via real backend API and revalidates.
- **Test Suite Results**:
  - `test/features/customers/pos_checkout_find_or_add_customer_test.dart`: 11/11 passed.
  - `test/features/sale/pos_checkout_customer_payment_handoff_test.dart`: 4/4 passed.
  - `test/features/sale/pos_checkout_journey_test.dart`: 7/7 passed (Flows A, B, C, D, E verified).
  - Overall suite: **22/22 tests passed**. `flutter analyze`: **0 issues found**.

## Completion Gate

Implementation and automated regression gates are complete. Authenticated
runtime E2E remains pending and is not represented as executed.
