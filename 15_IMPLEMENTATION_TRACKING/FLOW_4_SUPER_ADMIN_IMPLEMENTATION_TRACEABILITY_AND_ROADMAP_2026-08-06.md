<!-- title: Flow 4 Super Admin Implementation Traceability and Roadmap -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Flow 4 Super Admin Implementation Traceability and Roadmap

## Purpose

This document is the implementation bridge from canonical policy to code tasks for Super Admin tenant creation foundation.

## Canonical Inputs

- [[../03_USER_JOURNEYS/Platform_Admin/ONEVERZ_SUPER_ADMIN_TENANT_CREATION_OPERATING_MODEL_CANONICAL]]
- [[../03_USER_JOURNEYS/Platform_Admin/FLOW_4_CREATE_TENANT_WIZARD_CANONICAL_SPEC]]
- [[../05_BACKEND_ARCHITECTURE/FLOW_4_SUBSCRIPTION_ENTITLEMENT_LIMIT_POLICY_CANONICAL]]
- [[../05_BACKEND_ARCHITECTURE/FLOW_4_TENANT_PROVISIONING_TECHNICAL_CONTRACT_CANONICAL]]
- [[../05_BACKEND_ARCHITECTURE/FLOW_4_PAYMENT_ACTIVATION_INVITATION_LIFECYCLE_CANONICAL]]
- [[99_AUDITS/ONEVERZ_SUPER_ADMIN_TENANT_CREATION_FOUNDATION_AUDIT_2026-08-06]]

## 1) Cross-Layer Implementation Traceability Matrix

Status values:

- Implemented
- Mostly implemented
- Partial
- Documented only
- Missing
- Contradictory
- Unverified
- Blocked

| Requirement | Second Brain source | Platform Admin FE | Backend | Database | Tests | Current status | Target status |
|---|---|---|---|---|---|---|---|
| Canonical module keys | Entitlement/limit policy canonical | Dynamic catalog + `feature-keys.ts` canonical outlet helpers | `PlatformTenantFeatureCodes` registry | Seed records | Present | Implemented | Implemented |
| Outlet key migration | Entitlement/limit policy canonical | Canonical `outlet_management` + legacy normalize helper | Canonical key + Strategy B legacy read | `outlet_management` in seed | Present | Implemented | Implemented |
| Fail-closed entitlement | Entitlement/limit policy canonical | `AccessControlService.hasFeature` fail-closed + canonical normalize | `ITenantFeatureEntitlementEvaluator` fail-closed | Entitlement rows exist | Present | Implemented | Implemented |
| Plan feature configuration | Flow 4 + plan APIs | Implemented | Implemented | Implemented | Present | Implemented | Implemented |
| Plan limit configuration | Entitlement/limit policy | Implemented for core limits | Stored core limits | Limit defs + counters | Partial | Mostly implemented | Implemented |
| Tenant finalization | Flow 4 canonical | Implemented | Implemented | Implemented | Present | Mostly implemented | Implemented |
| Entitlement generation | Flow 4 + provisioning contract | Implemented | Implemented | Implemented | Present | Mostly implemented | Implemented |
| Limit generation | Flow 4 + provisioning contract | Implemented display | Stored/seeded | Stored | Partial | Mostly implemented | Implemented |
| Bootstrap admin | Provisioning contract | Implemented | Implemented | Implemented | Present | Mostly implemented | Implemented |
| Bootstrap permission scoping | Provisioning contract | Not explicit | Fixed list only | Permission catalog exists | Missing | Partial | Implemented |
| Default tenant settings | Provisioning contract | Not explicit | Not fully provisioned | Schema present | Missing | Partial | Implemented |
| Runtime outlet limit | Entitlement/limit policy | Not enforced UI+API | Missing guard | Counters present | Missing | Missing | Implemented |
| Runtime till limit | Entitlement/limit policy | Not enforced UI+API | Missing guard | Counters present | Missing | Missing | Implemented |
| Runtime user limit | Entitlement/limit policy | Not enforced UI+API | Missing guard | Counters present | Missing | Missing | Implemented |
| Runtime product limit | Entitlement/limit policy | Missing | Missing | Missing/incomplete | Missing | Missing | Implemented |
| Tenant override model | Entitlement/limit + provisioning contract | Partial | Partial | Partial | Partial | Partial | Implemented |
| Manual payment flow | Payment lifecycle canonical | Implemented | Implemented | Implemented | Present | Mostly implemented | Implemented |
| Pending activation | Payment lifecycle canonical | Implemented | Implemented | Implemented | Present | Implemented | Implemented |
| Activation guard | Payment lifecycle canonical | Implemented | Implemented | Implemented | Present | Mostly implemented | Implemented |
| Invitation flow | Payment lifecycle canonical | Partial messaging drift | Mostly implemented | Implemented | Partial | Partial | Implemented |
| ACS production email | Payment lifecycle canonical | N/A | External closure pending | N/A | Unverified external | Blocked | Implemented |
| HTTPS invitation URL | Payment lifecycle canonical | N/A | Host closure pending | N/A | Unverified external | Blocked | Implemented |
| Audit logging coverage | Provisioning contract | Partial visibility | Mostly implemented + entitlement denial logs | Implemented | Partial | Mostly implemented | Implemented |
| Integration tests | Test scenarios below | Partial E2E | Phase 1 evaluator/outlet tests added | Partial | Partial | Partial | Implemented |

