<!-- title: Product Setup Scanner-First Final Implementation Checklist -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Developer execution checklist — DOCUMENTATION ONLY; no item marked complete by this file -->

# PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12

Authority: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]],  
[[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]],  
[[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]],  
[[../00_START_HERE/Current_Source_Of_Truth]].

**Labels:** Status uses REAL evidence. `TARGET — NOT IMPLEMENTED` is not complete. Documentation readiness ≠ full Product Setup implemented. **B1–B12 marked from implementation evidence** (Unified-Commerce 2026-09-13). Write-stage numbering locked 2026-09-13. **Steps 2–6 reality audit 2026-09-13:** backend Steps 2–4/6 + Step 5 VARIANT/SIMPLE+IDs proven; **BUNDLE Step 5 component graph remains PARTIAL**. Flutter phases remain TARGET / EXTEND — **not** marked implemented by this sync.

---

## Developer start package

**Backend starts with:** B1 + B2 + Implementation Architecture.  
**Flutter:** may build mocked Step 1 state/UI + HID framing in parallel; **real repository/integration** waits for Backend contracts (B4–B8).

| Parallelizable now | Integration-dependent |
|---|---|
| B1 migration planning, B2 policy readiness, B3 identifier validator | F12 draft bootstrap, F8 real external calls, F14 resume, publish conflict UX |
| F3 Step 1 SM (mocked), F5 static UI, F4 HID framing reuse | F2 live Dio methods against TARGET APIs |

---

## BACKEND

### B1 — DB migrations (scanner-first ONLY)
| | |
|---|---|
| **Status** | **IMPLEMENTED** (source + unit evidence 2026-09-12) — migration **not** applied to production/shared DB; **local Postgres test DB applied 2026-09-12** (`UnifiedCommerceDb` @ localhost:5434) |
| **Dependencies** | None |
| **Authority** | Tables 10/11; Architecture §13/§37 |
| **Output** | EF migration `20260912085454_AddProductSetupScannerIdentifierContext`: (1) `product_setup_scan_context` 1:1; (2) nullable `product_barcodes.identifier_standard` + CHECK; (3) `UNKNOWN` in `ProductBarcodeFormatValidator.CanonicalTypes` (varchar symbology; no GTIN14 barcode_type) |
| **OUT OF SCOPE** | `product_setup_initial_tracking` — **EXISTING** (`20260824095742_AddProductSetupInitialTracking`). Verified present; **not** recreated in B1 |
| **Tests** | `ProductSetupScanContextTests`; CatalogProduct unit suite includes barcode/validator coverage; full UnitTests 1681 passed |
| **Exit** | Met for foundation. Production/shared DB apply **not** claimed |

### B2 — Canonical `catalog.*` policy/guard/seed readiness
| | |
|---|---|
| **Status** | **IMPLEMENTED** (extend existing) 2026-09-12 |
| **Dependencies** | None |
| **Authority** | Permission Matrix; API_Authorization_Rules; Feature_Entitlement_Matrix |
| **Output** | Reused `ProductConstants` (`catalog.*`) + `PlatformTenantFeatureCodes.ProductCatalog`; `TenantPermissionAliases` one-way expand legacy→canonical; added `ValidateProductSetupCreateAccessAsync` / `ValidateBarcodeManageAccessAsync` on `ProductWizardAccessPolicy` |
| **Tests** | `ProductWizardAccessPolicyTests` create via `catalog.products.create` and `tenant.products.create`; blocks without `product_catalog`; does **not** evaluate `product_management` |
| **Exit** | Future scanner APIs can authorize via one policy owner |

### B3 — Identifier validation reusable owner
| | |
|---|---|
| **Status** | **IMPLEMENTED** (extend `ProductBarcodeFormatValidator`) 2026-09-12 |
| **Dependencies** | B1 optional |
| **Authority** | Scan + Identifier specs; Technical Decision TD-2 |
| **Output** | `Classify(...)` → `ProductIdentifierValidationResult`; GTIN8/12/13/14 checksum; leading zeros preserved; `identifierStandard` ≠ symbology; `UNKNOWN` supported; no catalog lookup |
| **Tests** | `ProductBarcodeFormatValidatorTests` Classify/Validate cases; Step5 CanonicalTypes includes UNKNOWN, excludes GTIN14 |
| **Exit** | Met |

