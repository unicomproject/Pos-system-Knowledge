<!-- title: Subscription Module Overview -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Subscription Module Overview

## Purpose

Manage plans, subscriptions, invoice/payment-link state and billing lifecycle.

This file gives frontend and backend developers a shared Release 1 understanding
of the `Subscription` module.

## Release 1 Position

| Item | Decision |
|---|---|
| Module | `Subscription` |
| Primary users | Platform Admin, Tenant Admin |
| Frontend surfaces | Platform Admin subscription screens; Tenant Admin billing summary. |
| Backend API group | `/api/v1/subscriptions` |

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

- `subscription_plans`
- `subscription_plan_features`
- `tenant_subscriptions`
- `tenant_subscription_history`
- `subscription_invoices`
- `subscription_invoice_lines`
- `subscription_payment_links`
- `subscription_payment_transactions`

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

Payment links are hash-token based; trial/demo comes from plan; payment status changes are audited.

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

No full accounting; no direct gateway UI in Angular.

## Related Files

- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[../../01_RELEASE_SCOPE/Release_1_Scope]]
- [[../../02_ACCESS_CONTROL/Access_Control_Overview]]
