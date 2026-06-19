<!-- title: Auth Test Cases -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-12 -->

# Auth Test Cases

## Scope

These test cases cover Release 1 Auth module backend behavior for Platform Admin Login only.

In scope:

- Platform Admin Login API
- Email and password validation
- Platform user credential checks
- Platform auth session creation
- Platform refresh token creation
- Safe API error responses
- Sensitive data protection

Out of scope for this file:

- Tenant admin login
- POS cashier login
- Customer login
- Permission-protected business APIs
- Frontend UI tests
- Release 2 authentication flows

## API Under Test

| Item | Value |
|---|---|
| Module | Auth |
| Feature | Platform Admin Login |
| Endpoint | `POST /api/v1/auth/platform-login` |
| Request Content Type | `application/json` |
| Authentication Required | No |
| Tenant Context Required | No |
 
## Request Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Platform admin email address. |
| `password` | string | Yes | Plain password from request body only. Must never be logged or returned. |

## Expected Response Codes

| HTTP Status | Meaning |
|---|---|
| `200 OK` | Valid platform admin login. Returns access token, refresh token, expiry, and safe user details. |
| `400 Bad Request` | Validation error, such as missing email or password. |
| `401 Unauthorized` | Invalid email or password. Response must not reveal which value was wrong. |
| `403 Forbidden` | Platform user exists but login is not allowed because status is not login-enabled. |
| `500 Internal Server Error` | Safe server/configuration error. Sensitive details must not be exposed. |

## Test Data Assumptions

| Data | Requirement |
|---|---|
| Active platform user | Exists in `platform_users` with status such as `active`. |
| Inactive platform user | Exists in `platform_users` with login-disabled status such as `inactive` or `suspended`. |
| Password hash | Stored only as `password_hash`; raw password is never stored. |
| Platform auth session | Stored in `platform_auth_sessions` after successful login. |
| Platform refresh token | Stored as hash only in `platform_refresh_tokens` after successful login. |

## Platform Admin Login Test Cases

| ID | Layer | Scenario | Input | Expected Result | Current Status |
|---|---|---|---|---|---|
| AUTH-PA-LOGIN-001 | Unit / API | Valid platform admin login | Valid `email`, valid `password` | `200 OK`; response includes access token, refresh token, expiry, and safe user object. No password hash or token hash returned. | Partially covered |
| AUTH-PA-LOGIN-002 | API | Missing request body | Empty body | `400 Bad Request` with standard validation error. | Pending |
| AUTH-PA-LOGIN-003 | Unit / API | Empty email | `email: ""`, valid `password` | `400 Bad Request` with validation error. | Covered |
| AUTH-PA-LOGIN-004 | Unit / API | Whitespace email | `email: "   "`, valid `password` | `400 Bad Request` with validation error. | Covered by service validation |
| AUTH-PA-LOGIN-005 | API | Invalid email format | `email: "wrong-format"`, valid `password` | `400 Bad Request` if email-format validation is confirmed. | Pending confirmation |
| AUTH-PA-LOGIN-006 | Unit / API | Empty password | Valid `email`, `password: ""` | `400 Bad Request` with validation error. | Covered |
| AUTH-PA-LOGIN-007 | Unit / API | Whitespace password | Valid `email`, `password: "   "` | `400 Bad Request` with validation error. | Covered by service validation |
| AUTH-PA-LOGIN-008 | Unit / API | Unknown email | Email does not exist, any password | `401 Unauthorized` with safe invalid credentials response. | Pending |
| AUTH-PA-LOGIN-009 | Unit / API | Wrong password | Existing active user email, wrong password | `401 Unauthorized` with safe invalid credentials response. | Covered |
| AUTH-PA-LOGIN-010 | Unit / API | Inactive platform user | Existing user with inactive status, correct password | `403 Forbidden`; login is not allowed. | Covered |
| AUTH-PA-LOGIN-011 | Unit / API | Suspended platform user | Existing user with suspended status, correct password | `403 Forbidden`; login is not allowed. | Pending |
| AUTH-PA-LOGIN-012 | Unit / API | JWT signing configuration missing | Valid credentials, missing signing key | Safe `500 Internal Server Error` or controlled configuration failure. | Pending |
| AUTH-PA-LOGIN-013 | Security | Password hash exposure check | Successful login response | Response must not include `password_hash` or raw password. | Covered by DTO design |
| AUTH-PA-LOGIN-014 | Security | Refresh token hash exposure check | Successful login response | Response may include raw refresh token once; database stores only hash. Response must not include token hash. | Covered by service/integration tests |
| AUTH-PA-LOGIN-015 | Security | Platform login has no tenant context | Successful platform login | Token/session must represent platform identity only and must not accept frontend tenant ID. | Pending |
| AUTH-PA-LOGIN-016 | Persistence | Platform auth session created | Successful login | One row is created in `platform_auth_sessions`. | Covered at service level; DB persistence pending |
| AUTH-PA-LOGIN-017 | Persistence | Platform refresh token created | Successful login | One row is created in `platform_refresh_tokens` with hashed token only. | Covered at service level; DB persistence pending |
| AUTH-PA-LOGIN-018 | Persistence | Tenant auth session not used | Platform admin login | No tenant auth session table is used for platform admin identity. | Covered by implementation design |
| AUTH-PA-LOGIN-019 | Persistence | Last login timestamp updated | Successful login | Platform user's `last_login_at` is updated. | Covered |
| AUTH-PA-LOGIN-020 | API | Route mapping | Controller route inspection | Route is `POST /api/v1/auth/platform-login`. | Covered |

