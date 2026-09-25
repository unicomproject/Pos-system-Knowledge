<!-- title: Product Setup 6-Step Restructuring Decision -->
<!-- status: Active -->
<!-- decision_date: 2026-09-20 -->
<!-- authority: Platform Architects + Product Setup Owner -->
<!-- affected_systems: Product Setup Wizard, Inventory Ledger, Product Core, Pricing, Audit -->

# Product Setup 6-Step Restructuring Decision

**DATE:** 2026-09-20  
**STATUS:** APPROVED  
**SCOPE:** OneVerz POS MVP Unified Commerce (Product Setup Wizard)  
**IMPACT:** Functional + Documentation restructuring; Backend/Flutter implementation required  

---

## 1. Decision Summary

The Tenant Admin Add Product Wizard is restructured from a 7-step flow to a 6-step flow.

**Previous 7-Step Flow (Superseded 2026-09-20):**
```
1. Scan Barcode
2. Basic Details
3. Product Type & Tracking
4. Unit & Pack Conversion
5. Product Configuration
6. Pricing & Tax
7. Review & Create
```

**New 6-Step Flow (Approved 2026-09-20):**
```
1. Scan Barcode
2. Basic Details
3. Product Type & Configuration
4. Pricing & Tax
5. Product Tracking
6. Review & Create
```

---

## 2. Rationale

### 2.1 Primary Motivation

**Reduce Wizard Complexity:**

The previous 7-step flow created confusion by mixing structural configuration (Product Type) with inventory policy (Tracking toggles) on the same step, and by placing product configuration spread across Step 3 (policy), Step 4 (units), Step 5 (matrix/identifiers), and Step 6 (pricing).

**Consolidate Configuration by Product Type:**

The new structure consolidates type-specific configuration into Step 3:
- Simple Product: Base Unit + Packs + SKU in one step
- Variant Product: Matrix + Variant SKU in one step

**Separate Product Policy from Tracking Policy:**

Tracking toggles and initial identity setup belong to **operational inventory requirements**, not product structure.

Moving these to Step 5 as an **optional** step makes the distinction clear:
- Product Setup owns **onboarding workflow**
- Inventory owns **operational state**

**Rationalize Unit Ownership:**

Units were a separate mandatory Step 4 for all tracked products.

New model:
- SIMPLE: Units configured inline with structure (Step 3)
- VARIANT: Units handled at variant level or deferred to operational stock management
- BUNDLE: Skipped (component-based)

This eliminates a standalone step and makes Unit configuration context-aware.

---

## 2.2 Business Benefits

