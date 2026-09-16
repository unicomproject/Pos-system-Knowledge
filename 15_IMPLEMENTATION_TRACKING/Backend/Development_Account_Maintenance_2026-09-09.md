# Development account maintenance — 2026-09-09

## Scope

User-requested maintenance of two existing accounts in the local PostgreSQL database `UnifiedCommerceDb` on `localhost`. This records the completed database operations and verification from the maintenance session. It does not describe changes to production or another environment.

## Completed operations

| Account | Observed before maintenance | Completed change | Verification after change |
|---|---|---|---|
| cashier001@gmail.com | Account status `LOCKED`; supplied password did not match the stored hash | Changed `account_status` to `ACTIVE`, cleared `locked_until`, reset `failed_login_attempts` to zero, then reset the password on user request | Exactly one account updated during unlock; database status read back as `ACTIVE`; supplied password matched the persisted hash after reset |
| tenantadmin001@gmail.com | Account status `ACTIVE`; supplied password did not match the stored hash | Reset password on user request; account status was left unchanged | Supplied password matched the persisted hash after reset; status observed as `ACTIVE` |

## Implementation and verification evidence

- Passwords were stored in `tenant_users.encrypted_password` using the backend's `PBKDF2-SHA256` format: 100,000 iterations, a fresh 16-byte random salt and a 32-byte hash.
- The password checks read the stored hash and used the same derivation and constant-time comparison as `PasswordHashService`. They did not submit login requests or increment failed-login attempts.
- Updates selected the account by email, rejected missing or multiple matches, and applied the update to the resolved account ID within a database transaction.
- Password match was checked again after the reset transaction committed.
- Password values, salts and hashes are intentionally omitted from this document.

## Boundaries

- This was local database maintenance, not a schema migration, permission grant or application behavior change.
- No frontend/backend application source changes were required. Temporary maintenance scripts were used under the backend `.tmp` directory.
- No seed/default-password change was made; this entry does not establish a credential for future database seeding.
- Successful end-to-end application login was not tested as part of these operations. Verification covered the stored password hash and account status only.
- The account status recorded here is the observed state at maintenance time, not a guarantee of its current state after later login attempts.

## Source references

- Backend: `src/E_POS.Infrastructure/Common/Security/PasswordHashService.cs` — password format and verification.
- Backend: `src/E_POS.Application/Modules/Tenant/TenantAuth/Services/TenantAuthService.cs` — credential validation and lockout logic.
- Backend: `src/E_POS.Infrastructure/Modules/Tenant/AccessControl/Configurations/TenantUserConfiguration.cs` — account status, password and lockout column mappings.

This entry is separate from the cashier Returns/Refunds inventory because these operations concern development account access.
