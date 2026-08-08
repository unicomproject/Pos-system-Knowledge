<!-- title: Tenant Activation Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP / OneVerz -->
<!-- last_updated: 2026-08-06 -->
<!-- decision_date: 2026-07-27 -->

# Tenant Activation Flow

> Flow 4 payment alignment (2026-08-04): the current release uses manual payment verification. Payment approval moves a prepaid tenant from `PENDING_PAYMENT` to `PENDING_ACTIVATION`; it never directly marks the tenant `ACTIVE`. The separate activation command then validates eligibility, activates idempotently and queues the Tenant Admin setup invitation.

## Purpose

Defines how a tenant becomes `ACTIVE` and when the Tenant Activated + Set Password email is sent.

Canonical email journey: [[18_Tenant_Onboarding_Email_Flows]]

## Actor

Platform Admin (manual paid activation); system (automatic trial/demo activation after create provisioning)

## Preconditions

- Tenant exists with valid profile and Tenant Admin identity.
- Subscription assigned.
- **Paid:** payment verification recorded **or** approved payment waiver recorded (Release 1 verification remains manual).
- **Trial/Demo:** payment not required.

## Approved main flow

### Paid

| Step | Action | System behavior |
|---:|---|---|
| 1 | Open tenant detail | Status expected `PENDING_PAYMENT` until payment is resolved |
| 2 | Confirm payment resolved | Authorized, versioned and idempotent manual review approves submitted evidence, or an approved payment waiver is recorded |
| 3 | Prepare for activation | Lifecycle â†’ `PENDING_ACTIVATION` |
| 4 | Click Activate Tenant | Requires verified payment or approved waiver |
| 5 | Confirm | Lifecycle â†’ `ACTIVE` |
| 6 | Send activation email | `tenant.paid_activated` â€” username/email, login URL, single-use set-password link, expiry |
| 7 | Tenant Admin sets password | Completes setup; can log in |

### Trial / Demo

| Step | Action | System behavior |
|---:|---|---|
| 1 | Create succeeds | `tenant.trial_created` or `tenant.demo_created` already sent (no set-password link) |
| 2 | Auto-activate | After successful provisioning; `TENANT_ACTIVATED` event remains separate from `TENANT_CREATED` |
| 3 | Send activation email | `tenant.trial_activated` / `tenant.demo_activated` with set-password link |
| 4 | Tenant Admin sets password | Completes setup |

## Rules

- Never email a plain password.
- Set-password link **only** on activation email.
- Before payment approval there is no setup token or setup invitation; payment and account-setup communications are separate.
- Current manual payment uses invoice/payment-status links and has no provider checkout URL.
- `tenants.status` uses lifecycle values only â€” see [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]].

## Implementation status

| Item | Status |
|---|---|
| Manual activate API/UI | **IMPLEMENTED** |
| Paid verified-payment gate (Mark Paid) | **IMPLEMENTED** |
| Paid waiver gate | **NOT IMPLEMENTED** (deferred) |
| `PENDING_ACTIVATION` intermediate lifecycle | **IMPLEMENTED** |
| Auto-activate trial/demo | **IMPLEMENTED** |
| Activation emails | **NOT IMPLEMENTED** (deferred) |
| Status defect (billing in `tenants.status`) | **FIXED** |
| Backend lifecycle correction | **IMPLEMENTED** |
| Data cleanup migration | **IMPLEMENTED** |
| `tenants.status` CHECK constraint | **IMPLEMENTED** |
| `lifecycleStatus` API transition | **IMPLEMENTED** |
| Frontend lifecycle badge/filter alignment | **IMPLEMENTED** |
| Post-merge smoke verification | **PASSED** â€” [[../../15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_Lifecycle_Post_Merge_Smoke_Verification]] |

## Decision history â€” superseded

> ~~System sends tenant admin invite/password setup email and marks tenant active~~ as a single vague step without distinguishing paid vs trial/demo and without payment verification.

> ~~Trial/Demo use one combined setup email only~~ â€” superseded by two emails: Created + Activated.

## Related

- [[18_Tenant_Onboarding_Email_Flows]]
- [[04_Create_Tenant_Wizard_Flow]]
- [[../Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow]]
- [[../Tenant_Admin/02_First_Login_Flow]]
- [[10_Billing_Flow]]
