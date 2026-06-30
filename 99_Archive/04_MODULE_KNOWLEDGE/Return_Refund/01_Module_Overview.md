<!-- title: Return_Refund Module Overview -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Return_Refund Module Overview

## Purpose

Manage POS returns, return lines, refunds, allocations and customer credit issue.

This file gives frontend and backend developers a shared Release 1 understanding
of the `Return_Refund` module.

## Release 1 Position

| Item | Decision |
|---|---|
| Module | `Return_Refund` |
| Primary users | Cashier, Manager |
| Frontend surfaces | Cashier return/refund screen; Manager approval; reports. |
| Backend API group | `/api/v1/pos/returns, /api/v1/pos/refunds` |

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

- `return_reason_codes`
- `returns`
- `return_lines`
- `refunds`
- `return_refund_allocations`
- `customer_credits`
- `customer_credit_transactions`
- `sales`
- `sale_lines`

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

Return references original sale; returned qty/refund amount cannot exceed allowed value; credit is separate.

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

No supplier or online return flow.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Return_Refund/02_Functional_Rules]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Return_Refund/03_Technical_Contract]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
