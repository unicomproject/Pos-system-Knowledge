<!-- title: Full Feature Status Index -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->

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
| Backend | Sales | Create Sale API | In Progress | - | `pos-home-dashboard` | API exists; Flutter not wired |
| Flutter | POS Shell | POS Home Dashboard | In Progress | - | `pos-home-dashboard` | API dashboard + placeholders |
| Flutter | Sales | Start Sale UI | In Progress | - | `pos-home-dashboard` | Catalog + local cart partial |
| Flutter | Sales | Cashier POS Second Brain vs Code Comparison | Completed | 2026-07-02 | - | Documentation audit/status note added |
| Angular | Tenant | Tenant List Page | In Progress | - | - | Code exists and is wired to `GET /api/v1/platform-admin/tenants`; current verification pending |
| Flutter | Sales | Start Sale UI | Not Started | - | - | Example row |
| Backend | Tenant / Outlet | Outlet Create | Completed | 2026-06-18 | dashboard_tenant | POST /api/v1/tenant-admin/outlets |
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
