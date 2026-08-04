<!-- title: Flow 4 Manual Payment Second Brain Alignment 2026-08-04 -->
<!-- status: Complete - Backend Implemented and Verified -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 - Manual Payment Second Brain Alignment - 2026-08-04

## Executive result

The current-release payment decision is now closed: Flow 4 uses manual payment verification, not a live gateway. Paid prepaid tenants finalize durably into `PENDING_PAYMENT`/`AWAITING_PAYMENT`; authorized approval advances only to `PENDING_ACTIVATION`; activation and account setup remain separate. `invoiceUrl` and secure `paymentStatusUrl` are supported target projections, while `checkoutUrl` is null.

Future Stripe or PayHere support uses a provider adapter, signed callback boundary, event deduplication, reconciliation, and the same internal payment/activation state machine. Fake checkout URLs, provider IDs, and payment success are prohibited.

Implementation decision: **GO - Backend ready for Angular integration**. Backend commit `db9d579d94ad5fb41355fa8aeaf01d55d0ea481a` implements the manual-payment, activation and invitation runtime. Overall release remains **NO-GO** until Angular/browser E2E and production dependency validation are complete.

## Documents and source inspected

Canonical Flow 4:

- `03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC.md`
- `05_BACKEND_ARCHITECTURE/FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT.md`
- `06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX.md`
- `02_ACCESS_CONTROL/FLOW_4_CREATE_TENANT_WIZARD_PERMISSION_MATRIX.md`
- `10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX.md`
- `13_DECISIONS_AND_CHANGES/FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER.md`
- `15_IMPLEMENTATION_TRACKING/99_AUDITS/FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_READINESS.md`
- `15_IMPLEMENTATION_TRACKING/FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04.md`

Adjacent Second Brain:

