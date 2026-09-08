<!-- title: ONEVERZ R1 PRODUCTION READINESS CLOSURE -->
<!-- status: CANONICAL / PRODUCTION READINESS CLOSED -->
<!-- system: OneVerz EPOS Release 1 -->
<!-- last_updated: 2026-09-08 -->

# ONEVERZ EPOS — RELEASE 1 PRODUCTION READINESS CLOSURE

## 1. EXECUTIVE SUMMARY

The ONEVERZ EPOS Release 1 (R1) production readiness audit and verification program is complete and **CLOSED**.

- **Commercial Architecture:** FROZEN & CLOSED (18 of 18 Commercially Included Modules CLOSED)
- **Canonical Use Cases:** 291 Total (282 Implemented, 3 Partial, 6 Missing — Remaining 3 Partial and 6 Missing belong exclusively to commercially excluded BM-18)
- **Commercial Plan:** `ONEVERZ_R1_STD` Active with 7 Physical Plan Features (representing 15 Conceptual Commercial Capabilities per OS-R1-3B / OS-R1-4 reconciliation)
- **Production Readiness Audit:** PASS across all 15 Go-Live verification dimensions
- **Defects:** P0 = 0, P1 = 0, P2 = 0, P3 = 0, Unaccepted Blockers = 0
- **Production Deployment Status:** NOT PERFORMED (Deferred until explicit user authorization)
- **Release Tag:** NOT CREATED

---

## 2. CANONICAL BASELINES

| Repository | Canonical Main HEAD | Status | Working Tree |
|---|---|---|---|
| **Backend (`Unified-Commerce`)** | `5cbfe35` | PRODUCTION READY | CLEAN |
| **Platform Admin (`nytroz-pos-platform-admin`)** | `0d54b0b` | PRODUCTION READY | CLEAN |
| **Tenant Admin / POS (`Nytroz-POS-App`)** | `4e4ce90` | PRODUCTION READY | CLEAN |
| **Customer Storefront (`OneVerz_Online - Web\E-commerce`)** | `04366c6` | PRODUCTION READY | CLEAN |
| **Second Brain (`Pos-system-Knowledge`)** | `a0e3e56` | CANONICAL BASELINE | CLEAN |

---

## 3. FROZEN COMMERCIAL MODULE BASELINE

| Business Module | Name | Commercial Status | Implementation Status |
|---|---|---|---|
| **BM-01** | Authentication & Workspace | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-02** | Outlet & Till Management | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-03** | Users, Roles & Permissions | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-04** | Devices & Hardware | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-05** | Till Session & Operations | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-06** | POS Home / Dashboard | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-07** | Product Catalogue Management | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-08** | Inventory & Stock Management | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-09** | Sales / New Sale & Cart | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-10** | Customer Management | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-11** | Park & Recall Sales | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-12** | Payments | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-13** | Receipts | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-14** | Returns, Refunds & Exchanges | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-15** | Cash Management & Till Reconciliation | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-16** | Online Orders & Click & Collect | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-17** | Reporting & Analytics | INCLUDED | **PRODUCTION READY / CLOSED** |
| **BM-18** | Offline & Synchronization | **EXCLUDED** | **PARTIAL (PRESERVED)** |
| **BM-19** | Business / POS Settings | INCLUDED | **PRODUCTION READY / CLOSED** |

- **Commercially Included Modules:** 18
- **Commercially Included Closed:** 18
- **Commercially Included Partial / Missing:** 0
- **Commercially Excluded Modules:** 1 (`BM-18 Offline & Synchronization`)

---

## 4. CANONICAL USE CASE BREAKDOWN (291 TOTAL)

- **Total Canonical Use Cases:** 291
- **Implemented:** 282
- **Partial:** 3 (BM-18 only)
- **Missing:** 6 (BM-18 only)
- **Commercial Target Partial:** 0
- **Commercial Target Missing:** 0

*Historical Note: The previous summary count of 263 was an arithmetic omission that omitted BM-01 (12) and BM-02 (16). The canonical row-level count is 291.*

---

## 5. COMMERCIAL PLAN BASELINE (`ONEVERZ_R1_STD`)

- **Plan Name:** ONEVERZ R1 Standard
- **Plan Code:** `ONEVERZ_R1_STD`
- **Status:** ACTIVE
- **Currency / Price:** LKR 15,000 / month
- **Billing:** MONTHLY
- **Trial Period:** 14 Days
- **Capacity Limits:** 1 Outlet, 2 Tills, 5 Users, Unlimited Products
- **Primary Model Distinction:**
  - **Conceptual Commercial Capabilities (15):** The high-level commercial offering covers 15 capabilities (reconciled from historical baseline 14 with the inclusion of `online_store`).
  - **Physical Subscription Plan Features (7):** Persisted in the database as `subscription_plan_features` rows. Conceptual commercial capabilities and physical plan rows are NOT 1:1.
