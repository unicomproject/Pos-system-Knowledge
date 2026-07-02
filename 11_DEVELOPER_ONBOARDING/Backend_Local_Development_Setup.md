<!-- title: Backend Local Development Setup -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / Unified Commerce -->
<!-- last_updated: 2026-07-01 -->


# Backend Local Development Setup

## Purpose

This guide explains how to clone, build, migrate, and run the **Unified Commerce**
backend (`E_POS.*`) used by TM-EPOS MVP development.

It replaces the archived **SCS / Nytroz-POS-Backend** setup
(`SCS.Api`, port **5052**). See
[[../99_Archive/11_DEVELOPER_ONBOARDING/SCS_Nytroz_POS_Backend_Local_Development_Setup_ARCHIVED]].

## Active Backend Repository

| Item | Value |
|---|---|
| Workspace path | `POS Backend/Unified-Commerce` |
| Git branch (cashier flow) | `cashier-flow` |
| API project | `src/E_POS.Api/E_POS.Api.csproj` |
| Infrastructure (EF) | `src/E_POS.Infrastructure/E_POS.Infrastructure.csproj` |
| Domain | `src/E_POS.Domain` |
| Application | `src/E_POS.Application` |
| Architecture | Clean Architecture + Service/Repository (no CQRS/MediatR) |

## Verified Local URLs (2026-07-01)

| Service | URL |
|---|---|
| HTTP API | `http://localhost:5187` |
| Swagger (Development) | `http://localhost:5187/swagger` |
| Health check | `GET http://localhost:5187/api/v1/health` |

> **Port note:** Team-verified dev port is **5187**. If `dotnet run` binds to a
> different port, check `src/E_POS.Api/Properties/launchSettings.json` and align
> `applicationUrl`, or run with
> `dotnet run --urls "http://localhost:5187"`.

**Old port 5052 is wrong** for this backend. Do not use it in Flutter, docs, or
HTTP clients.

## Prerequisites

| Tool | Notes |
|---|---|
| .NET 10 SDK | `dotnet restore` / `dotnet build` verified |
| PostgreSQL | Local instance (default port 5432) |
| dotnet-ef | EF Core CLI for migrations |

Install EF tools if missing:

```powershell
dotnet tool install --global dotnet-ef
```

## Step 1 — Restore, Build, Test

From `POS Backend/Unified-Commerce`:

```powershell
cd "POS Backend/Unified-Commerce"

git checkout cashier-flow
git pull

dotnet restore
dotnet build
dotnet test
```

## Step 2 — Database Connection

Development connection string lives in
`src/E_POS.Api/appsettings.Development.json` (placeholder values only — do not
commit real passwords).

Example shape:

```text
Host=localhost;Port=5432;Database=UnifiedCommerceDb;Username=postgres;Password=CHANGE_ME
```

Prefer `dotnet user-secrets` from `src/E_POS.Api` for local overrides:

```powershell
cd src/E_POS.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=UnifiedCommerceDb;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
```

## Step 3 — Database Clean (drop + recreate)

Run from `POS Backend/Unified-Commerce` when you need a **fresh local database**
(schema reset). This **destroys all data** in the target database.

```powershell
cd "POS Backend/Unified-Commerce"

dotnet ef database drop --force `
  --project ".\src\E_POS.Infrastructure\E_POS.Infrastructure.csproj" `
  --startup-project ".\src\E_POS.Api\E_POS.Api.csproj"

dotnet ef database update `
  --project ".\src\E_POS.Infrastructure\E_POS.Infrastructure.csproj" `
  --startup-project ".\src\E_POS.Api\E_POS.Api.csproj"
```

EF commands **require** explicit `--project` and `--startup-project` paths.

## Step 4 — Run the Backend

From `POS Backend/Unified-Commerce`:

```powershell
dotnet run --project ".\src\E_POS.Api\E_POS.Api.csproj"
```

Or:

