<!-- title: Tenant Admin Inventory Stock Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Inventory Stock Management Flow

## Purpose

Defines inventory overview and stock action selection.

## Current 29-screen implementation scope

IN SCOPE as Inventory Overview / Current Stock (TA-UJ-045). Dashboard tiles follow the approved prototype. Opening Stock and Channel Allocation have their own journeys (TA-UJ-063, TA-UJ-064).

## Actor

Tenant Admin

## Source

Derived from `Slide 10 - Inventory / Stock Management Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin opens inventory module.

## Preconditions

- Tenant Admin has inventory permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory dashboard. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | View current stock | System shows stock by product/outlet. |
| 4 | Search product | Tenant Admin finds product. |
| 5 | Choose stock action | Tenant Admin selects adjustment, stock in, stock out, stock transfer, or stock count. |
| 6 | Enter quantity | Tenant Admin enters quantity. |
| 7 | Enter reason | Tenant Admin provides reason. |
| 8 | Validate stock action | System validates action and stock rules. |
| 9 | Save stock update | System saves action. |
| 10 | Inventory updated | System updates inventory and creates audit log. |

## Data Used Or Captured

- Product
- SKU
- Outlet
- Stock quantity
- Stock status
- Action type
- Reason
- Audit log

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Stock transfer is not active MVP scope unless separately approved.
- Stock updates must be audit-ready.

## Validation And Error Cases

- Invalid quantity
- Missing reason
- Out of stock
- Permission denied

## Outcome

Inventory action is processed when valid and audit log is created.

## Related Modules

- 16_Inventory_Foundation_Stock_Availability
- 17_Reservations_Stock_Movements_Serial_Cost
- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md
- 06_DATABASE_KNOWLEDGE/Tables/18_Stock_Adjustment_Transfer_And_Stocktake.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md
- 07_UI_UX_KNOWLEDGE/Inventory_UI_Prototype_Screen_Registry.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit.md

## Approved UI Prototype Reference

Prototype Status: APPROVED

Implementation Audit: Pending

UI/UX Lock: Pending

Prototype grouping: INV-UJ-01 Inventory Overview / Current Stock

Related Prototype Screens:

- INV-UJ01-S01 `01_inventory_dashboard.html`
- INV-UJ01-S02 `02_current_stock.html`
- INV-UJ01-S03 `03_product_stock_detail.html`

Canonical pack: `07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/`

This flow's existing business steps are unchanged. **29-screen dashboard follows the approved prototype** (Current Stock, Opening Stock, Stock Adjustment live; Stock Count tile deferred). Receiving and Channel Allocation enter from Inventory module navigation. Opening Stock = TA-UJ-063. Channel Allocation = TA-UJ-064. Implementation audit: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit]].
