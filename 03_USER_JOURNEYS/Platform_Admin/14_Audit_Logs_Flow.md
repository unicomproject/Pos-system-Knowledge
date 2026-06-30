<!-- title: Audit Logs Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Audit Logs Flow

## Purpose

Defines how Platform Admin tracks platform activity, history, and governance events.

## Actor

Platform Admin

## Source

Derived from `Slide 8 - Audit Logs Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens audit logs.

## Preconditions

- Platform Admin has audit log view permission.
- Audit records exist.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open audit logs | System opens audit and traceability module. |
| 2 | Load activity records | System loads latest recorded actions. |
| 3 | Search or filter logs | Platform Admin filters by user, tenant, module, date range, action type, or status. |
| 4 | Review log list | Platform Admin scans summary rows. |
| 5 | Open detailed event view | System shows full event details. |
| 6 | Verify actor/action/timestamp | Platform Admin confirms who did what and when. |
| 7 | Export or retain evidence | Platform Admin downloads or keeps record for review. |
| 8 | Use findings for governance and security | Platform Admin applies insight to monitoring and control. |

## Data Used Or Captured

- User
- Tenant
- Module
- Action type
- Date range
- Status
- Actor
- Timestamp
- Event details

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Audit logs are read-only.
- Audit export must be permission controlled.
- Logs must not expose secrets or sensitive token values.

## Validation And Error Cases

- Audit record not found
- Permission denied
- Invalid filter range
- Export failed

## Outcome

Platform actions are traceable for monitoring, investigation, and governance.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- 05_BACKEND_ARCHITECTURE/Audit_Log_Standards.md
