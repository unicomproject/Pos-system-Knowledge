# OneVerz Phase 4 — Default Tenant Settings Foundation Audit

**Date:** 2026-08-07  
**Branch:** `audit/flow4-phase4-default-tenant-settings`  
**Scope:** Audit + implementation planning only (no source-code changes)  
**Preceding phases:** Phase 1–3 closed / merged; Phase 3 main `4c069bb`; Flutter main `8db5f74`

---

## 1. Executive Summary

Today, Super Admin finalize creates a complete **commercial + identity + RBAC** tenant graph (tenant, subscription, entitlements, limits counters, bootstrap admin role/user, optional billing/payment/onboarding metadata). It does **not** provision `tenant_settings`, tax setup, receipt templates, or document number sequences.

Identity-shaped defaults that *are* written today live on first-class columns:

| Field | Table | Source today |
| --- | --- | --- |
| Base currency | `tenants.base_currency_code` | Wizard request → else plan currency |
| Timezone | `tenants.default_timezone` | Wizard request → else hard-coded `Asia/Colombo` |
| Locale | `tenants.default_locale` | Wizard request only (may remain null) |
| Country | `tenant_addresses` (when present) | Wizard |

Platform create-defaults (`platform_settings`: LKR / Asia/Colombo / en-LK / LK) exist but are **not applied** by `CreateTenantInternalAsync`. The typed settings schema (`setting_definitions` + `tenant_settings`) exists with unique constraints, but **no SettingDefinition catalog seed** and **no Application services** write tenant settings.

**Missing for Phase 4 DoD:** a canonical setting-key catalog, transactional Default Settings Provider inside finalize, fail-closed required-setting checks (Scenario 11), idempotent retries, and a clear ownership split vs columns already on `tenants`.

**Tenant Admin Flutter:** Settings route is a placeholder; context already returns currency/timezone/locale (locale hard-coded `en-LK` in repository). No Phase 4 Flutter change is required for backend provisioning DoD; a settings UI is later.

**Cashier Flutter:** Runtime hard-codes `formatLkr` / Colombo offset / cart tax=0. Cashier must **not** be changed merely because Phase 4 exists; runtime consumption of new settings is deferred unless product expands Phase 4 scope.

**DB impact:** Prefer **data seed** of `setting_definitions` + inserts into `tenant_settings` on finalize. No new giant JSON blob table. Schema change likely **not** required unless catalog needs metadata columns beyond current model.

**Phase 4 readiness verdict:**

```text
READY WITH NON-BLOCKING DECISIONS
```

Implementation can start once the proposed MVP catalog in the companion plan is accepted (or adjusted). Empty `setting_definitions` is an implementation deliverable, not a missing table foundation.

---

## 2. Repository / Branch Validation

| Repository | Main Commit | Worktree | Dirty? | Audit Safe? |
| --- | --- | ---: | ---: | ---: |
| Backend (`Unified-Commerce`) | `4c069bb906d27482268035398fcd0aa310173922` | `worktrees/phase4-backend-audit` @ same | Main clean; WT clean | YES |
| Platform Admin | `9e13169b1d10f0ccd374657620b80f4f81d1c916` | `worktrees/phase4-platform-admin-audit` @ same | Main has local dirt; WT clean | YES (WT) |
| Flutter (`Nytroz-POS-App`) | `8db5f748671c82ad52a25d533e9250e7da7bd451` | `worktrees/phase4-flutter-audit` @ same | Local dirty main @ `bff2c65` **untouched** | YES (WT only) |
| Second Brain | `67d5a0cbf10baf2c3f5f4f1156309b67f96d491e` | Repo on `audit/flow4-phase4-default-tenant-settings` | Unrelated local WIP present; **not staged** | YES for new docs only |

Validation commands used: `git rev-parse --show-toplevel`, `git fetch origin`, `git rev-parse origin/main`, `git status`.

Flutter audit explicitly did **not** use local dirty `main` @ `bff2c65`.

---

## 3. Current Tenant Finalization Behaviour

### Call chain

```text
PlatformTenantOnboardingController.Finalize
  → PlatformTenantOnboardingService.FinalizeAsync
    → IPlatformTenantService.CreateTenantAsync
      → PlatformTenantService.Wizard.CreateTenantInternalAsync
        → PlatformTenantRepository.Wizard.CreateTenantWizardAsync  (single DB transaction)
```

