<!-- title: External Product Enrichment Implementation Status -->
<!-- status: Completed with E2E validation 2026-09-23 -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: External Product Lookup / Category Mapping / Brand Mapping / Quick Add Brand -->
<!-- last_updated: 2026-09-23 -->

# External Product Enrichment Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | External Product Lookup + External Category Mapping + External Brand Mapping + Quick Add Brand |
| Module | CatalogProduct |
| Platform | Full Stack (Backend + Flutter) |
| Status | Implemented and Full Product Setup E2E-validated 2026-09-23 |
| Migration | `20260923102245_AddTenantExternalBrandMappings` (Brand Mapping only — Category Mapping migration `20260918042753_AddTenantExternalCategoryMappings` and cache migration `20260916212811_AddSharedProductMetadataCache` predate this work) |
| PR / Commit | Current working tree (uncommitted) |

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

## Persistent Development Database Note

`UnifiedCommerceDb` (the local Postgres server's persistent development database,
referenced by `appsettings.json`'s `ConnectionStrings:DefaultConnection`) does **not**
yet have the `20260923102245_AddTenantExternalBrandMappings` migration applied — its
latest applied migration as of 2026-09-23 is `20260922104917_SeedOneVerzeExpansionProducts`.
This is expected: no migration was applied against a real/persistent database as part
of this implementation or its validation; the migration was validated only against
fresh ephemeral PostgreSQL databases created per test run. `external_category_mappings`
in `UnifiedCommerceDb` exists and currently has 0 rows (read-only check, 2026-09-23) —
no corruption found.

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
- [[Brand_Collection_CRUD_Implementation_Status]]
