<!-- title: Current Source Of Truth -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->


# Current Source Of Truth

## Purpose

This file defines which project inputs control the TM-EPOS MVP Second Brain.
It prevents developers and AI assistants from mixing old POS-first scope, future
ideas, and current MVP delivery work.
Use this file before writing, implementing, reviewing, or generating any module
documentation.

## Highest Priority Decision

The current scope is TM-EPOS MVP.

The MVP includes mobile and desktop EPOS, online store, click and collect,
offline operation, product and variant management, inventory management, order
management, reporting, users and permissions, and device/peripheral integration.

Older Second Brain files that say online store, click and collect, or offline
sync are excluded must be updated or treated as superseded.

## Source Priority Order

| Priority | Source | How To Use |
|---:|---|---|
| 1 | Confirmed project decisions in chat | Controls final MVP interpretation |
| 2 | Updated TM-EPOS scope images | Controls market, scope, platform, offline direction |
| 3 | Unified Commerce Database Design | Controls updated data model and table constraints |
| 4 | Existing Second Brain | Reuse only where it does not conflict |
| 5 | Backend architecture | Use for layering/security unless contradicted by new scope |
| 6 | Flutter and Angular architecture | Use after scope correction |
| 7 | UI references and journeys | Use only when aligned to MVP scope |

## Active Uploaded Scope Sources

| Source | Use |
|---|---|
| POS MARKET image | Target customers, value promise, selling strategy |
| pos scope image | MVP modules, supported platforms, hardware scope |
| offline and cach image | Cache, offline operation, backend-final validation boundary |
| Unified_Commerce_Databse_Design.docx | Updated database modules, ERDs, constraints |
| Pos-system-Knowledge.zip | Existing Second Brain to update carefully |

## Product Name Rule

Use TM-EPOS as the current MVP product/scope name.

Existing SCS-TIX EPOS references are historical or old-folder wording until the
file is updated. Do not silently mix both names in new content.

When referencing an old file, preserve the old title only if it is the actual
file name.

## Database Source Rule

The uploaded Unified Commerce database design defines 28 modules, including:

- Platform Administration.
- Tenant Foundation.
- Subscription catalog, billing, payments, and usage.
- Tenant users, roles, permissions, and outlet access.
- Outlet, till, POS device, hardware, till session, and cash control.
- Catalog, product, variant, combo, pricing, tax, discount, inventory.
- Unified Order & Sales.
- POS Operations.
- Cart & Checkout.
- Fulfilment & Pickup.
- Payment & Refund.
- Return, Inspection & Exchange.
- Notification.
- Platform-Level Integration Core.
- Offline Operation & Sync.

## Offline Source Rule

Offline operation is part of MVP, but backend remains the final source of truth
for protected business decisions.

Allowed offline/cached areas include product lookup, barcode lookup, product
grid/search, price/tax calculation, active cart save/restore, cash sale, receipt
print, park/hold sale, current till session, recent customer basic lookup,
pending inventory movement, and sync outbox.

Backend-final areas include final inventory quantity, card/QR payment, refund,
exchange, loyalty/store credit, till final close, and final sale total.

## Platform Source Rule

Business user applications now target mobile and desktop devices.

Supported business-device direction includes Android phones, iPhones, Android
tablets, iPads, Windows laptops, and Windows desktops.

Customer online store must work through major browsers.

## Scope Conflict Rule

When a file says a feature is excluded but the updated scope images include it,
the updated scope wins.

When the database contains a table for a feature but the feature is not in the
updated scope images or confirmed decisions, treat the table as reserved until
confirmed.

## No-Invention Rule

Do not invent unsupported modules, APIs, roles, permissions, integrations,
tables, screens, or flows.
## Active Backend Setup (read first)

- [[../11_DEVELOPER_ONBOARDING/Backend_Local_Development_Setup]] — Unified Commerce (`E_POS.Api`, port **5187**)
- [[../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]] — tenant-login gap
- Latest Cashier POS documentation-vs-code comparison: [[../15_IMPLEMENTATION_TRACKING/Flutter/Sales/Cashier_POS_Second_Brain_vs_Code_Comparison_Implementation_Status]]

## Related Files

- [[README]]
- [[Developer_Reading_Guide]]
- [[Project_Glossary]]
- [[../01_RELEASE_SCOPE/Release_1_Scope]]
