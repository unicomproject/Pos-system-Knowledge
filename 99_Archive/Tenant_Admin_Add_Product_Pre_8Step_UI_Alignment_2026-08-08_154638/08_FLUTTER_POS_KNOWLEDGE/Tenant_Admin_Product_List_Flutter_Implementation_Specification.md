<!-- title: Tenant Admin Product List Flutter Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product List Flutter Implementation Specification

This document provides a detailed technical specification for implementing the new Tenant Admin Product List frontend in the `Nytroz-POS-App` Flutter codebase.

---

## 1. Routing & Layout Ownership

- **Route Path**: `/tenant-admin/products`
- **GoRouter Definition**: Must reside in `lib/features/tenant_admin/tenant_admin_router.dart`.
- **Layout Integration**: The route must load inside the shared `TenantAdminSharedShell` (often managed by `ShellRoute` or a parent stateful shell widget). The `ProductListScreen` widget must only render the inner canvas content. It must **never** instantiate its own sidebar, header, footer, or app shell scaffold.
- **Sidebar Parent Highlight**: The parent "Products" sidebar item must remain expanded and highlighted in orange while `/tenant-admin/products` or any sub-route (Add Product, Categories, Brands, Details, Edit) is active.

---

## 2. Component Hierarchy

The screen layout must be structured as follows:

```text
ProductListScreen
├── ProductListHeader
│   └── AddProductButton (Gated by permissions)
├── ProductFilterToolbar
│   ├── ProductSearchField (Debounced text input)
│   ├── ProductCategoryFilter (Dropdown)
│   ├── ProductBrandFilter (Dropdown)
│   ├── ProductStatusFilter (Dropdown)
│   ├── ProductStockStatusFilter (Dropdown)
│   └── ProductResetFiltersAction (Text button)
├── ProductListStateHost (Dynamic content area switcher)
│   ├── ProductListLoadingState (Skeletons)
│   ├── ProductFirstUseEmptyState (No products illustrations + CTA)
│   ├── ProductFilteredEmptyState (No search matches + Reset action)
│   ├── ProductListErrorState (Alert box + Retry button)
│   ├── ProductPermissionDeniedState (Shield overlay)
│   └── ProductTable
│       ├── ProductIdentityCell (Image + Name)
│       ├── ProductPriceCell (Single / range formatted)
│       ├── ProductStatusBadge (Colored container)
│       ├── ProductStockStatusBadge (Colored container)
│       └── ProductRowActions (View, Edit, Delete buttons)
└── ProductPagination (Page controls + Page size selector)
```

---

## 3. Domain Models & Nullability Rules

Create or modify domain entities in `lib/features/tenant_admin/products/domain/entities/tenant_product.dart`:

### TenantProduct
```dart
class TenantProduct {
  const TenantProduct({
    required this.id,
    required this.productCode,
    required this.name,
    required this.sku,
    required this.variantCount,
    required this.priceFrom,
    required this.priceTo,
    required this.productStatus,
    this.primaryBarcode,
    this.imageUrl,
    this.categoryId,
    this.categoryName,
    this.brandId,
    this.brandName,
    this.currencyCode,
    this.stockQuantity,
    this.stockStatus,
    required this.rowVersion,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String productCode;
  final String name;
  final String sku;
  final String? primaryBarcode;
  final String? imageUrl;
  final String? categoryId;
  final String? categoryName;
  final String? brandId;
  final String? brandName;
  final int variantCount;
  final double priceFrom;
  final double priceTo;
  final String? currencyCode;
  final double? stockQuantity; // Nullable to protect permission leaks
  final String? stockStatus;   // Nullable to protect permission leaks
  final String productStatus;
  final int rowVersion;
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

### TenantProductListResult
```dart
class TenantProductListResult {
  const TenantProductListResult({
    required this.items,
    required this.pageNumber,
    required this.pageSize,
    required this.totalCount,
    required this.totalPages,
    required this.hasPreviousPage,
    required this.hasNextPage,
    required this.catalogTotalCount,
  });

  final List<TenantProduct> items;
  final int pageNumber;
  final int pageSize;
  final int totalCount;
  final int totalPages;
  final bool hasPreviousPage;
  final bool hasNextPage;
  final int catalogTotalCount; // Used to differentiate empty vs filtered empty states
}
```

### TenantProductListQuery
```dart
class TenantProductListQuery {
  const TenantProductListQuery({
    this.search,
    this.categoryId,
    this.brandId,
    this.productStatus,
    this.stockStatus,
    this.pageNumber = 1,
    this.pageSize = 10,
    this.sortBy = 'productName',
    this.sortDirection = 'asc',
  });

  final String? search;
  final String? categoryId;
  final String? brandId;
  final String? productStatus;
  final String? stockStatus;
  final int pageNumber;
  final int pageSize;
  final String sortBy;
  final String sortDirection;

  TenantProductListQuery copyWith({
    String? search,
    String? categoryId,
    String? brandId,
    String? productStatus,
    String? stockStatus,
    int? pageNumber,
    int? pageSize,
    String? sortBy,
    String? sortDirection,
  }) {
    return TenantProductListQuery(
      search: search ?? this.search,
      categoryId: categoryId ?? this.categoryId,
      brandId: brandId ?? this.brandId,
      productStatus: productStatus ?? this.productStatus,
      stockStatus: stockStatus ?? this.stockStatus,
      pageNumber: pageNumber ?? this.pageNumber,
      pageSize: pageSize ?? this.pageSize,
      sortBy: sortBy ?? this.sortBy,
      sortDirection: sortDirection ?? this.sortDirection,
    );
  }

