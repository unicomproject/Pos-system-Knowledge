# Online Order OO-02 Canonicalization Status — 2026-08-31

## 1. Scope and result

Chunk 1 canonicalizes **OO-02 Online Order Detail / Start Fulfilment** only. It changes Second Brain documentation, not Flutter, backend, database, migrations, tests, commits or remotes.

**Result: PASS — canonical contract complete; IMPLEMENTATION / E2E NOT ACCEPTED.**

OO-01 is the entry. OO-02 is a side-effect-free detail screen. OO-03 owns confirmation, and the confirmed start command moves an eligible fulfilment to OO-04 Picking only after backend success.

## 2. Authority chain read

- `00_START_HERE/Current_Source_Of_Truth.md`
- `01_RELEASE_SCOPE/ONEVERZ_RELEASE_1_SCOPE_LOCK.md`
- frontend/backend engineering standards, reusable governance and development workflows
- `POS-UJ-036_Online_Order_Fulfilment_Collection.md`
- Fulfilment/Pickup functional rules and technical contract
- permission list, API endpoint register and relevant database table authorities
- Online Order prototype flow, component, visual, UI/API and UI/DB mappings
- Flutter Click & Collect ownership authority and OO-01 acceptance tracker

## 3. Approved screen and journey decision

```text
OO-01 queue
  → GET authoritative detail
OO-02 read-only detail
  → select Start Fulfilment (no request)
OO-03 confirmation
  → POST atomic start
  → refresh detail + queue
OO-04 picking (success only)
```

Back returns to OO-01. View Details is non-mutating. Cancel closes OO-03 and leaves OO-02 unchanged. A failed/conflicting command never navigates to OO-04.

## 4. OO-02 visual/content contract

- Shared POS shell/header/bottom navigation are reused and remain outside feature content ownership.
- Header: authoritative order number, textual display status, placed/source/customer classification only when supplied.
- Summary: collection outlet/window/remaining-or-overdue presentation; payment status/currency/total/paid/balance; line and unit counts.
- Lines: product, optional image/fallback, variant/options, SKU/barcode when allowed, ordered quantity, price/line total when supplied.
- Each line uses its own ordered quantity. Repeating an order-level `items to pick` value per line is prohibited.
- Picking progress is deferred to OO-04 unless the detail API provides an authoritative line-progress field.
- Guest/anonymous is not inferred from null customer data.

## 5. Responsive and accessibility contract

| Viewport | Required behaviour |
|---|---|
| Desktop | Constrained readable workspace; grouped summaries; bounded line area; stable actions |
| Tablet landscape | Wide grouped summaries and line list without horizontal clipping |
| Tablet portrait | Summary groups and content stack in reading order; vertical scroll |
| Phone | Single column; dialog becomes bottom sheet where appropriate; reachable actions; no overflow |

Minimum touch target is 44 logical pixels. Focus follows reading order. Status/warning/payment meaning uses text, not colour alone. Images have meaningful semantics or are decorative. Loading/error changes are announced accessibly.

## 6. Permission and entitlement contract

| Operation | Required authority |
|---|---|
| Read OO-02 | `commerce.online_order.orders.access` + `commerce.online_order.orders.view` |
| Enable/submit start | `commerce.online_order.fulfilment.start` plus effective access context |
| Enter OO-04 | canonical picking view/action permissions as applicable |

Every backend operation also validates authenticated tenant staff, active tenant/user/outlet, `click_collect` entitlement, tenant ownership and outlet/resource access. Role names do not authorize. Flutter guards are UX only.

## 7. Canonical API contract

| Method | Route | Decision |
|---|---|---|
| GET | `/api/v1/tenant/ecommerce/click-collect/orders/{orderId}?outletId={outletId}` | Single side-effect-free staff aggregate detail |
| POST | `/api/v1/tenant/ecommerce/click-collect/orders/{orderId}/fulfilment/start?outletId={outletId}` | Atomic confirmed start/assignment command |

