# Online Order Fulfilment — Implementation Audit

> **Historical implementation evidence — superseded for OO-01:** The queue/table, visible filter, status-tab, sort, pagination, and `lib/features/online_orders/` ownership statements below describe the implementation audited on 2026-08-24 through 2026-08-25. They are not the approved production target after the 2026-08-27 OO-01 canonicalization. The current authority is `00_START_HERE/Current_Source_Of_Truth.md` together with the Fulfilment & Pickup functional/technical contracts, cashier OO-01 UI/API/DB mappings, and `Flutter_Order_ClickCollect_Fulfilment.md`. Chunk 2 must establish the new staff list API and Chunk 3 must implement the approved horizontal-card queue under `lib/features/fulfilment_pickup/`.

**Status:** BLOCKED — authenticated runtime reaches OO03, but canonical fulfilment start is blocked by incomplete Development acceptance data  
**Journey:** `POS-UJ-036`  
**Audit date:** 2026-08-24

## OO-01 production parity synchronization — 2026-08-27

The queue implementation and canonical documentation are synchronized to the approved OO-01 target without carrying prototype sample values into production.

- Queue structure: cashier shell, title/search/filter header, six KPI summaries, seven status tabs, sort control, responsive result surface and pagination.
- Desktop result surface (`>= 1200`): table columns are Order, Customer, Items, Collection time, Status, Payment and Actions; the action is a compact detail affordance.
- Below desktop: responsive cards replace the table and compact pagination replaces numbered desktop pagination. Tested widths are desktop 1440, tablet landscape 1180, tablet portrait 800, phone 600 and small phone 390.
- Sort contract: `collection_desc`, `newest`, `oldest`; default `collection_desc`.
- Delayed contract: server-side synthetic filter based on requested collection end and server time, excluding terminal states.
- Permission contract is unchanged: queue/detail requires both `commerce.online_order.orders.access` and `commerce.online_order.orders.view`; action routes retain their specific permissions and `click_collect` entitlement.
- Component ownership is `lib/features/online_orders/`; no parallel feature tree or mock-data source was introduced.

Verification for this synchronization: Dart formatting passed, Flutter analysis passed with no issues, focused Online Order tests passed 32/32, backend API build passed with zero warnings/errors, and `git diff --check` reported no whitespace errors. Authenticated full OO-01–OO-06 runtime acceptance remains blocked for the reservation-data reason already documented below; automated responsive evidence is not represented as runtime screenshot acceptance.

## Authority and implementation boundary

This implementation follows `00_START_HERE/Current_Source_Of_Truth.md`, the canonical frontend/backend standards, the Fulfilment & Pickup contract, the Flutter Click & Collect specification, and the approved cashier prototypes.

Approved visuals currently cover OO-01 through OO-07: queue, detail, start fulfilment, order picking, item picking, review/pack, and ready for collection. Prototype records are visual samples only; production data must come from the tenant staff API.

## Current implementation audit

| Area | Finding | Decision |
|---|---|---|
| Cashier shell | POS top bar, bottom navigation, responsive shell and route guards exist. | Reuse |
| Home Online Orders card | Hardcoded `12 Pending`, `8 Ready`, `3 Delayed` metrics. | Extend with API summary |
| Online Orders route | Placeholder with authentication-only guard. | Extend with capability guard |
| Flutter feature | Screens, state, models, repository and datasource are absent. | New |
| Shared states/scanner | Established loading/error/empty and barcode patterns exist. | Reuse |
| Payment | Existing checkout/till/payment orchestration exists. | Reuse; never duplicate |
| Public fulfilment API | Customer-facing and not a staff contract. | Not Needed for cashier UI |
| Staff API | Only legacy generic status PATCH exists. | Extend/New canonical actions |
| Domain | Orders, fulfilment, pickup, slots and event entities exist. | Reuse/Extend |
| Packages | Package header and line persistence are absent. | New, required |
| Reservation linkage | Fulfilment line reservation-line FK is absent. | New, required |
| Concurrency | Fulfilment/pickup header row versions are absent. | New, required |
| Permissions | Canonical `commerce.online_order.*` capabilities are absent. | New |

## Implementation progress — updated 2026-08-25

Completed in source:

- Added the outlet-scoped canonical staff `GET /orders` and `GET /orders/{orderId}` APIs.
- Added application service/repository contracts, real EF projections, validation and capability enforcement.
- Added canonical `commerce.online_order.orders.access` and `commerce.online_order.orders.view` permission seed definitions and Development Cashier grants.
- Replaced the Flutter `/pos/online-orders` placeholder with an API-backed responsive queue/detail workspace.
- Added real DTO/entity parsing, Dio datasource, Riverpod state, search, status filtering, pagination, selection, loading, error and empty states.
- Replaced the authentication-only route guard with canonical capability checks while retaining the documented legacy compatibility alias.
- Backend API project builds with zero errors; focused Dart analysis reports no source issues.
- Added canonical `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start` and `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking` staff APIs.
- Added `commerce.online_order.fulfilment.start` and `commerce.online_order.picking.view` capabilities plus `click_collect` entitlement enforcement.
- Start fulfilment now validates outlet scope, order state, active sellable inventory location and confirmed reservation quantities, then atomically creates/reuses the fulfilment header, lines and start event.
- Retry handling is persistence-idempotent for the same assigned staff member; conflicting assignment or incompatible state returns the canonical fulfilment conflict response.
- Added the API-backed confirmation dialog, submitting/error handling, guarded picking route, and responsive Pick Order screen using real order, customer, SKU, barcode, location and quantity data.
- Added canonical pick, report-issue, pack and ready endpoints, application contracts, permission checks and EF repository commands.
- Added action-level Flutter permissions for scan, manual entry, pick, report issue, packing and ready-for-collection.
- Barcode verification now submits the barcode entered/captured by the operator; it does not silently reuse prototype or line display data as the scan result.
- Added backend-authoritative picking refresh, issue reporting, Review & Pack, Mark Ready and Ready for Collection states.
- Added `fulfillment_packages` and `fulfillment_package_lines`, reservation-line linkage, and concurrency row versions for fulfilment/pickup headers.
- Added package/line creation and fulfilment/pickup/order state transitions inside database transactions with audit events.
- Added transition replay protection for already-completed fulfilment header states.
- Added all canonical Prepare-flow permission definitions and Development Cashier grants.
- Generated migration `20260825094127_CompleteOnlineOrderPrepareFlow` and verified its SQL script generation. The migration has not been applied by this audit.

Validation recorded for this slice:

- Backend API Debug build (`--no-restore -m:1`): passed, 0 warnings, 0 errors.
- Focused backend domain and permission seed tests: 23 passed, 0 failed.
- EF migration SQL generation: passed; generated a 7,696-byte upgrade script for the Prepare-flow migration range.
- Focused Flutter analysis of Online Orders and related access/endpoints: `No issues found`.
- Focused Flutter model tests: 4 passed, 0 failed.
- `dart format`: passed for the changed Online Orders source/tests.
- Authenticated device/runtime E2E has not yet been evidenced; this status therefore remains **IN PROGRESS**.

Still required before this journey can be marked complete:

- Apply the generated migration to the target environment and validate its schema/FKs against PostgreSQL.
- Authenticated real-data E2E from queue through Ready for Collection, including stale/concurrent operator behaviour.
- Runtime visual comparison at tablet landscape, tablet portrait, phone and desktop widths against OO-01 through OO-06.
- Hardware scanner capture integration remains distinct from the production manual barcode-entry path; the screen accepts a captured barcode value but authenticated scanner-device acceptance is pending.
- API-backed cashier-home Online Orders summary remains outside the Prepare workspace and is not required to execute OO-01 through OO-06, but remains a wider journey gap.

The Prepare-flow source is implemented, but the implementation must remain **IN PROGRESS** until migration and authenticated runtime acceptance pass.

## Real-data mapping

| Prototype field | Production authority |
|---|---|
| Order number | `sales_orders.order_number` |
| Customer | Sales-order customer snapshots/reference |
| Collection time | Requested collection timestamps and timezone snapshot |
| Status | Server-derived sales/fulfilment/pickup state |
| Payment | Existing sales payment authority and order totals |
| Product/variant/SKU/barcode | Sales-order line snapshots |
| Requested/picked/packed quantities | Fulfilment-order lines |
| Picker | Fulfilment assignment and actor references |
| Package | Canonical fulfilment package header/lines |
| Ready time | `fulfillment_orders.ready_at` |

## Implementation sequence

