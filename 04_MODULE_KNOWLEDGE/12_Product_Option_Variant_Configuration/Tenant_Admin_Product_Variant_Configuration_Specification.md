# Tenant Admin Add Product — Step 4: Variant Configuration Specification

<!-- title: Tenant Admin Add Product — Step 4: Variant Configuration Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

## 1. Executive Summary & Core Architectural Principles

This document defines the final canonical Second Brain specification for **Step 4: Variant Configuration** within the Tenant Admin **Add Product Wizard**.

### 1.1 Core Business Purpose
Step 4 allows Tenant Admin users to configure multi-variant products (e.g. apparel with Size, Colour, Material combinations) by defining options, selecting option values, generating a Cartesian variant matrix, customising individual variant labels and images, and toggling variant inclusion before configuring pricing, inventory, and sales channel visibility in downstream steps.

### 1.2 Polymorphic Step 4 Behavior
Step 4 is polymorphic based on `product_structure` selected in Step 2:
1. **SIMPLE Product (`product_structure = SIMPLE`)**: Step 4 is **NOT_APPLICABLE** and auto-bypassed.
2. **VARIANT Product (`product_structure = VARIANT`)**: Step 4 renders this **Variant Configuration Specification**.
3. **BUNDLE / Kit Product (`product_structure = BUNDLE`)**: Step 4 renders **Bundle/Kit Component Configuration** (assembly of component products/variants).

> [!IMPORTANT]
> Step 4 for VARIANT mode defines options, option values, combination matrix generation, display labels, variant inclusion toggles, and variant image overrides. It MUST NOT include SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility controls. Those belong strictly to Step 5 (`Barcode & SKU`), Step 6 (`Pricing & Tax`), and Step 7 (`Channel & Store Visibility`).

---

## 2. Step Applicability & Navigation Matrix

### 2.1 Applicability Rules
1. **VARIANT Product + Track Inventory ON (`is_stock_tracked = true`)**:
   - Step 3 (`Units & Pack Conversion`) is **REQUIRED**.
   - Step 4 (`Product Configuration` — Variant Configuration) is **REQUIRED**.
   - Entry to Step 4 is from Step 3 via Save & Continue.
2. **VARIANT Product + Track Inventory OFF (`is_stock_tracked = false`)**:
   - Step 3 is **NOT_APPLICABLE** (auto-bypassed).
   - Step 4 (`Product Configuration` — Variant Configuration) is **REQUIRED**.
   - Entry to Step 4 is directly from Step 2 via Save & Continue.
3. **SIMPLE Product (Track Inventory ON or OFF)**:
   - Step 4 is **NOT_APPLICABLE** (bypassed).
4. **BUNDLE Product**:
   - Step 4 is **REQUIRED** for Bundle Component Assembly.

### 2.2 Navigation Table for VARIANT Mode

| Setup Action | Current Step | Condition / Validation | Target Step | Persistence / API Action |
|---|---|---|---|---|
| Back | Step 4 | Track Inventory ON | Step 3 | Draft state preserved in local/remote state |
| Back | Step 4 | Track Inventory OFF | Step 2 | Draft state preserved in local/remote state |
| Save Draft | Step 4 | None | Step 4 | `PUT /api/v1/tenant-admin/products/{productId}/draft` (`currentSetupStep=4`, `wizardAction="SAVE_DRAFT"`) |
| Save & Continue | Step 4 | Valid options + values + $\ge 1$ included variant | Step 5 | `PUT /api/v1/tenant-admin/products/{productId}/draft` (`currentSetupStep=4`, `wizardAction="SAVE_AND_CONTINUE"`, `targetSetupStep=5`) |

---

## 3. Canonical User Journey & Three UI States

Step 4 for Variant products consists of three distinct UI states:

### 3.1 State A: Variant Configuration Main Screen

- **Stepper Header**: Step 4 label reads `Product Configuration`.
- **Page Heading**: `Variant Configuration`.
- **Define Attributes Section**:
  - Attribute Name dropdown (select from active tenant/platform option templates e.g. Size, Colour, Material).
  - Values multi-select tag input (select active option values belonging to the chosen attribute).
  - Trash icon button (`Remove Attribute Row`): removes attribute row from configuration.
  - `+ Add Attribute` button: appends a new attribute row.
