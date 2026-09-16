<!-- title: Tenant Admin Product Setup Scanner-First Implementation Architecture -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-16 -->
<!-- type: Implementation Architecture — DOCUMENTATION ONLY; nothing claimed implemented by this document -->

# Tenant Admin Product Setup — Scanner-First Implementation Architecture

## 1. Scope

Bridge between **canonical Product Setup business/technical contracts** and **Backend + Flutter production implementation**.

**DOCUMENTATION ONLY.** Does not implement code, create/apply EF migrations, or claim scanner-first work complete.

Business authority: [[05_Tenant_Admin_Add_Product_7_Step_Contract]], [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]], [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]], [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]], [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

## 2. Canonical wizard (LOCKED — do not reopen)

1. Scan Barcode (**PRE-DRAFT**)  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration (+ final identifiers)  
6. Pricing & Tax  
7. Review & Create  

Step 1 internal states are **not** extra stepper items.

| Route | Role |
|---|---|
| `POST .../products/draft` | Wizard DRAFT create |
| `PUT .../products/{id}/draft` | Steps 2–7 mutation |
| `GET .../products/{id}/setup` | Resume / hydrate (+ legacy remap) |
| `POST .../products/{id}/publish` | Publish |
| `POST .../products` | Direct/legacy graph create — **not** wizard bootstrap |
| `POST .../products/barcodes/resolve` | **IMPLEMENTED (B4)** — side-effect free |
| `POST .../products/barcodes/external-lookup` | **IMPLEMENTED B7** — side-effect free; no tenant duplicate checking |
| `POST .../products/sku-candidates/generate` | **EXTENDED 2026-09-14** — Category Code + atomic tenant Product sequence |

Outcomes: Resolve `VALID_LOCAL_MATCH` \| `VALID_NO_LOCAL_MATCH` \| `INVALID`. External `FOUND` \| `NO_MATCH` \| `TEMPORARY_FAILURE` (zero providers → `NO_MATCH`). Symbology ≠ `GTIN14`. Runtime entitlement `product_catalog` only.

## 3. Existing implementation inventory

| Capability | Existing owner (Second Brain evidence) | Evidence | Action |
|---|---|---|---|
| Product draft API | `TenantAdminProductsController` | API_ENDPOINTS; Step2 audit | **EXTEND** (Step 1 routes) |
| Draft application orchestration | `TenantAdminProductService` | Permission-first closure | **EXTEND** |
| Draft persistence | `ITenantAdminProductRepository.SaveProductDraftAsync` / `TenantAdminProductRepository.Wizard(.Create)` | 7-Step Contract §6.4 | **REUSE** / **EXTEND** (scan context) |
| Access policy | `ProductWizardAccessPolicy` | Permission Matrix; B2 **IMPLEMENTED** — `catalog.*` + `product_catalog` + one-way aliases | **IMPLEMENTED** foundation; specialized later-step gates still tracked separately |
| Step processors | `IProductWizardStepProcessor` (e.g. historical `Step2WizardProcessor`) | 7-Step Contract | **REUSE** Steps 2–7; Step 1 **not** a draft processor |
| Validators | `TenantAdminProductRequestValidator`, `ProductTrackingRules`, **`ProductBarcodeFormatValidator.Classify` (B3)** | Step2 audit; Phase1 audit | **REUSE** / **EXTEND** |
| Variant config | `ProjectVariantConfigurationAsync`, combination generator | Estimated Variant Count closure | **REUSE** |
| Identifier graph | `ApplyBarcodeSkuConfigurationAsync` | Step5 audit matrix | **IMPLEMENTED B10** — final SKU on `product_variants.sku`; final barcode on `product_barcodes` (+ `identifier_standard`); Step 5 reconciliation atomic; ScanContext candidate remains acquisition history only |
| Pricing/Tax | Wizard pricing apply/project | Step6 backend closure | **REUSE** |
| Publish | Existing publish path on repository/service | API_ENDPOINTS | **EXTEND** (revalidation) |
| Media staging | `POST .../images/stage` | Image Manager spec | **REUSE** |
| Flutter wizard | `AddProductWizardController` under `lib/features/tenant_admin/products/` | Flutter Implementation Spec | **EXTEND** |
| Flutter data | `tenant_product_remote_datasource` / repository_impl | Product List Flutter spec | **EXTEND** |
| HID scanner | POS HID/keyboard-wedge framing | Barcode_Scanner_Integration | **REUSE** framing; **NEW** Tenant Admin resolve call |
| Shell / stepper / footer | Tenant Admin layout + Product Wizard footer | Flutter / UI specs | **REUSE** |
| POS by-barcode | POS route | API_ENDPOINTS | **DO NOT TOUCH** from Tenant Admin |
| Parallel wizard controller | — | Forbidden by Scan/Flutter specs | **DO NOT TOUCH** / never create |

## 4. Reuse / Extend / New / Supersede matrix

| Capability | Current asset | Action | Reason |
|---|---|---|---|
| Tenant Admin shell / stepper / footer | Existing | **REUSE** | Design system |
| Scanner HID listener | POS HID pipeline | **EXTEND** | Same framing; different API |
| Product repository/datasource | `tenant_product_*` | **EXTEND** | New Step 1 methods |
| `AddProductWizardController` | Existing | **EXTEND** | Step 1 state machine |
| Draft / setup / publish APIs | Existing | **REUSE** + bootstrap extend | Unified pipeline |
| `SaveProductDraftAsync` | Existing | **EXTEND** | Attach scan context |
| Barcode resolve | `TenantAdminProductService.ResolveBarcodeAsync` | **IMPLEMENTED (B4)** | Local catalogue resolve only |
| External lookup / SKU candidate | — | SKU candidate API = **IMPLEMENTED B5**; External lookup API = **IMPLEMENTED B7**; Provider abstraction/coordinator = **IMPLEMENTED B6**; Draft bootstrap = **IMPLEMENTED B8**; GET setup hydrate/remap = **IMPLEMENTED B9**; composite Step 5 identifiers = **IMPLEMENTED B10**; publish revalidation = **IMPLEMENTED B11**; backend closure = **IMPLEMENTED B12** | **B1–B12 IMPLEMENTED** — Backend scanner-first Product Setup = **COMPLETE** |
| Identifier validation | `ProductBarcodeFormatValidator.Classify` | **IMPLEMENTED (B3)** | One validation owner |
| SKU generator | `ProductSkuCandidateGenerator` | **EXTEND 2026-09-14** — Step 1 Product base `{CATEGORY_CODE}-{TENANT_SEQUENCE:000000}`; SIMPLE keeps base; VARIANT appends ordered persisted value codes; max length 100 | Pre-2026-09-14 `SKU-{STEM}` B5 behavior is historical |
| Provider abstraction | — | **IMPLEMENTED B6** | Zero providers → NO_MATCH; no production adapter |
| `product_setup_scan_context` | EF entity + migration `20260912085454_...` | **IMPLEMENTED** (B1; local test DB applied; prod/shared not claimed) | Schema ≠ B8 bootstrap |
| `identifier_standard` | nullable column + CHECK | **IMPLEMENTED** (B1; local test DB applied; prod/shared not claimed) | GTIN14 never symbology |
| UNKNOWN symbology | CanonicalTypes + Classify | **IMPLEMENTED** (B1/B3) | Application/domain support |
| `barcode_type = UNKNOWN` | symbology set | **EXTEND** allowed values | Never `GTIN14` |
| Legacy step remapper | BUNDLE setup normalize precedent | **IMPLEMENTED B9** (`ScannerFirstSetupReadMapper`) | One hydration owner |
| Step 5 identifier UI | `barcode_sku/` widgets | **EXTEND** | `identifierStandard` |
| Media staging | Existing | **REUSE** | External image path |
| Standalone global Barcode step | Old Step 5 | **SUPERSEDE** | Absorbed into Step 5 |

## 5. Backend architecture — layer ownership

```text
API → Application → Domain → Infrastructure
```

| Responsibility | Layer |
|---|---|
| A. Barcode Resolve | Application orchestrates; Domain validates; Infrastructure looks up |
| B. External Lookup | Application coordinator; Infrastructure provider adapters |
| C. SKU Candidate | Application; Domain/shared generator utility |
| D. Draft Bootstrap | Application + Repository transaction |
| E. Draft Save Steps 2–7 | Application + `SaveProductDraftAsync` + step processors |
| F. Setup Rehydration | Application/Repository projection + remapper |
| G. Step 5 Identifier reconciliation | Application + existing ApplyBarcodeSku + Domain uniqueness |
| H. Publish validation | Application publish path |
| I. Permission/entitlement | `ProductWizardAccessPolicy` (Application) — **one** alias translation site |
| J. Audit | Application pipeline → `AuditLog` (existing) |

Controllers: deserialize, authorize, call service, map HTTP. **No** domain logic. **No** Flutter concerns in Backend.

## 6–7. Backend folder ownership + service responsibilities

Aligned with evidence under `E_POS.*.Modules.Tenant.CatalogProduct`:

| Responsibility | Existing folder | File responsibility | Action |
|---|---|---|---|
| Resolve / external / SKU candidate endpoints | `E_POS.Api/Controllers/V1/Tenant/CatalogProduct/` | Extend `TenantAdminProductsController` | **EXTEND** |
| Application orchestration | `.../Application/.../CatalogProduct/Services/` | Extend `TenantAdminProductService` **or** thin use-case services it calls | **EXTEND** / TARGET confirm names |
| Access policy | same Services | `ProductWizardAccessPolicy` | **EXTEND** |
| Repository contracts | `.../CatalogProduct/Contracts/` | `ITenantAdminProductRepository` | **EXTEND** |
| Wizard persistence | `.../Infrastructure/.../Repositories/` | `TenantAdminProductRepository.Wizard(.Create)` | **EXTEND** |
| Identifier validation | Domain/Application CatalogProduct | **IMPLEMENTED:** `ProductBarcodeFormatValidator.Classify` (B3) | **REUSE** |
| Provider interface | Application Contracts | **IMPLEMENTED:** `IExternalProductLookupProvider` + `IExternalProductLookupCoordinator` (B6) | **IMPLEMENTED** |
| Provider adapters | Infrastructure Integrations | **TARGET:** `Integrations/ProductLookup/` (marker only; no production adapter) | Zero configured |
| Scan context EF config | Infrastructure Persistence | Entity + configuration for `product_setup_scan_context` | **IMPLEMENTED (B1)** |
| DTOs / validators | Application CatalogProduct | Request/response + validator extensions | **EXTEND** |
| Unit tests | `E_POS.UnitTests/CatalogProduct/` | Resolve / SKU / external / draft-bootstrap / setup-hydrate / Step 5 identifier / publish revalidation suites covered through **B4–B12** (CatalogProduct Unit **440** / API **110** / Integration **105**; full UnitTests **1820** / ApiTests **562**) | **B1–B12 IMPLEMENTED** |

### Logical service owners (canonical responsibility ≠ hard class mandate)

| Owner | Does | Must NOT |
|---|---|---|
| **Barcode Resolution** | Validate GTIN; derive `identifier_standard`; normalize symbology; tenant lookup; safe projection | External providers; create draft; mutate barcodes |
| **External Product Lookup Coordinator** | Call adapters; normalize; FOUND/NO_MATCH/TEMPORARY_FAILURE; timeout | Create Brand/Category; save Product; expose raw DTO/secrets |
| **SKU Candidate Generator** | Stable Category/tenant-sequence Product base; SIMPLE/VARIANT format helpers | Product graph creation; barcode behavior |
| **Product Draft Bootstrap** | `POST .../draft`; `scanBootstrap`; scan context; persist `current_setup_step=2`; write-boundary duplicate safety; accepted prefills | Run on every scan; final `product_barcodes`; call B6/B7 |
| **Scanner-First Write Stage Mapper** | Semantic API step → legacy `ProductWizardStage` processor for scanner-first drafts; Step 5 SPECIAL/COMPOSITE | Arithmetic `±1`; persist translated processor into `current_setup_step`; renumber global constants |
| **Product Draft Save Pipeline** | Existing Steps 2–7 processors via mapper when scan context present; rowVersion | Parallel step-specific repositories |
| **Product Setup Hydration** | Setup DTO; **B9** legacy **read** remap; scan context; identifiers | Duplicate remap in Flutter; own write-stage mapping |
| **Publish Service** | Final revalidation; activate; 409 races; audit | Trust Step 1 lookup as truth |

## 8. Barcode Resolve — implementation contract

`POST /api/v1/tenant-admin/products/barcodes/resolve`  
Auth: `catalog.products.create` + `product_catalog`. **Side effects: NONE.**

**Request (align naming to existing DTO camelCase):**

```json
{
  "barcode": "string",
  "inputMode": "SCAN",
  "reportedSymbology": null
}
```

`inputMode`: `SCAN` \| `MANUAL`. `reportedSymbology` optional.

**Sequence:** trim framing only → preserve digits/leading zeros → length/structure → GTIN checksum → derive `identifierStandard` → normalize known symbology else `UNKNOWN` → tenant-scoped lookup.

**Response:** `outcome`, `normalizedBarcode`, `identifierStandard`, `barcodeType`, `invalidReason?`, `localMatch?` (`matchedAt`, product/variant ids, name, label, brand, category, sku, price, currency, status, image if safe).

Cross-tenant: never disclose. `INVALID` = 200 business outcome.

## 9–11. External lookup, providers, images

`POST .../barcodes/external-lookup` — valid identifier only; same auth; **NONE** side effects. Response `status` + normalized `suggestion` + `sourceReference` + `retryAllowed`. Never secrets/raw DTOs. No auto master-data. No Product persistence.

**Provider:** **IMPLEMENTED B6** `IExternalProductLookupProvider` — `CanHandle`/priority via options, `LookupAsync`, cancellation, normalized result, temporary failure. Coordinator supports 0/1/N: deterministic priority; stop on confident match; isolate timeouts; one provider failure ≠ fail all; zero → **`NO_MATCH`**. Public HTTP endpoint `POST .../barcodes/external-lookup` = **IMPLEMENTED B7** (no tenant duplicate checking; zero providers → NO_MATCH; no writes).

**Image:** suggestion preview only → on Use This Product / Step 2 → existing stage pipeline (`POST .../images/stage`) → MIME/size rules → `product_images`. **No** new media subsystem; **no** arbitrary URL as final media.

## 12. SKU candidate

`POST .../sku-candidates/generate`  
`{ "purpose": "NO_BARCODE_PRODUCT", "categoryId": required, "mode": "AUTO" }`
→ `{ "candidate": "TSH-000125", "reserved": true }`.

The backend resolves `categories.category_code` and atomically increments a
tenant-wide Product SKU sequence. The call creates no Product/Variant/scan
context; an abandoned allocation is an allowed gap. B8 persists the base in
`product_setup_scan_context.generated_sku_candidate`. B10/Step 5 writes final
`product_variants.sku`: SIMPLE = base; VARIANT = base plus value codes ordered by
Product Option canonical order. Publish does not allocate.

Authority:
[[../../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].

## 13–14. DB migration plan + scan context ownership

**DO NOT write migration code here. Not applied.**

### Scanner-first B1 migration scope (ONLY)

| # | Change | Classification |
|---:|---|---|
| 1 | Allow `barcode_type` value `UNKNOWN` (validation/check/docs) | **IMPLEMENTED** |
| 2 | Add nullable `product_barcodes.identifier_standard` | **IMPLEMENTED** (local test DB applied; prod/shared not claimed) |
| 3 | Create `product_setup_scan_context` 1:1 with Product | **IMPLEMENTED** (local test DB applied; prod/shared not claimed) |
| 4 | Indexes/FKs/CHECKs for scan context per Table 10 | **IMPLEMENTED** in migration source |
| 5 | Migration verification (queries, POS lookup unaffected) | **PARTIAL** — local test DB verified; prod/shared apply not claimed |

### Explicitly OUT OF B1 scope

| Object | Status |
|---|---|
| `product_setup_initial_tracking` | **EXISTING** — Step 3 Initial Batch/Expiry/Serial draft. Migration evidence: `20260824095742_AddProductSetupInitialTracking`. Do **not** recreate or include in scanner-first B1. Live DB/E2E acceptance is governed by the Initial Tracking implementation closure audit — not by this scanner-first doc alone. |

Scan-context fields: follow [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]] (acquisition_mode, candidate_identifier, identifier_standard, symbology_hint, no_barcode_reason, external_lookup_status, external_source_reference, normalized_prefill_json, generated_sku_candidate, audit, row_version). UNIQUE(tenant_id, product_id); CASCADE with product.

**Lifecycle:** Flutter holds Step 1 transient state. On creation-path commit: Product DRAFT + scan context atomically. Final GTIN/SKU **not** owned by scan context — candidates until Step 5. Scan context **never** POS lookup source. After publish: Product/Variant identifier tables authoritative; scan context **retained for audit/resume history**, ignored for sellable identity (**prefer retain over destructive delete** — not locked otherwise).

## 15. Legacy remapper (READ — B9) — **IMPLEMENTED**

Owner: **`ScannerFirstSetupReadMapper`** used by service `GetSetupAsync` after repository projection. Mapping: 1→2, 2→3, 3→4, 4→5, 5→5, 6→6, 7→7. **PURE READ:** no rewrite of historic rows; no SalesChannel / ProductChannelVisibility auto-provision on GET (missing channel visibility → in-memory canonical defaults). Preserve identifiers; old Step 5 → current Step 5 identifier section; missing scan context → `LEGACY` acquisition projection; no invented scan history. **Flutter must not remumber.**

**Not the write mapper.** Write-stage translation (scanner API → legacy processor) is a separate centralized owner locked by [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]]. Do not merge B9 read remap with B8 write routing.

