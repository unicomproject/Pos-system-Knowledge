<!-- title: Online Order OO-05 Review & Pack Canonicalization Status -->
<!-- status: OO-05 REVIEW & PACK — CHUNK 3 FLUTTER / INTEGRATION / LIVE RUNTIME ACCEPTANCE COMPLETE -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# OO-05 Review & Pack Canonicalization Status — 2026-09-08

Status: **OO-05 REVIEW & PACK — CHUNK 3 FLUTTER / INTEGRATION / LIVE RUNTIME ACCEPTANCE COMPLETE**

Downstream:

- Chunk 1 Second Brain canonicalization remains the journey authority
- Chunk 2 backend Pack/Ready contract remains authoritative
- Next journey surface: OO-06 Ready for Collection / customer handover (not Collected)

## CHUNK 3 — FLUTTER / INTEGRATION / LIVE RUNTIME (verified 2026-09-09)

### Feature owner

`lib/features/fulfilment_pickup/` — screen: `presentation/screens/review_pack_screen.dart`

No `lib/features/review_pack/` and no `lib/features/online_orders/` production feature roots.

### Frontend capability matrix (final)

| Class | Count (approx) |
|---|---|
| REUSE | ~18 (picking GET, metrics, item card, progress ring, POS shell header/footer, primary button, permissions, Dio remote/repo, route under `/pos/online-orders`) |
| EXTEND | ~12 (`expectedVersion` Pack/Ready, `markReadyForCollection` Pack→refresh→Ready, reviewMode item card, packing notes UX, 409/timeout recovery, permission reflow, tablet compact layout) |
| MISSING | 0 for OO-05 MVP |
| INVALID | 0 |

### Route / navigation

| Item | Value |
|---|---|
| Route family | `/pos/online-orders/.../picking` embeds Review & Pack when `canPack` / `showReviewPack` / already `PACKED` |
| OO-04 → OO-05 | PASS via picking screen `onReviewPack` / auto when `canPack` |
| After Ready | `ReadyForCollectionScreen` (OO-06 surface) — **not** Collected |

### Provider flow

`ReviewPackScreen` → `PosPickingActions.markReadyForCollection` → repository → remote:

1. Confirm review state / `CanPack` (or skip Pack if already `PACKED`)
2. `POST .../pack` with `expectedVersion` + optional note (max 200 UX)
3. Authoritative refresh → latest version
4. `POST .../ready` with **post-Pack** `expectedVersion`
5. Refresh → navigate/show Ready

Timeout/409: refetch first; if already Packed → Ready-only; if already Ready → success; never blind re-Pack.

### Exact APIs used

| Step | Method + route |
|---|---|
| Review | `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking?outletId=` |
| Pack | `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/pack?outletId=` |
| Ready | `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/ready?outletId=` |

Direct widget Dio: **NONE**. Backend source / schema / migration: **NO** change in Chunk 3.

### Permissions (UX gate; backend authority)

`commerce.online_order.orders.access`, `orders.view`, `packing.view`, `packing.pack`, `collection.mark_ready`. Role-name checks: **NONE**.

### Fixed tablet target

Logical **1280×800** landscape (Pixel Tablet). Header/footer unchanged. Whole-page scroll **NONE**; internal target scroll **NONE**. Layout tests: 1280×800 / 1180×820 / 1100×700 PASS.

### Tests

| Suite | Result |
|---|---|
| `oo05_review_pack_workflow_test.dart` | PASS |
| `oo05_review_pack_layout_test.dart` | PASS |
| `flutter analyze` (fulfilment_pickup + permission access) | PASS |
| `test/features/online_orders/` regression | 112 passed (prior full suite) |
| Commit/push | **NOT PERFORMED** |

### Live Development acceptance (2026-09-09)

| Item | Value |
|---|---|
| Backend | Already running `http://localhost:5150` (not restarted by agent) |
| Frontend | Already running Pixel Tablet `com.nytroz.pos.nytroz_pos` (cashier session active) |
| Auth | `cashier001@gmail.com` (password not logged) |
| Order | `ECOMM-SEED-ACCEPTED-002` |
| Outlet | `bbbbbbbb-0001-4000-8000-000000000001` (Development Main Store / DEV-STORE-01) |
| Initial | `PICKING`, `canPack=true`, version **3**, packedQty **0** |
| Pack | PASS → status `PACKED`, version **4**, note `Packed and checked` on `FULFILLMENT_PACKED` |
| Ready | PASS using expectedVersion **4** → status `READY`, version **5** |
| DB | `PackedQuantity=1`, `pickup_orders.pickup_status=READY`, `collected_at=null` |
| Events | `FULFILLMENT_PACKED`, `FULFILLMENT_READY_FOR_COLLECTION`, `PICKUP_READY_FOR_COLLECTION` |
| Auto-Collected | **NO** |
| Screenshots | `Pos Frontend/Nytroz-POS-App/test_evidence/oo05_review_pack/` (+ live cashier home capture) |

