<!-- title: Product Setup Scanner-First Final Gap Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Gap / readiness matrix — DOCUMENTATION ONLY -->

# PRODUCT_SETUP_SCANNER_FIRST_FINAL_GAP_MATRIX_2026-09-12

Companion: [[PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]],  
[[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_FINAL_DOCUMENTATION_CLOSURE_2026-09-12]],  
[[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]],  
[[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

**Documentation status:** DOCUMENTATION CANONICALIZED — IMPLEMENTATION ARCHITECTURE READY  
**Implementation status:** **BACKEND B1–B12 COMPLETE** — write-stage numbering **LOCKED** (`persist_2_plus_write_map`) — **Flutter still PENDING / PARTIAL**  
Evidence: Phase1, B4, B5, B6, B7, B8, B9, B10,  
[[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B11_PUBLISH_REVALIDATION_IMPLEMENTATION_2026-09-13]],  
[[99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B12_CLOSURE_2026-09-13]]  
**Do not conflate** documentation ready with full Product Setup implemented / production migration applied / hardware accepted.

---

## 1. Final implementation status matrix

| Capability | Documentation | Implementation | Backend | Flutter | DB | Permission | Test | Blocking? | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| Step 1 Scanner UI | DOCUMENTED ONLY | TARGET — NOT IMPLEMENTED | n/a | TARGET | n/a | UX gated | NOT EXECUTED | No (coding) | Flutter Spec §1.0 |
| GTIN validation (shared) | DOCUMENTED | **IMPLEMENTED** | `ProductBarcodeFormatValidator.Classify` | consume | n/a | n/a | PASS (unit) | No | Phase1 audit |
| Local barcode resolve API | DOCUMENTED | **IMPLEMENTED** | `POST .../barcodes/resolve` (B4) | TARGET consume | n/a | catalog.create + product_catalog | PASS (unit/API/InMemory) | No | B4 audit |
| External lookup API | DOCUMENTED | **IMPLEMENTED** | `POST .../barcodes/external-lookup` (B7); no tenant duplicate check | TARGET consume | n/a | create + product_catalog | PASS (unit/API) | No | B7 audit |
| External provider abstraction | DOCUMENTED | **IMPLEMENTED** | `IExternalProductLookupProvider` + `ExternalProductLookupCoordinator` (B6); zero providers → NO_MATCH | n/a (no Flutter call) | n/a | backend secrets | PASS (unit) | No — optional concrete provider | B6 audit |
| No-barcode flow | DOCUMENTED | PARTIAL (backend done; Flutter pending) | **IMPLEMENTED B8** (`scanBootstrap` no-barcode path) | TARGET UI | model ready | create | PASS (backend InMemory) / Flutter NOT EXECUTED | No | Scan Spec S1-R3; B8 audit |
| SKU candidate API | DOCUMENTED | **IMPLEMENTED** | `POST .../sku-candidates/generate` (B5) | TARGET consume | none | create + product_catalog | PASS (unit/API/InMemory) | No | B5 audit |
| Product draft bootstrap (scanner path) | DOCUMENTED + WSM LOCKED | **IMPLEMENTED** | `POST .../draft` + `scanBootstrap` (B8) | TARGET | model ready | create | PASS (unit/API/InMemory) | No | B8 audit; WSM decision |
| scan-context DB | DOCUMENTED | **IMPLEMENTED** | Entity+EF+migration | hydrate later | **local test DB applied** (2026-09-12); prod apply not claimed | n/a | PASS (unit + schema verify) | No | B4 env closure |
| identifier_standard DB | DOCUMENTED | **IMPLEMENTED** | nullable column+CHECK | EXTEND later | **local test DB applied** (2026-09-12); prod apply not claimed | barcodes.manage | PASS (unit + Wizard Postgres) | No | B4 env closure |
| UNKNOWN symbology | DOCUMENTED | **IMPLEMENTED** | CanonicalTypes + Classify | EXTEND later | varchar (no GTIN14 type) | — | PASS (unit) | No | Phase1 audit |
| Initial Tracking draft table | DOCUMENTED | EXISTING | EXISTING | EXISTING/EXTEND | EXISTING (`20260824095742_...`) | EXISTING | PARTIAL EVIDENCE — Initial Tracking closure audit | No | **out of B1** |
| Basic Details (Step 2) | DOCUMENTED | **BACKEND IMPLEMENTED** / Flutter EXTEND | **IMPLEMENTED** draft path + GET + publish masters | EXISTING/EXTEND | EXISTING | create/update + channels/media | PASS (unit) | No | [[99_AUDITS/PRODUCT_SETUP_STEP2_TO_STEP6_BACKEND_REALITY_AUDIT_2026-09-13]] |
| Product Type & Tracking (Step 3) | DOCUMENTED | **BACKEND IMPLEMENTED** / Flutter EXTEND | **IMPLEMENTED** structure/tracking/initial + Continue routing matrix | EXISTING/EXTEND | EXISTING (+ initial tracking) | create/update + `inventory_tracking` | PASS (unit) | No | Reality audit 2026-09-13 |
| Unit & Pack (Step 4) | DOCUMENTED | **BACKEND IMPLEMENTED** (SIMPLE/VARIANT when Track ON; BUNDLE N/A) / Flutter pending | **IMPLEMENTED** `ApplyUnitsPackConversionAsync`; VARIANT+TrackON → Units fixed; BUNDLE write rejected | pending UI | EXISTING | EXISTING | PASS (validator + next-stage unit) | No | Units Spec; Reality audit |
| Variant Product Configuration (Step 5) | DOCUMENTED | **BACKEND IMPLEMENTED** / Flutter PARTIAL | **IMPLEMENTED** Cartesian/hash/tombstones/rehydrate + B10 IDs | PARTIAL/pending UI | EXISTING | variants.manage | PASS | No | Variant audits + Reality audit |
| Bundle Product Configuration (Step 5) | DOCUMENTED | **PARTIAL** | **PARTIAL** — default sellable identity + B10 IDs; **component graph draft persist MISSING** (validation stubs; no `combo_*` write on draft) | pending | schema exists | combo_components.manage | DOCUMENTED / thin | No (backend gap) | Reality audit — do not claim COMPLETE |
| Step 5 identifier assignment | DOCUMENTED | PARTIAL (backend done; Flutter pending) | **IMPLEMENTED B10** (composite Step 5; `identifier_standard` wire-up) | PARTIAL / TARGET | identifier_standard column ready | barcodes.manage | PASS (backend) / Flutter pending | No | Identifier Spec; B10 audit |
| Pricing & Tax (Step 6) | DOCUMENTED | **BACKEND IMPLEMENTED** / Flutter PARTIAL | **IMPLEMENTED** SIMPLE + `variantPrices[]` + tax + GET + publish; ExpectedRowVersion enforced | PARTIAL | EXISTING | product_pricing.manage | PASS (validators + publish) | No | Reality audit 2026-09-13 |
| Review & Create (Step 7) | DOCUMENTED | PARTIAL (backend done; Flutter pending) | **IMPLEMENTED B11** (`POST .../publish` revalidation) + **B12** closure | EXISTING/EXTEND | EXISTING | products.publish | PASS (unit + integ) / Flutter pending | No | Review Spec; B11/B12 audits |
| Publish revalidation (scanner-era) | DOCUMENTED | **IMPLEMENTED B11** | `POST .../publish` | conflict UX | UNIQUE barcode | publish | PASS (unit + integ) | No | B11 audit |
| Legacy draft rehydration remap | DOCUMENTED | **IMPLEMENTED** | `ScannerFirstSetupReadMapper` on GET `/setup` (B9); **PURE READ** | consume only | n/a | view/create/update | PASS (unit/API/InMemory zero-write) | No | B9 audit |
| catalog.* policy/seed transition | DOCUMENTED | **IMPLEMENTED** (policy methods + existing seeds/aliases) | EXTEND complete for Phase1 | UX | n/a | canonical usable | PASS (unit) | No | Phase1 audit |
| Media staging | DOCUMENTED | IMPLEMENTED (existing) | EXISTING | EXISTING | EXISTING | media perms | PARTIAL EVIDENCE | No | Image Manager |
| Scanner hardware acceptance | DOCUMENTED | HARDWARE GAP | n/a | PARTIAL software HID | n/a | n/a | PHYSICAL PENDING | Hardware acceptance only | Barcode_Scanner_Integration |

---

## 2. DOCUMENTATION GAP

| Item | Status |
|---|---|
| Canonical 7-step + Step 1 SM + APIs + DB + permissions + architecture | **CLOSED** (Chunks 1–4) |
| Active stale “Reconciliation with Step 4” (pricing vs variant matrix) | **FIXED** 2026-09-12 → Step 5 |
| Unbannered historical Product Setup audits | **BANNERED** 2026-09-12 (selected remaining files) |
| Remaining doc invent-ownership questions | **NONE** |

---

## 3. IMPLEMENTATION GAP (coding / migration)

**Closed in Backend Phase 1 (B1+B2+B3):** shared GTIN/identifier classifier; scan-context + identifier_standard migration source; UNKNOWN symbology; ProductWizard create/barcode policy methods; Initial Tracking confirmed EXISTING and excluded.

**Backend B1–B12 = IMPLEMENTED** (scanner-first Product Setup backend COMPLETE). Closed coding items:

1. Step 1 Backend: draft bootstrap scan path (**B8**); resolve = B4; SKU = B5; provider = B6; external-lookup = B7  
2. GET setup legacy remapper + scan-context hydrate (**B9**)  
3. Step 5 identifier persistence / reconciliation (**B10**)  
4. Publish-time identifier revalidation (**B11**)  
5. Backend closure / regression (**B12**)

**Still open (non–backend-closure):**

1. Flutter Step 1 SM + UI + repository wiring (F1–F17) — **PENDING / PARTIAL**  
2. Step 5 identifier Flutter consume where pending (**B10** backend done; Flutter F13)  
3. **BUNDLE Step 5 component graph draft persist / GET projection** — real backend PARTIAL (see Reality audit 2026-09-13)  
4. Concrete external product-data provider adapter/configuration (optional; zero → NO_MATCH)  
5. Dedicated Duplicate Product backend flow — TARGET / NOT IMPLEMENTED  
6. Apply scanner-first migration to authorized non-prod/prod environments (ops)

**Not a gap for B1:** `product_setup_initial_tracking` recreation.

---

## 4. INTEGRATION GAP

| Item | Notes |
|---|---|
| Flutter live calls to TARGET APIs | Wait on Flutter Step 1; backend readiness **B1–B12 IMPLEMENTED** |
| External lookup end-to-end | Needs at least one provider **or** accepts zero → NO_MATCH |
| Draft resume with scan context | **B9 DONE** backend hydrate/remap; Flutter F14 consume still TARGET |
| Row-version / publish conflict UX | **B11 IMPLEMENTED** backend; Flutter conflict UX still PENDING |

---

## 5. HARDWARE ACCEPTANCE GAP

| Item | Notes |
|---|---|
| Physical SC-* scanner acceptance | Open per Barcode_Scanner_Integration; **not** a documentation blocker |
| HID software path | First-class for Product Setup; reuse POS framing |

---

## 6. OPTIONAL / FUTURE GAP

| Item | Blocker for manual create? |
|---|---|
| Concrete external product-data provider | **No** — zero providers → public `NO_MATCH` |
| Dedicated Duplicate Product backend flow | **No** — TARGET / NOT IMPLEMENTED; independent of B11/B12 |
| `ITF14` symbology | **No** — not introduced; only if scanner reports later |
| Camera scanning for Tenant Admin Step 1 | **No** — physical HID first-class |

---

## 7. What is NOT a documentation blocker

- Flutter Step 1 not fully built  
- Optional concrete provider missing  
- Dedicated Duplicate Product backend flow not implemented  
- Hardware not physically accepted  
- Production/shared scanner migration apply not claimed  

Developers can implement Flutter from checklist + architecture without inventing wizard/route/DB/permission ownership. Backend B1–B12 is already complete.
