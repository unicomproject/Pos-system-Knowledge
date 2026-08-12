# Tenant Admin Add Product — Step 3: Units & Pack Conversion Specification

<!-- title: Tenant Admin Add Product — Step 3: Units & Pack Conversion Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

## 1. Executive Summary & Core Architectural Principles

This document defines the final canonical Second Brain specification for **Step 3: Units & Pack Conversion** within the Tenant Admin **Add Product Wizard**.

### 1.1 Core Business Purpose
Step 3 defines how a product is **purchased**, **sold**, and **counted** in inventory stock ledgers. It bridges supplier receiving (purchase units), internal warehouse counting (base stock units), POS cashier checkout (selling units), and online ordering.

### 1.2 Supported Unit Models
Step 3 supports two distinct Unit Models:
1. **Single Unit Only (`SINGLE_UNIT`)**: The product is bought, sold, and inventoried using one single Unit of Measure (UOM) (e.g. Piece, Each, Kilogram). No conversion multipliers are applied.
2. **Multiple Units & Pack Conversion (`MULTIPLE_UNITS`)**: The product has a multi-tier package hierarchy (e.g. Base Unit = Piece, Purchase Unit = Pack of 6 Pieces, Outer Pack Unit = Carton of 12 Packs / 72 Pieces).

### 1.3 Product-Specific Persistence Principle (CRITICAL INVARIANT)
- **Unit Configuration is PRODUCT-SPECIFIC**: Package sizes and conversion multipliers belong strictly to individual product records (`product_unit_settings` and `product_unit_conversions`).
- **Example**: `Home Jersey` where `1 Pack = 6 Pieces` does **NOT** mean every "Pack" in the tenant equals 6 pieces. `Socks` may define `1 Pack = 12 Pieces`.
- **Architectural Invariant**: Never store a product-specific pack size as a global UOM conversion rule in `unit_of_measures`. The global `unit_of_measures` table stores standard UOM definitions (e.g. `PCS`, `PK`, `CTN`), while product-specific conversion multipliers are stored in `product_unit_settings` and `product_unit_conversions`.

---

## 2. Step Applicability & Navigation Matrix

### 2.1 Applicability Rules
1. **SIMPLE Product + Track Inventory ON (`is_stock_tracked = true`)**:
   - Step 3 is **REQUIRED**.
   - Step 4 (`Product Configuration`) is **NOT_APPLICABLE** (bypassed).
   - Save & Continue from Step 3 targets **Step 5** (`Barcode & SKU`).
2. **VARIANT Product + Track Inventory ON (`is_stock_tracked = true`)**:
   - Step 3 is **REQUIRED** at Parent Product level. All variants inherit the parent unit configuration.
   - Step 4 (`Product Configuration`) is **REQUIRED** (Variant options & matrix generation).
   - Save & Continue from Step 3 targets **Step 4**.
3. **SIMPLE Product + Track Inventory OFF (`is_stock_tracked = false`)**:
   - Step 3 is **NOT_APPLICABLE** (auto-bypassed).
   - Step 4 is **NOT_APPLICABLE** (auto-bypassed).
   - Save & Continue from Step 2 targets **Step 5** (`Barcode & SKU`).
4. **VARIANT Product + Track Inventory OFF (`is_stock_tracked = false`)**:
   - Step 3 is **NOT_APPLICABLE** (auto-bypassed).
   - Step 4 is **REQUIRED** (Variant options & matrix generation).
   - Save & Continue from Step 2 targets **Step 4**.
5. **BUNDLE / Kit Product (`product_structure = BUNDLE`)** — **RELEASE 1 CANONICAL RULE**:
   - Release 1 Bundle parents own **no physical stock**, use **component-based inventory**, and have **no parent stock UOM**.
   - Parent tracking flags are forced `false` (`is_stock_tracked = false`, `requires_batch_tracking = false`, `requires_expiry_tracking = false`, `requires_serial_tracking = false`).
   - Step 3 is **NOT_APPLICABLE / AUTO_COMPLETED** for Bundle parents. No parent pack conversions exist in Release 1.
   - Step 4 (`Product Configuration`) is **REQUIRED** (Kit component assembly).
   - Save & Continue from Step 2 targets **Step 4**.

### 2.2 Canonical Applicability & Navigation Matrix Table

