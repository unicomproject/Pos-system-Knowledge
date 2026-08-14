# Flow 4 Deterministic Fixture Runtime Evidence — 2026-08-05

## Executive result

Chunk 3 runtime implementation is complete for the non-HTTP fixture CLI, all 17 approved scenarios, production token/hash reuse, manifest 1.0, process-pipe handoff, restricted fallback, run ownership, parallel isolation and cleanup. The implementation is production-separated and was exercised against a disposable PostgreSQL 16 database using a dedicated non-superuser role.

The focused real-browser consumption run is not claimed: the execution environment rejected the required background API launch after its approval/usage limit was reached. This is an execution condition, not a fixture-runtime defect. The decision is therefore **CONDITIONAL_GO_TO_CHUNK_4 — Fixture runtime complete with explicitly listed conditions**.

## Architecture and production separation

- Test executable: `tests/E_POS.Flow4FixtureCli`; commands are `create`, `cleanup`, `validate`, and `describe`.
- Transport: bootstrap input and cleanup handle enter through stdin; manifest secrets leave through a redirected stdout pipe or restricted ephemeral fallback.
- Production API: no fixture project reference, route, controller, Swagger entry, or publish inclusion.
- Production reuse: `ManualPaymentAccessTokenService`, `InvitationTokenService`, `TokenHashService`, `PasswordHashService`, domain transitions and persisted production entities.
- The invitation token code formerly embedded in `TenantOnboardingOutboxWorker` is extracted into the production `IInvitationTokenService`; generation and hashing behavior are unchanged.

## Cumulative guards

The CLI fails closed unless all boundaries pass: exact `Test`/`E2E` environment, explicit enable flag, non-empty run UUID, high-entropy stdin bootstrap credential with constant-time comparison, TTL 1–60 minutes, `SUPPRESSED`/`TEST_SINK` email mode, signing key, isolated database-name regex, allow-listed loopback host, deny-lists, exact dedicated connection role, connected database/user identity, and valid unexpired marker row/nonce.

Provisioning SQL creates `flow4_test_control.environment_marker`, `fixture_runs`, and `fixture_resources` only after checking the isolated database name. Public schema/table rights are revoked. Approved fixed-purpose E2E roles are provisioned with only their defined permissions.

## Scenario evidence

All scenarios are implemented and created in one real database run: `AWAITING_PAYMENT`, `PAYMENT_SUBMITTED`, `ACTION_REQUIRED`, `REJECTED`, `APPROVABLE_PAYMENT`, `REJECTABLE_PAYMENT`, `REQUEST_INFORMATION_ELIGIBLE`, `CONCURRENT_REVIEW`, `UNCLEAN_EVIDENCE`, `NOTIFICATION_FAILED`, `PAID_PENDING_ACTIVATION`, `ACTIVE_INVITATION_READY`, `RETRYABLE_OPERATION`, `EXPIRED_PAYMENT_ACCESS`, `REVOKED_PAYMENT_ACCESS`, `CROSS_TENANT_PROOF`, and `COMPLETE_HAPPY_PATH`.

The run returned schema `1.0`, 17 scenario entries, 88 identifiers, 23 one-time secrets and 211 owned resources before cleanup. Payment tokens exist only in the manifest secrets and hashes are persisted. Invitation tokens are generated only for `ACTIVE_INVITATION_READY` and `COMPLETE_HAPPY_PATH`. `CROSS_TENANT_PROOF` uses a primary payment ID with a different tenant's evidence ID. `NOTIFICATION_FAILED` uses a controlled failed outbox state and never invokes ACS.

Direct persistence exception: `EXPIRED_PAYMENT_ACCESS` backdates only the owned link's `created_at` and `expires_at` after normal production construction/provisioning, preserving the database ordering constraint. Evidence is metadata-only in Chunk 3; real private Blob/ClamAV validation remains Chunk 4.

## Manifest, mapping and cleanup

