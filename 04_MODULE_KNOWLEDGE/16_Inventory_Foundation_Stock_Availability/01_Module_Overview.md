<!-- title: Inventory Foundation, Product Tracking & Stock Availability Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Inventory Foundation, Product Tracking & Stock Availability Module Overview

## Purpose

Manage inventory locations, product inventory settings, batches, inventory balances, channel allocations, serial numbers, cost layers, and reorder rules.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Inventory_Foundation_Stock_Availability` |
| Module number | 16 |
| Primary users | Tenant Admin, Store Manager, Cashier consumer, Online store consumer |
| Frontend surfaces | Inventory overview, Stock availability display, Batch/expiry screen, Low-stock alerts |
| API groups | `/api/v1/inventory/locations`, `/api/v1/inventory/balances`, `/api/v1/inventory/batches`, `/api/v1/inventory/reorder-rules`, `/api/v1/pos/stock-availability` |

## Main Tables

| Table | Role |
|---|---|
| `inventory_locations` | Used by this module |
| `product_inventory_settings` | Used by this module |
| `product_batches` | Used by this module |
| `inventory_balances` | Used by this module |
| `inventory_channel_allocations` | Used by this module |
| `serial_numbers` | Used by this module |
| `inventory_cost_layers` | Used by this module |
| `inventory_reorder_rules` | Used by this module |

## Core Business Rules

- Availability is computed from on-hand, reserved, damaged/quarantine, and channel allocation rules.
- Batches support expiry tracking and expiry discounts.
- Serial numbers apply only when product tracking requires them.
- Channel allocation can reserve stock for POS, online store, or click and collect.
- Final stock authority is backend, not device cache.

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

- [[../10_Product_Core/01_Module_Overview]]
- [[../17_Reservations_Stock_Movements_Serial_Cost/01_Module_Overview]]
- [[../28_Offline_Operation_Sync/01_Module_Overview]]

## Out Of Scope

- Supplier purchase ordering
- Offline conflict resolution ownership
- Accounting inventory valuation reports
- Delivery route inventory

## Related Files

- [[04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/16_Inventory_Foundation_Stock_Availability/03_Technical_Contract]]
