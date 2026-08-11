<!-- title: Tenant Admin Product List Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product List Contract

This contract defines the canonical communication layer between the Flutter Tenant Admin Product List frontend and the Unified Commerce backend. It strictly governs query models, list responses, filter options, and core database projection rules. All product import references have been removed from this active interface.

---

## 1. Product List API endpoint

`GET /api/v1/tenant-admin/products`

### Request Query Parameters
| Query Parameter | JSON/Dart Query Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `search` | `search` | string | No | null | Case-insensitive server-side search (trimmed, max 100 characters). Matches `products.product_name`, `products.product_code` (as fallback), `product_variants.sku` (via join), or `product_barcodes.barcode` (via join). |
| `categoryId` | `categoryId` | Guid/String | No | null | Filters products by assigned Category ID (or its child subcategories). |
| `brandId` | `brandId` | Guid/String | No | null | Filters products by `products.brand_id`. |
| `productStatus` | `productStatus` | string | No | null | Allowed: `DRAFT`, `ACTIVE`, `INACTIVE`. Filters `products.status`. |
| `stockStatus` | `stockStatus` | string | No | null | Allowed: `NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK` (Calculated server-side). |
| `pageNumber` | `pageNumber` | int | No | 1 | 1-based page index. Changing search or filters resets `pageNumber` to 1. |
| `pageSize` | `pageSize` | int | No | 10 | Records per page. Allowed values: 10, 25, 50. Page size change resets page to 1. |
| `sortBy` | `sortBy` | string | No | `productName` | Sort field (e.g. `productName`, `sku`, `createdAt`). |
| `sortDirection` | `sortDirection` | string | No | `asc` | Sort direction (`asc`, `desc`). |

### Response Envelope (200 OK)
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

### Stock View Permission Gates
When the user has `catalog.products.view` but lacks `inventory.stock.view` / `inventory.alerts.view`:
- `stockQuantity` is returned as `null` in the JSON payload.
- `stockStatus` is returned as `null` in the JSON payload.
- The frontend must respect these nulls and render em dashes (`—`) or hide stock data columns/elements according to rules (never fallback to a fake zero `0` stock or default to `NOT_TRACKED`).

---

## 2. Product List Business & Database Projection Rules

### One Product = One Row
The backend repository executes server-side aggregates to ensure that even if a product has multiple variants, barcodes, prices, or images, it appears exactly once in the list response.
- `items[].id` represents `products.id`.
- `totalCount` and pagination offsets are calculated at the `products` entity level, not the variant level.

### Default List Visibility
- Default product query includes `DRAFT`, `ACTIVE`, and `INACTIVE` statuses.
- `ARCHIVED` products (soft-deleted) are strictly excluded from the list unless a specialized archive filter is passed.

### Calculated Price Ranges
- `priceFrom` and `priceTo` represent the minimum and maximum active prices across all non-archived sellable variants of the product.
- If it is a Simple Product or all variants have the same price, `priceFrom` equals `priceTo`.
- Default Currency: Determined by tenant configuration. Sri Lankan tenants default to `LKR`. The currency code (`items[].currencyCode`) is returned in the API payload and must not be hardcoded on the client. If currency is null, display `—`.

### Calculated Variant Counts
- `variantCount` represents the count of non-archived variants linked to the product. Simple products return `1` variant.

### Server-side Stock Status Derivation
Stock Status is calculated server-side based on inventory records. The status is derived using the formula:
`available_quantity = on_hand_quantity - reserved_quantity - damaged_quantity - quarantine_quantity`
- **NOT_TRACKED**: Product tracking settings denote stock tracking is disabled.
- **OUT_OF_STOCK**: Tracked and `available_quantity` <= 0.
- **LOW_STOCK**: Tracked, `available_quantity` > 0, and `available_quantity` <= `low_stock_threshold` (or reorder rules).
- **IN_STOCK**: Tracked and `available_quantity` > `low_stock_threshold`.

---

## 3. Product Filter Options API

`GET /api/v1/tenant-admin/products/filter-options`

- **Required Permission**: `catalog.products.view`
- **Purpose**: Retrieves available filter dropdown values for the Tenant Admin user, ensuring view-only users can filter the Product List. (Does not use the edit-options route which requires create permissions).
- **Response Structure (200 OK)**:
```json
{
  "data": {
    "categories": [
      {
        "id": "77777777-0338-4000-8000-000000000001",
        "categoryName": "Apparel",
        "categoryCode": "APP"
      }
    ],
    "brands": [
      {
        "id": "88888888-0338-4000-8000-000000000001",
        "brandName": "Adidas",
        "brandCode": "ADI"
      }
    ],
    "productStatuses": ["DRAFT", "ACTIVE", "INACTIVE"],
    "stockStatuses": ["NOT_TRACKED", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]
  }
}
```

---

## 4. Frontend Data Integrity Restrictions (Prohibitions)

The frontend developer is strictly prohibited from applying client-side defaults that distort database states:
1. **No Fake Zero Stock**: If `stockQuantity` is null (e.g., due to denied permissions or uncommitted calculations), the UI must display a dash (`—`). Never display `0`.
2. **No Hardcoded Currency**: The currency prefix must always match `items[].currencyCode` from the API response.
3. **No Local Variant Calculation**: The variant count must always match `variantCount` returned by the server.
4. **No Arbitrary Status Failbacks**: If status is missing or unrecognized, do not assume `ACTIVE` status.

---

## Related Files
- [[../../06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_Test_Cases]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Tenant_Admin_Product_List_Implementation_Status]]
