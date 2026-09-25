<!-- title: Tenant Admin Add Product 6-Step Implementation Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: 05_Tenant_Admin_Add_Product_7_Step_Contract.md (7-step wizard) -->
<!-- extended: 2026-09-24 — VARIANT Quantity tracking explicitly documented -->

# Tenant Admin Add Product 6-Step Implementation Contract

## 1. Executive Summary & Scope

This contract defines the authoritative specification for the **Tenant Admin Add Product / Product Setup** feature in OneVerz POS Unified Commerce. It replaces the legacy 7-step Product Add UI with a **FIXED 6-STEP WIZARD** (scanner-first, with integrated Product Tracking as optional Step 5).

This document serves as the single source of truth for Frontend (Flutter), Backend (.NET Web API), Database Schema, Access Control, and QA teams.

**Previous Authority:** [[05_Tenant_Admin_Add_Product_7_Step_Contract.md]] (superseded 2026-09-20).

**Decision:** [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20]].

**Related Specifications:**
- Step 1: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification.md]]
- Step 3: [[Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]]
- Step 4: [[../14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md]]
- Step 5: [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]]
- Step 5 Quantity detail: [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] (Part A: SIMPLE; Part B: VARIANT)
- Step 6: [[Tenant_Admin_Add_Product_Review_Create_Specification.md]]
- Permissions: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]]

---

## 2. Fixed 6-Step Wizard Lifecycle (Canonical)

The Add Product experience is structured into exactly 6 sequential steps:

1. **Step 1 — Scan Barcode** (acquire/validate/duplicate discovery/optional external lookup/no-barcode bootstrap; pre-draft until creation path)
2. **Step 2 — Basic Details** (General info, mandatory Category, optional Brand, Product Image upload, Channel Availability toggles)
3. **Step 3 — Product Type & Configuration** (`SIMPLE`, `VARIANT` selection; type-specific configuration; Simple: Units/Packs + SKU; Variant: Matrix + SKU)
4. **Step 4 — Pricing & Tax** (SIMPLE: single selling + tax; VARIANT: per-variant selling prices + common tax)
5. **Step 5 — Product Tracking** (**OPTIONAL**; Quantity / Batch / Batch+Expiry method selection; Quantity-only creates stock; **SIMPLE:** compact opening stock card + outlet allocation; **VARIANT:** per-Variant opening stock table + per-Variant outlet allocation with exact per-Variant reconciliation)
6. **Step 6 — Review & Create** (Verification summary across all sections, inline edit links, method-specific Product Tracking summary, final atomic publish)

---

## 3. Step 1 — Scan Barcode (Unchanged)

Full specification: [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification]].

Summary:

- Acquire primary barcode through scan, manual entry, or external lookup
- Optional SKU candidate generation (no-barcode bootstrap)
- Pre-draft state until creation-path is confirmed
- First Product persistence via `POST .../products/draft` creates `current_setup_step = 2`

**Important downstream rule:** If Step 1 acquired the primary barcode, Step 3 Simple Product configuration must reuse it (do NOT ask for duplicate entry).

---

## 4. Step 2 — Basic Details

User enters core product metadata.

Summary:

- Product Name (mandatory)
- Internal Product Code / Short Name (mandatory, auto-slugged)
- Category (mandatory; hierarchical ACTIVE only per BR-CAT-PRODUCT-SELECT-001)
- Brand (optional)
- Short Description (optional)
- Long Description (optional)
- Product Image upload (optional; up to 10 images)
- In-Store POS (Channel toggle, default True)
- Online Store (Channel toggle, default False)

**Database:** Product master fields; category/brand cross-references via existing relationships.

**Important:** Do NOT collect Initial Tracking Details on Step 2. They belong to Step 5 Product Tracking.

---

## 5. Step 3 — Product Type & Configuration (Renamed from "Product Type & Tracking")

### 5.1 Overview

Step 3 now owns product structure selection plus type-specific configuration.

Renamed from "Product Type & Tracking" to clarify that tracking policy has moved to Step 5.

**Sub-sections:**
- Product Type selection (SIMPLE / VARIANT)
- SIMPLE: Base Unit + Packs + SKU/Barcode (reuse Step 1)
- VARIANT: Variant Matrix + Variant SKU/Barcode
- Bundle: LEGACY/DEFERRED (not in active new UI unless separately approved)

### 5.2 Product Type Selection

Cards (2 active options):

