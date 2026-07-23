<!-- title: POS Flow Test Cases -->
<!-- status: Draft -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# POS Flow Test Cases

## Cash Checkout And Receipt

| ID | Scenario | Preconditions | Expected Result |
|---|---|---|---|
| POS-CASH-001 | Cashier opens New Sale and proceeds to payment | POS user logged in, trusted device, open till, `pos.new_sale.view`, product/cart permissions, `sales.checkout`, and `payments.cash.accept` | Checkout summary loads from backend and Cash payment option is available. |
| POS-CASH-002 | Cashier confirms valid cash payment | Cart has items; cash received is equal to or greater than grand total | Backend creates sale, payment allocation, completed sale status, receipt number, and `barcodeValue`; Flutter navigates to payment success. |
| POS-CASH-003 | Cash received is below total | Same as POS-CASH-002 but tendered amount is too low | Backend rejects payment; sale is not completed. |
| POS-CASH-004 | Checkout summary request fails | Backend summary request fails | Flutter shows unavailable/error state and cash confirmation remains blocked; no local total is treated as successful checkout authority. |
| POS-CASH-005 | Print Receipt from success flow | Completed cash sale with `saleId`; user has `receipts.print`; device printer configured | Local printer transport succeeds before Flutter calls `POST /api/v1/pos/receipts/{saleId}/print`; audit failure permits audit-only retry without duplicate physical print. |
| POS-CASH-006 | View receipt detail endpoint directly | Completed sale; user has `receipts.view` or `receipts.print` | `GET /api/v1/pos/receipts/{saleId}` returns receipt detail with `receiptNumber`, `barcodeValue`, totals, and items. |

## Needs Verification

| Area | Verification Needed |
|---|---|
| Flutter receipt detail GET | Print Receipt screen currently uses checkout success state and does not call `GET /api/v1/pos/receipts/{saleId}`. |
| Direct cart calculate permission | Backend direct `POST /api/v1/pos/cart/calculate` currently checks `sales.cart.update_item`; confirm whether it should move to `sales.cart.manage`. |
| Physical printer | Printer facade, ESC/POS generation and network transport source exist; USB/Bluetooth/network physical matrix is not verified. |
| Email receipt | Route/screen exists, but send action/backend email integration is not implemented. |

## Current Cashier Coverage Gaps

| Area | Existing automated evidence | Missing evidence |
|---|---|---|
| Cash sale | Flutter cash/checkout and backend controller/repository tests | One full product-to-persisted-order/payment/receipt E2E run |
| Card / QR / Split | Permission/placeholder route coverage | Provider, allocation, callback, failure and idempotency tests |
| Cash In / Out | Form/provider behavior | Mutation API, persistence, permission and audit tests |
| Park / Recall | Flutter local storage tests and backend Holds tests separately | Flutter-to-backend contract, outlet isolation and concurrent recall |
| Till close / logout | Close form/provider/API/repository tests | Full End Shift close-to-logout and logout-failure recovery |
| Loyalty | Customer tests only | Earn/redeem/ledger/store-credit flow |
| Email receipt | Form/UI only | Send, retry, idempotency and delivery failure |
| Return / Refund | Broad Flutter/API/unit/integration coverage | Physical receipt-print result remains separate |
| Exchange | Broad preview/settlement/completion coverage | Physical settlement/provider verification where non-cash is required |
| Barcode scanner | HID framing, queue, feedback, search cleanup and camera automated tests | TB-00D repetition/focus tests and physical Android/iOS camera lifecycle |
| Receipt printer | Adapter/facade automated tests | Physical USB/Bluetooth/network matrix and repeated-print stability |
| Offline cashier sale | No full chain verified | Local database, outbox, restart, sync and conflict tests |

Manual and physical cases remain `Not Verified` until a dated device/result
record exists. Test filenames alone are not pass evidence.

