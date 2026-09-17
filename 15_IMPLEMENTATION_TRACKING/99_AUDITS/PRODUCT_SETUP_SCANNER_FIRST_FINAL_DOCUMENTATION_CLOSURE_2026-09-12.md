<!-- title: Product Setup Scanner-First Final Documentation Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-12 -->
<!-- type: Chunk 4 final Second Brain closure — DOCUMENTATION ONLY; no implementation claimed -->

> **Implementation status note (2026-09-12):** Historical documentation-closure snapshot preserved. Implementation status has advanced (Backend B1–B4); see [[../../00_START_HERE/Current_Source_Of_Truth]] and current implementation checklist.

# PRODUCT_SETUP_SCANNER_FIRST_FINAL_DOCUMENTATION_CLOSURE_2026-09-12

## A. Scope

Final cross-document verification of Tenant Admin Product Setup **scanner-first 7-step** Second Brain. Chunks 1–3 closed. This audit **does not** implement Backend/Flutter, apply migrations, or claim scanner-first code complete.

## B. Authorities read (minimum)

`00_START_HERE/Current_Source_Of_Truth.md` · `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md` · Product Core 01/02/03 + `05_Tenant_Admin_Add_Product_7_Step_Contract` · Scan / Identifier / Draft Lifecycle / Type-Tracking / Units / Review · Variant module 01 + Variant Configuration Spec · Permission Matrix + API_Authorization_Rules + Feature_Entitlement_Matrix · API_ENDPOINTS · DB Tables 10/11 · UI_UX 7-Step · Flutter 7-Step Spec · Barcode_Scanner_Integration · Decisions 2026-09-11 + 2026-09-12 · Implementation Architecture · Chunk 1–3 audits · Product Setup test cases (Step1 / CRUD / Variant Reconciliation / Bundle) · Feature Status Index · selected historical audits.

`99_Archive/**` excluded as authority.

## C. Canonical wizard (LOCKED)

1. Scan Barcode  
2. Basic Details  
3. Product Type & Tracking  
4. Unit & Pack Conversion  
5. Product Configuration  
6. Pricing & Tax  
7. Review & Create  

Not 8/9/10 steps. Standalone global Barcode & SKU **SUPERSEDED**. Step 1 states are internal only.

## D. Step ownership

| Step | Owns |
|---:|---|
| 1 | Acquisition, validation, local lookup, optional external, no-barcode, SKU candidate request, creation-path commit — **PRE-DRAFT** |
| 2 | Name, descriptions, Brand, Category, image/media, channel/visibility where merged, accepted prefills |
| 3 | Structure/type, tracking policy, Initial Batch/Expiry/Serial where applicable |
| 4 | Base UOM + pack conversion when applicable |
| 5 | SIMPLE/VARIANT/BUNDLE config + **final** SKU/GTIN reconciliation |
| 6 | Pricing & tax |
| 7 | Review + authoritative publish |

## E. Step 1 state machine

S1-A…S1-G + S1-R1/R2/R3 — internal panels only. Riverpod: `scanReady` … `noBarcode`. External lookup **only** after explicit Search Product Data.

## F. API closure

| Action | Method + Route | Auth | Entitlement | Side effect | Status |
|---|---|---|---|---|---|
| Resolve | `POST .../barcodes/resolve` | `catalog.products.create` | `product_catalog` | NONE | TARGET |
| External lookup | `POST .../barcodes/external-lookup` | create | `product_catalog` | NONE | TARGET |
| SKU candidate | `POST .../sku-candidates/generate` | create | `product_catalog` | NONE | TARGET |
| Draft create | `POST .../products/draft` | create | `product_catalog` | First Product persist | EXTEND TARGET scan path |
| Draft update | `PUT .../products/{id}/draft` | step specialized | `product_catalog` | Persist | EXISTING |
| Setup hydrate | `GET .../products/{id}/setup` | view/setup | `product_catalog` | NONE (read + remap) | EXTEND TARGET remap |
| Publish | `POST .../products/{id}/publish` | publish + rechecks | `product_catalog` | Activate | EXTEND revalidation |
| Direct create | `POST .../products` | create | `product_catalog` | Graph create | EXISTING — **not** wizard bootstrap |

Outcomes locked: Resolve VALID_LOCAL_MATCH | VALID_NO_LOCAL_MATCH | INVALID. External FOUND | NO_MATCH | TEMPORARY_FAILURE (zero providers → NO_MATCH).

## G. DB closure

| Target | Role |
|---|---|
| `product_setup_scan_context` | 1:1 draft/bootstrap only; **not** final barcode owner; **not** POS lookup — **scanner-first B1** |
| `product_barcodes.identifier_standard` | Nullable GTIN8/12/13/14/OTHER; NULL legacy — **scanner-first B1** |
| `barcode_type` + `UNKNOWN` | Symbology only; **never** GTIN14 — **scanner-first B1** |
| `product_setup_initial_tracking` | **EXISTING** Step 3 Initial Batch/Expiry/Serial. Migration: `20260824095742_AddProductSetupInitialTracking`. **OUT OF B1.** Live DB/E2E: Initial Tracking closure audit — do not infer production acceptance from docs alone |
| `UNIQUE(tenant_id, barcode)` | Authoritative duplicate guard |

Scanner-first B1 migrations **not applied**. Canonical scan-context field list: Table 10.

## H. Permission closure

