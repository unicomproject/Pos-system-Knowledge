<!-- title: Platform User Logout Test Cases -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Platform User Logout Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 01_PlatformAdministration |
| Feature | Platform User Logout |
| Feature Type | Workflow / Security |
| API Endpoint | POST /api/v1/platform-auth/logout |
| Application Service | IPlatformAuthService.LogoutAsync |
| Required Permission | None; authenticated platform session required |
| Tenant Scoped | No |
| Idempotency Required | No explicit idempotency key; repeated logout is safe no-op at session level |
| Criticality | High |

## Purpose

Platform user logout revokes the current platform auth session and active refresh tokens for that session. The API resolves platform user and session context from authenticated JWT claims and clears the browser HttpOnly refresh-token cookie.

## Preconditions

- Platform user has a valid platform JWT access token.
- JWT contains platform user id and session id claims.
- Session exists in `platform_auth_sessions`.
- Active refresh token rows may exist in `platform_refresh_tokens`.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| PLATFORM-LOGOUT-001 | Valid platform session logs out | API / Unit | High | 204 response, refresh cookie cleared, current session revoked |
| PLATFORM-LOGOUT-002 | Missing session claim | API / Unit | High | 401 response, service is not called |
| PLATFORM-LOGOUT-003 | Empty platform user/session context passed to service | Unit | High | `platform_auth.invalid_session` failure |
| PLATFORM-LOGOUT-004 | Tenant token calls platform logout | API / Policy | High | Denied by `PlatformOnly` policy |
| PLATFORM-LOGOUT-005 | Active refresh tokens exist for session | Repository / Integration | High | Active refresh tokens become `REVOKED` |
| PLATFORM-LOGOUT-006 | Logout called twice | Unit / Integration | Medium | Second call remains safe no-op |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| PLATFORM-LOGOUT-SUCCESS-001 | Current platform session logout succeeds | Authenticated platform user with platform/session claims | Bearer platform JWT | Call `POST /api/v1/platform-auth/logout` | Returns 204, clears `platform_refresh_token` cookie, service receives platform user id and session id | Automated |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| PLATFORM-LOGOUT-VALIDATION-001 | Missing session id claim | JWT has no `session_id` | 401 unauthorized | Automated |
| PLATFORM-LOGOUT-VALIDATION-002 | Empty platform user id passed to service | `Guid.Empty` platform user id | `platform_auth.invalid_session` | Automated |
| PLATFORM-LOGOUT-VALIDATION-003 | Invalid platform user/session claim value | Non-Guid claim value | 401 unauthorized | Planned |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| PLATFORM-LOGOUT-PERMISSION-001 | Platform user has valid authenticated session | No feature permission required | Logout succeeds | Automated |
| PLATFORM-LOGOUT-PERMISSION-002 | Anonymous request | No authenticated user | 401 unauthorized by authentication middleware | Planned |
| PLATFORM-LOGOUT-PERMISSION-003 | Tenant identity calls platform logout | Wrong identity type | Denied by `PlatformOnly` policy | Automated attribute check |

## Tenant Isolation Test Cases

Not applicable. Platform logout is not tenant scoped.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| PLATFORM-LOGOUT-TENANT-001 | Tenant context submitted by client | No tenant input accepted | Ignored because endpoint has no request body | Covered by API design |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| PLATFORM-LOGOUT-RULE-001 | Logout only current session | Current session logout must not revoke other sessions | Only matching session id is targeted | Planned repository integration |
| PLATFORM-LOGOUT-RULE-002 | Revoked token status | Logout must use documented `REVOKED` status | Domain entities set status to `REVOKED` and update `UpdatedAt` | Automated |

## Idempotency Test Cases

No explicit idempotency key is required. Logout is expected to behave as a safe no-op when the session is already revoked or not found.

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| PLATFORM-LOGOUT-IDEMPOTENCY-001 | Same logout repeated | Session already revoked | No duplicate data, no failure needed | Planned |

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| PLATFORM-LOGOUT-DB-001 | Session revoke | `platform_auth_sessions.status = REVOKED`, `updated_at` changes | Domain behavior automated; repository integration planned |
| PLATFORM-LOGOUT-DB-002 | Refresh token revoke | Active `platform_refresh_tokens` for session become `REVOKED` | Domain behavior automated; repository integration planned |
| PLATFORM-LOGOUT-DB-003 | User-safe lookup | Query matches platform user id and session id before revoking | Planned repository integration |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs | LogoutAsync_WithCurrentPlatformSession_RevokesResolvedSession | Passed |
| E_POS.UnitTests | tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs | LogoutAsync_WithMissingSessionContext_ReturnsInvalidSession | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs | Logout_WithAuthenticatedPlatformSession_ReturnsNoContentAndClearsRefreshCookie | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs | Logout_WithoutSessionClaim_ReturnsUnauthorized | Passed |
| E_POS.ApiTests | tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs | LogoutEndpoint_RequiresPlatformOnlyPolicyWhileLoginAllowsAnonymous | Passed |
| E_POS.IntegrationTests | tests/E_POS.IntegrationTests/PlatformAdministration/PlatformSecurityServiceTests.cs | PlatformAuthSession_Revoke_SetsRevokedStatusAndUpdatedAt | Passed |
| E_POS.IntegrationTests | tests/E_POS.IntegrationTests/PlatformAdministration/PlatformSecurityServiceTests.cs | PlatformRefreshToken_Revoke_SetsRevokedStatusAndUpdatedAt | Passed |

## Test Commands

```powershell
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed: 11, Failed: 0 |
| Integration Tests | Passed: 7, Failed: 0 |
| API Tests | Passed: 14, Failed: 0 |
| Manual Verification | Not Done |
| Known Gaps | Repository database integration tests for refresh token DB updates and repeated logout can be added when DB-backed repository tests are introduced. |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where domain/security behavior exists.
- [x] API tests added for endpoint behavior.
- [x] Permission/identity policy case tested.
- [x] Tenant isolation marked not applicable.
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