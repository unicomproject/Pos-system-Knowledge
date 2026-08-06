<!-- title: Payment Success and Receipt Preview Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-05 -->

# Payment Success and Receipt Preview Feature

## 1. Purpose and Scope
The Payment Success screen serves as the final confirmation of a completed transaction. It provides a read-only receipt preview and orchestrates the transition to the next sale or hardware interactions (receipt printing).

### In Scope
- Sale Completed confirmation.
- Read-only receipt preview using an immutable snapshot.
- Display of backend-authoritative values (Receipt Number, Payment Method, Total Paid).
- Hardware actions: Print Receipt (first print).
- Workflow actions: Start New Sale.

### Out of Scope
- Email Receipt delivery (excluded for now).
- SMS Receipt delivery (excluded for now).
- Modification of completed transaction data.
- Tenant template management (admin feature).

## 2. Actors
- **Cashier**: Views the success screen, initiates printing, and starts a new sale.
- **Tenant Admin**: Manages receipt templates in the backend (out of scope for this screen).

## 3. Preconditions
The Payment Success screen may only open if:
1. Backend payment completion succeeded.
2. `saleId`, `paymentId`, and `receiptId` exist.
3. The completed sale state is stored and retrieved.

## 4. Target Screen Structure
The screen is composed of a shared POS shell and two primary content areas:
- **Shared Shell**: Existing POS header and bottom navigation.
- **Left Success Area**: 
  - Success icon/visual confirmation
  - "Sale Completed" message
  - Receipt Number
  - Payment Method
  - Date and Time
  - Cashier
  - Total Paid
  - Payment-method-specific fields (e.g., Cash Received and Change Due for Cash)
  - `PRINT RECEIPT` action
  - `START NEW SALE` action
- **Right Receipt Preview Area**:
  - Tenant/merchant branding
  - Outlet information, receipt number, date/time, cashier, till
  - Item rows (quantity, line total, subtotal, discount, tax, total paid)
  - Tender information
  - Receipt footer/barcode (if configured)

## 5. Payment-Method-Specific Display
- **Cash**: Display Total Paid, Cash Received, and Change Due.
- **Card**: Display verified safe data (provider/brand, masked identifier/last 4, authorization reference). Never display sensitive data (full PAN, CVV, PIN, track data).
- **QR**: Display QR method/provider and safe external reference.
- **Split**: Display each tender method and amount. Show cash change only if Cash tender generated change.

## 6. Actions
### Print Receipt
- Requires `receipts.print` permission.
- Uses the original immutable receipt snapshot.
- Sends print job to existing Local Print Agent.
- Records result through existing print-audit API.
- Print failure must not roll back the sale or affect the payment status.

### Start New Sale
- Requires POS New Sale access.
- Clears completed cart, consumed discount, amount received, quick amount, and payment intent state.
- Retains receipt access if needed for printing before transitioning.
- Invalidates checkout summary and navigates to clean New Sale.
- Must not delete the completed sale, payment, or receipt.

### Excluded Actions
- **Email Receipt**: Excluded.
- **SMS Receipt**: Excluded.
- No empty or disabled placeholder action buttons for these features.

## 7. API and Data Usage
- **API Reuse**: Reuses existing payment-completion and receipt endpoints. The existing endpoint is reused, but the response DTO extension is required for the typed resolved receipt document.
- **Receipt Snapshot**: Uses the immutable `receipt_data_json` snapshot. Never reconstruct receipt details from the current product catalog.
- **Authoritative Data**: All displayed transaction metrics must come from backend-authoritative sources (e.g., backend `changeDue`, `cashReceived`, `receiptNumber`).

## 8. Error States
- **Missing Completed State**: Show safe invalid-state message; do not invent fake success data; provide navigation back to Orders/New Sale.
- **Receipt Load Failure**: Keep payment identity, show load error separately, allow safe retry.
- **Print Failure**: Keep Sale Completed state, show print failure separately, allow retry.
- **Offline State**: Do not invent offline payment success.

## 9. Non-Functional Requirements
- Tenant isolation.
- Immutable historical receipt accuracy.
- Responsive layout (tablet/desktop split, narrow screens stack with scrolling).
- Accessible labels, high contrast, adequate touch targets.
- Observability with safe identifiers.
- No direct API calls from small Flutter presentation widgets.

## 10. Definition of Done
- Screen built matching the target UI.
- All actions behave as specified.
- Print Receipt uses correct API/Agent.
- Start New Sale clears exact specified states.
- Email/SMS buttons omitted.
- Unit and widget tests pass.
- E2E runtime validation passes for Cash/Card/QR/Split.

## 11. Current Implementation Status
- **Backend**: DTOs extended (`PosCheckoutStartPaymentResponseDto`, `PosReceiptDetailDto`). Foundation for dynamic snapshot generation is Partially Implemented (checkout returns a static JSON string instead of a resolved template).
- **Flutter**: Not Implemented. Screen, tests, and API integration are pending.
- **Validation**: Runtime E2E validation not run.

## 12. Related Documents
- [[04_Multi_Tenant_Receipt_Template_Resolution]]
- [[../../05_BACKEND_ARCHITECTURE/Receipt_Template_Resolution_And_Snapshot_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Payment_Success_Receipt_Screen_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/24_Payment_Refund/POS_Payment_Success_Receipt_Screen_Test_Cases]]

## 13. Runtime Reconciliation (2026-08-06)

- Authenticated Cash checkout persisted exactly one sale, payment, receipt, payment transaction/event, stock deduction, and drawer operation.
- Payment Success navigation and immutable receipt preview succeeded without overflow.
- Runtime defects: summary displayed `LKR 28.00` for an authoritative `LKR 2,800.00`, tender label was blank, and checkout initiated an unwanted automatic print before the explicit action.
- Flutter corrections: use major-unit LKR formatting, accept backend `MethodName`/`Amount` tender keys, and print only from explicit Print Receipt action.
- Print and drawer physical acceptance remain blocked by `PRINTER_NOT_CONFIGURED` and `INVALIDCONFIGURATION`; no retry was performed.
