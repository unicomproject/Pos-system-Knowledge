<!-- title: Product Core Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Product Core Module Overview

## Purpose

Manage products and variants that can be sold in mobile POS, desktop POS, online store, click and collect, and temporary retail locations.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Core` |
| Module number | 10 |
| Primary users | Tenant Admin, Store Manager, Cashier consumer |
| Frontend surfaces | Product list, Product form, Variant management, POS product grid/search |
| API groups | `/api/v1/products`, `/api/v1/products/{id}/variants`, `/api/v1/pos/products`, `/api/v1/storefront/products` |

## Main Tables

| Table | Role |
|---|---|
| `products` | Used by this module |
| `product_variants` | Used by this module |

## Core Business Rules

- Product and variant identifiers are tenant-scoped.
- SKU and barcode uniqueness must be enforced by tenant and variant rules.
- Variants carry sellable identity; price and stock remain separate modules.
- Inactive products cannot be sold through POS or online store.
- POS may cache product reference data, but backend remains final authority.

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

- [[../09_Catalog_Master_Data/01_Module_Overview]]
- [[../14_Pricing_Tax_Management/01_Module_Overview]]
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]

## Out Of Scope

- Price list calculation
- Tax rule ownership
- Stock movement ledger
- Customer cart persistence

## Related Files

- [[04_MODULE_KNOWLEDGE/10_Product_Core/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/10_Product_Core/03_Technical_Contract]]
