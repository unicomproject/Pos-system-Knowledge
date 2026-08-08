<!-- title: Tenant Admin Product List and Import Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product List and Import Contract

## 1. Product List API Contract

`GET /api/v1/tenant-admin/products`

### Request Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `search` | string | No | null | Case-insensitive server-side search (trimmed, safe for SQL wildcard, max 100 chars). Matches `products.product_name`, `products.product_code`, `product_variants.sku`, or `product_barcodes.barcode`. |
| `categoryId` | Guid | No | null | Filters products by assigned Category (or child Sub-category). |
| `brandId` | Guid | No | null | Filters products by `products.brand_id`. |
| `productStatus` | string | No | null | Allowed: `DRAFT`, `ACTIVE`, `INACTIVE`. (Filters `products.status`). |
| `stockStatus` | string | No | null | Allowed: `NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` (Calculated). |
| `outletId` | Guid | No | null | Scopes inventory aggregates and overrides to this outlet. |
| `pageNumber` | int | No | 1 | Page index (minimum 1). Changing search/filters resets pageNumber to 1. |
| `pageSize` | int | No | 10 | Records per page (maximum 100). |
| `sortBy` | string | No | `productName` | Sort field (e.g. `productName`, `sku`, `createdAt`). |
| `sortDirection` | string | No | `asc` | Sort direction (`asc`, `desc`). Product ID is always final tie-breaker. |

### Response DTO (200 OK)
```json
{
  "data": {
    "summary": {
      "totalProducts": 128,
      "activeProducts": 110,
      "inactiveProducts": 10,
      "draftProducts": 8,
      "catalogTotalCount": 128
    },
    "items": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "productCode": "OVZ-HJ-RED",
        "name": "Home Jersey (Red, L)",
        "imageUrl": "https://cdn.oneverzpos.com/media/jersey_red.png",
        "sku": "OVZ-HJ-RED-L",
        "primaryBarcode": "2000000000626",
        "categoryId": "77777777-0338-4000-8000-000000000001",
        "categoryName": "Apparel",
        "brandId": "88888888-0338-4000-8000-000000000001",
        "brandName": "Adidas",
        "variantCount": 5,
        "priceFrom": 2500.00,
        "priceTo": 3000.00,
        "currencyCode": "LKR",
        "stockQuantity": 25.0,
        "productStatus": "ACTIVE",
        "stockStatus": "IN_STOCK",
        "rowVersion": 1,
        "createdAt": "2026-07-15T10:00:00Z",
        "updatedAt": "2026-08-06T15:00:00Z"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 1,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false,
    "catalogTotalCount": 128
  }
}
```

### Stock Permission Protection
When caller has `catalog.products.view` but not `inventory.stock.view`:
- `stockQuantity` is returned as `null`.
- `stockStatus` is returned as `null`.

---

## 2. Product List Business Validation

### One Product = One Row
The repository must group joins on variants, barcodes, images, prices, and locations so that exactly one parent Product ID represents one row in the list response. Pagination must be applied on the final filtered parent product query. `totalCount` represents distinct Product IDs.

### Default Visibility & Lifecycle Rules
- `DRAFT`, `ACTIVE`, and `INACTIVE` status items are visible in the normal list.
- `ARCHIVED` items are excluded by default.
- Soft Delete: Delete action in UI updates status to `ARCHIVED`, setting `archived_at` and `archived_by_tenant_user_id`. Historical references are preserved. Hard delete is excluded.

### Stock Status Derivation (Server-side)
Do not store `stock_status` in the database. Calculate dynamically:
`available_quantity` = `on_hand_quantity` - `reserved_quantity` - `damaged_quantity` - `quarantine_quantity`
- **NOT_TRACKED**: `product_inventory_settings.is_stock_tracked` = `false`.
- **OUT_OF_STOCK**: Tracked stock and `available_quantity` <= 0.
- **LOW_STOCK**: Tracked stock, `available_quantity` > 0, and `available_quantity` <= `product_inventory_settings.low_stock_threshold` (or inventory reorder point rule).
- **IN_STOCK**: Tracked stock and `available_quantity` > threshold.
- *Product level Stock Status*: Aggergate variants. If at least one active variant/location is `LOW_STOCK` while total stock is > 0, product stock status is `LOW_STOCK`. If all variants are `OUT_OF_STOCK`, parent is `OUT_OF_STOCK`.

