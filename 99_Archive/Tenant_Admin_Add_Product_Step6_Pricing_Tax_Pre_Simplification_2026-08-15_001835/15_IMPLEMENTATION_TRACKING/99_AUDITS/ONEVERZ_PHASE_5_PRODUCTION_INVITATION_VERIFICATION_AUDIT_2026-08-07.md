# OneVerz Phase 5 — Production Invitation Independent Verification Audit

**Date:** 2026-08-07  
**Auditor role:** Independent read-only verification (security + integration)  
**Branch:** `audit/flow4-phase5-readonly-verification`  
**Implementation claim audited:** `READY FOR VERIFICATION WITH EXTERNAL ACS GAP`  
**Mode:** READ-ONLY — no Backend / Flutter / Platform Admin / roadmap changes

---

## 1. Executive Summary

Independent source and test review of the claimed Phase 5 commits confirms the core invitation closure is **code-safe**:

- Validate + accept/set-password APIs exist and enforce `UserInvite.InviteTokenHash`
- Atomic activate + consume under PostgreSQL `FOR UPDATE`
- Replay rejected; tenant isolation proven in PG tests
- Canonical `/tenant-admin/setup/{token}` URL aligned with Flutter
- Production HTTPS + ACS fail-fast validators registered with `ValidateOnStart`
- Cashier unchanged; Platform Admin change is one-line copy only

**Overstated claims (honesty):**

- “First login PASS” / “Tenant context PASS” are **inferred** from ACTIVE + password-hash verify + unchanged login/context endpoints — **not** a single HTTP E2E journey.
- Concurrent-accept integration test uses **one shared DI/`DbContext`** for both parallel tasks — PostgreSQL is used, but the harness is **not** a rigorous two-connection lock proof.
- Full Phase 5 DoD item “invitation email delivered via production ACS (external evidence)” remains **unproven**.

**Final Verdict:**

```text
VERIFIED WITH EXTERNAL ACS GAP — PHASE 5 CODE CLOSED
```

No Critical/High **code** blockers found. Non-blocking assurance gaps and the external ACS production gate remain.

---

## 2. Repository / Commit Validation

| Repo | Branch | Commit | Dirty? | Exact Audit Target? |
| --- | --- | --- | ---: | ---: |
| Backend | `feature/flow4-phase5-production-invitation` | `6fd24b81373b87db03624afc2b507b9dcd61847e` | 0 | YES |
| Flutter | `feature/flow4-phase5-production-invitation` | `3945119151021c43faae707782df7ada4c882fc8` | generated plugin files only (not in commit) | YES |
| Platform Admin | `feature/flow4-phase5-production-invitation` | `18e7851842bdd1f8983d133b3a0b43411dd7d399` | 0 | YES |
| Second Brain impl tracking | `docs/flow4-phase5-implementation-tracking` | `ff562e389dad0daa8602ad821cd608cbdaaa7bc0` | — | YES (report base) |
| Second Brain foundation audit | `audit/flow4-phase5-production-invitation-foundation` | `9514e4a` | — | YES (plan/audit read) |

No later commits on these feature branches beyond the claimed SHAs.

Worktrees used: `worktrees/backend-phase5`, `worktrees/flutter-phase5`, `worktrees/platform-admin-phase5`, `worktrees/secondbrain-phase5-verify`. Dirty Flutter main was not used.

---

## 3. Claimed vs Actual Implementation

| Claim | Actual | Match? |
| --- | --- | ---: |
| Validate `GET .../setup-token/{token}/validate` | `TenantAdminOnboardingInvitationController` | YES |
| Accept `POST .../setup-password` | Same controller | YES |
| Authority `UserInvite.InviteTokenHash` | Hash via `IInvitationTokenService`; no `UserSetupToken` in accept path | YES |
| Route `/tenant-admin/setup/:token` | Email builder + Flutter `:setupToken` | YES |
| Migration NOT REQUIRED | No migration in `6fd24b8`; existing indexes adequate | YES |
| ACS code READY | ACS sole sender + Production validator | YES |
| ACS env PENDING | No external delivery proof | YES |
| Concurrent accept PASS | Code YES; multi-session test evidence PARTIAL | PARTIAL |
| First login / context PASS | Inferred, not full E2E | PARTIAL |

