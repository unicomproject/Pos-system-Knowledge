<!-- title: Flow 4 Approved Next Implementation Scope 2026-08-05 -->
<!-- status: Conditionally Approved Scope -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 approved next implementation scope — 2026-08-05

## Scope decision

The next phase is limited to closing the traceability gaps below. It must not redesign the manual-payment lifecycle, add a gateway, expose raw tokens from production APIs, weaken hash-only storage, use uncontrolled database mutation, fabricate email/provider success, or change unrelated repositories.

Implementation gate: **CONDITIONAL_GO_FOR_IMPLEMENTATION**.

Conditions before the first runtime change:

1. **Completed 2026-08-05:** approve the test-host-only token/fixture security contract described under F4-GAP-001/F4-GAP-002. Option E (separate non-HTTP CLI/hybrid) is approved; runtime proof remains Chunk 3.
2. **Completed 2026-08-05:** disposition E + C approved and implemented for `20260804190000_BackfillDevelopmentRetailBusinessCode`; F4-GAP-006 is closed.
3. Confirm an isolated test database, secret store, staging mailbox/sender and target Blob/ClamAV/ACS environments. Missing live ACS may be worked around only for local non-live tasks; it still blocks the final release gate.

## Ordered work plan

| Order | Gap IDs | Requirement IDs | Workstream | Repository | Expected Files/Areas | Tests | Completion Evidence |
| ----- | ------- | --------------- | ---------- | ---------- | -------------------- | ----- | ------------------- |
| 1 | F4-GAP-006 | F4-REQ-059,069 | Production migration disposition - **COMPLETED** | Second Brain + Backend | Dated decision/evidence; guarded original and forward corrective migration | 9/9 PostgreSQL cases, clean/history/rollback/reapply, no pending model changes; full 1,470/1,470 | Backend `877703f`; F4-CONFLICT-007 resolved and F4-GAP-006 closed |
| 2 | F4-GAP-001,008 | F4-REQ-070,072 | Secret-safe test bootstrap contract - **APPROVED** | Second Brain | Separate CLI/hybrid; cumulative environment/database/credential guards; process-pipe primary transport; hash-only, <=60m TTL, run ledger and cleanup/redaction contract; never production controller registration | 15-threat model and precise Chunk 3 negative/architecture tests defined; runtime tests not yet run | Chunk 2 decision/threat/implementation contract/evidence; F4-GAP-001 authority gap resolved |
| 3 | F4-GAP-002 | F4-REQ-071 | Deterministic lifecycle fixture builder - **NEXT (CHUNK 3)** | Backend test CLI/integration tests; Angular QA launcher | Implement approved typed scenarios and versioned manifest using production services plus narrow scenario assemblers | Idempotent creation, isolated ownership, exact state assertions, one-time secret return, cleanup/failure cleanup and production-separation tests | One complete secret-safe manifest with every required ID/token and no console/artifact leakage |
| 4 | F4-GAP-003 | F4-REQ-028,029,034,061,062,066 | Real private-proof lifecycle | Backend + Angular QA | Azure Blob/Azurite adapter configuration, recipient upload, reviewer proof stream, cleanup assertions | Valid PDF/JPEG/PNG; mismatch/oversize/EICAR; exact association; expired/cross-ID denial; no-store/private metadata | Real submission upload and authorized download pass; private Blob inspected; cleanup passes |
| 5 | F4-GAP-004 | F4-REQ-044,051–056,063 | Live ACS payment and invitation validation — **STILL EXTERNAL BLOCKED** | Deployment environment; Backend/Angular QA only as needed | Mailbox, allow-list, approved HTTPS bases still missing; internal suite no longer blocked by them | Live provider operation IDs, inbox receipt, email-originated links | See [[FLOW_4_LIVE_ACS_MAILBOX_AND_PLAYWRIGHT_COMPLETION_EVIDENCE_2026-08-05]]; internal preflight [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]] |
| 6 | F4-GAP-005 | F4-REQ-060,067,070,071 | Execute twenty-scenario browser matrix — **COMPLETED INTERNAL (Chunk 6A)** | Angular QA + controlled Backend environment | `qa-dashboard/manual-payment.e2e.spec.mjs`, fixture CLI, Azurite/ClamAV, isolated Postgres | **21/21** PASS (20 canonical + E2E 14b); EmailMode SUPPRESSED; no live ACS claimed | [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]]; backend 1,501/1,501; Angular 454/454 |
| 7 | F4-GAP-007 | F4-REQ-064,065 | Recipient accessibility and responsive acceptance | Angular | Recipient page styles/templates and QA acceptance only where defects are found | Keyboard-only, focus order/return, error summary/labels/live regions, screen-reader smoke, 360/768/1024/1366/1600 widths, zoom | No blocking a11y defect or global clipping; retained screenshots/report |
| 8 | F4-GAP-008 | F4-REQ-072 | Cleanup and artifact-redaction proof | Backend test host + Angular QA/CI | Teardown hooks, Blob/schema/email-capture cleanup, artifact scrub/check | Forced failure midway; teardown still removes only test-owned resources; secret scan of artifacts | Cleanup report with exact removed resources and proof unrelated Docker/data remained untouched |
| 9 | F4-GAP-003–008 | F4-REQ-057–067,069–072 | Final release revalidation and documentation | All three repositories, docs last | Full automated gates, release workflow, evidence/index updates | Backend 1,461+ (or current higher count), Angular 453+ (or current higher), migrations, 20/20, Blob, ClamAV, ACS, a11y/responsive, audits | New dated evidence, clean diffs, pushed commits, production gate recalculated |

