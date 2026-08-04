<!-- title: Flow 4 Create Tenant Wizard Implementation Evidence -->
<!-- status: Runtime Implemented and Automated Gates Passing - Overall Production NO-GO -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 - Create Tenant Wizard implementation evidence

## Executive result

The durable seven-step onboarding foundation and the approved current-release manual-payment backend and Angular surfaces are implemented. Backend commits `db9d579d94ad5fb41355fa8aeaf01d55d0ea481a` and `994f19b211150745e77b231cfedff1b71721a839` provide secure recipient access, UI-complete projections, evidence submission and correction, immutable payment review, outbox notifications, payment-to-pending-activation, separate idempotent activation, activation-gated invitation handoff and a provider-neutral future IPG boundary. Angular commits `90d85f3` and `8bbfb3977b3c9afb0847fcd8974a6737d143d853` provide the recipient and Platform Billing runtime plus automated and Playwright coverage.

Backend and Angular automated gates are **GO**. The overall feature remains **NO-GO for production** because the 20 canonical real-browser scenarios were blocked/skipped for missing controlled environment and fixture credentials, and live Blob/ClamAV/email/public-URL validation has not been completed.

## Verified repository evidence

| Repository | Branch | Evidence |
|---|---|---|
| Unified Commerce backend | `feat/flow4-create-tenant-runtime` | Runtime `db9d579`; projection correction/final/pushed `994f19b` |
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | Runtime `90d85f3`; tests/E2E/final/pushed `8bbfb39` |
| Second Brain | `docs/flow4-create-tenant-runtime` | Canonical/evidence update in this documentation change |

The original backend runtime commit contains 63 files, 35,445 insertions and 70 deletions. The additive projection correction changes three files and has two contract tests. The only remaining backend working-tree item after commit is the unrelated pre-existing untracked `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` directory. The unrelated Second Brain full-project audit drafts were also excluded.

## Implemented runtime

- Prepaid finalization creates a real `MANUAL` payment with `AWAITING_PAYMENT`, a purpose-bound access grant, invoice, onboarding operation and payment-required outbox record. `checkoutUrl` remains null.
- Recipient status, invoice, evidence submit/update and history endpoints validate a keyed hash of the 256-bit access token, purpose, action, expiry, revocation and the tenant/payment/invoice relationship.
- PDF, JPEG and PNG evidence is length, extension, MIME and magic-byte validated, SHA-256 identified, malware scanned and stored behind the private Azure Blob adapter. Old evidence is retained and superseded.
- Platform Billing queue/detail/proof/history/review/resend use `platform.billing.view` or `platform.billing.manage` as appropriate.
- Review supports approve, reject and request-information with immutable snapshots, version concurrency and command idempotency. Approval validates the exact monetary and ownership chain and reaches only `PENDING_ACTIVATION`.
- Activation is a separate row-locked/idempotent command. It verifies the paid transaction/invoice/subscription/tenant chain and queues exactly one Tenant Admin invitation request after the tenant becomes active.
- `IPaymentProvider` defines create/status/callback/cancel/refund/status-map boundaries. The manual implementation has no checkout session or callback; Stripe/PayHere remain future work.
- Angular provides `/payment/:accessToken`, `/admin/billing/manual-payments` and `/admin/billing/manual-payments/:paymentId`; the public token is never stored or displayed and recipient requests bypass Platform bearer-token attachment.
- Recipient submission/correction, reviewer queue/detail/proof/history/decision, notification resend, separate activation, invitation resend and onboarding-result states are wired to the real APIs with permission and lifecycle gating.

## Database and migration

Migration `20260804110736_AddFlow4ManualPaymentRuntime` adds `subscription_payment_evidence` and `subscription_payment_reviews`, extends payment transactions and links, updates onboarding operation checks and introduces the required FKs/checks/indexes. Important unique indexes are `uq_subscription_payment_transactions_provider_event`, `uq_subscription_payment_links_active_purpose`, `uq_subscription_payment_links_token_hash`, `uq_subscription_payment_evidence_storage_key` and `uq_subscription_payment_reviews_payment_idempotency`.

Verification passed for representative apply, downgrade to `20260804055813_AddFlow4TenantOnboardingRuntime`, reapply, clean full migration chain and the EF pending-model-change check. Existing data is explicitly backfilled before temporary defaults are removed. No historical migration was modified.

## Automated evidence

| Validation | Result |
|---|---|
| Baseline backend solution | 1,436 pass: Unit 727, API 336, Integration 373 |
| Final backend solution | 1,460 pass: Unit 742, API 341, Integration 377; 0 failed |
| Final build | PASS; 0 warnings, 0 errors |
| Manual unit focus | 12 pass |
| Manual API/security focus | 5 pass |
| PostgreSQL manual migration/concurrency focus | 4 pass |
| Representative apply / rollback / reapply | PASS |
| Clean PostgreSQL migration chain | PASS |
| EF pending model changes | None |
| Changed-file format verification | PASS |
| `git diff --check` | PASS |
| Angular production build | PASS; same five pre-existing component style-budget warnings |
| Angular strict app/spec TypeScript | PASS |
| Angular full suite | 453 pass across 62 files; 0 failed |
| Flow 4 Playwright matrix | BLOCKED - 20 discovered, 20 environment-skipped, 0 passed |

The full repository formatter reports 785 pre-existing whitespace findings outside the implementation. The changed/new non-generated C# scope passes formatter verification. No test was removed or hidden.

## Remaining release gates

1. Execute and pass the 20 canonical browser E2E scenarios against isolated PostgreSQL and the production Angular build.
2. Complete keyboard/screen-reader and 360 px/tablet/desktop browser acceptance evidence.
3. Configure and validate private Blob storage, ClamAV, ACS email, payment-access base URL, tenant-admin base URL, manual instructions and support details in the target environment.
4. Capture live email delivery and private proof download/isolation evidence.
5. Add Stripe or PayHere only in a future provider phase; they do not block the manual-payment release.

Detailed evidence: [[FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]] and [[FLOW_4_MANUAL_PAYMENT_ANGULAR_IMPLEMENTATION_EVIDENCE_2026-08-04]].

## Release decision

**GO - Backend and Angular implementation/automated verification. Overall Flow 4 remains production NO-GO pending the listed real-browser and live-environment gates.**