| Product Structure (`product_structure`) | Track Inventory (`is_stock_tracked`) | Step 3 Status | Step 4 Status | Save & Continue Target from Step 2 | Save & Continue Target from Step 3 |
|---|---|---|---|---|---|
| `SIMPLE` | `true` (ON) | **REQUIRED** | `NOT_APPLICABLE` (Skipped) | **Step 3** | **Step 5** (Barcode & SKU) |
| `VARIANT` | `true` (ON) | **REQUIRED** | `REQUIRED` | **Step 3** | **Step 4** (Product Configuration) |
| `BUNDLE` | `false` (Forced) | **NOT_APPLICABLE** | `REQUIRED` | **Step 4** (Product Configuration) | N/A (Step 3 auto-bypassed) |
| `SIMPLE` | `false` (OFF) | **NOT_APPLICABLE** | `NOT_APPLICABLE` (Skipped) | **Step 5** (Barcode & SKU) | N/A (Step 3 auto-bypassed) |
| `VARIANT` | `false` (OFF) | **NOT_APPLICABLE** | `REQUIRED` | **Step 4** (Product Configuration) | N/A (Step 3 auto-bypassed) |

> [!IMPORTANT]
> **Backend Navigation Resolver Authority**: Frontend MUST NOT determine step navigation or bypass logic independently using `currentStep + 1`. The backend API response from `Save & Continue` evaluates product structure and inventory tracking to return the authoritative `targetSetupStep`.

---

## 3. Variant Unit Inheritance Contract

### 3.1 Parent-Level Single Source of Truth
- Unit configuration is defined **ONCE** at the Parent Product level in Step 3 (`product_unit_settings` where `product_id = ProductId`, `product_variant_id = NULL`).
- All generated variants inherit the exact same Unit Model (`SINGLE_UNIT` or `MULTIPLE_UNITS`) and conversion factors.
- Physical inventory ledgers (`inventory_balances`, `stock_movements`, `product_batches`, `serial_numbers`) reference the exact `product_variant_id` and maintain stock in the shared **Base Unit** (`product_variants.stock_uom_id = base_uom_id`).
- Default variant sales UOM maps to `product_variants.sales_uom_id = selling_uom_id`.
- **Release 1 Limitation**: Per-variant UOM conversion overrides are NOT supported. Do NOT create `product_unit_settings` rows per variant.

---

## 4. Selling Unit Conversion Rule (BLOCKER RESOLVED)

### 4.1 UI Input Surface Boundary
Step 3 provides input fields for:
- Base Unit
- Selling Unit
- Purchase Unit
- Items per Purchase Unit
- Outer Pack Unit (Optional)
- Purchase Units per Outer Pack (Conditional)

Step 3 does **NOT** expose a separate "Items per Selling Unit" text field.

### 4.2 Canonical Selling Unit Constraint
To ensure deterministic conversion to Base Unit without guessing unconfigured multipliers:
- **Rule**: The selected **Selling Unit** MUST be one of the configured conversion tiers:
  1. **Base Unit** ($\text{conversionToBaseFactor} = 1.0$)
  2. **Purchase Unit** ($\text{conversionToBaseFactor} = \text{itemsPerPurchaseUnit}$)
  3. **Outer Pack Unit** (when Outer Pack exists) ($\text{conversionToBaseFactor} = \text{itemsPerPurchaseUnit} \times \text{purchaseUnitsPerOuterPack}$)

### 4.3 Validator Enforcement & Failure Contract
If a user selects a Selling Unit that does not match the Base Unit, Purchase Unit, or Outer Pack Unit:
- Backend validator `ValidateUnitsPackConversionContinue` rejects the request.
- Returns HTTP 400 with field error:
  `{ "field": "sellingUnitId", "code": "unit.selling_unit_must_match_configured_tier", "message": "Selling Unit must match Base Unit, Purchase Unit, or Outer Pack Unit." }`

### 4.4 Conversion Row Flag Mapping
In `product_unit_conversions`:
- The row matching `selling_uom_id` sets `is_selling_unit = true`.
- If `Selling Unit == Base Unit`, the Base Unit row sets `is_base_unit = true` AND `is_selling_unit = true`.

---

## 5. Unit Model Specifications

### 5.1 Single Unit Only (`SINGLE_UNIT`)
- **Fields**:
  - `unitModel`: `SINGLE_UNIT`
  - `productUnitId` *: Required UOM selection from UOM option source.
  - `allowDecimalQuantity`: Boolean toggle (`true` / `false`).
