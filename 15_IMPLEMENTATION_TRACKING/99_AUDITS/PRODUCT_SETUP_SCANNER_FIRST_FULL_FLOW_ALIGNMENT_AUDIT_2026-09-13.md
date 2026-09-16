<!-- title: Product Setup Scanner-First Full Flow Alignment Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-13 -->
<!-- type: Source-based gap / readiness audit + Phase A Flutter foundation progress -->

# PRODUCT SETUP SCANNER-FIRST FULL FLOW ALIGNMENT AUDIT (2026-09-13)

**Purpose:** Source-based audit of Second Brain + Unified-Commerce backend + Nytroz-POS-App Flutter **before** full-flow implementation coding.

**Canonical global stepper (LOCKED):**

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration *(+ final SKU / barcode identifiers — not a separate global step)*  
6. Pricing & Tax  
7. Review & Create  

**Authoritative backend status:** **B1–B10 IMPLEMENTED** · **B11+ PENDING**  
**Flutter Step 1 status (2026-09-13 Phase A in progress):** foundation landed — stepper renumbered; Step 1 SM UI + API clients + controller actions added; Step 5 composite shell (config + identifiers); full panel polish / resume / tests still incomplete.

Evidence bases:
- Second Brain: `Current_Source_Of_Truth`, gap matrix, checklist, Scan Spec, Architecture, Flutter Spec, UI/UX Spec, API_ENDPOINTS, B1–B10 audits  
- Backend: `TenantAdminProductsController`, `TenantAdminProductService`, Wizard repository, B4–B10 code  
- Flutter: `AddProductStepper`, `AddProductWizardController`, `add_product_wizard.dart`, `tenant_product_remote_datasource.dart`, `barcode_sku/`, **NEW** `scan_barcode/`, **NEW** `product_setup_scan_dtos.dart`

**Do not conflate** documentation readiness with Flutter scanner-first delivery.

---

## 0. Executive verdict

| Layer | Verdict |
|---|---|
| Second Brain contracts | **DOCUMENTED / LOCKED** (scanner-first) |
| Backend B1–B10 (resolve → draft → setup → composite Step 5) | **IMPLEMENTED** |
| Backend B11 publish revalidation | **PENDING / PARTIAL** (legacy publish only) |
| Flutter global stepper | **OBSOLETE OLD FLOW** (Basic Details first; Barcode & SKU global step 5) |
| Flutter Step 1 SM + UI (S1-A…S1-R3) | **MISSING** |
| Flutter API clients (resolve / external / SKU candidate / scanBootstrap / scanContext) | **MISSING** |
| Flutter Steps 2–7 content widgets | **EXISTING under old numbering** — **EXTEND / RENUMBER** required |
| Flutter Step 5 composite (config + identifiers) | **PARTIAL** (config = old step 4; identifiers = old global step 5) |
| External provider adapters | **NONE configured** → backend `NO_MATCH` is correct supported result |
| POS by-barcode from Tenant Admin | **MUST NOT USE** — backend already compliant; Flutter must stay compliant |
| Shell / design system | **REUSE** — do not redesign Tenant Admin layout |

**Coding gate:** This matrix is complete. Implementation may proceed **reuse-first**, prioritizing Flutter F1–F17 + stepper renumber + Step 5 composite fold. Backend work only for **proven** gaps (primarily B11 if in scope of this mission — mission §42 says do not start broad B11/B12 merely because it appears on roadmap; publish path remains legacy until explicitly scoped).

---

## 1. Full requirement matrix

Legend — **Status:** `IMPLEMENTED` | `PARTIAL` | `DOCUMENTED ONLY` | `MISSING` | `CONFLICT` | `OBSOLETE OLD FLOW`

