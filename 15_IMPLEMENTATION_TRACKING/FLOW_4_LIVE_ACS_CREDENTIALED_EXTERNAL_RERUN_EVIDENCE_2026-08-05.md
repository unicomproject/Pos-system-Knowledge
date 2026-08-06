# Flow 4 Live ACS Credentialed External Rerun Evidence Report

**Document ID:** `FLOW_4_LIVE_ACS_CREDENTIALED_EXTERNAL_RERUN_EVIDENCE_2026-08-05`  
**Execution Date:** 2026-08-05  
**Chunk:** Chunk 5D — Flow 4 Credentialed Live ACS External Gate Rerun  
**Test-run ID (sanitized):** `62388b58-ef5c-4baa-823d-804a6d69446b`  
**Repository Branch / Commit (start):**
- Backend (`Unified-Commerce`): `feat/flow4-create-tenant-runtime` @ `1713e731d6ede4c2de20ff40c43a3b07fddf9dab`
- Angular (`nytroz-pos-platform-admin`): `feat/flow4-create-tenant-runtime` @ `fc909418eb6289ef08862257e82b3e4c5f0ea744`
- Second Brain (`Pos-system-Knowledge`): `docs/flow4-create-tenant-runtime` @ `cb59621d68250c741ee4bf1ced775042ab16851c`

---

## 1. Executive Summary

Chunk 5D re-evaluated the previously blocked live ACS, controlled-mailbox, and Playwright email-link gates after discovering that **ACS credentials are present in an approved secret source** (`.NET User Secrets` for `E_POS.Api`, UserSecretsId `epos-api-development-secrets`).

### Newly verified (credentialed preflight)

| Item | Result |
| :--- | :--- |
| ACS connection string present in User Secrets | **PASS** (configured; value never printed) |
| ACS endpoint host derived from connection string | **PASS** (`*.india.communication.azure.com`; DNS + TCP 443) |
| Sender address present and format-valid | **PASS** (ACS Azure-managed `*.azurecomm.net` domain; masked only) |
| `AllowAdminSecureLinkFallback` | **PASS** (`false` — mock/admin-link fallback disabled) |
| Provider selected by DI | **PASS** (`AzureCommunicationEmailSender`) |
| Secret safety during preflight | **PASS** (`Secret Exposed = No`) |

### Still blocked externally (mandatory live-run prerequisites)

| Item | Result |
| :--- | :--- |
| Controlled synthetic test mailbox + access method | **BLOCKED_EXTERNAL** |
| Controlled-recipient allow-list for live dispatch | **BLOCKED_EXTERNAL** |
| Live-email enable / approved public HTTPS payment + setup base URLs | **BLOCKED_EXTERNAL** |
| Isolated Flow 4 Test/E2E PostgreSQL marker environment for live dispatch | **BLOCKED_EXTERNAL** |
| Real ACS send / provider operation IDs / mailbox receipt | **BLOCKED_EXTERNAL** (no send attempted) |
| Playwright 21-scenario live execution | **BLOCKED_EXTERNAL** (21 discovered, 21 skipped — missing fixture/env secrets) |

**No live emails were sent.** Per Chunk 5D stop rules, email dispatch is forbidden until every mandatory preflight gate passes. Controlled mailbox, recipient allow-list, approved HTTPS public base URLs, and isolated live DB remain unavailable and were not invented.

**Milestone Decision:** `CONDITIONAL_GO_TO_CHUNK_6`

---

## 2. Mandatory Execution Ledger (C5D-01 to C5D-32)

