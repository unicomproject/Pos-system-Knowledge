# OneVerz Phase 4 — Default Tenant Settings Implementation Plan

**Date:** 2026-08-07  
**Audit companion:** `15_IMPLEMENTATION_TRACKING/99_AUDITS/ONEVERZ_PHASE_4_DEFAULT_TENANT_SETTINGS_FOUNDATION_AUDIT_2026-08-07.md`  
**Verdict baseline:** `READY WITH NON-BLOCKING DECISIONS`  
**Status:** Plan only — do not implement until branch creation after sign-off

---

## 0) Scope and Non-Goals

### In scope

- Canonical MVP `setting_key` catalog + seed into `setting_definitions`
- Default Settings Provider invoked from tenant finalize/create inside the existing DB transaction
- Harden non-null `tenants.base_currency_code`, `default_timezone`, `default_locale` using platform defaults
- Idempotent provisioning; Scenario 11 fail-closed
- Optional Tenant Admin context projection fix (read real locale)
- Optional read API / settings summary DTO
- Unit + integration tests; Second Brain tracking docs
- Existing-tenant insert-if-missing backfill design (implement as gated job or follow-up PR if time-boxed)

### Out of scope (explicit)

- Phase 5 invitation/ACS work
- Cashier `formatLkr` rewrite
- Full Tenant Admin Settings UI
- Auto-create outlets/tills/products/tax rate graphs
- New sequence engine replacing `DocumentNumberSequence` / `CodeSequenceRepository`
- Platform Admin wizard redesign

---

## 1) Non-Blocking Decisions (freeze before coding catalog)

| ID | Decision | Proposed default (implement unless product overrides) |
| --- | --- | --- |
| D1 | Tax pricing mode default | `TAX_EXCLUSIVE` |
| D2 | Currency/TZ/locale SoT | First-class `tenants` columns; **do not require** duplicate settings keys for the same values in MVP (optional mirror keys listed as OPTIONAL) |
| D3 | Receipt MVP | Policy JSON in settings only; no receipt template row graph |
| D4 | Numbering MVP | Policy JSON in settings; lazy sequence row create remains acceptable |
| D5 | Online store / inventory settings | Provision **only** when entitlement present |
| D6 | Existing tenants | Insert-missing backfill after catalog merge; never overwrite |
| D7 | Tenant Admin update API | Deferred after read/provision; Phase 4 can ship provision + read |

If product rejects D1–D5, update this plan’s catalog table before merge.

---

## 2) Proposed Implementation Order

```text
1. Canonical default-setting contract (SB key catalog freeze)
2. Backend default-setting catalog constants + SettingDefinition seed migration
3. DB alignment confirmation (no DDL expected)
4. DefaultSettingsProvider + transactional wiring in CreateTenantInternalAsync / wizard write model
5. Idempotency + fail-closed validation
6. Tenant Admin context locale fix + optional settings projection
7. Optional read endpoint for settings summary
8. Tenant Admin Flutter — NO CHANGE (MVP)
9. Cashier Flutter — NO CHANGE
10. Platform Admin — NO CHANGE
11. Unit tests
12. Integration tests (incl. Scenario 11)
13. Flutter tests — N/A unless optional FE added
14. E2E finalize assertion on tenant_settings
15. Read-only Phase 4 verification audit
```

---

## 3) Canonical MVP Setting Catalog (proposed)

> Keys are **proposed**. Persist as `setting_definitions.setting_key`. Values stored as jsonb in `default_value` / `tenant_settings.setting_value`.

| setting_key | value_type | default_value (json) | is_tenant_editable | Required always? | Entitlement gate |
| --- | --- | --- | ---: | ---: | --- |
| `tax.pricing_mode` | string | `"TAX_EXCLUSIVE"` | true | Yes | — |
| `locale.date_format` | string | `"yyyy-MM-dd"` | true | Yes | — |
| `locale.time_format` | string | `"HH:mm"` | true | Yes | — |
| `locale.number_format` | string | `"en-LK"` (or derive from tenant locale) | true | Yes | — |
| `receipt.defaults` | object | `{ "headerText": null, "footerText": "Thank you for shopping with us.", "showTaxBreakdown": true }` | true | Yes | — |
| `numbering.policies` | object | See §3.1 | true | Yes | — |
| `notification.defaults` | object | `{ "emailEnabled": true, "smsEnabled": false }` | true | Yes | — |
| `security.session_policy` | object | `{ "idleTimeoutMinutes": 30 }` (align to platform security norms) | false | Yes | — |
| `branding.placeholders` | object | `{ "logoAssetId": null, "primaryColor": null }` | true | Yes | — |
| `inventory.stock_behaviour` | object | `{ "allowNegativeStock": false }` | true | When inventory entitled | inventory feature |
| `online_store.defaults` | object | `{ "storeStatus": "DRAFT", "taxDisplayMode": "MATCH_TENANT" }` | true | When online store entitled | online store feature |