Evidence: `PlatformTenantService.Wizard.cs`, `PlatformTenantRepository.Wizard.cs`, `PlatformTenantOnboardingService.cs`.

### Provisioned today

| Provisioned Item | Automatically Created Today? | Source File | Table | Required? |
| --- | ---: | --- | --- | ---: |
| Tenant row (currency/tz/locale columns) | Yes | `PlatformTenantService.Wizard.cs` | `tenants` | Yes |
| Tenant profile (legal/trading/tax number…) | Conditional | same | `tenant_profiles` | Soft |
| Tenant address (country) | Conditional | same | `tenant_addresses` | Soft (country expected by wizard) |
| Tenant domain | Conditional | same | `tenant_domains` | Soft |
| Subscription + history | Yes | same + repo | `tenant_subscriptions`, `tenant_subscription_history` | Yes |
| Feature entitlements | Yes (resolved) | same | `tenant_feature_entitlements` | Yes |
| Subscription add-ons | Conditional | same | `tenant_subscription_addons` | Soft |
| Bootstrap Tenant Admin role + permissions | Yes | same | `tenant_roles`, `tenant_role_permissions` | Yes |
| Bootstrap Tenant Admin user + role link | Yes | same | `tenant_users`, `tenant_user_roles` | Yes |
| User invite row | No (write model null) | Wizard write model | `user_invites` | Later (Phase 5) |
| Draft subscription invoice / payment trio | Conditional (onboarding billing) | same | invoice/payment tables | Soft |
| Onboarding draft lock + operation + contacts + outbox | Onboarding only | repo | onboarding + outbox | Soft |
| Usage / capacity counters | Yes (onboarding in-TX; non-onboarding post-commit) | Wizard / capacity service | `tenant_usage_counters` | Yes (Phase 3) |
| **`tenant_settings` rows** | **No** | — | `tenant_settings` | **Yes (Phase 4)** |
| **`setting_definitions` seed** | **No app seed found** | — | `setting_definitions` | **Yes (Phase 4 prerequisite)** |
| Tax jurisdictions/rates/classes | No | — | tax_* | Later / TA setup |
| Receipt templates | No | — | receipt template tables | Deferred / policy only |
| Document number sequences | No (dev seed only for fixed tenant) | `DevelopmentDocumentSequenceSeedData` | `document_number_sequences` | Policy vs rows — see §13 |
| Outlets / tills / devices / products | No | — | outlet/till… | Correctly deferred |
| Platform `general.default_*` applied to tenant | No | `AddPlatformSettings` seed unused by wizard | `platform_settings` | Should feed defaults |

### Transaction boundary

Finalize write is already transactional for the commercial/RBAC graph. Settings provisioning is **absent** (neither inside nor outside). Phase 4 must add settings writes **inside** the same UoW as finalize success.

---

## 4. Existing Settings Data Model

| Table/Entity | Tenant Scoped | Existing Fields | Provisioned Today | Used By |
| --- | ---: | --- | ---: | --- |
| `SettingDefinition` / `setting_definitions` | No (platform catalog) | `setting_key`, `display_name`, `value_type`, `default_value` (jsonb), `description`, `is_tenant_editable`, `status` | No seed found | Nothing in Application layer |
| `TenantSetting` / `tenant_settings` | Yes | `tenant_id`, `setting_definition_id`, `setting_value` (jsonb), platform audit user ids | No | Nothing in Application layer |
| `Tenant` / `tenants` | Yes | `base_currency_code`, `default_timezone`, `default_locale`, `operating_mode`, … | Yes | Context, POS home, create flows |
| `TenantProfile` | Yes | legal/trading names, contacts, tax/registration numbers | Conditional | Tenant profile |
| `Currency` / `currencies` | No | code, symbol, decimal places | Global ref | FK for tenant currency |
| `PlatformSetting` / `platform_settings` | No | `general.default_country_code/currency_code/timezone/locale` | Seeded | Platform Admin System Settings UI |
| `DocumentNumberSequence` | Yes | type, prefix, padding, reset, outlet/channel scope | Dev only | Orders numbering (when present) |
| `CodeSequenceRepository` | N/A | Scan-based next codes (outlet/device/till session/…) | Lazy at resource create | Outlet/Till/Device services |
| Tax entities | Yes | jurisdiction/rate/class/assignment | Manual TA APIs | Pricing/tax module |
| Named `BusinessSettings` / `ReceiptSettings` / `POSSettings` / `TaxSettings` entities | — | **Do not exist** | — | — |

