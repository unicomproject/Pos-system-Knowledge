# OneVerz Phase 4 — Default Tenant Settings Verification Audit

**Date:** 2026-08-07  
**Auditor role:** Independent read-only verification  
**Backend audited:** `feature/flow4-phase4-default-tenant-settings` @ `81c7296900fd7c1c1c0e321a0c0044def9f47a43`  
**Second Brain docs base:** `docs/flow4-phase4-implementation-tracking` @ `65b7b5c`  
**Audit branch:** `audit/flow4-phase4-readonly-verification`  
**Roadmap status (unchanged by this audit):** `PHASE 4 READY FOR READ-ONLY VERIFICATION`

---

## 1. Executive Summary

Phase 4 correctly wires mandatory operational defaults into the Flow 4 wizard finalize path. Independent inspection of commit `81c7296` confirms:

- MVP `setting_definitions` are seed-only (no schema DDL).
- Currency / timezone / locale resolve `request → platform general.default_* → (currency) plan → fail closed`, then persist on tenant columns.
- Core `tenant_settings` (including `tax.pricing_mode = TAX_EXCLUSIVE`, receipt/numbering policies, notification/branding/security baselines) are built before any tenant write and inserted inside `CreateTenantWizardAsync`’s DB transaction.
- Inventory / Online Store settings are gated by effective feature codes (`inventory_tracking`, `online_store`); unknown features create no module rows.
- Scenario 11 fail-closed is proven as **pre-persist** failure (`CreateWizardCalled == false` / no tenant rows).
- Retry is idempotent; customized values are preserved; tenant isolation holds.
- Re-run of claimed suites: Phase 4 unit **35**, Phase 4 integration **7**, regression unit **366**, regression integration **235** — all passed.
- Platform Admin / Tenant Admin Flutter / Cashier: **NO CHANGE** remains valid for Phase 4 DoD.

Non-blocking gaps remain (extra entitlement-status unit cases, nullable DB locale column vs app guarantee, deferred Flutter consumption/backfill). No Critical or High blockers were found.

**Final verdict:**

```text
VERIFIED WITH NON-BLOCKING GAPS — PHASE 4 CLOSED
```

Phase 5 remains **NOT STARTED**. Roadmap was **not** updated by this audit.

---

## 2. Repository / Commit Validation

| Repository | Branch | Commit | Dirty? | Audit Target |
| --- | --- | --- | ---: | --- |
| Backend (`worktrees/backend-phase4`) | `feature/flow4-phase4-default-tenant-settings` | `81c7296900fd7c1c1c0e321a0c0044def9f47a43` | 0 | Exact claimed commit |
| Second Brain (docs) | `docs/flow4-phase4-implementation-tracking` | `65b7b5c33f65b72d189be4712f46008c09eaedf9` | N/A (base) | Implementation report + plan present |
| Second Brain (this audit) | `audit/flow4-phase4-readonly-verification` | (this report commit) | Clean before report | Verification report only |
| Platform Admin | `origin/main` inspect WT | `9e13169` (prior audit WT) | Read-only | NO CHANGE check |
| Flutter | `origin/main` inspect WT | `8db5f74` (prior audit WT) | Read-only | NO CHANGE check |

Commands recorded: `git rev-parse --show-toplevel`, `git branch --show-current`, `git rev-parse HEAD`, `git status`. No later commits on the backend feature branch beyond `81c7296`.

---

## 3. Claimed Implementation vs Actual Evidence

| Claim | Evidence | Match? |
| --- | --- | ---: |
| Provider on finalize path | `CreateTenantInternalAsync` calls `BuildAsync` before `Tenant.Create` and before `CreateTenantWizardAsync` | Yes |
| Same TX insert | `CreateTenantWizardAsync` begins TX; `TenantSettings.AddRange` before `SaveChanges`/`Commit` | Yes |
| TAX_EXCLUSIVE | Seed + catalog + provider validation allow-list | Yes |
| Entitlement gating | Seed `RequiredFeatureCode` + provider filter on `EffectiveFeatureKeys` | Yes |
| Seed-only migration | Migration SQL is INSERT … ON CONFLICT DO NOTHING; Down DELETE by keys | Yes |
| PA/Flutter no change | No Phase 4 branches/commits in those repos for this work | Yes |
| Test counts 35 / 7 / 366 / 235 | Independently re-executed; all green | Yes |