No public storefront endpoint or generic `PATCH .../status` substitutes for either route.

## 8. Detail response mapping

The aggregate response provides authoritative order identity/status/timestamps, optional source/customer classification, customer/contact, outlet and collection window/timezone, payment/currency/totals, fulfilment/assignment facts and lines. Optional images/options/classification are omitted when unavailable. Flutter must not fan out into per-customer, per-payment, per-line or per-image requests.

## 9. Start command invariants

The server revalidates tenant, actor, entitlement, permission, outlet/resource scope, order, fulfilment, pickup/slot reservation, requested quantities, current assignment, idempotency and optimistic concurrency. One transaction:

1. confirms an eligible pre-picking state;
2. transitions the existing fulfilment to `PICKING`;
3. assigns the authorized tenant user under policy;
4. updates audit fields;
5. appends fulfilment event evidence;
6. returns authoritative result/replay disposition.

Replay cannot create another fulfilment, assignment or event.

## 10. Failure and recovery contract

| Outcome | UI behaviour |
|---|---|
| 400 | Safe validation message; remain OO-02/OO-03 |
| 401 | Session recovery/sign-in |
| 403 permission | Permission-denied state/message |
| 403 entitlement | Feature-not-enabled state/message |
| 404 | Non-disclosing unavailable state; Back/refresh |
| 409 | Do not navigate; refetch authoritative detail and show conflict |
| network/5xx | Retain safe context; explicit bounded retry |

Raw exceptions, stack traces, secrets and cross-tenant existence are never displayed.

## 11. Database decision

**New table: NO. New column/attribute: NO. New OO-02 migration: NO.**

Reuse sales orders/lines/history, fulfilment orders/lines/events, pickup orders/slot reservations/events, customers, payments, product/variant/media, inventory reservations, outlets and tenant users. Start updates the existing fulfilment header and event authority. Repository-standard concurrency remains a cross-journey prerequisite already documented by the schema authority; no screen-specific version or event storage is permitted.

## 12. Live Flutter audit

| Area | Source finding | Classification |
|---|---|---|
| Route | `/pos/online-orders/:orderId` present in POS shell router | REUSE |
| Detail route/screen | route selector and `online_order_detail_screen.dart` present | REUSE / EXTEND |
| Detail widgets/tokens | feature-owned widgets and `online_order_ui.dart` present | REUSE / EXTEND |
| Confirmation | `start_fulfilment_dialog.dart` present; confirm precedes call | REUSE / EXTEND |
| Provider | detail/start loading and error state; post-success detail/list refresh | REUSE / EXTEND |
| Models/repository/datasource | typed GET/POST consumers present | REUSE / EXTEND |
| 409 automatic refetch | generic message exists; explicit conflict refetch not proven | GAP |
| Responsive/accessibility/runtime parity | source structure exists; required acceptance evidence absent | GAP |

## 13. Live backend audit

Audited branch: `main` on 2026-08-31. `ClickCollectOrdersController` uses the canonical staff base but exposes only `PATCH {orderId}/status`. Source search did not find the staff list/detail/start application/repository implementation expected by current tracking.

| Requirement | Finding | Classification |
|---|---|---|
| OO-02 detail GET | Handler/query/projection absent | MISSING |
| OO-03 start POST | Handler/orchestrator absent | MISSING |
| Permission/entitlement/outlet validation for these operations | Cannot exist end-to-end without handlers | MISSING |
| Atomic start, event, assignment, idempotency/concurrency | Not proven in staff start path | MISSING |
| Existing fulfilment/pickup/order entities | Present | REUSE |

This is a live-source drift/conflict with older documentation that marked staff list work implemented. No completion claim is made from documentation or Flutter clients alone.

## 14. Reuse / Extend / New / Not Needed

| Area | Decision |
|---|---|
| POS shell, permission helpers, feature folder, detail widgets, dialog, provider/data contracts | REUSE / EXTEND |
| Existing staff Click & Collect controller family | EXTEND with canonical GET/POST; do not create parallel controller |
| Detail aggregate query/start orchestration | NEW implementation within existing module because absent in audited source |
| Public storefront APIs/generic status PATCH | NOT APPLICABLE as substitutes |
| New table/column/permission/role/status | NOT NEEDED |

