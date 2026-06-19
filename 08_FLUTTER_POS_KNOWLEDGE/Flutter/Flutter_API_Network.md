
<!-- title: Flutter API Network -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Flutter API Network

## Purpose

This file defines the Dio network layer for Release 1 Flutter.

## Decision

Use one centrally configured Dio client.

Individual features must not create independent Dio instances.

## Core Network Folder

```text
lib/core/network/
  dio_client.dart
  api_client.dart
  interceptors/
    auth_interceptor.dart
    tenant_interceptor.dart
    outlet_till_interceptor.dart
    logging_interceptor.dart
    error_interceptor.dart
    retry_interceptor.dart
```

## Interceptors

| Interceptor | Responsibility |
|---|---|
| AuthInterceptor | Attach access token and handle expired session |
| TenantInterceptor | Attach tenant/business context |
| OutletTillInterceptor | Attach outlet/till for POS transactions |
| LoggingInterceptor | Log safe metadata only |
| ErrorInterceptor | Convert API/network errors to Failure objects |
| RetryInterceptor | Retry safe idempotent requests only |

## Critical Retry Rule

Do not blindly retry sale completion, payment capture, refund, exchange, cash
movement, till open, or till close.

These actions can duplicate business effects.

## Context Rules

| API Type | Required Context |
|---|---|
| Auth | No existing session |
| Tenant config | Auth session |
| POS sale/payment | Tenant, outlet, till, device, permission |
| Return/refund | Tenant, outlet/till where required, permission |
| Tenant Admin setup | Tenant context and permission |
| Hardware settings | Device and permission |

## Failure Mapping

Dio errors must map into typed failures: NetworkFailure, AuthFailure,
PermissionFailure, ValidationFailure, HardwareFailure, PaymentFailure,
BackendValidationFailure, and DatabaseFailure.

## Logging Rules

Never log passwords, tokens, POS PINs, full card data, provider secrets, raw
setup codes, or activation codes.

## Related Files

- [[Flutter_API_Integration]]
- [[Flutter_Error_Handling]]