Unique key for idempotency already exists: `uq_tenant_settings_tenant_id_setting_definition_id`.

---

## 5. Settings Ownership Classification

| Candidate | Ownership |
| --- | --- |
| Supported currencies / timezones / locales catalogs | **A. Platform System Default** |
| Plan modules / Max\* limits / entitlements | **B. Subscription Plan Configuration** (Phase 1–3; do not duplicate into settings) |
| Tax mode, receipt footer policy, notification prefs, numbering policy, branding placeholders, format prefs | **C. Tenant Business Configuration** → `tenant_settings` |
| Currency / timezone / locale / operating mode on tenant row | **C** but **first-class columns** (not only settings bag) |
| Country / address | **C** via `tenant_addresses` / profile |
| Outlet timezone override, outlet receipt header, till defaults | **D. Outlet-Level** — provision only when outlet exists (not at finalize) |
| Personal language/theme | **E. User Preference** — out of Phase 4 |

**Rule:** Do not auto-create outlet/till/product settings at finalize. Do not treat Cashier UI hard-codes as backend defaults.

---

## 6. Mandatory Default Settings (MVP Phase 4)

Without these, finalize leaves unsafe null/inconsistent operational posture relative to the provisioning contract.

| Setting | Priority | Persist Where | Reason |
| --- | --- | --- | --- |
| Currency | Mandatory | `tenants.base_currency_code` (already) + optional mirror setting | Sales/money identity |
| Timezone | Mandatory | `tenants.default_timezone` (already; harden null) | Business date / POS clock base |
| Locale / language | Mandatory | `tenants.default_locale` (harden null via platform default) | Formatting / language |
| Country | Mandatory | address/profile path already collected | Jurisdiction context |
| Tax pricing mode (inclusive/exclusive) | Mandatory | `tenant_settings` | Contract required; no first-class column; POS/ecom carts have `IsTaxInclusive` but no tenant default today |
| Date/time/number format prefs | Mandatory (derived) | `tenant_settings` or derived-from-locale policy | Contract required; may be derived defaults from locale |
| Numbering **policy** (prefixes/padding/reset rules for core document types) | Mandatory (policy) | `tenant_settings` | Contract “code policies”; avoid inventing duplicate sequence engines |
| Receipt **defaults policy** (footer/header placeholders, template code pointer) | Mandatory (minimal) | `tenant_settings` | Contract; do not invent full receipt graph unless needed |
| Branding placeholders | Mandatory (minimal) | `tenant_settings` or profile | Contract |
| Notification defaults | Mandatory (minimal platform copy) | `tenant_settings` | Contract |
| Password/session policy reference | Mandatory (platform-owned values copied or referenced) | `tenant_settings` or platform-only | Contract; prefer non-tenant-editable |

---

## 7. Optional / Deferred Settings

| Setting | Priority | Reason |
| --- | --- | --- |
| Full tax class/rate/jurisdiction graph | Later | Tenant Admin catalog; not required at finalize per operating model |
| Physical `document_number_sequences` rows for all types | Optional / Later | Prefer policy + lazy create; avoid unused sequences for non-entitled modules |
| Outlet/till timezone & receipt overrides | Deferred | Outlet not created at finalize |
| Online store module settings | Entitlement-scoped | Provision only if Online Store entitled; else skip |
| Inventory/stock behaviour toggles | Entitlement-scoped | Same |
| Full receipt template entity graph | Deferred | Policy pointer first |
| Cashier client hard-code removal (`formatLkr`) | Later (not Phase 4 DoD) | Runtime UX debt; backend can still be source of truth |
| Tenant Admin Settings screen UX | Later / Possible | Roadmap FE = “settings summary” inspect, not full editor |
| Business date / trading-day cutoff | Deferred | Runtime derives business date from timezone; no tenant setting found as first-class requirement for onboard |

