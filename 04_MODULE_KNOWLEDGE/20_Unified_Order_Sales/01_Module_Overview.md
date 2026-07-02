<!-- title: Unified Order & Sales Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Unified Order & Sales Module Overview

## Purpose

Represent one order/sale model for in-store POS, online ordering, click and collect, and temporary retail sales, including lines, options, components, discounts, taxes, charges, and status history.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Unified_Order_Sales` |
| Module number | 20 |
| Primary users | Cashier, Customer, Store Manager, Fulfilment staff |
| Frontend surfaces | Order management, POS sale detail, Online order detail, Customer order tracking |
| API groups | `/api/v1/orders`, `/api/v1/orders/{id}`, `/api/v1/sales-orders`, `/api/v1/order-status` |

## Main Tables

| Table | Role |
|---|---|
| `document_number_sequences` | Used by this module |
| `sales_orders` | Used by this module |
| `sales_order_lines` | Used by this module |
| `sales_order_line_options` | Used by this module |
| `sales_order_line_components` | Used by this module |
| `sales_order_discounts` | Used by this module |
| `sales_order_taxes` | Used by this module |
| `sales_order_charges` | Used by this module |
| `sales_order_status_history` | Used by this module |
| `sales_order_line_status_history` | Used by this module |

## Core Business Rules

- Sales order is the unified transaction header for POS and online channels.
- Order lines snapshot product, option, component, price, tax, and discount facts.
- Status history is append-only and drives auditability.
- Document numbers must come from controlled sequences.
- Order total is backend validated before payment and fulfilment.

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

- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]
- [[../23_Fulfilment_Pickup_ClickCollect/01_Module_Overview]]
- [[../21_POS_Operations/01_Module_Overview]]

## Out Of Scope

- Shopping cart draft state
- Payment provider settlement internals
- Return inspection details
- Notification template content

## Related Files

- [[04_MODULE_KNOWLEDGE/20_Unified_Order_Sales/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/20_Unified_Order_Sales/03_Technical_Contract]]