1. **Simpler User Journey:**
   - Fewer total steps (6 vs 7)
   - Clearer conceptual grouping
   - Optional Product Tracking step (users who don't need tracking skip entirely)

2. **Clear Ownership Boundaries:**
   - Product Setup: Product identity + initial tracking **option**
   - Inventory: Stock ledger + ongoing operations

3. **Reduced Cognitive Load:**
   - Product structure and configuration grouped together
   - Pricing and tax together
   - Tracking as optional separate concern

4. **Scalability:**
   - Easy to add future tracking methods without disrupting structure configuration
   - Optional steps can be extended without impacting core product creation

---

## 3. Key Structural Changes

### 3.1 Step 3 — "Product Type & Configuration" (Renamed, Content Added)

**Previous:** Product Type & Tracking (Step 3) + Unit & Pack (Step 4)

**New:** Product Type & Configuration (Step 3) — consolidated ownership

| Content | Previous | New | Change |
|---|---|---|---|
| Product Type selection | Step 3 | Step 3 | Same |
| Tracking toggles | Step 3 | MOVED to Step 5 | Removed from Step 3 |
| Initial Tracking identity | Step 3 | MOVED to Step 5 | Removed from Step 3 |
| Base Unit (SIMPLE) | Step 4 | Step 3 | Moved up (SIMPLE only) |
| Packs/Cases (SIMPLE) | Step 4 | Step 3 | Moved up (SIMPLE only) |
| SKU/Barcode reference | Step 5 | Step 3 (context) | Reuse Step 1; Step 3 owns context |
| Variant Matrix | Step 5 | Step 3 | Moved up |
| Variant SKU/Barcode | Step 5 | Step 3 | Moved up |

**Rationale:** Consolidates all structure-specific configuration in one step, reducing navigation and cognitive load.

---

### 3.2 Step 4 — "Pricing & Tax" (Renumbered, Content Unchanged)

**Previous:** Step 6

**New:** Step 4 (renumbered)

No functional change. Selling price, tax class, inclusive/exclusive remain the same.

**Rationale:** Moved up in sequence (was Step 6) to support Step 5 Product Tracking option.

---

### 3.3 Step 5 — "Product Tracking" (NEW Location, NEW Optional Behavior)

**Previous:** No equivalent (tracking was bundled into Step 3; initial identity was Step 3)

**New:** Step 5 (optional)

**Content:**

- Tracking Method selection: Quantity / Batch / Batch+Expiry / Skip
- Quantity-only: Opening Stock + Outlet Allocation
- Batch: Initial Batch identity (optional)
- Batch+Expiry: Initial Batch + Expiry identity (optional)

**Behavior:**

- **Entirely optional** — user may Skip to Step 6
- Skip = no tracking configured for this product
- Only Quantity method creates actual stock
- Batch and Batch+Expiry are identity/traceability only

**Rationale:**

- Separates product **structure** (Steps 1-4) from product **operational policy** (Step 5)
- Makes tracking optional, reducing barriers for simple inventory-free products
- Clarifies that Quantity is the only stock-creating Product Setup path

---

### 3.4 Step 6 — "Review & Create" (Renumbered, Content Updated)

**Previous:** Step 7

**New:** Step 6 (renumbered)

**Added Content:**

- Method-specific Product Tracking summary

**Rationale:** Updated to show all 6 steps. Tracks the optional Step 5 output if present.

---

## 4. Approved Product Types

### 4.1 Active Scope

**Active in new Product Setup UI:**
- Simple Product
- Variant Product

**Status:** LOCKED for current 6-step Product Setup restructuring.

### 4.2 Bundle / Kit (Deferred)

**Current Status:** LEGACY / DEFERRED

**Rationale:**

Bundle was a supported product type in the previous 7-step wizard. However:
- Bundle inventory is component-based (not a first-class stock entity)
- Bundle integration complexity is higher than Simple/Variant
- Current approval scope focuses on Simple/Variant workflow

**Decision:**

Do NOT delete Bundle backend capability or existing data.

DO NOT expose Bundle in new Step 3 Product Type & Configuration UI by default.

IF a future requirement explicitly approves Bundle in Product Setup UI, that is a separate decision.

For now, Bundle is preserved but deferred from the new 6-step UI.

**Backward Compatibility:**

Existing Bundle products continue to operate in Inventory.

Existing Bundle drafts (if any) must be handled during implementation (e.g., resume behavior, data migration).

---

## 5. Quantity Tracking — Only Stock-Creating Path

### 5.1 Decision (LOCKED)

Quantity is the **ONLY** Product Setup tracking path that initializes actual stock.

### 5.2 Rationale

**Clarity:** Inventory operations (Receive Stock, Stock Transfer, Adjustments) handle all future stock. Product Setup initializes a baseline only.

**Separation of Concerns:** Opening Stock is an exception (allowed in Product Setup as convenience for initial product onboarding). All other stock operations belong to Inventory module.

**Simplicity:** Batch and Batch+Expiry do not create quantity, reducing implementation complexity and avoiding accidental quantity creation.

### 5.3 Flow

```text
Step 5: Quantity
→ Opening Stock (enter quantity per product/variant)
→ Outlet Allocation (distribute to outlets)
→ At publish: creates stock_movements + inventory_balances

Step 5: Batch or Batch+Expiry
→ Initial Batch identity only
→ NO quantity creation
→ NO Outlet Allocation
→ At publish: creates product_batches record only
```

### 5.4 Future Stock Ownership

**LOCKED Rule:**

After Product is created, all future stock operations belong to **Inventory module exclusively**.

Product Setup must NOT be used for ongoing stock management.

---

## 6. Batch / Batch+Expiry — Identity-Only Tracking

### 6.1 Decision (LOCKED)

Batch and Batch+Expiry tracking are **identity and traceability configuration only**.

They do NOT create:
- On-hand quantity
- Outlet balances
- Stock movements
- Cost layers

### 6.2 Rationale

**Product Setup is Onboarding, Not Ongoing Management:**

Initial Batch identity may be useful to capture at product creation for traceability/regulatory compliance.

But the actual Batch stock ledger is created when stock is received through Inventory.

**Avoid Premature Commitment:**

Not all Batch products will have opening stock. Deferring Batch stock creation to Inventory Receive Stock avoids confusing scenarios where Batch is configured but no stock exists.

---

## 7. Serial / IMEI — Deferred

### 7.1 Current State

Serial was supported in the previous 7-step wizard as optional initial tracking.

### 7.2 Target Decision

Remove Serial from new Step 5 Product Tracking UI.

### 7.3 Rationale

Serial tracking is complex and less commonly used than Quantity/Batch.

Focusing the new 6-step wizard on core use cases (Quantity/Batch/Batch+Expiry) reduces scope and increases clarity.

### 7.4 Backward Compatibility

Do NOT delete:
- `product_setup_initial_tracking.initial_serial_number` column
- `serial_numbers` table
- Existing Serial policy products

Preserve existing Inventory Serial operations.

**Future Enhancement:** Serial support for Product Setup is a separate decision.

**Resume Behavior:** Handle gracefully when old drafts with Serial values are resumed in new UI (mark as legacy, preserve data).

---

## 8. Variant Product Structure

### 8.1 Configuration Consolidation

Variant Matrix (previously Step 5 Product Configuration) is now consolidated into Step 3 Product Type & Configuration.

### 8.2 Attribute Reuse

Do NOT rebuild Variant attribute system.

Reuse existing:
- Attribute templates
- Attribute values
- Cartesian combination generation
- Include/Exclude variant UI
- Draft reconciliation

### 8.3 Variant SKU/Barcode

Each sellable Variant owns its own identifier.

Step 1 primary barcode, if scanned for a specific variant, is mapped to that variant.

Other variants assign their own barcodes.

Do NOT duplicate barcode entry.

---

## 9. Simple Product — Barcode Reuse Rule

### 9.1 Decision (LOCKED)

If Step 1 acquired a primary barcode, Step 3 Simple Product configuration must reuse it.

Do NOT ask the user to scan/type the same barcode again.

### 9.2 Rationale

**User Experience:** Avoid duplicate data entry. The barcode was already acquired in Step 1.

**Data Integrity:** Single source of truth for primary identifier.

### 9.3 UI Rendering

```text
Primary Barcode
479xxxxxxxxx
Verified / Acquired [Step 1]
```

Example action (optional):
- Edit (if architecture supports safe barcode replacement)
- Or: read-only display with no edit option

---

## 10. Permissions & Entitlements — Unchanged Base, Verify Quantity

### 10.1 Existing Permissions (Unchanged)

```text
catalog.products.create (Product Setup draft + save)
catalog.products.update (Edit published products)
catalog.products.publish (Final publish)
catalog.variants.manage (Variant configuration — now Step 3)
catalog.barcodes.manage (SKU/Barcode configuration)
catalog.product_pricing.manage (Pricing — Step 4)
product_catalog (Feature entitlement)
```

### 10.2 Quantity Opening Stock (Requires Verification)

**Approved Permission (if exists):**

```text
tenant.stock.opening (for actual Opening Stock mutation)
```

**Outlet Scope:**

User must be authorized for the outlets they allocate stock to.

Backend is authoritative.

**Entitlement Status:**

```text
VERIFY DURING BACKEND IMPLEMENTATION:
Does inventory_tracking also gate Quantity opening stock?
Or is it only for Batch/Expiry/Serial policy?
```

Do not assume; verify existing semantics.

### 10.3 Initial Tracking Identity

**For non-empty Batch/Batch+Expiry initial values:**

```text
inventory_tracking entitlement (if required)
```

**Status:**

```text
VERIFY DURING BACKEND IMPLEMENTATION
```

---

## 11. Implementation Status

### 11.1 This Decision Covers

- Approved target 6-step flow (functional specification)
- Ownership consolidation (Steps 1-6)
- Product Type selection (SIMPLE / VARIANT active; Bundle deferred)
- Quantity-only stock creation
- Batch/Batch+Expiry as identity-only
- Serial as deferred
- Permissions & entitlements (to be verified in implementation)

### 11.2 Implementation Audit (PENDING)

The following must be completed during Backend/Flutter implementation audit:

**Backend:**
1. Database constraint change: `current_setup_step` (1-7 → 1-6)
2. Migration strategy for existing Step 7 drafts
3. Quantity opening stock draft persistence design (JSONB vs new table)
4. Entitlement semantics verification (inventory_tracking scope)
5. Permission verification (tenant.stock.opening existence)
6. Resume behavior for Serial legacy drafts
7. Outlet authorization validation

**Flutter:**
1. Widget restructuring (Step 3 adds Units/Packs + Variant Matrix)
2. Step 5 conditional rendering (Quantity vs Batch vs Batch+Expiry)
3. Internal page navigation (Opening Stock → Outlet Allocation)
4. State management for opening stock + outlet allocations
5. Backward-compatibility for old draft resume

**Shared:**
1. DTO schema updates (Step 5 payload)
2. API payload shape verification
3. Test matrix updates (6-step test cases)

### 11.3 Documentation Status

**SECOND BRAIN (This Phase):**
- ✅ New 6-step main contract created
- ✅ Step 5 Product Tracking specification created
- ✅ Step 3 Product Type & Configuration specification updated
- ✅ Decision record created (this document)
- ⏳ User journey updated (PENDING)
- ⏳ Other cross-references updated (PENDING)

**BACKEND IMPLEMENTATION:** NOT YET STARTED

**FLUTTER IMPLEMENTATION:** NOT YET STARTED

---

## 12. Superseded Documents

| Document | Status | Replacement |
|---|---|---|
| `05_Tenant_Admin_Add_Product_7_Step_Contract.md` | SUPERSEDED | `06_Tenant_Admin_Add_Product_6_Step_Contract.md` |
| Old Step 3 (Product Type & Tracking) combined with Step 4 (Units) | CONSOLIDATED | `Tenant_Admin_Product_Type_Tracking_Specification.md` (renamed Product Type & Configuration) |
| Old Step 5 (Product Configuration identifiers) | MOVED UP | Step 3 Product Type & Configuration |
| Old Step 6 (Pricing & Tax) | RENUMBERED | Step 4 Pricing & Tax |
| Old Step 7 (Review & Create) | RENUMBERED | Step 6 Review & Create |

---

## 13. Backward Compatibility Considerations

### 13.1 Existing Products

Published (ACTIVE) products with:
- 7-step step_progress values
- Existing tracking policy
- Existing batch/serial data

**Impact:** NONE — published products not affected by wizard restructuring.

### 13.2 Existing Drafts

Existing DRAFT products at various steps:

**Step 1-3 drafts:** Normal resume in new 6-step wizard (no migration needed)

**Step 4 (Units) drafts:** 
- If SIMPLE: Unit config remains; resume at new Step 3 (or migrate units into new Step 3 config)
- If VARIANT: Unit config deferred; resume at new Step 3

**Step 5 (Product Configuration) drafts:**
- Migrate to new Step 3 (Variant Matrix / identifiers)

**Step 6 (Pricing) drafts:**
- Migrate to new Step 4

**Step 7 (Review) drafts:**
- Migrate to new Step 6

**Migration Strategy:**

```text
PENDING BACKEND IMPLEMENTATION AUDIT
```

### 13.3 Serial Legacy Drafts

Existing drafts with `initial_serial_number` values:

**Impact:** Preserved but marked LEGACY when resumed in new UI.

Do NOT delete Serial data.

---

## 14. Risk Summary

| Risk | Mitigation | Owner |
|---|---|---|
| Existing Step 7 drafts break on migration | Design safe migration logic; test resume | Backend |
| Opening stock not atomic | Transactional consistency in publish | Backend |
| Outlet authorization bypass | Backend validates; Flutter is UX only | Backend + Security |
| Duplicate opening stock on retry | Use idempotency model | Backend |
| Serial legacy data lost | Preserve columns; handle on resume | Backend |
| Variant configuration regression | Reuse existing architecture | Frontend + Backend |

---

## 15. Sign-Off

**Decision Authority:** Platform Architects + Product Setup Owner  
**Date Approved:** 2026-09-20  
**Effective Date:** 2026-09-20 (Second Brain documentation)  
**Implementation Deadline:** PENDING resource planning  

---

**Next Steps:**

1. Update remaining Second Brain cross-references (user journeys, functional rules, database docs)
2. Create Backend implementation audit plan
3. Create Flutter implementation audit plan
4. Create 6-step test matrix
5. Begin backend + Flutter work against updated Second Brain

---

**Authority References:**

- [[../../../15_IMPLEMENTATION_TRACKING/99_AUDITS/CHUNK_1_AUDIT_CORRECTED_2026-09-20.md]] (Corrected audit baseline)
- [[PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11.md]] (Previous scanner-first decision)
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (Updated main contract)