### Remaining blockers

**NONE** for Chunk 3 acceptance gate (Flutter Pack→Ready wiring, layout, analyze/tests, live Pack+Ready+DB).

Optional follow-up (not blocking): on Pixel Tablet open **Home → Online Orders** (not bottom Orders/Parked Sales) → order still packable (`ECOMM-SEED-ACCEPTED-003`) → **Review & Pack** and save PNGs `01`–`04` under `test_evidence/oo05_review_pack/`. Live cashier home capture already saved as `05-ready-order-state.png` / `05-cashier-home-live.png`.

## CHUNK 2 — BACKEND / API / DB (verified 2026-09-08)

### Capability matrix (backend)

| Capability | Classification |
|---|---|
| Review GET (picking aggregate) | REUSE (+ EXTEND: allow `PACKED`, expose `PackedQuantity`, `CanPack` only while `PICKING`) |
| Pack command | EXTEND (was MISSING) |
| Ready command | EXTEND (was MISSING) |
| Packing note storage | EXTEND via `fulfillment_order_events.event_note` (no dedicated column) |
| Package tables | NOT REQUIRED for OO-05 MVP |
| New API family | INVALID / not created |

Counts for Chunk 2 backend work: **REUSE 1** core review surface; **EXTEND ~24** mutation/event/permission/concurrency capabilities; **MISSING 0** after implementation; **INVALID 0**.

### Exact endpoints

| Capability | Method + route |
|---|---|
| Review state | `GET /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/picking?outletId=` |
| Pack | `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/pack?outletId=` |
| Ready | `POST /api/v1/tenant/ecommerce/click-collect/orders/{orderId}/ready?outletId=` |

Controller: existing `ClickCollectOrdersController` only. **Separate API family: NO.**

### CanPack authority

Backend projection on review GET:

```text
effectiveRemaining = RequestedQuantity - CancelledQuantity - PickedQuantity
lineSatisfied      = RemainingQuantity == 0
CanPack            = FulfillmentStatus == "PICKING"
                     AND lines.Count > 0
                     AND every line satisfied
```

Pack repository re-validates `PickedQuantity + CancelledQuantity >= RequestedQuantity` for all lines before mutation. After Pack, status `PACKED` and `CanPack=false`.

### Pack / Ready behaviour

| Step | Effect |
|---|---|
| Pack | FO `PICKING` → `PACKED`; lines `PackedQuantity = PickedQuantity`; `PackedAt` server time; one `FULFILLMENT_PACKED` event; `RowVersion++`; sales order unchanged |
| Ready | FO `PACKED` → `READY`; sales `FulfillmentStatus = READY_FOR_COLLECTION`; existing `pickup_orders.PickupStatus = READY`; `ReadyAt` once; events `FULFILLMENT_READY_FOR_COLLECTION` + `PICKUP_READY_FOR_COLLECTION`; `RowVersion++` |
| All-picked auto-Ready | **NO** |
| Ready auto-Collected | **NO** (`CollectedAt` stays null) |

### Packing note

| Item | Decision |
|---|---|
| Authority | `fulfillment_order_events.event_note` on Pack event (default text `Fulfilment packed` when absent) |
| Max length | **200** (matches Flutter/prototype OO-05 UI; `event_note` is unbounded `text`; app validation only) |
| Dedicated column | **NO** |
| Dedicated note permission | **NONE** — covered by pack permission chain |

### Package ADR

OO-05 Review & Pack does **not** collect package count/barcode/dimensions/weight/labels. Planned `fulfillment_packages*` remain future ADR only.

| Schema | Result |
|---|---|
| New table | **NO** |
| New DB column | **NO** |
| Migration | **NO** |
| `fulfillment_packages` required for OO-05 | **NO** |

### Permissions enforced

Pack/Ready require: `orders.access` + `orders.view` + `packing.view` + (`packing.pack` | `collection.mark_ready`). Role-name checks: **NO**.

### Concurrency / events

| Item | Value |
|---|---|
| Owner | `FulfillmentOrder.RowVersion` |
| Stale | `online_orders.concurrency_conflict` → HTTP 409 |
| Pack event | `FULFILLMENT_PACKED` (exactly one on success; zero on failure) |
| Ready events | `FULFILLMENT_READY_FOR_COLLECTION` + `PICKUP_READY_FOR_COLLECTION` |
| Pickup create on Ready | **NO** — updates existing `pickup_orders` only; missing pickup → `online_orders.invalid_pickup` |

