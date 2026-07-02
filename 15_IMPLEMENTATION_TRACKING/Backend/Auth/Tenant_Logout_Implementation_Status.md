<!-- title: Tenant Logout Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Tenant Logout Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Tenant Logout |
| Module | 06_Auth_Tokens_Security_Audit |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-02 |
| Tests | Passed |
| PR / Commit | - |

## Implemented Scope

- Added protected `POST /api/v1/tenant-auth/logout` endpoint.
- Requires `TenantOnly` authorization policy.
- Resolves tenant user id, tenant id, and session id from JWT claims.
- Revokes only the current tenant session.
- Revokes active refresh tokens for the current session.
- Clears `tenant_refresh_token` HttpOnly cookie for browser clients.
- Keeps login anonymous at action level only.

## Files Changed

| Layer | File |
|---|---|
| API | `src/E_POS.Api/Controllers/TenantAuthController.cs` |
| Application Contract | `src/E_POS.Application/Modules/AuthSecurity/Contracts/ITenantAuthService.cs` |
| Application Contract | `src/E_POS.Application/Modules/AuthSecurity/Contracts/ITenantAuthRepository.cs` |
| Application Service | `src/E_POS.Application/Modules/AuthSecurity/Services/TenantAuthService.cs` |
| Domain | `src/E_POS.Domain/Modules/AuthSecurity/Constants/TenantAuthConstants.cs` |
| Domain | `src/E_POS.Domain/Modules/AuthSecurity/Entities/TenantAuthSession.cs` |
| Domain | `src/E_POS.Domain/Modules/AuthSecurity/Entities/TenantRefreshToken.cs` |
| Infrastructure | `src/E_POS.Infrastructure/Modules/AuthSecurity/Repositories/TenantAuthRepository.cs` |
| Infrastructure | `src/E_POS.Infrastructure/Common/Security/AuthSessionValidator.cs` |
| Migration | `src/E_POS.Infrastructure/Persistence/Migrations/20260701195120_AddRefreshTokenExpiresAt.cs` |
| Unit Tests | `tests/E_POS.UnitTests/AuthSecurity/TenantAuthServiceTests.cs` |
| API Tests | `tests/E_POS.ApiTests/AuthSecurity/TenantAuthControllerTests.cs` |
| Integration Tests | `tests/E_POS.IntegrationTests/AuthSecurity/TenantSecurityServiceTests.cs` |

## Test Result

```powershell
dotnet test E_POS.sln -m:1 --no-restore
```

| Test Project | Result |
|---|---|
| E_POS.UnitTests | Passed: 11, Failed: 0 |
| E_POS.IntegrationTests | Passed: 7, Failed: 0 |
| E_POS.ApiTests | Passed: 14, Failed: 0 |

## Notes

- Database migration `AddRefreshTokenExpiresAt` was applied.
- `tenant_refresh_tokens.expires_at` is now persisted and constrained with `expires_at > created_at`.
- Logout does not accept tenant id from the frontend.
- Native POS/mobile clients must clear their locally stored refresh token after successful logout.
- Browser clients get the HttpOnly refresh token cookie cleared by the API response.
- JWT access tokens now validate that the referenced tenant auth session is still `ACTIVE` and belongs to the tenant claim on protected API requests.