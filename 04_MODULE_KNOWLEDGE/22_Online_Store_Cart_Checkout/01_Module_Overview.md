<!-- title: Online Storefront, Cart & Checkout Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Online Storefront, Cart & Checkout Module Overview

## Purpose

Provide responsive customer website browsing, product search/filtering, shopping cart, checkout sessions, checkout lines/options/components, and checkout event tracking.

This module is part of the new OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Online_Store_Cart_Checkout` |
| Module number | 22 |
| Primary users | Customer, Event Visitor, Merchandise Buyer, Click and Collect Customer |
| Frontend surfaces | Responsive online store website, Product catalog/search/filter, Shopping cart, Online checkout |
| API groups | `/api/v1/storefront/catalog`, `/api/v1/storefront/products`, `/api/v1/carts`, `/api/v1/checkout`, `/api/v1/checkout/events` |

## Main Tables

| Table | Role |
|---|---|
| `shopping_carts` | Used by this module |
| `shopping_cart_items` | Used by this module |
| `shopping_cart_item_options` | Used by this module |
| `shopping_cart_item_components` | Used by this module |
| `checkout_sessions` | Used by this module |
| `checkout_session_lines` | Used by this module |
| `checkout_session_line_options` | Used by this module |
| `checkout_session_line_components` | Used by this module |
| `checkout_events` | Used by this module |
| `product_channel_visibility` | Used by this module |
| `price_list_channels` | Used by this module |

## Core Business Rules

- Online store is browser-based and must not require app download.
- Only channel-visible active products can appear online.
- Checkout session is temporary until it becomes a backend order.
- Checkout totals must be recalculated server-side before payment.
- Delivery is later phase; current online scope focuses ordering and click and collect.

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

- [[../11_Product_Media_Attributes_Channel_Visibility/01_Module_Overview]]
- [[../14_Pricing_Tax_Management/01_Module_Overview]]
- [[../20_Unified_Order_Sales/01_Module_Overview]]
- [[../19_Customer_Account_Consent/01_Module_Overview]]

## Out Of Scope

- Native customer mobile app
- Own delivery management
- Marketplace seller portal
- Offline customer checkout

## Related Files

- [[04_MODULE_KNOWLEDGE/22_Online_Store_Cart_Checkout/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/22_Online_Store_Cart_Checkout/03_Technical_Contract]]

## Tenant Admin Native Online Store Ownership — 2026-08-27

The module owns three separate surfaces:

1. Platform Admin bootstrap (`SA-ST-UJ-011`) — initial tenant readiness only.
2. Tenant Admin setup/publish (`EC-TA-UJ-02` / `TA-UJ-063`) — the canonical nine-step configuration and live-management journey.
3. Customer storefront — browse, account, cart, checkout and collection experience.

The Tenant Admin flow configures OneVerz's native Online Store sales channel. It is not Shopify/WooCommerce integration. Release 1 is registered-customer Click & Collect with Pay at Pickup; delivery, online gateway scope and guest checkout are excluded.

Journey: [[../../03_USER_JOURNEYS/Tenant_Admin/22_Online_Store_Setup_And_Publish_Flow]].