### Pickup integration

Pickup row is created earlier in Click & Collect lifecycle (pre-Start). Ready updates that row to `READY` atomically with fulfilment/sales projections. Duplicate PickupOrder: **NONE**.

### Tests / build

| Suite | Result |
|---|---|
| Focused unit (packing service + domain packing) | PASS |
| Focused integration (`PosOnlineOrderPackingRepositoryTests`) | 14 passed |
| ApiTests ClickCollect controller routes | PASS (includes `/pack`, `/ready`) |
| `dotnet build` (Api) | PASS |
| Real Development API mutation | **NOT EXECUTED** this Chunk 2 pass |
| Flutter source | **unchanged** |
| Commit/push | **NOT PERFORMED** |

### Chunk 3 remaining

**CLOSED 2026-09-09** — see CHUNK 3 section above.

### Chunk 2 completion gate

All mandatory OO-05 backend items verified and implemented → **COMPLETE**.

## 1. Canonical screen purpose

**OO-05 — Review & Pack**

Cashier reviews all authoritatively picked order items, optionally captures packing
instructions/notes where supported, validates backend packing eligibility, and
performs the authoritative **Pack** then **Mark Ready for Collection** transitions.

### Owns

- Entry only when backend `canPack == true` (or post-pack `PACKED` for Ready CTA)
- Authoritative picked-line review presentation
- Optional packing notes (UI + pack command payload when backend supports it)
- Pack confirmation (`commerce.online_order.packing.pack`)
- Mark Ready for Collection confirmation (`commerce.online_order.collection.mark_ready`)
- Progress / eligibility messaging from backend projections
- Back to Pick Items / Pick Order without inventing Ready
- Permission-aware action reflow, loading/error/409 handling

### Does NOT own

- Barcode scanning / item-level picking (OO-04 / OO-04B)
- Inventory reservation creation
- Customer handover / QR validation
- Collection completion / Collected
- Payment processing
- Order cancellation (unless a separate existing action is reused elsewhere)
- Ready queue listing (OO-06+ collection surfaces)

## 2. Journey position

```text
New / Accepted
  → OO-02 Order Detail
  → OO-03 Start Fulfilment
  → Preparing / Picking
  → OO-04 Pick Order
  → OO-04B Pick Item / Barcode Verification
  → all required quantities satisfied (backend canPack)
  → OO-05 Review & Pack
  → Pack (finalize packed state)
  → Mark as Ready for Collection
  → Ready for Collection (OO-06 boundary / ready surfaces)
  → Customer Handover
  → Collected / Completed
```

### Critical separations

| Assertion | Rule |
|---|---|
| Last picked item ≠ Ready for Collection | `FULFILLMENT_PICKING_COMPLETED` / `canPack` keep lifecycle `PICKING` for packing |
| All-picked ≠ Pack complete | Pack command remains mandatory |
| Pack ≠ Ready | Separate commands and permissions |
| Ready ≠ Collected | Handover remains downstream |
| Frontend must not set `status = READY` before backend success | Backend is final authority |

Screen numbering (canonical for this program):

| ID | Screen |
|---|---|
| OO-04 | Pick Order |
| OO-04B | Pick Item / Barcode Verification |
| **OO-05** | **Review & Pack** |
| OO-06 | Ready for Collection (post-Ready boundary / ready UI) |

Older prototype_flow IDs that numbered Review & Pack as OO-06 are **superseded** by
this convention (journey/module/OO-04 tracker authority).

## 3. Entry condition

| Rule | Authority |
|---|---|
| Open Review & Pack only when backend `canPack == true` | `GET .../picking` → `canPack` |
| Display totals (`pickedUnits` / `totalUnits`) are UX only | Not sole eligibility authority |
| After successful Pack, fulfilment status becomes `PACKED` (target) | Ready CTA becomes available |
| Terminal / Ready / Collected / Cancelled block pack/ready | Backend lifecycle |

Frontend may auto-show Review & Pack when status is `PICKED`/`PACKED` **only if**
the same backend eligibility still holds after refetch.

