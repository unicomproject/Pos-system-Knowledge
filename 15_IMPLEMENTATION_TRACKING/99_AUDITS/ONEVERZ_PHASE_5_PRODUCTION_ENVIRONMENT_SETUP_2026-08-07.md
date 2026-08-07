# OneVerz Phase 5 — Production Infrastructure Operator Setup

**Date:** 2026-08-07  
**Branch:** `ops/flow4-phase5-production-environment-setup`  
**Mode:** Operator Production infrastructure setup (ACS + Tenant Admin HTTPS + deployment readiness)  
**Related prior report:** `ops/flow4-phase5-production-environment-readiness` @ `e167e0d`  
**Prior ACS smoke:** `audit/flow4-phase5-acs-production-smoke` @ `e9af5b3`

**Hard rules:** No product source changes. No secrets in Git/Second Brain. No invitation tokens. No live invitation smoke in this task. Do not mark F-P5V-06 closed. Do not authorize Phase 6.

---

## Final Verdict

```text
PRODUCTION ENVIRONMENT PROVISIONING BLOCKED — OPERATOR ACCESS REQUIRED
```

Mandatory Production cloud / DNS / hosting / secret / mailbox access is **unavailable** on this workstation. Per Stage 3 access-failure rule: **STOP provisioning**. No ACS resources, DNS records, deployments, or Production secrets were created or modified.

---

## Executive Summary

| Layer | Status |
| ----- | ------ |
| Phase 5 application code | CLOSED / MERGED / VERIFIED — unchanged |
| Azure / ACS / Email / DNS / hosting | **BLOCKED — operator access required** |
| Pre-smoke readiness | **BLOCKED** |
| Real invitation smoke | **NOT RUN** (correct — environment not ready) |
| F-P5V-06 | **OPEN** |
| Phase 6 | **NOT AUTHORIZED** |

Validated code baselines (deploy targets when Ops has access):

| Repo | Validated main |
| ---- | -------------- |
| Backend | `e6933ec` |
| Flutter | `6546d4b` |
| Platform Admin | `9349cee` |

---

## Operator Access

| Access | Available | Owner | Action Required |
| ------ | --------: | ----- | --------------- |
| Azure Subscription | NO | Cloud / Platform Ops | Grant Production subscription access to operator or run setup in approved ops session |
| Resource Group | NO | Cloud Ops | Identify/create Production RG |
| ACS | NO | ACS admin | Portal/`az` rights on Communication Services |
| Email Communication Service | NO | ACS admin | Email ECS create/link rights |
| DNS | NO | DNS owner | Ability to publish Azure-provided verification/auth records without conflicting SPF |
| Backend Hosting | NO | Backend release owner | App Service / Container Apps / equivalent + deploy rights |
| Tenant Admin Hosting | NO | Web / Flutter release owner | SWA / App Service / CDN + deploy rights |
| Secret Store | NO (Prod) | Backend/security owner | Key Vault / App Settings / CI secrets (Dev User Secrets ≠ Production) |
| Production Logs | NO | Observability / Security | App Insights / gateway logs for token-URI review |
| QA Mailbox | NO | QA | Controlled non-customer mailbox |
| Platform Admin / QA test tenant | NO | Platform Admin / QA | Controlled smoke tenant |
| Azure CLI (`az`) | NO | Workstation / Ops | Install + login |
| GitHub CLI auth (`gh`) | NO | Operator | `gh auth login` if GH-based deploy is used |
| Production deploy CI | NO | DevOps | Current repo workflows are **build/test only** (`backend-ci.yml`, `flutter-ci.yml`) |

**Environment classification for this session:** `OTHER` (operator workstation). Not Production. Not production-like.

---

## Azure Environment

```text
Subscription: NOT ACCESSIBLE
Resource Group: NOT ACCESSIBLE
Region: NOT ACCESSIBLE
Existing ACS / Email / Backend / Tenant Admin / Key Vault: NOT INSPECTED (no access)
```

No duplicate resources were created.

---

## ACS Resource

```text
ACS Resource: BLOCKED
Environment: PRODUCTION (target) — not reachable
```

---

## Email Communication Service

```text
Email Communication Service: BLOCKED / NOT VERIFIED
```

---

## Domain Strategy

```text
Domain Strategy: NOT CONFIRMED
Domain: NOT CONFIRMED
```

Do **not** assume `oneverz.com`. Prefer approved custom domain for branded Production when DNS ownership exists; Azure-managed domain only if Product explicitly accepts it for interim smoke.

---

## Domain Verification

```text
Domain Ownership: NOT VERIFIED
Sender Authentication: NOT VERIFIED
```

---

## Sender

```text
Invitation Sender: NOT CONFIRMED
Status: BLOCKED
```

Required config key (when Ops configures): `AzureCommunicationEmail:SenderAddress` (bare MailFrom).

---

## Secret Storage

| Key | Secret? | Production injection |
| --- | ------: | -------------------- |
| `AzureCommunicationEmail:ConnectionString` | YES | Key Vault / App Settings / CI — **BLOCKED** |
| `AzureCommunicationEmail:Endpoint` | NO (URI) | MI path optional — **BLOCKED** |
| `AzureCommunicationEmail:SenderAddress` | NO | **BLOCKED** |
| `TenantOnboardingOutbox:TenantAdminAppBaseUrl` | NO | **BLOCKED** |

