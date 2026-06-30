<!-- title: Reporting & Analytics Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Reporting & Analytics Module Overview

## Purpose

Provide MVP sales, product, inventory, order, payment, and dashboard reporting for mobile/desktop EPOS, online ordering, and click and collect operations.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Reporting_Analytics` |
| Module number | 27 |
| Primary users | Tenant Admin, Store Manager, Platform Admin, Permitted cashier |
| Frontend surfaces | Dashboard, Sales reports, Product reports, Inventory reports, Order reports, Export jobs |
| API groups | `/api/v1/reports/sales`, `/api/v1/reports/products`, `/api/v1/reports/inventory`, `/api/v1/reports/orders`, `/api/v1/reports/exports`, `/api/v1/analytics/dashboard` |

## Main Tables

| Table | Role |
|---|---|
| `daily_sales_summaries` | Used by this module |
| `daily_payment_summaries` | Used by this module |
| `daily_inventory_summaries` | Used by this module |
| `daily_discount_return_summaries` | Used by this module |
| `report_export_jobs` | Used by this module |
| `sales_orders` | Used by this module |
| `sales_payments` | Used by this module |
| `inventory_balances` | Used by this module |

## Core Business Rules

- Reports respect tenant, outlet, channel, and permission boundaries.
- Dashboard values come from backend projections, not hardcoded UI cards.
- Large reports should use export jobs or precomputed summaries.
- Reports can combine POS and online channels but must show channel filters.
- AI analytics is future and must not be implied by MVP reporting.

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
- [[../26_Notification/01_Module_Overview]]

## Out Of Scope

- Full accounting reports
- Predictive AI analytics
- General ledger
- Cross-tenant data visibility

## Related Files

- [[04_MODULE_KNOWLEDGE/27_Reporting_Analytics/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/27_Reporting_Analytics/03_Technical_Contract]]