## 4. Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | Open Review & Pack from OO-04 when backend `canPack` is true (or equivalent pack-eligible status). |
| FR-02 | Load/refetch authoritative current picking/fulfilment aggregate before mutation. |
| FR-03 | Show Review & Pack title. |
| FR-04 | Show fulfilment step indicator (Prepare → Pick → Pack → Ready). |
| FR-05 | Show Items metric from authoritative progress. |
| FR-06 | Show Picked metric from authoritative progress. |
| FR-07 | Show Remaining / Overdue derived from collection deadline and `serverTime`. |
| FR-08 | Show Units metric (unit-based, not line-count-only). |
| FR-09 | Show picked-item list for current fulfilment lines. |
| FR-10 | Show product image or established safe placeholder. |
| FR-11 | Show product name. |
| FR-12 | Show variant/options when present. |
| FR-13 | Show SKU when present. |
| FR-14 | Show authoritative location only when resolved. |
| FR-15 | Show line picked/pack readiness status. |
| FR-16 | Show picked quantity / effective required quantity. |
| FR-17 | Show all-items-picked / pack-eligibility indicator from backend. |
| FR-18 | Show Packing Notes input when packing UI is permitted. |
| FR-19 | Packing Notes are optional. |
| FR-20 | Enforce packing-note character limit (Flutter/prototype reference **200**; Chunk 2 must confirm server). |
| FR-21 | Show Order Summary (order number, status projection). |
| FR-22 | Show customer display from authoritative snapshots. |
| FR-23 | Show collection outlet. |
| FR-24 | Show collection date/time. |
| FR-25 | Show remaining/overdue presentation. |
| FR-26 | Show progress ring/legend using unit progress. |
| FR-27 | Show Picked / Pending / Issues legend from authoritative counts. |
| FR-28 | Show packing eligibility result (`canPack` / post-pack state). |
| FR-29 | Primary pack action: Pack Order (requires packing.view + packing.pack). |
| FR-30 | After Pack success: Mark as Ready for Collection (requires packing.view + collection.mark_ready). |
| FR-31 | Back to Pick Items / Pick Order without mutation. |
| FR-32 | Duplicate-submit protection (single in-flight pack/ready). |
| FR-33 | Loading state while pack/ready in flight. |
| FR-34 | Safe API error handling without fake success. |
| FR-35 | HTTP 409: discard optimistic UI, refetch, explain stale version. |
| FR-36 | Terminal-state handling (already Ready/Collected/Cancelled). |
| FR-37 | Permission-aware action rendering with no blank gaps. |
| FR-38 | Success refresh; navigate to Ready surface only after authoritative Ready. |
| FR-39 | Tablet landscape 1280×800 fixed non-scrollable target for critical content. |
| FR-40 | No fake location/product/customer/status data. |
| FR-41 | Timeout after submit → refetch authority; do not blindly resubmit Ready. |
| FR-42 | Accessibility: labels, status text not color-only, focus order, counters. |

**FR count: 42**

## 5. Business rules

| ID | Rule |
|---|---|
| BR-01 | Authenticated POS tenant staff required. |
| BR-02 | Tenant isolation on every read/mutation. |
| BR-03 | Outlet scope from activated device context. |
| BR-04 | Fulfilment must belong to the current sales order and tenant/outlet. |
| BR-05 | Picking must have been started; fulfilment eligible for pack. |
| BR-06 | Pack requires authoritative `canPack` (or equivalent all-resolved lines). |
| BR-07 | Pending required units block Pack. |
| BR-08 | `effectiveRequired = RequestedQuantity - CancelledQuantity`. |
| BR-09 | Line pick satisfaction: `PickedQuantity >= effectiveRequired`. |
| BR-10 | `PackedQuantity` cannot exceed picked/effective required. |
| BR-11 | Terminal orders cannot be re-packed. |
| BR-12 | Ready orders cannot be marked Ready again. |
| BR-13 | Collected/Completed cannot be re-packed. |
| BR-14 | Cancelled cannot be packed. |
| BR-15 | Blocking unresolved issues follow existing canonical issue policy (Chunk 2 verify against implemented issue semantics). |
| BR-16 | Mutations require current positive `expectedVersion` (`FulfillmentOrder.RowVersion`). |
| BR-17 | Stale version → 409; no silent overwrite. |
| BR-18 | Duplicate concurrent Ready/Pack: exactly one succeeds. |
| BR-19 | Actor is server-derived from auth; client cannot choose actor/tenant. |
| BR-20 | Server time is authority for ready/pack timestamps and overdue. |
| BR-21 | All-picked does not automatically become Ready. |
| BR-22 | Ready does not mean Collected. |
| BR-23 | Customer handover remains separate. |
| BR-24 | No role-name authorization. |
| BR-25 | Backend is final business authority. |
| BR-26 | Pack and Ready are atomic transactions individually. |
| BR-27 | Pack and Ready are **separate** commands (not one conflated CTA inventing both). |
| BR-28 | Audit/event evidence required for successful pack and ready. |
| BR-29 | No client-calculated lifecycle authority. |
| BR-30 | Frontend permission gating is UX; backend enforcement is security. |
| BR-31 | Legacy `PATCH .../status` Ready is **not** the cashier OO-05 path. |
| BR-32 | Packing notes optional; trim; reject over-max; empty/whitespace treated as absent. |