## 15.1 Write-stage mapping (LOCKED 2026-09-13 — OPTION 1)

| Rule | Detail |
|---|---|
| Persist | Fresh scanner-first `current_setup_step = 2` = Basic Details (public semantics) |
| Do not | Globally renumber `ProductWizardStage`; persist translated processor numbers; scatter `currentStep±1` |
| Detect create | `scanBootstrap` on `POST .../draft` |
| Detect later | `product_setup_scan_context` present |
| Legacy | No scan context → legacy write numbering unchanged |
| Map 2→ | BasicDetails (1) |
| Map 3→ | Type & Tracking (2) |
| Map 4→ | Units & Pack (3) |
| Map 5→ | **SPECIAL / COMPOSITE** — not naive ±1; B10 owns final composite/identifier routing |
| Map 6→ | Pricing & Tax (6) |
| Map 7→ | Review (7) |

## 16–17. Step 5 identifiers + publish revalidation

SIMPLE: one sellable identity; unique SKU; optional GTIN; Step 1 candidate prefill. VARIANT: unique SKU per included; optional GTIN; no fan-out; explicit assign. BUNDLE: composition + identifier rules per Bundle authority. Save Draft: step 5, no advance. Save & Continue: step 5 → **6**. Reuse variant reconciliation + `ApplyBarcodeSkuConfigurationAsync`.

