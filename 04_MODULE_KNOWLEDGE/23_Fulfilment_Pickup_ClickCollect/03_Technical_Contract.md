<!-- title: Fulfilment & Pickup / Click & Collect Technical Contract -->
<!-- status: Canonicalized - OO-01/OO-02/OO-03 implemented; later operations tracked separately -->
<!-- last_updated: 2026-09-08 -->

# Fulfilment & Pickup / Click & Collect Technical Contract

## Ecommerce order → cashier realtime refresh (2026-09-09)

After successful storefront confirm commit, `StorefrontCheckoutService` creates customer `ecommerce.order_placed` (IN_APP) and per-staff `ecommerce.order_placed.staff` via `NotificationService` / `ECommerceOrderNotificationFactory.OrderPlacedForStaff`. Realtime PUSH delivers to connected `TenantUser` sockets on `/ws/notifications` (tenant-user registry; staff fan-out is tenant-wide active TENANT_ADMIN/CASHIER). Payload carries event code, title, body, actionUrl, sourceReferenceId — not a full order DTO. POS clients must invalidate/refetch authoritative Online Orders and POS notification APIs; list outlet scoping remains on the GET orders query. See [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_Realtime_Cashier_Refresh_Chunk1_2026-09-09]].

## OO-06 canonicalization update (2026-09-09)

Chunk 2 implemented: GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking?outletId={outletId} accepts PICKING/PACKED/READY, with authoritative nonterminal lifecycle validation. READY requires orders.access + orders.view + collection.view_ready (commerce.online_order prefix); other accepted states retain picking.view. Projection exposes SalesOrderStatus, FulfillmentStatus, PickupStatus, ReadyAt, CollectedAt, collection window/timezone, ServerTime, canceled-adjusted units, pending/issue metrics and existing IN_APP notification status. No DB-derived duplicate fields.

POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/notify-ready?outletId={outletId} is owned by ClickCollectOrdersController. No body. Requires the READY read permissions plus commerce.online_order.collection.notify_customer, entitlement and tenant/outlet scope. PosOnlineOrderReadyService uses shared NotificationService / ECommerceOrderNotificationFactory, event ecommerce.order_ready_for_collection, customer IN_APP only. Authoritative active CustomerId comes from scoped SalesOrder, never the client. No template key is added; existing factory content is reused.

Notification transaction serializes PostgreSQL order/fulfillment/pickup rows, reloads state and reuses uppercase ECOM-ORDER-READY-{orderId:N}. Existing event/message/inbox are returned for duplicates; 409 conflicts retry the same logical event. No resend or external exactly-once guarantee. Failures return safe 503, missing recipient 400, lifecycle conflict 409, retaining existing envelope and scope errors. Notify never changes READY, ReadyAt, quantities, row version or CollectedAt; customer tracking is notification-independent.

Build and 125 focused test executions passed, including real local PostgreSQL concurrent notification and unchanged READY assertions. Authenticated live HTTP/device acceptance was not executed. No schema/migration or Flutter changes. See [Chunk 2 evidence](../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO06_Backend_Chunk2_2026-09-09.md).

Current OO06 authority: [[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO06_Canonicalization_Status_2026-09-09]]. This scoped update supersedes older conflicting Ready/notification wording, not unrelated history.

## Ownership

This specializes the canonical frontend/backend standards. Tenant E-commerce Click & Collect owns staff operations. Existing public storefront fulfilment reads remain separate customer-facing APIs.

## Canonical staff API

