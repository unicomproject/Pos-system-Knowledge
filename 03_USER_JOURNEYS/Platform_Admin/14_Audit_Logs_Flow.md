<!-- title: Audit Logs Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Audit Logs Flow

## Purpose

Defines how Platform Admin reviews platform audit activity in Release 1.

## Release 1 scope (implemented 2026-07-03)

Unified Commerce **does not** have a generic `audit_logs` table in Release 1.

The implemented Platform Admin audit API is **read-only login/security audit only**:

| Item | R1 truth |
|---|---|
| Data source | `platform_login_audits` only |
| API | `GET /api/v1/platform-admin/audit-logs` |
| Permission | `platform.audit.view` |
| Response scope | `auditScope: platform_login_security` |
| Events covered | Platform login `SUCCESS`, `FAILED`, `LOCKED` |
| Not in R1 | Tenant update, entitlement change, role edit, settings change, export |

Business audit events remain **future scope** until a generic `audit_logs` migration and write pipeline exist.

Archived design docs may reference `audit_logs`; treat that as target-state, not current Unified Commerce R1.

## Actor

Platform Admin

## Source

Derived from `Slide 8 - Audit Logs Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens audit logs.

## Preconditions

- Platform Admin has `platform.audit.view`.
- Login audit rows may exist in `platform_login_audits` (empty list is valid).

## Main Flow (R1)

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open audit logs | System opens Platform Admin audit page (future UI) or calls audit API directly. |
| 2 | Load records | Backend returns paginated login/security audit rows from `platform_login_audits`, newest first. |
| 3 | Search or filter | Platform Admin filters by date range, action, actor, entity type, or search term supported by the API. |
| 4 | Review list | Platform Admin scans actor email, action, summary, and timestamp. |
| 5 | Confirm scope | UI/API shows `auditScopeDescription` so user knows this is login/security audit only. |
| 6 | Use for security review | Platform Admin investigates failed or locked login attempts. |

## R1 API filters

Supported query parameters on `GET /api/v1/platform-admin/audit-logs`:

- `pageNumber`, `pageSize`
- `from`, `to`
- `action`
- `actorPlatformUserId`
- `entityType` (only `platform_user` matches R1 rows)
- `search`

## R1 fields not available

- `ipAddress` → `null` (column not on `platform_login_audits`)
- `userAgent` → `null` (column not on `platform_login_audits`)

## Future flow (not R1)

| Step | Action | System Behavior |
|---:|---|---|
| Open detailed business event view | Requires generic `audit_logs` rows |
| Filter by tenant/module/business action | Requires generic audit migration |
| Export audit evidence | Requires export permission + generic audit data |

## Data Used Or Captured (R1)

- Platform user actor (`platformUserId`, `email`)
- Login action (`platform.login.success` / `platform.login.failed` / `platform.login.locked`)
- Area (`platform_auth`)
- Entity type (`platform_user`)
- Timestamp (`occurredAt`)
- Summary message derived from login result

## Access And Security Rules

- Platform Admin must be authenticated with platform JWT.
- Backend requires `platform.audit.view`; frontend guards are UX only.
- Audit API is read-only in R1.
- Logs must not expose secrets, tokens, or password values.
- Do not present login audit rows as full business governance audit coverage.

## Validation And Error Cases

- Permission denied (`platform_audit.access_denied`)
- Invalid date range (`platform_audit.validation_failed` when `from > to`)
- Empty result set (valid)

## Outcome

Platform login and authentication activity is traceable for security monitoring in R1.

## Related Modules

- 01_Platform_Administration
- 06_Auth_Tokens_Security_Audit

## Related Files

- [[05_BACKEND_ARCHITECTURE/Audit_Log_Standards]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
