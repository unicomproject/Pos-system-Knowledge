# OneVerz Phase 5 — Production Invitation Implementation Plan

**Date:** 2026-08-07  
**Companion audit:** `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_PHASE_5_PRODUCTION_INVITATION_FOUNDATION_AUDIT_2026-08-07.md`  
**Status:** PLAN ONLY — do not implement until branch creation is authorized  
**Verdict basis:** `READY WITH NON-BLOCKING DECISIONS`

---

## 0. Frozen Decisions (implement against these)

### D1 — Token authority

```text
UserInvite.InviteTokenHash is the sole authority for Flow 4 Tenant Admin invitation validate/accept.
Do not introduce a second parallel token system for Phase 5.
UserSetupToken remains unused / deferred deprecate.
```

### D2 — Invitation URL contract (freeze before coding)

**Email CTA and Flutter route must match.** Recommended freeze:

```text
Path: /tenant-admin/setup/{token}
Query alternative (if web prefers): /tenant-admin/setup?token={token}
```

Backend worker currently builds:

```text
{TenantAdminAppBaseUrl}/setup-account?token={rawToken}
```

**Action:** Change worker URL builder to the frozen Flutter path. Do not leave both paths live without redirect.

### D3 — API contract (align Flutter existing client)

Flutter already calls:

```text
GET  /api/tenant-admin/onboarding/setup-token/{token}/validate
POST /api/tenant-admin/onboarding/setup-password
     body: { setupToken, password, confirmPassword? }
```

Implement these exact routes (or versioned equivalent with Flutter update in same PR pair). Prefer matching Flutter paths to minimize FE churn.

Auth: **anonymous**, token-bound. No platform JWT.

### D4 — Lifecycle states

```text
User: INVITED → ACTIVE (only on successful accept)
Invite: PENDING → SENT → ACCEPTED
        PENDING|SENT → CANCELLED (resend / revoke)
Logical EXPIRED: ExpiresAt <= UtcNow → reject (may leave status SENT)
```

### D5 — Email failure

```text
Tenant + INVITED user + outbox committed first.
Email failure must NOT roll back tenant.
Recovery: outbox retry + Platform Admin resend.
```

### D6 — HTTPS

```text
Production: TenantAdminAppBaseUrl must be https://
Development: http://localhost allowed
Startup or worker fail-fast if Production + non-HTTPS / empty
```

### D7 — ACS sender

```text
Use configured AzureCommunicationEmail:FromAddress (ops-approved mailbox).
Do not invent extra addresses for Phase 5 MVP.
```

---

## 1. Branch Strategy

Create only after this plan is accepted:

| Repo | Branch | Action |
| --- | --- | --- |
| Backend | `feature/flow4-phase5-production-invitation` from latest `origin/main` | REQUIRED |
| Platform Admin | same name from `origin/main` | POSSIBLE (copy/status) |
| Flutter | same name from `origin/main` clean worktree | TENANT ADMIN REQUIRED |
| Second Brain | `docs/flow4-phase5-implementation-tracking` | REQUIRED for tracking |

Never implement on `main`. Never use dirty Flutter tree.

---

## 2. Recommended Implementation Order

1. Freeze D1–D7 in Second Brain tracking note (short)  
2. Backend invitation accept domain (`MarkAccepted`) + service  
3. Validate API  
4. Accept/set-password API (atomic)  
5. URL builder + HTTPS validation  
6. ACS config validation / Production fail-closed  
7. Worker email path alignment  
8. PA wizard copy fix  
9. Flutter client/route alignment (if any delta)  
10. Security + concurrency tests  
11. E2E integration test  
12. Independent verification audit  
13. ACS/HTTPS external evidence for DoD  

---

## 3. Layer Change Matrix

