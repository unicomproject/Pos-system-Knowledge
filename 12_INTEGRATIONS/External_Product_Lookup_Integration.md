<!-- title: External Product Lookup Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-24 -->

# External Product Lookup Integration

## Purpose

Canonical architecture for enriching Tenant Admin Product Setup from external product
data providers when a scanned/entered barcode has no local tenant catalog match.
Covers provider priority, the shared cache, provider-identity rules, and how this
integration hands off into [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
and [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]].

## Canonical Flow

```text
Barcode Scan
    ↓
Local Tenant Catalog Lookup
    ├─ FOUND → use tenant product (external lookup never runs)
    └─ MISS
         ↓
External Provider Coordinator (priority order, shared cache)
    ↓
OpenFoodFacts
    ↓ (NO_MATCH / TEMPORARY_FAILURE)
UPCitemdb (fallback, only when enabled)
    ↓
Canonical ExternalProductSuggestion
    ↓
Category Resolution   ([[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]])
    ↓
Brand Resolution      ([[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]])
    ↓
Flutter Product Setup (user review / override / Quick Add Brand)
```

**IMPLEMENTED and E2E-validated (2026-09-23):** once a Product is created locally for a
barcode, the same barcode resolves from the tenant catalog on every subsequent scan and
external providers are never called again. This is a structural guarantee, not just a
behavioral one — the local-resolution code path (`ResolveBarcodeAsync`) has no
dependency on the external coordinator at all.

## Provider Priority

```text
1. openfoodfacts
2. upcitemdb (controlled fallback — see Provider Configuration below)
```

| Provider result | Coordinator behavior |
|---|---|
| `FOUND` | Stop, return this provider's result. Does not consult lower-priority providers. |
| `NO_MATCH` | Try next provider in priority order. |
| `TEMPORARY_FAILURE` | Try next provider in priority order. |
| All providers exhausted | Existing conservative final-status rule applies (no provider is treated as authoritative by default; result reflects what was actually observed). |

OpenFoodFacts and UPCitemdb are **not** equal-priority and their results are **never**
merged into a single suggestion. Each provider's result is used as-is, or the next
provider is tried — there is no field-level combination across providers.

## Provider Configuration

**Production/base (`appsettings.json`):**

```text
openfoodfacts = Enabled: true,  Priority: 1
upcitemdb     = Enabled: false, Priority: 2
```

**Development (`appsettings.Development.json`):**

```text
openfoodfacts = Enabled: true,  Priority: 1
upcitemdb     = Enabled: true,  Priority: 2
```

UPCitemdb is a **controlled fallback provider** — it is not automatically enabled in
every environment. It defaults to disabled in production and is enabled only in
development, by explicit configuration.

**Current production override in use:**

```text
ExternalProductLookup__Providers__1__Enabled=true
```

**Warning:** `Providers` is a JSON **array**, and the environment-variable override
above addresses it by numeric index (`__1__` = the second array element, currently
`upcitemdb`). If the provider ordering in `appsettings.json` ever changes, this
deployment override's index **must** be reviewed — it will silently target the wrong
provider otherwise.

**Allowlist semantics (IMPLEMENTED and tested):** a provider that is *configured*
(present in the `Providers` array, even with `Enabled: false`) keeps its historical
`ExternalCategoryMapping` / `ExternalBrandMapping` rows valid for resolution and
persistence, even while it is disabled and not participating in new lookups. A
provider must be *configured* to be allowlisted — an unconfigured/unknown provider
name is always rejected. Disabling a provider does not invalidate mappings already
saved under its provider key.

## sourceProvider vs retrievalSource

This distinction is load-bearing and must not be collapsed.

```text
sourceProvider
= the actual external provider that produced the metadata
  Examples: "openfoodfacts", "upcitemdb"
  Survives cache hits — always the real provider identity.

retrievalSource
= how this specific result was served this call
  Values: "PROVIDER" | "CACHE"
```

| Scenario | sourceProvider | retrievalSource |
|---|---|---|
| Fresh lookup, provider called | `openfoodfacts` | `PROVIDER` |
| Same barcode, second lookup within TTL | `openfoodfacts` | `CACHE` |

**`"cache"` is never a provider identity.** `sourceProvider` must always be derived
from the real provider that originally produced the cached data — never the literal
string `"cache"`. This was verified live: a fresh lookup and a cache-hit lookup for
the same barcode both reported `sourceProvider = "openfoodfacts"`; only
`retrievalSource` changed (`PROVIDER` → `CACHE`).

Category and Brand resolution both derive their `provider` value from `sourceProvider`
— never from `retrievalSource` and never from a literal `"cache"` string. This keeps
mapping identity correct regardless of whether a given lookup was served fresh or from
cache.

## Shared Metadata Cache

