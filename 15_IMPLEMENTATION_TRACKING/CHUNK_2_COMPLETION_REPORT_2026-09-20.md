<!-- title: CHUNK 2 Completion Report - Second Brain Canonical Flow Update -->
<!-- status: Complete -->
<!-- date: 2026-09-20 -->
<!-- scope: Documentation update only; no backend/flutter implementation -->

# CHUNK 2 COMPLETION REPORT
## Second Brain Canonical Product Setup Flow Update

**PHASE:** Documentation Update Only  
**STATUS:** COMPLETE ✅  
**DATE:** 2026-09-20  
**NEXT PHASE:** Backend Implementation Audit (CHUNK 3)

---

## 1. Files Updated (Existing Documents Modified)

| File Path | Change Type | Summary |
|---|---|---|
| `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract.md` | MARKED SUPERSEDED | Added supersession notice pointing to new 6-step contract; preserved for historical reference |
| `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md` | PARTIALLY UPDATED | Header updated to reflect 6-step wizard and ownership change; marked for full update in documentation consistency pass |

---

## 2. Files Added (New Documents Created)

| File Path | Purpose | Status |
|---|---|---|
| `04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md` | **NEW:** Main 6-step wizard contract (canonical authority) | ✅ CREATED |
| `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md` | **NEW:** Step 5 Product Tracking (Quantity/Batch/Batch+Expiry) | ✅ CREATED |
| `13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md` | **NEW:** Formal decision record for 7→6 step restructuring | ✅ CREATED |

---

## 3. Files Superseded (Authority Changed)

| Old Document | Status | New Authority |
|---|---|---|
| `05_Tenant_Admin_Add_Product_7_Step_Contract.md` | SUPERSEDED | `06_Tenant_Admin_Add_Product_6_Step_Contract.md` |
| "Product Type & Tracking" ownership | CONSOLIDATED | "Product Type & Configuration" (Step 3, with Units/Packs/Matrix ownership) |
| "Unit & Pack Conversion" as Step 4 | ELIMINATED | Consolidated into Step 3 (SIMPLE) and integrated into Variant Matrix (Step 3) |

---

## 4. Final Canonical 6-Step Flow

### Approved Target Flow

```
1. Scan Barcode
   ├─ Acquire primary barcode (scan, manual, external lookup)
   ├─ Optional SKU candidate (no-barcode path)
   └─ Create first draft → current_setup_step = 2

2. Basic Details
   ├─ Product master (name, code, category, brand, images)
   ├─ Channel visibility (POS, Online)
   └─ Continue → current_setup_step = 3

3. Product Type & Configuration
   ├─ Structure Selection (SIMPLE / VARIANT)
   ├─ Type-Specific Config
   │  ├─ SIMPLE:
   │  │  ├─ Base Unit (from UOM master)
   │  │  ├─ Optional Packs/Cases
   │  │  └─ SKU (reuse Step 1 barcode, do NOT duplicate)
   │  └─ VARIANT:
   │     ├─ Variant Matrix (attributes + values)
   │     ├─ Generate Combinations
   │     ├─ Include/Exclude Variants
   │     └─ Variant SKU/Barcode (per variant)
   └─ Continue → current_setup_step = 4

4. Pricing & Tax
   ├─ SIMPLE: Selling Price + Tax Class + Inclusive/Exclusive
   ├─ VARIANT: Per-variant Selling Prices + Tax Class
   └─ Continue → current_setup_step = 5

5. Product Tracking (OPTIONAL)
   ├─ Skip
   │  └─ → Step 6 (no tracking)
   ├─ Quantity (ONLY stock-creating path)
   │  ├─ Opening Stock (enter quantity)
   │  ├─ Outlet Allocation (distribute to authorized outlets)
   │  └─ → Step 6
   ├─ Batch / Lot (identity-only)
   │  ├─ Initial Batch Number (optional)
   │  ├─ Option: Skip Initial Details
   │  └─ → Step 6
   └─ Batch + Expiry (identity-only)
      ├─ Initial Batch Number + Expiry Date (both required if entering)
      ├─ Option: Skip Initial Details
      └─ → Step 6

6. Review & Create
   ├─ Display all sections
   ├─ Method-Specific Product Tracking Summary
   ├─ Inline edit links
   └─ Final atomic publish
```