| Layer | File/Symbol | Current | Required | Action |
| --- | --- | --- | --- | --- |
| Domain | `UserInvite` | Cancel, MarkSent | Add `MarkAccepted(now, tenantUserId)`; reject if cancelled/accepted/expired | MODIFY |
| Domain | `TenantUser` | CreatePendingInvite | Add activate-from-invite method or use existing setters carefully | MODIFY / INSPECT |
| Application | NEW `ITenantAdminInvitationAcceptanceService` | Missing | Validate + Accept | NEW |
| Application | `InvitationTokenService` | Generate+Hash | Reuse Hash for verify | INSPECT ONLY |
| Application | `ITokenHashService` | Exists | Constant-time compare via hash equality | INSPECT ONLY |
| Application | `TenantOnboardingOutboxWorker` | `/setup-account?token=` | Frozen path + HTTPS check | MODIFY |
| Application | `TenantAdminInvitationEmailComposer` | Minimal HTML | Expiry + support line (optional) | POSSIBLE |
| Application | Resend | Exists | Keep cancel-old + new outbox | NO CHANGE / POSSIBLE harden |
| Infrastructure | `AzureCommunicationEmailSender` | Exists | Prod config binding | INSPECT / MODIFY validation |
| Api | NEW TenantAdmin onboarding controller(s) | Missing | Validate + SetupPassword | NEW |
| Api | Rate limiting | Unknown | Soft limit validate/accept | POSSIBLE |
| PA | Wizard copy “email not wired” | Stale | Correct messaging | MODIFY |
| Flutter | `AuthRemoteDatasource` | Calls expected APIs | Match BE; remove false Dev success if needed | MODIFY / INSPECT |
| Flutter | Routes `/tenant-admin/setup/...` | Exist | Match email URL | MODIFY if URL frozen differently |
| DB | `user_invites` | Columns exist | Prefer no DDL; confirm concurrency | INSPECT ONLY |
| Tests | NEW acceptance/concurrency tests | Missing | Mandatory | NEW |

---

## 4. Exact Backend Work Items

### 4.1 Domain — `UserInvite.MarkAccepted`

```text
Precondition: InviteStatus in (PENDING, SENT)
Precondition: CancelledAt == null
Precondition: AcceptedAt == null
Precondition: ExpiresAt > UtcNow
Then: InviteStatus = ACCEPTED; AcceptedAt = now; AcceptedTenantUserId = userId
Else: throw domain/application exception mapped to safe API error
```

### 4.2 Application — Validate

Pseudo:

```text
hash = Hash(rawToken)
invite = repo.GetByTokenHash(hash)  // no raw token in logs
if null → generic invalid
if cancelled/accepted/expired → generic invalid or typed codes without email enumeration
if tenant not active → reject
if user not INVITED / email mismatch → reject
return { valid, emailMasked, tenantDisplayName, expiresAt }
```

### 4.3 Application — Accept / Setup Password

Single transaction:

```text
1. Validate as above (re-check under TX)
2. Validate password policy + confirmation
3. Hash password with existing tenant password hasher
4. Set TenantUser password + AccountStatus = ACTIVE
5. MarkAccepted invite
6. Cancel any other PENDING/SENT invites for same tenant+email
7. SaveChanges
8. Audit: TenantAdminInvitationAccepted (no raw token)
```

Concurrency: conditional update `WHERE InviteStatus IN ('PENDING','SENT') AND AcceptedAt IS NULL` or reload + row version if available. Test double-accept.

### 4.4 Controller routes

```text
GET  /api/tenant-admin/onboarding/setup-token/{token}/validate
POST /api/tenant-admin/onboarding/setup-password
```

Map to ApiResponse envelope consistent with tenant auth.

Error contract (prefer stable codes):

| Code | HTTP | Meaning |
| --- | ---: | --- |
| INVITE_INVALID | 400/404 | Bad/unknown/tampered |
| INVITE_EXPIRED | 400 | Expired |
| INVITE_CANCELLED | 400 | Cancelled |
| INVITE_USED | 400 | Already accepted |
| TENANT_NOT_OPERATIONAL | 403 | Tenant not active |
| PASSWORD_INVALID | 400 | Policy fail |

Avoid “user does not exist” vs “wrong token” distinctions.

### 4.5 URL + HTTPS

```text
class TenantAdminInvitationUrlBuilder
  Build(baseUrl, rawToken) → absolute HTTPS URL for Production
```

Config keys:

```text
TenantOnboardingOutbox:TenantAdminAppBaseUrl
TenantOnboardingOutbox:InvitationExpiryHours
AzureCommunicationEmail:*
ASPNETCORE_ENVIRONMENT / hosting env
```

### 4.6 ACS

- Keep sole sender: `AzureCommunicationEmailSender`
- Production: empty connection string → fail delivery (already) + optional **startup health warning**
- Do not register a silent fake in Production

---

## 5. Platform Admin Work Items

| Item | Action |
| --- | --- |
| Wizard text claiming email not wired | MODIFY — state email is queued via ACS; resend available |
| Result/payment invitation status + resend | INSPECT ONLY unless status mapping gaps |
| Copy invite link | DEFER |
| Revoke button | DEFER |

---

## 6. Flutter Tenant Admin Work Items

| Item | Action |
| --- | --- |
| Setup validate / password screens | INSPECT; wire to live BE |
| Datasource endpoints | Keep if BE matches; else MODIFY |
| Dev interceptor that always succeeds validate | Ensure Production/real API path not masked |
| Route vs email URL | ALIGN to D2 |
| Login after setup | INSPECT E2E |
| Cashier | NO CHANGE |

