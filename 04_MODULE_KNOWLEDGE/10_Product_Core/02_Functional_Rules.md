<!-- title: Product Core Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-24 -->
<!-- supersedes: old_step4_config_step2_tracking_numbering -->
<!-- extended: 2026-09-24 — BR-VQ-001 through BR-VQ-015 (VARIANT Quantity) added -->

# Product Core Functional Rules

## Purpose

Defines business and UX rules for `Product_Core` in the OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens, responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Product and variant identifiers are tenant-scoped.
- SKU and barcode uniqueness must be enforced by tenant and variant rules.
- No-barcode Product Setup defaults to backend AUTO SKU generation. Step 1
  allocates `{CATEGORY_CODE}-{TENANT_SEQUENCE:000000}` once; SIMPLE uses the
  base unchanged and VARIANT appends ordered persisted Variant Value codes.
  One Product has one tenant sequence shared by all its variants. Manual SKU
  remains supported and is never silently overwritten.
- Base sellable Simple Products carry primary catalog identity directly on `products`. However, to normalize Base SKU and price persistence, they inherently utilize a single default `product_variants` row (as dictated by the canonical database rule: every sellable product must have at least one `product_variants` row).
- Variants carry sellable identity for Variant products (`productStructure = VARIANT`); price and stock remain separate modules.
- Add Product Step 3 owns: Product Type selection (SIMPLE / VARIANT), type-specific unit/pack/SKU configuration (SIMPLE), and Variant Attribute Matrix + Variant SKU/Barcode (VARIANT). **Step 3 does NOT own tracking policy, Initial Batch, Initial Expiry, or Serial** — those belong to Step 5 in the 6-step TARGET.
- Add Product Step 5 is the optional Product Tracking step (6-step TARGET):
  - Quantity: Opening Stock + Outlet Allocation (creates initial stock).
  - Batch: Initial Batch identity only.
  - Batch + Expiry: Initial Batch + Expiry identity only.
  - Skip: No tracking configured. Not a tracking method.

> **CURRENT IMPLEMENTATION SNAPSHOT — TO BE VERIFIED / RECONCILED IN CHUNK 3:**
> Add Product Step 5 was formerly "Product Configuration" (VARIANT/BUNDLE matrix + identifiers). Step 5 product configuration rules below describe CURRENT backend processor reality:
- CURRENT Step 5 is polymorphic (Product Configuration):
  - SIMPLE: Variant/bundle matrix auto-bypassed / `NOT_APPLICABLE`; identifier section still applies.
  - VARIANT: Renders Variant Configuration plus identifier section.
  - BUNDLE: Renders Kit Component Assembly plus identifiers.
- Step 5 VARIANT **matrix** defines options, values, Cartesian matrix, display labels, variant inclusion toggles (`Include Variant`), and variant image overrides. It does NOT configure Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility (channels belong to Step 2 Basic Details; pricing to Step 6). **SKU/Barcode belong to the Step 5 identifier section** (standalone Barcode & SKU superseded). Acquisition is Step 1 Scan Barcode.
- Inactive products cannot be sold through POS or online store.
- POS may cache product reference data, but backend remains final authority.
- Optional Step 5 Product Tracking allows three tracking methods: Quantity / Batch / Lot / Batch + Expiry. See [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification]] for target authority. Skip navigates directly to Step 6 and is not a tracking method. Permission matrix (TARGET): [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix]]. Scanner-first: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]].

## TARGET Tracking Business Rules (6-Step Wizard)