| # | Requirement | Second Brain | Flutter | Backend | API | Database | Permission | NFR/Test | Status | Required Action |
|---|---|---|---|---|---|---|---|---|---|---|
| R01 | Global 7-step scanner-first stepper labels | LOCKED | Old 7 labels; Barcode global | n/a | n/a | n/a | n/a | Flutter stepper tests old labels | **OBSOLETE OLD FLOW** | Update `AddProductStepper.steps`; remove global Barcode & SKU; insert Scan Barcode |
| R02 | Fresh Add Product lands Step 1 = Scan | Flutter Spec §1.0 | Starts Step 1 Basic Details | Draft create lands public step 2 after bootstrap | POST draft | scan_context | create + product_catalog | — | **CONFLICT** (Flutter vs SB/BE) | Flutter `initWizard` → Scan; draft only on creation path |
| R03 | Barcode & SKU not a global step | SUPERSEDED | Still global step 5 | Composite Step 5 write B10 | PUT draft step 5 | variants.sku / product_barcodes | barcodes.manage | B10 tests pass | **CONFLICT** | Fold `barcode_sku/` into Product Configuration step; review cards update |
| R04 | S1-A Scan Product Barcode UI | Scan Spec | MISSING | n/a | n/a | n/a | UX | — | **MISSING** | Build Step 1 panel; reuse shell/footer |
| R05 | HID keyboard-wedge one frame → one resolve | Barcode_Scanner_Integration; Flutter Spec | POS HID exists; Product Setup unused; Step 5 focus-only | resolve side-effect free | POST resolve | n/a | create | POS HID software hardened | **PARTIAL** | Reuse POS HID framing for Step 1 listen; never POS by-barcode API |
| R06 | Leading zeros preserved as string | Identifier Spec; B3 | Step 5 local helpers | Classify | resolve | barcode varchar | — | B3/B10 tests | **PARTIAL** | Ensure Step 1 buffer/API clients never parse as int |
| R07 | S1-B validation progress (format / check digit / catalogue) | Scan Spec | MISSING | Classify + resolve | resolve | n/a | create | B3/B4 | **MISSING** | UI progress rows; GTIN check ≠ catalogue existence |
| R08 | Automatic tenant catalogue lookup after valid structure | Scan Spec | MISSING | Resolve | POST resolve | product_barcodes | create + product_catalog | B4 | **MISSING** (Flutter consume) | Wire Dio → resolve; auto after validate |
| R09 | Never call POS `by-barcode` | API_ENDPOINTS; Scan Spec | No call found (good) | Separate Pos path | POS GET | — | POS context | — | **IMPLEMENTED** (isolation) | Preserve; Tenant Admin resolve only |
| R10 | S1-C Existing Product Found card | Scan Spec | MISSING | Resolve `VALID_LOCAL_MATCH` projection | resolve | products/variants | view/update for actions; create for resolve | B4 | **MISSING** | Safe projection UI; View/Edit gated |
| R11 | View Product = catalog.products.view | Permission Matrix | Capability exists; no Scan UI | n/a | product detail | — | view | — | **PARTIAL** | Wire S1-C CTA |
| R12 | Edit Existing = catalog.products.update | Permission Matrix | Capability exists | — | — | — | update | — | **PARTIAL** | Wire S1-C → edit/resume existing product |
| R13 | Duplicate ≠ Edit; clear identifiers on clone | Scan Spec / Identifier | `ProductDuplicateAction` + `?duplicateFrom=` clears barcode in controller path | draft create | — | — | create | — | **PARTIAL** | Rename UX to Duplicate Product Data / Create Duplicate Draft; verify SKU/barcode cleared; no stock history |
| R14 | S1-D No local match + retain candidate | Scan Spec | MISSING | `VALID_NO_LOCAL_MATCH` | resolve | — | create | B4 | **MISSING** | Panel + actions |
| R15 | Search Product Data explicit only | Scan Spec | MISSING | External lookup B7 | POST external-lookup | — | create | B7 | **MISSING** | Do not auto-call external |
| R16 | S1-E / S1-F / S1-G external panels | Scan Spec | MISSING | Coordinator B6; zero providers → NO_MATCH | external-lookup | — | create | B6/B7 | **MISSING** | FOUND / NO_MATCH / TEMPORARY_FAILURE UX |
| R17 | No Flutter provider scrape / credentials | Architecture | Compliant (no provider HTTP) | No production adapter | — | — | secrets backend-only | B6 | **IMPLEMENTED** (architecture) | Keep; document NO_MATCH when zero providers |
| R18 | External brand/category/unit text ≠ auto master IDs | Scan Spec TD | MISSING prefill rules | Prefill on scanBootstrap | draft scanBootstrap | brands/categories ACTIVE match only | — | — | **MISSING** (Flutter) / **PARTIAL** (BE bootstrap) | Prefill editable; no auto-create Brand/Category/UOM |
| R19 | Use This Product / Create Manually → draft step 2 | Scan Spec; B8 | MISSING | POST draft + scanBootstrap | draft | scan_context | create | B8 | **MISSING** (Flutter) | Creation-path only; no abandoned drafts |
| R20 | S1-R1 Manual barcode 8/12/13/14 | Scan Spec | MISSING | Same resolve pipeline | resolve | — | create | — | **MISSING** | Keypad + length chips; Validate → resolve |
| R21 | S1-R2 Invalid — no catalogue/external | Scan Spec | MISSING | Resolve INVALID / Classify | resolve | — | create | B3/B4 | **MISSING** | Try Again / Rescan / No barcode |
| R22 | S1-R3 No-barcode OWN_MADE/SERVICE_FEE/UNLABELLED | Scan Spec | MISSING | B5 SKU candidate + B8 NO_BARCODE | sku-candidates + draft | scan_context | create | B5/B8 | **MISSING** (Flutter) | Reasons ≠ Product Structure |
| R23 | AUTO Product base from Category Code + tenant sequence | 2026-09-14 AUTO SKU decision | Historical UI state | Backend extended | sku-candidates | sequence + later scan_context | create | B5 extended | **BACKEND IMPLEMENTED; FLUTTER PENDING** | Flutter calls backend only; never composes |
| R24 | Step 2 Basic Details reuse + prefill | Contract | EXISTING as Flutter step 1 | Setup hydrate B9 | GET setup / PUT draft | products | create/update | — | **OBSOLETE OLD FLOW** numbering | Renumber to step 2; hydrate scanContext prefill |
| R25 | Step 3 Type & Tracking + Initial Tracking | EXISTING | EXISTING as Flutter step 2 | EXISTING + initial_tracking | draft | product_setup_initial_tracking | inventory_tracking for advanced | — | **OBSOLETE OLD FLOW** numbering | Renumber; preserve UI |
| R26 | Step 4 Unit & Pack | DOCUMENTED | EXISTING as Flutter step 3 | EXISTING | draft | unit settings | — | — | **OBSOLETE OLD FLOW** numbering | Renumber; BUNDLE skip rules already BE |
| R27 | Step 5 Product Configuration | DOCUMENTED | EXISTING as Flutter step 4 | EXISTING | draft | variants | variants.manage | — | **OBSOLETE OLD FLOW** numbering | Become public step 5; host identifiers |
| R28 | Step 5 final SKU/barcode composite | Identifier Spec; B10 | Separate global step 5 form | Composite write B10 | PUT draft | variants.sku / product_barcodes + identifier_standard | barcodes.manage | B10 | **PARTIAL** | Embed identifier section in config step; send `currentSetupStep=5` scanner semantics |
| R29 | No GTIN fan-out to all variants | Identifier Spec; B10 | Risk if Step 1 candidate copied | B10 rejects fan-out | — | product_barcodes unique | — | B10 | **PARTIAL** | Flutter must not auto-assign candidate to all variants |
| R30 | Step 6 Pricing & Tax | Step6 audits | EXISTING step 6 | EXISTING | draft | pricing/tax | product_pricing.manage | Step6 closures | **IMPLEMENTED** (content) | Keep index 6; adjust prev/next graph |
| R31 | Step 7 Review & Create | Review Spec | EXISTING step 7; review still models Barcode as step 5 | Publish path exists | publish | — | products.publish | — | **PARTIAL** | Update review sections for scanner-first ownership; B11 revalidation still pending BE |
| R32 | GET setup resume + ScanContext + public step | B9 PURE READ | getSetup exists; no scanContext DTO/hydrate | B9 IMPLEMENTED | GET setup | scan_context | view\|create\|update | B9 zero-write | **PARTIAL** | Flutter DTOs + consume normalized step; **no client ±1 remap** |
| R33 | Save Draft / Save & Continue semantics | Draft Lifecycle | Footer exists; live draft often blocked locally | BE wizard actions | PUT draft | row_version | — | — | **PARTIAL** | Re-enable live draft persistence for scanner path; Step 5 stay 5 / continue → 6 |
| R34 | expectedRowVersion concurrency | Contract | Local draft model | BE 409 | draft | row_version | — | BE tests | **PARTIAL** | Wire rowVersion on Flutter draft updates |
| R35 | B11 publish-time identifier revalidation | Architecture §17 | Conflict drawers exist partially | Legacy publish only | publish | UNIQUE | publish | — | **MISSING** (BE B11) | Out of broad roadmap scope unless mission expands; document remaining gap |
| R36 | Tenant Admin shell / tokens / footer | UI/UX Spec; Design System | EXISTING | n/a | n/a | n/a | n/a | — | **IMPLEMENTED** | REUSE only — no redesign |
| R37 | Tablet 1024×768 primary | UI/UX | Existing breakpoints | n/a | n/a | n/a | n/a | Partial tests | **PARTIAL** | Add Step 1 overflow tests |
| R38 | Permission create + product_catalog for Step 1 APIs | Matrix; B2 | Page create gate; barcodes not wired for Step 5 disable | Policy IMPLEMENTED | resolve/external/sku/draft | — | catalog.* | B2 tests | **PARTIAL** | Flutter UX gates for S1-C + barcodes.manage on identifier edits |
| R39 | Production/shared DB migration apply | B1 | n/a | Source + local test DB | — | migration exists | — | local apply | **PARTIAL** (ops) | Do not silently claim prod apply |
| R40 | Flutter analyze + scanner-first tests | Checklist F17 | Old wizard tests only | B1–B10 suites green | — | — | — | Backend green; Flutter scanner suite absent | **MISSING** (Flutter tests) | Add suites after UI |

