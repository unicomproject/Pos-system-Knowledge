<!-- title: Tenant Admin Add Product — Step 3 Product Type & Configuration Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-20 -->
<!-- canonical_authority: 6-step wizard (not 7-step) -->

# Tenant Admin Add Product — Step 3 Product Type & Configuration Specification

## 1. Executive Summary

This document defines the canonical specification for **Step 3: Product Type & Configuration** in the 6-step Add Product Wizard.

Step 3 owns the product structure selection and type-specific configuration:

**SIMPLE Product:**
- Base Unit configuration
- Optional Packs/Cases configuration  
- SKU configuration (reuse Step 1 barcode)

**VARIANT Product:**
- Variant Matrix configuration (attributes, values, combinations)
- Include/Exclude variants
- Variant SKU/Barcode assignment

**Bundle:** LEGACY/DEFERRED (preserved in backend; not exposed in new UI unless separately approved)

**NOT in Step 3:**
- Tracking toggles (moved to Step 5)
- Initial Tracking Details (moved to Step 5)
- Pricing (moved to Step 4)

---

## 2. Canonical 6-Step Wizard Context

```
1. Scan Barcode
2. Basic Details
3. Product Type & Configuration
4. Pricing & Tax
5. Product Tracking
6. Review & Create
```

Step 3 is the structural configuration step.

Tracking policy belongs to Step 5 (optional).

---

## 3. Product Type Selection

### Active Product Types

```
Simple Product
Variant Product
```

### LEGACY / DEFERRED

```
Bundle / Kit
```

Preserve backend/data capability. Do not expose Bundle in new Product Setup UI unless separately approved.

---

## 4. SIMPLE Product Configuration

### Flow

```
Select: Simple Product
        ↓
Base Unit
        ↓
Packs / Cases Configuration
        ↓
SKU Configuration
        ↓
Reuse Step 1 Primary Barcode
        ↓
Step 4 Pricing & Tax
```

### Base Unit

Use existing UOM Master.

**Fields:**
- Unit Type (from global UOM master)
- Unit Label (product-specific, e.g. "Bottle")
- Unit Name / Size (product-specific, e.g. "500ml")

**Meaning:**
```
1 Bottle (500ml) = 1 Base Unit
```

Do NOT perform inventory calculations here. Base Unit is purely structural configuration.

### Packs / Cases (Optional)

**Selection:**
```
This product has packs/cases?
[OFF / ON]
```

**If OFF:**
Base Unit only. No packs configured.

**If ON:**
Add one or more pack conversions:

```
Pack Type: [Case / Box / Pack / etc.]
Pack Name: [Case of 24]
Contains: [24 Bottles]

+ Add Another Pack
```

**Critical Rule:**
Conversions are PRODUCT-SPECIFIC.

Do NOT globally define "Case = 24" because another Product may use "Case = 12".

**Multi-Pack Support:**
Reuse existing UOM conversion architecture. Support multiple pack rows if existing structure permits.

Example:
```
Base: 1 Bottle

Pack: 1 Pack = 6 Bottles
Case: 1 Case = 24 Bottles
```

### SKU Configuration

**Critical Rule:**
If Step 1 acquired a primary barcode, REUSE it.

Do NOT ask the user to scan/type the same barcode again.

**UI Display:**
```
Primary Barcode
479xxxxxxxxx
Verified / Acquired [Step 1]
```

**SKU Entry:**
Manual entry or auto-populated according to existing Product Setup rules.

**Optional Pack Barcodes:**
According to existing identifier architecture, pack/case barcodes may be optional.

Example:
```
Product Barcode: BC001
6-Pack Barcode: BC002 (optional)
Case Barcode: BC003 (optional)
```

---

## 5. VARIANT Product Configuration

### Flow

```
Select: Variant Product
        ↓
Select Attributes
        ↓
Select Attribute Values
        ↓
Generate Variant Combinations
        ↓
Include / Exclude Variants
        ↓
Assign SKU / Barcode per Variant
        ↓
Step 4 Pricing & Tax
```

### Reuse Existing Architecture

Do NOT rebuild:
- Attribute templates
- Attribute values
- Variant generation (Cartesian product)
- Combination uniqueness
- Include/Exclude variant UI
- Variant draft reconciliation
- Existing validations

Move existing variant configuration responsibility from previous Step 5 into Step 3.

### Variant SKU & Barcode

Each sellable Variant owns its own identifier.

**Example:**
```
Product: Baby Soap 90g

Variants:
Almond
Lavender
Aloe Vera
```

**Barcode Mapping (Step 1 → Step 3):**

If Step 1 scanned the Almond barcode:
```
Almond → Reuse Step 1 barcode (do NOT re-scan)
Lavender → Assign own barcode if available
Aloe Vera → Assign own barcode if available
```

Do NOT ask Almond barcode twice.

Preserve existing SKU/barcode tenant-wide uniqueness rules.

---

## 6. WHAT IS NOT IN STEP 3

### Tracking Toggles (Moved to Step 5)

Do NOT show:
```
Track Inventory toggle
Batch Tracking toggle
Expiry Tracking toggle
Serial Tracking toggle
```

Tracking policy belongs to Step 5 (optional).

### Initial Tracking Details (Moved to Step 5)

Do NOT collect:
```
Initial Batch Number
Initial Expiry Date
Initial Serial Number
```

These belong to Step 5 Product Tracking.

### Pricing (In Step 4)

Do NOT collect selling prices or tax class here.

### Bundle Active Card

Do NOT expose Bundle as an active third product type selection card.

Bundle is LEGACY/DEFERRED.

---

## 7. Navigation Rules

After Step 3 configuration:

```
All products (SIMPLE/VARIANT)
    ↓
Step 4 Pricing & Tax
```

No conditional bypass of Step 4 based on tracking.

Tracking decisions happen at Step 5 (optional).

---

## 8. Permissions

**Required:**

```
catalog.products.create (fresh draft)
OR
catalog.products.update (edit published)
```

**Step 3 Variant-specific:**

```
catalog.variants.manage
```

**Step 3 Identifier-specific:**

```
catalog.barcodes.manage
```

**Entitlement:**

```
product_catalog
```

---

## 9. Implementation Notes

### Product Type Selection is Mandatory

User MUST explicitly select SIMPLE or VARIANT.

Save & Continue is blocked until type is selected.

### Bundle Backward Compatibility

If existing Backend system has published BUNDLE products:

- Preserve Bundle backend capability
- Do not expose Bundle in new Step 3 UI
- Mark as LEGACY/DEFERRED
- Document future decision requirement if Bundle must re-enter Product Setup

---

## 10. Related Documents

- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main 6-step contract)
- [[Tenant_Admin_Add_Product_Step5_Product_Tracking_Specification.md]] (Step 5)
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification.md]] (reused UOM architecture)
- [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification.md]] (identifier rules)
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (decision)

---

**STATUS: Active Canonical Specification for 6-Step Wizard**

**SUPERSEDES:** Old "Product Type & Tracking" (Step 3) with embedded Step 4 Units

**DO NOT use:** 7-step wizard contracts as authority
