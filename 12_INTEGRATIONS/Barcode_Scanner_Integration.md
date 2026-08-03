<!-- title: Barcode Scanner Integration -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Barcode Scanner Integration

## Purpose

Define production barcode input, exact lookup, cart mutation, recovery and
physical-acceptance rules for cashier New Sale.

## Scope

USB HID `TURBOGEAR TB-00D`, Android/iOS camera scanning, exact backend lookup,
quantity-per-scan, FIFO processing, focus/lifecycle, feedback and failures.

## Production Architecture

HID/camera source → scan controller FIFO → exact barcode datasource →
authoritative backend variant result → shared resolved-variant cart action →
typed one-time feedback. Manual search stays separate.

## Component Responsibilities

| Component | Responsibility |
|---|---|
| HID listener | Preserve text, frame on Enter/numpad Enter, reset partial input |
| Camera dialog | Permission/lifecycle and one intentional scan session |
| Scan controller | FIFO, one lookup/mutation per completed frame |
| Backend lookup | Exact unique barcode, product/variant, quantity and authority |
| Cart action | Add or increment same variant using authoritative result |

## Supported Platforms And Transports

HID keyboard input targets supported Flutter platforms. Camera uses
`mobile_scanner` on Android/iOS. Windows camera is not active. Package/build
success is not physical camera/scanner evidence.

## Runtime Flow

Leading zeros remain strings. Each complete scan enters FIFO; rapid scans are
not merged or dropped. `quantityPerScan` is validated and added; repeated same
variant increments the existing line. Search text/debounce is cleared before
exact lookup and scan input is enabled only on the current allowed route/dialog.

## Configuration

Minimum length and inactivity reset are configurable in the HID listener.
Supported barcode formats and physical scanner suffix configuration require
device acceptance; do not hardcode business data.

## API Contract

Exact lookup uses the implemented POS product-by-barcode endpoint and typed
result. Stable errors include invalid and not-found. Duplicate/ambiguous barcode
data must fail safely; the client never chooses an arbitrary variant.

## Database And Audit Contract

Barcode/product/variant uniqueness and authority remain backend/database rules.
Scanning itself does not require a business audit row. Sale/cart persistence
follows the normal checkout contract.

## Permission And Business Rules

User requires New Sale access, activated device, outlet/till context and current
route. Backend stock and price are authoritative. One scan means one configured
quantity addition; no client-side product invention.

## Security Rules

Do not log customer/payment secrets or raw plugin exceptions. Treat scanner
input as untrusted text and validate length/format server-side.

## Idempotency

FIFO ensures one processing attempt per completed local frame, not global
business idempotency. Checkout remains responsible for sale idempotency.

## Failure And Recovery Rules

Incomplete HID frame resets after inactivity without cart mutation. Disconnected
scanner leaves manual search available. Not-found/ambiguous results do not add
items. Camera denial shows settings guidance; cancellation is silent. Lifecycle
interruption disposes the session and prevents background scans.

## Offline Behavior

Exact backend lookup currently requires connectivity unless an approved,
versioned offline barcode catalog exists. Cached stock/price cannot override
backend-final checkout validation.

## Automated Testing

Existing widget/provider tests cover framing, leading zero, FIFO, repeated
sessions, exact lookup, cart increment, feedback, permission denial, cancellation
and unsupported platform behavior.

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
