<!-- title: Product Setup Scanner-First Technical Contract Verification Audit (Chunk 2) -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->

> **Implementation status note (2026-09-12):** Historical verification snapshot preserved. Implementation status has advanced (Backend B1–B4); see [[../../00_START_HERE/Current_Source_Of_Truth]] and current implementation checklist.

# Product Setup Scanner-First — Technical Contract Verification Audit (Chunk 2)

## Scope and method

**Documentation only.** No Backend code, no Flutter code, no EF migration created or applied, no production repository modified, no Internet research.

This audit **verifies** the technical contracts as they existed in the repository *after* the 2026-09-11 canonicalization, rather than recreating them. Chunk 1 technical changes were **not** assumed correct. Decision output: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]].

Classifications used: **REUSE** (correct as-is) · **CORRECT** (wrong, fixed) · **EXTEND** (correct but incomplete) · **CORRECT CONFLICT** (two authorities disagreed) · **REMOVE DUPLICATION** · **DECISION REQUIRED**.

---

## 1. Post-Chunk-1 technical audit matrix

| # | Area | Current documented contract (post-Chunk 1) | Correct? | Conflict? | Action |
|---:|---|---|---|---|---|
| 1 | 7-step order + `current_setup_step` 1–7 | Steps 1–7 locked; `CHECK BETWEEN 1 AND 7` exists in EF (`ConsolidateProductWizardTo7Steps`) | Yes | No | **REUSE** |
| 2 | Draft creation boundary | Pre-draft Step 1; DRAFT created at creation-path transition; fresh drafts at `current_setup_step = 2` | Yes | No | **REUSE** (restated as TD-4) |
| 3 | Unified draft persistence | `SaveProductDraftAsync` / `IProductWizardStepProcessor`; no step-specific save pipelines | Yes | No | **REUSE** |
| 4 | Resolve endpoint route + permission | `POST .../products/barcodes/resolve`, `catalog.products.create` + `product_catalog` | Yes | No | **REUSE** |
| 5 | Resolve outcome names | Scan spec said `INVALID` / `LOCAL_MATCH` / `NO_LOCAL_MATCH` | Ambiguous — `INVALID` read as "searched, not found" | No | **CORRECT** → `VALID_LOCAL_MATCH` / `VALID_NO_LOCAL_MATCH` / `INVALID` |
| 6 | Resolve request fields | Not specified | No | No | **EXTEND** → `barcode` + `inputMode` (`SCAN`\|`MANUAL`) |
| 7 | Resolve side-effect freedom | Implied, never stated | Incomplete | No | **EXTEND** → explicit "creates no product/draft/barcode/scan-context row"; no `deviceId`/outlet/till |
| 8 | POS route reuse ban | Stated in API_ENDPOINTS, Scan spec, Scanner Integration | Yes | No | **REUSE** |
| 9 | Local-match projection | Safe projection listed; variant-level SKU ownership stated | Yes | No | **EXTEND** → formalize `matchedAt = PRODUCT \| VARIANT` |
| 10 | External lookup endpoint + outcomes | `FOUND` / `NO_MATCH` / `TEMPORARY_FAILURE`; provider-agnostic | Yes | No | **REUSE** + **EXTEND** (normalized field list, forbidden response content, zero-provider case) |
| 11 | Provider abstraction | Coordinator + `IExternalProductLookupProvider`; credentials backend-only | Yes | No | **REUSE** + **EXTEND** (zero/one/many provider configurations) |
| 12 | **`barcode_type = GTIN14`** | Chunk 1 added `GTIN14` as an allowed `barcode_type` value (Table 11, Identifier spec §8.2, Scan spec §7.1, D4, scan-context `barcode_type_hint`) | **No — conflates identifier standard with symbology** | Yes (against the existing symbology-only meaning of the column) | **DECISION REQUIRED → RESOLVED as Option A.** `barcode_type` symbology-only (+ `UNKNOWN`); new nullable `product_barcodes.identifier_standard` |
| 13 | Identifier DTO shape in Technical Contract | Flat `baseSku` / `parentProductBarcode` / top-level `variantIdentifiers[]` | No | **Yes** — Identifier spec §17 already declares that shape obsolete in favour of `barcodeSkuConfiguration.assignments[]` | **CORRECT CONFLICT** |
| 14 | Duplicate 409 projection example | `"barcodeType": "EAN-13"` (hyphenated) | No | **Yes** — canonical codes are unhyphenated (`EAN13`) | **CORRECT CONFLICT** |
| 15 | `product_setup_scan_context` necessity | TARGET 1:1 draft table | Yes — no existing table can own pre-final bootstrap without misuse | No | **REUSE** (necessity re-verified) |
| 16 | `product_setup_scan_context` field set | Table 10 and Scan spec §16 listed **different** columns; both carried `acquisition_mode` **and** `bootstrap_kind` with overlapping values | No | **Yes** — two authorities disagreed | **CORRECT CONFLICT + REMOVE DUPLICATION** → single field set; dropped `bootstrap_kind` and `input_origin`; renamed hint fields |
| 17 | Scan-context lifecycle / constraints | Partially stated | Incomplete | No | **EXTEND** → CHECK constraints, FK names, cascade, actor columns, "missing row is valid for legacy" |
| 18 | Identifier ownership Step 1 vs Step 5 | Candidate at Step 1, finalization at Step 5, no GTIN fan-out | Yes | No | **REUSE** (restated as TD-7) |
| 19 | Legacy `current_setup_step` mapping table | Mapping present (old 1→2 … old 5→5) | Yes | No | **REUSE** |
| 20 | Legacy remapping **location** | "Prefer explicit migration/compatibility shim at resume" — mechanism never chosen | No — ambiguous before implementation | No | **DECISION REQUIRED → RESOLVED.** Read-time compatibility layer in `GET .../setup`, matching the existing BUNDLE normalization precedent; no destructive migration |
| 21 | No-barcode SKU semantics | "may request/generate a unique internal SKU candidate" — candidate vs reservation unclear | No | No | **DECISION REQUIRED → RESOLVED.** Non-reserved candidate; reservation explicitly rejected |
| 22 | Permission codes used | Only existing codes (`catalog.products.*`, `catalog.barcodes.manage`, `catalog.variants.manage`, entitlement `product_catalog`) | Yes — no invented permissions | No | **REUSE** |
| 23 | **Permission dual authority** | Matrix recorded a "CURRENT GAP" between `catalog.products.*` and `tenant.products.*`, left vague | Rule existed but was under-described; a **third** 4-tier vocabulary (`catalog.products.master.*`, `catalog.barcodes.sku.manage`) was unaccounted for | Yes (three vocabularies) | **CORRECT CONFLICT → CLOSED.** One canonical `catalog.*` code per gate + one-way alias from both legacy and 4-tier forms. Residual work is implementation only |
| 24 | Authorization response codes | Only generic 403 statements for Step 1 | Incomplete | No | **EXTEND** → 401/403/404/409/422 table; business outcomes are 200 |
| 25 | Concurrency / uniqueness | `expectedRowVersion` + DB unique constraint mentioned | Incomplete | No | **EXTEND** → explicit two-admin same-GTIN race; `VALID_NO_LOCAL_MATCH` is not a reservation |
| 26 | Publish revalidation | Mentioned generally | Incomplete | No | **EXTEND** → explicit minimum revalidation list; Step 1 result never trusted at publish |
| 27 | External prefill master-data mapping | No auto-create; ACTIVE tenant-scoped matching only | Yes | No | **REUSE** |
| 28 | External image safety | "safe image/content handling" only | Incomplete | No | **EXTEND** → route through existing staged-media architecture (`media_assets` STAGED → `product_images`); reuse existing MIME/size limits; non-fatal failure |
| 29 | Duplicate Product contract | Referenced in the journey; contract undefined | Incomplete | No | **EXTEND** → TARGET rule; never clone identifiers/stock/audit |
| 30 | NFRs | Table present | Yes | No | **REUSE** |
| 31 | Service/class naming | Chunk 1 named `ExternalProductLookupService` etc. | Over-specified | No | **CORRECT** → document responsibilities per layer; concrete class names not mandated |
| 32 | Flutter DTO round-trip | `BarcodeSkuAssignmentDto` "must include `barcodeType` (TARGET includes `GTIN14`)"; client inference "GTIN checksum → EAN13/UPCA/EAN8/GTIN14 else CODE128" | No — client inventing symbology, and GTIN14 as a symbology | Yes (inherits item 12) | **CORRECT** → two separate fields; server derives; Flutter never invents a symbology |