**BR count: 32**

## 6. Picked-line review logic

Verified domain quantities on `fulfillment_order_lines`:

| Attribute | Role |
|---|---|
| `requested_quantity` | Ordered qty |
| `picked_quantity` | Authoritative picked qty (OO-04) |
| `packed_quantity` | Pack target (unused by live pack API today) |
| `cancelled_quantity` | Reduces effective required |

```text
effectiveRequired = RequestedQuantity - CancelledQuantity
lineSatisfied     = PickedQuantity >= effectiveRequired
canPack           = (≥1 line) AND every line satisfied   // current picking GET projection
```

Do **not** add an `is_picked` DB column; derive presentation from quantities/status.

## 7. Packing logic (actual vs target)

### Evidence

| Layer | Finding |
|---|---|
| Technical Contract | Separate `POST .../pack` then `POST .../ready` |
| Flutter | `ReviewPackScreen`: **Pack Order** then **Mark Ready for Collection** |
| Backend controller | **No** `/pack` or `/ready` actions implemented |
| Domain | `PackedQuantity` / `PackedAt` / `ReadyAt` columns exist; no Pack/Ready methods |

### Canonical workflow (Chunk 2 must implement)

```text
A. POST /orders/{orderId}/pack?outletId=
   → validate canPack / version / permissions
   → finalize packed quantities (and packages if Chunk 2 confirms package tables)
   → status → PACKED
   → append pack event(s)
   → increment row_version

B. POST /orders/{orderId}/ready?outletId=
   → validate PACKED (or pack-complete) / version / permissions
   → Ready transition + pickup ready projection + notify intent
   → status → READY / sales READY_FOR_COLLECTION projection
   → append ready event(s)
   → increment row_version
```

**Not chosen:** single atomic “Review → Ready” that skips Pack, unless Chunk 2 proves
an intentional backend redesign (contradicts current Flutter + Technical Contract).

## 8. Packing Notes

| Concern | Chunk 1 finding |
|---|---|
| UI | Optional `Packing notes` — Flutter `maxLength: 200` |
| Prototype | `0 / 200` visual reference |
| Flutter payload | `pack(notes)` → remote `{ packingNote }` |
| Backend storage | **GAP** — no packing-note API; picking notes use `fulfillment_order_events.event_note` (1–500) |
| Preferred Chunk 2 direction | Accept optional trimmed note on **Pack** request; persist via event note/payload **without new column** if possible |
| Separate packing-note permission | **None** found — pack permission covers note-on-pack |
| Max length server | **UNRESOLVED** until Chunk 2 (UI reference 200) |

Do not invent a dedicated `packing_notes` column in Chunk 1.

## 9. Ready-for-Collection transition

Conceptual transaction:

```text
authenticate → tenant → packing/collection permission → outlet
→ load aggregate → validate expectedVersion
→ validate lifecycle (pack-complete / PACKED)
→ validate CanPack history / packed quantities
→ validate blocking issues
→ Ready transition (+ pickup ready if canonical)
→ notify intent (collection.notify_customer if implemented)
→ append event(s) → version++ → SaveChanges → commit
```

Client must **not** send `newStatus`, `readyAt`, `tenantId`, `actorId`, or `canPack`.

Timeout-after-submit: refetch; if already Ready, show authoritative success (no blind retry).

### Customer-facing status

| Phase | Customer-facing projection |
|---|---|
| Picking / Review & Pack | Preparing |
| After successful Ready | Ready for Collection |
| After handover | Collected / Completed |

OO-05 must never claim Collected.

## 10. Progress logic (units)

```text
totalUnits   = Σ(effectiveRequired)
pickedUnits  = Σ(picked quantities per canonical model)
pendingUnits = totalUnits - pickedUnits
progress%    = pickedUnits / totalUnits  (guard zero)
```

At normal OO-05 entry: often `pendingUnits = 0` / 100% pick progress.  
**100% pick progress alone is not Ready.**

## 11. Remaining / overdue

Derived presentation only:

```text
remaining = collectionDeadline - serverTime
```

Examples: `15m remaining`, `20m overdue`.  
**No** `remaining_minutes` / `is_overdue` columns. Device clock is not authority.

## 12. Permissions (verified in source)