---

## 4. Send-Side Invitation Flow

| Step | File / Method | Verified | Notes |
| --- | --- | ---: | --- |
| Bootstrap TA INVITED | Wizard / `TenantUser.CreatePendingInvite` (pre-Phase 5) | YES | Unchanged foundation |
| Outbox invitation message | Finalize/activate + resend enqueue | YES | Pre-existing |
| Worker dispatch | `TenantOnboardingOutboxWorker.DispatchInvitationAsync` | YES | |
| Cancel prior PENDING/SENT | Same method | YES | |
| CSPRNG 32-byte token | `InvitationTokenService.GenerateToken` | YES | `RandomNumberGenerator.GetBytes(32)` |
| Hash only persisted | `HashToken` → `UserInvite.CreatePending` | YES | HMAC-SHA256 via signing key |
| Save invite before ACS | `SaveChangesAsync` before `SendAsync` | YES | |
| ACS attempt | `IApplicationEmailSender.SendAsync` | YES | |
| MarkSent | `invite.MarkSent` + operation MarkInvitationSent | YES | |

---

## 5. Token Generation

**VERIFIED:** CSPRNG 32 bytes, URL-safe Base64 encoding, no Guid-only Flow 4 path. Raw token transient for email URL only.

Staff-invite unhashed Guid path in `TenantAdminUserService` remains isolated and is **not** used by Flow 4 accept.

---

## 6. Token Hash Authority

**VERIFIED:** Accept/validate hash raw token → lookup `InviteTokenHash` only. No `UserSetupToken` fallback. No client-supplied invite ID authority.

---

## 7. Validate API

**VERIFIED**

- `AllowAnonymous` + `AuthLogin` rate limit
- Rejects unknown/expired/cancelled/used/non-operational tenant/non-INVITED user
- Always HTTP 200 with `valid`/`expired`/`message`; email omitted when invalid (good enumeration posture)
- Echoes `setupToken` on invalid responses (Low; client already holds token)

---

## 8. Accept / Password Setup API

**VERIFIED**

Server enforces password policy (`IPlatformPasswordPolicyValidator`), confirmation match, claim lock, activate, MarkAccepted, sibling cancel, operation ACCEPTED.

---

## 9. Password Security

**VERIFIED:** Reuses `IPasswordHashService` PBKDF2. No plaintext storage/logging in Phase 5 paths. Integration verifies hash after accept.

---

## 10. Atomicity

| Operation | Same Transaction? |
| --- | ---: |
| Invite state validation | YES (inside claim TX) |
| Password mutation | YES |
| AcceptedAt / status ACCEPTED | YES |
| User ACTIVE | YES |
| Sibling cancel / operation update | YES |

Failure `ApplicationResult` → `ChangeTracker.Clear` + rollback. **All-or-nothing confirmed in code.**

---

## 11. One-Time Consume

**PASS** — Integration `ValidateAndAccept_ThenReplay_AndLoginReady` (replay → `INVITE_USED`). Unit `SetupPassword_AlreadyAccepted_Fails`.

---

## 12. Concurrent Acceptance

**Code:** `SELECT ... FOR UPDATE` on `user_invites` by hash before mutate — **VERIFIED**. Unique hash index supports safety.

**Test:** `ConcurrentAccept_ExactlyOneSucceeds` runs against PostgreSQL and asserts 1 success / 1 failure, but both tasks share one scoped service/`DbContext` from a single `GetRequiredService` call — **not** two independent DB sessions. Classification:

```text
Concurrent Accept: PASS (mechanism) / PARTIAL (independent multi-connection proof)
```

Finding F-P5V-01 (Medium).

---

## 13. Expiry

**VERIFIED:** `ExpiresAt <= now` rejects validate/accept. Integration expired case PASS. Exact “at boundary” equality uses `<=` (expired at equality) — safe.

Cancelled path unit-covered; integration method name `ExpiredAndCancelled_Rejected` only exercises expired (Medium naming/coverage gap).

