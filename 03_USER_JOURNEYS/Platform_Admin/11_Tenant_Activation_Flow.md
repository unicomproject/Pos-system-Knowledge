<!-- title: Tenant Activation Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-27 -->
<!-- decision_date: 2026-07-27 -->

# Tenant Activation Flow

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
| 2 | Confirm payment resolved | Manual Mark Paid / verify payment (R1) or approved payment waiver recorded |
| 3 | Prepare for activation | Lifecycle → `PENDING_ACTIVATION` |
| 4 | Click Activate Tenant | Requires verified payment or approved waiver |
| 5 | Confirm | Lifecycle → `ACTIVE` |
| 6 | Send activation email | `tenant.paid_activated` — username/email, login URL, single-use set-password link, expiry |
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
- `tenants.status` uses lifecycle values only — see [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]].

## Implementation status

| Item | Status |
|---|---|
| Manual activate API/UI | Exists |
| Paid verified-payment / waiver gate | Partial / needs alignment |
| `PENDING_ACTIVATION` intermediate lifecycle | **NOT IMPLEMENTED** |
| Auto-activate trial/demo | **NOT IMPLEMENTED** |
| Activation emails | **NOT IMPLEMENTED** |
| Status defect (billing in `tenants.status`) | **Defect** — may block `CanActivate` |
| Backend lifecycle correction | **NOT IMPLEMENTED** |
| Data cleanup migration | **NOT IMPLEMENTED** |
| `tenants.status` CHECK constraint | **NOT IMPLEMENTED** |
| `lifecycleStatus` API transition | **NOT IMPLEMENTED** |
| Frontend lifecycle badge/filter alignment | **NOT IMPLEMENTED** |

## Decision history — superseded

> ~~System sends tenant admin invite/password setup email and marks tenant active~~ as a single vague step without distinguishing paid vs trial/demo and without payment verification.

> ~~Trial/Demo use one combined setup email only~~ — superseded by two emails: Created + Activated.

## Related

- [[18_Tenant_Onboarding_Email_Flows]]
- [[04_Create_Tenant_Wizard_Flow]]
- [[../Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow]]
- [[../Tenant_Admin/02_First_Login_Flow]]
- [[10_Billing_Flow]]
