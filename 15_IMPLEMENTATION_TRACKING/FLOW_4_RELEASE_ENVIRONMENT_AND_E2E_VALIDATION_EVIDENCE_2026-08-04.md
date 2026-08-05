<!-- title: Flow 4 Release Environment Validation Evidence 2026-08-05 -->
<!-- status: Executed - Production NO-GO -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-05 -->

# Flow 4 release environment validation evidence - 2026-08-05

## A. Executive result

The safe, locally executable release validation was performed against real Angular and .NET processes plus isolated Docker PostgreSQL, ClamAV and Azurite services. Two runtime defects were found through real API/browser execution and fixed. Six distinct Playwright scenarios passed through the real browser/API path; fourteen remain blocked because their purpose-built lifecycle fixtures require raw purpose-bound access tokens or state transitions that could not be created without sending/capturing a token-bearing notification. Live Azure Communication Services credentials were not available.

**Decision: NO-GO for production.** Local implementation/regression gates pass, but the mandatory 20/20 real-browser and live ACS/Blob proof gates do not.

## B. Scope and repositories

| Repository | Branch | Starting revision |
|---|---|---|
| Unified Commerce backend | `feat/flow4-create-tenant-runtime` | `994f19b211150745e77b231cfedff1b71721a839` |
| Platform Admin Angular | `feat/flow4-create-tenant-runtime` | `8bbfb3977b3c9afb0847fcd8974a6737d143d853` |
| Second Brain | `docs/flow4-create-tenant-runtime` | `890cf4d05564d3df7a3c8c5db3660ebb4e954f4d` |

The validation covered Flow 4 tenant finalization, manual-payment queue/security surfaces, recipient-access preconditions, local service adapters, responsive behavior, dependency security, automated regressions and release preflight behavior.

## C. Docker safety and isolation

Docker inventory was captured before creation and again after Docker Desktop restarted. Existing stopped containers, the unrelated `csharp-city-builder-commercial-release_default` network and unrelated `csharp-city-builder-commercial-release_pgdata` volume were not started, stopped, removed, renamed or modified.

Flow-owned resources used:

| Resource | Name | Binding/image |
|---|---|---|
| Network | `oneverz-flow4-e2e` | isolated bridge |
| PostgreSQL container | `oneverz-flow4-postgres` | `postgres:17-alpine`, `127.0.0.1:55432 -> 5432` |
| ClamAV container | `oneverz-flow4-clamav` | `clamav/clamav:1.4`, `127.0.0.1:53310 -> 3310` |
| Azurite container | `oneverz-flow4-azurite` | `mcr.microsoft.com/azure-storage/azurite:3.35.0`, `127.0.0.1:10000 -> 10000` |
| Volumes | `oneverz-flow4-postgres-data`, `oneverz-flow4-azurite-data` | Flow-only data |

The compose definition uses localhost-only ports, no privileged mode, no host root mount and no Docker socket mount. Credentials were random, process-scoped and never printed into evidence.

## D. Environment configuration

`qa-dashboard/flow4.env.example` documents the complete release variable matrix with placeholders only. The committed release preflight checks every required scenario variable plus UI/API, PostgreSQL, ClamAV, proof fixture, Blob configuration and ACS configuration. Local mode may classify unavailable external ACS as `BLOCKED_EXTERNAL`; release mode exits nonzero on any local failure or external block.

Observed final preflight classification:

| Boundary | Classification |
|---|---|
| Angular | `READY`, HTTP 200 |
| Backend health | `READY`, HTTP 200 |
| PostgreSQL | `READY`, `127.0.0.1:55432` |
| ClamAV | `READY`, `127.0.0.1:53310` |
| Synthetic PDF fixture | `READY` |
| Azurite/Blob adapter configuration | `READY` |
| Complete lifecycle fixture variable set | `FAILED_LOCAL` - incomplete |
| Live ACS provider | `BLOCKED_EXTERNAL` - credentials unavailable |

The release preflight returned exit code 1 as designed.

## E. Database, migrations and startup

