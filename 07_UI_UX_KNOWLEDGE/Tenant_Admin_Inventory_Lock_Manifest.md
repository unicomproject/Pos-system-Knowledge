<!-- title: Tenant Admin Inventory Lock Manifest -->
<!-- status: LOCKED -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- doc_type: UI/UX + implementation contract lock — documentation only -->

# Tenant Admin Inventory — Lock Manifest

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

| Attribute | Value |
|---|---|
| Lock ID | `INV-LOCK-2026-08-15-v1.0` |
| Lock Date | 2026-08-15 |
| Module | Tenant Admin Inventory (29-screen current release) |
| Scope | Five journeys / 29 approved prototype screens |
| Prototype Version | v1.0 |
| Prototype Screen Count | 29 / 29 |
| Implementation Audit | PASS |
| Blocking Gaps | 0 |
| Production UI Implementation | NOT STARTED |
| Backend Implementation | NOT STARTED |
| QA Execution | NOT STARTED |

Pre-lock archive: `99_Archive/Inventory_Pre_Lock_2026-08-15/`

Canonical prototype pack (HTML/CSS **not modified** by this lock):

```text
07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/
```

---

## Canonical user journeys (LOCKED)

| Canonical Journey | Prototype grouping | Screens | Contract |
|---|---|---|---|
| TA-UJ-045 View Inventory / Current Stock | INV-UJ-01 | 01–03 | LOCKED FOR CURRENT INVENTORY RELEASE |
| TA-UJ-063 Opening Stock | INV-UJ-02 | 04–07 | LOCKED FOR CURRENT INVENTORY RELEASE |
| TA-UJ-046 Stock Receiving (alias Stock In) | INV-UJ-03 | 08–14 | LOCKED FOR CURRENT INVENTORY RELEASE |
| TA-UJ-047 Stock Adjustment | INV-UJ-04 | 15–19 | LOCKED FOR CURRENT INVENTORY RELEASE |
| TA-UJ-064 Channel Stock Allocation | INV-UJ-05 | 20–29 | LOCKED FOR CURRENT INVENTORY RELEASE |

`INV-UJ-*` remains prototype grouping only.

---

## Deferred scope (NOT LOCKED / NOT PART OF CURRENT IMPLEMENTATION LOCK)

Keep documented. Do not delete. Do not treat as implementation-ready.

- Stock Out (TA-UJ-048 / Flow 13)
- Stock Transfer (Flow 14 / Module 18 transfer tables)
- Stock Count / Stocktake (TA-UJ-049 / Flow 15) — dashboard tile visible, wizard deferred
- Inventory Alerts workspace (TA-UJ-051) — dashboard Priority Alerts widget only
- Full movement-history workspace (TA-UJ-050) — product-detail recent-movements panel only
- Inventory report export (TA-UJ-054)
- Other Inventory flows not represented by the approved 29 screens
- Marketplace (Beta) channel allocation
- Adjustment pending-approval queue
- Serial Mark as Sold (POS-owned)

---

## Canonical contract documents

| Area | Document |
|---|---|
| Business rules | `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Inventory_Business_Rules.md` |
| Quantity model | `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/03_Inventory_Quantity_Model.md` |
| Module 16 overview | `04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/01_Module_Overview.md` |
| Ledger / movements | `04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/01_Module_Overview.md` |
| Adjustment module | `04_MODULE_KNOWLEDGE/18_Stock_Adjustment_Transfer_Stocktake/01_Module_Overview.md` |
| API contract | `05_BACKEND_ARCHITECTURE/Tenant_Admin_Inventory_API_Contract.md` |
| Permission matrix | `02_ACCESS_CONTROL/Tenant_Admin_Inventory_Permission_Matrix.md` |
| Permission codes | `02_ACCESS_CONTROL/Permission_Code_List.md` |
| R1 Inventory slice | `02_ACCESS_CONTROL/Tenant_Admin_Inventory_Permission_R1_Registration.md` |
| Database mapping | `06_DATABASE_KNOWLEDGE/Tables/Inventory_29_Screen_Schema_Mapping.md` |
| DTO / fields | `07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Screen_Data_Field_Matrix.md` |
| QA acceptance | `10_TESTING_QA/Tenant_Admin_Inventory_QA_Acceptance.md` |
| Prototype master | `07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md` |
| Screen registry | `07_UI_UX_KNOWLEDGE/Inventory_UI_Prototype_Screen_Registry.md` |
| Implementation audit | `07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit.md` |
| Flutter navigation | `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Inventory_Navigation.md` |

