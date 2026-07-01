<!-- title: Tenant Admin Reports Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Reports Flow

## Purpose

Defines report generation, filtering, viewing, and export.

## Actor

Tenant Admin

## Source

Derived from `Slide 17 - Reports Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens reports.

## Preconditions

- Tenant Admin has report permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open reports | System opens report module. |
| 2 | Select report type | Tenant Admin selects report. |
| 3 | Choose date range | Tenant Admin sets dates. |
| 4 | Apply outlet/staff/product filters | Tenant Admin applies filters. |
| 5 | Generate report | System generates tenant-scoped report. |
| 6 | View summary | System displays report summary. |
| 7 | Export if needed | Tenant Admin exports report where permitted. |

## Data Used Or Captured

- Report type
- Date range
- Outlet filter
- Staff filter
- Product filter
- Report result

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Reports must be tenant-scoped and permission controlled.
- Export must be permission controlled.

## Validation And Error Cases

- No data
- Invalid date range
- Export denied
- Report generation failed

## Outcome

Tenant Admin can view/export permitted operational reports.

## Related Modules

- 27_Reporting_Analytics

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/20_Unified_Order_And_Sales.md
