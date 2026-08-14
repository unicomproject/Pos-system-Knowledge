# OneVerz Phase 5 — Production Invitation Foundation Audit

**Date:** 2026-08-07  
**Branch:** `audit/flow4-phase5-production-invitation-foundation`  
**Scope:** Audit + implementation planning only (no source changes)  
**Backend audited:** `origin/main` @ `b8ac165` (includes Phase 4 `81c7296`)  
**Phase 4 closure on Second Brain main:** Confirmed (`PHASE 4 VERIFIED` / `PHASE 4 CLOSED` @ `2c14547`)

---

## 1. Executive Summary

Phase 4 is closed. Phase 5 is **authorized** and **not started**.

Today’s Flow 4 path can create a bootstrap Tenant Admin (`INVITED`), queue `tenant_admin.invitation_requested` via transactional outbox, generate a cryptographically random token (hash-only in `user_invites`), and attempt ACS email delivery with a setup URL. Platform Admin can **resend**. Login correctly blocks `INVITED` users without a real password.

**The production journey is incomplete:** there is **no backend validate/accept/password-setup API**. Flutter already has setup screens that call:

```text
GET  /api/tenant-admin/onboarding/setup-token/{token}/validate
POST /api/tenant-admin/onboarding/setup-password
```

Those controllers **do not exist** on Backend `main`. Email links use `/setup-account?token=...`, which does **not** match Flutter routes `/tenant-admin/setup/:setupToken`. Production ACS sender + HTTPS host remain **externally blocked** (canonical + SoT).

**Verdict:**

```text
READY WITH NON-BLOCKING DECISIONS
```

Implementation can proceed once URL path + token authority (`UserInvite` hash) are frozen. Ops must supply ACS + HTTPS hosts for Phase 5 DoD / external proof. Cashier: **NO CHANGE**.

---

## 2. Repository / Commit Validation

| Repository | Main Commit | Worktree | Dirty? | Audit Safe? |
| --- | --- | --- | ---: | ---: |
| Backend | `b8ac1654876aa62710b28abac90ffd8f6cef9e34` | `worktrees/phase5-backend-audit` | 0 | YES |
| Platform Admin | `9e13169b1d10f0ccd374657620b80f4f81d1c916` | `worktrees/phase5-platform-admin-audit` | 0 | YES |
| Flutter | `8db5f748671c82ad52a25d533e9250e7da7bd451` | `worktrees/phase5-flutter-audit` | 0 | YES |
| Flutter (local dirty tree) | `bff2c65` + 18 dirty | `Nytroz-POS-App` | 18 | **NOT USED** |
| Second Brain | `2c14547789ef240487fe0c9ed4902203a1ba89db` | `worktrees/phase5-secondbrain-audit` on audit branch | 0 | YES |

---

## 3. Phase 4 Closure Confirmation

Second Brain `origin/main` roadmap shows:

```text
PHASE 4 VERIFIED
PHASE 4 CLOSED
```

Phase 5 row: ACS verified sender + HTTPS host closure; implementation **NOT STARTED**; authorized after Phase 4 closure.

**Proceed with Phase 5 audit.**

---

## 4. Current Invitation Journey

