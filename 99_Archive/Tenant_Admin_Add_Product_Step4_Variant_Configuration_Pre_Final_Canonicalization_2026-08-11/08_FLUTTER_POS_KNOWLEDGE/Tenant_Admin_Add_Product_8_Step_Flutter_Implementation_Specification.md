<!-- title: Tenant Admin Add Product 8-Step Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

# Tenant Admin Add Product 8-Step Flutter Implementation Specification

## 1. Feature Folder Architecture

The Flutter Add Product implementation must be organized under clean feature boundaries within:
`lib/features/tenant_admin/products/`

```text
lib/features/tenant_admin/products/
├── data/
│   ├── models/
│   │   ├── save_product_draft_request_dto.dart
│   │   ├── update_product_draft_step_request_dto.dart
│   │   ├── product_draft_response_dto.dart
│   │   ├── publish_product_request_dto.dart
│   │   └── tenant_product_create_options_dto.dart
│   ├── datasources/
│   │   └── tenant_product_remote_data_source.dart
│   └── repositories/
│       └── tenant_product_repository_impl.dart
├── domain/
│   ├── entities/
│   │   ├── add_product_wizard_state.dart
│   │   └── step_validation_result.dart
│   └── repositories/
│       └── tenant_product_repository.dart
└── presentation/
    ├── controllers/
    │   └── add_product_wizard_controller.dart
    ├── providers/
    │   └── add_product_wizard_providers.dart
    ├── screens/
    │   └── add_product_screen.dart
    └── widgets/
        ├── setup_stepper.dart
        ├── product_image_upload_card.dart
        ├── product_images_manager_panel.dart
        ├── product_image_tile.dart
        ├── product_image_guidelines_card.dart
        ├── wizard_actions_footer.dart
        ├── steps/
            ├── basic_details.dart
            ├── product_type_tracking.dart
            ├── units_pack_conversion.dart
            ├── product_configuration.dart
            ├── barcode_sku.dart
            ├── pricing_tax.dart
            ├── channel_visibility.dart
            └── review_create.dart
```

---

## 2. Responsibilities Boundary

- **Widgets (`step_2_type_tracking_step.dart`, etc.)**: Pure UI components rendering form controls and consuming state via Riverpod providers. Must NOT invoke Dio/HTTP directly.
- **Controller (`add_product_wizard_controller.dart`)**: StateNotifier/AsyncNotifier orchestrating wizard state, current step index, field validation, dirty state, and draft saves.
- **Repository (`tenant_product_repository.dart`)**: Maps domain entities to DTOs and handles state updates.
- **Data Source (`tenant_product_remote_data_source.dart`)**: Performs typed Dio HTTP API calls to backend endpoints (`PUT /api/v1/tenant-admin/products/{id}/draft`).

---

## 3. Canonical Wizard State Model

```dart
class AddProductWizardState {
  final int currentStep; // 1 to 8
  final String? productId; // Null for fresh unsaved product
  final String status; // DRAFT, ACTIVE, etc.
  final Map<String, dynamic> step1Data;
  final Map<String, dynamic> step2Data;
  final Map<String, dynamic> step3Data;
  final Map<String, dynamic> step4Data;
  final Map<String, dynamic> step5Data;
  final Map<String, dynamic> step6Data;
  final Map<String, dynamic> step7Data;
  final bool isDirty;
  final bool isSubmitting;
  final int rowVersion;
  final Map<String, String> fieldErrors;

  // Single canonical state flags synchronized across steps:
  final String productStructure; // SIMPLE, VARIANT, BUNDLE (Default: SIMPLE)
  final bool trackInventory; // Shared canonical flag with Step 1 (Default: true)
  final bool batchTracking; // Default: false
  final bool expiryTracking; // Default: false
  final bool serialTracking; // Default: false
  final bool posSellable;
  final bool allowOnlineSale;
  final bool desiredPublishActive;

  const AddProductWizardState({ ... });
}
```

---

## 4. Step 2 State & Business Rule Gating (Flutter implementation)

- **Product Structure Selection**: Selecting a Product Structure card updates `productStructure` in `AddProductWizardState`.
- **Inventory Off Lock**: When `trackInventory == false`, the UI automatically disables all sub-switches (`batchTracking`, `expiryTracking`, `serialTracking`) and sets their values to `false`.
- **Serial Precedence**: Toggling `serialTracking = true` automatically sets `batchTracking = false` and `expiryTracking = false`.
- **Expiry Requirement**: Gated on `trackInventory && batchTracking`. Toggling `batchTracking = false` automatically forces `expiryTracking = false`.
- **Skip Button Handling**: On Step 2 (`currentStep == 2`), the `Skip` CTA button is hidden/disabled.

---

## 5. Route & Resume Architecture

- **Route Path**: `/tenant-admin/products/add` (Fresh Add Product wizard)
- **Resume Route Path**: `/tenant-admin/products/draft/:productId` (Resumes persisted draft at `current_setup_step`)
- **Edit Route Path**: `/tenant-admin/products/edit/:productId` (Opens 8-step prefilled wizard with published product data)
- **GoRouter Guard**: Validates `catalog.products.create` / `catalog.products.update` permissions before route entry.

---

## 6. Concurrency & Optimistic Row Versioning

- Every Save Draft or Save & Continue response returns `rowVersion`.
- Subsequent step updates send `expectedRowVersion` in request body.
- If backend returns `HTTP 409 Conflict` (stale edit), controller catches the exception and prompts "Draft modified in another session. Please reload."

---

## 7. Related Documents
- [[04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
- [[07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
