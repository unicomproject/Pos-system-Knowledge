<!-- title: Tenant Admin Add Product Review And Create Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: old_section_letters_basic_first_standalone_barcode_sku -->
<!-- extended: 2026-09-24 — VARIANT Quantity review summary added to section E -->

# Tenant Admin Add Product Review & Create Specification

> **SUPERSEDED review section order:** A Basic Details → … → E Barcode & SKU as standalone.  
> **Canonical wizard (TARGET — LOCKED 2026-09-20):** 1 Scan Barcode → 2 Basic Details → 3 Product Type & Configuration → 4 Pricing & Tax → 5 Product Tracking (Optional) → 6 Review & Create.  
> Decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]].  
> Scan: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]]. Identifiers: [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification]].

> **CURRENT IMPLEMENTATION SNAPSHOT — TO BE VERIFIED / RECONCILED IN CHUNK 3:** The backend currently implements a 7-step wizard. The wizard header below uses old 7-step section letters (C=Product Type & Tracking, D=Unit & Pack, E=Product Configuration). These reflect CURRENT backend reality, not the TARGET 6-step contract. Step numbering will be reconciled in Chunk 3.

## 1. Overview
This document serves as the canonical source of truth for the Tenant Admin Add Product **Step 6: Review & Create** in the 6-step wizard. It replaces all older step-reference descriptions. The wizard is strictly **6 steps** (scanner-first).

> **NOTE:** Earlier versions of this document referenced Step 7 Review & Create and a 7-step wizard. Those references are superseded. Review & Create is **Step 6** in the current TARGET 6-step contract. See [[../../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]].

## 2. Source of Truth (Canonicalized 2026-09-19)

The Review & Create screen is a **data-driven projection** of the product setup state.

- **Dual-Source Authority:**
  - **LOCAL_UNSAVED + EXPLICIT_DRAFT Merge**: When an EXPLICIT_DRAFT exists, Review loads server DRAFT as base and merges any newer LOCAL_UNSAVED overlays from current session.
  - **LOCAL_UNSAVED Only**: When no EXPLICIT_DRAFT exists, Review displays current LOCAL_UNSAVED state (user may Create Product directly without Save Draft).
  - **Backend-Authoritative Final Validation**: The backend performs atomic validation on final Create; the frontend must not fabricate validation logic or hardcode sample values.

- **Actual Values Only:** Only fields that have been entered (LOCAL_UNSAVED) or saved (EXPLICIT_DRAFT) are displayed. Not-applicable structures do not display fake data. Step 1 Scan may show acquisition/bootstrap context when scan context exists locally or on server DRAFT.

## 3. Review Sections Rendering Rules & Step Status Indicators (Canonicalized 2026-09-19)

Each section displays the completion status:
- **COMPLETE** ✓ — all mandatory fields entered; step fully configured
- **INCOMPLETE** ⚠ — mandatory fields missing; user may have skipped or partially entered data
- **SKIPPED** ⊘ — user explicitly pressed Skip; step remains unstarted

User may click any INCOMPLETE/SKIPPED section to return to that wizard step and complete it.

---

## TARGET REVIEW SECTIONS (6-Step Wizard — LOCKED 2026-09-20)

### A. Scan Barcode (Step 1 — Status indicator)
Displays fields from Step 1 (when draft scan context exists):
- Acquisition mode / bootstrap kind (scan, no-barcode, external, legacy manual)
- Validated barcode candidate / identifier format (when present)
- External lookup outcome summary (suggestion-only; not authoritative master data)
- **Status:** SKIPPED if user pressed Skip on Step 1; INCOMPLETE if partial/no-barcode; COMPLETE if barcode present
- **Edit Link:** returns to Step 1 Scan Barcode

### B. Basic Details (Step 2 — Status indicator)
Displays fields from Step 2:
- Product Name, Short Name, Internal Product Code
- Category, Brand
- Descriptions
- Product Images
- Channel Visibility (POS, Online Store)

**Status:** SKIPPED if user pressed Skip; INCOMPLETE if Name or Category missing; COMPLETE if both present.

**Edit Link:** returns to Step 2 Basic Details.

### C. Product Type & Configuration (Step 3 — Status indicator)
Displays fields from Step 3:
- Product Type (Simple, Variant)

