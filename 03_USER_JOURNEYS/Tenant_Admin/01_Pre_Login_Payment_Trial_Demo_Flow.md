<!-- title: Tenant Admin Pre-Login Payment Trial Demo Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-07-27 -->
<!-- decision_date: 2026-07-27 -->

# Tenant Admin Pre-Login Payment Trial Demo Flow

## Purpose

Defines how a Tenant Admin reaches first access for **Paid** vs **Trial/Demo**, aligned to approved onboarding emails.

Canonical: [[../Platform_Admin/18_Tenant_Onboarding_Email_Flows]]

## Actor

Tenant Admin (recipient); Platform Admin (initiator)

## Trigger

Platform Admin creates tenant and selects subscription type: `PAID`, `TRIAL`, or `DEMO`.

## Approved main flow

| Step | Paid | Trial / Demo |
|---:|---|---|
| 1 | Tenant created → `PENDING_PAYMENT` | Tenant created |
| 2 | Email `tenant.paid_created` with plan/amount/currency/frequency/due date/**payment link** (no set-password) | Email `tenant.trial_created` or `tenant.demo_created` (type, start, expiry, next steps; no set-password) |
| 3 | Tenant pays via payment link | Payment skipped |
| 4 | Super Admin **manually verifies** payment (R1) | — |
| 5 | Super Admin **manually activates** | System **auto-activates** after provisioning |
| 6 | Email activated + set-password | Email activated + set-password (second email) |
| 7 | Set password → login | Set password → login |

### Trial/Demo email count

**Two distinct emails** (not one combined Ready email):

1. Tenant Created
2. Tenant Activated + Set Password

Only email 2 contains the set-password link.

### Deferred

- Payment Received acknowledgement email (R1 deferred).

## Security

- Payment link and setup link must not expose raw tokens in logs or APIs beyond intended delivery.
- Never email plain/temporary passwords.

## Implementation status

Approved journeys **NOT IMPLEMENTED** for tenant emails and payment-link send. Platform password-reset ACS is unrelated and already complete.

## Decision history — superseded

| Obsolete claim | Replacement |
|---|---|
| Payment success auto-activates tenant and sends setup email | R1: **manual** verify + **manual** activate for paid |
| Trial/Demo sends setup email only (single email) | **Two** emails: created + activated |
| Payment provider always validates without Super Admin | R1 verification is **manual** Super Admin |

## Related

- [[../Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- [[../Platform_Admin/11_Tenant_Activation_Flow]]
- [[02_First_Login_Flow]]
- [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]]
