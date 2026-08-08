# Flow 4 Live ACS Mailbox and Playwright Completion Evidence Report

**Document ID:** `FLOW_4_LIVE_ACS_MAILBOX_AND_PLAYWRIGHT_COMPLETION_EVIDENCE_2026-08-05`  
**Execution Date:** 2026-08-05  
**Chunk:** Chunk 5E — Flow 4 External Test Environment Provisioning and Live ACS Completion  
**Test-run ID (sanitized):** `c5e-2026-08-05-live-email-attempt`  
**Repository Branch / Commit (start):**
- Backend (`Unified-Commerce`): `feat/flow4-create-tenant-runtime` @ `1713e731d6ede4c2de20ff40c43a3b07fddf9dab`
- Angular (`nytroz-pos-platform-admin`): `feat/flow4-create-tenant-runtime` @ `fc909418eb6289ef08862257e82b3e4c5f0ea744`
- Second Brain (`Pos-system-Knowledge`): `docs/flow4-create-tenant-runtime` @ `23a7ebb01219a96cab98d63e975572346a85c2a4`

---

## 1. Executive Summary

Chunk 5E provisioned the **isolated Flow 4 live-test PostgreSQL environment** and re-validated that ACS credentials remain available in `.NET User Secrets`. Live ACS dispatch, mailbox receipt and Playwright 21/21 were **not executed** because mandatory external prerequisites remain unavailable and were not invented:

| Prerequisite | Status |
| :--- | :--- |
| ACS User Secrets (connection + sender + fallback=false) | **PASS** (retained from Chunk 5D) |
| Isolated PostgreSQL + EF migrations | **PASS** (provisioned this chunk) |
| Flow 4 `environment_marker` safety row | **PASS** (provisioned this chunk) |
| Controlled synthetic mailbox + access method | **BLOCKED_EXTERNAL** |
| Recipient allow-list configuration | **BLOCKED_EXTERNAL** |
| Approved HTTPS `PaymentAccessBaseUrl` | **BLOCKED_EXTERNAL** |
| Approved HTTPS `TenantAdminAppBaseUrl` | **BLOCKED_EXTERNAL** |
| Real ACS provider dispatch / mailbox receipt | **NOT EXECUTED** (preflight incomplete) |
| Playwright 21/21 | **BLOCKED_EXTERNAL** (21 skipped) |

**No live emails were sent.** Per Section 12 stop rules, live dispatch is forbidden until every mandatory preflight check passes.

**Milestone Decision:** `CONDITIONAL_GO_TO_CHUNK_6`

---

## 2. Mandatory Execution Ledger (C5E-01 to C5E-34)

| Gate | Description | Status |
| :--- | :--- | :--- |
| C5E-01 | Repository baseline | **PASS** |
| C5E-02 | Requirements and config-key extraction | **PASS** |
| C5E-03 | ACS User Secrets validation | **PASS** |
| C5E-04 | Controlled mailbox configured | **BLOCKED_EXTERNAL** |
| C5E-05 | Mailbox access verified | **BLOCKED_EXTERNAL** |
| C5E-06 | Recipient allow-list configured | **BLOCKED_EXTERNAL** |
| C5E-07 | Non-allow-listed recipient rejected | **BLOCKED_EXTERNAL** |
| C5E-08 | Payment HTTPS base URL | **BLOCKED_EXTERNAL** |
| C5E-09 | Setup-account HTTPS base URL | **BLOCKED_EXTERNAL** |
| C5E-10 | Isolated Flow 4 database | **PASS** |
| C5E-11 | Test-environment safety marker | **PASS** |
| C5E-12 | Real ACS provider selected | **PASS** (DI/`AzureCommunicationEmailSender`; fallback disabled) |
| C5E-13 | Payment-required live dispatch | **BLOCKED_EXTERNAL** |
| C5E-14 | Payment-required mailbox receipt | **BLOCKED_EXTERNAL** |
| C5E-15 | Payment-submitted live dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5E-16 | Action-required live dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5E-17 | Payment-rejected live dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5E-18 | Payment-approved live dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5E-19 | Invitation live dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5E-20 | Payment resend | **BLOCKED_EXTERNAL** |
| C5E-21 | Invitation resend and rotation | **BLOCKED_EXTERNAL** |
| C5E-22 | Provider IDs persisted | **BLOCKED_EXTERNAL** |
| C5E-23 | Duplicate-delivery prevention | **BLOCKED_EXTERNAL** (live mailbox path) |
| C5E-24 | Playwright 21-scenario execution | **BLOCKED_EXTERNAL** (21 skipped) |
| C5E-25 | Token and link security | **PASS** (prior internal baseline retained; no live tokens minted) |
| C5E-26 | Template and privacy validation | **BLOCKED_EXTERNAL** |
| C5E-27 | Secret and artifact scan | **PASS** |
| C5E-28 | Backend regression | **PASS** (1,501 / 1,501) |
| C5E-29 | Angular regression | **PASS** (454 / 454) |
| C5E-30 | Fixture and outbox cleanup | **PASS** (no live fixtures created) |
| C5E-31 | Mailbox evidence cleanup | **PASS** (no mailbox messages) |
| C5E-32 | Process/container cleanup | **PASS** (`oneverz-flow4-live-email-pg` removed; process secrets cleared) |
| C5E-33 | Traceability update | **PASS** |
| C5E-34 | Git commit and push | **PASS** (Second Brain evidence) |

