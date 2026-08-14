<!-- title: Tenant Admin Stock In Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Tenant Admin Stock In Flow

## Purpose

Defines receiving stock with quantity capture, source details, and audit tracking.

Production UI label: **Stock Receiving**. Canonical ID remains TA-UJ-046.

## Actor

Tenant Admin

## Source

Derived from `Slide 12 - Stock In Flow` in `tenant-full-journey.pptx` and aligned to OneVerz POS MVP Second Brain scope.

## Trigger

Tenant Admin chooses Stock In.

## Preconditions

- Tenant Admin has stock-in permission.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open inventory module | System opens inventory. |
| 2 | Select outlet/warehouse | Tenant Admin selects destination. |
| 3 | Search product | Tenant Admin finds product. |
| 4 | Open product stock details | System shows current stock. |
| 5 | Choose stock in | Tenant Admin chooses receiving action. |
| 6 | View current stock | System shows current quantity. |
| 7 | Enter received quantity | Tenant Admin enters quantity. |
| 8 | Enter supplier/source reference | Tenant Admin enters source or reference if needed. |
| 9 | Add batch/expiry if needed | Tenant Admin enters batch/expiry data where applicable. |
| 10 | Review updated stock | System previews stock after receiving. |
| 11 | Validate stock in | System validates data. |
| 12 | Save stock in | System updates inventory and creates audit log. |

## Data Used Or Captured

- Product
- Outlet/warehouse
- Received quantity
- Supplier/source reference
- Batch/expiry if applicable

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Supplier management is not full MVP scope; source/reference may be basic only unless approved.

## Validation And Error Cases

- Invalid quantity
- Missing required source/reference
- Invalid batch/expiry

## Outcome

Received stock is added and audited.

## Related Modules

- 16_Inventory_Foundation_Stock_Availability
- 17_Reservations_Stock_Movements_Serial_Cost
- 18_Stock_Adjustment_Transfer_Stocktake

## Related Files

- 06_DATABASE_KNOWLEDGE/Tables/17_Reservations_Stock_Movements_Serial_And_Cost_Allocation.md
- 07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype.md
- 07_UI_UX_KNOWLEDGE/Inventory_UI_Prototype_Screen_Registry.md

## Approved UI Prototype Reference

Prototype Status: APPROVED

Implementation Audit: Pending

UI/UX Lock: Pending

Prototype grouping: INV-UJ-03 Stock Receiving

Related Prototype Screens:

- INV-UJ03-S01 `08_stock_receiving_dashboard.html`
- INV-UJ03-S02 `09_new_stock_receipt_select.html`
- INV-UJ03-S03 `10_receiving_enter_details.html`
- INV-UJ03-S04 `11_receiving_review.html`
- INV-UJ03-S05 `12_receiving_confirm.html`
- INV-UJ03-S06 `13_receiving_success.html`
- INV-UJ03-S07 `14_serial_number_registry.html`

Canonical pack: `07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/`

This flow's existing business steps are unchanged. Production UI label is **Stock Receiving** (TA-UJ-046 retained; Stock In is alias). Supplier is a required name on the receipt, not a full supplier-master module. Stock increases only on Confirm Receive. Implementation audit: [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit]].
