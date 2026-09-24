<!-- title: External Product Enrichment Implementation Status -->
<!-- status: Completed with E2E validation 2026-09-24 -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: External Product Lookup / Category Mapping / Brand Mapping / Quick Add Brand / Category Hierarchy Matching -->
<!-- last_updated: 2026-09-24 -->

# External Product Enrichment Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | External Product Lookup + External Category Mapping (hierarchy-aware) + External Brand Mapping + Quick Add Brand |
| Module | CatalogProduct |
| Platform | Full Stack (Backend + Flutter — Flutter required no change for the 2026-09-24 fixes) |
| Status | Implemented and Full Product Setup E2E-validated; latest runtime fixes committed and pushed 2026-09-24 |
| Migration | `20260923102245_AddTenantExternalBrandMappings` (Brand Mapping), `20260924080000_SeedInventoryTrackingPlatformFeature` (unrelated feature-catalog completeness fix, discovered during the same runtime debugging pass — see § 2026-09-24 below). Category Mapping migration `20260918042753_AddTenantExternalCategoryMappings` and cache migration `20260916212811_AddSharedProductMetadataCache` predate this work. |
| PR / Commit | `5a0922ed4b01b42d105c2a97ef7ea0b3f6c85b16` (branch `dev`) — "fix(catalog): improve external category and brand resolution" |

## Implemented Scope

```text
External Product Lookup          : COMPLETE
OpenFoodFacts Provider           : COMPLETE
UPCitemdb Provider               : COMPLETE
Multi-provider fallback          : COMPLETE
Provider-scoped cache            : COMPLETE
sourceProvider / retrievalSource separation : COMPLETE
External Category Mapping        : COMPLETE
External Brand Mapping           : COMPLETE
Quick Add Brand                  : COMPLETE
Transactional Category + Brand Mapping : COMPLETE
Full Product Setup E2E Validation : COMPLETE
```

- UPCitemdb production default changed to `Enabled: false`; development remains
  `Enabled: true`. Provider priority (openfoodfacts=1, upcitemdb=2) and the
  "configured but disabled" allowlist semantics (historical mappings stay valid even
  while a provider is disabled) were preserved and regression-tested.
- Full External Brand Mapping architecture implemented end-to-end mirroring External
  Category Mapping: entity, EF configuration, migration, repository, resolver,
  resolution DTOs, external-lookup integration, request-context validation, and
  transactional persistence.
- Quick Add Brand implemented in Flutter: permission-gated, wizard-native drawer,
  canonical `POST /api/v1/brands`, Brand persists independently of wizard cancellation,
  mapping does not.
- Full canonical documentation: see Related below. None of this existed in the Second
  Brain before 2026-09-23.

## E2E Validation Evidence (2026-09-23)

Real DI container (`AddApplication()` + `AddInfrastructure(config)`) against a real,
ephemeral PostgreSQL database, plus live HTTPS calls to the OpenFoodFacts public API
(barcode `5449000000996`). No `WebApplicationFactory`/HTTP/auth layer exists in this
repo yet, so this is genuine service-layer + real-DB + live-network coverage, not a
mocked simulation.

**Directly live-network-and-DB validated:**

- Fresh external lookup → cache hit (same barcode, second call): `sourceProvider`
  stayed `"openfoodfacts"` on both calls; `retrievalSource` correctly transitioned
  `PROVIDER` → `CACHE`; real `shared_product_metadata_cache` row confirmed.
- Saved Brand mapping resolution: seeding a mapping with the live-captured key made the
  next lookup return it as `MappedBrand` with 0 suggestions.
- Inactive-target fallback: deactivating the mapped Brand made the next lookup return
  `MappedBrand = null`, while the mapping row was independently confirmed still present
  in the database (never auto-deleted).
- Tenant isolation: a mapping seeded for Tenant A was confirmed to never leak as a
  mapped Brand or suggestion when the same barcode/provider/key was resolved under
  Tenant B.
- Local-match re-scan: a Product + ProductBarcode seeded directly, then
  `ResolveBarcodeAsync` returned `Outcome == "VALID_LOCAL_MATCH"` with zero external
  calls — structurally confirmed `ResolveBarcodeAsync` has no dependency on
  `IExternalProductLookupCoordinator` at all.

