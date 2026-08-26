<!-- title: Tenant Effective Permission Resolution -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->
<!-- verification: Backend and Flutter source inspected; documentation-only update -->

# Tenant Effective Permission Resolution

## Purpose

Defines the canonical Tenant Admin effective permission model for tenant staff users, role management, permission catalogs, outlet scope, and feature entitlement enforcement.

This is a contract document. It separates verified implementation from target behaviour and known implementation gaps.

## Verified Sources

| Source | Evidence | Result |
|---|---|---|
| Backend DbContext | `EPosDbContext` exposes `OutletUserPermissions`, `OutletUserRoles`, `PermissionDefinitions`, `RoleTemplates`, `RoleTemplateVersions`, `RoleTemplateVersionPermissions`, `TenantRoles`, `TenantRolePermissions`, `TenantUserPermissions`, `TenantUserRoles`, and `AuditLogs`. | Schema support exists. |
| Backend domain entities | Tenant role/user permission entities have tenant IDs and revocation timestamps; outlet entities include outlet IDs and revocation timestamps. | Tenant-wide and outlet-scoped grants are modelled. |
| Backend auth resolver | `TenantAuthRepository.GetActivePermissionCodesAsync` unions tenant direct permissions and tenant role permissions. | Partial implementation. |
| Backend context resolver | `TenantAdminContextRepository` emits effective permissions for session context. | Partial implementation. |
| Backend user access summary | `TenantAdminUserRepository.GetEffectiveAccessSummaryAsync` includes tenant role, outlet role, tenant direct, outlet direct sources and filters revoked rows. | Closest current implementation to canonical model. |
| Flutter role permissions datasource | Flutter calls `/api/v1/tenant-admin/permission-catalog` and `/api/v1/tenant-admin/roles`. | Frontend is ahead of backend. |
| Backend tenant role API | No implemented `api/v1/tenant-admin/roles` or `api/v1/tenant-admin/permission-catalog` controller was found. | Missing backend contract. |

## Canonical Effective Permission Algorithm

Effective permissions are additive allow permissions.

```text
effective_permission_codes =
    active tenant direct permissions
    UNION active permissions from active tenant roles
    UNION active outlet direct permissions for the relevant outlet context
    UNION active permissions from active outlet roles for the relevant outlet context
```

The final result is a distinct set of `permission_code` values. Duplicate grants from multiple roles or direct assignments collapse to one effective permission.

## Required Active Row Filters

Every resolver must filter all of the following before returning a permission:

- Tenant context matches the authenticated session tenant.
- Tenant user belongs to the tenant and is in an allowed account lifecycle state.
- Permission definition exists and `is_active = true`.
- Role exists, belongs to the tenant, and `is_active = true`.
- Assignment row is not revoked: `revoked_at IS NULL`.
- Role permission row is not revoked: `revoked_at IS NULL`.
- Outlet-scoped grant belongs to an active, non-deleted outlet when an outlet context is required.
- Feature entitlement exists and is enabled for plan-controlled features.

## Current Implementation Gaps

| Gap | Current State | Required Fix |
|---|---|---|
| Revoked tenant direct grants | Auth/context resolvers do not consistently filter `tenant_user_permissions.revoked_at`. | Filter revoked direct grants everywhere effective permissions are calculated. |
| Revoked tenant role assignments | Auth/context resolvers do not consistently filter `tenant_user_roles.revoked_at`. | Filter revoked user-role assignments. |
| Revoked tenant role permissions | Auth/context resolvers do not consistently filter `tenant_role_permissions.revoked_at`. | Filter revoked role-permission grants. |
| Outlet scoped effective permissions | Auth/context resolvers do not include `outlet_user_roles` and `outlet_user_permissions` in the session permission set. | Include outlet scoped grants when the runtime context requires outlet permissions, or document a separate outlet-check API if tokens remain tenant-wide only. |
| Tenant role management API | Flutter expects tenant role and permission catalog endpoints; backend controllers were not found. | Implement tenant role CRUD, assignment, permission catalog, and role permission mutation endpoints. |
| Explicit deny | No deny table/column/precedence model found. | Do not document deny semantics as implemented. Treat deny as `OPEN_DECISION`. |
| Last admin protection | No verified tenant role mutation guard preventing removal of final admin-level access. | Add guard before destructive role/permission changes. |
| Audit persistence for role changes | `audit_logs` exists, but tenant role mutation endpoints/services were not verified. | Persist audit events for role create/update/disable/permission/user assignment changes. |
| Concurrency and idempotency | No verified role mutation idempotency/concurrency contract found. | Define optimistic concurrency/idempotency before enabling retryable mutations. |

## Role Combination Semantics

Multiple roles are allowed. Effective access is the union of all active role-derived grants plus active direct grants.

There is no priority ordering in Release 1 because there is no explicit deny. If deny is introduced later, a new ADR must define precedence before implementation.

## Direct Permission Semantics

