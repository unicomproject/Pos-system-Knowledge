<!-- title: Product Combo, Choice Options & Inventory Impact Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Product Combo, Choice Options & Inventory Impact Module Overview

## Purpose

Support combo meals/bundles, combo components, combo groups, choice options, product choice groups, and inventory impact from selected choices.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Combo_Choice_Inventory_Impact` |
| Module number | 13 |
| Primary users | Tenant Admin, Food stall manager, Cashier |
| Frontend surfaces | Combo builder, Choice group setup, POS combo selection, Online combo selection |
| API groups | `/api/v1/product-combos`, `/api/v1/choice-groups`, `/api/v1/products/{id}/choices`, `/api/v1/pos/combo-selection` |

## Main Tables

| Table | Role |
|---|---|
| `combo_definitions` | Used by this module |
| `combo_components` | Used by this module |
| `combo_groups` | Used by this module |
| `combo_group_items` | Used by this module |
| `choice_groups` | Used by this module |
| `choice_options` | Used by this module |
| `product_choice_groups` | Used by this module |
| `product_choice_options` | Used by this module |
| `choice_option_inventory_impacts` | Used by this module |

## Core Business Rules

- Combo definitions describe the sellable bundle.
- Choice groups control allowed customer/cashier selections.
- Choice option inventory impacts must reduce the correct ingredient/product stock.
- Combo selections must snapshot selected options into cart/order lines.
- Do not model advanced coupon or promotion stacking in combo logic.

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
- [[../16_Inventory_Foundation_Stock_Availability/01_Module_Overview]]
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]

## Out Of Scope

- Supplier recipe costing
- AI menu extraction
- Full kitchen display system
- Delivery driver workflow

## Related Files

- [[04_MODULE_KNOWLEDGE/13_Product_Combo_Choice_Inventory_Impact/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/13_Product_Combo_Choice_Inventory_Impact/03_Technical_Contract]]
