<!-- title: Flow 4 Document Conflict and Gap Register 2026-08-05 -->
<!-- status: Current Audit -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 document conflict and gap register — 2026-08-05

## Authority rule

The explicit Current Source of Truth and canonical Flow 4 specification/decision/API/database/permission/test pack control. Supporting documents remain valid only where they do not disagree. Implementation evidence proves current state but cannot change a requirement. “Resolved by hierarchy” below means implementation may safely follow the named canonical decision; it does not mean the stale document has been silently rewritten.

## Conflict register

| Conflict ID | Topic | Document A | Document B | Difference | Authority Assessment | Current Decision | Resolution Required |
| ----------- | ----- | ---------- | ---------- | ---------- | -------------------- | ---------------- | ------------------- |
| F4-CONFLICT-001 | Current payment collection | `Included_Features.md`, old wizard/billing/email wording | Current SOT, canonical spec, manual-payment architecture, D27 | A requires PayHere/provider “payment links”; B requires manual instructions + secure status and `checkoutUrl=null` | B is explicit canonical current authority | Manual verification only; Stripe/PayHere deferred | Mark remaining current-scope gateway wording historical/superseded in a separate docs correction |
| F4-CONFLICT-002 | Mark Paid versus evidence review | `10_Billing_Flow.md` and legacy Platform Billing bridge | Manual-payment architecture/API/permission/test pack | A treats direct Mark Paid as sufficient verification; B requires private clean proof, version, command idempotency and review history | Canonical manual-payment pack controls Flow 4 | Direct Mark Paid cannot establish Flow 4 activation lineage | Deprecate/narrow Mark Paid Flow 4 claims; preserve as non-Flow-4 billing compatibility history |
| F4-CONFLICT-003 | Payment-link storage semantics | `Tables/05_Subscription_Billing_Payments_And_Usage_UPDATED.md` | Canonical field-to-table matrix + manual-payment architecture | A has required raw-ish `payment_url` and provider-link semantics; B stores a purpose-bound hash and never persists token-bearing URL; checkout nullable | Canonical Flow 4 DB delta controls | Reuse the baseline tables with the current manual migration delta | Add a conspicuous Flow 4 addendum to generic Table 05; do not rewrite ERD history |
| F4-CONFLICT-004 | Email/outbox implementation status | Approved Email Architecture and ACS Runbook current-capability tables | Backend/Angular/release evidence | A says onboarding email/outbox not implemented; evidence proves shared outbox and Flow 4 handlers exist, while live ACS remains blocked | Architecture/security rules remain authoritative; its status table is stale evidence | Outbox/runtime implemented; provider acceptance/delivery not live-validated | Factual documentation-status correction only; keep provider/security decisions intact |
| F4-CONFLICT-005 | Wizard steps/draft model | Superseded `04_Create_Tenant_Wizard_Flow.md` and `16_...Alignment.md` | Canonical spec + D01/D02 | Old one-shot sequence has separate limits/add-ons and no dedicated draft | Canonical spec explicitly supersedes both | Fixed canonical seven steps and dedicated versioned draft | No implementation decision needed; keep historical banners and prevent index promotion |
| F4-CONFLICT-006 | Email event URL terminology | Some onboarding email/catalog rows say payment link | Manual-payment architecture | Generic phrase can imply provider checkout; canonical requires invoice/status URLs and null checkout | Manual architecture is newer and explicitly authoritative | Name exact purpose URLs; never call status route a gateway link | Targeted terminology correction proposal |
| F4-CONFLICT-007 | Production migration scope | Migration rules require readable, production-safe forward data handling | Original `20260804190000_BackfillDevelopmentRetailBusinessCode` summary/comment and SQL | Original migration targeted a development UUID and had destructive Down behavior | [[../13_DECISIONS_AND_CHANGES/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_DISPOSITION_2026-08-05]] now supplies explicit migration authority | **Resolved:** guarded natural-provenance repair + forward history bridge + non-destructive rollback | Closed by backend `877703f` and focused PostgreSQL evidence |

No unresolved product conflict remains for the manual-payment lifecycle itself. F4-CONFLICT-007 is resolved; the migration disposition is no longer a release-critical gap.

## Gap register