- **Generate Variants Action**:
  - Primary button `Generate Variants`.
  - Calculates Cartesian product of all selected attribute values ($N_1 \times N_2 \times \dots \times N_k$).
- **Configuration Summary Card**:
  - Displays total generated variants count (e.g. `6 Variants Generated`), active attributes count (e.g. `3 Attributes Defined`), and included variants count (e.g. `5 Included`).
- **Generated Variants Table**:
  - Columns: `Variant` (shows `combinationLabel` e.g. `Red / S`), `Image` (thumbnail preview), `Actions` (`Edit` icon, `Delete` icon).
- **Footer Actions**:
  - `Back` (Secondary outline)
  - `Save Draft` (Secondary filled)
  - `Save & Continue` (Primary orange)

#### Cartesian Example:
- Attribute 1: Size = S, M, L (3 values)
- Attribute 2: Colour = Red, Blue (2 values)
- Attribute 3: Material = Standard (1 value)
- Total Cartesian Combinations = $3 \times 2 \times 1 = 6$.
- Generated Combinations: `Red / S / Standard`, `Red / M / Standard`, `Red / L / Standard`, `Blue / S / Standard`, `Blue / M / Standard`, `Blue / L / Standard`.

### 3.2 State B: Edit Variant Right-Side Drawer

Clicking `Edit` on any variant table row opens a sliding right-side drawer.

- **Drawer Header**: `Edit Variant`
- **Fields & Controls**:
  1. `Variant Name / Combination Label` (Read-only text field e.g. `Red / S`).
  2. `Attribute Summary` (Read-only badges e.g. `Colour: Red`, `Size: S`).
  3. `Variant Image`:
     - Displays resolved image thumbnail.
     - `Change Image` button (opens file picker, uploads staged media asset).
     - `Remove Override` button (visible when exact variant image override exists).
     - `Apply Image To` dropdown/actions:
       - `Only this variant` (default)
       - `All variants with Colour: Red` (Colour-group image override).
  4. `Display Label`:
     - Editable text field (e.g. `Home Jersey - Red / S`).
     - Pre-populated with parent `ProductName - CombinationLabel` if empty.
  5. `Include Variant` Toggle:
     - Label: **`Include Variant`** (CANONICAL MANDATE: NEVER use the word "Availability" for this toggle).
     - Helper text: `Include this variant in your catalog for pricing and inventory setup.`
     - Switch ON (Included) / OFF (Excluded).
- **Drawer Footer Actions**:
  - `Cancel` (discards local drawer edits without mutating wizard state)
  - `Save Changes` (applies drawer edits to local wizard state & refreshes table).

### 3.3 State C: Delete Variant Confirmation Modal

Clicking `Delete` on a variant table row opens a centered modal dialog.

- **Modal Header**: `Delete Variant`
- **Body Text**: `Are you sure you want to remove the variant combination "Red / M"?`
- **Warning Alert**: `This action will exclude this variant combination from generation.` (If downstream Step 5/6/7 draft data exists for this variant, append: `Deleting this variant will also remove its SKU, barcode, price, and channel settings.`)
- **Modal Actions**:
  - `Cancel` (closes modal, no changes)
  - `Delete Variant` (Destructive Red button)
- **Post-Delete Behavior**:
  - Marks combination hash as manually excluded (`ARCHIVED` tombstone).
  - Updates table and summary card (e.g. count drops from 6 to 5).
  - Triggers success toast notification: `Variant "Red / M" removed.`

---

## 4. Attribute / Option & Value Model Rules

### 4.1 Master Data Entity Reuse
Step 4 reuses existing catalog entities without duplicating schemas:
- `product_option_templates` & `product_option_template_values` (Platform master option templates).
- `product_options` (Tenant product-level option headers).
- `product_option_values` (Tenant product-level option values).
- `product_variant_option_values` (Join table linking `product_variants.id` to `product_option_values.id`).

### 4.2 Attribute Selection Rules
1. **Template Identity**: The Attribute Name dropdown binds to `source_option_template_id` (Guid) or existing `product_option_id`. Display names are never identity.
2. **Value Selection**: Values multi-select binds to `source_option_template_value_id` or `product_option_value_id`.
3. **No Duplicates**: Same attribute cannot be selected twice in the same product. Same value cannot be selected twice under the same attribute.
4. **Validation**: Every selected attribute row MUST have at least one selected value before `Generate Variants` or `Save & Continue`.
5. **Cross-Tenant Guard**: Option template IDs and value IDs submitted in requests must belong to public system templates or the active tenant. Foreign tenant IDs are rejected with HTTP 403/400.