Base: `/api/v1/tenant/ecommerce/click-collect`. Every operation below is **canonical / implementation pending** unless implementation tracking proves otherwise.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/orders` | `.orders.access` + `.orders.view` | Bounded staff queue read with authoritative summary aggregates; approved OO-01 exposes search only |
| GET | `/orders/{orderId}` | `.orders.access` + `.orders.view` | Authoritative detail |
| POST | `/orders/{orderId}/fulfilment/start` | `.fulfilment.start` | Atomic start, assignment and validation |
| GET | `/orders/{orderId}/picking` | `.picking.view` | Picking detail |
| POST | `/orders/{orderId}/picking/lines/{lineId}/pick` | `.picking.pick` plus scan/manual capability | Barcode/quantity pick |
| POST | `/orders/{orderId}/picking/lines/{lineId}/issues` | `.picking.report_issue` | Cannot-find issue event only |
| POST | `/orders/{orderId}/pack` | `.packing.pack` | Validate and create package(s) / finalize packed quantities |
| POST | `/orders/{orderId}/ready` | `.collection.mark_ready` | Validate and commit Ready; notification is separate |
| GET | `/collection/ready` | `.collection.view_ready` | Outlet ready queue |
| POST | `/collection/qr/validate` | `.collection.scan_qr` + `.collection.validate_qr` | Server QR validation |
| GET | `/collection/lookup` | `.collection.manual_lookup` | Manual fallback lookup |
| POST | `/orders/{orderId}/collection/payment/cash` | `.payment.accept_cash` | Orchestrate existing payment/till engine |
| POST | `/orders/{orderId}/collection/handover` | `.collection.handover` + `.collection.collect` | Idempotent finalization |

All permission suffixes use the `commerce.online_order` prefix. `PATCH /orders/{orderId}/status` is not the primary cashier contract. If retained, restrict it to safe/internal compatibility and prevent transition bypass.

## OO-05 Review & Pack API classification (2026-09-08)

Tracker:
[[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO05_Canonicalization_Status_2026-09-08]].

| Capability | Route | Classification | Notes |
|---|---|---|---|
| Review state | `GET /orders/{orderId}/picking` | **REUSE** | Includes `canPack`, lines (`packedQuantity`), progress, version; readable while `PICKING` or `PACKED` |
| Pack | `POST /orders/{orderId}/pack` | **IMPLEMENTED** | ClickCollect family; body `{ expectedVersion, packingNote? }`; FO → `PACKED` |
| Ready | `POST /orders/{orderId}/ready` | **IMPLEMENTED** | ClickCollect family; body `{ expectedVersion }`; FO → `READY`, sales → `READY_FOR_COLLECTION`, pickup → `READY` |
| Packing note | Optional on Pack body | **IMPLEMENTED** | Persisted on Pack event `event_note`; server max **200**; no dedicated column |
| Packages tables | `fulfillment_packages*` | **DEFERRED** | Not required for OO-05 MVP; use line `packed_quantity` + header timestamps |

Pack and Ready remain **separate** commands. `FULFILLMENT_PICKING_COMPLETED` /
`canPack` keep lifecycle `PICKING` until Pack succeeds. Do not conflate Pack into
a single Ready CTA.

Event vocabulary (implemented): `FULFILLMENT_PACKED`, `FULFILLMENT_READY_FOR_COLLECTION`,
`PICKUP_READY_FOR_COLLECTION`. Permissions: `packing.view` + `packing.pack` /
`collection.mark_ready` (plus orders access/view). Concurrency: `FulfillmentOrder.RowVersion`.
Schema for OO-05: **New table NO; New column NO; Migration NO.**

## Authorization and failures

Effective authorization = authenticated tenant staff + active tenant + `click_collect` entitlement + capability permission + tenant ownership + outlet/resource access. Role names never authorize. Use standard 400, 401, 403, non-disclosing 404, 409 conflict and safe 500 responses.

Online Orders outlet access additionally requires an `ACTIVE` tenant user and an `ACTIVE` outlet in the same tenant. Only non-revoked `outlet_user_roles` / `outlet_user_permissions` rows (`revoked_at IS NULL`) participate in scoped authorization. When any active outlet-scoped assignment exists, the requested outlet must match one of those active assignments; historical revoked rows must neither grant access nor suppress the established tenant-wide fallback. A failure returns HTTP 403 with stable code `online_orders.outlet_access_denied`.

The tenant lifecycle comparison must use canonical `TenantStatusConstants.Active` (`active`, lowercase in `tenants.status`); outlet and tenant-user statuses retain their own canonical uppercase constants. Do not compare tenant lifecycle data to an outlet/user status literal.

## OO-01 staff list read contract

`GET /api/v1/tenant/ecommerce/click-collect/orders` is the implemented staff-facing bounded queue read. It accepts `outletId`, `search`, `status`, `sortBy`, `sortDirection`, `page`, and `pageSize`; the approved UI exposes only debounced search (approximately 300–500 ms). The service enforces TenantOnly context, active tenant, Click & Collect entitlement, both Online Orders access/view permissions, and outlet access. Its response owns the six full-scope aggregates, server-derived display status, authoritative `serverTime`, item/unit counts, payment projection, and up to four batched product previews plus `remainingPreviewCount`.

Authenticated POS theme values are resolved independently through `GET /api/v1/pos/theme`. The cross-cutting contract reuses `setting_definitions` and `tenant_settings` with tenant-editable keys `pos.theme.primary_color` and `pos.theme.secondary_color`; defaults are `#FF6A00` and `#000000`. Resolution precedence is tenant override → setting-definition default → safe application fallback. No theme table or schema column exists. Flutter consumption remains Chunk 3 scope.

The response contains `items`, `summary`, `page`, `pageSize`, `totalCount`, and authoritative `serverTime`. Each list item reconciles existing naming while providing the equivalent of `orderId`, `orderNumber`, pickup/collection reference, customer name/phone, collection start/end/timezone snapshot, display and payment status, item/unit counts, product previews, and remaining preview count. A preview contains product/variant identifiers, product name, image URL and accessible alternative text.

