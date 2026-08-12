<!-- title: Selected Tenant Mode Contract -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->
<!-- decision_date: 2026-08-12 -->

# Selected Tenant Mode Contract

## Authority

This document is the canonical contract for **Selected-Tenant Mode** in the OneVerz Super Admin (Platform Admin) application.

It supersedes ambiguous references in deck-derived flows `05`–`09` where those flows conflict on scope, ownership, or mandatory behavior.

Companion documents:

- [[ONEVERZ_SUPER_ADMIN_TENANT_CREATION_OPERATING_MODEL_CANONICAL]]
- [[Selected_Tenant_Atomic_Journey_Register]]
- [[Selected_Tenant_Collection_Point_Contract]]
- [[Selected_Tenant_Product_Bootstrap_Contract]]
- [[Selected_Tenant_Product_Import_Contract]]
- [[Selected_Tenant_Setup_Hub_Status_Model]]
- [[ST-UX-001_Selected_Tenant_Context_Requirement]]
- [[Selected_Tenant_Journey_Readiness_Matrix]]
- [[../../07_UI_UX_KNOWLEDGE/Platform_Admin/Selected_Tenant_Visual_Direction]]
- [[../../05_BACKEND_ARCHITECTURE/Platform_Selected_Tenant_API_Contract]]
- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../../10_TESTING_QA/Selected_Tenant_Mode_Test_Contract]]

## Purpose

Define how a Platform User operates **inside a selected tenant's scope** while retaining **Platform Admin identity** for the purpose of **initial assisted / bootstrap tenant configuration**.

Selected-Tenant Mode is a **required Super Admin platform capability**. It is **not** Tenant Admin impersonation and **not** a substitute for Tenant Admin ongoing operational management.

## Scope

### In scope

- Entering, maintaining, switching, and exiting selected-tenant context
- Selected-Tenant Setup Hub and bootstrap screens for:
  - Outlet / collection-point initial setup
  - Till initial setup
  - Additional tenant role setup
  - Additional tenant user setup
  - Initial product onboarding (manual and CSV)
- Permission, entitlement, audit, and security rules for the above
- UX requirement: persistent selected-tenant context visibility

### Out of scope

- Platform commercial lifecycle (create tenant, billing, activation) — **Platform Mode**
- Ongoing tenant CRUD, inventory, device maintenance, advanced monitoring — **Tenant Admin Mode**
- E-commerce / online store bootstrap — **OUT OF SCOPE** for Selected-Tenant Phase 1; Tenant Admin owns storefront configuration
- Device assignment, hardware profiles, POS session operations
- Full Tenant Admin product lifecycle (draft/publish wizard parity)

## Three Operating Modes

| Mode | Actor identity | Primary surface | Purpose |
|---|---|---|---|
| **Platform Mode** | Platform User | `/admin/dashboard`, `/admin/tenants`, billing, plans, platform users | Commercial tenant lifecycle, activation, invitation |
| **Selected-Tenant Mode** | Platform User (unchanged) | `/admin/tenants/:tenantId/configure/*` | Optional/conditional assisted operational bootstrap for one explicit tenant |
| **Tenant Admin Mode** | Tenant User | Tenant Admin shell / Flutter Tenant Admin | Post-handoff ongoing tenant operational management |

### Platform Mode responsibilities

- Tenant creation wizard and draft resume
- Subscription plan and entitlement assignment
- Billing review and payment confirmation
- Tenant activation and suspension
- Tenant Admin invitation and resend
- Platform audit visibility for commercial events

### Selected-Tenant Mode responsibilities

- Assisted initial outlet, till, role, user, and product bootstrap
- Read-only setup hub status derived from tenant footprint where available
- Platform-attributed mutations only for approved bootstrap journeys

### Tenant Admin Mode responsibilities

- All ongoing outlet/till/device/user/role/product/inventory/storefront operations after handoff
- Day-to-day business configuration and monitoring

## Actor

- **Actor:** Platform User (Super Admin or delegated platform role)
- **Identity rule:** Platform Admin identity **MUST** remain Platform Admin at all times
- **Forbidden:** impersonating Tenant Admin, issuing tenant-user session tokens, or reusing tenant login surfaces

## Entry

### Approved entry path

```text
Platform Admin
→ Tenant Management (/admin/tenants)
→ Tenant Detail (/admin/tenants/:tenantId)
→ Configure Tenant (primary CTA)
→ Selected-Tenant Setup Hub (/admin/tenants/:tenantId/configure)
```

