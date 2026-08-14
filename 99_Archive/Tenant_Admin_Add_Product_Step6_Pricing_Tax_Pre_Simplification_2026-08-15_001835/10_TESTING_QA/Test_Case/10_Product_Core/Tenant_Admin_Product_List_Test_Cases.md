# Tenant Admin Product List Test Cases

This document defines the comprehensive test scenarios required to validate the new Tenant Admin Product List frontend implementation. Product import test cases have been removed from this scope.

---

## 1. Visual & Layout Test Cases

- **PROD-LIST-UI-001**: Sidebar Layout styling. Verify the sidebar background is black, text is white, active rounded background is orange, and inactive icons are muted light grey.
- **PROD-LIST-UI-002**: Sidebar Products Parent route. Clicking the "Products" parent item navigates the user to `/tenant-admin/products`.
- **PROD-LIST-UI-003**: Sidebar Products Parent persistence. Verify the Products parent menu item remains highlighted in orange and expanded when routing to Product List, Add Product, Categories & Subcategories, Brand, Product Details, or Product Edit.
- **PROD-LIST-UI-004**: Sidebar Products Submenu children. Verify the Products submenu contains exactly three items in this exact order:
  1. Add Product
  2. Categories & Subcategories
  3. Brand
- **PROD-LIST-UI-005**: Sidebar Product submenu exclusions. Verify that Product List, Product Dashboard, Popular Products, Inventory, Variant Templates, and Import are completely absent from the submenu.
- **PROD-LIST-UI-006**: Footer navigation. Verify the shared fixed black footer remains visible with Home, New Sale, Orders, Customers, and Settings options.
- **PROD-LIST-UI-007**: Main canvas. Verify the main page body renders within a single, white, rounded content area inside the dark application shell.

---

## 2. Product List & Filtering Test Cases

### State Transitions
- **PROD-LIST-STATE-001**: First-Use Empty State. When `catalogTotalCount = 0` and no filters are active, verify the screen displays a neutral illustration, the heading "No products yet", the subtitle "Start by adding your first product.", and exactly one primary "Add Product" CTA button. Ensure no import buttons or options appear.
- **PROD-LIST-STATE-002**: Filtered Empty State. When `catalogTotalCount > 0` but active filters yield zero matches, verify the screen displays "No matching products found", supporting text, and a "Reset Filters" action. Ensure the first-use illustration and Add Product CTA do not appear.
- **PROD-LIST-STATE-003**: Populated List. When products exist, verify they render in a single table with exactly the columns in this order: Product, SKU, Category, Variants, Price, Stock, Product Status, Stock Status, Actions.
- **PROD-LIST-STATE-004**: Loading State. Verify skeleton loaders appear when the page is initially loaded or while waiting for filter query responses.

### Search and Filters
- **PROD-LIST-FILT-001**: Search debounce. Verify that typing in the search box debounces for 300–400 ms before executing the API query.
- **PROD-LIST-FILT-002**: Search targets. Verify the search filters correctly match on name, SKU, and barcode.
- **PROD-LIST-FILT-003**: Category filtering. Verify selecting a category in the toolbar calls the API with the selected `categoryId` and resets the page index to 1.
- **PROD-LIST-FILT-004**: Brand filtering. Verify selecting a brand calls the API with `brandId` and resets page to 1.
- **PROD-LIST-FILT-005**: Status filtering. Verify selecting a status (Draft, Active, Inactive) filters list rows accordingly.
- **PROD-LIST-FILT-006**: Stock Status filtering. Verify stock status dropdown correctly filters list rows (Not Tracked, In Stock, Low Stock, Out of Stock).
- **PROD-LIST-FILT-007**: Reset Filters action. Clicking "Reset Filters" clears search queries and resets dropdown selectors, setting pagination back to page 1.

---

## 3. Data Formatting & Calculations

- **PROD-LIST-DATA-001**: One product per row. Verify that a product with multiple variants returns exactly one parent row in the table, with the variant count mapped correctly.
- **PROD-LIST-DATA-002**: Price Range formatting.
  - If all variants have the same price: verify standard price is shown (e.g. `LKR 2,500.00`).
  - If prices differ: verify range is shown (e.g. `LKR 2,500.00 – LKR 3,000.00`).
  - If price is missing: verify em dash (`—`) is shown.
- **PROD-LIST-DATA-003**: Missing stock representation. Verify that missing stock values render as `—` (dash) rather than defaulting to `0` stock.
- **PROD-LIST-DATA-004**: Badge colour mapping. Verify the following background/text semantics:
  - Active / In Stock: Green
  - Draft / Low Stock: Orange
  - Inactive / Not Tracked: Grey
  - Out of Stock: Red

---

## 4. Permissions & Action Routing

- **PROD-LIST-SEC-001**: Add Product permission. Verify the primary "Add Product" button is visible and clickable only if the user has `catalog.products.create`.
- **PROD-LIST-SEC-002**: View details action. Verify clicking the eye icon navigates the user to Product Details, and is visible only with `catalog.products.view` / details view permission.
- **PROD-LIST-SEC-003**: Edit action. Verify clicking the pencil icon navigates to the Product Edit flow, and is visible only with `catalog.products.update`.
- **PROD-LIST-SEC-004**: Delete action. Verify clicking the trash icon opens a confirmation modal, and is visible only with `catalog.products.delete`.
- **PROD-LIST-SEC-005**: Delete confirmation execution. Confirming delete in the modal calls the API, removes the row, and displays a success notification.
- **PROD-LIST-SEC-006**: Stock view leakage. When the user lacks stock view permission, verify that both the "Stock" and "Stock Status" columns display as empty dashes (`—`) and do not throw visual exceptions or leak backend quantities.

---

## 5. Network & Model Tests

- **PROD-LIST-NET-001**: Query parameter serialization. Verify `TenantProductListQuery` serializes correct keys (e.g., categoryId, brandId) and handles `pageNumber` correctly (no conflicts with legacy `page` parameter).
- **PROD-LIST-NET-002**: Null handling. Verify mapper converts null JSON fields to clean domain nulls without crash.
- **PROD-LIST-NET-003**: Request cancellation. Verify that triggering multiple filter changes in quick succession aborts previous stale queries using `CancelToken`.

---

## Related Files
- [[../../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
- [[../../../15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Tenant_Admin_Product_List_Implementation_Status]]