| Gate | Description | Status |
| :--- | :--- | :--- |
| C5D-01 | Repository baseline | **PASS** |
| C5D-02 | Requirement and event extraction | **PASS** |
| C5D-03 | Secure secret-source verification | **PASS** (User Secrets category) |
| C5D-04 | ACS connection configuration | **PASS** |
| C5D-05 | ACS endpoint connectivity | **PASS** |
| C5D-06 | Verified sender domain | **PASS** (ACS Azure-managed domain bound to configured resource; Azure CLI Domains.List not available) |
| C5D-07 | Sender-address validation | **PASS** |
| C5D-08 | Controlled mailbox access | **BLOCKED_EXTERNAL** |
| C5D-09 | Recipient allow-list | **BLOCKED_EXTERNAL** |
| C5D-10 | Isolated database and environment | **BLOCKED_EXTERNAL** |
| C5D-11 | Payment-required ACS dispatch | **BLOCKED_EXTERNAL** |
| C5D-12 | Payment-required mailbox receipt | **BLOCKED_EXTERNAL** |
| C5D-13 | Payment-submitted dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5D-14 | Action-required dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5D-15 | Payment-rejected dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5D-16 | Payment-approved dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5D-17 | Activation-email applicability | **NOT_APPLICABLE** |
| C5D-18 | Tenant Admin invitation dispatch and receipt | **BLOCKED_EXTERNAL** |
| C5D-19 | Payment intentional resend | **BLOCKED_EXTERNAL** (live ACS path; internal resend mechanics previously verified in Chunk 5C) |
| C5D-20 | Invitation resend and rotation | **BLOCKED_EXTERNAL** (live ACS path; internal rotation previously verified in Chunk 5C) |
| C5D-21 | Provider operation-ID persistence | **BLOCKED_EXTERNAL** |
| C5D-22 | Duplicate mailbox prevention | **BLOCKED_EXTERNAL** (live mailbox; internal dedupe previously verified) |
| C5D-23 | Real Playwright 21-scenario suite | **BLOCKED_EXTERNAL** (21 skipped) |
| C5D-24 | Token and link security | **PASS** (internal hash-only / purpose-binding baseline retained; no live tokens generated this chunk) |
| C5D-25 | Template and privacy validation | **BLOCKED_EXTERNAL** (no live mailbox content) |
| C5D-26 | Secret and artifact scan | **PASS** |
| C5D-27 | Full backend regression | **PASS** (1,501 / 1,501) |
| C5D-28 | Full Angular regression | **PASS** (454 / 454) |
| C5D-29 | Fixture/outbox/mailbox cleanup | **PASS** (no live fixtures created; Playwright `test-results` removed) |
| C5D-30 | Process/container cleanup | **PASS** (no test containers started; no orphan workers) |
| C5D-31 | Traceability and evidence | **PASS** |
| C5D-32 | Git commit and push | **PASS** (Second Brain evidence only; no backend/Angular code change required) |

---

## 3. Gap / Requirement Mapping

| ID | Role in Chunk 5D | Outcome |
| :--- | :--- | :--- |
| F4-GAP-004 | Live ACS payment/invitation validation | **PARTIAL progress** — ACS User Secrets + endpoint reachability + sender format confirmed; mailbox/allow-list/HTTPS/live DB still block provider acceptance and inbox evidence |
| F4-REQ-044 | Separate deduplicated payment notification outbox events | Previously internally verified; live ACS not re-proven |
| F4-REQ-051–055 | Invitation queue/token/resend | Previously internally verified; live ACS not re-proven |
| F4-REQ-056 | Activation/setup handoff email | Still `IMPLEMENTED_NOT_RUNTIME_VERIFIED` / F4-GAP-004 |
| F4-REQ-063 | Live ACS provider acceptance + routing | Remains **BLOCKED_ENVIRONMENT** |
| F4-REQ-060 / F4-GAP-005 | Playwright 20/21 matrix | Remains **BLOCKED_ENVIRONMENT** (21 discovered / 21 skipped) |

Canonical notification events (unchanged):

1. `manual_payment.access_notification_requested`
2. `manual_payment.submitted_notification_requested`
3. `manual_payment.action_required_notification_requested`
4. `manual_payment.rejected_notification_requested`
5. `manual_payment.approved_notification_requested`
6. `tenant_admin.invitation_requested`

Separate activation email: **NOT_APPLICABLE** (activation queues Tenant Admin invitation only).

---

## 4. Exact Configuration Keys Inspected

