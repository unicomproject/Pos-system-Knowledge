<!-- title: Flow 4 Secure Test-Host Token and Fixture Contract 2026-08-05 -->
<!-- status: Approved for Chunk 3 Implementation -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 secure test-host token and fixture contract - 2026-08-05

## Decision identity

| Item | Decision |
|---|---|
| Gaps | F4-GAP-001, F4-GAP-002, F4-GAP-008 |
| Requirements | F4-REQ-070, F4-REQ-071, F4-REQ-072 |
| Source documents | DOC-002, DOC-013, DOC-017-DOC-026, DOC-040-DOC-050, DOC-054 plus the 2026-08-05 audit/Chunk 1 pack |
| Selected option | **Option E: separate test CLI + production security/application primitives + test-only orchestration + process-local secret handoff** |
| Runtime status | Contract approved; fixture builder not implemented |
| Chunk gate | **GO_TO_CHUNK_3 — Secure test-host and lifecycle fixture contract approved** |

This decision closes the missing security authority in F4-GAP-001. It defines the disposition for F4-GAP-008 and the implementation boundary for F4-GAP-002. It does not claim that the lifecycle builder, cleanup, 20/20 browser run, private proof path or live ACS has passed. P0 verified coverage remains 59/64.

## Problem and invariants

Production correctly generates payment and invitation secrets in worker memory, persists only keyed hashes and never exposes a token bootstrap API. Playwright needs controlled states and selected raw test secrets. The approved solution must provide them without weakening these production invariants:

- payment access remains at least 256 random bits and is purpose/action/tenant/invoice/payment bound, expiring and revocable;
- invitation setup remains tenant/user/invitation-purpose bound, single-use, expiring and rotated on resend;
- payment access never grants Platform Billing, activation or account setup; invitation access never grants payment or platform functions;
- approval reaches `PENDING_ACTIVATION`; activation remains separate;
- raw secrets never enter database, outbox payload, audit, normal logs, reports or source control;
- callers select only an approved named fixture, never a status, table, SQL statement, role or arbitrary file path.

## Options evaluated

| Option | Disposition | Reason |
|---|---|---|
| A - in-process integration fixture | Supporting component | Strong isolation but cannot alone hand values to the separate Playwright process. |
| B - dedicated test bootstrap CLI | Selected foundation | No production HTTP surface; explicit invocation; suitable for local and CI orchestration. |
| C - test-host HTTP endpoint | Rejected | Unnecessary route, discovery, authentication and proxy exposure risk. No controller is approved. |
| D - database seed helper | Restricted supporting technique | Deterministic, but cannot be the public contract and may bypass invariants. Only allow-listed test assemblers may use minimal direct persistence. |
| E - hybrid | **Approved** | Combines a separate CLI, production token/hash and application services, test-only state assemblers, ownership ledger and secure process handoff. |

## Approved host and production boundary

Chunk 3 creates a separate executable under the backend test/tooling boundary, provisionally `tests/E_POS.Flow4TestHost`. It may reference Application, Domain and Infrastructure. No production project may reference it. `E_POS.Api` must not register its services, controller, endpoint, hosted service or configuration section. It must not appear in production Swagger/OpenAPI or application publish output.

The CLI has only typed `create`, `validate`, `cleanup` and `cleanup-stale` commands. There is no network listener. The production API continues unchanged. Architecture tests must inspect production references, DI, endpoint metadata, OpenAPI and publish output.

## Fail-closed execution guards

All guards are cumulative; failure of any guard occurs before mutation or secret generation:

1. `DOTNET_ENVIRONMENT` is exactly `Test` or `E2E`; `Development`, `Staging`, `Production`, blank and unknown values are rejected.
2. `Flow4TestHost__Enabled=true` is explicitly set outside committed configuration.
3. A 256-bit-or-stronger bootstrap credential is supplied to the child process over standard input and constant-time matched to the protected expected credential. It is distinct from all payment, invitation and login secrets.
4. A canonical UUID test run ID is supplied; parallel runs use unique IDs and unique idempotency/name prefixes.
5. The parsed PostgreSQL database name matches `^oneverz_flow4_e2e_[a-z0-9_]{8,64}$`.
6. The database host is loopback or an explicit protected-CI allow-list entry; known production/shared hosts and databases are denied. Host/name string checks are necessary but not sufficient.
7. The connected database contains the test-only `flow4_test_control.environment_marker` with the same database identity, environment, run authorization scope and unexpired nonce established by provisioning. Absence/mismatch fails closed.
8. The current database role is the dedicated test role and can access the test-control schema; it is not an application production role.
9. Email mode is `SUPPRESSED` or an approved test sink by default. Live ACS requires a later protected-environment override and recipient allow-list.

The test-control schema is provisioned only in the isolated test database and is not added by production EF migrations.

## Token contract

### Payment access

The CLI resolves `IManualPaymentAccessTokenService`, calls its production `GenerateToken()` and `HashToken()` paths, and provisions a `SubscriptionPaymentLink` through an approved application/repository operation. The grant preserves production purpose, allowed actions, tenant, invoice, payment, recipient binding, expiry, version and revocation. Fixture TTL is at most 60 minutes and never exceeds the production expiry. The raw token is returned once in the secret manifest and then forgotten by the CLI.

### Tenant Admin invitation

When an approved scenario needs an invitation token, the test orchestration reuses the same cryptographic generation and `ITokenHashService` semantics as `TenantOnboardingOutboxWorker`. It may create/rotate an invitation only for the named tenant membership after `ACTIVE`, revokes prior active invitations, uses at most a 60-minute fixture TTL, and returns the raw token once. Chunk 3 should extract a reusable production token primitive if necessary, without exposing a production retrieval API.

### Bootstrap credential

The bootstrap credential authorizes CLI invocation only. It is never a fixture token, never returned, never accepted by production, and never stored in the fixture ledger. CI rotates it per protected environment and after any suspected disclosure.

Wrong-purpose, expired, revoked, cross-tenant and cross-entity use must fail through the normal production lookup paths. Diagnostics may contain an HMAC-based, non-reversible fingerprint of at most 12 hexadecimal characters plus correlation/run IDs, never a raw token or token-bearing URL.

## Fixture and lifecycle boundary

