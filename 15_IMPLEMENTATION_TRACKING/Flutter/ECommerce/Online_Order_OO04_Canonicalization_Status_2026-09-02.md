# OO-04 Online Order Picking Canonicalization Status — 2026-09-02

Status: **ONLINE ORDER BARCODE SNAPSHOT PRODUCTION CONTRACT + OO-04B END-TO-END FIX COMPLETE**

## Scope

OO-04 begins only after OO-03 returns authoritative `PICKING`. It owns operational
line picking, scan/manual confirmation, progress, issue reporting and eligibility
to enter Review & Pack. OO-04 owns picking interactions; OO-05 owns Review & Pack
and OO-06 owns the subsequent ready-for-collection boundary.

## OO-04B canonical identity and relationship (2026-09-08)

The canonical screen name is **OO-04B â€” Pick Item / Barcode Verification**. It
is not a new journey stage: it is the selected-line sub-flow of OO-04. Existing
OO-04 `Pick Order` remains the order overview and current production owner;
OO-04B is the dedicated, responsibility-focused screen opened when one product
line is selected. Existing dialog-based pick entry is implementation evidence,
not the target OO-04B screen.

```text
OO-04 Pick Order overview
â†’ select one pending line (or overview scan locates a matching pending line)
â†’ OO-04B opens for that exact fulfilment line
â†’ scan/manual input verifies only that selected line
â†’ cashier chooses quantity and presses Mark as Picked
â†’ backend atomically persists authoritative quantity/version/event
â†’ refetch current picking state
â†’ next pending item or back to OO-04
â†’ backend canPack true
â†’ OO-05 Review & Pack
```

An overview scan locates/selects a matching pending line inside the current
order; it does not pick it. An OO-04B scan verifies only the already-selected
line. Scanning Product B while Product A is open is a mismatch: no navigation to
B, no mutation and no progress change.

### Critical verification boundary

Barcode capture alone never permanently marks an item picked. Input is trimmed
and passed using the existing barcode authority; the server verifies the
barcode against the selected sales-order product/variant line. A mismatch is
rejected without a pick mutation. A match creates only current-action verified
UI state. Persistence occurs only after a valid `quantityToPick` and explicit
`Mark as Picked` submission. No optimistic/local `1/1` success is authoritative.

Manual barcode entry follows the same verification and server mutation contract
as scanner input, with `inputMethod=MANUAL`; scan uses `inputMethod=SCAN`. Case or
format normalization must follow the existing barcode-domain rules and must not
be invented by the screen.

## OO-04B functional requirements

| ID | Requirement |
|---|---|
| FR-01 | Selecting one OO-04 line opens OO-04B with that order and fulfilment-line identity. |
| FR-02 | Load/refetch the authoritative current Picking Detail before mutation. |
| FR-03 | Show authoritative product name. |
| FR-04 | Show variant/options when present without fabricating fallback detail. |
| FR-05 | Show SKU when present. |
| FR-06 | Show cached product image or the established safe placeholder. |
| FR-07 | Show only authoritative location code/name. |
| FR-08 | Show requested quantity. |
| FR-09 | Show already-picked quantity. |
| FR-10 | Show derived remaining quantity. |
| FR-11 | Accept scanner input only when scan permission exists. |
| FR-12 | Accept manual barcode input only when manual-entry permission exists. |
| FR-13 | Verify barcode for the selected line before enabling submission. |
| FR-14 | Reject wrong/unrelated barcode with no mutation. |
| FR-15 | Decrement the current quantity no lower than one. |
| FR-16 | Increment the current quantity no higher than remaining. |
| FR-17 | Enforce `1 <= quantityToPick <= remainingQuantity` in UI and backend. |
| FR-18 | `Mark as Picked` submits the existing authoritative pick command. |
| FR-19 | Permit only one in-flight mutation; block double taps/repeated scanner submits. |
| FR-20 | Treat backend persistence, not local state, as success. |
| FR-21 | Replace UI with updated authoritative state after success. |
| FR-22 | Refresh OO-04 order-level progress after a successful mutation. |
| FR-23 | Offer the next pending line when one exists. |
| FR-24 | Show a bounded `Next Items` projection from current authoritative lines. |
| FR-25 | Back returns to OO-04 without mutating state. |
| FR-26 | A fully picked line is read-only and cannot be submitted again. |
| FR-27 | When all lines are resolved, show picking complete without claiming Ready. |
| FR-28 | Enable Review & Pack only from backend `canPack`. |
| FR-29 | `Can't Find Item` uses the existing issue command and never changes quantity. |
| FR-30 | Provide an accessible loading state without stale actions. |
| FR-31 | Provide retry-safe API/network error state without fake success. |
| FR-32 | On 409 discard transient verification, refetch and explain stale state. |
| FR-33 | Missing image uses existing cached-image fallback. |
| FR-34 | Missing location displays canonical unavailable text; no aisle/rack/bin. |
| FR-35 | Permission-filter actions before layout so hidden actions leave no blank space. |

## OO-04B business rules

| ID | Rule |
|---|---|
| BR-01 | Request requires authenticated tenant staff and active tenant context. |
| BR-02 | Tenant, order, fulfilment, line and inventory records must share tenant ownership. |
| BR-03 | Requested outlet must pass existing active outlet/resource scope. |
| BR-04 | The order/fulfilment must remain eligible and fulfilment must be `PICKING`. |
| BR-05 | Terminal/cancelled/advanced state blocks picking. |
| BR-06 | Selected fulfilment line must belong to the route order and fulfilment. |
| BR-07 | Scan barcode must belong to the selected sales-order product/variant line. |
| BR-08 | A barcode belonging to another current-order line is still a mismatch in OO-04B. |
| BR-09 | `remainingQuantity = requestedQuantity - pickedQuantity`; it is not persisted separately. |
| BR-10 | Quantity is positive and cannot exceed authoritative remaining quantity. |
| BR-11 | A zero-remaining line cannot be repicked. |
| BR-12 | Backend repeats every barcode, quantity, lifecycle, ownership and permission check. |
| BR-13 | Every mutation carries the current positive `fulfillmentVersion` as `expectedVersion`. |
| BR-14 | Stale versions return 409 with no silent overwrite or blind retry. |
| BR-15 | Existing assignment policy remains authoritative; the client cannot choose actor/assignee. |
| BR-16 | Location uses `inventory_locations.location_code/location_name` only when resolved. |
| BR-17 | No mock product, barcode, quantity, location or success fallback is permitted. |
| BR-18 | All-picked does not mean Ready; OO-05 Review & Pack remains mandatory. |
| BR-19 | Review & Pack eligibility is the backend `canPack` result. |
| BR-20 | Frontend permission gating is UX; backend enforcement is security authority. |
| BR-21 | Each successful pick is atomic and appends canonical audit/event evidence. |
| BR-22 | Concurrency and invariant validation protect against duplicate scan/tap/retry. |

## Quantity, progress and lifecycle

`requestedQuantity` and `pickedQuantity` come from the Picking Detail line.
`remainingQuantity = requestedQuantity - pickedQuantity`. For one mutation,
`1 <= quantityToPick <= remainingQuantity`; requested 5, picked 2 means only
1, 2 or 3 are valid. Zero, negative, 4+, and any pick on remaining zero fail.

Order progress is derived, never a percentage column:

```text
totalUnits = SUM(requestedQuantity)
pickedUnits = SUM(pickedQuantity)
pendingUnits = totalUnits - pickedUnits
progress = totalUnits > 0 ? pickedUnits / totalUnits : 0
```

Current item number and next item are presentation projections from the current
ordered line list. `canPack` is returned by the backend. `barcodeVerified`,
remaining-time/overdue and display status are runtime state. None authorizes a
lifecycle transition.

Lifecycle remains `New/Accepted â†’ Start Fulfilment â†’ PICKING â†’ item picks â†’
all picked â†’ OO-05 Review & Pack â†’ PACKED/Ready command â†’ READY â†’ handover â†’
FULFILLED/Collected`. One or all picks do not set READY. Cancelled is terminal;
Delayed remains server-time-derived presentation, not a persisted status.

## Permissions and capability ownership

Exact existing permissions, verified in
`OnlineOrderPickingPermissions`, are:

- read context: `commerce.online_order.orders.access`,
  `commerce.online_order.orders.view`, `commerce.online_order.picking.view`;
- submit scanned pick: `commerce.online_order.picking.pick` plus
  `commerce.online_order.picking.scan`;
- submit manual pick: `commerce.online_order.picking.pick` plus
  `commerce.online_order.picking.manual_entry`;
- issue: `commerce.online_order.picking.report_issue`;
- optional note: `commerce.online_order.picking.note`;
- downstream Review & Pack: `commerce.online_order.packing.view` and mutation
  `commerce.online_order.packing.pack`.