1. Canonical permission constants and guarded route.
2. Staff list/detail API and Flutter queue/detail.
3. Atomic start and picking actions with concurrency/idempotency.
4. Package persistence, review/pack and ready actions.
5. API-backed dashboard summary.
6. Focused backend, Flutter and responsive tests.
7. Authenticated E2E before marking complete.

## Explicit exclusions

- No prototype mock order data in production Flutter.
- No duplicate payment, inventory, notification, audit or customer services.
- No generic status patch as the primary workflow.
- No invented OO-08 through OO-15 visual design without an approved prototype.

## Final production acceptance attempt — 2026-08-26

### Result

`BLOCKED — production acceptance blocked`

The authenticated runtime acceptance was executed against the Local Development API and real PostgreSQL-backed staff endpoints. OO01 queue, OO02 detail and the OO03 Start Fulfilment confirmation rendered with real Development data. The Start Fulfilment command was then rejected by the backend with HTTP `409` and canonical code `online_orders.fulfilment_conflict` because the selected seeded order has no confirmed stock reservation. OO04 through OO06 could therefore not be reached through authoritative state transitions, and production acceptance must not be marked complete.

### Runtime environment evidence

- Backend: `http://10.0.2.2:5150` from the Android emulator (`http://0.0.0.0:5150` host listener).
- Flutter target: Pixel Tablet Android emulator.
- Authentication: authenticated Development Cashier session; a fresh login response contained the required `commerce.online_order.*` permissions.
- Entitlement: Development tenant `click_collect` entitlement enabled and verified by successful queue/detail access.
- Database migration: `20260825094127_CompleteOnlineOrderPrepareFlow` applied. The Development entitlement completion migration was also applied.
- Environment exception: emulator clock did not match the host date/time and could not be corrected without privileged emulator access.

### OO01–OO06 authenticated result

| Stage | Result | Runtime evidence |
|---|---|---|
| OO01 Queue | PASS | Real API queue loaded ten seeded click-and-collect orders; tabs, filters, summary, pagination and selection rendered. |
| OO02 Detail | PASS | Real accepted order `ECOMM-SEED-ACCEPTED-001` loaded customer, collection, payment, item and totals data. |
| OO03 Start Fulfilment | FAIL | Confirmation rendered; real command returned HTTP 409 `online_orders.fulfilment_conflict`. |
| OO04 Picking | BLOCKED | No authoritative fulfilment was created, so picking could not be entered legitimately. |
| OO05 Review & Pack | BLOCKED | Depends on successful Start and Pick transitions. |
| OO06 Ready for Collection | BLOCKED | Depends on successful Start, Pick and Pack transitions. |

### Backend and database root cause

`DevelopmentClickCollectOrderStatusSeedData` inserts `sales_orders`, `sales_order_lines` and status-history samples, but does not create the operational data required by the production Start Fulfilment contract:

- `sales_orders.external_order_reference` containing the checkout correlation identifier;
- a matching `inventory_reservations` row in `CONFIRMED` state for the fulfilment outlet; and
- matching `inventory_reservation_lines` with sufficient reserved quantity for each sales-order line.

`PosOnlineOrderRepository.StartFulfillmentAsync` correctly enforces those prerequisites before it opens a database transaction that creates the fulfilment header/lines. The request therefore failed before fulfilment persistence; bypassing this validation or forcing Flutter state would be incorrect.

### Screenshot and visual evidence

Authenticated runtime screenshots were captured for OO01, OO02 and the OO03 confirmation under the Flutter acceptance artifacts directory. OO04–OO06 authenticated screenshots and a complete prototype-versus-runtime parity classification could not be produced because the authoritative transition failed. Existing responsive widget evidence remains valid but is not represented as authenticated E2E evidence.

### Safe next action

Complete the Development click-and-collect acceptance seed through a normal idempotent migration/seed path that supplies the canonical checkout reference and confirmed reservation header/lines for an approved accepted seed order. Then repeat one fresh authenticated journey:

`OO01 → OO02 → OO03 Start → OO04 Pick → OO05 Pack → OO06 Ready`

Do not weaken reservation validation, manually force UI state, or mark this journey production-ready until that runtime sequence and prototype screenshot comparison both pass.

## Chunk 3 — production field mapping audit (2026-08-25)

This mapping is based on the canonical staff API and EF projections. Prototype sample values are not production inputs.

### OO01 queue