## Fixture contract that must be approved

The implementation prompt for Orders 2–3 must state all of these controls:

- The test bootstrap is compiled/registered only in a dedicated test host or is guarded by a fail-closed environment assertion plus an isolated database identity.
- It is unreachable in Development/Staging/Production application deployments unless that deployment is the explicitly approved ephemeral E2E target.
- Raw recipient/setup tokens are returned exactly once to the invoking test process, held in memory/process secret variables only, never written to database, logs, screenshots, traces, videos, JUnit/JSON/HTML, email-capture files or committed `.env` files.
- Runtime tables continue to store only keyed hashes with purpose, allowed actions, tenant/invoice/payment binding, expiry, revocation and audit.
- Fixture creation invokes application/domain commands for business transitions. Any fixture-only fault/state injection is explicit, allow-listed, test-host-owned and validated against canonical invariants.
- Creation and teardown are idempotent and namespaced by run ID. Cleanup removes isolated schema/rows/blobs/mail captures/secrets and leaves unrelated Docker resources and user data untouched.
- The harness prints only non-secret fixture aliases/IDs needed for correlation; secret scanning runs before artifact upload.

## Migration condition - resolved

Disposition E + C is approved in [[../13_DECISIONS_AND_CHANGES/FLOW_4_RETAIL_BUSINESS_CODE_MIGRATION_DISPOSITION_2026-08-05]]. Repository evidence found only isolated local application, but manual shared application could not be excluded. The original migration ID is therefore retained with safe guards and a later forward correction covers already-recorded history. Exact natural seed provenance replaces UUID selection; collision and ambiguity fail before mutation; existing nonblank values remain unchanged; rollback is intentionally non-destructive.

## Release completion gate

The next phase is complete only when:

- all five remaining non-verified P0 requirements (F4-REQ-060, 061, 063, 070, 071) are verified;
- Playwright is 20/20 with zero environment skip;
- private proof and ClamAV paths run through a real purpose-bound recipient submission;
- live ACS evidence distinguishes queued, attempted, provider accepted, delivered and opened;
- recipient accessibility/responsive P1 evidence is retained;
- cleanup and artifact secret scans pass;
- backend/frontend/documentation branches are pushed with no unrelated files committed;
- production remains NO-GO until all of the above is true.

## Generated next-implementation directive

Orders 1-2 are complete at their stated decision/contract level. Implement Order 3 as Chunk 3 under the approved secure test-host decision, then continue Orders 4-9 in sequence. Preserve the current manual-payment state machine and production security controls. Use isolated, deterministic, secret-safe fixtures; execute real services and all 20 Playwright cases only in their later authorized chunks; then update evidence and recalculate the release gate without claiming blocked checks as passes.

## Related

- [[FLOW_4_SECOND_BRAIN_DOCUMENT_READ_MANIFEST_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]

## Chunk 3 execution update — 2026-08-05

Order 3 is runtime-complete with the conditional browser-consumption item recorded in [[FLOW_4_DETERMINISTIC_FIXTURE_RUNTIME_EVIDENCE_2026-08-05]]. Proceeding to Chunk 4 is conditional on retaining that honest browser gap; Chunk 4 must not reinterpret database/launcher mapping tests as private-proof browser evidence. Live ACS and final 20/20 remain outside Chunk 4.

## Chunk 5D credentialed ACS rerun — 2026-08-05

Order 5 (F4-GAP-004) advanced only on secure ACS preflight: User Secrets connection string + sender address are configured, ACS endpoint host is reachable, and admin-link fallback is disabled. Controlled mailbox, recipient allow-list, approved HTTPS payment/setup URLs and isolated live DB remain missing, so **no live ACS send, mailbox receipt or Playwright 21-pass** was claimed. Decision remains `CONDITIONAL_GO_TO_CHUNK_6`. Evidence: [[FLOW_4_LIVE_ACS_CREDENTIALED_EXTERNAL_RERUN_EVIDENCE_2026-08-05]].

## Chunk 5E external environment provisioning — 2026-08-05

Order 5 advanced further on isolated DB provisioning: container `oneverz-flow4-live-email-pg` (port 55437), guard-compliant database `oneverz_flow4_e2e_liveemail`, role `flow4_runner`, full EF migrations and unexpired `flow4_test_control.environment_marker` were created and then cleaned. Controlled mailbox, recipient allow-list and approved HTTPS payment/setup hosts remain unavailable, so live ACS dispatch, mailbox receipt and Playwright 21/21 were not executed. Decision remains `CONDITIONAL_GO_TO_CHUNK_6`. Evidence: [[FLOW_4_LIVE_ACS_MAILBOX_AND_PLAYWRIGHT_COMPLETION_EVIDENCE_2026-08-05]].