## 15. Security, performance and observability

- Tenant/outlet filters are server-side and fail closed; 404 is non-disclosing.
- API output is typed and bounded; no secrets, token hashes or internal stack details.
- Detail is one aggregate query/read with joined/batched media projections and no N+1 fan-out.
- Start logs safe operation identifiers, tenant/outlet/order/actor correlation, result/conflict category and duration; no customer secrets or tokens.
- Metrics distinguish detail success/denial/not-found and start accepted/replay/conflict/failure.

## 16. Required tests before acceptance

- backend unit/integration: permissions, entitlement, tenant/outlet isolation, not-found non-disclosure, mapping, eligible/ineligible states, reservation/quantity validation, assignment, transaction rollback, event/audit, concurrency and idempotent replay;
- Flutter model/repository/provider/widget: full/null mapping, permission-disabled CTA, read-only entry, confirmation cancel/confirm, loading/error/not-found/409 refresh, no premature navigation and post-success invalidation;
- viewport/accessibility: phone, tablet portrait, tablet landscape and desktop; text scale, focus, semantics, contrast and overflow;
- authenticated E2E: OO-01 → OO-02 → OO-03 → start API/database evidence → OO-04, including denied/conflict/replay cases;
- actual Flutter screenshots compared with the approved OO-02 prototype for hierarchy, spacing, typography, colour and responsive composition.

## 17. Second Brain files synchronized