---

## 5. Simple Product Step 3 Configuration Flow

```
SIMPLE Product Selected
        ↓
[Page 1] Base Unit Configuration
├─ Unit Type (from UOM master)
├─ Unit Label (e.g. "Bottle")
├─ Unit Name/Size (e.g. "500ml")
└─ Continue
        ↓
[Page 2] Optional Packs/Cases
├─ This product has packs/cases? [OFF / ON]
├─ If ON:
│  └─ Add multiple packs:
│     ├─ Pack Type (Case, Box, etc.)
│     ├─ Pack Name (e.g. "Case of 24")
│     └─ Contains (conversion factor, e.g. 24 Bottles)
└─ Continue
        ↓
[Page 3] SKU & Barcode
├─ Primary Barcode (reuse Step 1: do NOT re-enter)
│  └─ "Barcode 479xxxxxxxxx (Verified / Acquired)"
├─ SKU (manual entry or auto-populated)
├─ Optional Pack Barcodes (if packs configured)
└─ Continue → Step 4 Pricing & Tax
```

**Key Rule:** Do NOT ask the user to scan/type Step 1 barcode again.

---

## 6. Variant Product Step 3 Configuration Flow

```
VARIANT Product Selected
        ↓
[Page 1] Select Attributes
├─ Available attribute templates
├─ User selects applicable attributes
└─ Continue
        ↓
[Page 2] Select Attribute Values
├─ For each selected attribute: choose values
├─ Example: Color: [Red, Blue, Green], Size: [S, M, L]
└─ Continue
        ↓
[Page 3] Generate Combinations
├─ Display estimated variant count (live preview)
├─ Cartesian product generation
├─ Show all combinations
└─ Continue
        ↓
[Page 4] Include/Exclude Variants
├─ Checkbox per generated variant
├─ Mark sellable variants
└─ Continue
        ↓
[Page 5] Variant SKU & Barcode Assignment
├─ Table of sellable variants
├─ Per variant:
│  ├─ SKU (required)
│  ├─ Barcode (optional)
│  └─ Step 1 barcode reuse (if mapped to this variant)
└─ Continue → Step 4 Pricing & Tax
```

**Key Rules:**
- Reuse existing Variant Matrix architecture
- Each variant owns its own SKU/barcode
- Step 1 barcode may map to one specific variant if applicable
- No duplicate barcode entry

---

## 7. Product Tracking Step 5 Flows

### 7.1 Skip Product Tracking

```
Step 5: Product Tracking
        ↓
[Skip button]
        ↓
→ Step 6 Review & Create

Result:
- is_stock_tracked = false (or equivalent)
- No tracking policy configured
- No initial identity entries
```

---

### 7.2 Quantity Tracking Flow

```
Step 5: Product Tracking
        ↓
Select: Quantity
        ↓
[Page 1] Opening Stock
├─ SIMPLE: "Opening Stock: [ ] units"
├─ VARIANT: Per-variant rows
│  ├─ Black / S: [ ]
│  ├─ Black / M: [ ]
│  └─ Black / L: [ ]
└─ Continue
        ↓
[Page 2] Outlet Allocation
├─ Display: "Opening Stock: 100 units"
├─ Allocate:
│  ├─ Colombo: [ 60 ]
│  ├─ Jaffna: [ 40 ]
│  └─ (only authorized outlets shown)
├─ Validate: Total allocated = Opening Stock
└─ Continue → Step 6
        ↓
Result at Publish:
- Creates stock_movements (reason: OPENING_STOCK)
- Initializes inventory_balances per outlet/variant
- ONLY Quantity path creates actual stock
```

**Important:** Opening Stock and Outlet Allocation are SEPARATE internal pages.

---

### 7.3 Batch / Lot Tracking Flow

