<!-- title: Tenant Admin Role Permission Management Test Cases -->
<!-- status: Active -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Role Permission Management Test Cases

## Scope

Tests required before Tenant Admin Roles & Access can be marked production-ready.

## Resolver Tests

| Case | Expected Result |
|---|---|
| User has two active tenant roles with overlapping permissions. | Effective permissions contain one distinct permission code. |
| User has direct tenant permission only. | Permission is effective. |
| User role assignment has `revoked_at` set. | Role permissions are not effective. |
| Tenant role permission has `revoked_at` set. | Permission is not effective. |
| Direct tenant user permission has `revoked_at` set. | Permission is not effective. |
| Outlet role assignment is for selected outlet. | Outlet permission is effective for that outlet context only. |
| Outlet direct permission is for another outlet. | Permission is not effective for current outlet context. |
| Permission definition is inactive. | Permission is not effective. |
| Feature entitlement is disabled. | Permission is not usable even if assigned. |

## API Tests

| Endpoint | Required Tests |
|---|---|
| `GET /api/v1/tenant-admin/permission-catalog` | Auth, tenant isolation, entitlement filtering, inactive permission exclusion. |
| `GET /api/v1/tenant-admin/roles` | Pagination, search, tenant isolation, no deleted/unauthorized leakage. |
| `POST /api/v1/tenant-admin/roles` | Five-step payload, duplicate name/code, template snapshot, audit log. |
| `PUT /api/v1/tenant-admin/roles/{roleId}/permissions` | Replacement semantics, revoked old grants, audit log, concurrency conflict. |
| `PUT /api/v1/tenant-admin/roles/{roleId}/users` | Assignment/revocation, outlet scope, last-admin guard. |
| `POST /api/v1/tenant-admin/roles/{roleId}/disable` | Disable without delete, last-admin guard, audit log. |

## Flutter Tests

- Five-step wizard labels and navigation.
- No legacy six-step confirmation route.
- Permission catalog loading success/empty/error states.
- Missing backend endpoint displays safe error, not raw Dio/SQL/stack trace.
- Unauthorized users do not see role mutation actions.
- Selected modules constrain visible permissions.
- Assigned users and outlet scope preserve state across back/next.
- Tablet landscape, tablet portrait, desktop responsive checks.

## Security Tests

- Cross-tenant role ID returns 404/403 without leaking existence.
- Unauthorized API request returns safe problem details.
- Audit log is persisted for create/update/disable/assignment changes.
- No restricted permission values leak through UI semantics/tooltips/logs.