- The full EF migration chain was applied to the isolated `oneverz_flow4_e2e` PostgreSQL database.
- A data-only migration, `20260804190000_BackfillDevelopmentRetailBusinessCode`, repairs the development Retail option's missing canonical business code; historical migrations were not edited.
- Tenant draft finalization then progressed past the business-type validation boundary.
- `dotnet ef migrations has-pending-model-changes` reports no pending model change.
- The backend ran on `127.0.0.1:5150`; Angular ran on `127.0.0.1:4200`.
- The payment outbox worker started against the isolated database with short test-only polling/lease settings.

## F. Deterministic test data

Real platform APIs and the isolated database created a synthetic prepaid plan, dedicated billing-view and no-billing roles/users, and a real paid-onboarding tenant operation. The operation reached tenant `PENDING_PAYMENT`, payment `AWAITING_PAYMENT`, and invitation `NOT_ELIGIBLE` without a checkout path.

Generated ignored fixtures include valid PDF/JPEG/PNG files, MIME mismatch, magic-byte mismatch, a 10 MiB + 1 byte oversized file and EICAR. No fixture contains customer data.

The raw recipient token is intentionally not stored by the runtime. The initial notification outbox record was delivered before a token-bearing body was captured. A forced resend/capture of a secure payment link was not executed because it would intentionally create and persist a sensitive token-bearing notification. That boundary needs explicit authorization or an approved, secret-safe staging mailbox.

## G. Local service validation

| Service/path | Result |
|---|---|
| PostgreSQL real query/migration path | PASS |
| ClamAV valid PDF via `clamdscan` | PASS - `OK` |
| ClamAV EICAR via `clamdscan` | PASS - `Eicar-Test-Signature FOUND` |
| Azurite process/configuration | PASS - reachable/configured |
| Private Blob upload/download through recipient proof flow | BLOCKED - no authorized raw recipient token/submitted evidence |
| Local ACS protocol sink | PASS for non-secret protocol probe only |
| Token-bearing local email capture | NOT EXECUTED - sensitive notification boundary |
| Live ACS send/delivery | `BLOCKED_EXTERNAL` - credentials unavailable |

Existing unit/API tests continue to prove invalid extension/MIME/magic/size handling, malware-positive rejection before storage, scan fail-closed behavior and private-storage commands. These tests are supporting evidence, not a substitute for the blocked live proof path.

## H. Real-browser 20-scenario matrix

The authoritative all-20 local run completed with **5 passed and 15 explicit environment skips**. A separate focused real-browser run passed E2E 13 using the same isolated fixture, producing **6 distinct passed scenarios and 14 blocked scenarios** overall.

| # | Scenario | Result | Evidence/blocker |
|---:|---|---|---|
| 1 | Paid tenant creation reaches Pending Payment | PASS | Real operation/status API and Angular result page |
| 2 | Recipient opens secure status, no checkout | BLOCKED | Raw awaiting-payment access token unavailable |
| 3 | Valid manual-payment submission | BLOCKED | Raw token unavailable; no authorized upload mutation |
| 4 | Duplicate retry remains one submission | BLOCKED | Submitted token/state and duplicate assertion fixture unavailable |
| 5 | Review queue search/filter/detail | PASS | Real browser, Angular and PostgreSQL query |
| 6 | Private proof endpoint | BLOCKED | No submitted clean evidence fixture |
| 7 | Approval reaches Paid/Pending Activation only | BLOCKED | Approvable submitted fixture unavailable |
| 8 | Separate activation and invitation queue | BLOCKED | Paid fixture unavailable |
| 9 | Rejection and recipient-safe outcome | BLOCKED | Rejectable fixture/raw token unavailable |
| 10 | Request information/correction/history | BLOCKED | Action-required fixture/raw token unavailable |
| 11 | Concurrent stale review conflict | BLOCKED | Two-admin conflict fixture unavailable |
| 12 | No-billing user denied UI and API | PASS | Dedicated real synthetic user |
| 13 | Billing-view-only user cannot review | PASS | Focused real-browser result, read-only controls |
| 14 | Invalid/expired link exposes no payment data | PASS | Real public endpoint with invalid synthetic token |
| 15 | Invalid/unclean evidence blocked | BLOCKED | Recipient token and unclean payment fixture unavailable |
| 16 | Authorized notification resend | BLOCKED | Token-bearing notification side effect not authorized |
| 17 | Cross-tenant proof access is privacy-safe | PASS | Actual Angular bearer captured in memory; API returned 403/404 with no storage metadata |
| 18 | Retryable activation work retries safely | BLOCKED | Failed/retryable operation fixture unavailable |
| 19 | Invitation resend exposes no raw token | BLOCKED | Active payment/invitation fixture unavailable |
| 20 | Complete lifecycle boundary | BLOCKED | Happy-path operation/payment/raw-token fixture unavailable |

