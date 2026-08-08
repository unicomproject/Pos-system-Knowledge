# Tenant Admin Product List Implementation Status

This document tracks the implementation progress, file-by-file change matrix, and readiness status for the Tenant Admin Product List frontend refactor.

---

## 1. Executive Status Summary

- **Overall Status**: `PLANNING & SPECIFICATION APPROVED`
- **Frontend Target**: Nytroz-POS-App (Flutter)
- **Backend Dependency**: Unified-Commerce (ASP.NET Core / Entity Framework)
- **Next Step**: Initiate frontend Flutter coding once execution phase is approved.

---

## 2. File-by-File Frontend Implementation Map

The following matrix details the impact of this scope on existing and new files in the Flutter project.

| File Path | Classification | Current Responsibility | Required Final Responsibility & Key Changes | Dependencies | Risk of Regression |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `lib/features/tenant_admin/products/presentation/screens/product_list_screen.dart` | **MODIFY** | Renders old summary cards and basic list panel. | Renders the new white-canvas layout, header (title + orange Add button), toolbar, populated list, loading/empty/error states. | `tenantProductListProvider`, `tenantProductQueryProvider` | Medium. Requires careful integration with the shared Tenant Admin layout scaffold. |
| `lib/features/tenant_admin/products/presentation/widgets/product_list_panel.dart` | **REMOVE** | Hosts layout wrapper and old list filters. | **Removed**. Logic is moved directly into the clean, single-canvas `ProductListScreen`. | N/A | Low. |
| `lib/features/tenant_admin/products/presentation/widgets/product_table.dart` | **MODIFY** | Renders basic table with legacy columns. | Renders exactly the 9 required columns in the specified order. Implements horizontal scrolling on narrow viewports. | `TenantProduct`, `ProductRowActions` | Medium. Must check column width distributions. |
| `lib/features/tenant_admin/products/presentation/widgets/product_summary_section.dart` | **REMOVE** | Displays KPI summary cards at the top of the list. | **Removed**. KPI summary cards are excluded from the target design. | N/A | Low. |
| `lib/features/tenant_admin/products/presentation/widgets/product_status_badge.dart` | **MODIFY** | Renders basic product status containers. | Updated to map colors according to the HSL green/orange/grey/red token rules for product status (`Draft`, `Active`, `Inactive`) and stock status (`Not Tracked`, `In Stock`, `Low Stock`, `Out of Stock`). | Standard Theme Tokens | Low. |
| `lib/features/tenant_admin/products/presentation/widgets/product_delete_action.dart` | **MODIFY** | Handles product deletion. | Renders trash bin icon button, opens confirmation modal, invokes delete service, and triggers list invalidation on success. | `TenantProductRepository` | Low. |
| `lib/features/tenant_admin/products/domain/entities/tenant_product.dart` | **MODIFY** | Defines domain entities with old schema. | Updated to define `TenantProduct`, `TenantProductListResult`, and `TenantProductListQuery` with all new attributes (`priceFrom`, `priceTo`, `variantCount`, `stockStatus`, `rowVersion`). | N/A | High. Modifying domain model affects editing and wizard flows. |
| `lib/features/tenant_admin/products/data/models/tenant_product_dto.dart` | **MODIFY** | Defines DTOs for JSON parsing. | Updated with fromJson factories mapping the new contract fields (`variantCount`, `priceFrom`, `priceTo`, `stockStatus`). | N/A | High. JSON mismatch will cause decoding crashes. |
| `lib/features/tenant_admin/products/data/mappers/tenant_product_mapper.dart` | **MODIFY** | Maps DTOs to Domain entities. | Updated to map new attributes and enforce nullability constraints. | `TenantProductListItemDto`, `TenantProduct` | Medium. |
| `lib/features/tenant_admin/products/data/datasources/tenant_product_remote_datasource.dart` | **MODIFY** | Calls products API. | Accepts `CancelToken` and passes query arguments from `TenantProductListQuery` to `/api/v1/tenant-admin/products`. | `Dio` client | Medium. |
| `lib/features/tenant_admin/products/domain/repositories/tenant_product_repository.dart` | **MODIFY** | Repository interface. | Updates signature to return `TenantProductListResult` and support filter queries. | N/A | Medium. |
| `lib/features/tenant_admin/products/data/repositories/tenant_product_repository_impl.dart` | **MODIFY** | Repository implementation. | Implements API calls, exception translation, and mapping. | `TenantProductRemoteDatasource`, `TenantProductMapper` | Medium. |
| `lib/features/tenant_admin/products/presentation/providers/tenant_product_providers.dart` | **MODIFY** | Exposes state providers. | Exposes `tenantProductQueryProvider`, `tenantProductListProvider` (FutureProvider with auto-dispose and cancel tokens), and `tenantProductFilterOptionsProvider`. | `TenantProductRepository` | High. Controls reactive data flows. |
| `lib/features/tenant_admin/products/presentation/navigation/products_sidebar_visibility.dart` | **MODIFY** | Controls sidebar child visibility. | Updates visibility rules to only display `Add Product`, `Categories & Subcategories`, and `Brand`. Removes `Product List`, `Product Dashboard`, and `Import`. | Current User Session Permissions | Medium. |
| `lib/features/tenant_admin/products/presentation/navigation/products_sidebar_routes.dart` | **MODIFY** | Sidebar route maps. | Maps clicking the parent menu "Products" directly to `/tenant-admin/products`. | N/A | Medium. |
| `lib/features/tenant_admin/tenant_admin_router.dart` | **MODIFY** | Defines go_router paths. | Removes any `/tenant-admin/products/import` paths and ensures the product list path resolves to `/tenant-admin/products`. | `ProductListScreen` | High. Impacts routing. |
| `test/features/tenant_admin/products_sidebar_navigation_test.dart` | **MODIFY** | Tests sidebar items. | Asserts that only the exactly approved three submenu items exist in the correct order, and parent route is verified. | Widget Test Framework | Low. |
| `test/features/tenant_admin/product_list_screen_test.dart` | **CREATE** | New list test file. | Implements all UI, state, filter, pagination, and permission widget/unit tests described in the test matrix. | Widget Test Framework | Low. |

---

## 3. Backend Dependencies & Blockers

Although the frontend code can be written, the following backend gaps in `Unified-Commerce` are identified as dependencies:
1. **Server-side query filtering**: `GET /api/v1/tenant-admin/products` currently only accepts `search`, `page`, and `pageSize`. Server-side filtering for `categoryId`, `brandId`, `productStatus`, and `stockStatus` must be implemented.
2. **Aggregated Price and Stock fields**: The backend list projection currently returns only single price and flat stock values, and lacks variant counts. Aggregating `variantCount`, `priceFrom`, `priceTo`, and derived `stockStatus` must be added.
3. **`catalogTotalCount` return**: The list response must return `catalogTotalCount` alongside page parameters to distinguish empty states.

---

## Related Files
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
- [[../../10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_Test_Cases]]
