<!-- title: Flutter Online Order Click & Collect Fulfilment -->
<!-- status: OO-01 target canonicalized; Chunk 3 implementation pending -->
<!-- last_updated: 2026-08-27 -->

# Flutter Online Order Click & Collect Fulfilment

## Scope and authority

Flutter owns staff preparation, collection and collection-cash UI only; browser storefront remains customer-facing. Follow [[Frontend_Engineering_Canonical_Standard]], [[Frontend_Reusable_Component_Governance]] and POS-UJ-036. The approved OO-01 target is canonicalized but its Flutter implementation is pending Chunk 3; downstream implementation claims require their own source/runtime evidence.

## Feature ownership

The canonical owner is `lib/features/fulfilment_pickup/` with `data/{datasources,dtos,repositories}`, `domain/{entities,repositories,usecases}` and `presentation/{providers,screens,widgets,utils}`. Do not create or retain a competing `lib/features/online_orders/` owner. Chunk 3 must reconcile reusable existing code into the canonical owner rather than duplicating it.

| Surface group | Owned screens |
|---|---|
| Preparation | Online Orders, Order Detail, Start confirmation, Pick Order, Pick Item, Review & Pack, Ready confirmation |
| Collection | Ready queue, Scan QR, QR Validated, QR Rejected, Manual Lookup, Confirm Handover, Collection Complete |
| Payment | Payment Required, Collect Cash, Success, Failure |

Dependency direction is `Screen/Widget → Provider → Use case/repository → Data source → API`. Widgets never call Dio/HTTP. Providers coordinate loading/empty/error/denied/offline/conflict states and invalidate authoritative reads after successful commands; they do not invent transitions or totals.

## Reuse matrix

| Need | Reuse decision |
|---|---|
| Shell/navigation/responsive layout | Existing cashier app shell, top/bottom navigation and responsive primitives |
| Search | Existing shared input/debounce primitives; OO-01 exposes search only |
| Loading/error/empty/permission/feature states | Existing shared state components |
| Confirmation | Existing canonical confirmation modal |
| Barcode and QR input | Existing hardware abstraction/scanner components; manual input uses same use case |
| Cash collection | Existing POS cash-payment amount, payment summary and unified payment orchestration UI where compatible |
| Product/media | Existing product/variant image components |
| Notification/printing | Existing services; no feature-local transport |

## State rules

Backend owns order, fulfilment, pickup, payment, reservation and final status. New/Preparing/Ready/Delayed/Collected/Cancelled are presentation projections; Delayed is computed from backend timestamps and never mutated. QR and all workflow mutations require online validation. Cash payment must not be offered for an already-paid order.

## Route/API boundary

All staff data sources use only `/api/v1/tenant/ecommerce/click-collect/...`. Public storefront fulfilment reads are not used as staff mutation APIs. Generic status PATCH is not a cashier use case.

Target routing must retain the established POS route convention while resolving OO-01 and OO-02 under the `fulfilment_pickup` feature owner. Queue/detail entry requires both `commerce.online_order.orders.access` and `commerce.online_order.orders.view`; picking and commands additionally enforce their action-level permissions. The `click_collect` entitlement and backend tenant/outlet/resource checks remain mandatory.

The outlet sent by OO-01–OO-06 comes from the activated POS device context, not a hardcoded or user-entered identifier. Flutter maps `online_orders.outlet_access_denied` to an actionable, non-sensitive outlet-access message. Because outlet assignment is evaluated by the backend on every request, an administrator repair for the same activated outlet is picked up by Retry without logout or token refresh; device re-assignment still requires refreshed activation/device context.

OO-01 uses horizontal order cards on tablet/desktop and stacked cards on phone. It exposes one debounced server-side search, six backend aggregate summary cards and detail chevrons. Filters, tabs, sort, table headers, Open/Start actions and visible pagination are absent. The provider may retain bounded status/sort/page query state internally. The server owns Delayed derivation and all summary/page totals.

## Validation and remaining completion gate

Chunk 1 supplies documentation only. Backend implementation is pending Chunk 2; Flutter implementation and focused phone/tablet/desktop tests are pending Chunk 3; authenticated E2E remains pending. Do not treat earlier table/tab/filter screenshot evidence as acceptance of this superseding target.

## Related files

- [[../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
