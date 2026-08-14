<!-- title: Flow 4 Docker Dependency and Merge Readiness Audit 2026-08-06 -->
<!-- status: MERGE_READY_WITH_EXTERNAL_RELEASE_BLOCK -->
<!-- system: TM-EPOS MVP / OneVerz -->
<!-- last_updated: 2026-08-06 -->

# Flow 4 — Docker Dependency and Merge Readiness Audit (2026-08-06)

## Decision

**MERGE_READY_WITH_EXTERNAL_RELEASE_BLOCK — Internal Flow 4 is safe to merge; Docker is optional/test-only for the normal team workflow; production remains blocked**

Production remains **NO-GO**. Live ACS / controlled mailbox / approved HTTPS bases remain **BLOCKED_EXTERNAL**. This audit does not claim live email completion.

## Baselines audited

| Repository | Branch | HEAD | Ahead/behind upstream |
| --- | --- | --- | --- |
| Backend (`Unified-Commerce`) | `feat/flow4-create-tenant-runtime` | `c6383343565288e45a24e9132f8029a43abeb94d` | 0 / 0 |
| Angular (`nytroz-pos-platform-admin`) | `feat/flow4-create-tenant-runtime` | `5cb97419c8411a1dc7411aaa453ee44b2eaf273b` | 0 / 0 |
| Second Brain | `docs/flow4-create-tenant-runtime` | `babc560ea43230dc99bd9a09344c0c72778ea740` (+ this docs commit) | was 0 / 0 |

Working trees were clean at audit start. `git diff --check` clean.

## Why Docker was used

Docker was introduced only as **optional local E2E / private-proof harness infrastructure** so release engineers can spin up:

| Service | Image / role | Used for |
| --- | --- | --- |
| PostgreSQL | `postgres:17-alpine` (`oneverz-flow4-postgres`) | Isolated Flow 4 E2E database + fixture CLI |
| ClamAV | `clamav/clamav:1.4` (`oneverz-flow4-clamav`) | Real malware scan during proof E2E / integration |
| Azurite | `mcr.microsoft.com/azure-storage/azurite` (`oneverz-flow4-azurite`) | Private blob proof path without Azure |

Normal application development, builds, and unit/API tests do **not** start or require these containers.

## Audit answers (1–14)

| # | Question | Answer |
| --- | ---: | --- |
| 1 | Normal Backend startup require Docker? | **No.** API uses configured PostgreSQL / Blob / ACS from appsettings or User Secrets. No Docker API, compose, or Testcontainers in runtime DI. |
| 2 | Normal Angular startup require Docker? | **No.** `ng serve` / `npm start` only. |
| 3 | Backend unit tests require Docker? | **No.** `E_POS.UnitTests` **743/743** without Docker. |
| 4 | Angular unit tests require Docker? | **No.** **454/454** without Docker. |
| 5 | Which integration tests require Docker? | **None require Docker itself.** Some optionally need a **reachable** PostgreSQL, ClamAV TCP, and/or Azurite. They soft-return when unavailable (`CanConnect*` / missing env). No Testcontainers / Docker.DotNet package. |
| 6 | Playwright suite require Docker services? | **Yes for full internal E2E** (Postgres + usually ClamAV/Azurite + running API/UI). Not part of normal `npm test`. |
| 7 | Every team member need Docker? | **No.** |
| 8 | Docker-dependent validation owned by CI/release/tester? | **Yes — preferred.** Backend CI = restore/build/`dotnet test` without compose. Flow 4 browser gate = manual `workflow_dispatch` / release engineer. |
| 9 | Tracked Docker/container-related files? | See inventory below. |
| 10 | Branch add Docker-related files? | **Angular:** added `qa-dashboard/docker-compose.flow4.yml` (+ `flow4.env.example`). **Backend:** no compose; added ClamAV scanner + PostgreSQL-named tests (not Docker files). |
| 11 | DB data / volumes / logs / artifacts tracked? | **No.** Angular `.gitignore` covers `.env.flow4.local`, `.flow4/`, `test-results/`, `playwright-report/`. Backend ignores `TestResults/`. |
| 12 | Real secrets tracked? | **No merge-blocking secrets.** Placeholders / `REDACTED` / well-known Azurite devstore key only. |
| 13 | Live email disabled safely when ACS missing? | **Yes.** Unconfigured sender → no send; outbox → `FAILED_RETRYABLE` (not `DELIVERED`). |
| 14 | Safe to merge while production blocked? | **Yes**, with explicit external release block documented. |

## Docker tracked-file inventory

| Repo | Path | Existing / Flow 4 added | Purpose | Classification | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Angular | `qa-dashboard/docker-compose.flow4.yml` | **Added by Flow 4** | Optional local Postgres/ClamAV/Azurite for E2E | `E2E_TEST_ONLY` | **Keep** — document; do not remove |
| Angular | `qa-dashboard/flow4.env.example` | Added by Flow 4 | Empty env template | `DOCUMENTATION_ONLY` / E2E config | **Keep** |
| Angular | `.gitignore` Flow 4 entries | Modified | Ignore local E2E secrets/artifacts | Safety | **Keep** |
| Backend | `ClamAvManualPaymentEvidenceScanner.cs` | Added | Production scanner adapter (TCP to ClamAV) | `APPLICATION_RUNTIME` (optional service) | **Keep** — not Docker |
| Backend | `*PostgreSql*Tests.cs`, proof lifecycle tests | Added | Optional real-DB / Azurite / ClamAV checks | `INTEGRATION_TEST_ONLY` | **Keep** |
| Backend | No `Dockerfile` / compose / Testcontainers | N/A | — | — | N/A |

