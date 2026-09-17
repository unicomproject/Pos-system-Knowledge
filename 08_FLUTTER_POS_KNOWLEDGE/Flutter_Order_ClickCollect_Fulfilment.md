<!-- title: Flutter Online Order Click & Collect Fulfilment -->
<!-- status: OO-01 accepted; collection Chunk 1 frozen 2026-09-12; OO-02 Flutter implemented / authenticated production acceptance pending -->
<!-- last_updated: 2026-09-12 -->

# Flutter Online Order Click & Collect Fulfilment

## Customer collection Chunk 2 implementation (2026-09-12)

**Status:** software COMPLETE; Development API↔DB live PASS; Flutter device UI drive PENDING (PARTIAL). See [[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Collection_QR_Payment_Handover_Chunk2_2026-09-12]].

## Customer collection Chunk 2 routes (2026-09-12)

Flutter routes under `/pos/online-orders/collection/*`; OO-01 distinct Collection QR action; HID REUSE; payment Method/Cash EXTEND with `collectionPaymentContextProvider` + `existingSalesOrderId`; payment success → Handover only. Tracker: [[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Collection_QR_Payment_Handover_Chunk2_2026-09-12]].

## Customer collection Chunk 1 freeze (2026-09-12)

Chunk 2 will add collection screens under `lib/features/fulfilment_pickup/presentation/screens/` and `widgets/collection/`, plus routes in `pos_shell_router.dart`. OO-01 gains a **Collection QR entry** distinct from the existing search scan icon (search remains query-only). REUSE `PosBarcodeScannerListener` / `PosHidScannerInputService`. REUSE/EXTEND `features/sale` Payment Method, cash tender, card route, and receipt/printer — **do not** create a New Sale cart for ecommerce collection. Full contract: [[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Collection_QR_Payment_Handover_Chunk1_2026-09-12]].

## OO-01 search scanner input (2026-09-10)

OO-01 search accepts typed text or scanner input through the same canonical search pipeline. Scanner events provide query input only; authoritative matching remains the existing Online Orders API.

The feature-local `Oo01Header` search field is extended with the hint `Search by order number, customer, phone or scan...`, a theme-inherited vertical divider and compact right-side Material scan icon (`Scan order` tooltip/semantics). Width and surrounding screen composition remain unchanged. No new shared search component is introduced.

`PosOnlineOrdersScreen` reuses `PosBarcodeScannerListener` / `PosHidScannerInputService` for background keyboard-wedge capture on the current, resumed route. The icon focuses/selects the existing field; it does not open a camera or picking workspace. While the field is focused, normal text input handles wedge characters instead of a second HID listener. Submitted text is selected for replacement by the next input. Focus/controller resources are disposed with the screen. Empty scans and incomplete HID frames are silent; disconnected HID has no reliable device-presence signal and manual typing remains available.

Both paths call existing `setQuery` and its 400 ms debounce, then repository/datasource -> `GET /api/v1/tenant/ecommerce/click-collect/orders`. No widget HTTP, local matching, automatic navigation, new permission, backend or DB change. Current search matches order number, external order reference, customer name and phone. Opaque pickup QR tokens, URLs and collection codes are not decoded or newly supported by this extension.

Query changes cancel old requests immediately; response guards reject cancelled/superseded/outlet-stale responses even during the debounce window. Realtime refresh retains query/filter/page. Outlet changes clear old outlet results and reload the preserved query/filter at page 1. This is search input, not collection validation. Evidence: [[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO01_Canonicalization_Status_2026-08-27]].

## Realtime cashier refresh (2026-09-09)

Canonical staff place event `ecommerce.order_placed.staff` arrives on `/ws/notifications` via `NotificationSocketClient` → `NotificationInboxController`.

Fan-out (debounced authoritative refetch only):

1. Refresh tenant `notificationInboxProvider` (existing).
2. Invalidate `posNotificationsProvider` so the POS bell unread/list refetches `GET /api/v1/pos/notifications`.
3. When the event is Ecommerce order-related, call `posOnlineOrdersProvider.notifier.refreshFromRealtime()` preserving search/filter/page; list API remains outlet-scoped.

Reconnect (`onConnected`) and app resume also call the same authoritative refresh. Manual refresh remains valid. Live device acceptance: Chunk 2 tracker.

## OO-06 canonicalization update (2026-09-09)

Extend existing lib/features/fulfilment_pickup/presentation/screens/ready_for_collection_screen.dart, currently hosted by the picking route. No new Ready feature root, header, footer or order-details screen. Reuse OO05 patterns, add informational What's Next and real Notify only after backend gap closure. Canonical 1280×800 target has no page/internal scroll; 1180×820 and 1100×700 plus orange/pink theme and accessibility remain pending runtime tests.

Current OO06 authority: [[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO06_Canonicalization_Status_2026-09-09]]. This scoped update supersedes older conflicting Ready/notification wording, not unrelated history.

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
| Cash collection | Existing POS Payment Method + cash-payment tender + unified payment orchestration UI, **extended** with existing Ecommerce `SalesOrder` outstanding context (no New Sale cart) |
| Receipt / print | Existing sale receipt preview/print/reprint + hardware printer service after Collection Complete |
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

