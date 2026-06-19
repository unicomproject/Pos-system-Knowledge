<!-- title: Local Setup -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Local Setup

## Purpose

This file defines local setup rules for SCS-TIX EPOS Release 1.

It is for backend, Angular Platform Admin, Flutter POS, QA, and documentation
work.

## Setup Principle

Every developer must run the project using the same Release 1 boundary.

Do not start local setup by creating unsupported modules, screens, or tables.

## Required Tools

| Area | Tool |
|---|---|
| Backend | .NET 10 SDK |
| Database | PostgreSQL |
| API testing | Swagger / HTTP client |
| Angular Platform Admin | Node.js, npm, Angular CLI |
| Flutter POS | Flutter SDK and Dart SDK |
| Git/docs | Git CLI, Obsidian or Markdown editor |

## Repository Setup

```text
git clone [REPOSITORY_URL]
cd [REPOSITORY_FOLDER]
git checkout main
git pull origin main
```

Do not work directly on `main`.

Create a feature branch before implementation.

## Backend Setup

Backend must follow the Clean Architecture solution structure.

Run:

```text
dotnet restore
dotnet build
```

For first-time backend setup, user secrets, EF migrations, Development Platform
Admin seed user, and local login verification, follow:

- [[Backend_Local_Development_Setup]]

## Database Setup

Use PostgreSQL for local development.

Local database must match the updated Release 1 database design.

Apply database changes through migration workflow.

Do not create local tables manually unless migration workflow requires it.

Configure `ConnectionStrings:DefaultConnection` through user secrets, not committed
config. See [[Backend_Local_Development_Setup]].

## Angular Platform Admin Setup

Angular Platform Admin Web is only for Platform Admin Release 1 scope.

```text
cd [ANGULAR_PROJECT]
npm install
npm start
```

Final UI must use real backend APIs.

Mock data is allowed only during early shell development.

## Flutter POS Setup

Flutter POS includes Cashier POS and Tenant Admin operational layout inside the
same Flutter app.

```text
cd [FLUTTER_PROJECT]
flutter pub get
flutter run
```

Use configured backend base URL.

Do not hardcode API URLs inside screens.

## Local API Connectivity

Backend, Angular, and Flutter must agree on API base URL, auth token behavior,
tenant context behavior, environment variables, and local CORS/dev ports.

## First Run Checklist

| Check | Required |
|---|---|
| Backend builds | Yes |
| Database reachable | Yes |
| Migrations applied | Yes |
| Swagger/API client opens | Yes |
| Angular app starts | Yes |
| Flutter app starts | Yes |
| Environment config present | Yes |
| No secrets committed | Yes |

## Reading Before Coding

Read:

- [[../00_START_HERE/Developer_Reading_Guide]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../04_MODULE_KNOWLEDGE]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_App_Architecture]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_App_Architecture]]

## Common Mistakes

- Working on `main`.
- Using wrong database.
- Hardcoding API URLs or role checks.
- Trusting frontend `tenant_id`.
- Creating unsupported scope.
- Running frontend against stale backend contracts.
- Ignoring tenant switch state cleanup.

## Related Files

- [[Backend_Local_Development_Setup]]
- [[Environment_Variables]]
- [[Git_Branching_Rules]]
- [[Pull_Request_Rules]]
- [[Code_Review_Checklist]]
