<!-- title: Error Response Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Error Response Standards

## Purpose

This file defines backend error response standards for TM-EPOS MVP.

Errors must be safe, consistent, and useful without exposing sensitive internals.

## Standard Error Fields

| Field | Meaning |
|---|---|
| code | Stable application error code |
| message | Safe user/developer message |
| details | Optional validation details |
| traceId | Request trace ID |
| timestamp | Server timestamp |

## HTTP Status Rules

| Status | Use |
|---|---|
| 400 | Validation failure |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Resource not found or hidden by tenant boundary |
| 409 | Conflict, duplicate, invalid state, idempotency conflict |
| 422 | Business rule validation failure where useful |
| 429 | Rate limit or abuse protection |
| 500 | Unexpected server error with safe message |

## Common Error Codes

| Code | Meaning |
|---|---|
| TENANT_INACTIVE | Tenant is not allowed to operate |
| FEATURE_DISABLED | Feature entitlement missing/disabled |
| PERMISSION_DENIED | User lacks required permission |
| OUTLET_ACCESS_DENIED | User/device cannot access outlet |
| TILL_NOT_OPEN | Billing action requires open till |
| DEVICE_NOT_TRUSTED | Device/offline client is not trusted |
| CHECKOUT_VALIDATION_FAILED | Checkout cannot be completed |
| PAYMENT_DUPLICATE | Payment request was already processed |
| IDEMPOTENCY_CONFLICT | Idempotency key reused with different payload |
| PICKUP_SLOT_UNAVAILABLE | Requested pickup slot is unavailable |
| ORDER_STATE_CONFLICT | Order status transition is invalid |
| SYNC_CONFLICT | Offline sync item has conflict |
| SYNC_BATCH_INVALID | Sync batch is invalid or rejected |

## Security Rule

Do not return SQL errors, stack traces, raw token values, card data, provider
secrets, sync payload internals, or credential details.

## Offline Sync Error Rule

Offline sync errors must identify whether the batch, item, client, idempotency
key, payload version, or conflict resolution failed.

## Payment Error Rule

Payment errors must be safe and must not expose card data or provider secrets.

## Related Files

- [[API_Standards]]
- [[Offline_Operation_Architecture]]
- [[Audit_Log_Standards]]