No permission gap exists. Missing `.picking.note` removes Add Picking Note and
its layout slot. Role-name authorization is forbidden.

### Existing API classification

| Capability | Route/current owner | Decision for OO-04B |
|---|---|---|
| Load/refresh state | `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking?outletId=...` | REUSE |
| Selected-line scan/manual mutation | `POST .../{orderId}/picking/lines/{lineId}/pick?outletId=...` | REUSE; existing `PosOnlineOrderPickLineRequest` |
| Can't Find Item | `POST .../{orderId}/picking/lines/{lineId}/issues?outletId=...` | REUSE |
| Picking note | `POST .../{orderId}/picking/notes?outletId=...` | REUSE |
| Next pending item | derive from refreshed bounded `Lines` | REUSE response; no endpoint |
| Review & Pack eligibility | response `CanPack` | REUSE; OO-05 owns pack mutation |

Pick body is exactly `{ quantity, barcode?, inputMethod, expectedVersion }`.
Client route/query owns `orderId`, `lineId` and `outletId`; tenant and actor come
from authentication. Success returns `PosOnlineOrderPickingCommandResponse`
with order/fulfilment identity, status, totals, `CanPack`, new version and server
timestamp, then the client refetches Picking Detail for line/remaining/next-item
state. No competing `OnlineOrdersController` or `PickItemController` is allowed.

## Persistence and attribute audit

| Existing table | Pick Item ownership / verified attributes |
|---|---|
| `sales_orders` | `id`, `tenant_id`, outlet/order identity, order number/status, customer/collection snapshot authority; read only here |
| `sales_order_lines` | line/product/variant identity, name/options/SKU/barcode/image projection and ordered quantity; read only |
| `fulfillment_orders` | `id`, `tenant_id`, `sales_order_id`, outlet method/source location, status, assigned user and `row_version`; version/audit mutation |
| `fulfillment_order_lines` | `id`, tenant/fulfilment/sales-line links, requested/picked/packed/cancelled quantities, status and picked actor; pick mutation owner |
| `fulfillment_order_events` | id, tenant/fulfilment, sequence, type, actor, server timestamp, note/payload; append-only audit owner |
| `inventory_reservations` / lines | authoritative same-order/product/variant reservation validation; no screen-owned mutation |
| `inventory_locations` | `location_code` and `location_name`; read-only display authority |
| `pickup_slot_reservations`, `pickup_orders` | collection/outlet eligibility and lifecycle context; read only during picking |

Primary keys and tenant FKs remain those documented in the database authority.
No image URL, verification flag, next-item, percentage, aisle, rack, bin, issue
or screen-state column is needed. **New table: NO. New column: NO. Migration:
NO.**

## Concurrency, atomicity and events

Each mutable operation supplies `expectedVersion` for
`fulfillment_orders.row_version`. Matching version succeeds and increments once;
a concurrent/stale request returns HTTP 409, persists nothing and requires GET
refetch. Frontend locking complements but never replaces this rule.

One transaction performs authentication context â†’ entitlement/permission â†’
tenant/outlet ownership â†’ aggregate/line/lifecycle/version â†’ barcode/input â†’
remaining quantity/reservation validation â†’ picked quantity/actor/line state â†’
version increment â†’ event append â†’ save/commit. Any failure rolls all of it
back. Exact existing events are `FULFILLMENT_LINE_PICKED`,
`FULFILLMENT_LINE_ISSUE_REPORTED`, `FULFILLMENT_PICKING_COMPLETED` and, for the
separate note operation, `FULFILLMENT_PICKING_NOTE_ADDED`.

## Error and edge-state matrix

| Case | Canonical result |
|---|---|
| Valid scan | Verify current line; explicit submit persists and refetches. |
| Invalid/unknown barcode | Safe validation error; no mutation. |
| Barcode for another selected-order item | Mismatch; stay on current item; no mutation. |
| Barcode not in order | Reject; no order/line disclosure. |
| Fully picked line | Read-only/return or next-item action. |
| Quantity over remaining | 400; retain authoritative quantities. |
| Zero/negative quantity | Client block and server 400. |
| Missing image | Existing safe placeholder. |
| Missing variant/SKU | Omit optional fact without corrupting state. |
| Missing location | Show unavailable; never fabricate a location. |
| Stale version/concurrent cashier | 409, discard verification, refetch. |
| Duplicate tap/repeated scanner value | One in-flight command; backend invariant/version prevents double-pick. |
| Network failure | No local success; retry/refetch safely. |
| Timeout after submit | Refetch before any retry to discover authoritative outcome. |
| 400 | Explain safe validation failure; keep corrected authoritative state. |
| 401 | Session/login recovery. |
| 403 / permission revoked | Remove/block action, refetch authorization; no mutation. |
| 404 | Non-disclosing unavailable/not-found state. |
| 409 | Conflict message plus authoritative refetch. |
| 5xx | Safe retry state; no fake progress. |
| Order cancelled/advanced while open | Refetch; disable picking and route to valid state. |
| Previous-order stale state | Key state by order/line; reject delayed response. |
| Delayed response for another item | Ignore unless order/line/request identity still matches. |
| Whitespace manual barcode | Trim before request; server repeats normalization/validation. |
| Case/format variance | Use existing barcode-domain equivalence only; no UI-invented transformation. |
| No scan permission | Scanner absent; remaining permitted actions reflow. |
| No manual permission | Manual input absent; remaining permitted actions reflow. |
| No pick permission | No Mark as Picked action even if scan/manual capability exists. |
| No issue permission | Can't Find Item absent. |
| Empty/no lines | Canonical empty state; no progress division error. |
| Missing entitlement/wrong outlet | Denied/not-entitled state without cross-scope facts. |

## Architecture, reuse, theme and responsive contract

Frontend owner remains `lib/features/fulfilment_pickup/`: screen â†’
`pos_online_orders_provider.dart` controller â†’ domain repository â†’
`pos_online_orders_repository_impl.dart` â†’
`pos_online_orders_remote_datasource.dart` â†’ existing staff API. OO-04B may add
one responsibility-focused screen under `presentation/screens`; it must not add
`features/online_orders`, `features/order_detail` or `features/pick_item`.
Widgets never call Dio directly.

Backend owners are:

- `src/E_POS.Api/Controllers/V1/Tenant/ECommerce/ClickCollectOrdersController.cs`;
- `src/E_POS.Application/Modules/ECommerce/CustomerOrders/Services/PosOnlineOrderPickingService.cs`;
- `src/E_POS.Application/Modules/ECommerce/CustomerOrders/Contracts/IPosOnlineOrderPickingRepository.cs`;
- `src/E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/Repositories/PosOnlineOrderPickingRepository.cs`;
- existing `E_POS.Domain/Modules/ECommerce/FulfilmentPickup` aggregate/entities.

| Element | Existing owner/decision | Classification |
|---|---|---|
| POS page shell, header, footer | current cashier POS shell | REUSE |
| Back action | Material/shared navigation pattern | REUSE |
| Page title/order and status chip | online-order UI/status owner | REUSE |
| Summary/progress metrics | current picking metrics | REUSE |
| Product image | `AppCachedNetworkImage` plus current picking wrapper | REUSE |
| Primary/secondary CTA | `PosPrimaryActionButton` / `PosBottomOutlinedButton` | REUSE |
| Loading/error state | `OnlineOrderScreenState` | REUSE |
| Modal, only if issue confirmation needs it | shared app modal + existing issue dialog | REUSE |
| Product/location/detail panel | selected-line composition using existing primitives | FEATURE-LOCAL |
| Barcode verification panel | extend current scanner input owner to separate verify from submit | EXTEND |
| Manual barcode field | same scanner/input owner; no duplicate field implementation | EXTEND |
| Quantity stepper | extend current `pick_quantity_panel.dart` owner | EXTEND |
| Progress ring/legend and Next Items list | OO-04B composition over existing picking state/widgets | FEATURE-LOCAL |
| Permission-aware action composition | provider permissions before layout | FEATURE-LOCAL |

Counts: REUSE 8, EXTEND 3, SHARED/NEW 0, FEATURE-LOCAL 3. No duplicate
button/card/chip/dialog is authorized. Generic enhancements contain no online-
order business rules.

Brand emphasis consumes backend-driven `ThemeData.colorScheme`; default primary
`#FF6A00` and secondary `#000000` are documentation fallbacks, never widget
literals. A tenant Orange-like â†’ Pink-like override must recolour brand-owned
controls automatically. Success/error/warning/info remain semantic.

Tablet landscape is the primary target: unchanged shell header/footer, complete
fixed composition, all critical controls visible, no whole-page or internal
target scrolling, overflow or clipping. Use existing compact variants and
canonical tokens rather than screenshot measurements. Desktop may widen/balance
panels. Tablet portrait, phone and small phone stack in logical order and may use
the established page-level responsive scrolling required to keep content
reachable; business rules do not change.