## OO-04 Picking owner and Chunk 3 boundary (2026-09-02)

The existing owner is `lib/features/fulfilment_pickup/`: picking route/screen,
`presentation/widgets/picking/` widgets, `pos_online_orders_provider.dart`, the shared online-order
entity/repository and remote datasource. Backend Chunk 2 now implements picking
GET, scan/manual pick and issue routes. The OO-04 overview implementation now
sends `expectedVersion`, consumes backend `canPack`/updated version and has the
automated evidence recorded in its tracker.

**OO-04B â€” Pick Item / Barcode Verification** is the newly canonicalized
selected-line screen inside this same feature, not a new feature root or journey
stage. Current overview/dialog picking does not prove that dedicated screen is
implemented. Selecting one product must route to OO-04B for that exact line;
scanner/manual input verifies the selected line only, while explicit Mark as
Picked performs the existing backend mutation. Barcode capture alone cannot
persist a pick. OO-04B Chunk 2 is complete: the existing backend family is reused
and scan/manual now enforce the same selected-line barcode contract. Its
dedicated Flutter route/screen is implemented. Chunk 3 automated runner and
authenticated Development runtime acceptance remain pending.

**Frontend barcode authority:** Flutter never substitutes the live catalogue
barcode for order-line `barcode_snapshot`. OO-04B maps
`online_orders.invalid_barcode` and
`online_orders.barcode_snapshot_unavailable` to safe cashier messages; it does
not invent pick success or perform catalogue lookup during pick.

OO-04B Chunk 3 must reuse POS shell, backend ThemeData, shared actions, status/state,
image/progress/modal/scanner patterns and design tokens. Permission-filter scan,
manual and issue controls before layout. Wide layout uses item-list left and
progress/actions right with bounded item-list scrolling; portrait/phone stack
without overflow. No direct Dio widget, role checks, hardcoded brand orange,
mock picked success or client-only pack eligibility. On 409 refetch and replace
state. Add Picking Note is now backend-owned by `POST
.../orders/{orderId}/picking/notes?outletId=...`; show it only with
`commerce.online_order.picking.note`, validate 1–500 trimmed characters, send the
latest `fulfillmentVersion`, lock duplicate submit, and display only the
backend-confirmed saved note. On 409 close/no fake success and refetch Picking
Detail. Pick, issue and note requests must send the latest positive `fulfillmentVersion` as
`expectedVersion`; a stale 409 always refetches instead of retrying blindly.
Accessibility requires semantic actions, 44px targets, text-and-colour state,
logical focus, text scaling and image fallbacks. Full contract:
[[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO04_Canonicalization_Status_2026-09-02]].

## OO-05 Review & Pack Flutter ownership (2026-09-08)

Canonical screen: **OO-05 — Review & Pack**. Feature owner remains
`lib/features/fulfilment_pickup/`. Existing evidence:
`presentation/screens/review_pack_screen.dart` (hosted from picking route when
`canPack` / packed statuses). Do not create `review_pack` or `online_orders`
feature roots.

| Concern | Contract |
|---|---|
| Entry | Backend `canPack` only; all-picked ≠ Ready |
| Review GET | REUSE picking GET |
| Mutations | Pack then Ready — separate CTAs and permissions |
| Notes | Optional packing notes; 200-character validation implemented in current OO05 source |
| Reuse | Prefer OO-04 metrics, progress ring, `PickingItemCard`, shared actions |
| Tablet 1280×800 | Whole-page scroll NONE; internal target scroll NONE (Chunk 3 must fix current side `SingleChildScrollView`) |
| Backend | Pack/Ready APIs implemented; OO06 READY GET and Notify wiring remain separate gaps |

Full FR/BR/API/DB/chunk contract:
[[../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO05_Canonicalization_Status_2026-09-08]].

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

## OO-02 next-action implementation — 2026-09-15

EXTEND `presentation/screens/online_order_detail_screen.dart`; FEATURE-LOCAL mapping `presentation/utils/order_detail_next_action.dart`; REUSE `PosPrimaryActionButton`, existing detail header/summary/items and existing `/pos/online-orders/:orderId/picking` workspace. No duplicate Pick/Pack/Ready screen or shared button.

A single action region follows the item list. No region or spacer is reserved for permission-hidden/terminal actions. Primary color, disabled/loading and focus behavior come from the reusable button. Header/footer ownership is unchanged. All navigation is read-only; mutations stay in existing workflow owners.

Before entering the workspace, invalidate its family provider. On pushed-workspace return, refetch detail; normal route re-entry also refetches by orderId. Existing request generations discard stale detail responses. Loading or failed refresh disables the old CTA. Incomplete authoritative graphs show refresh/recovery instead of guessing an action from the display label.

Authoritative decision matrix: [[../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules#Detail next-action rules — 2026-09-15]]. Evidence remains in the existing OO-02 tracker.
