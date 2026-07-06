<!-- title: Backend Local Development Setup (SCS / Nytroz-POS-Backend) — ARCHIVED -->
<!-- status: Archived -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- archived_on: 2026-07-01 -->
<!-- superseded_by: ../../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup.md -->


# ARCHIVED — SCS / Nytroz-POS-Backend Local Setup

> **Do not use this file for new work.**
>
> The active backend is **Unified Commerce** at `POS Backend/Unified-Commerce`
> (`E_POS.Api`). Port **5052** and paths under `Nytroz-POS-Backend` / `SCS.Api`
> are obsolete.
>
> Read: [[../../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup]]

---

Historical content preserved below for reference only.

## Old repository path

```text
Nytroz-POS-Backend
src\SCS.Api
```

## Old default port

```text
http://localhost:5052
```

## Old EF command pattern

```powershell
dotnet ef database update --project ..\SCS.Infrastructure\SCS.Infrastructure.csproj --startup-project .\SCS.Api.csproj
```

## Old POS login endpoint (SCS backend)

```http
POST /api/v1/auth/tenant-login
```