### 4.3 Resolution of API Implementation Blocker
The existing `GET /api/v1/tenant-admin/products/create-options` endpoint exposed `VariantOptionTemplates` headers without nested values.

**Canonical Decision**:
Extend `TenantAdminProductCreateOptionsResponse` so `VariantOptionTemplates` exposes active template values as typed nested DTOs:

```csharp
public sealed record TenantAdminProductVariantOptionTemplateValueResponse(
    Guid ValueId,
    string ValueCode,
    string ValueName,
    string? DisplayName,
    string? ColorHex,
    int SortOrder);

public sealed record TenantAdminProductVariantOptionTemplateResponse(
    Guid TemplateId,
    string TemplateCode,
    string TemplateName,
    string OptionType,
    IReadOnlyList<TenantAdminProductVariantOptionTemplateValueResponse> Values);
```

---

## 5. Deterministic Cartesian Variant Generation Algorithm

### 5.1 Server-Authoritative Matrix Reconciliation
While Flutter computes a client-side preview for instant UI feedback, the backend is the final authority. On Save Draft or Save & Continue, the backend validates option/value IDs, recomputes the Cartesian matrix, calculates canonical identity hashes, and reconciles against existing variants.

### 5.2 Canonical Hash Algorithm (`option_combination_hash`)
`product_variants.option_combination_hash` is a `char(64)` column used for strict duplicate prevention and reconciliation.

**Calculation Standard**:
1. Collect all `(product_option_id, product_option_value_id)` pairs for the variant.
2. Sort pairs deterministically by `product_option_id` (ascending GUID string order).
3. Format each pair as `opt:{optionId:D}|val:{valueId:D}`.
4. Join sorted pairs with a semicolon `;`.
5. Compute SHA-256 hash of the UTF-8 encoded string.
6. Format result as 64-character lowercase hex string.

$$\text{Hash} = \text{SHA256}\left( \text{join}_{;}\left( \text{sort}_{\text{optId}}\left( \text{"opt:"} + \text{optId} + \text{"\|val:"} + \text{valId} \right) \right) \right)$$

This hash is completely deterministic, independent of UI row ordering, and guaranteed unique per variant within a product (`uq_product_variants_tenant_id_product_id_option_combination_hash`).

### 5.3 Matrix Regeneration & State Preservation Rules
When `Generate Variants` is clicked again or draft is saved:

1. **Idempotency**: Regenerating with identical attributes and values preserves all existing variant IDs, display labels, Include Variant state, exact image overrides, colour-group overrides, and manual deletion tombstones.
2. **Matrix Changes**:
   - Matching hashes: Preserved untouched.
   - Genuinely new combinations: Assigned new `variant_id` GUIDs, default display label, `is_sellable = true`, `status = 'ACTIVE'`.
   - Obsolete combinations (no longer in Cartesian set): Safely soft-deleted / archived (`status = 'ARCHIVED'`).
3. **Tombstone Safety**: Manually deleted combinations (marked as `ARCHIVED` tombstones) MUST NOT automatically reappear upon regeneration unless the user explicitly modifies attribute selections.

---

## 6. Variant Identity, Display Label & Variant Code

### 6.1 Semantic Distinctions

| Concept | API Property | DB Mapping | User Editable | Purpose | Example |
|---|---|---|---|---|---|
| Combination Label | `combinationLabel` | Computed API property | NO (Read-Only) | Joined display names of option values | `Red / S` |
| Display Label | `displayLabel` | `product_variants.variant_name` | YES | Customer/POS receipt variant title | `Home Jersey - Red / S` |
| Variant Code | `variantCode` | `product_variants.variant_code` | NO (Server-Generated) | Internal SKU-independent unique identifier | `VAR-HJ-001` |

### 6.2 Server-Side Variant Code Generation
`product_variants.variant_code` is `NOT NULL` and product-scoped unique (`uq_product_variants_tenant_id_product_id_variant_code`).
Users are NOT asked to type `variantCode` in Step 4.