```powershell
cd src/E_POS.Api
dotnet run
```

Ensure `ASPNETCORE_ENVIRONMENT=Development` (default in `launchSettings.json`).

Expected:

- Log: `Now listening on: http://localhost:5187` (or your configured URL)
- Swagger UI: `http://localhost:5187/swagger`
- Health: `GET /api/v1/health` → `200 OK`

### Reach backend from Flutter (frontend not changed in this doc)

| Flutter target | Base URL |
|---|---|
| Android emulator | `http://10.0.2.2:5187` |
| Windows desktop / Flutter web (same PC) | `http://localhost:5187` |
| Physical device (same Wi‑Fi) | `http://<PC-LAN-IP>:5187` |

For a physical device, start the API on all interfaces:

```powershell
dotnet run --project ".\src\E_POS.Api\E_POS.Api.csproj" --urls "http://0.0.0.0:5187"
```

## Implemented API Endpoints (current)

| Method | Route | Status |
|---|---|---|
| GET | `/api/v1/health` | **Implemented** |
| POST | `/api/v1/platform-auth/login` | **Implemented** (Platform Admin) |

Controller: `src/E_POS.Api/Controllers/PlatformAuthController.cs`

## Known Limitation — Flutter POS Login (tenant-login)

The Flutter POS app still calls:

```http
POST /api/v1/auth/tenant-login
```

This route is **not implemented** in the Unified Commerce backend yet.

| Symptom | Cause |
|---|---|
| `NETWORK_ERROR` on login | Flutter still points at old port **5052** or unreachable host |
| `404` after fixing port to **5187** | `tenant-login` endpoint missing on new backend |

PowerShell verification:

```powershell
# Should succeed
Invoke-RestMethod -Uri "http://localhost:5187/api/v1/health"

# Currently returns 404 until tenant-login is implemented
Invoke-RestMethod -Method Post -Uri "http://localhost:5187/api/v1/auth/tenant-login" `
  -ContentType "application/json" -Body '{"email":"cashier001@gmail.com","password":"123456"}'
```

**Action required (future backend work):** implement `POST /api/v1/auth/tenant-login`
for cashier/Tenant Admin POS sign-in, or update Flutter to the new auth contract
after API design is confirmed.

Until then, Flutter POS login cannot complete against Unified Commerce even when
the port is correct.

## Platform Admin Login (implemented)

```http
POST /api/v1/platform-auth/login
Content-Type: application/json

{
  "email": "<platform-admin-email>",
  "password": "<password>"
}
```

Use Swagger at `http://localhost:5187/swagger` to inspect the request/response
schema.

## Troubleshooting

### Port 5187 already in use

```powershell
netstat -ano | findstr :5187
taskkill /PID <PID> /F
```

### dotnet ef not found

```powershell
dotnet tool install --global dotnet-ef
```

### PostgreSQL connection refused

1. Start PostgreSQL service.
2. Confirm database name (`UnifiedCommerceDb` or your override).
3. Verify connection string in user secrets or `appsettings.Development.json`.

### Flutter NETWORK_ERROR (Android emulator)

- Wrong port (**5052** → use **5187**).
- Emulator must use **`http://10.0.2.2:5187`**, not `http://localhost:5187`.
- Cleartext HTTP is allowed in Flutter Android manifest (`usesCleartextTraffic=true`).
- CORS is **not** required for Android native HTTP; it matters for Flutter **web** only.

## Security Warning

- Do not commit real database passwords or JWT signing keys.
- `appsettings.Development.json` may contain dev placeholders — use user secrets
  for machine-specific values.
- Do not paste live tokens into Markdown or chat logs.

## Related Files

- [[Local_Setup]]
- [[Environment_Variables]]
- [[Unified_Commerce_Backend_Known_Limitations]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[../05_BACKEND_ARCHITECTURE/Module_Based_Folder_Structure]]
- [[../06_DATABASE_KNOWLEDGE/Migration_Rules]]
