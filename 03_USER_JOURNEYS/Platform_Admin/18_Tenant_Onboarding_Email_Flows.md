<!-- title: Tenant Onboarding Email Flows -->
<!-- status: APPROVED -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- owner: Platform Architecture / Product (OneVerz) -->
<!-- last_updated: 2026-08-04 -->
<!-- decision_date: 2026-07-27 -->
<!-- applies_to: Release 1 paid + trial/demo tenant onboarding emails -->
<!-- related: Email_Architecture_And_Provider_Decisions, Email_Event_And_Template_Catalog -->

# Tenant Onboarding Email Flows

## Purpose

Approved Platform Admin–owned journeys for **paid** and **trial/demo** tenant onboarding emails.

Parent: [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]] · Catalog: [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]]

## Actor

- **Initiator:** Platform Admin / Super Admin with tenant create / billing / activate permissions
- **Recipient:** Tenant Admin (email = login username unless product adds a separate username later)

## Lifecycle status rule

On create/activate, `tenants.status` must be one of: `DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `CANCELLED`.

Subscription type (`PAID` / `TRIAL` / `DEMO`), billing cycle, subscription status, and payment status are **separate** fields — never overloaded into `tenants.status`.

### Implementation defect (do not treat as approved behaviour)

Current code may write billing values into `tenants.status` and block `CanActivate`. That is a **defect** requiring an approved fix. Journeys below describe the **approved** model.

---

## Paid tenant final flow

1. Super Admin creates a **paid** tenant.
2. Tenant lifecycle status → **`PENDING_PAYMENT`**.
3. System sends **`tenant.paid_created`** (Tenant Created / Subscription Confirmation / Payment Required).
4. Email contains tenant/reference/status, plan, billing cycle, subtotal/tax/total/currency, invoice/due date, approved manual instructions/reference format, support contact, authorized `invoiceUrl`, and secure `paymentStatusUrl`. Manual `checkoutUrl` is null.
5. Email does **not** contain password or set-password link.
6. Recipient submits manual method/reference/amount/currency/date/private proof and optional note through the secure payment-status experience.
7. An authorized Platform Admin reviews with current version and command idempotency, then approves, rejects, or requests information. Approval or an approved waiver satisfies the payment gate.
8. After verification/waiver and before activation, tenant lifecycle status → **`PENDING_ACTIVATION`**.
9. Super Admin **manually activates** the tenant (Release 1). Paid activation **requires verified payment or approved waiver**.
10. Tenant lifecycle status → **`ACTIVE`**.
11. System sends **`tenant.paid_activated`** / set-password email (`tenant_activated_set_password`).
12. Activation email contains: Tenant Admin username/email, tenant login URL, single-use set-password link, expiry.
13. Tenant Admin sets password and logs in.

Payment-submitted confirmation and approved/rejected/request-information outcome notifications are part of the manual-payment workflow. They never contain account-setup credentials.

**Current gaps:** secure manual-payment access, proof submission/review/history, payment notifications and activation handoff are **NOT IMPLEMENTED**. A real gateway is intentionally not part of this release.

---

## Trial / Demo final flow

1. Super Admin creates tenant as **TRIAL** or **DEMO**.
2. Payment is **skipped**.
3. System sends **Created** email:
   - Trial → `tenant.trial_created`
   - Demo → `tenant.demo_created`
4. Created email contains: trial/demo type, start date, expiry date, next-step information — **no** set-password link.
5. Tenant is **automatically activated** after successful create/provisioning.
6. Created and activated **audit events remain separate** (`TENANT_CREATED`, then `TENANT_ACTIVATED`) even when one orchestration performs both.
7. System sends **Activated / Ready to Use** email (`tenant.trial_activated` or `tenant.demo_activated`) with set-password link.
8. Therefore Trial/Demo receives **two distinct emails**:
   1. Tenant Created
   2. Tenant Activated + Set Password
9. Only the activation email contains the single-use set-password link.
10. Tenant Admin sets password and logs in.

**Current gaps:** Trial/Demo auto-activation is **IMPLEMENTED**. Onboarding emails remain **NOT IMPLEMENTED** (deferred).

---

## Password setup rules

- Never email a plain or temporary password.
- Set-password link only **after activation**.
- Raw token never stored or logged; hash-only; time-limited; single-use.

---

## Payment and activation (Release 1)

| Mode | Payment | Verification | Activation |
|---|---|---|---|
| Prepaid paid | Manual instructions, invoice and secure payment-status access; no checkout URL | Authorized evidence review/approval, or approved waiver record | Separate activation after approval / waiver |
| Trial / Demo | Not required | N/A | **Automatic** after successful create/provisioning |
| Deferred / invoice-later | Plan policy; payment status `DEFERRED` | Per plan policy | `PENDING_ACTIVATION` or `ACTIVE` only as policy allows |

Manual payment Application/API/UI/email are currently **missing**. Future Stripe/PayHere must use provider adapters and signed idempotent callbacks without changing this lifecycle or invitation sequence.

## Lifecycle alignment implementation status

| Item | Status |
|---|---|
| APPROVED: lifecycle model and mappings | **APPROVED** |
| Backend lifecycle correction | **IMPLEMENTED** |
| Data cleanup migration | **IMPLEMENTED** |
| `tenants.status` CHECK constraint | **IMPLEMENTED** |
| `lifecycleStatus` API transition | **IMPLEMENTED** |
| Frontend badge/filter alignment | **IMPLEMENTED** |
| Onboarding/manual-payment emails and secure status access | **NOT IMPLEMENTED** |
| Post-merge smoke verification | **PASSED** — [[../../15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_Lifecycle_Post_Merge_Smoke_Verification]] |

---

## Email failure

Target: domain change + outbox + ACS worker + bounded retry + idempotency + resend.

Until outbox exists: no duplicate tenants on email failure; record failure; allow authorized resend.

---

## Mandatory communication separation

1. `tenant_paid_created_payment_required`: invoice/manual-payment instructions and status access only; no setup token or password.
2. `tenant_activated_set_password`: sent only after `ACTIVE`; secure single-use account setup link only.

Additional manual-payment templates: submission received, payment approved, payment rejected, more information requested, and resubmission received. Payment proof URLs, bank details, access tokens and token-bearing URLs are never written to audit/logs or unrelated templates.

## Related journeys (aligned)

- [[04_Create_Tenant_Wizard_Flow]]
- [[11_Tenant_Activation_Flow]]
- [[../Tenant_Admin/01_Pre_Login_Payment_Trial_Demo_Flow]]
- [[../Tenant_Admin/02_First_Login_Flow]]
- [[10_Billing_Flow]]
- [[19_Authentication_Email_Flows]]

## Decision history

| Date | Note |
|---|---|
| Pre-2026-07-27 | Deck journeys conflicted (single trial setup email vs activate invite; wizard “no email”) |
| 2026-07-27 | This document supersedes conflicting email steps in older journeys |