- **Derived Values**:
  - `baseUomId` = `productUnitId`
  - `purchaseUomId` = `productUnitId`
  - `sellingUomId` = `productUnitId`
  - `inventoryUomId` (Stock Counting UOM in `product_inventory_settings`) = `productUnitId`
  - `outerPackUomId` = `NULL`, `itemsPerPurchaseUnit` = `1.0`, `purchaseUnitsPerOuterPack` = `NULL`.
- **Persisted Conversions**: 1 row in `product_unit_conversions` (`unit_level = 'BASE'`, `conversion_to_base_factor = 1.0`, `is_base_unit = true`, `is_selling_unit = true`, `is_purchase_unit = true`).

### 5.2 Multiple Units & Pack Conversion (`MULTIPLE_UNITS`)
- **Fields**:
  - `unitModel`: `MULTIPLE_UNITS`
  - `baseUnitId` *: Mandatory Base UOM (e.g. Piece).
  - `sellingUnitId` *: Mandatory Selling UOM (must match Base, Purchase, or Outer Pack).
  - `purchaseUnitId` *: Mandatory Purchase UOM (must differ from Base Unit).
  - `itemsPerPurchaseUnit` *: Mandatory multiplier > 0.
  - `outerPackUnitId`: Optional Outer Pack UOM (e.g. Carton).
  - `purchaseUnitsPerOuterPack`: Mandatory multiplier > 0 if Outer Pack selected.
  - `allowDecimalQuantity`: Boolean toggle.
- **Conversion Mathematics**:
  $$\text{purchaseToBaseFactor} = \text{itemsPerPurchaseUnit}$$
  $$\text{outerPackToBaseFactor} = \text{itemsPerPurchaseUnit} \times \text{purchaseUnitsPerOuterPack}$$

---

## 6. Decimal Quantity & Integral Conversion Consistency

### 6.1 Recommended UOM Defaults
- Discrete UOMs (`PCS`, `EACH`, `PR`, `PK`, `CTN`, `BOX`): Default `allowDecimalQuantity = false`.
- Weight/Volume/Length UOMs (`KG`, `G`, `L`, `ML`, `M`): Default `allowDecimalQuantity = true`.

### 6.2 Integral Conversion Factor Constraint
- **Rule**: When `allowDecimalQuantity = false`, every effective `conversionToBaseFactor` MUST be a whole integral number ($\text{factor} \pmod 1 = 0$).
- **Example Rejection**: A multiplier of `1 Pack = 2.5 Pieces` when `allowDecimalQuantity = false` is REJECTED by backend validation (`400 unit.fractional_conversion_requires_decimal_quantity`).
- **Precision & Scale**: Stored using C# `decimal` and PostgreSQL `numeric(18,4)`. Maximum factor value is `99999999994.9999`.

---

## 7. Save Draft Nullability & Draft Architecture

### 7.1 Architecture Principle
`Save Draft` (`wizardAction = "SAVE_DRAFT"` or `advanceStep = false`) allows saving incomplete progress without blocking the user. `Save & Continue` (`wizardAction = "SAVE_AND_CONTINUE"` or `advanceStep = true`) enforces complete validation.

### 7.2 Database Nullability for `product_unit_settings`

| Column Name | Data Type | DB Nullability | Save Draft (`SAVE_DRAFT`) | Save & Continue (`SAVE_AND_CONTINUE`) | Notes |
|---|---|---|---|---|---|
| `unit_model` | `varchar(40)` | **NOT NULL** | Defaults to `'SINGLE_UNIT'` if omitted | Required enum (`SINGLE_UNIT` / `MULTIPLE_UNITS`) | Primary model flag |
| `base_uom_id` | `uuid` | **NULLABLE** | Optional (can be NULL) | **REQUIRED** | Base inventory unit |
| `selling_uom_id` | `uuid` | **NULLABLE** | Optional (can be NULL) | **REQUIRED** | Must match configured tier |
| `purchase_uom_id` | `uuid` | **NULLABLE** | Optional (can be NULL) | **REQUIRED** (in `MULTIPLE_UNITS`) | Purchase unit |
| `outer_pack_uom_id` | `uuid` | **NULLABLE** | Optional | Optional (Required if factor given) | Outer packaging |
| `items_per_purchase_unit` | `numeric(18,4)` | **NULLABLE** | Optional | **REQUIRED > 0** (in `MULTIPLE_UNITS`) | Pack multiplier |
| `purchase_units_per_outer_pack` | `numeric(18,4)` | **NULLABLE** | Optional | **REQUIRED > 0** (if Outer Pack set) | Outer pack multiplier |
| `allow_decimal_quantity` | `boolean` | **NOT NULL** | Default `false` | Required | Fractional switch |

