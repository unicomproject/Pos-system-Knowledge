# OneVerz Phase 5 — Production Environment Readiness

**Date:** 2026-08-07  
**Branch:** `ops/flow4-phase5-production-environment-readiness`  
**Mode:** Production infrastructure / ACS / HTTPS gate enablement assessment  
**Prerequisite:** Phase 5 product source code-closed on mains; external smoke pending (`F-P5V-06`)  
**Prior smoke audit:** `audit/flow4-phase5-acs-production-smoke` @ `e9af5b3`

**Hard rules observed:** No product source changes. No secrets committed or printed. No live invitation generated. Roadmap not updated. Phase 6 not started. `F-P5V-06` remains OPEN.

---

## Final Verdict

```text
PRODUCTION ENVIRONMENT PROVISIONING BLOCKED — OPERATOR ACCESS REQUIRED
```

This workstation cannot provision or verify Production ACS, DNS, TLS, Backend injection, Tenant Admin hosting, outbox workers, or controlled mailboxes. Existing CI workflows are **build/test only** (no Production deploy jobs found). Azure CLI is not installed; GitHub CLI is not authenticated for deployment APIs.

---

## 1. Executive Summary

Phase 5 application code is ready. Production infrastructure access is **not** available to this agent session. Therefore nothing was provisioned, deployed, or smoke-triggered.

| Layer | Status |
| ----- | ------ |
| Product source (BE/Flutter/PA) | Code-closed on validated mains — **NO CHANGE** |
| Azure / ACS / DNS / hosting | **BLOCKED — operator access required** |
| Pre-smoke readiness | **BLOCKED** |
| Real invitation smoke | **NOT AUTHORIZED** until readiness passes |
| Phase 6 | **NOT AUTHORIZED** |
| F-P5V-06 | **OPEN** |

---

## 2. Environment / Access Inventory

| Capability | Available | Account/Environment | Blocking? |
| ---------- | --------: | ------------------- | --------: |
| Azure Portal | NO | Not accessible from this session | YES |
| Azure CLI (`az`) | NO | Not installed | YES |
| Azure Subscription | NOT VERIFIED | No subscription context / env | YES |
| ACS Resource Management | NO | Depends on Azure access | YES |
| DNS Management | NO | No DNS provider credentials | YES |
| Backend Deployment | PARTIAL tooling only | `dotnet` available; **no** Production deploy pipeline/auth | YES |
| Flutter Tenant Admin Deployment | PARTIAL tooling only | Flutter SDK not on PATH; CI analyzes/builds only | YES |
| Secret Configuration | DEV ONLY | Local User Secrets `epos-api-development-secrets` (not Production) | YES for Production |
| Test Mailbox | NO | No controlled QA mailbox credentials | YES |
| GitHub CLI auth | NO | `gh auth login` required | YES for remote deploy/ops via GH |
| Terraform / Pulumi / Bicep deploy | NO | Not present | Soft (not required if portal/CI exists) |
| Docker / kubectl | YES (local) | Not wired to known Production cluster | Soft |

---

## 3. Azure Subscription / Resource Group

```text
NOT ACCESSIBLE / NOT VERIFIED
```

No safe Production subscription, resource group, or region identifiers were available without inventing them.

---

## 4. ACS Resource

```text
ACS Resource: NOT VERIFIED / MISSING (from this session’s Production perspective)
```

Local Development User Secrets previously indicated ACS connection configuration exists for **Development** only. That is **not** Production provisioning.

---

## 5. ACS Email Capability

```text
ACS EMAIL CAPABILITY: NOT VERIFIED
```

---

## 6. Domain Strategy

**Decision this session:** **NOT DECIDED** — insufficient ownership/DNS evidence.

Canonical Second Brain architecture prefers ACS Email with verified MailFrom (`Email_Architecture_And_Provider_Decisions.md`, ACS runbook).

