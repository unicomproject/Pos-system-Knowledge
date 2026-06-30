<!-- title: Flutter Error Handling -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


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

## Error Logging Rule

Log safe diagnostic context such as trace ID, route, feature, action, sync item
ID, and device ID.

Never log sensitive data.

## Related Files

- [[Flutter_API_Network]]
- [[Flutter_Offline_Operation_Sync]]
- [[Flutter_Security_Guardrails]]