## Current Automated Test Files

| Test Layer | File | Purpose |
|---|---|---|
| Unit | `tests/SCS.UnitTests/Modules/Auth/PlatformAuthServiceTests.cs` | Platform login service behavior and use-case results. |
| Integration | `tests/SCS.IntegrationTests/Modules/Auth/AuthInfrastructureServiceTests.cs` | Password hashing and token hashing infrastructure behavior. |
| API | `tests/SCS.ApiTests/Modules/Auth/AuthControllerTests.cs` | Controller route and API error mapping checks. |

## Current Automated Test Coverage

| Test Method | Layer | Expected Result | Result |
|---|---|---|---|
| `LoginPlatformAdminAsync_WithValidCredentials_CreatesSessionAndRefreshToken` | Unit | Creates platform session, refresh token, and updates last login. | Passed |
| `LoginPlatformAdminAsync_WithInvalidPassword_ReturnsSafeInvalidCredentials` | Unit | Returns safe invalid credentials result. | Passed |
| `LoginPlatformAdminAsync_WithInactiveUser_ReturnsLoginNotAllowed` | Unit | Returns login-not-allowed result. | Passed |
| `LoginPlatformAdminAsync_WithMissingFields_ReturnsValidationFailure` | Unit | Returns validation failure for missing required fields. | Passed |
| `PasswordHashService_HashedPassword_VerifiesOnlyCorrectPassword` | Integration | Verifies correct password and rejects wrong password. | Passed |
| `TokenHashService_HashToken_DoesNotReturnRawToken` | Integration | Token hash differs from raw token and is deterministic for verification. | Passed |
| `AuthController_UsesExpectedPlatformLoginRoute` | API | Confirms platform login route. | Passed |
| `PlatformLogin_WithInvalidCredentials_ReturnsUnauthorizedStandardError` | API | Maps invalid credentials to `401 Unauthorized` standard error. | Passed |

## Pending Test Cases

These are useful next tests before expanding Auth beyond the current Platform Admin Login foundation:

| ID | Pending Test |
|---|---|
| AUTH-PENDING-001 | API happy-path test using full API host or controller with realistic token response. |
| AUTH-PENDING-002 | Unknown email returns the same safe `401 Unauthorized` response as wrong password. |
| AUTH-PENDING-003 | Suspended platform user returns `403 Forbidden`. |
| AUTH-PENDING-004 | Missing request body returns `400 Bad Request`. |
| AUTH-PENDING-005 | Invalid email format validation, if confirmed as required. |
| AUTH-PENDING-006 | Missing JWT signing key returns safe server/configuration error. |
| AUTH-PENDING-007 | PostgreSQL integration test verifies rows in `platform_auth_sessions` and `platform_refresh_tokens`. |
| AUTH-PENDING-008 | JWT claim verification confirms platform identity and no tenant ID claim. |

## Test Command

```text
dotnet test SCS.sln --no-build --no-restore -maxcpucount:1 --logger "console;verbosity=minimal"
```

## Latest Result

| Item | Value |
|---|---|
| Date | 2026-06-12 |
| Total Tests | 14 |
| Passed | 14 |
| Failed | 0 |
| Status | Passed |

## Related Notes

| Note | Path |
|---|---|
| API test cases | `10_TESTING_QA/API_Test_Cases.md` |
| Implementation status | `15_IMPLEMENTATION_TRACKING/Backend/Auth/Platform_Admin_Login_Implementation_Status.md` |