Accessibility requires meaningful semantics for scanner/manual fields,
quantity decrement/increment, Mark as Picked, issue and navigation; disabled
actions explain why; errors are announced; status/progress uses text as well as
colour; touch targets are at least 44 logical pixels; focus order follows visual
order; keyboard/manual entry and text scaling remain usable; product fallback
has useful semantics or is marked decorative.

## Security and non-functional requirements

Authentication, tenant isolation, active outlet scope, entitlement and exact
permissions are mandatory. Server validates selected line/order/fulfilment,
barcode and quantity. Tenant, actor/user and lifecycle status are never trusted
from client input. Errors disclose no cross-tenant/order existence; role names
never authorize.

Performance uses current OO-04 state safely, bounded joined picking projection,
cached images and efficient refetch without full history/N+1 queries. Reliability
requires server truth, atomic conflict-safe mutation and no local fake success.
Observability records correlation/request ID plus safe order/fulfilment/line,
operation/result/error/latency; never tokens, secrets, raw auth material or
unnecessary PII. Maintainability requires existing feature/API/repository/table
owners and testable provider/service/repository boundaries.

## Explicit exclusions and chunk boundary

Do not create a new controller/API family, repository family, fulfilment
aggregate, table, column, migration, permission, progress field, verification
field, fake aisle/rack/bin, device-time authority, direct-Dio widget, local
business success, duplicate shared component, or OO-04B-specific backend state.

- **Chunk 1:** this Second Brain canonicalization only.
- **Chunk 2:** verify the already-implemented GET/pick/issue contract, schema,
  permissions, barcode validation, quantity/version/atomic events and tests;
  implement only a proven backend gap. Current audit expects REUSE and no schema
  migration.
- **Chunk 3:** implement the dedicated OO-04B selected-line route/screen inside
  `fulfilment_pickup`; separate verify from explicit submit; scanner/manual,
  quantity, next-item/back, progress/refetch, issue/permissions, fixed landscape,
  Orange-like/Pink-like theme, automated and authenticated runtime validation.

Tracker result: **OO-04 PICK ITEM â€” CHUNK 1 CANONICALIZATION COMPLETE; CHUNK 2
BACKEND VERIFICATION / IMPLEMENTATION READY; CHUNK 3 FLUTTER IMPLEMENTATION
PENDING.** Existing OO-04 overview production evidence remains valid and must not
be read as evidence that the new dedicated OO-04B screen already exists.

## OO-04B Chunk 2 backend/API/database closure (2026-09-08)

### Capability matrix

| # | Capability | Result | Verified owner/evidence |
|---:|---|---|---|
| 1 | Load Picking Detail | REUSE | Picking GET, service `GetAsync`, repository projection |
| 2 | Resolve current order | REUSE | tenant/order/type/outlet-scoped aggregate query |
| 3 | Resolve current fulfilment | REUSE | same-order eligible outlet-method fulfilment query |
| 4 | Resolve selected line | REUSE | fulfilment-line + sales-line + order predicates |
| 5 | Product name | REUSE | sales-line snapshot projection |
| 6 | Variant/options | REUSE | nullable variant snapshot projection |
| 7 | SKU | REUSE | nullable SKU snapshot projection |
| 8 | Barcode authority | REUSE | `SalesOrderLine.BarcodeSnapshot` |
| 9 | Image projection | REUSE | existing media lookup, nullable result |
| 10 | Inventory location | REUSE | fulfilment source location to inventory location |
| 11 | Requested quantity | REUSE | fulfilment line |
| 12 | Picked quantity | REUSE | fulfilment line |
| 13 | Remaining quantity | REUSE | requested minus cancelled minus picked, clamped at zero |
| 14 | Scan barcode | REUSE | existing pick command with `SCAN` |
| 15 | Manual barcode entry | EXTEND | now requires nonblank trimmed barcode |
| 16 | Barcode validation | EXTEND | identical selected-line match for `SCAN` and `MANUAL` |
| 17 | Quantity validation | REUSE | service positive check plus domain remaining invariant |
| 18 | Mark as Picked | REUSE | existing line pick command |
| 19 | Optimistic concurrency | REUSE | expected version + EF `RowVersion` original value |
| 20 | Duplicate protection | REUSE | version/invariant transaction boundary |
| 21 | Audit/events | REUSE | append-only fulfilment events |
| 22 | Report Issue | REUSE | existing issue command |
| 23 | Picking Note | REUSE | existing note command |
| 24 | Order progress | REUSE | authoritative line quantity sums |
| 25 | `CanPack` | REUSE | all required line quantities covered |
| 26 | Next pending item | REUSE | derived from refreshed ordered Picking Detail lines |
| 27 | Terminal lifecycle rejection | REUSE | only exact `PICKING` accepted |
| 28 | Permission enforcement | EXTEND | service now requires orders access/view plus operation permissions |
| 29 | Tenant isolation | REUSE | tenant predicates on aggregate, line and related queries |
| 30 | Outlet isolation | REUSE | active context, scoped assignment and outlet-method predicates |

Final count: **REUSE 27, EXTEND 3, MISSING 0, INVALID 0**. Two proven defects
were closed. The weaker manual path previously allowed a missing or mismatched
barcode because barcode presence/match checks were scan-only. Picking also
checked orders access plus the picking operation but omitted the canonical
`commerce.online_order.orders.view` read permission. The existing service and
repository were minimally extended; routes, DTO shape and architecture are
unchanged.

### Verified request, mutation and response

Both item input modes use:
`POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking/lines/{lineId}/pick?outletId=...`
with `{ quantity, barcode, inputMethod: SCAN|MANUAL, expectedVersion }`.
`ClickCollectOrdersController` remains HTTP-only. The application service
normalizes input, verifies entitlement and exact permissions, and the repository
performs tenant/outlet/order/fulfilment/selected-line/barcode/version/quantity
checks inside its existing transaction.

Barcode is the trimmed `sales_order_lines.barcode_snapshot` for the exact linked
sales line, compared case-insensitively after surrounding-whitespace removal.
Unknown, empty (when a snapshot exists), another variant/item/order barcode, or
a line outside the current aggregate returns `online_orders.invalid_barcode` or
`online_orders.invalid_line` with zero quantity/version/event mutation. When
`barcode_snapshot` is unexpectedly NULL on a barcode pick (`SCAN`/`MANUAL`),
the repository returns `online_orders.barcode_snapshot_unavailable` instead of
masquerading as a wrong-barcode mismatch. Manual entry has the same authority
rule as scan; barcode capture without this explicit pick command performs no
mutation. Live catalogue barcode is never consulted at pick time.

The mutation response returns authoritative order/fulfilment identity, status,
line-completion totals, `CanPack`, new `FulfillmentVersion` and server timestamp.
The canonical client pattern then refetches Picking Detail to obtain the selected
line's latest picked/remaining quantity, complete progress and next pending line.

### Quantity, lifecycle, concurrency and event verification

`FulfillmentOrderLine.Pick` rejects non-positive or over-remaining increments and
prevents repicking a completed line. Picking remains `PICKING`; the final pick
sets `CanPack=true` and appends completion evidence but never sets READY or
Collected. `FulfillmentOrder.RecordPickingMutation` validates the expected
version and increments `FulfillmentOrder.RowVersion` once.

The repository supplies that version as the EF concurrency original value and
maps both application version conflict and `DbUpdateConcurrencyException` to
`online_orders.concurrency_conflict`, exposed by the controller as HTTP 409. A
two-cashier same-version test proves one pick persists, the second conflicts,
final quantity never over-picks, version increments once, and exactly one
`FULFILLMENT_LINE_PICKED` exists. A final required pick also creates exactly one
`FULFILLMENT_PICKING_COMPLETED`; failed barcode/line/version/quantity/permission
paths create zero pick events.

Authenticated `tenantUserId` owns picked actor and event actor. Server clock owns
event/response time. Issue and note remain separate versioned atomic commands;
note requires `commerce.online_order.picking.note` and issue remains line-scoped.

### Database and optional projection result

EF entities/configuration and repository predicates reuse `sales_orders`,
`sales_order_lines`, `fulfillment_orders`, `fulfillment_order_lines`,
`fulfillment_order_events`, inventory reservation/location and pickup authority.
Location comes only from the fulfilment's `SourceInventoryLocationId` joined to
same-tenant/outlet `InventoryLocation.LocationCode/LocationName`. Media uses the
existing optional media lookup. Missing image, variant, SKU or location remains
nullable and does not remove an otherwise valid line.

`dotnet ef migrations has-pending-model-changes` reported no model change. New
table: **NO**. New column: **NO**. Schema change: **NO**. Migration: **NO**.

