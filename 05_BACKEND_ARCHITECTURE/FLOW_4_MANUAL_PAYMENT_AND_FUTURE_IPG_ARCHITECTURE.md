<!-- title: Flow 4 Manual Payment and Future IPG Architecture -->
<!-- status: Canonical -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 - Manual Payment and Future IPG Architecture

## Decision and scope

The current release uses **manual payment verification**. It does not create a Stripe, PayHere, or other gateway checkout session. The architecture remains provider-neutral so a future gateway is added through an adapter and callback boundary rather than by redesigning tenant onboarding.

For manual payment:

- `invoiceUrl` is an authorized invoice-view/download URL.
- `paymentStatusUrl` is a secure, expiring, purpose-bound URL used to view instructions/status and submit evidence.
- `checkoutUrl` is `null`.
- A secure payment-status URL must never be described as a gateway payment link.
- No fake provider transaction, checkout URL, callback, or success is allowed.

This document is authoritative for Flow 4 payment collection and supersedes Flow 4 statements that require an online payment link in the current release.

## Server-controlled payment policy

Step 4 receives supported setup types and the selected plan's payment policy from create-options. The current enabled setup type is `MANUAL`. Future types may include `STRIPE`, `PAYHERE`, `INVOICE_DEFERRED`, and `NOT_REQUIRED`.

Subscription type and payment policy are separate. A paid plan can be prepaid or deferred. The backend derives lifecycle outcomes from the plan policy; the client cannot submit lifecycle, invoice, payment, subscription, or activation statuses.

| Policy | Initial payment status | Tenant result after finalization | Activation rule |
|---|---|---|---|
| Prepaid paid | `AWAITING_PAYMENT` | `PENDING_PAYMENT` | Manual approval -> `PENDING_ACTIVATION`; activation remains separate |
| Free/trial/demo | `NOT_REQUIRED` | `PENDING_ACTIVATION` or `ACTIVE` according to provisioning policy | No payment gate |
| Invoice/deferred | `DEFERRED` | `PENDING_ACTIVATION` or `ACTIVE` according to the selected plan policy | No universal hard-coded rule |

## Canonical manual-payment sequence

1. Finalization validates all seven saved steps and locks the onboarding draft.
2. One transaction writes tenant, profile, contacts, subscription, invoice/lines, entitlements, Tenant Admin membership/authorization, payment access record, onboarding operation, audit/history, and outbox messages.
3. A prepaid paid tenant commits as `PENDING_PAYMENT`; payment commits as `AWAITING_PAYMENT`.
4. The outbox queues a payment-required notification. It contains invoice and manual-payment information but no account-setup token.
5. The recipient opens `paymentStatusUrl` using an authenticated context or a random, expiring, purpose-bound token whose hash alone is stored.
6. The recipient submits method, bank/transaction reference, amount, currency, payment date, proof document, and optional note using an idempotent command.
7. The payment becomes `PAYMENT_SUBMITTED`; the tenant remains `PENDING_PAYMENT`.
8. An authorized Platform Admin claims or opens the review. The payment becomes `UNDER_REVIEW` using optimistic concurrency.
9. The reviewer approves, rejects, or requests information. Every command requires a current version, idempotency key, permission, and structured audit entry.
10. Approval records the amount received, payment date, verifier, and verification time; payment becomes `PAID`, invoice settlement is updated consistently, and tenant becomes `PENDING_ACTIVATION` in the same local transaction. Activation work becomes eligible or is queued.
11. Rejection leaves the tenant `PENDING_PAYMENT`, records a safe reason, notifies the recipient, and permits a corrected resubmission according to policy.
12. Request information moves payment to `ACTION_REQUIRED`, leaves the tenant pending payment, and permits an amended submission without deleting review history.
13. Activation validates payment/subscription/provisioning eligibility, transitions idempotently to `ACTIVE`, and queues the Tenant Admin invitation.
14. The invitation worker generates the raw setup token only in memory, stores only its keyed hash, and sends the separate activation/setup communication.

External email or storage calls do not run inside tenant finalization, payment review, or activation transactions. A committed tenant is never deleted to compensate for a notification failure.

## Payment status state machine

Invoice status, payment status, onboarding-operation status, and tenant lifecycle are separate domains.

