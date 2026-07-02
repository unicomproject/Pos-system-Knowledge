<!-- title: API Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# API Standards

## Purpose

This file defines API standards for TM-EPOS MVP backend.

APIs must be consistent, tenant-safe, permission-aware, idempotent where needed,
and safe for POS, online store, checkout, payment, fulfilment, and offline sync.

## API Versioning

Use versioned routes.

```text
/api/v1/...
```

Do not create unversioned public APIs.

## Controller Rule

Controllers must be thin.

Controllers should handle route binding, authentication context extraction,
model validation response handling, and service calls.

Business logic belongs in Application services.

## Response Rule

Use consistent response shapes for success, validation error, authorization
failure, conflict, and unexpected errors.

Do not expose stack traces or database internals.

## Idempotency Rule

Use idempotency keys for:

- Checkout completion.
- Payment transaction creation.
- Refund processing.
- Exchange posting.
- Offline sync batch upload.
- Cash movement where retry risk exists.
- Till close.
- Notification event creation where duplicate risk exists.

## Retry Rule

Safe read/idempotent operations may be retried.

Do not blindly retry payment, refund, exchange, sale completion, cash movement,
sync batch apply, till open, or till close.

## Checkout Rule

Backend recalculates totals.
Frontend totals are advisory only.

Checkout must validate product visibility, price, tax, discount, inventory,
fulfilment, pickup, and payment readiness.

## Offline Sync API Rule

Sync APIs must validate client identity, tenant, device/outlet context,
idempotency, payload hash/version, operation type, and conflict status.

## Pagination Rule

Use pagination for large lists such as products, orders, payments, stock
movements, sync items, logs, and reports.

## Related Files

- [[API_ENDPOINTS]]
- [[Error_Response_Standards]]
- [[Offline_Operation_Architecture]]
