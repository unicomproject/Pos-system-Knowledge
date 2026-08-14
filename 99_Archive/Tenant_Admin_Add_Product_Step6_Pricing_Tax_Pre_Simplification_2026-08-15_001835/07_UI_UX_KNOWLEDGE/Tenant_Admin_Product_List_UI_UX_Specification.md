<!-- title: Tenant Admin Product List UI/UX Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product List UI/UX Specification

This document defines the visual layout, user interactions, responsive behaviors, and state flows for the Tenant Admin Product List screen.

---

## 1. Shared Page Shell Integration

The Product List screen must reuse the approved shared Tenant Admin application shell. The screen itself must never duplicate or recreate these components internally:
- **Sidebar**: Fixed black sidebar with white text, muted light icons for inactive items, and an orange rounded background for the active item. The parent `Products` menu must remain orange and expanded whenever any Product-area route is active.
- **Outer Shell**: Dark background framing the main canvas.
- **Main Canvas**: A white, rounded container hosting the page content.
- **Header**: Standard black header displaying user/tenant context.
- **Footer Navigation**: Fixed black footer bar.

---

## 2. Page Header Layout

The page header is positioned at the top of the white main canvas:
- **Left Column**:
  - Page Title: `Products` (using a premium bold font like Inter or Outfit, 24px/28px).
  - Subtitle: None. The old subtitle `Manage your products, categories and pricing.` is removed to present a clean, high-end visual.
- **Right Column**:
  - Action Button: One primary `Add Product` button.
  - Design: Orange background, white text, an add (`+`) icon before the label.
  - Visibility: Rendered only if the current user has `catalog.products.create` permission.
  - **Prohibited Elements**: No KPI/summary cards, no "Import Products" or "Upload CSV" buttons.

---

## 3. Screen States

### A. First-Use Empty State
- **Condition**: Catalog contains zero products (`catalogTotalCount = 0`) and no filters/search are active.
- **Visuals**:
  - Centered neutral illustration of a product box or system empty folder icon (muted grey).
  - Heading: `No products yet` (bold, 18px, dark grey).
  - Supporting Copy: `Start by adding your first product.` (14px, muted grey).
  - Primary CTA Button: `Add Product` (orange, centered, navigates to the verified Add Product route).
  - Helper Info: `Products, variants, pricing, and stock will appear here once created.`
  - **Prohibitions**: No CSV upload cards or import buttons.

### B. Populated Product List State
- **Condition**: Products exist in the catalog (`totalCount > 0` or active filters apply).
- **Layout**: Renders a single horizontal Filter Toolbar followed by the Product Table and Pagination Footer.

---

## 4. Filter Toolbar Behavior

- **Ordering**:
  1. **Search**: Text field with placeholder `Search products...`. Supports searching product name, SKU, and barcode. Enforces a 300–400 ms debounce before triggering server-side fetch.
  2. **Category**: Dropdown selector labeled `All Categories` by default.
  3. **Brand**: Dropdown selector labeled `All Brands` by default.
  4. **Product Status**: Dropdown selector labeled `All Status` by default (options: Draft, Active, Inactive).
  5. **Stock Status**: Dropdown selector labeled `All Stock Status` by default (options: Not Tracked, In Stock, Low Stock, Out of Stock).
  6. **Reset Filters**: Text action button (`Reset Filters`).
- **Interaction Rules**:
  - Changing search text or selecting any dropdown value resets pagination `pageNumber` to 1.
  - Filters combine using **AND** logic.
  - **Reset Filters** clears all search input and dropdown selections back to default, and resets `pageNumber` to 1, while preserving the currently selected page size.

---

## 5. Product Table Columns & Cell Rendering

The table must display columns in this exact order:

| # | Column Header | Cell Content / Design Rules |
| :--- | :--- | :--- |
| 1 | **Product** | Row displays primary product image thumbnail (40×40 px with rounded corners) or a grey placeholder icon. Adjacent text displays the `productName`. SKU is not duplicated here. If name is clicked, navigates to Product Details. |
| 2 | **SKU** | Displays the primary SKU. If no SKU value is available, renders an em dash (`—`). |
| 3 | **Category** | Displays the primary category name. If none, renders an em dash (`—`). |
| 4 | **Variants** | Displays the variant count integer returned by the backend. Simple products display `1`. |
| 5 | **Price** | Formatted with currency code, e.g., `LKR 2,500.00`. If prices differ across variants, displays a range: `LKR 2,500.00 – LKR 3,000.00`. Renders an em dash (`—`) if missing. No hardcoded currency fallbacks. |
| 6 | **Stock** | Displays aggregate stock. Renders `—` if user lacks stock view permission or stock is null. |
| 7 | **Product Status** | Renders a styled badge: `Draft` (orange), `Active` (green), or `Inactive` (grey). |
| 8 | **Stock Status** | Renders a styled badge: `Not Tracked` (grey), `In Stock` (green), `Low Stock` (orange), or `Out of Stock` (red). |
| 9 | **Actions** | Row action buttons: View icon (eye), Edit icon (pencil), and Delete/Archive icon (trash bin). |

### Colour Token Matrix for Badges
- **Green**: HSL Tailored Green / Emerald (Success status, Active, In Stock).
- **Orange**: HSL Tailored Orange / Amber (Draft, Low Stock).
- **Red**: HSL Tailored Red / Crimson (Out of Stock).
- **Neutral Grey**: Muted Slate (Inactive, Not Tracked).

### Row Action Logic
- **View**: Navigates to Product Details (`/tenant-admin/products/{id}`).
- **Edit**: Navigates to the Product Edit wizard. If editing a `Draft`, resumes at the saved setup step.
- **Delete**: Opens a modal prompting: *"Are you sure you want to delete this product? This will archive the record."* Confirming triggers a soft-delete/archive API call. Once completed, the row is removed from the active view.
- **Tooltips**: Every icon-only action button must have a tooltip and semantic label (e.g. `semanticsLabel: 'Edit Product'`).

---

## 6. Filtered Empty State

- **Condition**: Catalog contains products, but the current search/filter combination matches zero rows.
- **Visuals**:
  - Heading: `No matching products found`
  - Supporting Copy: `Please check your spelling or adjust your filters.`
  - Action Button: `Reset Filters` (restores default list).
  - **Prohibitions**: Does not render the first-use empty illustration or any Add Product CTAs.

---

## 7. Pagination Footer

Positioned at the bottom of the white main canvas:
- **Left Column**: Displays text `Showing X to Y of Z products`.
- **Center**: Page-size dropdown selector (options: 10, 25, 50; default is 10).
- **Right Column**: Numbered page buttons (e.g., `1`, `2`, `3`), ellipses (`...`) for long ranges, and `Previous` / `Next` arrow buttons.
  - Previous is disabled on page 1.
  - Next is disabled on the final page.

---

## 8. Screen State Extensions

- **Initial Loading State**: Renders a vertical layout of skeleton screens mimicking the table rows and filter toolbar.
- **Filter Refresh State**: Applies a slight opacity (0.6) to the table rows with a subtle center loading spinner during active searches.
- **API Error State**: Renders an inline alert box with error text and a `Retry` button.
- **Permission Denied State**: Renders a full-page overlay displaying a shield icon and the text: `Access Denied. You do not have permission to view products.`

---

## 9. Responsive & Touchscreen Rules

- **Desktop (16:9) & Laptops**: Filters sit in a single horizontal row. The table stretches to fill the main canvas width. Actions remain visible on hover/focus.
- **Narrow Laptops & Tablets (Landscape)**: Filter inputs may wrap into a two-row grid. The product table uses horizontal scroll if needed, while pinning the "Product" and "Actions" columns. Spacing is maintained using standard theme parameters.
- **Tablets (Portrait)**: Filters stack vertically. Touch targets for all buttons and dropdowns are expanded to at least 44×44 logical pixels. Tooltips are visible on long-press. No dropdown menus clip outside screen boundaries.
- **Keyboard Navigation**: Interactive elements must support Tab navigation with clear outline focus indicators.

---

## Related Files
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Sidebar_Navigation]]
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_Test_Cases]]
