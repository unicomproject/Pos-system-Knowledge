<!-- title: POS Flow Test Cases -->
<!-- status: Draft -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->

# POS Flow Test Cases

## Cash Checkout And Receipt

| ID | Scenario | Preconditions | Expected Result |
|---|---|---|---|
| POS-CASH-001 | Cashier opens New Sale and proceeds to payment | POS user logged in, trusted device, open till, `pos.new_sale.view`, product/cart permissions, `sales.checkout`, and `payments.cash.accept` | Checkout summary loads from backend and Cash payment option is available. |
| POS-CASH-002 | Cashier confirms valid cash payment | Cart has items; cash received is equal to or greater than grand total | Backend creates sale, payment allocation, completed sale status, receipt number, and `barcodeValue`; Flutter navigates to payment success. |
| POS-CASH-003 | Cash received is below total | Same as POS-CASH-002 but tendered amount is too low | Backend rejects payment; sale is not completed. |
| POS-CASH-004 | Checkout summary fallback is used | Backend summary request fails and Flutter uses local fallback | Cash confirmation must remain blocked because checkout cannot trust fallback totals. |
| POS-CASH-005 | Print Receipt from success flow | Completed cash sale with `saleId`; user has `receipts.print` | Flutter calls `POST /api/v1/pos/receipts/{saleId}/print`; backend records `receipt_print_logs`; physical printing remains not implemented. |
| POS-CASH-006 | View receipt detail endpoint directly | Completed sale; user has `receipts.view` or `receipts.print` | `GET /api/v1/pos/receipts/{saleId}` returns receipt detail with `receiptNumber`, `barcodeValue`, totals, and items. |

## Needs Verification

| Area | Verification Needed |
|---|---|
| Flutter receipt detail GET | Print Receipt screen currently uses checkout success state and does not call `GET /api/v1/pos/receipts/{saleId}`. |
| Direct cart calculate permission | Backend direct `POST /api/v1/pos/cart/calculate` currently checks `sales.cart.update_item`; confirm whether it should move to `sales.cart.manage`. |
| Physical printer | No USB/Bluetooth/network printer integration is wired in Flutter. |
| Email receipt | Route/screen exists, but send action/backend email integration is not implemented. |

