<!-- title: Fulfilment & Pickup / Click & Collect Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-31 -->

# Fulfilment & Pickup / Click & Collect Functional Rules

## Purpose

Defines business and UX rules for `Fulfilment_Pickup_ClickCollect` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Click and collect requires a valid outlet and fulfilment method.
- Pickup slot reservations protect capacity until checkout/order confirmation.
- Fulfilment and pickup events are append-only.
- Collected status must be backend confirmed, not just UI changed.
- Own delivery is later phase and must not be mixed into pickup state.
- `Delayed` is derived, never persisted as another lifecycle.
- One fulfilment may have multiple packages and package lines.
- Ready requires resolved picking, valid package contents and backend validation.
- QR is READY-only, opaque, hash-stored, expiring, tenant/outlet/order bound and single-use on collection.
- Paid Online and Cash on Collection are valid; payment must complete before handover and duplicate charging is forbidden.
- Handover is idempotent and atomically finalizes pickup, fulfilment, sales-order projection and events/audit.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

### OO-01 Online Orders queue

- Authenticated access requires `commerce.online_order.orders.access` and `commerce.online_order.orders.view`; frontend gating is UX only and backend enforcement is mandatory. Role-name authorization is forbidden.
- Read only the active tenant and authorized POS outlet/fulfilment scope.
- The visible queue exposes one debounced server-side search and exactly six authoritative summary aggregates: New, Preparing, Ready, Delayed, Collected and Cancelled.
- Render order cards, not a table. Each card contains only list projection facts and a chevron that opens detail without mutating fulfilment state.
- Filters, status tabs, sorting, table headers, Open/Start actions and visible pagination are excluded from the approved queue. Bounded API query capabilities remain permitted internally.
- `Delayed` is derived using lifecycle, collection window and server time. It must not override legitimate Ready, Collected, Cancelled or other terminal states merely because time passed.
- Payment labels derive from existing payment/order authority. Product previews are projected in the list response and must not cause per-order or per-product network calls.
- Loading, refresh, empty, empty-search, retry/error, denied, not-entitled and network/server failure states are explicit. Phone stacks cards; tablet/desktop use horizontal cards; no viewport may overflow or clip.
- The approved orange priority star has no verified business authority and therefore has no persisted/API business field in this chunk.

### OO-02 Order detail and start boundary

- Detail is authoritative and read-only. Its GET must not allocate inventory, assign staff, change statuses or append operational events.
- Required read authorization is `commerce.online_order.orders.access` plus `commerce.online_order.orders.view`; the start command separately requires `commerce.online_order.fulfilment.start`. Entitlement, tenant and outlet/resource checks are mandatory on both operations.
- Display order/customer/collection/payment/line facts only from authoritative response fields. Remaining time and overdue styling are derived from the collection window and authoritative server time; neither becomes persisted state.
- Guest is not inferred from a missing customer name/id. Show a customer classification only when the authoritative model provides it.
- Ordered quantity is line-specific. Do not repeat an order-level count as line picking progress; unresolved picking progress belongs to OO-04.
- The Start control opens OO-03 confirmation. Mutation begins only after confirmation.
- A start request is atomic and retry-safe: revalidate order, fulfilment, pickup/reservation, quantities, outlet, assignment and concurrency; transition only an eligible fulfilment to `PICKING`; assign the current authorized tenant user; append event/audit evidence.
- Success refreshes queue/detail authority before navigation to OO-04. A 409 conflict does not navigate; refresh and show the new authoritative state. Duplicate/replayed requests must not duplicate fulfilment state or events.
- `View Details` is non-mutating. Back returns to OO-01 without changing operational state.
- Start requires online backend validation; cached/offline detail may be readable under the offline authority but cannot produce local success.

| Authoritative fulfilment/order condition | OO-02 action |
|---|---|
| Eligible pre-start state | Show/enable Start only with permission; confirmation is mandatory |
| `PICKING` | No Start; offer Continue Picking only when the journey and picking permission allow it |
| `PICKED`, `PACKED`, `READY` | No Start; present current authoritative state/next permitted journey action |
| `FULFILLED`, collected/completed equivalent | No Start |
| `CANCELLED` or other terminal state | No Start |
| Start permission missing | Hide the complete Start region; OO-02 reflows with no reserved space and OO-03 is unreachable through normal UI |
| Entitlement/outlet access missing | Show the canonical denied/not-entitled state; backend remains authoritative |
| Offline or stale/conflicting | Block Start; reconnect/refetch authority |

### OO-03 confirmation and Start rules

- Opening OO-03 is side-effect free and reuses the fresh OO-02 aggregate; it does not issue a redundant detail GET.
- Required confirmation facts are order, customer, collection outlet, collect-by/remaining-or-overdue, item count and unit count. Remaining/overdue derives from collection time plus backend `serverTime`, never the device clock or a stored label.
- Cancel closes only. Confirm submits the existing Start command with the current positive fulfilment version, disables duplicate input while pending and permits only one in-flight request.
- Start accepts fulfilment `PENDING` or `ALLOCATED`, sales order `CONFIRMED` or `ACCEPTED`, confirmed pickup-slot reservation and confirmed unexpired same-order/same-outlet inventory reservation. It rejects already-started and terminal states.
- One successful transaction assigns the authenticated tenant user, transitions to `PICKING`, increments `row_version` and appends exactly one `FULFILLMENT_STARTED` event. Any failed validation rolls back every mutation.
- A 409 replaces stale UI authority by refetching detail and never navigates to OO-04. Frontend duplicate-submit locking complements, but never replaces, backend lifecycle/concurrency protection.
- Without `commerce.online_order.fulfilment.start`, the Start CTA is absent, OO-03 cannot be reached through normal UI, and no empty action slot remains.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Driver assignment
- Delivery fee calculation
- Third-party courier integration
- Kitchen display automation

## Related Files

## OO-04 Picking canonical rule (2026-09-02)

OO-04 is backend-authoritative and accepts line mutations only for an authorized
same-tenant/outlet Click & Collect fulfilment in `PICKING`. Scan requires
`.picking.pick` + `.picking.scan`; manual entry requires `.picking.pick` +
`.picking.manual_entry`; issue reporting requires `.picking.report_issue`.
Quantities cannot over-pick, barcode must belong to the current order line, and
all successful mutations use `expectedVersion`/`fulfillment_orders.row_version`
atomically with event/audit evidence. Review & Pack requires backend-confirmed
zero remaining quantity on every required line and no blocking unresolved issue.
Client counts, device time and generic status PATCH are not transition authority.
Pick uses positive increment semantics. `SCAN` additionally validates the scoped
sales-line barcode; `MANUAL` remains line-scoped. `ITEM_NOT_FOUND` issue reporting
increments the aggregate version and writes audit only: it never changes quantity,
substitutes, cancels or blocks packing. `canPack` is true only when at least one
line exists and every requested quantity is covered by picked plus cancelled
quantity. Picking Note is a PICKING-only, plain-text audit mutation. It requires
`commerce.online_order.picking.note`, trims and validates 1–500 characters,
increments `row_version`, and appends exactly one event without changing line
quantities, lifecycle or `canPack`. Implemented events are
`FULFILLMENT_LINE_PICKED`, `FULFILLMENT_LINE_ISSUE_REPORTED`,
`FULFILLMENT_PICKING_COMPLETED` and `FULFILLMENT_PICKING_NOTE_ADDED`. Authority:
[[../../15_IMPLEMENTATION_TRACKING/Flutter/ECommerce/Online_Order_OO04_Canonicalization_Status_2026-09-02]].


- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
