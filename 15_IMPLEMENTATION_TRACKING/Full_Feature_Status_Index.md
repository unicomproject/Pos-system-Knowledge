<!-- title: Full Feature Status Index -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-10 -->

# Full Feature Status Index

## Purpose

This file tracks Release 1 feature implementation status across Backend, Angular,
and Flutter.

Use `04_MODULE_KNOWLEDGE` for what a module should do.

Use this folder for what has been implemented, tested, reviewed, and completed.

## Folder Structure

```text
15_IMPLEMENTATION_TRACKING/
|-- Backend/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- Angular/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- Flutter/[Module_Name]/[Feature_Name]_Implementation_Status.md
|-- _TEMPLATES/Implementation_Status_Template.md
`-- Full_Feature_Status_Index.md
```

## Platform Meaning

| Platform | Meaning |
|---|---|
| Backend | .NET API, Application, Domain, Infrastructure, tests |
| Angular | Platform Admin Web |
| Flutter | POS app, Tenant Admin layout, Cashier UI, device/till flows |

## Status Values

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| In Progress | Work is being implemented |
| Blocked | Work cannot continue |
| In Review | Pull request/review is active |
| Testing | Implementation done and tests are running |
| Completed | Implementation, tests, review, and docs are complete |
| Deferred | Confirmed not active now |
| Excluded | Not part of Release 1 scope |

## Completion Rule

Do not mark a feature as `Completed` unless implementation is finished, tests are
written/run, failing tests are fixed or recorded, Second Brain is updated, and
PR/commit reference is recorded.

## Feature Status Table

| Platform | Module | Feature | Status | Completed Date | PR / Commit | Notes |
|---|---|---|---|---|---|---|
| Backend | Auth | Tenant Login | Completed | 2026-07-01 | Tenant auth module | `POST /api/v1/tenant-auth/login` |
| Backend | OutletTillDevice | Device Context | Completed | 2026-07-09 | `5c99b66` | `devices/current`, `devices/activate` |
| Backend | OutletTillDevice | Till Session Open/Close | Completed | 2026-07-09 | `06048db` | current-session, open, close |
| Backend | POSOperations | POS Home Dashboard API | Completed | 2026-07-08 | `5c6ae7a` | `GET /api/v1/pos/home` |
| Backend | CatalogProduct | POS Products List | In Review | - | `Sale_Screen` branch | `GET /api/v1/pos/products`; unmerged |
| Backend | Sales | POS Checkout / Cart APIs | Not Started | - | - | Documented in API_ENDPOINTS but no `E_POS.Api` controllers |
| Flutter | POS Shell | POS Home Dashboard | In Progress | - | `POS_UI` | Home API integrated; several cards placeholder |
| Flutter | Till | Open Till Layout | Completed | 2026-07-10 | `Sale_Screen` | Full-screen tablet layout |
| Flutter | Sales | End Shift + Close Till | Completed | 2026-07-09 | `d04ecf0` | Close till API + logout |
| Flutter | Sales | Start Sale UI | In Progress | - | `Sale_Screen` | Catalog API wired; no mock fallback; checkout blocked |
| Flutter | Sales | Cashier POS Second Brain vs Code Comparison | Completed | 2026-07-02 | - | Audit note; see delta in same file |
| Angular | Tenant | Tenant List Page | In Progress | - | - | Wired to platform-admin tenants API |
| Backend | Tenant / Outlet | Outlet Create | Completed | 2026-06-18 | dashboard_tenant | `POST /api/v1/tenant-admin/outlets` |
| Flutter | Tenant Admin / Outlet | Outlet Create UI | Completed | 2026-06-18 | tenant-dashboard | Add/Edit outlet screens |

## Update Process

1. Update the platform-specific status file.
2. Update this index row.
3. Add test result summary.
4. Add PR/commit reference.
5. Add completed date.
6. Link related Second Brain files.
7. Do not update unrelated features.

## Required Links

Every feature status file should link to module knowledge, user journey, database
table file, architecture file, and PR/commit reference where available.

## Review Checklist

| Check | Required |
|---|---|
| Status accurate | Yes |
| Tests recorded | Yes |
| PR/commit recorded | Yes |
| Completed date recorded | If completed |
| Related docs updated | Yes |
| No unsupported scope marked complete | Yes |

## Related Files

- [[Tenant_Admin_Test_Cases]]
- [[../04_MODULE_KNOWLEDGE]]
- [[../03_USER_JOURNEYS]]
- [[../11_DEVELOPER_ONBOARDING/Code_Review_Checklist]]
