<!-- title: Fulfilment & Pickup / Click & Collect Technical Contract -->
<!-- status: Canonicalized - Implementation Pending -->
<!-- last_updated: 2026-08-27 -->

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

## Database contract

Reuse fulfilment methods/outlets, slots/reservations, sales orders/lines/payments, inventory reservations/lines, inventory locations/balances/movements, fulfilment orders/lines/events, pickup orders/events, customers, outlets, tenant users and audit infrastructure. Add only `fulfillment_packages`, `fulfillment_package_lines`, `fulfillment_order_lines.inventory_reservation_line_id`, and repository-standard concurrency fields on fulfilment/pickup headers (canonical target `row_version`).

For OO-01 specifically: **New API = YES; New table = NO; New database column/attribute = NO.** Display status, delayed state, counts and previews are read projections. No `online_orders`, `delayed_orders`, `ready_orders`, priority column or summary-count column is introduced.

## Backend ownership and reuse

| Layer | Responsibility | Reuse |
|---|---|---|
| API | Thin Tenant E-commerce Click & Collect controller family | Auth/error conventions |
| Application | Fulfilment/Pickup orchestration | Tenant/outlet authorization, inventory reservation, payments, notification, audit, idempotency, time |
| Domain | Fulfilment/pickup/package invariants and transitions | Sales Order, Inventory and Payment authorities |
| Infrastructure | Existing module repositories and EF mappings | Transactions, concurrency and append-only event patterns |

Do not create duplicate OnlineOrderPaymentService, OnlineOrderInventoryService, payment records, stock ledgers, notification outboxes or audit tables.

OO-01 remains under E-commerce / Customer Orders / Click & Collect ownership. Prefer extending the canonical Click Collect controller. The smallest pending backend addition is a list-read service, repository query and typed request/list-item/summary/response DTOs; do not create a parallel module or controller family.

## Guarantees

Start, pick, pack, ready, QR validation, cash payment and handover use optimistic concurrency. Retryable mutations use idempotency. Handover revalidates state/package/items/payment in one transaction; replay returns the original result without duplicate payment, stock or events.

## Related files

- [[../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
