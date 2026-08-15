<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->

# Tenant Admin Product Management Flow

## Purpose

Defines the manual product management flows for the Tenant Admin, including the canonical 8-step wizard (Reference UI 2 alignment), draft saving, details overview, editing, duplicating, archiving, and manual popular product curation. Product import workflows are removed from this active interface scope.

## Actor

Tenant Admin

## Trigger

Tenant Admin opens product management navigation menu.

## Preconditions

- Tenant Admin has product management permissions (`catalog.products.view`, `catalog.products.create`, `catalog.products.update`).
- Categories and brands are seeded and available.

---

## Main Flow: Fixed 8-Step Product Creation Wizard

| Step | Wizard Step Name | System & User Behavior |
|---:|---|---|
| 1 | **Step 1 — Basic Details** | User inputs Product Name (mandatory), Category (mandatory), Brand (optional), Short Name / Internal Code, Short Description, Long Description, and Product Images. Quick shortcuts for Status & Options (Active, POS Sellable, Track Inventory, Allow Online Sale) synchronize with later steps. |
| 2 | **Step 2 — Product Type & Tracking** | User selects Product Type (`SIMPLE`, `VARIANT`, `BUNDLE`) and Inventory Tracking rules. Standard Quantity, Batch/Lot, Expiry, and Serial tracking combinations are validated. |
| 3 | **Step 3 — Units & Pack Conversion** | Applicable when Track Inventory = ON. Configures Single Unit Only or Multiple Units & Pack Conversion (Base Unit, Selling Unit, Purchase Unit, Items per Purchase Unit, Outer Pack Unit, Purchase Units per Outer Pack, Allow Decimal Quantity). Auto-bypassed when Track Inventory = OFF. SIMPLE + Track Inventory ON navigates to Step 5; VARIANT/BUNDLE navigates to Step 4. |
| 4 | **Step 4 — Product Configuration** | Simple Product auto-skips (marked Not Applicable). Variant Product presents Variant Matrix & Option combinations. Bundle/Kit presents Component candidate search and quantity rules. |
| 5 | **Step 5 — Barcode & SKU** | Configures SKU and Barcodes (Global / UOM-specific). Enforces tenant-wide uniqueness. |
| 6 | **Step 6 — Pricing & Tax** | Inputs Cost Price, Standard Selling Price, promotional pricing, tax classes, and outlet price overrides. Calculates margins. |
| 7 | **Step 7 — Channel Visibility** | Sets visibility and orderability matrices for In-Store POS and Online Store sales channels. |
| 8 | **Step 8 — Review & Create** | Displays full review summary across all 7 preceding sections with inline section Edit links. User clicks Create/Publish to complete server validation and publish product. |

---

## Detailed Step 3 User Journey: Units & Pack Conversion

### Entry & Applicability Evaluation
- When advancing from Step 2, the system evaluates product structure and tracking settings:
  - **SIMPLE + Track Inventory ON**: Enters Step 3. Upon `Save & Continue`, system navigates to **Step 5** (Barcode & SKU; Step 4 is auto-skipped).
  - **VARIANT + Track Inventory ON**: Enters Step 3 at Parent Product level. Configures shared units once; generated variants inherit these settings. Upon `Save & Continue`, system navigates to **Step 4** (Product Configuration — Variant Matrix).
  - **Track Inventory OFF (SIMPLE / VARIANT)**: System auto-bypasses Step 3. Target is Step 5 (SIMPLE) or Step 4 (VARIANT).
  - **BUNDLE / Kit**: Parent tracking is forced `false`/component-based. Step 3 is auto-bypassed. Target is **Step 4** (Product Configuration — Kit Assembly).

### Single Unit Journey (`SINGLE_UNIT`)
1. User selects "Single Unit Only".
2. User selects Product Unit (e.g., Piece, Each, Kilogram) from dropdown populated by `GET /create-options`.
3. User chooses whether to enable `Allow Decimal Quantity`.
4. Dynamic guidance card displays: *"This product will be purchased, sold, and counted in Piece. No pack conversion is applied."*

### Multiple Units & Pack Conversion Journey (`MULTIPLE_UNITS`)
1. User selects "Multiple Units & Pack Conversion".
2. User selects Base Unit (e.g. Piece), Selling Unit (must match Base, Purchase, or Outer Pack), and Purchase Unit (e.g. Pack).
3. User enters `Items per Purchase Unit` (e.g., 6).
4. (Optional) User selects Outer Pack Unit (e.g. Carton) and enters `Purchase Units per Outer Pack` (e.g., 12).
5. Dynamic conversion card renders live math: `1 Pack = 6 Pieces`, `1 Carton = 12 Packs`, `1 Carton = 72 Pieces`.
6. Unit conversion table renders configured tiers with barcode placeholder `"Assigned in Step 5"`.

### User Actions & Flow Controls
- **Save Draft**: Validates filled inputs without requiring full completion. Persists partial state to database (`status = 'DRAFT'`). Client stays on Step 3. `row_version` increments.
- **Save & Continue**: Performs full validation (mandatory fields, Selling Unit tier check, integral multipliers when decimal is disabled). Updates `product_unit_settings` and `product_unit_conversions`, synchronizes `inventory_uom_id = base_uom_id`, increments `row_version`, and navigates to server-returned `targetSetupStep`.
- **Back**: Returns to Step 2 without destroying uncommitted local edits.
- **Mode Switch**: In-session UI retains typed multi-unit values in memory. Server saves active mode and clears inactive tier fields (`NULL` outer pack / multipliers).
- **Draft Reopen / Resume**: `GET /setup` restores active Unit Model, UOM IDs, multipliers, decimal setting, and conversion array.

---


## Post-Create Journey

Once created, the user is redirected to the **Product Details Overview**.
- **Overview**: Displays Product Info, Selling/Cost Prices, Channel Visibility, Stock Summary, and Outlets.
- **Actions**: Edit (prefilled wizard), Duplicate (resets identifiers/quantities, opens as `DRAFT`), and Archive.
- **Archive Action**: Marks the product status as `ARCHIVED`, setting `archived_at` and `archived_by_tenant_user_id` in the database. The product disappears from the default list view.

---

## Product List View States

- **First-Use Empty State**: Triggered when `catalogTotalCount = 0` and no filters are active. Renders the empty state illustration with a single primary "Add Product" CTA button. **No CSV or import buttons are displayed**.
- **Filtered Empty State**: Triggered when `catalogTotalCount > 0` but current active filters or searches return zero records. Displays "No matching products found" and a "Reset Filters" action button.
- **Populated List State**: Renders a Filter Toolbar and a data table displaying Product Name, SKU, Category, Variants, Price/Range, Stock, Product Status, Stock Status, and Actions (View/Edit/Archive).

---

## Access and Security Rules

- Strict server-side enforcement of tenant-isolation contexts.
- Hiding UI elements is a convenience for cashier/admin role UX; backend validation checks are always mandatory.
- Stock and pricing calculations are evaluated server-side.

---

## Related Files
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification]]