Local Development User Secrets may exist historically — **must not** be treated as Production setup.

---

## Backend Deployment

```text
Backend Production Deployment: BLOCKED
Backend Deployed Commit: NOT VERIFIED
Target validated commit: e6933ec
```

CI present: build/test only — no Production deploy workflow found in repo.

---

## ACS Provider

```text
Production ACS Provider: NOT VERIFIED
```

Code on main selects ACS adapter + Production fail-closed validators; runtime Production selection unproven without hosting access.

---

## Tenant Admin Deployment

```text
Tenant Admin Deployment: BLOCKED
Flutter Deployed Commit: NOT VERIFIED
Target validated commit: 6546d4b
Required: production web build WITHOUT USE_DEV_API_FALLBACK
```

---

## HTTPS Host / DNS / TLS / Deep Route

| Item | Status |
| ---- | ------ |
| Tenant Admin HTTPS Host | NOT CONFIRMED |
| DNS | NOT VERIFIED |
| TLS | NOT VERIFIED |
| Deep Setup Route `/tenant-admin/setup/:token` | NOT VERIFIED (code ready; hosting rewrite unproven) |

---

## TenantAdminAppBaseUrl / API / CORS / Outbox

| Item | Status |
| ---- | ------ |
| TenantAdminAppBaseUrl | MISSING |
| Production API URL | MISSING / NOT VERIFIED |
| CORS | NOT VERIFIED |
| Outbox Worker | NOT VERIFIED |

---

## Logging Security

```text
Production Token Logging: NOT VERIFIED
```

F-P5V-03 remains open. **Do not** generate a real invitation until Production sinks are confirmed SAFE for invitation path URIs.

---

## QA Mailbox / Tenant

| Item | Status |
| ---- | ------ |
| Test Mailbox | MISSING |
| Test Tenant | MISSING |

---

## Pre-Smoke Readiness Matrix

| Requirement | Result | Evidence |
| ----------- | ------ | -------- |
| Azure access | BLOCKED | `az` missing; no portal session |
| ACS resource | BLOCKED | No Azure access |
| Email service | BLOCKED | No Azure access |
| Domain | BLOCKED | Ownership/DNS not available |
| Sender | BLOCKED | Not confirmed |
| ACS secret injected | BLOCKED | No Production secret store access |
| Backend deployed | BLOCKED | No deploy pipeline/auth |
| ACS provider active | NOT VERIFIED | Needs Production runtime |
| Flutter deployed | BLOCKED | No hosting access |
| HTTPS host | BLOCKED | Hostname not supplied |
| DNS | BLOCKED | No DNS access |
| TLS | BLOCKED | No host |
| Deep route | NOT VERIFIED | Needs deployed host |
| TenantAdminAppBaseUrl | BLOCKED | Missing |
| API URL | BLOCKED | Missing |
| CORS | NOT VERIFIED | Needs Backend + host |
| Outbox worker | NOT VERIFIED | Needs Production runtime |
| Test mailbox | BLOCKED | Missing |
| Test tenant | BLOCKED | Missing |
| Token logging | NOT VERIFIED | No Production logs |

**Pre-Smoke Readiness: BLOCKED**

---

## Blocking Items (exact owners)

1. **Cloud / Platform Ops** — Azure Subscription + Resource Group + `az`/Portal login  
2. **ACS admin** — Production ACS + Email Communication Service  
3. **DNS owner** — Publish Azure-provided domain records; avoid SPF conflicts  
4. **Product / ACS** — Approve domain strategy + invitation MailFrom  
5. **Backend release / Security** — Inject ACS + `TenantAdminAppBaseUrl` via Key Vault/App Settings; deploy `e6933ec`+  
6. **Flutter / Web release** — Deploy Tenant Admin `6546d4b`+ to approved host without dev interceptor  
7. **Architecture / DNS** — Confirm exact Production Tenant Admin hostname  
8. **API gateway / Backend** — CORS + frontend API base URL  
9. **Backend runtime** — Enable outbox worker against Production DB  
10. **QA** — Controlled mailbox + test tenant  
11. **Security / Observability** — Confirm Production does not persist `/tenant-admin/setup/<token>` URIs  

---

## Source Changes

```text
NONE
```

---

## Final Verdict

```text
PRODUCTION ENVIRONMENT PROVISIONING BLOCKED — OPERATOR ACCESS REQUIRED
```

Do **not** run the Real ACS + Production HTTPS Invitation Smoke Gate until this setup returns READY.

---

## Required Next Action

```text
Complete only the listed operator/cloud/DNS/hosting actions, then rerun this production-environment setup validation.
```

When READY:

```text
Run the Phase 5 Real ACS + Production HTTPS Invitation Smoke Gate.
```

---

## Status Anchors

| Item | Value |
| ---- | ----- |
| F-P5V-06 | OPEN |
| Phase 5 Status | CODE CLOSED — PRODUCTION GATE PENDING |
| Phase 6 Status | NOT AUTHORIZED |
| Live invitation generated | NO |