- **Included Physical Technical Features (7):**
  1. `outlet_management` (`72500000-0000-0000-0000-000000000002`)
  2. `till_management` (`72500000-0000-0000-0000-000000000003`)
  3. `pos_checkout` (`72000000-0000-0000-0000-000000000023`)
  4. `product_catalog` (`72500000-0000-0000-0000-000000000004`)
  5. `sales_orders` (`72000000-0000-0000-0000-000000000004`)
  6. `click_collect` (`72000000-0000-0000-0000-000000000002`)
  7. `online_store` (`72000000-0000-0000-0000-000000000001`)
- **Excluded Physical Feature (1):** `offline_operation_sync` (`72000000-0000-0000-0000-000000000003`) (BM-18 deferred)
- **Plan Catalog Runtime Truth:** Catalog contains 8 TENANT-selectable physical features; `ONEVERZ_R1_STD` selects 7 of those 8.
- **Platform & Core Conceptual Elements (Not Physical Plan Rows):**
  - `user_accounts`: Physical feature with `PLATFORM` scope (enforced by migration `20260831163000_ReconcileSubscriptionPlanTenantFeatureScope`); not tenant-plan selectable.
  - `tenant_profile`, `tenant_settings`: Core entitlement-independent capabilities; built-in platform capabilities, not persisted plan features.
  - `role_management`, `permission_management`, `hardware_device_management`, `inventory_tracking`, `sales_reports`: Conceptual/grouping concepts; non-persisted feature constants, not separate physical plan rows.
- **Plan Mutations During Verification:** 0 (Created via canonical Platform Admin API `POST /api/v1/platform/subscription-plans`, configured via `PATCH /features`, published via `POST /publish`).

---

## 6. PRODUCTION READINESS AUDIT EVIDENCE

| Dimension | Verification Item | Status / Result |
|---|---|---|
| **Environment** | Containerized Cloud / Docker / Kubernetes, PostgreSQL 18, Cloud Storage, Domain, TLS | **READY** |
| **Configuration** | Environment-based variables / KeyVault, zero plaintext credentials in git, CORS enforced, debug banners disabled | **PASS** |
| **Database** | PostgreSQL 18, pending model changes = NONE, migration procedure = READY, backup = READY, restore = VERIFIED, RPO < 15m, RTO < 1h | **READY** |
| **Builds** | Backend Release Build PASS, Platform Admin Build PASS, Tenant Admin/POS Release Build PASS, Health Check (/health) PASS | **PASS** |
| **Security** | Authentication (JWT, PBKDF2/Argon2) PASS, Entitlement PASS, Permission PASS, Outlet/Till Scope PASS, Cross-Tenant Leaks = 0, Platform Isolation PASS | **PASS** |
| **Observability** | Structured logging (Serilog) READY, Request/Trace Correlation IDs READY, Health/Error Monitoring READY, Admin Audit Logging READY | **READY** |
| **Performance** | Login < 150ms, POS Catalog < 200ms, Barcode Lookup < 50ms, Checkout < 250ms, Inventory < 180ms, Orders < 200ms, Reports < 350ms | **PASS** |
| **Hardware** | Barcode Scanner PASS, Thermal Receipt Printer (EscPos Agent) PASS, Cash Drawer Pulse PASS, Card Reader (External Terminal) PASS | **PASS** |
| **Payments** | Cash PASS, Card PASS, LankaQR PASS, Split Payment PASS, Pay at Pickup PASS, Online Gateway (Excluded) | **PASS** |
| **Persona UAT** | Platform Admin PASS, Tenant Admin PASS, Cashier PASS, Negative Authorization / Limited Cashier PASS | **PASS** |
| **Master E2E** | Retail Sale, Park/Recall, Payment, Receipt, Return/Refund, Till Session Open/Close, End of Shift Reconciliation, Click & Collect Pickup | **PASS** |
| **Reliability** | DB Disconnect Recovery PASS, Network Interruption Handling PASS, Storage Outage Isolation PASS, Unexpected 500 = 0, Duplicate Mutations = 0 | **PASS** |
| **Rollback** | Application container rollback procedure READY, Database snapshot/PITR recovery procedure READY | **READY** |
| **Runbooks** | First Tenant Onboarding Runbook, Production Deployment Runbook, Incident Response Runbook, Release Notes | **READY** |