---

## 14. Resend

**Code VERIFIED:** Cancels PENDING/SENT; rejects when no INVITED user or operation ACCEPTED (not password-reset).

**Test gap:** No dedicated Phase 5 integration asserting “old token invalid after resend” (Medium F-P5V-02). Pre-Phase 5 outbox behaviour + cancel loop inspected.

---

## 15. Invitation URL

**VERIFIED:** `{base}/tenant-admin/setup/{EscapeDataString(token)}`. Outbox integration asserts path and rejects legacy `/setup-account?token=`.

---

## 16. Production HTTPS

**VERIFIED:** `TenantOnboardingOutboxOptionsValidator` + `ValidateOnStart` reject Production http/localhost/missing. Unit tests cover. Worker send-time check uses `requireHttps: false` (startup already enforced for Production).

---

## 17. ACS Provider / Configuration

**VERIFIED:** Sole DI registration `AzureCommunicationEmailSender`. Production validator requires ConnectionString/Endpoint + SenderAddress. No console/fake Production registration.

---

## 18. ACS External Environment Gap

```text
CODE READY — EXTERNAL ACS VALIDATION PENDING
```

No proof of production ACS resource, verified domain, injected secret, live HTTPS host, or real mailbox delivery.

Canonical plan DoD item 3 requires external ACS evidence for **full production DoD**. Per audit instructions §61, Phase 5 **code** may close with this gap explicitly open as a **production release gate**.

---

## 19. Outbox / Delivery Reliability

**VERIFIED:** Durable invite + outbox before ACS; failures retryable; resend recovery; no new controller direct-send path.

---

## 20. Token Logging

**Backend Phase 5 paths:** SAFE (IDs only).  
**Flutter:** Setup path does not persist token; Low/Medium risk that generic Dio network logger can include path containing token (F-P5V-03).  
**Platform Admin:** N/A for tokens.

---

## 21. Tenant/User State Rules

| State | Validate | Accept | Login |
| --- | ---: | ---: | ---: |
| Tenant active + user INVITED | Yes | Yes | No (until accept) |
| User ACTIVE | Used/reject | Reject | Yes (existing) |
| Tenant not active | Reject | Reject | No (existing) |
| Pending payment / suspended / cancelled | Reject if tenant ≠ active | Reject | Existing login rules |

---

## 22. First Login

```text
PARTIAL
```

Password hash verify after accept PASS. Existing `TenantAuthService.LoginAsync` requires ACTIVE + real password — unchanged. **No automated JWT login call** in Phase 5 suite. Implementation report overstated “First Login PASS” as full proof.

---

## 23. Tenant Context

```text
PARTIAL
```

No Phase 5 change to context APIs. No automated post-accept context call. Inferred only.

---

## 24. Tenant Isolation

**PASS** — Integration `TenantIsolation_TokenCannotActivateOtherTenantUser`. Invite bound to tenant + normalized email user.

---

## 25. Flutter Verification

**VERIFIED** for route public, validate-on-load, accept → success → manual login, password policy alignment, cashier isolation, structured accept error codes.

Gaps: DTO-only tests; validate UI uses soft `valid`/`message` (matches backend contract); opt-in `USE_DEV_API_FALLBACK` interceptor can mask setup-password failures as HTTP 200 (Medium, non-default).

---

## 26. Platform Admin Verification

```text
VALID REQUIRED/POSSIBLE CHANGE
```

Exact one-line copy fix; “email not wired” removed; no copy-link/revoke UI. `ng test` not executed (copy-only; risk negligible).

---

## 27. Cashier Verification

```text
NO CHANGE VERIFIED
```

Flutter diff vs `origin/main` is auth-setup files + DTO test only.

---

## 28. DB / Migration Verdict

```text
NOT REQUIRED — VERIFIED
```

Existing `user_invites` hash uniqueness + filtered unique PENDING/SENT email index + AcceptedAt/status sufficient; concurrency via `FOR UPDATE`.

---

## 29. Backend Unit Tests

Independent re-run:

