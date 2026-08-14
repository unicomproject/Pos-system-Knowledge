<!-- title: Flow 4 Secure Test-Host Contract Evidence 2026-08-05 -->
<!-- status: Documented and Approved - Runtime Pending -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 secure test-host contract evidence - 2026-08-05

## Executive result

The missing authority for F4-GAP-001/F4-REQ-070 is approved. Option E was selected: a separate non-HTTP test CLI reuses production token/hash and application/domain primitives, while typed test-only orchestration owns deterministic scenarios, a test-database-only ownership ledger, cleanup and process-local secret handoff. F4-GAP-002/F4-REQ-071 and end-to-end F4-GAP-008/F4-REQ-072 remain implementation/evidence work for Chunk 3. Production Flow 4 stays NO-GO; P0 verified coverage stays 59/64.

## Repository baseline

| Repository | Branch | Starting commit | Chunk 2 runtime changes |
|---|---|---|---|
| Backend | `feat/flow4-create-tenant-runtime` | `877703fc4150801e24c334caebf393d930b89f8e` | None |
| Angular | `feat/flow4-create-tenant-runtime` | `d4e9b3c93b44afc6ac6e5a691c0cfefbb83af159` | None |
| Second Brain | `docs/flow4-create-tenant-runtime` | `c5a9d0e254a3a56d8a000f77113c6726d1062e72` | Contract/evidence/traceability only |

Unrelated backend `projects/12_IMPLEMENTATION_TRACKING/Backend/Email/` and the two untracked 2026-07-31 Second Brain audit files were preserved and are excluded from this work.

## Documents read

Audit/ordering: Current Source of Truth; Flow 4 read manifest, traceability matrix, conflict/gap register and approved next scope; Chunk 1 migration decision/evidence.

Canonical Flow 4: create-tenant canonical specification, manual-payment/future-IPG architecture, API contract, field-to-table matrix, permission matrix, test matrix and decision register.

Security/lifecycle/email: Tenant Activation, Tenant Onboarding Email, Pre-Login Payment/Trial/Demo and First Login flows; Auth/Tokens/Security, Tenant User Access and Notification technical contracts; Invitations/Auth Tokens database document; Email Architecture, Email Event/Template Catalog and ACS Operations runbook.

Release: Flow 4 Release Environment and E2E Validation Evidence. The source IDs attributable to this chunk are DOC-002, DOC-013, DOC-017-DOC-026, DOC-040-DOC-050 and DOC-054, with direct requirement sources DOC-013/DOC-018/DOC-020/DOC-022/DOC-054 for F4-REQ-070-F4-REQ-072.

## Existing implementation inspected

| Area | Symbols/files and finding |
|---|---|
| Payment token | `ManualPaymentAccessTokenService.GenerateToken/HashToken`: 32 random bytes, base64url, domain-prefixed keyed hashing through `ITokenHashService` and configured signing key |
| Grant binding | `SubscriptionPaymentLink.CreateManualAccess`, `ProvisionToken`, `Allows`, `Revoke`: purpose/actions, tenant/invoice/payment, recipient hash, expiry/revocation/version; raw URL not persisted |
| Recipient API security | `ManualPaymentAccessController`, payment-access rate policy and `PaymentAccessRequestRedactionMiddleware`; anonymous access is token-authorized and token route logging is redacted |
| Payment worker | `TenantOnboardingOutboxWorker.DispatchManualPaymentAsync`: creates raw token in worker memory, persists hash before delivery and puts raw token only into the intended email body |
| Invitation worker | `DispatchInvitationAsync`: active-tenant gate, revokes old pending/sent invitations, generates 32 random bytes, keyed-hash persistence, bounded expiry, setup URL in email body only |
| Production registration | `E_POS.Api/Program.cs` and Infrastructure DI contain production services/worker only; no fixture controller/service/route exists |
| Existing test hosts | Three unit/API/integration projects; limited `WebApplicationFactory` usage; no Flow 4 bootstrap CLI or complete lifecycle builder |
| Development seed | `DevelopmentPlatformAdminTestAccountSeedHost` is Development-only and unsuitable as the E2E token/lifecycle authority |
| Playwright/CI | `manual-payment.e2e.spec.mjs`, env example, preflight, fixture generator, Playwright config and release workflow require environment-provided fixture aliases; no HTTP mocks or fake gateway path |

Idempotent finalization, submission, review, activation and invitation resend paths were inspected through their contracts/tests and existing matrix evidence. The contract requires Chunk 3 to invoke these paths wherever practical rather than inventing state transitions.

## Exact fixture inventory