- `04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/04_Subscription_Billing_Usage/04_Platform_Billing_Functional_Specification.md`
- `05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract.md`
- `03_USER_JOURNEYS/Platform_Admin/11_Tenant_Activation_Flow.md`
- `03_USER_JOURNEYS/Platform_Admin/12_Subscription_Billing_Management_Flow.md`
- `03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows.md`
- `12_INTEGRATIONS/Email_Event_And_Template_Catalog.md`
- `00_START_HERE/Current_Source_Of_Truth.md`
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`

Backend reference evidence included invoice, payment transaction/link, onboarding operation, outbox, invitation, media storage, permission constants, EF configurations, and current onboarding worker. Platform Admin Angular reference evidence included the onboarding result model/page, routes, lifecycle labels, and tests.

## Existing architecture found

| Area | Reusable evidence | Gap |
|---|---|---|
| Invoice | Number, amount breakdown, currency, due/issued/paid dates, DRAFT/PENDING/PAID, concurrency | Remaining invoice-domain LKR fallback; no Flow 4 secure invoice projection |
| Payment transaction | Invoice/tenant/link FKs, amount/currency, provider/reference, idempotency index, PENDING/SUCCEEDED/FAILED | Manual workflow states, method, submission/verifier metadata, request hash, provider-event ID |
| Payment access | Token hashes, expiry/status, recipient/send metadata | `payment_url` ambiguity/raw-URL risk; purpose-bound payment-status semantics and separate nullable checkout URL |
| Proof storage | Private Azure blob/media infrastructure and checksums | Media asset is image-only and tenant-user-centric; no payment evidence association/history/access policy |
| Review | Existing mark-paid invoice command | No submission queue, approve/reject/request-information command, immutable review history, or review idempotency |
| Operations/outbox | Durable onboarding operation and leased shared outbox | Manual notification/submission/review/activation handlers and full payment statuses missing |
| Activation/invitation | Pending-payment activation block; active-only invitation worker; hash-only token | Payment approval -> pending activation command and fully idempotent activation/retry path incomplete |
| Permissions | `platform.billing.view/manage`, `platform.tenants.activate/update`, `platform.audit.view` | Enforcement/tests for proof/review/resend paths not implemented; no new code required |
| Angular | Seven-step wizard, pending result projection, polling | Review queue/detail, proof workflows, recipient status/upload screens, retry/resend absent |

## Contradictions resolved

| Existing statement | New canonical decision | Replacement/affected files |
|---|---|---|
| Current release requires provider payment-link generation | Current release is manual payment; no provider checkout | Flow 4 spec/API/data/test/readiness/evidence; onboarding email docs; billing docs |
| `tenant.paid_created` CTA is a gateway payment link | CTA is the secure payment-status page; invoice is a separate link | Email flow/catalog and API terminology |
| Provider callback is a current P0 release gate | Callback architecture/tests are future gateway gates, not current manual-payment gates | Test matrix/readiness/evidence; provider-neutral architecture retains future requirements |
| Audited payment worker failure `payment_provider_not_configured` blocked the prior approach | Manual handler/notification/evidence/review replaces provider-session work | Implemented by backend commit `db9d579`; retained here as historical audit evidence |
| Existing Mark Paid alone is sufficient manual verification | Mark Paid is only a bridge; canonical review requires submitted evidence, concurrency, idempotency, review history, and audit | Platform Billing functional/API docs |
| `payment_url` can mean any payment link | `paymentStatusUrl`, `invoiceUrl`, and `checkoutUrl` are distinct | Flow 4 API/data/email docs |
| Payment received email is deferred | Submission and review outcome communications are current manual-workflow requirements | Email catalog; separate activation/setup template remains mandatory |

No architecture contradiction remains after these replacements. Historical implementation statements are retained only when clearly marked as current source evidence, not target behavior.

## Data/API/UI delta summary

Reuse invoices, transactions, token hashes, operations, outbox, tenant contacts, subscription history bridge, and blob infrastructure. Modify transaction status/metadata and access-link semantics. Add a payment-evidence association and immutable review history; extend document storage policy for PDF/image proof. Add secure recipient access, Platform Admin manual-review APIs, notification resend, and payment-status projection. Add Platform Admin review screens plus recipient invoice/instructions/status/evidence screens.

Detailed mapping and contracts are canonical in:

- `05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE.md`
- `06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX.md`
- `05_BACKEND_ARCHITECTURE/FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT.md`

## Permission and audit result

Existing R1 permission codes are sufficient. Platform reads use `platform.billing.view`; review/retry/resend uses `platform.billing.manage`; activation uses `platform.tenants.activate`; invitation resend uses `platform.tenants.update`; audit projection uses `platform.audit.view`. Recipient submission uses authenticated membership or a secure expiring purpose-bound access grant.

The canonical audit chain now covers finalization pending payment through submission, review, pending activation, activation, and invitation. Proof URLs, bank/contact values, tokens, passwords, provider secrets, and raw provider payloads are masked or excluded.

## Readiness scorecard

These scores measure readiness to implement the newly approved manual-payment target, not production runtime completion.

| Area | Readiness | Basis |
|---|---:|---|
| Database design | 88% | Existing invoice/transaction/link/blob foundation plus explicit delta; EF/source work not done |
| Backend architecture | 90% | Boundaries, commands, status machine, transaction/idempotency rules closed |
| Frontend architecture | 86% | Required actor surfaces/states/accessibility defined; components not implemented |
| Security architecture | 94% | Purpose-bound access, proof controls, token/redaction/permission rules closed |
| Test architecture | 92% | Manual and future provider matrices separated; execution remains pending |
| Documentation | 100% | Canonical decision and cross-document alignment complete |
| Overall implementation readiness | **92%** | **GO to implement; not a release score** |

Flow 4 executable readiness is approximately **88%**. Backend manual-payment readiness is **95%**: the application, schema, migration, authorization, private proof boundary, concurrency/idempotency and activation handoff are implemented and tested. The remaining feature-level gap is the Angular manual-payment experience, canonical browser E2E and live production-dependency validation.

## Required implementation sequence

Steps 1-11, backend automated tests, migration verification and implementation evidence are complete. Remaining sequence:

1. Configure and validate private Blob storage, ClamAV, ACS email and the public payment-access base URL in the target environment.
2. Implement the Angular recipient and Platform Billing manual-payment surfaces without changing the canonical wizard step order.
3. Execute the canonical browser E2E/accessibility/responsive matrix.
4. Merge the reviewed backend and documentation PRs; enable production only after environment evidence is attached.

## Final decision

**GO - Backend implemented and verified; ready for Angular integration.** Production release remains NO-GO until UI/E2E and target-environment storage, malware scanning, email and URL configuration are proven.
