# Tenant Admin Add Product — Step 4: Variant Configuration Specification

<!-- title: Tenant Admin Add Product — Step 4: Variant Configuration Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-13 -->

## 1. Executive Summary & Core Architectural Principles

This document defines the final canonical Second Brain specification for **Step 4: Variant Configuration** within the Tenant Admin **Add Product Wizard**.

### 1.1 Core Business Purpose
Step 4 allows Tenant Admin users to configure multi-variant products (e.g. apparel with Size, Colour, Material combinations) by defining options, selecting option values, generating a Cartesian variant matrix, customising individual variant labels and images, and toggling variant inclusion before configuring downstream steps.

### 1.2 Polymorphic Step 4 Behavior
Step 4 is polymorphic based on `product_structure` selected in Step 2:
1. **SIMPLE Product (`product_structure = SIMPLE`)**: Step 4 is **NOT_APPLICABLE** and auto-bypassed.
2. **VARIANT Product (`product_structure = VARIANT`)**: Step 4 renders this **Variant Configuration Specification**.
3. **BUNDLE / Kit Product (`product_structure = BUNDLE`)**: Step 4 renders **Bundle/Kit Component Configuration** (assembly of component products/variants).

> [!IMPORTANT]
> Step 4 for VARIANT mode defines options, option values, combination matrix generation, display labels, variant inclusion toggles, and variant image overrides. It MUST NOT include SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, Stock Quantity, or Channel Visibility controls. Those belong strictly to Step 5 (`Barcode & SKU`), Step 6 (`Pricing & Tax`), and Step 1 (`Basic Details`).

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

### 4.3 Stable Identity: ProductOption
For a Product, `Product + sourceOptionTemplateId` identifies the logical ProductOption.
- **Never existed**: Create active ProductOption.
- **Already exists and selected**: Reuse existing ProductOption ID.
- **Previously selected, then removed**: Do not create another identity. Apply existing inactive/archive status behavior.
- **Removed and later reselected**: Reactivate/reuse the existing ProductOption ID. NO duplicates allowed across Save Draft, Generate Variants, or resume operations.

### 4.4 Stable Identity: ProductOptionValue
For one ProductOption, `ProductOption + sourceOptionTemplateValueId` identifies the logical ProductOptionValue.
- **Never existed**: Create ProductOptionValue.
- **Already selected**: Reuse existing ProductOptionValue ID.
- **Removed**: Use the existing inactive/archive state rather than creating a replacement identity.
- **Re-selected later**: Reactivate/reuse the existing ProductOptionValue ID. No new IDs are created.

Stable ProductOption and ProductOptionValue IDs are strictly required for deterministic variant reconciliation, canonical combination hash stability, image group association, and tombstone stability.

---

## 5. Deterministic Cartesian Variant Generation Algorithm

### 5.1 Pre-Persistence Client Identity (`clientCombinationKey`)
A newly generated Variant may not yet have a real `productVariantId`. Frontend MUST NOT create fake ProductVariant GUIDs. 
Before first persistence, every generated combination uses a deterministic `clientCombinationKey`.

**Input**: Only immutable source master identities are used. For each selected Attribute Value, pair `(sourceOptionTemplateId, sourceOptionTemplateValueId)`.
**Sort & Serialization**: Sort deterministically (e.g. by sourceOptionTemplateId ascending). Join using one documented canonical client format. The same semantic source-ID combination must ALWAYS produce the exact same `clientCombinationKey`.
**Purpose**: Used by Flutter for generated row identity, Edit Variant selection, drawer state, display labels, image staging, and tombstone state prior to server persistence. 

### 5.2 Server-Authoritative Matrix Reconciliation & Persistence
While Flutter computes a preview matrix, the backend is authoritative during `Save Draft` and `Save & Continue`. Backend validates against selected immutable Option/Value identities and computes the backend canonical hash.

### 5.3 Canonical Hash Algorithm (`option_combination_hash`)
`product_variants.option_combination_hash` is a `char(64)` column used for strict duplicate prevention and backend reconciliation.

**Calculation Standard**:
1. Resolve persisted Product-specific option/value identities.
2. Collect all `(product_option_id, product_option_value_id)` pairs for the variant.
3. Sort pairs deterministically by `product_option_id` (ascending GUID string order).
4. Format each pair EXACTLY as `opt:<productOptionId>|val:<productOptionValueId>`.
5. Join sorted pairs with a semicolon `;`.
6. Compute SHA-256 hash of the UTF-8 encoded string.
7. Format result as 64-character lowercase hex string.

Because ProductOption and ProductOptionValue IDs are stable and reused, the same Product semantic combination (e.g. Red/S) will resolve to the SAME canonical hash across saves, regeneration, or attribute remove/re-add.