---

## 8. Database Schema & Integrity Contract

### 8.1 Table `product_unit_settings`

```sql
CREATE TABLE product_unit_settings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_model VARCHAR(40) NOT NULL CHECK (unit_model IN ('SINGLE_UNIT', 'MULTIPLE_UNITS')),
    base_uom_id UUID NULL REFERENCES unit_of_measures(id),
    selling_uom_id UUID NULL REFERENCES unit_of_measures(id),
    purchase_uom_id UUID NULL REFERENCES unit_of_measures(id),
    outer_pack_uom_id UUID NULL REFERENCES unit_of_measures(id),
    items_per_purchase_unit NUMERIC(18,4) NULL,
    purchase_units_per_outer_pack NUMERIC(18,4) NULL,
    allow_decimal_quantity BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL,
    created_by_tenant_user_id UUID NULL REFERENCES tenant_users(id),
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by_tenant_user_id UUID NULL REFERENCES tenant_users(id),

    CONSTRAINT uq_product_unit_settings_tenant_product UNIQUE (tenant_id, product_id),
    CONSTRAINT ck_product_unit_settings_purchase_factor CHECK (items_per_purchase_unit IS NULL OR items_per_purchase_unit > 0),
    CONSTRAINT ck_product_unit_settings_outer_pack_factor CHECK (purchase_units_per_outer_pack IS NULL OR purchase_units_per_outer_pack > 0)
);

CREATE INDEX idx_product_unit_settings_tenant_product ON product_unit_settings(tenant_id, product_id);
```

### 8.2 Table `product_unit_conversions` (Derived Persisted Projection)

```sql
CREATE TABLE product_unit_conversions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    uom_id UUID NOT NULL REFERENCES unit_of_measures(id),
    unit_level VARCHAR(40) NOT NULL CHECK (unit_level IN ('BASE', 'SELLING', 'PURCHASE', 'OUTER_PACK')),
    conversion_to_base_factor NUMERIC(18,4) NOT NULL CHECK (conversion_to_base_factor > 0),
    is_base_unit BOOLEAN NOT NULL DEFAULT FALSE,
    is_selling_unit BOOLEAN NOT NULL DEFAULT FALSE,
    is_purchase_unit BOOLEAN NOT NULL DEFAULT FALSE,
    is_outer_pack_unit BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    created_at TIMESTAMPTZ NOT NULL,
    created_by_tenant_user_id UUID NULL REFERENCES tenant_users(id),
    updated_at TIMESTAMPTZ NOT NULL,
    updated_by_tenant_user_id UUID NULL REFERENCES tenant_users(id),

    CONSTRAINT uq_product_unit_conversions_tenant_product_uom UNIQUE (tenant_id, product_id, uom_id)
);

CREATE INDEX idx_product_unit_conversions_tenant_product ON product_unit_conversions(tenant_id, product_id);
```

### 8.3 Child Row Lifecycle & Status Constraint
- **Child Row Status Rule**: `product_unit_settings` and `product_unit_conversions` rows use `status = 'ACTIVE'` (or `'INACTIVE'` / `'DELETED'`).
- Product lifecycle status (`DRAFT`, `ACTIVE`, `INACTIVE`) is owned strictly by `products.status`. Child unit configuration rows do NOT store `status = 'DRAFT'`.

---

## 9. Derived Conversion Row Lifecycle & Projection Rebuild

- `product_unit_settings` is the **authoritative domain entity**. `product_unit_conversions` is a **derived persisted projection**.
- Client applications do NOT edit `product_unit_conversions` directly.
- **Server Projection Rebuild Algorithm**:
  Whenever `product_unit_settings` is updated inside the pipeline:
  1. Delete or soft-delete existing `product_unit_conversions` rows for `(tenant_id, product_id)`.
  2. If `base_uom_id` is non-null, recalculate active unit tiers (Base, Selling, Purchase, Outer Pack).
  3. UPSERT active tier rows into `product_unit_conversions` with `status = 'ACTIVE'`.
  4. Execute projection rebuild inside the primary PostgreSQL transaction.

