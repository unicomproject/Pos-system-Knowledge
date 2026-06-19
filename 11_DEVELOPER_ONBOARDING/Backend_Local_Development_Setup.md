<!-- title: Backend Local Development Setup -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Backend Local Development Setup

## Purpose

This guide explains how to clone the Nytroz POS / SCS-TIX backend, configure local
secrets, apply EF migrations, and sign in as the Development Platform Admin.

It documents `DevelopmentDataSeeder.cs`, which creates or updates the local
Platform Admin user used for Platform Admin login only.

## Why Development Only

`DevelopmentDataSeeder` runs from `Program.cs` only when
`ASPNETCORE_ENVIRONMENT=Development`.

The seeder also checks the host environment internally and skips itself outside
Development.

It must never run in Production. Do not move seed credentials into
`appsettings.json` or commit user secrets.

## What DevelopmentDataSeeder Does

On backend startup in Development:

1. Applies EF migrations automatically (`Program.cs`).
2. Runs `DevelopmentDataSeeder` to ensure one Platform Admin user exists.
3. Runs `DevelopmentPlatformPermissionSeeder` for development permission data.

Default seed email:

```text
admin@nytroz.local
```

Password is never stored in source control. It is read from user secrets at:

```text
DevelopmentSeed:PlatformAdmin:Password
```

### Seed Behavior

| Scenario | Behavior |
|---|---|
| User does not exist | Requires seed password; creates active Platform Admin with hashed password |
| User already exists | Keeps existing password unless reset is enabled |
| `ResetPassword=true` and password configured | Updates password hash and `UpdatedAt` |
| `ResetPassword=false` | Does not change password hash |
| User exists but password secret missing | Logs warning; does not crash |
| User missing and password secret missing | Throws clear error with setup command |
| Non-Development environment | Seeder skipped |

This fixes local login failures when `admin@nytroz.local` already exists with an
old or wrong password hash. Set `DevelopmentSeed:PlatformAdmin:ResetPassword` to
`true` once, run the backend, then set it back to `false` if you prefer.

## Prerequisites

| Tool | Notes |
|---|---|
| .NET 10 SDK | Backend target framework |
| PostgreSQL | Local instance on port 5432 |
| dotnet-ef | EF Core CLI for manual migration runs |

Install EF Core tools if missing:

```powershell
dotnet tool install --global dotnet-ef
```

## Repository Path

```text
C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Backend\Nytroz-POS-Backend
```

Backend API project:

```text
src\SCS.Api
```

User secrets id is configured in `SCS.Api.csproj` (`UserSecretsId`).

## Step 1 — Restore and Build

From backend root:

```powershell
dotnet restore
dotnet build
```

## Step 2 — Configure User Secrets

Run these commands from `src\SCS.Api`:

```powershell
cd src\SCS.Api

dotnet user-secrets init

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=nytroz_pos_dev;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"

dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:Password" "Admin@12345"

dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:ResetPassword" "true"
```

Optional overrides:

```powershell
dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:Email" "admin@nytroz.local"
```

After first successful login, you may set:

```powershell
dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:ResetPassword" "false"
```

## Step 3 — Apply EF Migrations

From `src\SCS.Api`:

```powershell
dotnet ef database update --project ..\SCS.Infrastructure\SCS.Infrastructure.csproj --startup-project .\SCS.Api.csproj
```

Note: `Program.cs` also runs `MigrateAsync()` on startup in Development. Manual
`dotnet ef database update` is still recommended after clone or pull when schema
changed.

## Step 4 — Run the Backend

From `src\SCS.Api`:

```powershell
dotnet run
```

Ensure environment is Development (default for `dotnet run` locally).

Swagger is available in Development.

## Local Platform Admin Login

Use Platform Admin login only. This does not affect Tenant Admin or POS login.

| Field | Value |
|---|---|
| Email | `admin@nytroz.local` |
| Password | `Admin@12345` (or your configured user secret) |

API endpoint:

```http
POST /api/v1/auth/platform-login
Content-Type: application/json

{
  "email": "admin@nytroz.local",
  "password": "Admin@12345"
}
```

Expected: `200 OK` with JWT/session response.

## Supported Configuration Keys

| Key | Required | Default | Purpose |
|---|---|---|---|
| `ConnectionStrings:DefaultConnection` | Yes | none | PostgreSQL connection |
| `DevelopmentSeed:PlatformAdmin:Email` | No | `admin@nytroz.local` | Seed user email |
| `DevelopmentSeed:PlatformAdmin:Password` | Yes on first create / reset | none | Plaintext input hashed by `PasswordHashService` |
| `DevelopmentSeed:PlatformAdmin:ResetPassword` | No | `false` | When `true`, updates hash for existing user |

## Troubleshooting

### DefaultConnection missing

Symptom: startup fails with connection string not configured.

Fix:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=nytroz_pos_dev;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
```

### DevelopmentSeed password missing

Symptom on first run: exception referencing `DevelopmentSeed:PlatformAdmin:Password`.

Fix:

```powershell
dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:Password" "Admin@12345"
```

If user already exists, backend starts but logs a warning that password reset was
skipped.

### Invalid email/password due to old hash

Symptom: `401` / invalid credentials for `admin@nytroz.local`.

Fix:

```powershell
dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:Password" "Admin@12345"
dotnet user-secrets set "DevelopmentSeed:PlatformAdmin:ResetPassword" "true"
dotnet run
```

Restart backend once. Password hash is corrected in Development only.

### dotnet-ef missing

Symptom: `dotnet ef` command not found.

Fix:

```powershell
dotnet tool install --global dotnet-ef
```

### PostgreSQL not running

Symptom: connection refused or database does not exist.

Fix:

1. Start PostgreSQL service.
2. Create database if needed: `nytroz_pos_dev`
3. Verify host, port, username, and password in user secrets.

## Security Warning

- Do not commit passwords, connection strings, or JWT signing keys.
- Do not put secrets in `appsettings.json` or Markdown files.
- Use `dotnet user-secrets` locally and a secret manager in deployed environments.
- `DevelopmentDataSeeder` must not run in Production.
- Passwords are hashed through existing `PasswordHashService`; plaintext is never
  stored in the database or logs.

## Related Files

- [[Local_Setup]]
- [[Environment_Variables]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[../06_DATABASE_KNOWLEDGE/Migration_Rules]]