| Exact Key | Source File / Store | Purpose | Secret | Configured | Validation |
| :--- | :--- | :--- | ---: | ---: | :--- |
| `AzureCommunicationEmail:ConnectionString` | User Secrets (`epos-api-development-secrets`) | ACS auth | Yes | Yes | PASS (presence + EmailClient gateway path) |
| `AzureCommunicationEmail:Endpoint` | User Secrets / `appsettings.json` | Managed-identity endpoint | Yes | No (optional when connection string present) | N/A — connection-string mode used |
| `AzureCommunicationEmail:SenderAddress` | User Secrets | Verified MailFrom | No* | Yes | PASS (format + domain) |
| `AzureCommunicationEmail:SenderDisplayName` | User Secrets | Display name | No | Yes | PASS (present) |
| `AzureCommunicationEmail:AllowAdminSecureLinkFallback` | User Secrets | Dev fallback | No | Yes | PASS (`false`) |
| `TenantOnboardingOutbox:Enabled` | `src/E_POS.Api/appsettings.json` | Worker enablement | No | Yes (`true`) | PASS |
| `TenantOnboardingOutbox:PaymentAccessBaseUrl` | `appsettings.json` | Payment-access public base | No | No (empty) | **BLOCKED_EXTERNAL** for live links |
| `TenantOnboardingOutbox:TenantAdminAppBaseUrl` | `appsettings.json` | Account-setup public base | No | No (empty) | **BLOCKED_EXTERNAL** for live links |
| `TenantOnboardingOutbox:PollSeconds` | options default `5` | Worker polling | No | Default | PASS (code default) |
| `TenantOnboardingOutbox:LeaseSeconds` | options default `60` | Lease TTL | No | Default | PASS (code default) |
| `TenantOnboardingOutbox:MaximumAttempts` | options default `8` | Retry ceiling | No | Default | PASS (code default) |
| `Flow4TestHost:EmailMode` | fixture CLI / `flow4.env.example` | Fixture email mode | No | Example only (`SUPPRESSED`) | Fixture path forbids real ACS (`SUPPRESSED`/`TEST_SINK` only) |
| `FLOW4_TEST_MAILBOX` / mailbox password / API token | Process/User env | Controlled mailbox | Yes | No | **BLOCKED_EXTERNAL** |
| `FLOW4_RECIPIENT_ALLOWLIST` | Process/User env | Live recipient allow-list | No | No | **BLOCKED_EXTERNAL** |
| `FLOW4_LIVE_EMAIL_ENABLED` | Process/User env | Live-email enable flag | No | No | **BLOCKED_EXTERNAL** |

\*Sender address treated as non-secret operational config; only masked form recorded in evidence.

`appsettings.json` ACS values remain blank (correct — secrets must not be committed).

---

## 5. ACS Preflight (Sanitized)

| Preflight Check | Status | Sanitized Evidence | Secret Exposed |
| :--- | :--- | :--- | ---: |
| Approved environment for live send | BLOCKED | Live Test/E2E marker DB not running | No |
| Isolated non-production database | BLOCKED | No `oneverz-flow4-evidence-pg` / Flow 4 marker DB active | No |
| ACS connection configuration | PASS | User Secrets key present; length recorded only | No |
| ACS endpoint reachable | PASS | Host from connection string; DNS CNAME + TCP 443 success | No |
| Sender domain | PASS | ACS Azure-managed `*.azurecomm.net` | No |
| Sender address under domain | PASS | Masked local-part + managed domain | No |
| Controlled mailbox access | BLOCKED | No mailbox credentials/access method configured | No |
| Recipient allow-list active | BLOCKED | No live allow-list env/config | No |
| Mock/test-sink disabled for live claim | PASS | Fallback `false`; fixture CLI still forbids real email | No |
| Real `AzureCommunicationEmailSender` selected | PASS | DI registers concrete ACS sender | No |
| Outbox worker enabled | PASS | `TenantOnboardingOutbox:Enabled=true` | No |
| Public HTTPS payment URL approved | BLOCKED | `PaymentAccessBaseUrl` empty | No |
| Public HTTPS setup URL approved | BLOCKED | `TenantAdminAppBaseUrl` empty | No |
| Unique test-run ID | PASS | `62388b58-…` | No |
| No production recipients | PASS | No recipients targeted; no sends | No |

---

## 6. Notification / Provider / Mailbox Matrices

All six canonical events plus intentional payment/invitation resends:

