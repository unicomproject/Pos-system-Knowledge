<!-- title: Payment & Refund Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Payment & Refund Module Overview

## Purpose

Support payment methods, sales payments, payment transactions/events, refunds, refund payment allocations, and refund lines across POS and online channels.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Payment_Refund` |
| Module number | 24 |
| Primary users | Cashier, Customer, Store Manager, Tenant Admin |
| Frontend surfaces | POS payment screen, Online payment handoff, Split payment allocation, Refund processing |
| API groups | `/api/v1/payments`, `/api/v1/payment-transactions`, `/api/v1/refunds`, `/api/v1/pos/payments`, `/api/v1/storefront/payments` |

## Main Tables

| Table | Role |
|---|---|
| `payment_methods` | Used by this module |
| `sales_payments` | Used by this module |
| `sales_payment_transactions` | Used by this module |
| `sales_payment_events` | Used by this module |
| `sales_refunds` | Used by this module |
| `sales_refund_payment_allocations` | Used by this module |
| `sales_refund_lines` | Used by this module |

## Core Business Rules

- Cash, card, QR, and split payments are supported by configured payment methods.
- Sensitive card data must never be stored.
- Payment event history records provider and device outcomes safely.
- Refund amount cannot exceed allowed refundable amount.
- Offline mode cannot finalize card/QR payment or refund approval.

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
- [[../21_POS_Operations/01_Module_Overview]]
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[../25_Return_Inspection_Exchange/01_Module_Overview]]

## Out Of Scope

- Subscription invoice payment links
- Accounting settlement ledger
- Chargeback management
- PCI vault storage

## Related Files

- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/24_Payment_Refund/03_Technical_Contract]]
