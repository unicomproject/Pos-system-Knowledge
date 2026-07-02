<!-- title: Platform User Logout Implementation Status -->
<!-- status: Completed -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

# Platform User Logout Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Platform User Logout |
| Module | 01_PlatformAdministration |
| Platform | Backend |
| Status | Completed |
| Completed Date | 2026-07-02 |
| Tests | Passed |
| PR / Commit | - |

## Implemented Scope

- Added protected `POST /api/v1/platform-auth/logout` endpoint.
- Requires `PlatformOnly` authorization policy.
- Resolves platform user id and session id from JWT claims.
- Revokes only the current platform auth session.
- Revokes active refresh tokens for the current session.
- Clears `platform_refresh_token` HttpOnly cookie for browser clients.
- Keeps login anonymous at action level only.

## Files Changed

| Layer | File |
|---|---|
| API | `src/E_POS.Api/Controllers/PlatformAuthController.cs` |
| Application Contract | `src/E_POS.Application/Modules/PlatformAdministration/Contracts/IPlatformAuthService.cs` |
| Application Contract | `src/E_POS.Application/Modules/PlatformAdministration/Contracts/IPlatformAuthRepository.cs` |
| Application Service | `src/E_POS.Application/Modules/PlatformAdministration/Services/PlatformAuthService.cs` |
| Domain | `src/E_POS.Domain/Modules/PlatformAdministration/Constants/PlatformAuthConstants.cs` |
| Domain | `src/E_POS.Domain/Modules/PlatformAdministration/Entities/PlatformAuthSession.cs` |
| Domain | `src/E_POS.Domain/Modules/PlatformAdministration/Entities/PlatformRefreshToken.cs` |
| Infrastructure | `src/E_POS.Infrastructure/Modules/PlatformAdministration/Repositories/PlatformAuthRepository.cs` |
| Infrastructure | `src/E_POS.Infrastructure/Common/Security/AuthSessionValidator.cs` |
| Migration | `src/E_POS.Infrastructure/Persistence/Migrations/20260701195120_AddRefreshTokenExpiresAt.cs` |
| Unit Tests | `tests/E_POS.UnitTests/PlatformAdministration/PlatformAuthServiceTests.cs` |
| API Tests | `tests/E_POS.ApiTests/PlatformAdministration/PlatformAuthControllerTests.cs` |
| Integration Tests | `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformSecurityServiceTests.cs` |

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
- `platform_refresh_tokens.expires_at` is now persisted and constrained with `expires_at > created_at`.
- Logout does not accept platform user id from the request body.
- Logout revokes server-side session/refresh-token records and clears the browser-held HttpOnly refresh-token cookie.
- JWT access tokens now validate that the referenced platform auth session is still `ACTIVE` on protected API requests.