# Tenant Admin Add Product Step 3 — Units & Pack Conversion Readiness Audit

<!-- title: Tenant Admin Add Product Step 3 — Units & Pack Conversion Readiness Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- date: 2026-08-10 -->

## 1. Executive Summary

This audit evaluates the Second Brain documentation readiness for **Tenant Admin Add Product Wizard — Step 3: Units & Pack Conversion**. 

Following a deep audit of the Tenant Admin Product Setup user journey, existing Second Brain contracts, and the read-only inspection of the current .NET backend codebase and database schema, all business rules, field contracts, validation matrices, math formulas, API payloads, persistence models, and navigation rules for Step 3 have been canonicalized.

---

## 2. Sources Inspected

1. **User Journey & UX Reference**:
   - `Tenant admin side la product setup.zip` / `Tenant admin side la product setup.txt`
   - Product Setup design reference layouts (Reference UI 2 alignment)
2. **Current Second Brain Knowledge Base**:
   - `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
   - `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Type_Tracking_Specification.md`
   - `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
   - `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
   - `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
   - `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
   - `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`
3. **Current Backend Implementation (Read-Only)**:
   - `SaveProductDraftRequest`, `SaveProductDraftCommand`, `ProductDraftResponse`, `ProductSetupWizardDto` (`Unified-Commerce/.../Dtos/TenantAdmin/TenantAdminProductWizardDtos.cs`)
   - `TenantAdminProductRequestValidator` (`Unified-Commerce/.../Validators/TenantAdminProductRequestValidator.cs`)
   - `TenantAdminProductRepository.Wizard.cs` (`Unified-Commerce/.../Repositories/TenantAdminProductRepository.Wizard.cs`)
   - Domain Entities: `Product.cs`, `ProductInventorySetting.cs`, `ProductVariant.cs`, `UnitOfMeasure.cs`
   - Database Migrations: `20260629203129_InitialCreate.cs` to current EF Core migration snapshot.

---

## 3. Current Gaps Found

| Component | Status | Missing / Incomplete Elements |
|---|---|---|
| **Database Schema** | **GAP** | Tables `product_unit_settings` and `product_unit_conversions` do NOT exist in EF Core entity configurations or database migrations. Only global `unit_of_measures` master table exists. |
| **Backend DTOs** | **GAP** | `SaveProductDraftRequest` lacks Step 3 fields (`unitModel`, `productUnitId`, `baseUnitId`, `sellingUnitId`, `purchaseUnitId`, `outerPackUnitId`, `itemsPerPurchaseUnit`, `purchaseUnitsPerOuterPack`, `allowDecimalQuantity`). `ProductDraftResponse` & `ProductSetupWizardDto` lack `unitConversions` array. |
| **Backend Command** | **GAP** | `SaveProductDraftCommand` lacks Step 3 unit properties. |
| **Backend Validator** | **GAP** | `TenantAdminProductRequestValidator` lacks `ValidateStep3Draft` and `ValidateStep3SaveAndContinue` methods. |
| **Backend Service / Repo** | **GAP** | `TenantAdminProductRepository` lacks Step 3 wizard processor (`Step3WizardProcessor`) for persisting product-specific unit settings and calculating normalized conversions. |
| **Backend GET /setup** | **GAP** | `GetSetupAsync` does not project unit settings or conversion factors into `ProductSetupWizardDto`. |
| **Flutter UI** | **GAP** | `add_product_wizard.dart` renders placeholder `_buildStepPlaceholder('Step 3 — Units & Pack Conversion')`. No Step 3 form widget exists. |
| **Flutter Controller** | **GAP** | `AddProductWizardController` lacks Step 3 state variables, validation logic, and unit payload mapping. |
| **Tests** | **GAP** | No backend unit/integration tests or Flutter widget/unit tests exist for Step 3. |

---

## 4. Contradictions Resolved

1. **Skip Button Policy**:
   - *Previous ambiguity*: Generic wizard documentation suggested all non-initial steps might have a Skip button.
   - *Resolved Canonical Rule*: For Step 3, when `Track Inventory = ON`, Step 3 is **MANDATORY**. The `Skip` button MUST be **HIDDEN** or **DISABLED**. When `Track Inventory = OFF`, Step 3 is **NOT APPLICABLE** and is automatically bypassed by backend target step resolution during Step 2 Save & Continue.
2. **Wizard Target Navigation**:
   - *Previous ambiguity*: Client tried to calculate `currentStep + 1`.
   - *Resolved Canonical Rule*: Backend wizard step resolver evaluates product structure and inventory tracking to return explicit `targetSetupStep`:
     - `SIMPLE` + Track Inventory ON $\rightarrow$ `targetSetupStep = 5` (Step 4 `NOT_APPLICABLE`).
     - `VARIANT` + Track Inventory ON $\rightarrow$ `targetSetupStep = 4`.
     - `BUNDLE` + Track Inventory ON $\rightarrow$ `targetSetupStep = 4`.
3. **Product-Specific Pack Conversions vs Global UOMs**:
   - *Previous ambiguity*: Confusion on whether 1 Pack = 6 Pieces is stored globally against `unit_of_measures`.
   - *Resolved Canonical Rule*: Global `unit_of_measures` stores master UOM definitions (e.g. `PCS`, `PK`, `CTN`). Product-specific conversion factors (e.g., Home Jersey: 1 Pack = 6 Pieces) are strictly stored per product in `product_unit_settings` and `product_unit_conversions`.

---

## 5. Canonical Decisions

1. **Dedicated Step 3 Specification**: Created `04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md`.
2. **Two Unit Models**: `SINGLE_UNIT` (Single Unit Only) and `MULTIPLE_UNITS` (Multiple Units & Pack Conversion).
3. **Conversion Formula**:
   $$\text{purchaseToBaseFactor} = \text{itemsPerPurchaseUnit}$$
   $$\text{outerPackToBaseFactor} = \text{itemsPerPurchaseUnit} \times \text{purchaseUnitsPerOuterPack}$$
4. **Database Storage Contract**: `product_unit_settings` (1:1 with Product) and `product_unit_conversions` (Normalized conversion factor table).
5. **Base Unit Integration**: `product_inventory_settings.inventory_uom_id` synchronizes to `product_unit_settings.base_uom_id` upon Step 3 completion.
6. **Step 5 Barcode Alignment**: Step 3 defines unit hierarchy; Step 5 assigns barcode strings per unit level.

---

## 6. Files Archived

The following canonical files were backed up to `Pos-system-Knowledge/99_Archive/Tenant_Admin_Add_Product_Step3_Pre_Contract_2026-08-10/` prior to modification:
- `05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `09_Product_Management_Flow.md`
- `Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- `10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
- `16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
- `Full_Feature_Status_Index.md`

---

## 7. Files Created

- `Pos-system-Knowledge/04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Units_Pack_Conversion_Specification.md` (Dedicated Step 3 canonical specification)
- `Pos-system-Knowledge/15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-10_Tenant_Admin_Add_Product_Step3_Units_Pack_Conversion_Readiness_Audit.md` (This audit record)

---

## 8. Files Updated

- `Pos-system-Knowledge/04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md` (Cross-referenced Step 3 spec and detailed contract in Section 9 & 12)
- `Pos-system-Knowledge/03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md` (Updated Step 3 row in wizard lifecycle table)
- `Pos-system-Knowledge/07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md` (Added Section 4.1 Step 3 form layout, conversion summary card, and units table)
- `Pos-system-Knowledge/06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md` (Added `product_unit_settings` and `product_unit_conversions` table specs)
- `Pos-system-Knowledge/06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md` (Updated `inventory_uom_id` sync note)
- `Pos-system-Knowledge/15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md` (Updated Step 3 readiness status)

---

## 9. Implementation Readiness Matrix

| Area | Status | Notes |
|---|---|---|
| **Second Brain Contract** | **READY** | Full canonical contract, DTO schemas, DB models, validation matrices, math formulas, and test cases specified. |
| **Database Schema** | **NOT READY (GAP)** | Requires EF Core migration for `product_unit_settings` and `product_unit_conversions`. |
| **Backend Implementation** | **NOT READY (GAP)** | Requires DTO additions, command updates, validators, and repository processor. |
| **Frontend Implementation** | **NOT READY (GAP)** | Requires Step 3 widget, controller state, and API integration. |
| **Test Suite** | **NOT READY (GAP)** | Requires backend unit/integration tests and Flutter widget/unit tests. |

---

## 10. Final Second Brain Verdict

**"STEP 3 SECOND BRAIN CONTRACT READY FOR DB/BACKEND IMPLEMENTATION"**

---

## 11. Recommended Next Implementation Sequence

1. **Second Brain Documentation**: `COMPLETED`
2. **Database Migration**: Create EF Core models and migration for `product_unit_settings` and `product_unit_conversions`.
3. **Backend Core Implementation**: Update DTOs, Commands, Validators, Repository Processors, and `GET /setup` endpoint in `Unified-Commerce`.
4. **Backend Tests**: Implement unit and integration tests verifying single/multiple unit persistence, math calculations, and wizard target step resolution.
5. **Flutter Integration**: Implement Step 3 widget (`Step3UnitsPackConversion`), update `AddProductWizardController`, models, and API services in `Nytroz-POS-App`.
6. **Flutter Tests**: Implement widget and state tests for Step 3 form rendering and dynamic summary calculations.
7. **Runtime / E2E Verification**: Authenticated testing from Flutter frontend to .NET API.
