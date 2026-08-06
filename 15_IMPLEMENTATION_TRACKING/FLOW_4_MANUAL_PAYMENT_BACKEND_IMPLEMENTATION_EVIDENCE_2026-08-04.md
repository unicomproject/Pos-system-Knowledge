<!-- title: Flow 4 Manual Payment Backend Implementation Evidence 2026-08-04 -->
<!-- status: Backend Implemented and Verified - Angular Integrated -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 - Manual Payment backend implementation evidence - 2026-08-04

## A. Executive result

### Release-validation update - 2026-08-05

Safe live execution against isolated PostgreSQL/ClamAV/Azurite found and corrected a JSONB onboarding-history defect, a development business-code data defect and a real PostgreSQL queue translation defect. The final backend solution passes **1,461/1,461** tests and EF reports no pending model changes. Overall production remains **NO-GO** because 14 token/lifecycle-dependent browser scenarios, the real private-proof upload path and live ACS delivery remain blocked. See [[FLOW_4_RELEASE_ENVIRONMENT_AND_E2E_VALIDATION_EVIDENCE_2026-08-04]].

- Backend implementation: complete for the approved manual-payment phase.
- Database implementation: forward migration generated, inspected and verified on representative and clean PostgreSQL databases.
- Security implementation: purpose-bound hash-only access, redaction, rate limiting, private validated/scanned evidence and permissioned review are implemented.
- Additive integration correction: recipient/admin projections now contain every implemented UI field while internal evidence checksums remain excluded from public DTOs.
- Release readiness: backend automated gates pass; overall production remains gated by real-browser and target-environment dependencies.
- Decision: **GO - Backend implemented and verified for the manual-payment phase**.

## B. Repository evidence

| Item | Value |
|---|---|
| Repository | `C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Backend New\Unified-Commerce` |
| Branch | `feat/flow4-create-tenant-runtime` |
| Starting commit | `2a3c83e1a5cde8f99ae5e7e60698a01004b5943f` |
| Runtime backend commit | `db9d579d94ad5fb41355fa8aeaf01d55d0ea481a` |
| UI projection correction | `994f19b211150745e77b231cfedff1b71721a839` |
| Push | PASS - `origin/feat/flow4-create-tenant-runtime` advanced to `994f19b` |
| Scope | Runtime: 63 files, 35,445 insertions, 70 deletions; correction: 3 files, 90 insertions, 8 deletions |
| Working tree | Implementation clean; unrelated pre-existing untracked `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` preserved |
| Angular integration | Runtime `90d85f3`; tests/E2E/final `8bbfb3977b3c9afb0847fcd8974a6737d143d853` |

Major file groups: three new API controllers and redaction middleware; manual contracts/DTOs/service; payment constants/evidence/review and extended transaction/link entities; EF configurations/repositories/storage/scanner/token service/outbox worker; migration/snapshot; unit/API/PostgreSQL integration tests. A current development seed source was corrected to use bounded URLs so the clean migration chain can succeed; historical migrations were not edited.

## C. Existing architecture reused

| Boundary | Reuse/extension |
|---|---|
| Invoice | Reused `SubscriptionInvoice`; removed unconditional runtime currency fallback |
| Payment | Extended `SubscriptionPaymentTransaction`; retained provider-compatible nullable metadata |
| Payment access | Extended `SubscriptionPaymentLink` into a purpose/action/recipient-bound grant |
| Outbox | Reused `integration_outbox_messages`, leases, retry and worker |
| Blob/media | Reused the private Azure Blob infrastructure/options through a payment-evidence adapter |
| Activation | Extended existing tenant lifecycle/application service with a locked eligibility repository path |
| Invitation | Reused Tenant Admin membership, invite, worker token generation and hash-only persistence |
| Audit/history | Added immutable payment review/access/proof/submission records plus correlated outbox records |
| Permissions | Reused `platform.billing.view`, `platform.billing.manage`, `platform.tenants.activate` and `platform.tenants.update` |

No second onboarding, invoice, payment, outbox, activation or invitation architecture was introduced.

## D. Database changes

### Entities and tables

