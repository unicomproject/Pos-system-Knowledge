<!-- title: ONEVERZ R1 BUSINESS CAPABILITY MASTER -->
<!-- status: CANONICAL -->
<!-- system: OneVerz EPOS Release 1 -->
<!-- last_updated: 2026-09-02 -->
<!-- author: BCM-2 Architectural Reconciliation -->

# ONEVERZ EPOS — RELEASE 1 BUSINESS CAPABILITY MASTER

## 1. DOCUMENT METADATA & PURPOSE

| Attribute | Value |
| --- | --- |
| **Document Title** | ONEVERZ R1 BUSINESS CAPABILITY MASTER |
| **Status** | **CANONICAL** (Single Product-Level Traceability Source of Truth) |
| **Target Release** | Release 1 (R1 Baseline) |
| **Hierarchy Level** | Level 0 Top-Level Architecture Specification |
| **Supersedes** | Unaligned macro-journeys without atomic journey mappings |
| **References** | `E-POS Macro-Modules Architecture.md`, `03_USER_JOURNEYS/00_Global_User_Journey_Register.md`, `TenantAdminBootstrapPermissionCatalog.cs`, `CommercialSubscriptionFeatureCatalog.cs`, RP-1/RP-2 Security Closure Evidence |

---

## 2. SOURCE PRECEDENCE RULE

When resolving product architecture or traceability questions, the following precedence order MUST be enforced across all documentation and implementation decisions:

1. **Approved Release Scope / Business Capability Master (`ONEVERZ_R1_BUSINESS_CAPABILITY_MASTER.md`)**  
   *Defines WHAT capabilities belong to Release 1, their module ownership, and business status.*
2. **Global User Journey Register (`03_USER_JOURNEYS/00_Global_User_Journey_Register.md`)**  
   *Defines the 173 locked atomic user journeys across Super Admin, Tenant Admin, POS, and E-Commerce.*
3. **Commercial Feature Catalog (`CommercialSubscriptionFeatureCatalog.cs` / `PlatformTenantFeatureCodes.cs`)**  
   *Defines commercial plan entitlement eligibility.*
4. **Permission Catalog (`TenantAdminBootstrapPermissionCatalog.cs` / `Permission_Code_List.md`)**  
   *Defines atomic action-level security permissions.*
5. **Technical System Module Catalog (`E-POS Macro-Modules Architecture.md`)**  
   *Defines the 25 technical C# backend modules and bounded contexts.*
6. **Module-Specific Specifications (`04_MODULE_KNOWLEDGE/`)**  
   *Define deep domain rules, UI specs, and API contracts.*
7. **Production Code & Database Schemas (`E_POS.sln`, `nytroz-pos-platform-admin`, `Nytroz-POS-App`)**  
   *Provide concrete empirical implementation evidence.*

---

## 3. FOUNDATION CAPABILITIES VS 19 BUSINESS MODULES

System functionality is divided into two distinct architectural layers:

### A. FOUNDATION CAPABILITIES (Cross-Cutting Platform Foundations)
These represent system-wide infrastructure and access control engines that support all business modules.
- **F01 — Commercial Access & Entitlement Foundation** (Plans, Subscriptions, Entitlement Overrides, Commercial Feature Gate)  
  *Status:* **PRODUCTION READY / CLOSED**
- **F02 — Security & Identity Foundation** (Users, Built-in Roles, Custom Roles, Permissions, Delegation Ceiling, Last-Admin Protection, Outlet/Till Scope Gate)  
  *Status:* **PRODUCTION READY / CLOSED**

### B. 19 RELEASE-1 BUSINESS MODULES (Operational POS & Tenant Domains)
The 19 functional business modules that define the Release-1 POS product offering.

---

## 4. THE 19 CANONICAL RELEASE-1 BUSINESS MODULES