---

## 2. Database change classification

| Change | Classification |
|---|---|
| `products.current_setup_step` 1–7 + CHECK | **EXISTING** |
| `product_barcodes` table, `UNIQUE(tenant_id, barcode)`, `quantity_per_scan`, FKs | **EXISTING — unchanged** |
| `product_variants.sku` + `UNIQUE (tenant_id, sku) WHERE sku IS NOT NULL` | **EXISTING — unchanged** |
| `product_setup_initial_tracking` | **EXISTING** (migration `20260824095742_AddProductSetupInitialTracking`) |
| `product_barcodes.barcode_type` allowed-value set gains `UNKNOWN` | **TARGET** (validation/documentation level; column type unchanged) |
| `product_barcodes.identifier_standard` nullable `varchar(40)` | **TARGET MIGRATION REQUIRED** |
| `product_setup_scan_context` table | **TARGET MIGRATION REQUIRED** |
| `barcode_type = 'GTIN14'` | **REJECTED — not a migration** |
| `products.batch_number` / `expiry_date` / `serial_number` | **FORBIDDEN** |

No EF migration code was written. No migration is claimed applied.

---

## 3. Consistency search results

Search scope excluded `99_Archive/**`. Patterns: `GTIN14`, `GTIN-14`, `barcode_type = GTIN14`, `LOCAL_MATCH`/`NO_LOCAL_MATCH`, `bootstrap_kind`, `LEGACY_MANUAL`, `barcode_type_hint`, `identifier_candidate`, `external_lookup_outcome`, `external_source_key`, `input_origin`, `identifierFormat`, `variantIdentifiers`, `EAN-13`, `tenant.products.*`, POS `by-barcode`.