### 3.1 numbering.policies (proposed)

```json
{
  "SALES_ORDER": { "prefix": "ORD-", "paddingLength": 6, "resetRule": "NONE" },
  "POS_RECEIPT": { "prefix": "RCPT-", "paddingLength": 6, "resetRule": "NONE" },
  "RETURN": { "prefix": "RET-", "paddingLength": 6, "resetRule": "NONE" }
}
```

Do **not** invent types that runtime does not use. Align keys with existing `DocumentType` strings in Orders/POS before freeze (inspect `DocumentNumberSequence` consumers during implementation).

### 3.2 Optional mirror keys (not MVP-required)

| setting_key | Note |
| --- | --- |
| `business.currency_code` | Mirror of `tenants.base_currency_code` |
| `business.timezone` | Mirror of `tenants.default_timezone` |
| `business.locale` | Mirror of `tenants.default_locale` |
| `business.country_code` | Mirror of address country |

Prefer single SoT on columns to avoid drift.

---

## 4) Layer Change Matrix

| Layer | File/Symbol | Current | Required | Action |
| --- | --- | --- | --- | --- |
| SB | New: Phase 4 catalog note under tracking docs | Partial contract §6 | Frozen key table | NEW (on tracking branch after sign-off) |
| BE Domain | `SettingDefinition`, `TenantSetting` | Entities exist | Use as-is | INSPECT ONLY |
| BE Domain | Optional factory helpers / value objects for pricing mode | None | Validate allowed enums | NEW (optional) |
| BE Application | **NEW** `IDefaultTenantSettingsProvider` / `DefaultTenantSettingsProvider` | Missing | Resolve + build `TenantSetting` list | NEW |
| BE Application | **NEW** `TenantSettingCatalog` (const keys + defaults) | Missing | Single catalog source | NEW |
| BE Application | `PlatformTenantService.Wizard.CreateTenantInternalAsync` | No settings | Call provider; fail if required missing | MODIFY |
| BE Application | Platform create request validation | Locale optional | Require locale or apply platform default before persist | MODIFY |
| BE Application | Wire platform settings reader into create defaults | Unused for create | Read `general.default_*` when request field null | MODIFY |
| BE Infrastructure | `PlatformTenantCreateWriteModel` (+ repo wizard) | No settings collection | Add `IReadOnlyList<TenantSetting>` (or similar) | MODIFY |
| BE Infrastructure | `CreateTenantWizardAsync` | No tenant_settings insert | Insert settings in same TX | MODIFY |
| BE Infrastructure | EF seed / migration for `setting_definitions` | Empty catalog | Seed MVP rows | NEW |
| BE Infrastructure | `TenantAdminContextRepository` | Locale hard-coded `en-LK` | Use `tenant.default_locale` with safe fallback | MODIFY |
| BE API | Optional `GET .../tenant-admin/settings` | Missing | Return provisioned settings | NEW (optional MVP+) |
| BE API | Finalize / create-options | Exists | Possibly expose default tax mode | POSSIBLE |
| BE Tests | Unit: catalog, provider, idempotency, entitlement gate | Missing | Add | NEW |
| BE Tests | Integration: finalize creates settings; retry; rollback; isolation; Scenario 11 | Missing | Add | NEW |
| PA | Wizard / detail | Already collects currency/tz/locale | Unchanged | NO CHANGE |
| Flutter TA | Settings placeholder | Stub | Unchanged for MVP | NO CHANGE |
| Flutter Cashier | `formatLkr` etc. | Hard-coded | Unchanged | NO CHANGE |

---

## 5) Exact Backend Design

### 5.1 Service contract

```csharp
// Proposed location:
// src/E_POS.Application/Modules/Tenant/TenantFoundation/Services/DefaultTenantSettingsProvider.cs

public interface IDefaultTenantSettingsProvider
{
    Task<DefaultTenantSettingsProvisionResult> BuildAsync(
        DefaultTenantSettingsProvisionRequest request,
        CancellationToken cancellationToken);
}

public sealed record DefaultTenantSettingsProvisionRequest(
    Guid TenantId,
    Guid? PlatformUserId,
    DateTimeOffset Now,
    string? RequestCurrency,
    string? RequestTimezone,
    string? RequestLocale,
    string? PlanCurrency,
    string? CountryCode,
    IReadOnlyCollection<string> EffectiveFeatureKeys);

public sealed record DefaultTenantSettingsProvisionResult(
    IReadOnlyList<TenantSetting> SettingsToInsert,
    string ResolvedCurrency,
    string ResolvedTimezone,
    string ResolvedLocale);
```