| Suite | Passed | Failed | Skipped | Exit |
| --- | ---: | ---: | ---: | ---: |
| `FullyQualifiedName~TenantAuth` | 29 | 0 | 0 | 0 |

Coverage includes MarkAccepted, validate/accept service, HTTPS/ACS validators, URL builder. Missing dedicated unit test for `ActivateFromInvitation` alone (non-blocking).

---

## 30. Backend Integration Tests

Independent re-run:

| Suite | Passed | Failed | Skipped | Exit |
| --- | ---: | ---: | ---: | ---: |
| Invitation accept + outbox filter | 12 | 0 | 0 | 0 |

Evidence DB was available (20s runtime; not silent skip). Note: tests **can** silent-return if DB unavailable (assurance risk for CI without DB).

---

## 31. PostgreSQL Concurrency Proof

| Item | Value |
| --- | --- |
| Provider | PostgreSQL (`127.0.0.1:55436`) |
| Lock | `FOR UPDATE` on `user_invites` |
| Parallel tasks | 2 |
| Claimed result | success=1 failure=1 |
| Harness weakness | Shared scoped DbContext |
| Independent auditor classification | PARTIAL |

---

## 32. E2E Journey Evidence

**No single automated create→invite→validate→accept→login→context journey.** Closest: seeded invite → validate → accept → replay + password verify. Classification: **Medium gap** (F-P5V-04), not Critical.

---

## 33. Flutter Tests

| Suite | Passed | Failed | Blocked |
| --- | ---: | ---: | ---: |
| `invitation_setup_dto_test.dart` | 2 | 0 | 0 |
| `flutter analyze lib/features/auth` | clean | 0 | — |
| Full `flutter test` suite | not required for this audit beyond Phase 5 | — | — |

LOCAL TOOLING: `flutter pub get` may warn about Windows symlink/Developer Mode; dependencies resolve; not a Phase 5 source defect.

---

## 34. Platform Admin Tests

Not executed (single static copy change). Recorded honestly.

---

## 35. Phase 1–4 Regressions

Independent re-run:

| Suite | Passed | Failed | Exit |
| --- | ---: | ---: | ---: |
| Unit entitlement/bootstrap/limits related filter | 21 | 0 | 0 |
| Integration `TenantFinalizeDefaultSettings` | 7 | 0 | 0 |

Phase 5 does not bypass entitlement architecture or alter finalize defaults ordering in audited paths.

---

## 36. Security Matrix

| Requirement | Status | Evidence |
| --- | --- | --- |
| CSPRNG token | VERIFIED | `InvitationTokenService` |
| Hash-only storage | VERIFIED | Invite row + unique hash index |
| Sole UserInvite authority | VERIFIED | Accept service/repo |
| Expiry | VERIFIED | Domain + service + integration |
| One-time consume | VERIFIED | Replay tests |
| Replay rejected | VERIFIED | |
| Concurrent accept safe | PARTIAL | Code FOR UPDATE; weak harness |
| Password secure | VERIFIED | |
| Tenant binding | VERIFIED | Isolation test |
| No raw token logging (BE Phase 5) | VERIFIED | |
| HTTPS production link | VERIFIED | Options ValidateOnStart |
| Production ACS provider | VERIFIED | Sole DI + prod validator |
| Fake provider blocked in Production | VERIFIED | |
| Safe anonymous errors | VERIFIED | Soft validate; typed accept codes |

---

## 37. Cross-Layer Matrix