| Location | Hit | Resolution |
|---|---|---|
| Identifier spec §8.2 / §8.4 / migration note / superseded list | `GTIN14` as barcode type | **FIXED** — split into `identifier_standard` + symbology; explicit supersession recorded |
| Scan spec §7.1 | `barcode_type` code `GTIN14` | **FIXED** — Option A table + correction callout |
| Table 11 (`barcode_type` row + frontmatter note) | TARGET `GTIN14` allowed | **FIXED** — symbology-only; `identifier_standard` row added |
| Table 10 scan-context block | divergent field set, `barcode_type_hint`, `bootstrap_kind` | **FIXED** — reconciled single field set |
| Scan spec §16 | divergent field set | **FIXED** — same single field set + reconciliation note |
| Technical Contract identifier DTO | `baseSku` / `parentProductBarcode` / `variantIdentifiers[]` | **FIXED** — `barcodeSkuConfiguration.assignments[]` |
| API_ENDPOINTS 409 example | `"EAN-13"` | **FIXED** — `EAN13` + `identifierStandard` |
| Flutter spec DTO round-trip + SIMPLE/BUNDLE inference | `GTIN14` symbology, client-side inference | **FIXED** — two fields, server-derived |
| Decision 2026-09-11 D4 | `barcode_type = GTIN14` | **FIXED** — marked SUPERSEDED with pointer to TD-2 |
| Decision 2026-09-11 D11 | `bootstrap_kind = LEGACY_MANUAL` | **FIXED** — updated to `acquisition_mode = LEGACY` + read-time layer |
| Scope_Change_Log 2026-09-11 entry | `GTIN14` barcode_type allowance | **FIXED** — removed; 2026-09-12 entry added |
| Chunk 1 audit (§ header, DB table, § T) | `barcode_type=GTIN14`, `LEGACY_MANUAL`, "dual-authority GAP remains" | **FIXED** — correction callout + updated gap list |
| Test cases PS1-006 / PS1-042 | `identifierFormat=GTIN14`, `LEGACY_MANUAL` | **FIXED** + 45 Chunk 2 scenarios added |
| Permission Matrix "CURRENT GAP" | vague dual authority | **FIXED** — closed with one implementation rule |
| Identifier spec §17 / Step5 audit matrix item 13 | `variantIdentifiers` named as obsolete | **EXPLAINED — correct as-is.** These are supersession statements naming the obsolete shape, not active contracts |
| `Barcode_Scanner_Integration.md` camera symbology list (`EAN-13`, `EAN-8`) | hyphenated | **EXPLAINED — correct as-is.** Prose describing physical symbologies a camera accepts, not a persisted enum value |
| `2026-08-14 ... Readiness_Audit.md` (`EAN-13`, `UPC-A`) | hyphenated | **EXPLAINED — historical audit evidence**, already marked superseded; not current authority |
| `99_Archive/**` (`"barcodeType": "EAN-13"`, old wizard order) | stale | **EXPLAINED — archive is never current authority**; intentionally untouched |
| `tenant.products.*` in R1 catalog / Permission_Code_List | present | **EXPLAINED — correct as-is.** These are grantable registry rows; the *decision code* is `catalog.*` with one-way alias |

