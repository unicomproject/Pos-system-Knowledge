# Final Canonicalization Audit: Tenant Admin Add Product Step 4 — Variant Configuration

<!-- title: Final Canonicalization Audit: Tenant Admin Add Product Step 4 — Variant Configuration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Scope -->
<!-- last_updated: 2026-08-11 -->

## 1. Executive Summary

Following a deep, read-only audit of the Tenant Admin Product Setup user journey, Product Setup reference designs, existing Second Brain contracts, and the read-only inspection of the current .NET backend codebase (`Unified-Commerce`) and Flutter frontend (`Nytroz-POS-App`), all business rules, field contracts, validation matrices, API payloads, persistence models, image resolution logic, inclusion semantics, and navigation rules for **Step 4: Variant Configuration** have been fully canonicalized. Zero business-rule ambiguities or implementation-blocking contradictions remain.

**Final Verdict**:
> **STEP 4 VARIANT CONFIGURATION**  
> **SECOND BRAIN FINAL-BACKEND-FRONTEND-READY**

---

## 2. Sources Inspected

1. `Tenant admin side la product setup.txt` (Primary User Journey & Business UX source).
2. Product Setup / Step 4 UI reference layouts:
   - Variant Configuration main screen.
   - Edit Variant right-side drawer.
   - Delete Variant confirmation modal.
3. Current active Second Brain (`Pos-system-Knowledge`).
4. Current `Unified-Commerce` .NET Backend Source (READ ONLY):
   - `TenantAdminProductsController.cs`
   - `TenantAdminProductService.cs`
   - `ProductWizardAccessPolicy.cs`
   - `SaveProductDraftRequest.cs` / `SaveProductDraftCommand.cs`
   - `ProductDraftResponse.cs` / `ProductSetupWizardDto.cs`
   - `TenantAdminProductRequestValidator.cs`
   - `TenantAdminProductRepository.Wizard.cs`
   - `TenantAdminProductRepository.GetCreateOptionsAsync`
   - Domain Entities: `Product`, `ProductVariant`, `ProductOption`, `ProductOptionValue`, `ProductVariantOptionValue`, `ProductImage`, `ProductBarcode`, `UnitOfMeasure`
   - EF Configurations: `ProductVariantConfiguration.cs`, `ProductOptionValueConfiguration.cs`
   - EF ModelSnapshot / Migrations.
5. Current `Nytroz-POS-App` Flutter POS Source (READ ONLY).
6. `99_Archive` historical evidence.

---

## 3. Current Backend Files Inspected

- `src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/TenantAdminProductsController.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/TenantAdminProductService.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/ProductWizardAccessPolicy.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Dtos/TenantAdmin/TenantAdminProductWizardDtos.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Dtos/TenantAdmin/TenantAdminProductDtos.cs`
- `src/E_POS.Application/Modules/Tenant/CatalogProduct/Validators/TenantAdminProductRequestValidator.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductVariant.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductOptionValue.cs`
- `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductImage.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Configurations/ProductVariantConfiguration.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Configurations/ProductOptionValueConfiguration.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/TenantAdminProductRepository.cs`

---

## 4. Contradictions Found & Comprehensive Gap Matrix