---

## What the UI/UX lock means

The approved rendered Inventory prototype is the locked visual and UX contract for the current 29-screen implementation scope.

Locked characteristics include:

- screen composition
- visible information hierarchy
- approved fields
- labels
- button/action placement
- card/table/form composition
- navigation intent
- step sequence
- interaction intent
- empty/success/review states represented by the contract
- approved theme usage
- spacing/alignment intent
- responsive behaviour defined by the UI specification

### HTML/CSS source is not locked

The HTML/CSS source code is prototype reference material.

The following are NOT production implementation constraints:

- HTML DOM structure
- HTML tag selection
- CSS class names
- inline CSS architecture
- exact prototype stylesheet structure

Production Flutter may use appropriate reusable widgets and architecture. The final rendered result must conform to the locked UI/UX contract.

### Production shell rule

```text
LOCKED:
Inventory workspace/content contract

LOCKED:
Current canonical Tenant Admin shell/navigation

NOT LOCKED:
Prototype-only obsolete outer chrome where it conflicts with the current canonical application shell
```

Production Tenant Admin shell: black approved Tenant Admin shell.

Inventory navigation: Inventory is a top-level Tenant Admin navigation item.

---

## Functional contract (LOCKED)

Audited current-scope functional requirements are locked for:

- Inventory Overview
- Current Stock
- Product Stock Detail
- Opening Stock
- Stock Receiving
- Serial Number Registry
- Stock Adjustment
- Channel Stock Allocation

The implementation must not silently add or remove major behaviour without a future change-control process.

---

## Business rules (LOCKED)

Canonical: `02_Inventory_Business_Rules.md`. Includes:

- Inventory quantity semantics
- Opening Stock
- Receiving
- Adjustment
- Channel Allocation
- Serial Numbers
- Product/variant ownership
- Tenant isolation
- Outlet/location ownership
- Tracking modes

---

## Channel allocation model (LOCKED)

```text
CHANNEL ALLOCATION MODEL = MODEL B
```

Channel allocation does NOT move or reduce physical on-hand inventory.

It controls/publishes the quantity that may be promised or made available to a sales channel.

Physical on-hand stock remains governed by Inventory stock transactions.

Do not interpret allocation as a stock transfer.

---

## Stock-mutating operations (LOCKED)

Physical stock changes only through the approved stock mutation operations.

Current scope:

```text
Opening Stock POST
Stock Receiving CONFIRM/POST
Stock Adjustment POST
```

Channel Allocation does not directly modify physical on-hand quantity.

Read-only screens do not mutate stock.

Review screens do not mutate stock unless explicitly documented otherwise (they are not).

---

## Quantity model (LOCKED)

Canonical definitions and formulas: `03_Inventory_Quantity_Model.md`.

One canonical meaning per quantity used by the 29 screens:

| UI / contract term | Canonical |
|---|---|
| On Hand | `OnHandQuantity` ← `inventory_balances.on_hand_quantity` |
| Reserved | `ReservedQuantity` ← `inventory_balances.reserved_quantity` |
| Available | `AvailableQuantity` = OnHand − Reserved − Damaged − Quarantine |
| Allocated / Allocated Qty | `allocation_limit_quantity` |
| ChannelAllocatedTotal | SUM of channel limits at location+SKU |
| Safety Buffer | `SafetyBufferQuantity` |
| Allocatable / Available to Allocate | `AllocatableQuantity` = Available − SafetyBuffer |
| Remaining Stock (channel) | `RemainingAfterAllocation` = Available − ChannelAllocatedTotal |
| Damaged / Quarantine | balance columns; not edited by the 29 screens |

Do not create duplicate definitions.

---

## Opening Stock (LOCKED)