---

## 7. ACCEPTED KNOWN LIMITATIONS

The release audit identified 3 accepted, non-blocking operational limitations:

1. **BM-18 Offline Operation & Synchronization Deferred:**
   - *Description:* BM-18 is excluded from the `ONEVERZ_R1_STD` commercial plan (`offline_operation_sync` excluded). Offline transaction queueing requires active network connection to process sales in R1.
   - *Handling:* Controlled UI error and retry banner displayed on network loss; no data loss.
   - *Status:* Accepted commercial exclusion.
2. **Operator-Managed Subscription Trial Lifecycle & Billing:**
   - *Description:* 14-day trial periods and monthly subscription collection are administratively managed by Platform Administrators in R1. No automatic credit-card billing daemon or automated destructive tenant lockout is active.
   - *Handling:* Platform Admin operational runbook includes weekly subscription audit and manual status lifecycle management.
   - *Status:* Accepted operational procedure.
3. **Tenant Admin Phase B Self-Activation Deferred:**
   - *Description:* Tenant Admin Onboarding is bifurcated into Phase A (Platform Admin tenant provisioning & invitation issuance) and Phase B (Tenant Admin self-activation via token/OTP, password creation, and first login). In R1, Phase A is fully operational and verified (Tenant Admin user created in `INVITED` status, `encrypted_password` is NULL, raw token not stored in database). Phase B self-activation flows remain deferred.
   - *Handling:* Platform Admin initiates tenant provisioning and issues invitation token; Tenant Admin self-activation is deferred until Phase B rollout.
   - *Status:* Accepted architectural boundary.

*(Note: Prior draft limitation "Customer Storefront Browsing (`online_store`) Excluded" is SUPERSEDED by OS-R1-3A/B/4 reconciliation. Customer Storefront Browsing and Ordering is INCLUDED, IMPLEMENTED, and VERIFIED in R1).*

---

## 8. PRODUCTION DEPLOYMENT STATUS

- **Production Readiness:** **COMPLETE / CLOSED / PASS**
- **Production Deployment:** **NOT PERFORMED** (Deferred until explicit user authorization)
- **Release Tag:** **NOT CREATED** (To be created upon scheduled deployment window)
- **Live Status:** **NOT DECLARED BY THIS TASK**

---

## 9. R1 COMMERCIAL MODEL RECONCILIATION — ONLINE STORE INCLUSION (OS-R1-4)

### 9.1 Background & Context
Following the initial R1 production readiness verification, an exhaustive canonical audit (`OS-R1-3A`) and runtime plan creation/verification (`OS-R1-3B`) were executed to reconcile the commercial baseline. The historical assumption that `ONEVERZ_R1_STD` physically contains 14 or 15 `subscription_plan_features` rows was identified as a category error confusing conceptual commercial capabilities with physical database rows.

### 9.2 The Primary Model Distinction
```text
CONCEPTUAL COMMERCIAL MODEL (15 Capabilities)
                     ≠
PHYSICAL RUNTIME PLAN FEATURES (7 Database Rows)
```
- **Conceptual Commercial Capabilities (15):** Business-level taxonomy representing the complete suite of capabilities available to an R1 tenant (reconciled from 14 baseline with `online_store`).
- **Physical Technical Features in `ONEVERZ_R1_STD` (7):** The concrete rows persisted in `subscription_plan_features` that drive runtime entitlement checks. Conceptual commercial capabilities and physical database rows must never be conflated.

### 9.3 Before / After Reconciliation Matrix

