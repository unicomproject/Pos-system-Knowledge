<!-- title: Frequently Sold Product Discovery Feature Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# Frequently Sold Product Discovery Feature

## Purpose

The **Frequently Sold** segment dynamically calculates and ranks a tenant's most popular products based on completed sales from previous till sessions. This feature is calculated dynamically on the server and is not manually editable by Tenant Admins or Managers.

---

## Data Model Decision & Reuse

This feature is dynamic and reuses existing transaction tables. No new tables, cached rankings, or columns are added:
- `sales_orders` & `sales_order_lines`: Primary transaction history data source.
- `products` & `product_variants`: Standard POS catalog information, visibility status, and stock levels.
- `inventory_balances`: Active stock status and quantities per outlet.

---

## Calculation Rules

1. **Isolation & Scopes**:
   - Tenant context must be resolved from the authenticated caller (not accepted from the client).
   - Outlet context must be resolved from the trusted POS device context.
   - History is computed specifically for the current outlet.
2. **Rolling Window**: Calculates ranking using a configurable rolling window of completed orders. The default configuration value is `30 days`.
3. **Excluded Orders**: Draft, incomplete, voided, or cancelled orders are completely excluded.
4. **Aggregation**: Sales line item counts are aggregated at the **Product level** (not variant level) to avoid duplicate list entries for the same product.
5. **Quantity Calculation Formula**:
   $$\text{Net Quantity} = \max(\text{Quantity} - \text{CancelledQuantity} - \text{ReturnedQuantity}, 0)$$
6. **Sorting Priority**:
   - Net sold quantity descending
   - Completed transaction count descending
   - Most recent completed sale timestamp descending
   - Stable product identifier (product name/GUID) as tie-breaker
7. **Result Limits**: The query returns a default maximum of `20 products`.
8. **Catalog Availability**: Any historical product that has since been marked as inactive, deleted, or hidden from the POS channel/outlet is excluded.

---

## Access Control

The feature uses the standard POS catalogue view permissions:

| Context | Required Permission | Description |
|---|---|---|
| Cashier | `products.view` | Access product grid and view Frequently Sold tab |
| Cashier Search | `products.search` | Perform search filtering inside the Frequently Sold segment |

*Note: No custom admin management permission is required since this is an automated read-only client query.*

---

## Planned API Contract (Implementation Target)

### Get Frequently Sold Products (POS Client)
`GET /api/v1/pos/products?deviceId={deviceId}&segment=frequently-sold`
- **Response**: Standard response contract: `IReadOnlyList<PosProductSummaryResponseDto>`.

---

## Planned UI Contract

### Cashier POS UI
- Renders real-time ranked list returned by the server.
- Search and category filters work inside the Frequently Sold segment.
- If there is no sales history in the rolling window, the empty state displays: `No frequently sold products yet`.
- Error and retry states are fully supported.

---

## Implementation Evidence

### 1. Backend Implementation Details
- **Repository Class**: [PosProductCatalogRepository.cs](file:///C:/Users/User/Downloads/EPOS/POS%20Backend/Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/PosProductCatalogRepository.cs)
- **Aggregation Query**: LINQ query that dynamically aggregates completed sales at the product level for the current outlet.
- **Configurations**:
  - `PosProducts:FrequentlySold:LookbackDays` (Default: `30`)
  - `PosProducts:FrequentlySold:Limit` (Default: `20`)

### 2. Frontend Implementation Details
- **Quick Chip Widget**: [pos_product_category_chips.dart](file:///C:/Users/User/Downloads/EPOS/Pos%20Frontend/Nytroz-POS-App/lib/features/pos/presentation/widgets/new_sale/catalogue/pos_product_category_chips.dart)
- **Empty State Grid**: [pos_product_grid.dart](file:///C:/Users/User/Downloads/EPOS/Pos%20Frontend/Nytroz-POS-App/lib/features/pos/presentation/widgets/new_sale/product_card/pos_product_grid.dart)
- **Segment Header Prefix**: [pos_new_sale_screen.dart](file:///C:/Users/User/Downloads/EPOS/Pos%20Frontend/Nytroz-POS-App/lib/features/pos/presentation/screens/new_sale/pos_new_sale_screen.dart)

### 3. Automated Test Evidence
- **Backend Integration Tests**: [PosProductCatalogRepositoryTests.cs](file:///C:/Users/User/Downloads/EPOS/POS%20Backend/Unified-Commerce/tests/E_POS.IntegrationTests/CatalogProduct/PosProductCatalogRepositoryTests.cs) (All 20 integration tests passed successfully).
- **Frontend Unit Tests**: [pos_catalog_remote_datasource_test.dart](file:///C:/Users/User/Downloads/EPOS/Pos%20Frontend/Nytroz-POS-App/test/features/cart/pos_catalog_remote_datasource_test.dart) (Verified `segment=frequently-sold` query parameter).