Publish rechecks: SKU/GTIN uniqueness, identifier_standard, ownership, structure, Brand/Category ACTIVE, pricing/tax, permissions, entitlements, rowVersion. DB unique = race guard. Two-admin `VALID_NO_LOCAL_MATCH` → second publish **409**. Step 1 result never final truth.

## 18. Permission implementation

| Action | Guard |
|---|---|
| Resolve / external / SKU candidate / draft create | `catalog.products.create` + `product_catalog` |
| Draft update | Existing step specialized + create/update |
| View match | `catalog.products.view` |
| Edit existing | `catalog.products.update` |
| Step 5 identifiers | `catalog.barcodes.manage` |
| Variant / Bundle / Pricing / Cost / Publish | Existing matrix codes |
| Advanced tracking | `inventory_tracking` |

Backend authoritative. Alias translation **only** in effective-permission / policy layer — not per controller.

## 19. Error / result mapping

| Situation | HTTP / outcome | Flutter |
|---|---|---|
| Invalid GTIN | 200 `INVALID` | Invalid barcode state |
| Local match | 200 `VALID_LOCAL_MATCH` | Existing Product Found |
| No local match | 200 `VALID_NO_LOCAL_MATCH` | No Local Match |
| External found / no / temp | 200 FOUND/NO_MATCH/TEMPORARY_FAILURE | Matching UI |
| Auth missing | 401 | Session handling |
| Permission / entitlement | 403 | Blocked UX |
| Cross-tenant | 404 | Not found |
| SKU/GTIN conflict | 409 | Conflict UX |
| Row version | 409 | Stale draft |
| Malformed payload | 422 | Field errors |
| Provider timeout | 200 TEMPORARY_FAILURE | Retry/manual |
| Image ingest fail | Non-fatal on bootstrap | Continue without image |
| Publish validation | 400/409 | Review errors |