| Payment status | Entry condition | Allowed actions | Valid next statuses | Tenant/subscription effect | UI/notification/audit |
|---|---|---|---|---|---|
| `NOT_REQUIRED` | Policy exempts payment | View result | Terminal for this invoice/payment requirement | Follow no-payment activation policy | Explain no payment required; audit policy resolution |
| `AWAITING_PAYMENT` | Prepaid invoice issued and instructions available | View invoice/instructions; submit evidence; cancel/expire by policy | `PAYMENT_SUBMITTED`, `EXPIRED`, `CANCELLED` | Tenant remains `PENDING_PAYMENT` | Payment-required notice; audit instructions issued |
| `PAYMENT_SUBMITTED` | Valid evidence command accepted | View/update before review; reviewer starts review | `UNDER_REVIEW`, `ACTION_REQUIRED`, `CANCELLED` | No lifecycle change | Confirmation notification; audit submission, mask proof URL/reference |
| `UNDER_REVIEW` | Authorized reviewer claims/opens actionable review | Approve, reject, request information | `PAID`, `REJECTED`, `ACTION_REQUIRED` | No lifecycle change until approval | Review UI/history; audit reviewer and version |
| `ACTION_REQUIRED` | Reviewer requests information | Amend/resubmit or cancel | `PAYMENT_SUBMITTED`, `CANCELLED`, `EXPIRED` | Tenant remains `PENDING_PAYMENT` | Safe request-information notice; audit reason code/note |
| `PAID` | Idempotent approval or verified provider event | View; refund through future supported flow | Terminal for activation eligibility | Tenant -> `PENDING_ACTIVATION`; subscription/invoice settlement updated | Approval notice; audit verifier/time/amount |
| `REJECTED` | Authorized rejection | Correct and resubmit if policy permits; cancel | `PAYMENT_SUBMITTED`, `CANCELLED`, `EXPIRED` | Tenant remains `PENDING_PAYMENT` | Safe rejection notice; audit reason |
| `FAILED` | Technical provider/storage/orchestration failure | Retry eligible operation | Prior business state or `CANCELLED` | No automatic tenant transition | Safe failure/retry UI; operational audit |
| `EXPIRED` | Due/access/policy expiry reached | Authorized reissue/extend or cancel | `AWAITING_PAYMENT`, `CANCELLED` | Tenant remains pending unless cancellation policy applies | Expiry notice/audit |
| `CANCELLED` | Authorized cancellation | Read only | Terminal | Lifecycle handled by explicit cancellation command | Cancellation audit/notification |
| `DEFERRED` | Plan policy permits invoice-later | View policy; later collection outside Flow 4 | Policy-controlled future collection states | `PENDING_ACTIVATION` or `ACTIVE` per policy | Explain due terms; audit policy snapshot |

Existing `PENDING` payment values are ambiguous and must be mapped during implementation: no evidence means `AWAITING_PAYMENT`; accepted evidence means `PAYMENT_SUBMITTED`; existing `SUCCEEDED` maps to `PAID`. Invoice `DRAFT/PENDING/PAID` values remain unchanged and must not be reused as the full payment workflow.

## Existing data model and required delta