Audited rules remain exactly as recorded:

- eligibility: tracked SIMPLE/VARIANT; not BUNDLE; location in tenant
- quantity > 0
- duplicate prevention: one POSTED opening per tenant+location+product+variant
- blocked if any prior `stock_movements` exist for that balance key (`OPENING_STOCK_NOT_ELIGIBLE`)
- posting is atomic; review/draft do not change balances
- tenant/outlet/location validation server-side
- idempotency on POST
- audit trail on post

---

## Stock Receiving (LOCKED)

Audited contract remains exactly as recorded:

- product/variant selection, location, quantity, tracking behaviour, serial registration, review, confirmation/posting
- supplier is required **name**, not a full supplier master
- stock increases only on Confirm Receive success
- atomicity + idempotency + audit logging on confirm

---

## Serial Number rules (LOCKED)

- uniqueness: `(tenant_id, product_id, serial_number)`
- one serial = one unit
- received quantity must equal new unique serials when serial tracking is on
- duplicate → `DUPLICATE_SERIAL`
- tenant/product/variant ownership enforced
- persistence: `serial_numbers`
- registry gap-fill does not increase on-hand
- Mark as Sold deferred to POS

---

## Stock Adjustment (LOCKED)

- direction: INCREASE / DECREASE
- quantity > 0 (absolute delta)
- reason from `stock_adjustment_reasons` (required; free-text reason forbidden; notes optional)
- resulting stock calculated from quantity model
- posting atomic; review does not mutate
- **negative stock forbidden** for Tenant Admin adjustments
- decrease cannot go below reserved+damaged+quarantine
- `allow_negative_stock` is for sales, not TA mutations
- DRAFT + POSTED in scope; pending-approval queue deferred
- audit on post

---

## Permissions (LOCKED)

Canonical matrix: `Tenant_Admin_Inventory_Permission_Matrix.md`.

R1 Inventory slice: `Tenant_Admin_Inventory_Permission_R1_Registration.md`.

Codes also listed in `Permission_Code_List.md`.

Locked:

```text
frontend visibility behaviour
backend authoritative enforcement
```

Frontend hiding alone is not authorization.

---

## API contract (LOCKED)

Canonical: `Tenant_Admin_Inventory_API_Contract.md`.

Locked: routes, methods, permissions, request shapes, response shapes, validation behaviour, domain errors, pagination, search, filtering, idempotency expectations, tenant resolution.

Do not generate controller code or DTO classes from this lock.

---

## DTO / attribute mapping (LOCKED)

Canonical: `Tenant_Admin_Inventory_Screen_Data_Field_Matrix.md`.

For each input/display field the audited definition is preserved: name, type, required/optional, editable/read-only, source, validation, API mapping, persistence mapping.

Future implementation must not invent fields without a documented contract change.

---

## Database mapping (LOCKED)

Canonical: `Inventory_29_Screen_Schema_Mapping.md`.

Schema/architecture contract only. No migrations in this lock.

Locked: business concept → canonical table/entity; balance source; transaction/document source; ledger/movement source; serial persistence; channel allocation persistence.

Required header tables specified for a future migration: `stock_adjustments`, `stock_opening_entries`, `stock_receipts` + `stock_receipt_lines`.

---

## Ledger / balance source of truth (LOCKED)

| Concept | Role |
|---|---|
| Inventory Balance (`inventory_balances`) | Authoritative **current quantity** projection (mutable only inside a posting transaction) |
| Inventory Transaction / document (`stock_opening_entries`, `stock_receipts`, `stock_adjustments`) | Business document for draft/post |
| Inventory Ledger / Stock Movement (`stock_movements`) | Append-only historical record |
| Channel allocation (`inventory_channel_allocations`) | Promise limits; not physical stock |

Derived: Available and channel remaining quantities (see quantity model).

There is no ambiguity: UI must not treat movements as the live on-hand store, and must not treat allocations as balances.

---

## Atomicity (LOCKED)

Opening Stock POST, Stock Receiving CONFIRM, Stock Adjustment POST:

```text
Document row + lines + balance change + stock_movement(s)
+ movement references + serials (if any) + audit event
succeed or fail in one database transaction.
```