No 500 for normal business outcomes. Use existing ProblemDetails/error envelope.

## 20. Transactions

**No TX:** resolve, external-lookup. SKU candidate generation performs one
atomic database sequence upsert but no Product catalogue graph write.  
**TX write:** `POST .../draft` (Product + default sellable identity if architecture requires + scan context + bootstrap fields — atomic), `PUT .../draft`, `POST .../publish`. Existing unit-of-work standards.

## 21–22. Flutter architecture + folders

**Extend** `lib/features/tenant_admin/products/` — no second Add Product feature.

| Path | Capability | Action |
|---|---|---|
| `presentation/controllers/add_product_wizard_controller.dart` | Wizard + Step 1 SM | **EXTEND** |
| `presentation/widgets/scan_barcode/` (TARGET folder) | Step 1 panels | **NEW** |
| `presentation/widgets/barcode_sku/` | Step 5 identifiers | **EXTEND** |
| `presentation/widgets/basic_details/` etc. | Steps 2–7 | **REUSE** |
| `data/datasources/tenant_product_remote_datasource.dart` | HTTP | **EXTEND** |
| `data/repositories/...` | Mapping | **EXTEND** |
| `data/dtos/` | Resolve/external/SKU/draft DTOs | **EXTEND** |
| Shared shell / dialogs / loading | Tenant Admin | **REUSE** |
| HID scanner util | POS integration | **REUSE** framing |

