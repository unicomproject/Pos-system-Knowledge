<!-- title: Scope Change Log -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-31 -->

# Scope Change Log

## [2026-07-31] Product Discovery Segments Added
- **Change**: Define Cashier New Sale product discovery segments: Popular, Frequently Sold, and Offers.
- **Reason**: Enable cashiers to quickly find products that are manually curated as popular, dynamically calculated as top-selling, or currently eligible for discounts/special pricing.
- **Impact**:
  - Backend extended to support the planned `segment` parameter on `GET /api/v1/pos/products`.
  - Frontend extended to toggle between segments (preserving cart and session states) and display offer badges/strike-through pricing on tiles.
  - Curation of Popular products managed under the reserved `POS_POPULAR` collection in Tenant Admin.
  - Code implementation status set to `Not Started` / `Not Run`.