Channel Allocation confirm:

```text
Allocation upserts + audit event in one transaction.
No balance change. No stock_movement.
```

Partial success is forbidden where this contract requires atomicity.

---

## Concurrency (LOCKED)

- `inventory_balances.row_version` optimistic concurrency on opening/receiving/adjustment post. Stale → `409 CONCURRENT_UPDATE`.
- Allocation confirm uses `expectedAvailableQuantity` (or allocation row versions). If available changed → `409 CONCURRENT_UPDATE`.
- Do not use last-write-wins on stock.

---

## Idempotency (LOCKED)

`Idempotency-Key` required on:

- POST opening stock
- POST receiving confirm
- POST adjustment post
- POST channel allocation confirm

Same key + same fingerprint → original result (no second mutation).

Same key + different fingerprint → `409 IDEMPOTENCY_CONFLICT`.

No stock mutation command may be implemented without this contract.

---

## Audit trail (LOCKED)

Every stock-mutating or allocation-confirming action records:

- tenant
- actor
- operation
- product
- variant
- location
- before
- delta
- after
- reason/reference
- timestamp
- correlation/request identity

Channel confirm: before/after are allocation limits, not on-hand.

---

## Error contract (LOCKED)

Inventory-specific codes reuse project-wide API error envelope (`Error_Response_Standards.md`).

Includes: not found, permission denied, feature disabled, cross-tenant hidden as 404, insufficient stock, duplicate serial, duplicate opening stock, opening not eligible, invalid quantity, concurrency conflict, duplicate/idempotent request, validation failure, allocation exceeds available, serial count mismatch, bundle not stocked, product not tracked.

Do not create competing error formats.

---

## NFR (LOCKED)

Audited Inventory-specific NFRs only (no new invented numbers):

- Performance: list APIs paginated; dashboard aggregates server-side
- Reliability: no partial posting; safe retries via idempotency
- Security / tenant isolation: tenant from token; cross-tenant ids 404
- Data integrity / atomicity: posting transaction boundary
- Observability: structured logs with traceId on failed mutations
- Pagination: page default 1, pageSize default 20, max 100
- Large datasets: do not load all stock rows to the client
- Search: name, SKU, barcode

---

## Frontend implementation contract (LOCKED)

Do not lock the Flutter widget tree.

Locked: route destination, screen responsibilities, visual contract, data requirements, interaction contract, permission requirements, loading/error/empty states, responsive rules.

```text
Reusable Flutter component structure remains an implementation decision.

Flutter must reproduce the locked UI/UX result and behaviour.
```

---

## Backend implementation contract (LOCKED)

Do not lock specific class names unless already part of the canonical architecture.

Locked: API responsibilities, application/domain behaviour, business invariants, validation, authorization, persistence contract, transaction boundaries, idempotency, concurrency, audit requirements.

Concrete internal implementation may follow the existing backend architecture.

---

## QA acceptance contract (LOCKED)

Canonical: `10_TESTING_QA/Tenant_Admin_Inventory_QA_Acceptance.md`.

Covers: 29-screen visual verification, journey happy paths, validation, permissions, tenant isolation, opening stock duplicate handling, receiving posting, serial validation, adjustment, channel allocation, idempotency, concurrency, pagination, search, responsive behaviour.

QA Execution: NOT STARTED.

---

## Known intentional differences

| Topic | Production contract | Prototype |
|---|---|---|
| Outer chrome | Black Tenant Admin shared shell; Inventory top-level | Settings-nested white sidebar; POS till chrome |
| Allocation details (screen 29) | Sales channel names | Prototype fixture uses outlet names — production must not copy that error |
| Stock Count tile | Visible; action deferred | Tile present |
| Channel stepper labels | Canonical 8-step production order in TA-UJ-064 | Prototype labels drift across screens |
| HTML/CSS | Not a production constraint | Inlined CSS; no shared `inventory.css` |

---

## Change-control rule

After this lock, any intentional change to:

```text
UI layout
screen flow
field
business rule
quantity logic
permission
API contract
database mapping
critical validation
```

