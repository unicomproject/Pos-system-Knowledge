<!-- title: Product Core Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

# Product Core Technical Contract

## Purpose

Defines the technical implementation contract for `Product_Core` in the OneVerz POS MVP scope.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/tenant-admin/products`, `/api/v1/tenant-admin/products/draft`, `/api/v1/tenant-admin/products/{id}/setup`, `/api/v1/pos/products`, `/api/v1/storefront/products` |
| Draft API Pipeline | Single `PUT /api/v1/tenant-admin/products/{productId}/draft` endpoint supporting polymorphic step graph payloads (`currentSetupStep=1..8`). |
| Request format | Typed request DTOs (`SaveProductDraftRequest`); step-specific graphs passed via polymorphic payload structures. |
| Response format | Typed `ProductDraftResponse` and `ProductSetupWizardDto` with full setup projections. |
| Tenant context | Resolved server-side for tenant-owned records. |
| Bundle Candidate Search | `GET /api/v1/tenant-admin/products/{productId}/bundle-component-candidates` with standard pagination (`items[]`, `page`, `pageSize`, `totalCount`). Includes `categoryId`, `categoryName`. |
| Exact Variant Selector | `GET /api/v1/tenant-admin/products/{bundleProductId}/bundle-component-candidates/{candidateProductId}/variants?outletId={outletId}` to return only eligible active Variants. |

### Bundle Configuration DTO
The canonical Step 4 payload structure:
```json
{
  "currentSetupStep": 4,
  "wizardAction": "SAVE_DRAFT",
  "expectedRowVersion": 7,
  "bundleConfiguration": {
    "comboDefinitionId": null,
    "components": [
      {
        "comboComponentId": null,
        "componentProductId": "uuid",
        "componentVariantId": null,
        "componentUomId": "uuid",
        "requiredQuantity": 2.0000,
        "sortOrder": 1
      }
    ]
  }
}
```
*Note: Derived fields like `availableStock`, `supportsBundles`, `bundleAvailableQuantity`, `limitingComponent`, `trackingLabel`, `estimatedCost` MUST NOT be sent in the persisted payload.*

### Barcode & SKU DTO
The canonical Step 5 payload structure:
```json
{
  "currentSetupStep": 5,
  "wizardAction": "SAVE_AND_CONTINUE",
  "advanceStep": true,
  "expectedRowVersion": 10,
  "baseSku": "MAIN-SKU-01",
  "parentProductBarcode": "8901234567890",
  "variantIdentifiers": [
    {
      "productVariantId": "guid...",
      "sku": "VAR-SKU-01",
      "barcode": "8901234567891"
    }
  ],
  "additionalBarcodes": [
    {
      "barcodeId": "guid...", 
      "barcode": "8901234567892",
      "barcodeType": "EAN-13",
      "productVariantId": null,
      "uomId": "guid...",
      "quantityPerScan": 6,
      "isPrimary": false,
      "status": "ACTIVE"
    }
  ]
}
```

## Database Contract

| Table | Role |
|---|---|
| `products` | Stores parent product records, setup steps (`current_setup_step`), status, and row version. |
| `product_variants` | Stores sellable variant details, SKU, `variant_name` (`displayLabel`), `is_sellable` (`included`), `option_combination_hash` (`char(64)`), and UOM links for VARIANT products. |
| `product_options` | Stores product option headers owned by tenant. |
| `product_option_values` | Stores product option values owned by tenant (`image_media_asset_id`). |
| `product_variant_option_values` | Maps `product_variants` to `product_option_values`. |

> [!NOTE]
> Database Migration Required: **NO**. All required tables and columns already exist in EF Core ModelSnapshot.

## Related Specifications

- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Type_Tracking_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[05_Tenant_Admin_Add_Product_8_Step_Contract]]

## Bundle Technical Contract

### Structure-Aware Navigation
The navigation logic must NOT use a generic `nextStep = currentStep + 1` for Bundles.
Use a semantic resolver such as `ResolveNextApplicableSetupStep(...)`.
```text
If productStructure = BUNDLE:
    completedSetupStep = 2
    Step 3 applicability = NOT_APPLICABLE
    targetSetupStep = 4
```
Flutter must obey `targetSetupStep = 4`. 

### Legacy Draft Normalization
For stale historical drafts containing `productStructure = BUNDLE` and `currentSetupStep = 3`:
`GET setup` → detect BUNDLE + Step 3 → normalize navigation target to Step 4 → never render Units & Pack Conversion.

### Draft Resume
`GET /api/v1/tenant-admin/products/{productId}/setup` restores persisted fields (`comboDefinitionId`, `comboComponentId`, `componentProductId`, `componentVariantId`, `componentUomId`, `requiredQuantity`, `sortOrder`).
Display projection is derived from selected Outlet. Derived projections must not be stored as Bundle configuration truth.

### Error Contract
Canonical Bundle error codes mapping to `errorCode`, `field`, `message`, and `HTTP status`:
- `product.bundle.minimum_components_required`
- `product.bundle.component_quantity_invalid`
- `product.bundle.component_quantity_precision_invalid`
- `product.bundle.exact_variant_required`
- `product.bundle.variant_product_mismatch`
- `product.bundle.duplicate_component`
- `product.bundle.component_inactive`
- `product.bundle.component_archived`
- `product.bundle.component_not_inventory_tracked`
- `product.bundle.nested_bundle_not_allowed`
- `product.bundle.self_reference_not_allowed`
- `product.bundle.component_uom_invalid`
- `product.bundle.outlet_not_accessible`
- `product.bundle.component_no_longer_eligible`
- `product.bundle.permission_denied`
- `product.bundle.entitlement_required`
- `product.bundle.row_version_conflict` (HTTP 409)

### Audit Contract
Persisted mutations must trigger exact audit event names:
- `PRODUCT_BUNDLE_CONFIGURATION_SAVED`
- `PRODUCT_BUNDLE_COMPONENT_ADDED`
- `PRODUCT_BUNDLE_COMPONENT_UPDATED`
- `PRODUCT_BUNDLE_COMPONENT_REMOVED`
Metadata: `tenantId`, `ProductId`, `ComboDefinitionId`, `ComponentProductId`, `ComponentVariantId`, old quantity, new quantity, actor, timestamp, `rowVersion`. Unsaved drawer changes are not audited.

### NFR (Non-Functional Requirements)
- **Security**: Strict tenant isolation, server-side permissions/entitlement, Outlet authorization, no stock/cost leakage. Never trust client available stock or tracking type; server re-resolves them.
- **Performance**: Server-side paginated search, debounce, request cancellation. Avoid N+1 queries; batched inventory lookups only.
- **Reliability**: Failed API does not clear local components. Failed Save does not advance.
- **Consistency**: Final POS sale must revalidate actual inventory transactionally.
- **Concurrency & Atomicity**: Product rowVersion validation (409). Bundle save atomic. POS component deduction atomic.