---

## 2. Step 1 state machine inventory

| State | Name | Second Brain | Backend support | Flutter | Status | Action |
|---|---|---|---|---|---|---|
| S1-A | Scan Product Barcode | DOCUMENTED | n/a (client) | MISSING | **MISSING** | Build listen UI |
| S1-B | Barcode Detected / Validating | DOCUMENTED | Classify + resolve | MISSING | **MISSING** | Progress UI + pipeline |
| S1-C | Existing Product Found | DOCUMENTED | Resolve local match | MISSING | **MISSING** | Summary card + View/Edit |
| S1-D | No Local Match Found | DOCUMENTED | Resolve no match | MISSING | **MISSING** | Retain candidate; Search / Manual / Back |
| S1-E | Search Product Data (in-flight) | DOCUMENTED | External lookup | MISSING | **MISSING** | Explicit user action only |
| S1-F | Product Found (external) | DOCUMENTED | FOUND suggestion | MISSING | **MISSING** | Use This / Create Manually |
| S1-G | External No Match | DOCUMENTED | NO_MATCH (incl. zero providers) | MISSING | **MISSING** | Four recovery actions |
| S1-R1 | Enter Barcode Manually | DOCUMENTED | Same resolve | MISSING | **MISSING** | 8/12/13/14 + Validate |
| S1-R2 | Invalid Barcode | DOCUMENTED | INVALID outcome | MISSING | **MISSING** | No catalogue/external |
| S1-R3 | Create Without Barcode | DOCUMENTED | B5 + B8 NO_BARCODE | MISSING | **MISSING** | Reasons + SKU candidate |

