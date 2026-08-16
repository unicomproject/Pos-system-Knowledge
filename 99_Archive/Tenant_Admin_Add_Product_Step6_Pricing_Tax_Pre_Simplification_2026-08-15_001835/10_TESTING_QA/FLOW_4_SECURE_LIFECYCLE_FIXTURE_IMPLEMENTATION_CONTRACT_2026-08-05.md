<!-- title: Flow 4 Secure Lifecycle Fixture Implementation Contract 2026-08-05 -->
<!-- status: Approved Contract - Implementation Pending -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 secure lifecycle fixture implementation contract - 2026-08-05

## Chunk 3 architecture

Implement a separate backend CLI/test project, provisionally `tests/E_POS.Flow4TestHost`, with no HTTP listener and no reference from any production project. It composes existing Application/Domain/Infrastructure services, including `IManualPaymentAccessTokenService`, `ITokenHashService`, onboarding/manual-payment repositories and application services. Test-only orchestration owns scenario selection, database guards, fixture assembly, manifest delivery and teardown.

Production transitions are mandatory for normal states. Minimal direct persistence is allowed only in a scenario-specific test assembler for states that production APIs cannot deterministically schedule (for example an expired grant, an explicitly unclean evidence projection or retryable outbox operation). Each exception must preserve FK/check/uniqueness/version/audit invariants and validate the completed graph. No generic mutation method is permitted.

## Commands and inputs

The only commands are:

```text
flow4-test-host validate --run-id <uuid>
flow4-test-host create --run-id <uuid> --scenario-set canonical-v1
flow4-test-host cleanup --run-id <uuid> --cleanup-handle-stdin
flow4-test-host cleanup-stale --older-than <bounded-duration>
```

Secrets, connection strings and bootstrap credentials must not be command-line arguments. Configuration follows .NET double-underscore names, but the launcher supplies secret values only to the child process. Required logical inputs are environment (`Test`/`E2E`), enabled flag, bootstrap credential through stdin, connection, expected marker nonce/reference, UUID run ID, fixed scenario-set version, backend commit, fixture TTL (1-60 minutes), test identities and email mode. Unknown fields/commands/scenarios fail validation.

The tool must reject arbitrary SQL, table/entity names, lifecycle/payment status strings, permission/role codes, URLs, endpoints and filesystem paths. Proof fixture selection, where later needed, is an allow-listed filename under a resolved approved fixture directory.

## Environment and database validation

Before opening a mutation transaction or generating a secret, validate all guards from the decision record:

- exact `Test` or `E2E` environment and explicit enable flag;
- constant-time 256-bit bootstrap credential match;
- canonical unique run ID;
- parsed PostgreSQL host allow-list and database name pattern `oneverz_flow4_e2e_<suffix>`;
- deny-list for production/shared hosts and known production database identities;
- connected database name/host/role read from PostgreSQL, not just the connection string;
- dedicated test role;
- unexpired `flow4_test_control.environment_marker` matching database/environment/provisioner nonce;
- run ID not owned by an incompatible active invocation;
- suppressed/test-sink email mode unless the separately protected live-ACS gate is active.

`flow4_test_control` is test-database-only provisioning, not an EF production migration. It contains environment marker, run ledger and resource ledger tables. Ledger data contains resource IDs/types/state/expiry and cleanup status, never raw secrets or token-bearing URLs.

## Approved typed scenarios

All records are synthetic and run-owned. `Raw secret` means one-time payment access unless invitation is explicitly stated.