**Evidenced by existing/pre-existing automated suites (reused, not re-derived, to
avoid redundant coverage):**

- Atomic transaction commit for Product + Category mapping + Brand mapping together,
  and rollback of both mappings on Product-create failure.
- SIMILARITY suggestion generation/dedup/cap-at-3, provider isolation at the schema
  level (unique index), multi-value brand-text first-segment extraction, and
  no-BrandText safe-skip behavior.

**Evidenced only at Flutter widget-test level (explicit environment limitation, not a
defect):** Quick Add Brand tap-through and the permission-negative case. No real
device/browser session was used in this environment. See
[[../../../08_FLUTTER_POS_KNOWLEDGE/Product_Setup_External_Enrichment_UX]] § Manual
Validation Limitation.

## Automated Test Results (2026-09-23 full run)

| Suite | Result |
|---|---|
| Backend Unit (`E_POS.UnitTests`) | 2324/2325 — 1 flaky (`ExternalProductLookupCoordinatorTests.LookupAsync_Timeout_ReturnsTemporaryFailure`), reconfirmed 2/2 passing in an isolated rerun the same session → timing-sensitive pre-existing flake, not a regression caused by this feature |
| Backend API (`E_POS.ApiTests`) | 673/673 |
| Backend Integration — CatalogProduct (PostgreSQL, includes the new live E2E tests) | 148/148 |
| Flutter — `test/features/tenant_admin/products/` | 236/236 |
| Flutter — `test/features/tenant_admin/brands/` | 19/19 |
| `flutter analyze` (touched product + brand dirs) | 0 issues |

Do not restate the Unit suite as `2325/2325` unless a later clean full run actually
proves it — as of 2026-09-23 the flaky test has only been reconfirmed via isolated
rerun, not a clean full-suite run.

## Persistent Development Database Note (updated 2026-09-24 — was stale)

**This section previously said `AddTenantExternalBrandMappings` was not applied to
`UnifiedCommerceDb`. That is now out of date.**

As of 2026-09-24, `UnifiedCommerceDb` (the local Postgres server's persistent
development database) has applied, in order:

```text
20260922150431_SeedOneVerzeExpansionProductBarcodes   (unrelated product-catalog seed)
20260923102245_AddTenantExternalBrandMappings         (this feature)
20260924080000_SeedInventoryTrackingPlatformFeature   (see § 2026-09-24 below)
```

`external_brand_mappings` now genuinely exists as a table in `UnifiedCommerceDb` and
was exercised live (see § 2026-09-24 Runtime Fixes). `external_category_mappings`
still has 0 rows in this environment (no Product has yet confirmed a Category mapping
there) — that is expected, not corruption; mappings are only written on a successful
Product create, per the Persistence Rule in
[[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]].

This is local/persistent **development** database state, not a production deployment —
no migration was applied to any shared/production database as part of this work.

## 2026-09-24 Runtime Fixes (post-implementation hardening)

Discovered and fixed during real-UI runtime debugging of the already-implemented
feature above (not new scope — see commit `5a0922ed4b01b42d105c2a97ef7ea0b3f6c85b16`):

