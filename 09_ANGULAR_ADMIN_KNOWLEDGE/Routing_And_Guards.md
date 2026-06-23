<!-- title: Routing And Guards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Routing And Guards

## Purpose

This file defines routing and guard rules for the Angular Platform Admin Web
Portal.

Routes improve UX but backend remains authoritative.

## Route Groups

| Route | Feature | Mode | Guards |
|---|---|---|---|
| `/login` | auth | Public | Guest only |
| `/admin/dashboard` | admin | Platform | auth, permission |
| `/admin/tenants` | admin | Platform | auth, permission |
| `/admin/tenants/create` | admin | Platform | auth, permission |
| `/admin/subscriptions` | admin | Platform | auth, permission |
| `/admin/modules` | admin | Platform | auth, permission |
| `/admin/platform-users` | admin | Platform | auth, permission |
| `/admin/roles-permissions` | admin | Platform | auth, permission (`platform.permissions.view`) |
| `/admin/settings/system` | admin | Platform | auth, permission |
| `/admin/tenant/:tenantId/outlets` | admin | Tenant | auth, tenant-context, permission |
| `/admin/tenant/:tenantId/tills` | admin | Tenant | auth, tenant-context, permission |
| `/admin/tenant/:tenantId/users` | admin | Tenant | auth, tenant-context, permission |
| `/admin/tenant/:tenantId/roles-permissions` | admin | Tenant | auth, tenant-context, permission |
| `/admin/tenant/:tenantId/products` | products | Tenant | auth, tenant-context, permission, feature |
| `/admin/tenant/:tenantId/categories` | categories | Tenant | auth, tenant-context, permission, feature |
| `/admin/tenant/:tenantId/reports` | reports | Tenant | auth, tenant-context, permission, feature |

## Required Guards

| Guard | Purpose |
|---|---|
| `auth.guard` | Blocks unauthenticated routes |
| `permission.guard` | Blocks missing permission |
| `feature-entitlement.guard` | Blocks disabled tenant feature |
| `tenant-context.guard` | Blocks tenant-scoped route without selected tenant |
| Guest guard | Redirects authenticated users away from login |

## Guard Flow

```mermaid
flowchart TD
    A[Navigation Request] --> B[Auth Guard]
    B --> C[Tenant Context Guard if needed]
    C --> D[Permission Guard]
    D --> E[Feature Entitlement Guard if needed]
    E --> F[Load Route]
```

## Tenant Route Rule

Tenant-scoped route must not load if tenant context is missing, stale, or
different from selected tenant.

Tenant switch must clear stale state and rebuild menu/route access.

## Permission Denied Rule

If a route is blocked by permission, show permission-denied screen.

Do not redirect to login for authenticated users lacking permission.

## Feature Disabled Rule

If a route is blocked by feature entitlement, show feature-not-enabled state.

Do not expose disabled feature pages as active Release 1 behavior.

Platform Admin Roles & Permissions at `/admin/roles-permissions` loads the backend-driven permission catalog and platform role APIs. The current route guard remains `platform.permissions.view`; role-management API calls are additionally authorized by backend permissions such as `platform.roles.view`, `platform.roles.create`, `platform.roles.update`, `platform.roles.permissions.view`, and `platform.roles.permissions.update`. See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]].

## Related Files

- [[Permission_Based_Menu]]
- [[Angular_App_Architecture]]
- [[../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../07_UI_UX_KNOWLEDGE/Permission_Based_UI_Rules]]

## Platform Role Management UI 2026-06-23

Angular Platform Admin Roles & Permissions is implemented at `/admin/roles-permissions`.

Rules:

- Keep the route guarded by the current Platform Admin permission convention (`platform.permissions.view` in the route metadata).
- Load roles from `GET /api/v1/platform-admin/roles`.
- Load role detail from `GET /api/v1/platform-admin/roles/{roleId}`.
- Load assignments from `GET /api/v1/platform-admin/roles/{roleId}/permissions`.
- Save role metadata and full permission replacement through the matching PUT endpoints.
- Keep summary and change-impact information inside the editor summary strip and Preview Impact modal, not a permanent right-side panel.
- Do not mock roles, permission rows, counts, summaries, or assigned permission data in Angular.
- Respect backend system-role protection by keeping system role editing read-only in the UI.
