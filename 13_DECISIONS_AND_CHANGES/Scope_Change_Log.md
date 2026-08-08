<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Scope Change Log

## [2026-08-06] Tenant Admin Product List and Import Decisions

- **Canonical Endpoint**: Locked `/api/v1/tenant-admin/products` as primary boundary; legacy route `/api/v1/products` is deprecated.
- **Product List States**: Resolved into First-use Empty (`catalogTotalCount=0`), Filtered Empty (`totalCount=0` with filters), and Populated List.
- **Lifecycle Alignment**: Deprecated `DELETED` status, replaced by `DRAFT`, `ACTIVE`, `INACTIVE`, and `ARCHIVED` status pool.
- **Permissions Consolidation**: Standardized on `catalog.products.*` as canonical codes. Legacy `tenant.products.*` is deprecated.
- **Import Batch Engine**: Created specs for CSV product import batches and rows logging. Supported fields, duplications validation, transactional rollback, and error logs defined.
- **Stock Status**: Defined dynamic calculated Stock Status values (`NOT_TRACKED`, `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) to protect inventory boundaries.
- **Authority**: [[../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]].


## [2026-08-02] POS Payment Method Screen

- Final release methods are Cash, Card, QR Pay and Split Payment only.
- Pay Later is excluded.
- The reusable equal-card layout supports counts 1 through 5; the active four
  method screen is 2 x 2.
- Existing Cash checkout, receipt, printer and drawer flows are preserved.
- Card, QR Pay and Split Payment remain unavailable and cannot fall back to Cash.
- No backend, database or migration change was made.

## [2026-08-01] Cashier Product Variant Selection Popup Production Scope Locked

- **Change**: Include the Release 1 Cashier New Sale production popup with dynamic variant resolution, quantity, optional product-line note and manually configured Frequently Bought Together.
- **Image decision**: The popup displays one resolved image only; no thumbnails/gallery/carousel. Shared product-media multi-image capability remains unchanged.
- **Recommendation decision**: Frequently Bought Together is manually configured and distinct from Frequently Sold. AI/ML recommendations are excluded.
- **Status**: Documentation Ready. Database migration, backend, Flutter, automated tests and production validation remain pending/partial according to code evidence.
- **Authority**: [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

## [2026-07-31] Product Discovery Segments Added
- **Change**: Define Cashier New Sale product discovery segments: Popular, Frequently Sold, and Offers.
- **Reason**: Enable cashiers to quickly find products that are manually curated as popular, dynamically calculated as top-selling, or currently eligible for discounts/special pricing.
- **Impact**:
  - Backend extended to support the planned `segment` parameter on `GET /api/v1/pos/products`.
  - Frontend extended to toggle between segments (preserving cart and session states) and display offer badges/strike-through pricing on tiles.
  - Curation of Popular products managed under the reserved `POS_POPULAR` collection in Tenant Admin.
  - Code implementation status set to `Not Started` / `Not Run`.
