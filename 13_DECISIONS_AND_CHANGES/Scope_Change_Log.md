<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-13 -->

# Scope Change Log

> **Current implementation status (2026-09-13):** Historical TARGET wording in entries below records the state at the time. **Backend B1–B12 are IMPLEMENTED**. Write-stage numbering blocker **RESOLVED** by [[PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]] (`persist_2_plus_write_map`). **Flutter Step 1 PARTIAL / PENDING**. See [[../00_START_HERE/Current_Source_Of_Truth]].

## 2026-09-13 — Scanner-first write-stage mapping lock (OPTION 1)

Documentation-only. Authority: [[PRODUCT_SETUP_SCANNER_FIRST_WRITE_STAGE_MAPPING_DECISION_2026-09-13]].

- Locked `persist_2_plus_write_map`: fresh scanner drafts persist `current_setup_step = 2` (Basic Details); do **not** globally renumber `ProductWizardStage`.
- Centralized write mapper: scanner API step → legacy processor; **forbid** scattered `currentStep±1`; Step 5 = SPECIAL/COMPOSITE (B10 owns final composite routing).
- Detection: create = `scanBootstrap`; subsequent = `product_setup_scan_context` presence; legacy without scan context keeps legacy write numbering.
- B9 remains GET `/setup` read remap only — separate from write mapper.
- Locked B8 semantic `scanBootstrap` + creation actions (`CONTINUE_TO_BASIC_DETAILS` preferred over `CONTINUE_NO_BARCODE`); B8 still does not create final `product_barcodes`.

## 2026-09-11 — Product Setup scanner-first Step 1

- Canonical Add Product order remumbered: **Scan Barcode** → Basic Details → Product Type & Tracking → Unit & Pack Conversion → Product Configuration → Pricing & Tax → Review & Create.
- Standalone global **Barcode & SKU** step superseded; identifiers finalize inside Step 5 Product Configuration.
- Step 1 is an internal state machine (not extra stepper items). External lookup is provider-agnostic TARGET.
- TARGET `product_setup_scan_context`; resolve + external-lookup APIs.

## 2026-09-12 — Chunk 2 final closure (residual active-contract cleanup)

- Flutter Step 5 matrix controller docs corrected (`currentSetupStep=5` → Step 6).
- Bundle / Variant reconciliation / Product CRUD permission tests remapped.
- Feature Status Index uses CURRENT/FORMER step mapping; scanner Step 1 not claimed implemented.
- Historical audits bannered where old numbering remains as evidence.


Documentation-only. Authority: [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]] + verification audit addendum.

- Closed remaining active step-number drift in 7-Step Contract, Image Manager, Glossary, Variant module overview/rules/technical contract, Product CRUD / Variant Reconciliation / Bundle tests.
- Locked wizard DRAFT create = `POST .../products/draft` (not `POST .../products`).
- Added TARGET pre-draft `POST .../sku-candidates/generate`.
- Locked zero providers → public `NO_MATCH` only.


Documentation-only verification/reconciliation pass over the Chunk 1 technical changes. Authority: [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]].

- **CORRECTED:** `barcode_type = GTIN14` rejected. `barcode_type` stays symbology-only (gains `UNKNOWN`); identifier standard moves to TARGET nullable `product_barcodes.identifier_standard`.
- **RECONCILED:** `product_setup_scan_context` field set single-sourced (dropped duplicated `bootstrap_kind` / `input_origin`; renamed hint fields).
- **LOCKED:** resolve outcomes `VALID_LOCAL_MATCH` / `VALID_NO_LOCAL_MATCH` / `INVALID`; both Step 1 endpoints side-effect free.
- **LOCKED:** legacy `current_setup_step` remapping is a read-time compatibility layer in `GET .../setup`, not a destructive migration.
- **SUPERSEDED 2026-09-14:** the earlier no-barcode non-reserved candidate is
  replaced by a Category Code + atomic tenant Product sequence AUTO base; see
  [[PRODUCT_SKU_AUTO_GENERATION_CANONICAL_DECISION_2026-09-14]].
- **CLOSED:** Product Setup permission authority — one canonical `catalog.*` code per gate with one-way alias; residual work is implementation only.
- **CORRECTED:** obsolete flat identifier draft payload (`baseSku` / `parentProductBarcode` / `variantIdentifiers[]`) replaced by `barcodeSkuConfiguration.assignments[]` in the Technical Contract.
- Initial Tracking collection remapped to global **Step 3** (was Step 2 under prior numbering).
- Documentation-only; Backend/Flutter implementation not claimed.