- `00_START_HERE/Current_Source_Of_Truth.md`
- `03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection.md`
- `04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract.md`
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_Component_Inventory.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_Prototype_Flow.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_UI_API_Mapping.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_UI_DB_Mapping.md`
- `07_UI_UX_KNOWLEDGE/Cashier/Online_Order_Visual_Direction.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment.md`
- this tracker

## 18. Conflicts and open gaps

1. The task expectation to reuse an existing staff detail endpoint conflicts with audited backend `main`, where it is absent. Resolution: retain one canonical route/controller family and mark the handler as the smallest missing implementation; do not invent a competing endpoint.
2. Older active docs said OO-01 implementation pending despite a later accepted tracker. Status language was reconciled without changing the approved OO-01 design.
3. Earlier UI/DB wording treated Guest as freely derived. It now requires authoritative classification because Guest semantics remain an open journey decision.
4. Flutter currently identifies start eligibility from client status values. Backend authority remains final; production acceptance requires the server contract and conflict/refetch verification.
5. No authenticated OO-02 runtime/API/database/screenshot evidence exists in this chunk.
6. The current Chunk text says OO-01 preserves four rows and Customer-style visible pagination, while the active OO-01 acceptance tracker explicitly lists visible pagination as absent. OO-01 was declared out of scope and must not be reopened here, so its accepted tracker remains unchanged; the mismatch is an OO-01 authority gap for a separately approved decision, not an OO-02 design choice.

## 19. Final gate

```text
Canonical journey/UI/API/permission/database contract: PASS
Second Brain internal synchronization: PASS
Flutter source presence: PARTIAL
Backend detail/start implementation: FAIL / MISSING
Database change required: NO
Authenticated E2E and visual acceptance: NOT RUN
Production readiness: BLOCKED
Chunk 2/3 work performed here: NO
```

## 20. Chunk 2 backend implementation evidence

The canonical detail read is now implemented on the existing staff Click & Collect controller family:

- `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}?outletId={outletId}`;
- typed application service and aggregate response DTOs;
- bounded, read-only repository projection over existing sales order, line, fulfilment, pickup, channel and media authorities;
- both `commerce.online_order.orders.access` and `commerce.online_order.orders.view` are required;
- `click_collect` entitlement, active tenant/user/outlet, outlet assignment and resource scope are validated server-side;
- inaccessible and wrong-outlet resources return the stable non-disclosing `online_orders.not_found` result;
- null customer classification remains null and is not presented as Guest;
- no status transition, event append, history write, schema change or migration occurs during detail reads.

Focused validation on 2026-08-31:

| Validation | Result |
|---|---|
| Backend solution build | PASS — 0 errors; 8 pre-existing unrelated nullable warnings |
| Detail application unit tests | PASS — 6/6 |
| Click Collect controller API tests | PASS — 8/8 |
| Detail repository integration tests | PASS — 3/3 |
| Broader E-commerce Customer Orders tests | PASS — 59/59 (Unit 19, API 25, Integration 15); 0 failed, 0 skipped |

## 21. Start Fulfilment blocker

The canonical Start POST was deliberately not added. Live source inspection confirmed that `FulfillmentOrder` and its EF configuration do not expose a row-version, xmin or equivalent production optimistic-concurrency token. Implementing a state-changing Start command without that mechanism would violate the approved atomic/concurrent-start contract.

This chunk did not create a screen-specific concurrency field or migration. The next canonical action is approval and implementation of the shared fulfilment-header concurrency prerequisite, followed by the Start command, idempotency/event/rollback/concurrency tests and authenticated E2E evidence.

```text
Detail GET implementation: PASS
Start Fulfilment implementation: BLOCKED — shared optimistic concurrency prerequisite absent
Flutter changes: NONE
Database/schema/migration changes: NONE
Chunk 2 final status: BLOCKED
```

## 22. Chunk 2 concurrency and Start Fulfilment closure

The previously documented blocker is resolved through shared fulfilment lifecycle infrastructure, not an OO-02 UI field:

- provider: PostgreSQL via Npgsql;
- repository-standard mechanism reused: explicit numeric `row_version` with EF `IsConcurrencyToken()`;
- entity/configuration: `FulfillmentOrder.RowVersion`, default `1`, check `row_version >= 1`;
- additive migration: `20260831064535_AddSharedFulfillmentOrderConcurrency`;
- Detail GET returns nullable transport field `fulfillmentVersion`;
- Start request requires positive `expectedVersion`;
- the domain permits Start only from `PENDING` or `ALLOCATED`, transitions to `PICKING`, assigns the authenticated tenant user and increments the version;
- stale client version or EF concurrency exception maps to `online_orders.concurrency_conflict` and HTTP 409;
- already started/terminal state and invalid required reservation also return 409 without mutation;
- Start requires `commerce.online_order.fulfilment.start`, active tenant/user/outlet, Click & Collect entitlement and outlet/resource scope;
- the transaction validates a `PENDING` pickup header, confirmed pickup-slot reservation, and confirmed/unexpired inventory reservation scoped to the order/outlet;
- one successful transaction appends exactly one immutable `FULFILLMENT_STARTED` event and commits status, assignment, version and event together;
- stale/duplicate attempts produce no second assignment, transition or event.

Validation evidence:

| Validation | Result |
|---|---|
| Focused detail/start/concurrency unit tests | PASS — 24/24 |
| Click Collect controller API tests | PASS — 10/10 |
| Detail/start repository integration tests | PASS — 6/6 |
| Broader E-commerce Customer Orders tests | PASS — 82/82 (Unit 37, API 27, Integration 18); 0 failed, 0 skipped |
| Backend solution build | PASS — 0 warnings, 0 errors |
| Flutter changes | NONE |

This closure supersedes the earlier sections that recorded Start as blocked. Those sections remain historical evidence of the prerequisite discovery.

```text
Detail GET implementation: PASS
Shared FulfillmentOrder optimistic concurrency: PASS
Start Fulfilment implementation: PASS
Stale Start → HTTP 409: PASS
Atomic assignment/event/version update: PASS
New OO-02-specific table/column: NO
Shared additive migration: YES
Chunk 2 final status: COMPLETE
Chunk 3 Flutter alignment/authenticated E2E: NOT STARTED
```

## 24. Chunk 3 Flutter implementation (2026-08-31)

Production Flutter now uses the existing `lib/features/fulfilment_pickup/`
owner and POS shell. Header and footer were not changed.
`/pos/online-orders/:orderId` loads authoritative detail by stable order ID;
Back returns to `/pos/online-orders`.

- Typed detail consumes lifecycle fields, channel, optional classification,
  pickup reference, backend item/unit counts, media, remaining quantity,
  `serverTime` and nullable `fulfillmentVersion`.
- Confirmed Start sends `{ "expectedVersion": fulfillmentVersion }`, prevents
  duplicate in-flight submission, and uses the canonical staff Start endpoint.
- HTTP 409 never navigates, refetches detail/version, and presents safe conflict
  feedback. Success navigates to existing Picking using the returned order ID.
- Start uses `commerce.online_order.fulfilment.start`; backend remains final
  permission/state authority.
- OO-02 implements the approved identity, collect-by, summary cards, product
  lines and action hierarchy using real API fields, runtime ThemeData and the
  shared cached-image fallback. Guest is not inferred.
- Relative collection time uses API `serverTime`. Wide and compact layouts are
  responsive; Back, Start, conflict feedback and images expose semantics.

| Gate | Result |
|---|---|
| Dart format | PASS |
| Flutter analyze | PASS — no issues found |
| Focused Online Orders suite | PASS — 41/41 |
| Responsive matrix | PASS — desktop, both tablet orientations, phone, small phone |
| Full Flutter suite | PASS — 1,339 passed, 0 failed, 1 pre-existing skipped |
| Authenticated detail/Start/Picking runtime | NOT EXECUTED — authenticated running session unavailable |
| Two-session runtime 409 | NOT EXECUTED |
| Actual-device screenshot comparison | NOT EXECUTED |

Backend changed in Chunk 3: NO. Database changed in Chunk 3: NO.

```text
Chunk 3 Flutter implementation: PASS
Authenticated runtime/E2E: BLOCKED / NOT EXECUTED
Chunk 3 production acceptance: BLOCKED
```

## 25. Final runtime acceptance attempt (2026-08-31)

Runtime was prepared with the real Development stack:

- PostgreSQL was reachable on `localhost:5432`;
- the current backend source built successfully and started on port `5150`;
- the current Flutter debug build was installed on the Pixel Tablet emulator;
- persisted POS authentication hydrated successfully (`authenticated=true`)
  and opened `/pos/home` as the Development cashier;
- the live shell showed the expected Development Main Store, Front Till 01 and
  open till session.

Navigation from the real POS Home to Online Orders then exposed a prerequisite
runtime defect before OO-02 could be opened. The queue rendered all-zero counts
and the safe unavailable/404 state. Direct route-registration evidence matched
the UI result:

```text
GET /api/v1/tenant/ecommerce/click-collect/orders
→ HTTP 404 (route not registered)

