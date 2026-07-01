<!-- title: Included Features -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Included Features

## Purpose

This file lists what developers may implement for Release 1.

If a feature is not listed here, check [[Excluded_Features]] before building it.

## Inclusion Rule

A feature is included only when it supports the POS-first Release 1 scope.

Do not add modules, APIs, screens, tables, or flows only because they are common
in POS systems.

## Application Surfaces

| Surface | Included | Notes |
|---|---:|---|
| Platform Admin Web | Yes | Super Admin / platform setup |
| Flutter Fixed POS App | Yes | Main POS and tenant operations |
| Flutter Portable POS Flow | Yes | Queue-busting under POS |
| Tenant Admin Layout | Yes | Inside Flutter POS app |
| E-commerce Web | No | Deferred |
| Self-service Kiosk | No | Excluded |

## Platform Admin

Included platform features:

- Platform admin login and dashboard.
- Tenant creation, profile, business details, and address.
- Subscription plan assignment.
- Billing summary and payment link.
- Module and feature entitlement.
- Tenant admin account creation.
- Optional outlet, till, role, user, and product onboarding support.
- Tenant activation and status control.
- Audit visibility.

## Subscription, Billing, and Access

Included:

- Subscription plans, plan features, tenant subscriptions, subscription history,
  invoices, invoice lines, payment links, payment transactions, and billing status.
- Trial, demo, active, suspended, and expired status handling where plan requires it.
- Platform modules, platform features, tenant feature entitlements, feature flags,
  roles, permissions, role permissions, role feature assignments, tenant user
  roles, outlet user roles, permission-based UI, and API authorization.

All tenant-level access must be configurable by entitlement, role, and rights.

## Authentication

Included:

- Platform admin login.
- Tenant user login.
- Refresh token flow.
- Logout.
- Setup token flow.
- Staff invite acceptance.
- Password setup and password reset.
- Active auth-session validation.
- Token/session revocation.

Passwords, POS PINs, setup tokens, invite tokens, and refresh tokens must be
stored as hashes.

## Tenant Admin

Included:

- Setup link and password setup.
- Billing summary.
- Outlet and till management.
- Activation code generation/view.
- User management.
- Role and permission management.
- Product onboarding and product/variant management.
- Basic inventory management.
- Expiry tracking and expiry discount setup.
- Basic loyalty setup.
- Reports access by permission.

## POS Operations

Included:

- Device activation, pairing, and trusted POS device.
- Till open, till close, cash count, and cash movement.
- Start sale, product search, barcode scan, variant selection, and cart.
- Park and recall sale.
- Discount application and manager PIN approval.
- Customer selection and loyalty use.
- Cash, card, QR, split payment, receipt, and print log.
- Return, refund, exchange, and customer credit.

## Data and Business Features

Included:

- Categories, brands, tax classes, tax rates, return policies, products,
  variants, attributes, images, price lists, and product import batches/rows.
- Inventory balances, stock movements, stock adjustments, stocktakes, product
  batches, inventory batch stocks, and inventory alerts.
- Sales, sale lines, payment records, payment transactions, sale payment
  allocations, receipt templates, receipts, and receipt print logs.
- Discount policies, product/variant discounts, POS line/bill discounts, expiry
  discount rules, and expiry discount applications.
- Customers, memberships, loyalty programs, earning rules, redemption rules, and
  loyalty transactions.
- Return reason codes, returns, return lines, refunds, refund allocations,
  exchanges, exchange lines, customer credits, and credit transactions.

## Reports and Communication Records

Included:

- Daily sales, payment, inventory, discount, and return summaries.
- Report export jobs.
- Sales, till, payment, inventory, product, and return/refund reports.
- Notification templates, notifications, and delivery logs only for required
  operational emails/in-app records.

This is not a full notification product module.

## Related Files

- [[Release_1_Scope]]
- [[Excluded_Features]]
- [[../02_ACCESS_CONTROL/Feature_Entitlement_Matrix]]
- [[../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]]
- [[../06_DATABASE_KNOWLEDGE/Database_Overview]]