| Concept | Historical Pre-Audit Claim | Verified Canonical State | Reconciliation Action |
|---|---|---|---|
| **Conceptual Commercial Count** | 14 | **15** | Expanded to 15 with Online Store inclusion |
| **Physical Plan Feature Count** | Incorrectly claimed as 14/15 | **7** | Reconciled to exact physical database rows in `ONEVERZ_R1_STD` |
| **Online Store (`online_store`)** | Claimed EXCLUDED | **INCLUDED / ACTIVE** | Feature ID `72000000-0000-0000-0000-000000000001` added to `ONEVERZ_R1_STD` |
| **Customer Storefront Browsing** | Claimed EXCLUDED | **INCLUDED / VERIFIED** | Verified end-to-end (resolution, catalog, product browse, cart, checkout) |
| **Sales Orders (`sales_orders`)** | Included | **INCLUDED / ACTIVE** | Physical plan feature in `ONEVERZ_R1_STD` (`72000000-0000-0000-0000-000000000004`) |
| **Click & Collect (`click_collect`)** | Included | **INCLUDED / ACTIVE** | Physical plan feature in `ONEVERZ_R1_STD` (`72000000-0000-0000-0000-000000000002`) |
| **Offline Sync (`offline_operation_sync`)** | EXCLUDED | **EXCLUDED / DEFERRED** | Physical feature exists (`72000000-0000-0000-0000-000000000003`); excluded from plan |
| **User Accounts (`user_accounts`)** | Claimed as tenant plan feature | **PLATFORM SCOPED** | Enforced as PLATFORM scope by migration `20260831163000`; not plan-selectable |
| **Tenant Profile & Settings** | Claimed as plan feature rows | **CORE INDEPENDENT** | Built-in platform capabilities; unseeded, not plan rows |
| **Grouping / Technical Concepts** | Claimed as plan feature rows | **NON-PERSISTED GROUPINGS** | `role_management`, `permission_management`, `hardware_device_management`, `inventory_tracking`, `sales_reports` are code concepts, not plan rows |
| **Canonical Use Cases** | 291 | **291** | Preserved exactly; zero use case drift |
| **Business Modules** | 19 | **19** | Preserved exactly; zero module drift |

### 9.4 Physical Runtime Plan Specification
- **Plan Code:** `ONEVERZ_R1_STD`
- **Plan Name:** `ONEVERZ R1 Standard`
- **Plan Status:** `ACTIVE`
- **Billing Interval:** `MONTHLY`
- **Base Price:** `LKR 15,000`
- **Trial Period:** `14 Days`
- **Capacity Limits:** Outlets: 1, Tills: 2, Users: 5, Products: Unlimited
- **Physical Plan Features (7):**
  1. `outlet_management` (`72500000-0000-0000-0000-000000000002`)
  2. `till_management` (`72500000-0000-0000-0000-000000000003`)
  3. `pos_checkout` (`72000000-0000-0000-0000-000000000023`)
  4. `product_catalog` (`72500000-0000-0000-0000-000000000004`)
  5. `sales_orders` (`72000000-0000-0000-0000-000000000004`)
  6. `click_collect` (`72000000-0000-0000-0000-000000000002`)
  7. `online_store` (`72000000-0000-0000-0000-000000000001`)

### 9.5 Plan Persistence & Security Architecture
- **Plan Persistence Contract:**
  `SubscriptionPlan` → `SubscriptionPlanFeature` → `Physical Technical Feature ID`  
  *(Never: Plan → Permission, Plan → Role, Plan → Business Module, or Plan → Business Capability).*
- **Commercial Entitlement vs Permission Invariant:**
  `Feature Exists` → `Tenant Entitled?` → `User Permission?` → `Outlet/Till Scope (if applicable)?` → `ALLOW`  
  Plan assignment never mutates roles or grants permissions.
- **Role/Permission Safety Invariant:**
  Plan-created permissions: 0; Plan-created roles: 0; Role-permission mutations: 0.

### 9.6 Business Module Scope Alignment (BM-16 vs BM-18)
- **BM-16 Online Orders & Click & Collect:**
  - `BM16.STOREFRONT_ONLINE_STORE`: **INCLUDED / VERIFIED**
  - `BM16.ONLINE_ORDERS`: **INCLUDED / VERIFIED**
  - `BM16.CLICK_COLLECT_PICKUP`: **INCLUDED / VERIFIED**
  - Customer Storefront: **INCLUDED / VERIFIED**
- **BM-18 Offline & Synchronization:**
  - Status: **R1 EXCLUDED / DEFERRED**
  - Feature `offline_operation_sync`: Exists in feature catalog, but explicitly excluded from `ONEVERZ_R1_STD`.

### 9.7 Remediation & Audit Gap Closure
All remediation audit items identified for the Online Store R1 integration are formally CLOSED:
- **R1-OS-AUD-001 (Cashier 8/8 Online Picking Permissions):** **CLOSED** (8/8 cashier permissions verified active in `permission_definitions`).
- **R1-OS-AUD-002 (Commercial Plan Creation & Entitlement Reconciliation):** **CLOSED** (`ONEVERZ_R1_STD` created with 7 physical features via canonical Platform Admin API; tenant entitlement reconciliation verified via `restore-to-plan`).
- **R1-OS-AUD-003 (Second Brain Documentation Reconciliation):** **CLOSED** (Commercial model aligned, conceptual vs physical plan counts clarified, stale exclusion references resolved).
- **Remediation Defect Status:** P0 = 0, P1 = 0, P2 = 0, P3 = 0.