**SIMPLE:**
- Product Type
- Base Unit (type, label, name/size)
- Packs/Cases (if configured: type, name, conversion)
- SKU
- Primary Barcode (reused from Step 1)

**VARIANT:**
- Product Type
- Variant configuration summary (Attribute names, values)
- Included variant count
- Variant SKU/Barcode summary per included variant

**Do NOT show:** Track Inventory toggle / Batch toggle / Expiry toggle / Serial toggle. These are Step 5 territory.

**Status:** INCOMPLETE if structure unconfirmed; COMPLETE if type selected and type-specific configuration valid.

**Edit Link:** returns to Step 3 Product Type & Configuration.

### D. Pricing & Tax (Step 4 — Status indicator)
Displays fields from Step 4:
- **SIMPLE:** Standard Selling Price, Tax Class (rate in label), Tax Presentation (Exclusive/Inclusive).
- **VARIANT:** Tax Class, Tax Presentation, Effective Tax Rate, priced/pending variant counts, Price Range or per-variant price list.
- Cost/Discount omitted unless present in state. Currency from tenant create-options.

**Status:** INCOMPLETE if Selling Price or Tax Class missing; COMPLETE if both present for all sellable identities.

**Edit Link:** returns to Step 4 Pricing & Tax.

### E. Product Tracking (Step 5 — Status indicator, Optional)
Displays fields from Step 5:

**Skip:**
- Product Tracking: Not configured

**Quantity (SIMPLE Product):**
- Tracking Method: Quantity
- Opening Stock: [quantity value] [unit name]
- Opening Stock Value: [currency-formatted value] (optional; display only if approved)
- Outlet Allocation Summary:
  ```
  Outlet Name 1         Quantity 1 [unit name]
  Outlet Name 2         Quantity 2 [unit name]
  ...
  Total Allocated       [sum of quantities] [unit name]
  ```

**Quantity (VARIANT Product):**
- Tracking Method: Quantity
- Total Opening Stock: [SUM of all Variant OpeningQuantity] [unit name] (informational only)
- Per-Variant detail:
  ```
  Red / S
  Opening Stock: 50
  Colombo: 30
  Jaffna: 20

  Red / M
  Opening Stock: 70
  Colombo: 40
  Jaffna: 30

  Blue / S
  Opening Stock: 40
  Colombo: 20
  Jaffna: 20

  Blue / M
  Opening Stock: 0
  Outlet Allocation: Not required
  ```
> **LOCKED:** Do NOT summarize only Product Total for VARIANT Quantity. Variant-level stock detail must remain visible.

**Batch / Lot:**
- Tracking Method: Batch / Lot
- Initial Batch Number: [value] or Not Provided

**Batch + Expiry:**
- Tracking Method: Batch + Expiry
- Initial Batch Number: [value] or Not Provided
- Initial Expiry Date: [value] or Not Provided

**Status:** SKIPPED if user pressed Skip; COMPLETE if tracking method selected and (for Quantity) all per-Variant or SIMPLE reconciliation is complete.

**Edit Link:** returns to Step 5 Product Tracking.

**Authority for SIMPLE Quantity Detail:** [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] Part A

**Authority for VARIANT Quantity Detail:** [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] Part B (Decision: [[../../13_DECISIONS_AND_CHANGES/SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md]])

---

## CURRENT IMPLEMENTATION SNAPSHOT — LEGACY 7-STEP BACKEND

> **⚠ TO BE VERIFIED / RECONCILED IN CHUNK 3 BACKEND AUDIT**
>
> The following review section letters (C, D, E, F) reflect the CURRENT backend 7-step wizard processor reality. Do NOT use as TARGET rendering contract. Retained so Chunk 3 can reconcile current vs target.

### C (LEGACY). Product Type & Tracking (Step 3 — legacy)
Displays fields from Step 3:
- Product Structure (Simple, Variant, Bundle)
- Track Inventory (Yes/No)
- Batch Tracking, Expiry Tracking, Serial Tracking
- **Initial Tracking Details**: only remaining applicable values after Step 3 reconciliation.
  - Batch + Expiry example: Tracking Method, Initial Batch Number, Initial Expiry Date.
  - Serial example: Tracking Method, Initial Serial Number.
  - VARIANT: also show the assigned variant (`initialTrackingAssignedVariantId`) or block Create until selected.
  - Do not display cleared/incompatible fields.