No HTTP route fulfilment, mocked backend response, browser-storage mutation or fake gateway success was used.

## I. Defects found and corrected

1. Tenant finalization returned 422 because the development Retail business type had an empty `business_code`. The additive data migration backfills `RETAIL` only for the canonical development row.
2. Finalization then returned PostgreSQL `22P02` because onboarding history `change_data` was a semicolon string written to `jsonb`. The repository now serializes a typed JSON payload; a unit test parses and verifies both identifiers.
3. The real review queue exposed an EF translation failure caused by DTO projection before filtering. Queue/detail queries now filter/order/page joined entities before projecting DTOs. The real-browser queue scenario passes after the fix.
4. The queue/tablet layout allowed an oversized desktop table to create global horizontal scroll. Tablet widths now use the existing card projection, hosts/containers have bounded sizing, and document-level overflow is clipped.
5. Browser authorization proof originally risked testing an unauthenticated request. E2E 17 now captures the real Angular interceptor bearer in memory and sends it only to the scoped proof request.

## J. Accessibility and responsive evidence

The queue was exercised at `360x800`, `768x1024`, `1024x768`, `1366x768` and `1600x900`. All five final checks report no global horizontal scroll and a keyboard-focusable element after Tab. Screenshots are retained under `qa-dashboard/.flow4/acceptance/queue-*.png`.

Semantic labels, native controls, visible focus styling, dialog labelling and small-screen card/table switching are present. This is focused automated keyboard/responsive evidence; it is not a claim of complete WCAG or screen-reader certification. The token-gated recipient surface still needs the same real-browser matrix.

## K. Security and privacy evidence

- Recipient token remains route-scoped and hash-only at rest; no token is placed into browser storage.
- Public recipient calls do not receive a platform bearer through the Angular interceptor.
- Proof authorization uses exact payment/evidence association and returns privacy-safe 403/404 responses.
- Proof DTOs do not expose Blob container/key/checksum values.
- Production npm dependency audit: 0 vulnerabilities after Angular 21.2.19 patch alignment.
- QA Playwright dependency audit: 0 vulnerabilities.
- The Angular development toolchain still reports one high and five lower advisories in transitive build-only packages; npm proposes only breaking/incorrect Angular downgrades. Production dependencies are unaffected, but this is recorded for the Angular 22 toolchain upgrade.
- No secrets, raw access tokens, connection strings or customer data were written to tracked files or console evidence.

## L. Automated regression results

| Gate | Result |
|---|---|
| Backend build | PASS - 0 warnings, 0 errors |
| Backend UnitTests | PASS - 743/743 |
| Backend ApiTests | PASS - 341/341 |
| Backend IntegrationTests | PASS - 377/377 |
| Backend total | PASS - 1,461/1,461 |
| EF pending model changes | PASS - none |
| Angular production build | PASS - five existing component style-budget warnings |
| Angular application/spec TypeScript | PASS |
| Angular tests | PASS - 62 files, 453/453 |
| Angular production npm audit | PASS - 0 vulnerabilities |
| Playwright harness npm audit | PASS - 0 vulnerabilities |
| Changed-file whitespace check | PASS |

## M. Release CI gate