---

## 8. Currency Analysis

| Question | Evidence-based answer |
| --- | --- |
| Tenant default currency? | Yes — `tenants.base_currency_code` set at create |
| Platform default currency? | Yes — `platform_settings.general.default_currency_code` = LKR; **not wired** into wizard create |
| Hard-coded LKR? | Plan defaults, till constants, Tenant Admin context fallback, Flutter `formatLkr` / device default |
| Multi-currency? | Global `currencies` catalog; tenant has single base currency today |
| Phase 4 need? | Ensure non-null tenant currency (already mostly true); optionally seed settings mirror; **do not** replace plan/subscription currency semantics |

Subscription/invoice money uses **plan.BaseCurrency**, which can diverge from request tenant currency — note as non-blocking consistency risk, not Phase 4 primary scope.

---

## 9. Timezone Analysis

| Layer | Behaviour |
| --- | --- |
| Create | Request TZ else `TenantCreateWizardReferenceData.Timezones[0]` = `Asia/Colombo` |
| Platform default | `general.default_timezone` unused by create |
| Tenant Admin context | Empty → `"UTC"` (different fallback than create!) |
| Outlet | Optional override at outlet create (Flutter + API) |
| Cashier | Home API `outletTimezone`; client offset only special-cases Colombo |

**Recommended precedence (aligned to observed design):**

```text
Outlet timezone (when set)
  → tenant.default_timezone
  → platform general.default_timezone
  → fail closed for mandatory provisioning (no silent empty)
```

Phase 4 must eliminate create/context fallback inconsistency for **new** tenants (tenant row always populated). Cashier Colombo-only offset is **not** Phase 4 mandatory.

---

## 10. Locale Analysis

| Layer | Behaviour |
| --- | --- |
| Create | `DefaultLocale` from request; **no hard fallback** → can be null |
| Platform default | `en-LK` in `platform_settings` |
| Context API | **Hard-codes** `Locale: "en-LK"` ignoring tenant column |
| Flutter | Parses locale from context; largely unused; no MaterialApp locale wiring |

Phase 4: force non-null `tenants.default_locale` from request → platform default → catalog first locale. Fix context projection to read tenant locale (small backend fix; belongs with Phase 4 context alignment).

---

## 11. Tax Analysis

| Item | Status |
| --- | --- |
| Tenant tax mode setting | **Missing** |
| Tax tables | Exist; CRUD via Tenant Pricing/Tax APIs; **not** provisioned at finalize |
| Product tax assignment | Tenant Admin only |
| Cart/Order `IsTaxInclusive` | Exists on e-com models; not driven by tenant default |
| Billing `taxPercentage` on subscription | Invoice commercial tax % — **not** POS tax mode |

**Phase 4 MVP:** seed tenant setting e.g. `tax.pricing_mode` = platform default (`TAX_EXCLUSIVE` or `TAX_INCLUSIVE` — **non-blocking product decision**).  
**Do not** invent full Sri Lanka VAT graph at finalize.  
**Do not** create default tax rates without explicit catalog design.

---

## 12. Receipt / Invoice Analysis

| Area | Status |
| --- | --- |
| Receipt runtime snapshot | Backend builds POS receipt branding/totals; Cashier thermal footer still hard-coded |
| Receipt template tables | Exist in POS ops schema; not provisioned at finalize |
| Invoice (subscription) | Platform billing invoices — separate from tenant retail invoice settings |
| Retail invoice settings UI | Not present in Tenant Admin |

**Phase 4 MVP:** seed minimal receipt **policy** settings (header/footer placeholders, default template code if one system template exists). Full template entity seeding = deferred unless a system template row is already required by POS print path for all tenants (evidence: POS works today with branding from outlet/tenant without finalize templates — treat full graph as deferred).

---

## 13. Numbering Analysis

| Mechanism | Tenant isolation | Provisioned at finalize? | Notes |
| --- | ---: | ---: | --- |
| `document_number_sequences` | Yes | No | Proper sequence table + `RowVersion`; used by orders when present |
| `CodeSequenceRepository` | Via data scan | No | Lazy next codes for outlet/device/till session/customer/stock movement |
| Historical `code_sequences` table | — | Removed from EF model | Do not resurrect |

