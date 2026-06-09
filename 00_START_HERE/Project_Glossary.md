<!-- title: Project Glossary -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Project Glossary

## Purpose

This glossary defines the terms used across the SCS-TIX EPOS Release 1 Second Brain.
Use these terms consistently in documentation, API names, UI labels, database discussion, and AI prompts.
Do not introduce alternate names unless a later architecture decision approves them.

## Product And Platform Terms

| Term | Meaning |
|---|---|
| SCS-TIX EPOS | Multi-tenant POS-first SaaS platform for Release 1 |
| Release 1 | Current POS-first delivery scope |
| Second Brain | Structured knowledge base used by developers and AI assistants |
| POS-first | Release 1 focuses on POS, tenant setup, inventory basics, reports, and hardware-ready checkout |
| Tenant | A customer business account inside the SaaS platform |
| Platform Admin | Platform-side user who creates and controls tenants, plans, features, billing, and activation |
| Tenant Admin | Tenant-side admin user who manages operations inside the Flutter POS app layout |
| Cashier | Tenant-side POS user who performs sales and checkout operations |
| Portable POS | Mobile/tablet POS mode used for queue-busting under POS scope |

## Scope Terms

| Term | Meaning |
|---|---|
| Included | Must be considered for Release 1 implementation |
| Excluded | Must not be implemented in Release 1 |
| Deferred | Planned or reserved for later release, not Release 1 |
| Future Reserved | May exist in DB/UI reference but should not drive Release 1 coding |
| Scope Lock | Decision that prevents extra modules from entering Release 1 |

## Access Control Terms

| Term | Meaning |
|---|---|
| Feature Entitlement | Platform-enabled feature/module assigned to a tenant |
| Feature Flag | Runtime feature state at tenant, outlet, or user scope |
| Role | Named group of permissions assigned to users |
| Permission | Specific allowed action, such as creating a sale or updating a product |
| Permission Code | Stable string code stored in database and referenced by code constants |
| Trusted Device | POS device that has been activated or paired and marked trusted |
| Till Session | Open/closed operational cash session for a till |
| Access Decision | Combined authorization check before an action is executed |

## Tenant And Subscription Terms

| Term | Meaning |
|---|---|
| Subscription Plan | Package assigned to a tenant |
| Add-on | Additional feature or limit added to a subscription invoice or plan |
| Payment Link | Secure link sent to tenant admin for subscription payment |
| Billing Summary | Tenant-facing invoice/payment summary before payment |
| Tenant Activation | Process that changes a tenant into usable active state |

## Outlet, Till, And Device Terms

| Term | Meaning |
|---|---|
| Outlet | Physical store, stock location, or selling location |
| Till | Cash register setup inside an outlet |
| Till Activation Code | Short-lived hashed code used to bind a device to a till |
| POS Device | Registered app/browser/device used for POS or admin access |
| Open Till | Start till session with opening cash |
| Close Till | End till session with counted cash and variance |

## Product And Inventory Terms

| Term | Meaning |
|---|---|
| Product | Tenant product master record |
| Product Variant | Sellable SKU/barcode item, such as size or color variant |
| SKU | Tenant-unique stock keeping unit |
| Barcode | Scannable product or variant identifier |
| Product Batch | Batch/lot record used for expiry tracking |
| Expiry Tracking | Tracking product/batch expiry date and status |
| Expiry Discount | Discount rule/application for products near expiry |
| Inventory Balance | Current stock projection by outlet and variant |
| Stock Movement | Append-only inventory ledger entry |

## Sales And Payment Terms

| Term | Meaning |
|---|---|
| Sale | POS sale header for fixed or portable POS |
| Sale Line | Item line inside a sale |
| Parked Sale | Held sale that can be recalled later |
| Payment | Unified payment record for sale, refund, or exchange difference |
| Split Payment | Multiple payment allocations against one sale |
| QR Payment | QR-based payment method, expected to align with LankaQR decisions |
| Card Reader | Payment device integrated through POS app/provider adapter |
| Receipt | Stored sale, return, or exchange receipt output |

## Discount And Loyalty Terms

| Term | Meaning |
|---|---|
| Product Discount | Tenant-admin configured product or variant discount |
| POS Discount | Cashier-applied line or bill discount during checkout |
| Manager PIN | Hashed PIN used for approval where policy limit is exceeded |
| Loyalty Program | Tenant-owned program for earning/redeeming points |
| Customer Membership | Customer loyalty membership and points balance projection |
| Loyalty Transaction | Append-only loyalty points ledger |

## Return, Refund, And Exchange Terms

| Term | Meaning |
|---|---|
| Return | Process of accepting sold items back from a customer |
| Refund | Money/store-credit return linked to original payment or return |
| Exchange | Replacement of returned items with new items |
| Customer Credit | Store-credit balance created by refund or exchange difference |

## Architecture Terms

| Term | Meaning |
|---|---|
| Clean Architecture | Layered backend approach separating API, Application, Domain, and Infrastructure |
| API Layer | Controllers, middleware, filters, versioned HTTP endpoints |
| Application Layer | Use cases, services, DTOs, validators, repository interfaces |
| Domain Layer | Entities, stable enums, value objects, domain rules, permission constants |
| Infrastructure Layer | EF Core, repositories, PostgreSQL, S3, JWT, adapters |
| Audit Log | Immutable record of sensitive platform or tenant action |

## Deferred Terms

| Term | Release 1 Meaning |
|---|---|
| Offline Sync | Deferred; no Release 1 sync conflict engine |
| Supplier Management | Deferred |
| Stock Transfer | Deferred |
| Delivery | Deferred |
| Kiosk | Excluded from Release 1 |
