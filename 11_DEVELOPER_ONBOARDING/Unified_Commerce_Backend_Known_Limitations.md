<!-- title: Unified Commerce Backend — Known Limitations -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->


# Unified Commerce Backend — Known Limitations

## Purpose

Track gaps between the **active Unified Commerce backend** (`E_POS.Api`) and the
**Flutter POS frontend** / Second Brain API contracts during the `cashier-flow`
migration.

## Active Backend

| Item | Value |
|---|---|
| Path | `POS Backend/Unified-Commerce` |
| Branch | `cashier-flow` |
| Dev URL | `http://localhost:5187` |
| Swagger | `http://localhost:5187/swagger` |

## Limitation 1 — Flutter POS tenant-login missing

| | |
|---|---|
| **Flutter calls** | `POST /api/v1/auth/tenant-login` |
| **Unified Commerce exposes** | `GET /api/v1/health`, `POST /api/v1/platform-auth/login` |
| **Result after port fix** | HTTP **404** on login |
| **Blocks** | Cashier POS sign-in, device activation, till, New Sale API flows |

**Not a CORS or cleartext issue** on Android emulator once port **5187** is used.

## Limitation 2 — Old backend port still in Flutter source

Flutter `lib/core/network/api_config.dart` still defaults to port **5052**
(stale `SCS.Api` reference). Android emulator resolves to
`http://10.0.2.2:5052` → connection failure (`NETWORK_ERROR`).

Correct emulator URL: `http://10.0.2.2:5187`

Frontend code change is tracked separately; this doc records the mismatch.

## Limitation 3 — launchSettings port drift

`src/E_POS.Api/Properties/launchSettings.json` may list a different HTTP port
(e.g. `5150`) than the team-verified dev URL (`5187`). Confirm with:

```powershell
netstat -ano | findstr LISTENING | findstr :5187
```

Align `applicationUrl` or use `dotnet run --urls "http://localhost:5187"`.

## Limitation 4 — Physical device LAN access

Default Kestrel bind is often `127.0.0.1` only. Physical phones/tablets need:

```powershell
dotnet run --project ".\src\E_POS.Api\E_POS.Api.csproj" --urls "http://0.0.0.0:5187"
```

and Flutter `--dart-define=API_BASE_URL=http://<PC-LAN-IP>:5187`.

## What works today

| Check | Expected |
|---|---|
| `dotnet restore` / `build` / `test` | Success |
| `GET /api/v1/health` | `200 OK` |
| Swagger in Development | Opens at `/swagger` |
| EF `database drop` + `database update` | Works with explicit project paths |
| `POST /api/v1/platform-auth/login` | Platform Admin auth (if user seeded) |

## Related Files

- [[Backend_Local_Development_Setup]]
- [[Environment_Variables]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
