<!-- title: External Brand Mapping -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- last_updated: 2026-09-23 -->

# External Brand Mapping

## Purpose

Canonical document for how an external provider's brand text is remembered against a
tenant's own Brand, mirroring
[[External_Category_Mapping]] wherever the two features are architecturally
identical, and documenting where Brand deliberately diverges (normalized-text key
instead of a provider category key, because no stable Brand ID is available from
either implemented provider adapter).

## Entity / Table

```text
Entity : ExternalBrandMapping
Table  : external_brand_mappings

Unique identity : (TenantId, Provider, ExternalBrandKey)
Tenant-safe FK  : (TenantId, TenantBrandId) → brands(TenantId, Id)
MappingSource   : "PRODUCT_CONFIRMED" (default)
```

Full column-level schema: see `external_brand_mappings` in
[[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]].

## External Brand Key Strategy (R1 Decision)

**Decision: NORMALIZED TEXT KEY.** Neither OpenFoodFacts nor UPCitemdb expose a
sufficiently stable Brand ID in their currently implemented adapters, so the mapping
key is derived from the provider's free-text brand field rather than a provider ID.
Full rationale, alternatives, and the future migration path are recorded in
[[../../13_DECISIONS_AND_CHANGES/ADR/ADR_011_External_Brand_Identity_Normalized_Text_Key]].

**Derivation pipeline:**

```text
BrandText (raw provider field, may contain multiple comma-separated values)
    → first meaningful comma-separated segment only (no parent-company inference)
    → trim
    → lowercase
    → punctuation characters replaced with spaces
    → collapse repeated whitespace
    → ExternalBrandKey
```

**Example:**

```text
BrandText           : "Coca-Cola, The Coca-Cola Company"
externalBrandName    : "Coca-Cola"   (first segment, trimmed, original casing kept)
externalBrandKey     : "coca cola"   (normalized)
```

Multi-value handling is deliberately conservative: only the first comma-segment is
used. The system never infers a parent-company relationship from later segments, and
never merges multiple segments into one key.

**Known limitation (documented, not hidden):** a normalized text key is **not** a
globally stable legal-brand identifier. Different phrasings of the same real brand
(e.g. punctuation, legal-entity suffixes, casing) can normalize to different keys, and
this is expected/accepted behavior for R1 — the SIMILARITY suggestion tier exists
specifically to help a user reconcile near-duplicate text keys against one tenant
Brand.

## Resolution Order

```text
1. SAVED        — existing mapping row for (TenantId, Provider, ExternalBrandKey),
                   only if the mapped tenant Brand is still ACTIVE
2. EXACT        — exact normalized-name match against tenant Brands
3. NORMALIZED   — case/whitespace-normalized match
4. SIMILARITY   — up to 3 deduped suggestions, token-based (stopword-filtered)
5. NONE         — no candidate; user must pick manually or Quick Add
```

Identical resolution ladder to Category, except the "still valid" check for Brand is a
flat ACTIVE-status check (`BrandBelongsToTenantAsync`) — Brand has no hierarchy, unlike
Category's ancestor-chain selectability check.

## Brand Mapping Authority Rule

**External Brand suggestion ≠ tenant master-data authority.** The authoritative value
is always the final Brand the user selects at Product create time — never the
resolver's suggestion, and never the raw external brand text.

```text
External text   : "Coca-Cola"
Resolver suggests: "Coca Cola" (SIMILARITY match against an existing tenant Brand)
User selects     : "The Coca-Cola Company" (a different existing tenant Brand)

Result:
  Product.brandId              = user's final Brand ("The Coca-Cola Company")
  external_brand_mappings row  → also points at user's final Brand
```

The mapping never diverges from what the user actually confirmed.

## Mapped Brand Validity

```text
Saved mapping target Brand ACTIVE
    → use mapped Brand as MappedBrand (0 suggestions returned)

Target INACTIVE / DELETED / missing
    → ignore saved target, fall through to EXACT/NORMALIZED/SIMILARITY/NONE
    → MappedBrand is null; a stale/invalid Brand is never returned as authoritative

The mapping row itself is never auto-deleted during a read just because its
target became invalid. It remains in the database, unmodified, and would
become authoritative again if the target Brand were reactivated.
```

**E2E-validated 2026-09-23** against a real Postgres database and a live external
provider: a saved mapping resolved correctly, then after the target Brand was set
INACTIVE, the next lookup returned `MappedBrand = null` while the mapping row was
independently confirmed still present in the database.

## Provider and Tenant Isolation

```text
openfoodfacts:coca cola  and  upcitemdb:coca cola
    → separate external identities (Provider is part of the unique key)
    → both may map to the same tenant Brand; never globally deduplicated

Tenant A: openfoodfacts:coca cola → Brand A
Tenant B: openfoodfacts:coca cola → Brand B
    → no sharing between tenants (TenantId is part of the unique key,
      enforced by the tenant-safe composite FK to brands(TenantId, Id))
```

Flutter never supplies `TenantId` when creating a mapping. Tenant isolation was
E2E-validated live: a mapping seeded for one tenant was confirmed to never appear as a
mapped Brand or as a suggestion when the same barcode/provider/key was resolved under a
different tenant.

## Related

- [[External_Category_Mapping]]
- [[../../12_INTEGRATIONS/External_Product_Lookup_Integration]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Product_Setup_External_Enrichment_UX]]
- [[../../13_DECISIONS_AND_CHANGES/ADR/ADR_011_External_Brand_Identity_Normalized_Text_Key]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Brand_Collection_CRUD_Implementation_Status]]
- [[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
