<!-- title: Tenant Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Management Flow

## Purpose

Defines how Platform Admin searches, reviews, and manages tenant accounts.

## Actor

Platform Admin

## Source

Derived from `Slide 3 - Tenant Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens Tenant Management from dashboard or menu.

## Preconditions

- Platform Admin is authenticated.
- Tenant management permission is granted.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant management | System opens tenant management module. |
| 2 | Load tenant list | System loads tenants with summary information. |
| 3 | Search or filter tenants | Platform Admin narrows tenants by status, trial, demo, suspended, or payment state. |
| 4 | Review tenant row summary | System shows tenant name, contact, plan, status, outlet count, till count, and online store/e-commerce status. |
| 5 | Open tenant detail | Platform Admin selects a tenant record. |
| 6 | Take action | Platform Admin may view, edit, activate/suspend, send payment link, view billing, or view enabled features. |
| 7 | Save or update status | System persists changes and refreshes tenant list. |

## Data Used Or Captured

- Tenant name
- Contact details
- Plan
- Tenant status
- Outlet count
- Till count
- Online store status
- Payment state

## Access And Security Rules

- Platform Admin must be authenticated.
- Platform Admin role/permission must allow the requested action.
- Platform-level actions must not use frontend-provided tenant_id as trusted authority.
- Every create/update/status action must be audit logged.
- Tenant status changes require explicit permission.
- Suspension/reactivation must be audited.

## Validation And Error Cases

- Tenant not found
- Permission denied
- Invalid status transition
- Concurrent tenant update conflict

## Outcome

Platform Admin has central control over tenant records.

## Related Modules

- 01_Platform_Administration
- 02_Tenant_Foundation
- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation.md
- 02_ACCESS_CONTROL/API_Authorization_Rules.md
