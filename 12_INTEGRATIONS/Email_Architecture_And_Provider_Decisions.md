<!-- title: Email Architecture and Provider Decisions -->
<!-- status: APPROVED -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- owner: Platform Architecture / Product (OneVerz) -->
<!-- last_updated: 2026-07-27 -->
<!-- decision_date: 2026-07-27 -->
<!-- applies_to: Release 1 transactional email + tenant onboarding contracts -->
<!-- supersedes: Email_Service_Integration (empty draft) -->

# Email Architecture and Provider Decisions

## Purpose

Approved source of truth for OneVerz transactional email: provider choice, delivery architecture, failure handling, and relationship to tenant onboarding.

## Source-of-truth priority

1. Approved Second Brain architecture and functional contracts (this document and linked catalogs/journeys)
2. Approved database/API design
3. Current source code and tests
4. Implementation tracking reports
5. Task-specific prompts

If implementation conflicts with this approved Second Brain, **report the mismatch**. Do not invent another journey. Change code only through an approved implementation task.

## Provider decision

| Decision | Value |
|---|---|
| Provider | **Azure Communication Services (ACS) Email** |
| Application abstraction | `IApplicationEmailSender` (provider-neutral) |
| Infrastructure adapter | `AzureCommunicationEmailSender` |
| Sender address | Bare verified MailFrom only (no display-name formatting inside `senderAddress`) |
| Display name | Configured separately; not concatenated into sender address |
| Send acknowledgement | `WaitUntil.Started` (accepted by ACS, not inbox proof) |

## Canonical related documents

| Document | Role |
|---|---|
| [[Email_Event_And_Template_Catalog]] | Event codes, templates, R1 vs deferred |
| [[../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]] | Paid + Trial/Demo email journeys |
| [[../03_USER_JOURNEYS/Platform_Admin/19_Authentication_Email_Flows]] | Password reset / set-password / invite auth emails |
| [[ACS_Email_Operations_And_Deployment_Runbook]] | Config, secrets, ops |
| [[../03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]] | Implemented platform reset journey |
| Audit report (backend repo) | `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/OneVerz_Email_Scenario_and_Tenant_Onboarding_Audit.md` |

## Delivery architecture (target)

1. Business transaction persists the domain change (tenant, invoice, token hash, activation).
2. An **email outbox / event** row is persisted in the same unit of work when possible.
3. A **background worker** reads the outbox and sends via ACS.
4. Retries are **bounded**.
5. **Duplicate sends** are prevented via idempotency keys.
6. Failures are recorded; authorized Super Admin / Platform Admin can **resend**.

### Until outbox is implemented

- Email failure **must not** create duplicate tenants.
- Email failure **must be recorded** (log + preferably durable failure state).
- An authorized Platform Admin **must be able to resend** the appropriate email once resend APIs exist.
- Synchronous send may be used for early slices **only** if it cannot duplicate tenants and failures are visible.

## Password and security rules

- **Never** email a plain or temporary password.
- Send **username/email** plus a **single-use set-password link** only after **activation**.
- Raw tokens are **never** stored or logged; hash-only persistence.
- Setup / reset links are time-limited and single-use.
- Production API responses in email mode must not return raw reset URLs to admins when delivery mode is `email` (platform reset already follows this).

## Tenant lifecycle vs billing (data model rule)

`tenants.status` stores **only** tenant lifecycle state:

| Allowed `tenants.status` |
|---|
| `DRAFT` |
| `PENDING_PAYMENT` |
| `PENDING_ACTIVATION` |
| `ACTIVE` |
| `SUSPENDED` |
| `CANCELLED` |

Do **not** store billing-cycle, subscription-type, or payment-state values in `tenants.status`.

Keep separate:

| Concern | Home |
|---|---|
| Subscription type | `PAID` / `TRIAL` / `DEMO` (subscription / plan model â€” not `tenants.status`) |
| Billing cycle | `MONTHLY` / `ANNUAL` (and catalog equivalents) |
| Subscription status | `tenant_subscriptions` status |
| Payment / billing status | invoices, payment links, billing fields â€” **not** `tenants.status` |

### Lifecycle alignment (resolved)

**Resolved (2026-07-28):** Tenant create no longer writes billing values into `tenants.status`. Lifecycle-only values, repair migration, CHECK constraint, and verified-payment activation gate are **IMPLEMENTED** on merged Backend/Frontend main. Historical defect notes remain superseded by [[../15_IMPLEMENTATION_TRACKING/Backend/Tenant/Tenant_Lifecycle_Status_Alignment_Implementation_Status]].

Billing/payment remain on their own fields/tables. Onboarding emails and payment links remain **NOT IMPLEMENTED** (deferred).

## Current implementation status

| Capability | Status |
|---|---|
| ACS Email provider infrastructure | **COMPLETE** |
| Platform Admin password-reset email | **COMPLETE** |
| E-Commerce verification OTP and password-reset email | **IMPLEMENTED / TESTING** |
| Real Azure E2E password-reset verification | **PASSED** |
| Paid tenant onboarding emails | **NOT IMPLEMENTED** |
| Trial/Demo emails | **NOT IMPLEMENTED** |
| Payment-link API / UI / email | **NOT IMPLEMENTED** |
| Tenant Admin set-password email | **NOT IMPLEMENTED** |
| Tenant-user invitation / reset emails | **NOT IMPLEMENTED** |
| Email outbox / retry | **NOT IMPLEMENTED** |

## Decision history

| Date | Decision |
|---|---|
| 2026-07-24 | ACS wired for platform password reset (SA-P1-06); tenant emails deferred in implemented wizard slice |
| 2026-07-27 | Approved final paid + trial/demo email journeys; lifecycle status rule; outbox target; this document becomes SOT |

## Related modules

- 01_Platform_Administration
- 02_Tenant_Foundation
- 04_Subscription_Billing_Usage
- 06_Auth_Tokens_Security_Audit
- 26_Notification (ops alerts â€” not SaaS onboarding catalog)

## E-Commerce customer authentication email

- Registration and resend verification send a short-lived six-digit OTP through the provider-neutral email sender.
- Forgot password sends a time-limited reset link; raw OTPs and reset tokens must never be stored or logged.
- Customer authentication email remains in Testing until focused API/integration evidence is recorded.
- Related tracking: [[../15_IMPLEMENTATION_TRACKING/Backend/ECommerce/Customer_Auth_Implementation_Status]]
- Related tests: [[../10_TESTING_QA/Test_Case/22_ECommerce/Customer_Auth_Test_Cases]]