| Step | Exists Today | Backend File/Method | API | UI Consumer | Production Ready? |
| --- | ---: | --- | --- | --- | ---: |
| Bootstrap Tenant Admin created | Yes | `TenantUser.CreatePendingInvite` in Wizard | Finalize/create | PA wizard | Yes (identity) |
| Status `INVITED` | Yes | AccountStatus | — | — | Yes |
| Bootstrap role + Phase 2 permissions | Yes | Wizard bootstrap catalog | — | — | Yes |
| Invitation record at create | **No** | `TenantAdminInvite = null` | — | — | N/A |
| Outbox `invitation_requested` | Yes | Wizard (trial/demo) / Activate (paid) | Finalize / Activate | PA | Partial |
| Token generated | Yes (async worker) | `InvitationTokenService` + OutboxWorker | — | Email | Partial |
| Hash stored | Yes (Flow 4 path) | `UserInvite.InviteTokenHash` | — | — | Yes |
| Expiry stored | Yes | `ExpiresAt` (default 24h, clamp 1–168) | Config | — | Yes |
| Email sent | Yes if ACS configured | `AzureCommunicationEmailSender` | Outbox worker | Email | **No** (prod ACS blocked) |
| URL generated | Yes | `TenantAdminAppBaseUrl` + `/setup-account?token=` | — | Email | **No** (HTTPS/host + path mismatch) |
| Validate token API | **No** | — | Flutter expects GET setup-token/validate | Flutter setup screen | **No** |
| Set password / accept | **No** | — | Flutter expects POST setup-password | Flutter | **No** |
| Invite marked accepted | **No** | Columns exist; no `MarkAccepted` | — | — | **No** |
| User → ACTIVE | **No** via invite | Login requires ACTIVE | Login | Flutter login | Blocked until accept |
| Resend | Yes | ResendInvitationAsync | POST …/invitation/resend | PA result/payment pages | Partial |
| Revoke dedicated API | **No** | `Cancel()` used on resend | — | No UI | Defer / optional |
| Token reuse after accept | N/A | Accept missing | — | — | Must implement one-time |

**Target after Phase 5:**

```text
Finalize/activate → INVITED user + outbox
→ Worker creates hashed UserInvite + ACS email (HTTPS URL)
→ Validate API → Set-password/accept API (atomic)
→ Invite ACCEPTED + user ACTIVE
→ Login + tenant context
```

---

## 5. Bootstrap Tenant Admin State

| Field | Current Behaviour | Expected Phase 5 Behaviour | Change? |
| --- | --- | --- | ---: |
| Tenant-scoped user | Yes | Same | No |
| AccountStatus | `INVITED` | Same until accept | No |
| Password | `PENDING_INVITE:UNSET` | Real hash on accept | Accept API |
| Role | Bootstrap Tenant Admin + Phase 2 grants | Same | No |
| Invite at create | Null write-model | Keep outbox-driven invite | No |
| Operational before activation | Login blocked | Same | No |

---

## 6. Invitation State Machine

**Runtime statuses used:** `PENDING` → `SENT` (MarkSent); prior `PENDING`/`SENT` → `CANCELLED` on resend.

**Constants exist but unused in methods:** `ACCEPTED`, `EXPIRED`, `REVOKED`.

| Current State | Event | Next State | Backend Owner | Audit Event |
| --- | --- | --- | --- | --- |
| (none) | Worker creates invite | PENDING | OutboxWorker | Needed |
| PENDING | Email accepted by ACS | SENT | OutboxWorker | Needed |
| PENDING/SENT | Resend | CANCELLED (old) + new PENDING/SENT | Resend + Worker | Partial |
| SENT | Accept (missing) | ACCEPTED | **NEW** accept service | Needed |
| SENT | Expiry check on validate/accept | Reject (logical EXPIRED) | **NEW** | Needed |
| ACCEPTED | Accept again | Reject | **NEW** | Needed |
| CANCELLED | Accept | Reject | **NEW** | Needed |

Invalid transitions (REVOKED/EXPIRED/USED → ACCEPT) must fail — **not implemented yet**.

---

## 7. Token Security

| Rule | Actual | Safe? |
| --- | --- | ---: |
| CSPRNG | `RandomNumberGenerator.GetBytes(32)` | Yes |
| Hash storage (Flow 4) | HMAC via `ITokenHashService` + JWT signing key | Yes |
| Raw not in DB | Tests assert; only hash persisted | Yes |
| Raw not logged (worker/ACS) | No URL/token in logs observed | Yes |
| Bound to tenant/email | Invite rows tenant + normalized email | Yes |
| One-time use | **Not enforced** (no accept) | Gap |
| Staff invite path | `TenantAdminUserService` stores Guid **unhashed** | **Unsafe for staff path** (separate from Flow 4 bootstrap; must not copy) |

