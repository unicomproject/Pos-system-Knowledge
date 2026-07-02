<!-- title: Tenant Module Overview -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Tenant Module Overview

## Purpose

Manage tenant foundation, profile, address, status and setup state.

This file gives frontend and backend developers a shared Release 1 understanding
of the `Tenant` module.

## Release 1 Position

| Item | Decision |
|---|---|
| Module | `Tenant` |
| Primary users | Platform Admin, Tenant Admin |
| Frontend surfaces | Platform Admin tenant wizard/detail; Tenant Admin setup context. |
| Backend API group | `/api/v1/tenants, /api/v1/platform` |

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

- `tenants`
- `tenant_profiles`
- `tenant_addresses`
- `tenant_domains`
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

Tenant is the root of tenant-owned data; status controls operation; status changes are audited.

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

No active storefront or delivery setup.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Tenant/02_Functional_Rules]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Tenant/03_Technical_Contract]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