**Phase 4 recommendation:** Persist **numbering policies** in `tenant_settings` (document type → prefix/padding/reset). Create concrete `document_number_sequences` rows **only** for core entitled document types if runtime currently **requires** a row to sell; otherwise lazy-create on first use with policy defaults. Do not build a second sequence engine.

---

## 14. Business Date Analysis

Business date is projected in Tenant Admin context / POS home from timezone + server time. No dedicated tenant “trading day cutoff” setting found as a finalize requirement. **Deferred** unless product explicitly requires overnight cutoff defaults.

---

## 15. POS Default Analysis

POS operational readiness today depends on later TA setup (outlet → till → device) plus tenant currency/timezone. Cashier hard-codes currency display and cart tax=0. Phase 4 should provision **tenant-level** tax mode + ensure currency/tz/locale; **not** invent default outlet/till. Negative stock / offline behaviour: entitlement/feature territory — defer unless settings keys already exist (they do not).

---

## 16. Online Store Default Analysis

E-com carts expose `IsTaxInclusive` per cart/checkout, not from tenant settings. Per Phase 1 entitlement rules: **do not** provision Online Store settings for tenants without Online Store entitlement unless product explicitly wants dormant config. Phase 4 default: **skip** when not entitled.

---

## 17. Tenant Admin Flutter Impact

| Setting | Backend Source | Tenant Admin Usage | Hard-coded? | Phase 4 FE Change? |
| --- | --- | ---: | ---: | ---: |
| Currency | Context + entity APIs | Display in products/reports; unused from context for formatting | Fallbacks LKR/`Rs`/USD DTOs | NO CHANGE (MVP) |
| Timezone | Context + outlet APIs | Outlet form editable; context TZ unused | `Asia/Colombo` outlet fallback list | NO CHANGE |
| Locale | Context (hard-coded BE) | Parsed unused | — | NO CHANGE |
| Tax mode | None | N/A | — | DEFER UI |
| Receipt/invoice/numbering | None | Placeholder Settings screen | — | DEFER |
| Settings screen | Route + permission only | `TenantAdminPlaceholderScreen` | — | POSSIBLE later summary |

**Verdict for Phase 4 FE:** **POSSIBLE** (read-only summary if API added); **not required** for backend DoD.

---

## 18. Cashier Flutter Impact

| Setting | Cashier Uses It? | Current Source | Hard-Coded? | Phase 4 Change Needed? |
| --- | ---: | --- | ---: | ---: |
| Currency | Display yes | Device/home API + `formatLkr` | Yes heavily | **No** for Phase 4 DoD |
| Timezone | Home clock | Outlet TZ from home | Colombo-only offset | No |
| Locale | No | — | Device default | No |
| Tax mode | Pre-checkout no | Cart tax=0 | Yes | No (unless scope expands) |
| Receipt | Snapshot + thermal | Backend + hard-coded footer | Partial | No |
| Rounding | Display | Receipt JSON | No client calc | No |
| Business date | Display | Home API | Fallback `DateTime.now` rare | No |
| Number sequences | Display numbers | Backend-issued | No | No |
| Tenant settings bag | No | `/pos/settings` = hardware | — | No |

**Verdict:** **NO CHANGE** for Phase 4.

---

## 19. Platform Admin Impact

Wizard already collects country, currency, timezone, locale. Detail page can PUT those fields. System Settings edits platform `general.default_*`. No tenant_settings editor.

**Verdict:** **NO CHANGE** required. Optional: read-only provisioned-settings summary on tenant detail (roadmap “FE inspect”).

---

## 20. API Impact

| API | Method | Consumer | Exists? | Phase 4 Change? |
| --- | --- | --- | ---: | --- |
| Finalize / wizard create | POST | Platform Admin | Yes | MODIFY — call settings provider in TX |
| Platform settings | GET/PUT | Platform Admin | Yes | INSPECT / optionally feed defaults |
| Create-options | GET | Platform Admin | Yes | Possibly surface default tax mode etc. |
| Tenant Admin context | GET | Flutter TA | Yes | MODIFY — locale from tenant; optionally expose settings snapshot |
| Tenant settings CRUD | — | — | **No** | NEW read (MVP); update later with permissions |
| POS home / device context | GET | Cashier | Yes | NO CHANGE for MVP |
| Tax CRUD | Various | TA | Yes | NO CHANGE (not finalize seed of rates) |