No HTTP from widgets; no external provider from Flutter; no DB logic in Flutter.

## 23. Step 1 state model

Discriminated states: `scanReady`, `scannerInputCaptured`, `validating`, `localMatch`, `noLocalMatch`, `externalSearching`, `externalFound`, `externalNoMatch`, `externalTemporaryFailure`, `manualEntry`, `invalidBarcode`, `noBarcode`.

Carry: raw/normalized identifier, identifierStandard, reportedSymbology, validationMessage, localMatch, externalResult, noBarcodeReason, skuCandidate, prefillDraftData. **Transient Step 1 ≠ persisted draft.**

## 24–25. Scanner + API ownership

HID: focus → buffer → preserve leading zero → Enter completes → one resolve → suppress double → ignore late responses → dispose safely. Manual path separate. Camera not required for Tenant Admin first-class path.

Repository methods: `resolveBarcode`, `lookupExternalProduct`, `generateSkuCandidate`, `createDraft`, `saveDraft`, `loadSetup`, `publish`. Reuse Dio interceptors (auth, tenant, correlation).

## 26. Step 1 UI component matrix

| Component | Reuse? | Action |
|---|---|---|
| Scan panel / waiting status | Shell patterns | **NEW** |
| Enter manually / No barcode actions | Buttons | **NEW** |
| Detected / validating card | Cards | **NEW** |
| Existing Product Found | Safe projection card | **NEW** |
| No local match / external search / found / no match | Cards + loading | **NEW** |
| Manual keypad | Touch patterns | **NEW** |
| Invalid modal | Existing dialogs | **EXTEND** |
| No-barcode reason + SKU preview | Forms | **NEW** |
| View/Edit Product | Existing routes | **REUSE** |
| Cancel/Back / Use This / Create Manually | Footer patterns | **REUSE** |

