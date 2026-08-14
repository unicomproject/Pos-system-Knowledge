<!-- title: Inventory Quantity Model -->
<!-- status: Canonical -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Inventory Quantity Model

**QUANTITY MODEL: LOCKED** — one canonical meaning per quantity used by the 29 screens. Do not create duplicate definitions.

Applies to the current 29-screen Tenant Admin Inventory implementation.

Stock is held at **`inventory_locations`**, not at tills. The UI may label a location as an outlet or warehouse. One outlet may have many locations; the 29-screen UI uses one selectable location per operation (the location shown as Main Outlet / Warehouse / Outlet 02 / Outlet 03).

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

## Authoritative vs derived

| Quantity | Source | Mutability |
|---|---|---|
| On hand | `inventory_balances.on_hand_quantity` | Mutable only inside a posting transaction |
| Reserved | `inventory_balances.reserved_quantity` | Mutable by reservation/order flows, not by these 5 journeys |
| Damaged | `inventory_balances.damaged_quantity` | Not edited by the 29 screens |
| Quarantine | `inventory_balances.quarantine_quantity` | Not edited by the 29 screens |
| Available | generated/cached | Derived |
| Channel allocation limit | `inventory_channel_allocations.allocation_limit_quantity` | Mutable by TA-UJ-064 confirm |
| Safety buffer | `inventory_channel_allocations.safety_stock_quantity` (same value on all channel rows for that location+SKU, or stored once per location+SKU — implement as identical safety on each upserted row) | Mutable by TA-UJ-064 confirm |
| Ledger | `stock_movements` | Append-only |

## Formulas

```text
AvailableQuantity
  = OnHandQuantity
  - ReservedQuantity
  - DamagedQuantity
  - QuarantineQuantity

ChannelAllocatedTotal
  = SUM(allocation_limit_quantity) for enabled channel rows
    at the same tenant + location + product + variant

AllocatableQuantity
  = AvailableQuantity - SafetyBufferQuantity

RemainingAfterAllocation
  = AvailableQuantity - ChannelAllocatedTotal
```

Invariant for channel allocation posting:

```text
ChannelAllocatedTotal + SafetyBufferQuantity <= AvailableQuantity
allocation_limit_quantity >= 0
SafetyBufferQuantity >= 0
OnHandQuantity >= 0
ReservedQuantity >= 0
```

Channel allocation **does not** change OnHandQuantity.

## UI field mapping (approved prototype)

| UI label | Canonical quantity |
|---|---|
| On Hand | OnHandQuantity (location or summed — see aggregation) |
| Available | AvailableQuantity |
| Reserved | ReservedQuantity |
| Low Stock (list status) | AvailableQuantity > 0 AND AvailableQuantity <= product `low_stock_threshold` |
| Out of Stock | AvailableQuantity <= 0 for a tracked SKU at the viewed scope |
| Allocated / Allocated Qty (channel) | allocation_limit_quantity |
| Remaining Stock (channel) | RemainingAfterAllocation |
| Safety Buffer | SafetyBufferQuantity |
| Available to Allocate | AllocatableQuantity after subtracting already allocated channel totals |
| Already Allocated | ChannelAllocatedTotal before the new edit |
| Active Stock Counts (dashboard KPI) | SUM(OnHandQuantity) across tenant locations in scope |

## Aggregation

### Current Stock list row

One row = one **sellable SKU** at the **currently selected location** (top-bar / page location filter).

- SIMPLE: `product_id`, `product_variant_id IS NULL`
- VARIANT: `product_id` + `product_variant_id` (parent VARIANT product is not a stock row)
- BUNDLE: not listed as a stocked SKU

If the UI location filter is “all locations”, quantities are summed per SKU across locations. Prototype current-stock page is location-scoped via the shell outlet selector; production uses the Inventory location context, not till.

### Product stock detail

Shows identity, tracking flags, totals across locations, and per-location balances (On Hand, Reserved, Available) matching the prototype outlet-balance list.

### Dashboard KPIs (tenant-wide unless location filter applied)

| Prototype KPI | Definition |
|---|---|
| Low Stock Items | Count of distinct SKU+location where tracked and 0 < Available <= low_stock_threshold |
| Out of Stock | Count of distinct SKU+location where tracked and Available <= 0 |
| Near Expiry | Count of `product_batches` with status ACTIVE and expiry_date within 30 days (inclusive). 0 if none. Full alerts workspace is deferred. |
| Active Stock Counts | SUM(on_hand_quantity) for tracked balances (prototype label retained; source is on-hand units, not stocktake sessions) |

## Precision

Quantities are `numeric(18,4)`. UI precision follows the SKU inventory UOM. Integer UOMs (each/pcs) reject non-integers. Quantity 0 is invalid for opening, receiving lines, and adjustment delta. Channel limits may be 0 (channel enabled with zero promise).

## Negative stock

`inventory_balances.on_hand_quantity >= 0` is a schema CHECK.

`product_inventory_settings.allow_negative_stock` applies to **sales** deduction, not to Tenant Admin Opening / Receiving / Adjustment.

Adjustment decrease MUST leave:

```text
OnHandAfter >= Reserved + Damaged + Quarantine
OnHandAfter >= 0
```

Prototype copy: stock cannot go below reserved quantity.

## Untracked products

`is_stock_tracked = false` (including BUNDLE parents): excluded from current-stock lists and from opening/receiving/adjustment/allocation posting.