```text
1. External lookup enrichment resilience — a Category/Brand resolver failure
   (e.g. the external_brand_mappings table being absent) previously turned an
   already-successful external lookup into an unhandled HTTP 500. Now scoped
   try/catch around each enrichment call degrades that one resolution to null
   instead of failing the whole response. See
   [[../../../12_INTEGRATIONS/External_Product_Lookup_Integration]] § Enrichment Resilience.
2. Brand comparison diacritic folding — "Nestlé" now matches a tenant Brand stored
   as "nestle" at the NORMALIZED tier. See
   [[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]
   § Diacritic-Insensitive Comparison.
3. Category comparison diacritic folding — same fix, Category side. See
   [[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
   § Category Diacritic Normalization.
4. Category hierarchy-aware matching — a tenant Category matching a *parent* node
   of the provider's category hierarchy (e.g. "Beverages") is now suggested even
   when the provider's own leaf category has no textual match. Suggestion-only,
   never auto-persisted. See
   [[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
   § Hierarchy-Aware Matching.
5. `inventory_tracking` platform feature catalog seed — an unrelated but
   co-discovered entitlement defect: `PlatformTenantFeatureCodes.InventoryTracking`
   ("inventory_tracking") is a canonical Release-1 commercial feature code, referenced
   by existing code/migrations, but no migration had ever inserted its
   `platform_features` catalog row. This made the Product Setup wizard's
   Batch/Expiry/Serial tracking entitlement check fail closed as `UnknownFeature` for
   **every** tenant, surfacing as the same `product.entitlement_denied` /
   "Product management feature is not included in the tenant subscription." message
   used for a missing `product_catalog` entitlement — misleading, since the tenant
   may have full Product Catalog access. Migration
   `20260924080000_SeedInventoryTrackingPlatformFeature` seeds only the missing
   `platform_features` row (catalog completeness) — it does **not** grant the
   entitlement to any tenant or subscription plan; see § Entitlement Distinction
   below. See also [[../../../02_ACCESS_CONTROL/Feature_Entitlement_Matrix]] and
   [[../../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]],
   both corrected 2026-09-24 for the same finding.
```

### Entitlement Distinction (important — do not conflate)

```text
Plain manual Product create (no tracking toggles) → requires only product_catalog.
  Verified live: still 201 Created, unaffected by any of this.

Product Setup with Batch/Expiry/Serial tracking enabled, or any non-empty
initial batch/expiry/serial value → requires product_catalog AND inventory_tracking.
```

The migration seeds the platform feature **definition** only. It does not grant
`inventory_tracking` to every tenant and it does not add the feature to every
subscription plan automatically — which tenants/plans actually get this commercial
entitlement remains a Platform Admin / subscription decision, made through the normal
subscription plan feature management flow, not a data-repair concern.

**Development runtime validation note:** the DEV tenant used for this runtime
validation received a manual `inventory_tracking` entitlement grant
(`source_type = MANUAL`, `status = ENABLED`) directly in the persistent development
database, so the fix could be exercised end-to-end. This is environment state for one
local development tenant, not an architectural change, and is not reflected in any
migration or application code.

### Latest Automated Test Results (2026-09-24, fresh run — supersedes the 2026-09-23 counts above for current status)

| Suite | Result |
|---|---|
| `dotnet build` (full solution) | 0 warnings, 0 errors |
| Backend Unit (`E_POS.UnitTests`) | 2339/2339 |
| Backend API — CatalogProduct filter (`E_POS.ApiTests`) | 126/126 |
| Backend Integration — CatalogProduct (PostgreSQL, fresh-migrated ephemeral DB) | 148/148 |

Do not restate the 2026-09-23 table's `2324/2325` Unit count or `673/673` full API
count as current — those were a different (full-repo, not CatalogProduct-scoped) run
from a different date and remain historical evidence for that date only. The
2026-09-24 numbers above are the current verified baseline for this feature area.

**Runtime smoke (live, 2026-09-24):** barcode `5449000000996` (Coca-Cola) against
`DEV-TENANT-001` → `status: FOUND`, `categoryResolution.suggestions = [{"Beverages",
"HIERARCHY_EXACT"}]`, `brandResolution.suggestions = [{"coca cola", "SIMILARITY"}]`.

## Known Limitations / Deferred

```text
OpenFoodFacts brands_tags support     — Deferred (see ADR 011)
GS1 provider                          — Deferred
AI Brand matching                     — Deferred
Global Brand taxonomy                 — Deferred
Provider response merging/combining   — Deferred (by design — never merged)
Bulk Product Upload / Update          — Out of scope for this feature
UPCitemdb production enablement by default — Not planned; controlled fallback only
```

## Related

- [[../../../12_INTEGRATIONS/External_Product_Lookup_Integration]]
- [[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
- [[../../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Product_Setup_External_Enrichment_UX]]
- [[../../../13_DECISIONS_AND_CHANGES/ADR/ADR_011_External_Brand_Identity_Normalized_Text_Key]]
- [[../../../02_ACCESS_CONTROL/Feature_Entitlement_Matrix]]
- [[../../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[Brand_Collection_CRUD_Implementation_Status]]