## 27–29. Routing, draft create, hydration

One Add Product route + state-driven Step 1 subviews. Creation path → `createDraft` → ProductId + rowVersion → step 2. View/Edit → existing detail/edit routes. Cancel → existing exit.

Create flow: disable double-tap → map prefill → `POST .../draft` → hydrate → Step 2. Failure stays Step 1. No persisted Product until create succeeds.

Resume: consume backend-normalized `GET .../setup` only — no client legacy remumber.

## 30–32. Riverpod, errors, permissions UX

One mutation owner (`AddProductWizardController` / providers). Request generation token / cancel previous external lookup so late result A cannot overwrite B. Map §19 outcomes to UI. Hide/disable Add Product without create; safe projection without full view; View/Edit gated; Step 5 identifiers need barcodes.manage UX. Backend remains authority.

## 33–34. Design system + NFR owners

Orange `#FF6A00`, black shell, white workspace, 1024×768, design tokens — no new style system; no 10-step stepper.

| NFR | Owner |
|---|---|
| Security / tenant / secrets | Backend |
| Completed-scan only / N+1 | Both |
| Retry/fallback | Both |
| RowVersion + DB unique | Backend |
| Side-effect-free discovery | Backend |
| Correlation logs | Backend (+ Flutter correlation header if current) |
| A11y / responsive | Flutter |