**Token Security Status:** **PARTIAL** — generation/hashing for Flow 4 send path is strong; accept/one-time/replay protection missing; staff invite hashing inconsistency is a Medium/High hygiene issue to fix or isolate.

---

## 8. Expiry

| Rule | Actual | Safe? | Change Needed? |
| --- | --- | ---: | ---: |
| Config | `TenantOnboardingOutbox:InvitationExpiryHours` default 24 | Yes | Document |
| Clamp | 1–168 hours | Yes | No |
| UTC | `DateTimeOffset.UtcNow` | Yes | No |
| Enforce on validate/accept | Missing APIs | No | **Yes** |
| Resend new expiry | New invite with new ExpiresAt | Yes | Ensure cancel old |

---

## 9. Replay / Concurrency

| Scenario | Today | Required |
| --- | --- | --- |
| Accept then reuse | N/A | Reject |
| Concurrent accept | N/A | Exactly one success (conditional update / unique accepted) |
| Concurrent resend | Worker cancels PENDING/SENT then inserts | Keep + tests |

---

## 10. Resend

| Question | Answer |
| --- | --- |
| API present? | Yes — `POST .../tenants/{id}/invitation/resend` |
| Permission? | `platform.tenants.update` + PlatformOnly |
| Old token revoked? | Yes — Cancel PENDING/SENT for email |
| New token? | Yes — new outbox → new invite |
| Rate limit? | Idempotency-Key required; no explicit throttle | Possible Phase 5 |
| Active tenant only? | Yes |
| Production ready? | Partial (depends on ACS + accept path) |

MVP: **keep resend** (already required by canonical lifecycle).

---

## 11. Revoke

Dedicated revoke API/UI: **No**. Resend cancels prior tokens. Phase 5 MVP: **DEFER** dedicated revoke unless product requires; document resend-as-revoke.

---

## 12. Email Provider

| Component | Current | Production Ready? | Phase 5 Action |
| --- | --- | ---: | --- |
| `IApplicationEmailSender` | Abstraction | Yes | Keep |
| `AzureCommunicationEmailSender` | Only DI registration | Config-dependent | Wire secrets/sender |
| Fake/dev swap | None (ACS unconfigured → fail retryable) | Safer than silent fake | Keep fail-closed |
| Config section | `AzureCommunicationEmail` | Empty in repo | Ops + startup validation |

---

## 13. ACS Production Readiness

Canonical + SoT: live ACS/mailbox/HTTPS **BLOCKED_EXTERNAL**; production **NO-GO** until external proof.

| Item | Status |
| --- | --- |
| Sender implementation | Present |
| Connection/secrets in repo | Empty placeholders |
| Approved domain / mailbox | External |
| WaitUntil.Started ≠ inbox delivery | Documented correctly in SB |

**ACS Status:** **NOT PRODUCTION READY** (implementation present; external closure pending).

---

## 14. Email Failure Semantics

Canonical: tenant provisioning remains durable; outbox retry + authorized resend; do not duplicate tenants.

**Recommended Phase 5 contract (matches current architecture):**

```text
Commit tenant + INVITED user + outbox in DB TX
→ Worker sends email asynchronously
→ ACS failure → FAILED_RETRYABLE / FINAL + PA resend
→ Do NOT roll back tenant
```

---

## 15. Outbox / Reliability

Present: `IntegrationOutboxMessage` + `TenantOnboardingOutboxWorker` (poll, lease, SKIP LOCKED, backoff, max attempts, manual retry).

**Phase 5:** Keep; do not build a second messaging platform. Ensure accept path does not depend on outbox.

---

## 16. Invitation URL / HTTPS

| Environment | Current Base URL | HTTPS | Safe? |
| --- | --- | ---: | ---: |
| Committed config | Empty `TenantAdminAppBaseUrl` | N/A | Fails delivery (good) |
| Integration tests | `http://localhost:4200` | No | Dev-only OK |
| Production | Must be configured | Required | **No enforcement in worker** |

