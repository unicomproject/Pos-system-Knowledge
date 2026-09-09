<!-- title: Tenant Admin Add Product — 7-Step Wizard Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS Flutter Client Scope -->
<!-- last_updated: 2026-09-04 -->

# Tenant Admin Add Product — 7-Step Wizard Flutter Implementation Specification

## 1. Executive Overview

This document specifies the canonical Flutter architecture, Riverpod state management, widget hierarchy, DTO mapping, and business rule enforcement for the **Tenant Admin Add Product Wizard** (7-Step layout).

TARGET Step 2 Initial Tracking Details must live on shared wizard state/controller:

```text
initialBatchNumber
initialExpiryDate
initialSerialNumber
```

Plus Step 7 VARIANT assignment: `initialTrackingAssignedVariantId`.

Render `ProductInitialTrackingCard` from `product_type_tracking.dart` only after
`productStructureConfirmed` and structure is SIMPLE or VARIANT. Place it **above**
Tracking & Stock Rules. Do not render tracking tiles until type is selected.
Do not render the card on Step 1. Hide for BUNDLE. Do not auto-enable tracking
toggles from typed values.

## 1.1 Step 5 — VARIANT SKU & Barcode (Flutter)

Canonical contract: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification]].

### State (`Step5BarcodeSkuState`)
- `targets` / identifier rows with: productVariantId, clientCombinationKey, displayName, imageUrl?, sku, barcode, barcodeType, derived status, fieldErrors
- UI-only: `selectedVariantIds`, `searchQuery`, `statusFilter`
- `isLoading`, `isSaving`, `validatingVariantIds`, `globalError`, `expectedRowVersion`
- Do **not** put `TextEditingController`s inside immutable domain state

### Controller (`AddProductWizardController`)
Extend existing controller — do not create a parallel Step 5 controller:
`loadStep5`, `toggleStep5RowSelection`, `updateVariantSku`, `updateVariantBarcode`, `updateVariantBarcodeType`, `handleBarcodeScanComplete`, `setStep5SearchQuery`, `setStep5StatusFilter`, `openVariantIdentifierEditor`, `clearVariantIdentifierDraft`, `validateStep5Row`, `saveDraftStep5`, `saveAndContinueStep5`, `hydrateStep5FromDraft`

### DTO round-trip
`BarcodeSkuAssignmentDto` must include `barcodeType`. Never parse barcode as number. Preserve leading zeros.

### Widgets (`presentation/widgets/step_5/`)
Evolve: `step_5_barcode_sku_form.dart`, `step_5_identifier_table.dart`, `edit_variant_identifier_drawer.dart`, `duplicate_barcode_details_drawer.dart`.
- VARIANT = table-first (search, filter, multi-select UI-only, status chips, ⋮ actions).
  Select checkbox → enter SKU/Barcode (draft only) → **Apply** commits → status Incomplete→Complete.
  Unselected rows stay read-only/disabled. Save & Continue still requires every included variant SKU.
SIMPLE / BUNDLE = compact editors + one-row assignment table (green selected dot, Scan, pencil). Apply commits then clears SKU/barcode fields. Edit drawer hides Barcode Type in UI. When barcode is non-empty, persist type internally (valid GTIN checksum → EAN13/UPCA/EAN8, otherwise CODE128). Validate barcode+type on Step 5 Save & Continue (field error on the barcode input). Do not surface that validation first on Step 7 Create.
**No Auto-generate SKUs.** Retire Additional Barcode widgets from Step 5 surface only after confirming unused elsewhere.

### Scanner
HID keyboard wedge: focus barcode → characters → trailing Enter completes → validate once → debounce draft save (not per digit).

---

## 1.2 Step 6 — Pricing & Tax (Flutter)

Canonical: [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]] §6.1–6.5.  
UI: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]] §4.3.

### Shared
- `createOptions.currencyCode` from `GET …/create-options` (tenant base currency). Price prefix / preview / rate labels only — **no currency banner**, no hard-coded `LKR`, no currency dropdown.
- Widget: `step_6_pricing_tax_form.dart`. Draft/resume must not wipe Step 6 on rebuild.
- Wizard-create / draft: adapt existing `pricingTax` DTO — **extend**, do not invent parallel endpoints. Accept `taxId` / `taxClassId` alias; persist `taxExclusive`.
- Permissions UX: `canManagePricing`, tax lookup, cost redaction per permission matrix. Backend remains authoritative.

