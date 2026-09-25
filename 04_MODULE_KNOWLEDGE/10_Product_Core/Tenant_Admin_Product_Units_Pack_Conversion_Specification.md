<!-- title: Tenant Admin Add Product — Step 3: SIMPLE Product Units & Pack Conversion Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-09-20 -->
<!-- supersedes: old_global_step4_units_pack_specification -->

# Tenant Admin Add Product — Step 3: SIMPLE Product Units & Pack Conversion Specification

> **UPDATED 2026-09-20:** Ownership moved from global **Step 4 (7-step wizard)** to **Step 3: Product Type & Configuration (6-step wizard)**.  
> Scope: SIMPLE Product type only.  
> Variant products do NOT expose Units/Packs configuration.  
> Decision: [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]].

## 1. Executive Summary & Core Architectural Principles

This document defines the canonical specification for **Units & Pack Conversion** configuration within **Step 3: Product Type & Configuration** of the 6-step Add Product Wizard, specifically for **SIMPLE Product types**.

### 1.1 Core Business Purpose
SIMPLE Product Units/Packs configuration defines how a product's base unit (e.g. 1 Bottle) can be grouped into optional packs (e.g. 6-Pack, Case of 24) for purchasing, selling, and inventory counting.

### 1.2 Supported Unit Models
SIMPLE Products support two distinct Unit Models:
1. **Base Unit Only (`SINGLE_UNIT`)**: The product is purchased, sold, and inventoried using one single Unit of Measure (UOM) (e.g. Piece, Each, Kilogram, Bottle). No packs configured.
2. **Base Unit with Packs (`MULTIPLE_UNITS`)**: The product has a base unit plus optional pack conversions (e.g. Base = 1 Bottle, Pack = 6 Bottles, Case = 24 Bottles).

### 1.3 Product-Specific Persistence Principle (CRITICAL INVARIANT)
- **Unit Configuration is PRODUCT-SPECIFIC**: Package sizes and conversion multipliers belong strictly to individual product records.
- **Example**: `Home Jersey` where `1 Pack = 6 units` does **NOT** mean every "Pack" in the tenant equals 6 units. `Socks` may define `1 Pack = 12 units`.
- **Architectural Invariant**: Store product-specific pack sizes in `product_unit_settings` and `product_unit_conversions`. The global `unit_of_measures` table stores standard UOM definitions (e.g. `PIECE`, `PACK`, `CASE`) only.

---

## 2. Step 3 Applicability & Configuration Rules

### 2.1 Scope: SIMPLE Product Type Only

**SIMPLE Products expose Units & Packs configuration in Step 3.**

**VARIANT Products do NOT expose Units & Packs configuration.**
- Variants inherit their parent's base unit definition (future decision if per-variant UOM overrides are needed).

### 2.2 User Journey (SIMPLE Product in Step 3)

```
Step 3: Product Type & Configuration
    ↓
Select SIMPLE Product
    ↓
Base Unit Selection
    ↓
This product has packs/cases? [OFF / ON]
    ↓
    
OFF → Base Unit only → SKU Configuration → Step 4 Pricing & Tax

ON → Add Packs (Pack Type, Pack Name, Contains, + Add Another)
   → SKU Configuration
   → Step 4 Pricing & Tax
```

### 2.3 Configuration Options

**Base Unit (REQUIRED):**
- Select from UOM Master (e.g. Piece, Bottle, Kilogram)
- Product-specific label (e.g. "Bottle")
- Product-specific size/volume (e.g. "500ml")

Example:
```
Base Unit: Piece
Label: Bottle
Size: 500ml

Meaning: 1 Bottle (500ml) = 1 Base Unit
```

**Packs/Cases (OPTIONAL):**

If "This product has packs/cases?" = OFF:
- No packs configured. Base Unit only.

If "This product has packs/cases?" = ON:
- User can add one or more pack rows:
  - Pack Type (e.g. Pack, Case, Box)
  - Pack Name (e.g. "6-Pack", "Case of 24")
  - Contains (e.g. "6 Bottles", "24 Bottles")
  - + Add Another Pack (allows multiple pack definitions)

Example:
```
Base: 1 Bottle (500ml)

Pack 1:
Type: Pack
Name: 6-Pack
Contains: 6 Bottles

Pack 2:
Type: Case
Name: Case of 24
Contains: 24 Bottles
```

**CRITICAL RULE:** Pack configurations are **PRODUCT-SPECIFIC**.
- Home Jersey: 1 Pack = 6 units
- Socks: 1 Pack = 12 units (different product, different pack size)
- Do NOT globally define "Pack = 6" in UOM master.

### 2.4 After Configuration

User proceeds to **SKU Configuration** (still in Step 3):
- Reuse Step 1 barcode if already scanned
- Display reused barcode clearly to avoid duplicate entry:
  ```
  Primary Barcode
  BC001
  Verified / Acquired [Step 1]
  ```
- Do NOT ask user to re-scan or re-type the same barcode
- Manual SKU entry or auto-population per existing rules

Then: **Save & Continue → Step 4 Pricing & Tax**

---

## 3. Variant Unit Inheritance Contract

### 3.1 Parent-Level Single Source of Truth

- Unit configuration is defined **ONCE** at the Parent Product level (in the parent product's structure).
- All generated variants inherit the exact same Unit Model (`SINGLE_UNIT` or `MULTIPLE_UNITS`) and conversion factors.
- Physical inventory ledgers reference the exact `product_variant_id` and maintain stock in the shared **Base Unit**.
- **Release 1 Limitation**: Per-variant UOM conversion overrides are NOT supported. Do NOT create product-specific unit settings per variant.

---

## 4. Product-Specific UOM Architecture

### 4.1 Global UOM Master vs. Product-Specific Conversions

**Global `unit_of_measures` table (Standard UOM Definitions):**
```
PIECE, EACH, BOTTLE
KILOGRAM, GRAM
LITER, MILLILITER
PACK, CASE, BOX, CARTON
```

**Product-Specific `product_unit_settings` & `product_unit_conversions` (Product-Level Configuration):**
```
Product: Home Jersey
  Base Unit: PIECE
  Pack 1: 1 PACK = 6 PIECES

Product: Socks
  Base Unit: PAIR
  Pack 1: 1 PACK = 12 PAIRS
  Pack 2: 1 CASE = 5 PACKS = 60 PAIRS
```

### 4.2 Validation Rules

1. Base Unit must exist in global UOM master.
2. Pack Type must exist in global UOM master.
3. Conversion factors (Contains) must be positive integers.
4. Pack configurations must be unique per product (no duplicate Pack Type + Name).

---

## 5. Related Documents

- [[06_Tenant_Admin_Add_Product_6_Step_Contract.md]] (main 6-step contract)
- [[Tenant_Admin_Step3_Product_Type_Configuration_Specification.md]] (Step 3 full specification)
- [[Tenant_Admin_Product_Identifier_SKU_Barcode_Specification.md]] (identifier rules)
- [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_6_STEP_RESTRUCTURING_DECISION_2026-09-20.md]] (decision)

---

**STATUS: Active Canonical Specification for Step 3 SIMPLE Product Configuration**

**SCOPE:** SIMPLE Products only. Units/Packs configuration moved from Step 4 (old wizard) to Step 3 (6-step wizard).

**DO NOT USE:** Old global Step 4 Unit & Pack rules as authority for Product Setup.