Email path today: `{base}/setup-account?token={raw}`  
Flutter path: `/tenant-admin/setup/:setupToken`

**HTTPS Invitation Status:** **MISSING** enforcement + **PARTIAL** construction + **path mismatch**.

---

## 17. Email Template

Minimal HTML: “Your tenant is ready” + CTA link. No password. Token only in link (expected). Needs: expiry text, support guidance, brand polish (optional). No raw IDs required.

---

## 18. Validate Invitation API

**Exists?** No (Backend). Flutter client expects it (and Dev interceptor mocks it).

Required behaviour: hash token → load invite → check SENT/PENDING, expiry, cancel, tenant active, user INVITED → return safe DTO (email masked, tenant display name) without leaking enumeration excessively.

---

## 19. Accept Invitation API

**Exists?** No.

Required atomic outcome:

1. Re-validate token  
2. Password policy + hash (reuse existing hash service)  
3. User ACTIVE + password set  
4. Invite ACCEPTED + AcceptedAt + AcceptedTenantUserId  
5. Invalidate/cancel other open invites for email  
6. Audit event  

---

## 20. Password Setup

Must reuse existing tenant password hashing / policy (same as auth). No second password system. No plaintext logging.

---

## 21. User Activation

`INVITED` → `ACTIVE` only on successful accept. Login already requires ACTIVE + real password.

---

## 22. Tenant / Subscription State Rules

From canonical lifecycle:

| Tenant/Subscription State | Invite Validate | Invite Accept | Login |
| --- | ---: | ---: | ---: |
| draft / pending_payment / pending_activation | No | No | No |
| active | Yes | Yes | Yes (after accept) |
| suspended / cancelled | No (policy) | No | No |

Worker already requires tenant `active` for delivery.

---

## 23. First Login

After accept: existing `POST /api/v1/tenant-auth/login` works if ACTIVE. Must verify JWT claims + Phase 2 permissions + context.

**First Login Status:** **PARTIAL** — login path exists; blocked until accept API.

---

## 24. Tenant Context

`GET /api/v1/tenant-admin/context` exists (Phases 1–4). No Phase 5 change required beyond successful auth.

---

## 25. Platform Admin Impact

| Capability | Exists | Required for MVP | Change? |
| --- | ---: | ---: | ---: |
| Invitation status on result/payment | Yes | Yes | Inspect/align |
| Resend | Yes | Yes | Keep |
| Wizard “email not wired” copy | Stale | Yes fix | **MODIFY** |
| Copy link | No | No | DEFER |
| Dedicated revoke | No | No | DEFER |
| Delivery failed visibility | Partial via operation status | Improve if easy | POSSIBLE |

**Platform Admin Impact:** **POSSIBLE** (copy + status clarity); not a greenfield invite UI.

---

## 26. Tenant Admin Flutter Impact

| Capability | Exists | Current Flow | Phase 5 Change |
| --- | ---: | --- | --- |
| Setup validate screen | Yes | Calls missing BE API | Align contract |
| Set password screen | Yes | Calls missing BE API | Align contract |
| Success → login | Yes | Works after ACTIVE | Verify E2E |
| Deep links | No native | Web/path routing | POSSIBLE if HTTPS host requires |
| Dev interceptor mocks | Yes | Hides BE gap in dev | Must not mask prod |

**Tenant Admin Flutter Impact:** **REQUIRED** (contract alignment with real BE APIs + URL path). Not a full rewrite.

---

## 27. Cashier Flutter Impact

Flow 4 invitation is bootstrap Tenant Admin only. Cashier/staff invites are separate TA feature. Device activation unrelated.

**Cashier Flutter Impact:** **NO CHANGE**

---

## 28. DB Impact

| Entity/Table | Exists | Fields Adequate | Migration Needed |
| --- | ---: | ---: | ---: |
| `user_invites` | Yes | Hash, expiry, sent, cancel, accepted columns | Likely **NO** new table; add `MarkAccepted` domain method |
| `user_setup_tokens` | Yes | Unused by Application | Prefer **not** dual systems; use `UserInvite` or explicitly deprecate |
| Outbox | Yes | Adequate | No |