```
Step 5: Product Tracking
        ↓
Select: Batch / Lot
        ↓
[Page] Initial Batch Details
├─ Batch Number: [ ] (optional, max 100 chars)
├─ Explicit Skip: ( ) Skip Initial Details
└─ Continue → Step 6
        ↓
Result at Publish:
- IF Batch Number entered: creates product_batches record
- NO stock quantity created
- NO Inventory Balance created
- NO stock movement
- Identity only
```

**Skip Behavior:**
```
Tracking Method: Batch / Lot
Initial Batch: Not provided
→ Future batch details will be captured in Inventory.
```

---

### 7.4 Batch + Expiry Tracking Flow

```
Step 5: Product Tracking
        ↓
Select: Batch + Expiry
        ↓
[Page] Initial Batch & Expiry Details
├─ Batch Number: [ ] (optional if skipping)
├─ Expiry Date: [ YYYY-MM-DD ] (optional if skipping)
├─ Rules: If entering, BOTH fields required (no partial)
├─ Explicit Skip: ( ) Skip Initial Details
└─ Continue → Step 6
        ↓
Result at Publish:
- IF both fields entered: creates product_batches with expiry
- NO stock quantity created
- NO Inventory Balance created
- NO stock movement
- Identity only
- Expiry belongs to Batch (not Product master)
```

**Skip Behavior:**
```
Tracking Method: Batch + Expiry
Initial Batch: Not provided
Initial Expiry: Not provided
→ Future batch and expiry details will be captured in Inventory.
```

---

## 8. Functional Rules Updated

### 8.1 New Rules (6-Step Specific)

| Rule | Text | Authority |
|---|---|---|
| **ONLY Quantity Creates Stock** | Product Setup Quantity is the ONLY tracking path that initializes actual stock. Batch/Batch+Expiry are identity-only. | Decision 2026-09-20 |
| **Batch Does NOT Create Quantity** | Batch tracking does NOT create on-hand quantities, balances, or movements. Identity setup only. | Decision 2026-09-20 |
| **Batch+Expiry Does NOT Create Quantity** | Batch+Expiry tracking does NOT create quantities. Expiry belongs to Batch records, not Product master. | Decision 2026-09-20 |
| **Opening Stock Separate Pages** | Opening Stock and Outlet Allocation are separate internal pages within Step 5 Quantity flow. | Spec Step 5 § 3.3 |
| **Step 1 Barcode Reuse** | If Step 1 acquired a primary barcode, Step 3 Simple Product configuration must reuse it. Do NOT ask for duplicate entry. | Spec Step 3 § 5.3.4 |
| **Variant-Per-Barcode** | Each sellable Variant owns its own SKU/Barcode identity. Step 1 barcode may map to one variant; others assigned separately. | Spec Step 3 § 5.4.3 |
| **Product-Specific Units** | Pack conversions are PRODUCT-SPECIFIC. Do NOT globally define "Case = 24" (another product may have Case = 12). | Spec Step 3 § 5.3.3 |
| **Expiry Belongs to Batch** | Expiry is owned by product_batches, not Product master. Same Product may have multiple batches with different expiries. | Spec Step 5 § 5.3 |
| **Future Stock = Inventory** | After Product creation, all future stock operations (receive, transfer, adjust, etc.) belong to Inventory module exclusively. | Decision 2026-09-20 |
| **Product Tracking Optional** | Step 5 Product Tracking is entirely optional. Skip = no tracking configured. | Spec Step 5 § 2.1 |
| **No "None" Tracking Option** | Do NOT show "None" as a visible Tracking Method card. Use Skip button for no tracking. | Spec Step 5 § 2.2 |
| **Bundle LEGACY/DEFERRED** | Bundle is preserved in backend but NOT exposed in new Step 3 UI by default. Classify as LEGACY/DEFERRED unless separately approved. | Decision 2026-09-20 |
| **Serial LEGACY/DEFERRED** | Serial / IMEI removed from Step 5 UI. Preserved for backward-compatibility. Future enhancement separate decision. | Decision 2026-09-20 |

---

## 9. Business Rules Updated

### 9.1 Quantity Opening Stock