| Option | Status |
| ------ | ------ |
| A — Azure-managed `*.azurecomm.net` | Observed only in **Development** secrets historically; acceptable for lab, **not** proven Production brand strategy |
| B — Custom verified domain (e.g. project brand domain) | **Preferred for branded Production** if DNS ownership exists — **NOT VERIFIED** here |

Do **not** assume `oneverz.com` ownership from this session.

---

## 7. Domain Verification

```text
DOMAIN: NOT VERIFIED
Ownership: NOT VERIFIED
ACS Email Domain: NOT VERIFIED
```

---

## 8. Sender Address

```text
Invitation sender: NOT VERIFIED
ACS-approved (Production): NO / NOT VERIFIED
```

Required shape per code/runbook:

- Config key: `AzureCommunicationEmail:SenderAddress`
- Bare verified MailFrom only (no display-name inside `senderAddress`)

---

## 9. Secret Management

### Required Backend configuration key names (no values)

| Key | Secret? |
| --- | ------: |
| `AzureCommunicationEmail:ConnectionString` | YES (or use Endpoint + managed identity) |
| `AzureCommunicationEmail:Endpoint` | NO (URI); credentials via MI/Key Vault |
| `AzureCommunicationEmail:SenderAddress` | NO (email address) |
| `AzureCommunicationEmail:SenderDisplayName` | NO (optional display) |
| `TenantOnboardingOutbox:TenantAdminAppBaseUrl` | NO (HTTPS base URL) |

### Storage policy

| Allowed | Forbidden |
| ------- | --------- |
| Azure App Service / Container Apps settings | Committed `appsettings.json` secrets |
| Azure Key Vault references | Committed `.env` |
| Approved CI/CD secret store | Second Brain / source code |

Committed repo state: ACS / `TenantAdminAppBaseUrl` placeholders are **empty** — correct. No Production secrets were written by this task.

---

## 10. Backend Production Deployment

```text
READY / PARTIAL / MISSING → MISSING (deployment target not accessible)
```

| Item | Evidence |
| ---- | -------- |
| Validated main commit | `e6933ec` (includes Phase 5 `6fd24b8`) — **code** ready |
| Deployed Production commit | **NOT VERIFIED** |
| CI | `.github/workflows/backend-ci.yml` — build/test only |
| Deploy workflow | **Not found** in Backend repo |

---

## 11. ACS Provider Selection

```text
Production Email Provider: NOT VERIFIED
```

Code on main registers `IApplicationEmailSender` → `AzureCommunicationEmailSender` and Production fail-closed validators. Deployed Production runtime selection cannot be confirmed without hosting access.

---

## 12. Tenant Admin Deployment

```text
MISSING / NOT VERIFIED
```

| Item | Evidence |
| ---- | -------- |
| Validated Flutter main | `6546d4b` (includes `3945119`) — **code** ready |
| Deployed Production commit | **NOT VERIFIED** |
| CI | `flutter-ci.yml` — analyze/build; no Production web deploy job found |
| Hosting target (SWA / App Service / CDN) | **NOT IDENTIFIED** |

---

## 13. Production Host

```text
Tenant Admin HTTPS Host: NOT VERIFIED / NOT SUPPLIED
```

No approved Production hostname was provided. Do not invent `admin.oneverz.com` or similar.

---

## 14. DNS

```text
DNS: NOT VERIFIED
```

---

## 15. TLS

```text
TLS: NOT VERIFIED
```

---

## 16. Deep-Link Routing

Expected route: `/tenant-admin/setup/:token`

```text
Deep Setup Route: NOT VERIFIED (live hosting)
```

Code registration previously verified on Flutter main. SPA rewrite/fallback for Production hosting is unproven.

---

## 17. TenantAdminAppBaseUrl

```text
TenantAdminAppBaseUrl: MISSING (Production) / MISSING (Dev secrets) / empty (committed appsettings)
```

Must be absolute `https://` host root (no token, no localhost) per Phase 5 validators.

