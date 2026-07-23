<!-- title: Barcode Scanner Integration -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-22 -->


# Barcode Scanner Integration

## Implementation status

| Layer | Status |
|---|---|
| Backend exact barcode lookup | Implemented on `scanner_inte` |
| Reusable resolved-variant cart action | Implemented on `scanner_inte` |
| Same-variant quantity increment | Implemented |
| `QuantityPerScan`-ready requested quantity | Implemented in cart action; barcode API mapping remains pending |
| Central cart stock-limit validation | Implemented |
| Flutter USB HID framing listener | Implemented on `scanner_inte` |
| Enter/numpad Enter completion | Implemented |
| Leading-zero preservation | Implemented |
| Listener enabled/disposal controls | Implemented |
| Exact barcode Flutter API integration | Implemented on `scanner_inte` |
| Barcode response mapping | Implemented |
| Sequential scan queue/processing lock | Implemented |
| Exact variant direct cart add | Implemented |
| Route/modal lifecycle enablement | Implemented |
| Scanner success/error visual feedback | Implemented |
| Scanner search-field/query clearing | Implemented |
| Pending partial-search debounce cancellation | Implemented |
| Scanner general-search suppression | Implemented |
| Manual product search preserved | Implemented |
| Chunk 5 feedback and search cleanup | Implemented and verified |
| Camera scanner button/UI | Implemented; physical camera validation pending |
| Full scanner E2E | Partial |

## Exact POS lookup

`GET /api/v1/pos/products/by-barcode/{barcode}?deviceId={deviceId}` requires an
authenticated tenant context plus `products.view` (or catalog view) and
`products.search`. The device must be active, trusted, tenant-owned, and assigned
to an active outlet.

The path value is trimmed only. Lookup uses exact string equality against an
active tenant-owned `product_barcodes` row, preserving leading zeroes. Partial,
prefix, fuzzy, and numeric matching are not used.

A variant-level barcode resolves only its linked active/sellable variant. A
product-level barcode resolves only when exactly one active/sellable variant
exists; multiple variants return `pos_barcode.ambiguous`. The response returns
the barcode record that matched, including `barcodeType` and
`quantityPerScan`, rather than substituting the primary barcode.

Product visibility, active/sellable product and variant state, default active
price, and sellable inventory at the device outlet are applied. Out-of-stock is
returned as a stock status, consistent with the POS catalog; checkout remains
authoritative for final price and stock validation.

Stable errors include `pos_barcode.invalid`, `pos_barcode.not_found`,
`pos_barcode.ambiguous`, `pos_product.unavailable`, `pos_variant.unavailable`,
`pos_price.unavailable`, and `pos_device.invalid`.

## Resolved variant cart action

Manual product selection and future barcode/camera sources can map into the
source-agnostic `PosResolvedSaleItem` model and call
`PosResolvedVariantCartAction.add`. Exact variants bypass the selector. The
action supports requested quantities greater than one, uses variant ID as the
cart-line identity, increments an existing variant line, keeps different
variants separate, and returns a typed `PosCartMutationResult`.

Known stock limits are enforced centrally by `PosNewSaleCartNotifier.addToCart`
for direct add, repeated add, and the cart increment control. Invalid quantity,
out-of-stock, unavailable, missing-price, and insufficient-stock additions do
not mutate the cart. Checkout remains authoritative.

## USB HID framing listener

`PosBarcodeScannerListener` is attached at the New Sale screen root and uses
Flutter `HardwareKeyboard`/`KeyEvent`. Printable key-down characters are buffered
as a string, preserving leading zeroes. Enter and numpad Enter complete a scan;
the buffer is cleared immediately and the normalized barcode is emitted once.

The default minimum length is four and the default maximum inter-key delay is
120 ms. Stale partial input is cleared by an inactivity timer. Key-up and
non-printable events are ignored. Disabling or disposing the listener clears the
buffer, cancels the timer, and disposal removes the exact registered handler.

The handler returns `false`, so normal keyboard behaviour remains available.
When the search field is focused, HID characters may temporarily enter it. On
completed scanner input, the New Sale search coordinator immediately clears the
shared query, invalidates the pending 350 ms catalog debounce, and the private
top-bar controller synchronizes to the cleared query. Focus remains unchanged.
Manual search continues through the normal debounced catalog flow.

## Exact scan pipeline coordinator

`PosBarcodeScanController` receives completed HID barcodes and drains a FIFO
`Queue<String>` one item at a time. It resolves the authenticated session and
trusted active device context, calls
`GET /api/v1/pos/products/by-barcode/{barcode}?deviceId=...`, maps the dedicated
response to `PosResolvedSaleItem`, and invokes `PosResolvedVariantCartAction`
with the validated `quantityPerScan` value.

State exposes processing status, current barcode, pending count, and a typed
outcome. Repeated identical scans are not suppressed. API failures and cart
rejections do not stop later queued scans. The controller is New Sale-scoped via
an auto-dispose provider; disposal clears pending input and delayed lookup
results cannot mutate the cart.

The listener is enabled only while the New Sale modal route is current. Blocking
dialogs disable capture and closing the dialog re-enables it. Each processed
scan emits one monotonic-ID typed feedback event with safe success/error text.
New Sale consumes each event once and replaces the current scanner snackbar, so
the FIFO queue is never blocked and visual notifications cannot accumulate.

Physical TURBOGEAR TB-00D verification and physical Android camera validation
remain pending. Full scanner E2E status is partial until hardware validation
completes.

## Camera scanner

The New Sale Scanner button opens a `mobile_scanner` camera dialog on Android
and iOS. The dialog owns a rear-camera controller, accepts EAN-13, EAN-8,
UPC-A, Code 128, and Code 39, preserves the raw string, and locks after the
first valid frame. It stops and closes before returning the barcode to the same
search-cleanup and `PosBarcodeScanController` pipeline used by USB HID scans.

Android camera permission and optional camera hardware are declared; iOS has a
camera usage description. Permission, unavailable-camera, initialization, and
unsupported-platform results use safe local feedback. Windows/Linux do not
start the plugin and direct the cashier to the connected HID scanner. Close or
back cancellation does not clear search or enqueue a scan. Physical Android
camera validation remains pending.

Integrated New Sale widget verification confirms focused search-controller and
query clearing, pending 350 ms debounce cancellation, no general catalog request
for the completed barcode, exact device-scoped lookup, failure cleanup, next-scan
readiness, feedback replay prevention across rebuild, and manual-search
regression coverage.