Direct permissions are additive exceptions. They can grant a permission without changing the user's role. They do not revoke or deny role-derived permissions in Release 1.

## Outlet Scope Semantics

Tenant-wide grants apply across the tenant subject to feature entitlement and permission checks. Outlet-scoped grants apply only within the relevant outlet context.

When a user has both tenant-wide and outlet-scoped grants, backend authorization must evaluate the requested resource context. For outlet-owned resources, the resolver must either:

1. verify tenant-wide permission is enough for the action, or
2. require a matching outlet grant for the target outlet.

The exact per-action outlet requirement must be defined by each module authorization rule.

## Role Template Snapshot Semantics

Tenant roles can reference `source_role_template_id` and `source_role_template_version_id`. The canonical behaviour is snapshot-based:

- Creating a tenant role from a template copies the selected template version permissions into tenant role permissions.
- Later template edits must not silently change existing tenant roles.
- A future "sync from template" feature requires explicit user action, preview, audit log, and rollback strategy.

The database supports template versions, but the tenant admin role setup API flow remains a missing implementation item.

## Entitlement Filtering

Feature entitlement is required before tenant staff permission for plan-controlled capabilities. Permission catalog APIs must only expose modules/features/actions that are available for the tenant's subscription unless an admin-only diagnostic view explicitly marks unavailable items.

## Canonical Tenant Admin Role Setup Flow

The approved Role & Permission setup flow is five steps:

| Step | Name | Purpose |
|---:|---|---|
| 1 | Role Details & Template | Choose role name, description, lifecycle draft/active intent, and optional role template. |
| 2 | Select Modules | Select entitled modules the role can access. |
| 3 | Configure Permissions | Configure module actions from the backend permission catalog. |
| 4 | Assign Users & Access Scope | Assign users and tenant/outlet access scope. |
| 5 | Review & Create | Review all selections, then create/save the role. |

Confirmation is an outcome of Step 5, not a sixth wizard step.

## Required Tenant Admin API Contract

The following endpoints are canonical target contracts and must not be treated as implemented until backend controllers and tests exist.

| Endpoint | Status | Notes |
|---|---|---|
| `GET /api/v1/tenant-admin/permission-catalog` | MISSING | Required by Flutter role permission datasource. |
| `GET /api/v1/tenant-admin/roles` | MISSING | Required for paged role list. |
| `POST /api/v1/tenant-admin/roles` | MISSING | Required for five-step role creation. |
| `GET /api/v1/tenant-admin/roles/{roleId}` | MISSING | Required for detail/edit. |
| `PUT /api/v1/tenant-admin/roles/{roleId}` | MISSING | Required for metadata/status update. |
| `GET /api/v1/tenant-admin/roles/{roleId}/permissions` | MISSING | Required for permission matrix. |
| `PUT /api/v1/tenant-admin/roles/{roleId}/permissions` | MISSING | Required for permission replacement/update. |
| `GET /api/v1/tenant-admin/roles/{roleId}/users` | MISSING | Required for assigned user summary. |
| `PUT /api/v1/tenant-admin/roles/{roleId}/users` | MISSING | Required for assignment changes. |
| `POST /api/v1/tenant-admin/roles/{roleId}/activate` | MISSING | Required lifecycle command. |
| `POST /api/v1/tenant-admin/roles/{roleId}/disable` | MISSING | Disable must not delete role data. |

## Security and Audit Requirements

- Backend remains final authority; Flutter permission visibility is UX only.
- Unauthorized values must not be leaked through response payloads, tooltips, semantics, logs, or debug UI.
- Every role create/update/disable, permission replacement, user assignment, template application, and scope change must write to `audit_logs`.
- Audit events must include tenant ID, actor tenant user ID, target role/user/scope IDs, action, result, correlation/request ID, timestamp, and safe metadata.
- Sensitive authorization failures must return friendly problem details without SQL, stack traces, or internal resolver state.

## Non-Functional Requirements

- Resolver should be cacheable per tenant/user/session/context.
- Cache invalidation is required after role, permission, entitlement, user-role, direct-permission, and outlet assignment changes.
- Effective permission calculation should avoid N+1 queries.
- Permission catalog and role mutation APIs must be tenant-isolated and concurrency-safe.

## Readiness Verdict

`PRODUCT DECISION RESOLVED - IMPLEMENTATION GAPS OPEN`

The data model is capable of the target RBAC model, but backend tenant role management endpoints and the runtime resolver hardening are not yet complete.

## Product Wizard permission aliasing (LOCKED 2026-08-24)

Effective-permission resolution MAY one-way map `tenant.products.view|create|update|delete` → `catalog.products.*` so historical grants satisfy the canonical check.

Backend TARGET authorization for Product Setup evaluates **only** `catalog.products.*`. Do not keep two first-class authorities (`catalog` OR `tenant`) on the same decision.

Tax lookup MAY one-way map `tax.classes.view` / `tax.rates.view` → `pricing.tax_classes.view` / `pricing.tax_rates.view`.

See [[Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].
