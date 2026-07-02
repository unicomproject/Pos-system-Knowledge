<!-- title: TM-EPOS Technology Stack -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# TM[[]]-EPOS Technology Stack

## Purpose

This file defines the confirmed technology stack for TM-EPOS MVP.

TM-EPOS is a mobile and desktop EPOS platform with responsive online store,
click and collect, offline-capable POS operation, multi-device support, and
low-cost hardware integration.



| Area                  | Stack                                                |
| --------------------- | ---------------------------------------------------- |
| Backend API           | ASP.NET Core Web API                                 |
| Backend language      | C#                                                   |
| Backend architecture  | Clean Architecture + Service/Repository Pattern      |
| API style             | REST API                                             |
| Database              | PostgreSQL                                           |
| ORM                   | Entity Framework Core                                |
| Platform Admin Web    | Angular Responsive web application                   |
| Business POS App      | Flutter                                              |
| Customer Online Store | Angular Responsive web application                   |
| Mobile/Desktop POS    | Flutter single codebase                              |
| State management      | Riverpod for Flutter, Angular services/state for web |
| API client            | Dio for Flutter, Angular HttpClient for Angular      |
| Routing               | GoRouter for Flutter, Angular Router for Angular     |
| CI/CD                 | GitHub Actions                                       |

## Azure Cloud Stack

| Area | Azure Service |
|---|---|
| Backend hosting | Azure App Service |
| Database hosting | Azure Database for PostgreSQL Flexible Server |
| File/image storage | Azure Blob Storage |
| Static web hosting | Azure Static Web Apps or Azure App Service |
| Secrets/config | Azure Key Vault |
| Logs/monitoring | Azure Monitor + Application Insights |
| CI/CD deployment | GitHub Actions to Azure |

## Backend Stack

| Layer | Technology |
|---|---|
| API layer | ASP.NET Core Controllers |
| Application layer | Services, DTOs, validators, use cases |
| Domain layer | Entities, value objects, business rules |
| Infrastructure layer | EF Core, PostgreSQL repositories, Azure adapters |
| Persistence | PostgreSQL |
| File storage adapter | Azure Blob Storage |
| Authentication | JWT access token + refresh token flow |
| Authorization | Feature entitlement + permission codes |

## Frontend Stack

| Surface               | Technology                         |
| --------------------- | ---------------------------------- |
| Platform Admin        | Angular                            |
| Tenant Admin          | Flutter business app layout        |
| Cashier POS           | Flutter                            |
| Mobile POS            | Flutter Android/iOS                |
| Customer Online Store | Angular Responsive browser website |

## Flutter Stack

| Area | Stack |
|---|---|
| Framework | Flutter |
| Language | Dart |
| State management | Riverpod |
| Routing | GoRouter |
| API client | Dio |
| Secure storage | Flutter secure storage |
| Local cache/offline DB | Local persistent storage / SQLite-based local DB where required |
| Architecture | Feature-based clean architecture |
| Hardware integration | Printer, scanner, cash drawer, card reader service layer |

## Angular Stack

| Area | Stack |
|---|---|
| Framework | Angular |
| Language | TypeScript |
| Routing | Angular Router |
| API client | Angular HttpClient |
| Forms | Reactive Forms |
| Guards | Auth guard, permission guard, feature guard |
| UI rule | Reusable components, permission-based menu |

## Database Stack

| Area | Decision |
|---|---|
| Main database | PostgreSQL |
| Multi-tenancy | Tenant-aware tables and constraints |
| IDs | UUID primary keys for business tables |
| Status/type values | String values with database CHECK constraints |
| Permission source | Database-seeded permission codes |
| Audit | Append-only audit/event/history records |
| Offline sync | Backend-validated sync tables and conflict records |

## Storage Stack

| Data | Storage |
|---|---|
| Product images | Azure Blob Storage |
| Uploaded files/imports | Azure Blob Storage |
| Receipt templates/assets | PostgreSQL metadata + Azure Blob where needed |
| App secrets | Azure Key Vault |
| Transactional business data | PostgreSQL |
| Flutter session secrets | Secure device storage |
| Flutter offline/cache data | Local persistent storage / local DB |

## Cache And Offline Decision

TM-EPOS uses cache for speed and offline support, but cache is not final truth.

```text
Memory cache = fast current session
Local DB cache = offline survival
PostgreSQL backend = final business truth
```

Do not use Redis in the initial MVP unless scale requirements later prove it is
needed.

Future optional service:

```text
Azure Cache for Redis = later scaling option only
```

## Hardware Stack

| Hardware | Integration Direction |
|---|---|
| Receipt printer | Flutter/local device service |
| Barcode scanner | Keyboard wedge/scanner input |
| Cash drawer | Printer command or supported drawer integration |
| Card reader | Provider/device handoff |
| Customer display | Future / optional |

Backend stores hardware configuration, test logs, transaction references, and
business outcomes. Backend does not directly control every physical device.

## Payment Stack

| Area | Decision |
|---|---|
| Cash payment | POS operational payment record |
| Card payment | Card reader/provider handoff |
| QR payment | Provider-supported QR payment flow |
| Split payment | Backend allocation records |
| Refund | Backend validated |
| Card data | Never stored |
| Provider secrets | Azure Key Vault or secure provider config reference |

## Deployment Summary

```text
Angular Platform Admin
        ↓
Customer Online Store
        ↓
Flutter POS Apps
        ↓
ASP.NET Core Web API on Azure
        ↓
PostgreSQL + Azure Blob Storage
```

## Not Used In MVP

| Technology/Service | Decision |
|---|---|
| AWS EC2 | Not used |
| AWS S3 | Not used |
| Redis | Not used initially |
| CQRS/MediatR | Not used |
| Full accounting engine | Not part of MVP stack |
| AI analytics stack | Future only |

## Related Second Brain Files

- [[00_START_HERE/Current_Source_Of_Truth]]
- [[05_BACKEND_ARCHITECTURE/Backend_Overview]]
- [[05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]]
- [[08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_App_Architecture]]
- [[09_ANGULAR_ADMIN_KNOWLEDGE/Angular_App_Architecture]]
- [[12_INTEGRATIONS/Integration_Overview]]
