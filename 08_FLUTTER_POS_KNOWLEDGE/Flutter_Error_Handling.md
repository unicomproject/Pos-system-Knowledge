<!-- title: Flutter Error Handling -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->


# Flutter Error Handling

## Purpose

This file defines error handling rules for TM-EPOS Flutter apps.

Errors must be clear for staff, safe for customers, and useful for developers.

## Error Categories

| Category | Example |
|---|---|
| Auth | Session expired, login required |
| Permission | Permission denied |
| Feature | Feature not enabled |
| Device | Device not trusted, printer offline |
| Till | Till not open, till close blocked |
| Payment | Payment duplicate, payment failed |
| Checkout | Checkout validation failed |
| Pickup | Pickup slot unavailable |
| Order | Invalid status transition |
| Offline | Sync pending, offline action not allowed |
| Sync | Sync conflict, batch rejected |

## Error Display Rule

Show user-friendly messages.

Do not show stack traces, SQL errors, token values, provider secrets, or raw API
payload internals.

## Offline Error Rule

When offline, distinguish between:

- Data available from cache.
- Action queued for sync.
- Action blocked because backend final validation is required.
- Sync conflict requiring review.

## Payment Error Rule

Payment errors must never expose card data or provider secrets.

## Retry Message Rule

Only suggest retry when operation is safe to retry or idempotency exists.

Hardware timeout after irreversible submission is `unknown`, not failed.
Reconcile stable operation identity first. Audit-only retry never resends a
receipt; Card timeout requires provider reconciliation.

## Error Logging Rule

Log safe diagnostic context such as trace ID, route, feature, action, sync item
ID, and device ID.

Never log sensitive data.

## Barcode Scanner Feedback

Scanner UI feedback is derived from typed outcomes rather than exception text or
raw backend payloads. Each completed queue item emits one event with a monotonic
ID; New Sale consumes it once only while its route is current. Success messages
may include product, variant, and quantity-per-scan metadata. Device, auth,
permission, catalog, stock, network, and unexpected failures use concise safe
cashier-facing messages. Consecutive results replace the current scanner
snackbar and never block queue processing.

Camera setup errors occur before a barcode enters the shared scan controller.
Permission denied, unavailable camera, initialization failure, and unsupported
platform use safe local snackbar messages; raw plugin exceptions are not shown.
User cancellation is not treated as an error and does not mutate search/cart.

## Hardware Error Rule

- Typed outcomes distinguish unavailable, unauthorized, incompatible,
  confirmed failure, unknown, audit failure and cancellation.
- Hardware I/O is asynchronous; status and recovery remain touch-friendly and
  responsive on phone, tablet and desktop.
- Route/dialog disposal disables scanner input and cancels safe reads.
- Battery/network interruption preserves operation identity and recovery state.

For receipt batches, partial success is not collapsed into failure. Printed
copies remain successful; failed copies are shown separately and are never
automatically replayed. Timeout/partial output is `unknown`. Historical reprint
requires a new authorized reprint operation. Audit-pending recovery reuses the
same copy request identity and does not call the printer.

## Related Files

- [[Flutter_API_Network]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]

## Scanner typed failures (2026-07-29)

Scanner flows distinguish disabled/not configured, incomplete input, invalid
length, unsupported characters, timeout, camera permission,
initialization/unavailable, recognition failure, duplicate suppression,
product not found/inactive/ambiguous, lookup/backend/audit failure, untrusted
device, permission denial and configuration conflict. Messages never expose
stack traces, tokens, raw audit barcodes, frames or internal paths.
