<!-- title: Full Feature Status Index -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-23 -->

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
| Backend | CatalogProduct | POS Products List | Completed | 2026-07-23 | Current `main` audit | `GET /api/v1/pos/products`, categories, detail and exact barcode lookup exist |
| Backend | Sales | POS Checkout / Cash Payment APIs | Testing | - | Current working tree | Checkout summary/start-payment controllers and persistence exist; working tree has local checkout changes |
| Flutter | POS Shell | POS Home Dashboard | In Progress | - | `POS_UI` | Home API integrated; several cards placeholder |
| Flutter | Till | Open Till Layout | Completed | 2026-07-10 | `Sale_Screen` | Full-screen tablet layout |
| Flutter | Sales | End Shift + Close Till | Completed | 2026-07-09 | `d04ecf0` | Close till API + logout |
| Flutter | Sales | Start Sale UI | In Progress | - | `Sale_Screen` | Catalog API wired; no mock fallback; checkout blocked |
| Flutter | Sales | Cashier POS Second Brain vs Code Comparison | Completed | 2026-07-02 | - | Audit note; see delta in same file |
| Angular | Tenant | Tenant List Page | In Progress | - | - | Wired to platform-admin tenants API |
| Backend | Tenant / Outlet | Outlet Create | Completed | 2026-06-18 | dashboard_tenant | `POST /api/v1/tenant-admin/outlets` |
| Flutter | Tenant Admin / Outlet | Outlet Create UI | Completed | 2026-06-18 | tenant-dashboard | Add/Edit outlet screens |
| Flutter | Sales | Discount | Testing | - | `scanner_inte` | API-backed list/validate/apply flow; manager approval is permission-dependent |
| Flutter | Sales | Customer Management | Testing | - | `scanner_inte` | List/create/update/select/attach implemented; loyalty is separate and incomplete |
| Flutter | Sales | Loyalty Earn / Redeem | Not Started | - | - | No verified cashier Flutter-to-backend loyalty flow |
| Flutter | Sales | Cash Checkout | Testing | - | `scanner_inte` | Summary, tender, change, start-payment and success flow implemented |
| Flutter | Sales | Card Payment | Not Started | - | - | Current route renders payment placeholder |
| Flutter | Sales | QR Payment | Not Started | - | - | Current route renders payment placeholder |
| Flutter | Sales | Split Payment | Not Started | - | - | Current route renders payment placeholder |
| Flutter | Sales | Receipt Preview | Testing | - | `scanner_inte` | Receipt preview UI exists |
| Flutter | Hardware | Physical Receipt Printing | Testing | - | `scanner_inte` | Printer facade/ESC-POS/network transport exist; physical matrix not verified |
| Flutter | Sales | Email Receipt | In Progress | - | `scanner_inte` | Form/UI exists; delivery API completion not verified |
| Flutter | Sales | Return / Refund | Testing | - | `scanner_inte` + backend `main` | Full authoritative workflow and broad automated coverage exist |
| Flutter | Sales | Exchange | Testing | - | `scanner_inte` + backend `main` | Implemented as Return resolution branch with preview/completion |
| Flutter | Cash Drawer | Cash In / Cash Out | In Progress | - | `scanner_inte` | Flutter forms exist; backend mutation wiring is absent |
| Flutter | Sales | Park / Recall | In Progress | - | `scanner_inte` | Device-local secure storage; backend Holds API is disconnected |
| Flutter | Hardware | HID / Camera Barcode Scanner | Testing | - | `24b4271` | Automated source coverage exists; TB-00D and physical Android tests pending |
| Flutter | Hardware | Hardware Testing Workflow | Not Started | - | - | No complete screen/API/service/test-log flow |
| Flutter | Sales | Offline Cash Sale / Outbox | Not Started | - | - | Included MVP scope; no verified end-to-end cashier implementation |

The `Completed` row for the 2026-07-02 Cashier comparison is historical. The
comparison document itself is now `In Progress — Re-audit Required` until its
remaining findings and documentation updates are closed.

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
