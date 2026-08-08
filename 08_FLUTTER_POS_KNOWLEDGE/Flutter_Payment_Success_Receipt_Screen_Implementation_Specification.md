<!-- title: Flutter Payment Success Receipt Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-05 -->

# Flutter Payment Success Receipt Screen Implementation Specification

## 1. Route-Level Screen Responsibility
The Payment Success screen acts as the final read-only presentation of a successfully completed transaction. It displays the completed sale snapshot, renders a preview of the receipt, and orchestrates the transition to the next sale.

## 2. Completed-Sale State Ownership
The state is owned by the backend response generated during the checkout process and exposed via a robust Riverpod provider. The screen is strictly forbidden from reconstructing receipt data from the current cart or catalog.

## 3. Receipt-Detail Recovery
If the in-memory completed state is unavailable but a `receiptId` exists, the screen must:
- Load receipt detail using the existing receipt-detail API (`GET /api/v1/pos/receipts/{receiptId}`).
- Render the immutable snapshot while preserving tenant isolation.
- Not submit payment again.

## 4. Component Boundaries
The screen is composed of modular components:
- Shared Header/Footer components (existing).
- Left-side Sale Completed summary widget.
- Right-side Receipt Preview widget (consuming the `receipt_data_json` contract).

## 5. Target Layout
The layout matches the approved target image structurally:
- Split into a left success summary area and a right receipt preview area.
- Shared POS shell ensures consistency.

## 6. Conditional Tender Display
- **Cash**: Shows Total Paid, Cash Received, and Change Due.
- **Card**: Shows safe details (provider, masked last 4 digits). Sensitive PAN/CVV data must never be visible or stored.
- **QR**: Shows QR provider and external references.
- **Split**: Shows a detailed breakdown of all tenders applied.

## 7. Actions
- **Print Receipt**: Uses the exact immutable snapshot. Success/failure isolation ensures print issues do not alter the completed sale state.
- **Start New Sale**: Resets local checkout/cart state, clears amount received, resets quick amounts, invalidates checkout summaries, and safely pushes to a fresh New Sale route.
- **No Email/SMS**: Email and SMS Receipt delivery actions are strictly excluded. No placeholder buttons are permitted.

## 8. Rendering & States
- **Resolved Receipt Snapshot Rendering**: The right panel accurately draws the `receipt_data_json` response, adjusting visibility rules (e.g., logo, barcodes, taxes) strictly per the JSON data.
- **Loading/Error/Print States**: Handled cleanly. If the screen lacks valid completed-sale identifiers on load, it shows a safe invalid-state message and provides navigation back to Orders/New Sale.
- No direct HTTP calls from UI widgets; all API communication flows through repositories and Riverpod controllers.

## 9. Responsive Behavior
- **Wide Tablet/Desktop**: Side-by-side layout (Summary | Receipt).
- **Medium Width**: Side-by-side with safely reduced gaps.
- **Narrow Width**: Stacked (Summary above Receipt) with vertical scrolling, ensuring action buttons remain accessible.

## 10. Testing Responsibilities
Unit and widget tests must assert:
- State isolation.
- Expected conditional display for different tenders.
- Proper handling of missing/null fields in the snapshot.
- Accurate reset logic upon "Start New Sale".
- Expected route navigation rules on success or invalid state.

## 11. Implementation Pending
Flutter implementation is pending and will be completed in a separate task.

## 12. Chunk 3 Runtime Status (2026-08-06)

Implementation is present and the authenticated success route rendered with two equal cards and receipt-only scrolling. Runtime exposed major-unit currency formatting and PascalCase tender-snapshot compatibility defects; both are corrected and focused tests pass. A second real sale was intentionally not created, so corrected runtime display and physical Print Receipt remain pending approval.