Deep links: only if production HTTPS host requires native app open; else web/Flutter web path sufficient for MVP — mark POSSIBLE.

---

## 7. Permissions

| Operation | Permission |
| --- | --- |
| Resend | `platform.tenants.update` (existing) |
| Validate / Accept | Public + secret token |
| Login / Context | Existing tenant auth |

---

## 8. Transaction Rules

| Boundary | Includes |
| --- | --- |
| Tenant finalize TX | Tenant, subscription, entitlements, limits, defaults, INVITED user, outbox message — **not** ACS send |
| Accept TX | User activate + invite ACCEPTED + cancel siblings — **not** email |
| Outbox worker | Invite row + ACS send after lease |

---

## 9. Observability Events (names illustrative)

Prefer existing audit naming; add if missing:

```text
TenantAdminInvitationCreated
TenantAdminInvitationDeliverySucceeded
TenantAdminInvitationDeliveryFailed
TenantAdminInvitationResent
TenantAdminInvitationAccepted
```

Never log raw token / full invite URL with token.

---

## 10. Test Plan (exact)

### Unit

- MarkAccepted happy / expired / cancelled / already accepted  
- Token hash verify  
- URL builder HTTPS rejection in Production  
- Password policy failures leave invite usable  

### Integration

- Worker creates hashed invite; raw not in DB  
- Resend cancels old; new hash works; old rejects  
- Validate + Accept → ACTIVE  
- Replay Accept rejects  
- Concurrent Accept: exactly one ACTIVE  
- Cross-tenant: Tenant A token cannot activate Tenant B user  
- Login before accept fails; after succeeds with Phase 2 permissions  
- Context returns Phase 4 defaults  

### E2E (mandatory)

```text
Create/finalize tenant (trial or activate paid)
→ Wait/process outbox (or inject invite in test harness)
→ Capture raw token from test email sink OR generate via service under test
→ GET validate
→ POST setup-password
→ POST login
→ GET context
→ Assert tenantId, user_type, permissions, settings
```

For ACS: use test double implementing `IApplicationEmailSender` capturing link; Production selection test asserts ACS type registered.

---

## 11. Existing Tenant Compatibility

| Population | Policy |
| --- | --- |
| ACTIVE users | Unaffected |
| Existing INVITED + SENT invites | Validate/accept should work if hash+expiry valid |
| Expired invites | Reject; Platform resend |
| Legacy unhashed staff invites (`TenantAdminUserService`) | Out of Flow 4 MVP; do not break; track separate fix |
| Password reset flows | Do not reuse invitation APIs |

---

## 12. Migration Decision

```text
Migration Required: TO BE CONFIRMED
```

Expected outcome after schema inspect during implementation:

```text
NO DDL if AcceptedAt/InviteStatus sufficient
YES only if concurrency token / delivery status columns proven necessary
```

Do not create migration in audit phase.

---

## 13. MVP Scope Checklist

Mandatory:

- [ ] D1–D7 frozen in tracking doc  
- [ ] Validate API  
- [ ] Accept/setup-password API  
- [ ] MarkAccepted + one-time + concurrency  
- [ ] URL path alignment + HTTPS Production rule  
- [ ] ACS config for target env + evidence note  
- [ ] PA copy fix  
- [ ] Flutter alignment  
- [ ] Tests + E2E  
- [ ] Independent verification  

Deferred:

- [ ] Dedicated revoke  
- [ ] Copy link UI  
- [ ] Staff invite hash unification  
- [ ] UserSetupToken productization  
- [ ] Cashier  

---

## 14. Non-Blocking Decisions to Confirm Before Merge

1. Exact public path: `/tenant-admin/setup/{token}` vs query form  
2. Error code catalog vs generic “invalid invitation” only  
3. Whether Production startup hard-fails without ACS (recommended: hard-fail or health critical)  
4. Staff-invite hash fix in Phase 5 vs separate ticket  

---

## 15. Definition of Done (Phase 5)

1. Super Admin can finalize/activate tenant  
2. Bootstrap TA is INVITED with Phase 2 permissions  
3. Invitation email delivered via production ACS (external evidence)  
4. Link is HTTPS on approved host  
5. Token validates server-side  
6. Password set activates user and consumes invite  
7. Replay rejected  
8. Resend recovers delivery failure  
9. Login + context succeed  
10. Phase 1–4 regressions green  
11. Cashier unchanged  
12. Second Brain Phase 5 tracking updated (closure is separate verification task)

---

## 16. Stop Line

```text
Do not start Phase 6.
Do not mark Phase 5 complete in this plan.
Do not implement until feature branches authorized.
```
