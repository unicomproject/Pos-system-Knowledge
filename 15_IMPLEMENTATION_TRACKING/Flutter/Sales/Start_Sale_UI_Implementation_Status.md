<!-- title: Start Sale UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-11 -->


# Start Sale UI Implementation Status

## Product and Variant Stock Status (2026-07-18)

- New Sale product and variant stock badges are backend-authoritative.
- Product list and detail models consume `stockStatus` and `availableQuantity` from the current-outlet POS APIs.
- Missing/unrecognized stock status renders `Unavailable`; it does not default to green `In Stock`.
- Variable-product tiles show `Out of Stock` when every active/sellable variant has zero availability, and the tile cannot start an add-to-cart flow in that state.
- Zero-stock variant chips remain disabled. Add to Cart requires a fully selected in-stock variant and respects its available-quantity limit.

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
| PR / Commit | `Sale_Screen` branch (uncommitted at audit) |
| Tests | Passed (`flutter analyze`, targeted tests) |

## Feature Summary

POS shell, home dashboard, and New Sale catalog/cart UI are implemented.
`GET /api/v1/pos/products` is wired for the product grid. **Mock catalog fallback
was removed on 2026-07-10** — only real database products are shown.

The backend exact barcode endpoint
`GET /api/v1/pos/products/by-barcode/{barcode}` is implemented on `scanner_inte`.
Flutter USB HID capture, scanner lifecycle, exact scanner-to-cart processing,
typed visual feedback, and scanner-owned search cleanup are implemented. Camera
scanning and physical TURBOGEAR TB-00D validation are not implemented.

## Resolved Variant Cart Action (2026-07-22)

- `PosResolvedSaleItem` provides a source-agnostic manual/barcode/camera input.
- `PosResolvedVariantCartAction.add` adds an already resolved item without a
  variant selector and accepts requested quantities greater than one.
- Variant ID remains the cart-line identity: the same variant increments and a
  different variant creates a separate line.
- `PosNewSaleCartNotifier.addToCart` now centrally rejects invalid quantity,
  unavailable/out-of-stock products, missing price, and known stock overflow.
- New cart lines retain insertion order; the existing reversed cart rendering
  continues to show the newest line at the top.
- Flutter USB HID framing is implemented at the New Sale root using
  `PosBarcodeScannerListener`. It supports printable key-down buffering,
  Enter/numpad Enter completion, leading zeroes, minimum-length/custom
  validation, inactivity reset, enabled-state reset, and safe handler disposal.
- Exact barcode Flutter API integration, response mapping, FIFO scan queue,
  processing state/lock, exact variant direct cart add, controller disposal
  guard, and New Sale modal-route enablement are implemented.
- Scanner success/error feedback uses monotonic event IDs and safe typed outcome
  mappings. The current snackbar is replaced for consecutive scan results.
- Completed scanner input clears the search query/text immediately, invalidates
  the pending 350 ms debounce, restores the unfiltered catalog, and preserves
  focus. Manual search remains unchanged.
- Physical TB-00D validation and camera scanning remain unimplemented; full
  scanner E2E remains partial pending Chunk 6.
- Chunk 5 feedback/search cleanup is implemented and verified. Integrated tests
  cover focused TextField clearing, query clearing, debounce cancellation,
  general-search suppression, exact lookup, failed-lookup cleanup, next scan,
  feedback replay prevention, and manual-search regression.
- Chunk 7 camera Scanner button integration is implemented with
  `mobile_scanner 7.4.0`. Android/iOS configuration, one-shot frame locking,
  rear-camera dialog, torch, cancellation, safe errors, Windows fallback, and
  reuse of the existing exact queue/cart/feedback/search pipeline are covered.
  Automated tests and Android debug APK build pass; physical Android camera
  validation remains pending.

Checkout, receipt, and payment Flutter datasources exist but **Unified-Commerce
does not yet expose** `POST /api/v1/pos/checkout/*` controllers. Cash checkout
cannot complete end-to-end against the active backend until those APIs are
implemented.

## Permission Hardening (2026-07-11)

| Area | Rule |
|---|---|
| New Sale route access | `pos.new_sale.view` or `sales.create` only |
| Add Customer action | `customers.create` only |
| Proceed to Payment | Requires checkout permission plus trusted device and open till session |
| Till status chip | Visibility by `till.session.view`; label reads till session state instead of hardcoded text |

## Catalog Data Status (2026-07-10)

| Rule | Status |
|---|---|
| Mock `pos_catalog_fallback_data.dart` | Removed |
| Empty API list | Shows "No products found" |
| API failure | Shows "Unable to load products" |
| Product seed in backend | Not added intentionally |
| Real products | Tenant Admin / `POST /api/v1/products` + price list required |

## Payment And Receipt Status

| Area | Status | Notes |
|---|---|---|
| Checkout summary | UI wired | **Blocked** — no Unified-Commerce controller |
| Cash payment | UI wired | **Blocked** — no Unified-Commerce controller |
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
| Implementation map | [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]] |
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
