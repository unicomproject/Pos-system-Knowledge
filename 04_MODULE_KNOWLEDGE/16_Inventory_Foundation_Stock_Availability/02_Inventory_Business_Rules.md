<!-- title: Inventory Business Rules — 29-Screen Scope -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Inventory Business Rules (29-Screen Implementation)

These rules are newly established as canonical for the current release where prior docs were silent. They do not invent UI fields beyond the approved prototypes.

Quantity formulas: [[03_Inventory_Quantity_Model]]

---

## Contract lock

```text
Inventory Contract Version: v1.0
Status: LOCKED
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

## Current 29-screen implementation scope

IN SCOPE:

- Inventory Overview / Current Stock (TA-UJ-045 / INV-UJ-01)
- Opening Stock (TA-UJ-063 / INV-UJ-02)
- Stock Receiving (TA-UJ-046 / INV-UJ-03)
- Stock Adjustment (TA-UJ-047 / INV-UJ-04)
- Channel Stock Allocation (TA-UJ-064 / INV-UJ-05)

DEFERRED (keep journeys; not blockers):

- Stock Out (TA-UJ-048)
- Stock Transfer (Flow 14 / Module 18 transfer tables)
- Stock Count / Stocktake (TA-UJ-049) — dashboard tile visible, journey deferred
- Full movement history workspace (TA-UJ-050) — product-detail panel only
- Full alerts workspace (TA-UJ-051) — dashboard Priority Alerts widget only
- Inventory report export (TA-UJ-054)
- Reorder automation
- Marketplace (Beta) channel allocation
- Adjustment pending-approval workflow by a second actor

---

## Multi-tenant isolation

Every read/write must resolve tenant from the authenticated Tenant Admin token (server-side). Reject any product, variant, outlet, location, channel, serial, batch, or user id that is not in that tenant. Cross-tenant identifiers return 404 (hidden by tenant boundary).

---

## Location model

| UI word | Canonical |
|---|---|
| Outlet / Warehouse / Location | `inventory_locations` (linked to `outlets`) |
| Till | Not a stock-holding entity |

Default location for an outlet: the ACTIVE location with `is_sellable_location = true` for that outlet. Receiving uses a location with `is_receiving_location = true` when one exists; otherwise the selected location must be allowed for receiving by backend rule (selected location is receiving-capable). Prototype “Warehouse” is an inventory location, not a second stock system.

---

## Product structure support

| Operation | SIMPLE | VARIANT | BUNDLE |
|---|---|---|---|
| Dashboard / Current Stock / Detail | SUPPORTED | SUPPORTED (per variant) | NOT APPLICABLE (no parent stock) |
| Opening Stock | SUPPORTED | SUPPORTED (select variant SKU) | NOT APPLICABLE |
| Stock Receiving | SUPPORTED | SUPPORTED | NOT APPLICABLE |
| Serial registry | SUPPORTED if serial tracked | SUPPORTED if serial tracked | NOT APPLICABLE |
| Stock Adjustment | SUPPORTED | SUPPORTED | NOT APPLICABLE |
| Channel Allocation | SUPPORTED | SUPPORTED | NOT APPLICABLE |

BUNDLE availability remains component-based at POS. Inventory TA screens do not post bundle parent stock.

---

## Tracking mode support

| Flag | Opening | Receiving | Adjustment | Channel allocation |
|---|---|---|---|---|
| Track Inventory OFF | BLOCKED | BLOCKED | BLOCKED | BLOCKED |
| Serial ON | If posting qty N, N serials required at post (or registry gap-fill after) | Required: serial count = received qty | Serial-tracked decrease requires selecting/releasing serials **DEFERRED** for 29-screen: adjustment of serial SKUs is allowed only when serials are not required to be chosen on the prototype enter screen. **Canonical:** serial SKUs may be quantity-adjusted; serial identities are not edited on adjustment screens. Serial/on-hand mismatch is a 422 on post if serial tracking is on and serial IN_STOCK count would not match on-hand after. | Allowed on quantity limits only |
| Batch ON | Batch number required | Batch required | Optional unless batch-scoped balance exists | N/A |
| Expiry ON | Expiry required (requires batch) | Expiry required | N/A | N/A |

Serial vs batch mutual exclusivity follows product tracking spec (Release 1).

---

## Opening stock

### Quantity

- Must be **> 0**
- Zero forbidden
- Decimal allowed only when inventory UOM allows fractional qty
- Precision: inventory UOM

### Duplicate rule (canonical, newly established)

At most **one POSTED opening** per (`tenant_id`, `inventory_location_id`, `product_id`, `product_variant_id`).

Second post → `409 OPENING_STOCK_ALREADY_POSTED`.

If any `stock_movements` already exist for that balance key → `409 OPENING_STOCK_NOT_ELIGIBLE` (use Receiving or Adjustment).

### Multiple drafts

At most one DRAFT opening for the same key. Saving draft upserts that draft.

### Posting

Atomic: opening document POSTED + `inventory_balances` upsert/increase on_hand + append `stock_movements` (`movement_type = OPENING_STOCK`) + optional batch + optional serials + cost layer when unit cost provided + audit.

Review/enter/draft **must not** change balances.

---

## Stock receiving

Display name: **Stock Receiving**. Alias: Stock In (TA-UJ-046).

### Document statuses

```text
DRAFT       — saved; no stock change
POSTED      — confirm succeeded; stock increased
CANCELLED   — unused in 29-screen happy path; Cancel on confirm discards unposted work
```

There is no REVIEWED persisted status. Review and Confirm screens are UI gates.

**Stock increases only on Confirm Receive success.**

### Fields (prototype-required)

Header: receiving outlet/location, receiving mode (Purchase Receipt in prototype; persist as `receipt_mode`), supplier display name (required text; full supplier master remains out of MVP), invoice number (required), optional PO/reference, received date, notes.

Line: product/variant, qty > 0, unit cost >= 0, batch/expiry when tracking requires.

Supplier is **not** a full supplier-management module. Store `supplier_name` (varchar) and optional `supplier_product_id` if a match exists. Do not block receiving on supplier master completeness.

### Multi-line

Select screen is single-product in the prototype; review table shows multiple lines. Canonical: a receipt may contain **one or more lines**. The select step adds the first line; additional lines may be added later. For 29-screen parity, implementing **single-line receipts** is acceptable and matches enter-details. Review/confirm must display the lines actually on the document (no extra fixture products).

### Serial on receive

If `requires_serial_tracking`: received quantity must equal number of new unique serials. Serial unique per (`tenant_id`, `product_id`, `serial_number`). One serial = one unit. Duplicate → `409 DUPLICATE_SERIAL`. Reuse of SOLD serials after return is DEFERRED.

### Idempotency

Confirm POST requires `Idempotency-Key`. Replay with same key and same fingerprint returns the original POSTED receipt. Different payload → `409 IDEMPOTENCY_CONFLICT`.

---

## Serial number registry

IN SCOPE: search, filter (outlet/location, status, product), list, metrics, print label, view detail.

Add Serial Range / Import: allowed only to register serial identities for serial-tracked SKUs where `IN_STOCK` serial count < on-hand. Does **not** increase on-hand. Exceeding on-hand → `422 SERIAL_COUNT_EXCEEDS_ON_HAND`.

Edit serial: warranty/status display fields that do not change on-hand.

Mark as Sold: **DEFERRED** to POS sale completion. API `422 SERIAL_SALE_REQUIRED`. Button may remain; action must not silently decrement stock.

---

## Stock adjustment

Directions: **INCREASE** / **DECREASE** (maps to `stock_adjustment_reasons.direction` and signed `quantity_change`).

### Reason catalog

Reasons are **admin-configurable** rows in `stock_adjustment_reasons` (`reason_code` + `reason_name` + `direction`). Prototype dropdown values (Damaged, Found Stock, Data Correction, Event Usage) are seed examples, not a frozen enum. Free-text reason is **not** allowed. Notes are optional free text.

### Statuses (29-screen)

```text
DRAFT    — Save Draft; no stock change
POSTED   — Post Adjustment; stock mutated
```

`requires_manager_approval` on reasons: **DEFERRED**. Tenant Admin with `inventory.stock.adjust` posts immediately to POSTED. Dashboard “Pending Approval” may show 0. Do not implement a second-actor approval queue in this release.

### Negative stock

Forbidden for adjustments. Decrease cannot go below reserved+damaged+quarantine. See quantity model.

### Posting

Atomic: adjustment POSTED + line(s) + balance update + `stock_movements` (`ADJUSTMENT_IN` / `ADJUSTMENT_OUT`) + audit.

Review does not mutate stock.

---

## Channel allocation

**LOCKED: CHANNEL ALLOCATION MODEL = MODEL B**

Model B: no physical transfer. Confirm upserts allocation limits + safety buffer. No `stock_movements`.

Validation:

- Limits >= 0
- Sum(limits) + safety buffer <= Available
- Disabled channels (Marketplace Beta) cannot receive limits
- Channel must belong to tenant and be enabled

---

## Ledger / atomicity

Opening, receiving confirm, and adjustment post:

```text
Document row + lines + balance change + stock_movement(s)
+ movement references + serials (if any) + audit event
succeed or fail in one database transaction.
```

Channel confirm:

```text
Allocation upserts + audit event in one transaction.
No balance change. No stock_movement.
```

---

## Concurrency

- `inventory_balances.row_version` optimistic concurrency on opening/receiving/adjustment post. Stale version → `409 CONCURRENT_UPDATE`.
- Allocation confirm uses `expectedAvailableQuantity` (or row versions on allocation rows). If available changed → `409 CONCURRENT_UPDATE`.
- Do not use last-write-wins on stock.

---

## Idempotency

Header `Idempotency-Key` required on:

- POST opening stock
- POST receiving confirm
- POST adjustment
- POST channel allocation confirm

Store key on the document and/or `stock_movements.idempotency_key` (movements already have the column). Same key + same fingerprint → original result. Same key + different fingerprint → 409.

---

## Audit trail

Every stock-mutating or allocation-confirming action records: tenant, actor tenant_user, action, product, variant, location, before qty (balances), delta, after qty, reason/reference, timestamp, correlation/trace id, result.

Channel confirm: before/after are allocation limits, not on-hand.

---

## Error codes (inventory)

| Code | HTTP | Meaning |
|---|---|---|
| VALIDATION_ERROR | 400 | Field validation |
| PERMISSION_DENIED | 403 | Missing permission |
| FEATURE_DISABLED | 403 | `inventory_tracking` off |
| PRODUCT_NOT_FOUND | 404 | Product hidden/missing in tenant |
| VARIANT_NOT_FOUND | 404 | |
| OUTLET_NOT_FOUND | 404 | |
| LOCATION_NOT_FOUND | 404 | |
| INSUFFICIENT_STOCK | 409 | Decrease/allocation exceeds available |
| ALLOCATION_EXCEEDS_AVAILABLE | 422 | Channel math invalid |
| DUPLICATE_SERIAL | 409 | |
| QUANTITY_PRECISION_INVALID | 400 | |
| OPENING_STOCK_ALREADY_POSTED | 409 | |
| OPENING_STOCK_NOT_ELIGIBLE | 409 | Movements already exist |
| CONCURRENT_UPDATE | 409 | |
| IDEMPOTENCY_CONFLICT | 409 | |
| BUNDLE_NOT_STOCKED | 422 | |
| PRODUCT_NOT_TRACKED | 422 | |
| SERIAL_COUNT_MISMATCH | 422 | |
| SERIAL_COUNT_EXCEEDS_ON_HAND | 422 | |
| SERIAL_SALE_REQUIRED | 422 | Mark as sold deferred to POS |
| STOCKTAKE_DEFERRED | 422 | Stock Count tile |

---

## NFR

- List APIs: `page` default 1, `pageSize` default 20, max 100 (API Standards).
- Search: name, SKU, barcode.
- Dashboard aggregates computed server-side; must not load all rows to the client.
- No partial posting.
- Structured logs with traceId on failed mutations.

## Runtime UI states (every production screen)

Loading, loaded, empty, validation error, API error, permission denied, success (wizard success screens). Prototype has no explicit empty/error art; production uses Tenant Admin shared empty/error patterns without changing approved workspace composition.

## Responsive

Primary: tablet / desktop. Follow Tenant Admin shared shell. Prototype `min-width: 1180px` is a mockup frame, not a production lock. Content tables scroll horizontally on narrower widths. Mobile: same business rules; stacked tables acceptable. Do not redesign prototype content.