| Requirement | Existing table/field | Reuse | Modify | New field/table | Reason |
|---|---|---:|---:|---|---|
| Invoice totals, currency, due date, number | `subscription_invoices` | Yes | Remove remaining runtime `LKR` fallback; keep concurrency | None | Invoice is expected-amount authority |
| Payment amount/currency/status | `subscription_payment_transactions.amount`, `.currency_code`, `.transaction_status` | Yes | Expand canonical status vocabulary and transitions | None | Avoid duplicate payment aggregate |
| Invoice association | `subscription_payment_transactions.invoice_id` | Yes | Make legacy duplicate FK semantics consistent | None | Existing ownership is sufficient |
| Provider/method | `.provider_name` | Partial | `MANUAL`, `STRIPE`, `PAYHERE`; add provider-neutral method code | `payment_method` | Provider and payer method are distinct |
| Manual reference | `.provider_transaction_reference` | Partial | Treat as external/manual reference with scoped normalization | Optional `manual_reference_normalized` | Duplicate advice/detection without fake provider IDs |
| Expected amount | `subscription_invoices.total_amount/balance_due` | Yes | Join and validate under lock | None | Do not duplicate authority |
| Submitted/paid amount and date | `.amount`, `.paid_at` | Partial | Clarify submitted vs received semantics | `submitted_at`, `payment_date`, `received_at` | Evidence and approval dates differ |
| Submitter and note | None | No | No | `submitted_by_type`, `submitted_by_id`, `payer_note` | Accountability; note is scrubbed/masked |
| Verification | None | No | No | `verified_by_platform_user_id`, `verified_at`, `review_note`, `rejection_reason_code` | Required review evidence |
| Payment concurrency | `updated_at` exists | Partial | Configure as concurrency token or add monotonic version | `version` if timestamp contract is insufficient | Concurrent review protection |
| Command idempotency | `.idempotency_key` plus partial unique index | Yes | Store hash/namespaced key and request hash | `request_hash` | Same-key changed-payload conflict |
| Provider callback event | Provider transaction fields | Partial | Keep provider payment/session reference | `provider_event_id` unique nullable | Signed callback deduplication |
| Secure payment-status access | `subscription_payment_links` token hashes/status/expiry | Yes | Define as purpose-bound access record for `MANUAL`; never persist raw token-bearing URL | `link_purpose`; nullable/deprecated raw `payment_url` | Enables `paymentStatusUrl` without pretending it is checkout |
| Provider checkout URL | Existing `payment_url` is ambiguous | No | Separate projection/storage semantics | `checkout_url` nullable or provider-session safe reference | Must remain null for manual payment |
| Invoice URL | Invoice ID/authorization | Yes | Generate authorized route, do not store public URL | None | Avoid token leakage/staleness |
| Proof content | Existing private blob infrastructure; `media_assets` is image-only | Partial | Extend safe asset type/actor rules if reused | `subscription_payment_evidence` association | Support PDF/image proof, revisions, access control, retention |
| Review history | Subscription history is too broad | No | No | `subscription_payment_reviews` | Immutable approve/reject/request-info chronology |
| Instructions | No payment-policy aggregate | Partial | Server configuration/catalogue is authority; snapshot on issued invoice | Versioned `manual_payment_instructions` snapshot in billing JSON or approved structured column | Instructions must remain historically traceable |
| Operation/result | `platform_tenant_onboarding_operations` | Yes | Project full payment status and activation eligibility | None | Existing polling resource |
| Async notification/work | `integration_outbox_messages` | Yes | Add manual-payment event handlers | None | Shared durable delivery architecture |

Proof blobs are private. APIs return short-lived authorized download URLs, never durable public URLs. Allowed MIME types, size, malware scanning, checksum, retention, uploader context, and tenant/payment ownership must be enforced. A guessable tenant, invoice, or asset ID is never sufficient authorization.

## API architecture

The existing Flow 4 draft/finalize/operation group is retained. Manual-payment review belongs to the existing Platform Billing boundary; recipient access uses a separate purpose-bound payment-access boundary.

### Flow 4 and status

| Method/route | Purpose | Authority |
|---|---|---|
| `GET /api/v1/platform-admin/tenant-onboarding/operations/{operationId}` | Onboarding payment/activation/invitation projection | `platform.tenants.view`; bounded result for creator |
| `POST /api/v1/platform-admin/tenant-onboarding/operations/{operationId}/retry` | Retry eligible notification/activation work | Domain permission plus idempotency key |
| `GET /api/v1/platform-admin/tenant-onboarding/tenants/{tenantId}/payment-status` | Safe onboarding payment/invoice outcome | `platform.billing.view` |
| `POST /api/v1/platform-admin/tenants/{tenantId}/activate` | Existing separate activation command | `platform.tenants.activate`, ETag, idempotency key |

### Secure recipient payment access

The `{accessToken}` is at least 256 random bits, expires, is purpose-bound to payment/invoice/tenant, is rate limited, and is stored only as a keyed hash. Authenticated tenant/billing recipients may use an equivalent session-bound route.

| Method/route | Purpose | Key controls |
|---|---|---|
| `GET /api/v1/tenant-onboarding/payment-access/{accessToken}` | Instructions, invoice summary, current status, safe URLs | Hash lookup; expiry/purpose; redacted DTO; no tenant-ID lookup |
| `GET /api/v1/tenant-onboarding/payment-access/{accessToken}/invoice` | Authorized invoice view/download | Same access; content disposition; audit |
| `POST /api/v1/tenant-onboarding/payment-access/{accessToken}/evidence` | Submit proof and payment details | Idempotency key; amount/currency/method/date validation; malware-safe upload boundary |
| `PUT /api/v1/tenant-onboarding/payment-access/{accessToken}/submissions/{paymentId}` | Amend eligible submission/action-required response | ETag; same ownership; status policy |
| `GET /api/v1/tenant-onboarding/payment-access/{accessToken}/history` | Safe submission/review outcome history | Redacted reviewer/contact data |

