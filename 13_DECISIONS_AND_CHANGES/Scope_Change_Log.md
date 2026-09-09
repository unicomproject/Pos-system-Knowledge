<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-01 -->

# Scope Change Log

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

## 2026-09-01 — Initial Tracking collection moved to Step 2

- Optional Initial Tracking Details (Batch Number, Expiry Date, Serial Number)
  are collected on **Step 2 — Product Type & Tracking**, after Product Type is
  explicitly selected (SIMPLE / VARIANT).
- Step 1 Basic Details no longer shows that card.
- Bundle / Kit does not show the card (parent cannot receive physical identities).
- Tracking **policy** remains Step 2 (`product_inventory_settings`). Publish
  identity remains Step 7 into `product_batches` / `serial_numbers`.
- Flutter IMPLEMENTED on 2026-09-01. Helper:
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

- Step 1 Basic Details now targets optional initial Batch Number, Expiry Date, and Serial Number capture during Tenant Admin Add Product.
- Step 2 remains tracking-policy authority (`product_inventory_settings`).
- Wizard stays 7 steps. No extra tracking step. No Channel Visibility step.
- Actual identity persists at Step 7 Publish into `product_batches` / `serial_numbers`. Product master identity columns are forbidden.
- Draft storage TARGET is dedicated `product_setup_initial_tracking`. VARIANT uses Option 2 assignment at Review. Bundle parent cannot receive physical identities.
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

