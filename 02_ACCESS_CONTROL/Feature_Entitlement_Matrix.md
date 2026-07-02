<!-- title: Feature Entitlement Matrix -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Feature Entitlement Matrix

## Purpose

This file defines tenant-level feature entitlements for the TM-EPOS MVP.

Feature entitlement decides whether a tenant can use a module.
Permissions decide what an individual user can do inside that enabled module.

## Entitlement Rule

A disabled feature must hide or block related UI and APIs.

A permission cannot activate a disabled feature.

## MVP Entitlement Groups

| Feature Group | MVP Status | Notes |
|---|---|---|
| platform_admin | Included | Platform setup and tenant control |
| tenant_admin | Included | Business operations setup |
| mobile_pos | Included | Phone/tablet POS selling |
| desktop_epos | Included | Laptop/desktop EPOS/admin use |
| product_management | Included | Products, variants, attributes, barcodes |
| inventory_management | Included | Stock, adjustments, alerts, movement history |
| online_store | Included | Customer website and catalogue |
| cart_checkout | Included | Shopping cart and checkout sessions |
| click_collect | Included | Pickup method, slots, pickup order handling |
| order_management | Included | Unified in-store and online order management |
| payment_refund | Included | Sales payments, transactions, refunds |
| return_exchange | Included | Return, inspection, refund, exchange |
| offline_operation_sync | Included | Offline client, sync outbox, conflict handling |
| reporting_analytics | Included | Dashboard and operational reports |
| device_hardware | Included | POS device and peripheral integration |
| notification | Included | Email/SMS/WhatsApp/push/in-app records where configured |
| integration_core | Included | Provider/integration records and webhook logs |

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
| product_management | Product setup and catalogue |
| inventory_management | Stock setup and visibility |
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

## Related Files

- [[Access_Control_Overview]]
- [[Permission_Code_List]]
- [[../01_RELEASE_SCOPE/Included_Features]]
- [[../01_RELEASE_SCOPE/Excluded_Features]]