Only these scenario codes are approved: `AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `ACTION_REQUIRED`, `REJECTED`, `APPROVABLE_PAYMENT`, `REJECTABLE_PAYMENT`, `REQUEST_INFORMATION_ELIGIBLE`, `CONCURRENT_REVIEW`, `UNCLEAN_EVIDENCE`, `NOTIFICATION_FAILED`, `PAID_PENDING_ACTIVATION`, `ACTIVE_INVITATION_READY`, `RETRYABLE_OPERATION`, `EXPIRED_PAYMENT_ACCESS`, `REVOKED_PAYMENT_ACCESS`, `CROSS_TENANT_PROOF`, and `COMPLETE_HAPPY_PATH`.

Normal transitions use existing onboarding, submission, review, activation, token and outbox services. A test-only assembler may directly persist an otherwise unreachable failure/intermediate state only where Chunk 3 documents the reason, uses a scenario-specific method, preserves all canonical constraints, verifies the resulting graph, and records every resource in the ownership ledger. There is no generic `SetStatus`, `ExecuteSql`, `CreateRole`, table/entity selector or arbitrary payload escape hatch.

## Manifest and secret transport

The versioned manifest is defined by the implementation contract. It separates metadata, controlled identifiers, secret values and an opaque cleanup handle. Its redacted representation replaces every secret with `[REDACTED]` and contains only counts/fingerprints.

Primary transport is a parent launcher with redirected anonymous process pipes: it writes the bootstrap credential on child standard input, captures the single JSON manifest from redirected standard output directly into memory, rejects an interactive console/TTY secret output, masks each secret with the CI runner, launches Playwright with a child-only environment and never echoes/dumps that environment. Standard error contains sanitized diagnostics only.

The fallback is a randomized, outside-workspace ephemeral file created atomically with current-user-only permissions (`0600` on Unix; explicit current-user ACL and inheritance disabled on Windows). The file must be outside artifact roots, excluded from Git, deleted before artifact upload and deleted in `finally`; startup removes only expired, ledger-owned fallback files. CI secret outputs and committed/populated `.env` files are not approved transports.

## Logging, trace and artifact rules

- Redact route/query token segments, authorization/bootstrap headers, password fields, token-bearing links and all service credentials.
- Playwright must not embed secret env values in titles, annotations, attachments or screenshots. Trace/HAR network URLs and headers must be sanitized before retention.
- Proof content, secret manifests, email captures containing links and storage credentials are excluded from uploads.
- Before artifacts are uploaded, scan against every generated secret held by the launcher plus generic bearer/JWT/token-URL/connection-string patterns. A hit fails the release job and quarantines/deletes the artifact set.
- Second Brain evidence records IDs, counts, safe fingerprints and results only.

## Ownership and cleanup

The test-only control schema contains a run ledger and resource ledger keyed by run ID, scenario, resource type/ID, created time and expiry; it contains no raw secret. Production tables are tagged by deterministic `FLOW4-E2E-{run-short}-{scenario}` values where existing fields permit, but cleanup authority comes from the ledger plus relationship verification, not names alone.

Cleanup is idempotent and always attempts, including after partial creation or test failure. It first validates all environment/database/run guards, then revokes payment grants, expires/revokes invitations, deletes test-owned Blob/evidence objects, removes test outbox/captures, removes reviews/payments/invoices/subscriptions/tenant-owned records in actual FK order, removes temporary test users/permissions, deletes ledger rows and finally destroys the in-memory or fallback manifest. Any resource not both ledger-owned and graph-bound to the run is rejected. Cleanup failure fails release validation. A protected nightly job may clean expired runs using the same guards and ownership checks.

## Email boundary

Default fixture creation suppresses dispatch and records only test-owned outbox state or sends to an explicit local sink. It never rewrites a real recipient silently. Live ACS is reserved for the later protected stage: verified test sender, recipient allow-list, explicit `LIVE_ACS=true`, protected credentials and sanitized provider evidence. No Chunk 2 delivery is claimed.

## CI contract

Required order: provision isolated services; create database marker/test role/run ID; start production backend as the system under test; invoke the separate CLI; capture/mask the manifest; launch Playwright with scoped variables; always revoke/clean; delete manifest; secret-scan; upload sanitized artifacts only. Missing fixture, skip, guard failure, token revocation failure, cleanup failure or secret hit fails the job.

Local credentials are disposable and limited to loopback databases/sinks. Protected staging credentials are environment-approved, least-privileged, rotated, recipient-allow-listed and unavailable to untrusted pull requests.

## Required Chunk 3 verification

Chunk 3 must implement the environment/database/credential guards; typed scenario and manifest validation; production token/hash reuse; one-time return; wrong-purpose/expiry/revocation/cross-tenant tests; deterministic and parallel fixture tests; ownership-bound retryable cleanup; email suppression; production reference/DI/endpoint/OpenAPI/publish absence tests; and log/report/trace/artifact secret scans. Full cases are specified in the implementation contract and threat model.

## Approval and release impact

The security design is approved and F4-GAP-001 is resolved as a documentation/security-authority gap. F4-GAP-002 remains open until Chunk 3 implements and verifies the builder. F4-GAP-008 is contractually dispositioned but remains open until teardown and artifact-redaction evidence passes. Production Flow 4 remains NO-GO.

## Related

- [[../09_SECURITY_AND_COMPLIANCE/FLOW_4_TEST_FIXTURE_TOKEN_THREAT_MODEL_2026-08-05]]
- [[../10_TESTING_QA/FLOW_4_SECURE_LIFECYCLE_FIXTURE_IMPLEMENTATION_CONTRACT_2026-08-05]]
- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_SECURE_TEST_HOST_CONTRACT_EVIDENCE_2026-08-05]]
- [[../15_IMPLEMENTATION_TRACKING/FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