## 35. Backend implementation sequence

**Final execution order (Chunk 4):** move `catalog.*` policy/guard/seed **early** so new Step 1 APIs are built against canonical permission authority from day one. Developer checklist: [[../../15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]].

| # | Task | Deps | Exit |
|---|---|---|---|
| B1 | Migrations **ONLY:** `product_setup_scan_context` + `product_barcodes.identifier_standard` + `barcode_type` UNKNOWN. **Do not** include `product_setup_initial_tracking` (EXISTING: `20260824095742_AddProductSetupInitialTracking`) | — | **DONE** (source + local test DB; prod/shared not claimed) |
| B2 | Canonical `catalog.*` policy/guard/seed readiness | — | **DONE** — `ValidateProductSetupCreateAccessAsync` / alias path |
| B3 | Shared identifier validation service | B1 optional | **DONE** — `ProductBarcodeFormatValidator.Classify` |
| B4 | Resolve use case + API | B2, B3 | **DONE** — `POST .../barcodes/resolve` |
| B5 | SKU candidate API | B2; generator | **EXTENDED 2026-09-14** — `categoryId`; atomic tenant sequence; `reserved=true`; Product base persisted later by B8 |
| B6 | Provider interface + coordinator | B2, B3 | **IMPLEMENTED** — 0/1/N; zero → NO_MATCH |
| B7 | External lookup endpoint | B6 | **IMPLEMENTED** — FOUND/NO_MATCH/TEMPORARY_FAILURE; no tenant duplicate check |
| B8 | Draft bootstrap + scan context + write-stage mapper wiring | B1, B2; WSM decision | **IMPLEMENTED** — Atomic DRAFT+context; persist step **2**; no final barcodes; write-boundary duplicate when candidate exists |
| B9 | Setup hydrate + legacy **read** remapper | B1, B8 | **IMPLEMENTED** — `ScannerFirstSetupReadMapper`; ScanContext hydrate; LEGACY when absent; zero DB rewrite; not write mapper |
| B10 | Step 5 identifier_standard / UNKNOWN + Step 5 composite routing | B1, B8, B9 | **IMPLEMENTED** — atomic composite Step 5 SKU/barcode; DRAFT only; ScanContext history retained |
| B11 | Publish revalidation | B10 | **IMPLEMENTED** — DRAFT-only; final SKU/barcode Classify+ownership; ReviewCreate rowVersion; no B5/B6/B7 |
| B12 | Backend closure / regression | B11 | **IMPLEMENTED** — B12 closure audit |
| B12 | Backend tests/regression | B4–B11 | **IMPLEMENTED** — CatalogProduct Unit 440 / API 110 / Integration 105; full UnitTests 1820 / ApiTests 562 |

## 36. Flutter implementation sequence

| # | Task | Exit |
|---|---|---|
| F1–F2 | DTOs + repository methods | Mapping tests |
| F3–F4 | Step 1 state + HID | Late-response safe |
| F5–F11 | Step 1 UI states | Widget coverage |
| F12 | Draft bootstrap → Step 2 | No orphan drafts |
| F13 | Step 5 identifierStandard | Round-trip |
| F14–F16 | Resume, permission UX, a11y/1024 | No overflow |
| F17 | analyze + tests | Green |

## 37. Migration safety checklist

**B1 scope only:** `UNKNOWN` + `identifier_standard` + `product_setup_scan_context`.  
**Do not** migrate/recreate `product_setup_initial_tracking` (EXISTING: `20260824095742_AddProductSetupInitialTracking`).

Before: duplicate GTIN audit; current barcode_type set; FK assumptions; confirm initial_tracking already present.  
During: nullable additions first; expand symbology; create **scan_context** table only; indexes.  
After: Product queries OK; POS barcode OK; NULL identifier_standard OK; GTIN14 only on identifier_standard; UNKNOWN accepted; no cross-tenant uniqueness regression; initial_tracking still intact. Rollback per existing EF governance.

## 38–39. Test matrices (documentation — not claimed executed)

**Backend:** unit GTIN/standard/UNKNOWN; app resolve/external/SKU; API 401/403/200 outcomes; integration tenant isolation, bootstrap atomicity, legacy remap, Step 5 assign, publish race, permissions.

