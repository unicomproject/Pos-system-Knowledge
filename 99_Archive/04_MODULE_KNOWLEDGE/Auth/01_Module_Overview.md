<!-- title: Auth Module Overview -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Auth Module Overview

## Purpose

Authenticate Platform Admin and tenant users; manage setup/password, sessions, refresh tokens and logout.

This file gives frontend and backend developers a shared Release 1 understanding
of the `Auth` module.

## Release 1 Position

| Item | Decision |
|---|---|
| Module | `Auth` |
| Primary users | Platform Admin, Tenant Admin, Cashier, Manager |
| Frontend surfaces | Platform Admin Web login; Flutter POS login and setup. |
| Backend API group | `/api/v1/auth` |

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

- `platform_users`
- `users`
- `auth_sessions`
- `refresh_tokens`
- `user_setup_tokens`
- `user_invites`
- `password_reset_tokens`

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

Platform and tenant identity stay separate; secrets/tokens are hash-only; logout revokes session.

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

No customer account login; no offline login bypass.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Auth/02_Functional_Rules]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Auth/03_Technical_Contract]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