---

## 4. Migration Verification

**Migration:** `20260807120000_SeedPhase4DefaultTenantSettingDefinitions`

| Check | Result |
| --- | --- |
| Seed-only | Verified (INSERT into `setting_definitions` only) |
| CREATE/ALTER/DROP | None found in migration source |
| Destructive Up | No |
| ON CONFLICT | `ON CONFLICT (setting_key) DO NOTHING` |
| Down | Deletes only the 11 seeded keys |
| Tenant data rewrite | None |
| `dotnet ef migrations script` | Not executed (tooling/env limitation); migration C# inspected thoroughly |

**Migration verdict:** **PASS — seed-only, safe.**

---

## 5. Setting Definition Catalog

Canonical source: `TenantSettingKeys` + `TenantSettingDefinitionSeed` (Domain).

| Key | Category | Type | Mandatory? | Entitlement | Default | Verdict |
| --- | --- | --- | ---: | --- | --- | --- |
| `tax.pricing_mode` | Core | string | Yes | — | `"TAX_EXCLUSIVE"` | Verified |
| `locale.date_format` | Core | string | Yes | — | `"yyyy-MM-dd"` | Verified |
| `locale.time_format` | Core | string | Yes | — | `"HH:mm"` | Verified |
| `locale.number_format` | Core | string | Yes | — | seed `"en-LK"`; overlay resolved locale | Verified |
| `receipt.defaults` | Core | object | Yes | — | MVP policy JSON | Verified |
| `numbering.policies` | Core | object | Yes | — | ORD-/RCPT-/RET- policy | Verified |
| `notification.defaults` | Core | object | Yes | — | email on / sms off | Verified |
| `security.session_policy` | Core | object | Yes | — | idle 30m; not tenant-editable | Verified |
| `branding.placeholders` | Core | object | Yes | — | null logo/color | Verified |
| `inventory.stock_behaviour` | Module | object | When entitled | `inventory_tracking` | allowNegativeStock false | Verified |
| `online_store.defaults` | Module | object | When entitled | `online_store` | DRAFT / MATCH_TENANT | Verified |

No `tax_mode` / duplicate key variants in `src/`. Unique seed keys asserted in unit tests.

---

## 6. Currency / Timezone / Locale

| Value | Request | Platform Default | Plan Fallback | Missing Behaviour | Actual |
| --- | --- | --- | --- | --- | --- |
| Currency | Wins if present | `general.default_currency_code` | `plan.BaseCurrency` | `MissingPlatformGeneralDefaultException` | Verified |
| Timezone | Wins if present | `general.default_timezone` | None | Fail closed | Verified |
| Locale | Wins if present | `general.default_locale` | None | Fail closed | Verified |

Provider contains **no** hard-coded `LKR` / `Asia/Colombo` fallbacks. Context repository still has blank → LKR/en-LK/UTC fallbacks for **read** paths (pre-existing runtime soft fallback; new tenants should be non-null after finalize).

**Entity/EF:**

| Property | CLR | EF required |
| --- | --- | ---: |
| `BaseCurrencyCode` | `string` | Yes |
| `DefaultTimezone` | `string` | Yes |
| `DefaultLocale` | `string?` | **No** (`IsRequired(false)`) |

Application finalize path guarantees non-null locale; DB still allows null historically — documented distinction (non-blocking).

Platform Admin System Settings already edits `defaultCurrencyCode` / timezone / locale via `/platform-admin/settings` — defaults are configurable.

---

## 7. Core Tenant Settings

Provisioned always when ACTIVE definitions exist (9 core keys). Wired into write model `TenantSettings` and persisted in wizard TX. Integration asserts core count = `CoreKeys.Count` after persist.

---

## 8. Tax Default

- Definition default: `"TAX_EXCLUSIVE"`
- Provider validates string ∈ {`TAX_EXCLUSIVE`,`TAX_INCLUSIVE`}
- Unit catalog test asserts exclusive default
- No accidental inclusive default

**Verdict:** Verified.

---

## 9. Receipt / Numbering Policy

- `receipt.defaults` / `numbering.policies` are JSON policy objects only
- No `DocumentNumberSequence` / receipt template graph creation on provider or wizard path
- Seed comments and code match Decision 3

**Verdict:** Verified (MVP policy only).

---

## 10. Notification / Branding / Security Defaults

