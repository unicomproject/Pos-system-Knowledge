<!-- title: Return, Inspection & Exchange Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Return, Inspection & Exchange Module Overview

## Purpose

Manage return reasons, sales returns, return lines, inspections, return events, sales exchanges, exchange lines, and exchange events.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Return_Inspection_Exchange` |
| Module number | 25 |
| Primary users | Cashier, Store Manager, Customer |
| Frontend surfaces | Return search, Return item selection, Inspection capture, Exchange flow |
| API groups | `/api/v1/returns`, `/api/v1/returns/{id}/inspection`, `/api/v1/exchanges`, `/api/v1/pos/returns`, `/api/v1/pos/exchanges` |

## Main Tables

| Table | Role |
|---|---|
| `return_reasons` | Used by this module |
| `sales_returns` | Used by this module |
| `sales_return_lines` | Used by this module |
| `return_inspections` | Used by this module |
| `sales_return_events` | Used by this module |
| `sales_exchanges` | Used by this module |
| `sales_exchange_lines` | Used by this module |
| `sales_exchange_events` | Used by this module |

## Core Business Rules

- Return must reference original order/sale.
- Returned quantity cannot exceed sold and not-yet-returned quantity.
- Inspection records condition and disposition before restock, scrap, or reject decisions.
- Exchange records old value, new value, and difference direction.
- Online return request is allowed only if the business policy enables it; supplier return is separate.

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

- [[../20_Unified_Order_Sales/01_Module_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]
- [[../09_Catalog_Master_Data/01_Module_Overview]]

## Out Of Scope

- Supplier return to vendor
- Advanced warranty claims
- Delivery pickup return logistics
- Accounting journal posting

## Related Files

- [[04_MODULE_KNOWLEDGE/25_Return_Inspection_Exchange/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/25_Return_Inspection_Exchange/03_Technical_Contract]]
