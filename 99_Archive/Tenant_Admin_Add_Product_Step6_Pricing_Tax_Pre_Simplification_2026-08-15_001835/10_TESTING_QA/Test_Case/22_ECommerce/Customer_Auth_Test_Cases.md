<!-- title: Customer Auth Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Customer Auth Test Cases

## Feature Summary

| Field | Value |
|---|---|
| Module | 19 Customer Account Consent / E-Commerce CustomerAuth |
| Feature | Storefront Customer Authentication |
| Feature Type | Create / Read / Update / Workflow / Integration |
| API Endpoint | `/api/v1/ecommerce/storefront/auth/*`, `/api/v1/ecommerce/storefront/customer/profile` |
| Application Service | `ICustomerAuthService` / `CustomerAuthService` |
| Required Permission | Anonymous tenant-scoped auth flows; `CustomerOnly` for logout/profile |
| Tenant Scoped | Yes |
| Idempotency Required | Refresh rotation must be safe; duplicate registration must be conflict-safe |
| Criticality | Critical |

## Purpose

Validate the customer-facing authentication flow used before online store
checkout. Tests must prove registration, email verification, login, refresh,
logout, password reset, and profile actions are tenant-safe and never expose
passwords, OTP hashes, token hashes, secrets, or cross-tenant records.

## Preconditions

- Tenant exists and is active.
- Storefront sends tenant context where required.
- Email delivery configuration is available for verification and reset tests.
- Customer auth is separate from platform admin auth and tenant staff auth.
- Raw OTP, reset-token, refresh-token, and password values are never stored.

## Planned Test Cases

| Test Case ID | Scenario | Test Type | Priority | Expected Result |
|---|---|---|---|---|
| ECOM-AUTH-001 | Valid registration | API / Integration | Critical | Customer, auth account, consents, and hashed OTP are created. |
| ECOM-AUTH-002 | Valid latest OTP verification | API / Integration | Critical | Email verified timestamp set and OTP consumed. |
| ECOM-AUTH-003 | Resend verification | API / Integration | High | Old pending OTPs invalidated; new hashed OTP sent. |
| ECOM-AUTH-004 | Verified customer login | API / Unit | Critical | Access token returned, refresh cookie issued, session created. |
| ECOM-AUTH-005 | Refresh token rotation | API / Integration | Critical | Current token used, replacement active, replay protected. |
| ECOM-AUTH-006 | Logout | API / Integration | High | Current session/family revoked and cookie cleared. |
| ECOM-AUTH-007 | Forgot/reset password | API / Integration | High | Safe email flow, hashed token, password hash changed after valid reset. |
| ECOM-AUTH-008 | Profile read/update | API / Integration | Medium | Only authenticated current-customer data is returned/updated. |

## Success Test Cases

| Test Case ID | Scenario | Expected Result | Automated |
|---|---|---|---|
| ECOM-AUTH-SUCCESS-001 | Register valid customer | Success message and verification email | Not Started |
| ECOM-AUTH-SUCCESS-002 | Verify valid email OTP | Account becomes email verified | Not Started |
| ECOM-AUTH-SUCCESS-003 | Login with verified email | Token response and refresh cookie | Done |
| ECOM-AUTH-SUCCESS-004 | Login with phone identifier | Phone normalization accepted | Done |
| ECOM-AUTH-SUCCESS-005 | Refresh session | Token rotated | Done |
| ECOM-AUTH-SUCCESS-006 | Logout current session | 204 No Content and cookie cleared | Done |
| ECOM-AUTH-SUCCESS-007 | Forgot/reset password | Reset email sent and valid token consumed | Not Started |
| ECOM-AUTH-SUCCESS-008 | Read/update profile | Current customer profile only | Not Started |

## Validation Test Cases

| Test Case ID | Scenario | Expected Error | Automated |
|---|---|---|---|
| ECOM-AUTH-VALIDATION-001 | Missing tenant context | 400 validation or safe denial | Not Started |
| ECOM-AUTH-VALIDATION-002 | Duplicate registration email | 409 conflict or safe validation error | Not Started |
| ECOM-AUTH-VALIDATION-003 | Weak password or terms not accepted | 400 validation | Not Started |
| ECOM-AUTH-VALIDATION-004 | Invalid OTP format | 400 validation | Not Started |
| ECOM-AUTH-VALIDATION-005 | Wrong, expired, or old invalidated OTP | 400 safe error | Not Started |
| ECOM-AUTH-VALIDATION-006 | Wrong login credentials | 401 without account enumeration | Done |
| ECOM-AUTH-VALIDATION-007 | Unverified email login | 403 verification-required response | Not Started |
| ECOM-AUTH-VALIDATION-008 | Invalid refresh cookie | 401 and cookie cleared | Done |
| ECOM-AUTH-VALIDATION-009 | Invalid/expired reset token | 400 or safe auth failure | Not Started |