Authority: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Setup_Scan_Barcode_Specification]], [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]], [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_SCANNER_FIRST_SECOND_BRAIN_CANONICALIZATION_2026-09-11]]

## 2026-09-03 — Tenant Admin Tax Management canonical contract

- Tax Management Second Brain rewritten as canonical **Tax Setup** contract.
- Removed Used For / Applies To / Goods / Services / Both from Tax Setup.
- Tax Treatment: TAXABLE / ZERO_RATED / EXEMPT (distinct Zero Rated vs Exempt).
- Product owns TaxPriceMode (Inclusive/Exclusive); Tax Setup owns rates/treatment.
- Effective-dated rate schedule + history; refund uses original sale tax snapshot.
- Journey IDs allocated: TA-UJ-063 … TA-UJ-069.
- Documentation-only; no backend/Flutter implementation claimed.

Authority: [[../04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]]  
Decisions: [[TENANT_ADMIN_TAX_MANAGEMENT_DECISION_REGISTER_2026-09-03]]

## 2026-09-01 — Initial Tracking collection moved to Product Type & Tracking step

- Optional Initial Tracking Details (Batch Number, Expiry Date, Serial Number)
  are collected on **Product Type & Tracking**, after Product Type is
  explicitly selected (SIMPLE / VARIANT).
- Under **pre-2026-09-11** numbering that was global Step 2; under scanner-first
  numbering it is global **Step 3**.
- Basic Details no longer shows that card.
- Bundle / Kit does not show the card (parent cannot receive physical identities).
- Tracking **policy** remains on Product Type & Tracking (`product_inventory_settings`). Publish
  identity remains Step 7 into `product_batches` / `serial_numbers`.
- Flutter IMPLEMENTED on 2026-09-01 against then-Step-2 numbering. Helper:
  `Optional. Turn on matching Batch, Expiry, or Serial tracking below to keep these values.`
  Identity card renders **above** Tracking & Stock Rules.
- Track Inventory wizard default is **OFF**. User must turn it on. Skip on Step 2
  leaves Track Inventory / Batch / Expiry / Serial OFF.

Decision: [[PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]].

## 2026-08-27 — Category decoupled from Department

- Tenant Admin Category Management no longer depends on Department (ADR 010).
- Category model has no `department_id`. API/Flutter have no Department fields.
- Category Code and Name uniqueness are tenant-wide.
- Product Setup Category picker is recursive ACTIVE depth 1–5; persist `categoryId` only; **BR-CAT-PRODUCT-SELECT-001** for effective selectability.
- **Backend IMPLEMENTED** (2026-08-27): migration `20260827140000_DecoupleCategoryFromDepartment` applied. Flutter Category Management pending.
- Department feature remains for unrelated modules only.

Decision: [[ADR/ADR_010_Category_Decoupled_From_Department]].

## 2026-08-24 — Product Setup Initial Tracking Details

> **Historical entry** (then-current numbering). After scanner-first remumber (2026-09-11), Basic Details is global Step 2 and Product Type & Tracking / Initial Tracking collection is global **Step 3**. See [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]] and [[PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]].

- Step 1 Basic Details then targeted optional initial Batch Number, Expiry Date, and Serial Number capture during Tenant Admin Add Product *(later moved off Basic Details)*.
- Step 2 remained tracking-policy authority (`product_inventory_settings`) under then-current numbering.
- Wizard stays 7 steps. No extra tracking step. No Channel Visibility step.
- Actual identity persists at Step 7 Publish into `product_batches` / `serial_numbers`. Product master identity columns are forbidden.
- Draft storage **was TARGET**; now **EXISTING** as dedicated `product_setup_initial_tracking` (migration `20260824095742_AddProductSetupInitialTracking`; CURRENT Step 3). **Out of scanner-first B1.** VARIANT uses Option 2 assignment at Review. Bundle parent cannot receive physical identities. Live DB/E2E: Initial Tracking closure audit — do not infer production acceptance from docs alone.
- Documentation-only decision; Flutter/backend/database production implementation was not performed.

Decision: [[PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP1_DECISION_2026-08-24]].

## 2026-08-09 â€” Current Release cashier Discount scope lock

