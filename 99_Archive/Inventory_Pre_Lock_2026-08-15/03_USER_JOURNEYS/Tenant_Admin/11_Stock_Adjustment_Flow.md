<!-- title: Tenant Admin Stock Adjustment Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Stock Adjustment Flow

## Purpose

Defines stock quantity adjustment with validation, reason capture, and audit tracking.

## Actor

Tenant Admin

## Source

Derived from `Slide 11 - Stock Adjustment Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin chooses stock adjustment.

## Preconditions

- Tenant Admin has stock adjustment permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select outlet | Tenant Admin selects outlet. |
| 3 | Search product | Tenant Admin selects product. |
| 4 | Open product stock details | System shows current stock. |
| 5 | Choose stock adjustment | Tenant Admin starts adjustment. |
| 6 | View current stock | System shows stock quantity. |
| 7 | Set adjustment type | Tenant Admin selects increase/decrease. |
| 8 | Enter adjustment quantity | Tenant Admin enters quantity. |
| 9 | Enter reason | Tenant Admin enters reason. |
| 10 | Review updated stock | System previews updated stock. |
| 11 | Validate adjustment | System validates details. |
| 12 | Save adjustment | System saves adjustment, updates inventory, and writes audit log. |

## Data Used Or Captured

- Product
- Outlet
- Current quantity
- Adjustment type
- Adjustment quantity
- Reason

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Reason is mandatory.
- Negative stock handling must follow inventory rules.

## Validation And Error Cases

- Invalid quantity/reason
- Stock below zero if not allowed
- Permission denied

## Outcome

Stock adjustment is saved and audited.

## Related Modules

- 16_Inventory_Foundation_Stock_Availability
- 17_Reservations_Stock_Movements_Serial_Cost
- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/18_Stock_Adjustment_Transfer_And_Stocktake.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md
- 07_UI_UX_KNOWLEDGE/Inventory_UI_Prototype_Screen_Registry.md

## Approved UI Prototype Reference

Prototype Status: APPROVED

Implementation Audit: Pending

UI/UX Lock: Pending

Prototype grouping: INV-UJ-04 Stock Adjustment

Related Prototype Screens:

- INV-UJ04-S01 `15_stock_adjustment_dashboard.html`
- INV-UJ04-S02 `16_stock_adjustment_select.html`
- INV-UJ04-S03 `17_stock_adjustment_enter.html`
- INV-UJ04-S04 `18_stock_adjustment_review.html`
- INV-UJ04-S05 `19_stock_adjustment_success.html`

Canonical pack: `07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/`

This flow's existing business steps are unchanged. Production statuses for the 29-screen release: **DRAFT** and **POSTED**. Pending-approval queue is deferred. Negative stock is forbidden for Tenant Admin adjustments. Implementation audit: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit]].
