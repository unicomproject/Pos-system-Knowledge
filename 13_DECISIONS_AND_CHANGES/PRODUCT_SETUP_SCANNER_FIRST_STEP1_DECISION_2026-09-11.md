<!-- title: Product Setup Scanner-First Step 1 Decision -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-11 -->

> **Implementation status note (2026-09-12):** This decision record is preserved as written. Implementation status has advanced (Backend B1–B4); see [[../00_START_HERE/Current_Source_Of_Truth]] and [[../15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]].

# PRODUCT SETUP — SCANNER-FIRST STEP 1 DECISION (2026-09-11)

## Status

**ACCEPTED** — Second Brain documentation canonicalization.  
**Implementation:** not claimed. Ready for Backend/Flutter work against locked contracts below.

## Context

Tenant Admin Add Product was a fixed 7-step wizard with:

1. Basic Details → 2. Product Type & Tracking → 3. Units & Pack → 4. Product Configuration → 5. Barcode & SKU → 6. Pricing & Tax → 7. Review & Create

Product Setup UI references introduced a scanner-first acquisition experience with multiple internal panels that must **not** expand the global wizard beyond 7 steps. External product-data lookup and draft scan-context persistence were undefined.

## Decision

### D1 — Canonical 7-step order (LOCKED)

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration  
6. Pricing & Tax  
7. Review & Create  

Standalone global **Barcode & SKU** step is **SUPERSEDED**. Identifier domain rules survive under Step 5 Product Configuration + Step 1 acquisition.

### D2 — Step 1 is a state machine inside one global step

States S1-A…S1-G and recovery S1-R1…S1-R3 are documented in [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]. Not additional stepper items.

### D3 — Validation vs catalogue

GTIN checksum ≠ existence. Pipeline: preserve string → length/format → checksum → identifier format → tenant catalogue lookup. External lookup is explicit only.

### D4 — GTIN-14 representation (**SUPERSEDED 2026-09-12**)

> [!WARNING]
> **This decision was re-audited and CORRECTED.** Adding an allowed `barcode_type` code
> **`GTIN14`** conflated an *identifier standard* with a *physical symbology* and must
> **not** be implemented.
>
> **Current authority:** [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-2 (Option A):
> `barcode_type` stays symbology-only (gaining `UNKNOWN`), and the identifier standard moves
> to a **new nullable** `product_barcodes.identifier_standard` (`GTIN8`/`GTIN12`/`GTIN13`/`GTIN14`/`OTHER`).

Still valid from the original decision:
- Do not invent ITF-14 unless separately approved later.
- Do not map GTIN-14 to EAN13/UPCA.

### D5 — Draft creation timing (LOCKED)

Pre-draft until creation-path transition to Basic Details. Fresh drafts normally start at `current_setup_step = 2`. Persist scan context at draft creation. Do not create product rows for every random scan.

### D6 — TARGET table `product_setup_scan_context` (LOCKED)

New 1:1 draft table for acquisition mode, identifier candidate, formats, no-barcode reason, external outcome, normalized prefill snapshot, generated SKU candidate. Do not overload `product_structure`, `product_barcodes`, or `product_setup_initial_tracking`.

### D7 — APIs (LOCKED TARGET)

- `POST /api/v1/tenant-admin/products/barcodes/resolve`
- `POST /api/v1/tenant-admin/products/barcodes/external-lookup`
- Extend existing draft/setup/publish for scan-context hydrate
- Do not use POS `by-barcode` from Tenant Admin
- Unified draft save pipeline retained

### D8 — External lookup (LOCKED)

Provider-agnostic `IExternalProductLookupProvider` + coordinator service. No Flutter scraping/credentials. External data is suggestion-only. No auto-create Brand/Category/UOM. No specific commercial provider is approved by this decision.

### D9 — Auto-generate SKU exception (LOCKED)

Allowed for no-barcode bootstrap candidates only; never overwrite user edits; never fan-out one SKU to all variants; server uniqueness authoritative.

### D10 — Permissions (LOCKED)

Resolve/external lookup under `catalog.products.create` + `product_catalog`. Safe duplicate projection under create. View/Edit existing require view/update. Final identifier mutation still `catalog.barcodes.manage`. No new product permission for external lookup.

### D11 — Legacy draft migration (LOCKED)

| Old `current_setup_step` meaning | New mapping |
|---|---|
| 1 Basic Details | 2 Basic Details |
| 2 Type & Tracking | 3 Type & Tracking |
| 3 Units & Pack | 4 Unit & Pack |
| 4 Product Configuration | 5 Product Configuration |
| 5 Barcode & SKU | 5 Product Configuration (identifier section) |
| 6 Pricing & Tax | 6 Pricing & Tax |
| 7 Review & Create | 7 Review & Create |

Existing identifier assignments survive.

> **UPDATED 2026-09-12:** legacy drafts without scan context are represented by
> `acquisition_mode = 'LEGACY'` (the separate `bootstrap_kind = LEGACY_MANUAL` field was
> removed as duplication), and remapping happens in a **read-time compatibility layer in
> `GET .../setup`** rather than a destructive migration. See
> [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] TD-3 / TD-5.

Initial Tracking collection remains on **Product Type & Tracking** (now global Step 3). Filename `Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification` is historical naming; content must state Step 3 ownership.

### D12 — Duplicate clone semantics (LOCKED)

If offered: clone non-identifier data into new draft and clear SKU/GTIN; never two active records with same tenant barcode; not an alias for Edit.

## Consequences

- All active Product Setup docs must use the new step names/numbers.
- `Tenant_Admin_Product_Barcode_SKU_Specification.md` becomes a redirect/supersession stub to the identifier-domain spec.
- Implementation requires: resolve + external-lookup APIs, scan-context migration, Flutter Step 1 state machine, Step 5 identifier absorption, legacy draft mapping.
- Documentation readiness: **DOCUMENTATION CANONICALIZED — IMPLEMENTATION READY** (contracts locked; provider choice remains configurable TARGET without forcing guesswork on core Product Setup behaviour).

## Related

- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_SECOND_BRAIN_CANONICALIZATION_2026-09-11]]