### B4 — Resolve endpoint
| | |
|---|---|
| **Status** | **IMPLEMENTED** (Unified-Commerce evidence 2026-09-12) |
| **Dependencies** | B2, B3 — verified complete before coding |
| **Authority** | API_ENDPOINTS; Scan spec §17.1 |
| **Output** | `POST /api/v1/tenant-admin/products/barcodes/resolve` — side-effect free; outcomes `VALID_LOCAL_MATCH` \| `VALID_NO_LOCAL_MATCH` \| `INVALID` (HTTP 200 envelope) |
| **Tests** | API + app: match/no-match/invalid; tenant isolation; no rows created; CatalogProduct Postgres filter **78/78 PASS** after local B1 apply (env closure) |
| **Exit** | HTTP 200 business outcomes; never POS by-barcode; no draft/scan-context/external |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B4_BARCODE_RESOLVE_IMPLEMENTATION_2026-09-12]] |

### B5 — SKU candidate endpoint
| | |
|---|---|
| **Status** | **IMPLEMENTED** |
| **Dependencies** | B2; Category Code; atomic tenant Product sequence; `ProductSkuCandidateGenerator` |
| **Authority** | API_ENDPOINTS; [[../13_DECISIONS_AND_CHANGES/PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]] |
| **Output** | `POST .../sku-candidates/generate` → `{ candidate: "TSH-000125", reserved: true }` |
| **Tests** | Category formatting, tenant isolation, collision retry, PostgreSQL concurrent allocation, SIMPLE/VARIANT Step 5 finalization |
| **Exit** | Stable Product base; final ownership remains `product_variants.sku` |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B5_SKU_CANDIDATE_IMPLEMENTATION_2026-09-12]] |

### B6 — External provider abstraction / coordinator
| | |
|---|---|
| **Status** | **IMPLEMENTED** |
| **Dependencies** | B2, B3 |
| **Authority** | Architecture §10; Technical Decision |
| **Output** | `IExternalProductLookupProvider` + `ExternalProductLookupCoordinator`; 0/1/N; zero → NO_MATCH |
| **Tests** | Unit coordinator/options/normalizer (27); no public endpoint |
| **Exit** | No secrets/raw DTO leak; no auto Brand/Category; no B7 route |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B6_EXTERNAL_PROVIDER_ABSTRACTION_IMPLEMENTATION_2026-09-12]] |

### B7 — External lookup endpoint
| | |
|---|---|
| **Status** | **IMPLEMENTED** |
| **Dependencies** | B6 |
| **Authority** | API_ENDPOINTS; Scan spec |
| **Output** | `POST .../barcodes/external-lookup` — side-effect free; **no tenant duplicate checking** |
| **Tests** | Unit 8 / API 8; B4 never calls B6; FindBarcodeResolveMatchAsync never from B7 |
| **Exit** | Explicit Search Product Data only (never auto after scan) |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B7_EXTERNAL_LOOKUP_ENDPOINT_IMPLEMENTATION_2026-09-13]] |

### B8 — Draft bootstrap + scan context
| | |
|---|---|
| **Status** | **IMPLEMENTED** (2026-09-13) |
| **Dependencies** | B1, B2; [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] |
| **Authority** | Draft Lifecycle; 7-Step Contract; Architecture §15.1; WSM decision |
| **Output** | Extend `POST .../products/draft` with nested `scanBootstrap`; atomic Product DRAFT + scan context; persist `current_setup_step=2`; `ScannerFirstWizardStageMapper` (API 2 → BasicDetails 1); write-boundary duplicate via `FindBarcodeResolveMatchAsync`; **no** final `product_barcodes` |
| **Tests** | Mapper/normalizer/service unit; API SaveDraft; InMemory repository atomicity/duplicate/no-barcode |
| **Exit** | Met for B8. B9 GET `/setup` hydration **IMPLEMENTED** (2026-09-13) |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B8_DRAFT_BOOTSTRAP_SCAN_CONTEXT_IMPLEMENTATION_2026-09-13]] |