### SIMPLE / BUNDLE (IMPLEMENTED)
- `_buildSimpleForm`: Standard Selling Price, Tax Class (rate in label), Tax Exclusive/Inclusive cards, `_TaxPreviewCard`.
- No Cost / Discount / Effective Tax Rate field / currency banner.
- Preview math: `presentation/utils/step_6_tax_preview.dart` `computeStep6TaxPreview`.
- Continue: selling price > 0 + tax; Cost **not** required.
- Tests: `test/features/tenant_admin/products/step_6_pricing_tax_form_test.dart`.

### VARIANT (IMPLEMENTED — 2026-09-04)
- Shell: `step_6_pricing_tax_form.dart` switches to `step_6_variant_pricing_tax_form.dart` when `productStructure == VARIANT`.
- Per-variant Selling Price table keyed by `productVariantId` / `clientCombinationKey` (never row index / SKU / label).
- **Set Same Price for All Variants** + **Apply to All** = local bulk helper only (confirm when overwriting; not serialized as parent product price). No “Default Selling Price” / “Default Price” column on VARIANT UI.
- Table columns: Variant, SKU, Selling Price, Status, Actions.- Derived Priced/Pending counts and Price Range from `variantPrices`.
- Tax Class + Tax Exclusive/Inclusive product-common; Effective Tax Rate read-only from create-options / setup projection.
- Continue: every **included** variant `sellingPrice > 0` + tax; Cost not required on this screen.
- Wire payload: `pricingTax.variantPrices[]` full snapshot via `toSnapshotJson()` (keeps `sellingPrice: null` for PENDING).
- SIMPLE must not send `variantPrices`; VARIANT must not send scalar `standardSellingPrice` as multi-variant authority.
- Step 7 Review: VARIANT shows priced count / range / compact per-variant list (no Default helper).
- Utils: `presentation/utils/step_6_variant_pricing.dart`.
- Tests: `step_6_pricing_tax_form_test.dart`, `step_6_variant_pricing_util_test.dart`.
- Closure: [[../15_IMPLEMENTATION_TRACKING/99_AUDITS/PRODUCT_SETUP_STEP6_VARIANT_PRICING_TAX_FLUTTER_IMPLEMENTATION_CLOSURE_2026-09-04]]

---

## 1.3 Step 7 — Create success screen (Flutter)

Canonical: [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Review_Create_Specification]] FR-RC-014–014c.  
UI: [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]] §6.1.

- After `createProductFromWizard()` returns true, `AddProductWizard` shows `product_created_success.dart` and **does not** show a create-success toast or `go` to Product List.
- Snapshot: `ProductCreateSuccessSnapshot.fromWizard` (name, code/SKU, status, type, SKU count, variant count for VARIANT, created-at, primary image). No hardcoded sample products.
- **View Product** → `/tenant-admin/products/{productId}` (product detail view, not edit).
- **Add Another Product** → `startFreshWizard()` (Step 1). If the current route is resume/duplicate, navigate to `/tenant-admin/products/add`.
- **Back to Products** → `/tenant-admin/products`.
- Still invalidate list / summary / local-draft providers so Product List is current on return.
- Tests: `test/features/tenant_admin/products/product_created_success_test.dart`.

---

CURRENT Flutter (2026-09-01): fields exist on `AddProductWizardState`; card is on
Step 2 after type select; batch/serial text controllers are synced from the
wizard. Confirmation dialog before destructive clear remains a GAP
(continue currently applies the clear plan with `confirmed: true`).

---

## 1.1 Category picker (LOCKED)

Product Setup **must** load Category options from `GET /api/v1/tenant-admin/products/create-options` (`product_catalog` + `catalog.products.create`).

Do **not** call Category Management `GET /api/v1/categories/tree` or `lib/features/tenant_admin/categories/` repositories to populate this picker.

**IMPLEMENTED backend:** single hierarchy-aware `categories[]` (`id`, `categoryCode`, `categoryName`, `parentCategoryId`, `level`, `hierarchyPath`, `hasChildren`, `sortOrder`) covering levels 1–5. ACTIVE status in response. Persist selected `categoryId` only. Path `A → B → C` selected `C` stores `C` only.