`.github/workflows/flow4-release-validation.yml` adds a manual environment-protected `flow4-release` job. It builds/tests Angular, installs pinned Chromium, generates safe fixtures, runs release preflight, runs all 20 real-browser scenarios and uploads Playwright artifacts. The job consumes URLs from environment variables and every credential/token/fixture identifier from GitHub environment secrets. Missing or blocked values fail before browser execution.

## N. Artifact inventory

- Final all-20 matrix: `qa-dashboard/.flow4/final-playwright-matrix`
- Focused view-only run: `qa-dashboard/.flow4/final-playwright-view-only`
- Responsive screenshots: `qa-dashboard/.flow4/acceptance`
- Earlier diagnostic failure trace/video/screenshot: `qa-dashboard/.flow4/final-playwright`
- Playwright HTML/JSON/JUnit: `qa-dashboard/test-results/flow4-html`, `flow4-results.json`, `flow4-junit.xml`
- Synthetic fixtures: `qa-dashboard/.flow4/fixtures`

Artifacts are ignored from Git and contain only synthetic data. The harmless local email-sink capture contains only a non-secret probe; no secure link was captured.

## O. ACS live-validation block

Exact blocked checks: payment-access email provider send, delivery state, recipient routing, provider message identifier, retry/authorized resend behavior, telemetry redaction against the live provider, invitation email delivery and public URL opening. Required inputs: approved ACS endpoint/connection string, verified sender address, secret-safe staging recipient mailbox and authorization to generate/send token-bearing test notifications. This block does not invalidate local PostgreSQL/ClamAV/browser evidence, but it prevents production release.

## P. Remaining release blockers

### P0

- Execute E2E 2-11, 15-16 and 18-20 with purpose-built isolated lifecycle fixtures and secret-safe raw-token delivery.
- Complete private Blob upload/download and exact proof-stream validation through the real submission path.
- Complete live ACS payment/invitation delivery, retry and redacted telemetry checks.
- Achieve a 20/20 release-mode Playwright pass and retain CI artifacts.

### P1

- Run full keyboard/screen-reader acceptance on the recipient surface after a safe token is available.
- Upgrade the Angular development toolchain when a non-breaking advisory-free line is available (or validate the Angular 22 migration separately).

## Q. Cleanup

After repository evidence is committed/pushed, only `oneverz-flow4-*` containers, network and volumes are to be removed. No Docker prune or unrelated-resource cleanup is permitted. Browser artifacts remain on disk outside Git.

## R. Git and PR evidence

Final commit hashes and push results are recorded in the task handoff after commits are created. The working branches remain the existing Flow 4 feature/docs branches. No merge is authorized while this report is NO-GO.

## S. Completion-gate assessment

The user-defined gate requires PostgreSQL, private Blob, ClamAV and email to be operational; all 20 Playwright scenarios to pass; permissions/security/accessibility/responsiveness to be validated; regressions to pass; docs/CI to be updated; and external-only checks to be isolated precisely. PostgreSQL, ClamAV, six browser scenarios, responsive queue checks, regressions, docs and CI are complete. Private proof flow, fourteen browser scenarios and live ACS are not. The gate is therefore not met.

## T. Final decision

**NO-GO.**

The implementation is materially stronger and all locally completed gates are evidenced, but production promotion must wait for the P0 items in section P. No provider, token, Blob or lifecycle success has been fabricated.

## Related

- [[FLOW_4_CREATE_TENANT_WIZARD_IMPLEMENTATION_EVIDENCE_2026-08-04]]
- [[FLOW_4_MANUAL_PAYMENT_BACKEND_IMPLEMENTATION_EVIDENCE_2026-08-04]]
- [[FLOW_4_MANUAL_PAYMENT_ANGULAR_IMPLEMENTATION_EVIDENCE_2026-08-04]]
- [[../10_TESTING_QA/FLOW_4_CREATE_TENANT_WIZARD_TEST_MATRIX]]
- [[../05_BACKEND_ARCHITECTURE/FLOW_4_MANUAL_PAYMENT_AND_FUTURE_IPG_ARCHITECTURE]]