### Platform Admin manual review

| Method/route | Purpose | Permission/control |
|---|---|---|
| `GET /api/v1/platform-admin/billing/manual-payments` | Review queue | `platform.billing.view` |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}` | Expected/submitted amounts, proof, history | `platform.billing.view`; proof URL separately authorized |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/proof/{evidenceId}` | Short-lived proof access | `platform.billing.view`; audit access |
| `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/review` | `APPROVE`, `REJECT`, or `REQUEST_INFORMATION` | `platform.billing.manage`; ETag; idempotency; note/reason policy |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/history` | Immutable review history | `platform.billing.view` |
| `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/notification/resend` | Resend payment notice/outcome | `platform.billing.manage`; rate limit; idempotency |

The review command transaction locks the payment/invoice/tenant state, verifies the current version and request hash, appends review/audit history, updates payment/invoice, and on approval moves the tenant only to `PENDING_ACTIVATION` plus queues activation eligibility. It never sends email or sets the tenant directly to `ACTIVE`.

Stable errors include `manual_payment.validation_failed`, `access_invalid_or_expired`, `concurrency_conflict`, `idempotency_conflict`, `invalid_transition`, `amount_mismatch`, `currency_mismatch`, `proof_required`, `proof_access_denied`, `review_note_required`, `not_found`, `access_denied`, and `rate_limited`.

### DTO and transaction registry

| DTO | Required fields / response projection | Validation and privacy |
|---|---|---|
| `ManualPaymentStatusResponse` | tenant/payment/invoice safe references; expected amount/tax/total/currency/due date; status/version; plan/cycle; instructions; `invoiceUrl`; `paymentStatusUrl`; nullable `checkoutUrl`; activation/invitation status | No contact, bank, proof-storage or token values outside the authorized audience |
| `SubmitManualPaymentEvidenceRequest` | payment method, bank/transaction reference, submitted amount, currency, payment date, proof upload/reference, optional payer note | Amount positive; currency must equal invoice; reference/method allow-listed; date policy; proof required and private; bounded scrubbed note |
| `UpdateManualPaymentSubmissionRequest` | corrected eligible fields, new evidence revision or information-request response, expected version | Allowed only from `PAYMENT_SUBMITTED` before review where policy permits, `ACTION_REQUIRED`, or approved rejected-resubmission policy; history retained |
| `ManualPaymentSubmissionResponse` | payment ID, status/version, safe reference suffix, amounts/currency/date, evidence metadata, submitted/updated timestamps, next action | No raw proof URL; short-lived proof access is a separate authorized operation |
| `ManualPaymentReviewRequest` | action, expected version, optional/required review note and safe reason code | Approve requires valid evidence and exact amount/currency policy; reject/request-information require approved reason/note policy; no client status/tenant mutation |
| `ManualPaymentReviewResponse` | payment/invoice/tenant statuses and versions, review ID/result, activation eligibility, operation/status links | Reviewer identity projected only to authorized Platform Admin/audit viewers |
| `ManualPaymentReviewHistoryResponse` | ordered action/status chronology, safe reason/note, timestamps, authorized actor label | Proof/bank/contact/token values masked; immutable chronology |
| `ResendPaymentNotificationRequest` | notification type and optional reason | Status eligibility, command idempotency, rate limit; cannot change payment status |

Evidence upload may use a two-stage private upload protocol, but the final submission command must bind the completed/scanned object to the payment and be idempotent. An orphan cleanup policy removes unbound uploads. Object-storage success alone never changes payment status.

Local transaction boundaries:

- Submit/update: lock payment/access context, validate invoice and object binding, append evidence/submission/audit and notification outbox, update status/version, commit.
- Review: lock payment/invoice/tenant, validate ETag/idempotency/request hash/state/amount/currency/evidence, append review/audit, update payment/invoice and—only for approval—tenant `PENDING_ACTIVATION` plus activation-eligible outbox, commit.
- Resend/retry: validate status/permission/rate limit, append command/audit/outbox, commit; provider/email calls occur later.

## Provider-neutral future gateway boundary

Use the established application/infrastructure naming convention for a contract equivalent to `IPaymentProvider`:

```text
CreatePaymentSession(invoice, return/callback context, idempotency key)
GetPaymentStatus(provider payment reference)
VerifyCallback(headers, raw body)
CancelPayment(provider payment reference, idempotency key)
RefundPayment(provider payment reference, amount, reason, idempotency key)
MapProviderStatus(provider status -> internal payment status)
```

Provider adapters are infrastructure implementations selected by server configuration:

- Manual handler: instructions, secure status access, evidence, human review; never creates a gateway session.
- Stripe adapter: checkout/session API, signed webhook, event deduplication, reconciliation.
- PayHere adapter: checkout/request signature, callback signature verification, event/reference deduplication, reconciliation.

Provider callbacks enter one shared application command after adapter verification. It validates provider configuration, event uniqueness, payment/invoice/tenant references, expected amount/currency, current state, and idempotency before writing status/history/outbox atomically. Provider payloads are reduced to an allow-listed redacted record; secrets and raw payloads are not retained in business audit.

Future integration changes only configuration, adapter, callback endpoint/processor, provider session/reference storage, and provider contract tests. Flow 4 finalization, invoice ownership, payment state machine, activation command, invitation handoff, and UI result model remain unchanged.

## Permissions

No new R1 permission code is required:

- `platform.billing.view`: payment queue/detail/proof/history/status reads.
- `platform.billing.manage`: review, approve, reject, request information, retry/resend payment work, and waiver where supported.
- `platform.tenants.activate`: separate post-payment activation.
- `platform.tenants.update`: Tenant Admin invitation resend.
- `platform.audit.view`: unredacted-authorized audit projection, still subject to masking.

Recipient proof submission is authorized by authenticated tenant membership or the secure payment-access grant, not by a Platform Admin R1 permission.

## Audit and notification contract

Required correlated events: `tenant.finalized_pending_payment`, `invoice.generated`, `payment.instructions_issued`, `payment.notification_queued`, `payment.notification_sent`, `manual_payment.submitted`, `submission_updated`, `review_started`, `approved`, `rejected`, `information_requested`, `resubmitted`, `tenant.pending_activation`, `activation.queued`, `tenant.activated`, `tenant_admin.invitation_queued`, `invitation_sent`, `invitation_failed`, and `invitation_resent`.

Audit stores actor, entity/payment/invoice/draft/tenant IDs, UTC time, correlation/request/idempotency hashes, result, safe reason code, and masked changed fields. It excludes raw access/setup tokens, token-bearing URLs, proof URLs/storage keys, full bank/contact data, secrets, passwords, and unredacted provider payloads.

Separate communications are mandatory:

1. **Tenant created - payment required:** tenant/reference/status, plan/cycle, subtotal/tax/total/currency, invoice/due date, versioned manual instructions/reference format, `invoiceUrl`, `paymentStatusUrl`, and support contact. No setup credentials; `checkoutUrl` is null.
2. **Tenant activated - account setup:** active status, tenant identity, secure single-use setup link, expiry, and support. Sent only after activation.

Also define payment-submitted confirmation, approval confirmation, rejection/request-information notification, resubmission confirmation where useful, and invitation resend. Payment instructions and account credentials are never combined.

## Frontend target surfaces

The seven wizard steps remain unchanged. Step 4 shows the server-selected manual setup type and instructions summary. Result states are not new wizard steps.

Platform Admin target: Pending Payment result; review queue/detail; proof preview/download; expected-versus-submitted comparison; approve/reject/request information; history; activation status; invitation status; retry/resend.

Recipient target: invoice; instructions; status; secure proof upload; reference/details form; submission confirmation; request-information response; approval/rejection and activation status; final account-setup handoff.

Every surface defines loading, empty, failed, expired-access, permission-denied, conflict, retry, desktop/tablet/small viewport, keyboard, focus, labelled error, and live-region states. Proof controls must identify accepted file type/size and upload/scanning progress.

## Test and release gates

P0 coverage must include status transitions, validation, amount/currency mismatch, proof access and malware-safe storage boundary, concurrent reviewers, approval idempotency, rejection/information/resubmission, paid -> pending activation, separate activation, invitation timing, permissions, cross-tenant/token isolation, audit masking, notification separation, and `checkoutUrl == null` for manual payment.

Future provider contract tests cover Stripe/PayHere session mapping, signatures, callback deduplication, mismatches, duplicate/out-of-order callbacks, provider timeout/unknown result, cancellation/refund capability, and reconciliation. Live-provider tests remain future/environment-dependent and must not be represented as manual-payment release evidence.

## Related

- [[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]]
- [[FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT]]
- [[../06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX]]
- [[../02_ACCESS_CONTROL/FLOW_4_CREATE_TENANT_WIZARD_PERMISSION_MATRIX]]
- [[../10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX]]
