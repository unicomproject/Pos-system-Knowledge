<!-- title: Excluded Features -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Excluded Features

## Purpose

This file lists what must not be implemented as Release 1 scope.

It prevents scope creep from old documents, unused database references, future UI
ideas, and unsupported assumptions.

## Exclusion Rule

If a feature is listed here, do not build it for Release 1 unless an official
scope change is recorded in [[../13_DECISIONS_AND_CHANGES/Scope_Change_Log]].

Database presence does not override this file.

## Excluded Summary

| Feature Area | Release 1 Decision |
|---|---|
| E-commerce / online store | Excluded |
| Click & Collect | Excluded |
| Offline POS sync | Excluded |
| Supplier management | Excluded |
| Stock transfer between outlets | Excluded |
| Delivery flow | Excluded |
| Self-service kiosk | Excluded |
| Separate queue-busting module | Excluded |
| Coupons/promotions engine | Excluded |
| AI onboarding, analytics, accounting | Excluded |
| Full accounting | Excluded |
| Redis/caching dependency | Excluded |
| CQRS/MediatR | Excluded |

## E-commerce and Offline Exclusion

Do not implement online storefront, e-commerce product listing, e-commerce cart,
Click & Collect checkout, online order placement, online order tracking,
e-commerce pickup QR, e-commerce order-ready flow, e-commerce web payment, or
e-commerce branding customization.

Storefront-related database or old UI references are future-reserved unless
explicitly required for platform tenant setup.

Do not implement offline sales queue, offline sync APIs, conflict resolution,
offline stock logic, offline payment reconciliation, sync retry dashboard, or
offline-first POS rules.

## Supplier, Transfer, Delivery, and Kiosk Exclusion

Do not implement supplier master, supplier contacts, purchase orders, supplier
invoices, supplier payments, or supplier reports.

Do not implement transfer request, transfer approval, transfer dispatch, transfer
receive, in-transit stock, or transfer reporting.

Do not implement delivery order flow, driver assignment, delivery status, delivery
fee, delivery address flow, or delivery notifications.

Do not implement kiosk ordering, kiosk payment, kiosk UI, kiosk device assignment,
or kiosk customer flow.

## Queue-Busting Rule

Queue-busting is not a separate module.

Use this interpretation only:

```text
Portable POS = queue-busting POS flow
```

Portable POS uses the same tenant, outlet, permission, device, sale, payment,
stock, and receipt rules as fixed POS.

## Coupon, Promotion, AI, and Accounting Exclusion

Do not implement coupon code management, campaign builder, promotion stacking,
advanced offer rules, AI onboarding, AI bulk extraction, AI analytics, AI
accounting, general ledger, journal posting, trial balance, profit and loss, or
balance sheet.

CSV product import can exist without AI.

POS payments, refunds, invoices, and cash movements are operational records, not
a full accounting module.

## Notification Limitation

A full notification module is not Release 1.

Allowed communication records are limited to tenant admin setup, staff invite,
password reset, subscription payment link, payment success/failure, low stock
alert, expiry alert, and report ready where implemented.

SMS and WhatsApp receipts are excluded.

## Architecture Exclusions

Do not implement CQRS, MediatR, API Gateway, Redis dependency, separate caching
layer, Nginx/load-balancer requirement, or Release 2 modules hidden inside
Release 1 services.

Use Clean Architecture with service and repository pattern.

## Developer Stop Rules

Stop and ask for scope confirmation when a task touches e-commerce, offline
behavior, supplier, delivery, kiosk, transfer, coupon, AI, accounting, a new
module not listed in [[Included_Features]], or tables/APIs not supported by the
confirmed documents.

## Related Files

- [[Release_1_Scope]]
- [[Included_Features]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_006_Ecommerce_Moved_To_R2]]
- [[../13_DECISIONS_AND_CHANGES/Deferred_Features]]
- [[../05_BACKEND_ARCHITECTURE/Backend_Overview]]