**BR-CAT-PRODUCT-SELECT-001 (Flutter applies for UX parity):** Category is effectively selectable only when Category and **all ancestors** are ACTIVE. **Backend enforces** this in create-options and Product create/update.

**HISTORICAL / LEGACY COMPATIBILITY:** prior `categories` + `subCategories` was a flat child-Category representation, not a SubCategory entity.

Shared query/DTO types may be reused only if they stay consistent with Product Setup authorization ownership.

---

## 2. Directory & Component Architecture

```text
lib/features/tenant_admin/products/
├── application/
│   ├── usecases/
│   │   ├── save_product_draft_usecase.dart
│   │   └── get_product_setup_usecase.dart
├── data/
│   ├── datasources/
│   │   ├── tenant_product_remote_datasource.dart
│   ├── mappers/
│   │   └── tenant_product_mapper.dart
│   └── models/
│       ├── save_product_draft_request_dto.dart
│       ├── product_draft_response_dto.dart
│       └── product_setup_wizard_dto.dart
└── presentation/
    ├── controllers/
    │   └── add_product_wizard_controller.dart
    ├── state/
    │   ├── add_product_wizard_state.dart
    │   └── step4_variant_configuration_state.dart
    ├── widgets/
│   ├── step_1_basic_details_form.dart
│   ├── product_initial_tracking_card.dart   // rendered on Step 2 after type select
│   ├── step_2_product_type_tracking_form.dart
    │   ├── step_3_units_pack_conversion_form.dart
    │   ├── step_4_variant_configuration_form.dart
    │   ├── step_6_pricing_tax_form.dart
    │   ├── edit_variant_drawer.dart
    │   ├── delete_variant_modal.dart
    │   ├── step_7_review_create.dart
    │   ├── product_created_success.dart
    │   └── product_summary_card.dart
    └── screens/
        └── add_product_wizard_screen.dart
```

---

## 3. Riverpod State Architecture for Step 4

### 3.1 `Step4VariantConfigurationState`
```dart
class Step4VariantConfigurationState {
  final List<AttributeConfigRow> attributeRows;
  final List<GeneratedVariantRow> generatedVariants;
  final Set<String> excludedCombinationHashes;
  final String? selectedVariantIdForEdit;
  final bool isGenerating;
  final bool isSaving;
  final Map<String, String> fieldErrors;
  final int? expectedRowVersion;

  int get totalGeneratedCount => generatedVariants.length;
  int get includedCount => generatedVariants.where((v) => v.isIncluded).length;
  int get activeAttributeCount => attributeRows.where((r) => r.isValid).length;

  /// Live Estimated Variant Count — Cartesian product of selected value counts.
  /// Returns 0 when configuration is incomplete (no valid rows or any row has zero values).
  int get estimatedVariantCount { /* product of row.selectedValues.length for valid rows; else 0 */ }

  /// Dynamic summary e.g. "Colour (3) × Capacity (2) = 6 variants"
  String get estimatedVariantCountSummary { /* built from current attribute display names */ }
}
```