---

## 3. Isolated Database Provisioning (New This Chunk)

Preferred prompt topology was adapted to satisfy `Flow4FixtureSecurityGuard` without weakening it.

| Prompt preference | Actual provisioned value | Reason |
| :--- | :--- | :--- |
| Container `oneverz-flow4-live-email-pg` | `oneverz-flow4-live-email-pg` | Exact match |
| Host port `55437` | `55437` | Exact match |
| Image `postgres:16-alpine` | `postgres:16-alpine` | Exact match |
| Database `oneverz_flow4_live_email` | `oneverz_flow4_e2e_liveemail` | Guard requires `^oneverz_flow4_e2e_[a-z0-9_]{8,64}$` |
| Role | `flow4_runner` | Exact guard required role |

Verified:

* EF migrations applied successfully (`dotnet ef database update`)
* Public table count after migration: **255**
* Marker row: `environment=E2E`, `database_name=oneverz_flow4_e2e_liveemail`, `database_role=flow4_runner`, `expires_at > now()`, `marker_nonce` length 48
* Credentials/nonce held only in process environment during the session; not committed; cleared at cleanup

Container was removed after evidence capture (C5E-32).

---

## 4. Why Live ACS Was Not Executed

Mandatory preflight failures (any one blocks send):

1. **Controlled mailbox** — `FLOW4_TEST_MAILBOX` / mailbox password / API token absent from User Secrets, process env, and project docs. No approved synthetic inbox access method exists in this workspace.
2. **Recipient allow-list** — `FLOW4_RECIPIENT_ALLOWLIST` absent. Source also has no production config key that enforces a live ACS recipient allow-list against `FLOW4_*` (fixture CLI separately forbids `LIVE` email mode). Without a controlled mailbox address there is nothing safe to allow-list.
3. **Approved HTTPS payment base** — `TenantOnboardingOutbox:PaymentAccessBaseUrl` empty in `appsettings.json` and User Secrets. Project docs/examples only show `http://127.0.0.1:4200`. Prompt forbids inventing an unapproved tunnel and forbids `localhost` inside received external email.
4. **Approved HTTPS setup base** — `TenantOnboardingOutbox:TenantAdminAppBaseUrl` likewise empty / no approved staging host documented.

ACS credentials alone are insufficient and were not treated as delivery evidence.

---

## 5. Exact Configuration Keys

| Exact Key | Source | Configured | Validation |
| :--- | :--- | ---: | :--- |
| `AzureCommunicationEmail:ConnectionString` | User Secrets | Yes | PASS |
| `AzureCommunicationEmail:SenderAddress` | User Secrets | Yes | PASS |
| `AzureCommunicationEmail:SenderDisplayName` | User Secrets | Yes | PASS |
| `AzureCommunicationEmail:AllowAdminSecureLinkFallback` | User Secrets | Yes (`false`) | PASS |
| `TenantOnboardingOutbox:Enabled` | `appsettings.json` | Yes (`true`) | PASS |
| `TenantOnboardingOutbox:PaymentAccessBaseUrl` | appsettings / secrets | No | BLOCKED |
| `TenantOnboardingOutbox:TenantAdminAppBaseUrl` | appsettings / secrets | No | BLOCKED |
| `FLOW4_TEST_MAILBOX` | env | No | BLOCKED |
| `FLOW4_RECIPIENT_ALLOWLIST` | env | No | BLOCKED |
| `FLOW4_LIVE_EMAIL_ENABLED` | env | No | BLOCKED |
| `ConnectionStrings__DefaultConnection` | process (session) | Yes during provision | PASS then cleared |
| `Flow4TestHost__MarkerNonce` | process (session) | Yes during provision | PASS then cleared |
| `Flow4TestHost__EmailMode` | fixture contract | Must be `SUPPRESSED`/`TEST_SINK` | Fixture path forbids live ACS |

Values not recorded.

---