---

## 18. CORS / API Connectivity

```text
CORS: NOT VERIFIED
```

---

## 19. Outbox Worker

```text
Outbox Worker: NOT VERIFIED
```

Code includes `TenantOnboardingOutboxWorker`. Production process hosting / enablement not confirmed.

---

## 20. Production Logging / Token Privacy

```text
Production sensitive URI logging: NOT VERIFIED
```

F-P5V-03 remains OPEN. Before real invitation smoke, operators must confirm Production does not persist raw setup URIs containing tokens (App Insights, reverse proxy, Flutter crash/analytics).

If confirmed unsafe → use separate verdict path: smoke not authorized.

This session: **no Production log sinks accessible** → treat as **BLOCKED for live smoke until verified SAFE**.

---

## 21. Test Mailbox

```text
Test Mailbox: MISSING
```

---

## 22. Test Tenant

```text
Test Tenant: MISSING
```

---

## 23. Pre-Smoke Readiness Matrix

| Requirement | Status |
| ----------- | ------ |
| ACS Production resource | BLOCKED |
| Email capability | BLOCKED |
| Domain verified | BLOCKED |
| Sender configured | BLOCKED |
| Backend ACS secret injected | BLOCKED |
| Production ACS provider active | BLOCKED |
| Tenant Admin deployed | BLOCKED |
| HTTPS hostname configured | BLOCKED |
| DNS resolves | BLOCKED |
| TLS valid | BLOCKED |
| TenantAdminAppBaseUrl configured | BLOCKED |
| Deep-link rewrite works | BLOCKED |
| CORS correct | BLOCKED |
| Test mailbox available | BLOCKED |
| Test tenant available | BLOCKED |
| Production token logging safe | BLOCKED |

**Pre-Smoke Readiness: BLOCKED**

---

## 24. Blocking Infrastructure Items

1. Azure subscription + Portal/`az` access for Production ACS  
2. ACS Email resource + sender domain verification  
3. Approved invitation sender MailFrom  
4. Secure injection of ACS secrets into Production Backend  
5. Production Backend deployment of validated main (`e6933ec` or later validated)  
6. Production Tenant Admin HTTPS host + Flutter web deploy of validated main (`6546d4b` or later)  
7. DNS + TLS for that host  
8. `TenantOnboardingOutbox:TenantAdminAppBaseUrl` = `https://<host>`  
9. Frontend API base URL + approved CORS origin  
10. Outbox worker running in Production  
11. Controlled QA mailbox + test tenant  
12. Confirmation Production logging does not persist raw invitation tokens  

---

## 25. Non-Blocking Items

- Phase 5 application source already merged and verified  
- Committed appsettings correctly leave secrets empty  
- Local Development ACS secrets exist historically (not Production)  
- F-P5V-01…05 remain non-blocking code findings (out of scope for provisioning)

---

## 26. Operator Action Checklist

Every unchecked item must be completed by the named role/system before ACS/HTTPS smoke may rerun.

