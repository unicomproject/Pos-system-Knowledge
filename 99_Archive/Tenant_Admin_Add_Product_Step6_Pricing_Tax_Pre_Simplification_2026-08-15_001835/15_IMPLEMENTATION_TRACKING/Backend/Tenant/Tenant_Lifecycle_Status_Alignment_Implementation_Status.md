<!-- title: Tenant Lifecycle Status Alignment Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-28 -->

# Tenant Lifecycle Status Alignment Implementation Status

## Summary

| Item | Value |
|---|---|
| Feature | Tenant Lifecycle Status Alignment |
| Module | Platform Administration / Tenant |
| Platform | Backend + Angular + Second Brain |
| Business decision status | **APPROVED** |
| Code implementation status | **IMPLEMENTED** |
| Data migration status | **IMPLEMENTED** |
| API compatibility transition status | **IMPLEMENTED** (temporary aliases **DEPRECATED**) |
| Frontend badge/filter alignment status | **IMPLEMENTED** |
| Post-merge smoke verification | **PASSED** (Local Development, 2026-07-28) |

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

- Mark Paid payment verification path: **IMPLEMENTED**
- payment waiver persistence is **NOT IMPLEMENTED** (deferred)
- payment waiver API/UI is **NOT IMPLEMENTED** (deferred)
- implementation must **not** accept an unpersisted request flag or arbitrary boolean as a payment waiver

### Trial / Demo

- create tenant record
- record `TENANT_CREATED`
- automatically activate
- record `TENANT_ACTIVATED`
- final lifecycle -> `ACTIVE`

Created and activated remain separate domain/audit events even when one orchestration performs both.

Current implementation status: Trial/Demo auto-activation to `ACTIVE` is **IMPLEMENTED**. Onboarding emails remain **NOT IMPLEMENTED**.

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

1. `20260727150000_RepairTenantLifecycleStatusData`
2. `20260727151000_AddTenantLifecycleStatusCheckConstraint`

The data repair migration must run before the lifecycle CHECK constraint.

Related prerequisite for local return-inspection BackgroundService stability:

- `20260716190000_AddReturnInspectionDraftsAndMediaFinalization`

## API compatibility transition

- canonical lifecycle response field: `lifecycleStatus`
- billing concern field: `billingStatus`
- temporary lifecycle compatibility aliases, if retained, must be marked **deprecated**
- Angular consumes `lifecycleStatus` (with temporary deprecated fallbacks)
- remove deprecated lifecycle alias in a later cleanup release

## Scope decision

Included in this alignment feature:

- lifecycle constant / value support
- persistence support
- data cleanup migration
- CHECK constraint support
- serialization support
- UI badge / filter support
- explicit `PAID` / `TRIAL` / `DEMO` create-mode `subscriptionType`
- Pending Activation KPI and dashboard attention type `pending_activation`
- billing-cycle `monthly` / `yearly` / omit-all mapping

Deferred from this alignment feature:

- new cancel endpoint
- email implementation
- payment-link implementation
- payment-waiver persistence / API / UI
- email outbox / retry
- removal of deprecated compatibility aliases
- removal of legacy minimal create endpoint
- full Tenant Admin invitation / set-password flow

## Implementation status

