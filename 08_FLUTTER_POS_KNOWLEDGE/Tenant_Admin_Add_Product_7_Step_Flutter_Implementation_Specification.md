<!-- title: Tenant Admin Add Product — 7-Step Wizard Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS Flutter Client Scope -->
<!-- last_updated: 2026-08-11 -->

# Tenant Admin Add Product — 7-Step Wizard Flutter Implementation Specification

## 1. Executive Overview

This document specifies the canonical Flutter architecture, Riverpod state management, widget hierarchy, DTO mapping, and business rule enforcement for the **Tenant Admin Add Product Wizard** (7-Step layout).

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
    │   ├── step_2_product_type_tracking_form.dart
    │   ├── step_3_units_pack_conversion_form.dart
    │   ├── step_4_variant_configuration_form.dart
    │   ├── step_6_pricing_tax_form.dart
    │   ├── edit_variant_drawer.dart
    │   ├── delete_variant_modal.dart
    │   ├── product_wizard_actions_footer.dart
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
}
```

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
- **Validation**: Rejects `Save & Continue` if zero attributes are defined, any attribute has zero selected values, or zero variants are included.
- **Drawer Isolation**: Edits in `EditVariantDrawer` are held in local drawer state until `Save Changes` is clicked. `Cancel` or clicking background overlay discards uncommitted drawer changes.

---

## 5. Route & Resume Architecture

- **Route Path**: `/tenant-admin/products/add`
- **Resume Route Path**: `/tenant-admin/products/draft/:productId`
- **Edit Route Path**: `/tenant-admin/products/edit/:productId`
- **GoRouter Guard**: Checks permissions `catalog.products.create` / `catalog.products.update` and `catalog.variants.manage`.

---

## 6. Concurrency & Optimistic Row Versioning

- Every Save Draft or Save & Continue response returns `rowVersion`.
- Subsequent step updates send `expectedRowVersion` in request body. Stale edit returns HTTP 409.

---

## 7. Related Specifications
- [[../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_7_Step_UI_UX_Specification]]

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