## Phase 1 implementation note (2026-08-06)

Phase 1 code landed:

- Backend registry: `PlatformTenantFeatureCodes`
- Fail-closed evaluator: `ITenantFeatureEntitlementEvaluator` / `TenantFeatureEntitlementEvaluator`
- Outlet runtime gate uses canonical `outlet_management`; legacy `tenant_admin.outlets` is Strategy B read-only compatibility
- Platform Admin: `feature-keys.ts` + `AccessControlService` fail-closed normalize
- Flutter: canonical outlet key + removed permission fallback in `TenantAdminAccessChecker.canAccessFeature`
- Evidence report: `99_AUDITS/ONEVERZ_PHASE_1_CANONICAL_FEATURE_KEYS_FAIL_CLOSED_ENTITLEMENTS_IMPLEMENTATION_REPORT_2026-08-06.md`

### Phase 1 closure (official) — 2026-08-06

Independent re-verification returned:

```text
VERIFIED WITH NON-BLOCKING GAPS — PHASE 1 CLOSED
```

Evidence: `99_AUDITS/ONEVERZ_PHASE_1_CLOSURE_REVERIFICATION_AUDIT_2026-08-06.md`

| Suite | Result |
|---|---|
| Backend unit (`PlatformTenantFeatureCodesTests` + `OutletServiceTests`) | **37 passed** |
| Backend integration (evaluator + outlet CRUD + tenant context Strategy B) | **35 passed** |
| Angular feature-keys | **6 passed** |
| Flutter runtime | Pending (SDK not on PATH) — **non-blocking** |

Phase 1 is **officially closed**. Phase 2 (Bootstrap Tenant Admin entitlement-scoped permissions) is **authorized to begin**.

### Phase 2 implementation note (2026-08-06)

Bootstrap Tenant Admin permissions are no longer a fixed 10-code list. Finalization now:

1. Resolves effective feature codes from plan/selection
2. Builds grants via `TenantAdminBootstrapPermissionCatalog.Resolve`
3. Looks up active `permission_definitions` by code
4. Assigns only base + entitlement-mapped tenant permissions to `TENANT_ADMIN`

Evidence: `99_AUDITS/ONEVERZ_PHASE_2_BOOTSTRAP_TENANT_ADMIN_ENTITLEMENT_SCOPED_PERMISSIONS_IMPLEMENTATION_REPORT_2026-08-06.md`

Test evidence (this session):

- Unit (catalog + wizard + Phase 1 regression filter): **65 passed**
- Integration (bootstrap projection + Phase 1 filter): **39 passed**
- Flutter runtime: still pending (SDK not on PATH)

### Phase 2 closure (official) — 2026-08-06

Independent verification returned:

```text
VERIFIED WITH NON-BLOCKING GAPS — PHASE 2 CLOSED
```

Evidence: `99_AUDITS/ONEVERZ_PHASE_2_BOOTSTRAP_TENANT_ADMIN_PERMISSIONS_VERIFICATION_AUDIT_2026-08-06.md`

