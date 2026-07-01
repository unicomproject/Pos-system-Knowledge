<!-- title: Product Option Templates & Variant Configuration Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Product Option Templates & Variant Configuration Module Overview

## Purpose

Define reusable option templates, option values, business type option defaults, product options, product option values, and variant option mapping.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Option_Variant_Configuration` |
| Module number | 12 |
| Primary users | Tenant Admin, Food stall manager, Merchandise shop manager |
| Frontend surfaces | Variant option builder, Size/color configuration, Food/beverage option setup |
| API groups | `/api/v1/product-option-templates`, `/api/v1/products/{id}/options`, `/api/v1/products/{id}/variants/options` |

## Main Tables

| Table | Role |
|---|---|
| `product_option_templates` | Used by this module |
| `product_option_template_values` | Used by this module |
| `business_type_option_templates` | Used by this module |
| `product_options` | Used by this module |
| `product_option_values` | Used by this module |
| `product_variant_option_values` | Used by this module |

## Core Business Rules

- Option templates standardize common values such as size, color, portion, or type.
- Variant option combinations identify sellable variants.
- Business type defaults can speed setup for stalls, beverage counters, and merchandise shops.
- Option values shown online must match sellable variant configuration.
- Do not use option templates for combo choice groups; combos have their own module.

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
- [[../11_Product_Media_Attributes_Channel_Visibility/01_Module_Overview]]

## Out Of Scope

- Combo component logic
- Price list ownership
- Stock movement ledger
- Customer consent

## Related Files

- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract]]
