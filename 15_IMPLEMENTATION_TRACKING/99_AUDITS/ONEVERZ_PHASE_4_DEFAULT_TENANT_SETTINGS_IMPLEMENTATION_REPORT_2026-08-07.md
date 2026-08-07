# OneVerz Phase 4 — Default Tenant Settings Implementation Report

**Date:** 2026-08-07  
**Status:** Ready for read-only verification  
**Backend branch:** `feature/flow4-phase4-default-tenant-settings`  
**Backend commit:** `81c7296900fd7c1c1c0e321a0c0044def9f47a43`  
**Audit basis:** `audit/flow4-phase4-default-tenant-settings` @ `9c88315`

---

## 1. Executive Summary

Before Phase 4, tenant finalize created identity, subscription, entitlements, limits counters, and bootstrap admin — but left `setting_definitions` empty and never wrote `tenant_settings`. Currency/timezone/locale used partial request/plan/hard-coded fallbacks, and Tenant Admin context hard-coded locale to `en-LK`.

Phase 4 now:

- Seeds MVP `setting_definitions`
- Resolves currency/timezone/locale from request → platform general defaults → (currency only) plan → fail closed
- Provisions core `tenant_settings` inside the same wizard transaction
- Gates inventory/online-store settings on effective entitlements
- Retries idempotently without overwriting customization
- Fails finalize before persist when mandatory definitions/platform defaults are missing (Scenario 11)

**Verdict:**

```text
READY FOR PHASE 4 READ-ONLY VERIFICATION
```

---

## 2. Branch / Repository Validation

| Repo | Branch | Base | Dirty WIP used? |
| --- | --- | --- | ---: |
| Backend | `feature/flow4-phase4-default-tenant-settings` | `origin/main` @ `4c069bb` via clean worktree `worktrees/backend-phase4` | No |
| Second Brain | `docs/flow4-phase4-implementation-tracking` | audit branch `9c88315` (audit not yet on main) | Clean worktree |
| Platform Admin | — | — | **NO CHANGE** |
| Flutter | — | — | **NO CHANGE** |

---

## 3. Frozen Phase 4 Decisions

| ID | Decision | Implemented |
| --- | --- | ---: |
| D1 | Tax default `TAX_EXCLUSIVE` | Yes (`tax.pricing_mode`) |
| D2 | Currency/TZ/locale SoT = tenant columns; no mirror settings | Yes |
| D3 | Receipt/numbering = policy JSON only | Yes |
| D4 | Module settings entitlement-gated | Yes (`inventory_tracking`, `online_store`) |

---

## 4. Setting Definitions Seed

**Migration:** `20260807120000_SeedPhase4DefaultTenantSettingDefinitions`  
**Purpose:** seed-only INSERT into `setting_definitions` with `ON CONFLICT (setting_key) DO NOTHING`  
**Schema DDL:** none  

Keys seeded:

- `tax.pricing_mode`
- `locale.date_format`
- `locale.time_format`
- `locale.number_format`
- `receipt.defaults`
- `numbering.policies`
- `notification.defaults`
- `security.session_policy`
- `branding.placeholders`
- `inventory.stock_behaviour`
- `online_store.defaults`

Canonical catalog: `TenantSettingKeys` + `TenantSettingDefinitionSeed`.

---

## 5. Tenant Operational Columns

Resolution order:

```text
currency: request → platform general.default_currency_code → plan.BaseCurrency → FAIL
timezone: request → platform general.default_timezone → FAIL
locale:   request → platform general.default_locale → FAIL
```

Persisted on:

```text
tenants.base_currency_code
tenants.default_timezone
tenants.default_locale
```

Context locale now reads tenant `DefaultLocale` (fallback `en-LK` only if blank).

---

## 6. Default Settings Provider

`IDefaultTenantSettingsProvider` / `DefaultTenantSettingsProvider`:

1. Loads platform general defaults
2. Resolves operational columns
3. Selects required definitions (core + entitlement-gated)
4. Fails if mandatory ACTIVE definition missing
5. Skips existing `(tenant, definition)` rows (idempotent)
6. Validates JSON / tax enum
7. Emits `TenantSetting` rows for insert

---

## 7. Core Settings Provisioned

Always (when definitions present):

| Key | Default |
| --- | --- |
| `tax.pricing_mode` | `TAX_EXCLUSIVE` |
| `locale.date_format` | `yyyy-MM-dd` |
| `locale.time_format` | `HH:mm` |
| `locale.number_format` | resolved tenant locale |
| `receipt.defaults` | MVP policy object |
| `numbering.policies` | ORD-/RCPT-/RET- policies |
| `notification.defaults` | email on / sms off |
| `security.session_policy` | idle 30 minutes (non-editable) |
| `branding.placeholders` | null logo/color |

