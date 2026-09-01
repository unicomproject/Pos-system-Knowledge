<!-- title: POS-UJ-036 Online Order Fulfilment and Collection -->
<!-- status: Canonicalized - OO-01 accepted; OO-02/OO-03 implemented / runtime acceptance open -->
<!-- last_updated: 2026-09-01 -->

# POS-UJ-036 — Online Order Fulfilment and Collection

## Authority and outcome

Canonical cashier/store Click & Collect journey. OO-01 is accepted by its implementation tracker. OO-02 detail and OO-03 confirmed Start are implemented on the canonical Flutter/backend owners; authenticated UI-to-database acceptance remains governed by their trackers. OO-04–OO-15 retain their existing authority.

## Preconditions

- Authenticated tenant staff, active tenant, `click_collect` entitlement, capability permission and permitted outlet/resource.
- Online backend validation is required for operational mutations.
- Sales order, fulfilment, pickup and inventory reservation belong to the same tenant and fulfilment outlet.

## Canonical E2E flow

`Online Order Received → Store Online Order Queue → Order Detail → Start Fulfilment → Validate order/outlet/reservation → Assign staff → Pick items → Barcode verify → Review & Pack → Create package/bag → Ready for Collection → Notify customer → Customer arrives → QR scan or manual lookup → Server collection validation → Retrieve correct package → Verify items → Check payment → Cash payment if required → Confirm handover → Pickup Collected → Sales Order Completed → Audit/inventory/payment finalisation`.

## Screens 1–15

| # | Screen | Result |
|---:|---|---|
| 1 | Online Orders List | Search-only visible queue with six authoritative backend summary counts and horizontal order cards. Bounded pagination/filter/sort remain API capabilities, not visible controls. |
| 2 | Order Detail / Start Fulfilment | Authoritative order, pickup, payment, reservation and item detail. |
| 3 | Start Fulfilment Confirmation | Atomic conflict-safe start command. |
| 4 | Pick Order | Fulfilment lines and progress. |
| 5 | Pick Item / Barcode Scan | Scanner and manual barcode use the same command. |
| 6 | Review & Pack | Eligible only when required quantities are resolved; creates packages. |
| 7 | Ready for Collection | Backend validates pick/pack/package and sends notification. |
| 8 | Ready for Collection Queue | Outlet-scoped ready orders. |
| 9 | Scan Collection QR | Sends opaque token for server validation. |
| 10 | QR Validated / Retrieve Pack | Server-authorized package retrieval data. |
| 11 | QR Cannot Be Accepted | Safe invalid/expired/used/scope/state result. |
| 12 | Confirm Handover | Verify packages, items and payment; submit idempotent command. |
| 13 | Collection Complete | Backend-confirmed collected/completed result. |
| 14 | Manual Collection Lookup | Authorized fallback; never bypasses validation. |
| 15 | Collection Payment | Payment Required → Collect Cash → Success or Failure. |

## State and projection

Sales order state stays with the Sales Order authority. Fulfilment owns `PENDING, ALLOCATED, PICKING, PICKED, PACKED, READY, FULFILLED, CANCELLED`; pickup owns `PENDING, READY, VERIFIED, COLLECTED, CANCELLED, EXPIRED`. UI New/Preparing/Ready/Delayed/Collected/Cancelled are projections. `Delayed` is derived from promised/slot time and backend time, never persisted.

## OO-01 approved queue contract

- Reuse the existing cashier header and bottom navigation unchanged. The page header is `Online Orders` / `Click & Collect orders from your online store`, with title/subtitle left and one wide, server-side debounced search right.
- Search covers order number, customer name, customer phone and pickup/collection reference where the canonical data source supports it.
- Show exactly six backend aggregate cards: New, Preparing, Ready, Delayed, Collected and Cancelled. Counts use the active tenant/outlet/query scope and are never derived from the rendered page.
- Render individual horizontal rounded order cards containing order/pickup reference, customer identity, collection window, item count, payment/display status, projected product previews, remaining-preview count and a detail chevron. Narrow viewports stack the same facts without clipping.
- The chevron only navigates to OO-02 and performs no state mutation. Start/Pick/Pack/Ready/Collect actions remain downstream.
- The visible target excludes filter controls, status tabs, queue heading, sort controls, table headers, Open/Start buttons and pagination controls. The backend may retain bounded status/sort/page capability.
- Loading, refreshing-with-valid-data, empty, empty-search, retry/error, permission-denied, feature-not-entitled and network/server failure states are distinct.
- The orange priority star in the approved visual is a visual requirement not yet backed by verified business authority. It creates no priority field, status, schema or mutation.

## OO-02 Order Detail / Start Fulfilment contract

