<!-- title: Tenant Login Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->

# Tenant Login Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | Auth / Auth Tokens Security Audit |
| Feature | Tenant Login |
| Feature Type | Workflow |
| API Endpoint | POST `/api/v1/tenant-auth/login` |
| Application Service | `TenantAuthService` |
| Required Permission | None for login; permissions are loaded after successful authentication |
| Tenant Scoped | Yes |
| Idempotency Required | No |
| Criticality | Critical |

## Purpose

Authenticate tenant users using email and password only, resolve tenant context server-side from globally unique tenant user email, issue tenant JWT and refresh token, create tenant auth session, and audit login result without exposing password hashes or token hashes.

## Preconditions

- Tenant user exists in `tenant_users`.
- `tenant_users.normalized_email` is globally unique across tenants.
- Tenant user status allows login.
- Tenant status is `active` or `setup_pending`.
- Tenant user has a valid `password_hash` after setup.
- Tenant JWT settings are configured.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| AUTH-TENANT-LOGIN-001 | Valid email/password succeeds | Unit / API / Integration | Critical | Access token, refresh token, tenant user DTO, permissions, session, refresh token row, and success audit are created |
| AUTH-TENANT-LOGIN-002 | Email or password missing | Unit / API | High | 400 validation response |
| AUTH-TENANT-LOGIN-003 | Invalid password | Unit / API | Critical | Generic 401 response and failed audit; no session/token persisted |
| AUTH-TENANT-LOGIN-004 | Locked tenant user | Unit / API | Critical | Generic 401 response and locked audit |
| AUTH-TENANT-LOGIN-005 | Tenant suspended/inactive | Unit / API | Critical | 403 tenant access denied after credential validation |
| AUTH-TENANT-LOGIN-006 | Direct/role permissions exist | Unit / Integration | High | Active permissions are returned in response/JWT |
| AUTH-TENANT-LOGIN-007 | Duplicate email across tenants | Migration / DB | High | Global unique constraint prevents duplicate tenant user email |

## Success Test Cases

| Test Case ID | Scenario | Preconditions | Input | Steps | Expected Result | Automated |
|---|---|---|---|---|---|---|
| AUTH-TENANT-LOGIN-SUCCESS-001 | Valid tenant login succeeds | Active tenant user, valid password hash, active tenant | Email/password | Call `TenantAuthService.LoginAsync` | Session, refresh token hash, success audit, response DTO, and permissions are returned | Done |
| AUTH-TENANT-LOGIN-SUCCESS-002 | API returns success | Service returns success | Email/password | Call controller `Login` | 200 OK and tenant refresh cookie set | Done |
| AUTH-TENANT-LOGIN-SUCCESS-003 | JWT contains tenant claims | Tenant JWT options configured | Tenant login account | Create tenant JWT | Token contains `tenant_id`, `identity_type`, `session_id`, `jti`, and permissions | Done |

## Validation Test Cases

| Test Case ID | Scenario | Invalid Input | Expected Error | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGIN-VALIDATION-001 | Missing required fields | Empty email/password | 400 validation response | Done |
| AUTH-TENANT-LOGIN-VALIDATION-002 | Invalid credentials | Wrong password | Generic 401 response | Done |
| AUTH-TENANT-LOGIN-VALIDATION-003 | Missing password hash | User without setup password | Generic 401 response | Planned |

## Permission Test Cases

| Test Case ID | Scenario | User Permission State | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGIN-PERMISSION-001 | Login endpoint called without permission | No permission required for login | Login can succeed after valid authentication | Done |
| AUTH-TENANT-LOGIN-PERMISSION-002 | Permissions are loaded after login | Active direct/role permissions exist | Permissions returned in response/JWT | Done |
| AUTH-TENANT-LOGIN-PERMISSION-003 | Protected APIs after login | Missing required feature permission | Downstream protected API returns 403 | Planned for each protected feature |

## Tenant Isolation Test Cases

| Test Case ID | Scenario | Setup | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGIN-TENANT-001 | Tenant context resolved server-side | Email belongs to one tenant user | Response/JWT tenant id comes from database account | Done |
| AUTH-TENANT-LOGIN-TENANT-002 | Frontend tenant id is not accepted | Request has only email/password | Backend does not trust client tenant id | Done by DTO shape |
| AUTH-TENANT-LOGIN-TENANT-003 | Duplicate email across tenants | Same normalized email attempted in another tenant | DB unique constraint rejects duplicate | Migration created; DB constraint execution test planned |

