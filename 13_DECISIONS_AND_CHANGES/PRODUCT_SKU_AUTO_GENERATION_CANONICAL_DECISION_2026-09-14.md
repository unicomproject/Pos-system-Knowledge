<!-- title: Product SKU Auto Generation Canonical Decision -->
<!-- status: Approved -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-14 -->

# Product SKU Auto Generation Canonical Decision — 2026-09-14

## Decision

Product Setup no-barcode Step 1 **Auto Generate SKU** allocates one stable,
tenant-scoped Product SKU base:

```text
{CATEGORY_CODE}-{TENANT_PRODUCT_SEQUENCE:000000}
```

The backend resolves the selected assignable Category's persisted
`categories.category_code`; Flutter never submits or derives the code. The
sequence is tenant-wide, monotonic, concurrency-safe, outlet-independent, and
allocated once per explicit generation. Gaps are allowed.

This decision supersedes B5's `SKU-{product-name stem}` / `SKU-NB` candidate
format and its no-sequence rule for `NO_BARCODE_PRODUCT`. The existing endpoint
is extended, not duplicated. Historical B5 evidence remains historical truth.

## Product-type-aware lifecycle

| Product structure | Final SKU |
|---|---|
| `SIMPLE` | `{PRODUCT_BASE}` |
| `VARIANT` | `{PRODUCT_BASE}-{ORDERED_VARIANT_VALUE_CODES}` |
| `BUNDLE` | No new AUTO formula in this change; preserve the existing identifier contract |

Step 1 does not know Product Structure. It therefore allocates only the common
base. Step 3 selects structure. Step 5 finalizes the normal
`product_variants.sku` identities without allocating another sequence.

All variants of one Product share the same base and sequence. Variant suffixes
use persisted `product_option_values.value_code`, ordered by
`product_options.sort_order`, then `product_options.option_code`. Value labels
and dictionary/database return order are not SKU authority.

## Persistence and ownership

- Step 1 response is retained by the client and persisted at scanner-first
  DRAFT creation in existing
  `product_setup_scan_context.generated_sku_candidate`.
- That field is the draft AUTO base and survives navigation, save, reopen, and
  `GET /setup`; reads never allocate or regenerate.
- Final sellable ownership remains `product_variants.sku`.
- No `products` SKU column and no `product_skus` table are introduced.
- `UNIQUE (tenant_id, sku) WHERE sku IS NOT NULL` remains final race protection.

## AUTO and MANUAL

AUTO is the default for the Step 1 no-barcode flow. A clearly user-edited Step 5
SKU is MANUAL and must not be overwritten. A base-only/default assignment may be
server-finalized as AUTO. Both modes end in the same `product_variants.sku`
validation and persistence.

## Category and structure changes

- Category display-name changes do not affect SKU.
- If the selected Category changes before finalization, an allocated AUTO base
  is stale. Step 5 rejects it. Explicit regeneration reuses the existing
  `sku-candidates/generate` route with `productId` + `expectedRowVersion` and
  replaces only the no-barcode scan-context base.
- `SIMPLE → VARIANT` and `VARIANT → SIMPLE` reuse the same Product base.
- Duplicate Product clears final SKU and does not copy scan context/base; a new
  explicit AUTO generation receives a new tenant sequence.

## Errors

- Missing/inactive/unassignable Category or missing `category_code`: reject
  AUTO generation with a field error on `categoryId`.
- Missing/invalid Variant `value_code`: reject Step 5 AUTO finalization.
- Generated values are uppercase, hyphen-separated, at most 100 characters,
  and have no empty/double/trailing separator.
- Publish validates persisted final SKUs but never allocates a sequence.

## Permissions and scope

Reuse `catalog.products.create` + `product_catalog` for Step 1 generation and
the existing Product Setup identifier permissions for Step 5. Barcode behavior,
Flutter implementation, and a BUNDLE AUTO formula are outside this change.

## Authority links

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