| Requirement | Backend | DB | Platform Admin | Tenant Admin Flutter | Cashier | Tests | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Invite send | VERIFIED | VERIFIED | Copy only | N/A | N/A | Outbox | PASS |
| Token hash authority | VERIFIED | VERIFIED | N/A | N/A | N/A | Unit/IT | PASS |
| Validate API | VERIFIED | N/A | N/A | VERIFIED | N/A | Unit/IT | PASS |
| Accept/password | VERIFIED | VERIFIED | N/A | VERIFIED | N/A | Unit/IT | PASS |
| One-time consume | VERIFIED | VERIFIED | N/A | N/A | N/A | IT | PASS |
| Concurrent accept | VERIFIED code | FOR UPDATE | N/A | N/A | N/A | PARTIAL | PARTIAL |
| Expiry | VERIFIED | VERIFIED | N/A | Soft UI | N/A | IT | PASS |
| Resend | VERIFIED | VERIFIED | Mentions resend | N/A | N/A | Thin | PASS code |
| URL alignment | VERIFIED | N/A | N/A | VERIFIED | N/A | IT | PASS |
| HTTPS enforcement | VERIFIED | N/A | N/A | N/A | N/A | Unit | PASS |
| ACS provider | VERIFIED | N/A | N/A | N/A | N/A | Unit | PASS |
| Flutter setup | N/A | N/A | N/A | VERIFIED | N/A | Thin | PASS |
| First login | Unchanged | N/A | N/A | Manual nav | N/A | Inferred | PARTIAL |
| Tenant context | Unchanged | N/A | N/A | N/A | N/A | Inferred | PARTIAL |
| Tenant isolation | VERIFIED | VERIFIED | N/A | N/A | N/A | IT | PASS |
| Phase 1–4 regression | VERIFIED | VERIFIED | N/A | N/A | NO CHANGE | Filters | PASS |

---

## 38. Findings

### F-P5V-01 — Concurrent accept test shares one DbContext

1. **ID:** F-P5V-01  
2. **Title:** Concurrent accept integration harness is not two-session proof  
3. **Severity:** Medium  
4. **Layer:** Backend tests  
5. **Requirement:** Parallel accept must prove DB serialization  
6. **Actual:** Two tasks on one scoped service/DbContext  
7. **Expected:** Two independent scopes/connections  
8. **Evidence:** `CreateService` + `ConcurrentAccept_ExactlyOneSucceeds`  
9. **File:** `TenantAdminInvitationAcceptanceIntegrationTests.cs`  
10. **Class/method:** `CreateService` / `ConcurrentAccept_ExactlyOneSucceeds`  
11. **Test evidence:** Test passes but weakly designed  
12. **Security impact:** Assurance gap; production FOR UPDATE still present  
13. **Tenant impact:** None proven  
14. **Recommended correction:** Two `IServiceScope` instances in parallel  
15. **Blocks Phase 5 closure:** NO  
16. **Confidence:** High  

### F-P5V-02 — No dedicated resend invalidates-old-token integration test

1. F-P5V-02  
2. Resend regression thinly tested in Phase 5  
3. Medium  
4. Backend tests  
5. Old token must fail after resend  
6. Code cancels PENDING/SENT; no Phase 5 IT asserting old hash reject  
7. Dedicated resend A→B test  
8. Source inspect + missing test grep  
9. Worker + `ResendInvitationAsync`  
10. `DispatchInvitationAsync` / `ResendInvitationAsync`  
11. None Phase 5-specific  
12. Low residual risk (cancel logic clear)  
13. None  
14. Add integration test  
15. NO  
16. High  

### F-P5V-03 — Flutter network error logger may include token path

1. F-P5V-03  
2. Dio URI logging can include setup token  
3. Low (Medium if verbose prod logging enabled)  
4. Flutter  
5. Raw token not logged  
6. Generic client may log failed request URI containing token  
7. Redact path secrets  
8. Datasource + shared Dio client patterns  
9. `dio_client` / auth datasource  
10. Network error logging  
11. None  
12. Token leakage via logs  
13. None  
14. Redact invitation path segments  
15. NO  
16. Medium  

### F-P5V-04 — First login / tenant context not E2E automated

1. F-P5V-04  
2. Login/context claimed PASS without full E2E  
3. Medium  
4. Tests / documentation honesty  
5. E2E create→accept→login→context  
6. Accept + password verify only  
7. Automated login+context after accept  
8. Integration test names vs assertions  
9. `ValidateAndAccept_ThenReplay_AndLoginReady`  
10. Same  
11. Hash verify only  
12. Overstatement risk  
13. None for code safety  
14. Add HTTP E2E  
15. NO  
16. High  

### F-P5V-05 — Opt-in Flutter Dev interceptor can mask setup-password failures