### Verification evidence

- Solution build: PASS, 0 warnings, 0 errors.
- Focused OO-04 unit/domain/permission tests: **16 passed, 0 failed, 0 skipped**.
- Focused OO-04 repository integration tests after concurrency additions:
  **10 passed, 0 failed, 0 skipped**.
- Focused Click & Collect controller tests: **15 passed, 0 failed, 0 skipped**.
- Full unit suite: **1,524 passed, 0 failed, 0 skipped**.
- Full integration suite: **617 passed, 12 failed, 0 skipped**. The failures are
  unrelated repository-suite/environment failures observed in PostgreSQL test
  harness setup (including `53200: out of shared memory`), existing migration
  fixtures whose temporary schemas lack `unit_of_measures`/`categories`, and a
  tenant-bootstrap expectation that Card payment is absent although the current
  catalogue returns it. The isolated OO-04 repository integration suite passed
  10/10, so no OO-04 focused test failed.
- Real authenticated Development API mutation: **NOT EXECUTED**; no safe
  credentials plus isolated mutable order were used. No Development data was
  changed.
- `git diff --check`: PASS.

Backend files extended:
`PosOnlineOrderPickingService.cs` and `PosOnlineOrderPickingRepository.cs`.
Focused tests extended:
`PosOnlineOrderPickingServiceTests.cs` and
`PosOnlineOrderPickingRepositoryTests.cs`.

Chunk 3 is now ready to implement only the dedicated selected-line Flutter
route/screen, transient verification, explicit submit and responsive UI. Backend
route, DTO, permission and database work is complete.

**OO-04 PICK ITEM â€” CHUNK 2 BACKEND / API / DB COMPLETE**

## Current implementation audit

| Surface | Finding | Classification |
|---|---|---|
| Flutter screen/widgets/provider/navigation | Production OO-04 owner under `lib/features/fulfilment_pickup/` | IMPLEMENTED |
| Flutter entities/repository/datasource | Authoritative GET/pick/issue/note contract and reconciliation | IMPLEMENTED |
| Flutter permission constants | All picking codes exist | IMPLEMENTED |
| Backend staff controller | Canonical picking GET, pick POST and issue POST added to existing owner | IMPLEMENTED |
| Backend picking DTO/service/repository | CustomerOrders service/repository chain | IMPLEMENTED |
| Fulfilment line quantities/actor/status | Existing and reusable | IMPLEMENTED |
| Shared concurrency | `fulfillment_orders.row_version` | IMPLEMENTED |
| Picking events | Pick, issue and completion events persist atomically | IMPLEMENTED |
| Picking note | Existing event authority, dedicated API/permission and bounded retrieval | IMPLEMENTED |

Flutter sends the current `fulfillmentVersion` as `expectedVersion` for every
OO-04 mutation and refetches authoritative Picking Detail after success or 409.

## Functional and business rules

- Show authoritative order/fulfilment identity/status, collection window,
  server-time urgency, assignment, item/unit totals and picked/remaining progress.
- Lines show available image, product, variant/options, SKU/barcode, existing
  location code/name, requested/picked/remaining quantity, issue state and action.
- Only same-tenant, authorized-outlet Click & Collect fulfilment in `PICKING` may
  mutate. Entitlement, assignment, resource scope and permissions are backend-owned.
- Quantity is positive and cannot exceed requested quantity. Duplicate scans
  cannot over-pick. Unknown, unrelated and mismatched barcodes change nothing.
- Fully picked means all required lines have zero remaining quantity. Review &
  Pack additionally requires no backend-defined blocking unresolved issue.
- No fake local success, device-time authority, silent stale overwrite or event
  creation by Flutter.

## Exact permissions

`commerce.online_order.orders.access`, `commerce.online_order.orders.view`,
`commerce.online_order.picking.view`, `commerce.online_order.picking.pick`,
`commerce.online_order.picking.scan`,
`commerce.online_order.picking.manual_entry`, and
`commerce.online_order.picking.report_issue`, and
`commerce.online_order.picking.note`.

Scan-only users see scan, manual-only users see manual, and report-issue absence
removes that action. Permission filtering occurs before layout; backend repeats
all checks and role names never authorize. The seven access/read/picking codes are
registered in the Click & Collect tenant-bootstrap and cashier setup catalogues;
the service independently enforces the operation-specific combinations.

## API matrix

| Capability | Decision |
|---|---|
| Picking detail `GET /orders/{orderId}/picking?outletId=...` | IMPLEMENTED |
| Pick line `POST /orders/{orderId}/picking/lines/{lineId}/pick?outletId=...` | IMPLEMENTED |
| Barcode scan | IMPLEMENTED by pick command with `inputMethod=SCAN` |
| Manual pick | IMPLEMENTED by pick command with `inputMethod=MANUAL` |
| Report issue `POST .../picking/lines/{lineId}/issues?outletId=...` | IMPLEMENTED |
| Picking note `POST .../picking/notes?outletId=...` | IMPLEMENTED; `{ note, expectedVersion }` |
| Review & Pack eligibility | `canPack` backend-derived; pack transition remains OO-06 scope |

Controller ownership remains `ClickCollectOrdersController`; application and
repository ownership remains `ECommerce/CustomerOrders`, reusing the
Fulfilment/Pickup domain. No competing controller is authorized.

## Picking detail contract

Return order/fulfilment IDs and numbers, lifecycle, assignment, outlet/collection
window, `serverTime`, `fulfillmentVersion`, and bounded lines with product/variant
identity, name/options/SKU/barcode/image, requested/picked quantities, line and
issue state, and `locationCode`/`locationName` where resolvable. Counts,
remaining/progress and urgency are derived.

## Concurrency and transaction

Every mutation includes positive `expectedVersion` for
`fulfillment_orders.row_version`; stale state returns 409 and refetches.

Transaction: authenticated context → entitlement → permission → outlet/resource
→ fulfilment/line → `PICKING` → version → barcode/input/quantity → inventory or
reservation validation → quantity/actor/state update → version increment →
event/audit → save/commit. Failure rolls back quantity, version and event.

## Issue, notes and events

The only accepted issue reason is `ITEM_NOT_FOUND`; optional trimmed note is at
most 500 characters. It appends an audit event and increments aggregate version,
but never changes quantity, substitutes, cancels or advances lifecycle. It is
non-blocking for `canPack`; picking must still be completed normally.
Picking-note persistence uses `fulfillment_order_events.event_note` through the
dedicated picking-note command; the Flutter dialog never inserts a local note.

Exact events are `FULFILLMENT_LINE_PICKED`,
`FULFILLMENT_LINE_ISSUE_REPORTED` and, on the final required pick,
`FULFILLMENT_PICKING_COMPLETED`. Notes append
`FULFILLMENT_PICKING_NOTE_ADDED`. Completion does not advance status; OO-04 stays
`PICKING` until the downstream pack command.

## Database decision

| Decision | Result |
|---|---|
| New table | NO |
| New column | NO |
| Migration | NO |
| Aisle/rack/bin | NOT REQUIRED; not authoritative |
| Location authority | `inventory_locations.location_code`, `location_name` |
| Picking-note persistence | Existing fulfilment event authority; IMPLEMENTED |

Reuse sales/fulfilment/pickup/reservation/inventory/product/barcode/media/user
tables. Counts, remaining quantities, progress and time labels are derived.

## Flutter ownership, reuse and layout

Owner: `lib/features/fulfilment_pickup/`; screen → provider → repository → remote
datasource → staff API. Reuse POS shell, backend ThemeData, shared actions,
summary/status/state/image/progress/modal/scanner patterns and design tokens.
Picking composition remains feature-local; no direct Dio widget or new feature root.

Wide layouts use items left and progress/actions right. Shell/header/actions stay
stable where practical; arbitrary-length item list owns bounded scrolling.
Portrait/phone stack vertically without horizontal overflow or different business
logic. Hidden actions reserve no space.

Accessibility requires semantic scan/manual/issue actions, 44px targets,
text-and-colour progress/issue state, logical focus, keyboard support, text scaling
and image fallback semantics. Brand emphasis follows backend ThemeData; semantic
status colours remain independent.

## NFR and states

- Security: auth, tenant, outlet, entitlement, permission, non-disclosing errors,
  no sensitive logs.
- Reliability: one in-flight mutation, atomic quantity/version/event, no over-pick,
  409 refetch, no blind retry.
- Performance: bounded joined projection, batched media/location lookup, indexed
  barcode lookup, no N+1/full inventory scan/polling.
- Observability: correlation, tenant/outlet/order/fulfilment/line, operation,
  non-sensitive match result, old/new quantity/status, result and latency; no
  tokens, payment secrets or unnecessary PII.