| Rule | Details |
|---|---|
| Non-negative | Opening Stock ≥ 0 (no negative quantities) |
| Outlet Allocation | Total outlet allocation MUST equal Opening Stock before publish |
| Authorized Outlets Only | User can allocate only to outlets they are authorized for; backend validates |
| Inventory Semantics | Uses existing Inventory ledger authoritative logic at publish; creates stock_movements + inventory_balances |
| No Partial Allocation | Must either fully allocate or leave as zero (VERIFY if partial allocation is allowed elsewhere) |

### 9.2 Batch Identity

| Rule | Details |
|---|---|
| Max 100 chars | Batch Number limited to 100 characters (existing schema) |
| Optional Entry | Initial Batch can be skipped; captured later during Inventory receive |
| Uniqueness | Deferred to publish validation (no duplicate check during draft) |
| Identity Only | Does NOT create quantity or stock movements |
| Skip Behavior | Explicit "Skip Initial Details" action available |

### 9.3 Batch + Expiry Identity

| Rule | Details |
|---|---|
| Require Both | If entering initial details, BOTH Batch Number AND Expiry Date required (no partial entry) |
| Expiry Format | YYYY-MM-DD date format (date picker provided) |
| Expiry Ownership | Expiry belongs to Batch record, not Product master |
| Optional Entry | Both can be skipped; captured later during Inventory receive |
| Skip Behavior | Explicit "Skip Initial Details" action available |

---

## 10. User Journeys Updated

### 10.1 Canonical Product Setup Journey (ALL Users)

```
Start: Tenant Admin → Add Product
        ↓
Step 1: Scan Barcode
├─ Scan / Manual / External Lookup / No-Barcode Bootstrap
├─ Create first draft (if not already created)
└─ → Step 2 Basic Details
        ↓
Step 2: Basic Details
├─ Enter product master (name, code, category, brand)
├─ Upload images (optional)
├─ Set channel visibility
└─ → Step 3 Product Type & Configuration
        ↓
Step 3: Product Type & Configuration
├─ Select SIMPLE or VARIANT
├─ Type-specific config (Units/Packs for SIMPLE; Matrix for VARIANT)
└─ → Step 4 Pricing & Tax
        ↓
Step 4: Pricing & Tax
├─ Enter selling prices
├─ Assign tax class
├─ Set inclusive/exclusive
└─ → Step 5 Product Tracking
        ↓
Step 5: Product Tracking (OPTIONAL)
├─ Branch: Skip
│  └─ → Step 6 Review & Create
├─ Branch: Quantity
│  ├─ Enter opening stock
│  ├─ Allocate to outlets
│  └─ → Step 6 Review & Create
├─ Branch: Batch
│  ├─ Enter initial batch (optional)
│  └─ → Step 6 Review & Create
└─ Branch: Batch+Expiry
   ├─ Enter initial batch + expiry (optional)
   └─ → Step 6 Review & Create
        ↓
Step 6: Review & Create
├─ Display all sections
├─ Show method-specific Product Tracking summary
├─ Inline edit links
└─ Publish → Product Created ✅
        ↓
After Creation: All future stock → Inventory Module
```

---

## 11. Ownership Boundaries Updated

### Canonical Ownership Matrix

| Area | Owner | Details |
|---|---|---|
| **Product Identity** | Product Setup (Steps 1-6) | Product master, category, brand, images, channels |
| **Product Structure** | Product Setup (Step 3) | SIMPLE vs VARIANT, attributes, variants |
| **Product Configuration** | Product Setup (Step 3) | Base Unit, Packs, SKU, Barcode for structure |
| **Pricing** | Product Setup (Step 4) | Selling prices, tax class, inclusive/exclusive |
| **Tracking Policy** | Product Setup (Step 5) | Method selection (Quantity/Batch/Batch+Expiry) |
| **Initial Quantity (Opening Stock)** | Product Setup (Step 5) orchestrates; Inventory owns ledger | Quantity initial allocation to outlets |
| **Initial Batch Identity** | Product Setup (Step 5) captures; Inventory owns ledger | Batch number, expiry date |
| **Stock Ledger** | **Inventory Module** (not Product Setup) | All stock movements, balances, locations |
| **Future Batch Lifecycle** | **Inventory Module** (not Product Setup) | Stock receiving, new batches, batch expiry |
| **Future Quantity Operations** | **Inventory Module** (not Product Setup) | Stock in, stock out, transfers, adjustments |
| **Outlet Stock State** | **Inventory Module** (not Product Setup) | Per-location balances, reservations |

