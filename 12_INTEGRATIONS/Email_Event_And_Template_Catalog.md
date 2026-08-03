<!-- title: Email Event and Template Catalog -->
<!-- status: APPROVED -->
<!-- system: OneVerz POS MVP -->
<!-- owner: Platform Architecture / Product (OneVerz) -->
<!-- last_updated: 2026-07-27 -->
<!-- applies_to: Release 1 email events and templates -->
<!-- related: Email_Architecture_And_Provider_Decisions -->

# Email Event and Template Catalog

## Purpose

Canonical catalog of OneVerz transactional email events, templates, R1 scope, and implementation status.

Parent architecture: [[Email_Architecture_And_Provider_Decisions]].

## Status vocabulary

| Label | Meaning |
|---|---|
| **APPROVED** | Product-approved journey |
| **IMPLEMENTED** | Code + tests (and E2E where noted) |
| **NOT IMPLEMENTED** | Approved or planned; not built |
| **DEFERRED** | Explicitly out of Release 1 |
| **FUTURE** | Later release |
| **BLOCKED** | Cannot ship until a dependency lands |

## Scenario matrix (canonical)

| Event code | Trigger | Recipient | Template | CTA | R1 status | Implementation status |
|---|---|---|---|---|---|---|
| `platform.password_reset_requested` | Platform Admin initiates password reset | Platform user email | `platform_password_reset` | Open set-password / reset page | APPROVED | **IMPLEMENTED** (ACS E2E PASSED) |
| `tenant.paid_created` | Paid tenant created → `PENDING_PAYMENT` | Tenant Admin email | `tenant_paid_created_payment_required` | Pay via payment link | APPROVED | **NOT IMPLEMENTED** (BLOCKED on payment-link API/UI) |
| `tenant.paid_activated` | Paid tenant manually activated after verified payment or approved waiver → `ACTIVE` | Tenant Admin email | `tenant_activated_set_password` | Set password | APPROVED | **NOT IMPLEMENTED** |
| `tenant.trial_created` | Trial tenant created | Tenant Admin email | `tenant_trial_created` | Read next steps | APPROVED | **NOT IMPLEMENTED** |
| `tenant.trial_activated` | Trial auto-activated after provisioning | Tenant Admin email | `tenant_activated_set_password` | Set password | APPROVED | **NOT IMPLEMENTED** |
| `tenant.demo_created` | Demo tenant created | Tenant Admin email | `tenant_demo_created` | Read next steps | APPROVED | **NOT IMPLEMENTED** |
| `tenant.demo_activated` | Demo auto-activated after provisioning | Tenant Admin email | `tenant_activated_set_password` | Set password | APPROVED | **NOT IMPLEMENTED** |
| `tenant.password_setup_requested` | Activation issues set-password token (may coincide with `*.activated`) | Tenant Admin email | `tenant_activated_set_password` | Set password | APPROVED | **NOT IMPLEMENTED** |
| `tenant.user_invited` | Tenant user invited | Invitee email | `tenant_user_invite` | Accept invite / set password | APPROVED (product) | **NOT IMPLEMENTED** / often **DEFERRED** until after tenant-admin onboarding |
| `tenant.password_reset_requested` | Tenant-user password reset | Tenant user email | `tenant_password_reset` | Reset password | **DEFERRED** | **NOT IMPLEMENTED** |
| `user.password_changed` | Password changed successfully | Account email | `password_changed_alert` | Sign in / secure account | **FUTURE** | **NOT IMPLEMENTED** |
| `tenant.payment_received` | Payment verified | Tenant Admin | `tenant_payment_received` | — | **DEFERRED** (R1) | **NOT IMPLEMENTED** |

## Event detail cards

### `platform.password_reset_requested`

| Field | Value |
|---|---|
| Trigger | Authorized Platform Admin: Send Password Reset |
| Recipients | Target platform user email |
| Required data | Display name, reset URL (email body only), expiry |
| Template | `platform_password_reset` |
| Subject intent | Reset your OneVerz Platform Admin password |
| CTA | Open reset link |
| Idempotency key | `platform.password_reset:{userId}:{tokenId}` (or equivalent revoke-prior-pending) |
| Resend rules | New initiate revokes prior pending tokens; re-send = new initiate |
| Audit event | `PLATFORM_USER_PASSWORD_RESET_REQUESTED` (+ complete/fail/sessions revoked) |
| R1 / Impl | APPROVED / **IMPLEMENTED** |

### `tenant.paid_created`

