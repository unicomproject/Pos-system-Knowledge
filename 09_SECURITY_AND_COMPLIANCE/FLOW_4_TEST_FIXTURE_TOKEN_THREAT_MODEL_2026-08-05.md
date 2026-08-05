<!-- title: Flow 4 Test Fixture Token Threat Model 2026-08-05 -->
<!-- status: Approved -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 test fixture token threat model - 2026-08-05

## Scope, assets and trust boundaries

This model covers F4-GAP-001/F4-GAP-002/F4-GAP-008 and F4-REQ-070-F4-REQ-072. Assets are raw payment/invitation tokens, bootstrap credential, platform test credentials, keyed hashes, isolated database rows, private proof objects, outbox/email captures, fixture manifest and test artifacts.

Actors are an authorized local developer, protected CI runner, Playwright child process, backend/test CLI, PostgreSQL/Blob/test email services, an unauthorized local/process user, a malicious pull request and an accidental operator. Trust boundaries are protected CI to runner, launcher to CLI pipe, CLI to isolated PostgreSQL, Playwright to production API surface, outbox to test sink/ACS, and runner to artifact storage.

Entry points are the CLI command line/stdin, process environment, connection configuration, fallback manifest file, test database, Playwright URLs, cleanup command and protected CI workflow. No HTTP fixture entry point is approved.

## Threat register

| Threat ID | Threat | Likelihood | Impact | Required control | Verification |
|---|---|---|---|---|---|
| F4-THREAT-001 | Test mechanism runs in production | Low | Critical | Separate CLI project; cumulative environment, flag, credential, database marker/role/name/host guards; production reference/DI/route absence | Negative guard and architecture/publish tests |
| F4-THREAT-002 | Raw token persists in DB, log, Git, report, artifact, shell history or temp file | Medium | Critical | Hash-only DB; pipe transport; restricted fallback; no token argv; redaction and generated-secret artifact scan | DB/log/worktree/artifact scans using generated canaries |
| F4-THREAT-003 | Token is replayed after its test | Medium | High | <=60 minute TTL, run-bound use, cleanup revocation and expiry fallback | Use before cleanup; reject after revoke/expiry |
| F4-THREAT-004 | Token is accepted for the wrong purpose | Low | Critical | Separate generators/hash domains and lookup paths; explicit purpose/actions | Bidirectional payment/invitation wrong-purpose tests |
| F4-THREAT-005 | Token crosses tenant/payment/invoice/proof ownership | Medium | Critical | Persisted entity bindings and exact repository joins; privacy-safe denial | Cross-tenant and object-ID substitution tests |
| F4-THREAT-006 | Bootstrap escalates platform permissions | Low | Critical | Bootstrap authorizes only allow-listed fixture command; roles/personas fixed in scenario definitions | Unknown permission/role input rejected; persona assertions |
| F4-THREAT-007 | Tool performs arbitrary state/SQL mutation | Medium | Critical | Typed scenario enum; no generic status/SQL/table/entity/file-path inputs; scenario-specific assemblers only | Contract fuzzing and command-surface inspection |
| F4-THREAT-008 | One run reads/deletes another run | Medium | High | Unique run ID/name/idempotency namespace; ledger plus graph ownership; per-run cleanup handle | Parallel creation and foreign-run cleanup-denial tests |
| F4-THREAT-009 | CI leaks secrets in logs/traces/reports/env dumps | Medium | Critical | Pipe capture; runner masking; scoped child env; sanitized trace/HAR; no env dump; scan before upload | Deliberate canary secret scan across all output types |
| F4-THREAT-010 | Cleanup leaves tokens, fixtures, proofs, invites, users or outbox | Medium | High | `finally` cleanup, idempotent partial cleanup, TTL/nightly fallback, cleanup failure gates release | Forced-failure cleanup and post-clean DB/Blob/sink assertions |
| F4-THREAT-011 | Production code depends on test classes/config | Low | High | Production projects cannot reference test CLI; no shared test registration extension in production | project-reference, DI and publish inspection tests |
| F4-THREAT-012 | Attacker discovers a fixture endpoint in routes/Swagger | Low | Critical | No endpoint or network listener; no production controller | Endpoint metadata and OpenAPI absence tests |
| F4-THREAT-013 | Test token is long-lived | Medium | High | Fixture TTL <=60 minutes; cannot exceed production expiry; stale cleanup | Boundary/clock tests and marker expiry test |
| F4-THREAT-014 | Parallel runs collide on identity/idempotency/resource names | Medium | High | UUID run ID and run-prefixed identities/keys; DB uniqueness; isolated manifests | Concurrent-run stress test |
| F4-THREAT-015 | Fixture sends a token to a real recipient | Medium | Critical | Default suppression/test sink; invalid-domain recipients; live ACS triple gate and allow-list | Sink-only default test and non-allow-listed recipient rejection |

## Control priorities and residual risk

Critical controls are production exclusion, raw-secret non-persistence, purpose/entity binding, arbitrary-mutation prevention, CI redaction and email suppression. Residual risks remain in operating-system process inspection, CI administrator access, memory dumps, incorrect future scenario assemblers and provider-side retention during later live ACS validation. They are reduced by ephemeral dedicated runners, least privilege, short TTLs, protected environments, no untrusted-PR secrets and rotation after each incident.

The test-control marker and ledger are defense in depth. They do not replace a disposable database, dedicated role or unique run ID. String inspection of a connection string alone is not acceptable database proof.

## Verification and evidence rules

Chunk 3 must record pass/fail counts without raw values. Tests must use generated canary secrets so exact-string scans can prove absence from database textual columns, captured logs, CLI diagnostics, Playwright output and artifact staging. A safe fingerprint must be keyed/non-reversible and too short to authenticate.

Production-separation evidence includes no production project reference, service resolution, route, OpenAPI entry or copied executable/manifest. Guard tests cover blank/Development/Staging/Production environments, disabled flag, bad credential, wrong database pattern, known host, absent/mismatched/expired marker and wrong database role.

## Token-leak incident response

On suspected disclosure: stop the affected run and prevent artifact upload; revoke all ledger-owned payment grants and invitations; rotate bootstrap, login, signing/hash and provider credentials according to their exposure; delete/quarantine secret artifacts and fallback files; clean fixture data; review CI and provider access logs; document only safe correlation/fingerprints; and rerun only on a fresh isolated environment. If a signing/hash key may be exposed, treat all tokens under that key as affected and follow the platform credential-rotation procedure rather than only deleting one fixture.

## Rotation and retention

- Bootstrap credential: unique per protected environment/run where practical; rotate on disclosure and at least per CI secret policy.
- Payment/invitation raw tokens: never retained; revoke at teardown; maximum fixture TTL 60 minutes.
- Fallback manifest: delete before artifact upload and in `finally`; stale-file removal is owner/run/expiry bound.
- Test database/Blob/sink data: delete at teardown; nightly cleanup for expired ledger runs.
- Sanitized evidence: follow the CI evidence retention policy; never retain secret manifests or token-bearing email captures.

## Related

- [[../13_DECISIONS_AND_CHANGES/FLOW_4_SECURE_TEST_HOST_TOKEN_AND_FIXTURE_CONTRACT_2026-08-05]]
- [[../10_TESTING_QA/FLOW_4_SECURE_LIFECYCLE_FIXTURE_IMPLEMENTATION_CONTRACT_2026-08-05]]