## Authorization And Tenant Isolation Test Cases

| Test Case ID | Scenario | Expected Result | Automated |
|---|---|---|---|
| ECOM-AUTH-AUTHZ-001 | Anonymous public auth endpoint with valid tenant | Allowed after validation | Not Started |
| ECOM-AUTH-AUTHZ-002 | Logout/profile without customer JWT | 401 unauthorized | Partial |
| ECOM-AUTH-AUTHZ-003 | Staff/platform token calls customer profile | 403 or 401 via `CustomerOnly` | Not Started |
| ECOM-AUTH-TENANT-001 | Tenant-scoped login lookup | Tenant A account only found in Tenant A | Done |
| ECOM-AUTH-TENANT-002 | Other tenant uses refresh token | Refresh fails without data leak | Done |
| ECOM-AUTH-TENANT-003 | Same email in different tenants | Tenant-scoped uniqueness behavior confirmed | Not Started |
| ECOM-AUTH-TENANT-004 | OTP/profile across tenant boundary | Denied or not found inside allowed scope | Not Started |

## Business And Database Test Cases

| Test Case ID | Scenario | Expected Assertion | Automated |
|---|---|---|---|
| ECOM-AUTH-RULE-001 | Email verification required before login | Unverified account cannot sign in | Not Started |
| ECOM-AUTH-RULE-002 | Resend invalidates old OTP | Old code fails and new code succeeds | Not Started |
| ECOM-AUTH-RULE-003 | OTP attempts and expiry | Attempts/expiry enforced safely | Not Started |
| ECOM-AUTH-RULE-004 | Bad password lockout | Failed count increments and lockout applies | Done |
| ECOM-AUTH-RULE-005 | Refresh token replay | Token family/session revoked on reuse | Done |
| ECOM-AUTH-DB-001 | Registration persistence | `customers`, `customer_auth_accounts`, `customer_consents`, OTP hash rows written | Not Started |
| ECOM-AUTH-DB-002 | Login persistence | Session active, refresh hash active, login metadata updated | Done |
| ECOM-AUTH-DB-003 | Reset persistence | Reset token hash consumed and password hash changed | Not Started |

## Current Automated Test Coverage

| Test Project | Test File | Current Coverage | Status |
|---|---|---|---|
| E_POS.ApiTests | `ECommerce/CustomerAuth/CustomerAuthControllerTests.cs` | Login success/failure, refresh success/failure, logout session/policy checks. | Present |
| E_POS.UnitTests | `ECommerce/CustomerAuth/CustomerAuthServiceTests.cs` | Login normalization, bad-password lockout, suspended-tenant masking, refresh/reuse, logout. | Present |
| E_POS.IntegrationTests | `ECommerce/CustomerAuth/CustomerAuthRepositoryTests.cs` | Tenant-bounded lookup, session persistence, validator rejection, refresh rotation/reuse, other-tenant denial. | Present |

## Test Commands

```powershell
dotnet test tests\E_POS.UnitTests\E_POS.UnitTests.csproj --no-restore --filter CustomerAuth
dotnet test tests\E_POS.ApiTests\E_POS.ApiTests.csproj --no-restore --filter CustomerAuth
dotnet test tests\E_POS.IntegrationTests\E_POS.IntegrationTests.csproj --no-restore --filter CustomerAuth
dotnet test E_POS.sln --no-restore
```

## Result Summary

| Result Item | Value |
|---|---|
| Unit Tests | Existing coverage present; latest run not recorded in this update |
| Integration Tests | Existing coverage present; latest run not recorded in this update |
| API Tests | Existing coverage present; latest run not recorded in this update |
| Manual Verification | Prior local register/OTP troubleshooting observed, but not formal QA evidence |
| Known Gaps | Register, verify, resend, forgot/reset, and profile coverage must be added before Completed status |

## Completion Checklist

- [x] Planned test cases written.
- [ ] Unit tests added for every auth workflow branch.
- [ ] Integration tests added for OTP and reset-token lifecycle.
- [ ] API tests added for register/verify/resend/forgot/reset/profile endpoints.
- [ ] CustomerOnly denied cases tested for profile APIs.
- [x] Tenant isolation cases identified.
- [x] Refresh-token replay behavior covered.
- [ ] Regression impact checked and recorded.
- [ ] Test commands and latest results recorded.

## Related Standards

- [[../../Testing_Strategy]]
- [[../../API_Testing_Standards]]
- [[../../Tenant_Isolation_Test_Cases]]
- [[../../../15_IMPLEMENTATION_TRACKING/Backend/ECommerce/Customer_Auth_Implementation_Status]]