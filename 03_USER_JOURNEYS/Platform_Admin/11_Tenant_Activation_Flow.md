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
- **Paid:** payment verified (Release 1: manual Super Admin verification).
- **Trial/Demo:** payment not required.

## Approved main flow

### Paid

| Step | Action | System behavior |
|---:|---|---|
| 1 | Open tenant detail | Status expected `PENDING_PAYMENT` (or equivalent pending lifecycle) until paid |
| 2 | Confirm payment verified | Manual Mark Paid / verify payment (R1) |
| 3 | Click Activate Tenant | Requires verified payment |
| 4 | Confirm | Lifecycle → `ACTIVE` |
| 5 | Send activation email | `tenant.paid_activated` — username/email, login URL, single-use set-password link, expiry |
| 6 | Tenant Admin sets password | Completes setup; can log in |

### Trial / Demo

| Step | Action | System behavior |
|---:|---|---|
| 1 | Create succeeds | `tenant.trial_created` or `tenant.demo_created` already sent (no set-password link) |
| 2 | Auto-activate | After successful provisioning; audit event separate from create |
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
| Paid verified-payment gate | Partial / needs alignment |
| Auto-activate trial/demo | **NOT IMPLEMENTED** |
| Activation emails | **NOT IMPLEMENTED** |
| Status defect (billing in `tenants.status`) | **Defect** — may block `CanActivate` |

## Decision history — superseded

> ~~System sends tenant admin invite/password setup email and marks tenant active~~ as a single vague step without distinguishing paid vs trial/demo and without payment verification.

> ~~Trial/Demo use one combined setup email only~~ — superseded by two emails: Created + Activated.

## Related

- [[18_Tenant_Onboarding_Email_Flows]]
- [[04_Create_Tenant_Wizard_Flow]]
- [[../Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow]]
- [[../Tenant_Admin/02_First_Login_Flow]]
- [[10_Billing_Flow]]