| Suite | Result |
|---|---|
| Backend unit (catalog + wizard + Phase 1 regression filter) | **65 passed** |
| Backend integration (bootstrap projection + Phase 1 filter) | **39 passed** |
| Flutter runtime | Pending (SDK not on PATH) — **non-blocking** |
| Existing-tenant Bootstrap role repair | **Deferred** (documented risk; entitlement gates remain) |

Phase 2 is **officially closed**. Phase 3 (runtime subscription plan-limit enforcement) is **authorized to begin**.

### Phase 1 closure fix note (historical)

Closure fix addressed F-01/F-02/F-03 before re-verification. See `ONEVERZ_PHASE_1_CLOSURE_FIX_IMPLEMENTATION_REPORT_2026-08-06.md`.

## 2) Required Test Scenarios (Canonical Acceptance Set)

### Scenario 1 — Standard POS Tenant

- POS enabled
- Products enabled
- Outlet limit 1
- Till limit 2
- User limit 5
- Online store disabled
- Verify complete provisioning

### Scenario 2 — Online-Only Tenant

- Online Store enabled
- Products enabled
- Orders enabled
- POS disabled
- Till Management disabled
- Verify no POS permissions for bootstrap tenant admin

### Scenario 3 — Unified Commerce Tenant

- POS + Products + Inventory + Online Store + Click & Collect
- Multiple outlets
- Verify dependency checks and permission scoping

### Scenario 4 — Outlet Feature-Key Migration

- Verify deprecated key maps to canonical key
- Unknown keys fail closed

### Scenario 5 — Bootstrap Permission Scoping

For POS-only tenant admin verify no:

- Inventory permissions
- Online store permissions
- Hardware permissions
- Platform admin permissions

### Scenario 6 — Outlet Limit Reached

- Plan limit 3
- 4th create attempt denied consistently FE + BE

### Scenario 7 — Tenant Limit Override

- Base plan limit 3
- Tenant override 5
- Only that tenant can create 5

### Scenario 8 — Finalization Failure

- Simulate subscription/entitlement failure
- Verify rollback or explicit recoverable state

### Scenario 9 — Invitation Failure

- Provision succeeds, email fails
- Verify failure state + resend path

### Scenario 10 — Activation Guard

- Activation before required payment is blocked

### Scenario 11 — Missing Default Setting

- Required default unresolved
- Finalization fails or enters explicit recoverable state

### Scenario 12 — Direct API Access

- Tenant calls module API without entitlement
- Backend denies even if permission exists

## 3) Prioritized Implementation Roadmap

### Phase 0 — Documentation Foundation

| Task | Priority | Dependency | Second Brain doc | Existing FE file to inspect | Existing BE file to inspect | DB area | Tests required | Definition of done |
|---|---|---|---|---|---|---|---|---|
| Approve canonical keys and policies | P0 | None | Canonical A-D docs | `platform-create-tenant-page.ts` | `PlatformTenantService.Wizard.cs` | module/feature catalog | Policy review tests | Team sign-off recorded |

### Phase 1 — Canonical Keys and Fail-Closed Entitlements

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| Resolve outlet key mismatch with compatibility | P0 | Phase 0 | Entitlement/limit policy | feature guards | `OutletConstants.cs`, `OutletRepository.cs`, `TenantFeatureEntitlementEvaluator.cs` | platform features/entitlements | unit+integration | **Closed** — re-verification 2026-08-06 |
| Fail closed for unknown/missing entitlement | P0 | Above | Entitlement/limit policy | `AccessControlService`, Flutter `TenantAdminAccessChecker` | `ITenantFeatureEntitlementEvaluator`, `OutletService.ValidateOutletAccessAsync`, `TenantAdminContextRepository` | entitlement records | API/service + projection tests | **Closed** — VERIFIED WITH NON-BLOCKING GAPS |

