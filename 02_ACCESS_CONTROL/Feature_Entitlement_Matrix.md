<!-- title: Feature Entitlement Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->


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
| `inventory_tracking` | Runtime `feature_code` / `PlatformTenantFeatureCodes.InventoryTracking` | Exists commercially; wizard does **not** currently gate advanced toggles | Gate Batch/Expiry/Serial policy, non-empty Initial Tracking, and publish identity | Wizard policy GAP |
| `inventory_management` | Feature matrix **group name** for stock ops | **Not** present in Unified Commerce `PlatformTenantFeatureCodes` | Docs group only. Never a Product Setup runtime check | None |

Quantity Track Inventory ON/OFF remains `product_catalog`.
Advanced tracking requires `inventory_tracking`.

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

## R1 Commercial Plan Baseline (`ONEVERZ_R1_STD`) Reconciliation (OS-R1-4)

The canonical commercial plan `ONEVERZ_R1_STD` contains exactly **7 Physical Technical Features** in the runtime database (`subscription_plan_features`):
1. `outlet_management`
2. `till_management`
3. `pos_checkout`
4. `product_catalog`
5. `sales_orders`
6. `click_collect`
7. `online_store`

Commercial Model Alignment:
- **Conceptual Commercial Count:** 15 capabilities (reconciled from 14 baseline with the full inclusion of `online_store`).
- **Physical Plan Features:** 7 features.
- **Excluded Feature:** `offline_operation_sync` (physical feature exists in catalog, but excluded from `ONEVERZ_R1_STD` per BM-18 deferral).
- **Platform Scope:** `user_accounts` is PLATFORM-scoped per migration `20260831163000_ReconcileSubscriptionPlanTenantFeatureScope` (not tenant-plan selectable).
- **Core Entitlement-Independent:** `tenant_profile` and `tenant_settings` are built-in platform capabilities, not persisted plan rows.
- **Logical Groupings / Unseeded Constants:** `role_management`, `permission_management`, `hardware_device_management`, `inventory_tracking`, and `sales_reports` are code/grouping concepts, not persisted plan rows.

