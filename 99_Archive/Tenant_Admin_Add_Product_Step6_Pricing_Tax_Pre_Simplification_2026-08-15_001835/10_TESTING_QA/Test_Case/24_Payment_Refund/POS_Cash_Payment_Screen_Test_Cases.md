<!-- title: POS Cash Payment Screen Test Cases -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-04 -->

# POS Cash Payment Screen Test Cases

## Purpose
Detailed test cases specifically for verifying the correct behavior of the Flutter Cash Payment screen and its integration with the unified backend.

## Test Case Categories

### 1. Initialization and Loading
- **Summary Loading:** Verify that opening the screen triggers `POST /api/v1/pos/checkout/summary` and accurately loads the order summary, cart items, and Total Due.
- **Tenant Isolation:** Verify that the screen data correctly respects the current tenant context.

### 2. Quick Amount Calculation & Generation
- **Exact Quick Amount:** Verify the first Quick Amount option strictly matches the backend Total Due.
- **Next-rounded Quick Amount:** Verify the second Quick Amount option correctly calculates the next LKR 1000 boundary.
  - *Example 1:* Total Due LKR 1,700 → Generates LKR 1,700 and LKR 2,000.
  - *Example 2:* Total Due LKR 16,280 → Generates LKR 16,280 and LKR 17,000.
- **Already-rounded Total:** Verify that if Total Due is divisible by 1000, the next boundary is strictly `Total Due + 1000`.
- **No Unrelated Hardcoded Values:** Verify no static values (e.g. 10000, 25000, 50000) appear.
- **Regenerated Values:** Verify that when the checkout summary changes (e.g. cart update prior to entering payment), Quick Amounts regenerate accurately.
- **Verification:** Ensure there is no new Quick Amount API call made and no Quick Amount values are persisted to the database.

### 3. Amount Entry and Keypad
- **Quick Amount Selection:** Verify tapping a Quick Amount correctly updates the `Amount Received` field.
- **Exact Cash:** Verify tapping Exact Cash sets `Amount Received` to the exact Total Due.
- **Manual Amount Entry:** Verify tapping Other Amount focuses manual entry.
- **Clear/Backspace/00 Behavior:** Verify keypad inputs update the field appropriately.
- **Unsupported Keypad Controls:** Verify decimal, plus, and minus controls are hidden/disabled unless explicitly supported for the currency.

### 4. Math and Validation
- **Insufficient Amount:** Verify "Complete Sale" remains disabled while Amount Received < Total Due.
- **Exact Payment:** Verify submission succeeds when Amount Received == Total Due.
- **Overpayment/Change Preview:** Verify `Change Due` correctly previews as `max(Amount Received - Total Due, 0)` locally.
- **Backend-Authoritative Change:** Verify that upon successful completion, the change due strictly reflects the backend response.

### 5. Submission and Idempotency
- **Duplicate Tap:** Verify the submit button is locked/debounced while in-flight.
- **Idempotent Retry:** Verify the same idempotency key is used if the request fails due to network, avoiding duplicate sales.

### 6. Error Handling and Edge Cases
- **400/401/403/409/500 Handling:** Verify specific UI responses for various HTTP errors without exposing raw keys.
- **Permission Denied:** Verify `payments.cash.accept` and `sales.checkout` absence properly denies access.
- **Disabled Cash Payment Method:** Verify the flow aborts if Cash is not allowed by the tenant.
- **Closed Till:** Verify payment is rejected if till session is closed.
- **Invalid Device:** Verify payment is rejected if device is untrusted/inactive.
- **Cart Preservation After Failure:** Verify cart and Amount Received are retained after a failure.
- **Cart Clearing After Success:** Verify cart is wiped clean strictly after backend success.

### 7. Post-Payment Actions
- **Printer Success/Failure:** Verify print is triggered after sale completion if configured globally or after success. (Pre-sale Print Receipt button is absent). Printer failure must not roll back the sale.
- **Drawer Success/Failure Sequencing:** Verify the cash drawer only pulses after successful cash payment persistence.

### 8. Layout and Structural UI
- **Responsive Layouts:** Verify design adapts safely on tablet, desktop, and mobile.
- **Card Proportions:** Verify Order Summary uses flex 2 and Cash Payment uses flex 3.
- **Independent Cards:** Verify Quick Amount, Amount Received, and Action areas are independent cards.
- **Bottom Actions:** Verify EXACT CASH and COMPLETE SALE are present in a shared action card. Verify Print Receipt is completely absent from the UI.
- **Accessibility:** Verify contrast, touch targets, and focus states.
- **Overflow:** Verify there is no `RenderFlex` overflow at supported resolutions and scales.