| Setting | Scope | Value | Safe Default? | Verdict |
| --- | --- | --- | ---: | --- |
| `notification.defaults` | Tenant | emailEnabled true, smsEnabled false | Yes | Verified |
| `branding.placeholders` | Tenant | null placeholders | Yes | Verified |
| `security.session_policy` | Tenant, not editable | idleTimeoutMinutes 30 | Yes | Verified |

No notification delivery infra or branding UI introduced.

---

## 11. Inventory Entitlement-Gated Defaults

Rule implemented: provision `inventory.stock_behaviour` iff `EffectiveFeatureKeys` contains `inventory_tracking`.

| Case | Coverage |
| --- | --- |
| Enabled | Unit + integration persist | Strong |
| Missing / unknown | Unit skip | Strong |
| Disabled / expired platform feature | Architecturally excluded by `ResolveActiveFeaturesAsync` (`Status == "ACTIVE"`) | Partially verified (no dedicated status unit) |

No second entitlement evaluator introduced.

---

## 12. Online Store Entitlement-Gated Defaults

Same pattern for `online_store` → `online_store.defaults`.

| Case | Coverage |
| --- | --- |
| Enabled | Unit | Strong |
| Not entitled | Unit + weak integration (result-only, no persist assert) | Partially verified |
| Unknown | Unit | Strong |

---

## 13. Finalization Transaction

Actual flow:

```text
validate / resolve plan & features
→ DefaultTenantSettingsProvider.BuildAsync  (read-only; fail closed)
→ Tenant.Create (resolved currency/tz/locale)
→ subscription / entitlements / bootstrap RBAC / billing graph
→ writeModel.TenantSettings = SettingsToInsert
→ CreateTenantWizardAsync (BeginTransaction → Tenants + TenantSettings + … → SaveChanges → Commit)
```

| Resource | Same Transaction? | Rollback Proven? |
| --- | ---: | ---: |
| Tenant | Yes (when write starts) | Pre-persist fail proven; mid-TX settings failure N/A (built before TX) |
| Subscription | Yes | Same |
| Entitlements | Yes | Same |
| Limits / counters | Onboarding path in TX | Not re-proven here; Phase 3 regression green |
| Bootstrap user/role/permissions | Yes | Same |
| Tenant settings | Yes | Persist + isolation tests |

**Key requirement met:** no successful partially initialized tenant when mandatory settings resolution fails (fails before `CreateTenantWizardAsync`).

---

## 14. Scenario 11

| Case | Evidence | Verdict |
| --- | --- | --- |
| Missing mandatory definition | Unit wizard: failure + `CreateWizardCalled==false`; Integration: Build throws + no tenant/settings rows | Verified |
| Missing platform currency | Unit + integration throw | Verified |
| Missing platform timezone | Unit throw | Verified |
| Missing platform locale | Code path identical to timezone; **dedicated unit test missing** | Partially verified |

Not merely mocked: integration uses real InMemory DbContext + repositories. Mid-transaction rollback of subscription after settings insert failure is unnecessary for current design (settings resolved before writes).

---

## 15. Idempotency

- Unique index `uq_tenant_settings_tenant_id_setting_definition_id`
- Provider skips existing definition IDs
- Integration: customized `TAX_INCLUSIVE` preserved; second `BuildAsync` returns empty insert list; count unchanged

**Verdict:** Verified.

---

## 16. Existing Tenant Compatibility

- Migration does not write `tenant_settings` for existing tenants
- No startup backfill in Application DI / hosted services for Phase 4
- Provider insert-if-missing only for the tenant being provisioned
- Bulk backfill: **Deferred** (not required to close Phase 4)

---

## 17. Tenant Isolation

Integration `TenantIsolation_SettingsDoNotLeakAcrossTenants` persists two tenants and asserts per-tenant counts / no cross-tenant leakage. Existing-definition lookup is tenant-scoped (`GetExistingSettingDefinitionIdsForTenantAsync`).

**Verdict:** Verified. Cross-tenant defect: none found.

---

## 18. Platform Admin Review

```text
NO CHANGE VERIFIED
```

System Settings page already configures platform general currency/timezone/locale used by the provider. Wizard already collects optional request overrides. No new PA payload required for MVP.

---

## 19. Tenant Admin Flutter Review

```text
NO CHANGE VERIFIED
```

Settings route remains a placeholder; new `tenant_settings` rows do not require Flutter changes for DoD. Future settings summary UI is deferred.