**Migration Required:** **TO BE CONFIRMED** — expect **NO** schema DDL if accept uses existing `AcceptedAt`/`InviteStatus`; confirm indexes for concurrent accept.

---

## 29. API Matrix

| API | Method | Exists | Permission | Consumer | Required Change |
| --- | --- | ---: | --- | --- | ---: |
| Finalize / Activate | POST | Yes | Platform tenants.* | PA | Inspect only |
| Resend invitation | POST | Yes | tenants.update | PA | Keep |
| Validate setup token | GET | **No** | Anonymous (token) | Flutter | **NEW** |
| Setup password / accept | POST | **No** | Anonymous (token) | Flutter | **NEW** |
| Revoke | — | No | — | — | DEFER |
| Tenant login | POST | Yes | Public | Flutter | Inspect only |
| Tenant context | GET | Yes | Tenant auth | Flutter | No change |

---

## 30. Permissions

| Operation | Required Permission | Current | Correct? |
| --- | --- | --- | ---: |
| Resend | `platform.tenants.update` | Yes | Yes |
| View invite status | Platform tenant read/update surfaces | Composite ops | Yes |
| Validate/accept | Public token-bound | Missing | Must be token-auth only, no platform perm |
| Tenant isolation | TenantId on invite | Yes on rows | Enforce in accept |

---

## 31. Tenant Isolation

Invite rows are tenant-scoped. Accept must bind hash → invite → user email/tenant and refuse cross-tenant activation. **Must test.**

---

## 32. Security Findings

| ID | Severity | Title | Blocks Phase 5 start? |
| --- | --- | --- | ---: |
| F-P5-01 | High | Accept/validate APIs missing — journey incomplete | No (is the work) |
| F-P5-02 | High | Email URL path ≠ Flutter routes | No (freeze + fix in impl) |
| F-P5-03 | High | No one-time consume / replay protection | No (implement with accept) |
| F-P5-04 | High | Production ACS/HTTPS not closed | DoD external; code can proceed |
| F-P5-05 | Medium | PA wizard stale “email not wired” | No |
| F-P5-06 | Medium | Staff invite stores unhashed Guid | Isolate; don’t copy into Flow 4 |
| F-P5-07 | Medium | No HTTPS scheme validation on base URL | Implement in Phase 5 |
| F-P5-08 | Low | ACCEPTED/EXPIRED constants unused | Cleanup with accept |

No Critical cross-tenant defect found in send path; accept path must be designed to prevent Critical flaws.

---

## 33. NFR Findings

- Security: strong send-side tokens; accept incomplete  
- Reliability: outbox + resend good pattern  
- Observability: need richer invitation audit events  
- Maintainability: centralize URL builder + invite service  

---

## 34. Failure Journey Matrix

| Failure | Expected Behaviour | Recovery |
| --- | --- | --- |
| ACS unavailable | Outbox retry; tenant durable | Resend / fix config |
| Invalid email | Provider reject → retryable/final | Correct email + resend |
| Expired invite | Validate/accept reject | Resend |
| Revoked/cancelled | Reject | Resend |
| Used invite | Reject | Login or support |
| Tampered token | Reject | Resend |
| Tenant suspended | Reject validate/accept/login | Platform reactivate |
| Subscription invalid | Per login/entitlement policy | Platform |
| Password validation fail | Accept fails; invite remains usable until success | Retry password |
| Concurrent accept | One success | — |
| Email sent, UI wrong host | User can’t open | Fix HTTPS base URL + resend |

---

## 35. Cross-Layer Impact Matrix