| Code | Use on OO-05 |
|---|---|
| `commerce.online_order.orders.access` | Staff entry chain |
| `commerce.online_order.orders.view` | Staff read chain |
| `commerce.online_order.picking.view` | Host picking route / prior stage |
| `commerce.online_order.packing.view` | View Review & Pack |
| `commerce.online_order.packing.pack` | Pack Order action |
| `commerce.online_order.collection.mark_ready` | Mark Ready action |
| `commerce.online_order.collection.notify_customer` | Ready notification (if/when wired on Ready) |
| `commerce.online_order.collection.view_ready` | Ready queue (OO-06+), not OO-05 pack |

**Permission gap for inventing new codes:** NONE required for Chunk 1.  
**Runtime gap:** `packing.view` / `packing.pack` / `collection.mark_ready` exist in catalog constants but **are not yet enforced by a live Pack/Ready service** (Chunk 2).

UI:

- Missing `packing.view` → block Review & Pack
- Missing `packing.pack` → hide/disable Pack
- Missing `mark_ready` → hide/disable Ready
- Hidden actions leave no blank gaps

## 13. Reusable component matrix

| Element | Decision | Notes |
|---|---|---|
| POS shell / header / footer | REUSE | Unchanged |
| Back action | REUSE | Existing navigation patterns |
| Screen title / step badge | EXTEND | `FulfilmentStepper` exists; must reflect Pack step |
| `PickingProgressMetrics` | REUSE | Already used by `PackingReadinessSummary` |
| Summary metric cards | REUSE/EXTEND | Align with OO-04 metrics |
| Picked-items outer card | FEATURE-LOCAL | Compose over shared primitives |
| Product image | REUSE | Existing media/placeholder |
| Product / variant / SKU typography | REUSE | Prefer `PickingItemCard` over bare `ListTile` in Chunk 3 |
| Location display | REUSE | Authoritative only |
| Picked status badge | REUSE | Shared status chip patterns |
| Item quantity status | REUSE | From line quantities |
| Packing Notes card | FEATURE-LOCAL | Optional note; shared TextField patterns |
| Character counter | REUSE/EXTEND | Shared input counter if present |
| Order Summary card | REUSE/EXTEND | OO-04 sidebar patterns |
| Customer / collection rows | REUSE | Detail/picking projections |
| Progress card / ring / legend | REUSE | From `picking_order_sidebar` / workspace |
| Eligibility message | FEATURE-LOCAL | Copy only |
| Pack / Ready CTAs | REUSE | Shared primary/secondary actions |
| Back to Pick Items CTA | REUSE | Secondary outlined |
| Loading/error states | REUSE | Online order shared states |

| Classification | Count |
|---|---|
| REUSE | 16 |
| EXTEND | 4 |
| SHARED/NEW | 0 |
| FEATURE-LOCAL | 3 |

**Duplicate components planned:** NO. Chunk 3 must stop using thin `ListTile` review rows when `PickingItemCard` can be configured.

## 14. API audit (`ClickCollectOrdersController` family)

Base: `/api/v1/tenant/ecommerce/click-collect`

| Capability | Method + route | Classification | Evidence |
|---|---|---|---|
| Review/picking state | `GET /orders/{orderId}/picking?outletId=` | **REUSE** | Returns lines (+ `packedQuantity`), progress, `canPack`, version, `serverTime`; readable for `PICKING`/`PACKED` |
| Pack | `POST /orders/{orderId}/pack?outletId=` | **IMPLEMENTED** | Body `{ expectedVersion, packingNote? }`; FO → `PACKED` |
| Ready | `POST /orders/{orderId}/ready?outletId=` | **IMPLEMENTED** | Body `{ expectedVersion }`; FO → `READY` + pickup/sales ready |
| Packing note | Optional field on Pack body | **IMPLEMENTED** | Event note max 200; no dedicated column |
| Ready queue | `GET /collection/ready` | Out of OO-05 mutation scope | Collection surfaces |
| Legacy status PATCH | `PATCH /orders/{orderId}/status` | **NOT OO-05** | Uses `fulfillment.orders.manage`; sales-order only |

**New API family / controller:** NO — remain on `ClickCollectOrdersController`.

### Conceptual Pack request (Chunk 2)

```json
{ "expectedVersion": 20, "packingNote": "optional trimmed ≤ N" }
```

Server-authoritative: tenant, actor, lifecycle, packed quantities, timestamps, version.

### Conceptual Ready request

```json
{ "expectedVersion": 21 }
```

### Response / refetch

Must expose fulfilment status, version, packed quantities if relevant, Ready success,
`serverTime`, and enough state for Flutter to enter Ready surface without guessing.

## 15. Database ownership (verified)