### 5.2 Resolution order

**Currency**

```text
request.BaseCurrency
  → platform general.default_currency_code
  → plan.BaseCurrency
  → FAIL (required)
```

**Timezone**

```text
request.DefaultTimezone
  → platform general.default_timezone
  → FAIL (do not silently use Asia/Colombo without platform/default catalog)
```

Keep wizard reference list for UI options; provisioning must prefer platform settings over hard-coded array `[0]` once platform settings are wired. Until then, documented interim: platform setting → reference first → fail.

**Locale**

```text
request.DefaultLocale
  → platform general.default_locale
  → FAIL
```

**Settings values**

```text
For each ACTIVE setting_definition in required set (filtered by entitlement):
  value = definition.DefaultValue
  apply deterministic overlays (e.g. number_format from resolved locale)
  emit TenantSetting.Create(...)
```

If a required definition row is missing from DB → **fail finalize** (Scenario 11).

### 5.3 Transaction wiring

1. In `CreateTenantInternalAsync`, after entitlements resolved and before/while building write model:
   - Call provider
   - Apply resolved currency/tz/locale onto `Tenant.Create(...)` (replace current partial fallbacks)
2. Add settings to `PlatformTenantCreateWriteModel`
3. In `CreateTenantWizardAsync`, inside existing transaction after `Tenants.Add`:
   - `TenantSettings.AddRange(...)`
4. Commit as today

Onboarding and non-onboarding paths must both receive settings.

### 5.4 Idempotency algorithm

```text
Load existing tenant_settings for tenantId (retry / repair path)
For each required key:
  if missing → insert
  if present → leave unchanged (do not clobber customization)
Never delete on retry
Rely on uq_tenant_settings_tenant_id_setting_definition_id for races
```

For first finalize inside empty tenant TX, simple insert is enough. Shared helper should support repair/backfill.

### 5.5 Entitlement gating

Use Phase 1 effective feature keys already available in create path:

- Always: tax, locale formats, receipt, numbering, notification, security, branding
- If inventory feature effective → `inventory.stock_behaviour`
- If online store feature effective → `online_store.defaults`
- Else skip those definitions entirely (do not insert dormant rows unless product overrides D5)

---

## 6) DB / Migration Steps

1. Confirm tables exist (they do).
2. Add migration or idempotent seed: insert MVP `setting_definitions` with stable UUIDs.
3. No DDL unless ValueType constraints need check constraints (optional).
4. Do **not** seed per-tenant rows in migration.

Suggested seed class location:

```text
src/E_POS.Infrastructure/Persistence/Seed/TenantSettingDefinitionSeedData.cs
```

Or EF migration `InsertData` for definitions only.

---

## 7) API / DTO Plan

### MVP

| Endpoint | Change |
| --- | --- |
| Finalize / wizard create | Behavioural only |
| `GET /api/v1/tenant-admin/context` | Locale from tenant; optional `settings` dictionary or omit until dedicated endpoint |

### Optional follow-in same PR

| Endpoint | Method | Permission | Notes |
| --- | --- | --- | --- |
| `/api/v1/tenant-admin/settings` | GET | `tenant.settings.manage` or view equivalent | Returns key/value + editable flag |

### Defer

| Endpoint | Reason |
| --- | --- |
| PUT tenant settings | Needs validation rules per key + audit; after MVP provision |

---

## 8) Permissions / Validation / Business Rules

| Rule | Detail |
| --- | --- |
| Provisioner | System only (platform user id stamped) |
| View | Existing tenant settings permission codes |
| Update | Deferred; when added, respect `is_tenant_editable` |
| Cashier | No direct settings API |
| Validation | Unknown pricing mode rejected; jsonb required non-null; definition must be ACTIVE |
| Business | Null drift prohibited for required keys after successful finalize |
| Security | Always filter by `tenant_id` |

---

## 9) Test Plan

### 9.1 Backend unit

| Test class (proposed) | Cases |
| --- | --- |
| `TenantSettingCatalogTests` | All MVP keys present; unique keys; defaults parse as jsonb |
| `DefaultTenantSettingsProviderTests` | Required values resolve; missing definition fails; entitlement skips online store; locale overlay; idempotent merge leaves existing |
| `TenantCreateLocaleCurrencyResolutionTests` | Platform defaults applied when request null |