---

## 4. Open items (implementation, not decisions)

1. EF migrations: `product_setup_scan_context`, nullable `product_barcodes.identifier_standard`, `UNKNOWN` symbology allowed value.
2. Implement resolve + external-lookup endpoints and the Flutter Step 1 surface.
3. Switch `ProductWizardAccessPolicy`, Flutter route guards, and the grant seed to canonical `catalog.*` codes per the closed rule.
4. Read-time legacy remapping in `GET .../setup`.
5. Select/configure a concrete external provider (the abstraction alone is sufficient to ship manual-fallback Product Setup).

None of these requires a further platform decision.

---

## Status

**TECHNICAL CONTRACTS VERIFIED AND RECONCILED — IMPLEMENTATION READY (documentation only).**

Documentation was changed. Nothing is claimed implemented.

---

## 5. CORRECTION ADDENDUM — 2026-09-12 (post-report re-audit)

Chunk 2 was reported complete, then a direct Second Brain review found remaining ACTIVE contradictions. This addendum records them without erasing the original findings.

| Gap | FOUND | FIXED | EVIDENCE |
|---|---|---|---|
| Active step-number drift | `05_Tenant_Admin_Add_Product_7_Step_Contract.md` still treated Product Type/Tracking, Units, Configuration, Save Draft validation, and structure-switch as pre-scanner numbering; Image Manager / Glossary / Variant module overview / Product CRUD tests / Bundle tests still said Step 1 Basic Details, Step 2 Initial Tracking, Step 4 Variant | Remumbered to scanner-first 1–7; Save Draft table rebuilt with Step 1 PRE-DRAFT; validation matrix corrected | Active search after fix: no CURRENT authority asserts Basic Details=Step 1, Type/Tracking=Step 2, Units=Step 3, Config=Step 4, or Save Draft Step 1 storing Product master fields (historical/supersession only) |
| Draft-create route ambiguity | Scanner-first docs said `POST .../products`; Permission Matrix + 7-Step Contract §10 already said `POST .../products/draft` | **LOCKED:** `POST .../products/draft` = canonical wizard DRAFT create; `PUT .../{id}/draft` = update; `POST .../products` = direct/legacy graph create only | TD-1 updated; API_ENDPOINTS table + Scan §17.4 + Technical Contract + Permission Matrix aligned |
| Missing pre-draft SKU-candidate API | UI required server candidate before DRAFT; no acquisition endpoint | **TARGET:** `POST .../sku-candidates/generate` (`reserved: false`, side-effect free) | Scan §15.1/§17.3; API_ENDPOINTS; Flutter §1.0; TD-6; PS1-T46 |
| Zero-provider external status ambiguity | Docs allowed `NO_MATCH` **or** explicit not-configured | **LOCKED:** public status = **`NO_MATCH` only** | Scan §17.2; API_ENDPOINTS; TD-10; PS1-T16 |

### Updated open items (implementation only)

1. EF migrations: `product_setup_scan_context`, nullable `product_barcodes.identifier_standard`, `UNKNOWN` symbology.
2. Implement resolve + external-lookup + **sku-candidates/generate** + Flutter Step 1 surface.
3. Implement wizard create via `POST .../products/draft` at creation-path boundary.
4. Switch `ProductWizardAccessPolicy` / Flutter guards / grant seed to canonical `catalog.*`.
5. Read-time legacy remapping in `GET .../setup`.
6. Select/configure a concrete external provider (optional for manual-fallback Product Setup).

**Correction status:** CHUNK 2 CORRECTION COMPLETE — READY FOR CHUNK 3 (documentation only; nothing claimed implemented).

---

## 6. FINAL CLOSURE ADDENDUM — 2026-09-12 (second direct source review)

A second post-correction review found residual ACTIVE drift. Recorded without erasing earlier audit history.

