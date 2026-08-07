# OneVerz Phase 5 — Production Invitation Implementation Report

**Date:** 2026-08-07  
**Tracking branch:** `docs/flow4-phase5-implementation-tracking`  
**Audit basis:** `audit/flow4-phase5-production-invitation-foundation` @ `9514e4a`  
**Status:** Implementation complete — ready for independent read-only verification with external ACS gap

---

## 1. Executive Summary

Phase 5 closes the Tenant Admin invitation activation gap: validate + set-password APIs, atomic consume/activate, replay + concurrent-accept protection, canonical `/tenant-admin/setup/{token}` email URLs, Production HTTPS + ACS fail-fast config, Flutter alignment, and Platform Admin copy fix.

**Verdict:**

```text
READY FOR VERIFICATION WITH EXTERNAL ACS GAP
```

Code is ready. Production ACS mailbox/domain/secret injection remains external/operational.

---

## 2. Branch / Commit Validation

| Repo | Branch | Commit | Base main |
| --- | --- | --- | --- |
| Backend | `feature/flow4-phase5-production-invitation` | `6fd24b8` | `b8ac165` |
| Flutter | `feature/flow4-phase5-production-invitation` | `3945119` | `8db5f74` |
| Platform Admin | `feature/flow4-phase5-production-invitation` | `18e7851` | `9e13169` |
| Second Brain | `docs/flow4-phase5-implementation-tracking` | (this commit) | `2c14547` |

Dirty Flutter main tree was not used.

---

## 3. Frozen Phase 5 Decisions

| ID | Decision |
| --- | --- |
| D1 | `UserInvite.InviteTokenHash` sole accept authority |
| D2 | Canonical route `/tenant-admin/setup/{token}` |
| D3 | APIs match Flutter: `GET .../setup-token/{token}/validate`, `POST .../setup-password` |
| D4 | INVITED→ACTIVE and PENDING/SENT→ACCEPTED only on successful accept |
| D5 | Email failure does not roll back tenant (outbox) |
| D6 | Production HTTPS base URL required |
| D7 | Production ACS required (no silent fake) |

---

## 4. Invitation Entity / DB Decision

Existing `user_invites` columns sufficient (`InviteTokenHash`, `ExpiresAt`, `AcceptedAt`, `InviteStatus`, tenant/email uniqueness filter on PENDING/SENT).

```text
MIGRATION: NOT REQUIRED
```

Concurrency via PostgreSQL `SELECT ... FOR UPDATE` inside accept transaction.

---

## 5. Validate Invitation API

```text
GET /api/tenant-admin/onboarding/setup-token/{token}/validate
AllowAnonymous + AuthLogin rate limit
```

Returns flat JSON: `setupToken`, `valid`, `expired`, `email`, `message`.

---

## 6. Accept / Set Password API

```text
POST /api/tenant-admin/onboarding/setup-password
body: { setupToken, password, confirmPassword }
```

Atomic: validate → password policy → claim row → activate user → MarkAccepted → cancel sibling opens → save.

---

## 7. Password Security

Reuses `IPlatformPasswordPolicyValidator` + `IPasswordHashService` (PBKDF2). No plaintext persistence/logging.

---

## 8. Atomic Activation

`TenantUser.ActivateFromInvitation` + `UserInvite.MarkAccepted` in one DB transaction. Failure rolls back tracked changes.

---

## 9. One-Time Consume

Replay after accept returns `INVITE_USED`. Covered by unit + PostgreSQL integration tests.

---

## 10. Concurrent Accept Protection

`FOR UPDATE` on `user_invites` by token hash. Integration test: 2 parallel accepts → exactly 1 success.

---

## 11. Expiry

`ExpiresAt <= UtcNow` rejects validate and accept (`INVITE_EXPIRED`).

---

## 12. Resend Behaviour

Existing resend retained. Now rejects when no INVITED user / operation already ACCEPTED. Worker still cancels PENDING/SENT and issues new hash+expiry.

---

## 13. Invitation URL Alignment

Worker builds:

```text
{TenantAdminAppBaseUrl}/tenant-admin/setup/{rawToken}
```

Legacy `/setup-account?token=` removed from production path.

