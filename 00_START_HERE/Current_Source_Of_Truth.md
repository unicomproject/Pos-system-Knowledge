<!-- title: Current Source Of Truth -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->

# Current Source Of Truth

## Purpose

This file defines which project inputs control the SCS-TIX EPOS Release 1 Second Brain.
It prevents developers and AI assistants from mixing old scope, future scope, and current Release 1 delivery work.
Use this file before writing, implementing, reviewing, or generating any module documentation.

## Highest Priority Source

The current Release 1 decision is POS-first.
The backend architecture confirms that Release 1 excludes e-commerce, offline sync, caching dependency, suppliers, delivery, kiosk, coupons, and AI modules.
The database design is used for table knowledge, but reserve or future tables must not automatically become Release 1 implementation scope.

## Source Priority Order

| Priority | Source                        | How To Use                                                 |
| -------- | ----------------------------- | ---------------------------------------------------------- |
| 1        | Confirmed project decisions   | Controls final Release 1 boundaries                        |
| 2        | Release 1 backendarchitecture | Controls backend layering, auth, API, security, exclusions |
| 3        | Release 1 database design     | Controls data model, tables, attributes, constraints       |
| 4        | Release 1 software scope      | Confirms high-level application scope                      |
| 5        | Release 1 hardware scope      | Confirms POS hardware environment                          |
| 6        | User Journey                  | Controls user journeys and screen intent                   |
| 7        | UI references                 | Reference only unless aligned to Release 1                 |

## Active Uploaded Documents

| Source File | Use In Second Brain |
|---|---|
| Release_Backend_Architecture.docx | Backend architecture, API groups, auth, authorization, Release 1 exclusions |
| Release1_Database_Design_V3.docx | Database table dictionary and table-to-flow coverage |
| EPOS-ROWSAS_REQUIREMENTS.zip | UI journeys, cashier flow, tenant admin flow, platform admin screens |
| Scope_R1_SW.png | Release 1 software environment validation |
| Scope_R1_HW.png | Release 1 hardware environment validation |

## Backend Architecture Controls

The backend uses .NET / ASP.NET Core Web API.
The architecture follows Clean Architecture with API, Application, Domain, Infrastructure, and Testing layers.
The implementation pattern is Service + Repository Pattern.
Module-name-first folders must be used inside each main backend layer.
The backend exposes REST APIs for Flutter POS and Angular Platform Admin.
PostgreSQL is the transactional database.
AWS S3 is used for file and image storage.
GitHub Actions is used for CI/CD.
AWS EC2 is the Release 1 backend hosting target.

## Authorization Source Rule

The access model is not simple role-based access.
Release 1 uses feature entitlement, role permission, outlet access, trusted POS device, assigned till, and till session checks.
Permission code values are stored in the database as the source of truth.
Code must use module-wise permission constants, not one large rigid permission enum.

The permission **catalog tree** (module → feature → permission) is also
backend-driven. Frontends load it from catalog APIs and must not hardcode catalog
arrays. See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]].

## Database Source Rule

The Release 1 database design defines the table inventory for tenant foundation, subscription, entitlement, identity, till, device, hardware, catalog, inventory, sales, payments, receipts, discounts, expiry discounts, customers, loyalty, returns, refunds, exchanges, reports, and notifications.
Every tenant-owned table must use tenant-aware ownership and constraints.
Append-only ledgers are used for stock movements, loyalty transactions, customer credit transactions, and audit logs.
Setup links, payment links, and activation codes must be stored as hashes.

## UI And Journey Source Rule

The UI and journey files define real user behavior for Platform Admin, Tenant Admin, and Cashier.
They must not override current scope exclusions.
If a UI screen contains e-commerce setup, treat it as deferred unless the current Release 1 scope explicitly includes it.
Cashier flows are considered Release 1 when aligned with POS sale, till, payment, discount, return, refund, exchange, loyalty, hardware, and cash drawer operations.

## Software Scope Image Interpretation

The Release 1 software environment includes Super Admin Web, Tenant Admin App, Cashier POS App, Reports, Products and Inventory, Loyalty, and Hardware Integration.
This image supports the POS-first scope.
It does not make e-commerce Release 1.
It must be interpreted together with backend architecture exclusions.

## Hardware Scope Image Interpretation

The hardware scope includes fixed POS terminal, portable POS device, barcode scanner, receipt printer, cash drawer, card reader, network/internet, and optional admin access device.
Backend does not directly communicate with every hardware device.
Flutter POS or local device services handle local hardware actions, while backend validates and records business outcomes.

## Release 1 Included Decision

Release 1 includes Platform Admin, Tenant Admin inside POS app, Cashier POS, Portable POS queue-busting, product onboarding, basic inventory, expiry tracking, expiry discount, basic loyalty, payments, roles/permissions, feature entitlement, reports, and hardware-ready POS records.

## Release 1 Excluded Decision

Release 1 excludes e-commerce Click & Collect, offline sync, supplier management, stock transfer, delivery, kiosk, coupons/promotions engine, AI onboarding, AI analytics, and AI accounting.
These may appear in old or reserved files but must be documented as deferred.

## Conflict Resolution Rule

When two sources conflict, use the latest confirmed Release 1 decision first.
Then check the backend architecture Release 1 exclusion list.
Then check whether database tables are current implementation tables or reserved/deferred tables.
Do not resolve conflict by guessing.
Add unresolved conflicts to [[Open_Questions]].

## Related Files

- [[README]]
- [[Developer_Reading_Guide]]
- [[Release_1_Scope]]
- [[Included_Features]]
- [[Excluded_Features]]
- [[ADR_006_Ecommerce_Moved_To_R2]]
- [[Backend_Overview]]
- [[Database_Overview]]

## Platform Admin Role Management Source Rule

Platform Admin role management is backend-driven over the existing `platform_roles`, `platform_role_permissions`, `platform_user_roles`, and `platform_permissions` tables. Do not create duplicate role architecture or hardcode role/permission data in Angular.

See [[../02_ACCESS_CONTROL/Platform_Admin_Role_Management]].