Summary values are tenant/outlet/query-scoped aggregate counts, never current-page counts. `Delayed` is a read projection from authoritative lifecycle + promised collection window + server time; it is not persisted and cannot incorrectly replace Ready, Collected, Cancelled or terminal states. Payment comes from existing payment/order authority. List projections must use efficient joined/batched reads and avoid N+1 database or image API access.

The queue chevron navigates to `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}` only. No queue mutation command is exposed.

## OO-02 detail and start contract

### Detail read

`GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}?outletId={outletId}` is the single staff detail route. It requires the Online Orders access/view permissions and repeats entitlement, tenant, active-user, active-outlet and outlet-scope checks. It is side-effect free.

The typed response must provide, where authoritative: order id/number/external reference, lifecycle and display status, placed/updated timestamps, source/customer classification, customer id/name/phone/email/notes, outlet id/name, collection start/end/timezone, payment status and currency, subtotal/discount/tax/charges/total/paid/balance, fulfilment id/assignment, and ordered lines. Each line may include line id/number, product name, variant/options, SKU/barcode, image metadata, ordered quantity, unit price and line total. Line/unit totals are response facts or deterministic sums of returned lines; no prototype value is hardcoded.

The canonical contract does not require a second detail endpoint. The backend now implements this GET on the existing `ClickCollectOrdersController` family with a dedicated application query and bounded repository projection. It does not mutate the order, status history, fulfilment events or pickup evidence.

### Start command

`POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start?outletId={outletId}` requires `commerce.online_order.fulfilment.start` in addition to access context. Its only body field is positive `expectedVersion`, sourced from the current detail `fulfillmentVersion`; clients must not send lifecycle input or retry a stale version blindly.

The application transaction revalidates tenant, actor, entitlement, outlet/resource ownership, order and fulfilment eligibility, pickup/slot reservation, requested quantities, assignment, idempotency and optimistic concurrency. It transitions the canonical fulfilment from an eligible pre-picking state to `PICKING`, assigns the current tenant user when policy allows, updates audit columns and appends a fulfilment event. It must not create a parallel order/payment/inventory model.

The result returns order id, fulfilment id/number, resulting status, assignment, start timestamp and updated fulfilment version. HTTP 409 represents stale/ineligible/concurrent state; the client refetches detail and does not enter picking. Successful clients invalidate/refetch queue and detail, then navigate to `/pos/online-orders/:orderId/picking`.

OO-03 opening performs no network request when current OO-02 detail is available. The backend transaction order is authenticated tenant/user → entitlement → permission → outlet/resource scope → tracked aggregate → expected/current version → sales/fulfilment lifecycle → pickup reservation → inventory reservation → actor assignment → `PICKING` → version increment → one `FULFILLMENT_STARTED` event → save/commit. Any failure rolls back. Server time owns the event timestamp and time comparisons.

### Verified implementation status (2026-08-31)

| Surface | Live-source finding | Classification |
|---|---|---|
| Flutter detail route/screen/model/provider/repository/client | Present; route reads detail, shared-modal confirmation precedes client Start, duplicate submission locks, 409 refetches, success refreshes then navigates | IMPLEMENTED / RUNTIME ACCEPTANCE OPEN |
| Staff detail GET | Implemented on the existing staff controller; permission, entitlement, active context, outlet scope and non-disclosing resource checks are enforced | IMPLEMENTED / FOCUSED TESTS PASS |
| Staff start POST | Implemented on the existing staff controller with expected-version validation, transaction, assignment, reservation validation and event append | IMPLEMENTED / FOCUSED TESTS PASS |
| Existing fulfilment/order/pickup/payment/reservation tables | Present and reusable | REUSE |
| OO-02-specific table/column | Not required | NOT NEEDED |
| Concurrency/idempotency implementation for start | `FulfillmentOrder.row_version` is an EF concurrency token; detail returns it, Start verifies/increments it, and stale state maps to 409 | IMPLEMENTED |

## Database contract

Reuse fulfilment methods/outlets, slots/reservations, sales orders/lines/payments, inventory reservations/lines, inventory locations/balances/movements, fulfilment orders/lines/events, pickup orders/events, customers, outlets, tenant users and audit infrastructure. Add only `fulfillment_packages`, `fulfillment_package_lines`, `fulfillment_order_lines.inventory_reservation_line_id`, and repository-standard concurrency fields on fulfilment/pickup headers (canonical target `row_version`).

For OO-01 specifically: **New API = YES; New table = NO; New database column/attribute = NO.** Display status, delayed state, counts and previews are read projections. No `online_orders`, `delayed_orders`, `ready_orders`, priority column or summary-count column is introduced.