- POS Sellable
- Desired Publish Status

**Status:** SKIPPED if user pressed Skip on Step 3 (structure unconfirmed); INCOMPLETE if structure confirmed but tracking incomplete; COMPLETE if both confirmed.

**Edit Link:** returns to Step 3 Product Type & Tracking.

### D (LEGACY). Unit & Pack Conversion (Step 4 — legacy)
Displays fields from Step 4 (if applicable):
- Base Unit, Selling Unit, Purchase Unit, Outer Pack Unit
- Conversion factors, decimal quantity configuration

### E (LEGACY). Product Configuration (Step 5 — legacy)
Displays fields from Step 5 (structure-specific), including identifiers:
- **Variant:** Options, values, included variant count, labels, default info, image associations.
- **Bundle:** Components, required quantities, UOMs.
- **Identifiers (former standalone Barcode & SKU):** Saved SKU/barcode assignments for the sellable identity/variants. Not a separate Review letter for a global Barcode & SKU step.

### F (LEGACY). Pricing & Tax (Step 6 — legacy)
Displays fields from Step 6 (structure-aware; see 7-Step contract §6.1–6.5):
- **SIMPLE / BUNDLE:** Standard Selling Price, Tax Class (rate in label), Tax Presentation (Exclusive/Inclusive). Tax Preview is wizard-only (not required on Review). Cost/Discount omitted unless present in state. Currency from tenant `create-options` (no currency banner/dropdown).
- **VARIANT:** Do **not** show a single fake parent selling price when variants differ. Show Tax Class, Tax Presentation / Effective Tax Rate, priced/pending counts, and **Price Range** (or per-variant price list when space allows). Bulk helper (**Set Same Price for All Variants**) is not Review authority.

## 4. Edit Flow
Each Review section can trigger an `Edit` action:
1. User clicks `Edit`.
2. Frontend opens corresponding wizard step.
3. User edits and saves changes.
4. Backend persists data and frontend reloads authoritative Review snapshot.

## 4.1 Post-create success screen
After Create Product succeeds, the wizard is replaced by the Product Created Successfully card (not a toast).
- Summary is structure-aware (SIMPLE vs VARIANT) and uses the created product — no sample values.
- **View Product** opens product detail view.
- **Add Another Product** starts a new wizard at Step 1 **Scan Barcode**.
- **Back to Products** opens Product List (list data refreshed).

## 5. Functional Requirements (Canonicalized 2026-09-19)
- **FR-RC-001:** Review page loads product setup state (LOCAL_UNSAVED + EXPLICIT_DRAFT merge, or LOCAL_UNSAVED only).
- **FR-RC-002:** Only applicable/current configured fields render.
- **FR-RC-003:** No screenshot/sample value is hardcoded.
- **FR-RC-004:** Review is product-structure aware.
- **FR-RC-005:** Edit action returns to corresponding wizard step (preserves LOCAL_UNSAVED state).
- **FR-RC-006:** Saved edits (Save Draft) reload authoritative Review state from merged sources.
- **FR-RC-007:** Backend calculates final validation state during Create Product.
- **FR-RC-008:** Create Product is disabled/blocked when required validation fails.
- **FR-RC-009:** Create Product from LOCAL_UNSAVED creates a new Product row atomically (direct CREATE mode). Create Product from EXPLICIT_DRAFT publishes existing draft (DRAFT→PUBLISHED).
- **FR-RC-009a:** Create Product must support both direct creation (no prior EXPLICIT_DRAFT) and draft publishing (prior EXPLICIT_DRAFT + newer local changes).
- **FR-RC-010:** Publish performs full server-side revalidation of all 6 steps.
- **FR-RC-011:** Publish is transactional.
- **FR-RC-012:** Publish applies configured ACTIVE/INACTIVE final status.
- **FR-RC-013:** Publish records publication/audit metadata.
- **FR-RC-014:** Success shows the **Product Created Successfully** screen (not a toast, and not an automatic redirect to Product List).
- **FR-RC-014a:** **View Product** opens the product detail view (`/tenant-admin/products/{productId}`).
- **FR-RC-014b:** **Add Another Product** starts a fresh Add Product wizard at Step 1 Scan Barcode (all LOCAL_UNSAVED state cleared).
- **FR-RC-014c:** **Back to Products** opens Product List.
- **FR-RC-015:** Product List refreshes from backend.
- **FR-RC-016:** Failure preserves LOCAL_UNSAVED state and EXPLICIT_DRAFT (if prior save occurred).
- **FR-RC-017:** Concurrency conflict on Create Product does not overwrite newer EXPLICIT_DRAFT or LOCAL_UNSAVED state.
- **FR-RC-018:** Tenant isolation is mandatory.