---

## 12. Decisions Still Pending Backend Audit

### 12.1 Database Schema (Pending)

| Decision | Status | Notes |
|---|---|---|
| `current_setup_step` constraint | **PENDING** | Change 1–7 → 1–6. Audit existing implementation. |
| Migration for Step 7 drafts | **PENDING** | Design safe migration path for existing drafts at step 7. |
| Quantity draft storage | **PENDING** | JSONB in existing table vs new normalized table. Audit existing DTO/draft patterns. |
| Opening Stock draft persistence | **PENDING** | How to store per-variant/per-outlet allocations safely across Save/Resume. |

### 12.2 Permissions & Entitlements (Pending)

| Decision | Status | Notes |
|---|---|---|
| `tenant.stock.opening` permission | **VERIFY** | Confirm permission exists and is used for Opening Stock mutation. |
| `inventory_tracking` scope | **VERIFY** | Does it gate Quantity opening stock, or only Batch/Expiry/Serial policy? |
| Entitlement check for Quantity | **VERIFY** | Which entitlements gate Step 5 Quantity opening stock mutation? |

### 12.3 Resume & Backward-Compatibility (Pending)

| Decision | Status | Notes |
|---|---|---|
| Old 7-step draft resume | **PENDING** | How do existing Step 4-7 drafts hydrate in new 6-step UI? |
| Serial legacy drafts | **PENDING** | Preserve `initial_serial_number` values; mark LEGACY on resume. |
| Bundle legacy drafts | **PENDING** | How do existing Bundle drafts behave if resumed? |
| Step-state migration | **PENDING** | Remap old step values to new 1–6 range safely. |

### 12.4 Implementation Details (Pending)

| Area | Decision | Status |
|---|---|---|
| Variant-Batch assignment timing | **VERIFY EXISTING** | Assignment at Step 5 vs Step 7 vs Review. Reuse existing if sufficient. |
| Outlet authorization enforcement | **IMPLEMENT** | Backend validates authorized outlets; Flutter filtering is UX only. |
| Quantity idempotency | **IMPLEMENT** | Retry publish must not double-post opening stock. |
| Outlet allocation validation | **IMPLEMENT** | Ensure total allocated = opening stock before publish. |

---

## 13. Implementation Status (Current)

### 13.1 Second Brain Documentation

✅ **UPDATED:**
- [x] Main 6-step contract created
- [x] Step 5 Product Tracking specification created
- [x] Step 3 updated (partial header/intro; full content update pending)
- [x] Decision record created
- [x] Old 7-step contract marked SUPERSEDED

⏳ **PENDING (CHUNK 3+):**
- [ ] Step 3 complete content update (Units/Packs section)
- [ ] Update Units & Pack Conversion spec (ownership change)
- [ ] Update Pricing & Tax spec (renumbering)
- [ ] Update Review & Create spec (renumbering + Tracking summary)
- [ ] Update Permission Matrix (6-step reference)
- [ ] Update User Journey: Product Management Flow
- [ ] Update User Journey: Stock-In (clarify Inventory ownership)
- [ ] Update Functional Rules (consolidate 6-step rules)
- [ ] Update Database documentation (cross-refs)
- [ ] Create test matrix (6-step test cases)

### 13.2 Backend Implementation

🔴 **NOT STARTED**

Required work:
- Database constraint migration
- DTO schema updates (Step 5 payload)
- API payload extension
- Opening stock draft persistence design
- Quantity publish logic (stock_movements creation)
- Entitlement verification
- Permission checks
- Resume logic (old draft hydration)
- Backward-compatibility for Serial/Bundle

### 13.3 Flutter Implementation

🔴 **NOT STARTED**

