<!-- title: POS Flow Test Cases -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

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
| Cash In | Chunk 2/3 Flutter + authenticated API/DB E2E | Keep regression green; no new Cash In blockers |
| Cash Drop / Out | Automated CD-001…CD-021 + PG concurrency; live E2E blocked | Live authenticated re-run when API up; optional print CD-022 |
| Park / Recall | Flutter local storage tests and backend Holds tests separately | Flutter-to-backend contract, outlet isolation and concurrent recall |
| Till close / logout | Close form/provider/API/repository tests | Full End Shift close-to-logout and logout-failure recovery |
| Loyalty | Deferred / not Release 1 | Future earn/redeem/ledger/store-credit flow; no active Cashier UI |
| Email receipt | Form/UI only | Send, retry, idempotency and delivery failure |
| Return / Refund | Broad Flutter/API/unit/integration coverage | Physical receipt-print result remains separate |
| Exchange | Broad preview/settlement/completion coverage | Physical settlement/provider verification where non-cash is required |
| Barcode scanner | HID framing, queue, feedback, search cleanup and camera automated tests | TB-00D repetition/focus tests and physical Android/iOS camera lifecycle |
| Receipt printer | Adapter/facade automated tests | Physical USB/Bluetooth/network matrix and repeated-print stability |
| Offline cashier sale | No full chain verified | Local database, outbox, restart, sync and conflict tests |

Manual and physical cases remain `Not Verified` until a dated device/result
record exists. Test filenames alone are not pass evidence.

## Cash Drop / Cash Out cases (canonical — 2026-08-16)

Authority: [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]].
Do **not** mark PASS without dated runtime evidence. As of 2026-08-16, successful
OUT create is blocked by backend; most cases remain **Planned**.

| ID | Scenario | Expected | Status |
|---|---|---|---|
| CD-001 | Valid Cash Drop | One `cash_movements` OUT row; expected cash decreases | PASS (automated) |
| CD-002 | Zero amount | Reject; no row | PASS (unit) |
| CD-003 | Negative amount | Reject; no row | PASS (unit) |
| CD-004 | Amount > available cash | Reject; no row; refresh summary | PASS (integration) |
| CD-005 | Missing reason / type | Reject | PASS (Flutter + service) |
| CD-006 | Closed till | Block submit | PASS (integration + Flutter) |
| CD-007 | No `cash_drawer.view` | Forbidden / no summary | PASS (unit) |
| CD-008 | No `cash_drawer.movement.create` | Forbidden mutation | PASS (unit + Api) |
| CD-009 | Inactive movement type | Reject; refresh catalog | PASS (OUT inactive integration) |
| CD-010 | IN type used for Cash Drop | Reject | PASS (OUT-only catalog) |
| CD-011 | Foreign tenant movement type | Reject; no leak | PASS (OUT foreign integration) |
| CD-012 | Backend currency authority | Currency from session, not client | PASS (OUT USD integration) |
| CD-013 | Expected cash decreases correctly | Summary matches ledger | PASS (integration) |
| CD-014 | Duplicate tap | Single mutation | PASS (Flutter guard + requestId) |
| CD-015 | Same RequestId replay | Safe same result; no duplicate | PASS (integration) |
| CD-016 | Conflicting RequestId replay | Conflict | PASS (integration) |
| CD-017 | Concurrent available-cash change | Later request rejected | PASS (PostgreSQL concurrency) |
| CD-018 | Network timeout after commit | Replay same RequestId; no duplicate | PASS (boundary: replay path; no timeout inject) |
| CD-019 | Form preservation after failure | Amount/reason/note kept | PASS (code: reset only on success) |
| CD-020 | Successful summary refresh | UI shows backend values | PASS (provider refresh path) |
| CD-021 | Tenant isolation | Cross-tenant impossible | PASS (foreign type + trust tests) |
| CD-022 | Slip print failure | Finance not reversed/duplicated | NOT APPLICABLE (print not implemented) |

Live authenticated CD re-run: **PASS** (Pixel Tablet Flutter UI 2026-08-16 — see [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]).

Related OUT-reject unit evidence (not a Drop success pass): repository rejects
non-IN types without persistence.

## Product Discovery Segment Test Cases

- [[Test_Case/21_POS_Operations/POS_Popular_Product_Discovery_Test_Cases]]
- [[Test_Case/21_POS_Operations/POS_Frequently_Sold_Product_Discovery_Test_Cases]]
- [[Test_Case/21_POS_Operations/POS_Offers_Product_Discovery_Test_Cases]]

## Product Variant Selection Popup

- [[Test_Case/21_POS_Operations/POS_Product_Variant_Selection_Popup_Test_Cases]]


## Cash Payment Screen Redesign

- [[Test_Case/24_Payment_Refund/POS_Cash_Payment_Screen_Test_Cases]]