### Entry preconditions

- Platform User authenticated with active platform session
- `platform.tenants.view`
- `platform.tenants.bootstrap.access`
- Target tenant exists and is visible to caller
- Tenant lifecycle allows bootstrap read at minimum (`DRAFT` through `ACTIVE`; see suspended behavior)

### Entry side effects

- Selected tenant ID stored in client session state
- Tenant-scoped cache cleared from any prior tenant
- Tenant context banner displayed
- Bootstrap menu/hub rendered according to permissions and entitlements

## Exit

### Approved exit actions

| Action | Destination | Result |
|---|---|---|
| **Exit Tenant Context** | Tenant Detail or Tenant List | Clears selected-tenant context and tenant-scoped client cache |
| Browser back from hub child screen | Setup Hub | Retains selected-tenant context |
| Navigate to Platform Mode route | Platform destination | Clears selected-tenant context |

### Exit preconditions

- None beyond authenticated platform session

## Tenant switch

- Switching tenant **within** Selected-Tenant Mode requires explicit tenant picker or navigation via Tenant Detail → Configure Tenant for another tenant
- On switch:
  - Clear all tenant-scoped client caches
  - Revalidate permissions and entitlements for new tenant
  - Rebuild hub module cards
  - Update context banner immediately

## Selected tenant context

### Mandatory UX requirement (ST-UX-001)

Every Selected-Tenant screen **must** visibly expose:

- Tenant name
- Tenant code (where space allows)
- Tenant lifecycle status
- Plan name or subscription summary when available
- Explicit **Exit Tenant Context** action

This is a **persistent UX/security requirement**, not a separate atomic user journey.

### Session state

| State key | Rule |
|---|---|
| `selectedTenantId` | Required for all tenant-scoped bootstrap routes |
| `selectedTenantSnapshot` | Name, code, status, plan summary for banner rendering |
| `selectedTenantContextEnteredAt` | Optional telemetry only; not a business lifecycle field |

**PRODUCT DECISION:** durable server-side "setup session" is **not required** for Release 1 unless later approved.

## Identity preservation

- API calls use platform auth token
- Backend resolves actor as `platform_user_id`
- Backend resolves target tenant from route/body validation, never trusting client-only tenant selection
- Audit events record both platform actor and selected tenant

## Permissions

Minimum permission families:

| Permission | Purpose |
|---|---|
| `platform.tenants.view` | Tenant list/detail and context read |
| `platform.tenants.bootstrap.access` | Enter Selected-Tenant Mode and view Setup Hub |
| `platform.tenants.bootstrap.outlets.manage` | Create bootstrap outlet |
| `platform.tenants.bootstrap.tills.manage` | Create bootstrap till |
| `platform.tenants.bootstrap.roles.manage` | Create bootstrap tenant role |
| `platform.tenants.bootstrap.users.manage` | Add additional tenant user |
| `platform.tenants.bootstrap.products.manage` | Manual bootstrap product onboarding |
| `platform.tenants.bootstrap.products.import` | CSV bootstrap product import |

See [[../../02_ACCESS_CONTROL/Permission_Code_List]] for canonical definitions.

## Feature entitlements

Bootstrap modules must respect tenant effective entitlements and plan limits:

| Module | Typical entitlement key | Notes |
|---|---|---|
| Outlet setup | `tenant_admin.outlets` / outlet management capability | Required for POS bootstrap |
| Till setup | `tenant_admin.tills` or POS till capability | Requires at least one outlet |
| Roles | permission catalog available for tenant | Bootstrap TA role already provisioned at create |
| Additional users | user limit from plan | Distinct from wizard Tenant Admin |
| Products | product/catalog entitlement | Manual and import may share manage permission with separate import permission |
| Collection point | `click_collect` | **Not in SA bootstrap** — Tenant Admin configures via `fulfillment_method_outlets` |

Entitlement-disabled modules render **NOT ENTITLED** on the hub and block navigation with feature-not-enabled state.

## Suspended / inactive behavior

| Tenant status | Hub access | Bootstrap mutations |
|---|---|---|
| `DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION` | Allowed if platform permissions allow | Allowed for assisted pre-go-live bootstrap |
| `ACTIVE` | Allowed | Allowed |
| `SUSPENDED` | Read-only hub; context banner shows suspended state | **Blocked** — show Tenant Suspended state |
| `CANCELLED` | Blocked at Tenant Detail | No entry |

## Cross-tenant protection

