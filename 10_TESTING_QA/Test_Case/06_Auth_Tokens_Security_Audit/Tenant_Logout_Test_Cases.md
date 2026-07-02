<!-- title: Tenant Logout Test Cases -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Tenant Logout Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 06_Auth_Tokens_Security_Audit |
| Feature | Tenant Logout |
| Feature Type | Workflow / Security |
| API Endpoint | POST /api/v1/tenant-auth/logout |
| Application Service | ITenantAuthService.LogoutAsync |
| Required Permission | None; authenticated tenant session required |
| Tenant Scoped | Yes |
| Idempotency Required | No explicit idempotency key; repeated logout is safe no-op at session level |
| Criticality | High |

## Purpose

Tenant logout revokes the current tenant auth session and active refresh tokens for that session. The API resolves tenant context from the authenticated JWT claims and does not accept tenant_id from the request body.

## Preconditions

- Tenant user has a valid tenant JWT access token.
- JWT contains tenant user id, tenant id, and session id claims.
- Session exists in `tenant_auth_sessions`.
- Active refresh token rows may exist in `tenant_refresh_tokens`.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-001 | Valid tenant session logs out | API / Unit | High | 204 response, refresh cookie cleared, current session revoked |
| AUTH-TENANT-LOGOUT-002 | Missing session claim | API / Unit | High | 401 response, service is not called |
| AUTH-TENANT-LOGOUT-003 | Empty tenant/session context passed to service | Unit | High | `tenant_auth.invalid_session` failure |
| AUTH-TENANT-LOGOUT-004 | Platform token calls tenant logout | API / Policy | High | Denied by `TenantOnly` policy |
| AUTH-TENANT-LOGOUT-005 | Tenant A session with Tenant B claim | Repository / Integration | High | No matching session is revoked |
| AUTH-TENANT-LOGOUT-006 | Active refresh tokens exist for session | Repository / Integration | High | Active refresh tokens become `REVOKED` |
| AUTH-TENANT-LOGOUT-007 | Logout called twice | Unit / Integration | Medium | Second call remains safe no-op |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-SUCCESS-001 | Current tenant session logout succeeds | Authenticated tenant user with tenant/session claims | Bearer tenant JWT | Call `POST /api/v1/tenant-auth/logout` | Returns 204, clears `tenant_refresh_token` cookie, service receives tenant user id, tenant id, and session id | Automated |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-VALIDATION-001 | Missing session id claim | JWT has no `session_id` | 401 unauthorized | Automated |
| AUTH-TENANT-LOGOUT-VALIDATION-002 | Empty tenant user id passed to service | `Guid.Empty` tenant user id | `tenant_auth.invalid_session` | Automated |
| AUTH-TENANT-LOGOUT-VALIDATION-003 | Invalid tenant id/session id claim value | Non-Guid claim value | 401 unauthorized | Planned |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-PERMISSION-001 | Tenant user has valid authenticated session | No feature permission required | Logout succeeds | Automated |
| AUTH-TENANT-LOGOUT-PERMISSION-002 | Anonymous request | No authenticated user | 401 unauthorized by authentication middleware | Planned |
| AUTH-TENANT-LOGOUT-PERMISSION-003 | Platform identity calls tenant logout | Wrong identity type | Denied by `TenantOnly` policy | Automated attribute check |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-TENANT-001 | Tenant A logs out Tenant A session | Tenant A user/session exists | Session and refresh tokens are revoked | Covered by unit/API context tests |
| AUTH-TENANT-LOGOUT-TENANT-002 | Tenant A claim attempts Tenant B session | Session belongs to different tenant | No session is matched or revoked | Planned repository integration |
| AUTH-TENANT-LOGOUT-TENANT-003 | Frontend sends tenant_id in body | No tenant_id accepted by endpoint | Ignored because endpoint has no request body | Covered by API design |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-RULE-001 | Logout only current session | Current session logout must not revoke other sessions | Only matching session id is targeted | Planned repository integration |
| AUTH-TENANT-LOGOUT-RULE-002 | Revoked token status | Logout must use documented `REVOKED` status | Domain entities set status to `REVOKED` and update `UpdatedAt` | Automated |

## Idempotency Test Cases

No explicit idempotency key is required. Logout is expected to behave as a safe no-op when the session is already revoked or not found.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGOUT-IDEMPOTENCY-001 | Same logout repeated | Session already revoked | No duplicate data, no failure needed | Planned |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| AUTH-TENANT-LOGOUT-DB-001 | Session revoke | `tenant_auth_sessions.status = REVOKED`, `updated_at` changes | Domain behavior automated; repository integration planned |
| AUTH-TENANT-LOGOUT-DB-002 | Refresh token revoke | Active `tenant_refresh_tokens` for session become `REVOKED` | Domain behavior automated; repository integration planned |
| AUTH-TENANT-LOGOUT-DB-003 | Tenant-safe lookup | Query joins tenant user and tenant id before revoking | Planned repository integration |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs | LogoutAsync_WithCurrentTenantSession_RevokesResolvedSession | Passed |
| E_POS.UnitTests | tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs | LogoutAsync_WithMissingSessionContext_ReturnsInvalidSession | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs | Logout_WithAuthenticatedTenantSession_ReturnsNoContentAndClearsRefreshCookie | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs | Logout_WithoutSessionClaim_ReturnsUnauthorized | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs | LogoutEndpoint_RequiresTenantOnlyPolicyWhileLoginAllowsAnonymous | Passed |
| E_POS.IntegrationTests | tests/E_POS.IntegrationTests/AuthSecurity/TenantSecurityServiceTests.cs | TenantAuthSession_Revoke_SetsRevokedStatusAndUpdatedAt | Passed |
| E_POS.IntegrationTests | tests/E_POS.IntegrationTests/AuthSecurity/TenantSecurityServiceTests.cs | TenantRefreshToken_Revoke_SetsRevokedStatusAndUpdatedAt | Passed |

## Test Commands

```powershell
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed: 9, Failed: 0 |
| Integration Tests | Passed: 5, Failed: 0 |
| API Tests | Passed: 11, Failed: 0 |
| Manual Verification | Not Done |
| Known Gaps | Repository database integration tests for cross-tenant no-op and refresh token DB updates can be added when DB-backed repository tests are introduced. |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where domain/security behavior exists.
- [x] API tests added for endpoint behavior.
- [x] Permission/identity policy case tested.
- [x] Tenant isolation case documented and enforced in repository query.
- [x] Idempotency expectation documented.
- [x] Regression impact checked by running full solution tests.
- [x] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]