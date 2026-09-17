<!-- title: Product Setup Scanner-First Technical Contract Decision -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- supersedes_partial: PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11 D4 (barcode_type = GTIN14) -->

> **Implementation status note (2026-09-13):** This decision record is preserved as written (documentation-only at acceptance). Implementation status has advanced (Backend B1–B7). Write-stage numbering compatibility is locked separately in [[PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] (`persist_2_plus_write_map`). See [[../00_START_HERE/Current_Source_Of_Truth]] and [[../15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]].

# PRODUCT SETUP SCANNER-FIRST — TECHNICAL CONTRACT DECISION (2026-09-12)

## Status

**ACCEPTED — documentation only.** No Backend/Flutter code, no EF migration created or applied.

This is the **consolidated technical decision** for the scanner-first Product Setup. It verifies and, where required, **corrects** the 2026-09-11 decision: [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].

Scope: Step 1 API ownership, GTIN representation, scan-context persistence, draft boundary, legacy mapping, identifier ownership, no-barcode SKU, permission authority, external provider contract.

---

## TD-1 — Step 1 endpoint ownership and side effects (LOCKED)

| Endpoint | Responsibility | Side effects |
|---|---|---|
| `POST /api/v1/tenant-admin/products/barcodes/resolve` | Validate identifier structure/checksum + **tenant-scoped catalogue lookup** | **NONE** (read-only) |
| `POST /api/v1/tenant-admin/products/barcodes/external-lookup` | Provider-neutral external product-data suggestion | **NONE** (read-only) |
| `POST /api/v1/tenant-admin/products/sku-candidates/generate` | Pre-draft no-barcode AUTO Product base | No Product graph row; consumes one atomic tenant Product sequence per explicit generation |
| `POST /api/v1/tenant-admin/products/draft` | **Canonical** scanner-first wizard DRAFT create | **First Product persistence side effect** (`current_setup_step = 2` + scan context) |
| `PUT /api/v1/tenant-admin/products/{id}/draft` | Subsequent Steps 2–7 draft mutation | Draft mutation |
| `GET /api/v1/tenant-admin/products/{id}/setup` | Resume / hydrate | None |
| `POST /api/v1/tenant-admin/products/{id}/publish` | Final publish | Publish |
| `POST /api/v1/tenant-admin/products` | Direct/legacy graph create | **Not** the scanner-first wizard draft-bootstrap endpoint |

**Canonical resolve outcomes (LOCKED):**

```text
VALID_LOCAL_MATCH
VALID_NO_LOCAL_MATCH
INVALID
```

This supersedes the shorter `LOCAL_MATCH` / `NO_LOCAL_MATCH` wording used in earlier Chunk 1 text. The outcome name must state validity explicitly so `INVALID` never implies "looked up and not found".

**Separation rule:** external lookup must never run inside `resolve`. `resolve` must never perform tenant duplicate checking on behalf of `external-lookup`, and `external-lookup` must never perform tenant duplicate checking.

**Reuse rule:** the identifier validation + tenant catalogue resolution logic is one reusable application/domain service shared with POS lookup where responsibilities genuinely overlap. Tenant Admin must **not** call `GET /api/v1/pos/products/by-barcode/{barcode}` (POS device/outlet/till semantics). No duplicated validation implementation.

**No POS context:** Tenant Admin Product Setup resolve must not require `deviceId`, outlet, or till session.

---

## TD-2 — GTIN identifier vs barcode symbology (LOCKED — **OPTION A**)

### Current state

`product_barcodes.barcode_type varchar(40) NOT NULL` currently carries `EAN13`, `EAN8`, `UPCA`, `CODE128`, `CODE39`. Those are **symbology/encoding** concepts.

### Problem

The 2026-09-11 decision (D4) added **`barcode_type = GTIN14`**. That is **incorrect modelling**: GTIN-14 is an *identifier standard/length*, not a physical symbology. Storing it in the symbology column conflates two different concepts and would make `barcode_type` unusable for label printing/scanner semantics.

### Decision — OPTION A

**Keep `barcode_type` strictly as symbology. Represent identifier standard separately.**

| Concept | Owner | Allowed values |
|---|---|---|
| **Barcode symbology** | `product_barcodes.barcode_type` (EXISTING column) | `EAN13`, `EAN8`, `UPCA`, `CODE128`, `CODE39`, **TARGET** `UNKNOWN` |
| **Identifier standard** | `product_barcodes.identifier_standard` (**TARGET new nullable column**) | `GTIN8`, `GTIN12`, `GTIN13`, `GTIN14`, `OTHER`, NULL = unclassified |

Rules:

1. **`barcode_type = 'GTIN14'` is REJECTED and removed from all active documentation.** Chunk 1 D4 is superseded on this point.
2. `identifier_standard` is **derived** from the validated digit string (length + GTIN checksum). It is not free text.
3. Symbology is persisted only when genuinely known (scanner/provider reported, or unambiguous business rule). When a valid GTIN is captured with no reported symbology, persist **`barcode_type = 'UNKNOWN'`** rather than inventing `CODE128`, `EAN13`, or `ITF14`.
4. `ITF14` is **not** introduced by this decision. It may be added later only as a genuine symbology when a scanner/provider reports it.
5. Non-GTIN codes keep `CODE128` / `CODE39` with `identifier_standard = 'OTHER'`.
6. API/DTO field names: `identifierStandard` (identifier) and `barcodeType` (symbology). Earlier Chunk 1 DTO wording `identifierFormat` is an accepted synonym only if the repository already uses it; prefer `identifierStandard` for new work and use exactly one name per layer.

### Migration impact (TARGET — not created)

- **ADD** `product_barcodes.identifier_standard varchar(40) NULL`. Nullable, so **no backfill is required** and existing rows stay valid.
- **ADD** allowed symbology value `UNKNOWN` (documentation/validation-level allowed set; column type unchanged).
- **NO** change to `UNIQUE(tenant_id, barcode)`, FKs, or `quantity_per_scan`.
- Optional, idempotent derivation backfill for all-digit values with a valid checksum may be run later; it is **not** required for release and must never change `barcode` or uniqueness.

### Backward compatibility

- Existing rows: `identifier_standard IS NULL` means "not classified"; readers must tolerate NULL.
- Existing `EAN13` rows remain valid symbology values and may additionally be classified as `GTIN13` by the optional backfill.
- No consumer may treat `identifier_standard` as authoritative for label rendering, and none may treat `barcode_type` as authoritative for identifier arithmetic.

---

## TD-3 — Scan context persistence (LOCKED, reconciled)

`product_setup_scan_context` is **RETAINED** as a **TARGET** table, but the Chunk 1 field set is reconciled: it had both `acquisition_mode` and `bootstrap_kind` with overlapping value sets, and the two authorities (Scan spec vs DB Table 10) disagreed.

**One canonical field set (LOCKED):**

| Field | Purpose |
|---|---|
| `id`, `tenant_id`, `product_id` | Identity; `UNIQUE(tenant_id, product_id)` = 1:1 with Product DRAFT |
| `acquisition_mode` | `SCAN` \| `MANUAL` \| `NO_BARCODE` \| `LEGACY` — **single** mode field |
| `candidate_identifier` | Validated identifier string; leading zeros preserved; NULL for `NO_BARCODE`/`LEGACY` |
| `identifier_standard` | `GTIN8` \| `GTIN12` \| `GTIN13` \| `GTIN14` \| `OTHER` |
| `symbology_hint` | Reported symbology when known; else NULL. **Never** a GTIN value |
| `no_barcode_reason` | `OWN_MADE` \| `SERVICE_FEE` \| `UNLABELLED` |
| `external_lookup_status` | `NOT_STARTED` \| `FOUND` \| `NO_MATCH` \| `TEMPORARY_FAILURE` |
| `external_source_reference` | Provider-neutral reference; **never** credentials/tokens |
| `normalized_prefill_json` | Smallest normalized confirmed prefill needed for resume; **not** raw provider payload |
| `generated_sku_candidate` | No-barcode SKU candidate only |
| audit + `row_version` | Existing Product Core conventions |

**Removed:** the separate `bootstrap_kind` column (duplicated `acquisition_mode`) and `barcode_type_hint` (renamed `symbology_hint`, GTIN values forbidden). Legacy drafts are represented by `acquisition_mode = 'LEGACY'`.

**Lifecycle:** created with the Product DRAFT → updated while Step 1/Step 2 bootstrap is relevant → read on draft resume → **never** the final catalogue identity source after publish → follows Product draft delete/archive behaviour (cascade with product).

**Non-negotiable:** the scan context is **not** a barcode owner. Final barcode ownership stays `product_barcodes`; final SKU stays `product_variants.sku`.

---

## TD-4 — Draft creation boundary (LOCKED, unchanged from 2026-09-11 D5)

```text
PRE-DRAFT  : Step 1 resolve + external lookup (no product row)
BOUNDARY   : Use This Product | Create Manually | Continue with this Barcode |
             Continue to Basic Details (no-barcode)  →  create DRAFT + scan context
DRAFT      : Steps 2–6 on the existing unified draft persistence pipeline
PUBLISH    : Step 7 authoritative revalidation
```

Fresh drafts land on `current_setup_step = 2`. **One** persistence model serves scanner and manual paths — no parallel scanner-only persistence.

---

## TD-5 — Legacy draft remapping location (LOCKED)

Remapping is a **read-time compatibility layer in `GET /api/v1/tenant-admin/products/{id}/setup`**, not a destructive data migration.

Rationale: this reuses the existing precedent already documented for BUNDLE stale-step normalization (`GET setup` → detect → normalize `targetSetupStep`), so no new architecture is introduced and no historical row is rewritten.

| Old step | Old meaning | New step |
|---:|---|---:|
| 1 | Basic Details | **2** |
| 2 | Product Type & Tracking | **3** |
| 3 | Unit & Pack | **4** |
| 4 | Product Configuration | **5** |
| 5 | Barcode & SKU | **5** (identifier section) |
| 6 | Pricing & Tax | **6** |
| 7 | Review & Create | **7** |

Requirements: no Product data loss; no identifier loss; old Step 5 identifiers hydrate into the Step 5 identifier section; drafts with no scan context are valid and surface as `acquisition_mode = 'LEGACY'`; never fabricate scan/external history that did not occur.

A one-time `current_setup_step` data correction is **optional** and, if ever run, must be idempotent and must not alter identifiers.

---

## TD-6 — No-barcode SKU candidate semantics (SUPERSEDED 2026-09-14)

The rules in this subsection are retained as historical B5 context. Current
authority is
[[PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]]: Step 1 allocates
`{CATEGORY_CODE}-{TENANT_SEQUENCE:000000}`, SIMPLE retains it, and VARIANT
extends it with ordered stable value codes.

| Rule | Decision |
|---|---|
| Nature | Candidate string only. **No** reservation row, **no** sequence burn, **no** uniqueness hold |
| Authority | Server-side generation; Flutter may only request/preview via the backend contract |
| Finalization | Becomes a real SKU only when written to `product_variants.sku` (Step 5 / publish) |
| Collision | Server retries generation using existing ID/code generation conventions; DB `UNIQUE (tenant_id, sku)` is final authority |
| User edit | A user-edited SKU is **never** silently overwritten or regenerated |
| SIMPLE | One sellable identity → one final SKU; candidate may pre-populate it |
| VARIANT | The candidate is **never** fanned out; Step 5 must produce unique per-variant SKUs |

Early reservation is explicitly rejected because current standards document no SKU reservation table, and reservation would create abandoned-number and race problems.

**Pre-draft acquisition API (LOCKED TARGET):** `POST /api/v1/tenant-admin/products/sku-candidates/generate`  
Permission: `catalog.products.create` + `product_catalog`. Request `{ "purpose": "NO_BARCODE_PRODUCT", "productName": optional }`. Response `{ "candidate": "...", "reserved": false }`. No Product ID. Not claimed implemented.

---

## TD-7 — Identifier ownership and scanned-GTIN reconciliation (LOCKED)

- **Step 1** captures a *candidate* identifier only.
- **Step 5 Product Configuration** finalizes sellable identities.
- **Step 7** revalidates authoritatively.

| Structure | SKU | GTIN/barcode |
|---|---|---|
| SIMPLE | Unique SKU **required** on the default sellable identity | Optional; Step 1 candidate may be associated with that identity |
| VARIANT | Unique SKU **required** per included sellable variant | Optional per variant; one GTIN belongs to at most one variant |
| BUNDLE | Parent sellable identity SKU required | Optional parent barcode |

A single scanned Step 1 GTIN **must not** be copied to every variant. Step 5 requires explicit reconciliation: assign to exactly one applicable variant, replace it, remove it, or leave variants without GTIN where allowed. DB uniqueness remains final.

---

## TD-8 — Duplicate Product contract (TARGET)

Product duplication must not clone unique identity.

| Copied | Never copied |
|---|---|
| Non-identifier product configuration (name basis, descriptions, category/brand, structure, options, tracking policy) | GTIN/barcodes, unique SKUs, stock/inventory balances, stock movements, audit history, publish timestamps |

Result is a **NEW DRAFT** whose unique sellable identifiers are cleared (or regenerated per TD-6) and which cannot publish until unique identifiers exist. Duplication is **not** an alias for Edit Existing Product. Status: **TARGET** — no implementation evidence is claimed.

---

## TD-9 — Permission authority (**CLOSED**)

The Chunk 1 "dual-authority GAP" is resolved as a **documentation rule**. Three vocabularies exist in active docs:

| Vocabulary | Example | Status |
|---|---|---|
| Legacy tenant-scoped | `tenant.products.create` | Seeded legacy; **not** the Product Setup decision code |
| **Canonical R1 enforced** | **`catalog.products.create`** | **Authoritative for Product Setup authorization** |
| 4-tier taxonomy form | `catalog.products.master.create`, `catalog.barcodes.sku.manage` | Taxonomy/alias reference only |

**Resolution basis:** [[../02_ACCESS_CONTROL/CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1]] is the declared authoritative, CLOSED capability registry and lists the 3-tier `catalog.products.*` / `catalog.barcodes.manage` rows as **R1_ACTIVE**. [[../02_ACCESS_CONTROL/Permission_Code_List]] explicitly defers to that catalog on conflict, and [[../02_ACCESS_CONTROL/Tenant_Effective_Permission_Resolution]] already locks one-way aliasing with no dual first-class authority.

**ONE implementation rule:**

1. Every Product Setup authorization gate evaluates exactly **one** canonical code from the `catalog.*` R1_ACTIVE set.
2. The effective-permission resolver MAY map, **one way only**, legacy `tenant.products.view|create|update|delete` and 4-tier `catalog.*.master.*` / `catalog.barcodes.sku.manage` onto that canonical code so historical grants still satisfy it.
3. Never `OR` two vocabularies as two independent first-class authorities on one decision.
4. Entitlement remains `product_catalog` (plus `inventory_tracking` for advanced tracking/identity).
5. Flutter codes are `catalog.*`; alias maps are UX compatibility only and are never a security boundary.
6. Step 1 resolve and external lookup add **no new permission**: `catalog.products.create` + `product_catalog`.

**Remaining item is implementation, not decision:** backend `ProductWizardAccessPolicy`, Flutter route guards, and grant seed still use `tenant.products.*`. That is tracked as an implementation gap and does **not** require a further platform decision.

---

## TD-10 — External provider contract (LOCKED)

Server-side responsibilities (map to existing Clean Architecture layers; exact class names are not mandated):

```text
Tenant Admin API (thin endpoint)
  → Product Setup application service
  → External Product Lookup coordinator
  → external product lookup provider abstraction
  → configured provider adapter(s)
```

Supported configurations: **zero** providers configured, one provider, multiple providers.

| Outcome | Meaning |
|---|---|
| `FOUND` | Normalized, provider-neutral suggestion |
| `NO_MATCH` | Normal business outcome, not an error |
| `TEMPORARY_FAILURE` | Timeout, unavailable, or cancelled; retry allowed |

Zero providers configured resolves to public status **`NO_MATCH` only**. There is **no** fourth Flutter business status such as `NOT_CONFIGURED`. Optional internal telemetry may distinguish "no providers configured" without altering the locked public state machine. Provider outage never blocks manual Product creation. Provider data is **suggestion data only**; raw provider DTOs and secrets are never returned to Flutter.

---

## TD-11 — External master-data mapping and image safety (LOCKED)

**Master data:** external `brandText` / `categoryText` / unit text never auto-resolve to tenant IDs unless documented tenant-scoped, ACTIVE, unambiguous matching succeeds. Ambiguous matches require user confirmation. **No** auto-create of Brand, Category, or UOM. No cross-tenant master reuse.

**Images:** an external image is a **candidate**, never trusted Product media. It must enter the **existing** staged-media architecture — server-side fetch → validation → `media_assets` (`STAGED`) → transactional link into `product_images` on draft save. No new media subsystem, and no arbitrary third-party URL persisted as Product media.

Validation reuses existing media rules: `image/png` / `image/jpeg` only, ≤ 5 MB, max 10 images, bounded fetch timeout. Unsupported format, oversize, fetch failure, and blocked URL are all non-fatal: Product Setup continues without the image.

---

## TD-12 — Concurrency, uniqueness, publish revalidation (LOCKED)

Protection layers: (1) application validation, (2) tenant-scoped lookup, (3) **DB unique constraint as final authority**.

Canonical race scenario that must be documented and tested:

```text
Admin A and Admin B both resolve new GTIN X → both get VALID_NO_LOCAL_MATCH
Admin A publishes first                     → GTIN X now assigned
Admin B saves/publishes                     → 409 identifier conflict (never a duplicate row)
```

After the draft exists, all mutations carry `expectedRowVersion` (Product `row_version`); stale version → 409.

Step 7 publish must revalidate at minimum: SKU uniqueness, barcode/GTIN uniqueness, Product/Variant configuration validity, required pricing/tax state, category/brand validity, status/entitlement/permission rules, and row version. **A Step 1 lookup result is UX assistance only and is never trusted at publish time.**

---

## Consequences

- Active docs must drop `barcode_type = GTIN14` and use `identifier_standard` + `barcode_type`.
- Scan-context field set is single-sourced (TD-3).
- Resolve outcome names are `VALID_LOCAL_MATCH` / `VALID_NO_LOCAL_MATCH` / `INVALID`.
- Permission authority is closed; the residual item is implementation work.
- TARGET migrations: `product_setup_scan_context` table, `product_barcodes.identifier_standard` column, `UNKNOWN` symbology allowed value. None created or applied.

## Related

- [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]] (D4 superseded on GTIN-14 representation)
- [[PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] (write-stage numbering OPTION 1)
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract]]
- [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_SECOND_BRAIN_CANONICALIZATION_2026-09-11]]
