<!-- title: Product Media, Attributes & Channel Visibility Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Product Media, Attributes & Channel Visibility Module Overview

## Purpose

Control product images, barcodes, attribute definitions/options/values, and channel visibility for POS, online store, click and collect, and future delivery channels.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Product_Media_Attributes_Channel_Visibility` |
| Module number | 11 |
| Primary users | Tenant Admin, Store Manager, Online store merchandiser |
| Frontend surfaces | Product media upload, Attribute management, Channel visibility toggles, Storefront product publishing |
| API groups | `/api/v1/products/{id}/images`, `/api/v1/products/{id}/barcodes`, `/api/v1/product-attributes`, `/api/v1/product-channel-visibility` |

## Main Tables

| Table | Role |
|---|---|
| `product_categories` | Used by this module |
| `product_collections` | Used by this module |
| `product_images` | Used by this module |
| `product_barcodes` | Used by this module |
| `product_attribute_definitions` | Used by this module |
| `product_attribute_options` | Used by this module |
| `product_attribute_values` | Used by this module |
| `product_attribute_value_options` | Used by this module |
| `product_channel_visibility` | Used by this module |

## Core Business Rules

- Online store visibility must be explicit and channel-driven.
- A product visible online still requires valid price, stock policy, and fulfilment support.
- Images are metadata records; binary files live in object storage.
- Barcode lookup must resolve to an active product or variant.
- Attribute values support filtering and variant display but do not replace option templates.

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
- [[../22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[../01_Platform_Administration/01_Module_Overview]]

## Out Of Scope

- Payment images
- Inventory serial numbers
- Checkout session state
- Customer authentication

## Related Files

- [[04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/03_Technical_Contract]]