---

## 10. Mode Switch & Track Inventory Cleanup

### 10.1 Unit Model Switch (`MULTIPLE_UNITS` $\rightarrow$ `SINGLE_UNIT`)
- In-session UI state retains entered multi-unit values in local Flutter memory during active session.
- Server persistence clears inactive multi-unit fields: `outer_pack_uom_id`, `items_per_purchase_unit`, `purchase_units_per_outer_pack` are set to `NULL`.
- `product_unit_conversions` non-base rows are marked `DELETED`.

### 10.2 Track Inventory Toggle (`ON` $\rightarrow$ `OFF` in Step 2)
- `product_inventory_settings.is_stock_tracked` = `false`.
- Step 3 status becomes `NOT_APPLICABLE` (auto-bypassed).
- Existing `product_unit_settings` remains preserved in DB, but ignored by stock ledger calculations.
- Re-enabling Track Inventory restores previously configured Step 3 settings.

---

## 11. Canonical UOM Master Data & Tenancy Predicate

### 11.1 Standard System UOM Codes

| Canonical Code | Display Name | UOM Type | Symbol | Recommended Decimal | Aliases |
|---|---|---|---|---|---|
| `PCS` | Piece | Discrete | pc | `false` | `PIECE` |
| `EACH` | Each | Discrete | ea | `false` | `EA` |
| `PR` | Pair | Discrete | pr | `false` | `PAIR` |
| `PK` | Pack | Package | pk | `false` | `PACK` |
| `BOX` | Box | Package | box | `false` | `BX` |
| `CTN` | Carton | Package | ctn | `false` | `CARTON` |
| `KG` | Kilogram | Weight | kg | `true` | `KILOGRAM` |
| `G` | Gram | Weight | g | `true` | `GRAM` |
| `L` | Litre | Volume | l | `true` | `LITRE` |
| `ML` | Millilitre | Volume | ml | `true` | `MILLILITRE` |
| `M` | Metre | Length | m | `true` | `METRE` |

- `PCS` is the canonical system code for Piece. `PIECE` is mapped as an alias.
- **Default Resolution**: Fresh draft creation resolves the global UOM where `uom_code = 'PCS'`.

### 11.2 Tenancy Query Predicate & Validation
- **Selectable UOM Query**:
  `WHERE (uom.tenant_id IS NULL OR uom.tenant_id = @CurrentTenantId) AND uom.status = 'ACTIVE'`
- **Submitted Ownership Check**: Backend verifies submitted `uomId` satisfies the predicate. Cross-tenant UOM IDs return `404 unit.uom_not_found`.

---

## 12. Create-Options API Metadata DTO Extension

Endpoint `GET /api/v1/tenant-admin/products/create-options` exposes UOM options:

```json
{
  "unitsOfMeasure": [
    {
      "unitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "unitCode": "PCS",
      "unitName": "Piece",
      "unitType": "Discrete",
      "symbol": "pc",
      "recommendedAllowDecimalQuantity": false
    },
    {
      "unitId": "4bb96f75-6828-5673-c4ad-3da74f77bfb7",
      "unitCode": "KG",
      "unitName": "Kilogram",
      "unitType": "Weight",
      "symbol": "kg",
      "recommendedAllowDecimalQuantity": true
    }
  ]
}
```

---

## 13. Semantic Technical Naming Conventions

All technical code symbols MUST use semantic business terms. Step-number class names are strictly FORBIDDEN:

| Generic Step-Number Name (FORBIDDEN) | Semantic Canonical Name (REQUIRED) |
|---|---|
| `ValidateStep3Draft` | `ValidateUnitsPackConversionDraft` |
| `ValidateStep3SaveAndContinue` | `ValidateUnitsPackConversionContinue` |
| `SaveStep3DraftCommand` | `SaveUnitsPackConversionCommand` |
| `Step3WizardProcessor` | `UnitsPackConversionWizardProcessor` |
| `Step3UnitsWidget` | `UnitsPackConversionFormWidget` |

---

## 14. Full Attribute Traceability Matrix