**Transitions (target — not yet Flutter-implemented):**

```
S1-A --scan/manual validate--> S1-B
S1-B --INVALID--> S1-R2
S1-B --VALID_LOCAL_MATCH--> S1-C
S1-B --VALID_NO_LOCAL_MATCH--> S1-D
S1-D --Search Product Data--> S1-E
S1-E --FOUND--> S1-F
S1-E --NO_MATCH--> S1-G
S1-E --TEMPORARY_FAILURE--> retry / manual (never dead-end)
S1-A --Enter manually--> S1-R1
S1-A --No barcode--> S1-R3
S1-R1 --Validate--> S1-B
S1-R2 --Try Again--> S1-R1 | S1-B
S1-R2 --Rescan--> S1-A
S1-R2 / S1-G --Create without barcode--> S1-R3
S1-F / S1-G / S1-R3 / continue-with-barcode --> POST draft --> Global Step 2
```

---

## 3. Backend endpoint readiness (reuse-first)

| Endpoint | Status | Notes |
|---|---|---|
| `POST .../barcodes/resolve` | **IMPLEMENTED (B4)** | Side-effect free; Tenant Admin only |
| `POST .../barcodes/external-lookup` | **IMPLEMENTED (B7)** | No tenant duplicate check; zero providers → NO_MATCH |
| `POST .../sku-candidates/generate` | **EXTENDED 2026-09-14** | `categoryId`; atomic tenant sequence; returns stable Product base |
| `POST .../products/draft` + `scanBootstrap` | **IMPLEMENTED (B8)** | Lands `current_setup_step=2` |
| `PUT .../products/{id}/draft` | **IMPLEMENTED** | Scanner write map + **B10 composite Step 5** |
| `GET .../products/{id}/setup` | **IMPLEMENTED (B9)** | PURE READ; ScanContext hydrate; legacy remap |
| `GET .../create-options` | **IMPLEMENTED** | Includes barcode types |
| `POST .../products/{id}/publish` | **PARTIAL** | Exists; **B11 scanner-era revalidation NOT IMPLEMENTED** |