| Table | OO-05 relevance |
|---|---|
| `sales_orders` | Order identity, customer/collection snapshots, fulfilment status projection |
| `sales_order_lines` | Product/variant/SKU/barcode snapshots, requested qty |
| `fulfillment_orders` | Status, `row_version`, `packed_at`, `ready_at`, `fulfillment_note` |
| `fulfillment_order_lines` | `requested/picked/packed/cancelled` quantities, line status, packed-by |
| `fulfillment_order_events` | Audit sequence, `event_type`, `event_note`, actor, server time |
| `pickup_orders` | Pickup ready/collection status (Ready should update when implemented) |
| `pickup_order_events` | Pickup audit (if Ready writes pickup events) |
| `inventory_locations` | Authoritative location projection |
| `fulfillment_packages` / `fulfillment_package_lines` | **Planned in Technical Contract; not applied in live schema audit** |

### Derived (no columns)

`allItemsPicked`, `canPack` presentation, `progressPercentage`, remaining/overdue,
eligibility messages, review step, display location.

### Schema expectation for Chunk 2

| Item | Chunk 1 verdict |
|---|---|
| New table | **UNRESOLVED** — multi-package tables are contract target; live schema lacks them. Chunk 2 must choose packages migration **or** line-level `packed_quantity` MVP with explicit ADR |
| New column for packing notes | **NO** preferred (reuse `event_note` / payload) |
| New migration | **UNRESOLVED** — only if packages path is selected |
| Expected if packages deferred | Use existing `packed_quantity` + status + events; **New table NO; New column NO; Migration NO** |

## 16. Concurrency

| Item | Value |
|---|---|
| Owner | `FulfillmentOrder.RowVersion` → `fulfillment_orders.row_version` |
| Client | `expectedVersion` |
| Success | Increment version |
| Stale | HTTP 409 / `online_orders.concurrency_conflict` |
| Two cashiers Ready with same version | Exactly one wins |

## 17. Event / audit

| Implemented today | Pack/Ready |
|---|---|
| `FULFILLMENT_STARTED` | — |
| `FULFILLMENT_LINE_PICKED` | — |
| `FULFILLMENT_LINE_ISSUE_REPORTED` | — |
| `FULFILLMENT_PICKING_COMPLETED` | Signals pack eligibility; status stays `PICKING` |
| `FULFILLMENT_PICKING_NOTE_ADDED` | Picking notes only |
| `FULFILLMENT_PACKED` | **IMPLEMENTED** (Pack success; optional packing note in `event_note`) |
| `FULFILLMENT_READY_FOR_COLLECTION` | **IMPLEMENTED** (Ready success) |
| `PICKUP_READY_FOR_COLLECTION` | **IMPLEMENTED** (Ready success on pickup stream) |

## 18. Error / edge matrix (minimum)

| # | Case | Expected |
|---:|---|---|
| 1 | `canPack` false | Pack blocked; stay on picking |
| 2 | Pending unit remains | Pack rejected |
| 3 | Partially picked line | Pack rejected |
| 4 | Cancelled quantity | Effective required reduced |
| 5 | Blocking issue | Per canonical issue policy |
| 6 | Non-blocking issue | Does not invent pack block unless backend says so |
| 7 | Stale version | 409 + refetch |
| 8 | Duplicate submit | Single in-flight; second ignored/failed safely |
| 9 | Already Ready | Idempotent/safe message; no duplicate event |
| 10 | Collected / Completed | Reject |
| 11 | Cancelled | Reject |
| 12 | Wrong tenant/outlet | 403/404 safe |
| 13 | Missing packing.view | Screen blocked |
| 14 | Missing packing.pack | Pack CTA absent |
| 15 | Missing mark_ready | Ready CTA absent |
| 16 | Note empty/whitespace | Treated as absent |
| 17 | Note over max | Validation error |
| 18 | Network/timeout after submit | Refetch; no blind retry |
| 19 | 400/401/403/404/409/5xx | Safe mapped UX |
| 20 | Concurrent Ready | One success, one 409 |
| 21 | Missing image/location | Safe placeholders |
| 22 | Long names | No overflow / ellipsis |
| 23 | Permission revoked mid-screen | Refetch/deny on next action |
| 24 | Lifecycle changes while open | Refetch authority |

**Matrix count: 24+**

## 19. Security / NFR / Accessibility / Theme

- Auth + tenant + outlet + permission + ownership + version
- No client tenant/actor/lifecycle authority; no role checks; safe errors
- Performance: reuse picking aggregate; no full history load
- Maintainability: reuse-first; no Dio in widgets
- Observability: correlation + order/fulfilment ids; no secrets/PII dumps
- A11y: titled screen, text status, labelled notes/counter, semantic CTAs, focus order
- Theme: ThemeData / tokens; Orange-like and Pink-like tenants supported; semantic success green

