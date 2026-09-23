<!-- title: External Category Mapping -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-23 -->

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

## Resolution Order

```text
1. SAVED        — existing mapping row for (TenantId, Provider, ExternalCategoryKey),
                   only if the mapped tenant Category is still effectively selectable
2. EXACT        — exact normalized-name match against tenant Categories
3. NORMALIZED   — case/whitespace-normalized match
4. SIMILARITY   — up to 3 deduped suggestions, token-based
5. NONE         — no candidate; user must pick manually
```

**SIMILARITY is suggestion-only.** A similarity match is never auto-persisted as a
mapping. Only a mapping explicitly confirmed via a successful Product create becomes a
SAVED mapping (see Persistence below).

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

## Related

- [[../../12_INTEGRATIONS/External_Product_Lookup_Integration]]
- [[External_Brand_Mapping]]
- [[Tenant_Admin_Category_Management_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_010_Category_Decoupled_From_Department]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