**Generation Standard**:
`VAR-{ProductCode|ProductId_Short}-{HexPrefix8}`
Example: `VAR-PRD001-A4F89C12`.
If SKU is configured later in Step 5, SKU takes precedence for inventory tracking, but `variantCode` remains stable system key.

---

## 7. "Include Variant" Semantics & Persistence Lifecycle

### 7.1 "Include Variant" vs. Channel Visibility
"Include Variant" is a **global catalog configuration flag**. It is NOT outlet availability or channel visibility (which belong to Step 7).

### 7.2 Inclusion Lifecycle

| State | `is_sellable` | `status` | Downstream Step Impact |
|---|---|---|---|
| **ON (Included)** | `true` | `'ACTIVE'` | Fully eligible for Step 5 (SKU/Barcode), Step 6 (Pricing/Tax), Step 7 (Channels). |
| **OFF (Excluded)** | `false` | `'ACTIVE'` | Excluded from mandatory SKU/Price configuration. Step 5/6/7 skip required inputs for this variant. |

Reversing OFF to ON restores the variant to active downstream eligibility without losing its option value mappings.

---

## 8. Delete / Manual Exclusion & Operational Safety

### 8.1 Delete vs. Include OFF
- **Include OFF**: Reversible toggle (`is_sellable = false`). Variant remains in Step 4 matrix.
- **Delete**: Destructive exclusion of a combination. Variant row is archived (`status = 'ARCHIVED'`).

### 8.2 Operational Safety Rules
1. **DRAFT Variants (No Operational History)**:
   - When deleted in Step 4, set `status = 'ARCHIVED'` (tombstone) to prevent hash collision upon regeneration.
2. **PUBLISHED Variants (With Operational History)**:
   - If variant has sales transactions, stock balances, batch records, or purchase orders, hard deletion or archiving is blocked with HTTP 400 (`variant.has_operational_history`).
   - The UI modal warning explicitly scopes: "This variant has historical transactions and cannot be deleted. Set 'Include Variant' to OFF instead."

---

## 9. Downstream Step Invalidation & Cleanup Rules

When a user returns to Step 4 from Step 5, 6, or 7 and alters the variant matrix (deleting a variant or changing attribute values):

1. **Warning Confirmation**: Prompt user with modal warning before applying destructive matrix changes.
2. **Draft Cleanup**: Downstream draft records linked to deleted/archived variants (`product_barcodes`, variant price overrides, variant channel visibility rows) are automatically removed in the same atomic database transaction.
3. **Step Revalidation**: If active variants are added or modified, downstream Steps 5, 6, and 7 are marked as requiring re-verification (`lastCompletedSetupStep = 4`).

---

## 10. Variant Image Hierarchy & Logic

### 10.1 Canonical Image Resolution Order
When displaying a variant thumbnail (in Step 4 table, POS cashier grid, or online storefront), image resolution evaluates in strict priority order:

$$\text{Resolved Image} = \text{Coalesce}(\text{Exact Override}, \text{Colour Group Image}, \text{Step 1 Primary Product Image}, \text{Placeholder})$$

1. **Exact Variant Override**: Image assigned directly to the variant (`product_images.product_variant_id = variantId`).
2. **Same-Colour Group Image**: Image assigned to the matching Colour option value (`product_option_values.image_media_asset_id`).
3. **Step 1 Primary Product Image**: Primary product image (`product_images.is_primary_image = true` where `product_variant_id IS NULL`).
4. **Standard Placeholder**: Default fallback asset if no images exist.

### 10.2 Image Operations & Staging Architecture
- **Change Image**: Uses standard media staging endpoint (`POST /api/v1/tenant-admin/products/images/stage`). Returns `mediaAssetId`.
- **Apply Image To**:
  - `Only this variant`: Creates/updates `product_images` with `product_variant_id = variantId`.
  - `All variants with Colour: Red`: Updates `product_option_values.image_media_asset_id` for the selected Colour value.
- **Remove Override**: Deletes exact variant image override row, allowing fallback to group image or primary product image.

---

## 11. Unit of Measure (UOM) Inheritance Rules

Every variant requires `stock_uom_id` and `sales_uom_id` (`NOT NULL` in `product_variants`).