1. **Simple Product**: "Single standalone item with one price and one SKU."
2. **Variant Product**: "Item with multiple variations (e.g. Size, Color, Material)."

User must explicitly select one type. Save & Continue is blocked until selection is confirmed.

**Bundle Status:** LEGACY/DEFERRED. Do not expose Bundle in new Product Setup UI unless separately approved. Existing Bundle data/backend capability preserved.

---

### 5.3 SIMPLE Product Configuration

#### 5.3.1 Flow

```text
Select: Simple Product
    ↓
Configure Base Unit
    ↓
Configure Optional Packs / Cases
    ↓
Configure SKU
    ↓
Reuse Step 1 Primary Barcode
    ↓
Continue to Step 4 (Pricing & Tax)
```

#### 5.3.2 Base Unit

Base Unit must reuse existing UOM / Unit Master.

Do not invent a new Unit Master.

**UI Fields:**

| Field | Source | Required | Example |
|---|---|---|---|
| Unit Type | Global UOM Master (seeded) | YES | Each / Piece / Bottle |
| Unit Label | Product-specific | NO | Bottle / Carton / Pack |
| Unit Name / Size | Product-specific | NO | 500ml / 1kg / 6-pack |

**Meaning:**

```text
1 Bottle (500ml) = 1 Base Unit
```

**Important:** Do not perform inventory quantity calculations here. This defines unit structure only.

#### 5.3.3 Packs / Cases (Optional)

Do NOT ask:

```text
Single Product / Multiple Product
```

Do NOT introduce:

```text
Single Unit / Multiple Unit
```

as a Product Type.

Instead:

```text
This product has packs / cases
[OFF / ON]
```

**If OFF:**
Base Unit only. No packs.

**If ON:**
Tenant Admin may add one or more pack conversions.

**Example:**

```text
Base Unit:
1 Bottle

Pack:
Type: Pack
Name: 6-Pack
Contains: 6 Bottles

Case:
Type: Case
Name: Case of 24
Contains: 24 Bottles
```

**Important (LOCKED):**

Pack Type may be seeded (Pack, Box, Case, Carton, Tray, Bag, Crate).

But conversion is PRODUCT-SPECIFIC.

Do NOT globally define:
```text
Case = 24
```

Another product may have:
```text
Case = 12
```

**Multi-pack support:** If existing UOM architecture supports multiple pack rows, support them. Do not limit to single pack.

#### 5.3.4 SKU & Barcode

**SKU:**

Belongs to the Simple Product.

Do NOT generate here. Manual entry only (or auto-generate if existing Product Setup logic reserves that for Step 1).

**Primary Barcode:**

Step 1 already acquired the primary barcode.

Reuse it.

**Example UI:**

```text
Primary Barcode
479xxxxxxxxx
Verified / Acquired
```

Do NOT ask the user to scan/type the same barcode again.

**Optional Pack-Level Barcode:**

According to existing identifier architecture, pack/case barcodes may be optional.

Support per existing rules.

---

### 5.4 VARIANT Product Configuration

#### 5.4.1 Flow

```text
Select: Variant Product
    ↓
Configure Variant Attributes
    ↓
Generate Variant Combinations
    ↓
Include / Exclude Variants
    ↓
Assign SKU / Barcode per Variant
    ↓
Continue to Step 4 (Pricing & Tax)
```

#### 5.4.2 Reuse Existing Variant Architecture

Do NOT rebuild:

- Attribute templates
- Attribute values
- Variant generation (Cartesian product)
- Combination hash / uniqueness
- Include/Exclude variant UI
- Draft reconciliation
- Variant image assignment

**Authority:** [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]].

Reuse existing canonical architecture.

Move its ownership into Step 3 from previous Step 5.

#### 5.4.3 Variant SKU & Barcode

Each sellable Variant owns its own identifier.

**Example:**

```text
Product:
Baby Soap 90g

Variants:
Almond
Lavender
Aloe Vera
```

**Step 1 Mapping:**

If Step 1 scanned the Almond barcode:

```text
Almond
→ reuse Step 1 barcode (do NOT re-scan)

Lavender
→ assign own barcode if available

Aloe Vera
→ assign own barcode if available
```

Do NOT ask Almond barcode twice.

Preserve existing SKU/barcode tenant-wide uniqueness rules.

---

## 6. Step 4 — Pricing & Tax (Renumbered from Step 6)

Full specification: [[../14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract]].

Summary:

