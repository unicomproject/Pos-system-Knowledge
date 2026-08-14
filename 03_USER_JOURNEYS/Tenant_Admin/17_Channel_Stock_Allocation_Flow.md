<!-- title: Tenant Admin Channel Stock Allocation Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->
<!-- canonical_id: TA-UJ-064 -->

# Tenant Admin Channel Stock Allocation Flow

**TA-UJ-064 — LOCKED FOR CURRENT INVENTORY RELEASE**

## Contract lock (current Inventory release)

```text
Journey contract: LOCKED FOR CURRENT INVENTORY RELEASE
Prototype: APPROVED
Implementation Audit: PASS
UI/UX Contract: LOCKED
Implementation Contract: LOCKED
Frontend Implementation: NOT STARTED
Backend Implementation: NOT STARTED
QA Execution: NOT STARTED
```

Canonical lock: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Lock_Manifest]]

Canonical journey ID: **TA-UJ-064**  
Prototype grouping: INV-UJ-05  
Prototype screens: INV-UJ05-S01 … INV-UJ05-S10

## Purpose

Set how much available location stock may be promised to each enabled sales channel. This does **not** move physical on-hand stock.

## Actor

Tenant Admin

## Allocation model (canonical)

**Model B — availability control, not a physical transfer.**

`inventory_channel_allocations.allocation_limit_quantity` is a channel promise limit. `inventory_balances.on_hand_quantity` does not change when an allocation is confirmed.

## Trigger

Tenant Admin opens Channel Stock Allocation from Inventory module navigation (not a dashboard tile in the approved prototype).

## Preconditions

- Authenticated Tenant Admin.
- Entitlement `inventory_tracking`.
- View: `inventory.channel_allocation.view`. Manage/post: `inventory.channel_allocation.manage`.
- Source location, product/variant, and channels belong to the tenant.
- Product is SIMPLE or VARIANT and stock-tracked. BUNDLE is not allocatable.

## Canonical stepper (production)

Prototype stepper labels drift across screens. Production uses this order:

1. Select Source (INV-UJ05-S02)
2. Search Product (INV-UJ05-S03)
3. Product Details (INV-UJ05-S04)
4. Select Channels (INV-UJ05-S05)
5. Enter Quantity (INV-UJ05-S06)
6. Review (INV-UJ05-S07)
7. Confirm (INV-UJ05-S08)
8. Success (INV-UJ05-S09)

Allocation Details (INV-UJ05-S10) is a **read** screen from the dashboard row or View Allocation — not a wizard step.

## Screen sequence

| Step | Screen ID | Prototype | Stock mutation |
|---|---|---|---|
| Dashboard | INV-UJ05-S01 | `20_channel_allocation_dashboard.html` | None |
| Select source | INV-UJ05-S02 | `21_channel_select_source.html` | None |
| Search product | INV-UJ05-S03 | `22_channel_search_product.html` | None |
| Product details | INV-UJ05-S04 | `23_channel_product_details.html` | None |
| Select channels | INV-UJ05-S05 | `24_channel_select_channels.html` | None |
| Enter quantity | INV-UJ05-S06 | `25_channel_enter_quantity.html` | None |
| Review | INV-UJ05-S07 | `26_channel_review.html` | None |
| Confirm | INV-UJ05-S08 | `27_channel_confirm.html` | **Yes — allocation rows only, not on-hand** |
| Success | INV-UJ05-S09 | `28_channel_success.html` | None |
| Details | INV-UJ05-S10 | `29_channel_allocation_detail.html` | None |

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open dashboard | Lists recent allocations. New Allocation starts the wizard. |
| 2 | Select source location | Outlet/warehouse inventory location. |
| 3 | Search/select product | Tracked SKUs at that location. |
| 4 | Review product stock | Shows on-hand, reserved, available, already allocated, safety buffer, allocatable. |
| 5 | Select sales channels | Enabled tenant channels only. Marketplace (Beta) remains disabled / not allocatable in this release. |
| 6 | Enter per-channel qty + safety buffer | Quantities >= 0. Sum(channel limits) + safety buffer <= Available. |
| 7 | Review | Validation checklist. Edit returns to quantity or channel step. |
| 8 | Confirm Allocation | Upserts `inventory_channel_allocations` for the location+SKU+channels. Writes audit. Does not write `stock_movements`. |
| 9 | Success | View Allocation → details. Allocate Another → select source. Back to Dashboard. |

## Details screen contract (GAP-INV-016)

INV-UJ05-S10 prototype fixture lists outlet names under “Selected Channels”. Production **must** show **sales channel** names and quantities (POS, Online Store, Click & Collect, Delivery, plus safety buffer), matching screens 24–28. Source location remains the outlet/warehouse.

## Back / Cancel

- Back returns to the previous wizard step.
- Confirm **Cancel** returns to dashboard without posting.
- Review does not mutate allocations.

## Channels in current scope

Only channels that exist for the tenant and are enabled. Prototype shows POS, Online Store, Click & Collect, Delivery. Marketplace (Beta) is disabled — DEFERRED.

## Outcome

Channel promise limits are stored. Physical on-hand is unchanged.

## Related Files

- 04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Inventory_Business_Rules.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md