Loading, empty/no-lines, denied, not-entitled, wrong outlet, stale 409, unknown or
wrong barcode, over-pick, invalid lifecycle, unresolved issue, network/5xx, all
picked, already advanced and concurrent update are distinct states.

## Backend Chunk 2 completion

Implemented under the existing controller/application/repository/domain ownership:
bounded picking projection, scan/manual increment command, issue audit command,
operation-specific permissions, entitlement and outlet scope, positive
`expectedVersion`, EF concurrency-to-409 mapping, atomic events, over-pick and
barcode rejection, and derived `canPack`. Automated domain/service/controller and
repository integration coverage proves the core permission, lifecycle, version,
rollback, event and projection contracts. Authenticated Development PostgreSQL
runtime evidence remains not executed; this is acceptance evidence rather than an
unimplemented backend contract.

Picking Note requires `commerce.online_order.picking.note`, PICKING lifecycle,
trimmed 1–500-character plain text and a current positive `expectedVersion`.
Success persists exactly one event in `fulfillment_order_events.event_note`,
increments `row_version`, and returns the saved note, authenticated author,
server timestamp and new version. Picking Detail returns at most the latest 50
notes in oldest-to-newest order. Notes do not alter quantities, lifecycle or
`canPack`. No competing controller, table, column or migration.

## Flutter Chunk 3 exact scope

Reconcile scaffolding to actual DTOs; send `expectedVersion`; render OO-04;
permission-filter scan/manual/issue; show authoritative progress/location/issues
and pack eligibility; lock duplicate mutations; refetch 409; permission-gate the
shared Add Picking Note modal, validate/send note with current expectedVersion,
and show it only after backend success; on 409 close/no fake success and refetch;
reuse shared components/ThemeData; add responsive/accessibility/provider/widget
tests and authenticated device E2E.

## Flutter Chunk 3 completion evidence

The production implementation remains in the canonical
`lib/features/fulfilment_pickup/` feature. Picking Detail supplies the order
header, server-time urgency, metrics, lines, product media, location, progress,
issues, notes, aggregate version and backend `canPack`. The wide workspace uses
the approved item-list/sidebar composition; narrower viewports stack the same
business controls. The existing POS header, footer and OO-05 navigation boundary
remain unchanged.

Scan, manual pick, issue and note controls are filtered by their exact permission
codes before layout. Pick and issue commands send the current aggregate version;
the note command validates trimmed required plain text with a 500-character
maximum and also sends that version. A single mutation lock prevents duplicate
submits. Successful commands refetch Picking Detail; a 409 also refetches, shows
safe conflict feedback, and never applies an optimistic quantity, issue or note.
Review & Pack is enabled only by response field `canPack`, never by a client-side
all-picked calculation.

Product images use the shared cached network-image owner with loading/error/missing
fallbacks. Location renders only authoritative `locationCode` and `locationName`;
no aisle, rack or bin is invented. Brand emphasis comes from ThemeData while
progress retains labelled text counts so meaning is not colour-only. Loading,
empty, denied and error states remain explicit.

Verification on 2026-09-02:

- `flutter analyze`: PASS, no issues.
- Focused online-order model/component/permission/responsive suite: 51 passed,
  0 failed.
- Full Flutter suite: 1,449 passed, 0 failed, 1 pre-existing intentional physical
  Local Print Agent acceptance skip.
- Responsive widget coverage: desktop, tablet landscape, tablet portrait, phone
  and small phone, all without reported overflow.
- Authenticated runtime and stale-409 runtime: NOT EXECUTED because safe
  credentials and isolated mutable test-order evidence were unavailable.
- Target runtime screenshot: NOT CAPTURED; automated layout comparison and code
  inspection completed, so pixel-level visual acceptance remains a runtime gap.

Chunk 3 changed no backend code, database schema or migration. No reusable owner
was added: existing shell, cached-image, modal, primary-action, state and theme
owners were reused; OO-04 composition stays feature-local.

## Contradictions resolved

- Flutter scaffolding is not backend/runtime completion.
- Generic status PATCH is not a picking command.
- Client `allPicked` is display assistance, not transition authority.
- Screenshot aisle/rack/bin values create no schema.
- Hardcoded orange, role checks and local picked success are forbidden.
- Enabled picking-note placeholder is not production-authorized.

Chunk 2 changes backend application code and tests plus canonical documentation.
Flutter, database schema and migrations are unchanged; no commit or push.

## Final fixed-landscape layout correction — 2026-09-02

The OO-04 tablet-landscape center body now uses a height-aware fixed composition
between the unchanged POS header and footer. The header and 4-part metric strip
are compact, the workspace uses an approximately 64/36 split, and the approved
three-line scenario renders all three compact item cards plus the scanner without
a `ListView` or whole-body scrolling. More-than-three-line handling retains the
existing bounded list behavior so production data is never silently truncated.

The right column no longer scrolls. It always composes Order Progress, Picking
Tips, permission-filtered Add Picking Note, the shared Review & Pack action, and
its helper within the available landscape height. Review & Pack remains visible
and disabled when backend `canPack` is false. The progress ring has a bounded
readable diameter and independent center text, and Remaining uses a compact
duration value plus its single-line label. The report-issue control no longer
looks like an authoritative warning for an ordinary pending line; error styling
is reserved for `hasReportedIssue`. Location continues to render only the
authoritative `locationName` and `locationCode`.

Static inspection found no hardcoded target order/product/location data, primary
hex colour, fake aisle/rack/bin, role check, direct API call, or landscape
whole-body/sidebar scroll. Focused widget coverage was added for the complete
permission-enabled sidebar and the fixed three-line/scanner composition.

Validation used the Flutter SDK executable directly because the normal Windows
launcher stalled in the local execution verifier. `flutter analyze` passed with
no issues; the complete online-orders suite passed 66/66; and the full Flutter
suite passed 1,451 tests with the one pre-existing intentional physical Local
Print Agent test skipped. A connected Android/ADB target was not exposed to this
execution environment, so a post-change physical runtime screenshot could not be
captured and pixel-level device comparison remains pending. No backend, database,
migration, POS header, or POS footer was changed by this layout correction.

## Development seed prerequisite repair — 2026-09-02

The Development order `ECOMM-SEED-ACCEPTED-001` previously seeded only its
sales-order header/line and status history. Consequently OO-02 correctly returned
no fulfilment identity/version and OO-03 correctly blocked Start rather than
bypassing positive `expectedVersion` concurrency.

`DevelopmentClickCollectOrderStatusSeedData` now idempotently reconciles the
Development-only operational graph for that order: one pre-start `PENDING`
fulfilment with `row_version = 1`, its unpicked fulfilment line, an `OPEN` pickup
slot on the existing Click & Collect method/outlet, a `CONFIRMED` slot
reservation, `PENDING` pickup order, and a `CONFIRMED` unexpired inventory
reservation with a fully reserved line. Stable Development IDs plus natural-key
`NOT EXISTS` checks prevent duplicate aggregates and dependent rows while still
repairing an already-existing partial sales order. Existing method/outlet,
inventory-location, product, variant, sales-order and customer authorities are
reused; no aisle/rack/bin data is invented.

This repair changes no production business rule, API, Flutter guard, table,
column or migration. Source build and seed-contract tests pass. Execution against
the configured Development PostgreSQL database, Detail API verification and
Start/409/OO-04 runtime proof remain **NOT EXECUTED** because database-mutation
approval was unavailable; therefore runtime unblocking is not yet claimed.

## Development runtime acceptance attempt — 2026-09-02

The canonical Development startup was executed with both ASP.NET Core and .NET
environments set to `Development`. The backend built successfully, ran its normal
migration/seed startup path, and listened on `http://0.0.0.0:5150`. Read-only
inspection of the configured Development PostgreSQL database then found exactly
one `ECOMM-SEED-ACCEPTED-001` sales order at outlet
`bbbbbbbb-0001-4000-8000-000000000001`, but found zero associated
`fulfillment_orders`, fulfillment lines, pickup-slot reservations, inventory
reservations and `FULFILLMENT_STARTED` events.

Runtime acceptance is therefore **BLOCKED** before Detail, Start, stale-version
409 and OO-04 Picking Detail verification. The source helper is referenced by the
already-applied `20260803082903_AlignClickCollectOrderStatusesAndSeedDevelopmentOrders`
migration (and the OneVerze migration variant); EF does not rerun an applied
migration merely because its referenced helper source later changes. The normal
startup path consequently did not reconcile the new operational graph into this
existing Development database. No direct SQL repair, migration, application-code
change, concurrency bypass or API mutation was performed during this acceptance
attempt. A canonical mechanism that applies the idempotent repair to databases
where the original migration is already recorded is still required before the
runtime-unblocked claim can be made.