1. **VARIANT + Track Inventory ON (`is_stock_tracked = true`)**:
   - Inherits Step 3 parent base UOM (`base_unit_id`) as `stock_uom_id`.
   - Inherits Step 3 parent selling UOM (`selling_unit_id`) as `sales_uom_id`.
   - Inherits Step 3 `allow_decimal_quantity` as `allow_fractional_quantity`.
2. **VARIANT + Track Inventory OFF (`is_stock_tracked = false`)**:
   - Step 3 was bypassed.
   - Backend resolves system default UOM (`PCS` / Piece) for both `stock_uom_id` and `sales_uom_id`.

---

## 12. Save / Back / Resume Semantics & State Persistence

### 12.1 Shared Wizard Pipeline
Step 4 mutations persist via the shared draft endpoint:
- `PUT /api/v1/tenant-admin/products/{productId}/draft`

### 12.2 Request Payload Graph (`currentSetupStep = 4`)

```json
{
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "currentSetupStep": 4,
  "wizardAction": "SAVE_AND_CONTINUE",
  "expectedRowVersion": 1045,
  "variantConfiguration": {
    "options": [
      {
        "sourceOptionTemplateId": "c1a2b3c4-0000-0000-0000-000000000001",
        "optionCode": "COLOUR",
        "optionName": "Colour",
        "optionType": "COLOUR",
        "sortOrder": 1,
        "values": [
          {
            "sourceOptionTemplateValueId": "v1000000-0000-0000-0000-000000000001",
            "valueCode": "RED",
            "valueName": "Red",
            "displayName": "Red",
            "colorHex": "#FF0000",
            "sortOrder": 1,
            "imageMediaAssetId": "m9990000-0000-0000-0000-000000000001"
          },
          {
            "sourceOptionTemplateValueId": "v1000000-0000-0000-0000-000000000002",
            "valueCode": "BLUE",
            "valueName": "Blue",
            "displayName": "Blue",
            "colorHex": "#0000FF",
            "sortOrder": 2,
            "imageMediaAssetId": null
          }
        ]
      },
      {
        "sourceOptionTemplateId": "c1a2b3c4-0000-0000-0000-000000000002",
        "optionCode": "SIZE",
        "optionName": "Size",
        "optionType": "TEXT",
        "sortOrder": 2,
        "values": [
          {
            "sourceOptionTemplateValueId": "v2000000-0000-0000-0000-000000000001",
            "valueCode": "S",
            "valueName": "S",
            "displayName": "Small",
            "colorHex": null,
            "sortOrder": 1
          },
          {
            "sourceOptionTemplateValueId": "v2000000-0000-0000-0000-000000000002",
            "valueCode": "M",
            "valueName": "M",
            "displayName": "Medium",
            "colorHex": null,
            "sortOrder": 2
          }
        ]
      }
    ],
    "variants": [
      {
        "variantId": "var11111-0000-0000-0000-000000000001",
        "displayLabel": "Home Jersey - Red / S",
        "included": true,
        "exactImageMediaAssetId": null,
        "optionValueCodes": ["RED", "S"]
      },
      {
        "variantId": "var11111-0000-0000-0000-000000000002",
        "displayLabel": "Home Jersey - Red / M",
        "included": true,
        "exactImageMediaAssetId": null,
        "optionValueCodes": ["RED", "M"]
      },
      {
        "variantId": "var11111-0000-0000-0000-000000000003",
        "displayLabel": "Home Jersey - Blue / S",
        "included": false,
        "exactImageMediaAssetId": null,
        "optionValueCodes": ["BLUE", "S"]
      },
      {
        "variantId": "var11111-0000-0000-0000-000000000004",
        "displayLabel": "Home Jersey - Blue / M",
        "included": true,
        "exactImageMediaAssetId": null,
        "optionValueCodes": ["BLUE", "M"]
      }
    ],
    "excludedCombinationHashes": []
  }
}
```

### 12.3 GET Setup Resume Response (`GET /api/v1/tenant-admin/products/{productId}/setup`)
Restores complete Step 4 graph including options, values, generated variants, display labels, inclusion states, exact images, group images, and excluded hashes.

---

## 13. Access Control, Permissions & Entitlements

### 13.1 Permission Matrix