| UI Field | Business Meaning | Req Draft? | Req Cont? | API JSON Field | Request DTO Property | Application Property | Domain Property | DB Table | DB Column | Data Type | Null DB? | Validation | Permission | Audit Field | Response Field |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Unit Model | Model selection | No | Yes | `unitModel` | `UnitModel` | `UnitModel` | `ProductUnitSettings.UnitModel` | `product_unit_settings` | `unit_model` | varchar(40) | No | Enum | `catalog.products.create` | `unitModel` | `unitModel` |
| Product Unit | Single UOM | No | Yes (Single) | `productUnitId` | `ProductUnitId` | `ProductUnitId` | `ProductUnitSettings.BaseUomId` | `product_unit_settings` | `base_uom_id` | uuid | Yes | FK Valid | Same | `baseUomId` | `productUnitId` |
| Base Unit | Base stock UOM | No | Yes (Multi) | `baseUnitId` | `BaseUnitId` | `BaseUnitId` | `ProductUnitSettings.BaseUomId` | `product_unit_settings` | `base_uom_id` | uuid | Yes | FK Valid | Same | `baseUomId` | `baseUnitId` |
| Selling Unit | Default sale UOM | No | Yes (Multi) | `sellingUnitId` | `SellingUnitId` | `SellingUnitId` | `ProductUnitSettings.SellingUomId` | `product_unit_settings` | `selling_uom_id` | uuid | Yes | Must match tier | Same | `sellingUomId` | `sellingUnitId` |
| Purchase Unit | Purchase UOM | No | Yes (Multi) | `purchaseUnitId` | `PurchaseUnitId` | `PurchaseUnitId` | `ProductUnitSettings.PurchaseUomId` | `product_unit_settings` | `purchase_uom_id` | uuid | Yes | Differs Base | Same | `purchaseUomId` | `purchaseUnitId` |
| Items/Purchase Unit | Pack multiplier | No | Yes (Multi) | `itemsPerPurchaseUnit` | `ItemsPerPurchaseUnit` | `ItemsPerPurchaseUnit` | `ProductUnitSettings.ItemsPerPurchaseUnit` | `product_unit_settings` | `items_per_purchase_unit` | numeric(18,4) | Yes | > 0 | Same | `itemsPerPurchaseUnit` | `itemsPerPurchaseUnit` |
| Outer Pack Unit | Bulk UOM | No | No | `outerPackUnitId` | `OuterPackUnitId` | `OuterPackUnitId` | `ProductUnitSettings.OuterPackUomId` | `product_unit_settings` | `outer_pack_uom_id` | uuid | Yes | FK Valid | Same | `outerPackUomId` | `outerPackUnitId` |
| Units/Outer Pack | Bulk multiplier | No | Cond | `purchaseUnitsPerOuterPack` | `PurchaseUnitsPerOuterPack` | `PurchaseUnitsPerOuterPack` | `ProductUnitSettings.PurchaseUnitsPerOuterPack` | `product_unit_settings` | `purchase_units_per_outer_pack` | numeric(18,4) | Yes | > 0 if Outer | Same | `purchaseUnitsPerOuterPack` | `purchaseUnitsPerOuterPack` |
| Decimal Qty | Fractional switch | No | Yes | `allowDecimalQuantity` | `AllowDecimalQuantity` | `AllowDecimalQuantity` | `ProductUnitSettings.AllowDecimalQuantity` | `product_unit_settings` | `allow_decimal_quantity` | boolean | No | Bool | Same | `allowDecimalQuantity` | `allowDecimalQuantity` |

---

## 15. API Request & Response Contracts

### 15.1 Action Protocol
- `WizardAction`: `"SAVE_DRAFT"` or `"SAVE_AND_CONTINUE"`.
- `AdvanceStep`: `false` for Save Draft, `true` for Save & Continue.

### 15.2 Update Request Payload (`SaveProductDraftRequest`)

```json
{
  "productId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "currentSetupStep": 3,
  "wizardAction": "SAVE_AND_CONTINUE",
  "advanceStep": true,
  "unitModel": "MULTIPLE_UNITS",
  "baseUnitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "sellingUnitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "purchaseUnitId": "4bb96f75-6828-5673-c4ad-3da74f77bfb7",
  "outerPackUnitId": "5cc07f86-7939-6784-d5be-4eb85f88cfc8",
  "itemsPerPurchaseUnit": 6.0,
  "purchaseUnitsPerOuterPack": 12.0,
  "allowDecimalQuantity": false,
  "expectedRowVersion": 5
}
```

### 15.3 Response Body (`ProductDraftResponse` — HTTP 200 OK)

