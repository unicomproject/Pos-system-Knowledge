# Tenant Admin Add Product Step 3 — Units & Pack Conversion Final Canonicalization Audit

<!-- title: Tenant Admin Add Product Step 3 — Units & Pack Conversion Final Canonicalization Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- date: 2026-08-11 -->

## 1. Executive Summary

This audit records the final canonicalization and correction for **Tenant Admin Add Product Wizard — Step 3: Units & Pack Conversion**.

Following an independent verification of the Tenant Product user journey, Product Setup reference designs, existing Second Brain contracts, and the read-only inspection of the current .NET backend codebase (`Unified-Commerce`), all business rules, database nullability rules, validator constraints, navigation resolver rules, API contracts, and UOM master data codes have been fully synchronized. Zero business-rule ambiguities or contradictions remain.

---

## 2. Sources Inspected

1. **User Journey & Design References**:
   - `Tenant admin side la product setup.zip` / `Tenant admin side la product setup.txt`
   - Product Setup design reference layouts (Reference UI 2 alignment)
2. **Second Brain Repository (`Pos-system-Knowledge`)**:
   - `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md` [CANONICAL SPEC]
   - `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
   - `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md`
   - `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
   - `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
   - `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
   - `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
   - `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
   - `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
   - `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`
3. **Current .NET Backend Implementation (Read-Only)**:
   - `SaveProductDraftRequest`, `SaveProductDraftCommand`, `ProductDraftResponse`, `ProductSetupWizardDto` (`Unified-Commerce/.../Dtos/TenantAdmin/TenantAdminProductWizardDtos.cs`)
   - `TenantAdminProductRequestValidator` (`Unified-Commerce/.../Validators/TenantAdminProductRequestValidator.cs`)
   - `TenantAdminProductRepository.Wizard.cs` (`Unified-Commerce/.../Repositories/TenantAdminProductRepository.Wizard.cs`)
   - Entities (`Product.cs`, `ProductInventorySetting.cs`, `ProductVariant.cs`, `UnitOfMeasure.cs`)
   - Seed Migrations (`20260629203129_InitialCreate.cs`)

---

## 3. Contradictions Found & Resolved

1. **BUNDLE Step 3 Rule (BLOCKER RESOLVED)**:
   - *Previous Error*: Contract stated `BUNDLE + Track Inventory ON -> Step 3 REQUIRED`.
   - *Correction*: Release 1 Bundle parents own no physical stock, use component-based inventory, have no parent stock UOM, and force parent tracking flags to `false`. Step 3 is **NOT_APPLICABLE / AUTO_COMPLETED** for Bundle parents. `Save & Continue` from Step 2 navigates directly to **Step 4** (Kit Composition).
2. **Selling Unit Conversion Constraint (BLOCKER RESOLVED)**:
   - *Previous Error*: Selling Unit was treated as an arbitrary UOM without a dedicated conversion input field.
   - *Correction*: Step 3 provides multipliers for Purchase Unit and Outer Pack Unit. Therefore, **Selling Unit MUST match Base Unit, Purchase Unit, or Outer Pack Unit**. An unconfigured Selling UOM is rejected by validation (`400 unit.selling_unit_must_match_configured_tier`).
3. **Variant Unit Inheritance**:
   - *Correction*: Unit setup is configured ONCE at Parent Product level in Step 3. All generated variants inherit the parent unit configuration. Physical stock is maintained in Base Unit for each exact variant (`product_variants.stock_uom_id = base_uom_id`). Per-variant UOM overrides are NOT supported in Release 1.
4. **Save Draft Nullability**:
   - *Correction*: Aligned DB schema and API DTOs. `Save Draft` allows NULL for `base_uom_id`, `selling_uom_id`, `purchase_uom_id`, `items_per_purchase_unit`. `Save & Continue` enforces non-null mandatory fields based on active `unit_model`.
5. **Child Row Status Constraint**:
   - *Correction*: `product_unit_settings` and `product_unit_conversions` rows use `status = 'ACTIVE'` (or `'INACTIVE'` / `'DELETED'`). Product lifecycle status (`DRAFT`, `ACTIVE`) is owned strictly by `products.status`.
6. **Canonical UOM Master Data Codes**:
   - *Correction*: Canonical system code for Piece is `PCS`. `PIECE` is an alias mapping to `PCS`. Canonical Pack code is `PK` (`PACK` is alias). Canonical Carton code is `CTN` (`CARTON` is alias).
7. **Semantic Technical Naming**:
   - *Correction*: Ban step-number class names (`ValidateStep3Draft`). Use semantic technical names: `ValidateUnitsPackConversionDraft`, `ValidateUnitsPackConversionContinue`, `ApplyUnitsPackConversionAsync`, `UnitsPackConversionWizardProcessor`, `ProductUnitSettings`, `ProductUnitConversion`.

---

## 4. Exact Canonical Decisions

- **Single Unit (`SINGLE_UNIT`)**: Product Unit * required; Allow Decimal Quantity toggle; maps Base UOM, Selling UOM, Purchase UOM, and Stock Counting UOM to Product Unit.
- **Multiple Units (`MULTIPLE_UNITS`)**: Base Unit *, Selling Unit * (must match Base, Purchase, or Outer Pack), Purchase Unit * (must differ from Base), Items per Purchase Unit * (> 0), optional Outer Pack Unit, Purchase Units per Outer Pack (> 0 if Outer Pack set), Allow Decimal Quantity.
- **Conversion Mathematics**:
  $$\text{purchaseToBaseFactor} = \text{itemsPerPurchaseUnit}$$
  $$\text{outerPackToBaseFactor} = \text{itemsPerPurchaseUnit} \times \text{purchaseUnitsPerOuterPack}$$
- **Database Schema**: `product_unit_settings` (1:1 with Product) and `product_unit_conversions` (Derived persisted projection).
- **Navigation Authority**: Server-evaluated `targetSetupStep` returned in API response.

---

## 5. Files Archived

The pre-correction versions of active canonical documents were archived to `Pos-system-Knowledge/99_Archive/Tenant_Admin_Add_Product_Step3_Pre_Final_Correction_2026-08-11/`:
- `Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`
- `05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `Tenant_Admin_Product_Type_Tracking_Specification.md`
- `02_Functional_Rules.md`
- `03_Technical_Contract.md`
- `09_Product_Management_Flow.md`
- `Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- `10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- `Full_Feature_Status_Index.md`

