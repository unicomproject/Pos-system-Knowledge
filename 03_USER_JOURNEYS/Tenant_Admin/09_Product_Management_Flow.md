<!-- title: Tenant Admin Product Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product Management Flow

## Purpose

Defines the manual product management flows for the Tenant Admin, including the 8-step wizard, draft saving, details overview, editing, duplicating, archiving, and manual popular product curation. Product import workflows are removed from this active interface scope.

## Actor

Tenant Admin

## Trigger

Tenant Admin opens product management.

## Preconditions

- Tenant Admin has product management permissions (`catalog.products.*`).
- Categories and brands are seeded and available.

---

## Main Flow: 8-Step Product Creation Wizard

| Step | Wizard Step Name | System & User Behavior |
|---:|---|---|
| 1 | **Step 1 — Basic Details** | User inputs Name, Category (mandatory), Brand, Short Name, Internal Code, Description, and Images (Max 5MB per file). Primary Image assignment is verified. |
| 2 | **Step 3 — Product Type & Tracking** | User selects Product Type (SIMPLE, VARIANT, BUNDLE) and Tracking. ON enables Batch, Expiry, Serial combinations. OFF disables them. |
| 3 | **Step 4 — Units & Pack Conversion** | Configures base unit and conversion factors. |
| 4 | **Step 5 — Product Configuration** | Auto-skips for Simple Products. Generates Cartesian options for Variants. Controls Component candidate search for Bundles. |
| 5 | **Step 6 — Barcode & SKU** | User inputs SKU and Barcodes. System enforces uniqueness tenant-wide. |
| 6 | **Step 7 — Pricing & Tax** | Inputs Cost Price, Standard Selling Price, promotional pricing, tax classes. Calculates margins. |
| 7 | **Step 8 — Channel Visibility** | Sets availability for POS and Online Store. |
| 8 | **Step 9 — Review & Create** | Displays verification summary of all sections. User clicks Create to publish. |

---

## Post-Create Journey

Once created, the user is redirected to the **Product Details Overview**.
- **Overview**: Displays Product Info, Selling/Cost Prices, Channel Visibility, Stock Summary, and Outlets.
- **Actions**: Edit (prefilled wizard), Duplicate (resets identifiers/quantities, opens as DRAFT), and Archive.
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
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