- Manifest version: `1.0`; fixture set: `canonical-v1`; metadata, identifiers, secrets and cleanup metadata are separate.
- `ToString()` and stderr diagnostics redact secret values.
- Interactive secret output is rejected.
- Ephemeral fallback rejects repository, `.env`, and test-result paths; files receive current-user-only ACL / Unix `0600` and are deleted.
- The launcher validates version, run ID and expiry in memory, maps the exact current `FLOW4_*` variables, runs only five focused browser checks by default, and cleans in `finally`.
- Cleanup hashes the ownership handle, locks the run row, denies foreign handles, revokes/clears payment token hashes before deletion, removes only ledger-owned records in FK order, and is repeat-safe.

Exact launcher variables are: `FLOW4_ADMIN_EMAIL`, `FLOW4_ADMIN_PASSWORD`, `FLOW4_SECOND_ADMIN_EMAIL`, `FLOW4_SECOND_ADMIN_PASSWORD`, `FLOW4_VIEW_EMAIL`, `FLOW4_VIEW_PASSWORD`, `FLOW4_NO_BILLING_EMAIL`, `FLOW4_NO_BILLING_PASSWORD`, `FLOW4_OPERATION_ID`, `FLOW4_AWAITING_TOKEN`, `FLOW4_SUBMITTED_TOKEN`, `FLOW4_SUBMITTED_PAYMENT_ID`, `FLOW4_APPROVABLE_PAYMENT_ID`, `FLOW4_PAID_PAYMENT_ID`, `FLOW4_REJECTABLE_PAYMENT_ID`, `FLOW4_REJECTED_TOKEN`, `FLOW4_INFO_PAYMENT_ID`, `FLOW4_ACTION_REQUIRED_TOKEN`, `FLOW4_CONFLICT_PAYMENT_ID`, `FLOW4_EXPIRED_TOKEN`, `FLOW4_REVOKED_TOKEN`, `FLOW4_INVALID_EVIDENCE_TOKEN`, `FLOW4_UNCLEAN_PAYMENT_ID`, `FLOW4_NOTIFICATION_FAILED_PAYMENT_ID`, `FLOW4_CROSS_TENANT_PROOF_URL`, `FLOW4_RETRY_OPERATION_ID`, `FLOW4_ACTIVE_PAYMENT_ID`, `FLOW4_HAPPY_OPERATION_ID`, `FLOW4_HAPPY_PAYMENT_ID`, `FLOW4_HAPPY_TOKEN`, and `FLOW4_PROOF_FILE`.

## Verification

- Full backend restore/build: succeeded, 0 warnings, 0 errors.
- Full backend tests: 1,485 passed (`743` unit, `341` API, `386` integration, `15` fixture CLI in the solution run).
- Dedicated PostgreSQL fixture suite: 15/15 passed with both database tests active; all 17 states/hash-only persistence/cleanup plus parallel and foreign-handle behavior.
- Additional fallback tests: fixture security suite is 17/17 after adding restricted-file checks.
- EF pending-model check: no changes since the last migration.
- Angular: 453/453 tests passed; production build passed with existing style-budget warnings.
- Launcher mapping: Node test 2/2 passed; syntax checks passed.
- Real database manual proof: parallel runs `2`, isolated `true`, foreign cleanup denied `true`, duplicate creation rejected `true`, owned cleanup `true`; repeated cleanup returned already-clean.
- Secret scan: no generated runtime token, populated manifest, populated `.env`, database file, or token-bearing URL was written to a repository. Test-only sentinel strings remain only in redaction assertions.

## Remaining condition and scope boundary

Run the five focused launcher checks against live local API/UI processes when process-launch approval is available: awaiting recipient/no-checkout, expired token denial, revoked token denial, billing-view-only persona, and no-billing persona. Do not treat this as the final 20/20 release matrix. Chunk 4 private-proof and ClamAV work, Chunk 5 live ACS work, final 20/20 execution and production release approval remain separate gates.

## Final Chunk 3 decision

**CONDITIONAL_GO_TO_CHUNK_4 — Fixture runtime complete with explicitly listed conditions**