- `SubscriptionPaymentTransaction`: provider/method/status, exact tenant/subscription/invoice ownership, expected/submitted/approved amount, currency, manual reference, payment date, submitted/verified identities and timestamps, review/rejection/failure data, submission and review idempotency/request hashes, submission/version counters and nullable future-provider metadata.
- `SubscriptionPaymentLink`: exact payment link, purpose, allowed actions, recipient, keyed token hash, expiry, revoke/use/delivery/rotation/audit/version metadata.
- `subscription_payment_evidence`: private container/key, original and sanitized names, type/size/SHA-256/scan metadata, submission version, active/superseded lineage and tenant/payment/invoice FKs.
- `subscription_payment_reviews`: immutable actor/action/status/reason/note/amount/currency/evidence/version/idempotency/request/correlation snapshots.
- `platform_tenant_onboarding_operations`: expanded payment lifecycle and `PENDING_ACTIVATION` invitation state checks.

### Integrity and concurrency

- Named amount checks prevent invalid expected/submitted amounts.
- FKs restrict evidence/review/link ownership to the exact persisted payment lineage.
- Partial unique active-purpose and token-hash indexes prevent duplicate live access grants.
- Provider-event, evidence-storage-key and review-command indexes enforce deduplication.
- Monotonic payment/link versions plus PostgreSQL row locks serialize submission, review and activation.

### Migration evidence

| Item | Result |
|---|---|
| Migration | `20260804110736_AddFlow4ManualPaymentRuntime` |
| Representative existing DB apply | PASS |
| Downgrade to onboarding migration | PASS |
| Reapply | PASS |
| Clean DB full chain | PASS, approximately 40 seconds |
| Focused schema/migration tests | PASS |
| Pending model check | No changes pending |

The migration performs explicit legacy backfill and drops temporary defaults afterward. It adds only the intended forward delta and does not recreate the onboarding foundation.

## E. Backend APIs

| Method and route | Access model | Status/test evidence |
|---|---|---|
| `GET /api/v1/tenant-onboarding/payment-access/{token}` | Secure purpose-bound grant + anonymous rate limit | Implemented; domain/application/API tests |
| `GET /api/v1/tenant-onboarding/payment-access/{token}/invoice` | Same grant and exact invoice lineage | Implemented; unit projection tests |
| `POST /api/v1/tenant-onboarding/payment-access/{token}/evidence` | Grant action + `Idempotency-Key`; multipart | Implemented; validation/scanner/service tests |
| `PUT /api/v1/tenant-onboarding/payment-access/{token}/submissions/{paymentId}` | Grant action + expected version + idempotency | Implemented; state/idempotency tests |
| `GET /api/v1/tenant-onboarding/payment-access/{token}/history` | Recipient-safe grant | Implemented; history service path |
| `GET /api/v1/platform-admin/billing/manual-payments` | `platform.billing.view` | Implemented; permission/API and repository coverage |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}` | `platform.billing.view` | Implemented; permission/service coverage |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/proof/{evidenceId}` | `platform.billing.view` + exact evidence association | Implemented; private no-store response |
| `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/review` | `platform.billing.manage` + version/idempotency | Implemented; concurrent review test |
| `GET /api/v1/platform-admin/billing/manual-payments/{paymentId}/history` | `platform.billing.view` | Implemented; immutable history projection |
| `POST /api/v1/platform-admin/billing/manual-payments/{paymentId}/notification/resend` | `platform.billing.manage` + idempotency/rate limit | Implemented; outbox path |
| `GET /api/v1/platform-admin/tenant-onboarding/tenants/{tenantId}/payment-status` | `platform.billing.view` | Implemented; bounded projection |
| `POST /api/v1/platform-admin/tenant-onboarding/operations/{operationId}/retry` | Existing platform operation authorization | Implemented |
| `POST /api/v1/platform-admin/tenant-onboarding/tenants/{tenantId}/invitation/resend` | `platform.tenants.update`; activation-gated | Implemented |

Every manual projection keeps `checkoutUrl` null. No provider callback endpoint is exposed for the manual adapter.

## F. Manual payment state machine