1. F-P5V-05  
2. Dev fallback returns HTTP 200 on password mismatch  
3. Medium (dev-only; default off)  
4. Flutter flavors  
5. Failures must surface  
6. Interceptor resolves 200 with `success:false` body; client ignores body  
7. Throw/non-2xx or client checks body  
8. `tenant_admin_dev_api_interceptor.dart`  
9. Same  
10. setup-password mock  
11. None  
12. Local false-positive setup success  
13. None production if flag false  
14. Align interceptor with DioException  
15. NO  
16. High  

### F-P5V-06 — External ACS / HTTPS host not environment-proven

1. F-P5V-06  
2. Production ACS delivery unproven  
3. Medium (External/Operational) — **production release gate**  
4. Environment  
5. Plan DoD ACS external evidence  
6. Code ready only  
7. Real mailbox proof  
8. No secrets/evidence in repo  
9. N/A  
10. N/A  
11. N/A  
12. Cannot claim production email live  
13. Onboarding email may fail until ops closes gate  
14. Ops ACS + HTTPS host proof  
15. Blocks **production release**; does **not** block Phase 5 **code** closure per §61  
16. High  

---

## 39. Definition-of-Done Assessment

| DoD | Status | Evidence |
| --- | --- | --- |
| Validate API implemented | VERIFIED | Controller + tests |
| Accept API implemented | VERIFIED | |
| UserInvite hash sole authority | VERIFIED | |
| Raw token not persisted | VERIFIED | |
| Raw token not logged (BE Phase 5) | VERIFIED | |
| Expiry enforced | VERIFIED | |
| Replay prevented | VERIFIED | |
| Concurrent accept safe | PARTIAL | Code yes; harness weak |
| Password setup secure | VERIFIED | |
| Invite consumed atomically | VERIFIED | |
| User becomes ACTIVE | VERIFIED | |
| Old token invalid after resend | PARTIAL | Code yes; thin tests |
| Flutter route aligned | VERIFIED | |
| Flutter validate works | VERIFIED | Source |
| Flutter accept works | VERIFIED | Source |
| Login works after setup | PARTIAL | Inferred |
| Tenant context correct | PARTIAL | Inferred |
| Tenant isolation safe | VERIFIED | |
| Production HTTP rejected | VERIFIED | |
| Production provider = ACS | VERIFIED | |
| Fake provider unavailable in Production | VERIFIED | |
| ACS code ready | VERIFIED | |
| ACS environment externally proven | FAILED / PENDING | External |
| Phase 1–4 regression | VERIFIED | Filters green |
| Cashier unchanged | VERIFIED | |
| No Critical/High code blocker | VERIFIED | |

---

## 40. Blocking Gaps

**None for Phase 5 code closure.**

Production release remains gated on F-P5V-06 (external ACS/HTTPS host proof).

---

## 41. Non-Blocking Gaps

- F-P5V-01 concurrent harness  
- F-P5V-02 resend IT  
- F-P5V-03 Flutter URI logging  
- F-P5V-04 E2E login/context  
- F-P5V-05 Dev interceptor  
- Thin Flutter UI tests  
- Silent-skip integration pattern if evidence DB down  

---

## 42. External / Operational Gaps

- ACS resource / verified sender / secrets  
- Production `TenantAdminAppBaseUrl` HTTPS host live proof  
- Real invitation email delivery evidence  

---

## 43. Deferred Scope

Confirmed still outside Phase 5:

```text
Dedicated revoke UI/API
Copy invitation link
Staff-invite hash unification
UserSetupToken productization
Cashier onboarding
Full identity rewrite
Automatic login after setup
Password reset redesign
```

---

## 44. Final Verdict

```text
VERIFIED WITH EXTERNAL ACS GAP — PHASE 5 CODE CLOSED
```

Interpretation: Phase 5 **implementation code** meets security/integration closure for invitation activation. Canonical **production email DoD** remains an **open release gate** until external ACS validation is proven. Roadmap must not be updated by this audit.

```text
Phase 6 Status: NOT STARTED
```

**Required next action:**

```text
Phase 5 closure tracking + controlled merge + post-merge validation + external ACS production gate
```