- SIMPLE: single selling price + tax class + inclusive/exclusive
- VARIANT: per-variant selling prices + common tax class + inclusive/exclusive
- Tax lookup from Tax Management (no new tax creation on Product Setup)
- Cost Price (optional; hidden if user lacks `catalog.product_cost.view`)

**No functional change from previous Step 6.**

Only renumbering and integration into 6-step wizard.

---

## 7. Step 5 — Product Tracking (Optional, New Location)

Full specification: [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification]].

**Summary:**

This step is **entirely optional**.

**Options:**

```text
Skip
→ Step 6 Review & Create

OR

Quantity
→ Opening Stock
→ Outlet Allocation
→ Step 6 Review & Create

OR

Batch / Lot
→ Initial Batch Details
→ Step 6 Review & Create

OR

Batch + Expiry
→ Initial Batch & Expiry Details
→ Step 6 Review & Create
```

**Quantity path (ONLY stock-creating path):**

- Initializes opening stock
- Allocates to outlets
- Creates `stock_movements` at publish

**Batch path:**

- Captures initial Batch identity only
- No stock creation
- No quantity entry

**Batch+Expiry path:**

- Captures initial Batch + Expiry identity only
- No stock creation
- No quantity entry

**Serial / IMEI:**

- LEGACY/DEFERRED (not exposed in new UI)
- Preserved for backward-compatibility
- Future enhancement decision required

---

## 8. Step 6 — Review & Create (Renumbered from Step 7)

Full specification: [[Tenant_Admin_Add_Product_Review_Create_Specification]].

Summary:

- Display all configured sections
- Method-specific Product Tracking summary
- Inline edit links for each section
- Final atomic publish validation

**Product Tracking Summary (Method-Specific):**

**Quantity (SIMPLE):**
```text
Product Tracking: Quantity
Opening Stock: 100 units
Outlet Allocation: Colombo 60, Jaffna 40
```

**Quantity (VARIANT):**
```text
Product Tracking: Quantity
Total Opening Stock: 160 units

Red / S  Opening: 50  Colombo: 30, Jaffna: 20
Red / M  Opening: 70  Colombo: 40, Jaffna: 30
Blue / S Opening: 40  Colombo: 20, Jaffna: 20
Blue / M Opening:  0  Allocation: Not required

[LOCKED: variant-level detail required; product total alone is not sufficient]
```

**Batch:**
```text
Product Tracking: Batch / Lot
Initial Batch: BAT-2026-0001 (or "Not provided")
```

**Batch+Expiry:**
```text
Product Tracking: Batch + Expiry
Initial Batch: BAT-2026-0001 (or "Not provided")
Expiry: 2028-12-31 (or "Not provided")
```

**Skip:**
```text
Product Tracking: Not configured
```

---

## 9. Persistence Lifecycle Architecture (Three-State Model — Unchanged)

### 9.1 Three States

1. **LOCAL_UNSAVED**: User enters data; no backend writes. Wizard state remains in client/session.
2. **EXPLICIT_DRAFT**: User clicks Save Draft; backend creates/updates DRAFT Product.
3. **PUBLISHED**: User clicks Create Product; backend atomically publishes final Product.

### 9.2 `current_setup_step` Canonical Rules (1–6, Changed from 1–7)

| Value | Meaning |
|---:|---|
| 1 | Scan Barcode |
| 2 | Basic Details |
| 3 | Product Type & Configuration |
| 4 | Pricing & Tax |
| 5 | Product Tracking |
| 6 | Review & Create |

**Migration Note:**

Existing database may enforce `BETWEEN 1 AND 7` constraint.

Update to `BETWEEN 1 AND 6`.

Migration logic for existing Step 7 drafts:

```text
PENDING BACKEND IMPLEMENTATION AUDIT
```

---

## 10. API Contract Summary (6-Step)

| Operation | Endpoint | Method | Permission | DTO |
|---|---|---|---|---|
| Create Options | `/api/v1/tenant-admin/products/create-options` | GET | `catalog.products.create` + `product_catalog` | `TenantProductCreateOptionsDto` |
| Save Draft (create) | `/api/v1/tenant-admin/products/draft` | POST | `catalog.products.create` + `product_catalog` | `SaveProductDraftRequestDto` → `ProductDraftResponseDto` |
| Resume Draft | `/api/v1/tenant-admin/products/{id}/setup` | GET | view **OR** create **OR** update + `product_catalog` | `ProductSetupWizardDto` |
| Update Draft Step | `/api/v1/tenant-admin/products/{id}/draft` | PUT | create (initial draft) **or** update | `UpdateProductDraftStepRequestDto` |
| Stage Image | `/api/v1/tenant-admin/products/images/stage` | POST | `catalog.product_media.manage` | Multipart → `StagedImageResponseDto` |
| Final Publish | `/api/v1/tenant-admin/products/{id}/publish` | POST | `catalog.products.publish` + subgraph recheck + `product_catalog` | `PublishProductRequestDto` → `TenantProductDetailDto` |

