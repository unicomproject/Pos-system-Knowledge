<!-- title: Tenant Lifecycle Status Alignment Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-27 -->

# Tenant Lifecycle Status Alignment Implementation Status

## Summary

| Item | Value |
|---|---|
| Feature | Tenant Lifecycle Status Alignment |
| Module | Platform Administration / Tenant |
| Platform | Backend + Angular + Second Brain |
| Business decision status | **APPROVED** |
| Code implementation status | **NOT IMPLEMENTED** |
| Data migration status | **NOT IMPLEMENTED** |
| API compatibility transition status | **NOT IMPLEMENTED** |
| Frontend badge/filter alignment status | **NOT IMPLEMENTED** |

## Approved lifecycle model

`tenants.status` stores lifecycle only:

- `DRAFT`
- `PENDING_PAYMENT`
- `PENDING_ACTIVATION`
- `ACTIVE`
- `SUSPENDED`
- `CANCELLED`

The following are separate concerns and must never be written into `tenants.status`:

- billing cycle
- subscription type
- subscription status
- payment status

## Approved orchestration rules

### Paid

- create -> `PENDING_PAYMENT`
- payment verification recorded **or** approved payment waiver recorded
- lifecycle -> `PENDING_ACTIVATION`
- manual Release 1 activation
- lifecycle -> `ACTIVE`

Approved business rule: verified payment **or** approved payment waiver may satisfy the paid activation prerequisite.

Current implementation status:

- payment waiver persistence is **NOT IMPLEMENTED**
- payment waiver API/UI is **NOT IMPLEMENTED**
- implementation must **not** accept an unpersisted request flag or arbitrary boolean as a payment waiver

### Trial / Demo

- create tenant record
- record `TENANT_CREATED`
- automatically activate
- record `TENANT_ACTIVATED`
- final lifecycle -> `ACTIVE`

Created and activated remain separate domain/audit events even when one orchestration performs both.

## DATA MIGRATION RULES

These mappings apply only to `RepairTenantLifecycleStatusData`. They are **not** approved future workflow states.

- valid lifecycle values remain unchanged
- `pending` / `unpaid` / `overdue` / `failed` -> `PENDING_PAYMENT`
- `paid` / `verified` / `waived` and not activated -> `PENDING_ACTIVATION`
- `setup_pending` -> `ACTIVE` (`setup_pending` is **not** an approved lifecycle value)
- `inactive` with previous activation evidence -> `SUSPENDED` (`inactive` is **not** an approved lifecycle value)
- `inactive` without previous activation evidence -> `DRAFT`
- explicit `cancelled` -> `CANCELLED`
- explicit `suspended` -> `SUSPENDED`

Authoritative activation evidence such as `activated_at` or `is_active` takes priority over billing labels, except explicit suspended/cancelled state.

Unknown values must fail safely or be reported for manual correction. They must not be silently defaulted.

## Ordered migrations

1. `RepairTenantLifecycleStatusData`
2. `AddTenantLifecycleStatusCheckConstraint`

The data repair migration must run before the lifecycle CHECK constraint.

## API compatibility transition

- canonical lifecycle response field: `lifecycleStatus`
- billing concern field: `billingStatus`
- temporary lifecycle compatibility aliases, if retained, must be marked **deprecated**
- Angular must migrate to `lifecycleStatus`
- remove deprecated lifecycle alias in a later cleanup release

## Scope decision

Included in this alignment feature:

- lifecycle constant / value support
- persistence support
- data cleanup migration
- CHECK constraint support
- serialization support
- UI badge / filter support

Deferred from this alignment feature:

- new cancel endpoint
- email implementation
- payment-link implementation

## Implementation status

| Topic | Status |
|---|---|
| APPROVED: lifecycle model and mappings | **APPROVED** |
| Backend lifecycle correction | **NOT IMPLEMENTED** |
| Data cleanup migration | **NOT IMPLEMENTED** |
| `tenants.status` CHECK constraint | **NOT IMPLEMENTED** |
| `lifecycleStatus` API transition | **NOT IMPLEMENTED** |
| Frontend badge/filter alignment | **NOT IMPLEMENTED** |

## Evidence

- Audit report: `Unified-Commerce-tenant-lifecycle/projects/12_IMPLEMENTATION_TRACKING/Backend/TenantLifecycle/Tenant_Lifecycle_Status_Alignment_Audit.md`
- Create wizard: [[../../../03_USER_JOURNEYS/Platform_Admin/04_Create_Tenant_Wizard_Flow]]
- Activation: [[../../../03_USER_JOURNEYS/Platform_Admin/11_Tenant_Activation_Flow]]
- Onboarding emails: [[../../../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- Tenant foundation DB: [[../../../06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation_UPDATED]]
- API contract: [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