---

## 6. Files Updated & Created

- **Created**: [Tenant_Admin_Product_Units_Pack_Conversion_Specification.md](file:///c:/Users/user/Desktop/E-Pos/Pos-system-Knowledge/04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md) (Final canonical specification)
- **Created**: [2026-08-11_Tenant_Admin_Add_Product_Step3_Units_Pack_Conversion_Final_Canonicalization_Audit.md](file:///c:/Users/user/Desktop/E-Pos/Pos-system-Knowledge/15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-11_Tenant_Admin_Add_Product_Step3_Units_Pack_Conversion_Final_Canonicalization_Audit.md) (This audit)
- **Updated**: `05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- **Updated**: `Tenant_Admin_Product_Type_Tracking_Specification.md`
- **Updated**: `02_Functional_Rules.md`
- **Updated**: `03_Technical_Contract.md`
- **Updated**: `09_Product_Management_Flow.md`
- **Updated**: `Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- **Updated**: `10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- **Updated**: `16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- **Updated**: `Full_Feature_Status_Index.md`

---

## 7. Final Step 3 User Journey

1. **ENTRY**: Evaluates structure & tracking. If `Track Inventory = OFF` or `BUNDLE`, Step 3 is auto-bypassed (`targetSetupStep` = 4 or 5). If `SIMPLE`/`VARIANT` + Track Inventory ON, enters Step 3.
2. **SINGLE UNIT FLOW**: Selects Product Unit & Decimal Quantity toggle. System maps Base/Selling/Purchase UOMs to Product Unit. Dynamic copy confirms 1:1 unit counting.
3. **MULTIPLE UNITS FLOW**: Selects Base Unit, Selling Unit (must match Base/Purchase/Outer Pack), Purchase Unit, Items per Purchase Unit, optional Outer Pack Unit, Purchase Units per Outer Pack. Live conversion card displays math preview.
4. **SAVE DRAFT**: Validates syntax; allows NULLs for unconfigured UOMs. Persists `product_unit_settings` with `status = 'ACTIVE'` while `products.status = 'DRAFT'`. Increments `row_version`. Client remains on Step 3.
5. **SAVE & CONTINUE**: Enforces complete validation (Selling Unit tier check, integer multipliers when decimal disabled). Rebuilds `product_unit_conversions` projection. Synchronizes `product_inventory_settings.inventory_uom_id = base_uom_id`. Returns server-evaluated `targetSetupStep` (Step 5 for Simple, Step 4 for Variant).

---

## 8. Attribute Traceability Matrix

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

## 9. Permission & Entitlement Matrix

| Operation | HTTP Endpoint | HTTP Method | Required Staff Permission | Runtime Feature Entitlement | Scope & Authority |
|---|---|---|---|---|---|
| Wizard Draft Setup | `PUT /api/v1/tenant-admin/products/{id}/draft` | PUT | `catalog.products.create` | `product_catalog` | Allows initial creation & step updates on staff's tenant drafts |
| Active Product Edit | `PUT /api/v1/tenant-admin/products/{id}/draft` | PUT | `catalog.products.update` | `product_catalog` | Required when editing an existing published product |
| Setup Resume | `GET /api/v1/tenant-admin/products/{id}/setup` | GET | `catalog.products.view` OR `create` OR `update` | `product_catalog` | Restores full setup state |

---

## 10. API Contract Summary

- **Endpoint**: `PUT /api/v1/tenant-admin/products/{productId}/draft`
- **Request DTO (`SaveProductDraftRequest`)**: `currentSetupStep` (3), `wizardAction` (`"SAVE_DRAFT"` / `"SAVE_AND_CONTINUE"`), `advanceStep` (`bool`), `unitModel`, `productUnitId`, `baseUnitId`, `sellingUnitId`, `purchaseUnitId`, `outerPackUnitId`, `itemsPerPurchaseUnit`, `purchaseUnitsPerOuterPack`, `allowDecimalQuantity`, `expectedRowVersion`.
- **Response DTO (`ProductDraftResponse`)**: Includes `productId`, `status`, `currentSetupStep`, `targetSetupStep`, `lastCompletedSetupStep`, unit settings fields, `unitConversions` array, `rowVersion`, `draftSavedAt`.

---

## 11. Database Contract Summary

- **Table 1: `product_unit_settings`** (1:1 with `products`): `id`, `tenant_id`, `product_id` (UNIQUE), `unit_model`, `base_uom_id` (NULLABLE), `selling_uom_id` (NULLABLE), `purchase_uom_id` (NULLABLE), `outer_pack_uom_id` (NULLABLE), `items_per_purchase_unit` (NULLABLE), `purchase_units_per_outer_pack` (NULLABLE), `allow_decimal_quantity`, `status` (`'ACTIVE'`), audit timestamps & user IDs.
- **Table 2: `product_unit_conversions`** (Derived Projection): `id`, `tenant_id`, `product_id`, `uom_id`, `unit_level`, `conversion_to_base_factor`, `is_base_unit`, `is_selling_unit`, `is_purchase_unit`, `is_outer_pack_unit`, `status` (`'ACTIVE'`), audit parameters. UNIQUE(`tenant_id`, `product_id`, `uom_id`).

---

## 12. Validation Matrix Summary

| Code | Field Key | Trigger | Condition / Check | HTTP Status | Top-Level Error Code |
|---|---|---|---|---|---|
| `unit.model_required` | `unitModel` | Continue | Must be `SINGLE_UNIT` or `MULTIPLE_UNITS` | 400 | `product.validation_failed` |
| `unit.product_unit_required` | `productUnitId` | Continue (`SINGLE`) | Must be non-null valid UOM ID | 400 | `product.validation_failed` |
| `unit.base_unit_required` | `baseUnitId` | Continue (`MULTI`) | Must be non-null valid UOM ID | 400 | `product.validation_failed` |
| `unit.purchase_unit_required` | `purchaseUnitId` | Continue (`MULTI`) | Must be non-null valid UOM ID | 400 | `product.validation_failed` |
| `unit.items_per_purchase_unit_invalid` | `itemsPerPurchaseUnit` | Continue (`MULTI`) | Must be > 0 and valid decimal | 400 | `product.validation_failed` |
| `unit.base_and_purchase_must_differ` | `purchaseUnitId` | Continue (`MULTI`) | `purchaseUnitId != baseUnitId` | 400 | `product.validation_failed` |
| `unit.selling_unit_must_match_configured_tier` | `sellingUnitId` | Continue (`MULTI`) | Must match Base, Purchase, or Outer Pack | 400 | `product.validation_failed` |
| `unit.purchase_units_per_outer_pack_required` | `purchaseUnitsPerOuterPack` | Continue (`MULTI`) | Required > 0 if Outer Pack selected | 400 | `product.validation_failed` |
| `unit.fractional_conversion_requires_decimal_quantity` | `allowDecimalQuantity` | Continue (`MULTI`) | Factor % 1 != 0 requires allowDecimal = true | 400 | `product.validation_failed` |
| `unit.uom_not_found` | `baseUnitId` / `purchaseUnitId` | Draft / Continue | Submitted UOM ID does not exist or foreign tenant | 404 | `unit.uom_not_found` |
| `product.concurrency_conflict` | `expectedRowVersion` | Draft / Continue | Expected version != server `row_version` | 409 | `product.concurrency_conflict` |

---

## 13. NFR & Security Contract

- Single PostgreSQL transaction covering `products`, `product_unit_settings`, `product_unit_conversions`, `product_inventory_settings`, `audit_logs`.
- C# `decimal` and PostgreSQL `numeric(18,4)` only.
- Multipliers validated against overflow scale (`99999999994.9999`).
- Strict tenant isolation (`WHERE tenant_id = @CurrentTenantId`).

---

## 14. Backend Implementation Gap List against Current `Unified-Commerce`

1. **EF Models & Migrations**: Missing `ProductUnitSetting` and `ProductUnitConversion` entities and EF Core migration.
2. **DTOs & Commands**: `SaveProductDraftRequest`, `SaveProductDraftCommand`, `ProductDraftResponse`, `ProductSetupWizardDto` require Step 3 unit properties and `unitConversions` array.
3. **Validators**: `TenantAdminProductRequestValidator` requires `ValidateUnitsPackConversionDraft` and `ValidateUnitsPackConversionContinue`.
4. **Repository Processor**: `TenantAdminProductRepository` requires `UnitsPackConversionWizardProcessor` for projection rebuild and transaction persistence.
5. **GET /setup Projection**: `GetSetupAsync` requires unit settings projection.

---

## 15. Required Database Migrations

Create EF Core migration: `AddProductUnitSettingsAndConversions`
- Creates table `product_unit_settings`
- Creates table `product_unit_conversions`
- Adds foreign keys to `tenants`, `products`, `unit_of_measures`, `tenant_users`
- Adds unique constraints & performance indexes

---

## 16. Test Contract

### Backend Test Cases:
- `SINGLE_UNIT` Save & Continue with valid Piece $\rightarrow$ success, `inventory_uom_id = Piece`.
- `MULTIPLE_UNITS` Save & Continue: Base=Piece, Purchase=Pack (6), Outer=Carton (12) $\rightarrow$ `outerPackToBaseFactor = 72`.
- Selling Unit = Base, Selling Unit = Purchase, Selling Unit = Outer Pack $\rightarrow$ valid.
- Selling Unit = Unrelated UOM (e.g. Kilogram) $\rightarrow$ returns `400 unit.selling_unit_must_match_configured_tier`.
- Fractional multiplier (2.5) when `allowDecimalQuantity = false` $\rightarrow$ returns `400 unit.fractional_conversion_requires_decimal_quantity`.
- Target Step Resolution: `SIMPLE` + Track Inventory ON $\rightarrow$ `targetSetupStep = 5`. `VARIANT` + Track Inventory ON $\rightarrow$ `targetSetupStep = 4`. `BUNDLE` $\rightarrow$ `targetSetupStep = 4`.
- Concurrency conflict on stale version $\rightarrow$ returns `409 Conflict`.
- Foreign tenant UOM selection $\rightarrow$ returns `404 unit.uom_not_found`.

---

## 17. Final Readiness Verdict

**STEP 3 UNITS & PACK CONVERSION**
**SECOND BRAIN FINAL-BACKEND-READY**
