<!-- title: Project Glossary -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# Project Glossary

## Purpose

This glossary defines the terms used across the TM-EPOS MVP Second Brain.
Use these terms consistently in documentation, API names, UI labels, database
discussion, and AI prompts.
Do not introduce alternate names unless a later architecture decision approves
them.

## Product And Scope Terms

| Term | Meaning |
|---|---|
| TM-EPOS | Current MVP product/scope name for the updated EPOS system |
| MVP | Current delivery scope for mobile/desktop EPOS, online store, click and collect, and offline operation |
| SCS-TIX EPOS | Older/previous naming found in existing Second Brain files |
| Second Brain | Structured knowledge base used by developers and AI assistants |
| Unified Commerce | Database and architecture direction connecting POS, online store, orders, checkout, fulfilment, payment, and sync |
| Low-cost EPOS | Simple, affordable EPOS designed to run on devices businesses already own |
| Multi-tenant | One SaaS platform serving many separate businesses with tenant isolation |

## Customer And Market Terms

| Term | Meaning |
|---|---|
| Target Business | Event, stall, temporary retail, food and beverage, merchandise, or small business using TM-EPOS |
| Event Merchandise Shop | Shop selling event, stadium, festival, or branded merchandise |
| Pop-up Shop | Temporary selling location used for seasonal or short-term retail |
| Market Trader | Seller operating from a market stall or temporary trading location |
| Food Stall | Small food seller such as burger, coffee, snack, or ice cream stall |
| Beverage Counter | Bar, pub, cocktail, drink stall, or beverage service counter |

## Application Terms

| Term | Meaning |
|---|---|
| Mobile POS | POS selling app on phone or tablet |
| Desktop EPOS | EPOS experience on laptop or desktop PC |
| Online Store | Customer-facing responsive website for product browsing and ordering |
| Click & Collect | Customer orders online and collects from selected location/time |
| Admin Operations | Product, inventory, user, permission, order, report, and setup workflows |
| Platform Admin | Platform-side user managing tenants, plans, features, billing, and setup |
| Tenant Admin | Tenant-side admin managing business operations |
| Cashier | User performing POS sales and checkout |

## Offline And Cache Terms

| Term | Meaning |
|---|---|
| Virtual Cache | Local/reference cache used for speed, lookup, screen loading, and resilience |
| Offline Operation | Limited offline capability for safe POS actions when internet is unavailable |
| Offline Cash Sale | Cash sale captured offline and later synced/revalidated |
| Sync Outbox | Pending local operations waiting for upload to backend |
| Pending Sync Queue | Queue of offline-created or offline-updated records waiting for backend sync |
| Backend Final Validation | Backend check required before final business truth is accepted |
| Offline Client | Registered device/client participating in offline sync |
| Offline Number Block | Reserved document number range allocated to an offline client |
| Conflict Resolution | Process used when backend and offline client changes conflict |

## Order And Checkout Terms

| Term | Meaning |
|---|---|
| Basket | POS/cart items selected before checkout |
| Shopping Cart | Online or app cart before checkout session |
| Checkout Session | Checkout attempt that validates items, address/pickup, totals, and payment |
| Sales Order | Unified order header for POS and online orders |
| Sales Order Line | Item line inside a sales order |
| Held Sale | POS order temporarily parked and later recalled |
| Fulfilment Order | Operational record for preparing/fulfilling an order |
| Pickup Order | Click and collect pickup execution record |

## Product And Inventory Terms

| Term | Meaning |
|---|---|
| Product | Sellable item master record |
| Product Variant | Sellable SKU/barcode variation such as size or colour |
| SKU | Stock keeping unit |
| Barcode | Scannable identifier for product or variant |
| Product Batch | Batch/lot record used where tracking or expiry applies |
| Inventory Balance | Current quantity state for product/variant/batch/location |
| Stock Movement | Immutable record of stock quantity movement |
| Pending Inventory Movement | Offline or pending stock movement waiting for backend processing |

## Payment, Return, And Till Terms

| Term | Meaning |
|---|---|
| Payment Method | Cash, card, QR, bank transfer, manual, or other supported payment setup |
| Card/QR Payment | Payment that requires online/backend/provider validation |
| Refund | Money returned against a sale/return |
| Exchange | Return with replacement item/order and possible balance difference |
| Till Session | Open/closed operational cash session for a till |
| Till Final Close | Final till close requiring backend validation |
| Cash Movement | Cash in/out movement with amount, reason, and audit trail |

## Access Control Terms

| Term | Meaning |
|---|---|
| Feature Entitlement | Platform-enabled module or feature assigned to a tenant |
| Feature Flag | Runtime feature state at tenant, outlet, user, or device scope |
| Role | Named set of permissions |
| Permission | Specific allowed action |
| Permission Code | Stable action code stored in database and referenced by code constants |
| Trusted Device | Device registered/activated and allowed to perform protected operations |

## Related Files

- [[README]]
- [[Current_Source_Of_Truth]]
- [[../02_ACCESS_CONTROL/Access_Control_Overview]]