- Every bootstrap API validates `tenantId` in route against authorized tenant scope
- Direct URL to `/admin/tenants/:tenantId/configure/*` for unauthorized tenant returns permission-denied or not-found per security policy
- Client must not reuse cached tenant data after tenant switch
- Platform APIs must not accept stale `X-Selected-Tenant` without route-level validation

## Audit

Every selected-tenant mutation emits structured audit with at minimum:

| Field | Required |
|---|---|
| `actorPlatformUserId` | Yes |
| `selectedTenantId` | Yes |
| `action` | Yes |
| `entityType` / `entityId` | Yes |
| `before` / `after` | When applicable |
| `timestamp` | Yes |
| `correlationId` / `requestId` | Yes |

Event names are defined in the atomic journey register and API contract.

## Session behavior

- Browser refresh within selected-tenant route rehydrates selected tenant from route param + server tenant summary
- Platform Mode navigation clears selected tenant
- Logout clears selected tenant
- No tenant-user refresh token is created

## Handoff

Selected-Tenant Mode does **not** complete tenant onboarding by itself.

Handoff model:

```text
Commercial setup complete (Platform Mode)
→ Tenant activated
→ Tenant Admin invitation sent
→ Optional Selected-Tenant bootstrap may occur before or after activation
→ Tenant Admin assumes ongoing operational ownership
```

Operational bootstrap **does not block** tenant activation.

## Re-entry

Platform User may re-enter Selected-Tenant Mode for an `ACTIVE` tenant when permitted. Re-entry is for additional bootstrap assistance, not ongoing operations.

## Navigation

### Approved route map

| Route | Screen | Mode |
|---|---|---|
| `/admin/tenants` | Tenant List | Platform |
| `/admin/tenants/:tenantId` | Tenant Detail | Platform |
| `/admin/tenants/:tenantId/configure` | Setup Hub | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/outlets/create` | Create Initial Outlet | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/tills/create` | Create Initial Till | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/roles/create` | Create Initial Role | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/users/create` | Add Additional User | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/products/manual` | Manual Product Bootstrap | Selected-Tenant |
| `/admin/tenants/:tenantId/configure/products/import` | CSV Product Import | Selected-Tenant |

Selected-tenant routes **must not** appear in the primary Platform Admin sidebar. Entry is via Tenant Detail only.

## Error states

| State | When | UX |
|---|---|---|
| Permission denied | Missing bootstrap permission | Full-page permission-denied with return action |
| Feature not entitled | Missing module entitlement | Module card NOT ENTITLED; route shows feature-disabled page |
| Tenant suspended | `SUSPENDED` tenant | Read-only hub + blocked mutations |
| Dependency missing | e.g. till without outlet | Setup hub dependency notice; route guard on child screen |
| Validation error | Form/API 400 | Inline field errors |
| Conflict | Duplicate code/email/SKU | Field or banner conflict message |
| Server error | 5xx | Retry-safe error state |

## Security / NFR

- Platform identity only; no impersonation
- Selected tenant explicit on every screen
- Fail closed on unknown entitlement for bootstrap module
- No cross-tenant cache bleed
- Destructive actions require confirmation (bootstrap scope is primarily create-only in R1)
- HTTPS-only in production
- Audit mandatory for all mutations
- Responsive admin layouts: desktop-wide, laptop, tablet minimum

## Acceptance criteria

1. Platform User can enter Selected-Tenant Mode only from Tenant Detail **Configure Tenant** CTA.
2. Selected tenant is always visible in context banner with Exit action.
3. Setup Hub shows module cards with NOT STARTED / IN PROGRESS / CONFIGURED / NOT REQUIRED / NOT ENTITLED states.
4. Bootstrap mutations succeed only with correct permission, entitlement, and tenant lifecycle.
5. Suspended tenant blocks mutations but may allow read-only hub when policy permits.
6. Tenant switch clears stale tenant data.
7. All bootstrap mutations audit platform actor + selected tenant.
8. No Selected-Tenant route appears in primary platform sidebar.
9. First Tenant Admin from create wizard is not recreated via Additional User journey.
10. E-commerce bootstrap is not exposed.

## E-commerce bootstrap (LOCKED — GAP 5)

Platform Admin Selected-Tenant **does not** include online-store / e-commerce bootstrap in Phase 1.

| Topic | Decision |
|---|---|
| SA e-commerce setup APIs | **Not created** |
| SA e-commerce setup UI | **Not created** |
| Owner | Tenant Admin post-handoff |
| Blocks Phase 1 | **No** |
