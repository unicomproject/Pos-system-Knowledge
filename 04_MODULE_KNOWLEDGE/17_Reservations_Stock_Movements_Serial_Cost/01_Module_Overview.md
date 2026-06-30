<!-- title: Reservations, Stock Movements, Serial & Cost Allocation Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Reservations, Stock Movements, Serial & Cost Allocation Module Overview

## Purpose

Control stock reservations, reservation lines/allocations, stock movement ledgers, movement references, serial movement records, and cost allocations.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Reservations_Stock_Movements_Serial_Cost` |
| Module number | 17 |
| Primary users | Backend system, Cashier, Store Manager, Online checkout |
| Frontend surfaces | Reservation status, Stock movement history, Order hold/checkout stock lock, Serial movement audit |
| API groups | `/api/v1/inventory/reservations`, `/api/v1/inventory/stock-movements`, `/api/v1/inventory/serials`, `/api/v1/inventory/cost-allocations` |

## Main Tables

| Table | Role |
|---|---|
| `inventory_reservations` | Used by this module |
| `inventory_reservation_lines` | Used by this module |
| `inventory_reservation_allocations` | Used by this module |
| `stock_movements` | Used by this module |
| `stock_movement_references` | Used by this module |
| `stock_movement_serials` | Used by this module |
| `stock_movement_cost_allocations` | Used by this module |

## Core Business Rules

- Stock movements are append-only.
- Reservations protect stock during cart checkout, click and collect, or held POS flows.
- Movement reference links stock changes to order, sale, return, exchange, adjustment, or sync source.
- Serial movement must match serial-number tracked products.
- Cost allocation is recorded separately from sale price.

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
- [[../20_Unified_Order_Sales/01_Module_Overview]]
- [[../25_Return_Inspection_Exchange/01_Module_Overview]]

## Out Of Scope

- Manual stocktake counting
- Supplier invoice processing
- Payment refund settlement
- Customer consent records

## Related Files

- [[04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/17_Reservations_Stock_Movements_Serial_Cost/03_Technical_Contract]]