## 6. Notification / Provider / Mailbox Matrices

Canonical events (unchanged):

1. `manual_payment.access_notification_requested`
2. `manual_payment.submitted_notification_requested`
3. `manual_payment.action_required_notification_requested`
4. `manual_payment.rejected_notification_requested`
5. `manual_payment.approved_notification_requested`
6. `tenant_admin.invitation_requested`

Plus intentional payment and invitation resends.

| Event | ACS acceptance | Provider ID | Mailbox |
| :--- | :--- | :--- | :--- |
| All six + two resends | NOT EXECUTED | — | NOT EXECUTED |

Activation email: **NOT_APPLICABLE**.

Evidence distinction:

* **Previously internally verified:** outbox, leasing, retry, dedupe, hash-only tokens, unconfigured ACS → `FAILED_RETRYABLE`
* **Newly ACS-provider accepted:** none
* **Newly mailbox received:** none
* **Newly Playwright verified:** none (21 skipped)
* **Newly provisioned:** isolated DB + safety marker
* **Still blocked externally:** mailbox, allow-list, HTTPS bases, live dispatch, Playwright pass path

Earlier Chunk 5/5B/5C/5D `BLOCKED_EXTERNAL` reports are retained and not rewritten as successes.

---

## 7. Playwright

| Metric | Value |
| :--- | :--- |
| Suite | `qa-dashboard/manual-payment.e2e.spec.mjs` |
| Discovered | **21** |
| Passed | **0** |
| Failed | **0** |
| Skipped | **21** |
| Blocked | **21** (missing `FLOW4_*` fixture/login secrets and live environment) |
| Duration | ~13.9 s |

Artifacts removed after the run.

---

## 8. Regression

### Backend

`dotnet test E_POS.sln` → **1,501 / 1,501 PASS** (~74 s)

| Project | Passed |
| :--- | ---: |
| UnitTests | 743 |
| ApiTests | 341 |
| Flow4FixtureCli.Tests | 17 |
| IntegrationTests | 400 |

### Angular

| Command | Result |
| :--- | :--- |
| `npm run build` | PASS (existing style-budget warnings) |
| `tsc` app + spec | PASS |
| `npm test -- --watch=false` | **454 / 454 PASS** |

---

## 9. Secret and Artifact Scan

| Check | Result |
| :--- | :--- |
| ACS secrets in git/evidence | 0 |
| Mailbox credentials | 0 |
| Raw payment/invitation tokens | 0 |
| Full token-bearing URLs | 0 |
| Uncontrolled recipients | 0 |
| Process DB passwords after cleanup | cleared |
| Playwright `test-results` | removed |
| Container residue | removed |

---

## 10. Cleanup

| Item | Result |
| :--- | :--- |
| Fixture tenants/payments/outbox | None created |
| Mailbox messages | None sent |
| Temporary SQL under `%TEMP%` | Removed |
| Process secret env vars | Cleared |
| Container `oneverz-flow4-live-email-pg` | Removed |
| Docker prune | Not run |

---

## 11. Fixes Applied

| Area | Change |
| :--- | :--- |
| Backend / Angular / Worker | None required |
| Environment | Isolated Postgres + marker provisioned then removed |
| Documentation | This evidence + related matrix/index updates |

---

## 12. Remaining External Blockers for GO

1. Controlled synthetic mailbox credentials + access method (inbox/junk inspectable)
2. Recipient allow-list containing only that mailbox/domain, with reject proof for non-allow-listed recipients
3. Approved HTTPS `TenantOnboardingOutbox:PaymentAccessBaseUrl` (reachable, not localhost-in-email)
4. Approved HTTPS `TenantOnboardingOutbox:TenantAdminAppBaseUrl`
5. Re-provision isolated DB + marker for the live run session
6. Execute live ACS → provider IDs → mailbox → Playwright 21 with zero skips

---

## 13. Decision

```text
CONDITIONAL_GO_TO_CHUNK_6 — One or more external environment gates remain unavailable without an internal security regression
```

Production status: **NO-GO**. Final Flow 4 release completion is **not** claimed.

---

## Related

- [[FLOW_4_LIVE_ACS_CREDENTIALED_EXTERNAL_RERUN_EVIDENCE_2026-08-05]]
- [[FLOW_4_LIVE_ACS_EXTERNAL_CLOSURE_AND_EMAIL_LINK_EVIDENCE_2026-08-05]]
- [[FLOW_4_LIVE_ACS_PROVIDER_AND_MAILBOX_CLOSURE_EVIDENCE_2026-08-05]]
- [[FLOW_4_LIVE_ACS_EMAIL_AND_OUTBOX_VALIDATION_EVIDENCE_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]