| Gap | FOUND | FIXED | SEARCH EVIDENCE |
|---|---|---|---|
| Flutter Step 5 controller docs | §3.2 titled “Methods for Step 4”; `saveAndContinueStep5Matrix` used `currentSetupStep: 4` and “Advances to Step 5” | Retitled Step 5 Product Configuration / Variant Matrix; save Draft `currentSetupStep=5` `advanceStep=false`; Save & Continue `currentSetupStep=5` `advanceStep=true` → **Step 6** | Patterns `Methods for Step 4`, `currentSetupStep: 4, advanceStep: true`, `Advances to Step 5` → **none** in active CURRENT contracts |
| Bundle tests | Step 2→4, Step 4 Back→2, Step 4 Save/Skip/success, retains Step 2 values | Remapped to Step 3→5 (Units NOT_APPLICABLE), Back→Step 3, Step 5 Save/Skip → Step 6, retains Step 3 values | `Step 2 → Step 4`, `Step 4 Back`, `Step 4 Skip`, `Step 4 success` → **none** as current Bundle tests |
| Variant reconciliation tests | “Step 4 NEVER publishes”; “Step 3 sets … UOM”; “Step 3 skipped” | Step 5 never publishes (Step 7 publishes); UOM = Step 4; Track OFF bypasses Step 4 only | `Step 4 NEVER`, `Step 3 sets` → **none** |
| Product CRUD PROD-PERM-008 / 018 | “Step 1 save 200”; revoke wording could imply Step 1 persisted Product | Channel save = Step 2 draft; PROD-PERM-018 clarifies draft only after `POST .../products/draft` | `Step 1 save` → **none**; only historical Image Manager audit remains (bannered) |
| Full Feature Status Index | “Steps 1 & 2 backend complete”; “Step 3 — Units” as current | CURRENT/FORMER mapping; scanner Step 1 explicitly not implemented | `Steps 1 & 2 backend implementation complete`, bare current “Step 3 — Units & Pack Conversion” status row → **none** |
| 7-Step Contract BUNDLE footer | “Step 3 = NOT_APPLICABLE” / Bundle Composition labelled Step 4; `Step1WizardProcessor` implied draft save | Step 4 Units NOT_APPLICABLE; Bundle Composition = Step 5; processors clarified PRE-DRAFT vs draft Steps 2–7 | `Step 3 = NOT_APPLICABLE`, `NEVER enter the Step 3 form` → **none** |

Historical audits that still name old steps retain **HISTORICAL / SUPERSEDED** banners and are not current authority.

**Final closure status:** CHUNK 2 FULLY CLOSED — READY FOR CHUNK 3 (documentation only).

---

## 7. ABSOLUTE FINAL RESIDUAL CLOSURE — 2026-09-12

Third direct source review found six remaining ACTIVE contradictions. Recorded without erasing earlier history.

| Gap | FOUND | FIXED |
|---|---|---|
| Units & Pack test target | `VARIANT + Track ON → targetSetupStep = 4` in Units Pack §21.1 | Both SIMPLE and VARIANT Track ON from Step 4 → `targetSetupStep = 5` |
| Bundle Save Logic | “Stays on Step 4”; Save & Continue `targetSetupStep = 5` | Step 5 draft stay; Save & Continue → `targetSetupStep = 6`; Step 3→5 Units bypass preserved |
| Bundle auth step number | “Step 4 endpoints” in API_Authorization_Rules | “Step 5 Bundle/Product Configuration endpoints”; `catalog.combo_components.manage` preserved |
| Entitlement mapping ambiguity | Unresolved `product_catalog` vs `product_management` wording | Locked: `product_catalog` = runtime entitlement; `product_management` = module grouping only |
| Combo module | “read-only in Bundle Step 4” | “read-only in Bundle Step 5 Product Configuration / Bundle Composition” |
| Feature Status Index | `GET /setup` variant rehydration still pending | Reconciled CLOSED per Estimated Variant Count backend audit; Flutter Step 5 still pending; scanner Step 1 not claimed |

**Absolute-final status:** CHUNK 2 FULLY CLOSED — READY FOR CHUNK 3 (documentation only).

---

## 8. MICRO-CLOSURE — 2026-09-12

| Item | Status |
|---|---|
| Journey Access Control table: `product_catalog` / `product_management` slash ambiguity in `09_Product_Management_Flow.md` | **FIXED** — runtime `product_catalog` only; `product_management` = module grouping only |
| `2026-08-09_Tenant_Admin_Add_Product_Step2_Final_Verification_Audit.md` pre-scanner Step 2 Product Type & Tracking read as current | **ADDED** historical numbering banner → maps to CURRENT Step 3; historical evidence not rewritten |

**Micro-closure status:** CHUNK 2 FULLY CLOSED — READY FOR CHUNK 3 (documentation only).

## Related

- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]]
- [[PRODUCT_SETUP_SCANNER_FIRST_SECOND_BRAIN_CANONICALIZATION_2026-09-11]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[../../02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/2026-08-09_Tenant_Admin_Add_Product_Step2_Final_Verification_Audit]]