---

## 20. Cashier Flutter Review

```text
NO CHANGE VERIFIED
```

Phase 4 contract did not require Cashier consumption. Existing `formatLkr` / Colombo hard-codes are **deferred existing debt**, not a Phase 4 blocker.

---

## 21. Unit Test Verification

Independently executed claimed filter → **35 passed**.

| Area | Classification |
| --- | --- |
| Catalog uniqueness / core keys / TAX_EXCLUSIVE / JSON parse / feature gates | Covered and strong |
| Core provision + entitlement skip/create | Covered and strong |
| Missing currency / timezone / definition | Covered and strong |
| Retry preserve | Covered and strong |
| Number format locale overlay | Covered and strong |
| Missing locale dedicated test | Missing (code path covered) |
| Invalid default value exception | Missing |
| Disabled/expired entitlement status labels | Missing (ACTIVE filter mitigates) |
| Wizard Scenario 11 pre-persist | Covered and strong |

Claimed “35 Phase 4 unit tests” includes broader `PlatformTenantWizardServiceTests` suite (not only new Phase 4 Facts) — count matches filter; assertion quality of new Phase 4 Facts is adequate.

---

## 22. Integration Test Verification

Independently executed → **7 passed**.

| # | Test | Assessment |
| --- | --- | --- |
| 1 | Persist core settings | Strong count; weak key content |
| 2 | Inventory entitled persist | Strong |
| 3 | Online store not entitled | Weak (no DB assert) |
| 4 | Retry / customization | Strong |
| 5 | Scenario 11 missing definition | Strong pre-persist |
| 6 | Scenario 11 missing currency | Strong exception; weak emptiness asserts |
| 7 | Tenant isolation | Strong |

---

## 23. Phase 1–3 Regression Verification

| Filter | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Unit: PlatformAdministration\|Entitlement\|TenantSubscriptionLimit\|TenantResourceLimit\|Bootstrap | 366 | 0 | 0 |
| Integration: PlatformAdministration\|TenantResourceLimit\|OutletCrud\|TillCrud\|Entitlement | 235 | 0 | 0 |

No evidence Phase 4 weakened prior phases. PostgreSQL concurrency tests were included in the prior Phase 3 suite within these filters where present; this re-run used the same filters as the implementation report.

---

## 24. Commands and Results

| Group | Command | Passed | Failed | Skipped | Exit |
| --- | --- | ---: | ---: | ---: | ---: |
| Build | `dotnet build` | — | — | — | 0 |
| Phase 4 unit | filter catalog+provider+wizard | 35 | 0 | 0 | 0 |
| Phase 4 integration | `TenantFinalizeDefaultSettingsTests` | 7 | 0 | 0 | 0 |
| Unit regression | PlatformAdmin/entitlement/limits/bootstrap | 366 | 0 | 0 | 0 |
| Integration regression | PlatformAdmin/limits/outlet/till/entitlement | 235 | 0 | 0 | 0 |

---

## 25. Cross-Layer Verification Matrix

| Requirement | Backend | DB | Platform Admin | Tenant Admin Flutter | Cashier Flutter | Tests | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Currency provisioned | Verified | Verified (required col) | Verified (defaults UI) | N/A | N/A | Verified | Verified |
| Timezone provisioned | Verified | Verified | Verified | N/A | N/A | Verified | Verified |
| Locale provisioned | Verified | Partially (nullable col) | Verified | N/A | N/A | Partially | Partially verified |
| TAX_EXCLUSIVE | Verified | Verified seed | N/A | N/A | N/A | Verified | Verified |
| Receipt policy | Verified | Verified seed | N/A | N/A | N/A | Partially | Verified |
| Numbering policy | Verified | Verified seed | N/A | N/A | N/A | Partially | Verified |
| Notification defaults | Verified | Verified | N/A | N/A | N/A | Partially | Verified |
| Branding defaults | Verified | Verified | N/A | N/A | N/A | Partially | Verified |
| Security defaults | Verified | Verified | N/A | N/A | N/A | Partially | Verified |
| Inventory entitlement gating | Verified | N/A | N/A | N/A | N/A | Verified | Verified |
| Online Store entitlement gating | Verified | N/A | N/A | N/A | N/A | Partially | Verified |
| Fail-closed mandatory config | Verified | N/A | N/A | N/A | N/A | Verified | Verified |
| Transaction safety | Verified | Verified | N/A | N/A | N/A | Partially | Verified |
| Idempotency | Verified | Unique index | N/A | N/A | N/A | Verified | Verified |
| Tenant isolation | Verified | Tenant FK | N/A | N/A | N/A | Verified | Verified |
| Phase 1 regression | Verified | N/A | N/A | N/A | N/A | Verified | Verified |
| Phase 2 regression | Verified | N/A | N/A | N/A | N/A | Verified | Verified |
| Phase 3 regression | Verified | N/A | N/A | N/A | N/A | Verified | Verified |