## 6. Business Rules (Canonicalized 2026-09-19)
- **BR-RC-001:** Review is read-only except explicit Edit actions (return to step).
- **BR-RC-002:** Review data source is LOCAL_UNSAVED + EXPLICIT_DRAFT merged state.
- **BR-RC-003:** No Review-only product copy exists.
- **BR-RC-004:** Not-applicable step data cannot block publication.
- **BR-RC-005:** Required applicable step data must block publication if invalid or missing.
- **BR-RC-005a:** Steps left INCOMPLETE or SKIPPED must have their mandatory data completed before Create Product succeeds.
- **BR-RC-005b:** Create Product is **BLOCKED** when mandatory fields remain unset (Name, Category, Structure, SKU, Selling Price, Tax Class). Error guidance directs user to incomplete sections in Review.
- **BR-RC-006:** All uniqueness rules are rechecked at publish time (SKU, barcode).
- **BR-RC-007:** Tax data must still reference a valid tenant tax configuration.
- **BR-RC-008:** Referenced category/brand/UOM/media/variant/component records must still be valid.
- **BR-RC-009:** Product must belong to the authenticated tenant.
- **BR-RC-010:** Successful publish keeps the same Product ID (for EXPLICIT_DRAFT → PUBLISHED). Fresh create generates new ID (LOCAL_UNSAVED → PUBLISHED).
- **BR-RC-011:** Successful publish creates exactly one final product lifecycle transition (status DRAFT→ACTIVE or ACTIVE directly).
- **BR-RC-012:** Product List is rebuilt/read from persisted backend state after successful publish.
- **BR-RC-013:** No hardcoded Review value is allowed.
- **BR-RC-014:** 6-step wizard is authoritative (scanner-first, TARGET contract).
- **BR-RC-015:** Review/Create must revalidate Initial Tracking Details against structure, tracking policy, ownership, uniqueness, variant assignment, Bundle restriction, and expiry validity.
- **BR-RC-016:** Publish may persist identity-only Batch/Serial rows. It must not invent inventory quantity, balances, or stock movements.
- **BR-RC-017:** Step completion status (COMPLETE / INCOMPLETE / SKIPPED) is displayed in Review; user may edit any incomplete/skipped step.
- **BR-RC-018:** Skip does NOT auto-persist to backend; it is a local navigation action only.

## 7. Non-Functional Requirements (NFRs)
- **Transaction Integrity:** Final publication is atomic.
- **Optimistic Concurrency:** Uses `rowVersion` / `expectedRowVersion`.
- **Tenant Isolation:** Every read/write is scoped by `tenant_id`.
- **Authorization:** Permissions enforced server-side.
- **Retry Safety:** Repeated submission does not duplicate a product.
- **Performance:** Review projection uses optimized queries.
- **Auditability:** Successful creation writes a canonical product audit event.

## 8. Flutter Implementation Contract
```text
UI -> Controller/Notifier -> Repository -> API Service -> Backend
```
- **States:** `ProductReviewState`, `ProductReviewSnapshot`, `ProductReviewSection`, `ProductReviewValidationItem`, `ProductPublishState`.
- **Responsibilities:** `loadReview`, `refreshReview`, `openSectionForEdit`, `returnFromEdit`, `publishProduct`, `handleValidationFailure`, `handleConcurrencyConflict`, `handlePermissionFailure`, `handlePublishSuccess` (show Product Created Successfully screen; do not toast-only).
- **Rule:** Review widget must not calculate validation status or inject sample values.

## 9. API Contract (Canonicalized 2026-09-19)
- **Review Snapshot API:** `GET /api/v1/tenant-admin/products/{productId}/setup` (Returns `ProductSetupWizardDto` with merged LOCAL_UNSAVED + EXPLICIT_DRAFT state and validation checklist; hydrates scan context when present).
  - Required when EXPLICIT_DRAFT Product ID exists.
  - Optional if LOCAL_UNSAVED only (client has full state).
