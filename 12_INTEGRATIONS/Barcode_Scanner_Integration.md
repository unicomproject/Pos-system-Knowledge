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

## Physical Verification

TB-00D repeated/rapid scan acceptance and Android/iOS camera permission,
lifecycle, printed-code recognition and performance remain Not Run.

## Production Definition Of Done

Pass HID and camera matrices on supported devices; prove leading-zero,
quantity-per-scan, rapid FIFO, route/dialog isolation, not-found/ambiguity,
stock/price authority, accessibility and regression behavior with evidence.

## Current Implementation Status

Implemented — Physically Unverified. Exact lookup/FIFO/camera source exists;
physical production acceptance is incomplete.

## Known Gaps

Physical TB-00D/camera matrix, supported symbology decision, offline catalog
policy, duplicate-data operational cleanup and numeric stability targets.

## Implementation Sequence

Run Hardware Chunk 3 after device/test-audit foundation; close code gaps found
by physical matrix, then re-run checkout regression.

## Related Files

- [[POS_Hardware_Integration]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Error_Handling]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]

## Hardware Chunk 3 production implementation (2026-07-29)

Supported modes are `usbHid` and `camera`. HID uses a route-scoped
`HardwareKeyboard` handler behind `PosHidScannerInputService`; characters
inside the configured timeout form one buffer and Enter emits it once. Timeout
resets incomplete input. Leading zeroes and allowed case remain intact.

Camera uses existing `mobile_scanner`. First-frame gating suppresses duplicate
callbacks; resources stop in inactive/background states, resume on the active
dialog and dispose on navigation.

New Sale uses the FIFO lookup/cart path. Hardware Testing uses only
`BarcodeScannerTestController`, stores SHA-256/length instead of raw values and
finalizes after operator confirmation. Deduplication is event-scoped, so
intentional repeated scans are not blocked. Automated status is green;
physical TB-00D, camera, 50-scan and POS80 acceptance remain pending.