Implemented lifecycle values: `NOT_REQUIRED`, `AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `UNDER_REVIEW`, `ACTION_REQUIRED`, `PAID`, `REJECTED`, `FAILED`, `EXPIRED`, `CANCELLED` and `DEFERRED`.

Implemented manual transitions:

- `AWAITING_PAYMENT -> PAYMENT_SUBMITTED`
- `ACTION_REQUIRED -> PAYMENT_SUBMITTED`
- `REJECTED -> PAYMENT_SUBMITTED`
- `PAYMENT_SUBMITTED -> UNDER_REVIEW -> PAID`
- `PAYMENT_SUBMITTED -> UNDER_REVIEW -> REJECTED`
- `PAYMENT_SUBMITTED -> UNDER_REVIEW -> ACTION_REQUIRED`

Entities own transitions; controllers and repositories cannot assign arbitrary statuses. Approval updates invoice/subscription/payment state consistently and moves the tenant only to `PENDING_ACTIVATION`. Invalid or stale transitions return stable application errors.

## G. Security controls

- 256-bit random recipient token; keyed/purpose-bound hash only at rest.
- Purpose, action, expiry, revocation, status and tenant/payment/invoice relationship validated on every recipient operation.
- Anonymous recipient surface has a dedicated rate-limit policy.
- Token-bearing path/raw-target values are redacted before exception middleware/logging.
- PDF/JPEG/PNG extension, MIME, magic bytes, size, amount, currency, date and normalized reference validation.
- Positive malware results are rejected before storage; unavailable scans are modeled explicitly; approval fails closed unless evidence is `CLEAN`.
- Evidence lives in private Blob storage; DTOs expose neither storage keys nor public proof URLs. Admin streams are exact-association checked with `private, no-store` caching.
- `platform.billing.view/manage` enforcement is in the application service and covered by direct-API authorization tests.
- Repository queries bind payment/evidence/review/access to tenant, subscription and invoice; cross-object substitution is rejected.
- Immutable history and outbox payloads contain safe identifiers/status data, not raw access/invitation tokens, bank details, proof URLs, storage credentials or provider secrets.
- Added configuration contains empty placeholders only; the source scan found no provider/storage/private-key secrets.

## H. Idempotency and concurrency

- Submission/update: row lock, current state/version check, hashed idempotency key + request hash; same-key/same-body replays, same-key/different-body conflicts; orphan upload cleanup on failure or replay loss.
- Review: row lock, exact expected version, reviewable state and clean evidence; unique payment/idempotency hash; conflicting concurrent decisions produce one persisted winner.
- Activation: tenant row lock and exact paid lineage; one activation succeeds, same request replays, one invitation outbox message exists.
- Notifications: shared outbox deduplication keys distinguish logical retries from intentional resend; lease/retry/failure fields are retained.
- Database unique indexes and row locks provide the final guard rather than in-memory checks alone.

## I. Activation and invitation handoff

Verified sequence:

1. Approved review commits payment `PAID`, invoice/subscription alignment and tenant `PENDING_ACTIVATION`.
2. No setup token or invitation is created by payment approval.
3. A separate authorized activation locks the tenant and verifies status, approved payment amount/currency, invoice/subscription ownership, entitlement readiness and Tenant Admin membership.
4. Activation commits tenant `ACTIVE` and exactly one invitation-request outbox record.
5. The worker generates the raw setup token in memory, persists only its keyed hash and sends the single-use URL.
6. Activation retry returns the existing outcome; concurrent activation cannot duplicate the invitation.

Legacy `MarkPaid` no longer creates activation eligibility by itself.

## J. Tests and validation

| Command/gate | Result | Count/failures | Duration |
|---|---|---|---|
| `dotnet restore E_POS.sln` | PASS | 0 failures | baseline |
| `dotnet build E_POS.sln --no-restore` | PASS | 0 warnings, 0 errors | final 2.63 s |
| Full UnitTests project | PASS | 742/742, 0 failed | final solution run |
| Full ApiTests project | PASS | 341/341, 0 failed | approximately 5 s |
| Full IntegrationTests project | PASS | 377/377, 0 failed | approximately 1 min |
| Complete solution after Angular projection correction | PASS | 1,460/1,460, 0 failed | approximately 152 s |
| Manual-payment unit focus | PASS | 12/12 | focused run |
| Manual-payment API/redaction focus | PASS | 5/5 | focused run |
| PostgreSQL manual migration/concurrency focus | PASS | 4/4 | approximately 57 s |
| Representative migration apply/rollback/reapply | PASS | all stages | direct PostgreSQL validation |
| Clean database full migration chain | PASS | all migrations | approximately 40 s |
| `dotnet ef migrations has-pending-model-changes ...` | PASS | no model changes | final |
| Scoped `dotnet format ... --verify-no-changes` | PASS | changed/new non-generated C# | final |
| `git diff --check` / staged diff check | PASS | no errors | final |

Baseline was 1,436 passing tests: Unit 727, API 336 and Integration 373. The final implementation and projection correction add 24 passing tests without regressing the existing suite. Repository-wide format verification reports 785 pre-existing whitespace findings; only the scoped changed-file verification is used as this change's formatting gate.

## K. Remaining work

### Angular frontend - completed

- Recipient instructions/status/invoice/evidence/correction/history states are implemented.
- Platform Billing review queue/detail/proof/review/history/resend states are implemented.
- Pending-payment, action-required, rejected, pending-activation and invitation handoff projections are implemented.
- Production build, strict TypeScript and 453/453 Angular tests pass. See [[FLOW_4_MANUAL_PAYMENT_ANGULAR_IMPLEMENTATION_EVIDENCE_2026-08-04]].

### Browser and environment

- Supply the controlled environment/credentials and pass the implemented canonical 20-scenario Playwright matrix; the current run discovered 20 and environment-skipped all 20.
- Complete responsive and keyboard/screen-reader browser acceptance evidence.
- Validate live/private Azure Blob container behavior, ClamAV connectivity/failure modes and authorized proof download.
- Validate ACS payment/invitation email delivery, recipient routing, retry and redacted telemetry.
- Configure `AzureBlobStorage`, `ManualPaymentEvidenceScanner`, `TenantOnboardingOutbox:PaymentAccessBaseUrl`, `TenantAdminAppBaseUrl`, `ManualPaymentInstructions` and `PaymentSupportDetails` through deployment configuration/secret storage.

### Future/non-blocking

- Implement Stripe and/or PayHere adapters, signatures, callbacks and reconciliation only when selected. Provider credentials are not present and are not required for manual payment.
- Resolve the repository-wide pre-existing formatting backlog independently.

## L. Second Brain updates

1. `05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE.md`
2. `15_IMPLEMENTATION_TRACKING/99_AUDITS/FLOW_4_MANUAL_PAYMENT_SECOND_BRAIN_ALIGNMENT_2026-08-04.md`
3. `03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC.md`
4. `05_BACKEND_ARCHITECTURE/FLOW_4_CREATE_TENANT_WIZARD_API_CONTRACT.md`
5. `06_DATABASE_KNOWLEDGE/Tables/FLOW_4_CREATE_TENANT_WIZARD_FIELD_TO_TABLE_MATRIX.md`
6. `02_ACCESS_CONTROL/FLOW_4_CREATE_TENANT_WIZARD_PERMISSION_MATRIX.md`
7. `10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX.md`
8. `13_DECISIONS_AND_CHANGES/FLOW_4_CREATE_TENANT_WIZARD_DECISION_REGISTER.md`
9. `15_IMPLEMENTATION_TRACKING/FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04.md`
10. `00_START_HERE/Current_Source_Of_Truth.md`
11. `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`
12. This dated backend evidence report.

## M. Git and PR

- Backend commits: `db9d579d94ad5fb41355fa8aeaf01d55d0ea481a` (`feat(billing): implement Flow 4 manual payment runtime`) and `994f19b211150745e77b231cfedff1b71721a839` (`fix(billing): complete manual payment UI projections`).
- Backend push: complete to `origin/feat/flow4-create-tenant-runtime`.
- Second Brain commit/push: recorded in the final task handoff after this document is committed.
- PR: prepare from `feat/flow4-create-tenant-runtime`; do not merge until review confirms migration/deployment settings and the backend P0 evidence above.
- Suggested title: `feat(billing): implement Flow 4 manual payment runtime`.

## N. Final decision

**GO - Backend implemented and verified for Angular/manual-payment integration.**

No backend security, data-integrity, migration or automated-test blocker remains. Overall Flow 4 is not complete and production remains gated by the real-browser and live-environment work in section K.