must first update Second Brain through a documented Inventory change request.

The implementation must not silently diverge from the locked contract.

---

## Implementation discovery rule

Minor technical implementation decisions that do NOT alter the locked contract do not require reopening the full lock.

Examples:

```text
Flutter widget decomposition
internal class naming
private helper methods
repository query optimization
code organization compliant with architecture
```

These remain implementation-level decisions.

---

## Traceability lock table (all 29 screens)

Canonical Journey → Prototype Screens → Functional Contract → Business Rules → Permissions → API → Data / DB → QA

| Screen | File | Canonical Journey | Functional area | Business rules | Permission | API | Data / DB | QA |
|---|---|---|---|---|---|---|---|---|
| INV-UJ01-S01 | `01_inventory_dashboard.html` | TA-UJ-045 | Inventory Overview | quantity model; alerts widget | `inventory.stock.view` (+ `inventory.alerts.view` for widget) | GET `/inventory/dashboard` | `inventory_balances` (read) | INV-QA-001, 008, 030–033, 050–056 |
| INV-UJ01-S02 | `02_current_stock.html` | TA-UJ-045 | Current Stock | tracked SIMPLE/VARIANT only | `inventory.stock.view` | GET `/inventory/stock` | `inventory_balances` (read) | INV-QA-002, 050, 051 |
| INV-UJ01-S03 | `03_product_stock_detail.html` | TA-UJ-045 | Product Stock Detail | quantity model; recent movements panel | `inventory.stock.view` (`inventory.movements.view` for panel) | GET `/inventory/stock/{productId}` | balances + `stock_movements` (read) | INV-QA-003 |
| INV-UJ02-S01 | `04_opening_stock_select.html` | TA-UJ-063 | Opening Stock | eligibility | `inventory.opening_stock.manage` | drafts | `stock_opening_entries` | INV-QA-004, 010–012 |
| INV-UJ02-S02 | `05_opening_stock_enter.html` | TA-UJ-063 | Opening Stock | qty > 0; tracking | `inventory.opening_stock.manage` | drafts | `stock_opening_entries` | INV-QA-010 |
| INV-UJ02-S03 | `06_opening_stock_review.html` | TA-UJ-063 | Opening Stock | review does not mutate; POST mutates | `inventory.opening_stock.manage` | POST `opening-stock/{id}/post` | opening + balance + `stock_movements` | INV-QA-004, 040–043 |
| INV-UJ02-S04 | `07_opening_stock_success.html` | TA-UJ-063 | Opening Stock | success / no mutation | `inventory.opening_stock.manage` | GET posted | read | INV-QA-004 |
| INV-UJ03-S01 | `08_stock_receiving_dashboard.html` | TA-UJ-046 | Stock Receiving | list receipts | `inventory.receiving.manage` | GET `/inventory/receipts` | `stock_receipts` | INV-QA-005 |
| INV-UJ03-S02 | `09_new_stock_receipt_select.html` | TA-UJ-046 | Stock Receiving | product/variant selection | `inventory.receiving.manage` | POST `/inventory/receipts` | draft receipt | INV-QA-005, 019, 020 |
| INV-UJ03-S03 | `10_receiving_enter_details.html` | TA-UJ-046 | Stock Receiving | qty, supplier name, tracking | `inventory.receiving.manage` | PUT `/inventory/receipts/{id}` | draft | INV-QA-013 |
| INV-UJ03-S04 | `11_receiving_review.html` | TA-UJ-046 | Stock Receiving | review does not mutate | `inventory.receiving.manage` | GET draft | no mutation | INV-QA-005 |
| INV-UJ03-S05 | `12_receiving_confirm.html` | TA-UJ-046 | Stock Receiving | confirm posts; atomic | `inventory.receiving.manage` | POST `receipts/{id}/confirm` | receipt + balance + movement + serials | INV-QA-005, 014, 015, 040–043 |
| INV-UJ03-S06 | `13_receiving_success.html` | TA-UJ-046 | Stock Receiving | success / no mutation | `inventory.receiving.manage` | GET posted | read | INV-QA-005 |
| INV-UJ03-S07 | `14_serial_number_registry.html` | TA-UJ-046 related | Serial Number Registry | uniqueness; gap-fill no on-hand change | `inventory.serials.view` | GET/POST `/inventory/serials` | `serial_numbers` | INV-QA-014, 015 |
| INV-UJ04-S01 | `15_stock_adjustment_dashboard.html` | TA-UJ-047 | Stock Adjustment | DRAFT/POSTED; pending deferred | `inventory.stock.view` / `inventory.stock.adjust` | GET `/inventory/adjustments` | `stock_adjustments` | INV-QA-006 |
| INV-UJ04-S02 | `16_stock_adjustment_select.html` | TA-UJ-047 | Stock Adjustment | product/location | `inventory.stock.adjust` | POST draft | draft | INV-QA-006, 019 |
| INV-UJ04-S03 | `17_stock_adjustment_enter.html` | TA-UJ-047 | Stock Adjustment | direction, qty, reason | `inventory.stock.adjust` | PUT draft | draft | INV-QA-016, 017 |
| INV-UJ04-S04 | `18_stock_adjustment_review.html` | TA-UJ-047 | Stock Adjustment | review no mutation; POST mutates | `inventory.stock.adjust` | POST `adjustments/{id}/post` | adjustment + balance + movement | INV-QA-006, 016, 017, 040–043 |
| INV-UJ04-S05 | `19_stock_adjustment_success.html` | TA-UJ-047 | Stock Adjustment | success / no mutation | `inventory.stock.adjust` | GET posted | read | INV-QA-006 |
| INV-UJ05-S01 | `20_channel_allocation_dashboard.html` | TA-UJ-064 | Channel Stock Allocation | Model B | `inventory.channel_allocation.view` | GET `/inventory/channel-allocations` | `inventory_channel_allocations` | INV-QA-007 |
| INV-UJ05-S02 | `21_channel_select_source.html` | TA-UJ-064 | Channel Stock Allocation | location | `inventory.channel_allocation.manage` | setup | none | INV-QA-007 |
| INV-UJ05-S03 | `22_channel_search_product.html` | TA-UJ-064 | Channel Stock Allocation | product search | `inventory.channel_allocation.manage` | setup | none | INV-QA-051 |
| INV-UJ05-S04 | `23_channel_product_details.html` | TA-UJ-064 | Channel Stock Allocation | quantity model display | `inventory.channel_allocation.manage` | setup | none | INV-QA-007 |
| INV-UJ05-S05 | `24_channel_select_channels.html` | TA-UJ-064 | Channel Stock Allocation | enabled channels only | `inventory.channel_allocation.manage` | setup | none | INV-QA-007 |
| INV-UJ05-S06 | `25_channel_enter_quantity.html` | TA-UJ-064 | Channel Stock Allocation | limits + safety buffer | `inventory.channel_allocation.manage` | setup | none | INV-QA-018 |
| INV-UJ05-S07 | `26_channel_review.html` | TA-UJ-064 | Channel Stock Allocation | review no on-hand change | `inventory.channel_allocation.manage` | review | none | INV-QA-007 |
| INV-UJ05-S08 | `27_channel_confirm.html` | TA-UJ-064 | Channel Stock Allocation | confirm upserts limits only | `inventory.channel_allocation.manage` | POST `/inventory/channel-allocations/confirm` | allocations only | INV-QA-007, 018, 040, 044 |
| INV-UJ05-S09 | `28_channel_success.html` | TA-UJ-064 | Channel Stock Allocation | success | `inventory.channel_allocation.view` | GET | read | INV-QA-007 |
| INV-UJ05-S10 | `29_channel_allocation_detail.html` | TA-UJ-064 | Channel Stock Allocation | sales channels not outlets | `inventory.channel_allocation.view` | GET `{id}` | allocations (read) | INV-QA-054 |

All 29 screens are represented. No orphan screens.

---

## Related Files

- [[Tenant_Admin_Inventory_Implementation_Audit]]
- [[Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[Inventory_UI_Prototype_Screen_Registry]]
- [[../03_USER_JOURNEYS/Tenant_Admin/CANONICAL_USER_JOURNEY_INDEX]]