---

## 14. Production HTTPS Enforcement

`TenantOnboardingOutboxOptionsValidator` + `TenantAdminInvitationUrlBuilder.TryValidateBaseUrl` — Production requires absolute HTTPS non-localhost URL (`ValidateOnStart`).

---

## 15. ACS Configuration

`ProductionAzureCommunicationEmailOptionsValidator` requires ConnectionString/Endpoint + SenderAddress in Production. Dev may remain unconfigured (delivery fails retryable via outbox).

---

## 16. Email Failure / Outbox Behaviour

Unchanged architecture: DB commit → outbox → worker → ACS. Failure → retryable + resend.

---

## 17. Token Logging Protection

Logs invite/tenant/user IDs only. No raw token / full URL with token.

---

## 18. Tenant / Subscription State Validation

Accept/validate require tenant status `active`. Non-operational → `TENANT_NOT_OPERATIONAL`.

---

## 19. First Login

Existing `POST /api/v1/tenant-auth/login` requires ACTIVE + real password. After accept, login path is unchanged and usable.

Integration proves password verify after accept. Full JWT login E2E through HTTP host not added (service-level activate+verify covered).

---

## 20. Tenant Context

No Phase 5 changes. Context endpoints remain as Phases 1–4.

---

## 21. Tenant Admin Flutter Changes

- Encode setup token in validate URL
- Map backend error codes on set-password
- Align password policy with backend (upper/lower/digit, 8–128)
- Route already `/tenant-admin/setup/:setupToken` (public)

---

## 22. Cashier Status

```text
NO CHANGE
```

---

## 23. Platform Admin Changes

Wizard copy updated: invitation emailed via ACS after activation; resend available.

---

## 24. Migration

```text
NOT REQUIRED
```

---

## 25. E2E Journey

PostgreSQL integration suite:

```text
Seed INVITED + SENT invite
→ set hash via test seam
→ validate
→ accept
→ ACTIVE + ACCEPTED
→ replay fails
→ concurrent accept = 1
→ tenant isolation
→ expired reject
```

Plus outbox invitation URL assertion for canonical path.

---

## 26. Backend Tests

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Unit `~TenantAuth` (Phase 5) | 29 | 0 | 0 |
| Integration invitation + outbox | 12 | 0 | 0 |
| Unit Phase 1–4 related filters | 39 (+30 +9 defaults) | 0 | 0 |
| Integration `TenantFinalizeDefaultSettings` | 7 | 0 | 0 |

---

## 27. Flutter Tests

| Suite | Passed | Failed | Blocked |
| --- | ---: | ---: | ---: |
| `invitation_setup_dto_test.dart` | 2 | 0 | 0 |
| `dart/flutter analyze lib/features/auth` | clean | 0 | — |
| `flutter pub get` | deps resolved | — | known Windows symlink warning (non-source) |

---

## 28. Platform Admin Tests

Copy-only change. Package install/build not re-run for single string edit (no logic change).

---

## 29. Phase 1–4 Regression

Default settings unit/integration + entitlement/limit-related unit filters green on Phase 5 branch.

---

## 30. Production ACS External Evidence

```text
CODE READY — EXTERNAL ACS VALIDATION PENDING
```

No production mailbox/domain/secret proof in this implementation task.

---

## 31. Known Gaps

### Blocking (for production DoD, not for verification start)

- External ACS verified sender/domain
- Production `TenantAdminAppBaseUrl` HTTPS host evidence

### Non-blocking

- Staff invite unhashed Guid path still separate (deferred)
- Dedicated revoke API/UI deferred
- Richer invitation audit event catalog optional

### External/operational

- ACS secrets injection
- DNS/HTTPS frontend host

### Deferred

- UserSetupToken productization
- Cashier invitation
- Auto-login after setup
- Copy invite link UI

---

## 32. Final Verdict

```text
READY FOR VERIFICATION WITH EXTERNAL ACS GAP
```

```text
PHASE 5 READY FOR VERIFICATION WITH EXTERNAL ACS GAP
```

```text
Phase 6 Status: NOT STARTED
```

**Next action:** Independent Phase 5 read-only verification audit.