### B9 — GET setup legacy remapper + hydration
| | |
|---|---|
| **Status** | **IMPLEMENTED** (2026-09-13) |
| **Dependencies** | B1, B8 |
| **Authority** | Technical Contract; Decision D11/TD; **read-only** — not write-stage mapper |
| **Output** | `ScannerFirstSetupReadMapper` on `GET .../setup`: old 1→2 … 5→5; ScanContext hydrate typed prefill; no ScanContext → `LEGACY`; **PURE READ** (no channel auto-provision / SaveChanges); BUNDLE Units→Config target preserved |
| **Tests** | Mapper table; scanner-first non-remap; LEGACY projection; identifier preserve; BUNDLE composition; **zero-write channel projection**; service/API/InMemory |
| **Exit** | Met for B9 including zero-write GET. B10 Step 5 identifier reconciliation IMPLEMENTED |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B9_SETUP_HYDRATION_LEGACY_READ_REMAP_IMPLEMENTATION_2026-09-13]] |

### B10 — Step 5 identifier persistence / reconciliation
| | |
|---|---|
| **Status** | **IMPLEMENTED** (2026-09-13) |
| **Dependencies** | B1, B8, B9 |
| **Authority** | Identifier spec; ApplyBarcodeSku; WSM Step 5 SPECIAL/COMPOSITE |
| **Output** | Scanner-first public Step 5 atomic composite: Product Configuration + final SKU/barcode; `product_variants.sku`; `product_barcodes` + `identifier_standard`; no ScanContext rewrite; Save Draft stays 5; Save & Continue → 6; Product remains DRAFT |
| **Tests** | Composite service; repository persist/idempotent/clear/round-trip; legacy BarcodeSku unchanged |
| **Exit** | Met for B10. B11 publish revalidation IMPLEMENTED |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B10_STEP5_IDENTIFIER_RECONCILIATION_IMPLEMENTATION_2026-09-13]] |

### B11 — Publish revalidation
| | |
|---|---|
| **Status** | **IMPLEMENTED** (2026-09-13) |
| **Dependencies** | B10 |
| **Authority** | Review & Create; Architecture §17 |
| **Output** | `POST .../publish`: reload DRAFT; DRAFT-only gate; final SKU/barcode Classify+ownership; category/brand; ReviewCreate `expectedRowVersion`; existing pricing/tracking; no B5/B6/B7 |
| **Tests** | PublishAsync unit (5); ReviewCreate stale rowVersion integration (1); CatalogProduct + full Unit/Api green |
| **Exit** | Met for B11. DB unique remains final race guard |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B11_PUBLISH_REVALIDATION_IMPLEMENTATION_2026-09-13]] |

### B12 — Backend tests / regression
| | |
|---|---|
| **Status** | **IMPLEMENTED** (2026-09-13 closure) |
| **Dependencies** | B4–B11 |
| **Authority** | Architecture §38; Step1 test cases |
| **Output** | Unit/app/API/integration suites for scanner-first |
| **Tests** | CatalogProduct Unit **440** / API **110** / Integration **105**; full UnitTests **1820** / ApiTests **562** |
| **Exit** | Met for backend scanner-first closure |
| **Evidence** | [[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B12_CLOSURE_2026-09-13]] |

---

## FLUTTER

### F1 — DTO / domain models
| Status | TARGET — NOT IMPLEMENTED |
| Dependencies | Backend contract docs (may stub) |
| Authority | Flutter Implementation Spec; API_ENDPOINTS |
| Output | Resolve/external/SKU/draft/setup DTOs + mappers |
| Tests | Mapping unit tests |
| Exit | Widgets never read raw Dio JSON |