- **Create Product from LOCAL_UNSAVED:** Direct creation endpoint to be determined (likely POST `.../products/publish` with full wizard snapshot, creating new Product atomically).
  - Payload: Full wizard snapshot from LOCAL_UNSAVED state (§18 details below).
  - Permission: `catalog.products.publish` plus subgraph recheck.
  - Result: Creates new Product row and publishes atomically.
- **Publish API (Draft → Published):** `POST /api/v1/tenant-admin/products/{productId}/publish`
  - Payload: `{ "expectedRowVersion": <number>, "initialTrackingAssignedVariantId": "<guid optional VARIANT>", "latestWizardSnapshot": <optional merged state> }`
  - Semantics: Updates existing EXPLICIT_DRAFT to PUBLISHED; may consume latest LOCAL_UNSAVED overlay if supplied.
  - Permission: `catalog.products.publish` **plus subgraph recheck** (media, channels, variants, bundle, barcodes, pricing, cost if non-null, `inventory_tracking` if identity rows). See [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] (TARGET). Legacy reference: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md]] (SUPERSEDED).
  - Initial identity does **not** require `inventory.stock.adjust`.

## 10. Database Graph
- Master: `products`
- Mapping: `product_categories`
- Units: `product_unit_settings`, `product_unit_conversions`
- Variants: `product_variants`, `product_options`, `product_option_values`, `product_variant_option_values`
- Bundle: `combo_definitions`, `combo_components`
- Identifiers: `product_barcodes`
- Scan context schema **IMPLEMENTED** (`product_setup_scan_context`); GET `/setup` hydration **IMPLEMENTED B9**; Review publish path still uses existing draft/publish pipeline.
- Images: `media_assets`, `product_images`
- Channel: `product_channel_visibility`
- Pricing: `price_lists`, `price_list_items`
- Tax: `product_tax_assignments`, `tax_classes`, `tax_class_rates`, `tax_rates`
- TARGET identity at publish: `product_batches`, `serial_numbers` (no quantity)
- **EXISTING** draft until consume: `product_setup_initial_tracking` (Step 3; migration `20260824095742_AddProductSetupInitialTracking`; not scanner-first B1)
- **Rule:** No Review-specific persistence table.