### 5.4 Matrix Regeneration & Variant Reconciliation Algorithm
For each expected Cartesian combination, backend validates:
- **Existing hash found**: Reuse existing ProductVariant. Preserve approved custom state: ProductVariant ID, Variant Code, Display Label, Include Variant, exact image, and lifecycle state.
- **Hash not found and not tombstoned**: Create a new Variant in the `DRAFT` lifecycle.
- **Hash tombstoned**: Do not regenerate it.
- **Existing active/draft Variant no longer present**: Transition to existing canonical Step 4 removal/archive behavior (`ARCHIVED`).

### 5.5 Delete / Tombstone Permanent Exclusion
An explicitly deleted canonical Variant combination must NEVER automatically return through "Generate Variants" merely because attribute selections changed and reverted.
- **Before first persistence**: Tombstone state is maintained via `clientCombinationKey` and survives `Save Draft`.
- **After persistence**: Backend tombstoning uses `status = 'ARCHIVED'`. Physical destruction is forbidden to preserve historical identity.

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
Example: `VAR-PRD001-A4F89C12`. Immutable after creation. Reused on repeated reconciliation.

---

## 7. "Include Variant" Semantics & Persistence Lifecycle

### 7.1 "Include Variant" vs. Channel Visibility
"Include Variant" is a **global catalog configuration flag** (`is_sellable`). It is NOT outlet availability or channel visibility (which belong to Step 1). Include OFF is independent and does NOT create a tombstone/delete.

### 7.2 Inclusion Lifecycle & Draft State
New included Step 4 Variants remain in a wizard **DRAFT** lifecycle status. Step 4 NEVER publishes/activates variants.

| Condition | Variant Status | Include/is_sellable |
|---|---|---|
| New included wizard Variant | `DRAFT` | `true` |
| New excluded wizard Variant | `DRAFT` | `false` |
| Included state changed OFF | `DRAFT` | `false` |
| Included state changed ON | `DRAFT` | `true` |
| Explicitly deleted | `ARCHIVED` | no longer active |
| Final Step 7 successful create | final lifecycle status | preserve approved inclusion |

---

## 8. Downstream Step Invalidation & Cleanup Rules

When a user returns to Step 4 from Step 5, 6, or 7 and alters the variant matrix (deleting a variant or changing attribute values):

1. **Warning Confirmation**: Prompt user with modal warning before applying destructive matrix changes.
2. **Draft Cleanup**: Downstream draft records linked to deleted/archived variants (`product_barcodes`, variant price overrides, variant channel visibility rows) are automatically removed in the same atomic database transaction.
3. **Step Revalidation**: If active variants are added or modified, downstream Steps 5, 6, and 7 are marked as requiring re-verification (`lastCompletedSetupStep = 4`).

---

## 9. Variant Image Hierarchy & Logic

### 9.1 Canonical Image Resolution Order
$$\text{Resolved Image} = \text{Coalesce}(\text{Exact Override}, \text{Colour Group Image}, \text{Step 1 Primary Product Image}, \text{Placeholder})$$

---

## 10. Unit of Measure (UOM) Inheritance Rules

Every variant requires `stock_uom_id` and `sales_uom_id` (`NOT NULL` in `product_variants`). There is exactly one canonical rule:

1. **VARIANT + Track Inventory ON (`is_stock_tracked = true`)**:
   - Inherits Step 3 parent base UOM (`base_unit_id`) as `stock_uom_id`.
   - Inherits Step 3 parent selling UOM (`selling_unit_id`) as `sales_uom_id`.
   - Inherits Step 3 `allow_decimal_quantity` as `allow_fractional_quantity`.
   - No per-Variant UOM conversion configuration in Release 1.
2. **VARIANT + Track Inventory OFF (`is_stock_tracked = false`)**:
   - Step 3 was bypassed (NOT_APPLICABLE).
   - Backend resolves system default UOM for both `stock_uom_id` and `sales_uom_id` using the **one canonical Product Wizard default UOM resolver**. No manual UOM field is displayed. All conflicting references to PCS/PIECE fall back to this single source of truth.

---

## 11. Save / Back / Resume Semantics & State Persistence

### 11.1 Shared Wizard Pipeline
Step 4 mutations persist via the shared draft endpoint:
- `PUT /api/v1/tenant-admin/products/{productId}/draft`

