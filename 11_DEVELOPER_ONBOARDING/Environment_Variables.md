<!-- title: Environment Variables -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->


# Environment Variables

## Purpose

This file defines environment variable and configuration rules for SCS-TIX EPOS
Release 1.

It applies to backend, Angular Platform Admin, and Flutter POS.

## Security Rule

Never commit real secrets.

Never store secrets in Markdown, Git, frontend environment files, or screenshots.

## Backend Environment Areas

| Area | Example Purpose |
|---|---|
| ASP.NET environment | Development/Staging/Production |
| Database connection | PostgreSQL connection string |
| JWT settings | Issuer, audience, signing key reference |
| S3 storage | Bucket, region, credential reference |
| Email service | Sender and provider configuration |
| Payment provider | Provider credential reference |
| Logging | Serilog/OpenTelemetry settings |
| CORS | Allowed local/frontend origins |

## Backend Secret Rule

Backend may use environment variables, local secret store, or deployment secret
manager.

Do not put real values into source-controlled config.

Use placeholders in documentation.

## Development Seed Secrets (Development Only)

`DevelopmentDataSeeder` reads Platform Admin seed values from user secrets in
Development only. See [[Backend_Local_Development_Setup]].

| Key | Purpose |
|---|---|
| `DevelopmentSeed:PlatformAdmin:Email` | Optional seed email (default `admin@nytroz.local`) |
| `DevelopmentSeed:PlatformAdmin:Password` | Required to create user or reset password hash |
| `DevelopmentSeed:PlatformAdmin:ResetPassword` | When `true`, updates hash for existing dev user |

Never commit these values. Never enable this seeder outside Development.

## Angular Environment Config

Angular may store runtime-safe config only:

| Config | Rule |
|---|---|
| `apiBaseUrl` | Allowed |
| `appName` | Allowed |
| `production` | Allowed |
| `appVersion` | Allowed |
| Tenant IDs | Not allowed |
| User IDs | Not allowed |
| API secrets | Not allowed |
| Payment secrets | Not allowed |
| Permission seed data | Not allowed |

Angular components and services must not hardcode API base URLs.

## Flutter Environment Config

Flutter POS must use environment/config file for backend base URL and app mode.

Do not hardcode production URLs inside screens or repositories.

Do not store tokens in plain shared config.

Use secure storage for access/refresh tokens.

## Local `.env` Rule

Local `.env` or equivalent config may exist, but it must not be committed.

Use `.env.example` or placeholder config for developer onboarding.

## Example Backend Placeholder

```text
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=scs_tix_dev;Username=postgres;Password=CHANGE_ME
Jwt__Issuer=SCS-TIX
Jwt__Audience=SCS-TIX-Clients
Jwt__SigningKey=USE_LOCAL_SECRET_STORE
Storage__Provider=S3
Email__Provider=ConfiguredProvider
```

## Example Angular Placeholder

```text
apiBaseUrl=http://localhost:5000/api/v1
appName=SCS-TIX Platform Admin
production=false
```

## Example Flutter Placeholder

```text
API_BASE_URL=http://10.0.2.2:5187
APP_ENV=development
```

Android emulator may use `10.0.2.2` to reach the host backend on port **5187**
(must match Unified Commerce `E_POS.Api` — see
`POS Backend/Unified-Commerce/src/E_POS.Api/Properties/launchSettings.json`).

| Platform | Default base URL |
|---|---|
| Android emulator | `http://10.0.2.2:5187` |
| Windows / Chrome / desktop | `http://localhost:5187` |
| Real device (same Wi-Fi) | `http://<LAPTOP_LAN_IP>:5187` |

**Obsolete:** port **5052** and `SCS.Api` paths — archived backend only.

Override when backend uses a different port:

```text
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5187
```

Backend override (LAN / physical device):

```text
dotnet run --project ".\src\E_POS.Api\E_POS.Api.csproj" --urls "http://0.0.0.0:5187"
```

## Tenant Context Rule

Tenant context is runtime state.

Do not put tenant ID in environment configuration.

Tenant context must come from authenticated context and selected tenant flow.

## Secret Review Checklist

| Check | Required |
|---|---|
| No real DB password committed | Yes |
| No JWT signing key committed | Yes |
| No payment secret committed | Yes |
| No AWS key committed | Yes |
| No raw setup/payment link committed | Yes |
| No real token in logs | Yes |
| Frontend has no secrets | Yes |

## Related Files

- [[Backend_Local_Development_Setup]]
- [[Unified_Commerce_Backend_Known_Limitations]]
- [[Local_Setup]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Environment_Config]]
- [[../05_BACKEND_ARCHITECTURE/API_Standards]]