---

## 26. Findings

### F-P4V-01 — `default_locale` remains nullable at DB while finalize guarantees non-null

1. **Finding ID:** F-P4V-01  
2. **Title:** Locale DB nullability weaker than business rule  
3. **Severity:** Medium  
4. **Layer:** DB / Domain mapping  
5. **Requirement:** Non-null locale after finalize  
6. **Actual:** EF `DefaultLocale` `IsRequired(false)`; CLR `string?`  
7. **Expected:** Business non-null after successful finalize (app-enforced)  
8. **Evidence:** `Tenant.cs`, `TenantConfiguration.cs`  
9. **File path:** Tenant foundation entity/config  
10. **Class/method:** `Tenant` / `TenantConfiguration`  
11. **Test evidence:** Wizard asserts locale on write model when provider succeeds  
12. **Tenant impact:** Legacy/null locales possible for old tenants; new finalize OK  
13. **Security/operational impact:** Low for new tenants  
14. **Recommended correction:** Optional future NOT NULL + backfill; not required to close Phase 4  
15. **Blocks Phase 4 closure:** No  
16. **Confidence:** High  

### F-P4V-02 — Gaps in dedicated unit coverage (locale missing, invalid JSON, disabled/expired labels)

1. **Finding ID:** F-P4V-02  
2. **Title:** Some Scenario 11 / entitlement-status unit cases absent  
3. **Severity:** Medium  
4. **Layer:** Tests  
5. **Requirement:** Explicit coverage matrix  
6. **Actual:** Missing locale / invalid value / disabled-expired labeled tests absent; timezone/currency/definition covered; ACTIVE feature filter mitigates disabled features  
7. **Expected:** Explicit tests for each matrix cell  
8. **Evidence:** `DefaultTenantSettingsProviderTests` Fact list  
9. **File path:** Unit test project  
10. **Class/method:** `DefaultTenantSettingsProviderTests`  
11. **Test evidence:** Code review of Facts  
12. **Tenant impact:** None observed in runtime path  
13. **Security/operational impact:** Residual regression risk only  
14. **Recommended correction:** Add unit cases in a follow-up hardening PR  
15. **Blocks Phase 4 closure:** No  
16. **Confidence:** High  

### F-P4V-03 — One Online Store skip integration test does not assert DB absence

1. **Finding ID:** F-P4V-03  
2. **Title:** Weak online-store-not-entitled integration assert  
3. **Severity:** Low  
4. **Layer:** Tests  
5. **Requirement:** Integration proof of skip  
6. **Actual:** Asserts provision result lists only  
7. **Expected:** Prefer DB join absence like inventory positive test  
8. **Evidence:** `Provider_OnlineStoreNotEntitled_SkipsOnlineStoreSetting`  
9. **File path:** `TenantFinalizeDefaultSettingsTests.cs`  
10. **Class/method:** same  
11. **Test evidence:** Code inspection  
12. **Tenant impact:** None (provider logic unit-tested)  
13. **Security/operational impact:** None  
14. **Recommended correction:** Strengthen assert in hardening  
15. **Blocks Phase 4 closure:** No  
16. **Confidence:** High  

No Critical or High findings.

---

## 27. Definition-of-Done Assessment