No Flow 4 containers were running during audit (`docker ps` empty; no `oneverz-flow4-*`).

## Dependency classification

| Dependency | Classification |
| --- | --- |
| `qa-dashboard/docker-compose.flow4.yml` | `E2E_TEST_ONLY` |
| ClamAV TCP scanner in Infrastructure | `APPLICATION_RUNTIME` (config-gated; host or container) |
| Azurite well-known connection in proof tests | `INTEGRATION_TEST_ONLY` |
| Fixture CLI + Playwright launcher | `E2E_TEST_ONLY` |
| Backend CI `dotnet test` | `CI_ONLY` (no compose services) |
| Angular `flow4-release-validation.yml` | `CI_ONLY` / release (manual dispatch; secrets env) |
| Testcontainers / Docker.DotNet | **Absent** |

## Docker-off validation (executed 2026-08-06)

No Flow 4 containers running.

| Gate | Command / project | Result |
| --- | --- | --- |
| Backend restore | `dotnet restore E_POS.sln` | PASS |
| Backend build | `dotnet build E_POS.sln` | PASS (0 warnings/errors, ~92s) |
| Unit tests | `E_POS.UnitTests` | **743 / 743** (~5s) |
| API tests | `E_POS.ApiTests` | **341 / 341** (~9s) |
| Integration | `E_POS.IntegrationTests` (no fixture/Postgres env) | **400 / 400** (~70s; optional DB/ClamAV/Azurite soft-return) |
| Fixture CLI tests | `E_POS.Flow4FixtureCli.Tests` | **17 / 17** (~0.5s; PostgreSQL cases no-op without env) |
| Angular build | `npm run build` | PASS |
| Angular tsc | app + spec `--noEmit` | PASS |
| Angular unit | `npm test -- --watch=false` | **454 / 454** |

## ACS safe-default review

- `AzureCommunicationEmailSender.IsConfigured` is false when ConnectionString/Endpoint/Sender absent → `SendAsync` returns failure (`NotConfigured`); **no network send**.
- `TenantOnboardingOutboxWorker` throws `RetryableDeliveryException` when email / payment base URL not configured → message marked **`FAILED_RETRYABLE`**, never falsely **`DELIVERED`**.
- Covered by unit/integration tests (`UnconfiguredAcsSender_OutboxMessage_MarksStatusFailedRetryableAndDoesNotDeliver`).
- External gaps remain documented (F4-GAP-004 / F4-REQ-063). Internal preflight evidence does not claim live ACS.

## Secret / artifact audit

- No populated `.env`, mailbox credentials, or ACS live keys in tracked files.
- Unit tests use `accesskey=REDACTED` and example ACS host.
- Proof tests embed the **public well-known Azurite `devstoreaccount1` key** (Microsoft local emulator documentation) — not a production secret.
- Local test connection strings with `Password=admin` are developer placeholders behind `CanConnectAsync` gates — not production credentials.
- Playwright reports / traces / `.flow4/` / `.env.flow4.local` are gitignored.

## Migration review

No new migrations introduced by this audit. Existing Flow 4 EF migrations remain part of the feature branch. Docker-off build succeeded with 0 pending-model build errors.

## Team workflow matrix

| Activity | Docker Required | Recommended Owner | Normal Team Command |
| --- | ---: | --- | --- |
| Backend development | No | Any developer | `dotnet run` (configured DB) |
| Backend build | No | Any / CI | `dotnet build E_POS.sln` |
| Backend unit tests | No | Any / CI | `dotnet test tests/E_POS.UnitTests` |
| Backend API tests | No | Any / CI | `dotnet test tests/E_POS.ApiTests` |
| Backend integration (optional real PG/ClamAV/Azurite) | No Docker package; optional local services | CI / release / dedicated tester | `dotnet test tests/E_POS.IntegrationTests` with services up |
| Angular development | No | Any developer | `npm start` |
| Angular build | No | Any / CI | `npm run build` |
| Angular unit tests | No | Any / CI | `npm test -- --watch=false` |
| Flow 4 Playwright (21) | **Yes** (compose + API + UI + fixtures) | Release eng / dedicated tester | `docker compose -f qa-dashboard/docker-compose.flow4.yml up -d` then fixture launcher / Playwright |
| Private-proof integration | Optional ClamAV + Azurite (compose OK) | Release eng / dedicated tester | Integration tests with ports reachable |
| Full release validation | Yes + external ACS/mailbox/HTTPS | Release eng | Protected workflow + live external gates |

Preferred outcome (supported by evidence):

```text
Normal development and unit tests:
Docker not required

Integration, private proof and full E2E:
Docker (or equivalent local services) required

Docker ownership:
CI, release engineer or dedicated tester
```