**Concrete external provider adapters in src:** **NONE** (by design).

---

## 4. Flutter ownership inventory (current)

| Area | Path | Status |
|---|---|---|
| Stepper | `.../widgets/add_product_stepper.dart` | OBSOLETE labels |
| Wizard shell | `.../widgets/add_product_wizard.dart` | Old `switch(currentStep)` |
| Controller | `.../controllers/add_product_wizard_controller.dart` | No scan SM / API methods |
| State | `.../domain/entities/add_product_wizard_state.dart` | No scanContext / Step1 SM |
| Datasource | `.../data/datasources/remote/tenant_product_remote_datasource.dart` | draft/setup exist; no resolve/external/sku |
| Identifiers UI | `.../widgets/barcode_sku/` | Global old Step 5 |
| Product Configuration | `.../widgets/` variant/units/etc. | Old indices |
| Review | `.../widgets/review_create/review_create.dart` | Still “Step 5 Barcode & SKU” |
| POS HID (reuse candidate) | `lib/features/sale/.../pos_barcode_scanner_listener.dart` | REUSE framing for Step 1 |
| Scan barcode widgets | — | **MISSING folder** |

---

## 5. Database readiness

| Object | Status |
|---|---|
| `product_setup_scan_context` | **IMPLEMENTED** (B1; local test DB applied; prod/shared apply not claimed) |
| `product_barcodes.identifier_standard` | **IMPLEMENTED** (B1) + B10 write |
| `product_variants.sku` | EXISTING — final SKU owner |
| `product_barcodes` unique (tenant + barcode) | EXISTING — race authority |
| `product_setup_initial_tracking` | EXISTING (out of scanner B1) |
| New migration required for full-flow alignment? | **NOT EXPECTED** if Flutter consumes existing schema |

---

## 6. Permission / entitlement readiness