> **Estimated Variant Count contract**: Computed locally in Flutter. No API call. Not persisted as authoritative data. Recomputed on draft reopen from restored attribute/value graph. See [[../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification#3.4 Estimated Variant Count (Live UX Preview)]].

### 3.2 `AddProductWizardController` Methods for Step 4
- `loadStep4()`: Restores step 4 state graph from `ProductSetupWizardDto`.
- `addAttributeRow()`: Appends new attribute configuration row.
- `removeAttributeRow(int index)`: Removes row from configuration.
- `selectAttribute(int index, String templateId)`: Selects option template and loads active values.
- `selectValues(int index, List<String> valueIds)`: Selects multi-select values.
- `generateVariants()`: Recomputes Cartesian matrix in memory, preserving custom display labels, image overrides, and `Include Variant` states.
- `openEditDrawer(String variantId)`: Opens right-side edit drawer for selected variant.
- `updateVariantDisplayLabel(String variantId, String label)`: Updates `variant_name`.
- `toggleVariantInclusion(String variantId, bool included)`: Sets `is_sellable = included`. (Label: `Include Variant`).
- `stageVariantImage(String variantId, File file)`: Uploads image via staging endpoint and sets `exactImageMediaAssetId`.
- `applyColourGroupImage(String optionValueId, String mediaAssetId)`: Sets `imageMediaAssetId` on option value.
- `removeVariantImageOverride(String variantId)`: Clears variant exact image override.
- `saveDrawerChanges()`: Applies drawer edits to wizard state.
- `confirmDeleteVariant(String variantId)`: Archives combination tombstone (`status = 'ARCHIVED'`).
- `saveDraftStep4()`: Invokes `saveDraft(currentSetupStep: 4, advanceStep: false)`.
- `saveAndContinueStep4()`: Invokes `saveAndContinue(currentSetupStep: 4, advanceStep: true)`. Advances to Step 5.

---

## 4. Business Rule Gating & UI Invariants

- **Toggle Label**: Always use **`Include Variant`** (never "Availability").
- **Polymorphic Rendering**: Renders Variant Configuration when `productStructure == 'VARIANT'`.
- **Estimated Variant Count Card**: Render only for VARIANT. Hide for SIMPLE and BUNDLE Step 4 modes. Update on every attribute/value mutation without network I/O.
- **Validation**: Rejects `Save & Continue` if zero attributes are defined, any attribute has zero selected values, or zero variants are included.
- **Drawer Isolation**: Edits in `EditVariantDrawer` are held in local drawer state until `Save Changes` is clicked. `Cancel` or clicking background overlay discards uncommitted drawer changes.

---

## 5. Route & Resume Architecture

- **Route Path**: `/tenant-admin/products/add`
- **Resume Route Path**: `/tenant-admin/products/draft/:productId`
- **Edit Route Path**: `/tenant-admin/products/edit/:productId`
- **GoRouter Guard**: UX only. Checks `catalog.products.create` / `catalog.products.update`. **Not** a security boundary. Backend remains authoritative.

### Wizard Capability Model (UX only)

Derive **before** Add Product starts from the authenticated permission catalog:

```text
canCreateProduct
canUpdateProduct
canPublishProduct
canManageProductMedia
canManageProductChannels
canManageVariants
canManageBundleComponents
canManageBarcodes
canManagePricing
canViewProductCost
canLookupTaxClasses
canViewStock
canUseAdvancedInventoryTracking
```

Start only if `canCreateProduct` + `canManageBarcodes` + `canManagePricing` + `canLookupTaxClasses`.
Disable VARIANT without `canManageVariants`. Disable BUNDLE without `canManageBundleComponents`.
Hide/disable media, channels, cost, and advanced tracking according to the matrix.
Canonical: [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

---

## 6. Concurrency & Optimistic Row Versioning

- Every Save Draft or Save & Continue response returns `rowVersion`.
- Subsequent step updates send `expectedRowVersion` in request body. Stale edit returns HTTP 409.

---

## 7. Related Specifications
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Product_Barcode_SKU_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_7_Step_Contract]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]
- [[../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_INITIAL_TRACKING_DETAILS_STEP2_COLLECTION_DECISION_2026-09-01]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification]]
- [[../02_ACCESS_CONTROL/Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../04_MODULE_KNOWLEDGE/09_Catalog_Master_Data/Tenant_Admin_Category_Management_Specification]]
- [[../15_IMPLEMENTATION_TRACKING/Audits/TENANT_ADMIN_CATEGORY_MANAGEMENT_FINAL_CONTRACT_HARDENING_2026-08-27]]

## Implementation-Grade Flutter File

State flow concepts:
```text
BundleConfigurationState
BundleConfiguration
BundleComponent
BundleComponentCandidate
BundleAvailabilitySummary
BundleComponentDrawerState
```

Controller/Notifier responsibilities MUST include:
```text
loadBundleConfiguration
searchCandidates
selectCandidate
selectExactVariant
changeRequiredQuantity
calculateSupportsBundles
addComponentLocally
editComponentLocally
removeComponentLocally
refreshOutletAvailability
recalculateSummary
saveDraft
saveAndContinue
restoreDraft
handle409Conflict
```

State Flow: `UI → Controller / Notifier → Repository → API Service`
Drawer temporary state isolated from Main Bundle wizard state until `Add to Bundle` is committed locally.
