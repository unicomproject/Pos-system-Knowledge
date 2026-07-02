<!-- title: Stock Adjustment, Transfer & Stocktake Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Stock Adjustment, Transfer & Stocktake Module Overview

## Purpose

Manage adjustment reasons, stock adjustments/lines, outlet/location stock transfers, transfer status history, stocktake sessions, stocktake lines, and serial stocktake lines.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Stock_Adjustment_Transfer_Stocktake` |
| Module number | 18 |
| Primary users | Tenant Admin, Store Manager, Inventory staff |
| Frontend surfaces | Stock adjustment form, Transfer workflow, Stocktake session, Variance review |
| API groups | `/api/v1/inventory/adjustments`, `/api/v1/inventory/transfers`, `/api/v1/inventory/stocktakes` |

## Main Tables

| Table | Role |
|---|---|
| `stock_adjustment_reasons` | Used by this module |
| `stock_adjustments` | Used by this module |
| `stock_adjustment_lines` | Used by this module |
| `stock_transfers` | Used by this module |
| `stock_transfer_lines` | Used by this module |
| `stock_transfer_status_history` | Used by this module |
| `stocktake_sessions` | Used by this module |
| `stocktake_lines` | Used by this module |
| `stocktake_line_serials` | Used by this module |

## Core Business Rules

- Adjustment requires reason and audit.
- Stock transfer uses explicit status history from request to receive/cancel.
- Stocktake captures counted quantity and variance against system quantity.
- Serial tracked items require serial-level stocktake lines.
- Transfer is included for unified commerce scope because multi-outlet growth is part of the MVP direction.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]
- [[../17_Reservations_Stock_Movements_Serial_Cost/01_Module_Overview]]
- [[../07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]

## Out Of Scope

- Supplier purchase order lifecycle
- Delivery driver route status
- Full accounting stock journals
- AI stock prediction

## Related Files

- [[04_MODULE_KNOWLEDGE/18_Stock_Adjustment_Transfer_Stocktake/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/18_Stock_Adjustment_Transfer_Stocktake/03_Technical_Contract]]