| Operation | Canonical Permission Code | Legacy Permission Code | Description |
|---|---|---|---|
| Step 4 Draft Create | `catalog.products.create` | `tenant.products.create` | Save Step 4 draft on new product |
| Step 4 Draft Update | `catalog.products.update` | `tenant.products.update` | Update Step 4 draft on existing product |
| Manage Variants | `catalog.variants.manage` | `tenant.products.update` | Generate, edit, and delete variant combinations |
| Stage Variant Image | `catalog.product_media.manage` | `tenant.products.update` | Upload and assign variant images |
| View Step 4 Graph | `catalog.products.view` | `tenant.products.view` | Resume wizard at Step 4 |

### 13.2 Feature Entitlement
- Runtime Feature Entitlement Code: `product_catalog` (Module: `product_management`).
- Evaluated at runtime via `ITenantFeatureEntitlementEvaluator`. Missing entitlement returns HTTP 403 (`product.entitlement_denied`).

---

## 14. Comprehensive Database Traceability & Migration Decision

### 14.1 Complete Element Traceability Matrix

| UI Element | Flutter State Property | DTO JSON Property | Command Property | Domain Entity Property | DB Table | DB Column | Data Type / Nullability |
|---|---|---|---|---|---|---|---|
| Attribute Name | `optionCode` | `options[].optionCode` | `OptionCode` | `ProductOption.OptionCode` | `product_options` | `option_code` | `varchar(80)` NOT NULL |
| Attribute Label | `optionName` | `options[].optionName` | `OptionName` | `ProductOption.OptionName` | `product_options` | `option_name` | `varchar(150)` NOT NULL |
| Value Selection | `valueCode` | `values[].valueCode` | `ValueCode` | `ProductOptionValue.ValueCode` | `product_option_values` | `value_code` | `varchar(80)` NOT NULL |
| Colour Group Image | `groupImageId` | `values[].imageMediaAssetId` | `ImageMediaAssetId` | `ProductOptionValue.ImageMediaAssetId` | `product_option_values` | `image_media_asset_id` | `uuid` NULLable |
| Combination Label | `combinationLabel` | `variants[].combinationLabel` | N/A (Computed) | N/A (Computed) | N/A | N/A | Calculated string |
| Display Label | `displayLabel` | `variants[].displayLabel` | `VariantName` | `ProductVariant.VariantName` | `product_variants` | `variant_name` | `varchar(150)` NOT NULL |
| Variant Code | `variantCode` | `variants[].variantCode` | `VariantCode` | `ProductVariant.VariantCode` | `product_variants` | `variant_code` | `varchar(80)` NOT NULL |
| Include Variant | `included` | `variants[].included` | `IsSellable` | `ProductVariant.IsSellable` | `product_variants` | `is_sellable` | `boolean` NOT NULL |
| Combination Hash | `hash` | `variants[].optionCombinationHash` | `OptionCombinationHash` | `ProductVariant.OptionCombinationHash` | `product_variants` | `option_combination_hash` | `char(64)` NULLable |
| Exact Variant Image | `exactImageId` | `variants[].exactImageMediaAssetId` | `MediaAssetId` | `ProductImage.MediaAssetId` | `product_images` | `media_asset_id` | `uuid` NULLable |
| Stock UOM | `stockUomId` | N/A (Inherited) | `StockUomId` | `ProductVariant.StockUomId` | `product_variants` | `stock_uom_id` | `uuid` NOT NULL |
| Sales UOM | `salesUomId` | N/A (Inherited) | `SalesUomId` | `ProductVariant.SalesUomId` | `product_variants` | `sales_uom_id` | `uuid` NOT NULL |

### 14.2 Database Migration Decision
> [!NOTE]
> **DATABASE MIGRATION REQUIRED: NO**
>
> All required tables (`product_options`, `product_option_values`, `product_variants`, `product_variant_option_values`, `product_images`, `media_assets`) and columns (`option_combination_hash`, `is_sellable`, `image_media_asset_id`, `variant_code`, `variant_name`) already exist in the EF Core ModelSnapshot and production PostgreSQL schema.

---

## 15. Validation & Error Code Matrix

