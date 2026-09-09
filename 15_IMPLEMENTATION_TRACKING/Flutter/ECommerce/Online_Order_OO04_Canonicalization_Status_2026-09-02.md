# OO-04 Online Order Picking Canonicalization Status — 2026-09-02

Status: **CHUNK 3 FLUTTER PRODUCTION IMPLEMENTED AND AUTOMATED-VERIFIED**

## Scope

OO-04 begins only after OO-03 returns authoritative `PICKING`. It owns operational
line picking, scan/manual confirmation, progress, issue reporting and eligibility
to enter Review & Pack. OO-04 owns picking interactions; OO-05 owns Review & Pack
and OO-06 owns the subsequent ready-for-collection boundary.

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
