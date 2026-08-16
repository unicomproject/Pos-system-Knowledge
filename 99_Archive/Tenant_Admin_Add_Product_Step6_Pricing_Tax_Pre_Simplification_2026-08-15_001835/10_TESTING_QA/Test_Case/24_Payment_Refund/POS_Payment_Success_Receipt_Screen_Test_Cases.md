<!-- title: POS Payment Success and Receipt Screen Test Cases -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-05 -->

# POS Payment Success and Receipt Screen Test Cases

## 1. Entry and Navigation
- **Test**: Entry only occurs after confirmed backend success.
- **Test**: Invalid direct navigation without valid state safely redirects/shows error without creating fake transactions.
- **Test**: Route correction logic routes appropriately on invalid states.

## 2. Receipt and Identity
- **Test**: Receipt Number accurately maps to `receiptNumber` from backend snapshot and is distinct from Sale Number.
- **Test**: Immutable historical reprint renders correctly matching the original template version/date.
- **Test**: Backend-authoritative values (Total, Dates) are precisely displayed.
- **Test**: Receipt reload by `receiptId` correctly recovers detail without generating new payment identity.

## 3. Tender/Payment Display
- **Test**: Cash display correctly shows Payment Method: Cash, Total Paid, Cash Received, and Change Due.
- **Test**: Card display correctly hides sensitive data (no full PAN, CVV, PIN, or track data) and shows safe provider/brand and masked identifier.
- **Test**: QR display shows QR method and external reference.
- **Test**: Split tender display shows all tender methods properly and only displays cash change if a Cash tender generated change.

## 4. State Isolation and Snapshot Usage
- **Test**: Receipt snapshot rendering exclusively uses `receipt_data_json`.
- **Test**: Current cart reconstruction is strictly prohibited (verify no dependency on current catalogue values).
- **Test**: Tenant branding snapshot accurately reflects snapshot values, and missing optional branding safely ignores without failure.
- **Test**: Missing required receipt facts (e.g. Total, Sale ID) fails receipt generation gracefully.
- **Test**: Contract-version compatibility correctly parses or rejects unsupported `contractVersion`.

## 5. Actions
- **Test**: Print Receipt action requires valid `receipts.print` permission.
- **Test**: Print success, failure, and unknown outcomes update UI correctly without initiating payment rollback.
- **Test**: Start New Sale properly resets cart, amount received, customer state, consumed discount, and Quick Amount selection.
- **Test**: No duplicate submission of completed sale state on UI actions.
- **Test**: Email Receipt action is completely absent.
- **Test**: SMS Receipt action is completely absent.
- **Test**: No empty action slots remain in the UI.

## 6. Template Resolution (Backend)
- **Test**: Tenant isolation guarantees cross-tenant template resolution fails.
- **Test**: Template resolution priority adheres to (Device > Till > Outlet > Tenant Base > Fallback).
- **Test**: Inactive or expired assignments are ignored during resolution.
- **Test**: Fallback template successfully assigns if no valid active tenant configuration exists.

## 7. API and Database Contract
- **Test**: API contract extension explicitly validates where required (DTO serialization of `receipt_data_json`).
- **Test**: No new database table or column is expected or verified.

## 8. Non-Functional
- **Test**: Responsive layout scales correctly across Wide Tablet, Medium, and Narrow stack configurations.
- **Test**: No RenderFlex overflows on extreme constraints.
- **Test**: Accessibility checks on contrast, touch target sizes, and focus nodes.
- **Test**: Printer unavailable handles gracefully in UI logging.

## 9. Backend Implementation Test Status (2026-08-05)
- **Backend build validation**: Passed
- **Backend unit tests**: Passed (for idempotency code).
- **Checkout snapshot exposure tests**: Needs Verification (no explicit assertions added).
- **Idempotent replay snapshot tests**: Needs Verification (no explicit assertions added).
- **Receipt detail snapshot tests**: Needs Verification.
- **Template resolution priority tests**: Not Run (no tests implemented).
- **Tenant isolation tests**: Not Run (no tests implemented).
- **Fallback tests**: Not Run (no tests implemented).
- **Runtime API tests**: Not Run.
- **Database persistence tests**: Not Run.

## 10. Chunk 3 Authenticated Runtime Result (2026-08-06)

- Checkout/navigation/reset: Passed for one Cash sale (`SO-000091`, `RCP-000091`).
- Persistence/no duplicate financial transaction: Passed.
- Layout/overflow: Passed at 2560x1600 emulator resolution.
- Authoritative summary values: Failed before correction (blank payment method; total divided by 100). Targeted corrections added; focused tests 27/27 passed.
- Explicit print: Failed because no backend printer assignment was resolved (`PRINTER_NOT_CONFIGURED`). An earlier automatic attempt also existed; automatic printing was removed.
- Drawer: Failed `INVALIDCONFIGURATION`.
- Overall: **BLOCKED — CHUNK 3 REMAINS IN PROGRESS**; no second sale was submitted.
