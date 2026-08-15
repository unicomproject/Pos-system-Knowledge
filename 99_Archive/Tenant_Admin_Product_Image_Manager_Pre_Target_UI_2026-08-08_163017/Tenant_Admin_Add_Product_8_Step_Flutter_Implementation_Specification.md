<!-- title: Tenant Admin Add Product 8-Step Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

# Tenant Admin Add Product 8-Step Flutter Implementation Specification

## 1. Feature Folder Architecture

The Flutter Add Product implementation must be organized under clean feature boundaries within:
`lib/features/tenant_admin/products/`

```text
lib/features/tenant_admin/products/
├── data/
│   ├── models/
│   │   ├── save_product_draft_request_dto.dart
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
        ├── status_options_card.dart
        ├── product_summary_card.dart
        ├── product_image_manager.dart
        ├── wizard_actions_footer.dart
        └── steps/
            ├── step_1_basic_details_step.dart
            ├── step_2_type_tracking_step.dart
            ├── step_3_units_conversion_step.dart
            ├── step_4_product_configuration_step.dart
            ├── step_5_barcode_sku_step.dart
            ├── step_6_pricing_tax_step.dart
            ├── step_7_channel_visibility_step.dart
            └── step_8_review_create_step.dart
```

---

## 2. Responsibilities Boundary

- **Widgets (`step_1_basic_details_step.dart`, etc.)**: Pure UI components rendering form controls and consuming state via Riverpod providers. Must NOT invoke Dio/HTTP directly.
- **Controller (`add_product_wizard_controller.dart`)**: StateNotifier/AsyncNotifier orchestrating wizard state, current step index, field validation, dirty state, and draft auto-saves.
- **Repository (`tenant_product_repository.dart`)**: Maps domain entities to DTOs and handles offline caching/retry logic.
- **Data Source (`tenant_product_remote_data_source.dart`)**: Performs typed Dio HTTP API calls to backend endpoints.

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
  final bool trackInventory;
  final bool posSellable;
  final bool allowOnlineSale;
  final bool desiredPublishActive;

  const AddProductWizardState({ ... });
}
```

---

## 4. State Synchronization Rules

- Changing `trackInventory` in Step 1 immediately updates `AddProductWizardState.trackInventory`. Step 2 opens pre-populated with this same boolean state.
- Changing `posSellable` in Step 1 updates Step 7 POS channel visibility state.
- Changing `allowOnlineSale` in Step 1 updates Step 7 Online Store visibility state.
- No duplicate or out-of-sync local states are permitted.

---

## 5. Route & Resume Architecture

- **Route Path**: `/tenant-admin/products/add` (Fresh Add Product wizard)
- **Resume Route Path**: `/tenant-admin/products/draft/:productId` (Resumes persisted draft at `current_setup_step`)
- **Edit Route Path**: `/tenant-admin/products/edit/:productId` (Opens 8-step prefilled wizard with published product data)
- **GoRouter Guard**: Validates `catalog.products.create` / `catalog.products.update` permissions before route entry.

---

## 6. Concurrency & Optimistic Row Versioning

- Every Save Draft or Save & Continue response returns `rowVersion`.
- Subsequent step updates send `rowVersion` in header/payload.
- If backend returns `HTTP 409 Conflict` (stale edit), controller catches the exception and prompts "Draft modified in another session. Please reload."

---

## 7. Related Documents
- [[04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
- [[07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