```json
{
  "productId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "DRAFT",
  "currentSetupStep": 3,
  "targetSetupStep": 5,
  "lastCompletedSetupStep": 3,
  "unitModel": "MULTIPLE_UNITS",
  "baseUnitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "baseUnitName": "Piece",
  "sellingUnitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "sellingUnitName": "Piece",
  "purchaseUnitId": "4bb96f75-6828-5673-c4ad-3da74f77bfb7",
  "purchaseUnitName": "Pack",
  "outerPackUnitId": "5cc07f86-7939-6784-d5be-4eb85f88cfc8",
  "outerPackUnitName": "Carton",
  "itemsPerPurchaseUnit": 6.0,
  "purchaseUnitsPerOuterPack": 12.0,
  "allowDecimalQuantity": false,
  "unitConversions": [
    {
      "uomId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "uomCode": "PCS",
      "uomName": "Piece",
      "unitLevel": "BASE",
      "conversionToBaseFactor": 1.0,
      "isBaseUnit": true,
      "isSellingUnit": true,
      "isPurchaseUnit": false,
      "isOuterPackUnit": false
    },
    {
      "uomId": "4bb96f75-6828-5673-c4ad-3da74f77bfb7",
      "uomCode": "PK",
      "uomName": "Pack",
      "unitLevel": "PURCHASE",
      "conversionToBaseFactor": 6.0,
      "isBaseUnit": false,
      "isSellingUnit": false,
      "isPurchaseUnit": true,
      "isOuterPackUnit": false
    },
    {
      "uomId": "5cc07f86-7939-6784-d5be-4eb85f88cfc8",
      "uomCode": "CTN",
      "uomName": "Carton",
      "unitLevel": "OUTER_PACK",
      "conversionToBaseFactor": 72.0,
      "isBaseUnit": false,
      "isSellingUnit": false,
      "isPurchaseUnit": false,
      "isOuterPackUnit": true
    }
  ],
  "rowVersion": 6,
  "draftSavedAt": "2026-08-11T00:00:00Z"
}
```

---

## 16. Standardized Error Contract

Top-level HTTP status codes and standardized error response envelope:

```json
{
  "code": "product.validation_failed",
  "message": "One or more validation errors occurred.",
  "fieldErrors": [
    {
      "field": "sellingUnitId",
      "code": "unit.selling_unit_must_match_configured_tier",
      "message": "Selling Unit must match Base Unit, Purchase Unit, or Outer Pack Unit."
    }
  ]
}
```

| HTTP Status | Canonical Code | Field Key | Cause |
|---|---|---|---|
| **400** | `product.validation_failed` | `unitModel` | Invalid or missing unit model |
| **400** | `product.validation_failed` | `baseUnitId` | Base unit missing on Save & Continue |
| **400** | `product.validation_failed` | `purchaseUnitId` | Purchase unit equals Base unit in MULTI mode |
| **400** | `product.validation_failed` | `sellingUnitId` | Selling unit does not match any configured tier |
| **400** | `product.validation_failed` | `itemsPerPurchaseUnit` | Items per purchase unit <= 0 or invalid decimal |
| **403** | `auth.forbidden` | N/A | User lacks `catalog.products.create` or `product_catalog` entitlement |
| **404** | `product.not_found` | N/A | Product not found or foreign tenant ID |
| **404** | `unit.uom_not_found` | `baseUnitId` / `purchaseUnitId` | Selected UOM ID invalid or foreign tenant |
| **409** | `product.concurrency_conflict` | `expectedRowVersion` | `expectedRowVersion` does not match server `row_version` |

---

## 17. Workflow-Aware Permission & Entitlement Model

- **Initial Product Wizard Draft Creation & Step Updates**: Authorized by staff permission `catalog.products.create`.
- **Editing Existing Published Product**: Authorized by staff permission `catalog.products.update`.
- **Resume GET `/setup`**: Authorized by `catalog.products.view` OR `catalog.products.create` OR `catalog.products.update`.
- **Runtime Feature Entitlement Code**: `product_catalog` (checked via `ProductWizardAccessPolicy`).
- **Module Code**: `product_management`.

---

## 18. Audit Logging Contract

- **Audit Event Name**: `PRODUCT_UNITS_PACK_CONVERSION_SAVED`
- **Logged Properties**: `tenantId`, `productId`, `actorUserId`, `timestamp`, `unitModel`, `baseUomId`, `sellingUomId`, `purchaseUomId`, `outerPackUomId`, `itemsPerPurchaseUnit`, `purchaseUnitsPerOuterPack`, `allowDecimalQuantity`, `rowVersion`.