**Flutter:** controller SM; repository mapping; widgets for each Step 1 state; double-submit; late async; resume; permission buttons; 1024 overflow.

## 40. Consolidated REUSE matrix

See §4. Mandatory for coding reviews: prefer EXTEND over NEW; never parallel Add Product / barcode subsystems.

## 41. Folder / class naming safety

Prefer **canonical responsibilities**. Use known names when evidenced (`TenantAdminProductsController`, `TenantAdminProductService`, `ProductWizardAccessPolicy`, `SaveProductDraftAsync`, `AddProductWizardController`). Mark others **TARGET NAME — confirm against repository before coding**. Do not fabricate source trees.

## 42. Status labels (do not claim implemented)

Tags: **EXISTING IMPLEMENTATION** | **EXTEND EXISTING** | **TARGET — NOT IMPLEMENTED** | **SUPERSEDED** | **HISTORICAL**.

## 43. Definition of Done (implementation — future coding)

Backend DoD: **B1–B12 IMPLEMENTED** — Backend scanner-first Product Setup = **COMPLETE**; resolve/external/SKU candidate green; draft bootstrap atomic with scan context; GET setup remaps legacy; Step 5/publish revalidate identifiers; `catalog.*` authoritative; regression evidence in §6 unit-test row.

Flutter DoD: F1–F17 exit criteria met; Step 1 SM + HID; all §26 panels; draft→Step 2; resume without client remumber; permission UX; analyze + tests mapped in §39 pass.

Documentation DoD for this Chunk: this architecture + readiness audit + cross-links exist. **Does not** equal product release complete.

## 44. Remaining implementation gaps (genuine coding/migration)

**Backend scanner-first Product Setup = COMPLETE (B1–B12 IMPLEMENTED).** Do not list B11/B12 as remaining.

Closed backend (not remaining):
- Step 1 Backend resolve / SKU / external APIs — **B4–B7 IMPLEMENTED**
- Draft bootstrap scanner path + scan-context **write** persistence (**B8**) — **IMPLEMENTED**
- GET setup legacy **read** remapper + scan-context hydration (**B9**) — **IMPLEMENTED**
- Step 5 final SKU/barcode persistence + reconciliation + identifier_standard wire-up (**B10**) — **IMPLEMENTED**
- Step 7 publish revalidation — **IMPLEMENTED B11**
- B12 final backend closure/regression — **IMPLEMENTED**

Real remaining (non–backend-closure):
- Flutter scanner-first Step 1 state machine + UI + repository methods (F1–F17)
- **BUNDLE Step 5 component graph** draft persist + GET projection (validators/schema exist; draft path stubs / no write) — see [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_STEP2_TO_STEP6_BACKEND_REALITY_AUDIT_2026-09-13]]
- Optional concrete external product-data provider adapter/configuration (abstraction exists; zero providers → `NO_MATCH`)
- Dedicated Duplicate Product backend flow (TARGET / NOT IMPLEMENTED if no dedicated clone API)
- Physical SC-* hardware acceptance (orthogonal; HID software path still first-class)
- Production/shared apply of scanner-first migration (local test DB only so far)

### Closed bugs (post B12)

| # | Bug | Fix | Date |
|---|---|---|---|
| BF-01 | `ValidateStep1Draft()` called `ValidateRequiredCode("productCode")` on scanner-first bootstrap. `productCode` is server-generated — never client-supplied. Caused every `CONTINUE_WITH_BARCODE` and `CREATE_MANUALLY` bootstrap call to return `400 product.validation_failed`. | Removed the `ValidateRequiredCode("productCode")` call from `ValidateStep1Draft` in `TenantAdminProductRequestValidator.cs`. `ValidateOptionalCode("shortName")` and all other checks remain. | 2026-09-16 |

## 45. Related

- [[03_Technical_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]]
- [[../../15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]]
- [[../../15_IMPLEMENTATION_TRACKING/PRODUCT_SETUP_SCANNER_FIRST_FINAL_GAP_MATRIX_2026-09-12]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_IMPLEMENTATION_ARCHITECTURE_READINESS_2026-09-12]]
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_FINAL_DOCUMENTATION_CLOSURE_2026-09-12]]
- [[../../00_START_HERE/Current_Source_Of_Truth]]
