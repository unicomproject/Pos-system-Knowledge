<!-- title: API Testing Standards -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# API Testing Standards

## Purpose

This file defines API-level testing rules for TM-EPOS MVP backend endpoints.

## Scope

API tests must verify the behavior visible to API consumers:

- Routes and HTTP methods.
- Request DTO validation.
- Response DTO shape.
- HTTP status codes.
- Error response format.
- Authentication and authorization behavior.
- Tenant context behavior.
- Idempotency behavior where applicable.

## Standard API Test Cases

Each protected endpoint should cover:

| Case | Expected Result |
|---|---|
| Valid request | 2xx response and expected response DTO |
| Invalid request body | 400 validation response |
| Missing authentication | 401 unauthorized |
| Missing permission | 403 forbidden |
| Tenant missing or invalid | tenant error response according to API standards |
| Resource not found | 404 not found |
| Duplicate business key | conflict response where applicable |
| Cross-tenant access | denied or not found without leaking data |

## Request Validation Tests

Test required fields, invalid formats, invalid enum/status values, max length, numeric boundaries, date/time rules, and foreign key/business reference validation where the API owns the rule.

## Response Tests

API tests must assert:

- Stable response property names.
- No entity/internal EF types leak through API responses.
- No sensitive data is returned.
- Error response contains stable machine-readable information.

## Controller Rule

Controllers must stay thin. API tests should prove endpoint behavior, while business workflow details should be tested in Application service tests.

## Versioning Rule

All public MVP endpoints must use versioned route patterns such as `/api/v1/...` unless explicitly documented otherwise.

## Related Files

- [[Testing_Strategy]]
- [[Permission_Test_Cases]]
- [[Tenant_Isolation_Test_Cases]]