<!-- title: OneVerz Phase 3 Closure Fix — Plan Fallback and PostgreSQL Concurrency -->
<!-- status: Implementation Report -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# ONEVERZ Phase 3 Closure Fix — Plan Fallback and PostgreSQL Concurrency

**Date:** 2026-08-06  
**Scope:** F-P3-01 (effective-limit plan fallback) + F-P3-02 (PostgreSQL advisory-lock concurrency proof)  
**Phase 4:** Not started

---

## 1. Executive Summary

Phase 3 closure blockers from the read-only verification audit are corrected:

| Finding | Fix |
|---|---|
| **F-P3-01** | Null `Max*Override` no longer means unlimited. Resolver falls back to plan `Max*` + active add-on increments. Plan `Max*` null remains the approved unlimited representation. |
| **F-P3-02** | Real PostgreSQL concurrency integration tests prove `pg_advisory_xact_lock` serializes final-slot outlet creates: one success, one `subscription_limit_reached`, final usage = limit. |

**Final hierarchy:**

```text
Effective limit =
  valid Max*Override.HasValue
  ? override
  : plan Max* + active add-on increments

Plan Max* null → unlimited
Null Max*Override → no override (plan fallback)
Missing active subscription / invalid negative → fail closed
```

**Verdict:** **READY FOR PHASE 3 RE-VERIFICATION**

---

## 2. Repository and Branch Validation

| Repo | Path | Branch | Commit (start of closure) | Notes |
|---|---|---|---|---|
| Backend | `Nytroz POS - Backend New\Unified-Commerce` | `feature/flow4-phase3-runtime-plan-limits` | `313fdd6a00aba689c881b5ae3a31bfcce9e1926a` | Closure changes uncommitted on this branch; unrelated Phase 1–3 WIP preserved |
| Platform Admin | `nytroz-pos-platform-admin` | `feature/flow4-phase3-plan-limit-alignment` | (no code change) | Uses plan+addon display; no contract break |
| Flutter | `Nytroz-POS-App` | `feature/flow4-phase3-runtime-plan-limits` | (no code change) | Maps `subscription_limit_reached` from backend fields |
| Second Brain | `Pos-system-Knowledge` | `docs/flow4-phase3-implementation-tracking` | `ca327f1b41668b20d8bcdaedc78ddc400bd8cd3d` | This report + roadmap update |

No work on `main`. No commit/push/merge performed.

---

## 3. Previous Resolver Behaviour

Verification audit F-P3-01:

- `ReadTenantOverride` treated any override field read as `Configured = true`
- `Max*Override = null` → `Limit = null` → **unlimited**
- Plan fallback branch was effectively dead
- Legacy tenant create writes `max*Override: null` → accidental unlimited capacity for finite plans

---

## 4. Corrected Effective-Limit Behaviour

| Plan | Override | Add-On | Effective Result |
| ---: | -------: | -----: | ---------------: |
| 3 | null | none | **3** (plan fallback) |
| 3 | 5 | none | **5** (override) |
| 3 | 0 | none | **0** (explicit block) |
| null | null | none | **Unlimited** |
| 3 | null | +2 active | **5** |
| 3 | null | expired +10 | **3** (ignored) |
| 3 | -1 | none | **Configuration failure** |
| (no subscription) | — | — | **Configuration failure** |

---

## 5. Unlimited Representation

**Approved representation:** plan column `MaxOutlets` / `MaxTills` / `MaxUsers` is **null**.

| Meaning | Representation |
|---|---|
| No tenant override | `Max*Override = null` |
| Explicit finite override | `Max*Override = n` (including 0) |
| Explicit unlimited | Plan `Max* = null` and no finite override |

**No migration required.** Schema cannot express “unlimited override” distinct from “no override”; unlimited comes only from the plan baseline. Documented in resolver comments.

---

## 6. Legacy Tenant Creation Alignment

Legacy `CreateTenantInternalAsync` still writes:

```text
maxOutletsOverride: null
maxTillsOverride: null
maxUsersOverride: null
```

This is now **correct**: null means no override → plan fallback.

Wizard finalize still stores `requested ?? computed` into override fields (finite snapshot). That remains valid: `HasValue` → override path. Wizard and legacy tenants with the same plan now resolve the same finite capacity when wizard does not raise overrides above plan.

Regression test: `OutletCreate_LegacyNullOverride_AtPlanLimit_IsDenied`.

---

## 7. Existing Tenant Compatibility

Existing tenants with finite plan + null override change from accidental unlimited → finite plan enforcement.

Policy applied:

- No automatic deletion/deactivation of existing resources
- Only capacity-increasing creates are blocked when usage ≥ limit
- Reads/edits/capacity-reducing operations remain available
- A finite override can restore additional capacity

Production impact: tenants previously over their plan may continue operating existing resources but cannot create more until upgrade/override.

---

## 8. Resolver and Guard Changes

### Resolver (`TenantSubscriptionLimitResolver`)

- `Configured` / override applied only when `Max*Override.HasValue`
- Plan fallback + active add-on sum (`Status == ACTIVE`, `StartsAt <= now`, `EndsAt` null or future)
- Injected `IDateTimeProvider` for add-on window evaluation
- Structured logs: override applied, plan fallback, unlimited plan, add-on applied, missing config, evaluation failure

### Guard (`TenantResourceLimitGuard`)

- Unchanged lock design: `pg_advisory_xact_lock(hash(tenantId:N + limitKey))` inside the same transaction as count + create
- Debug log on advisory lock acquisition
- Till and User paths share the same guard component (Outlet PostgreSQL proof covers the lock mechanism)

### Provisioning

- No forced copy of plan values into override columns for legacy create
- No schema migration

---

## 9. PostgreSQL Advisory Lock Test Design

| Item | Detail |
|---|---|
| Mechanism | Disposable PostgreSQL database (`CREATE DATABASE` + EF `EnsureCreated`) — avoids shared-dev schema drift |
| Connection base | `Host=localhost;Port=5432;Username=postgres;Password=admin` (same local pattern as ManualPayment PG tests) |
| Soft-skip | If PostgreSQL unavailable, test returns early (must not claim proof) |
| Transaction scope | Guard begins transaction → advisory lock → evaluate → insert → commit |
| Synchronization | `Barrier(2)` before concurrent `OutletService.CreateAsync` |
| Connections | Separate `EPosDbContext` / service instances per request |
| Expected | Success=1, `subscription_limit_reached`=1, final non-deleted outlets=3 |
| Actual (this session) | **Both PG tests passed** against Npgsql |

Tests:

1. `ConcurrentOutletCreate_FinalSlot_AllowsExactlyOne_OnPostgreSql`
2. `ConcurrentOutletCreate_DifferentTenants_DoNotBlockEachOther_OnPostgreSql`

Assertions include `Database.IsNpgsql()` / provider name contains `Npgsql`.

---

## 10. Files Modified

### Backend

- `src/E_POS.Infrastructure/Modules/Platform/Subscription/Services/TenantSubscriptionLimitResolver.cs`
- `src/E_POS.Infrastructure/Modules/Platform/Subscription/Services/TenantResourceLimitGuard.cs`

### Database / migration

- None

### Platform Admin

- None (verified; wizard already computes plan+addon display)

### Flutter

- None (verified; client uses backend `subscription_limit_reached` fields)

### Tests

- `tests/E_POS.IntegrationTests/SubscriptionBilling/TenantResourceLimitEnforcementTests.cs`
- `tests/E_POS.IntegrationTests/SubscriptionBilling/TenantResourceLimitPostgreSqlConcurrencyTests.cs` (**new**)

### Second Brain tracking

- This report
- `15_IMPLEMENTATION_TRACKING/FLOW_4_SUPER_ADMIN_IMPLEMENTATION_TRACEABILITY_AND_ROADMAP_2026-08-06.md`

