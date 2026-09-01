<!-- title: Flutter Online Order Click & Collect Fulfilment -->
<!-- status: OO-01 accepted; OO-02 Flutter implemented / authenticated production acceptance pending -->
<!-- last_updated: 2026-08-31 -->

# Flutter Online Order Click & Collect Fulfilment

## Scope and authority

Flutter owns staff preparation, collection and collection-cash UI only; browser storefront remains customer-facing. Follow [[Frontend_Engineering_Canonical_Standard]], [[Frontend_Reusable_Component_Governance]] and POS-UJ-036. OO-01 completion follows its accepted tracker. OO-02 Flutter and staff backend contracts are implemented; production acceptance remains pending authenticated UI-to-database E2E and actual-device visual evidence.

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

## OO-02 Flutter contract and audited mapping

| Layer | Canonical owner / behaviour | Audit status 2026-08-31 |
|---|---|---|
| Route | `/pos/online-orders/:orderId` in the POS shell; read guard uses Online Orders access/view | Present |
| Route screen | `pos_online_order_detail_route_screen.dart` selects the route order id | Present |
| Screen/widgets | `online_order_detail_screen.dart`, `online_order_detail_widgets.dart`, `online_order_ui.dart` compose detail; shell remains external | Implemented; actual-device visual acceptance open |
| Confirmation | `start_fulfilment_dialog.dart` content through shared `showAppDialog` / `showAppModalBottomSheet`; shared POS actions; confirm precedes mutation | Present |
| State | `pos_online_orders_provider.dart` owns detail/start loading and error state, refreshes detail/list after success | Implemented; 409 refetches authority and prevents false navigation |
| Domain/data | `PosOnlineOrderDetail`, repository and remote datasource map the canonical GET/POST | Present |
| Backend dependency | Detail GET and versioned start POST on the staff controller family | Implemented in Chunk 2 |

The detail GET is side-effect free. Start is exposed only for an eligible authoritative status and requires `commerce.online_order.fulfilment.start`; frontend permission/state checks are UX gates only. Confirmation submits once, success refreshes authority and navigates to `/pos/online-orders/:orderId/picking`, and conflict must refetch and remain outside picking.

Do not hardcode prototype customer/order/item values. Do not infer Guest from missing customer data. Do not repeat an order-level item count as per-line progress. Optional images/options/source/classification appear only when supplied by the aggregate detail response. Phone/tablet portrait stack and scroll; tablet landscape/desktop use grouped wide layouts without clipping.

OO-01 has one active widget owner: `oo01_online_orders_widgets.dart`; the
unreferenced alternate `online_orders_queue_widgets.dart` implementation is
removed. Summary-card consumers pass named `OnlineOrderSummarySemantic` values.
Payment rendering uses exact normalized domain values: `PAID`; pending
`UNPAID`/`PARTIALLY_PAID`; refunded `REFUNDED`/`PARTIALLY_REFUNDED`; `FAILED`;
and an unknown fallback. Substring payment matching is prohibited.

OO-02 Start Fulfilment reuses the shared `PosPrimaryActionButton`, extended only
with optional presentation parameters needed by the approved multiline CTA.
OO-03 retains feature-owned confirmation content while routing through the
shared blurred modal helpers and shared primary/secondary action controls.

## OO-03 Flutter ownership and implementation contract

- Owner: `lib/features/fulfilment_pickup/presentation/widgets/start_fulfilment_dialog.dart`; no `online_orders`, `start_fulfilment` or `order_detail` feature root is authorized.
- Data flow: OO-02/OO-03 → `pos_online_orders_provider.dart` → domain repository → repository implementation → remote datasource → existing staff API. The dialog performs no Dio call and owns no business mutation.
- Opening reuses current `PosOnlineOrderDetail`; a fresh GET is required only for normal detail load or conflict refresh.
- Shared owners: `showAppDialog`, `showAppModalBottomSheet`, `PosPrimaryActionButton`, `PosBottomOutlinedButton`, runtime `ThemeData` and canonical typography/spacing/radius. The summary composition remains FEATURE-LOCAL.
- Required facts: order, customer, collection outlet, collect-by plus remaining/overdue derived from response `serverTime`, item count and unit count. No mock values, full picking lines or client-authoritative version are permitted.
- The controller sends the selected detail `fulfillmentVersion`, rejects absent/non-positive version, ignores a second in-flight submission, refetches on 409 and returns a result for OO-04 navigation only on backend success.
- Missing Start permission removes the OO-02 action region; OO-03 has no normal permission-bypass route. Backend permission/entitlement/scope checks remain final.
- Accessibility: semantic title/Confirm/Cancel, logical focus, shared dismissal behaviour, reachable touch targets, text scaling and no colour-only status. Desktop/tablet use a constrained dialog; phone uses the scroll-safe sheet.

## Validation and remaining completion gate

OO-02 canonicalization and Flutter implementation are complete, not production acceptance. Flutter analyze, responsive tests and the full Flutter suite pass. Remaining gates are authenticated UI→API→database→OO-04 E2E, two-session runtime conflict evidence, and actual-device screenshot comparison against the approved OO-02 prototype. Do not treat source presence or widget tests as runtime acceptance.

## Related files

- [[../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