**Extended for Step 5:**

Update draft endpoints to accept Step 5 payload (trackingMethod, openingStock, outletAllocations, initialBatchNumber, initialExpiryDate, skipInitialDetails).

Full DTO details in Step 5 specification.

---

## 11. Permission & Entitlement Model (6-Step)

Canonical permission namespace:

```text
catalog.products.create
catalog.products.update
catalog.products.publish
catalog.variants.manage
catalog.barcodes.manage
catalog.product_pricing.manage
catalog.product_media.manage
```

**Advanced entitlements:**

```text
product_catalog (base Product Setup)
inventory_tracking (Batch/Expiry policy + Step 5 mutations)
```

**Step 5 Quantity Permissions:**

```text
tenant.stock.opening (if confirmed in backend)
Outlet authorization scope (backend validates)
```

**Entitlement Status:**

```text
VERIFY DURING BACKEND AUDIT
Do not assume inventory_tracking is required for Quantity stock.
```

Full matrix: [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]].

---

## 12. Database Ownership & Traceability (6-Step)

| Table | Purpose | 6-Step Changes |
|---|---|---|
| `products` | Master record + step progress | Update `current_setup_step` constraint 1–7 → 1–6; migrate existing Step 7 drafts |
| `product_variants` | Variant identities (Step 3) | No schema change; Step 3 ownership replaces previous Step 5 |
| `product_inventory_settings` | Tracking policy | Step 5 saves here; add tracking method to payload |
| `product_setup_initial_tracking` | Draft identities | Expand to store opening stock draft state (PENDING design audit) |
| `inventory_balances` | Stock ledger | Step 5 Quantity creates initial rows at publish |
| `stock_movements` | Stock transactions | Step 5 Quantity creates opening-stock reason records |
| `product_batches` | Batch identity | Step 5 Batch/Batch+Expiry creates records at publish |
| `serial_numbers` | Serial identity | LEGACY/DEFERRED (not in Step 5 UI) |

---

## 13. Non-Functional Requirements (6-Step)

All existing NFRs remain:

- **Atomicity:** Step 6 publish is atomic across all 6 steps
- **Consistency:** UI, API, Domain, Database synchronized
- **Tenant Isolation:** All queries filter by `tenant_id`
- **Idempotency:** Publish retry does not double-post
- **Concurrency:** Optimistic control via `row_version`
Reuse existing system NFRs
- **Security:** Backend-authoritative permission/entitlement checks
- **Audit:** Material updates logged per step

**Step 5 Specific:**

- Quantity opening stock and outlet allocation must be transactionally atomic
- Outlet authorization must be server-validated (Flutter filtering is UX only)
- Draft persistence must survive all navigation paths

---

## 14. Related Documents

### Main Specifications
- [[Tenant_Admin_Product_Setup_Scan_Barcode_Specification.md]] (Step 1)
- [[Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] (Step 3)
- [[../14_Pricing_Tax_Management/Tenant_Admin_Tax_Management_Canonical_Contract.md]] (Step 4)
- [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] (Step 5)
- [[Tenant_Admin_Add_Product_Review_Create_Specification.md]] (Step 6)

### Supporting Specifications
- [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification.md]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification.md]] (moves to Step 3)
- [[Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md]]
- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md]]

### Access Control
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]]
- [[../../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog.md]]

### User Journey
- [[../../03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md]]

### Decisions
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11.md]]
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (NEW)

### Database
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md]]

### Testing & QA
- [[../../10_TESTING_QA/Tenant_Admin_Product_Setup_6_Step_Test_Matrix.md]] (TBD)

---

## 15. Superseded Authority

**Previous:** `05_Tenant_Admin_Add_Product_7_Step_Contract.md`

This document supersedes the 7-step contract effective 2026-09-20.

Existing references to 7-step wizard must be updated to 6-step.

Historical audit: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/CHUNK_1_AUDIT_CORRECTED_2026-09-20.md]].

---

**STATUS: Active Target Specification**

**IMPLEMENTATION STATUS:** Backend and Flutter implementation pending.