Phase 4 minimum API: **provisioning only** + optional **read** for summary/context. Full Tenant Admin update API can follow once catalog + permissions are stable.

---

## 21. DB / Migration Impact

| Change | Required? |
| --- | ---: |
| New tables | No (prefer existing) |
| New columns on `tenant_settings` | Unlikely |
| Seed `setting_definitions` | **Yes** (data migration / seed) |
| Insert `tenant_settings` at finalize | **Yes** (runtime, not static migration per tenant) |
| Backfill existing tenants | Separate controlled job after catalog freeze | Planned, not silent overwrite |

**Migration Required:** **YES** (definition seed). Schema DDL: **NO** expected.

---

## 22. Transaction / Idempotency

**Target principle:**

```text
Tenant + subscription + entitlements + limits + bootstrap admin + mandatory default settings
= one finalize outcome
```

| Rule | Design |
| --- | --- |
| Failure | Missing required definition or unresolved required value → finalize fails / rolls back (Scenario 11) |
| Idempotency | Upsert by `(tenant_id, setting_definition_id)`; never overwrite non-default customized values on retry |
| Retry | Re-read existing tenant_settings; insert only missing keys |
| Uniqueness | Already enforced by DB unique index |

Onboarding vs non-onboarding create: both paths through `CreateTenantInternalAsync` must invoke the same provider.

---

## 23. Existing Tenant Compatibility

| Setting | Backfill Needed | Safe Automatically | Manual Review |
| --- | ---: | ---: | ---: |
| Currency/TZ/locale columns | Only if null | Yes (from platform defaults) | If multi-country tenants ambiguous |
| `tax.pricing_mode` | Yes | Yes if single platform default accepted | If tenants already selling with implicit opposite mode |
| Format / notification / branding policies | Yes | Yes (non-behavioural) | Low |
| Numbering policy | Yes | Yes if matches current lazy prefixes | If custom prefixes already in use |
| Document sequence rows | Only if runtime broken without them | Prefer lazy | Per tenant |
| Existing customized values | No overwrite | — | Preserve |

Do **not** silently overwrite. Prefer insert-if-missing repair job gated by ops.

---

## 24. Entitlement / Permission Rules

| Setting | Provisioner | View Permission | Update Permission | Cashier Access |
| --- | --- | --- | --- | --- |
| Currency/TZ/locale (tenant columns) | Finalize + PA edit today | Tenant context | Platform tenant update; later TA if entitled | Consume via APIs |
| Core `tenant_settings` | System finalize | `tenant.settings.manage` (already in menu catalog) | Same (when update API exists) | No direct; via projected runtime fields |
| Online store settings | Finalize iff entitled | Module permissions | Module permissions | N/A |
| Inventory behaviour | Finalize iff entitled | Inventory permissions | Inventory permissions | Indirect |
| Platform security defaults | System | Often non-editable | Platform only | No |
| Tax rates catalog | Not finalize | Tax permissions | Tax permissions | Consume calculated amounts |

Do not broaden permissions in Phase 4 beyond existing `tenant.settings.*` codes.

---

## 25. NFRs

| Area | Requirement |
| --- | --- |
| Security | Tenant-scoped reads/writes; no cross-tenant leakage; backend authority for defaults |
| Reliability | Same TX as finalize; fail closed on missing required keys |
| Performance | Load definitions once per finalize; context may cache settings snapshot later (avoid N+1) |
| Concurrency | Unique constraint + transactional insert; sequence row versioning remains separate |
| Auditability | Platform user ids on `tenant_settings`; provision audit event recommended |
| Backward compatibility | Existing tenants keep working; backfill optional and non-destructive |

---

## 26. Cross-Layer Impact Matrix