| Concern | Code | Backend | Flutter |
|---|---|---|---|
| Step 1 APIs / draft create | `catalog.products.create` + `product_catalog` | IMPLEMENTED | Page create gate PARTIAL |
| View existing | `catalog.products.view` | OK | Capability exists; unused in Scan UI |
| Edit existing | `catalog.products.update` | OK | Capability exists; unused in Scan UI |
| Final barcode mutation | `catalog.barcodes.manage` | Sanitized on draft | Not wired to disable identifier UI |
| Publish | `catalog.products.publish` | OK | Existing review/create |
| Runtime entitlement | `product_catalog` (not `product_management`) | IMPLEMENTED | Confirm entitlement checks on new calls |

---

## 7. Obsolete / conflict hotspots (active code)

| Hotspot | Classification |
|---|---|
| Stepper includes `'Barcode & SKU'` | OBSOLETE OLD FLOW |
| Comment/code: Fresh Add starts Basic Details | OBSOLETE OLD FLOW |
| `Step1BasicDetails`, `Step5BarcodeSkuForm` naming vs scanner indices | CONFLICT / rename carefully |
| Review section “Step 5 — Barcode & SKU” | OBSOLETE OLD FLOW |
| Local-only draft blocking for steps 1–6 | CONFLICT with live scanner bootstrap |
| Client ±1 remap | Not present as ±1 arithmetic; old structure graph instead — still wrong for scanner-first |

---

## 8. Screenshots / Functional UX

| Source | Finding |
|---|---|
| Dedicated Product Setup screenshot pack under Knowledge | **Not found** as named screenshot assets in this audit pass |
| `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification.md` | **EXISTS** — authority for shell/tokens; scanner-first Step 1 panels documented in Scan Spec + Flutter Spec |
| Existing Product Setup screens | REUSE shell; implement Step 1 panels inside existing wizard card |

---

## 9. Implementation sequencing (post-audit)

**Phase A — Flutter foundation (no shell redesign)**  
1. DTOs/mappers: resolve, external-lookup, sku-candidate, scanBootstrap, scanContext on setup  
2. Datasource + repository methods  
3. Step 1 Riverpod/controller SM  
4. Stepper label renumber + wizard `switch` remapping  
5. Step 1 UI panels S1-A…S1-R3  
6. HID reuse on S1-A  
7. Creation-path draft bootstrap → Step 2  

**Phase B — Step 5 composite Flutter**  
1. Move/embed identifier UI into Product Configuration step  
2. Remove global Barcode & SKU stepper entry  
3. Persist via PUT draft `currentSetupStep=5` with config + `barcodeSkuConfiguration`  
4. Update Review sections  

**Phase C — Resume / permissions / NFR**  
1. GET setup hydrate ScanContext + public step (no Flutter remap)  
2. Permission UX for S1-C and barcodes.manage  
3. Idempotent double-tap guards; rowVersion  
4. Tests + analyze  

**Phase D — Backend**  
- **REUSE B1–B10** — do not reimplement  
- **B11** only if explicitly required for “Review & Create authoritative publish validation” in this mission; otherwise remain documented remaining gap  

**Phase E — Second Brain**  
- Update status only after code/tests prove delivery  
- Mark Flutter F* items from TARGET → IMPLEMENTED with evidence  
- Keep B11 PENDING unless implemented  

---

## 10. Coding gate statement

**SOURCE-BASED GAP MATRIX COMPLETE — READY FOR IMPLEMENTATION.**

No backend/Flutter source was modified by this audit file.

No Git/GitHub operations performed.

---

## 11. Related

- [[../PRODUCT_SETUP_SCANNER_FIRST_FINAL_GAP_MATRIX_2026-09-12]]
- [[../PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scanner_First_Implementation_Architecture]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_Flutter_Implementation_Specification]]
- [[PRODUCT_SETUP_SCANNER_FIRST_BACKEND_B10_STEP5_IDENTIFIER_RECONCILIATION_IMPLEMENTATION_2026-09-13]]
- [[../../00_START_HERE/Current_Source_Of_Truth]]
