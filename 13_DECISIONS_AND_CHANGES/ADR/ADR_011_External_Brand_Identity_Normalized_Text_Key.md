<!-- title: ADR 011 - External Brand Identity Strategy for R1 -->
<!-- status: Accepted -->
<!-- date: 2026-09-23 -->
<!-- system: OneVerz POS MVP -->

# ADR 011 — External Brand Identity Strategy for R1

## Status

Accepted and implemented.

## Context

External Brand Mapping needs a stable key to remember "this external provider's brand
maps to this tenant's Brand" across future lookups, mirroring
[[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Category_Mapping]].

Category Mapping can lean on OpenFoodFacts' `categories_tags` — a semi-structured,
comparatively stable provider category identifier. Brand has no equivalent in either
currently implemented provider adapter:

```text
OpenFoodFacts : brand field is free text. A semi-structured brands_tags field exists
                on the OpenFoodFacts API but is not consumed by the current adapter.
UPCitemdb     : brand field is free text only; no provider brand ID exists at all.
```

Two options were available:

```text
R1 — Normalized text key
     Derive the mapping key by normalizing the provider's free-text brand field.

R2 — Provider-stable Brand ID
     Wait for / integrate a provider that exposes a real stable Brand identifier
     (e.g. adopt OpenFoodFacts brands_tags, or a future GS1/AI-matched Brand
     taxonomy), and key mappings off that ID instead of text.
```

## Decision

```text
DECISION:
Use R1 — a NORMALIZED TEXT KEY — for External Brand Mapping identity in R1.

RATIONALE:
Neither provider's currently implemented adapter exposes a sufficiently stable
Brand ID. Blocking Brand Mapping entirely until a provider-stable ID exists would
leave the feature undeliverable for R1. A normalized text key, combined with the
SIMILARITY suggestion tier and mandatory user confirmation before any mapping is
persisted, gives a workable and honest R1 experience.

SCOPE:
External Brand Mapping only. Does not change External Category Mapping (which
already uses a provider-supplied category key, not free text).
```

**Derivation:** first meaningful comma-segment of the provider's brand text (no
parent-company inference across segments) → trim → lowercase → punctuation to spaces →
collapse whitespace. Full pipeline and example:
[[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]].

## Alternatives Considered

- **R2 (provider-stable Brand ID):** rejected for R1 — no implemented provider
  currently exposes one; adopting OpenFoodFacts `brands_tags` was considered but
  deferred (see Future Migration Path).
- **Do not implement Brand Mapping for R1:** rejected — Category Mapping without an
  equivalent Brand Mapping would leave Brand resolution permanently manual, undermining
  the value of external enrichment during Product Setup.

## Consequences

**Accepted tradeoff:** a normalized text key is **not** a globally stable legal-brand
identifier. Different phrasings of the same real-world brand (punctuation, legal-entity
suffixes, casing, ordering of a multi-value field) can normalize to different keys and
therefore create separate mapping rows for what a human would consider "the same"
brand. This is a known, accepted limitation for R1, not an oversight.

**Mitigations already in place:**

- SIMILARITY suggestions (token-based, up to 3, deduped) help a user reconcile
  near-duplicate text keys against one tenant Brand instead of silently creating
  duplicates.
- A mapping is only ever persisted after explicit user confirmation via successful
  Product creation — the system never auto-creates or auto-maps a Brand from
  normalized text alone.
- Mapping identity is scoped `(TenantId, Provider, ExternalBrandKey)`, so key drift
  affects only future resolution convenience for that one tenant/provider pair — it
  never causes incorrect data to be written to a Brand record, and it never leaks
  across tenants or providers.

## Future Migration Path

If a provider-stable Brand ID becomes available (e.g. OpenFoodFacts `brands_tags` is
adopted, or a future GS1/AI Brand-matching integration is built — both currently
Deferred, see
[[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
§ Deferred), the migration path is additive: introduce the provider-ID key as a
preferred resolution tier ahead of SAVED-by-normalized-text, without needing to discard
or migrate existing normalized-text mapping rows (they simply become the fallback tier
for providers/records that still lack a stable ID).

## Runtime Status

**IMPLEMENTED** (2026-09-23). `ExternalBrandKeyDeriver` in
`E_POS.Application.Modules.Tenant.CatalogProduct.Services` implements the derivation
pipeline. E2E-validated against a real Postgres database and a live external provider
call — see
[[../../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]].

## Authority

- Implementation and E2E validation, 2026-09-23.
- [[../../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/External_Brand_Mapping]]
- [[../../12_INTEGRATIONS/External_Product_Lookup_Integration]]
