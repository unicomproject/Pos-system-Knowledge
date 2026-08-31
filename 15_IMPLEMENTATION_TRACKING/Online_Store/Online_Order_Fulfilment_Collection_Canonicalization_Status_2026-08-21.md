<!-- title: Online Order Fulfilment Collection Canonicalization Status -->
<!-- status: Canonicalized - Application Implementation Pending -->
<!-- last_updated: 2026-08-27 -->

# Online Order Fulfilment / Collection Status

## Result

Second Brain canonicalization for POS-UJ-036 and the superseding approved OO-01 target is complete. This is not an application implementation claim.

## Layer status

| Layer | Status | Evidence / remaining work |
|---|---|---|
| OO-01 target UI contract | CANONICALIZED | Search-only visible queue, six aggregate cards, responsive order cards and detail chevron |
| Functional/business rules | CANONICALIZED | Tenant/outlet scope, backend authority, delayed/payment/preview projection rules |
| Permissions | CANONICALIZED | `commerce.online_order.orders.access` + `.view`; backend enforcement required |
| Staff list API | REQUIRED / NOT IMPLEMENTED | `GET /api/v1/tenant/ecommerce/click-collect/orders`; backend Chunk 2 pending |
| OO-01 database | CANONICALIZED / NO CHANGE REQUIRED | New table: NO; new DB attribute: NO; existing records and read projections reused |
| Flutter | SPECIFIED / CHUNK 3 PENDING | Canonical owner `lib/features/fulfilment_pickup/`; target screen not complete |
| Backend | SPECIFIED / CHUNK 2 PENDING | List read service/repository/DTO/controller extension pending |
| Runtime/E2E | PENDING | Target responsive and authenticated API-backed acceptance pending |

## Existing implementation kept distinct

Public storefront fulfilment store/collection-option reads are implemented/testing per [[../Backend/ECommerce/Storefront_Fulfillment_Implementation_Status]]. They do not prove staff fulfilment operations. Existing generic tenant order status capabilities, if present, do not satisfy command-specific start/pick/pack/ready/QR/payment/handover acceptance.

Earlier OO-01 implementations or screenshots containing filters, status tabs, sorting, a table, Open/Start actions or visible pagination are superseded target evidence, not completion evidence. They must be reconciled in Chunk 3; no application source is changed by this canonicalization chunk.

## Completion gates

DB migration and constraints; backend domain/application/API implementation; permission seeds; Flutter screens/providers/use cases/repositories; integration tests; concurrency/idempotency/security tests; Paid Online and Cash on Collection E2E; QR lifecycle tests; no-duplicate payment/stock/event proof; authenticated responsive runtime acceptance.

## Open decision

Guest badge semantics remains open; it must not be interpreted as anonymous checkout until a customer checkout authority resolves it.

## Canonical authorities

- [[../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