| Area | Backend | DB | Platform Admin | Tenant Admin Flutter | Cashier Flutter | Second Brain |
| --- | --- | --- | --- | --- | --- | --- |
| Currency | Required (harden + optional mirror) | No change | No change | No change | No change | Required (catalog) |
| Timezone | Required (harden + consistency) | No change | No change | No change | No change | Required |
| Locale | Required (null harden + context fix) | No change | No change | Possible | No change | Required |
| Tax | Required (mode setting) | Seed defs | No change | Deferred | Deferred | Required (default decision) |
| Receipt | Required (minimal policy) | Seed defs | No change | Deferred | No change | Required |
| Invoice | Deferred / N/A retail | — | No change | No change | No change | Clarify retail vs billing |
| Numbering | Required (policy) | Seed defs; sequences optional | No change | Deferred | No change | Required |
| Business Date | No change | No change | No change | No change | No change | Document derivation |
| POS Defaults | Possible (tax mode only) | Seed defs | No change | Deferred | No change | Required |
| Online Store Defaults | Entitlement-scoped / Possible | Seed defs | No change | Deferred | N/A | Required |

Legend used: Required / Possible / No change / Deferred / Not applicable.

---

## 27. Risks and Blockers

| ID | Risk | Blocking? | Mitigation |
| --- | ---: | ---: | --- |
| R1 | No canonical `setting_key` inventory in code or SB | Non-blocking if Phase 4 ships catalog as deliverable | Freeze MVP keys in implementation plan |
| R2 | Tax inclusive vs exclusive default unknown | Non-blocking product pick | Default exclusive unless LK fiscal policy says otherwise; document choice |
| R3 | Duplicating currency/tz/locale into settings vs columns | Non-blocking | Prefer columns as SoT; settings mirror optional |
| R4 | Receipt template graph unknown requirement | Non-blocking | Policy-only MVP |
| R5 | Context locale hard-code masks null tenants | Should fix in Phase 4 BE | Read tenant column |
| R6 | Cashier LKR hard-codes remain after Phase 4 | Accepted | Track as post-Phase-4 UX debt |
| R7 | Existing tenants without settings | Non-blocking | Insert-if-missing backfill job after catalog freeze |
| R8 | Unrelated SB local WIP | Process | Commit only Phase 4 audit/plan files |

No missing **table** foundation. Catalog emptiness is expected Phase 4 work.

---

## 28. Final Verdict

```text
READY WITH NON-BLOCKING DECISIONS
```

### Mandatory Phase 4 Settings (summary)

1. Non-null tenant currency, timezone, locale (columns; wire platform defaults).  
2. Seed `setting_definitions` MVP catalog.  
3. Transactionally provision required `tenant_settings` (tax mode, formats, receipt policy, numbering policy, notification/branding/security minimal defaults).  
4. Entitlement-gated module settings only when entitled.  
5. Idempotent finalize; Scenario 11 fail-closed.  
6. Optional context/read projection; no Cashier rewrite; PA/Flutter optional summary only.

### Recommended implementation branches (do **not** create in this audit)

| Repo | Branch | Need |
| --- | --- | --- |
| Backend | `feature/flow4-phase4-default-tenant-settings` | **REQUIRED** |
| Platform Admin | `feature/flow4-phase4-default-tenant-settings` | **NO CHANGE** (optional summary later) |
| Flutter | `feature/flow4-phase4-default-tenant-settings` | **NO CHANGE** for MVP (Tenant Admin **POSSIBLE** later) |
| Second Brain | `docs/flow4-phase4-implementation-tracking` | **REQUIRED** after sign-off |

### Phase 5 Status

```text
NOT STARTED
```

### Companion plan

`15_IMPLEMENTATION_TRACKING/ONEVERZ_PHASE_4_DEFAULT_TENANT_SETTINGS_IMPLEMENTATION_PLAN_2026-08-07.md`

---

## Evidence Index (primary)

- Backend WT: `worktrees/phase4-backend-audit` @ `4c069bb`
- `PlatformTenantService.Wizard.CreateTenantInternalAsync`
- `PlatformTenantRepository.Wizard.CreateTenantWizardAsync`
- `SettingDefinition` / `TenantSetting` entities + configurations
- `AddPlatformSettings` migration seeds
- `TenantAdminContextRepository` locale/currency fallbacks
- Flutter WT: `worktrees/phase4-flutter-audit` @ `8db5f74`
- PA WT: `worktrees/phase4-platform-admin-audit` @ `9e13169`
- SB: Flow 4 provisioning contract §6; roadmap Phase 4; foundation audit F-FOUND-004; tenant foundation tables doc
