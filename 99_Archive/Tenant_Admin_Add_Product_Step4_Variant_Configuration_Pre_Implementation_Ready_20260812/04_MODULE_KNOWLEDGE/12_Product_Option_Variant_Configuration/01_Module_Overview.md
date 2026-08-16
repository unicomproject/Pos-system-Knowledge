<!-- title: Product Option Templates & Variant Configuration Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

# Product Option Templates & Variant Configuration Module Overview

## Purpose

Define reusable option templates, option values, business type option defaults, product options, product option values, variant option mapping, and the canonical Add Product Step 4 Variant Configuration specification.

This module is part of the OneVerz POS MVP scope: mobile and desktop EPOS, responsive online store, offline-capable operation, click and collect, multi-device support, and low-cost hardware usage for events, stalls, food and beverage, merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Option_Variant_Configuration` |
| Module number | 12 |
| Primary users | Tenant Admin, Food stall manager, Merchandise shop manager |
| Frontend surfaces | Variant option builder, Size/color configuration, Food/beverage option setup, Add Product Step 4 (Variant Configuration) |
| API groups | `/api/v1/tenant-admin/products/{id}/draft`, `/api/v1/tenant-admin/products/create-options` |
| Specification | [[Tenant_Admin_Product_Variant_Configuration_Specification]] |

## Main Tables

| Table | Role |
|---|---|
| `product_option_templates` | Platform master option templates (Size, Colour, Material, etc.) |
| `product_option_template_values` | Master values linked to option templates |
| `business_type_option_templates` | Default templates associated with tenant business types |
| `product_options` | Product-specific option headers owned by tenant |
| `product_option_values` | Product-specific option values owned by tenant (includes `image_media_asset_id`) |
| `product_variant_option_values` | Join table mapping `product_variants` to `product_option_values` |

## Core Business Rules

- Option templates standardize common values such as size, color, portion, or type.
- Variant option combinations identify sellable variants via deterministic `option_combination_hash` (SHA-256).
- Add Product Step 4 uses **`Include Variant`** (never "Availability") to toggle global variant inclusion.
- Step 4 does NOT configure SKU, Barcode, Selling Price, Cost Price, Tax, Opening Stock, or Channel Visibility (belonging to Steps 5, 6, and 7).
- Option values shown online must match sellable variant configuration.
- Do not use option templates for combo choice groups; combos have their own module.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | `product_catalog` (Module: `product_management`) |
| Permission | `catalog.products.create` / `catalog.products.update` + `catalog.variants.manage` + `catalog.product_media.manage` |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for variant generation, edition, archiving, and image overrides |

## Dependencies

- [[../10_Product_Core/01_Module_Overview]]
- [[../11_Product_Media_Attributes_Channel_Visibility/01_Module_Overview]]
- [[Tenant_Admin_Product_Variant_Configuration_Specification]]

## Related Files

- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/03_Technical_Contract]]
- [[Tenant_Admin_Product_Variant_Configuration_Specification]]
