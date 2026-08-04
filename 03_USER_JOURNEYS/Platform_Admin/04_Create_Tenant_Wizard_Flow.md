<!-- title: Create Tenant Wizard Flow -->
<!-- status: Historical / Superseded -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-31 -->
<!-- superseded: true -->

# Create Tenant Wizard Flow

> **SUPERSEDED — DO NOT IMPLEMENT FROM THIS FILE.** The approved replacement is [[FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]]. This file is retained as evidence of the pre-2026-07-31 implementation baseline.

## Purpose

Defines the Platform Admin 7-step tenant create wizard and how it aligns to the **approved** onboarding email and lifecycle model.

Approved email journeys: [[18_Tenant_Onboarding_Email_Flows]] · Architecture: [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]]

## Actor

Platform Admin

## Preconditions

- Platform Admin has `platform.tenants.create`.
- Active subscription plans exist in `subscription_plans`.
- Create-options endpoint returns catalog, addons, and lookup values.

## Implemented 7-Step Flow (UI)

| Step | UI label | Backend persistence |
|---:|---|---|
| 1 | Business Info | `tenants`, `tenant_profiles`, `tenant_addresses` |
| 2 | Plan Selection | `tenant_subscriptions.subscription_plan_id` |
| 3 | Limits & Add-ons | `tenant_subscriptions.max_*_override`, `tenant_subscription_addons` |
| 4 | Feature Entitlements | `tenant_feature_entitlements` (auto-seeded from plan when none selected) |
| 5 | Tenant Admin | `tenant_users`, roles, `user_invites` (pending) |
| 6 | Billing & Subscription | subscription type/cycle/status, billing fields, optional draft invoice; **paid** requires payment-link path when fully implemented |
| 7 | Review & Create | Single transactional `POST /api/v1/platform-admin/tenants` |

## Approved create outcomes (product)

| Mode | Lifecycle `tenants.status` after create | Emails (approved) |
|---|---|---|
| Paid | `PENDING_PAYMENT` | `tenant.paid_created` (plan/amount/currency/frequency/due date/**payment link**; no set-password) |
| Trial | Then auto-activate to `ACTIVE` after provisioning | `tenant.trial_created` then `tenant.trial_activated` (set-password only on activation email) |
| Demo | Then auto-activate to `ACTIVE` after provisioning | `tenant.demo_created` then `tenant.demo_activated` |

Subscription type (`PAID`/`TRIAL`/`DEMO`), billing cycle, subscription status, and payment status stay on subscription/billing models — **not** in `tenants.status`.

### Approved lifecycle orchestration details

- **Paid:** create tenant record, record `TENANT_CREATED`, final create lifecycle = `PENDING_PAYMENT`.
- **Paid activation prerequisite:** payment verification recorded **or** approved payment waiver recorded.
- **Paid post-verification state:** `PENDING_ACTIVATION` until manual Release 1 activation.
- **Trial/Demo:** create tenant record, record `TENANT_CREATED`, automatically activate in the same orchestration, record `TENANT_ACTIVATED`, final lifecycle = `ACTIVE`.
- Trial/Demo create and activate remain **separate domain/audit events** even when one orchestration performs both.
- `billingStatus` must **never** be passed to `Tenant.Create()` as the lifecycle status.

## API Flow (current + target)

1. `GET /api/v1/platform-admin/tenants/create-options`
2. Wizard collects step data from returned options.
3. `POST /api/v1/platform-admin/tenants` with full wizard payload.
4. **Paid (approved):** remain on detail until payment verified + manual activate.
5. **Trial/Demo (approved):** auto-activate after successful provisioning; both created + activated emails.

## Rules

- No mock create-options in Angular.
- Never email a plain or temporary password.
- Tenant admin pending invite / setup token uses hash-only storage when implemented.
- Feature entitlements must belong to the selected plan; empty selection auto-copies plan included features.
- Optional post-create setup (outlets, tills, products) remains on tenant detail follow-up flows.
- Payment link is **required** for the paid create email path (R1); generation/API/UI currently missing.

## Implementation status vs approved model

| Topic | Approved | Current status |
|---|---|---|
| `tenants.status` | Lifecycle only (`PENDING_PAYMENT`, etc.) | **IMPLEMENTED** — lifecycle-only values |
| Paid verification -> `PENDING_ACTIVATION` | Required | **IMPLEMENTED** (Mark Paid path) |
| Paid waiver -> `PENDING_ACTIVATION` | Required | **NOT IMPLEMENTED** (deferred) |
| Paid create email | Required | **NOT IMPLEMENTED** (deferred) |
| Payment link | Required for paid | **NOT IMPLEMENTED** (deferred) |
| Trial/Demo auto-activate | Required | **IMPLEMENTED** |
| Trial/Demo onboarding emails | Required | **NOT IMPLEMENTED** (deferred) |
| Backend lifecycle correction | Approved | **IMPLEMENTED** |
| Data cleanup migration | Approved | **IMPLEMENTED** |
| `tenants.status` CHECK constraint | Approved | **IMPLEMENTED** |
| `lifecycleStatus` API transition | Approved | **IMPLEMENTED** (compat aliases **DEPRECATED**) |
| Frontend lifecycle badge/filter alignment | Approved | **IMPLEMENTED** |
| Wizard FE hint “email not wired” | Temporary until emails ship | Matches current code; superseded as product SOT by [[18_Tenant_Onboarding_Email_Flows]] |
| Post-merge smoke verification | Required | **PASSED** — [[../../15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_Lifecycle_Post_Merge_Smoke_Verification]] |

### Decision history — superseded statements

> ~~No email is sent until notification infrastructure exists.~~
> ~~Payment gateway and payment links are not invoked in this slice~~ (as permanent product rule).

These described the **2026-07 implemented slice**, not the approved end state. ACS infrastructure now exists for platform reset; tenant onboarding emails remain **NOT IMPLEMENTED** but are **APPROVED** product requirements.

## Validation Behavior (UI)

Each wizard step validates before Next is enabled. The Review step shows a validation summary when any step is incomplete.

| Behavior | Rule |
|---|---|
| Field-level errors | Visible under the control after touch or step validation |
| Step error count | Stepper badge shows count of unresolved issues per step |
| Next / Create | Disabled while validation issues remain |
| Server errors | Field-level `errors[]` via `ApiErrorService` |
| Country / currency | ISO codes only |

## Frontend Source Files

- Route: `/admin/tenants/create`
- Page: `platform-create-tenant-page.ts`
- Mapper: `platform-tenant-create.mapper.ts`
- API: `platform-tenant-api.service.ts`

See [[16_Platform_Tenant_Create_Wizard_Alignment]] for request shape. Align that doc’s email notes to [[18_Tenant_Onboarding_Email_Flows]] when implementing.

## Related Files

- [[18_Tenant_Onboarding_Email_Flows]]
- [[11_Tenant_Activation_Flow]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]]
- [[16_Platform_Tenant_Create_Wizard_Alignment]]