### 9.2 Integration

| Test class (proposed) | Cases |
| --- | --- |
| `TenantFinalizeDefaultSettingsTests` | Finalize creates expected `tenant_settings` count/keys |
| Retry same tenant | No duplicate; no overwrite of manually changed value |
| Forced missing definition | Finalize fails; no tenant row left (rollback) |
| Tenant isolation | Tenant A settings not visible to B |
| Disabled module | Online store settings absent when not entitled |
| Context | Locale equals tenant.default_locale |
| Regression | Phase 1 entitlement + Phase 2 bootstrap permissions + Phase 3 limit guards still pass |

### 9.3 Concurrency

| Case | Expect |
| --- | --- |
| Parallel repair inserts | Unique index prevents duplicates; one succeeds |
| Number sequence (if rows created) | Existing `RowVersion` behaviour unchanged |

### 9.4 Flutter

| Area | Plan |
| --- | --- |
| Tenant Admin | No new tests unless FE summary added |
| Cashier | No Phase 4 tests |

### 9.5 Scenario 11 (roadmap)

```text
Required default unresolved → finalize fails (or explicit recoverable state)
```

Prefer **hard fail + rollback** for MVP (no half-active tenant).

---

## 10) Flutter / PA Consumer Matrix

| Consumer | Phase 4 action |
| --- | --- |
| Platform Admin | NO CHANGE |
| Tenant Admin Flutter | NO CHANGE (POSSIBLE later: bind settings GET) |
| Cashier Flutter | NO CHANGE |

---

## 11) Existing Tenant Backfill Plan (post-MVP acceptable)

1. Job/command: `BackfillTenantDefaultSettings`
2. For each tenant: insert missing required keys only
3. Fill null `default_locale` / timezone / currency from platform defaults
4. Emit audit summary counts
5. Do not change tax mode if custom key already present
6. Run in staging first; require ops approval for production

---

## 12) Branch / PR Strategy

Create only after this plan is accepted:

| Repo | Branch | PR contents |
| --- | --- | --- |
| Backend | `feature/flow4-phase4-default-tenant-settings` | Catalog seed, provider, wizard TX wiring, context fix, tests |
| Platform Admin | — | Skip unless summary UI requested |
| Flutter | — | Skip for MVP |
| Second Brain | `docs/flow4-phase4-implementation-tracking` | Implementation report + verification checklist |

Never implement on `main`. Never use dirty Flutter tree; use clean worktree from `origin/main`.

---

## 13) Definition of Done

- [ ] MVP `setting_definitions` seeded on clean DB
- [ ] New tenant finalize inserts all required `tenant_settings` in same TX
- [ ] Retry/idempotent behaviour proven
- [ ] Scenario 11 fail-closed proven
- [ ] Locale/currency/timezone non-null on new tenants
- [ ] Context locale no longer unconditionally `en-LK`
- [ ] Entitlement-gated settings respected
- [ ] Phase 1–3 regression suites green
- [ ] Audit verification document published
- [ ] No Cashier/PA mandatory code changes claimed without evidence

---

## 14) Suggested File Checklist (Backend)

| Path | Action |
| --- | --- |
| `.../TenantFoundation/Services/IDefaultTenantSettingsProvider.cs` | NEW |
| `.../TenantFoundation/Services/DefaultTenantSettingsProvider.cs` | NEW |
| `.../TenantFoundation/Constants/TenantSettingKeys.cs` | NEW |
| `.../PlatformAdmin/Services/PlatformTenantService.Wizard.cs` | MODIFY |
| `.../PlatformAdmin/.../PlatformTenantCreateWriteModel.cs` (or equivalent) | MODIFY |
| `.../PlatformAdmin/Repositories/PlatformTenantRepository.Wizard.cs` | MODIFY |
| `.../TenantFoundation/Repositories/TenantAdminContextRepository.cs` | MODIFY |
| `.../Persistence/Seed/TenantSettingDefinitionSeedData.cs` (+ migration) | NEW |
| `tests/.../DefaultTenantSettingsProviderTests.cs` | NEW |
| `tests/.../TenantFinalizeDefaultSettingsTests.cs` | NEW |
| DI registration module | MODIFY |

Exact write-model type name: confirm in repo during implementation (`PlatformTenantCreateWriteModel` per audit).

---

## 15) Stop / Handoff

This plan is executable without inventing tables. Remaining product choices (D1–D5) are listed; proposed defaults are safe to implement if product is silent.

**Phase 5:** NOT STARTED — do not begin invitation production closure in the Phase 4 PR.
