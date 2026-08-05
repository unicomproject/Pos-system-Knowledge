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
| F4-CONFLICT-007 | Production migration scope | Migration rules require readable, production-safe forward data handling | `20260804190000_BackfillDevelopmentRetailBusinessCode` summary/comment and SQL | Migration identifies a development seed and hard-codes its UUID in the production chain; Down can clear a legitimate RETAIL value | General migration rules do not approve this special-case production mutation | Production safety is unresolved; local success is not production approval | Architecture/data owner must approve replacement, separation or guarded retention before merge/release |

No unresolved product conflict remains for the manual-payment lifecycle itself. F4-CONFLICT-007 is an unresolved production data-governance decision and is release critical.

## Gap register

| Gap ID | Requirement IDs | Gap Type | Description | Affected Layer | Severity | Release Impact | Recommended Resolution |
| ------ | --------------- | -------- | ----------- | -------------- | -------- | -------------- | ---------------------- |
| F4-GAP-001 | F4-REQ-070 | DOCUMENTATION_GAP / SECURITY_GAP | No canonical authority defines a secret-safe test-only raw recipient-token/bootstrap boundary. Production correctly stores only hashes, but E2E cannot obtain purpose-bound tokens. | Security, backend test host, CI | P0 | Blocks token-dependent E2E; uncontrolled workaround would violate security rules | Approve a test-host-only contract: explicit environment gate, isolated DB, caller-process response only, hash-only persistence, no logs/artifacts, bounded purpose/expiry, audit and teardown |
| F4-GAP-002 | F4-REQ-071 | FIXTURE_GAP / TEST_GAP | Deterministic state builders do not exist for awaiting, submitted, rejected, action-required, approvable, rejectable, conflict, paid/pending-activation, active/invitation, retry and complete lifecycle states. | Backend test infrastructure, PostgreSQL, Playwright | P0 | Blocks 14 browser scenarios and reproducible CI | Implement an approved test-host service/helper that uses application/domain commands where possible and explicit fixture-only setup where necessary; never use uncontrolled production DB mutation |
| F4-GAP-003 | F4-REQ-061 | ENVIRONMENT_GAP | Azurite and the Blob adapter are configured/reachable, but no real recipient token/submission created a private object and no authorized review streamed it. | Blob, recipient API/UI, review API/UI | P0 | Private proof release gate not met | Execute valid upload, metadata/scan, private retrieval, cross-ID denial, cleanup and no-public-URL assertions through the real path |
| F4-GAP-004 | F4-REQ-056,063 | LIVE_SERVICE_GAP | Live ACS credentials, verified sender, staging recipient and authorization for token-bearing mail were unavailable. Protocol sink does not prove live provider acceptance/routing/delivery. | Email, outbox, operations | P0 | Payment and invitation communications not production-proven | Use secret store + approved staging mailbox; capture ACS operation/provider IDs, accepted status, recipient routing, retries, redacted logs; report inbox delivery separately |
| F4-GAP-005 | F4-REQ-060,067 | TEST_GAP / ENVIRONMENT_GAP | Playwright has 20 real-path scenarios but only six distinct scenarios passed; fourteen are blocked by tokens/state/live boundaries. | Angular, API, DB, CI | P0 | Mandatory 20/20 release-mode gate fails | Populate fixtures through approved bootstrap, run preflight + all 20 once, retain HTML/JSON/JUnit/trace/video/screenshots and fail on skip |
| F4-GAP-006 | F4-REQ-059,069 | DATABASE_GAP / REQUIREMENT_AMBIGUITY | `20260804190000_BackfillDevelopmentRetailBusinessCode` passed local migration tests but contains a development-specific UUID and rollback that can erase a legitimate RETAIL code. No Second Brain decision authorizes it for production. | EF migration, production data | P0 | Blocks safe production migration approval | Decide before merge: preferably remove from production chain before deployment and seed/fix isolated test data through fixture authority, or replace with an environment-neutral data repair with collision precheck, provenance, rollback/forward-only rationale and production owner approval |
| F4-GAP-007 | F4-REQ-064,065 | TEST_GAP | Reviewer queue has five-viewport/focus evidence, but token-gated recipient accessibility, keyboard, live-region and responsive matrix remains unexecuted. | Angular recipient UI | P1 | Acceptance incomplete; follows token fixture | Run axe/keyboard/focus/error/live-region and 360/tablet/desktop checks with retained artifacts after G1/G2 |
| F4-GAP-008 | F4-REQ-072 | DOCUMENTATION_GAP / OPERATIONS_GAP | Docker cleanup is safe and scoped, but canonical retention/cleanup for fixture rows, raw process tokens, blobs, email captures and browser artifacts is not fully specified. | Test infrastructure, CI, storage | P1 | Risk of secret/test-data residue | Define per-resource owner, TTL, teardown, failure cleanup, artifact redaction and proof that unrelated resources are untouched |
| F4-GAP-009 | F4-REQ-022,044,056 | DOCUMENTATION_GAP | Supporting email/billing/module status tables still say onboarding outbox/emails are unimplemented or require a gateway link. | Second Brain | P2 | Can mislead future implementation; does not block bounded next work because canonical hierarchy is explicit | Apply a later factual status/terminology correction referencing canonical docs and latest evidence |

## Special verification findings

### Purpose-bound E2E tokens

- Canonical runtime rule: random ≥256-bit, purpose/action/tenant/invoice/payment bound, expiring/revocable, keyed hash at rest, rate limited, and absent from DB/outbox/API logs/audit.
- Current test authority: no canonical document authorizes a test bootstrap returning raw tokens, and no backend test-bootstrap endpoint/service was found.
- Safe conclusion: direct DB token injection, forced token-bearing resend/capture, or production endpoint relaxation is not approved. A separately approved, test-host-only boundary is required (F4-GAP-001).

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

The migration updates `business_types.business_code` to `RETAIL` when the row has UUID `44444444-0002-4000-8000-000000000001` and an empty code. It was added because isolated Flow 4 finalization failed active business-type validation against the development Retail row.

### Safety assessment

- Development assumption: explicit in class name/comment and encoded in the hard-coded seed UUID.
- Idempotent Up: conditionally yes for the exact empty row; a repeat does nothing.
- Production safe: **not established**. If production contains that UUID with an empty code for another provenance, it will be silently changed. If another row already owns `RETAIL`, the unique constraint can fail deployment.
- Down safety: **unsafe/ambiguous**. It clears any matching `RETAIL` value without proving that this migration originally set it, and therefore can undo a later legitimate correction.
- Rollback documentation: absent beyond executable Down SQL.
- Authority: general migration rules allow controlled backfills but no decision approves a development-fixture repair in the production migration chain.

### Finding

**Do not approve this migration for production in its current documented state.** Because this audit cannot modify migrations, F4-GAP-006 requires an explicit data-owner/architecture decision. Preferred disposition, if it has not reached any shared production-like environment, is to separate development/test seed repair from the production chain and create required test catalog state through approved fixture setup. If a production repair is genuinely needed, replace it through the authorized forward-migration process with environment-neutral matching, uniqueness precheck, provenance, forward/rollback rationale and deployment runbook. Never edit already-deployed migration history without a deployment-aware plan.

## Current release decision

The lifecycle/product requirements are clear, but P0 fixture authority, 20/20 browser execution, real proof path, live ACS and production migration disposition remain open. These are bounded gaps; they do not justify guessing or relaxing production security.

## Related

- [[FLOW_4_SECOND_BRAIN_DOCUMENT_READ_MANIFEST_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]