### 11.2 Request Payload Graph (`currentSetupStep = 4`)

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
        "sortOrder": 1,
        "values": [
          {
            "sourceOptionTemplateValueId": "v1000000-0000-0000-0000-000000000001",
            "sortOrder": 1,
            "imageMediaAssetId": "m9990000-0000-0000-0000-000000000001"
          }
        ]
      }
    ],
    "variants": [
      {
        "clientCombinationKey": "sourceOptTplId1:sourceValTplId1;sourceOptTplId2:sourceValTplId2",
        "productVariantId": "var11111-0000-0000-0000-000000000001",
        "selectedValues": [
          {
            "sourceOptionTemplateId": "c1a2b3c4-0000-0000-0000-000000000001",
            "sourceOptionTemplateValueId": "v1000000-0000-0000-0000-000000000001"
          }
        ],
        "displayLabel": "Home Jersey - Red / S",
        "included": true,
        "exactImageMediaAssetId": null
      },
      {
        "clientCombinationKey": "sourceOptTplId1:sourceValTplId2;...",
        "productVariantId": null,
        "selectedValues": [
           // ...
        ],
        "displayLabel": "Home Jersey - New / S",
        "included": true,
        "exactImageMediaAssetId": null
      }
    ],
    "deletedCombinations": [
      {
        "clientCombinationKey": "...",
        "productVariantId": "var11111-0000-0000-0000-000000000005",
        "selectedValues": [
           // ...
        ]
      }
    ]
  }
}
```
*Note: Fake GUIDs as primary identity for unsaved variants are explicitly banned. `productVariantId` is null for new variants, and `clientCombinationKey` is the authoritative client identity.*

### 11.3 GET Setup Resume Response (`GET /api/v1/tenant-admin/products/{productId}/setup`)
Restores complete Step 4 graph including options, values, generated variants, display labels, inclusion states, exact images, group images, and excluded hashes for exact reconciliation. Includes `clientCombinationKey` and `productVariantId`.

---

## 12. Access Control, Permissions & Entitlements

### 12.1 Permission Matrix

| Operation | Canonical Permission Code | Description |
|---|---|---|
| Step 4 Draft Create (Initial Add Product) | `catalog.products.create` + `catalog.variants.manage` | Save Step 4 draft on new product |
| Step 4 Draft Update (Existing Product Edit) | `catalog.products.update` + `catalog.variants.manage` | Update Step 4 draft on existing product |
| Image Mutation | Product access + `catalog.variants.manage` + `catalog.product_media.manage` | Upload and assign variant images |

Missing product entitlement is completely denied.
**Resume/Setup access**: Approved creator/updater access works according to Product Wizard policy (original creator does not suddenly require Update permission merely because Step 1 produced a Product ID).

### 12.2 Feature Entitlement
- Runtime Feature Entitlement Code: `product_catalog`.
- All checks refer strictly to `product_catalog`.

---

## 13. Comprehensive Database Traceability

| DTO/Domain Property | DB Table | DB Column | Data Type / Nullability |
|---|---|---|---|
| `ProductOption` | `product_options` | `product_option_id` | `uuid` |
| `ProductOptionValue` | `product_option_values` | `product_option_value_id` | `uuid` |
| `ProductVariant` | `product_variants` | `variant_id` | `uuid` |
| `ProductVariantOptionValue` | `product_variant_option_values` | (composite) | Join table |

---

## 14. Validation & Reconciliation NFRs

1. **Tenant Isolation**: Every database query and command filters by `TenantId`. Cross-tenant option IDs or media asset IDs return HTTP 403.
2. **Server-Authoritative Validation**: Client IDs are treated as untrusted inputs. ProductOption and ProductOptionValue reconciliation is deterministic and idempotent.
3. **Optimistic Concurrency**: Enforced via `expectedRowVersion` vs `Product.RowVersion`. Stale updates return HTTP 409.
4. **Cartesian Safeguard Limit**: `MaxVariantCombinationsPerProduct = 100`. Matrix sizes $> 100$ are rejected before generation. No N+1 queries.
5. **Atomic Full Save**: Any failure rolls back the entire Step 4 transaction. No partial graph commits. No duplicate Option/Value/Hashes permitted.

---

## 15. QA & Automated Test Matrix

Test specification must prove the following:
1. **ProductOption/ProductOptionValue Identity**: First selection creates one logical active entity. Repeated save reuses same ID. Remove/re-add reuses same ID (no duplicates).
2. **Variant Identity**: Unsaved Variant has `clientCombinationKey`. First save returns real `productVariantId`. Repeated save reuses Variant ID. Attribute/Value remove/re-add preserves identical semantic matrix hash.
3. **Tombstone Stability**: Generate Red/M -> Delete Red/M -> Generate unchanged -> Red/M is absent. Modify matrix and return to original -> Red/M still absent. Save Draft and reopen -> Red/M absent. No silent resurrection.
4. **Variant Lifecycle**: New Included Step 4 Variant is DRAFT+is_sellable=true. Include OFF is DRAFT+is_sellable=false. Deleted is ARCHIVED. Final Step 7 saves final status. Step 4 NEVER publishes variants.
5. **UOM Resolution**: Track Inventory ON correctly inherits from Step 3. Track Inventory OFF correctly resolves via canonical Product Wizard default UOM resolver. No manual Step 4 UOM field.
6. **Permission**: Create+Variant Manage works for new product. Missing Product entitlement is Denied.
7. **Idempotency**: Same request repeated -> no duplicates. Concurrent stale rowVersion request rejected.

---

*This document is the sole source of truth for Step 4 Variant Configuration.*