### Phase 2 — Bootstrap Permission Scoping

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| Feature-to-permission mapping and scoped bootstrap grants | P0 | Phase 1 | Provisioning contract | (no wizard redesign) | `TenantAdminBootstrapPermissionCatalog.cs`, `PlatformTenantService.Wizard.CreateTenantInternalAsync`, `GetActivePermissionIdMapByCodesAsync` | permission_definitions + tenant_role_permissions | catalog unit + projection integration + wizard regression | **Closed** — VERIFIED WITH NON-BLOCKING GAPS (2026-08-06) |

### Phase 3 — Runtime Limit Enforcement

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| Effective-limit service + runtime guards (outlet/till/user; product/device blocked) | P0 | Phase 2 closed | Entitlement/limit policy | create-options capacity; Flutter outlet limit error | `TenantSubscriptionLimitKeys`, `ITenantSubscriptionLimitResolver`, `ITenantResourceLimitGuard`, Outlet/Till/User create paths | usage counters + Max*Override | limit unit + `TenantResourceLimitEnforcementTests` + PG concurrency + Phase 1/2 regression | **Closure fix landed — READY FOR PHASE 3 RE-VERIFICATION** (not closed) |

### Phase 3 implementation note (2026-08-06)

Runtime enforcement added for `max_outlets`, `max_tills`, `max_users` using:

- Effective limit = `TenantSubscription.Max*Override` when set; otherwise plan `Max*` + active add-on increments (plan `Max*` null = unlimited)
- Live usage counts (non-deleted outlets/tills; ACTIVE+INVITED users)
- PostgreSQL `pg_advisory_xact_lock` per tenant+limit key around check+create
- Error code `subscription_limit_reached` (HTTP 409)

Product/hardware limits remain **blocked** pending canonical counting definitions (no seeded keys).

Evidence: `99_AUDITS/ONEVERZ_PHASE_3_RUNTIME_SUBSCRIPTION_PLAN_LIMIT_ENFORCEMENT_IMPLEMENTATION_REPORT_2026-08-06.md`

Test evidence (initial implementation session):

- Unit (limit catalog + outlet/till/user + Phase 1/2 filters): **72 passed**
- Integration (limit enforcement + Phase 1/2 filters): **35 passed**
- Flutter runtime: still pending (SDK not on PATH)
- Phase 4 **not started**

### Phase 3 verification audit (2026-08-06) — closure blocked

Independent read-only verification returned:

```text
PARTIALLY VERIFIED — CLOSURE BLOCKED
```

Evidence: `99_AUDITS/ONEVERZ_PHASE_3_RUNTIME_SUBSCRIPTION_PLAN_LIMIT_ENFORCEMENT_VERIFICATION_AUDIT_2026-08-06.md`

Blocking findings:

- **F-P3-01 (High):** Null `Max*Override` incorrectly treated as unlimited; plan fallback dead
- **F-P3-02 (High):** Advisory lock not proven against PostgreSQL (InMemory only)

Phase 4 remained unauthorized.

### Phase 3 closure fix (2026-08-06) — ready for re-verification

Closure implementation corrected F-P3-01 and F-P3-02 only:

- Null override → plan/add-on fallback; plan null → unlimited; missing subscription → fail closed
- Legacy null-override tenants align with wizard finite-plan enforcement
- PostgreSQL disposable-DB concurrency tests: final slot allows exactly one create; tenant isolation preserved
- Phase 1 / Phase 2 regressions re-run and passed

Evidence: `99_AUDITS/ONEVERZ_PHASE_3_CLOSURE_FIX_PLAN_FALLBACK_POSTGRES_CONCURRENCY_IMPLEMENTATION_REPORT_2026-08-06.md`

Closure-fix test evidence:

- Unit filter (limit/catalog/Phase 1–2 related): **80 passed**
- Integration filter (limits + entitlement + bootstrap + Strategy B + outlet CRUD + PG concurrency): **54 passed**
- PostgreSQL concurrency: **2 passed** (Npgsql; disposable `EnsureCreated` DB)
- Platform Admin / Flutter: **no code changes required**
- Phase 3 status: **open — READY FOR PHASE 3 RE-VERIFICATION** (not closed)
- Phase 4 **not started**

### Phase 4 — Default Tenant Settings

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| Transactional default settings provisioning | P1 | Phase 0 | Provisioning contract | settings summary | finalize orchestrator + settings provider | tenant settings + definitions | scenario 11 | no required setting null drift |