- Locked MANUAL-only cashier popup and exactly one active Discount.
- Order allows Percentage/Fixed; Item allows Percentage only with exact cart target.
- At/below user authority is allowed; above authority is directly rejected with
  no manager approval or `PENDING_APPROVAL`.
- POLICY selection, manager PIN/approval, Item Fixed, and stacking are deferred
  while existing backend/schema capability remains preserved.
- Added provisional offline Discount using safe cached authority/reference,
  local pending sync, backend revalidation, and visible conflict handling.
- Clarified tablet-first two-column and adaptive stacked/narrow popup contract,
  keyboard/safe-area behavior, and no overflow/clipping.
- Documentation-only decision; implementation/runtime evidence remains pending.

Decision: [[POS_CASHIER_DISCOUNT_CURRENT_RELEASE_DECISION_2026-08-09]].

## 2026-08-06 â€” Park / Recall gap closure implementation

- **Canonical Endpoint**: Locked `/api/v1/tenant-admin/products` as primary boundary; legacy route `/api/v1/products` is deprecated.
- **Product List States**: Resolved into First-use Empty (`catalogTotalCount=0`), Filtered Empty (`totalCount=0` with filters), and Populated List.
- **Lifecycle Alignment**: Deprecated `DELETED` status, replaced by `DRAFT`, `ACTIVE`, `INACTIVE`, and `ARCHIVED` status pool.
- **Permissions Consolidation**: Standardized on `catalog.products.*` as canonical codes. Legacy `tenant.products.*` is deprecated.
- **Import Batch Engine**: Created specs for CSV product import batches and rows logging. Supported fields, duplications validation, transactional rollback, and error logs defined.
- **Stock Status**: Defined dynamic calculated Stock Status values (`NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) to protect inventory boundaries.
- **Authority**: [[../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]].


## [2026-08-02] POS Payment Method Screen

- Final release methods are Cash, Card, QR Pay and Split Payment only.
- Pay Later is excluded.
- The reusable equal-card layout supports counts 1 through 5; the active four
  method screen is 2 x 2.
- Existing Cash checkout, receipt, printer and drawer flows are preserved.
- Card, QR Pay and Split Payment remain unavailable and cannot fall back to Cash.
- No backend, database or migration change was made.

## [2026-08-01] Cashier Product Variant Selection Popup Production Scope Locked

- **Change**: Include the Release 1 Cashier New Sale production popup with dynamic variant resolution, quantity, optional product-line note and manually configured Frequently Bought Together.
- **Image decision**: The popup displays one resolved image only; no thumbnails/gallery/carousel. Shared product-media multi-image capability remains unchanged.
- **Recommendation decision**: Frequently Bought Together is manually configured and distinct from Frequently Sold. AI/ML recommendations are excluded.
- **Status**: Documentation Ready. Database migration, backend, Flutter, automated tests and production validation remain pending/partial according to code evidence.
- **Authority**: [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

## [2026-07-31] Product Discovery Segments Added
- **Change**: Define Cashier New Sale product discovery segments: Popular, Frequently Sold, and Offers.
- **Reason**: Enable cashiers to quickly find products that are manually curated as popular, dynamically calculated as top-selling, or currently eligible for discounts/special pricing.
- **Impact**:
  - Backend extended to support the planned `segment` parameter on `GET /api/v1/pos/products`.
  - Frontend extended to toggle between segments (preserving cart and session states) and display offer badges/strike-through pricing on tiles.
  - Curation of Popular products managed under the reserved `POS_POPULAR` collection in Tenant Admin.
  - Code implementation status set to `Not Started` / `Not Run`.

<!-- RBAC_HARDENING_2026_08_15_START -->
## 2026-08-15 - Tenant Admin RBAC Contract Hardening

Scope type: Documentation correction / implementation gap closure.

Changed:

- Added canonical Tenant Effective Permission Resolution contract.
- Accepted ADR 009 for additive tenant/outlet permission union semantics.
- Corrected Role Setup flow from stale six-step wording to the approved five-step flow.
- Marked Tenant Admin role and permission catalog backend APIs as missing until implemented.
- Marked runtime resolver revoked-row and outlet-source handling as implementation gaps.

No Flutter source, backend source, migrations, or database source changed in this documentation update.
<!-- RBAC_HARDENING_2026_08_15_END -->

