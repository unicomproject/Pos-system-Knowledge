# 25 - E-Commerce Storefront and Customer Features

This module defines the schema for E-Commerce frontend features, specifically managing Storefront Banners (promotions, hero sliders) and Customer Wishlists.

## Tables Overview
| Table Name | Description |
| :--- | :--- |
| `storefront_banners` | Stores promotional banners, hero sliders, and announcement bars for a specific sales channel. |
| `customer_wishlists` | Stores named wishlists created by customers (e.g., "Favorites", "Birthday"). |
| `customer_wishlist_items` | Stores the specific products/variants added to a customer's wishlist. |

---

## 1. storefront_banners
Used to configure the visual and promotional elements on the E-commerce storefront.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK | Primary Key. |
| `tenant_id` | uuid | FK, NOT NULL | References `tenants(id)`. |
| `sales_channel_id` | uuid | FK, NULL | References `sales_channels(id)`. If null, applies to all channels. |
| `banner_type` | varchar(50) | NOT NULL | Enum/String (e.g., HERO, PROMO, ANNOUNCEMENT). |
| `title` | varchar(200) | NOT NULL | Primary heading of the banner. |
| `subtitle` | text | NULL | Secondary text/description. |
| `image_url` | varchar(500)| NOT NULL | URL of the banner image. |
| `action_text` | varchar(50) | NULL | Button text (e.g., "Shop Now"). |
| `action_url` | varchar(500)| NULL | Destination URL when clicked. |
| `sort_order` | integer | NOT NULL | Defines the display order in a slider. |
| `status` | varchar(30) | NOT NULL | E.g., ACTIVE, DRAFT, SCHEDULED. |
| `created_at` | timestamp | NOT NULL | Creation time. |
| `created_by` | uuid | NULL | Creator ID. |
| `updated_at` | timestamp | NULL | Last update time. |
| `updated_by` | uuid | NULL | Updater ID. |

---

## 2. customer_wishlists
Stores collections of favorite products for customers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK | Primary Key. |
| `tenant_id` | uuid | FK, NOT NULL | References `tenants(id)`. |
| `customer_id` | uuid | FK, NOT NULL | References `customers(id)`. |
| `name` | varchar(100)| NOT NULL | Name of the wishlist (e.g., "My Favorites"). |
| `created_at` | timestamp | NOT NULL | Creation time. |
| `created_by` | uuid | NULL | Creator ID. |
| `updated_at` | timestamp | NULL | Last update time. |
| `updated_by` | uuid | NULL | Updater ID. |

---

## 3. customer_wishlist_items
Stores the specific products mapped to a wishlist.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PK | Primary Key. |
| `tenant_id` | uuid | FK, NOT NULL | References `tenants(id)`. |
| `wishlist_id` | uuid | FK, NOT NULL | References `customer_wishlists(id)`. |
| `product_id` | uuid | FK, NOT NULL | References `products(id)`. |
| `product_variant_id`| uuid | FK, NULL | References `product_variants(id)` if a specific variant is saved. |
| `added_at` | timestamp | NOT NULL | When the item was added to the wishlist. |
| `created_at` | timestamp | NOT NULL | Creation time. |
| `created_by` | uuid | NULL | Creator ID. |
| `updated_at` | timestamp | NULL | Last update time. |
| `updated_by` | uuid | NULL | Updater ID. |

**Indexes & Constraints**:
- Unique Index on `(wishlist_id, product_id, product_variant_id)` to prevent duplicate items in the same wishlist.

---

## Tenant Admin Native Online Store Persistence Map — 2026-08-27

| Concern | Current table/entity truth | Ownership/invariant |
|---|---|---|
| Setup, identity, slug, branding, support, publish timestamp | `tenant_settings` + `setting_definitions` key `online_store.defaults` | JSON schema v1; tenant scoped; defaults orange `#FF6A00`, black `#000000` |
| Native Online Store channel | `sales_channels` → `platform_sales_channels` | Composite tenant ownership; channel status is separate from setup and publish state |
| Hosted/custom domains | `tenant_domains` | Tenant/channel scoped; soft delete; one active primary storefront domain enforced by unique index |
| Logo/favicon/banner media | `media_assets` | Media must belong to current tenant; purpose and MIME/size rules enforced by upload service |
| Banners | `storefront_banners` | Tenant/channel scoped; status and sort order; image FK includes tenant ownership |
| Policies | `storefront_policies` | Tenant/channel/type/version unique; one current published row per type; DRAFT/PUBLISHED/ARCHIVED |
| Product visibility | `product_channel_visibilities` | Tenant/product/channel/variant mapping; does not duplicate Product Master |
| Collection eligibility | `fulfillment_methods`, `fulfillment_method_outlets`, `outlet_business_hours`, `outlets` | Tenant-owned active mapping and configured hours are readiness inputs |
| Audit/idempotency | `audit_logs`, `idempotency_requests` | Important mutations audited; final publish replay protected |

The current policy check constraint and service accept `TERMS`, `PRIVACY`, `CANCELLATION`, `COLLECTION`, and `RETURN_REFUND`. No fictional wizard-state table or `IN_PROGRESS` column exists.