| Field | Value |
|---|---|
| Trigger | Super Admin / Platform Admin creates **paid** tenant; lifecycle → `PENDING_PAYMENT` |
| Recipients | Tenant Admin email |
| Required data | Plan name, amount, currency, billing frequency, due date, **payment link** |
| Template | `tenant_paid_created_payment_required` |
| Subject intent | Tenant created — payment required |
| CTA | Open payment link |
| Must not include | Password, set-password link |
| Idempotency key | `tenant.paid_created:{tenantId}:{invoiceId|paymentLinkId}` |
| Resend rules | Authorized Platform Admin resend; same link if still valid or rotate per payment-link rules |
| Audit event | `TENANT_PAID_CREATED` / email outbox recorded |
| R1 / Impl | APPROVED / **NOT IMPLEMENTED** (**BLOCKED** on payment-link generation) |

### `tenant.paid_activated` / `tenant.trial_activated` / `tenant.demo_activated` / `tenant.password_setup_requested`

| Field | Value |
|---|---|
| Trigger | Tenant becomes `ACTIVE` (manual for paid after verified payment or approved waiver; automatic for trial/demo after create provisioning) |
| Recipients | Tenant Admin email |
| Required data | Username/email, tenant login URL, single-use set-password link, expiry |
| Template | `tenant_activated_set_password` |
| Subject intent | Tenant activated — set your password |
| CTA | Set password |
| Must not include | Plain/temporary password |
| Idempotency key | `tenant.activated_set_password:{tenantId}:{setupTokenId}` |
| Resend rules | Resend issues new single-use token; revoke prior pending setup tokens |
| Audit event | `TENANT_ACTIVATED` + `TENANT_PASSWORD_SETUP_REQUESTED` (may be combined in outbox) |
| R1 / Impl | APPROVED / **NOT IMPLEMENTED** |

### `tenant.trial_created` / `tenant.demo_created`

| Field | Value |
|---|---|
| Trigger | Trial or Demo tenant created (payment skipped) |
| Recipients | Tenant Admin email |
| Required data | Type (trial/demo), start date, expiry date, next-step information |
| Template | `tenant_trial_created` / `tenant_demo_created` |
| Subject intent | Tenant created — trial/demo |
| CTA | Await activation email / prepare to set password (no set-password link in this email) |
| Must not include | Set-password link, payment link (unless product later adds optional) |
| Idempotency key | `tenant.{trial\|demo}_created:{tenantId}` |
| Resend rules | Authorized resend of created notice only |
| Audit event | `TENANT_TRIAL_CREATED` / `TENANT_DEMO_CREATED` |
| R1 / Impl | APPROVED / **NOT IMPLEMENTED** |

### `tenant.user_invited`

| Field | Value |
|---|---|
| Trigger | Invite tenant user |
| Recipients | Invitee |
| Required data | Invite URL (hash-only storage), tenant name, role |
| Template | `tenant_user_invite` |
| R1 / Impl | APPROVED product intent / **NOT IMPLEMENTED** (sequence after tenant-admin onboarding) |

### `tenant.password_reset_requested`

| Field | Value |
|---|---|
| Trigger | Tenant-user password reset |
| R1 / Impl | **DEFERRED** / **NOT IMPLEMENTED** |

### `user.password_changed`

| Field | Value |
|---|---|
| Trigger | Successful password change |
| R1 / Impl | **FUTURE** / **NOT IMPLEMENTED** |

### `tenant.payment_received`

| Field | Value |
|---|---|
| Trigger | Payment verified |
| R1 / Impl | **DEFERRED** for Release 1 / **NOT IMPLEMENTED** |

## Template inventory

| Template name | Used by events | Notes |
|---|---|---|
| `platform_password_reset` | `platform.password_reset_requested` | Implemented composer |
| `tenant_paid_created_payment_required` | `tenant.paid_created` | Not built |
| `tenant_trial_created` | `tenant.trial_created` | Not built |
| `tenant_demo_created` | `tenant.demo_created` | Not built |
| `tenant_activated_set_password` | `*.activated`, `tenant.password_setup_requested` | Not built |
| `tenant_user_invite` | `tenant.user_invited` | Not built |
| `tenant_password_reset` | `tenant.password_reset_requested` | Deferred |
| `password_changed_alert` | `user.password_changed` | Future |
| `tenant_payment_received` | `tenant.payment_received` | Deferred R1 |

## Related

- [[Email_Architecture_And_Provider_Decisions]]
- [[../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- [[../03_USER_JOURNEYS/Platform_Admin/19_Authentication_Email_Flows]]
- [[ACS_Email_Operations_And_Deployment_Runbook]]
