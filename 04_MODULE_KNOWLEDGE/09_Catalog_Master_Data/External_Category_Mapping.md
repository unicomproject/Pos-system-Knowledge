<!-- title: External Category Mapping -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-24 -->

# External Category Mapping

## Purpose

Canonical document for how an external provider's category (e.g. OpenFoodFacts
`categories_tags`) is remembered against a tenant's own Category, so future lookups of
the same external category resolve automatically instead of re-prompting the user
every time. This document did not previously exist in the Second Brain; the feature
was implemented and E2E-validated before this doc was written.

## Entity / Table

```text
Entity : ExternalCategoryMapping
Table  : external_category_mappings

Unique identity : (TenantId, Provider, ExternalCategoryKey)
Tenant-safe FK  : (TenantId, TenantCategoryId) → categories(TenantId, Id)
MappingSource   : "PRODUCT_CONFIRMED" (default)
```

Full column-level schema: see `external_category_mappings` in
[[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]].

## Resolution Order (updated 2026-09-24 — hierarchy-aware)

```text
1. SAVED                 — existing mapping row for (TenantId, Provider, ExternalCategoryKey),
                            only if the mapped tenant Category is still effectively selectable
2. LEAF_EXACT             — exact normalized-name match against tenant Categories,
                            using the provider's own leaf category name (ExternalCategoryName)
3. LEAF_NORMALIZED        — punctuation-stripped, diacritic-folded match on the leaf name
4. HIERARCHY_EXACT        — exact match against a node in ExternalCategoryHierarchy
                            (deepest/most-specific node checked first)
5. HIERARCHY_NORMALIZED   — punctuation-stripped, diacritic-folded match on a hierarchy node
6. LEAF_SIMILARITY        — conservative token overlap / substring match on the leaf name
7. HIERARCHY_SIMILARITY   — same conservative check, against hierarchy nodes
8. NONE                   — no candidate; user must pick manually
```

This replaces the earlier simpler `SAVED → EXACT → NORMALIZED → SIMILARITY → NONE`
ladder. The LEAF_* tiers behave exactly as the old EXACT/NORMALIZED/SIMILARITY tiers
always did (same comparison logic, renamed for clarity now that a second axis exists);
nothing about leaf-only matching changed. The four new HIERARCHY_* tiers are additive:
they only ever fire when a stronger LEAF_* tier didn't already find a candidate, and a
category matched by an earlier (stronger) tier is never re-added by a later one — each
suggestion is deduplicated to the strongest tier that found it.

**All tiers except SAVED are suggestion-only.** No non-SAVED match — LEAF or
HIERARCHY, EXACT/NORMALIZED/SIMILARITY alike — is ever auto-persisted as a mapping or
auto-selected as the Product's Category. Only a mapping explicitly confirmed via a
successful Product create becomes a SAVED mapping (see Persistence below). This is
deliberate for HIERARCHY matches in particular: a hierarchy node like "Beverages" is a
much broader concept than the actual product, so it must always require the user's
explicit confirmation before becoming authoritative — see Hierarchy-Aware Matching
below.

## Hierarchy-Aware Matching (added 2026-09-24)