| Scenario | Required initial state | Created/validated records | Raw secret | Allowed actions | Cleanup dependencies | E2E use |
|---|---|---|---:|---|---|---|
| `AWAITING_PAYMENT` | Prepaid paid finalize | tenant, subscription, invoice, awaiting payment, active access, operation/outbox | Yes | status, invoice, evidence, history | grant then payment/invoice/tenant | 2, 3; supports 15 |
| `PAYMENT_SUBMITTED` | Awaiting + clean synthetic submission | evidence metadata/object when enabled, submission/review history, submitted payment | Yes | status/history; amend only if policy permits | object/evidence before payment | 4, 6, 13 |
| `ACTION_REQUIRED` | Submitted + request-information review | immutable review, action-required payment | Yes | amend/resubmit/history | reviews/evidence/payment | 10 |
| `REJECTED` | Submitted + rejection review | immutable rejection and rejected payment | Yes | safe outcome/resubmit if allowed | reviews/evidence/payment | 9 |
| `APPROVABLE_PAYMENT` | Clean submitted evidence and current version | actionable submitted/under-review graph | No | admin approve | review/evidence/payment | 7 |
| `REJECTABLE_PAYMENT` | Submitted evidence and current version | actionable review graph | Yes | admin reject, recipient outcome | review/evidence/payment | 9 |
| `REQUEST_INFORMATION_ELIGIBLE` | Submitted evidence and current version | actionable review graph | Yes | admin request information, recipient correct | review/evidence/payment | 10 |
| `CONCURRENT_REVIEW` | Approvable payment; two fixed billing managers | one shared versioned payment and two authorized sessions/personas | No | two competing reviews | sessions/personas then payment | 11 |
| `UNCLEAN_EVIDENCE` | Submitted payment with scenario-specific non-clean scan result | private test-owned evidence metadata/object as applicable | No | view; approval denied | object/evidence/payment | 15 |
| `NOTIFICATION_FAILED` | Eligible payment notification with retryable failure | failed-retryable outbox/operation state | No | authorized resend/retry | outbox before payment | 16 |
| `PAID_PENDING_ACTIVATION` | Approvable payment approved through production review | paid invoice/payment, pending-activation tenant; no invite token | No | activate only | invitations/outbox then aggregate | 8 |
| `ACTIVE_INVITATION_READY` | Paid pending activation activated | active tenant, membership, invitation request/status | Invitation only if a test consumes setup | resend/status; account setup only if approved | invite/outbox/user then aggregate | 19/security tests |
| `RETRYABLE_OPERATION` | Run-owned eligible operation | failed-retryable component with bounded attempts | No | operation retry only | outbox/operation then aggregate | 18 |
| `EXPIRED_PAYMENT_ACCESS` | Awaiting payment with grant expiry in past | expired hash-only access | Returned only if needed for denial test | none | grant then aggregate | 14 |
| `REVOKED_PAYMENT_ACCESS` | Awaiting payment with revoked grant | revoked hash-only access | Returned only for denial test | none | grant then aggregate | security negative |
| `CROSS_TENANT_PROOF` | Two run-owned tenants; proof belongs to tenant A; actor scoped to B | exact evidence/payment pairs and unauthorized URL ID tuple | No | denial only | both graphs/object | 17 |
| `COMPLETE_HAPPY_PATH` | Prepaid finalize, submit, approve, activate, invitation dispatch to sink | full ordered graph, active tenant, paid payment, invitation status | Payment; invitation only if explicitly asserted | safe reads/resend according to final state | full reverse-order teardown | 20 |

The `create canonical-v1` fixture set also supplies the existing E2E 1 operation and fixed administrator/view-only/no-billing personas. It must populate every current required variable extracted from `manual-payment.e2e.spec.mjs` and fail if the source-required set and manifest mapping diverge.

## Manifest schema

The strongly typed JSON DTO has `schemaVersion: "1.0"` and four top-level objects:

```json
{
  "metadata": {
    "schemaVersion": "1.0",
    "testRunId": "uuid",
    "environment": "E2E",
    "createdAt": "UTC timestamp",
    "expiresAt": "UTC timestamp",
    "backendCommit": "40-hex commit",
    "fixtureSetVersion": "canonical-v1"
  },
  "identifiers": {},
  "secrets": {},
  "cleanup": {
    "handle": "opaque non-token cleanup reference",
    "resourceCounts": {}
  }
}
```

### Identifier and secret mapping