| Area | Current Second Brain | Tenant User Journey Requirement | Current Backend Support | Gap | Canonical Decision Required |
|---|---|---|---|---|---|
| **User Journey** | Step 4 described generically without complete 3-UI state flow. | 3 UI States: Main Screen, Edit Drawer, Delete Modal. | Wizard handles Step 1/2/3 only. | Step 4 UI flow missing in wizard. | Fully document 3 UI states in canonical spec. |
| **Drawer Toggle Label** | Some old docs used legacy "Availability". | Labeled strictly **"Include Variant"**. | `ProductVariant.IsSellable` boolean property. | Label naming discrepancy. | **CANONICAL MANDATE**: Always use **"Include Variant"** (never "Availability"). |
| **Option Template Values API** | Not explicitly documented in wizard setup API. | Option dropdown needs active template values. | `GetCreateOptionsAsync` returns template headers without values. | Backend exposes templates but not nested values. | Extend `TenantAdminProductCreateOptionsResponse` `VariantOptionTemplates` to expose nested `Values` array. |
| **Variant Identity & Display Label** | Schema ambiguity between labels and codes. | `combinationLabel` is read-only computed (`Red / S`); `displayLabel` is user editable. | `ProductVariant.VariantName` exists. | Ambiguity on which column maps to display label. | Map `displayLabel` to `ProductVariant.VariantName`; project `combinationLabel` as computed API field. |
| **Variant Code** | Legacy docs implied SKU or manual typing. | System-generated unique identifier; NOT typed by user; NOT SKU. | `ProductVariant.VariantCode` (`NOT NULL`). | No generator in wizard pipeline. | Server-side deterministic generation (`VAR-{ProductCode}-{Hex8}`). |
| **Inclusion Semantics** | Mixed with channel visibility in old docs. | "Include Variant" is global catalog inclusion (`is_sellable`). NOT Step 7 channel visibility. | `ProductVariant.IsSellable`. | Conceptual confusion with channel visibility. | Keep global inclusion (`is_sellable`) distinct from Step 7 channel visibility matrix. |
| **Delete vs Include OFF** | Undifferentiated in legacy docs. | Include OFF is reversible toggle; Delete archives combination tombstone. | `ProductVariant.Status` (`ACTIVE` vs `ARCHIVED`). | Re-generation used to recreate deleted variants. | Persist `ARCHIVED` status with `option_combination_hash` to prevent unwanted recreation during regeneration. |
| **Image Resolution & Storage** | Old DB docs listed `image_url`. | Multi-tier fallback (Exact Override $\rightarrow$ Colour Group $\rightarrow$ Step 1 Primary $\rightarrow$ Placeholder). | `ProductOptionValue.ImageMediaAssetId` & `ProductImage.ProductVariantId`. | Documentation mismatch (`image_url` vs `image_media_asset_id`). | Reconcile Second Brain DB docs to `image_media_asset_id` (FK to `media_assets`). |
| **Permissions** | Some legacy paths used `tenant.products.*`. | Canonical: `catalog.products.create`/`update` + `catalog.variants.manage`. | `ProductWizardAccessPolicy` uses `TenantAdminProductPermissions`. | Legacy permission string usage. | Document canonical permission requirements and legacy code mapping. |
| **UOM Inheritance** | Ambiguous for Step 4 variants. | Track Inventory ON: inherits parent Step 3 units. Track Inventory OFF: system default (`PCS`). | `ProductVariant.StockUomId` / `SalesUomId` (`NOT NULL`). | Nullability invariant handling when Step 3 is skipped. | Parent base UOM when Track Inventory ON; system default `PCS` when Track Inventory OFF. |
| **Database Schema** | Unverified whether new tables/columns needed. | Requires variant matrix, options, inclusion, overrides, hashes. | All tables and columns already exist in EF model. | None. | **DATABASE MIGRATION REQUIRED: NO**. |

---

## 5. Exact Canonical Decisions

1. **Step 4 Naming**: Stepper Step 4 Label: `Product Configuration`. Page Heading: `Variant Configuration`.
2. **Toggle Label**: Always use **`Include Variant`** (never "Availability").
3. **API Options Expansion**: `GET /create-options` extended to return nested `Values` array on `VariantOptionTemplates`.
4. **Combination Label vs Display Label**: `combinationLabel` is read-only computed (`Red / S`); `displayLabel` is editable, mapping to `product_variants.variant_name`.
5. **Variant Code**: Server-generated, product-scoped unique identifier (`VAR-...`), not user-typed, distinct from SKU.
6. **Hash Algorithm**: `option_combination_hash` computed as SHA-256 hex string over sorted `opt:{id}|val:{id}` pairs (64 chars).
7. **Inclusion & Delete**:
   - `Include Variant OFF`: `is_sellable = false`, `status = 'ACTIVE'`. Reversible.
   - `Delete Variant`: `status = 'ARCHIVED'` (tombstone by hash prevents re-generation resurrection). Operational variants with transaction history cannot be deleted.
8. **Image Fallback Order**: Exact Variant Override $\rightarrow$ Colour Group Image (`product_option_values.image_media_asset_id`) $\rightarrow$ Step 1 Primary Image $\rightarrow$ Standard Placeholder.
9. **UOM Inheritance**: Variants inherit Step 3 parent units when Track Inventory ON; resolve system default UOM (`PCS`) when Track Inventory OFF.
10. **Cartesian Limit**: Enforce `MaxVariantCombinationsPerProduct = 100`.
11. **Database Migration**: **NO database schema migration required**.

---

## 6. Files Archived

The following files were archived to `99_Archive/Tenant_Admin_Add_Product_Step4_Variant_Configuration_Pre_Final_Canonicalization_2026-08-11/`:
1. `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
2. `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
3. `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
4. `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
5. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview.md`
6. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules.md`
7. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract.md`
8. `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
9. `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification.md`
10. `02_ACCESS_CONTROL/Permission_Code_List.md`
11. `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
12. `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
13. `06_DATABASE_KNOWLEDGE/Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility_UPDATED.md`
14. `06_DATABASE_KNOWLEDGE/Tables/12_Product_Option_Templates_And_Variant_Configuration.md`
15. `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
16. `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`

---

## 7. Files Created & Updated

### Created:
1. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification.md`
2. `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-11_Tenant_Admin_Add_Product_Step4_Variant_Configuration_Final_Canonicalization_Audit.md`

### Updated:
1. `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
2. `04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules.md`
3. `04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract.md`
4. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview.md`
5. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules.md`
6. `04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract.md`
7. `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
8. `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification.md`
9. `06_DATABASE_KNOWLEDGE/Tables/12_Product_Option_Templates_And_Variant_Configuration.md`
10. `10_TESTING_QA/Test_Case/10_Product_Core/Product_Crud_Test_Cases.md`
11. `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`

---