| Event | Outbox (this chunk) | ACS acceptance | Provider ID | Mailbox |
| :--- | :--- | :--- | :--- | :--- |
| `manual_payment.access_notification_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| `manual_payment.submitted_notification_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| `manual_payment.action_required_notification_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| `manual_payment.rejected_notification_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| `manual_payment.approved_notification_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| `tenant_admin.invitation_requested` | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| Payment intentional resend | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |
| Invitation intentional resend | Not executed | BLOCKED_EXTERNAL | — | BLOCKED_EXTERNAL |

Activation email: **NOT_APPLICABLE**.

Distinction retained from prior chunks:

- **Previously internally verified:** outbox persistence, `FOR UPDATE SKIP LOCKED`, leasing, retry, dedupe, hash-only tokens, unconfigured ACS → `FAILED_RETRYABLE` (never false `DELIVERED`).
- **Newly ACS-provider accepted:** none (no send).
- **Newly mailbox received:** none.
- **Newly browser verified:** none (suite skipped).
- **Still blocked externally:** mailbox, allow-list, HTTPS bases, live DB, provider IDs, inbox, Playwright pass path.

---

## 7. Playwright

| Metric | Value |
| :--- | :--- |
| Suite | `qa-dashboard/manual-payment.e2e.spec.mjs` |
| Discovered | **21** |
| Passed | **0** |
| Failed | **0** |
| Skipped | **21** |
| Blocked | **21** (environment — missing `FLOW4_*` fixture/login secrets) |
| Duration | ~6.0 s (after Chromium install) |

Scenarios map to E2E 1–20 plus E2E 14b (revoked payment link) = 21 tests. No silent pass; skips are explicit via `requireValues(...)`.

---

## 8. Regression

### Backend (`dotnet test E_POS.sln`)

| Project | Passed |
| :--- | ---: |
| `E_POS.UnitTests` | 743 |
| `E_POS.ApiTests` | 341 |
| `E_POS.Flow4FixtureCli.Tests` | 17 |
| `E_POS.IntegrationTests` | 400 |
| **Total** | **1,501** |

Duration ≈ 158 s. Baseline was 1,500; count did not fall (IntegrationTests +1 vs prior Chunk 5C report).

### Angular

| Command | Result |
| :--- | :--- |
| `npm run build` | PASS (budget warnings only) |
| `npx tsc -p tsconfig.app.json --noEmit` | PASS |
| `npx tsc -p tsconfig.spec.json --noEmit` | PASS |
| `npm test -- --watch=false` | **454 / 454 PASS** (~9 s tests; ~83 s overall) |

---

## 9. Secret and Artifact Scan

| Check | Result |
| :--- | :--- |
| Raw payment tokens in evidence/diffs | 0 |
| Raw invitation tokens | 0 |
| ACS credentials in git-tracked files / evidence | 0 |
| Mailbox credentials | 0 |
| Full token-bearing URLs | 0 |
| Uncontrolled recipient disclosures | 0 |
| Playwright `test-results` retained | Removed after run |
| `appsettings.json` ACS blanks preserved | Yes |

---

## 10. Cleanup

| Item | Result |
| :--- | :--- |
| Fixtures / outbox / tokens / invitations | None created |
| Mailbox messages | None sent |
| Temporary secret manifests | None created |
| Playwright artifacts | Removed |
| Test containers | None started |
| Orphan processes | None introduced |

---

## 11. Fixes Applied

| Area | Change |
| :--- | :--- |
| Backend | None required |
| Angular | None required (Chromium installed locally for discovery only; not committed) |
| Worker / templates | None |
| Test infrastructure | None |
| Environment | ACS User Secrets already present; mailbox/allow-list/HTTPS/live DB still missing |
| Documentation | This evidence + related matrix/index updates |

---

## 12. Decision

```text
CONDITIONAL_GO_TO_CHUNK_6 — External ACS, mailbox, or browser closure remains blocked with internal safety gates preserved
```

Production status: **NO-GO** (unchanged). Final Flow 4 20/20 or 21/21 release completion is **not** claimed.

### Remaining external blockers for a future credentialed GO

1. Controlled synthetic mailbox + secure access method  
2. Live recipient allow-list  
3. Approved public HTTPS `PaymentAccessBaseUrl` and `TenantAdminAppBaseUrl`  
4. Isolated Flow 4 Test/E2E PostgreSQL with marker/role  
5. Explicit live-email authorization flag / runbook approval for token-bearing mail  
6. Re-run ACS dispatch → provider IDs → mailbox → Playwright 21 with zero skips  

---

## Related

- [[FLOW_4_LIVE_ACS_EMAIL_AND_OUTBOX_VALIDATION_EVIDENCE_2026-08-05]]
- [[FLOW_4_LIVE_ACS_PROVIDER_AND_MAILBOX_CLOSURE_EVIDENCE_2026-08-05]]
- [[FLOW_4_LIVE_ACS_EXTERNAL_CLOSURE_AND_EMAIL_LINK_EVIDENCE_2026-08-05]]
- [[FLOW_4_REQUIREMENT_TRACEABILITY_MATRIX_2026-08-05]]
- [[FLOW_4_DOCUMENT_CONFLICT_AND_GAP_REGISTER_2026-08-05]]
- [[FLOW_4_APPROVED_NEXT_IMPLEMENTATION_SCOPE_2026-08-05]]
