# Tenant Admin Product List and Import Test Cases

## Feature Summary
- **Module**: 10_Product_Core / CatalogProduct
- **API Endpoints**:
  - `GET /api/v1/tenant-admin/products`
  - `GET /api/v1/tenant-admin/products/filter-options`
  - `GET /api/v1/tenant-admin/products/imports/template`
  - `POST /api/v1/tenant-admin/products/imports`
  - `POST /api/v1/tenant-admin/products/imports/{importId}/commit`
- **Primary Permissions**: `catalog.products.view`, `catalog.products.import`
- **Tenant Scoped**: Yes (strict validation on context and FK references)

---

## 1. Product List & Filtering Test Cases

### Empty and Initial States
- **PROD-LIST-001**: Empty Tenant Catalogue. When tenant has zero products and no search/filters active, verify response returns 200 OK with `catalogTotalCount = 0`, empty items list. (Displays "No products yet" in UI).
- **PROD-LIST-002**: Filtered Empty Result. When catalog has products, but a filter results in zero records, verify response returns `catalogTotalCount > 0` but `totalCount = 0` (items list empty). (Displays "No matching products found" in UI).

### Search Behavior
- **PROD-LIST-003**: Search by Product Name. Case-insensitive, trimmed, safe wildcard search on product name. Returns matching parent product.
- **PROD-LIST-004**: Search by Product Code. Exact or partial match on `products.product_code`.
- **PROD-LIST-005**: Search by SKU. Search term matches variant SKU, returns parent product once.
- **PROD-LIST-006**: Search by Barcode. Search term matches barcode, returns parent product once.

### Filter Combinations
- **PROD-LIST-007**: Category filter. Returns products matching selected category or its child subcategories.
- **PROD-LIST-008**: Brand filter. Returns products matching `products.brand_id`.
- **PROD-LIST-009**: Product Status filter. Acceptable parameters: `DRAFT`, `ACTIVE`, `INACTIVE`. Returns matching status rows.
- **PROD-LIST-010**: Stock Status filter. Returns calculated stock status matches: `NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`.
- **PROD-LIST-011**: Combined filters. Search + Category + Brand + Status filters combine using `AND`.
- **PROD-LIST-012**: Reset Filters. Returns all query parameters to default values and resets pageNumber to 1.

### Visibility & Row Uniqueness
- **PROD-LIST-013**: Default list visibility excludes `ARCHIVED` products. Verify archived products do not appear under All Status.
- **PROD-LIST-014**: One Product equals one row. Product with multiple variants, barcodes, and prices must return exactly one list item. `totalCount` equals number of distinct products.

### Calculated Field Validations
- **PROD-LIST-015**: Variant Count. Non-archived variant count aggregates. Simple product returns 1.
- **PROD-LIST-016**: Price Range. Returns single value if all variant prices match; returns range (Min to Max) if prices differ.
- **PROD-LIST-017**: Stock Quantity Aggregation. Scopes aggregate stock to selected outlet when `outletId` is present; returns tenant aggregate of active locations when `outletId` is absent.
- **PROD-LIST-018**: NOT_TRACKED Stock calculation. When `is_stock_tracked` is false, stock status is `NOT_TRACKED` and available stock is null.
- **PROD-LIST-019**: LOW_STOCK calculation. Triggered when available stock is below or equal to reorder threshold.
- **PROD-LIST-020**: OUT_OF_STOCK calculation. Triggered when tracked stock available quantity is <= 0.

### Security and Concurrency
- **PROD-LIST-021**: Stock permission leakage. When user lacks `inventory.stock.view`, verify product data returns but `stockQuantity` and `stockStatus` are null/omitted.
- **PROD-LIST-022**: Tenant Isolation. Verify sending categoryId or brandId belonging to another tenant returns 404/400 validation error.
- **PROD-LIST-023**: Concurrency mismatch. Editing product with outdated `rowVersion` returns 409 Conflict.

---

## 2. Product CSV Import Test Cases

### File Gating & Validation
- **PROD-IMP-001**: CSV template download returns 200 OK with correct UTF-8 CSV headers.
- **PROD-IMP-002**: Valid simple and variant CSV structure imports successfully.
- **PROD-IMP-003**: Invalid CSV headers, missing mandatory fields (e.g. `product_name`, `sku`), or unsupported MIME type returns 400 Bad Request.
- **PROD-IMP-004**: Large file size gating and row count limit checks return 400.

### Relational Checks
- **PROD-IMP-005**: Missing Category code lookup or cross-tenant category references return row-level validation errors.
- **PROD-IMP-006**: Duplicate SKU check. Detects duplicate SKU inside the CSV file and against database records.
- **PROD-IMP-007**: Duplicate Barcode check. Detects duplicate barcode inside file and database.

### Commit and Execution Rules
- **PROD-IMP-008**: Commit batch endpoint imports only validated rows. Invalid rows remain unimported.
- **PROD-IMP-009**: Transaction rollback. If creation of a product variants graph fails mid-row, verify whole product graph is rolled back to prevent orphans.
- **PROD-IMP-010**: Double commit protection. Resubmitting same import batch ID returns 409 Conflict.
- **PROD-IMP-011**: Cross-tenant import ID access returns 404 or 403.
- **PROD-IMP-012**: Opening stock movement validation. Opening stock must write to inventory movement ledger and update balances, never write directly to balance table.
- **PROD-IMP-013**: Error CSV download contains original rows with validation failure details. Verified immune to CSV formula injection.