| Current variable | Classification | Scenario/provider | Required validation |
|---|---|---|---|
| `FLOW4_OPERATION_ID` | Controlled ID | awaiting/base fixture | UUID; run-owned |
| `FLOW4_AWAITING_TOKEN` | Secret | `AWAITING_PAYMENT` | non-empty; expires within run |
| `FLOW4_SUBMITTED_TOKEN`, `FLOW4_SUBMITTED_PAYMENT_ID` | Secret + controlled ID | `PAYMENT_SUBMITTED` | token/payment binding |
| `FLOW4_DUPLICATE_ASSERTION_URL` | Controlled configuration | duplicate assertion helper; preferably replace with typed ID/count assertion in Chunk 3 | allow-listed local/test origin only; no token |
| `FLOW4_APPROVABLE_PAYMENT_ID` | Controlled ID | `APPROVABLE_PAYMENT` | UUID/current version |
| `FLOW4_PAID_PAYMENT_ID` | Controlled ID | `PAID_PENDING_ACTIVATION` | UUID/exact lineage |
| `FLOW4_REJECTABLE_PAYMENT_ID`, `FLOW4_REJECTED_TOKEN` | Controlled ID + secret | `REJECTABLE_PAYMENT`/`REJECTED` | exact binding |
| `FLOW4_INFO_PAYMENT_ID`, `FLOW4_ACTION_REQUIRED_TOKEN` | Controlled ID + secret | `REQUEST_INFORMATION_ELIGIBLE`/`ACTION_REQUIRED` | exact binding |
| `FLOW4_CONFLICT_PAYMENT_ID` | Controlled ID | `CONCURRENT_REVIEW` | shared current version |
| `FLOW4_EXPIRED_TOKEN` | Secret | `EXPIRED_PAYMENT_ACCESS` | already expired and denial-only |
| `FLOW4_INVALID_EVIDENCE_TOKEN`, `FLOW4_UNCLEAN_PAYMENT_ID` | Secret + controlled ID | awaiting/unclean | allow-listed invalid upload and blocked approval |
| `FLOW4_NOTIFICATION_FAILED_PAYMENT_ID` | Controlled ID | `NOTIFICATION_FAILED` | retryable notification |
| `FLOW4_CROSS_TENANT_PROOF_URL` | Controlled configuration | `CROSS_TENANT_PROOF` | local/test API origin; no token/query secret |
| `FLOW4_RETRY_OPERATION_ID` | Controlled ID | `RETRYABLE_OPERATION` | UUID/retryable component |
| `FLOW4_ACTIVE_PAYMENT_ID` | Controlled ID | `ACTIVE_INVITATION_READY` | active lineage |
| `FLOW4_HAPPY_OPERATION_ID`, `FLOW4_HAPPY_PAYMENT_ID`, `FLOW4_HAPPY_TOKEN` | Controlled IDs + secret | `COMPLETE_HAPPY_PATH` | one run-owned graph |
| `FLOW4_QUEUE_SEARCH` | Non-secret configuration | fixture set | run-unique safe prefix |
| login passwords | Secret credentials, outside fixture token object | provisioned personas | child-only env; never diagnostic output |

Identifiers may also include tenant, invoice, access, evidence, review, outbox and invitation IDs required for database/cleanup assertions. Optional secret fields are absent, not null, when a scenario does not require them. JSON parsing rejects unknown top-level fields, duplicate aliases, expired metadata, mismatched run/environment/commit and unmapped required Playwright values.

`ToRedactedDiagnostic()` emits metadata, aliases, IDs safe for correlation, resource counts and `[REDACTED]`; it never serializes the secret object, credentials, connection data, proof paths or cleanup authorization material.

## Secret handoff

Primary: a launcher captures the CLI's redirected stdout pipe directly into memory, only when stdout is not an interactive terminal. It supplies the bootstrap credential through redirected stdin, masks every parsed secret immediately, and launches Playwright with a minimum child-only environment. It closes pipes and clears references after launch/cleanup. The JSON must never be echoed.

Fallback: current-user-only randomized ephemeral file outside repository/artifact directories, atomically created, validated by schema, read once, deleted immediately after environment construction and again in `finally`. Unix mode is `0600`; Windows inheritance is disabled and only current user/SYSTEM are permitted. The path is non-secret but must not be put in artifacts. Populated `.env`, CI job output and command-line secrets are prohibited.

## Ownership, parallelism and cleanup

Every create operation inserts a run ledger before resources and records each resource transactionally or immediately after external creation. Names, emails, idempotency keys and correlation values include the run namespace. Repeating the same `(run ID, fixture set version)` returns the existing validated identifier graph but must not return a previously emitted raw token; it rotates/revokes and returns a fresh token only through an explicit allowed recovery operation.