1. OO-01 navigates to `/pos/online-orders/:orderId`. Opening detail is a read and must never mutate order or fulfilment state.
2. The read requires `commerce.online_order.orders.access` and `commerce.online_order.orders.view`, tenant entitlement and authoritative outlet/resource access. The backend repeats every check; route guards are UX only.
3. OO-02 renders authoritative order number, display status, placed/source facts when supplied, customer identity, collection outlet/window and derived remaining/overdue presentation, payment status/currency/totals, line count, unit count and order lines. A line may show product, variant/options, SKU, image and ordered quantity only when present in the response.
4. Anonymous/Guest classification is shown only when an authoritative customer classification exists. Missing customer data must not be converted into a fabricated Guest classification.
5. Each line shows its own authoritative ordered quantity. A repeated order-level phrase such as `3 items to pick` on every line is forbidden. Picking progress belongs to OO-04 unless an authoritative line progress field is returned.
6. Back returns to OO-01. `View Details` is non-mutating disclosure/navigation. `Start Fulfilment` is visible only when `commerce.online_order.fulfilment.start` exists and enabled only for an eligible backend-authoritative lifecycle; permission absence removes the action region and reserved space.
7. Selecting Start opens OO-03 confirmation first. OO-02 itself sends no start command. Confirming OO-03 submits one atomic, retry-safe start command.
8. The server validates tenant, actor, entitlement, permissions, outlet, order, fulfilment, pickup/reservation, quantities, assignment, concurrency and idempotency. On success it transitions the eligible fulfilment to `PICKING`, assigns the authoritative tenant user and appends event/audit evidence in one transaction.
9. The client invalidates/refetches detail and queue state after success, then enters OO-04. On HTTP 409 it stays out of OO-04, refreshes authoritative detail and presents a conflict-safe message. Repeated confirmation must not create duplicate fulfilments, assignments or events.
10. Loading, not-found, permission-denied, feature-disabled, offline/network, server-error and conflict states retain the POS shell and expose a safe recovery action. No state may reveal another tenant or outlet's order existence.

## OO-03 Start Fulfilment Confirmation contract

1. OO-03 is a feature-local confirmation modal/sheet opened only from an eligible, permitted OO-02 Start action. Opening it uses the already-loaded authoritative detail and performs no request or mutation.
2. It summarizes order number, customer, collection outlet, collect-by time with server-time-derived remaining/overdue text, item count and unit count. It does not contain picking controls or prototype values.
3. Cancel closes OO-03 only. It sends no Start request and changes no lifecycle state.
4. Confirm sends one `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start?outletId={outletId}` with the current positive `expectedVersion`. The UI locks repeat submission while the request is in flight.
5. Success uses the authoritative response, refreshes detail/list authority and enters OO-04. No local optimistic `PICKING` state or frontend event is permitted.
6. HTTP 409 never enters OO-04: refetch OO-02 detail, replace stale lifecycle/version and show a safe conflict message. A stale request is never blindly retried.
7. Read context requires `commerce.online_order.orders.access` and `.orders.view`; Start requires `commerce.online_order.fulfilment.start`. Missing Start permission removes the complete action region and OO-02 reflows without reserved space. Backend enforcement remains independent and authoritative; role-name checks are forbidden.

### OO-02 responsive and accessibility rules

- Desktop/tablet landscape use the available width for grouped summary cards plus the line list; tablet portrait and phone stack groups in reading order and allow page/content scrolling without horizontal clipping.
- The shared POS header and bottom navigation remain owned by the shell. OO-02 does not duplicate or remove them.
- Touch targets are at least 44 logical pixels, keyboard/focus order follows visual order, status is not colour-only, images have useful semantics or are decorative, and loading/error announcements are accessible.

## Inventory, picking and packages

- Start validates outlet, state, reservation and quantities atomically. Picks validate product/variant barcode, remaining quantity, reservation trace and concurrency.
- “Can't Find Item” records an issue/event only; it does not invent resolution.
- Pack requires resolved lines. One fulfilment can have multiple packages; never add one bag field to its header.
- Existing inventory/reservation services own allocation and stock. `fulfillment_order_lines.inventory_reservation_line_id` gives exact traceability.

## QR, payment and handover

- QR is generated/exposed only when fulfilment and pickup are READY. Store hash/version/expiry only; raw tokens are not stored or logged.
- Server validation is tenant/outlet/order/status bound, expiring and single-use on successful collection. Invalid, malformed, expired, used, wrong-scope and not-ready outcomes are safe and non-disclosing.
- Paid Online and Cash on Collection are canonical. Already-paid orders are never charged again. Cash reuses the unified payment/till/cash-drawer authority.
- Failed or unknown payment blocks handover. Retry requires its permission and original idempotency context.
- Handover atomically revalidates package/items/payment and concurrency, marks pickup COLLECTED, fulfilment FULFILLED and sales order completed, and writes events/audit. Replay cannot duplicate payment, stock or events.

## Guest label

**OPEN CANONICAL DECISION — Guest semantics.** Existing authority does not prove anonymous e-commerce checkout. Until resolved, Guest is presentation/customer classification only and does not override authentication/checkout rules.

## Related authorities

- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules]]
- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../15_IMPLEMENTATION_TRACKING/Online_Store/Online_Order_Fulfilment_Collection_Canonicalization_Status_2026-08-21]]