---

## 11. Tests Added or Updated

### Updated / added InMemory coverage

- Null override → finite plan
- Null override + unlimited plan → unlimited
- Null override at plan limit → deny create
- Create-options capacity with plan fallback
- Invalid negative override → fail
- Zero override → explicit block
- Active add-on increments plan baseline
- Expired add-on ignored
- Legacy null-override at plan limit deny

### PostgreSQL

- Concurrent final slot (mandatory)
- Different tenants do not block each other

---

## 12. Commands Executed and Results

Working directory: `Nytroz POS - Backend New\Unified-Commerce`

| Command | Provider | Exit | Result |
|---|---|---|---|
| `dotnet build tests/E_POS.IntegrationTests/E_POS.IntegrationTests.csproj` | n/a | 0 | Succeeded |
| `dotnet test ... --filter FullyQualifiedName~TenantResourceLimitPostgreSql` | **Npgsql / PostgreSQL** | 0 | **2 passed** |
| `dotnet test ... --filter FullyQualifiedName~TenantResourceLimit\|...Entitlement\|...Bootstrap\|...StrategyB\|...OutletCrud` | InMemory + Npgsql | 0 | **54 passed** |
| `dotnet test tests/E_POS.UnitTests/... --filter ...Limit\|FeatureCodes\|Bootstrap\|OutletService\|TillService\|TenantAdminUserService` | n/a | 0 | **80 passed** |

---

## 13. Phase 1 and Phase 2 Regression Results

- Phase 1 entitlement evaluator + Strategy B projection + outlet entitlement gates: **passed** (included in 54 IT filter)
- Phase 2 bootstrap permission catalog unit + projection IT: **passed**
- Outlet create without entitlement still fails closed before capacity is consumed

---

## 14. Product and Device Limit Status

- `max_products` / `max_devices` remain **blocked** (`RuntimeEnforcementStatus` not enforced; catalog unit test still asserts blocked)
- No product/device counting, seeds, or UI work in this closure

---

## 15. Known Gaps

### Blocking

- None for F-P3-01 / F-P3-02 after this closure (subject to independent re-verification)

### Non-blocking

- Shared local `UnifiedCommerceDb` schema drift vs current EF model — disposable DB used for concurrency proof
- Flutter SDK not on PATH — no Flutter code change required; runtime re-check deferred
- Explicit “unlimited override” cannot be stored distinctly from null (by design / schema v1)

### Deferred

- Product/device limits (Phase later)
- Phase 4 default tenant settings
- Dedicated override history tables beyond current columns

---

## 16. Final Verdict Checklist

1. Does null override now fall back to the plan? **Yes**
2. Does finite plan capacity remain finite? **Yes**
3. Is explicit unlimited distinguishable? **Yes** (plan `Max*` null)
4. Do missing plan limits / missing subscription fail safely? **Yes** (subscription/plan missing → configuration failure; plan null = unlimited by approved sentinel)
5. Are add-ons applied correctly where supported? **Yes** (active + date window)
6. Are legacy-created tenants aligned? **Yes**
7. Are existing null-override tenants handled safely? **Yes** (enforce future creates only)
8. Did the PostgreSQL concurrency test execute? **Yes**
9. Did exactly one final-slot request succeed? **Yes**
10. Did one request receive `subscription_limit_reached`? **Yes**
11. Did final usage equal the limit? **Yes** (3)
12. Is the advisory lock inside the correct transaction? **Yes**
13. Is tenant isolation preserved? **Yes** (dedicated PG test)
14. Are Phase 1 regressions passing? **Yes**
15. Are Phase 2 regressions passing? **Yes**
16. Is Phase 3 ready for read-only re-verification? **Yes**

```text
READY FOR PHASE 3 RE-VERIFICATION
```

Phase 3 remains **open** until independent re-verification closes it. Phase 4 must not begin until Phase 3 is verified closed.
