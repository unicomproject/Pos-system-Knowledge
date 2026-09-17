<!-- title: POS-UJ-036 Online Order Fulfilment and Collection -->
<!-- status: Canonicalized - OO-01 accepted; OO-02/OO-03 implemented / runtime acceptance open; collection Chunk 1 frozen 2026-09-12 -->
<!-- last_updated: 2026-09-12 -->

# POS-UJ-036 — Online Order Fulfilment and Collection

## Customer collection Chunk 2 implementation (2026-09-12)

Software path implemented: OO-01 Collection QR → validate → verification → optional shared payment (`existingSalesOrderId`) → Confirm Handover → `POST .../collection/complete` → Collection Complete. Development authenticated API↔DB live PAID/UNPAID/negatives/concurrency **PASS**; Flutter device UI drive still **PENDING** (Chunk 2 PARTIAL). Tracker: [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Collection_QR_Payment_Handover_Chunk2_2026-09-12]].

## Customer collection Chunk 1 freeze (2026-09-12)

Frozen target after OO-06 READY: OO-01 Collection QR entry → Scan Customer Collection QR → server validate (no lifecycle/financial mutation) → Verification → PAID → Confirm Handover → Collected, or UNPAID → shared POS Payment Method/tender → Payment Success ≠ Collected → Confirm Handover → Collected → Collection Complete → Print/Reprint. Backend owners: `POST .../collection/qr/validate` and `POST .../orders/{orderId}/collection/complete` on `ClickCollectOrdersController`. QR material stays on `pickup_orders`. Full inventory: [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Collection_QR_Payment_Handover_Chunk1_2026-09-12]]. Implementation remains Chunk 2.

## OO-06 canonicalization update (2026-09-09)

OO04 → OO04B → OO05 Pack then Ready → OO06 Ready for Collection → optional notification → later verification/handover → Collected. Ready tracking must not wait for notification. OO06 does not Pack, Ready, verify identity, collect or complete; What's Next is informational. Back navigation does not reverse state.

Current OO06 authority: [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO06_Canonicalization_Status_2026-09-09]]. This scoped update supersedes older conflicting Ready/notification wording, not unrelated history.

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
| 5 | OO-04B — Pick Item / Barcode Verification | Selected-line sub-flow of OO-04: scanner/manual verifies the current line; explicit Mark as Picked submits the authoritative command. |
| 6 | OO-05 — Review & Pack | Eligible only when backend `canPack`; review picked lines; optional packing notes; separate Pack then Mark Ready commands. |
| 7 | OO-06 — Ready for Collection | Consumes authoritative Ready after OO05; optional notification is separate from lifecycle and customer tracking. |
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

### OO-04 Picking / Pick Order boundary

OO-04 loads only after authoritative OO-03 `PICKING` success. It shows backend
line/unit quantities and derives remaining progress; scan/manual/issue actions
are independently permission-filtered with no empty slots. Mutations validate
current order line/barcode, positive non-over-picking quantity, tenant/outlet,
lifecycle and `expectedVersion`, then atomically persist quantity, actor, version
and event/audit. A 409 refetches instead of retaining local success. Review & Pack
is eligible only when backend confirms all required lines resolved and no blocking
issue. Wide screens bound scrolling to the arbitrary item list; narrow screens
stack accessibly without changing business logic.

OO-04 is the order-level overview; OO-04B is its selected-line screen. Selecting
one product must open OO-04B for that exact fulfilment line. An overview scan may
locate/select a pending current-order line but cannot pick it. Inside OO-04B a
scan for any other line is rejected. A matching scan/manual value creates only
transient verified UI state; quantity plus explicit Mark as Picked invokes the
backend command. Success refetches authority and offers next pending item or Back
to Pick Items. Full canonical contract:
[[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO04_Canonicalization_Status_2026-09-02]].

### OO-05 Review & Pack boundary

OO-05 opens only when backend `canPack` is true. All-picked does **not** mean
Ready. The cashier reviews authoritative picked lines, may enter optional packing
notes, then executes separate backend commands: Pack (`commerce.online_order.packing.pack`)
then Mark Ready for Collection (`commerce.online_order.collection.mark_ready`).
Review state reuses picking GET. Pack/Ready APIs and pack/ready events are implemented
under `ClickCollectOrdersController`. Legacy status PATCH is
not the cashier Ready path. Ready ≠ Collected. Full canonical contract:
[[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO05_Canonicalization_Status_2026-09-08]].

## QR, payment and handover

- QR is generated/exposed only when fulfilment and pickup are READY. Store hash/version/expiry only on `pickup_orders`; raw tokens are not stored or logged. No separate token table.
- OO-01 order-search scan is **not** collection validation. Collection uses a distinct QR entry + validate command.
- Server validation is tenant/outlet/order/status/payment/pack bound and expiring. Validate is **side-effect free**. Single-use finality occurs on successful collection complete (`collected_at` / COLLECTED), not on scan/validate.
- Invalid, malformed, expired, revoked, used/already-collected, wrong-outlet, not-ready, cancelled and missing-graph outcomes are safe and non-disclosing.
- Paid Online and pay-on-collection are canonical. Already-paid orders are never charged again. Outstanding balance uses the **shared POS payment Method/tender engine** against the existing Ecommerce `SalesOrder` — do not create a New Sale cart and do not invent a Click & Collect-only cash endpoint as the primary contract.
- Payment Successful ≠ Collected. Failed or unknown payment blocks handover.
- Confirm Handover / `collection/complete` atomically revalidates package/items/payment and `expectedVersion`, marks pickup COLLECTED, fulfilment FULFILLED and sales order completed, and writes events/audit. Replay cannot duplicate payment, stock or events.
- Receipt print/reprint reuses existing receipt/printer authority after Collection Complete; print failure does not reverse Collected.

## Guest label

**OPEN CANONICAL DECISION — Guest semantics.** Existing authority does not prove anonymous e-commerce checkout. Until resolved, Guest is presentation/customer classification only and does not override authentication/checkout rules.

## Related authorities

- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules]]
- [[../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../15_IMPLEMENTATION_TRACKING/Online_Store/Online_Order_Fulfilment_Collection_Canonicalization_Status_2026-08-21]]

## Order Detail lifecycle gateway — 2026-09-15

Order Detail exposes the next valid workflow action, using authoritative fulfilment/pickup state and line progress rather than DisplayStatus. The journey is Detail → Start Fulfilment (existing OO-03 confirmation), Continue Picking (OO-04), Review & Pack (OO-05), or View Ready for Collection (OO-06). No direct Preparing → Ready transition is permitted. Terminal orders remain read-only.

The existing `/pos/online-orders/:orderId/picking` workspace hosts OO-04, OO-05 and OO-06 and chooses its screen from a fresh picking response. Re-entry/return to detail refetches authority; a late response cannot restore an older action. Missing/inconsistent fulfilment data gets a non-mutating refresh/recovery message. Permission-hidden actions reserve no layout space.

Decision matrix and acceptance evidence: [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO02_Canonicalization_Status_2026-08-31#Order Detail next-action gateway — 2026-09-15]]. This scoped rule supersedes the earlier Start-only detail action wording.