**Root cause this closes:** the resolver previously only ever compared the provider's
single leaf category name/key (`ExternalCategoryName` / `ExternalCategoryKey`) against
tenant Categories. `ExternalCategoryHierarchy` (the provider's full category path, e.g.
OpenFoodFacts' `categories_hierarchy`) was already present on the request DTO but was
never read by the matching logic. A tenant that had a broad, generic Category like
"Beverages" — but no Category matching the specific product's leaf category text —
never got any suggestion at all, even though "Beverages" was right there in the
provider's own hierarchy.

**How it works:**

```text
External hierarchy (broadest → deepest, as providers supply it):
  Beverages And Beverages Preparations
  → Beverages
  → Carbonated Drinks
  → Sodas
  → Colas

Tenant has: Beverages

Result: Beverages returned as a suggestion, matchType = HIERARCHY_EXACT
```

Each hierarchy node is converted to a comparable display-like name (a leading 2–3
letter provider locale prefix such as `en:` is stripped, hyphens/underscores become
spaces — e.g. `en:carbonated-drinks` → `carbonated drinks`) and then run through the
**same** normalization pipeline already used for the leaf name (see Category Diacritic
Normalization below) — hierarchy nodes are never compared with a different
normalization stack than leaf names.

**Deepest-first ranking, max 3, deduped:** hierarchy nodes are evaluated
most-specific-first. If a tenant has `Beverages`, `Carbonated Drinks`, and `Sodas`, and
all three appear in the external hierarchy, the returned suggestion order is:

```text
1. Sodas               (deepest match)
2. Carbonated Drinks
3. Beverages            (broadest match)
```

At most 3 suggestions are ever returned, and a tenant Category is never returned more
than once even if it matches at multiple tiers or multiple hierarchy nodes.

**Hierarchy matching is textual, not semantic.** A hierarchy node only produces a
suggestion when its (normalized/diacritic-folded, or token-overlapping) text actually
matches a tenant Category name. A tenant Category like "Food" is never suggested for a
beverage product just because the two concepts are related — only actual text overlap
with a hierarchy node counts. This is provider-hierarchy-aware textual matching, not AI
semantic classification (see Known Limitation below).

**Mapping identity is unaffected.** A hierarchy match never changes what gets
persisted as the mapping key. If the user accepts a `HIERARCHY_EXACT` suggestion of
"Beverages" (matched via the hierarchy node `en:beverages`), the saved
`ExternalCategoryMapping` row still uses the provider's actual **leaf**
`ExternalCategoryKey` (e.g. `en:instant-mix-of-chicory-and-coffee-powder`), never the
parent hierarchy node's key. `(TenantId, Provider, ExternalCategoryKey)` continues to
mean exactly what it always meant.

**Known limitation:** textual/provider-hierarchy-aware matching only. A tenant
Category named "Drinks" will not match an external hierarchy that only ever says
"Beverages" unless a similarity rule (token overlap/substring) happens to cover that
pair — there is no synonym dictionary or AI semantic layer. This is an accepted R1
scope boundary, not an oversight.

## Category Diacritic Normalization (added 2026-09-24)

`LEAF_NORMALIZED`, `HIERARCHY_NORMALIZED`, `LEAF_SIMILARITY`, and `HIERARCHY_SIMILARITY`
now fold Unicode diacritics before comparing (e.g. `Café` → `Cafe`), so a tenant
Category entered without an accent still matches provider text that includes one.

```text
External: "Café"       Tenant: "Cafe"      → matches at NORMALIZED tier (not EXACT)
```

**EXACT tiers (`LEAF_EXACT`, `HIERARCHY_EXACT`) deliberately stay diacritic-strict** —
they compare the normalized (case/trim only) text byte-for-byte, so an exact,
identical-text tenant Category name is never conflated with a merely
accent-insensitive one. This mirrors the identical rationale documented for Brand in
[[External_Brand_Mapping]].

**Comparison-only.** This normalization exists purely inside the matching logic. No
persisted Category name is ever rewritten, re-cased, or has its diacritics stripped by
this feature.

## Persistence Rule

```text
External lookup → returns a resolution only. Does NOT save a mapping.

User selects the final Category on the wizard.

Product create succeeds → mapping upsert happens inside the SAME DB transaction
                           as the Product graph.

Product create fails    → mapping upsert rolls back with everything else.
```

The Category the user actually confirms at Product create time is authoritative — not
the resolver's suggestion. If the user overrides a SIMILARITY suggestion and picks a
different Category, the mapping saved is to the user's final choice, not the
suggestion.

## Mapped Category Validity

```text
Saved mapping target effectively selectable (Category + all ancestors ACTIVE)
    → use mapped Category

Target INACTIVE / DELETED / ancestor inactive
    → ignore saved target, fall through to EXACT/NORMALIZED/SIMILARITY/NONE

The mapping row itself is never auto-deleted just because its target
became unselectable.
```

## Provider and Tenant Isolation

```text
openfoodfacts:en:colas  and  upcitemdb:en:colas
    → separate external identities (Provider is part of the unique key)
    → both may map to the same tenant Category; never globally deduplicated

Tenant A: openfoodfacts:en:colas → Category A
Tenant B: openfoodfacts:en:colas → Category B
    → no sharing between tenants (TenantId is part of the unique key)
```

Flutter never supplies `TenantId` when creating a mapping — the authenticated tenant
context is authoritative, matching the rest of the tenant-scoped API surface.

## Verified Runtime Example (2026-09-24)

Live HTTP call against a real Postgres tenant (`DEV-TENANT-001`) and the live
OpenFoodFacts API, barcode `5449000000996` (Coca-Cola):

```text
sourceProvider           : openfoodfacts
externalCategoryKey      : pt:bebidas cafeína   (the provider's actual leaf tag for
                            this product — see External Provider Data Quality Note
                            in [[../../12_INTEGRATIONS/External_Product_Lookup_Integration]])
externalCategoryHierarchy: en:beverages-and-beverages-preparations, en:beverages,
                            en:non-alcoholic-beverages, en:carbonated-drinks,
                            en:soft-drinks, en:sodas, en:colas, pt:bebidas cafeína
tenant Category           : Beverages

categoryResolution.mappedCategory : null
categoryResolution.suggestions    : [{ name: "Beverages", matchType: "HIERARCHY_EXACT" }]
```

The leaf key/name (`pt:bebidas cafeína`) has no textual relation to any tenant
Category — this is exactly the scenario Hierarchy-Aware Matching above was built for.
The suggestion was found several nodes up the hierarchy, correctly deepest-first
(it stopped at `en:beverages`, having already found no match at `en:colas`,
`en:sodas`, `en:soft-drinks`, or `en:carbonated-drinks`), and remained a suggestion
only — `mappedCategory` stayed `null`.

## Related

- [[../../12_INTEGRATIONS/External_Product_Lookup_Integration]]
- [[External_Brand_Mapping]]
- [[Tenant_Admin_Category_Management_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