| Fixture category | Current values | Provider/reason missing |
|---|---|---|
| Payment-access secrets | `FLOW4_AWAITING_TOKEN`, `FLOW4_SUBMITTED_TOKEN`, `FLOW4_REJECTED_TOKEN`, `FLOW4_ACTION_REQUIRED_TOKEN`, `FLOW4_INVALID_EVIDENCE_TOKEN`, `FLOW4_EXPIRED_TOKEN`, `FLOW4_HAPPY_TOKEN` | Production sends once through outbox/email; no approved test return boundary existed |
| Payment IDs | `FLOW4_SUBMITTED_PAYMENT_ID`, `FLOW4_APPROVABLE_PAYMENT_ID`, `FLOW4_PAID_PAYMENT_ID`, `FLOW4_REJECTABLE_PAYMENT_ID`, `FLOW4_INFO_PAYMENT_ID`, `FLOW4_CONFLICT_PAYMENT_ID`, `FLOW4_UNCLEAN_PAYMENT_ID`, `FLOW4_NOTIFICATION_FAILED_PAYMENT_ID`, `FLOW4_ACTIVE_PAYMENT_ID`, `FLOW4_HAPPY_PAYMENT_ID` | No deterministic state builder |
| Operation/URL values | `FLOW4_OPERATION_ID`, `FLOW4_RETRY_OPERATION_ID`, `FLOW4_HAPPY_OPERATION_ID`, `FLOW4_DUPLICATE_ASSERTION_URL`, `FLOW4_CROSS_TENANT_PROOF_URL`, `FLOW4_QUEUE_SEARCH` | Partly manual data; missing owned lifecycle/assertion manifest |
| Personas | admin, second admin, billing-view-only and no-billing credentials | Existing development seeds/manual secrets are not a complete run-owned protected contract |

`FLOW4_PROOF_FILE` is generated by the current safe synthetic fixture script and is not a raw-token fixture. Blob/proof lifecycle remains outside Chunk 2.

## Threat and architecture result

Fifteen threats (`F4-THREAT-001` through `F4-THREAT-015`) cover production exposure, persistence/leakage, replay/purpose/isolation, privilege/arbitrary mutation, shared/parallel environments, cleanup, production dependency/discovery, TTL and accidental email. Highest risks are production exposure, raw-secret leakage, wrong-purpose/cross-tenant access, arbitrary mutation, CI leakage and real-recipient delivery.

Controls are cumulative environment/database/credential guards, separate CLI/no HTTP, typed scenario allow-list, production primitives, one-time pipe handoff, hash-only persistence, run ledger, <=60-minute fixture TTL, ownership-bound cleanup, default email suppression and generated-secret artifact scanning.

## Documents created

- `13_DECISIONS_AND_CHANGES/FLOW_4_SECURE_TEST_HOST_TOKEN_AND_FIXTURE_CONTRACT_2026-08-05.md`
- `09_SECURITY_AND_COMPLIANCE/FLOW_4_TEST_FIXTURE_TOKEN_THREAT_MODEL_2026-08-05.md`
- `10_TESTING_QA/FLOW_4_SECURE_LIFECYCLE_FIXTURE_IMPLEMENTATION_CONTRACT_2026-08-05.md`
- this evidence document

Relevant traceability, gap, scope, Current SOT and Full Feature Status Index rows were updated. No backend or Angular code was changed; no token was generated; no full Playwright or live service run occurred.

## Production separation status

Current production source has no fixture endpoint, service or route. The approved design adds none. Compile-time/reference, DI resolution, endpoint/OpenAPI and publish-output proof are explicit Chunk 3 acceptance tests, not falsely reported as implemented here. Production environment/database rejection is contractually mandatory and remains to be proven by Chunk 3 code/tests.

## Validation and remaining work

Documentation validation must include link/path checks, required-section/ID checks, secret-like material scan, tracked-file review and `git diff --check`. Because this chunk is documentation-only, backend/Angular build/test reruns are not required and existing 1,470/1,470 backend and 453/453 Angular counts are background evidence only.

Chunk 3 must build the CLI/launcher, guards, scenario builders, manifest, secure transport, ownership ledger and cleanup; prove all negative security tests; and generate one sanitized, complete fixture manifest without logging/persisting its secrets. Later chunks still own 20/20 Playwright, real private proof, live ACS and recipient accessibility/responsiveness.

## Traceability result

- F4-REQ-070: `DOCUMENTED_APPROVED`; security authority exists, runtime verification pending.
- F4-REQ-071: remains `MISSING_IMPLEMENTATION`; approved implementation contract now exists.
- F4-REQ-072: remains `DOCUMENTED_ONLY`; cleanup design is approved, execution proof pending.
- F4-GAP-001: resolved as an authority/design gap; implementation acceptance is carried by F4-REQ-070 and Chunk 3 conditions.
- F4-GAP-002 and F4-GAP-008: remain open.
- P0 verified count: unchanged at 59/64.

## Final decision

**GO_TO_CHUNK_3 — Secure test-host and lifecycle fixture contract approved**

## Related

- [[../13_DECISIONS_AND_CHANGES/FLOW_4_SECURE_TEST_HOST_TOKEN_AND_FIXTURE_CONTRACT_2026-08-05]]
- [[../09_SECURITY_AND_COMPLIANCE/FLOW_4_TEST_FIXTURE_TOKEN_THREAT_MODEL_2026-08-05]]
- [[../10_TESTING_QA/FLOW_4_SECURE_LIFECYCLE_FIXTURE_IMPLEMENTATION_CONTRACT_2026-08-05]]
