<!-- title: Product Option Templates & Variant Configuration Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-13 -->

# Product Option Templates & Variant Configuration Functional Rules

## Purpose

Defines business and UX rules for `Product_Option_Variant_Configuration` in the OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens, responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Option templates standardize common values such as size, color, portion, or type.
- Variant option combinations identify sellable variants via deterministic `option_combination_hash` (SHA-256). Unsaved variants are identified by `clientCombinationKey`.
- **Add Product Step 4 Variant Configuration**:
  - Stepper Step 4 Label: `Product Configuration`.
  - Page Heading: `Variant Configuration`.
  - Toggle Label: **`Include Variant`** (CANONICAL MANDATE: NEVER use "Availability" for this toggle).
  - Step 4 defines options, option values, Cartesian matrix generation, display labels, variant inclusion toggles, and variant image overrides.
  - Step 4 MUST NOT include SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility controls (belonging to Steps 5, 6, and 7).
  - Image fallback priority: Exact Variant Override $\rightarrow$ Colour Group Image (`product_option_values.image_media_asset_id`) $\rightarrow$ Step 1 Primary Product Image $\rightarrow$ Standard Placeholder.
  - Delete Variant Action: Archives combination tombstone (`status = 'ARCHIVED'`). Operational variants with history cannot be deleted. Tombstoned combinations NEVER automatically resurrect upon regeneration.
  - Variant Lifecycle: Wizard draft variants remain in `DRAFT` status until Step 8 publishes them.
  - Variant UOM: Inherited from Step 3 if Track Inventory is ON; resolved via canonical system default UOM resolver if OFF.
- POS variant resolution uses option and option-value IDs, completes required groups, disables values that cannot yield an eligible variant, clears incompatible choices, and requires exactly one match. See [[../../21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement (`product_catalog`) and permissions (`catalog.products.create` or `catalog.products.update` + `catalog.variants.manage`) pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement (`product_catalog`), and user permission allow it.
- Responsive UI supports Desktop, Laptop, and Tablet layouts while preserving identical business rules.
- Right-side sliding drawer for `Edit Variant`. Centered confirmation modal for `Delete Variant`.
- Do not hardcode role names as authorization logic.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving. Treat `clientCombinationKey` as an untrusted input.
- Recompute Cartesian variant matrix server-side upon Save Draft / Save & Continue. Reconcile Stable ProductOption and ProductOptionValue identities.
- Enforce `MaxVariantCombinationsPerProduct = 100` limit.
- Return standard 400, 401, 403, 404, 409, and 500 responses. Atomic save is required.

## Related Specifications

- [[Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract]]