---

## 19. Non-Functional & Security Requirements

1. **Transaction Atomicity**: Updating Step 3 executes inside a single PostgreSQL transaction covering `products`, `product_unit_settings`, `product_unit_conversions`, `product_inventory_settings`, and `audit_logs`.
2. **Decimal Math Safety**: C# `decimal` and PostgreSQL `numeric(18,4)` ONLY. IEEE `float`/`double` are forbidden.
3. **Tenant Isolation**: All queries enforce `WHERE tenant_id = @CurrentTenantId`.
4. **Idempotency**: Executing identical Save Draft or Save & Continue requests repeatedly produces deterministic results.
5. **No N+1 Queries**: Single query fetch for product, inventory settings, and existing unit settings.

---

## 20. Backend Implementation Gap Analysis (READ ONLY FINDINGS)

1. **Missing DB Tables**: `product_unit_settings` and `product_unit_conversions` missing in EF models and migrations.
2. **Missing DTO Fields**: `SaveProductDraftRequest`, `SaveProductDraftCommand`, `ProductDraftResponse`, `ProductSetupWizardDto` lack Step 3 unit attributes and `unitConversions` array.
3. **Missing Validators**: `TenantAdminProductRequestValidator` lacks `ValidateUnitsPackConversionDraft` and `ValidateUnitsPackConversionContinue`.
4. **Missing Processor**: `TenantAdminProductRepository` lacks `UnitsPackConversionWizardProcessor`.
5. **Missing Projection**: `GetSetupAsync` does not project unit settings into wizard DTO.

---

## 21. Complete Test Matrix

### 21.1 Backend Unit & Integration Tests
- `SINGLE_UNIT` Save & Continue with valid Piece $\rightarrow$ success, `base_uom_id = Piece`, `inventory_uom_id = Piece`.
- `MULTIPLE_UNITS` Save & Continue: Base=Piece, Purchase=Pack (6), Outer=Carton (12) $\rightarrow$ calculates `outerPackToBaseFactor = 72`.
- Selling Unit = Piece (Base) $\rightarrow$ valid.
- Selling Unit = Pack (Purchase) $\rightarrow$ valid.
- Selling Unit = Carton (Outer) $\rightarrow$ valid.
- Selling Unit = Unrelated UOM (e.g. Kilogram) $\rightarrow$ returns `400 unit.selling_unit_must_match_configured_tier`.
- `itemsPerPurchaseUnit = 0` $\rightarrow$ returns `400 unit.items_per_purchase_unit_invalid`.
- `baseUnitId == purchaseUnitId` in `MULTIPLE_UNITS` $\rightarrow$ returns `400 unit.base_and_purchase_must_differ`.
- `allowDecimalQuantity = false` with fractional multiplier (2.5) $\rightarrow$ returns `400 unit.fractional_conversion_requires_decimal_quantity`.
- Target Step Resolution: `SIMPLE` + Track Inventory ON $\rightarrow$ `targetSetupStep = 5`. `VARIANT` + Track Inventory ON $\rightarrow$ `targetSetupStep = 4`.
- Concurrency: Mismatched `expectedRowVersion` $\rightarrow$ returns `409 Conflict`.
- Foreign tenant UOM selection $\rightarrow$ returns `404 unit.uom_not_found`.

### 21.2 Frontend Widget & Unit Tests
- Default rendering displays `SINGLE_UNIT`.
- Switching to `MULTIPLE_UNITS` reveals Base, Selling, Purchase, and Outer Pack dropdowns.
- Dynamic conversion summary card updates immediately upon multiplier text field edit.
- Validation error displays inline on selling unit mismatch or missing base unit.

---

## 22. Cleaned & Synchronized Second Brain Documents

The following active canonical documents have been fully synchronized with this specification:
1. [[05_Tenant_Admin_Add_Product_8_Step_Contract]]
2. [[Tenant_Admin_Product_Type_Tracking_Specification]]
3. [[09_Product_Management_Flow]]
4. [[Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
5. [[10_Catalog_Master_Data_And_Product_Core_UPDATED]]
6. [[16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
7. [[02_Functional_Rules]]
8. [[03_Technical_Contract]]
9. [[Full_Feature_Status_Index]]
