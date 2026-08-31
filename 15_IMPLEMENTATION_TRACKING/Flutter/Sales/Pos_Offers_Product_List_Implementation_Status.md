<!-- title: POS Offers Product List Flutter Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# POS Offers Product List Flutter Implementation Status

## 2026-08-13 — Backend-Authoritative Checkout Total Remediation

Status: **IMPLEMENTED AND AUTOMATED TESTED — AUTHENTICATED RUNTIME ACCEPTANCE PENDING**

Root cause: New Sale rendered automatic offer line prices from backend summary
lines, but the footer Total still rendered `PosNewSaleCartState.total`. That local
cart total is derived from the catalog/base unit price and does not own the
backend's automatic offer calculation. A network-error factory also copied
local subtotal/discount/tax/total into a checkout-summary-shaped object. Payment
routes rejected that fallback, but showing it as a payable-looking total was an
unsafe split source of truth.

Production rule now enforced:

- Non-empty-cart subtotal, discount, tax, line prices and payable total are
  displayed only from `POST /api/v1/pos/checkout/summary`.
- The local cart owns item identity, quantity, notes, customer and discount
  inputs only; it is not final monetary authority.
- Summary responses carry a canonical pricing-input fingerprint covering sorted
  line inputs, customer and discount application.
- A response is usable only when its fingerprint equals the current cart.
- Loading/reloading shows `Calculating…`; failure shows `Total unavailable` and
  Retry. Proceed to Payment is disabled in both states.
- Riverpod retained previous values are explicitly rejected during loading or
  error, even when the cart fingerprint has not changed.
- Cart, quantity, customer, discount, clear/new-sale and recall input changes
  naturally create a different watched provider input; late results cannot be
  rendered or used for payment.
- Payment Method and Cash Payment also reject stale/non-authoritative summaries.
- `start-payment` sends cart/tender inputs and no client total. Cash success uses
  backend response `grandTotal`, `discountTotal`, `cashReceived` and `changeDue`.
- Network failure never silently restores a base-price payable total. Offline
  discounted finalization remains blocked until authoritative pricing succeeds.

Verification:

- `flutter analyze --no-pub`: no issues.
- Checkout/payment focused Flutter suite: 102/102 passed.
- Final pricing identity and payment handoff suite: 15/15 passed.
- Backend `PosCheckoutRepositoryTests`: 19/19 passed.
- Covered base LKR 3,200 / offer LKR 2,400, loading, failure, retry, stale cart,
  late response, new-sale reset, retained refresh/error value, and payment
  request with no client total.

Remaining release evidence: an authenticated real-device/browser transaction
must confirm New Sale -> Payment Method -> Cash -> Payment Success and persisted
receipt/payment values. Offline discounted finalization remains intentionally
unsupported and must not be represented as production-ready offline checkout.

## 2026-08-13 — Backend-Authoritative Cart Pricing Pass

Status: **PARTIALLY IMPLEMENTED — RELEASE BLOCKED PENDING RUNTIME ACCEPTANCE**

- New Sale cart now watches the existing checkout-summary provider and displays authoritative base/effective unit price, automatic discount, line total, subtotal, discount, and tax returned by the backend.
- Quantity mutations naturally invalidate/re-run the Riverpod summary because the provider watches cart state; the UI no longer promotes local catalog `offerPrice` to checkout authority.
- Superseded by the remediation below: the network-unavailable local monetary
  fallback has been removed entirely; checkout/payment remain blocked until a
  current backend summary succeeds.
- `flutter analyze` passes with no issues.
- Authenticated emulator/browser evidence, payment-success/receipt evidence, park/recall, and offline acceptance are still outstanding; do not mark this integration production complete yet.

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Sales / POS |
| Feature | Offers segment grid & Product card badges |
| Status | Not Started |
| Completed Date | - |
| Branch | - |
| PR / Commit | - |
| Tests | Not Run |

---

## Feature Summary

Enables the "Offers" quick-filter chip in Cashier POS. Maps computed promotional prices, compare-at prices, discount percentages, and conditional requirements onto the product card tiles.

---

## Files Changed

```text
No implementation files changed. Documentation phase only.
```

---

## Tests Written

```text
Planned test coverage documented.
Implementation tests not created.
Result: Not Run.
```

---

## Related Files

- [[../../../../04_MODULE_KNOWLEDGE/21_POS_Operations/06_Offers_Product_Discovery_Feature]]
- [[../../../../10_TESTING_QA/Test_Case/21_POS_Operations/POS_Offers_Product_Discovery_Test_Cases]]
- [[../../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]]