| BM ID | Business Module Name | Purpose | Primary Personas | Technical Module Mapping | R1 Status |
| --- | --- | --- | --- | --- | --- |
| **BM-01** | Authentication & Workspace | Staff/Admin login, OTP, JWT, tenant/outlet selection context | Cashier, Tenant Admin, Super Admin | `TenantAuth`, `TenantFoundation` | **PRODUCTION READY / CLOSED** |
| **BM-02** | Outlet & Till Management | Outlets & Tills CRUD, store hierarchy setup | Tenant Admin, Super Admin | `OutletTillDevice` | **PRODUCTION READY / CLOSED** |
| **BM-03** | Users, Roles & Permissions | User accounts, role definitions, permissions mapping | Tenant Admin | `AccessControl`, `TenantFoundation` | **PRODUCTION READY / CLOSED** |
| **BM-04** | Devices & Hardware | Peripheral pairing (printers, cash drawer, barcode scanner) | Cashier, Tenant Admin | `HardwareCash`, `OutletTillDevice` | **PARTIAL** |
| **BM-05** | Till Session & Operations | Open/close till session, opening float, shift control | Cashier, Manager | `POSOperations`, `HardwareCash` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-06** | POS Home / Dashboard | Role-based POS landing, quick actions, shift status | Cashier, Manager | `POSOperations`, `TenantFoundation` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-07** | Product Catalogue Management | Products, variants, 7-step wizard, categories, brands, price/tax | Tenant Admin | `CatalogProduct`, `PricingTax` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-08** | Inventory & Stock Management | Stock view, receiving, adjustments, channel allocation | Inventory Staff, Tenant Admin | `Inventory` | **PARTIAL** |
| **BM-09** | Sales / New Sale & Cart | POS catalog search, scan, cart management, line discounts | Cashier | `Orders`, `POSOperations` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-10** | Customer Management | Customer search, creation, attachment to sale, history | Cashier, Tenant Admin | `Customer`, `CustomerAuth` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-11** | Park & Recall Sales | Hold transaction, list parked sales, recall to active cart | Cashier | `Orders` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-12** | Payments | POS Cash/Card/LankaQR payments, split payments | Cashier, E-Commerce Customer | `Payment`, `CartCheckout` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-13** | Receipts | Receipt generation, local thermal print, reprint, digital receipt | Cashier | `HardwareCash`, `Orders` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-14** | Returns, Refunds & Exchanges | Process order return, cash/card refund, item exchange | Cashier, Manager | `ReturnExchange`, `Refund`, `Orders` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-15** | Cash Management & Till Reconciliation | Cash in/out drops, denomination count, variance, EOD close | Cashier, Manager | `POSOperations`, `HardwareCash` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-16** | Online Orders & Click & Collect | Storefront browsing, cart, online checkout, pick/prepare, pickup | E-Commerce Customer, Cashier | `Storefront`, `CartCheckout`, `FulfilmentPickup` | **IMPLEMENTED — NOT YET E2E CLOSED** |
| **BM-17** | Reporting & Analytics | Sales, inventory, tax, cashier EOD reports, exports | Tenant Admin, Manager | `Reports` | **PARTIAL** |
| **BM-18** | Offline & Synchronization | Local SQLite outbox, offline transaction queueing, auto sync | Cashier | `OfflineSync` | **PARTIAL** |
| **BM-19** | Business / POS Settings | Receipt configuration, payment options, device preferences | Tenant Admin | `TenantFoundation`, `HardwareCash` | **PARTIAL** |

---

## 5. MACRO JOURNEYS (39) VS CANONICAL ATOMIC JOURNEYS (173)

### Architectural Clarification
- **39 Macro Journeys:** High-level business flow groupings used for product design and executive mapping.
- **173 Canonical Detailed Journeys:** Atomic, testable user journeys registered in `03_USER_JOURNEYS/00_Global_User_Journey_Register.md`.

### Surface Breakdown (173 Journeys)
1. **Super Admin (Platform Admin):** 57 Journeys (`SA-UJ-001` to `SA-UJ-057`)
2. **Tenant Admin:** 62 Journeys (`TA-UJ-001` to `TA-UJ-062`)
3. **Cashier POS:** 36 Journeys (`POS-UJ-001` to `POS-UJ-036`)
4. **E-Commerce Customer:** 18 Journeys (`EC-UJ-001` to `EC-UJ-018`)

---

## 6. USE CASE TRACEABILITY INDEX (263 USE CASES)

All 263 Release-1 business use cases are mapped directly to their parent atomic user journeys:
- **Implemented Use Cases:** 185
- **Partial Use Cases:** 42
- **Missing / Pending Use Cases:** 36

---

## 7. TECHNICAL MODULE MAP (25 C# SYSTEM MODULES)