## Development seed reconciliation closure — 2026-09-02

The blocker above is resolved. Git history confirmed that
`20260803082903_AlignClickCollectOrderStatusesAndSeedDevelopmentOrders` originally
used `DevelopmentClickCollectOrderStatusSeedData` only for sales-order headers,
lines and status history. Adding the operational graph to that mutable helper
changed what a fresh database would execute under the historical migration ID,
while an existing database would not rerun it. The helper has therefore been
restored to its shipped responsibility.

Forward migration
`20260902095031_RepairDevelopmentClickCollectFulfillmentSeedPrerequisites` owns an
immutable, schema-neutral data-repair payload. It executes only when the exact
Development tenant `55555555-0000-4000-8000-000000000001`, sales order
`e0000101-0003-4000-8000-000000000001`, order number
`ECOMM-SEED-ACCEPTED-001`, and outlet
`bbbbbbbb-0001-4000-8000-000000000001` agree. Missing graph segments are added
with deterministic IDs and `NOT EXISTS`; existing lifecycle, row version, picked
quantities and operational events are never reset. Ownership or deterministic-ID
collisions fail explicitly. Absence of the exact Development identity is a no-op.
`Down` is intentionally non-destructive because repaired rows may subsequently
enter an operational lifecycle. No table, column, index, constraint or model
snapshot changed.

Configured Development PostgreSQL upgrade evidence:

- historical migration record count: 1;
- repair migration record count: 1;
- initial repaired fulfilment: exactly 1, ID
  `e0000104-0003-4000-8000-000000000001`, `PENDING`, row version 1;
- fulfilment lines: 1, requested 1, picked 0;
- pickup reservation: exactly 1, `CONFIRMED`, slot/method chain resolves to the
  required outlet;
- inventory reservation and line: exactly 1 each, `CONFIRMED`, future expiry,
  requested/reserved quantity 1;
- tenant and outlet mismatch counts: 0;
- executing the repair payload again: PASS with the same aggregate counts and
  without changing the already-started lifecycle/version/event;
- exact-seed-identity-absent no-op is enforced and covered by static contract
  tests; isolated migrations-from-zero database execution was not available.

Authenticated runtime evidence against `http://0.0.0.0:5150`:

- Detail: HTTP 200, fulfilment ID
  `e0000104-0003-4000-8000-000000000001`, version 1;
- Start with expected version 1: HTTP 200, `PENDING → PICKING`, version `1 → 2`,
  assigned user `99999999-0003-4000-8000-000000000001`;
- `FULFILLMENT_STARTED`: exactly one event after Start;
- repeated Start with stale expected version 1: HTTP 409, lifecycle/version remain
  `PICKING`/2, event delta 0;
- OO-04 Picking Detail: HTTP 200, `PICKING`, current version 2, one `Match Shorts`
  line with requested 1/picked 0, authoritative location code `MAIN`, and
  `canPack = false`.

Focused data-repair/OO-02/OO-03/OO-04 tests passed 83/83 (50 unit, 15 API,
18 integration). Solution build passed with 0 errors and 0 warnings. The backend
runtime proves the Flutter missing-version guard is no longer reached for this
order. Automated HTTP navigation reached the same OO-04 state; physical Flutter
tap-path acceptance was not executed. No Flutter source, database schema, or
unrelated local configuration/migration was changed by this repair.

## Final center-only visual alignment — 2026-09-02

The unchanged POS header/footer now frame a fixed, non-scrollable OO-04 center
composition. A single height-derived feature sizing model coordinates the 64/36
workspace, title/metadata hierarchy, four semantic metrics, stepper, line cards,
product image, scanner, progress ring/legend, tips, permission-filtered note row,
shared Review & Pack action and helper. Theme-owned
`surfaceContainerLowest` provides the neutral card surface; selected lines use
only a subtle primary tint. Pending lines no longer display a false warning or
ellipsis action, and location remains limited to authoritative name/code.

The automated 3-line, permission-enabled landscape fixture renders all three
lines, scanner, Add Picking Note, progress/tips, disabled Review & Pack and helper
in one viewport with no `ListView`, whole-body scroll or overflow. The real Pixel
Tablet run of `ECOMM-SEED-ACCEPTED-001` also fits in one viewport. The authenticated
Kavin session did not contain `commerce.online_order.picking.note`, so the note
row correctly hid and reflowed; the permission-enabled widget fixture proves the
same row is visible when granted. No permission bypass was introduced.

Runtime target comparison found no remaining material center-layout difference
after correcting a fractional Location-badge overflow. Final screenshot:
`C:\Users\User\Downloads\EPOS\oo04-final-runtime.png`. Header/footer, backend,
database and migrations were unchanged by this final pass.

## Multi-order functional diagnosis — 2026-09-02

The reported "only one order works" symptom was reproduced as a Development
data-shape difference, not as an OO-04 query shortcut. The original forward
repair migration built the required fulfilment, fulfilment-line, confirmed
pickup reservation, pickup order, confirmed inventory reservation and inventory
reservation-line graph only for `ECOMM-SEED-ACCEPTED-001`. Equivalent accepted
orders `ECOMM-SEED-ACCEPTED-002` and `ECOMM-SEED-ACCEPTED-003` therefore had a
queue/detail sales-order row but no positive fulfilment identity/version, so
OO-03 correctly blocked Start and OO-04 had no authoritative aggregate to load.

The same migration now reconciles the two additional accepted Development
fixtures through the same tenant/outlet/method ownership chain and creates only
missing rows. No table, column, index, constraint, model mapping or production
order query changed. Terminal `COLLECTED`/`COMPLETED` fixtures remain expected
business-rule rejections and are not made pickable.

The frontend remains route/order-ID scoped (`FutureProvider.autoDispose.family`)
for OO-04. Detail selection additionally uses a monotonically increasing request
generation and clears a previous order while a different order loads, so a
repository/client that does not honour cancellation cannot let a delayed Order A
response overwrite the currently requested Order B. A focused regression test
covers that race and asserts Order B identity, number and version remain current.

Local Infrastructure compilation and the six focused seed-contract tests passed.
The updated idempotent payload was applied to the configured Development database
without restarting the already-running backend/frontend processes. Runtime then
exposed the second ownership defect: GoRouter reused the stateful OO-02 route
element when its path parameter changed, while the route screen loaded only in
`initState`. Consequently selecting another queue row could keep the previous
order and its previous error/version state. The route screen now reloads when
`widget.orderId` changes, and the provider request-generation guard prevents an
older response from winning the race. A rebuilt/hot-reloaded client and final
physical A → B → C acceptance are still required before this section is treated
as final multi-order runtime acceptance.

## Final Runtime Acceptance — 2026-09-03

The rebuilt Pixel Tablet client and the running Development backend communicated
successfully with the authenticated Kavin tenant/outlet context. The earlier
"latest fulfilment version is unavailable" observation was a service/session
availability symptom; it did not appear for healthy Accepted-001, Accepted-002,
or Accepted-003 during this final run.

Physical Accepted-001 → Accepted-002 → Accepted-003 navigation rendered the
correct order number, authoritative order data, product/SKU, quantities and
current fulfilment state for each route with no previous-order leakage. This
validates the route `didUpdateWidget` reload in the rebuilt client. The focused
delayed-response regression also passed, validating the request-generation guard
that prevents an older response from overwriting the current order.

All three Accepted fixtures resolved to independent OO-04 picking workspaces.
Accepted-003 was exercised through a real manual-pick mutation: authoritative
progress changed from 0/1 to 1/1, remaining changed to zero, the progress ring
reached 100%, and Review & Pack changed from disabled to enabled. Completed-001
remained terminal and exposed neither Start Fulfilment nor Continue Picking.
Canonical Start/OO-03 mutation, cancel/idempotency and granular-permission
behaviour remain covered by the passing focused suite. Kavin's missing
`commerce.online_order.picking.note` permission continued to hide the note row
without leaving a layout gap.

The approved fixed, non-scrollable tablet-landscape composition, unchanged POS
header/footer, 64/36 workspace, semantic cards, scanner, progress/tips and action
layout were preserved. Orange-like and Pink-like theme fixtures and desktop,
tablet portrait/landscape, phone and small-phone responsive fixtures passed.

Final validation evidence:

- `flutter analyze --no-pub`: PASS, no issues;
- focused Online Orders Flutter tests: 68 passed, 0 failed;
- full Flutter tests: 1,453 passed, 0 failed, 1 intentionally skipped;
- focused Development seed-repair contract tests: 6 passed, 0 failed;
- `git diff --check`: PASS across frontend, backend and Second Brain repositories;
- backend application source changed during this final verification: NO;
- database schema changed: NO;
- new migration created: NO;
- commit/push: not performed.

Overall status: **OO-04 FINAL RUNTIME ACCEPTANCE COMPLETE**.

