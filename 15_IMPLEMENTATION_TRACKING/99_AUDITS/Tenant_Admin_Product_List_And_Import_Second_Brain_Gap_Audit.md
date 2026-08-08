<!-- title: Tenant Admin Product List and Import Second Brain Gap Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product List & Import Second Brain Gap Audit

This audit compares the visual requirements in Screenshot 2 (Product Empty State) and Screenshot 3 (Populated Product List), the current active Second Brain documentation, and the actual implementation in the `Unified-Commerce` backend codebase.

## 1. Executive Summary

- **Product List API Route**: The backend implements `/api/v1/tenant-admin/products` in [TenantAdminProductsController.cs](file:///C:/Users/user/Desktop/E-Pos/Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/TenantAdminProductsController.cs), which aligns perfectly with the target screen boundary. However, the older `/api/v1/products` route in [ProductsController.cs](file:///C:/Users/user/Desktop/E-Pos/Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/ProductsController.cs) remains active and presents a duplication/coexistence risk.
- **Product Import API**: There is **no implementation** whatsoever for CSV imports in the backend codebase, and the active Second Brain only contains an archived, stale database document in `99_Archive`. A new backend API, database schemas, processing rules, and testing parameters must be introduced.
- **Filtering & Search**: The current backend `ListAsync` method only supports basic `search` (simple wildcard on Name/SKU/Barcode) and page parameters. Screenshot 3 demands full relational filters (`categoryId`, `brandId`, `productStatus`, `stockStatus`, `outletId`, `sortBy`, `sortDirection`). These are **MISSING** in both code and active Second Brain.
- **Status Lifecycles**: The backend uses a legacy status pool (`ACTIVE`, `INACTIVE`, `DELETED`). The target lifecycle requires `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED` (with soft delete). Database columns and code models must be migrated.
- **Stock Status**: The derived server-side Stock Status (`NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) is completely **MISSING** from the current catalog backend list projections.

---

## 2. Requirement-by-Requirement Gap Matrix

| Section / Requirement | Classification | Current Second Brain | Current Backend Code | Gap Description & Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Route / Boundary** | CONFLICTING | `/api/v1/products` & `/api/v1/tenant-admin/products` both mentioned. | [TenantAdminProductsController.cs](file:///C:/Users/user/Desktop/E-Pos/Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/TenantAdminProductsController.cs) handles tenant admin, but [ProductsController.cs](file:///C:/Users/user/Desktop/E-Pos/Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/ProductsController.cs) still implements duplicate endpoints. | Document `/api/v1/tenant-admin/products` as the canonical route and `/api/v1/products` as a compatibility alias. |
| **Product List States** | MISSING | Not defined. | Returns empty list if count is 0; doesn't supply total counts context for "First-use empty" vs "Filtered empty". | Define `catalogTotalCount` and `totalCount` to let frontend distinguish between First-use Empty and Filtered Empty. |
| **Default Visibility** | MISSING | Not defined. | Returns all items including those marked `DELETED`. | Document that list query must filter out `ARCHIVED` products, displaying only `DRAFT`, `ACTIVE`, and `INACTIVE`. |
| **Product Lifecycle** | BACKEND MODIFICATION REQUIRED | Mentions `DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`. | Hardcoded status check to `ACTIVE`, `INACTIVE`, `DELETED`. No draft/archived helper timestamps. | Update tables, domain validation, check constraints, and backfill migration strategy. |
| **Stock Status** | NEW BACKEND REQUIRED | Not documented. | No stock status logic in product core; inventory is in a decoupled module. | Document server-side Stock Status calculation formula using inventory balances and reorder points. |
| **Low-Stock Notification** | NEW BACKEND REQUIRED | Not documented. | No threshold crossing check exists on list or stock-in. | Document event-driven alerts using `inventory.alerts.view` permission to prevent spam. |
| **Search across multiple tables** | PARTIAL | Basic search documented. | Wildcard search on Name, SKU, and Barcode. | Explicitly document case-insensitive server-side search joining Variants and Barcodes returning parent Product once. |
| **Query Filters (Category, Brand, etc.)**| BACKEND MODIFICATION REQUIRED | Not documented. | Only accepts `search`, `page`, and `pageSize`. | Document full query parameter payload mapping to SQL joins combined with `AND`. |
| **One Product = One Row** | COMPLETE | Documented. | Already groups variants to return parent. | Ensure pagination happens at the product level, not variant level, and total count represents distinct products. |
| **Variant Count** | BACKEND MODIFICATION REQUIRED | Not documented. | Returns flat lists without counting child variant aggregates. | Add `variantCount` field. Count non-archived variants; simple product returns 1. |
| **Price / Price Range** | BACKEND MODIFICATION REQUIRED | Returns single `Price` decimal. | Returns standard `Price` field. | Return `priceFrom`, `priceTo`, and `currencyCode` range when variants have distinct prices. |
| **Filter Options API** | MISSING | Not documented. | Endpoint does not exist. Only `create-options` exists which requires create permissions. | Create `GET /api/v1/tenant-admin/products/filter-options` available with `catalog.products.view`. |
| **Product Actions (View/Edit/Archive)** | BACKEND MODIFICATION REQUIRED | Wizard mentions steps. | View/Edit exists. Delete performs hard delete or changes status to `DELETED`. | Redefine Delete action as Archive/soft-delete. Emit audit events. |
| **CSV Product Import Batch** | NEW BACKEND REQUIRED | Archived table schema only. | No endpoint or service implementation. | Implement CSV template download, upload batch validation, error CSV generation, and commit phase. |
| **Import Row Validation Rules** | NEW BACKEND REQUIRED | Stale file. | None. | Document validation criteria: mandatory fields, tenant references, SKU uniqueness, and draft lifecycle defaults. |
| **Import Row Commit (Transactions)** | NEW BACKEND REQUIRED | None. | None. | Document transactional boundaries ensuring no half-created product graphs on failure. |
| **Permissions Alignment (ADR 007)** | CONFLICTING | Duplicate `tenant.products.*` and `catalog.products.*` exist. | References both `TenantAdminProductPermissions` and `ProductConstants`. | Canonicalize permissions to `catalog.products.*` as per ADR 007. Mark legacy as aliases. |
| **Database: products schema** | BACKEND MODIFICATION REQUIRED | Outdated. | Lacks draft/archived audit columns. | Document `draft_saved_at`, `published_at`, `archived_at`, and status CHECK constraints. |
| **Database: product_import_batches** | NEW BACKEND REQUIRED | Archived. | Table does not exist in schema. | Define table structure, FK constraints, idempotency keys, and tenant-scoped indexes. |
| **Database: product_import_rows** | NEW BACKEND REQUIRED | Archived. | Table does not exist in schema. | Define row logging schema, raw payloads, error metrics, and unique batch constraints. |
| **NFR (Performance, Scaling)** | MISSING | Not documented. | No cancellation token, no pagination performance gates. | Specify default page limits, p95 targets, cancellation token enforcement, and 10k product scale test bounds. |
| **Test Cases** | PARTIAL | Basic CRUD cases exist. | Standard entity unit tests. | Document comprehensive test suite for all list filters, empty states, import error permutations, and concurrency conflicts. |

---

## 3. Recommended Remediation Plan

1. **Active Second Brain Restructuring**:
   - Update [[03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow]] to link the new Empty State and Populated List states.
   - Update [[04_MODULE_KNOWLEDGE/10_Product_Core/01_Module_Overview]], [[04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules]], and [[04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract]] to establish the canonical Product List API, Filter Options, and Product Import workflow details.
   - Update [[06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED]] to modify the status constraints on `products` and `product_variants`.
   - Update [[02_ACCESS_CONTROL/Permission_Code_List]] and [[02_ACCESS_CONTROL/API_Authorization_Rules]] to align permission codes with `catalog.products.*` according to ADR 007.
   - Create a dedicated Product Import database definition file in `06_DATABASE_KNOWLEDGE/Tables/15_Product_Import_Batches_And_Rows.md` matching current backend paradigms.
   - Create a dedicated List and Import contract in `04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract.md`.
   - Create test case scenarios in `10_TESTING_QA/Test_Case/10_Product_Core/Tenant_Admin_Product_List_And_Import_Test_Cases.md`.
2. **Implementation Decoupling**:
   - Ensure the database schema does not invent a status lookup table, but implements DB constraints.
   - Stock Status must remain calculated server-side, not written as static field.