For OO-02: **Competing/new detail API family = NO; canonical GET and Start POST are implemented on the existing staff controller family. New OO-02 table = NO. New OO-02-specific column = NO.** Migration `20260831064535_AddSharedFulfillmentOrderConcurrency` adds the approved shared `fulfillment_orders.row_version` infrastructure for all fulfilment mutations. Existing sales order/lines, fulfilment order/lines/events, pickup/slot reservation, customer, payment, outlet/user and inventory reservation authorities are reused.

For OO-03 specifically: **new controller/API/table/column/migration = NO.** It reuses the same detail/Start contracts and shared concurrency infrastructure. The existing shared migration is a prerequisite already implemented; it is not an OO-03-specific migration.

## Backend ownership and reuse

| Layer | Responsibility | Reuse |
|---|---|---|
| API | Thin Tenant E-commerce Click & Collect controller family | Auth/error conventions |
| Application | Fulfilment/Pickup orchestration | Tenant/outlet authorization, inventory reservation, payments, notification, audit, idempotency, time |
| Domain | Fulfilment/pickup/package invariants and transitions | Sales Order, Inventory and Payment authorities |
| Infrastructure | Existing module repositories and EF mappings | Transactions, concurrency and append-only event patterns |

Do not create duplicate OnlineOrderPaymentService, OnlineOrderInventoryService, payment records, stock ledgers, notification outboxes or audit tables.

OO-01 remains under E-commerce / Customer Orders / Click & Collect ownership.
The bounded list-read service, repository query and typed
request/list-item/summary/response DTOs are implemented through the canonical
`ClickCollectOrdersController` family. Do not create a parallel module or
controller family.

## Guarantees

Start, pick, pack, ready, QR validation, cash payment and handover use optimistic concurrency. Retryable mutations use idempotency. Handover revalidates state/package/items/payment in one transaction; replay returns the original result without duplicate payment, stock or events.

## Related files

## OO-04 implementation boundary (2026-09-02)

The canonical picking GET, pick-line POST and issue POST listed above are
implemented by the existing `ClickCollectOrdersController` and Customer Orders
service/repository family. Pick body is
`{ quantity, barcode?, inputMethod: SCAN|MANUAL, expectedVersion }`; issue body is
`{ reason: ITEM_NOT_FOUND, note?, expectedVersion }`. Note is trimmed and limited
to 500 characters. Both mutations require `PICKING`, increment `row_version`
exactly once and map stale EF/client versions to HTTP 409 without partial state.
No new controller family, table, column or migration is required.
Existing location authority is `inventory_locations.location_code` and
`location_name`; aisle/rack/bin are not authoritative. Only
Implemented events are `FULFILLMENT_LINE_PICKED`,
`FULFILLMENT_LINE_ISSUE_REPORTED`, and `FULFILLMENT_PICKING_COMPLETED`. Completion
keeps lifecycle `PICKING` for downstream packing. Issue is audit-only/non-blocking.
Picking Note is implemented as `POST
/api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking/notes?outletId={outletId}`
with `{ note, expectedVersion }`. It requires
`commerce.online_order.picking.note`, PICKING lifecycle, a trimmed 1–500 character
plain-text note and the current positive aggregate version. Success atomically
increments `fulfillment_orders.row_version`, appends one
`FULFILLMENT_PICKING_NOTE_ADDED` event to `fulfillment_order_events.event_note`,
and returns the saved note plus its actor/server timestamp and new version. Stale
version is 409. GET returns derived progress and `canPack`, source-location
code/name, media, server time, current fulfilment version, and at most the latest
50 saved notes ordered oldest-to-newest. Notes never alter quantity, lifecycle or
pack eligibility. Full decision matrix:
[[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO04_Canonicalization_Status_2026-09-02]].

### OO-04B selected-line capability boundary (2026-09-08)

OO-04B is a Flutter selected-line composition, not a new backend resource. It
reuses Picking Detail and the existing line pick command. Barcode capture never
mutates by itself: `SCAN` or `MANUAL` input is verified for the route-selected
line, then explicit submission sends the existing
`PosOnlineOrderPickLineRequest { Quantity, Barcode, InputMethod,
ExpectedVersion }`. `orderId`, `lineId` and `outletId` remain route/query scope;
tenant and actor come from authentication. The complete screen contract and
Chunk 2 verification boundary are owned by the linked OO-04 tracker. New
controller, endpoint family, table, column, migration and permission are **NO**.

**OO-04B barcode authority (2026-09-08):** verification compares the entered /
scanned barcode only to `SalesOrderLine.BarcodeSnapshot` (immutable order-time
primary barcode captured at Click & Collect confirm /
`CreateForClickAndCollect`). Current catalogue `product_barcodes` is **not**
pick-time authority. If a barcode-pickable line unexpectedly has NULL
`barcode_snapshot`, the pick mutation returns
`online_orders.barcode_snapshot_unavailable` with zero quantity / version /
event mutation. A wrong barcode still returns `online_orders.invalid_barcode`.


- [[../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