| ID | Rule | Step |
|---|---|---|
| BR-TRACK-001 | **Step 5** is the TARGET home for optional tracking method selection (Quantity / Batch / Lot / Batch + Expiry). | Step 5 |
| BR-TRACK-002 | Step 5 Batch tracking may collect optional Initial Batch Number. | Step 5 |
| BR-TRACK-003 | Step 5 Batch + Expiry tracking may collect optional Initial Batch Number and requires Initial Expiry Date when batch details are entered. | Step 5 |
| BR-TRACK-004 | Skip Product Tracking is a Step 5 action, not a tracking method. | Step 5 |
| BR-TRACK-005 | Step 5 is authoritative for tracking method selection and initial identity onboarding in the 6-step TARGET wizard. | Step 5 |
| BR-TRACK-006 | Expiry Tracking requires Batch Tracking. | Step 5 |
| BR-TRACK-007 | Serial Tracking is **LEGACY/DEFERRED** — not exposed in 6-step UI. | Deferred |
| BR-TRACK-008 | Incompatible identity values must never be silently discarded. | Step 5 |
| BR-TRACK-009 | Expiry remains batch-owned domain data. | Step 5 |
| BR-TRACK-010 | Serial remains physical-unit identity data (LEGACY). | Deferred |
| BR-TRACK-011 | Step 5 initial batch is an INITIAL batch; later batches are added via Inventory Module. | Step 5 |
| BR-TRACK-012 | Opening Stock Quantity >= 0 for Quantity tracking; per-SIMPLE and per-VARIANT rules govern exact requirements. See BR-SQ-002/BR-SQ-003 (SIMPLE) and BR-VQ-004/BR-VQ-005 (VARIANT). | Step 5 |
| BR-TRACK-013 | No positive inventory quantity may be invented from Batch/Expiry input alone. | Step 5 |
| BR-TRACK-014 | Variant tracking identity must resolve to an exact Variant before final physical ownership. | Step 5 |
| BR-TRACK-015 | Bundle parent cannot receive direct physical tracking identities while Bundle inventory remains component-based. | Step 3 |
| BR-TRACK-016 | Step 5 Tracking mutation uses Product Setup authorization and does not imply Stock Adjustment permission. | Step 5 |
| BR-TRACK-017 | Unauthorized specialized fields must never be persisted merely because they were included in a generic draft payload. | All steps |
| BR-TRACK-018 | Publish revalidates all permissions required for mutations performed during publish. | Step 6 |
| BR-TRACK-019 | Cost data must not be returned to callers without `catalog.product_cost.view`. | All steps |
| BR-TRACK-020 | Permission denial must not cause silent destructive normalization of draft data. | All steps |

> **CURRENT IMPLEMENTATION SNAPSHOT — TO BE VERIFIED / RECONCILED IN CHUNK 3**
> Initial Tracking Details (Batch/Expiry/Serial) are currently collected at Step 3 (Product Type & Tracking) in the legacy backend via `product_setup_initial_tracking` table. The TARGET is Step 5. Do not treat current Step 3 collection as the target contract.

## SIMPLE Product Quantity Tracking Functional Rules (Step 5 — LOCKED 2026-09-24)

| ID | Rule | Step |
|---|---|---|
| **BR-SQ-001** | SIMPLE Quantity uses one canonical technical stock owner. | Setup |
| **BR-SQ-002** | Opening Quantity must be >= 0 and UOM-valid. | Step 5 |
| **BR-SQ-003** | Opening Quantity = 0 is valid for a Quantity-tracked Product. | Step 5 |
| **BR-SQ-004** | Opening Quantity > 0 requires Outlet Allocation. | Step 5 |
| **BR-SQ-005** | Opening Quantity = 0 bypasses Outlet Allocation. | Step 5 |
| **BR-SQ-006** | Unit Cost is read-only and permission-protected. | Step 5 |
| **BR-SQ-007** | Opening Stock Value is derived and must not leak restricted cost. | Step 5 |
| **BR-SQ-008** | Positive Opening Stock must reconcile exactly across selected outlets. | Step 5 |
| **BR-SQ-009** | Duplicate outlet allocation is forbidden. | Step 5 |
| **BR-SQ-010** | Product Setup never creates Outlets. | Setup |
| **BR-SQ-011** | Outlet selection must respect tenant + actor authorization. | Step 5 |
| **BR-SQ-012** | Save Draft stores intent only. | Draft |
| **BR-SQ-013** | Draft creates no operational Inventory mutation. | Draft |
| **BR-SQ-014** | Final Publish posts Opening Stock using existing Inventory domain semantics. | Publish |
| **BR-SQ-015** | Final posting must be atomic and retry-safe. | Publish |

Authority: [[../../13_DECISIONS_AND_CHANGES/SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md]]

Detailed Specification (Part A — SIMPLE): [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]]

---

## VARIANT Product Quantity Tracking Functional Rules (Step 5 — LOCKED 2026-09-24)