```text
[ ] Provide Azure subscription access
    WHO: Cloud / Platform Ops owner with Production rights
    WHAT: Subscription name + Resource Group + Region (non-secret)

[ ] Provide ACS resource access
    WHO: Same Cloud Ops
    WHAT: Existing Production ACS resource name OR authorization to create one

[ ] Confirm/create Production ACS Email resource
    WHO: ACS admin
    WHAT: Email Communication Service linked per Azure architecture

[ ] Verify Production sender domain
    WHO: DNS owner + ACS admin
    WHAT: Custom domain verification (TXT/SPF/DKIM per current Azure UI) OR explicit approval of ACS managed domain for interim smoke
    NOTE: Prefer branded custom domain for Production; do not invent DNS records

[ ] Confirm invitation sender
    WHO: Product + ACS admin
    WHAT: Bare MailFrom on verified domain (e.g. project-approved noreply address — do not assume)

[ ] Inject ACS secret securely
    WHO: Backend deployment owner
    WHERE: App Service / Key Vault / CI secret store
    KEYS: AzureCommunicationEmail:ConnectionString OR Endpoint (+ identity); SenderAddress
    NEVER: commit to Git / Second Brain

[ ] Deploy Backend latest validated main
    WHO: Backend release owner / CI-CD
    COMMIT: e6933ec (or later validated main)
    NOTE: Current repo CI is build-test only — deploy pipeline must be identified/created by Ops

[ ] Deploy Tenant Admin latest validated main
    WHO: Flutter / Web release owner
    COMMIT: 6546d4b (or later validated main)
    BUILD: production web release WITHOUT USE_DEV_API_FALLBACK
    HOST: Approved Static Web Apps / App Service / CDN

[ ] Provide/confirm Tenant Admin production hostname
    WHO: Architecture owner + DNS owner
    WHAT: Exact https hostname (do not invent)

[ ] Configure DNS
    WHO: DNS owner
    WHAT: Hostname → Tenant Admin deployment; preserve existing SPF/email systems

[ ] Validate TLS
    WHO: Hosting platform / DNS+TLS owner
    WHAT: Trusted CA cert matching hostname

[ ] Configure TenantAdminAppBaseUrl
    WHO: Backend deployment owner
    KEY: TenantOnboardingOutbox:TenantAdminAppBaseUrl
    VALUE SHAPE: https://<hostname> (no token path)

[ ] Configure frontend Backend API base URL
    WHO: Flutter release owner
    WHAT: Production API origin for validate/setup-password/login/context

[ ] Configure CORS
    WHO: Backend/API gateway owner
    WHAT: Allow approved Tenant Admin origin only (not *)

[ ] Confirm invitation outbox worker
    WHO: Backend runtime owner
    WHAT: Worker process enabled against Production DB; ACS reachable outbound

[ ] Provide controlled test mailbox
    WHO: QA owner
    WHAT: Non-customer mailbox with ACS receipt ability

[ ] Provide controlled test tenant
    WHO: Platform Admin / QA
    WHAT: Non-customer smoke tenant for finalize or resend path

[ ] Confirm production sensitive URI logging is safe
    WHO: Security + observability owner
    WHAT: Prove raw /tenant-admin/setup/{token} URIs are not retained in Production logs (closes risk for F-P5V-03 escalation)
```

After all items are READY, rerun:

```text
Phase 5 Real ACS + Production HTTPS Invitation Smoke Gate
```

Do **not** mark F-P5V-06 closed until that smoke passes.

---

## Configuration Validation Table (this session)

| Config | Present | Source | Secret? | Validated |
| ------ | ------: | ------ | ------: | --------: |
| ACS connection config | NO (Prod) | — | YES | NO |
| Sender | NO (Prod) | — | NO | NO |
| TenantAdminAppBaseUrl | NO | — | NO | NO |
| Backend environment | NOT VERIFIED | — | NO | NO |
| Frontend API base URL | NOT VERIFIED | — | NO | NO |
| CORS origin | NOT VERIFIED | — | NO | NO |
| Worker enabled | NOT VERIFIED | — | NO | NO |

---

## Source Changes

```text
NONE
```

---

## Phase Status

| Item | Value |
| ---- | ----- |
| Phase 5 Status | `CODE CLOSED — PRODUCTION GATE PENDING` |
| Phase 6 Status | `NOT AUTHORIZED` |
| F-P5V-06 | `OPEN` |
| Pre-Smoke Readiness | `BLOCKED` |
| Environment | `OTHER` (operator workstation; not Production) |
| Azure Access | `UNAVAILABLE` |

---

## Required Next Action

```text
Complete the listed production infrastructure/operator actions, then rerun this production-readiness task.
```

When readiness becomes READY, the next authorized task is:

```text
Rerun the Phase 5 Real ACS + Production HTTPS Invitation Smoke Gate.
```