## Commands without Docker

```powershell
# Backend
dotnet restore E_POS.sln
dotnet build E_POS.sln
dotnet test tests/E_POS.UnitTests/E_POS.UnitTests.csproj
dotnet test tests/E_POS.ApiTests/E_POS.ApiTests.csproj

# Angular
npm run build
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.spec.json --noEmit
npm test -- --watch=false
```

## Safe cleanup (when someone used Flow 4 compose)

```powershell
docker compose -f qa-dashboard/docker-compose.flow4.yml down
# Optional named volumes only if intentionally wiping E2E data:
# docker volume rm oneverz-flow4-postgres-data oneverz-flow4-azurite-data
# Do NOT run docker system prune unless explicitly approved.
```

## Merge recommendation

- **Raise PRs** for Backend and Angular feature branches.
- **Do not merge as a production-GO.** Document external ACS/mailbox/HTTPS block in PR body.
- Keep `docker-compose.flow4.yml`; do not delete optional E2E infrastructure because some developers lack Docker.

## Production recommendation

**NO-GO** until F4-GAP-004 (live ACS + mailbox + HTTPS bases) closes.

## Mandatory ledger

| Gate | Description | Status |
| --- | --- | --- |
| MR-01 | Repository baseline | PASS |
| MR-02 | Docker tracked-file inventory | PASS |
| MR-03 | Backend runtime Docker audit | PASS |
| MR-04 | Angular runtime Docker audit | PASS |
| MR-05 | Backend unit-test audit | PASS |
| MR-06 | Angular unit-test audit | PASS |
| MR-07 | Integration-test Docker audit | PASS |
| MR-08 | Playwright Docker audit | PASS |
| MR-09 | CI/CD dependency audit | PASS |
| MR-10 | Docker package-reference audit | PASS |
| MR-11 | Docker script audit | PASS |
| MR-12 | Git artifact audit | PASS |
| MR-13 | Gitignore audit | PASS |
| MR-14 | Secret audit | PASS |
| MR-15 | Docker-off Backend build | PASS |
| MR-16 | Docker-off Backend unit tests | PASS |
| MR-17 | Docker-off Angular build | PASS |
| MR-18 | Docker-off Angular tests | PASS |
| MR-19 | Migration review | PASS |
| MR-20 | External ACS safe-default review | PASS |
| MR-21 | Team workflow decision | PASS |
| MR-22 | Merge readiness | PASS |
| MR-23 | PR description preparation | PASS |
| MR-24 | Documentation and push | PASS (this document) |

## Related

- [[FLOW_4_INTERNAL_21_SCENARIO_E2E_PREFLIGHT_EVIDENCE_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]

---

## Prepared Backend PR description

```text
## Summary
- Completes internal Flow 4 Create Tenant Wizard / Manual Payment runtime (lifecycle, permissions, hash-only tokens, outbox, private proof adapters).
- Fixture CLI and integration coverage for deterministic E2E; ClamAV/Azurite adapters are config-gated.
- No Docker runtime dependency for normal API startup or unit/API tests.

Internal Flow 4:
Complete

Playwright internal E2E:
21/21 passed

Backend:
1,501/1,501 passed

Angular:
454/454 passed

Docker:
Optional / E2E and optional real-service integration only. Normal development and unit tests do not require Docker. No Testcontainers package. Ownership: CI / release engineer / dedicated tester.

Live ACS/mailbox/HTTPS:
Still BLOCKED_EXTERNAL

Production:
NO-GO

## Test plan
- [ ] `dotnet restore` + `dotnet build E_POS.sln` without Docker
- [ ] `dotnet test` UnitTests + ApiTests without Docker
- [ ] Confirm appsettings/User Secrets do not enable live ACS against customer mailboxes
- [ ] Optional: release engineer runs Flow 4 compose + Playwright 21
- [ ] Do not treat merge as production GO
```

## Prepared Angular PR description

```text
## Summary
- Completes Flow 4 Platform Admin / recipient UI for manual payment, activation, and invitation setup.
- Separates internal vs external Playwright gates; `qa-dashboard/docker-compose.flow4.yml` is optional E2E harness only.
- Tenant status comparisons handle API lowercase lifecycle values.

Internal Flow 4:
Complete

Playwright internal E2E:
21/21 passed

Backend:
1,501/1,501 passed

Angular:
454/454 passed

Docker:
Optional for Flow 4 Playwright / private-proof local stack only (`qa-dashboard/docker-compose.flow4.yml`). Normal `npm start`, `npm run build`, and `npm test` do not require Docker.

Live ACS/mailbox/HTTPS:
Still BLOCKED_EXTERNAL

Production:
NO-GO

## Test plan
- [ ] `npm run build` + `tsc` app/spec + `npm test -- --watch=false` without Docker
- [ ] Smoke Platform Admin login and manual-payment queue against a shared/dev API
- [ ] Optional: release engineer runs compose + fixture launcher + Playwright 21
- [ ] Confirm `.env.flow4.local` / tokens are not committed
- [ ] Do not treat merge as production GO
```