Required work:
- Widget restructuring (Step 3: Units/Packs/Matrix moved)
- Step 5 conditional rendering (Quantity vs Batch vs Batch+Expiry)
- Internal page navigation (Opening Stock → Outlet Allocation)
- State management for opening stock + outlet allocations
- Draft persistence across navigation
- Resume old draft behavior
- Outlet picker with authorization filtering
- Validation logic (qty/outlet match)

---

## 14. Validation Checklist (CHUNK 2 Complete)

✅ **Completed Validations:**

- [x] Exactly 6 main Product Setup steps in active canonical docs
- [x] Step 1 unchanged (Scan Barcode)
- [x] Step 2 unchanged (Basic Details)
- [x] Step 3 renamed to Product Type & Configuration
- [x] Simple Units/Packs owned by Step 3
- [x] Variant Configuration (Matrix) owned by Step 3
- [x] Simple reuses Step 1 primary barcode (do NOT duplicate)
- [x] Variant barcode rules: per-variant ownership (Step 1 may map to one)
- [x] Step 4 is Pricing & Tax (renumbered from Step 6)
- [x] Step 5 is Product Tracking (NEW location)
- [x] No "Track Stock Yes/No" toggle (replaced by method selection)
- [x] No visible "None" tracking option
- [x] Skip action exists (for no tracking)
- [x] Quantity → Opening Stock (separate page)
- [x] Quantity → Outlet Allocation (separate page)
- [x] Batch does NOT show Opening Stock
- [x] Batch does NOT show Outlet Allocation
- [x] Batch does NOT create quantity
- [x] Batch + Expiry does NOT show Opening Stock
- [x] Batch + Expiry does NOT show Outlet Allocation
- [x] Batch + Expiry does NOT create quantity
- [x] Batch initial details have explicit Skip action
- [x] Batch+Expiry requires both fields (no partial entry)
- [x] Expiry belongs to Batch (not Product master)
- [x] Step 6 Review is method-specific (Qty vs Batch vs Batch+Exp)
- [x] Future stock belongs to Inventory (not Product Setup)
- [x] No premature DB table design (marked PENDING)
- [x] No premature entitlement change (marked VERIFY)
- [x] Backend/Flutter implementation still marked pending

⏳ **Pending Validations** (CHUNK 3+):

- [ ] All cross-reference documents updated
- [ ] User journeys comprehensively updated
- [ ] Functional rules consolidated
- [ ] Permission matrix updated to 6-step
- [ ] Database docs updated with cross-refs
- [ ] No contradictions between any canonical docs
- [ ] Step 3 partial updates completed

---

## 15. Sign-Off

**CHUNK 2 STATUS:** ✅ COMPLETE

**Documentation Phase:** Second Brain canonical flow update complete.

**Next Phase:** Backend Implementation Audit (CHUNK 3).

**Outstanding Items:** Documented in § 12-14 above.

**Authority:**
- [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/CHUNK_1_AUDIT_CORRECTED_2026-09-20.md]] (Corrected audit)
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (Formal decision)

**Prepared By:** Claude Code (Documentation Phase, CHUNK 2)  
**Date:** 2026-09-20

---

## Appendix: File Reference Summary

### Main Contracts

1. **06_Tenant_Admin_Add_Product_6_Step_Contract.md** — NEW; canonical main wizard contract
2. **Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md** — NEW; Step 5 specification
3. **05_Tenant_Admin_Add_Product_7_Step_Contract.md** — SUPERSEDED; marked for historical reference

### Decisions

4. **PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md** — NEW; formal decision record

### To Be Updated in Later Phases

5. **Tenant_Admin_Product_Type_Tracking_Specification.md** — Requires full content update
6. **Tenant_Admin_Product_Units_Pack_Conversion_Specification.md** — Requires ownership transfer
7. **Tenant_Admin_Add_Product_Review_Create_Specification.md** — Requires renumbering + Tracking section
8. **Tenant_Admin_Add_Product_Draft_Lifecycle_Specification.md** — Requires step updates
9. **Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md** → **6_Step_Permission_Matrix.md** — Requires renaming + content update
10. **09_Product_Management_Flow.md** — Requires user journey update

---

**END OF CHUNK 2 COMPLETION REPORT**
