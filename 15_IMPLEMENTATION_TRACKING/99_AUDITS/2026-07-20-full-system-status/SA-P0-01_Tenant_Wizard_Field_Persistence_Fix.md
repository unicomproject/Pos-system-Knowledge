<!-- title: SA-P0-01 Tenant Wizard Field Persistence Fix -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P0-01 — Create Tenant wizard field persistence (COMPLETE)

## Status

**COMPLETE**

Evidence includes source fix, automated tests, local Development database migration apply, and runtime create/read/update verification against `UnifiedCommerceDb` @ `localhost:5432`.

Deployed/production database apply remains out of scope for this task (**not production-applied**).

## Branches

| Repo | Branch | Base commit |
|---|---|---|
| Unified-Commerce | `fix/platform-admin-tenant-wizard-field-persistence` | `f8cf0b3` |
| nytroz-pos-platform-admin | `fix/platform-admin-tenant-wizard-field-persistence` | `7eec3ad` |
| Pos-system-Knowledge | `docs/platform-admin-tenant-wizard-persistence-verification` | `79fdf95` |

## Root cause (confirmed)

| Field (API) | FE collected | FE sends | BE DTO | Persisted (before) | Returned (before) | Root cause |
|---|---|---|---|---|---|---|
| `defaultLocale` | Yes | Yes | Yes | No | Empty/hardcoded | No `tenants.default_locale` |
| `operatingMode` | Yes | Yes | Yes | No | Empty/`STANDARD` | No `tenants.operating_mode` |
| `businessType` | Yes | Yes | Yes | No | Always null | Profile create did not resolve code → id |
| `countryCode` | Yes | Yes | Yes | Address only | Via address | Address write path; conflict must be validated |

## Fix mapping

| Field | Persistence |
|---|---|
| `defaultLocale` | `tenants.default_locale` (nullable varchar(20)) |
| `operatingMode` | `tenants.operating_mode` (nullable varchar(40); `unified_epos` / `pos_online_store` / `pos_only`) |
| `businessType` | `tenant_profiles.business_type_id` → `business_types.business_code` |
| `countryCode` | `tenant_addresses.country_code` (primary REGISTERED address) |

## Country write-path rules

| Case | Behaviour |
|---|---|
| A — equal `countryCode` + `address.countryCode` | Succeeds; one primary address |
| B — top-level `countryCode` only | Succeeds; creates primary REGISTERED address so country is not dropped |
| C — conflicting codes | Rejected (`platform_tenants.validation_failed` on both fields) |

## Migration

- File: `20260720053000_AddTenantLocaleOperatingModeColumns`
- SQL: `ALTER TABLE tenants ADD default_locale varchar(20);` + `ADD operating_mode varchar(40);` (nullable)
- **Local Development DB (`UnifiedCommerceDb` @ localhost:5432):** **APPLIED** (targeted SA-P0-01 SQL + history row). Full `dotnet ef database update` blocked by unrelated pending seed migrations (`22001` image URL length) — pre-existing drift.
- **Production / live deployed DB:** not applied in this task.

## Runtime verification (2026-07-20)

| Item | Value |
|---|---|
| Backend | `http://localhost:5150` (Development) |
| Frontend proxy target | `http://localhost:5150` (`proxy.conf.json`) |
| Database | `UnifiedCommerceDb` / `postgres@localhost:5432` |
| Login | Development platform admin seed account |
| Create sample | `defaultLocale=en-GB`, `operatingMode=pos_only`, `businessType=retail`, `countryCode=GB` |
| Result | Create + details + name-only update + reload preserved all four; DB row matched; invalid locale rejected |

Note: local `business_types.business_code` was empty for the Retail row and was corrected to `retail` so create-options could expose the catalogue code (local data repair only).

## Tests (2026-07-20 verification run)

| Suite | Result |
|---|---|
| `dotnet build` Release | Pass |
| Unit `FullyQualifiedName~Platform` | **191** pass |
| ApiTests `FullyQualifiedName~Platform` | **100** pass |
| Integration `Platform\|SubscriptionBilling` | **172** pass |
| Angular `ng build` production | Pass (pre-existing style budget warnings) |
| Angular `ng test --watch=false` | **356/356** pass |

## API contract

Public JSON names unchanged. Validation extended for locale/mode/country catalogues and country consistency. Update does not clear omitted locale/mode.

## Related

- [[Super_Admin_Current_Status_Audit]]
- [[Super_Admin_Current_Status_Audit_Detail]]
- [[16_Platform_Tenant_Create_Wizard_Alignment]]
- [[02_Tenant_Foundation_UPDATED]]
