<!-- title: Fulfilment & Pickup / Click & Collect Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Fulfilment & Pickup / Click & Collect Module Overview

## Purpose

Manage fulfilment methods, outlet support, pickup slots, slot reservations, fulfilment orders/lines/events, pickup orders, and pickup events for click and collect.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Fulfilment_Pickup_ClickCollect` |
| Module number | 23 |
| Primary users | Customer, Fulfilment staff, Store Manager, Cashier |
| Frontend surfaces | Pickup slot selection, Order preparation board, Ready for collection state, Collection confirmation |
| API groups | `/api/v1/fulfilment/methods`, `/api/v1/pickup/slots`, `/api/v1/fulfilment-orders`, `/api/v1/pickup-orders`, `/api/v1/pickup-events` |

## Main Tables

| Table | Role |
|---|---|
| `fulfillment_methods` | Used by this module |
| `fulfillment_method_outlets` | Used by this module |
| `pickup_slots` | Used by this module |
| `pickup_slot_reservations` | Used by this module |
| `fulfillment_orders` | Used by this module |
| `fulfillment_order_lines` | Used by this module |
| `fulfillment_order_events` | Used by this module |
| `pickup_orders` | Used by this module |
| `pickup_order_events` | Used by this module |

## Core Business Rules

- Click and collect requires a valid outlet and fulfilment method.
- Pickup slot reservations protect capacity until checkout/order confirmation.
- Fulfilment and pickup events are append-only.
- Collected status must be backend confirmed, not just UI changed.
- Own delivery is later phase and must not be mixed into pickup state.

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
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[../26_Notification/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]

## Out Of Scope

- Driver assignment
- Delivery fee calculation
- Third-party courier integration
- Kitchen display automation

## Related Files

- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/23_Fulfilment_Pickup_ClickCollect/03_Technical_Contract]]
