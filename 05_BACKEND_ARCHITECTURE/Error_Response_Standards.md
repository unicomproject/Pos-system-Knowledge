<!-- title: Error Response Standards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Error Response Standards

## Purpose

This file defines backend error response standards for SCS-TIX EPOS Release 1.

Flutter POS and Angular Platform Admin must receive predictable errors.

## Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "barcode", "message": "Barcode is required" }
  ],
  "traceId": "00-..."
}
```

## Status Code Rules

| Status | Use |
|---|---|
| 400 | Validation failure or bad request |
| 401 | Missing, invalid, or expired authentication |
| 403 | Authenticated but blocked |
| 404 | Resource not found inside allowed scope |
| 409 | Duplicate, conflict, or concurrency issue |
| 500 | Unexpected server error |

## 403 Conditions

Use 403 when blocked by:

- Feature entitlement.
- Permission.
- Tenant status.
- Outlet access.
- Device trust.
- Till assignment.
- Till session.
- Subscription status.

Do not return 401 for an authenticated user who lacks permission.

## 409 Conditions

Use 409 for:

- Duplicate SKU or barcode.
- Duplicate outlet/till code.
- Duplicate document number.
- Already open till session.
- Concurrency conflict.
- Business-state conflict.

## Validation Error Rule

Validation errors must identify the field where possible.

Validation must not expose internal database or implementation details.

## Business Error Rule

Business errors should be clear and safe.

Examples:

- `TILL_SESSION_REQUIRED`
- `FEATURE_NOT_ENABLED`
- `PERMISSION_DENIED`
- `DEVICE_NOT_TRUSTED`
- `INSUFFICIENT_STOCK`
- `REFUND_AMOUNT_EXCEEDED`
- `DUPLICATE_BARCODE`

## Security Rule

Never expose:

- Stack traces.
- SQL errors.
- Password hashes.
- Token hashes.
- Raw setup tokens.
- Raw activation codes.
- POS PINs.
- Card data.
- Provider secrets.

## Global Exception Handling

Use global exception middleware for unexpected failures.

Unexpected technical details must be logged securely and returned as a safe
generic error to the client.

## Trace ID Rule

Every error response should include a trace ID.

Logs should include the same trace ID where available.

## Related Files

- [[API_Standards]]
- [[Backend_Coding_Principles]]
- [[Audit_Log_Standards]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
