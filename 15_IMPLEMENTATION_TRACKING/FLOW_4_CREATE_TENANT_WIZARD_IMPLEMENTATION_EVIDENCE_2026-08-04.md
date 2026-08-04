<!-- title: Flow 4 Create Tenant Wizard Implementation Evidence -->
<!-- status: In Progress - Backend Ready, Overall Production NO-GO -->
<!-- last_updated: 2026-08-04 -->

# Flow 4 - Create Tenant Wizard implementation evidence

## Executive result

Flow 4 is approximately **88%** complete. The durable seven-step onboarding foundation and the approved current-release manual-payment backend are implemented. Backend commit `db9d579d94ad5fb41355fa8aeaf01d55d0ea481a` adds secure recipient access, evidence submission and correction, immutable payment review, outbox notifications, payment-to-pending-activation, separate idempotent activation, activation-gated invitation handoff and a provider-neutral future IPG boundary.

The backend is **GO for Angular manual-payment implementation**. The overall feature remains **NO-GO for production** because the Angular recipient/reviewer surfaces, canonical browser E2E and live Blob/ClamAV/email/public-URL validation have not been completed.

## Verified repository evidence

| Repository | Branch | Evidence |
|---|---|---|
| Unified Commerce backend | `feat/flow4-create-tenant-runtime` | Started `2a3c83e`; final/pushed `db9d579` |
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | `306dcb7`; inspected only and unchanged |
| Second Brain | `docs/flow4-create-tenant-runtime` | Canonical/evidence update in this documentation change |

The backend commit contains 63 files, 35,445 insertions and 70 deletions. The only remaining backend working-tree item after commit is the unrelated pre-existing untracked `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` directory. The unrelated Second Brain full-project audit drafts were also excluded.

## Implemented runtime

- Prepaid finalization creates a real `MANUAL` payment with `AWAITING_PAYMENT`, a purpose-bound access grant, invoice, onboarding operation and payment-required outbox record. `checkoutUrl` remains null.
- Recipient status, invoice, evidence submit/update and history endpoints validate a keyed hash of the 256-bit access token, purpose, action, expiry, revocation and the tenant/payment/invoice relationship.
- PDF, JPEG and PNG evidence is length, extension, MIME and magic-byte validated, SHA-256 identified, malware scanned and stored behind the private Azure Blob adapter. Old evidence is retained and superseded.
- Platform Billing queue/detail/proof/history/review/resend use `platform.billing.view` or `platform.billing.manage` as appropriate.
- Review supports approve, reject and request-information with immutable snapshots, version concurrency and command idempotency. Approval validates the exact monetary and ownership chain and reaches only `PENDING_ACTIVATION`.
- Activation is a separate row-locked/idempotent command. It verifies the paid transaction/invoice/subscription/tenant chain and queues exactly one Tenant Admin invitation request after the tenant becomes active.
- `IPaymentProvider` defines create/status/callback/cancel/refund/status-map boundaries. The manual implementation has no checkout session or callback; Stripe/PayHere remain future work.

## Database and migration

Migration `20260804110736_AddFlow4ManualPaymentRuntime` adds `subscription_payment_evidence` and `subscription_payment_reviews`, extends payment transactions and links, updates onboarding operation checks and introduces the required FKs/checks/indexes. Important unique indexes are `uq_subscription_payment_transactions_provider_event`, `uq_subscription_payment_links_active_purpose`, `uq_subscription_payment_links_token_hash`, `uq_subscription_payment_evidence_storage_key` and `uq_subscription_payment_reviews_payment_idempotency`.

Verification passed for representative apply, downgrade to `20260804055813_AddFlow4TenantOnboardingRuntime`, reapply, clean full migration chain and the EF pending-model-change check. Existing data is explicitly backfilled before temporary defaults are removed. No historical migration was modified.

## Automated evidence

| Validation | Result |
|---|---|
| Baseline backend solution | 1,436 pass: Unit 727, API 336, Integration 373 |
| Final backend solution | 1,458 pass: Unit 740, API 341, Integration 377; 0 failed |
| Final build | PASS; 0 warnings, 0 errors |
| Manual unit focus | 12 pass |
| Manual API/security focus | 5 pass |
| PostgreSQL manual migration/concurrency focus | 4 pass |
| Representative apply / rollback / reapply | PASS |
| Clean PostgreSQL migration chain | PASS |
| EF pending model changes | None |
| Changed-file format verification | PASS |
| `git diff --check` | PASS |

The full repository formatter reports 785 pre-existing whitespace findings outside the implementation. The changed/new non-generated C# scope passes formatter verification. No test was removed or hidden.

## Remaining release gates

1. Implement the Angular payment-status/evidence and Platform Billing review surfaces.
2. Execute the canonical browser E2E, accessibility and responsive scenarios.
3. Configure and validate private Blob storage, ClamAV, ACS email, payment-access base URL, tenant-admin base URL, manual instructions and support details in the target environment.
4. Capture live email delivery and private proof download/isolation evidence.
5. Add Stripe or PayHere only in a future provider phase; they do not block the manual-release backend.

Detailed backend evidence: [[FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]].

## Release decision

**GO - Backend ready for Angular manual-payment implementation. Overall Flow 4 remains production NO-GO pending the listed UI, E2E and environment gates.**