---

## 8. Entitlement-Scoped Settings

| Key | Feature code | Behaviour |
| --- | --- | --- |
| `inventory.stock_behaviour` | `inventory_tracking` | provision only if effective |
| `online_store.defaults` | `online_store` | provision only if effective |

Disabled/unknown/missing entitlements create no module rows.

---

## 9. Transaction Integration

Wired in `PlatformTenantService.Wizard.CreateTenantInternalAsync`:

1. Resolve features
2. Build settings provision (fail closed on errors)
3. Create tenant with resolved currency/tz/locale
4. Build commercial/RBAC graph
5. Attach `TenantSettings` to write model
6. `CreateTenantWizardAsync` inserts settings in the same DB transaction

---

## 10. Scenario 11 Rollback

Evidence:

- Unit: `CreateTenantAsync_MissingMandatorySettingDefinition_FailsClosedWithoutPersist` — finalize fails; `CreateWizardCalled == false`
- Integration: missing definition / missing platform currency throw before tenant persist

No successful finalize with missing mandatory settings.

---

## 11. Idempotency

- Unique constraint `uq_tenant_settings_tenant_id_setting_definition_id`
- Provider skips existing definition IDs for tenant
- Retry test preserves customized `TAX_INCLUSIVE` and inserts nothing extra

---

## 12. Existing Tenant Compatibility

- No automatic bulk backfill in this PR
- Existing tenants unchanged
- Future insert-if-missing backfill deferred

---

## 13. Migration

| Item | Value |
| --- | --- |
| Name | `20260807120000_SeedPhase4DefaultTenantSettingDefinitions` |
| DDL | None |
| Destructive | Down deletes only the seeded definition keys |
| Tenant data rewrite | None |

---

## 14. Backend Files Changed

Key symbols:

- `TenantSettingKeys`, `TenantSettingDefinitionSeed`
- `DefaultTenantSettingsProvider`
- `SettingDefinitionRepository`
- `PlatformTenantService.Wizard` / write model / repository wizard
- `TenantAdminContextRepository` locale fix
- Seed migration + unit/integration tests

---

## 15. Platform Admin Status

```text
NO CHANGE
```

---

## 16. Tenant Admin Flutter Status

```text
NO CHANGE
```

---

## 17. Cashier Flutter Status

```text
NO CHANGE
```

---

## 18. Unit Tests

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| Phase 4 catalog + provider (+ wizard S11) within filtered unit run | included in 366 | 0 | 0 |
| PlatformAdministration / entitlement / limit / bootstrap filter | 366 | 0 | 0 |

Dedicated Phase 4 classes:

- `TenantSettingCatalogTests`
- `DefaultTenantSettingsProviderTests`
- Wizard Scenario 11 + locale/currency assertions

---

## 19. Integration Tests

| Suite | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: |
| `TenantFinalizeDefaultSettingsTests` | 7 | 0 | 0 |
| PlatformAdministration / limits / outlet / till / entitlement filter | 235 | 0 | 0 |

Covers persist, entitlement gating, retry/idempotency, isolation, Scenario 11.

---

## 20. Phase 1–3 Regression Tests

Executed via filtered unit + integration suites above — **all passed** (366 + 235).

---

## 21. Commands Executed

```text
dotnet build
dotnet test ... DefaultTenantSettingsProviderTests|TenantSettingCatalogTests|PlatformTenantWizardServiceTests
dotnet test ... TenantFinalizeDefaultSettingsTests
dotnet test ... PlatformAdministration|Entitlement|TenantSubscriptionLimit|TenantResourceLimit|Bootstrap
dotnet test ... PlatformAdministration|TenantResourceLimit|OutletCrud|TillCrud|Entitlement
```

---

## 22. Known Gaps

### Blocking

None for verification start.

### Non-blocking

- InMemory EF ignores real DB transactions; Scenario 11 service-level fail-before-persist is proven; PG transactional rollback remains implicit via existing wizard TX
- Legacy minimal create path still does not provision settings (wizard/finalize is the Flow 4 path)

### Deferred

See §23.

---

## 23. Explicit Deferred Work

- Tenant Admin settings summary UI
- Cashier direct settings consumption / `formatLkr` cleanup
- Full receipt template system
- Full numbering sequence graph
- Existing-tenant bulk backfill
- Tenant settings update API
- Phase 5 invitation closure

---

## 24. Final Verdict

```text
READY FOR PHASE 4 READ-ONLY VERIFICATION
```

**Phase 5:**

```text
NOT STARTED
```
