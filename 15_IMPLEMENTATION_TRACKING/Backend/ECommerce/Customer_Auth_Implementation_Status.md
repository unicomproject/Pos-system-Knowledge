<!-- title: Customer Auth Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Customer Auth Implementation Status

## Purpose

Track backend implementation status for e-commerce customer registration, email
verification, login, refresh-token rotation, logout, password reset, and profile
APIs. This file is only for customer-facing online store auth, not platform
admin or tenant staff auth.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | ECommerce / CustomerAuth / Customer Account Consent |
| Feature | Storefront Customer Authentication |
| Status | Testing |
| Completed Date | - |
| PR / Commit | -; local backend working tree contains uncommitted CustomerAuth changes |
| Tests | Partial automated coverage present; latest full regression not recorded in this update |

## Feature Summary

The backend contains customer-facing APIs for registration, verification OTP,
resend verification, login, refresh, logout, forgot/reset password, and customer
profile read/update. Email verification blocks sign-in until the customer account
is verified. Refresh tokens are handled through secure cookie rotation and stored
as hashes in the database.

Release 1 guest checkout is disabled in the documented journey, so a verified
customer account is required before order placement.

## Related Second Brain Files

| Area | File |
|---|---|
| Module overview | [[../../../04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/01_Module_Overview]] |
| Functional rules | [[../../../04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/02_Functional_Rules]] |
| Technical contract | [[../../../04_MODULE_KNOWLEDGE/19_Customer_Account_Consent/03_Technical_Contract]] |
| User journey | [[../../../03_USER_JOURNEYS/E-commerce/04_New_Customer_Registration_Flow]] |
| Database | [[../../../06_DATABASE_KNOWLEDGE/Tables/19_Customer_Basic_Authentication_And_Consent_UPDATED]] |
| Email integration | [[../../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]] |
| QA cases | [[../../../10_TESTING_QA/Test_Case/22_ECommerce/Customer_Auth_Test_Cases]] |
| Full stack status | [[../../Online_Store/01_ECommerce_Implementation_Status]] |

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| POST | `/api/v1/ecommerce/storefront/auth/register` | Create pending customer and send verification OTP | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/verify-email` | Verify OTP and activate auth account | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/resend-email-verification` | Invalidate old OTP and send new code | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/forgot-password` | Send reset link when account exists | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/reset-password` | Consume reset token and update password | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/login` | Issue access token and refresh cookie | Anonymous plus tenant header |
| POST | `/api/v1/ecommerce/storefront/auth/refresh` | Rotate refresh cookie and issue new access token | Anonymous plus refresh cookie |
| POST | `/api/v1/ecommerce/storefront/auth/logout` | Revoke current session | `CustomerOnly` |
| GET/PUT | `/api/v1/ecommerce/storefront/customer/profile` | Read/update current profile | `CustomerOnly` |

## Backend Files Affected

```text
src/E_POS.Api/Controllers/V1/ECommerce/CustomerAuth/
src/E_POS.Application/Modules/ECommerce/CustomerAuth/
src/E_POS.Domain/Modules/ECommerce/Customer/Entities/
src/E_POS.Infrastructure/Modules/ECommerce/CustomerAuth/
src/E_POS.Infrastructure/Integrations/Email/
tests/E_POS.ApiTests/ECommerce/CustomerAuth/
tests/E_POS.UnitTests/ECommerce/CustomerAuth/
tests/E_POS.IntegrationTests/ECommerce/CustomerAuth/
```

Configuration files include `appsettings.json` and local development settings.
Never document real ACS connection strings, access keys, OTPs, reset tokens, JWT
signing keys, refresh tokens, or token hashes.

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | Customer JWT required for logout and profile APIs. |
| Tenant status | Done | Active tenant checked for auth flows and refresh rotation. |
| Feature entitlement | Needs review | CustomerAuth currently validates tenant status; explicit `online_store` entitlement gate is not recorded as implemented. |
| Permission | N/A | Customer auth uses customer session rules, not tenant staff permission codes. |
| Outlet/device/till/session | N/A | Not part of customer authentication. |

## Database Tables Used

| Table | Usage |
|---|---|
| `tenants` | Read active tenant status. |
| `customers` | Create identity, read/update profile, tenant-scoped email/phone uniqueness. |
| `customer_auth_accounts` | Password hash, verification timestamp, lock state, login metadata. |
| `customer_verification_otps` | Hashed verification OTP lifecycle. |
| `customer_password_reset_tokens` | Hashed reset token lifecycle. |
| `customer_auth_sessions` | Active/revoked customer sessions. |
| `customer_refresh_tokens` | Refresh hash family, rotation, reuse detection, revocation. |
| `customer_consents` | Terms/privacy consent during registration. |

## Tests Written

| Test Type | File / Coverage | Result |
|---|---|---|
| API | `CustomerAuthControllerTests.cs`: login, refresh, logout route/policy behavior. | Present |
| Unit | `CustomerAuthServiceTests.cs`: login normalization, lockout, tenant masking, refresh/reuse, logout. | Present |
| Integration | `CustomerAuthRepositoryTests.cs`: tenant boundary, sessions, refresh rotation/reuse. | Present |

## Test Result Summary

Latest full backend regression was not run or recorded during this documentation
update. Keep status as `Testing` until register, verify-email, resend, forgot,
reset, and profile coverage is added or explicitly accepted.

## Known QA Gaps

- Add API tests for register, verify-email, resend-email-verification, forgot-password, reset-password, and profile GET/PUT.
- Add unit/integration tests for OTP expiry, attempt limit, resend invalidation, reset token consume/reuse, duplicate email, and email delivery failure.
- Run and record `dotnet build` plus unit, API, integration, and full regression commands.
- Confirm whether CustomerAuth endpoints must enforce `online_store` entitlement in addition to active tenant status.

## Completion Checklist

| Check | Status |
|---|---|
| Implementation completed | In working tree |
| Tests written | Partial |
| Tests run | Not recorded in this update |
| PR/commit recorded | No |
| Second Brain updated | Yes |
| Completed date added | No; status remains Testing |
| No unsupported scope added | Yes |