<!-- title: POS Product Variant Detail Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->

# POS Product Variant Detail Implementation Status

| Item | Value |
|---|---|
| Platform | Backend |
| Feature | POS product detail, variant resolution and Frequently Bought Together read |
| Documentation | Documentation Ready |
| Database/domain foundation | Completed in Chunk 1; migration not applied to a shared database |
| Backend API/business logic | Chunk 2 implemented; limitations below |
| Tests | Backend regression 1,491/1,491; Flutter/E2E Pending |
| Production Validation | Pending |

The target product-detail and recommendation contracts are documented, but this status file does not claim that all fields, recommendation links, atomic cart addition, line-note persistence or conflict handling exist.

## Chunk 1 Database Evidence (2026-08-01)

- Added nullable `line_note varchar(500)` mappings to `shopping_cart_items`, `checkout_session_lines` and authoritative `sales_order_lines`.
- Added `ProductRecommendationLink`, constants, EF configuration and `DbSet` for tenant-safe manual Frequently Bought Together persistence.
- Migration: `src/E_POS.Infrastructure/Persistence/Migrations/20260801181031_AddProductVariantPopupPersistenceFoundation.cs` plus designer/snapshot.
- Focused tests: `tests/E_POS.UnitTests/CatalogProduct/ProductVariantPersistenceFoundationTests.cs` — 5/5 passed.
- Full backend validation: build succeeded with 0 warnings/errors; 1,485/1,485 tests passed (706 unit, 339 API, 392 integration, 48 Local Print Agent).
- Generated migration SQL contains only the three note columns, recommendation table/supporting key, indexes, foreign keys and CHECK constraints; it was not applied to a shared database.

## Chunk 2 Backend Evidence (2026-08-01)

- Extended `GET /api/v1/pos/products/{productId}?deviceId=...` with stable option/value IDs, variant resolution metadata, decimal authoritative price, UOM/fractional data, availability and one resolved image using the documented priority.
- Added `GET /api/v1/pos/products/{productId}/recommendations?deviceId=...&type=frequently-bought-together&limit=3` using tenant/device/outlet/channel/effective-date filters and a maximum of three.
- Extended cart calculation, checkout/payment and hold contracts additively with client line identity, UOM, normalized line note, source and recommendation context.
- Recommendation-marked cart lines are checked against an active server-owned relationship. Stateless calculation returns no partial response on validation failure.
- Line notes are trimmed, whitespace-normalized to null, capped at 500, included in merge identity, persisted on held/completed sales lines, recalled, returned in payment/hold DTOs and serialized in receipt JSON.
- Build passed with zero warnings/errors. Focused Chunk 1/2 tests passed 16/16. Full suite passed 1,491/1,491: 711 unit, 340 API, 392 integration and 48 Local Print Agent.
- Limitations: legacy integer money fields remain alongside decimal popup price; explicit displayed-price comparison tokens, fractional POS quantities, recommendation image projection and exhaustive repository/API integration fixtures remain Pending. Flutter and physical/E2E validation remain Pending.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]]
- [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility_UPDATED]]