## CHUNK 3 — OO-04B Flutter implementation and final acceptance

Status: **OO-04B CHUNK 3 IMPLEMENTED — RUNTIME ACCEPTANCE PENDING**.

The selected-line workspace is implemented at
`lib/features/fulfilment_pickup/presentation/screens/pos_pick_item_screen.dart`,
with the responsibility-focused composition in
`presentation/widgets/picking/pick_item_workspace.dart`. Existing OO-04 item
cards now route with authoritative `orderId` and `lineId` to
`/pos/online-orders/:orderId/picking/lines/:lineId`. Route identity changes reset
verified barcode and quantity state; the order-scoped provider remains the only
detail authority.

The implementation reuses the existing picking provider, repository, remote
data source and backend endpoints. It also reuses the cached product-image,
status-chip, picking metrics/card decoration, issue dialog and primary-action
owners. No duplicate API, repository, shared button or feature folder was
created. Screen composition is feature-local.

Scan and manual entry normalize and validate the selected line's authoritative
barcode before enabling confirmation. Verification alone never mutates picked
quantity. `Mark as Picked` sends the selected order/line, explicit bounded
quantity, input method and current `fulfillmentVersion`; the existing mutation
owner prevents duplicate submission and refreshes authoritative detail after
success or HTTP 409. Wrong/empty/other-item barcode remains local rejected input
with no optimistic quantity or progress change.

Quantity starts at one, cannot fall below one or exceed authoritative remaining
quantity, and fully picked lines cannot submit. The right panel renders unit
progress, non-overlapping progress ring/legend, current-order pending lines,
permission-reflowing Can't Find Item, next-line routing and the existing Review
& Pack relationship. Final picking does not mark the order Ready.

Tablet landscape uses a fixed, non-scrolling two-column center viewport with no
internal target scroll. Narrow layouts use the existing responsive stacked page
strategy. Brand accents use `ThemeData.colorScheme`; success/error remain
semantic. Product/location/image/customer/order values come only from the
backend, and missing image/location have safe states. No reference-screen sample
data is present in production source.

Static analysis of all changed production files reports **No issues found**.
The Dart command then exits non-zero only because the sandbox denies writing the
global Dart telemetry session file. Flutter widget-test startup repeatedly
stalled without test-runner output in this environment, so focused/full test
counts and real authenticated Development mutation/DB reflection are not
claimed. Runtime acceptance therefore remains pending rather than complete.

Backend source changed during Chunk 3: **NO**. Database schema changed: **NO**.
Migration created: **NO**. Commit/push: **NOT PERFORMED**.

## OO-04B Tablet-Landscape Non-Scrollable Layout Fit & Final Acceptance — 2026-09-08

Status: **OO-04B FIXED NON-SCROLLABLE TABLET TARGET ALIGNMENT COMPLETE**.

### 1. Problem Identification and Visual Root Causes

On the target tablet-landscape viewport (e.g., Pixel Tablet 1280×800 / 1180×820 / 1100×700), the OO-04B Pick Item / Barcode Verification screen exhibited severe RenderFlex vertical overflows:
1. **Scanner Section Overflow (64px)**: Hardcoded 150px height scanner box with 48px icon and 18px heading overflowed within available card height.
2. **Bottom Quantity/Action Card Overflow (158px)**: Proportional row allocated `flex: 1` each to the "Picked" and "Remaining" metric columns, giving only ~11.4px of width. This forced the words "Picked" and "Remaining" to wrap vertically character-by-character. Additionally, rigid 128px container height and unconstrained 48px hit-target padding on `IconButton.filledTonal` triggered a 158px vertical RenderFlex overflow.
3. **Right Order Panel Overflow (27px)**: Large 90×90 circular progress ring, 22px vertical dividers, 14px container padding, and an expanded empty Next Items list pushed the "Pick Next Item" button behind the persistent bottom navigation footer.

### 2. Layout Compaction Architecture (Strictly Non-Scrollable)

In strict adherence to the non-negotiable constraint that scrolling (whole-page, center-content, or internal card) is forbidden:
- **Top Metrics Strip**: Added `compact: true` mode to `PickingProgressMetrics` (`minHeight: 50, maxHeight: 56`, circle avatar radius 12, icon size 13, value 13px w800, label 10px). Non-compact mode is preserved untouched for other screens.
- **Header**: Compacted back button (`VisualDensity.compact`, 13px font), title (`titleMedium` ~18px w800), and chip (`VisualDensity.compact`, 11px font).
- **Scanner Panel**: Container height compacted to 80px (with 30px icon and 13px label), heading 15px w800, subtitle 11px, compact OR divider, and compact manual button.
- **Product Panel**: Container padding reduced to 8px, `AppCachedNetworkImage` configured with `BoxFit.contain` and 44px error icon, location row compacted to single-line with 15px icon and 11px text.
- **Bottom Quantity/Action Strip**: Container height reduced to 84px. Proportional flex allocated `28 / 18 / 20 / 34`. "Picked" and "Remaining" metrics in `_ValueBlock` render as normal single-line horizontal text (`unit` subtitle). Quantity buttons wrapped with `shrinkWrap` style (`minimumSize: Size(28, 28)`) eliminating 48px hit-target inflation. `PosPrimaryActionButton` given `compact: true`, `minimumHeight: 44`, `verticalPadding: 8`.
- **Right Order Panel**: Container padding reduced to 10px, dividers reduced to 12px, circular progress ring compacted to 66×66 with `strokeWidth: 6` and two-line non-overlapping center (`12px` value + `10px` 'Picked'), compact 1.5px legend rows, collapsed Next Items empty state (`No other pending items`) when `pending.isEmpty`, compact 32px Next Item tiles when populated, `Spacer()` to absorb remaining space, compact Can't Find Item button (12px font), and compact bottom CTA (40px).

### 3. Verification and Evidence

1. **Pixel Tablet Live Runtime (`emulator-5554`)**:
   - Screenshot captured: `oo04b-fixed-runtime.png`.
   - RenderFlex overflow stripes: **NONE (0px)**.
   - Whole-page scroll: **NONE**.
   - Center-content scroll: **NONE**.
   - Internal card scroll: **NONE**.
   - Clipping: **NONE**.
   - All controls visible in **ONE tablet-landscape viewport** above the footer.
   - POS Header and Footer: **UNCHANGED**.
   - Labels "Picked" and "Remaining": Normal horizontal text with single line.
   - Progress ring: Compact, two-line non-overlapping center.
   - Next items empty state: Collapsed naturally.
2. **Automated Test Suite**:
   - `test/features/online_orders/pos_pick_item_workspace_test.dart`: 10 passed, 0 failed (including 1280×800, 1180×820, 1100×700 responsive viewport tests, empty state collapse, and extreme long strings).
   - `test/features/online_orders/picking_layout_overflow_test.dart`: 5 passed, 0 failed.
   - `test/features/online_orders`: 83 passed, 0 failed.
3. **Static Analysis & Hygiene**:
   - `flutter analyze`: **No issues found!** (ran in 95.1s across entire app, and 6.3s on modified files).
   - `git diff --check`: **PASS** (zero trailing whitespace, zero EOF errors).
4. **Locked Boundaries Maintained**:
   - POS top header / till session / outlet selector / till selector / notification area: **UNCHANGED**.
   - POS bottom navigation / footer: **UNCHANGED**.
   - Route / business logic / barcode verification logic / quantity logic: **UNCHANGED**.
   - Permissions / security checks: **UNCHANGED**.
   - Backend source, database schema, migrations: **UNCHANGED**.
   - Git commits / pushes: **NOT PERFORMED**.

## OO-04B Manual Barcode Lifecycle Crash Fix — 2026-09-08

Status: **OO-04B MANUAL BARCODE DEPENDENCY LIFECYCLE CRASH FIX COMPLETE**.

### Symptom

1. Open OO-04B Pick Item.
2. Tap **Enter Barcode Manually**.
3. Type a numeric barcode.
4. Submit / Verify.
5. Flutter red screen with:

`package:flutter/src/widgets/framework.dart`
`Failed assertion: line 6268 pos 12: '_dependents.isEmpty': is not true.`

Crash timing: **on submit / dialog close**, not while typing alone. Cascade observed
in reproduction: disposed `TextEditingController` use → RenderObject `attached`
assertion → InheritedElement `_dependents.isEmpty`.

### Exact Root Cause

| Item | Detail |
|---|---|
| Owner | `_PosPickItemScreenState._captureBarcode` in `pos_pick_item_screen.dart` |
| Pattern | Caller created `TextEditingController()`, passed it into `showDialog` `TextField`, then called `controller.dispose()` **immediately** after `await showDialog` returned |
| Why | `showDialog` / route `pop` completes the Future in `didPop` **before** the dialog exit animation finishes and before the `TextField`/`EditableText` subtree is deactivated |
| Why `_dependents.isEmpty` | Disposing the controller while `EditableText` is still mounted corrupts the element tree during subsequent rebuild/deactivate; InheritedElements then deactivate while dependents remain registered |

