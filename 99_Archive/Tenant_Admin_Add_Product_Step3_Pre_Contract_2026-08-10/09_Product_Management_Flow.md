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
| 3 | **Step 3 — Units & Pack Conversion** | Configures Base UOM, Purchase UOM, Selling UOM, Stock Counting UOM, and conversion factors. |
| 4 | **Step 4 — Product Configuration** | Simple Product auto-skips (marked Not Applicable). Variant Product presents Variant Matrix & Option combinations. Bundle/Kit presents Component candidate search and quantity rules. |
| 5 | **Step 5 — Barcode & SKU** | Configures SKU and Barcodes (Global / UOM-specific). Enforces tenant-wide uniqueness. |
| 6 | **Step 6 — Pricing & Tax** | Inputs Cost Price, Standard Selling Price, promotional pricing, tax classes, and outlet price overrides. Calculates margins. |
| 7 | **Step 7 — Channel Visibility** | Sets visibility and orderability matrices for In-Store POS and Online Store sales channels. |
| 8 | **Step 8 — Review & Create** | Displays full review summary across all 7 preceding sections with inline section Edit links. User clicks Create/Publish to complete server validation and publish product. |

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