| Topic | Status |
|---|---|
| APPROVED: lifecycle model and mappings | **APPROVED** |
| Backend lifecycle correction | **IMPLEMENTED** |
| Billing-to-lifecycle create defect | **FIXED** |
| Explicit `subscriptionType` create contract (`PAID` / `TRIAL` / `DEMO`) | **IMPLEMENTED** |
| Paid create → `PENDING_PAYMENT` | **IMPLEMENTED** |
| Mark Paid → `PENDING_ACTIVATION` | **IMPLEMENTED** |
| Verified-payment activation gate | **IMPLEMENTED** |
| Manual paid activation → `ACTIVE` | **IMPLEMENTED** |
| Trial auto-activation | **IMPLEMENTED** |
| Demo auto-activation | **IMPLEMENTED** |
| `lifecycleStatus` API field | **IMPLEMENTED** |
| Temporary compatibility fields | **IMPLEMENTED** / **DEPRECATED** |
| Legacy lifecycle data repair migration | **IMPLEMENTED** |
| Tenant status CHECK constraint | **IMPLEMENTED** |
| Angular subscription-type selector | **IMPLEMENTED** |
| Angular lifecycle badges and filters | **IMPLEMENTED** |
| Pending Activation KPI (`pendingActivationTenants`) | **IMPLEMENTED** |
| Dashboard attention type `pending_activation` | **IMPLEMENTED** |
| Billing-cycle monthly/yearly/omit-all mapping | **IMPLEMENTED** |
| Backend/Frontend post-merge smoke test | **PASSED** |
| Payment waiver persistence/API/UI | **NOT IMPLEMENTED** (deferred) |
| Onboarding emails / payment links / outbox | **NOT IMPLEMENTED** (deferred) |
| Cancel endpoint | **NOT IMPLEMENTED** (deferred) |

## Merged evidence (Local Development verification, 2026-07-28)

### Backend (`Unified-Commerce`)

- Remote: `https://github.com/unicomproject/Unified-Commerce.git`
- Merged via PR #60 into `origin/main`
- Verified tip: `4be3b8e` (merge commit)
- Contained commits: `c093bf2`, `7b976ae`, `bc1de4f`
- Dashboard attention type on merged main: `pending_activation` (not `setup_pending`)

### Frontend (`Nytroz-POS-Platform_Admin`)

- Remote: `https://github.com/unicomproject/Nytroz-POS-Platform_Admin.git`
- Merged via PR #34 into `origin/main`
- Verified tip: `5014e91` (merge commit)
- Contained commits: `8854f82`, `5d1cbc3`

### Migrations applied (Local Development DB `UnifiedCommerceDb` / schema `public`)

- `20260716190000_AddReturnInspectionDraftsAndMediaFinalization`
- `20260727150000_RepairTenantLifecycleStatusData`
- `20260727151000_AddTenantLifecycleStatusCheckConstraint`
- `return_inspection_drafts` exists
- `ck_tenants_status` exists
- invalid lifecycle status count: `0`

### Automated tests (smoke worktrees from latest `origin/main`)

- Backend build: succeeded (0 warnings / 0 errors)
- Backend unit (lifecycle-related filter): **297** passed
- Backend integration (lifecycle-related filter): **179** passed
- Backend API tests (PlatformAdmin/Tenant filter): **210** passed
- Frontend `ng build`: succeeded
- Frontend `ng test --watch=false`: **54** files / **416** tests passed

### Sanitized smoke evidence

- Paid create HTTP **201**, `subscriptionType=PAID`, `billingCycle=monthly`, `lifecycleStatus=pending_payment` (tenant id prefix `61e35799`)
- Mark Paid → invoice `PAID` with `paidAt` set → `lifecycleStatus=pending_activation`
- Dashboard attention type `pending_activation`; link `status=pending_activation`
- Activate → `active`; re-activate HTTP **409**
- Trial create HTTP **201**, `subscriptionType=TRIAL`, `billingCycle=yearly`, `lifecycleStatus=active`
- Demo create HTTP **201**, `subscriptionType=DEMO`, `billingCycle=monthly` (not `demo`), `lifecycleStatus=active`

Full record: [[Tenant_Lifecycle_Post_Merge_Smoke_Verification]]

## Evidence

- Post-merge smoke verification: [[Tenant_Lifecycle_Post_Merge_Smoke_Verification]]
- Create wizard: [[../../../03_USER_JOURNEYS/Platform_Admin/04_Create_Tenant_Wizard_Flow]]
- Activation: [[../../../03_USER_JOURNEYS/Platform_Admin/11_Tenant_Activation_Flow]]
- Onboarding emails: [[../../../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- Tenant foundation DB: [[../../../06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation_UPDATED]]
- API contract: [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
