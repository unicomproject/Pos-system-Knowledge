<!-- title: Inventory Foundation, Product Tracking & Stock Availability Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Inventory Foundation — Module Overview

## Purpose

Canonical live module folder for inventory locations, tracking settings, balances, channel allocations, serials, batches, cost layers, and reorder rules.

Schema source of truth remains:

`06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`

## Module number

16

## Primary users

Tenant Admin (29-screen Inventory implementation). Store staff consume balances via POS; not this UI pack.

## Current 29-screen implementation scope

IN SCOPE from this module:

- Locations and balances (overview, current stock, product detail)
- Opening stock posting against balances
- Channel allocations (Model B)
- Serial identity used by receiving/registry
- Batch/expiry when product tracking requires it

DEFERRED from this module for the 29-screen release:

- Reorder automation / supplier reorder
- Full alerts workspace (dashboard KPI subset is in scope)
- Cost-layer accounting beyond storing unit cost on opening/receiving movements

## Related Files

- [[02_Inventory_Business_Rules]]
- [[03_Inventory_Quantity_Model]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability]]
- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Implementation_Audit]]
