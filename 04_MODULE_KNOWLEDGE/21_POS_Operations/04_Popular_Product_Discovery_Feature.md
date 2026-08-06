<!-- title: Popular Product Discovery Feature Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-31 -->

# Popular Product Discovery Feature

## Purpose

The **Popular** segment allows a Tenant Admin or permission-authorized Manager to manually configure a list of products that appear by default under the Cashier New Sale screen's "Popular" discovery button. It is a manually curated list and is not computed from sales history.

---

## Data Model Decision & Reuse

This feature reuses existing table structures without adding new tables or product database columns:
- `collections`: Used to hold the tenant-scoped reserved collection with `collection_code = 'POS_POPULAR'` and `collection_type = 'POS_QUICK_LIST'`.
- `product_collections`: Maps products to the `POS_POPULAR` collection and stores the custom ordering via `sort_order`.
- `products` & `product_variants`: Base product details, visibility, status, and pricing.
- `inventory_balances`: Active stock status and quantities per outlet.

---

## Business Rules

1. **Reserved Identity**: The configuration relies on one tenant-scoped collection where `collection_code` is `POS_POPULAR`. The system automatically bootstraps this collection when first accessed.
2. **Tenant Isolation**: Only products belonging to the same tenant can be assigned. Cross-tenant product assignment is rejected with a validation error.
3. **Product Selection & Reordering**: Only active, non-deleted, and sellable products can be selected. Order is stored transactionally in `product_collections.sort_order`.
4. **Cashier Grid Resolution**: Cashier loads products from the `POS_POPULAR` collection, sorted by `sort_order` ascending, then by product name as a stable tie-breaker.
5. **Outlet Sellability**: Standard outlet channel visibility, stock status, and default price list pricing still apply to the resolved popular products in the Cashier grid.
6. **Fallback Behavior**: If no popular products are configured, an empty list is returned with the message: `No popular products configured`. There is no automatic fallback to other segments.

---

## Access Control

The feature enforces permissions at both Admin and Cashier layers without defining new permissions:

| Context | Required Permission | Description |
|---|---|---|
| Cashier | `products.view` | Access product grid and view Popular tab |
| Cashier Search | `products.search` | Perform search filtering inside the Popular segment |
| Admin View | `catalog.collections.view` | View the list of popular products in the admin console |
| Admin Edit | `catalog.collections.update` / `manage` | Replace assignments, reorder, and save configurations |

---

## Planned API Contract (Implementation Target)

### Get Popular Products (POS Client)
`GET /api/v1/pos/products?deviceId={deviceId}&segment=popular`
- **Response**: Shared standard response contract: `IReadOnlyList<PosProductSummaryResponseDto>`.

### Manage Popular Products (Admin Console)
- **Get Assignments**: `GET /api/v1/collections/pos-popular/products`
- **Replace/Reorder Assignments**: `PUT /api/v1/collections/pos-popular/products`
  - Accepts: `List<Guid> productIds` in the desired order.
  - Returns: standard success/error payload.

---

## Planned UI Contract

### Tenant Admin UI
- Accessible only with `catalog.collections.update` or `catalog.collections.manage` permissions.
- Shows list of currently assigned products in their sort order.
- Searchable product search bar to find and add active products.
- Drag-and-drop or explicit Move Up / Move Down buttons to reorder.
- "Save changes" button with submission protection (loading spinner/disabled states).

### Cashier POS UI
- Popular segment is selected by default on opening the New Sale screen.
- Grid reloads products matching the Popular segment from the backend.
- Empty state renders message: `No popular products configured`.
- Error states show a reload/retry action button.
