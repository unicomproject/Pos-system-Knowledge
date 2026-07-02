<!-- title: Outlet Module Overview -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Outlet Module Overview

## Purpose

Manage tenant outlets used for POS, inventory and reports.

This file gives frontend and backend developers a shared Release 1 understanding
of the `Outlet` module.

## Release 1 Position

| Item | Decision |
|---|---|
| Module | `Outlet` |
| Primary users | Platform Admin, Tenant Admin, Cashier |
| Frontend surfaces | Platform Admin setup; Tenant Admin outlet management; POS outlet context. |
| Backend API group | `/api/v1/outlets` |

## Frontend Responsibilities

- Show only permitted screens, routes, tabs, buttons, and actions.
- Use feature entitlement and permission context.
- Use reusable UI components.
- Keep tenant-scoped state isolated.
- Clear stale tenant state when tenant changes.
- Display loading, empty, error, permission-denied, and feature-not-enabled states.
- Use typed API services and feature-level state.

## Backend Responsibilities

- Resolve tenant context server-side for tenant-owned actions.
- Enforce authentication, entitlement, permission, and business rules.
- Validate database constraints before mutation.
- Return safe error responses.
- Write audit logs for sensitive actions where required.
- Keep domain logic outside controllers.

## Main Database Tables

- `outlets`
- `outlet_addresses`
- `outlet_user_roles`
- `tenant_settings`
- `audit_logs`

## High-Level Flow

```mermaid
flowchart TD
    A[Open module screen or route] --> B[Check auth and access]
    B --> C[Load module data]
    C --> D[User performs allowed action]
    D --> E[Backend validates and persists]
    E --> F[UI refreshes state]
```

## Core Rule

Outlet code is tenant-unique; inactive outlet cannot operate POS; outlet access is enforced.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected actions |
| Tenant status | Required for tenant-owned operations |
| Feature entitlement | Required where module is feature-controlled |
| Permission | Required for protected actions |
| Tenant isolation | Required for tenant-owned data |
| Audit | Required for sensitive state changes |

## Dependencies

This module may depend on Auth, Tenant, Feature Entitlement, Role Permission,
and tenant context handling.

## Out of Scope

No stock transfer or delivery workflow.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Outlet/02_Functional_Rules]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Outlet/03_Technical_Contract]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