### Price Projections
- If all non-archived sellable variants have the same active default selling price: return value as `priceFrom` and `priceTo`.
- If prices differ: return minimum as `priceFrom` and maximum as `priceTo`.
- Exclude expired, inactive, or archived prices.

---

## 3. Product Filter Options API

`GET /api/v1/tenant-admin/products/filter-options`

- **Required Permission**: `catalog.products.view`
- **Response**: Returns tenant-owned Active Categories, Brands, ProductStatuses (`DRAFT`, `ACTIVE`, `INACTIVE`), StockStatuses (`NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`), and `supportedSortFields`.

---

## 4. Product CSV Import API Contracts

### Download CSV Template
`GET /api/v1/tenant-admin/products/imports/template`
- Returns a standard UTF-8 header-only CSV file.

### Upload CSV File
`POST /api/v1/tenant-admin/products/imports`
- **Content-Type**: `multipart/form-data`
- **Payload**: `file` (CSV format)
- **Response (201 Created)**: Returns batch metadata, `importId`, and validation summary.
```json
{
  "importId": "9fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fileName": "products_v1.csv",
  "importStatus": "VALIDATED",
  "totalRows": 150,
  "validRows": 145,
  "invalidRows": 5
}
```

### Get Import Details & Rows
`GET /api/v1/tenant-admin/products/imports/{importId}`
`GET /api/v1/tenant-admin/products/imports/{importId}/rows?status=INVALID&pageNumber=1&pageSize=50`

### Commit Import Batch
`POST /api/v1/tenant-admin/products/imports/{importId}/commit`
- **Required Permission**: `catalog.products.import`
- **Process**: Imports only the valid rows of the batch. Invalid rows remain skipped. Transaction boundaries prevent partial product/variant graphs.

### Download Error Log
`GET /api/v1/tenant-admin/products/imports/{importId}/errors.csv`
- Returns original CSV columns appended with `Row_Status`, `Error_Code`, and `Error_Detail`. Must protect against CSV formula injection.

---

## 5. CSV Structure & Columns

- **UTF-8 Encoded**. One row represents one sellable variant.
- Variant rows are grouped under one product by `product_key` (temporary file-level identifier) or `product_code`.

| Column | Mandatory/Optional | Type | Notes |
| :--- | :--- | :--- | :--- |
| `product_key` | Mandatory | string | Used to group multiple variant rows into one parent product graph. |
| `product_name` | Mandatory | string | Parent product display name. |
| `category_code`| Mandatory | string | Tenant category reference lookup code. |
| `product_type` | Mandatory | string | `SIMPLE` or `VARIANT` (F&B / Combos / Bundles are excluded from CSV). |
| `unit_code` | Mandatory | string | Tenant stock unit of measure code. |
| `sku` | Mandatory | string | Unique SKU tenant-wide. Checked against DB and CSV duplicates. |
| `selling_price`| Mandatory | numeric | Selling price. Must be decimal value. |
| `product_code` | Optional | string | Product-level code. |
| `short_description`| Optional | string | Product short summary. |
| `brand_code` | Optional | string | Tenant brand reference lookup code. |
| `barcode` | Optional | string | Unique barcode tenant-wide. Checked against DB and CSV duplicates. |
| `variant_name` | Optional | string | Mandatory for `VARIANT` product types. |
| `cost_price` | Optional | string | Reference cost price. |
| `track_inventory`| Optional | boolean | Defaults to `true`. |
| `outlet_code` | Optional | string | Scope for opening stock. |
| `opening_stock`| Optional | numeric | Requires valid `outlet_code` & `track_inventory=true`. Writes to ledger. |
| `low_stock_threshold`| Optional| numeric| Threshold for low-stock warning triggers. |
| `status` | Optional | string | Defaults to `DRAFT`. Allowed `ACTIVE` if validation passes. |

### Opening Stock Processing Rules
Never bypass the stock movement ledger. When `opening_stock` is provided:
1. Create product and variant.
2. Resolve `outlet_code` to Tenant Inventory Location.
3. Issue an authoritative inventory stock-in/adjustment movement ledger entry (`opening_stock` quantity, `cost_price` if available, timestamped).
4. Update `inventory_balances`.