| Gap ID | Requirement IDs | Gap Type | Description | Affected Layer | Severity | Release Impact | Recommended Resolution |
| ------ | --------------- | -------- | ----------- | -------------- | -------- | -------------- | ---------------------- |
| F4-GAP-001 | F4-REQ-070 | RESOLVED AUTHORITY GAP - IMPLEMENTATION PROOF PENDING | The 2026-08-05 secure test-host decision approves a separate non-HTTP CLI/hybrid, cumulative environment/database/credential guards, production token/hash reuse, one-time process-pipe return, hash-only persistence, <=60-minute TTL, redaction and ownership-bound teardown. | Security, backend test host, CI | P0 requirement remains non-verified | Uncontrolled workaround remains prohibited; Chunk 3 must prove the approved boundary | Implement and test the approved decision/implementation contract; no production controller, DI registration or Swagger route |
| F4-GAP-002 | F4-REQ-071 | FIXTURE_GAP / TEST_GAP - CONTRACT APPROVED | Deterministic builders remain absent, but the exact typed scenario allow-list, manifest, state-invariant and direct-persistence exception rules are approved. | Backend test infrastructure, PostgreSQL, Playwright | P0 | Still blocks 14 browser scenarios and reproducible CI | Chunk 3 implements the separate CLI using application/domain commands and scenario-specific test assemblers only; never uncontrolled production DB mutation |
| F4-GAP-003 | F4-REQ-061 | CLOSED INTERNAL (Chunk 6A) | Chunk 6A proved private proof upload/review via Azurite + ClamAV on fixture-token recipient/admin paths (Playwright E2E proof scenarios). Live ACS-originated links remain separate (F4-GAP-004). | Blob, recipient API/UI, review API/UI | P0 internal closed | Internal proof path met | Keep Azurite/ClamAV in E2E launcher; see [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] |
| F4-GAP-004 | F4-REQ-056,063 | LIVE_SERVICE_GAP — PARTIAL ENV PROGRESS (Chunk 5E/6A) | ACS User Secrets + sender remain PASS. Chunk 6A closed **internal** 21/21 Playwright with SUPPRESSED email (no live ACS). Controlled mailbox, recipient allow-list and approved HTTPS payment/setup bases remain unavailable. Live ACS send/inbox receipt still **BLOCKED_EXTERNAL**. | Email, outbox, operations | P0 | Provider acceptance + mailbox still unproven | Supply controlled mailbox + allow-list + approved HTTPS bases; then live ACS closure. Internal suite: [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] |
| F4-GAP-005 | F4-REQ-060,067 | CLOSED INTERNAL (Chunk 6A) / EXTERNAL STILL OPEN | Chunk 6A: **21/21** internal Playwright PASS (20 canonical + E2E 14b security regression); blanket external skip removed; fixtures + Azurite proof path proven. Live-email/HTTPS-originated link journeys remain externally blocked (F4-GAP-004). | Angular, API, DB, CI | P0 internal closed | External live-email gate remains | Keep internal suite green; close F4-GAP-004 for live ACS. See [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] |
| F4-GAP-006 | F4-REQ-059,069 | CLOSED (was DATABASE_GAP / REQUIREMENT_AMBIGUITY) | Guarded `20260804190000...` now uses exact natural seed provenance without UUID; `20260805120000...` covers already-recorded history; both Downs are non-destructive. | EF migration, production data | CLOSED (was P0) | No remaining migration-specific release block | Closed by decision record, backend `877703f`, 9/9 PostgreSQL scenarios, 1,470/1,470 regression and no pending model changes |
| F4-GAP-007 | F4-REQ-064,065 | TEST_GAP | Reviewer queue has five-viewport/focus evidence, but token-gated recipient accessibility, keyboard, live-region and responsive matrix remains unexecuted. | Angular recipient UI | P1 | Acceptance incomplete; follows token fixture | Run axe/keyboard/focus/error/live-region and 360/tablet/desktop checks with retained artifacts after G1/G2 |
| F4-GAP-008 | F4-REQ-072 | OPERATIONS_GAP - CONTRACT APPROVED / PROOF PENDING | The contract now defines run/resource ledger ownership, <=60-minute token TTL, revocation, reverse-FK/Blob/sink cleanup, failure retry, nightly fallback and artifact scanning. Execution is not implemented or proven. | Test infrastructure, CI, storage | P1 | Residue risk remains until Chunk 3 evidence | Implement forced-failure/partial/foreign-run cleanup and secret-artifact scan tests; prove unrelated resources untouched |
| F4-GAP-009 | F4-REQ-022,044,056 | DOCUMENTATION_GAP | Supporting email/billing/module status tables still say onboarding outbox/emails are unimplemented or require a gateway link. | Second Brain | P2 | Can mislead future implementation; does not block bounded next work because canonical hierarchy is explicit | Apply a later factual status/terminology correction referencing canonical docs and latest evidence |

