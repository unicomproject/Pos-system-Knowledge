<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->

# Scope Change Log

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
