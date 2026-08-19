<!-- title: Tenant Users, Roles, Permissions & Outlet Access Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-15 -->

# Tenant Users, Roles, Permissions & Outlet Access Technical Contract

## Purpose

Defines the implementation contract for tenant users, tenant roles, direct permissions, outlet roles, outlet permissions, role templates, and permission catalog integration.

## Verification Status

This document was corrected on 2026-08-15 after source inspection. Items marked `MISSING` or `PARTIAL` must not be treated as implemented.

## Database Contract

| Table | Verified Purpose | Status |
|---|---|---|
| `tenant_users` | Tenant staff account. | Implemented |
| `tenant_roles` | Tenant-scoped role, optionally sourced from a role template/version. | Implemented |
| `tenant_role_permissions` | Additive tenant role permission grant with revocation timestamp. | Implemented |
| `tenant_user_roles` | Tenant user role assignment with revocation timestamp. | Implemented |
| `tenant_user_permissions` | Direct tenant user permission grant with revocation timestamp. | Implemented |
| `outlet_user_roles` | Outlet-scoped role assignment with revocation timestamp and primary manager flag. | Implemented |
| `outlet_user_permissions` | Direct outlet-scoped permission grant with revocation timestamp. | Implemented |
| `permission_definitions` | Backend-owned permission code catalog. | Implemented |
| `role_templates` | Reusable role template definition. | Implemented |
| `role_template_versions` | Versioned role template snapshot. | Implemented |
| `role_template_version_permissions` | Template version permission membership. | Implemented |
| `audit_logs` | Persistent audit trail. | Implemented table; role mutation event coverage missing until APIs exist. |

## Effective Permission Contract

The canonical resolver is documented in `02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution.md`.

Effective permissions are additive:

```text
tenant direct permissions
UNION tenant role permissions
UNION outlet direct permissions where outlet context applies
UNION outlet role permissions where outlet context applies
```

Every resolver must filter inactive and revoked rows.

## Required Runtime Filters

- Tenant ID must match authenticated tenant context.
- User must belong to tenant.
- Role must belong to tenant and be active.
- Permission definition must be active.
- User-role assignment must have `revoked_at IS NULL`.
- Direct permission assignment must have `revoked_at IS NULL`.
- Role-permission grant must have `revoked_at IS NULL`.
- Outlet grants must match the target outlet context and active outlet status.
- Feature entitlement must allow plan-controlled features.

## Backend API Contract

### Verified Implemented

| Endpoint Group | Status |
|---|---|
| `/api/v1/tenant-admin/users` | Implemented for Tenant Admin user management. |

### Canonical Target - Missing Until Implemented

| Endpoint | Status |
|---|---|
| `GET /api/v1/tenant-admin/permission-catalog` | MISSING |
| `GET /api/v1/tenant-admin/roles` | MISSING |
| `POST /api/v1/tenant-admin/roles` | MISSING |
| `GET /api/v1/tenant-admin/roles/{roleId}` | MISSING |
| `PUT /api/v1/tenant-admin/roles/{roleId}` | MISSING |
| `GET /api/v1/tenant-admin/roles/{roleId}/permissions` | MISSING |
| `PUT /api/v1/tenant-admin/roles/{roleId}/permissions` | MISSING |
| `GET /api/v1/tenant-admin/roles/{roleId}/users` | MISSING |
| `PUT /api/v1/tenant-admin/roles/{roleId}/users` | MISSING |
| `POST /api/v1/tenant-admin/roles/{roleId}/activate` | MISSING |
| `POST /api/v1/tenant-admin/roles/{roleId}/disable` | MISSING |

## Frontend Contract

- Canonical Flutter route: `/tenant-admin/roles-permissions`.
- Compatibility routes may redirect from `/tenant-admin/roles-access` and `/tenant-admin/roles`.
- Flutter must consume typed DTOs/repositories/providers and must not expose raw JSON directly to widgets.
- Flutter permission checks are visibility helpers only.
- Flutter currently calls missing backend role/permission-catalog endpoints; this is a backend contract gap, not proof that those APIs exist.

## Canonical Role Setup Flow

| Step | Name |
|---:|---|
| 1 | Role Details & Template |
| 2 | Select Modules |
| 3 | Configure Permissions |
| 4 | Assign Users & Access Scope |
| 5 | Review & Create |

No sixth wizard step is canonical.

## Open Implementation Gaps

- Tenant role management API controllers/services/repositories.
- Permission catalog API filtered by tenant entitlements.
- Effective permission resolver hardening for revoked rows.
- Outlet-scoped permission inclusion in runtime authorization.
- Last-admin/super-admin safety guard.
- Explicit role mutation audit events persisted in `audit_logs`.
- Concurrency/idempotency policy for role permission replacement.
- Tests for multiple role union, direct grants, outlet scope, template snapshot, revocation, audit, and authorization denial.

## Test Contract

Test coverage must include:

- Tenant isolation for every endpoint.
- Permission denied for missing role management permission.
- Feature entitlement disabled.
- Duplicate role name/code conflicts.
- Multiple roles union and duplicate collapse.
- Direct permission additive behaviour.
- Revoked tenant role/user/direct/role-permission rows excluded.
- Outlet role/direct permissions included only in correct outlet context.
- Role template version snapshot behaviour.
- Disable does not delete.
- Last-admin protection.
- Audit log persistence.
- Friendly problem details and no internal data leaks.
