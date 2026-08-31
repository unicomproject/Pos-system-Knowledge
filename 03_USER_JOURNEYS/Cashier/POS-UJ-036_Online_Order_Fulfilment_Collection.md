<!-- title: POS-UJ-036 Online Order Fulfilment and Collection -->
<!-- status: Canonicalized - Implementation Pending -->
<!-- last_updated: 2026-08-27 -->

# POS-UJ-036 — Online Order Fulfilment and Collection

## Authority and outcome

Canonical cashier/store Click & Collect journey. The approved OO-01 queue target is canonicalized; its new staff list API, Flutter implementation and runtime acceptance remain pending. Downstream OO-02–OO-15 behaviour remains unchanged.

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