Evidence: isolated widget reproduction of the same dispose-after-`showDialog` pattern produced the identical `_dependents.isEmpty` assertion (plus the preceding disposed-controller assertion).

### Fix

| Change | Detail |
|---|---|
| New | `pick_item_barcode_entry_dialog.dart` — Stateful dialog owns `TextEditingController`; dispose only in `State.dispose()` after unmount |
| Modal | Uses existing `showAppDialog` (same ownership pattern as `ReportPickingIssueDialog`) |
| Screen | `_captureBarcode` awaits dialog result, then validates selected-line barcode; no caller-owned controller |
| Business | Unchanged — local selected-line barcode match; `MANUAL`/`SCAN` still only via Mark as Picked; permissions unchanged |

### Why correct

`State.dispose()` runs after the dialog widget is removed from the tree, so
`EditableText` has already unregistered InheritedWidget dependents before the
controller is disposed. No delay hacks, no swallowed errors, no Flutter SDK change.

### Validation

| Check | Result |
|---|---|
| Manual open / type / cancel / empty / invalid / valid / reopen | PASS (focused tests) |
| `_dependents.isEmpty` after fix | NONE |
| Red exception screen | NONE (automated) |
| 500 / 409 after Mark as Picked | PASS (screen stays stable) |
| Manual permission gate | PASS |
| OO-04B tablet layout tests | PASS (unchanged) |
| Backend / DB / migration | NO |

Generic lifecycle rule added to [[Frontend_Engineering_Canonical_Standard]].

## OO-04B Manual Barcode Live Runtime Acceptance — 2026-09-08

Status: **OO-04B MANUAL BARCODE LIVE RUNTIME ACCEPTANCE COMPLETE**.

Live smoke on the already-running Development POS session (no Flutter/API restart).
Source ownership matches the documented fix (`PickItemBarcodeEntryDialog` owns
`TextEditingController`; `_captureBarcode` awaits result only). No Flutter source
changed during this acceptance pass.

| Check | Result |
|---|---|
| Frontend running | YES (`com.nytroz.pos.nytroz_pos` focused on emulator-5554) |
| Backend running | YES (`E_POS.Api.dll` / port 5150) |
| Device | Pixel Tablet emulator, physical 2560×1600 (logical 1280×800 landscape) |
| Order / line | `ECOMM-SEED-ACCEPTED-002` / Pick: Training Basketball (1 of 1) |
| Manual dialog open | PASS |
| Numeric typing | PASS |
| Cancel | PASS |
| Reopen | PASS |
| Empty submit | PASS (safe mismatch; no crash) |
| Invalid barcode `WRONGBARCODE999` | PASS (mismatch; Mark as Picked remains inactive) |
| Valid barcode | NOT EXECUTED (no safe authoritative barcode used; not fabricated) |
| Repeated open→type→cancel ×3 | PASS |
| Line switch | NOT APPLICABLE (single line) |
| Back to Pick Items → reopen item → manual barcode | PASS |
| `_dependents.isEmpty` / controller-after-dispose | NONE (logcat 0 matches) |
| Red Flutter screen | NONE |
| Tablet non-scrollable layout | PASS (no overflow stripes observed) |
| Header / footer | UNCHANGED |
| Screenshots | `Pos Frontend/Nytroz-POS-App/test_evidence/oo04b_manual_barcode/oo04b-manual-barcode-before.png`, `oo04b-manual-barcode-dialog.png`, `oo04b-manual-barcode-after.png` |
| flutter analyze (owners) | No issues found |
| Focused lifecycle tests | 11 passed / 0 failed |
| OO-04B workspace + lifecycle | 21 passed / 0 failed |
| `test/features/online_orders/` | 94 passed / 0 failed |
| Backend / DB / migration | NO |
| Flutter source this pass | NO |
| Commit / push | NOT PERFORMED |

## OO-04B barcode snapshot integrity + Development seed repair — 2026-09-08

Status: **ORDER-LINE BARCODE SNAPSHOT PRODUCTION CONTRACT FIXED**.

### Incident
- Development order `ECOMM-SEED-ACCEPTED-002` / SKU `MER-012-SKU` had
  `sales_order_lines.barcode_snapshot = NULL`.
- Catalogue primary barcode `2000000001210` was correctly rejected by OO-04B
  because verification authority is `SalesOrderLine.BarcodeSnapshot`, not live
  catalogue.

### Root cause
1. Production: `SalesOrderLine.CreateForClickAndCollect` omitted
   `BarcodeSnapshot`; `StorefrontCheckoutConfirmationRepository.ConfirmAsync`
   never loaded primary `product_barcodes`.
2. Development seed: `DevelopmentClickCollectOrderStatusSeedData` inserted lines
   with `sku_snapshot` but without `barcode_snapshot`. Repair migration
   `RepairDevelopmentClickCollectFulfillmentSeedPrerequisites` fixed fulfilment
   graph only and never backfilled barcodes.

### Production fix
- Capture tenant-scoped primary barcode into `BarcodeSnapshot` inside the same
  confirm transaction as order/line create.
- Reject confirm with `storefront_checkout.barcode_unavailable` when primary
  barcode cannot be resolved unambiguously.
- OO-04B: NULL snapshot → `online_orders.barcode_snapshot_unavailable`; mismatch
  remains `online_orders.invalid_barcode`. No live catalogue fallback.

### Development repair
- Generalized fixture repair
  `20260908180000_RepairDevelopmentClickCollectBarcodeSnapshots` /
  `DevelopmentClickCollectBarcodeSnapshotRepairSeedData` updates NULL snapshots
  for `ECOMM-SEED-%` / `OVZ-ECOMM-SEED-%` when exactly one primary variant
  barcode exists. No single-order hardcode.

### Historical policy
Do not blindly backfill non-fixture historical NULL snapshots from current
catalogue. Repair only when order-time product/variant mapping is authoritative
and unambiguous; otherwise retain history and surface verification unavailable.

## Barcode Snapshot Production Contract — Final Live Runtime Acceptance

Status: **ONLINE ORDER BARCODE SNAPSHOT PRODUCTION CONTRACT + OO-04B END-TO-END FIX COMPLETE**

| Item | Result |
|---|---|
| Frontend running | YES (`com.nytroz.pos.nytroz_pos` on emulator-5554) |
| Backend running | YES (`http://localhost:5150`) |
| Device | Pixel Tablet emulator, physical 2560×1600 (logical 1280×800 landscape) |
| Order | `ECOMM-SEED-ACCEPTED-002` |
| SKU | `MER-012-SKU` / Training Basketball |
| DB `barcode_snapshot` before runtime | `2000000001210` |
| Correct barcode used | `2000000001210` |
| Correct barcode accepted | PASS |
| Mark as Picked | PASS |
| Picked quantity | 0 → 1 |
| Remaining quantity | 1 → 0 |
| Progress | 0/1 → 1/1 |
| `FulfillmentOrder.RowVersion` | 2 → 3 |
| DB line status | PENDING → PICKED |
| Pick event | exactly one `FULFILLMENT_LINE_PICKED` |
| Final-line completed event | one `FULFILLMENT_PICKING_COMPLETED` (expected, not duplicate line-pick) |
| Wrong barcode | `WRONGBARCODE999` on `ECOMM-SEED-ACCEPTED-001` |
| Wrong barcode rejection | PASS (UI: "Barcode does not match the selected item.") |
| Wrong barcode mutations | NONE (`Accepted-001` remained picked=0, version=2) |
| Live catalogue fallback | NONE |
| Snapshot authority | confirmed (`SalesOrderLine.BarcodeSnapshot`) |
| NULL snapshot runtime | NOT EXECUTED (no safe NULL pickable fixture) |
| Immutable snapshot authority | PASS BY AUTOMATED TEST |
| Second repaired order | `ECOMM-SEED-ACCEPTED-001` snapshot `2000000000312` (verification-only) |
| Previous-order leakage | NONE |
| 409 runtime | NOT EXECUTED (existing automated coverage) |
| Tablet non-scrollable / overflow | PASS / NONE |
| Red Flutter screen / lifecycle errors | NONE (logcat 0) |
| Screenshots | `Pos Frontend/Nytroz-POS-App/test_evidence/oo04b_barcode_snapshot/before.png`, `correct-barcode-dialog.png`, `after-success.png`, `wrong-barcode.png` |
| Backend/Flutter source changed this runtime task | NO |
| Remaining blockers | NONE |
| Commit / push | NOT PERFORMED |