| Bounded Context | C# Technical Module | Primary Business Module Ownership |
| --- | --- | --- |
| **Platform** | `PlatformAdmin` | Platform Administration, Tenant Onboarding |
| **Platform** | `Subscription` | F01 Commercial Plans & Billing |
| **Tenant** | `TenantAuth` | BM-01 Authentication & Workspace |
| **Tenant** | `AccessControl` | BM-03 Users, Roles & Permissions (F02) |
| **Tenant** | `CatalogProduct` | BM-07 Product Catalogue Management |
| **Tenant** | `Discount` | BM-09 Sales (Scaffolding only; R1 Excluded) |
| **Tenant** | `HardwareCash` | BM-04 Devices, BM-05 Till Session, BM-13 Receipts, BM-15 Cash |
| **Tenant** | `Inventory` | BM-08 Inventory & Stock Management |
| **Tenant** | `OfflineSync` | BM-18 Offline & Synchronization |
| **Tenant** | `OutletTillDevice` | BM-02 Outlet & Till Management, BM-04 Devices |
| **Tenant** | `Payment` | BM-12 Payments |
| **Tenant** | `POSOperations` | BM-05 Till Session, BM-06 POS Home, BM-15 Cash Management |
| **Tenant** | `PricingTax` | BM-07 Product Catalogue (Prices & Tax) |
| **Tenant** | `Reports` | BM-17 Reporting & Analytics |
| **Tenant** | `TenantFoundation` | BM-01 Auth, BM-03 Roles, BM-19 Settings |
| **Tenant** | `Orders` | BM-09 Sales, BM-11 Park & Recall, BM-14 Returns |
| **E-Commerce** | `CustomerAuth` | BM-10 Customer Management, Customer Portal Login |
| **E-Commerce** | `Customer` | BM-10 Customer Management |
| **E-Commerce** | `Storefront` | BM-16 Online Orders & Click & Collect |
| **E-Commerce** | `CartCheckout` | BM-16 Online Orders & Click & Collect |
| **E-Commerce** | `FulfilmentPickup` | BM-16 Online Orders & Click & Collect |
| **Shared** | `Notification` | Cross-cutting (Email/SMS Alerts) |
| **Shared** | `Integration` | Cross-cutting (Third-party accounting/outbox) |
| **Shared** | `ReturnExchange` | BM-14 Returns, Refunds & Exchanges |
| **Shared** | `Refund` | BM-14 Returns, Refunds & Exchanges |

---

## 8. RELEASE 1 EXCLUSIONS LOCK

The following commercial capabilities are EXCLUDED from Release 1 baseline:
1. **Discounts / Offers Engine** (Promotional rule engine deferred)
2. **Promotions** (Automated cart promotion rules deferred)
3. **Loyalty Program** (Points earning, tier rules deferred)
4. **Memberships** (Subscription membership perks deferred)
5. **Points / Rewards / Benefits** (Points redemption deferred)

---

## 9. PRODUCT PERSONA & SECURITY ROLE MAPPING

| Business Persona | System Security Representation | Default Role Code | Governance |
| --- | --- | --- | --- |
| **Cashier / Sales Staff** | Built-in Tenant Role | `CASHIER` | Automatic provision on Tenant creation |
| **Business Owner / Admin** | Built-in Tenant Role | `TENANT_ADMIN` | Automatic provision on Tenant creation |
| **Manager** | Custom Tenant Role Persona | Custom Code | Created by Tenant Admin via 5-step Role Wizard |
| **Inventory Staff** | Custom Tenant Role Persona | Custom Code | Created by Tenant Admin via 5-step Role Wizard |
| **Platform Administrator** | Built-in Platform Role | `PLATFORM_ADMIN` | Platform Admin Portal access only |
| **E-Commerce Customer** | Customer Account | N/A | Self-registered or guest customer session |

---

## 10. CHANNEL PARITY PRINCIPLE

- **Fixed POS (Touch POS) & Portable POS (Mobile POS):** Share identical backend APIs, business capabilities, commercial entitlements, and permission security rules. Responsive layouts adjust to viewport size (1024×768 desktop/tablet vs handheld).
- **Tenant Admin:** Operates in responsive browser/tablet UI for administrative management.
- **Platform Admin:** Operates in Angular web portal for SaaS tenant management.
- **Customer E-Commerce:** Operates in Angular storefront application for online ordering and Click & Collect.

---

## 11. REVISION LOG

| Revision | Date | Author | Description |
| --- | --- | --- | --- |
| **R1.0** | 2026-09-02 | BCM-2 Reconciliation | Initial publication of canonical 19-module capability master |