Table: `shared_product_metadata_cache` (see
[[../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]).

```text
Cache write key : (normalized_barcode, provider) — unique, provider-scoped
Cache read      : provider-scoped, inside the provider-priority loop
Cached results  : only FOUND results are cached
Not cached      : NO_MATCH is never cached
TTL             : global 30-day value (ExternalProductLookup:Cache:TtlDays), currently 30
```

Because the cache key includes `provider`, an OpenFoodFacts cache entry for a barcode
can never be served as if it were UPCitemdb data (or vice versa) — each provider has
its own cache row per barcode.

## OpenFoodFacts Provider

Primary provider (`Priority: 1`, enabled in all environments).

**IMPLEMENTED:**

```text
Strongest current structured category metadata of the two providers
categories_tags / categories_hierarchy support (feeds Category Resolution)
BrandText remains free-text in the current implementation
```

**Not implemented (future enhancement only, do not treat as active):**

```text
brands_tags — OpenFoodFacts does expose a semi-structured brands_tags field,
but the current integration does not consume it. Brand identity is derived
entirely from the free-text brand field. See
[[../13_DECISIONS_AND_CHANGES/ADR/ADR_011_External_Brand_Identity_Normalized_Text_Key]]
for why, and the future migration path if brands_tags is adopted later.
```

## UPCitemdb Provider

Second/fallback provider (`Priority: 2`). Broader generic retail coverage than
OpenFoodFacts. Production disabled by default, development enabled — see
Provider Configuration above.

**Mapped useful metadata:**

```text
title
description
brand
category display text
size
image
barcode identifiers
```

**Explicitly excluded from the mapped metadata (not implemented, not planned for this
integration):**

```text
offers
merchant pricing
external marketplace prices
shipping
availability
lowest/highest recorded price
```

Tenant pricing remains authoritative at all times — UPCitemdb (or any external
provider) is never a pricing source.

**Category text is not used for External Category Mapping:** UPCitemdb's category
display text is surfaced to the user as informational only. It does **not** feed
[[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]], because the
current UPCitemdb integration exposes no stable provider category key equivalent to
OpenFoodFacts' `categories_tags` — only free-text. Mapping on unstable free text would
produce noisy, non-reusable category keys, so it is deliberately excluded rather than
approximated.

## Enrichment Resilience (added 2026-09-24)

**Root cause this closes:** a live PostgreSQL exception thrown while resolving
Category or Brand mapping (e.g. a table missing because a migration had not yet been
applied to a given environment) previously propagated all the way out of
`ExternalLookupBarcodeAsync`, turning an already-successful external product lookup
(`status: FOUND`, a real product suggestion in hand) into an unhandled HTTP 500. The
Flutter client only ever saw a generic "An unexpected error occurred." banner and lost
the entire lookup result — including the perfectly good product suggestion and any
Category resolution that had already succeeded.

**Fix — scoped enrichment resilience:**

```text
External provider lookup succeeds (status: FOUND)
    ↓
Category resolution                       ← wrapped, try/catch
    success → categoryResolution populated normally
    failure → categoryResolution = null, warning logged, lookup CONTINUES
    ↓
Brand resolution (only when BrandText present)   ← wrapped, try/catch
    success → brandResolution populated normally
    failure → brandResolution = null, warning logged, lookup CONTINUES
    ↓
HTTP 200, status: FOUND, product suggestion always present
```

**This is scoped enrichment resilience, not a blanket exception swallow.** Only the two
enrichment calls (Category resolver, Brand resolver) are wrapped — each in its own
`try/catch (Exception ex) when (ex is not OperationCanceledException)`. Do not describe
this as "all exceptions are ignored":

```text
Still propagates normally (NOT swallowed):
  - A failure in the primary external provider lookup itself
    (IExternalProductLookupCoordinator.LookupAsync)
  - OperationCanceledException from either enrichment resolver — cancellation is a
    request-lifecycle signal, not an enrichment failure, and is explicitly excluded
    from the catch filter so it still propagates/cancels the request as normal
  - Any exception outside the two enrichment call sites (validation, auth, etc.)

Swallowed and degraded to null (enrichment resilience):
  - Category resolver throwing for any reason (schema drift, transient DB issue, etc.)
  - Brand resolver throwing for any reason
```

**Verified runtime example (2026-09-24, live):** before the pending
`AddTenantExternalBrandMappings` migration was applied to a given environment's
persistent database, a barcode whose provider result carried brand text (e.g.
`7613032655495`, "Nestlé, Ricore, Ricoré") reproduced exactly this failure —
`Npgsql.PostgresException 42P01: relation "external_brand_mappings" does not exist`
inside `ExternalBrandMappingRepository.GetAsync`, surfacing as a 500. After this fix,
the same request (even with the table genuinely absent) returns `200 OK`,
`status: FOUND`, the full product suggestion, and `brandResolution: null` — Quick Add
Brand remains available, which is the correct fallback when brand enrichment
genuinely could not run.

## External Provider Data Quality Note

OpenFoodFacts is community-edited and its `categories` / leaf category fields can be
mixed-language, inconsistently cased, or simply not the most "obvious" tag for a
product — this is provider data quality, not a OneVerz defect. Do not label provider
locale noise as a OneVerz bug; if the raw provider fields themselves are inconsistent
or wrong, that is a **PROVIDER DATA ISSUE**, distinct from a **ONEVERZ
ADAPTER/NORMALIZER BUG** (a case where OneVerz has correct provider data but
misprocesses it) — keep these two categories separate when triaging a
mapping/suggestion complaint.

**Observed example (barcode `5449000000996`, live 2026-09-24):** the provider's own
leaf category tag for this exact Coca-Cola product was `pt:bebidas cafeína`
(Portuguese, not English, and not obviously "Colas") — yet the same product's
`categories_hierarchy` still correctly contained `en:beverages` further up the chain.
This is exactly why [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]'s
hierarchy-aware matching improves real-world coverage: even when the provider's leaf
tag/name is locale-noisy or otherwise unhelpful, a broader, cleaner hierarchy node
further up the same path can still produce a useful, textually-grounded suggestion.

## Related

- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]]
- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Product_Setup_External_Enrichment_UX]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_011_External_Brand_Identity_Normalized_Text_Key]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
- [[Integration_Overview]]
