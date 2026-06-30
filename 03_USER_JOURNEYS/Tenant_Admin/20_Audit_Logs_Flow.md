<!-- title: Tenant Admin Audit Logs Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Audit Logs Flow

## Purpose

Defines tenant-side audit log viewing and investigation flow.

## Actor

Tenant Admin

## Source

Derived from `Slide 20 - Audit Logs Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens audit logs.

## Preconditions

- Tenant Admin has audit view permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open audit logs | System opens audit logs. |
| 2 | Load activity records | System loads tenant-scoped activity records. |
| 3 | Filter by user/module/outlet/date | Tenant Admin applies filters. |
| 4 | Open log detail | System shows event details. |
| 5 | Review actor/action/timestamp | Tenant Admin checks event evidence. |
| 6 | Export if needed | Tenant Admin exports where permitted. |

## Data Used Or Captured

- User
- Module
- Outlet
- Date
- Action
- Timestamp
- Event status

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Audit logs are tenant-scoped and read-only.
- Audit export must be permission controlled.

## Validation And Error Cases

- Permission denied
- No records
- Invalid filter
- Export failed

## Outcome

Tenant Admin can review tenant audit activity for control and traceability.

## Related Modules

- 06_Auth_Tokens_Security_Audit
- 01_Platform_Administration

## Related Files

- 05_BACKEND_ARCHITECTURE/Audit_Log_Standards.md
