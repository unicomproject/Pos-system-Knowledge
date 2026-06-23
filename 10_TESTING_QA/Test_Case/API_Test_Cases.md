<!-- title: API Test Cases -->
<!-- status: Draft -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-12 -->
## Platform Admin Login API Test Cases

| Area | Test Case | Expected Result | Status |
|---|---|---|---|
| Route | `POST /api/v1/auth/platform-login` is mapped by `AuthController` | Route exists under `/api/v1/auth` with `platform-login` action | Covered |
| Error response | Invalid platform credentials return standard API error | 401 with `INVALID_CREDENTIALS`; no account existence leak | Covered |
| Response safety | Login response must not expose password hash or token hash | Only raw issued tokens are returned to caller; stored values are hashes | Covered by service tests |
| Scope safety | Platform login must not require tenant context | No tenant status, outlet, device, or till checks are applied to login | Covered by service design |

## Related Test Files

```text
tests/SCS.UnitTests/Modules/Auth/PlatformAuthServiceTests.cs
tests/SCS.IntegrationTests/Modules/Auth/AuthInfrastructureServiceTests.cs
tests/SCS.ApiTests/Modules/Auth/AuthControllerTests.cs
```