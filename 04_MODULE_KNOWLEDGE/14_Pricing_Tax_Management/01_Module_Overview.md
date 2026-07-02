<!-- title: Pricing & Tax Management Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Pricing & Tax Management Module Overview

## Purpose

Manage price lists, outlet/channel price assignment, price list items, tax jurisdictions, tax classes, tax rates, tax class rates, and product tax assignments.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Pricing_Tax_Management` |
| Module number | 14 |
| Primary users | Tenant Admin, Store Manager, Platform Support |
| Frontend surfaces | Price list setup, Tax setup, Product pricing panel, Checkout calculation support |
| API groups | `/api/v1/pricing/price-lists`, `/api/v1/pricing/price-list-items`, `/api/v1/tax/classes`, `/api/v1/tax/rates`, `/api/v1/products/{id}/tax` |

## Main Tables

| Table | Role |
|---|---|
| `price_lists` | Used by this module |
| `price_list_outlets` | Used by this module |
| `price_list_channels` | Used by this module |
| `price_list_items` | Used by this module |
| `tax_jurisdictions` | Used by this module |
| `tax_classes` | Used by this module |
| `tax_rates` | Used by this module |
| `tax_class_rates` | Used by this module |
| `product_tax_assignments` | Used by this module |

## Core Business Rules

- Price can vary by outlet and sales channel.
- Tax must be calculated from assigned tax class/rate rules.
- Checkout snapshots price and tax on order lines.
- Cached price/tax is only a reference; backend validates final totals.
- Do not store gateway fees or accounting tax journals here.

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
- [[../07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]

## Out Of Scope

- Subscription plan pricing
- Payment settlement
- Discount policy approval
- Inventory cost layers

## Related Files

- [[04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/14_Pricing_Tax_Management/03_Technical_Contract]]