## 20. Fixed tablet landscape

| Rule | Value |
|---|---|
| Target | Pixel Tablet logical **1280×800** |
| Whole-page scroll | **NONE** |
| Internal target scroll | **NONE** for critical center composition |
| Header / footer | **UNCHANGED** |
| Overflow | No RenderFlex / yellow-black stripes |
| Chunk 3 | Compact reuse of OO-04 metrics/cards; current `ReviewPackScreen` wide path still scrolls the side column — must be corrected in Chunk 3 |

## 21. Frontend ownership

| Item | Path |
|---|---|
| Feature root | `lib/features/fulfilment_pickup/` |
| Existing screen evidence | `presentation/screens/review_pack_screen.dart` |
| Host | `pos_online_order_picking_screen.dart` (mode switch; no dedicated `/pack` route today) |
| Provider | `pos_online_orders_provider.dart` → `PosPickingActions.pack` / `.ready` |
| Endpoints | `api_endpoints.dart` → `.../pack`, `.../ready` |
| Data flow | Screen → Provider → Repository → Remote → Click & Collect API |

Do **not** create `lib/features/review_pack/` or `lib/features/online_orders/`.

Chunk 3 may keep embedded mode **or** introduce a dedicated route under the same feature if navigation clarity requires it — without a second feature root.

## 22. Backend ownership

| Layer | Owner |
|---|---|
| API | `src/E_POS.Api/Controllers/V1/Tenant/ECommerce/ClickCollectOrdersController.cs` |
| Application | `E_POS.Application/Modules/ECommerce/CustomerOrders/` services/contracts/DTOs |
| Infrastructure | `E_POS.Infrastructure/Modules/ECommerce/CustomerOrders/` repositories |
| Domain | `E_POS.Domain/Modules/ECommerce/FulfilmentPickup/` (`FulfillmentOrder`, lines, events, pickup) |

Controller = HTTP only. Domain owns CanPack/pack/ready invariants. Repository owns EF + concurrency.

## 23. Chunk 2 scope — BACKEND / API / DB

Chunk 2 must:

1. Implement or prove `POST .../pack` and `POST .../ready` on existing controller family  
2. Enforce `packing.view` / `packing.pack` / `collection.mark_ready`  
3. Persist packed quantities; decide packages tables vs line-level MVP with ADR  
4. Optional packing note on Pack (prefer `event_note`/payload; confirm max length)  
5. Define pack/ready event vocabulary and append events  
6. Update pickup/sales ready projections without using legacy status PATCH as cashier path  
7. `expectedVersion` concurrency + atomic SaveChanges  
8. Focused API/domain/integration tests  
9. Prefer **New table NO / New column NO / Migration NO** unless packages path is mandatory  

## 24. Chunk 3 scope — FLUTTER

Chunk 3 must:

1. Elevate `ReviewPackScreen` to OO-05 acceptance (reuse OO-04 cards/ring/metrics)  
2. Packing notes + Pack then Ready CTAs wired to live APIs  
3. Permission reflow, 409/refetch, timeout-safe Ready  
4. Fixed non-scrollable tablet landscape; Orange/Pink themes  
5. Accessibility + Flutter tests + Development E2E  
6. Update this tracker to Flutter acceptance  

## 25. Current Flutter evidence (not Chunk 3 acceptance)

| Item | Evidence |
|---|---|
| Screen | `ReviewPackScreen` exists |
| Notes | Optional, maxLength 200 |
| CTAs | Pack Order → Mark Ready for Collection |
| Host | Inside `/pos/online-orders/:orderId/picking` when `canPack` / packed statuses |
| Backend | Pack/Ready endpoints **IMPLEMENTED** (Chunk 2); Flutter must send `expectedVersion` (Chunk 3) |

## 26. Consistency check vs OO-01…OO-04B

| Check | Result |
|---|---|
| All picked ≠ Ready | PASS (documented) |
| Review & Pack precedes Ready | PASS |
| Ready ≠ Collected | PASS |
| No duplicate API family | PASS |
| No new permission invented | PASS |
| Backend authority + row_version | PASS |
| Prototype numbering conflict resolved | PASS (OO-05 = Review & Pack) |

## Related authorities

- [[../../../03_USER_JOURNEYS/Cashier/POS-UJ-036_Online_Order_Fulfilment_Collection]]
- [[../../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules]]
- [[../../../04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/23_Fulfilment_And_Pickup_UPDATED]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Order_ClickCollect_Fulfilment]]
- [[Online_Order_OO04_Canonicalization_Status_2026-09-02]]