## 8. Final Complete Step 4 User Journey

- **Entry**: VARIANT product enters Step 4 from Step 3 (if Track Inventory ON) or Step 2 (if Track Inventory OFF).
- **State A (Main Screen)**: User configures attribute rows, picks values, and clicks `Generate Variants`. Matrix table renders generated variants. Summary card displays live variant counts.
- **State B (Edit Drawer)**: User edits `Display Label`, toggles **`Include Variant`** (ON/OFF), and updates variant image overrides (exact or colour group).
- **State C (Delete Modal)**: User confirms destructive variant removal. Row is archived as tombstone (`status = 'ARCHIVED'`). Summary card updates.
- **Navigation**: `Save Draft` stays on Step 4. `Save & Continue` validates completion ($\ge 1$ attribute, $\ge 1$ included variant) and advances to Step 5 (`Barcode & SKU`). `Back` returns to Step 3 or Step 2.

---

## 9. Attribute Traceability Matrix

| UI Control | Flutter Property | Request DTO Property | Domain Property | DB Table | DB Column | Data Type / Nullability |
|---|---|---|---|---|---|---|
| Attribute Name | `optionCode` | `options[].optionCode` | `ProductOption.OptionCode` | `product_options` | `option_code` | `varchar(80)` NOT NULL |
| Attribute Label | `optionName` | `options[].optionName` | `ProductOption.OptionName` | `product_options` | `option_name` | `varchar(150)` NOT NULL |
| Value Selection | `valueCode` | `values[].valueCode` | `ProductOptionValue.ValueCode` | `product_option_values` | `value_code` | `varchar(80)` NOT NULL |
| Colour Group Image | `groupImageId` | `values[].imageMediaAssetId` | `ProductOptionValue.ImageMediaAssetId` | `product_option_values` | `image_media_asset_id` | `uuid` NULLable |
| Combination Label | `combinationLabel` | `variants[].combinationLabel` | Computed | N/A | N/A | Calculated string |
| Display Label | `displayLabel` | `variants[].displayLabel` | `ProductVariant.VariantName` | `product_variants` | `variant_name` | `varchar(150)` NOT NULL |
| Variant Code | `variantCode` | `variants[].variantCode` | `ProductVariant.VariantCode` | `product_variants` | `variant_code` | `varchar(80)` NOT NULL |
| Include Variant | `included` | `variants[].included` | `ProductVariant.IsSellable` | `product_variants` | `is_sellable` | `boolean` NOT NULL |
| Combination Hash | `hash` | `variants[].optionCombinationHash` | `ProductVariant.OptionCombinationHash` | `product_variants` | `option_combination_hash` | `char(64)` NULLable |
| Exact Variant Image | `exactImageId` | `variants[].exactImageMediaAssetId` | `ProductImage.MediaAssetId` | `product_images` | `media_asset_id` | `uuid` NULLable |

---

## 10. Permission & Entitlement Matrix

| Action | Canonical Permission | Feature Entitlement |
|---|---|---|
| Create Draft Step 4 | `catalog.products.create` | `product_catalog` |
| Update Draft Step 4 | `catalog.products.update` | `product_catalog` |
| Variant Matrix Operations | `catalog.variants.manage` | `product_catalog` |
| Stage Variant Image | `catalog.product_media.manage` | `product_catalog` |
| Resume Step 4 Setup | `catalog.products.view` | `product_catalog` |

---

## 11. Backend Implementation Gap List against Current Unified-Commerce

1. `SaveProductDraftRequest` has no `variantConfiguration` payload graph.
2. `SaveProductDraftCommand` has no `variantConfiguration` domain command graph.
3. `ProductDraftResponse` & `ProductSetupWizardDto` have no Step 4 setup projections.
4. `TenantAdminProductRequestValidator` falls through on Step 4 validation.
5. `TenantAdminProductRepository.Wizard` lacks Step 4 option/variant matrix processor.
6. `GET /setup` endpoint does not restore Step 4 option/variant graph.
7. `GET /create-options` returns template headers without nested `Values` array.
8. No SHA-256 Cartesian `option_combination_hash` generator in backend service layer.
9. No tombstone reconciliation flow (`status = 'ARCHIVED'`) for deleted combinations.
10. `ProductOptionValue` lacks a domain method to update `ImageMediaAssetId`.

---

## 12. Required DB Migration Decision

> [!NOTE]
> **REQUIRED DATABASE MIGRATION: NO**
>
> All required database tables (`product_options`, `product_option_values`, `product_variants`, `product_variant_option_values`, `product_images`, `media_assets`) and columns (`option_combination_hash`, `is_sellable`, `image_media_asset_id`, `variant_code`, `variant_name`) already exist in EF Core ModelSnapshot and production PostgreSQL schema.

---

## 13. Remaining Blockers & Open Decisions

**ZERO unresolved implementation-blocking ambiguities remain.**

---

## 14. Final Readiness Verdict

> **STEP 4 VARIANT CONFIGURATION**  
> **SECOND BRAIN FINAL-BACKEND-FRONTEND-READY**