**Status (2026-08-07):**

```text
PHASE 4 VERIFIED
PHASE 4 CLOSED
```

Closure evidence:

- Verdict: `VERIFIED WITH NON-BLOCKING GAPS — PHASE 4 CLOSED`
- Backend audited implementation: `81c7296900fd7c1c1c0e321a0c0044def9f47a43`
- Backend merge on main: PR #73 → `b8ac165`
- Verification audit: `9316a95fa2a9c19b7b4af1528c8bea72bc85ef47` (merged via PR #38)
- Phase 4 unit: **35 passed**
- Phase 4 integration: **7 passed**
- Unit regression: **366 passed**
- Integration regression: **235 passed**
- Seed-only migration verified: `20260807120000_SeedPhase4DefaultTenantSettingDefinitions`
- Scenario 11 verified (pre-persist fail-closed)
- Idempotency / tenant isolation verified
- No Critical/High blockers
- Non-blocking gaps remain documented (locale DB nullability; thin dedicated tests; Online Store skip assert; deferred TA/Cashier UI, templates, sequences, backfill)
- Implementation report: `99_AUDITS/ONEVERZ_PHASE_4_DEFAULT_TENANT_SETTINGS_IMPLEMENTATION_REPORT_2026-08-07.md`
- Verification audit: `99_AUDITS/ONEVERZ_PHASE_4_DEFAULT_TENANT_SETTINGS_VERIFICATION_AUDIT_2026-08-07.md`
- Platform Admin / Flutter: **NO CHANGE**
- Phase 5: **authorized** — implementation delivered on feature branches; **READY FOR VERIFICATION WITH EXTERNAL ACS GAP** (not closed)

### Phase 5 — Production Invitation Closure

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| ACS verified sender + HTTPS host closure | P0 (production) | Phase 0 | Payment lifecycle canonical | invitation status copy | invitation/outbox services | invite + outbox records | scenario 9 + external proof | external run evidence approved |
| Validate + accept invitation APIs (hash authority) | P0 | Phase 4 closed | Phase 5 audit + plan | setup screens aligned | `TenantAdminOnboardingInvitationController` | `user_invites` (no DDL) | unit + PG concurrent accept | code ready @ Backend `6fd24b8` |
| Flutter setup contract alignment | P0 | Validate/accept APIs | Phase 5 plan | `/tenant-admin/setup/:token` | matching public APIs | n/a | DTO tests | Flutter `3945119` |
| Platform Admin invitation copy | P2 | ACS send path live | Phase 5 audit | create-tenant hint | n/a | n/a | copy-only | PA `18e7851` |

**Phase 5 implementation status (2026-08-07):**

```text
PHASE 5 READY FOR VERIFICATION WITH EXTERNAL ACS GAP
PHASE 5 NOT CLOSED
```

- Tracking: `ONEVERZ_PHASE_5_PRODUCTION_INVITATION_TRACKING_2026-08-07.md`
- Implementation report: `99_AUDITS/ONEVERZ_PHASE_5_PRODUCTION_INVITATION_IMPLEMENTATION_REPORT_2026-08-07.md`
- Migration: **NOT REQUIRED**
- Cashier: **NO CHANGE**
- External ACS production evidence: **PENDING**
- Next: independent read-only verification audit

### Phase 6 — End-to-End Pilot Validation

| Task | Priority | Dependency | SB doc | FE inspect | BE inspect | DB area | Tests | DoD |
|---|---|---|---|---|---|---|---|---|
| Full create→pay→activate→invite→login flow validation | P0 | Phases 1-5 | All canonical docs | wizard + billing + tenant detail | finalize/payment/activate/invite | all Flow 4 tables | scenarios 1-12 | pilot checklist signed |

## 4) Unresolved Decisions That Can Block Code

- Final canonical keys for some module surfaces where multiple codes currently exist
- Final product/hardware/storage/api usage limit keys for Release 1 commercial packaging
- Whether dedicated override tables are required in DB v1 or equivalent audited model is accepted

## 5) Readiness Statement

Documentation readiness for implementation start:

- P0 policy direction is now defined
- Core implementation ordering is explicit
- Remaining blockers are decision closures, not missing document structure
