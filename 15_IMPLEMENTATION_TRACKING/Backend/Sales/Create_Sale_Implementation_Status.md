<!-- title: Create Sale Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->


# Create Sale Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | Sales |
| Feature | Create Sale (checkout API) |
| Status | In Progress |
| Completed Date | - |
| Developer | POS team |
| Reviewer | - |
| PR / Commit | `pos-home-dashboard` branch |
| Tests | Unit tests present |

## Feature Summary

Backend exposes `POST /api/v1/pos/sales` (`PosSalesController`) and cart helpers
under `POST /api/v1/pos/cart/*`. Current cash checkout completion is implemented
through `POST /api/v1/pos/checkout/start-payment`, which creates the draft sale,
records cash payment, completes the sale, and creates the receipt.

`POST /api/v1/pos/sales/checkout` exists as an alias for draft sale creation. It
does not complete payment by itself.

## Payment And Receipt Status

| Area | Status | Notes |
|---|---|---|
| Checkout summary | Implemented | `POST /api/v1/pos/checkout/summary` recalculates totals and returns permitted methods. |
| Cash checkout completion | Implemented | `POST /api/v1/pos/checkout/start-payment` returns receipt fields. |
| Payment against draft sale | Implemented | `POST /api/v1/pos/payments`. |
| Sale detail | Implemented | `GET /api/v1/pos/sales/{saleId}`. |
| Receipt detail | Implemented | `GET /api/v1/pos/receipts/{saleId}`. |
| Print audit | Implemented | `POST /api/v1/pos/receipts/{saleId}/print` writes `receipt_print_logs`. |
| Cart calculate permission | Needs Verification | Direct controller currently uses `sales.cart.update_item`, while permission catalog includes `sales.cart.manage`. |

## Checkout Error Handling Status

| Area | Status | Notes |
|---|---|---|
| Empty cart | Handled | Returns validation failure before sale creation. |
| Cash received below payable total | Handled | Start-payment validates cash against recalculated backend total before draft sale creation. |
| Invalid quantity / invalid calculated lines | Handled | Sale build fails before persistence when calculation returns validation messages or zero valid lines. |
| Insufficient stock | Handled | Maps to conflict so Flutter can prompt refresh/recalculate. |
| Unsupported payment method | Handled | Returns validation failure. |
| Missing permission | Handled | Returns access denied / 403 through POS mapper. |
| Duplicate submit | Partial | Frontend loading guard blocks double tap. Backend idempotency exists only after a sale id exists; full checkout-level idempotency is still a future hardening item. |
| Sale + payment transaction | Needs Verification | Current UnitOfWork exposes only `SaveChangesAsync`; full cross-service transaction wrapper is not implemented. |

## Cash Tender Mapping Status

| Area | Status | Notes |
|---|---|---|
| Checkout request | Handled | `POST /api/v1/pos/checkout/start-payment` accepts `cashReceived`. |
| Payment persistence | Handled | Cash payment stores tendered cash as captured payment amount. |
| Checkout response | Handled | Response returns backend-calculated `cashReceived` and `changeDue`. |
| Sale detail | Handled | `GET /api/v1/pos/sales/{saleId}` maps saved sale paid/change totals. |
| Receipt detail | Handled | `GET /api/v1/pos/receipts/{saleId}` maps saved sale paid/change totals. |

## Related Second Brain Files

| Area | File |
|---|---|
| Flutter integration status | [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] |
| Module overview | [[../../04_MODULE_KNOWLEDGE/Sales/01_Module_Overview]] |
| Technical contract | [[../../04_MODULE_KNOWLEDGE/Sales/03_Technical_Contract]] |

## Files Changed

```text
src/SCS.Api/Modules/Sales/PosSalesController.cs
src/SCS.Api/Modules/Checkout/PosCheckoutController.cs
src/SCS.Api/Modules/Payment/PosPaymentsController.cs
src/SCS.Api/Modules/Payment/PosReceiptsController.cs
src/SCS.Application/Modules/Sales/Services/PosSaleService.cs
src/SCS.Application/Modules/Checkout/Services/PosCheckoutService.cs
src/SCS.Application/Modules/Payment/Services/PosPaymentService.cs
src/SCS.Application/Modules/Payment/Services/PosReceiptService.cs
src/SCS.Api/Modules/Cart/PosCartController.cs
src/SCS.Application/Modules/Cart/Services/PosCartService.cs
tests/SCS.UnitTests/Modules/Cart/PosCartServiceTests.cs
tests/SCS.UnitTests/Modules/Checkout/PosCheckoutServiceTests.cs
```

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Unit | `PosCartServiceTests` | Present |
| API | `PosProductsControllerTests` | Present |

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] | Backend API vs Flutter wiring |
| [[../Full_Feature_Status_Index]] | Updated status row |

## Related Files

- [[../Full_Feature_Status_Index]]
