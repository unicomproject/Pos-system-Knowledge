<!-- title: Included Features -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->


# Included Features

## Purpose

This file lists features that may be implemented for the TM-EPOS MVP.

If a feature is not listed here, check [[Excluded_Features]] before building it.

## Inclusion Rule

A feature is included only when it supports the updated TM-EPOS MVP scope.
Do not add modules, APIs, screens, tables, or flows only because they are common
in other EPOS or e-commerce products.

## Application Surfaces

| Surface | Included | Notes |
|---|---:|---|
| Mobile POS | Yes | Phone/tablet selling flow |
| Desktop EPOS | Yes | Laptop/desktop business operation |
| Online Store | Yes | Customer product browsing and ordering |
| Click & Collect | Yes | Customer order pickup workflow |
| Business Admin | Yes | Product, inventory, users, permissions, reports |
| Platform Admin | Yes | Tenant, plan, entitlement, billing, activation |
| Offline Operation | Yes | Controlled offline cash operation and sync |
| Self-service Kiosk | No | Excluded |
| Delivery Management | No | Deferred |

## Platform And Tenant Setup

Included: platform admin login and dashboard, tenant creation/profile/address,
subscription plan assignment, billing summary with issue-invoice and mark-paid
(settlement), **Payment Links for eligible subscription invoices (PayHere —
final major Super Admin feature)**, feature entitlement, tenant admin creation, initial
outlet/till/user/role/product setup support, tenant activation/status control,
and audit visibility.

**Payment link customer collection** is **Release 1 mandatory** but
**not yet implemented** — database schema prepared; Application/API/UI/PayHere/webhook
pending after remaining non-payment Super Admin gaps. See
[[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]].

## Business Admin

Included: business setup, outlet/till management, device and hardware profile
setup, user management, role/permission management, product and variant
management, category/attribute/image/barcode management, inventory visibility,
stock in, stock adjustment, alerts, movement history, and reports.

## POS Operations

Included:

- Staff sign-in.
- Device activation and trusted device validation.
- Outlet and till selection.
- Till open, current till session, cash count, and cash movements.
- Product lookup, barcode scan, basket/cart, quantity changes, and item removal.
- Price, tax, discount, and receipt calculation.
- Cash payment.
- Card/QR payment where online/backend/provider validation is available.
- Receipt print and reprint.
- Park/hold and recall sale.
- Return, refund, exchange, and related audit.
- Close till and reconciliation with backend validation.

## Online Store

Included:

- Responsive customer website.
- Product catalogue.
- Product search.
- Category filtering.
- Shopping cart.
- Online checkout.
- Mobile responsive design.
- Browser access without customer app download.

## Click & Collect

Included:

- Online ordering for pickup.
- Collection time selection.
- Order notifications where implemented.
- Collection management.
- Pickup order tracking.
- Pickup status history.
- Customer and staff visibility according to permission.

## Offline Operation And Cache

Included:

- Product catalogue cache.
- Category cache.
- Barcode lookup cache.
- Price cache.
- Tax rule cache.
- Permission and feature cache.
- Outlet, till, and device configuration cache.
- Hardware configuration cache.
- Receipt template cache.
- Active basket/cart cache.
- Parked sale quick cache.
- Recent customer basic cache.
- Offline product lookup and barcode scan.
- Offline cash sale capture.
- Offline receipt print.
- Pending inventory movement.
- Sync outbox / pending sync queue.

## Unified Commerce Data Areas

Included database-backed areas include unified sales orders, POS operations,
shopping carts, checkout sessions, fulfilment and pickup, payments and refunds,
return/inspection/exchange, notification records, integration core, and offline
sync records.

The updated database design contains dedicated modules for these areas.

## Hardware, Reporting, And Analytics

Included hardware and reporting scope:

- Android phones, iPhones, Android tablets, iPads, Windows laptops, and Windows desktops.
- Bluetooth, USB, and network receipt printers where supported.
- Barcode scanners, cash drawers, and card payment machines.
- Sales, product, inventory, and order reports.
- Dashboard and basic operational analytics required for the MVP.

## Related Files

- [[Release_1_Scope]]
- [[Excluded_Features]]
- [[../00_START_HERE/Current_Source_Of_Truth]]
