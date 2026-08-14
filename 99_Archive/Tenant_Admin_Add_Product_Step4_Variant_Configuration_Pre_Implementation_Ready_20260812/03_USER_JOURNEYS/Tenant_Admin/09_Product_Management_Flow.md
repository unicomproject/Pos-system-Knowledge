<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-11 -->

# Tenant Admin Product Management Flow

## Purpose

Defines the manual product management flows for the Tenant Admin, including the canonical 8-step wizard (Reference UI 2 alignment), draft saving, details overview, editing, duplicating, archiving, and manual popular product curation. Product import workflows are removed from this active interface scope.

## Actor

Tenant Admin

## Trigger

Tenant Admin opens product management navigation menu.

## Preconditions

- Tenant Admin has product management permissions (`catalog.products.view`, `catalog.products.create`, `catalog.products.update`, `catalog.variants.manage`).
- Categories and brands are seeded and available.

---

## Main Flow: Fixed 8-Step Product Creation Wizard

| Step | Wizard Step Name | System & User Behavior |
|---:|---|---|
| 1 | **Step 1 — Basic Details** | User inputs Product Name (mandatory), Category (mandatory), Brand (optional), Short Name / Internal Code, Short Description, Long Description, and Product Images. |
| 2 | **Step 2 — Product Type & Tracking** | User selects Product Type (`SIMPLE`, `VARIANT`, `BUNDLE`) and Inventory Tracking rules. Standard Quantity, Batch/Lot, Expiry, and Serial tracking combinations are validated. |
| 3 | **Step 3 — Units & Pack Conversion** | Applicable when Track Inventory = ON. Configures Single Unit Only or Multiple Units & Pack Conversion. Auto-bypassed when Track Inventory = OFF. SIMPLE + Track Inventory ON navigates to Step 5; VARIANT/BUNDLE navigates to Step 4. |
| 4 | **Step 4 — Product Configuration** | Simple Product auto-skips (`NOT_APPLICABLE`). Variant Product renders Variant Matrix, Options, Values, Display Labels, Include Variant toggles, and Image Overrides (`Tenant_Admin_Product_Variant_Configuration_Specification`). Bundle/Kit renders Component candidate search and assembly. |
| 5 | **Step 5 — Barcode & SKU** | Configures SKU and Barcodes (Global / UOM-specific). Enforces tenant-wide uniqueness. |
| 6 | **Step 6 — Pricing & Tax** | Inputs Cost Price, Standard Selling Price, promotional pricing, tax classes, and outlet price overrides. Calculates margins. |
| 7 | **Step 7 — Channel Visibility** | Sets visibility and orderability matrices for In-Store POS and Online Store sales channels. |
| 8 | **Step 8 — Review & Create** | Displays full review summary across all 7 preceding sections. User clicks Create/Publish to complete server validation and publish product. |

---

## Detailed Step 4 User Journey: Variant Configuration

### Entry & Applicability
- **VARIANT Product**: Enters Step 4 from Step 3 (if Track Inventory ON) or Step 2 (if Track Inventory OFF).
- **SIMPLE Product**: Auto-bypassed.
- **BUNDLE Product**: Renders Kit Component Assembly.

### Main Screen Actions & Matrix Generation
1. User defines attributes by selecting attribute name (e.g. Size, Colour) and picking active values (e.g. S, M, L / Red, Blue).
2. User clicks `Generate Variants`. Backend/Flutter computes Cartesian product ($3 \times 2 = 6$ combinations).
3. Summary card updates: `6 Variants Generated`, `2 Attributes Defined`, `6 Included`.
4. Generated Variants table displays `Variant` (e.g. `Red / S`), image thumbnail, and actions (`Edit`, `Delete`).
5. SKU, Barcode, Selling Price, Cost Price, Tax, and Channel Visibility are NOT displayed in Step 4.

### Edit Variant Right-Side Drawer
1. Clicking `Edit` opens right-side drawer.
2. User views read-only combination label and attribute badges.
3. User edits `Display Label` (e.g. `Home Jersey - Red / S`).
4. User toggles **`Include Variant`** (ON/OFF). (NEVER labeled Availability).
5. User manages variant image (uploads custom image, applies colour-group image, or removes override).
6. Clicking `Save Changes` applies edits to wizard state.

### Delete Variant Confirmation Modal
1. Clicking `Delete` opens centered confirmation modal.
2. User confirms deletion. Combination is archived as tombstone (`status = 'ARCHIVED'`).
3. Table and summary card update. Success toast is displayed.

---

## Access and Security Rules

- Strict server-side enforcement of tenant-isolation contexts.
- Permission enforcement: `catalog.products.create` / `catalog.products.update` + `catalog.variants.manage`.
- Feature entitlement enforcement: `product_catalog` (Module: `product_management`).

---

## Related Specifications

- [[../../04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
