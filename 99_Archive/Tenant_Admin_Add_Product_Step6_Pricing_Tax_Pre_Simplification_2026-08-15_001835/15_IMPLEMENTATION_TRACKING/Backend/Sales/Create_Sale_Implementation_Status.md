<!-- title: Create Sale Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-01 -->


# Create Sale Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | Sales / Checkout |
| Feature | POS checkout, cart, sale, receipt APIs |
| Status | Not Started |
| Completed Date | - |
| Developer | POS team |
| Reviewer | - |
| PR / Commit | - |
| Tests | N/A for Unified-Commerce POS checkout |

## Feature Summary

Earlier Second Brain notes referenced legacy `SCS.Api` checkout controllers.
**Unified-Commerce (`E_POS.Api`) does not yet implement** the cashier checkout
route group documented in [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] under
"POS Payment And Receipt API Endpoints".

Database tables for orders/checkout exist from migrations, but no POS checkout
application services or controllers are registered in the active backend as of
2026-07-10.

## Verified Unified-Commerce Gap

| Route | Unified-Commerce `E_POS.Api` | Flutter datasource |
|---|---|---|
| `POST /api/v1/pos/checkout/summary` | **Missing** | Present |
| `POST /api/v1/pos/checkout/start-payment` | **Missing** | Present |
| `POST /api/v1/pos/cart/calculate` | **Missing** | Not primary path |
| `GET /api/v1/pos/receipts/{saleId}` | **Missing** | Present |
| `POST /api/v1/pos/receipts/{saleId}/print` | **Missing** | Present |
| `GET /api/v1/pos/products` | **Implemented** (branch `Sale_Screen`) | Present |

## What Is Implemented Instead

| Area | Status | Notes |
|---|---|---|
| POS bootstrap + home | Completed | See POSOperations status files |
| Till session open/close | Completed | Cashier can open/close till |
| POS products list | In Review | Catalog read for New Sale grid |
| Tenant product CRUD | Completed | Admin catalog via `/api/v1/products` |

## Documentation Correction (2026-07-10)

Previous version of this file incorrectly listed `SCS.Api` file paths and marked
checkout as implemented. That applied to the obsolete backend track, not
Unified-Commerce.

## Pending Work

1. Implement POS checkout/cart/receipt controllers in `E_POS.Api`.
2. Wire Flutter cash checkout end-to-end against Unified-Commerce.
3. Add integration tests and update API_ENDPOINTS verified table.
4. Preserve normalized product-line notes through cart, supported hold/recall, checkout, `sales_order_lines`, receipt and order detail; support atomic main/recommendation addition. Documentation Ready; implementation/tests remain pending verification.

## Product Variant Popup Chunk 1 Persistence Evidence (2026-08-01)

Database/domain foundation is implemented by `20260801181031_AddProductVariantPopupPersistenceFoundation`: `sales_order_lines.line_note`, `shopping_cart_items.line_note`, `checkout_session_lines.line_note`, and `product_recommendation_links`. Backend POS checkout currently creates `sales_order_lines` directly; backend holds reference the held sales order and its lines; receipts retain JSON snapshots. API DTO/application propagation, receipt line-note serialization and atomic recommendation addition remain Pending. Focused tests passed 5/5 and the complete backend suite passed 1,485/1,485; no shared database migration was applied.

## Product Variant Popup Chunk 2 Backend Evidence (2026-08-01)

The active Unified-Commerce routes were re-audited and are implemented despite older status text above: `POST /api/v1/pos/cart/calculate`, `/api/v1/pos/checkout/summary`, `/api/v1/pos/checkout/start-payment`, `/api/v1/pos/holds`, and receipt persistence. Chunk 2 adds backward-compatible line metadata and normalization. The normalized line note now flows through stateless cart calculation, backend hold/create and recall, payment revalidation, `sales_order_lines`, payment/hold responses and receipt JSON. Recommendation-marked lines require a current active server-side relationship; validation failure returns no calculated partial response. Full backend regression passed 1,491/1,491 (711 unit, 340 API, 392 integration, 48 Local Print Agent). Flutter integration, fractional POS quantities, explicit displayed-price conflict tokens and full popup E2E remain Pending.

## Related Files

- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]]
- [[../../Flutter/Sales/Start_Sale_UI_Implementation_Status]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../Full_Feature_Status_Index]]