| Area | Backend | DB | Platform Admin | Tenant Admin Flutter | Cashier Flutter | Second Brain |
| --- | --- | --- | --- | --- | --- | --- |
| Invitation creation | NO CHANGE (exists) | NO CHANGE | POSSIBLE copy | NO CHANGE | N/A | REQUIRED docs |
| Token security | REQUIRED accept/one-time | POSSIBLE | NO CHANGE | NO CHANGE | N/A | REQUIRED |
| Expiry | REQUIRED enforce | NO CHANGE | POSSIBLE display | POSSIBLE UX | N/A | REQUIRED |
| ACS email | REQUIRED config/validation | NO CHANGE | POSSIBLE status | NO CHANGE | N/A | REQUIRED |
| HTTPS links | REQUIRED | NO CHANGE | NO CHANGE | POSSIBLE deep link | N/A | REQUIRED |
| Validate invite | REQUIRED NEW | NO CHANGE | NO CHANGE | REQUIRED align | N/A | REQUIRED |
| Accept invite | REQUIRED NEW | POSSIBLE | NO CHANGE | REQUIRED align | N/A | REQUIRED |
| Password setup | REQUIRED NEW | NO CHANGE | NO CHANGE | REQUIRED | N/A | REQUIRED |
| Resend | NO CHANGE / POSSIBLE harden | NO CHANGE | POSSIBLE | NO CHANGE | N/A | REQUIRED |
| Revoke | DEFER | NO CHANGE | DEFER | N/A | N/A | DEFER |
| First login | INSPECT | NO CHANGE | NO CHANGE | INSPECT | NO CHANGE | REQUIRED |
| Tenant context | NO CHANGE | NO CHANGE | NO CHANGE | NO CHANGE | NO CHANGE | NO CHANGE |
| Audit logging | REQUIRED | POSSIBLE | POSSIBLE | NO CHANGE | N/A | REQUIRED |

---

## 36. MVP / Deferred Scope

### Mandatory Phase 5

1. Freeze URL + API contract (Flutter ↔ Backend ↔ email)  
2. Validate invitation API  
3. Accept / set-password API (atomic consume + activate)  
4. HTTPS base URL validation (Production fail-fast)  
5. ACS production config + external evidence  
6. Concurrent accept / replay tests  
7. PA wizard copy fix  
8. E2E: create → invite → accept → login → context  

### Optional

- Richer email template  
- Rate limits on validate/resend  
- Dedicated revoke API  
- Native deep links  

### Deferred

- Cashier changes  
- Full identity redesign  
- Dual `UserSetupToken` productization (prefer single `UserInvite` authority)  
- Staff-invite hash fix (track separately if not in MVP)  

---

## 37. Test Plan (summary)

- Token hash verify; wrong/tampered/expired/cancelled/used reject  
- Concurrent accept → one win  
- Tenant isolation  
- ACS unconfigured fails delivery safely; tenant remains  
- Production HTTP base URL rejected  
- Login before accept fails; after accept succeeds with permissions  
- Phase 1–4 regression  

---

## 38. Risks and Blockers

| Risk | Blocking implementation start? | Blocking production DoD? |
| --- | ---: | ---: |
| Missing accept APIs | No — is the work | Yes until done |
| URL mismatch | No — freeze decision | Yes until aligned |
| ACS/HTTPS external | No for coding | Yes for release |
| Dual token tables | Non-blocking if `UserInvite` chosen | — |

---

## 39. Final Verdict

```text
READY WITH NON-BLOCKING DECISIONS
```

### Recommended implementation branches (do not create yet)

| Repo | Branch | Need |
| --- | --- | --- |
| Backend | `feature/flow4-phase5-production-invitation` | **REQUIRED** |
| Platform Admin | `feature/flow4-phase5-production-invitation` | **POSSIBLE** (copy/status) |
| Flutter | `feature/flow4-phase5-production-invitation` | **TENANT ADMIN REQUIRED** |
| Cashier | — | **NO CHANGE** |
| Second Brain | `docs/flow4-phase5-implementation-tracking` | **REQUIRED** after sign-off |

### Phase 6 Status

```text
NOT STARTED
```

### Companion plan

`15_IMPLEMENTATION_TRACKING/ONEVERZ_PHASE_5_PRODUCTION_INVITATION_IMPLEMENTATION_PLAN_2026-08-07.md`
