<!-- title: Cash Payment Screen Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-04 -->

# Cash Payment Screen Feature

## Purpose
Defines the structure and behavior of the POS Cash Payment screen, acting as the authoritative rule set for Flutter UI development.

## Scope
Covers the user interface, interaction, Quick Amount calculation, manual amount entry, and backend integration for completing a cash payment. Excludes Card, QR, Split, Pay Later, offline cash sync, and full accounting posting.

## Actors & Preconditions
**Actors:** Cashier
**Preconditions:**
- Cart/sale exists with a positive payable total.
- Open till session exists.
- Cash payment method is enabled.
- User has `sales.checkout` and `payments.cash.accept` permissions.

## Screen Structure
Based on the target composition, the screen comprises:
- **Shared POS Header:** Existing shell.
- **Main Content Width Ratio:**
  - **Order Summary Section:** Exactly 2/5 of available width.
  - **Cash Payment Section:** Exactly 3/5 of available width.
- **Order Summary Card (2/5):** Independent card containing cart item rows, subtotal, discount, tax, and large orange Total Due footer.
- **Cash Payment 3/5 Parent Area:**
  - **Quick Amount Card:** Independent card with dynamically generated values, OTHER AMOUNT button, Total Due card (orange emphasis), and Change Due card (green emphasis).
  - **Amount Received Card:** Independent card displaying the currently selected or entered cash amount, and the numeric keypad (Digits 0-9, 00, backspace, and clear).
  - **Bottom Action Card:** Independent card containing EXACT CASH (flex 1) and COMPLETE SALE (flex 2).
- **Print Receipt Preference:** No pre-sale Print Receipt button on the Cash Payment screen. Existing post-sale receipt flow remains unchanged.
- **Shared POS Footer/Navigation:** Existing shell.

*Note: Product names, images, quantities, prices, item count, tax value, outlet name, till name, notification count, and total amount must not be hardcoded. They are derived from the runtime state.*

## Functional & Business Rules

### Checkout Summary
- Opens only from a valid cart flow.
- The summary is loaded from `POST /api/v1/pos/checkout/summary`.
- The backend is authoritative for subtotal, discount, tax, total, and permitted payment methods.
- Flutter must not treat locally calculated totals as final.
- Empty, invalid, or zero-payable carts must not complete a payment.

### Quick Amount Calculation
Quick Amounts are dynamically generated based on the backend Total Due, and are strictly a Flutter presentation convenience. They are never sent to or persisted by the backend directly.
- **Rules:**
  1. Option 1: Exact Total Due.
  2. Option 2: The next higher LKR 1,000 boundary.
  3. Remove duplicate values.
  4. Hide unused Quick Amount grid slots (do not fill with hardcoded values like 10,000, 25,000).
- **Calculation Logic:**
  ```
  exactAmount = totalDue
  if totalDue is already divisible by 1000:
      nextRoundedAmount = totalDue + 1000
  else:
      nextRoundedAmount = ceiling(totalDue / 1000) * 1000
  ```
- **Approved Examples:**
  - Total Due LKR 1,700 → Quick Amounts: LKR 1,700 and LKR 2,000
  - Total Due LKR 16,280 → Quick Amounts: LKR 16,280 and LKR 17,000
  - Total Due LKR 2,000 → Quick Amounts: LKR 2,000 and LKR 3,000
- Regenerate when checkout summary changes.

### Amount Entry Logic
- Quick Amount selection sets the Amount Received field.
- **Exact Cash** action sets Amount Received equal to Total Due.
- **Other Amount** focuses/enables manual entry using the numeric keypad.
- Amount Received must be positive.
- Use existing API money precision. If decimal is unsupported for LKR, hide/disable the decimal control. Plus/minus controls from the visual reference are hidden/disabled.

### Calculations
- **Amount Received:** Determines the submitted `cashReceived` value.
- **Preview Change Due:** `previewChangeDue = max(amountReceived - totalDue, 0)`. Negative change is never displayed.
- **Complete Sale Validation:** Disabled while Amount Received is below Total Due. Overpayment produces Change Due.

### Complete Sale Submission
- Validate local input and prevent duplicate taps.
- Use one stable payment idempotency key per intent.
- Call `POST /api/v1/pos/checkout/start-payment` exactly once logically.
- Clear cart and navigate to success flow only after backend confirms success.
- On backend success, the backend's `cashReceived` and `changeDue` are authoritative.
- **On Failure:** Remain on the screen, preserve cart/entered amount/customer/discount, display a safe error, and never show fake success or create a duplicate sale.

### Receipt & Cash Drawer
- **Print Receipt:** Handled as a Flutter-side preference (`printReceiptRequested`). Printing occurs only after successful sale completion using the existing flow/permissions. Printer failure must not roll back the sale.
- **Cash Drawer:** Auto-opens only after successful cash payment. It never opens for failures, non-cash payments, or reprints. Reuses existing drawer operation contract.

## APIs Reused
- `GET /api/v1/tills/current-session`
- `POST /api/v1/pos/checkout/summary`
- `POST /api/v1/pos/checkout/start-payment`
- `GET /api/v1/pos/receipts/{saleId}`
- `POST /api/v1/pos/receipts/{saleId}/print`

*Explicit confirmation:*
- New API required: No
- New endpoint required: No
- New request field required: No
- New response field required: No
- Backend change required for Quick Amount: No

## Tables & Attributes Reused
- **Tables:** `sales_orders`, `sales_order_lines`, `payment_methods`, `sales_payments`, `sales_payment_transactions`, `sales_payment_events`, `receipts`, `receipt_print_logs`, `stock_movements`, `till_sessions`, `cash_drawer_operations`.
- **Attributes:** `requested_amount`, `tendered_amount`, `paid_amount`, `change_amount`, `idempotency_key`, `payment_status`, `currency_code`, `initiated_at`, `paid_at`.

*Explicit confirmation:*
- New database table required: No
- New database column required: No
- New migration required: No
- Quick Amount persistence required: No
- selectedQuickAmount persistence required: No
- printReceiptRequested persistence required: No

## Permissions
- `pos.new_sale.view`
- `sales.checkout`
- `payments.cash.accept`
- `sales.view`
- `receipts.view`
- `receipts.print`

*Context Rules:* Requires authenticated tenant user, active tenant/entitlement, trusted POS device, valid outlet access, assigned active till, open till session, enabled Cash payment method, and tenant isolation. No new roles or permissions created.

## Non-Functional Requirements
- Tenant isolation and transaction integrity.
- Secure error handling (no secrets in logs).
- Idempotent submission and duplicate-tap protection.
- Backend-authoritative totals.
- Responsive tablet/desktop/mobile behavior with no RenderFlex overflow.
- Accessible labels, keyboard navigation, minimum touch targets, clear focus/contrast.
- Fast local keypad response.
- Preservation of payment state on recoverable failure.
- Printer failure isolation; drawer operation after success only.
- No direct HTTP call from widgets (must use Riverpod layer).

## Errors & Edge Cases
- Insufficient amount blocks submission.
- Network error/5xx preserves state and displays retryable error.
- Cart changes invalidate summary and reset quick amounts.

## Definition of Done
- Flutter UI implemented per this specification without hardcoded references.
- All dynamic interactions (Quick Amounts, keypad, exact cash) function accurately.
- Backend success correctly transitions to success layout/drawer kick.

## Current Status
- Documentation Ready (Implementation pending).

## Related Files
- [[../../03_USER_JOURNEYS/Cashier/07_Payment_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Payment_Screen_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/24_Payment_Refund/POS_Cash_Payment_Screen_Test_Cases]]