Cleanup validates environment/database/credential/marker/run ownership again and follows actual FK constraints. Logical order is: revoke payment grants; revoke/expire invitations; delete run-owned proof objects and evidence; delete outbox/test sink captures; reviews/history; payments; invoice lines/invoices; operation/receipt/draft; entitlements/add-ons/subscription; roles/grants/users/contacts/addresses/profile/domain/tenant; temporary platform personas/permissions; resource/run ledger; manifest. If FK reality requires a different physical order, Chunk 3 documents/tests it while preserving the logical security order.

Missing resources are success; foreign-owned resources are a hard failure; partial cleanup remains retryable. A forced-mid-create exception must leave enough ledger state for cleanup. Teardown revocation must be proven through production access lookup. The nightly stale cleanup accepts only a bounded age, processes expired ledger runs and uses identical guards.

## Email behavior

Default is `SUPPRESSED` or an explicit local sink with `.invalid` recipients. Outbox state may be assembled, but no real provider call occurs. Live ACS requires a later protected job with explicit live flag, verified sender, exact recipient allow-list and provider credentials; it is outside Chunk 3 fixture-builder completion unless separately authorized.

## Required tests and acceptance

### Guards and production separation

- reject Production, Staging, Development, blank/unknown environment;
- reject missing/false enable flag, missing/wrong credential, malformed/reused unauthorized run ID;
- reject non-matching DB name, denied host, wrong connected identity/role, absent/mismatched/expired marker;
- prove `E_POS.Api` has no project reference, resolvable fixture orchestrator, endpoint metadata, OpenAPI path or published fixture binary/manifest.

### Token and manifest security

- production entropy/generation/hash path is used; raw value differs from and is absent beside persisted hash;
- raw token returns exactly once, is absent from all DB text/JSON, audit/outbox/log/diagnostic data, worktree and artifact staging;
- expired, revoked, wrong-purpose, cross-tenant/payment/invoice/proof tokens fail safely;
- fingerprint is deterministic for correlation, non-authenticating and does not reveal token material;
- schema version, required/optional fields, unknown fields, redacted serializer and pipe/fallback ACL/deletion pass.

### Fixture, lifecycle and cleanup

- every named scenario has exact state/lineage/action assertions; unknown scenario, arbitrary status/SQL/role/path fail;
- same-run retry is deterministic under documented rotation semantics; parallel runs do not collide;
- submission/finalization/review/activation/resend idempotency remains intact;
- cleanup cannot delete another run, is idempotent, survives partial creation, deletes Blob/sink/DB state, revokes secrets, and leaves unrelated Docker/database data untouched;
- email is suppressed/sink-only and a real/non-allow-listed recipient is rejected.

### Artifact gate

Use generated canaries to scan backend structured logs, CLI stdout/stderr capture, CI log staging, Playwright HTML/JSON/JUnit, trace, video/screenshots, HAR and attachments. Remove authorization/bootstrap headers and token path/query values. A match or secret manifest in the upload set fails the job.

## Playwright and CI expectations

The launcher maps validated manifest aliases to the existing `FLOW4_*` child environment without writing a populated env file. Preflight must validate manifest schema/run/expiry and all exact variables. Release mode fails on a missing scenario and on any Playwright skip.

CI order is provision -> mark/verify DB -> start backend -> invoke CLI -> mask/capture -> run preflight/Playwright -> always cleanup/revoke -> delete manifest -> secret scan -> upload sanitized artifacts. Cleanup and scanning execute under `if: always()` semantics, but failure overrides success. Untrusted pull requests receive no protected fixture, login, ACS or Blob secrets.

## Completion gates

Chunk 3 is complete only after the CLI/launcher and all guard, token, scenario, parallelism, cleanup, production-separation and artifact tests pass; a secret-safe manifest supplies every current E2E variable; no production runtime route/registration exists; relevant branches are clean/pushed; and F4-REQ-070/071 are recalculated from evidence. This contract alone does not authorize a 20/20, Blob or live-ACS pass claim.

## Related

- [[../13_DECISIONS_AND_CHANGES/FLOW_4_SECURE_TEST_HOST_TOKEN_AND_FIXTURE_CONTRACT_2026-08-05]]
- [[../09_SECURITY_AND_COMPLIANCE/FLOW_4_TEST_FIXTURE_TOKEN_THREAT_MODEL_2026-08-05]]
- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_SECURE_TEST_HOST_CONTRACT_EVIDENCE_2026-08-05]]