GET /api/v1/tenant/ecommerce/click-collect/orders/{guid}
→ HTTP 401 without credentials (detail route is registered and protected)
```

The live `ClickCollectOrdersController` contains parameterized detail GET,
versioned Start POST and status PATCH operations, but no root queue GET. This is
a backend/OO-01 prerequisite gap, not evidence of an OO-02 detail or Start
defect. No code or database change was made during this runtime-only check.

Because the authenticated UI cannot select a real order, the following evidence
could not be obtained and is not claimed: real OO-02 detail data comparison,
confirmation-before-mutation, Start request/body, database before/after version,
assignment/event count, Picking navigation, permission variants, runtime 409,
theme override, or actual OO-02 screenshot comparison.

```text
Authenticated login: PASS
Backend/PostgreSQL/emulator preparation: PASS
OO-01 prerequisite queue GET: FAIL — HTTP 404 / route absent
OO-02 detail and Start runtime acceptance: BLOCKED BEFORE ENTRY
Final OO-02 status: BLOCKED
```

## 23. Development database migration reconciliation

The Development target `localhost:5432 / UnifiedCommerceDb` contained an untracked legacy `fulfillment_orders.row_version` column with `bigint NOT NULL DEFAULT 0`, no canonical check constraint and no history row for `20260831064535_AddSharedFulfillmentOrderConcurrency`. Repository migration search found no earlier standard migration owning that column, so migration history was not manually edited.

The migration Up operation was hardened to reconcile the existing column in place: add only when absent, normalize null/sub-1 values to `1`, set default `1` and NOT NULL, and add the named constraint only when absent. No column/table/data was dropped. EF then applied and recorded the migration normally with ProductVersion `10.0.0`.

Final verified state:

```text
row_version: bigint NOT NULL DEFAULT 1
constraint: ck_fulfillment_orders_row_version CHECK (row_version >= 1)
migration history: recorded (10.0.0)
invalid versions: 0
subsequent database update: already up to date
```

## 26. OO-01 prerequisite root-route repair

The section 25 blocker was traced to an absent parameterless `[HttpGet]` action
on the active `ClickCollectOrdersController`; it was not a Flutter URL defect or
a route-constraint collision. The same controller retained the GUID detail and
versioned Start routes, explaining the observed root 404 versus detail 401.

The canonical root queue action and bounded read projection were restored on
the same controller/application/repository authority. No Flutter, schema,
migration, or competing controller was added. The HTTP test pipeline proves
root authorized 200 and unauthenticated 401 while detail and Start remain
reachable. Focused controller/service/repository tests and the backend build
pass.

Actual authenticated POS queue rendering and selection into OO-02 remain a
runtime acceptance gate. Local Development API startup encountered an
environmental Data Protection key access failure in this tool session, so no
real POS 200/items screenshot is claimed here.

## 27. OO-02 target visual-alignment update

The OO-02 feature body was aligned more closely with the approved wide-screen
visual authority without changing the shared POS shell, route, data flow, Start
lifecycle, expected-version handling, or conflict recovery.

- Reused: shared POS shell, runtime `ThemeData`, shared online-order status and
  payment chips, cached product image/fallback, and existing confirmation flow.
- Extended: the feature-local detail header, summary cards, items container and
  product rows.
- Added no new shared component. The order icon is presentation-only and adds
  no state or API dependency.
- The page is a clean theme surface rather than one large tinted rounded card.
- Wide layouts use identity, collect-by and action zones; widths below 1100
  logical pixels stack the header so tablet portrait and phones remain safe.
- The Start action is larger, theme-primary and includes helper text. Without
  `commerce.online_order.fulfilment.start`, the complete action region is
  omitted and the header reflows without a reserved gap.
- Summary and line content continues to use backend values. Relative collection
  urgency continues to use response `serverTime`; no screenshot data or device
  clock authority was introduced.
- No fake View Details/card navigation or repeated order-level picking count was
  added. Product rows remain read-only and show authoritative per-line remaining
  quantity when available.

Validation in this tool session:

| Gate | Result |
|---|---|
| Direct Dart analysis of changed OO-02 files | PASS — no issues found |
| Dart format | Content formatted; process reported a local telemetry-file access error after formatting |
| Flutter analyze/test runner | BLOCKED — runner stalled before emitting output |
| Actual-device screenshot comparison | NOT RUN |
| Backend/database/migration changes | NONE |

The implementation visual delta is complete at source level, but full-suite and
actual-device screenshot acceptance remain open until the local Flutter runner
environment is healthy.

## 28. Strict target alignment and Pixel Tablet evidence

A second, strict visual pass was completed against the fixed OO-02 target and
then rendered on the connected Pixel Tablet (`2560 × 1600`, landscape). The
first device pass showed that the initial scale increase pushed the line area
too far below the fold. A corrective pass retained the target hierarchy while
reducing excess header/card height and redistributing wide-header width toward
the order identity.

Final implemented structure:

- clean full-width lowest theme surface between the unchanged shell bars;
- wide three-zone identity / collect-by / Start composition;
- large contextual order icon and inline authoritative status;
- prominent server-time-derived collection urgency;
- large two-line, theme-primary Start CTA with helper text;
- three equal, taller summary cards with semantic theme colour roles;
- prominent payment amount and authoritative item/unit counts;
- bordered full-width items section with larger cached thumbnails and rows;
- complete Start region removal and natural header reflow when permission is
  absent;
- responsive stacking below the wide-header breakpoint.

No target sample value, order number, customer, outlet, currency, count, status,
date or product was copied into production code. The captured screen used real
Development API data. The real `ECOMM-SEED-ACCEPTED-001` identifier wraps at the
available width because it is materially longer than the prototype sample; it
was not truncated or replaced merely to imitate the screenshot. `View Details`,
chevrons and repeated order-level `items to pick` labels remain intentionally
absent because OO-02 has no canonical action supporting them.

| Validation | Result |
|---|---|
| Flutter analyze | PASS — no issues found |
| Focused responsive/permission suites | PASS — 31/31 |
| Pixel Tablet build/install | PASS |
| Actual Pixel Tablet screenshot | CAPTURED |
| Target visual comparison | PASS with intentional data/action differences documented above |
| Full Flutter suite | NOT RUN — subsequent elevated tool execution was unavailable after focused validation |
| Backend/database/schema/migration | UNCHANGED |

## 29. Fixed non-scrollable target-layout closure (2026-09-01)

The Pixel Tablet landscape body is now a fixed, non-scrollable composition.
The shell reduces the available body height substantially, so available width
is the authoritative fixed-landscape selector; requiring a large body height
incorrectly selected the scrollable fallback on the real tablet.

For the wide target layout, OO-02 now uses a fixed `Column` with an `Expanded`
Order Items surface instead of a vertical scroll view. Density was reduced in
the prescribed order: outer vertical padding, section gaps, summary-card
padding/height, header spacing, CTA padding, item-row padding and thumbnail
size. The complete long order number remains visible through single-line
scale-down rather than truncation or sample substitution.

Component ownership was already suitable and was retained:

- screen: state, permission, lifecycle action and responsive composition;
- `OrderDetailHeader`: identity and collect-by composition;
- `OrderSummaryCards` / `_SummaryCard`: summary presentation;
- `OrderItemsSection` / `OnlineOrderItemRow`: line presentation;
- `StartFulfilmentDialog`: existing confirmation behaviour.

Actual Pixel Tablet evidence at `2560 × 1600` landscape confirms the header,
Start CTA/helper, all three summary cards, Order Items header, product image,
name, SKU, quantity and remaining quantity are simultaneously visible between
the unchanged shell bars. No scroll gesture is required and no content is
clipped for the current one-line Development order. Narrow layouts retain the
existing responsive scroll-safe fallback because fixed presentation cannot
safely guarantee arbitrary content at phone widths.

No backend, API, database, migration, permission, expected-version, Start,
conflict, route, header or footer behaviour changed.

## 30. Shared design-system ownership closure (2026-09-01)

- OO-02 Start Fulfilment now reuses `PosPrimaryActionButton`. The shared owner
  was extended with optional icon size/gap, label lines/alignment and text style
  so the approved multiline CTA preserves its dimensions without duplication.
- OO-03 uses `showAppDialog` / `showAppModalBottomSheet`,
  `PosBottomOutlinedButton` and `PosPrimaryActionButton`; feature-owned content,
  responsive dialog/sheet choice, submit-once and navigation behaviour remain
  unchanged.
- OO-02 Collection, Payment and Items summary cards consume named fulfilment
  semantics. Payment summary/chip styling uses exact normalized backend status
  mapping and a safe unknown fallback.
- Flutter analyze: PASS. Focused Online Orders plus shared-modal tests: 50/50
  PASS. Full Flutter suite: 1,346 PASS, one existing skip, zero failures.
- Backend, API contract, database, migrations, permissions, expected-version,
  409 refresh handling, routes and journey transitions were unchanged.