## Special verification findings

### Purpose-bound E2E tokens

- Canonical runtime rule: random ≥256-bit, purpose/action/tenant/invoice/payment bound, expiring/revocable, keyed hash at rest, rate limited, and absent from DB/outbox/API logs/audit.
- Current test authority: the 2026-08-05 decision now authorizes only the separate CLI/hybrid boundary; no implementation exists yet.
- Safe conclusion: direct DB token injection, forced token-bearing resend/capture, production endpoint relaxation and arbitrary state mutation remain prohibited. Chunk 3 must implement the approved typed test-only boundary.

### State-specific fixtures

The Playwright environment manifest expects all required state IDs/tokens but does not create them. Public APIs alone cannot deterministically produce every conflict/failure/retry state. Direct uncontrolled SQL is explicitly not approved. The next design must prefer public/application commands and isolate any fixture-only state injection behind a test-host environment gate, isolated schema/database, deterministic teardown and no production registration.

### Blob and evidence

- Approved local adapter: Azure Blob-compatible storage; Azurite configuration is supported by the existing adapter and was reachable.
- Production: private Azure Blob container, no public base URL, authorized streamed/short-lived access only.
- Availability: extension/MIME/magic/size checks and ClamAV scan precede useful availability; approval fails unless current scan is CLEAN.
- Missing evidence: real upload/download/stream and cleanup via a valid recipient grant.

### ACS and email evidence levels

| Evidence level | Meaning | Current result |
|---|---|---|
| Queued | Durable outbox row committed | Implemented/tested |
| Worker attempted | Lease/attempt recorded | Implemented/tested locally |
| Provider accepted | ACS returns operation/provider acknowledgement (`WaitUntil.Started`) | Not validated for Flow 4 live mail |
| Delivered | Provider/inbox evidence confirms delivery | Not validated; must not be inferred from accepted |
| Recipient opened | Token-bearing public URL opens through intended client | Not validated with live mail |

P0 live checks cover payment-required, payment outcome as applicable, activation/setup invitation, retry/resend, provider identity and telemetry redaction. A local sink can prove template/protocol/deduplication without claiming provider acceptance or inbox delivery.

## Migration review — `20260804190000_BackfillDevelopmentRetailBusinessCode`

### What it does and why

The original migration used UUID `44444444-0002-4000-8000-000000000001`. The approved implementation preserves its migration ID but now selects only a blank, active row with normalized name `Retail` and exact development-seed provenance description. Forward migration `20260805120000_ApplyProductionSafeRetailBusinessCodeRepair` replays the identical guard for databases that may already have recorded the original ID.

### Safety assessment

- Identification: no development UUID; exact seed provenance, active status and blank code are required.
- Collision/ambiguity: explicit prechecks raise before mutation; no partial row change occurs.
- Existing data: all nonblank codes and absent-seed databases are unchanged.
- Idempotency: repeated guarded SQL is a no-op after success.
- Down safety: intentionally non-destructive because later provenance cannot justify clearing a valid code.
- History compatibility: the original ID remains and a new forward migration covers an already-recorded original.
- Authority: approved by the dated disposition decision and verified evidence.

### Finding

**Resolved and approved.** Disposition E + C accounts for both not-yet-recorded and potentially recorded databases. PostgreSQL 17.10 clean, legacy, correct, different, collision, absent, ambiguous, rollback/reapply and history scenarios pass. See [[FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_RESOLUTION_EVIDENCE_2026-08-05]].

## Current release decision

The lifecycle/product requirements, production migration disposition and test-fixture security authority are clear. The fixture runtime/verification, 20/20 browser execution, real proof path and live ACS remain open. These bounded gaps do not justify relaxing production security.

## Related

- [[FLOW_4_SECOND_BRAIN_DOCUMENT_READ_MANIFEST_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]

## Chunk 3 gap disposition — 2026-08-05

The deterministic fixture-runtime and cleanup gaps are resolved. The CLI, guard chain, 17-scenario allow-list, manifest transport, production separation and owner-bound cleanup have executable evidence. Focused browser consumption was prepared and mapped but could not be executed because the environment rejected background service launch after the approval/usage limit was reached. The live-browser item remains an explicit condition; private Blob/ClamAV, live ACS and final 20/20 remain intentionally open. See [[FLOW_4_DETERMINISTIC_FIXTURE_RUNTIME_EVIDENCE_2026-08-05]].