| Item | Status | Evidence |
| --- | --- | --- |
| Audit decisions implemented | Verified | D1–D4 in code |
| Seed definitions exist | Verified | Migration + catalog |
| Seed migration contains no schema DDL | Verified | Migration source |
| Currency non-null | Verified | Provider + Tenant.Create + EF required |
| Timezone non-null | Verified | Same |
| Locale non-null | Partially verified | App guarantees; DB nullable |
| TAX_EXCLUSIVE provisioned | Verified | Seed + tests |
| Date/time/number formats provisioned | Verified | Catalog + provider |
| Receipt policy provisioned | Verified | Catalog + provider |
| Numbering policy provisioned | Verified | Catalog + provider |
| Notification baseline provisioned | Verified | Catalog |
| Branding baseline provisioned | Verified | Catalog |
| Security baseline provisioned | Verified | Catalog |
| Inventory defaults entitlement-gated | Verified | Provider + tests |
| Online Store defaults entitlement-gated | Verified | Provider + tests |
| Disabled/expired module defaults skipped | Partially verified | ACTIVE feature resolve |
| Mandatory missing definition fails | Verified | Scenario 11 |
| Mandatory missing platform default fails | Verified | Currency/TZ; locale by code |
| Scenario 11 safe | Verified | Pre-persist |
| Transaction safe | Verified | Insert in wizard TX |
| Retry idempotent | Verified | Unique + tests |
| Existing customization preserved | Verified | Integration |
| Tenant isolation preserved | Verified | Integration |
| Platform Admin no-change valid | Verified | Defaults UI exists |
| Tenant Admin Flutter no-change valid | Verified | MVP |
| Cashier Flutter no-change valid | Verified | MVP |
| Phase 1 regression passes | Verified | 366/235 filters |
| Phase 2 regression passes | Verified | Included |
| Phase 3 regression passes | Verified | Included |
| No Critical/High blocker remains | Verified | Findings |

---

## 28. Remaining Gaps

### Blocking

None.

### Non-blocking

- F-P4V-01 locale DB nullability  
- F-P4V-02/03 test matrix gaps  
- Soft context fallbacks for blank locale/currency (pre-existing)  
- Legacy non-wizard create path still without settings (out of Flow 4 finalize scope)

### Deferred

See §29.

---

## 29. Explicit Deferred Work

Phase 4 does **not** include (confirmed deferred):

- Tenant Admin settings summary UI  
- Cashier direct settings consumption / `formatLkr` cleanup  
- Full receipt template system  
- Full numbering sequence system  
- Existing-tenant bulk backfill  
- Phase 5 invitation closure  

---

## 30. Final Verdict

```text
VERIFIED WITH NON-BLOCKING GAPS — PHASE 4 CLOSED
```

### Direct answers (required questions)

1. Setting definitions seeded correctly? **Yes**  
2. Migration seed-only? **Yes**  
3. Currency/timezone/locale non-null after finalize? **Yes (app); locale DB column still nullable**  
4. TAX_EXCLUSIVE provisioned? **Yes**  
5. Date/time/number formats provisioned? **Yes**  
6. Receipt policy provisioned? **Yes**  
7. Numbering policy provisioned? **Yes**  
8. Notification/branding/security defaults provisioned? **Yes**  
9. Inventory defaults only when entitled? **Yes**  
10. Online Store defaults only when entitled? **Yes**  
11. Disabled/expired modules skipped? **Yes via ACTIVE feature resolve; dedicated status tests thin**  
12. Unknown entitlements create no arbitrary settings? **Yes**  
13. Missing mandatory definition fails safely? **Yes**  
14. Missing mandatory platform default fails safely? **Yes**  
15. Scenario 11 proven? **Yes (pre-persist)**  
16. Provisioning transaction-safe? **Yes**  
17. Retry idempotent? **Yes**  
18. Customized settings preserved? **Yes**  
19. Tenant isolation preserved? **Yes**  
20. Existing tenants left unchanged? **Yes**  
21. Platform Admin no-change valid? **Yes**  
22. Tenant Admin Flutter no-change valid? **Yes**  
23. Cashier Flutter no-change valid? **Yes**  
24. Phase 1 regressions pass? **Yes**  
25. Phase 2 regressions pass? **Yes**  
26. Phase 3 regressions pass? **Yes**  
27. Test assertions sufficient? **Yes for closure; some cells partially verified**  
28. Can Phase 4 be officially closed? **Yes (with non-blocking gaps)**  
29. Can Phase 5 begin after closure tracking and controlled merge? **Yes — after separate roadmap/PR merge tracking; Phase 5 not started here**

### Roadmap rule

This audit **did not** update the roadmap. Status remains:

```text
PHASE 4 READY FOR READ-ONLY VERIFICATION
```

until a separate closure-tracking task updates it to Verified/Closed and performs controlled merge.

### Phase 5

```text
NOT STARTED
```