| Error Scenario | HTTP Code | Error Code | Message | Field / Target |
|---|---|---|---|---|
| No Attribute Selected | 400 | `product.variant_options_required` | `At least one attribute must be defined for a Variant product.` | `variantConfiguration.options` |
| Attribute Has No Values | 400 | `product.option_values_required` | `Attribute '{0}' must contain at least one selected value.` | `options[{i}].values` |
| Duplicate Attribute Selected | 400 | `product.duplicate_attribute` | `Attribute '{0}' cannot be selected more than once.` | `options[{i}].optionCode` |
| Duplicate Option Value | 400 | `product.duplicate_option_value` | `Value '{0}' cannot be repeated in attribute '{1}'.` | `options[{i}].values[{j}]` |
| Zero Included Variants | 400 | `product.included_variant_required` | `At least one variant must be included in the product setup.` | `variantConfiguration.variants` |
| Exceeds Max Variant Limit | 400 | `product.max_variants_exceeded` | `Cartesian matrix produces {0} variants, exceeding maximum allowed limit of 100.` | `variantConfiguration` |
| Invalid Media Asset | 400 | `product.invalid_media_asset` | `Staged media asset '{0}' was not found or is invalid.` | `exactImageMediaAssetId` |
| Concurrency Conflict | 409 | `product.concurrency_conflict` | `The product draft has been modified by another user.` | `expectedRowVersion` |

---

## 16. Non-Functional Requirements (NFR), Security & Governance

1. **Tenant Isolation**: Every database query and command filters by `TenantId` extracted from JWT claims. Cross-tenant option IDs or media asset IDs return HTTP 403.
2. **Optimistic Concurrency**: Enforced via `expectedRowVersion` vs `Product.RowVersion`. Stale updates return HTTP 409.
3. **Cartesian Safeguard Limit**: `MaxVariantCombinationsPerProduct = 100`. Matrix sizes $> 100$ are rejected before generation.
4. **Audit Logging**: Emits structured domain events: `ProductStep4SavedEvent`, `VariantMatrixGeneratedEvent`, `VariantImageOverriddenEvent`, `VariantArchivedEvent`.

---

## 17. Flutter / Riverpod Frontend State Contract

### 17.1 State Model (`Step4VariantConfigurationState`)
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

### 17.2 Controller Operations
`AddProductWizardController`:
- `loadStep4()`
- `addAttributeRow()`
- `removeAttributeRow(int index)`
- `selectAttribute(int index, String templateId)`
- `selectValues(int index, List<String> valueIds)`
- `generateVariants()`
- `openEditDrawer(String variantId)`
- `updateVariantDisplayLabel(String variantId, String label)`
- `toggleVariantInclusion(String variantId, bool included)`
- `stageVariantImage(String variantId, File file)`
- `applyColourGroupImage(String optionValueId, String mediaAssetId)`
- `removeVariantImageOverride(String variantId)`
- `saveDrawerChanges()`
- `confirmDeleteVariant(String variantId)`
- `saveDraftStep4()`
- `saveAndContinueStep4()`

---

## 18. QA & Automated Test Matrix

### 18.1 Backend API Integration Tests
1. **3x2x1 Generation Test**: 3 Sizes, 2 Colours, 1 Material produces exactly 6 combinations with unique deterministic hashes.
2. **Idempotency Test**: Executing `generateVariants` twice with same options preserves variant GUIDs and custom display labels.
3. **Include OFF Test**: Disabling Include Variant sets `is_sellable = false` and bypasses downstream Step 5 SKU requirement.
4. **Image Fallback Test**: Verifies exact override takes priority over colour-group image, which takes priority over primary product image.
5. **Delete Tombstone Test**: Deleting combination `Red / M` archives variant and prevents recreation upon regeneration.

---

## 19. Summary of Canonical Decisions

1. **Step 4 Label**: Stepper = `Product Configuration`; Page Heading = `Variant Configuration`.
2. **Toggle Label**: Always use **`Include Variant`** (never "Availability").
3. **Option Template API**: Extended `GET /create-options` to include nested `Values` array in `VariantOptionTemplates`.
4. **Display Label vs Combination Label**: `combinationLabel` is read-only computed; `displayLabel` maps to `product_variants.variant_name`.
5. **Variant Code**: Server-generated, SKU-independent, not typed by user.
6. **Database Migration**: None required (all tables and columns exist).
7. **Max Variant Limit**: Enforce 100 combinations per product limit.
