<!-- title: POS Operations Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# POS Operations Module Overview

## Purpose

Support mobile POS and desktop POS workflows: held sales, receipts, receipt templates, print logs, till summaries, payment summaries, session events, and till cash movements.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `POS_Operations` |
| Module number | 21 |
| Primary users | Cashier, Stall Operator, Store Manager |
| Frontend surfaces | Mobile POS, Desktop POS, Park/recall sale, Receipt print/reprint, Till close summary |
| API groups | `/api/v1/pos/home`, `/api/v1/pos/holds`, `/api/v1/pos/receipts`, `/api/v1/pos/till-summary`, `/api/v1/pos/events` |
| Current implementation note | Flutter park/recall is device-local and does not call `/api/v1/pos/holds`; Cash In/Out has no mutation API |

## Main Tables

| Table | Role |
|---|---|
| `pos_order_holds` | Used by this module |
| `receipts` | Used by this module |
| `receipt_print_logs` | Used by this module |
| `receipt_templates` | Used by this module |
| `receipt_template_versions` | Used by this module |
| `receipt_template_assignments` | Used by this module |
| `till_session_summaries` | Used by this module |
| `till_session_payment_summaries` | Used by this module |
| `till_session_events` | Used by this module |
| `till_cash_movements` | Used by this module |

## Core Business Rules

- Portable POS uses the same POS rules as fixed POS.
- Receipt print failure does not cancel a completed backend sale.
- Parked/held sale must remain tenant, outlet, till, and user scoped.
- Till summary uses completed sales, payments, refunds, and cash movements.
- Backend Holds is implemented, but current Flutter held-sale authority is local
  secure storage and therefore disconnected.
- Customer display is future unless explicitly enabled.

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

- [[../08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[../20_Unified_Order_Sales/01_Module_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]
- [[../28_Offline_Operation_Sync/01_Module_Overview]]

## Out Of Scope

- Online storefront browsing
- Customer account password reset
- Subscription invoice payment links
- Warehouse stock transfer approval

## Related Files

- [[04_MODULE_KNOWLEDGE/21_POS_Operations/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/21_POS_Operations/03_Technical_Contract]]
