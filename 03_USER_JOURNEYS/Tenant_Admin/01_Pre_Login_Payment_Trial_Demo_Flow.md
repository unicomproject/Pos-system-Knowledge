<!-- title: Tenant Admin Pre-Login Payment Trial Demo Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->
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
| 2 | Email `tenant.paid_created` with invoice summary/manual instructions, `invoiceUrl` and secure `paymentStatusUrl`; `checkoutUrl` null; no set-password | Email `tenant.trial_created` or `tenant.demo_created` (type, start, expiry, next steps; no set-password) |
| 3 | Recipient views status and submits method/reference/amount/currency/date/private proof and optional note | Payment skipped |
| 4 | Platform Admin reviews and approves, rejects or requests information; recipient corrects/resubmits when eligible | — |
| 5 | Super Admin **manually activates** | System **auto-activates** after provisioning |
| 6 | Email activated + set-password | Email activated + set-password (second email) |
| 7 | Set password → login | Set password → login |

### Trial/Demo email count

**Two distinct emails** (not one combined Ready email):

1. Tenant Created
2. Tenant Activated + Set Password

Only email 2 contains the set-password link.

### Manual payment recipient screens

Before activation, the recipient can view the authorized invoice, instructions, current payment/activation status, submit proof, see confirmation, respond to information requests and see safe approved/rejected outcomes. The access grant is random, expiring and purpose-bound; a tenant or invoice ID alone is never authorization. Screens define loading/uploading/scanning, validation, expired/tampered access, retry, accessible error/focus/live status and responsive states.

## Security

- Payment-status and setup links must not expose raw tokens in logs or APIs beyond intended delivery. Proof URLs/storage keys and full bank details are private.
- Never email plain/temporary passwords.

## Implementation status

Approved journeys **NOT IMPLEMENTED** for manual payment access/submission/review notifications and tenant onboarding emails. Platform password-reset ACS is unrelated and already complete.

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