### F2 — Repository / data-source methods
| Status | EXTEND REQUIRED |
| Dependencies | F1; live calls need B4–B8 |
| Authority | Architecture §25; Product List Flutter paths |
| Output | `resolveBarcode`, `lookupExternalProduct`, `generateSkuCandidate`, `createDraft`, `saveDraft`, `loadSetup`, `publish` |
| Tests | Repository mapping; no Dio in widgets |
| Exit | Typed results only |

### F3 — Step 1 Riverpod state
| Status | TARGET — NOT IMPLEMENTED |
| Dependencies | F1 |
| Authority | Architecture §23; Flutter Spec §1.0 |
| Output | Discriminated SM on `AddProductWizardController` (extend — no parallel controller) |
| Tests | Late async suppression; double-submit |
| Exit | One mutation owner |

### F4 — HID / scanner integration
| Status | EXTEND REQUIRED (reuse POS framing) |
| Dependencies | F3 |
| Authority | Barcode_Scanner_Integration |
| Output | Focus/buffer/Enter frame; leading zeros; one resolve per frame |
| Tests | Frame + double-scan suppress |
| Exit | Never POS by-barcode |

### F5–F11 — Step 1 UI states
| Status | TARGET — NOT IMPLEMENTED |
| Dependencies | F3–F4 (mocked OK) |
| Authority | UI_UX Spec; Scan Spec S1-A…S1-G / R* |
| Output | Scan panel, validating, local match, no match, external, manual, invalid, no-barcode + SKU candidate |
| Tests | Widget per state; 1024×768 |
| Exit | Internal states only — not extra stepper items |

### F12 — Draft bootstrap → Step 2
| Status | TARGET — NOT IMPLEMENTED |
| Dependencies | F2 + B8 |
| Authority | Draft Lifecycle; Scan Spec creation paths |
| Output | Use This / Create Manually / Continue → `POST .../draft` → step 2 |
| Tests | Failure stays Step 1; no orphan on scan-only |
| Exit | PRE-DRAFT until create succeeds |

### F13 — Step 5 identifiers
| Status | EXTEND REQUIRED / PARTIALLY IMPLEMENTED (pre-scanner evidence) |
| Dependencies | B10 contracts |
| Authority | Identifier Spec; Flutter Spec barcode_sku |
| Output | `identifierStandard`; no fan-out; explicit assign |
| Tests | Round-trip; VARIANT uniqueness |
| Exit | Final IDs only via Step 5 |

### F14 — Setup resume / hydration
| Status | EXTEND REQUIRED |
| Dependencies | B9 |
| Authority | Architecture §29 |
| Output | Consume backend-normalized setup; no client legacy remumber |
| Tests | Legacy resume; missing scan context |
| Exit | Backend remap only |

### F15 — Permission UX
| Status | EXTEND REQUIRED |
| Dependencies | B2 effective permissions |
| Authority | Permission Matrix |
| Output | Hide/disable create/view/edit/barcodes.manage UX |
| Tests | Button gating; safe conflict projection |
| Exit | Backend still authoritative |

### F16 — A11y / responsive
| Status | TARGET for Step 1 surfaces |
| Dependencies | F5–F11 |
| Authority | Design_System; UI_UX Spec |
| Output | 1024×768; focus; non-color errors; touch targets |
| Tests | Overflow; a11y smoke |
| Exit | Design tokens only — no new style system |

### F17 — Flutter tests / analyze
| Status | TARGET — NOT EXECUTED (scanner-first) |
| Dependencies | F3–F16 |
| Authority | Architecture §39 |
| Output | Controller/widget/repository tests + analyze clean for feature |
| Tests | Per Flutter test matrix |
| Exit | Not claimed until executed |

---

## Explicit non-goals of this checklist

- Does **not** declare PRODUCTION READY.
- Does **not** require a concrete external provider for manual Product creation (zero providers → `NO_MATCH`).
- Does **not** include physical SC-* hardware acceptance as a code DoD blocker for software path.
