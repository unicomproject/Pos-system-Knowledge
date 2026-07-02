<!-- title: Start Sale UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->


# Start Sale UI Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Sales |
| Feature | Start Sale UI (POS home + New Sale) |
| Status | In Progress |
| Completed Date | - |
| Developer | POS team |
| Reviewer | - |
| PR / Commit | `pos-home-dashboard` branch |
| Tests | Passed (`flutter test`) |

## Feature Summary

POS shell, home dashboard, and New Sale catalog/cart UI are implemented on branch
`pos-home-dashboard`. Cash checkout is wired to backend checkout start-payment,
and Print Receipt records backend print audit when a completed `saleId` exists.
Barcode scan, customer/discount/park actions, physical printing, email sending,
and card/QR/split payments remain partial or placeholder.

## Payment And Receipt Status

| Area | Status | Notes |
|---|---|---|
| Checkout summary | Wired | Calls `POST /api/v1/pos/checkout/summary`. |
| Cash payment | Wired | Calls `POST /api/v1/pos/checkout/start-payment` with `cashReceived`. |
| Receipt preview | Partial | Uses checkout success state, including `receiptNumber` and `barcodeValue`. |
| Receipt detail GET | Not wired | `GET /api/v1/pos/receipts/{saleId}` exists in backend/API endpoints but is not called by the print screen. |
| Print audit | Wired | Calls `POST /api/v1/pos/receipts/{saleId}/print`. |
| Physical printer | Not implemented | UI records audit and shows local not-implemented message. |
| Email receipt | Not implemented | Route/screen exists; send action/backend integration not complete. |

## Checkout Error Handling Status

| Area | Status | Notes |
|---|---|---|
| Backend validation messages | Handled | Checkout datasource maps standard backend `message` into `PosCheckoutApiException`. |
| HTTP 400/401/403/404/409/500 | Handled | HTTP responses are not treated as checkout network fallback. |
| Backend unreachable / timeout | Handled | No-response Dio connection failures use checkout network fallback and block final checkout. |
| Cash short | Handled | Confirm button is disabled when cash received is below total; API call returns early if state is invalid. |
| Duplicate tap | Handled | `_isSubmitting` disables back/confirm actions during request. |
| Checkout failure | Handled | Screen stays on Cash Payment and shows snackbar/error fallback; no success navigation. |

## Cash Tender Mapping Status

| Area | Status | Notes |
|---|---|---|
| Cash input | Handled | Cash Payment screen sends entered `cashReceived` to checkout start-payment. |
| Checkout response parsing | Handled | Parser reads `cashReceived` and `changeDue`. |
| Payment Success | Handled | Success state stores backend-returned `cashReceived` and `changeDue`. |
| Receipt preview | Handled | Receipt widgets display the same backend-returned success state values. |

See [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]]
for the full implementation map.

## Related Second Brain Files

| Area | File |
|---|---|
| Implementation map | [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] |
| User journey (target) | [[../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]] |
| Module overview | [[../../04_MODULE_KNOWLEDGE/Sales/01_Module_Overview]] |
| Functional rules | [[../../04_MODULE_KNOWLEDGE/Sales/02_Functional_Rules]] |

## Files Changed

```text
lib/features/pos_shell/**
lib/features/sale/presentation/**
lib/features/sale/data/**
lib/features/sale/domain/**
lib/features/cart/**
lib/core/access/pos_access_codes.dart
lib/core/network/api_endpoints.dart
lib/shared/pos_session/**
lib/app/router/app_router.dart
test/widget_test.dart
```

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Widget | `test/widget_test.dart` — home, New Sale, cart, permissions | Pass |
| Unit | `posNewSaleProductMatchesCategory`, cart ordering | Pass |

## Test Commands Run

```text
flutter analyze
flutter test
```

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] | Expanded implementation map |
| [[../../15_IMPLEMENTATION_TRACKING/Flutter/Pos_Shell/Pos_Home_Dashboard_Implementation_Status]] | Added POS home status |
| [[../Full_Feature_Status_Index]] | Updated status row |
| This file | Status In Progress |

## Related Files

- [[../Full_Feature_Status_Index]]
