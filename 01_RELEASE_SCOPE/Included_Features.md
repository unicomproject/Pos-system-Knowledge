<!-- title: Included Features -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-08 -->


# Included Features

## Cashier Customer Management

Release 1 includes the `/pos/customers` Cashier Customer Management screen:
search, status/source filters, pagination, conditional master-detail profile,
completed-order aggregates, recent purchases, add, edit, deactivate, and
ACTIVE-customer attachment to a sale. This is POS customer management, not a
full CRM. Loyalty, membership, points, rewards, and earn/redeem are excluded.

## Purpose

This file lists features that may be implemented for the OneVerz POS MVP.

If a feature is not listed here, check [[Excluded_Features]] before building it.

## Inclusion Rule

A feature is included only when it supports the updated OneVerz POS MVP scope.
Do not add modules, APIs, screens, tables, or flows only because they are common
in other EPOS or e-commerce products.

## Application Surfaces

| Surface | Included | Notes |
|---|---|---|
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
**admin-initiated platform user password reset** (one-time token, ACS Email delivery with `deliveryMode=email` / `resetUrl=null`, public `/reset-password` page, session revocation; Platform Admin self-service Forgot Password and tenant resets remain out of scope),
and audit visibility.

**Payment link customer collection** is **Release 1 mandatory** but
**not yet implemented** — database schema prepared; Application/API/UI/PayHere/webhook
**and paid-tenant payment-link email** pending. See
[[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]] and
[[../12_INTEGRATIONS/Email_Event_And_Template_Catalog]].

**Tenant onboarding emails (approved, not implemented):** paid create → payment-required email with payment link; manual payment verify + manual activate → set-password email; trial/demo → created email then auto-activate → separate set-password email. See [[../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]. Payment Received email is **deferred** for R1.

**Tenant lifecycle status alignment (approved, not implemented):**

- `tenants.status` stores lifecycle only: `DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `CANCELLED`
- Paid create -> `PENDING_PAYMENT`
- Paid verification or approved waiver -> `PENDING_ACTIVATION`
- Trial/Demo create orchestration ends at `ACTIVE`
- ordered migrations required: `RepairTenantLifecycleStatusData`, then `AddTenantLifecycleStatusCheckConstraint`
- `lifecycleStatus` API transition and frontend badge/filter alignment are **IMPLEMENTED** (verified on merged main, 2026-07-28)
- cancel endpoint remains deferred and is **not** part of this alignment task
- deferred remaining gaps: onboarding emails, payment links, payment waiver persistence/API/UI, email outbox/retry, deprecated alias removal

## Business Admin

Included: business setup, outlet/till management, device and hardware profile
setup, user management, role/permission management, product and variant
management, category/attribute/image/barcode management, Popular Products list curation and manual reordering (under Collection management), inventory visibility,
stock in, stock adjustment, alerts, movement history, and reports.

## POS Operations

Included:

- Staff sign-in.
- Device activation and trusted device validation.
- Outlet and till selection.
- Till open, current till session, cash count, and cash movements.
- Product discovery segment filtering (Popular by default, Frequently Sold, Offers).
- Product lookup, barcode scan, basket/cart, quantity changes, and item removal.
- Product Variant Selection Popup with one displayed image, dynamic options, optional product-line note and manually configured Frequently Bought Together recommendations.
- Price, tax, discount, and receipt calculation.
- Cash payment.
- Card/QR payment where online/backend/provider validation is available.
- Receipt print and reprint.
- Park/hold and recall sale.
- Return, refund, exchange, and related audit.
- Close till and reconciliation with backend validation.

Frequently Bought Together is separate from the Frequently Sold discovery segment. See [[../04_MODULE_KNOWLEDGE/21_POS_Operations/07_Product_Variant_Selection_Popup_Feature]].

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

Included hardware and reporting scope (product intent):

- Android phones, iPhones, Android tablets, iPads, Windows laptops, and Windows desktops.
- Receipt printers where a supported production path exists (current: Local Print Agent → Windows RAW USB; network TCP optional/unverified).
- Barcode scanners and physical cash drawers (required gates once software paths exist).
- Card payment machines only when a real provider is approved for the release.
- Sales, product, inventory, and order reports.
- Dashboard and basic operational analytics required for the MVP.

**Current production-readiness clarification (2026-08-16):** overall POS hardware
is **BLOCKED — HARDWARE NOT PRODUCTION READY**. Direct Bluetooth/USB Flutter
printer adapters are **NOT** production-verified stubs. Payment terminal is
**NOT IMPLEMENTED** / out of current hardware release until product reopens
provider scope. Customer Display / Scale / Kitchen Printer are deferred.
See [[../12_INTEGRATIONS/POS_Hardware_Integration]] and
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]].

## Related Files

- [[Release_1_Scope]]
- [[Excluded_Features]]
- [[../00_START_HERE/Current_Source_Of_Truth]]