| Prototype field | Flutter field | API field | Backend / source of record | Classification |
|---|---|---|---|---|
| Order number | `PosOnlineOrder.orderNumber` | `orderNumber` | `sales_orders.order_number` | SUPPORTED |
| Customer / phone | `customerName`, `customerPhone` | matching fields | sales-order customer snapshots | SUPPORTED |
| Status / payment | `status`, `statusLabel`, `paymentStatus` | matching fields | server status mapping and `sales_orders.payment_status` | SUPPORTED |
| Collection window / timezone | `collectionAt`, `collectionEndAt`, `collectionTimezone` | `collectionStart`, `collectionEnd`, `collectionTimezone` | requested collection timestamps/timezone snapshot | SUPPORTED |
| Outlet | request `outletId` | query `outletId` | `sales_orders.reporting_outlet_id` | SUPPORTED; list item does not repeat outlet name |
| Item count | `lineCount` | `itemCount` | count of `sales_order_lines` | SUPPORTED |
| Unit count | none on queue item | none | would require sum of line quantities | MISSING LIST CONTRACT |
| Overdue summary | `summary.overdue` | `summary.overdue` | server clock vs collection end, excluding terminal states | SUPPORTED |
| Per-row urgency | schedule display only | no authoritative flag/server-now | no item-level urgency projection | MISSING CONTRACT; device clock derivation prohibited |
| Search/status/page | `PosOnlineOrdersQuery` | query parameters | repository-side EF query | SUPPORTED SERVER-SIDE |
| Sort | `PosOnlineOrderSort` | `sort` | collection asc/desc, newest, oldest | SUPPORTED SERVER-SIDE |
| Payment/urgency filter | deliberately unavailable | no query parameters | none | MISSING CONTRACT |

### OO02 detail

Order hero, outlet, customer snapshots, collection window/timezone, payment totals, line snapshots, requested/picked/packed quantities, line status, fulfilment/assignment IDs, placed/updated timestamps map directly through `PosOnlineOrderDetailDto` to `PosOnlineOrderDetail`. Item count and unit count are DERIVED from authoritative detail lines. A countdown/urgency badge remains unsupported until the API supplies an authoritative server instant or urgency result. Product images are not in this DTO.

### OO03 start fulfilment

Order/outlet/collection/item/unit details come from OO02. The command response maps `orderId`, `fulfillmentOrderId`, `fulfillmentNumber`, `status`, `assignedToTenantUserId`, `startedAt`, and `alreadyStarted` to `PosStartFulfillmentResult`. Current-user assignment and eligibility/conflict decisions remain backend-authoritative. Remaining time is not calculated from device time.

### OO04 picking

Fulfilment/order IDs, assignment, customer, collection time, lines, SKU, barcode, requested/picked quantities, server line status and inventory location code/name map through `PosPickingOrderDto`. Remaining quantities, unit totals, progress and all-picked are DERIVED only from those quantities. Issue submission is supported, but persisted issue state is not returned by the read DTO. Product image, picking note, hardware-scanner connection state and row-version token are MISSING from the API contract. Manual/scan input method is submitted; Flutter must not claim physical scanner verification without runtime evidence.

### OO05 review and pack

Picked/requested quantities and pack eligibility use the authoritative picking response and backend Pack validation. Packing note is SUPPORTED by the Pack request and package/event persistence (maximum 200 characters). Package number is returned by the command. Persisted unresolved issue state and staging metadata are MISSING from the read contract. Pack and Mark Ready remain separate commands.

### OO06 ready for collection

Final status, order/customer/collection summary, line metrics and package number map from the picking and command responses. The ready transition is persisted by the backend, but `readyAt` is not returned by the picking/detail DTO; the command `updatedAt` is an operation timestamp, not relabelled as a canonical ready timestamp. Customer notification has no verified POS command, DTO, permission or persisted outcome and is therefore NOT APPLICABLE in the current implementation.

### Data-layer decisions

- Provider access now goes through `PosOnlineOrdersRepository`; widgets do not parse API payloads.
- `PosOnlineOrdersQuery` is the single mapping for supported list parameters.
- `PosOnlineOrderSort` exposes only backend-recognized sort values.
- Payment and urgency filters remain disabled rather than applying incomplete client filtering to one paginated page.
- Device-time overdue derivation was removed from row presentation. The server-generated overdue summary remains authoritative.
- No backend, database or migration change was required for this mapping chunk.