  Map<String, dynamic> toQueryParameters() {
    return {
      if (search != null && search!.trim().isNotEmpty) 'search': search!.trim(),
      if (categoryId != null) 'categoryId': categoryId,
      if (brandId != null) 'brandId': brandId,
      if (productStatus != null) 'productStatus': productStatus,
      if (stockStatus != null) 'stockStatus': stockStatus,
      'pageNumber': pageNumber,
      'pageSize': pageSize,
      'sortBy': sortBy,
      'sortDirection': sortDirection,
    };
  }
}
```

---

## 4. DTO & Mapper Specifications

Define models inside `lib/features/tenant_admin/products/data/models/tenant_product_dto.dart`:

```dart
class TenantProductListItemDto {
  const TenantProductListItemDto({
    required this.id,
    required this.productCode,
    required this.name,
    required this.sku,
    this.primaryBarcode,
    this.imageUrl,
    this.categoryId,
    this.categoryName,
    this.brandId,
    this.brandName,
    required this.variantCount,
    required this.priceFrom,
    required this.priceTo,
    this.currencyCode,
    this.stockQuantity,
    this.stockStatus,
    required this.productStatus,
    required this.rowVersion,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TenantProductListItemDto.fromJson(Map<String, dynamic> json) {
    return TenantProductListItemDto(
      id: json['id'] as String,
      productCode: json['productCode'] as String? ?? '',
      name: json['name'] as String? ?? '',
      sku: json['sku'] as String? ?? '',
      primaryBarcode: json['primaryBarcode'] as String?,
      imageUrl: json['imageUrl'] as String?,
      categoryId: json['categoryId'] as String?,
      categoryName: json['categoryName'] as String?,
      brandId: json['brandId'] as String?,
      brandName: json['brandName'] as String?,
      variantCount: json['variantCount'] as int? ?? 1,
      priceFrom: (json['priceFrom'] as num?)?.toDouble() ?? 0.0,
      priceTo: (json['priceTo'] as num?)?.toDouble() ?? 0.0,
      currencyCode: json['currencyCode'] as String?,
      stockQuantity: (json['stockQuantity'] as num?)?.toDouble(),
      stockStatus: json['stockStatus'] as String?,
      productStatus: json['productStatus'] as String? ?? 'DRAFT',
      rowVersion: json['rowVersion'] as int? ?? 1,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  final String id;
  final String productCode;
  final String name;
  final String sku;
  final String? primaryBarcode;
  final String? imageUrl;
  final String? categoryId;
  final String? categoryName;
  final String? brandId;
  final String? brandName;
  final int variantCount;
  final double priceFrom;
  final double priceTo;
  final String? currencyCode;
  final double? stockQuantity;
  final String? stockStatus;
  final String productStatus;
  final int rowVersion;
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

Implement the DTO to domain mapper in `lib/features/tenant_admin/products/data/mappers/tenant_product_mapper.dart`. Widgets must never read raw DTOs; they must consume clean domain objects mapped from the repository.

---

## 5. Network & Repository layer

### Remote Datasource
- **Location**: `lib/features/tenant_admin/products/data/datasources/tenant_product_remote_datasource.dart`.
- **Rules**:
  - Must accept a `CancelToken` to abort requests when queries are changed rapidly.
  - Must use the active `Dio` client wrapper. Direct Dio initialization is strictly prohibited.
  - Endpoint path must match: `/api/v1/tenant-admin/products`.

### Repository
- **Location**: `lib/features/tenant_admin/products/data/repositories/tenant_product_repository_impl.dart`.
- **Rules**:
  - Handles API failures, parses exception messages, and returns a functional functional-either or standardized result model wrapper.
  - Prevents raw network exception leaks to the UI layer.

---

## 6. Riverpod State Architecture

Define providers in `lib/features/tenant_admin/products/presentation/providers/tenant_product_providers.dart`:

1. **`tenantProductQueryProvider`**: StateProvider managing the active `TenantProductListQuery`.
2. **`tenantProductListProvider`**: FutureProvider that watches `tenantProductQueryProvider` and fetches data using the repository, passing a CancelToken.
   - Using Riverpod's `ref.keepAlive()` or auto-dispose features properly to prevent duplicate fetches.
3. **`tenantProductFilterOptionsProvider`**: FutureProvider fetching filter dropdown values from `GET /api/v1/tenant-admin/products/filter-options`.

---

## 7. Action & Interaction Implementations

- **Permission Gating**:
  - The "Add Product" button is visible only when the current session has `catalog.products.create` permission.
  - Edit actions are visible only with `catalog.products.update`.
  - Delete actions are visible only with `catalog.products.delete`.
  - Stock columns and values display as `—` (dash) if the user lacks `inventory.stock.view`.
- **Delete Confirmation Flow**:
  - Clicking delete triggers `showDialog` to load `ProductDeleteConfirmModal`.
  - Confirmed action calls the repository delete API.
  - Success invalidates the `tenantProductListProvider` causing the list to fetch fresh data.
  - Failures are caught and presented as a Snackbar notification.

---

## Related Files
- [[../../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[../../10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_Test_Cases]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Tenant_Admin_Product_List_Implementation_Status]]
