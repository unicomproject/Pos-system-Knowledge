<!-- title: Platform Admin Login Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->

# Platform Admin Login Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | PlatformAdministration |
| Feature | Platform Admin Login |
| Feature Type | Workflow |
| API Endpoint | `POST /api/v1/platform-auth/login` |
| Application Service | `E_POS.Application/Modules/PlatformAdministration/Services/PlatformAuthService.cs` |
| Required Permission | At least one active platform permission after credential validation |
| Tenant Scoped | No |
| Idempotency Required | No |
| Criticality | Critical |

## Purpose

Platform Admin Login authenticates platform administrators using `platform_users`, issues a JWT access token, stores the refresh token in an HttpOnly cookie, creates platform auth session and refresh token records, and writes login audit records. It must not use tenant user login rules.

## Preconditions

- Platform user exists in `platform_users`.
- Platform user status is `ACTIVE`.
- Platform user has a valid `password_hash`.
- Platform user has at least one active direct or role-based platform permission.
- JWT settings are configured.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| AUTH-PLA-LOGIN-001 | Valid platform admin credentials | Unit / API | Critical | Returns 200 with access token and user data; refresh token cookie is set. |
| AUTH-PLA-LOGIN-002 | Invalid password | Unit / API | Critical | Returns generic invalid credentials response and writes failed audit. |
| AUTH-PLA-LOGIN-003 | Platform user has no active permissions | Unit / API | Critical | Returns platform access denied and writes failed audit. |
| AUTH-PLA-LOGIN-004 | JWT generation includes platform claims and permissions | Integration | High | JWT contains platform identity, session id, jti, and permission claims. |
| AUTH-PLA-LOGIN-005 | Password hash service verifies only correct password | Integration | High | Correct password verifies; wrong password is rejected. |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| AUTH-PLA-LOGIN-SUCCESS-001 | Platform admin login succeeds | Active platform user with permission exists | Email and password | Call login service/API | Session, refresh token, success audit, JWT access token, and permission list are produced | Done |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| AUTH-PLA-LOGIN-VALIDATION-001 | Invalid password | Wrong password | `platform_auth.invalid_credentials` | Done |
| AUTH-PLA-LOGIN-VALIDATION-002 | Missing or invalid platform access | User with no active permissions | `platform_auth.platform_access_denied` | Done |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-PLA-LOGIN-PERMISSION-001 | User has active platform permission | Allowed | Login succeeds | Done |
| AUTH-PLA-LOGIN-PERMISSION-002 | User has no active platform permission | Missing permission | Access denied | Done |
| AUTH-PLA-LOGIN-PERMISSION-003 | Permission claims included in token | Active permissions exist | JWT payload contains permission claims | Done |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-PLA-LOGIN-TENANT-001 | Platform login does not use tenant context | Platform user login | No tenant_id is accepted from frontend or required for login | Covered by design |
| AUTH-PLA-LOGIN-TENANT-002 | Tenant user cannot be used for platform login | Tenant-only user exists | Tenant user table is not queried by platform login repository | Planned |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-PLA-LOGIN-RULE-001 | Generic credential failure | Do not expose whether email or password failed | Same invalid credentials error is returned | Done |
| AUTH-PLA-LOGIN-RULE-002 | Token hashes only | Raw refresh/session tokens must not be stored | Stored values are hashes | Done |
| AUTH-PLA-LOGIN-RULE-003 | Refresh token cookie | Refresh token must not be exposed to JavaScript | Refresh token is sent in HttpOnly cookie | Done |

## Idempotency Test Cases

Idempotency is not required for login. Each successful login creates a new auth session and refresh token.

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| AUTH-PLA-LOGIN-DB-001 | Successful login persists session and refresh token | `platform_auth_sessions` and `platform_refresh_tokens` receive hashed values | Unit-covered with repository fake; DB integration planned |
| AUTH-PLA-LOGIN-DB-002 | Failed login does not persist session or refresh token | No session/refresh token is saved | Done |
| AUTH-PLA-LOGIN-DB-003 | Password hashing behavior | PBKDF2 verifies correct password and rejects wrong password | Done |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs` | `LoginAsync_WithValidPlatformAdmin_CreatesSessionRefreshTokenAndSuccessAudit` | Passed |
| E_POS.UnitTests | `tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs` | `LoginAsync_WithInvalidPassword_ReturnsGenericFailureAndWritesFailedAudit` | Passed |
| E_POS.UnitTests | `tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs` | `LoginAsync_WithoutPlatformPermissions_ReturnsAccessDeniedAndWritesFailedAudit` | Passed |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformSecurityServiceTests.cs` | `PasswordHashService_VerifiesCorrectPasswordAndRejectsWrongPassword` | Passed |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformSecurityServiceTests.cs` | `JwtTokenFactory_CreatesJwtWithPlatformClaimsAndPermissions` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs` | `Login_WithSuccessfulServiceResult_ReturnsOkResponse` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs` | `Login_WithInvalidCredentials_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs` | `Login_WithoutPlatformAccess_ReturnsForbidden` | Passed |

## Test Commands

```powershell
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-restore
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-restore
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed |
| Integration Tests | Passed |
| API Tests | Passed |
| Manual Verification | Swagger available at `/swagger`; login endpoint appears as `POST /api/v1/platform-auth/login` when API runs. |
| Known Gaps | Full DB-backed login integration test can be added after test database setup is finalized. |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added where token/hash behavior matters.
- [x] API tests added for endpoint behavior.
- [x] Permission denied case tested.
- [x] Tenant isolation rule documented for platform login.
- [x] Idempotency marked not required.
- [x] Regression impact checked.
- [x] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]