## 11. Field-to-Table Matrix
| Review Display Field | Source Step | Request Attribute | Backend DTO | Entity | Table.Column | Review DTO Field | Product List Effect |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Scan / barcode candidate | 1 | ScanContext | SaveProductDraftRequest | ProductSetupScanContext | Schema **IMPLEMENTED B1**; population **IMPLEMENTED B8**; setup hydration **IMPLEMENTED B9**; final identifiers **IMPLEMENTED B10** | ScanContext | None |
| Product Name | 2 | ProductName | SaveProductDraftRequest | Product | products.product_name | ProductName | Display Name |
| Product Code | 2 | ProductCode | SaveProductDraftRequest | Product | products.product_code | ProductCode | Code Search |
| Category | 2 | CategoryId | SaveProductDraftRequest | Category | categories.category_name | CategoryName | Category Filter |
| Brand | 2 | BrandId | SaveProductDraftRequest | Brand | brands.brand_name | BrandName | Brand Filter |
| Product Structure | 3 | ProductStructure | SaveProductDraftRequest | Product | products.product_structure | ProductStructure | Type Icon |
| Track Inventory | 3 (CURRENT BACKEND legacy) | TrackInventory | SaveProductDraftRequest | ProductInventorySetting | product_inventory_settings.is_stock_tracked | TrackInventory | Stock Visibility |
| Channel Visibility | 2 | PosSellable/AllowOnlineSale | SaveProductDraftRequest | ProductChannelVisibility | product_channel_visibility | PosSellable | Sales Check |
| Unit Fields | 4 (CURRENT BACKEND legacy Step 4; TARGET Step 3 SIMPLE context) | UnitModel etc. | SaveProductDraftRequest | ProductUnitSetting | product_unit_settings.* | BaseUnitName etc. | UOM Display |
| Variant/Bundle Info | 5 (CURRENT BACKEND legacy Step 5; TARGET Step 3 VARIANT context) | VariantConfiguration | SaveProductDraftRequest | ProductVariant | product_variants.* | VariantConfiguration | Variant Count |
| SKU | 5 (CURRENT BACKEND legacy Step 5; TARGET Step 3 identifier context) | IdentifierConfiguration | SaveProductDraftRequest | ProductVariant | product_variants.sku | Sku | SKU Search |
| Barcode | 5 (CURRENT BACKEND legacy Step 5; TARGET Step 3 identifier context) | IdentifierConfiguration | SaveProductDraftRequest | ProductBarcode | product_barcodes.barcode | Barcode | Barcode Scan |
| Cost Price | 6 | PricingTax.CostPrice (optional; product-level) | SaveProductDraftRequest | Product | products.reference_cost_price | PricingTax.CostPrice | Cost Calc (redacted without cost.view) |
| Standard Selling Price (SIMPLE) | 6 | PricingTax.StandardSellingPrice | SaveProductDraftRequest | PriceListItem | price_list_items.selling_price (or compare_at when discounted) | PricingTax.StandardSellingPrice | Price Display |
| Discount Price (SIMPLE path when used) | 6 | PricingTax.DiscountPrice | SaveProductDraftRequest | PriceListItem | price_list_items.selling_price (+ compare_at = standard) | PricingTax.DiscountPrice | Active Price |
| Variant Selling Prices (VARIANT TARGET) | 6 | PricingTax.variantPrices[] keyed by ProductVariantId | SaveProductDraftRequest | PriceListItem | price_list_items.selling_price WHERE product_variant_id set | PricingTax.VariantPrices / PriceRange | List uses priceFrom–priceTo |
| Tax Name | 6 | PricingTax.TaxClassId | SaveProductDraftRequest | TaxClass | tax_classes.tax_class_name | PricingTax.TaxName | Tax Details |
| Tax Rate (derived) | 6 | PricingTax.TaxClassId | SaveProductDraftRequest | TaxRate | tax_rates.rate_percent (effective) | PricingTax.TaxRatePercentage | Tax Calc |
| Tax Exclusive | 6 | PricingTax.TaxExclusive | SaveProductDraftRequest | Product | products.is_tax_exclusive | PricingTax.TaxExclusive | Price Type |
| Desired Product Status | 3 | DesiredPublishActive | SaveProductDraftRequest | Product | products.desired_publish_status | DesiredPublishStatus | Publish State |
| Initial Batch Number | 5 (TARGET Step 5 Tracking; CURRENT BACKEND: Step 3 via `product_setup_initial_tracking`) | InitialBatchNumber | SaveProductDraftRequest | Draft tracking | EXISTING product_setup_initial_tracking.initial_batch_number | InitialBatchNumber | None (identity, not list qty) |
| Initial Expiry Date | 5 (TARGET Step 5 Tracking; CURRENT BACKEND: Step 3 via `product_setup_initial_tracking`) | InitialExpiryDate | SaveProductDraftRequest | Draft tracking | EXISTING product_setup_initial_tracking.initial_expiry_date | InitialExpiryDate | None |
| Initial Serial Number | 5 (TARGET Step 5 Tracking; CURRENT BACKEND: Step 3 via `product_setup_initial_tracking`) | InitialSerialNumber | SaveProductDraftRequest | Draft tracking | EXISTING product_setup_initial_tracking.initial_serial_number | InitialSerialNumber | None |

## 12. Test Contract
- **Review Rendering:** Asserts structure-specific rendering, no sample values leak, skipped steps hide; Scan Barcode section when scan context present.
- **Create Success Screen:** Asserts post-create card (not toast), View Product → detail route, Add Another → Step 1 Scan Barcode, Back to Products → list. SIMPLE hides Total Variants; VARIANT shows included variant / SKU counts from wizard state.
- **Review Edit:** Asserts edit/cancel behavior against `GetSetupAsync`.
- **Publish Validation:** Asserts missing fields, duplicate identifiers, invalid graphs return 400/409.
- **Publish Transaction:** Asserts single row update, no duplicate creation, `published_at` set.
- **Rollback:** Asserts transactional failure leaves product as DRAFT.
- **Permission & Concurrency:** Asserts 403 and 409 responses correctly, including publish subgraph recheck and cost redaction.
- **Product List Re-hydration:** Asserts Product List fetches updated records from DB post-publish.
