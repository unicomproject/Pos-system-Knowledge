<!-- title: Feature Entitlement Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-24 -->


# Feature Entitlement Matrix

## Purpose

This file defines tenant-level feature entitlements for the OneVerz POS MVP.

Feature entitlement decides whether a tenant can use a module.
Permissions decide what an individual user can do inside that enabled module.

## Entitlement Rule

A disabled feature must hide or block related UI and APIs.

A permission cannot activate a disabled feature.

## MVP Entitlement Groups

| Feature Group          | MVP Status | Notes                                                   |
| ---------------------- | ---------- | ------------------------------------------------------- |
| platform_admin         | Included   | Platform setup and tenant control                       |
| tenant_admin           | Included   | Business operations setup                               |
| mobile_pos             | Included   | Phone/tablet POS selling                                |
| desktop_epos           | Included   | Laptop/desktop EPOS/admin use                           |
| product_catalog        | Included   | Products, variants, attributes, barcodes                |
| inventory_tracking     | Included   | Advanced Batch / Expiry / Serial tracking (runtime)     |
| inventory_management   | Included   | Docs group for stock, adjustments, alerts, movements    |
| online_store           | Included   | Customer website and catalogue                          |
| cart_checkout          | Included   | Shopping cart and checkout sessions                     |
| click_collect          | Included   | Pickup method, slots, pickup order handling             |
| order_management       | Included   | Unified in-store and online order management            |
| payment_refund         | Included   | Sales payments, transactions, refunds                   |
| return_exchange        | Included   | Return, inspection, refund, exchange                    |
| offline_operation_sync | Included   | Offline client, sync outbox, conflict handling          |
| reporting_analytics    | Included   | Dashboard and operational reports                       |
| device_hardware        | Included   | POS device and peripheral integration                   |
| notification           | Included   | Email/SMS/WhatsApp/push/in-app records where configured |
| integration_core       | Included   | Provider/integration records and webhook logs           |

## POS Entitlements

| Feature | Required For |
|---|---|
| mobile_pos | POS home and selling workflow |
| payment_refund | Payment and refund screens |
| return_exchange | Return and exchange actions |
| device_hardware | Printer, scanner, drawer, card reader setup |
| offline_operation_sync | Offline operation and sync queue |
| reporting_analytics | POS reports where exposed |

## Online Store Entitlements

| Feature | Required For |
|---|---|
| online_store | Customer storefront |
| cart_checkout | Cart and checkout |
| click_collect | Pickup fulfilment method |
| order_management | Sales order creation and tracking |
| payment_refund | Online payment/refund records |
| notification | Order and pickup notifications |

## Admin Entitlements

| Feature | Required For |
|---|---|
| tenant_admin | Tenant business admin layout |
| product_catalog | Product setup and catalogue (runtime feature_code) |
| inventory_tracking | Advanced Batch/Expiry/Serial policy and Product Setup identity persist |
| inventory_management | Stock setup and visibility (docs group; not a Product Setup runtime key) |
| users_permissions | User, role, permission management |
| reporting_analytics | Dashboard and report screens |
| integration_core | Payment/message provider setup where allowed |

## Disabled Feature Behavior

| State | Required Behavior |
|---|---|
| Disabled entitlement | Hide menu or show feature-not-enabled |
| Expired entitlement | Block write action and show renewal message |
| Missing permission | Show permission denied |
| Missing outlet/device/till context | Redirect to required setup/session flow |

## Excluded Feature Note

Self-service kiosk, own delivery management, supplier management, advanced coupon
engine, AI modules, and full accounting are not active MVP entitlements.

## Product Setup entitlement resolution (LOCKED 2026-08-24)

Do not leave multiple runtime names for the same Product Setup check.

| Name | What it actually is | CURRENT backend | TARGET | Migration |
|---|---|---|---|---|
| `product_catalog` | Runtime `feature_code` / `PlatformTenantFeatureCodes.ProductCatalog` | Wizard access policy evaluates this | Same — **the** Product Setup entitlement | None |
| `product_management` | `platform_modules.module_code` (parent of `product_catalog`) | Seeded as module grouping | Docs/module label only. **Not** a runtime entitlement check | Do not start checking this |
| `inventory_tracking` | Runtime `feature_code` / `PlatformTenantFeatureCodes.InventoryTracking` | **Gated** — `ProductWizardAccessPolicy.HasInventoryTrackingEntitlementAsync` evaluates this whenever Batch/Expiry/Serial tracking is enabled, a non-empty Initial Tracking value is supplied, or publish identity applies | Same — gating is implemented | Closed (see 2026-09-24 note below) |
| `inventory_management` | Feature matrix **group name** for stock ops | **Not** present in Unified Commerce `PlatformTenantFeatureCodes` | Docs group only. Never a Product Setup runtime check | None |

Quantity Track Inventory ON/OFF remains `product_catalog`.
Advanced tracking requires `inventory_tracking`.

**2026-09-24 correction:** the "wizard does **not** currently gate advanced toggles /
Wizard policy GAP" note that previously appeared in this row (as of the 2026-08-24
lock) is stale — gating was implemented since then and was verified live: enabling
`expiryTracking` without the `inventory_tracking` entitlement returns 403
`product.entitlement_denied`. A **separate, since-fixed** defect was found on
2026-09-24: `inventory_tracking`'s `platform_features` catalog row had never been
seeded by any migration, so the entitlement check failed closed (`UnknownFeature`) for
every tenant regardless of their actual commercial entitlement — the same
`product.entitlement_denied` / "Product management feature is not included in the
tenant subscription." message is shared with the `product_catalog` check, which made
this look like a missing Product Catalog entitlement when the tenant actually had one.
Fixed by migration `20260924080000_SeedInventoryTrackingPlatformFeature` (catalog
completeness only — no tenant/plan entitlement grants). See
[[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/External_Product_Enrichment_Implementation_Status]]
§ 2026-09-24 Runtime Fixes.

Product Wizard permission matrix:
[[Tenant_Admin_Add_Product_7_Step_Permission_Matrix]].

## Related Files

- [[Access_Control_Overview]]
- [[Permission_Code_List]]
- [[Tenant_Admin_Add_Product_7_Step_Permission_Matrix]]
- [[../01_RELEASE_SCOPE/Included_Features]]
- [[../01_RELEASE_SCOPE/Excluded_Features]]


## Till Management Entitlement (2026-08-01)

| Feature code | Required for |
|---|---|
| `till_management` | Tenant Admin till CRUD/monitoring APIs and Flutter Tills page (Backend seed / `SubscriptionCatalogLimitSeedConstants.TillManagementFeatureCode`) |
| `device_hardware` | POS device and peripheral integration surfaces |

A disabled `till_management` entitlement must block till management APIs even if the user has till permissions.