| ID | Rule | Step |
|---|---|---|
| **BR-VQ-001** | VARIANT Product may use Quantity tracking. | Setup |
| **BR-VQ-002** | Quantity tracking policy is selected at Product level; applies across all Variants. | Step 5 |
| **BR-VQ-003** | Each sellable Variant is an independent stock owner. | Step 5 |
| **BR-VQ-004** | Each Variant Opening Quantity must be >= 0. | Step 5 |
| **BR-VQ-005** | Variant Opening Quantity = 0 is valid; requires no Outlet Allocation for that Variant. | Step 5 |
| **BR-VQ-006** | Variant Opening Quantity > 0 requires Outlet Allocation for that Variant. | Step 5 |
| **BR-VQ-007** | Allocation reconciliation is enforced independently per Variant. | Step 5 |
| **BR-VQ-008** | Each allocation quantity must be > 0. | Step 5 |
| **BR-VQ-009** | Duplicate Outlet within the same Variant is invalid. | Step 5 |
| **BR-VQ-010** | Same Outlet may hold stock for multiple Variants (valid; inventory ownership is variant-specific). | Step 5 |
| **BR-VQ-011** | Draft may remain under-allocated per Variant, but must never be over-allocated per Variant. | Draft |
| **BR-VQ-012** | Continue/Publish requires exact per-Variant reconciliation for all Variants with OpeningQuantity > 0. | Step 5 / Publish |
| **BR-VQ-013** | Overall Product stock total is informational only and cannot replace per-Variant validation. | Step 5 |
| **BR-VQ-014** | Opening Stock must reuse existing sellable ProductVariants from Step 3; no new Variants created at Stock time. | Setup |
| **BR-VQ-015** | Product Setup initialises stock for Quantity-tracked Variants; future stock operations belong to Inventory. | Publish |

Detailed Specification (Part B — VARIANT): [[Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] (Part B section)

## Related Specifications

**Current TARGET authorities (6-step):**
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] — PRIMARY contract
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] — Step 3 TARGET
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] — Step 5 TARGET
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_SIMPLE_Quantity_Opening_Stock_Outlet_Allocation_Specification.md]] — SIMPLE Quantity (Part A) & VARIANT Quantity (Part B) opening stock & outlet allocation CANONICAL (updated 2026-09-24)
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_6_Step_Permission_Matrix.md]] — Permission TARGET
- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[../../13_DECISIONS_AND_CHANGES/SIMPLE_QUANTITY_OPENING_STOCK_OUTLET_ALLOCATION_CANONICAL_DECISION_2026-09-24.md]] — Decision record (NEW 2026-09-24)

**Legacy / Historical (do NOT use as current target authority):**
- [[Tenant_Admin_Product_Type_Tracking_Specification.md]] — SUPERSEDED (was Step 3 tracking authority)
- [[05_Tenant_Admin_Add_Product_7_Step_Contract.md]] — SUPERSEDED (7-step contract)
- [[Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md]] — SUPERSEDED as active tracking authority; retained for migration reference
- [[../../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md]] — SUPERSEDED; retained for legacy reference only

## Bundle / Kit Functional Rules

### Component Eligibility
Eligible Simple Product components must be:
- Same tenant
- ACTIVE
- Sellable
- Inventory tracked
- Accessible
- Not Bundle (Nested bundles blocked)
- Not deleted
- Not archived
- Not Draft

For Variant Products, the component MUST resolve to one exact ACTIVE Variant.

### Required Quantity
- Mandatory
- Greater than 0
- Blank/zero/negative are invalid.
- Whole UOM: integer only.
- Fractional UOM: decimal allowed according to existing precision rules.

### Duplicates
Duplicate identity is `componentProductId` (Simple) or `componentProductId + componentVariantId` (Variant).
If already configured:
`This component is already in the bundle. Update the existing quantity?`
- Add mode: new quantity increments existing.
- Edit mode: new quantity replaces existing.
- Do NOT create duplicate DB rows.

### Zero Stock
A valid ACTIVE component with zero current Outlet stock may still be configured.
Result: `Supports Bundles = 0` and `Bundle Available Quantity = 0`. Configuration remains valid, but sale is blocked. Negative stock is not allowed.

### Nested Bundle and Substitution
- Bundle cannot contain another Bundle in Release 1.
- Self-references are blocked.
- No POS component substitution in Release 1.

### Product Structure Change
Changing `BUNDLE` → `SIMPLE` or `VARIANT` requires destructive confirmation.
- **Confirm**: Physically deletes `combo_definitions` and `combo_components` rows (for BUNDLE → SIMPLE and BUNDLE → VARIANT), clears component mappings, resets Step 5 completion, clears derived state, and applies new structure rules.
- **Cancel**: Retains BUNDLE and its components.
