<!-- title: Fulfilment & Pickup / Click & Collect Technical Contract -->
<!-- status: Canonicalized - OO-01/OO-02/OO-03 implemented; later operations tracked separately -->
<!-- last_updated: 2026-09-01 -->

# Fulfilment & Pickup / Click & Collect Technical Contract

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
| POST | `/orders/{orderId}/pack` | `.packing.pack` | Validate and create package(s) |
| POST | `/orders/{orderId}/ready` | `.collection.mark_ready` | Validate ready and notify |
| GET | `/collection/ready` | `.collection.view_ready` | Outlet ready queue |
| POST | `/collection/qr/validate` | `.collection.scan_qr` + `.collection.validate_qr` | Server QR validation |
| GET | `/collection/lookup` | `.collection.manual_lookup` | Manual fallback lookup |
| POST | `/orders/{orderId}/collection/payment/cash` | `.payment.accept_cash` | Orchestrate existing payment/till engine |
| POST | `/orders/{orderId}/collection/handover` | `.collection.handover` + `.collection.collect` | Idempotent finalization |

All permission suffixes use the `commerce.online_order` prefix. `PATCH /orders/{orderId}/status` is not the primary cashier contract. If retained, restrict it to safe/internal compatibility and prevent transition bypass.

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


- [[../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