## Business Rule Test Cases

| Test Case ID | Scenario | Rule | Expected Result | Automated |
|---|---|---|---|---|
| AUTH-TENANT-LOGIN-RULE-001 | Suspended tenant tries login | Tenant must be active or setup pending | 403 tenant access denied | Done |
| AUTH-TENANT-LOGIN-RULE-002 | Locked tenant user tries login | Locked status blocks login | Generic 401 and locked audit | Done |
| AUTH-TENANT-LOGIN-RULE-003 | Invalid credentials use safe failure | Missing user/wrong password must not reveal account state | Generic 401 | Done |

## Idempotency Test Cases

Idempotency is not required for login. Each successful login intentionally creates a new session and refresh token.

## Database / Integration Test Cases

| Test Case ID | Scenario | Database Assertion | Automated |
|---|---|---|---|
| AUTH-TENANT-LOGIN-DB-001 | Success persists auth state | Tenant auth session, refresh token hash, and login audit are saved | Unit repository fake done; PostgreSQL repository test planned |
| AUTH-TENANT-LOGIN-DB-002 | Failed request does not persist session | Failed login only writes failed audit | Done |
| AUTH-TENANT-LOGIN-DB-003 | Tenant user email is globally unique | `uq_tenant_users_normalized_email` exists | Migration created; DB constraint execution test planned |

## Current Automated Test Coverage

| Test Project | Test File | Test Name | Status |
|---|---|---|---|
| E_POS.UnitTests | `tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs` | `LoginAsync_WithValidTenantUser_CreatesSessionRefreshTokenAndSuccessAudit` | Passed |
| E_POS.UnitTests | `tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs` | `LoginAsync_WithInvalidPassword_ReturnsGenericFailureAndWritesFailedAudit` | Passed |
| E_POS.UnitTests | `tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs` | `LoginAsync_WithSuspendedTenant_ReturnsAccessDeniedAfterCredentialValidation` | Passed |
| E_POS.UnitTests | `tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs` | `LoginAsync_WithLockedUser_ReturnsGenericFailureAndWritesLockedAudit` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs` | `Login_WithSuccessfulServiceResult_ReturnsOkResponseAndRefreshCookie` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs` | `Login_WithInvalidCredentials_ReturnsUnauthorized` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs` | `Login_WithTenantAccessDenied_ReturnsForbidden` | Passed |
| E_POS.ApiTests | `tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs` | `Login_WithValidationFailure_ReturnsBadRequest` | Passed |
| E_POS.IntegrationTests | `tests/E_POS.IntegrationTests/AuthSecurity/TenantSecurityServiceTests.cs` | `JwtTokenFactory_CreatesJwtWithTenantClaimsAndPermissions` | Passed |

## Seed Users

All seeded development tenant users use password `123456`.

| Role              | Email                       |
| ----------------- | --------------------------- |
| Tenant Admin      | `tenantadmin001@gmail.com`  |
| Store Manager     | `storemanager001@gmail.com` |
| Cashier           | `cashier001@gmail.com`      |
| Inventory Manager | `inventory001@gmail.com`    |
| Fulfilment Staff  | `fulfillment001@gmail.com`  |

## Test Commands

```powershell
dotnet test E_POS.sln -m:1 --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Passed: 7 total unit tests |
| Integration Tests | Passed: 3 total integration tests |
| API Tests | Passed: 8 total API tests |
| Manual Verification | EF database update applied successfully; 5 tenant login users seeded |
| Known Gaps | PostgreSQL repository permission-query integration test is planned for later hardening |
| Refactor Note | Platform and tenant auth now share password hashing, refresh token generation, token hashing, and JWT factory services |

## Completion Checklist

- [x] Planned test cases written.
- [x] Unit tests added where service/domain logic exists.
- [x] Integration tests added for tenant JWT behavior.
- [x] API tests added for endpoint behavior.
- [x] Permission behavior documented for anonymous login and downstream protected APIs.
- [x] Tenant isolation case tested by DTO shape and service response tenant context.
- [x] Idempotency reviewed; not required for login.
- [x] Regression impact checked.
- [x] Test commands and results recorded.

## Related Standards

- [[../Testing_Strategy]]
- [[../API_Testing_Standards]]
- [[../Permission_Test_Cases]]
- [[../Tenant_Isolation_Test_Cases]]
- [[../Idempotency_Test_Cases]]
- [[../Regression_Checklist]]