Runtime codes: **`catalog.*` only** (one-way aliases). Entitlement: **`product_catalog`**. `product_management` = module grouping only. Advanced tracking: **`inventory_tracking`**. Backend authoritative; Flutter UX secondary.

## I. Backend architecture closure

API → Application → Domain → Infrastructure. Reuse/extend: `TenantAdminProductsController`, `TenantAdminProductService`, `ProductWizardAccessPolicy`, draft repos, variant reconciliation, media staging, publish, ProblemDetails/UoW/audit. TARGET: resolve, external coordinator, SKU candidate, bootstrap scan context, remapper, identifier_standard, publish revalidation. **No** second Product Setup subsystem. Controllers: no domain logic.

## J. Flutter architecture closure

One feature: `lib/features/tenant_admin/products/`. Extend `AddProductWizardController` + repository/datasource + shell/stepper/footer. No Flutter legacy remumber; no Flutter external provider; no Dio in widgets; no POS by-barcode. Late async protection required.

## K. Draft lifecycle closure

Step 1 = PRE-DRAFT. Draft on creation-path commit only → `current_setup_step = 2`. Steps 2–6 draft update. Step 7 publish. Backend-persisted draft authority — no competing Flutter-local-only draft.

## L. Legacy migration closure

Backend GET setup remap: 1→2, 2→3, 3→4, 4→5, 5→5, 6→6, 7→7. No read-time row rewrite. Missing scan context → LEGACY. Flutter consumes normalized step only.

## M. Identifier closure

SIMPLE: one sellable identity; SKU required; barcode optional. VARIANT: unique SKU per included; optional GTIN; **no** Step 1 GTIN fan-out. BUNDLE: per Bundle Step 5 contract. Final owner: `product_barcodes` / variant SKU. Scan context = candidate/bootstrap only.

## N. Test-document closure

Active cases use scanner-first numbering (Step1 Scan tests; CRUD Step 3 tracking / Step 5 variant; Bundle NOT_APPLICABLE Step 4 → Step 5). Status: **DOCUMENTATION TARGET / NOT EXECUTED** for scanner-first suites. Historical numbering in old audits bannered.

## O. Stale-reference search evidence

Scope: active docs excluding `99_Archive/**`.

| Pattern | Classification |
|---|---|
| Step 1 Basic Details / Step 1 save / Step 1 Product Name | HISTORICAL WITH BANNER or supersession notes; no CURRENT authority |
| Step 2 Product Type / Step 3 Units / Step 4 Variant / Step 5 Barcode & SKU as global | HISTORICAL/SUPERSEDED or CURRENT correct “identifier section” wording |
| 8/9/10-Step Wizard | SUPERSEDED / prototype unrelated (Platform product-manual) |
| `barcode_type = GTIN14` | SUPERSEDED (decision rejects); CURRENT uses identifier_standard |
| EAN14 / ITF14 as required symbology | Not introduced; ITF14 mentioned only as “do not invent” |
| `product_management` as runtime entitlement | CURRENT correct: module only |
| `POST .../products` as wizard bootstrap | CURRENT correct: **not** bootstrap |
| `currentSetupStep: 4` Save & Continue → Step 5 | None in CURRENT contracts after Chunk 2 |
| “Reconciliation with Step 4” (pricing vs variants) | **CURRENT — FIX applied** → Step 5 Product Configuration |
| Flutter remaps / Flutter external provider / Dio in widgets / POS by-barcode for TA | Forbidden in CURRENT authorities |
| External lookup automatically / GTIN = catalogue match | Forbidden in CURRENT authorities |

## P. Historical-doc classification

Bannered/retained (non-exhaustive): Image Manager Step1 audits; Units Step3 audits; Variant Step4 audits; Barcode SKU Step5 audits; Product Type Step2 audits (module + 99_AUDITS); 7-Step 2026-08-08 readiness; Initial Tracking 2026-08-24; Permission NFR numbering note; Variant SKU matrix 2026-09-03. Mapping: former 1→2, 2→3, 3→4, 4→5, 5→5 identifiers. Historical code symbols (e.g. `Step2WizardProcessor`) may remain.

## Q. Final implementation checklist

[[../PRODUCT_SETUP_SCANNER_FIRST_FINAL_IMPLEMENTATION_CHECKLIST_2026-09-12]]  
Backend B1–B12 (B2 `catalog.*` early). Flutter F1–F17.

## R. Final gap matrix

[[../PRODUCT_SETUP_SCANNER_FIRST_FINAL_GAP_MATRIX_2026-09-12]]

## S. Implementation blockers (documentation)

**NONE.** Ownership of wizard, routes, DB, permissions, identifiers, remap, layers, and Flutter state is unambiguous.

## T. Non-blocking optional gaps

Concrete external provider; ITF14 symbology; camera-first Tenant Admin scan; physical SC-* acceptance.

## U. Final readiness decision

| Label | Value |
|---|---|
| Documentation | **DOCUMENTATION CANONICALIZED — IMPLEMENTATION ARCHITECTURE READY** |
| Implementation | **SCANNER-FIRST IMPLEMENTATION PENDING** |
| Migrations | **NOT APPLIED** |
| Hardware | **PHYSICAL ACCEPTANCE PENDING** (HID software path first-class) |
| Release | **NOT** production-ready claim for scanner-first Product Setup |

**Chunk 4 status:** COMPLETE — SECOND BRAIN FINALIZED FOR IMPLEMENTATION
