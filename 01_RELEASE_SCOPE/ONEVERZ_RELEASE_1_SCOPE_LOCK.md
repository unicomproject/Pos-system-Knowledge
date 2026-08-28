# OneVerz EPOS Release 1 Scope Lock

<!-- title: OneVerz Release 1 Scope Lock -->
<!-- status: BUSINESS SCOPE LOCKED — OWNER APPROVED -->
<!-- system: OneVerz EPOS -->
<!-- last_updated: 2026-08-21 -->

---

## 1. Release Scope Authority

This document defines the **final, business-owner approved Release 1 (R1) scope** for the OneVerz EPOS platform. It is the primary authority for all implementation, design, and testing activities.

```
Release 1 Business Scope
        ↓
R1 Modules
        ↓
R1 Features
        ↓
R1 Permissions
        ↓
Entitlements
        ↓
Roles / Users / Outlet / Till Scope
        ↓
Frontend + Backend + DB + Tests
```

> [!IMPORTANT]
> **Global Technical Catalog ≠ Release 1 Catalog**  
> Capabilities present in the global catalog, codebase constants, or database tables are NOT automatically included in Release 1. The R1 catalog is strictly filtered by this business scope lock.

---

## 2. Release 1 Functional Scope Boundaries

### 2.1 Business Template
*   **Merchandise Retail Store**: Standard retail and merchandise business templates.
*   **Preconfigured setup wizard** supporting merchandise retail configurations.

### 2.2 Subscription & Billing
*   **In-Scope (R1)**:
    *   Trial subscription management
    *   Demo subscription management
    *   Subscription plan assignment
    *   Tenant activation and deactivation
    *   Feature/entitlement assignment
    *   Trial/demo lifecycle management
*   **Out-of-Scope (R1/R2)**:
    *   Online subscription payment gateway integrations
    *   Automatic recurring billing
    *   Automatic renewal processing
    *   Advanced invoice adjustment billing operations

### 2.3 Inventory Management (5 / 14 Suite Only)
Release 1 implements only **5 out of 14** inventory capabilities.
1.  **Opening Stock**: Entry of initial stock levels.
2.  **Stock Receiving**: Record receipt of incoming stock from suppliers or sources.
3.  **Stock Adjustment**: Modify stock counts to resolve discrepancies.
4.  **Channel Allocation**: Allocate stock limits to specific sales channels (POS vs. Online Store).
5.  **Current Stock / Product Detail / Inventory Dashboard**: Real-time stock status, lookup, and reports.

*   **R1 Foundation**:
    *   Stock balance tracking
    *   Inventory transaction logging (ledger)
    *   Outlet-product stock mapping
*   **Out-of-Scope (R1)**:
    *   Stock Out (Manual stock reduction/disposals)
    *   Stock Transfer (Inter-outlet movements)
    *   Stock Count (Periodic audits/stocktakes)
    *   Purchase Orders & Supplier Management
    *   Advanced Inventory (replenishment rules, forecasting, automated reorders)
    *   Remaining 9/14 inventory suite features

### 2.4 Platform Administration (Super Admin)
*   **In-Scope (R1)**:
    *   Platform Dashboard (widgets, stats)
    *   Tenant Management (create, suspend, activate)
    *   Merchandise Business Template preconfigurations
    *   Trial/Demo tenant management
    *   Subscription Plan Management (create, edit, archive plans)
    *   Feature & Entitlement Management
    *   Platform Users creation and management
    *   Platform Roles & Permissions assignment
    *   Platform Audit & Security logs
    *   Tenant Bootstrap operations (Selected-Tenant mode setup hub)

### 2.5 Tenant Administration (Business Owner / Manager)
*   **In-Scope (R1)**:
    *   Tenant Dashboard (sales, performance)
    *   Outlet Management (outlets, business hours, addresses)
    *   Till Management (tills, device assignment)
    *   User Management (create, invite, update, disable staff)
    *   Roles & Permissions (custom roles, permissions assignment)
    *   Product Setup (variants, category, brand, tax mapping)
    *   Category & Sub-category setup
    *   Brand Management
    *   Tax Management (tax classes, tax rates)
    *   Inventory (5/14 features only)
    *   Online Store setup & configuration (branding, settings, policies, domains)
    *   Online Order Management & Store Fulfilment
    *   Click & Collect collection rules
    *   Reports required by R1 business needs

### 2.6 Product Setup
*   **In-Scope (R1)**:
    *   Simple Products
    *   Variant Products (attribute/value options)
    *   Bundle / Kit (where currently supported by the 7-step wizard)
    *   Product metadata: Name, Description, Status, Images
    *   Category/Sub-category and Brand associations
    *   Units & Pack configuration
    *   SKU and Barcode attributes
    *   Cost price, Selling price, and Discount price
    *   Tax class mapping
    *   Publish/Create workflow

### 2.7 Cashier POS
*   **In-Scope (R1)**:
    *   Cashier PIN Login
    *   Outlet and Till register context selection
    *   Product browsing and keyword searching
    *   Barcode scanning for quick cart addition
    *   Cart management: Add to cart, Update quantity, Remove item, Clear cart
    *   Dynamic price, tax, and discount calculation
    *   **CASH PAYMENT ONLY** checkout
    *   Amount due, Cash tendered, and Change calculation
    *   Complete sale and generate transaction receipt
    *   Email digital receipt to customer
    *   Offline POS mode (offline cash sales, local persistence, outbox queue)
    *   Automatic transaction sync upon reconnection

### 2.8 Payments
*   **In-Scope (R1)**:
    *   **Cash Only** checkout.
    *   Authorized by: `payments.cash.accept`
*   **Out-of-Scope (R1/R2)**:
    *   Card Payment (L1/L2 integrated card machines) -> **R2**
    *   LankaQR / Dynamic QR codes -> **R2**
    *   Split Payment (Cash + Card) -> **R2**
    *   Other online payment gateways -> **R2**
    *   Authorized by: `payments.card.accept`, `payments.qr.accept`, `payments.split.accept`

### 2.9 E-Commerce (Click & Collect Focus)
*   **In-Scope (R1)**:
    *   Browse product catalogue
    *   Product details and image gallery
    *   Search and Filter by Category/Brand
    *   Add to Cart / Cart Management
    *   View cart total
    *   Select Click & Collect checkout options
    *   Select Pickup Outlet
    *   Select collection date/time (as supported by store frontend)
    *   Place pickup order

> [!IMPORTANT]
> **Storefront vs. Employee Auth**  
> Customer storefront operations are NOT governed by employee permissions. Storefront authorization relies on Customer Identity, Ownership tokens, and Order/Object-level authorization.

### 2.10 Online Order Management / Store Fulfilment
*   **In-Scope (R1)**:
    *   View online orders list and details
    *   New order notifications (as supported by admin client)
    *   Accept / Process order
    *   Prepare items / packing
    *   Mark as "Ready for Collection"
    *   Mark as "Collected" / Completed

*   **Store Fulfilment Workflow**:
    ```
    Order Received
    → Confirm Order
    → Validate/Allocate Stock
    → Prepare Items
    → Ready for Collection
    → Customer Collects
    → Complete Order
    → Inventory Update
    ```

### 2.11 Reports
*   **In-Scope (R1)**:
    *   **Sales Reports**: Summary, by Date, by Outlet, by Product, by Cashier
    *   **Product Reports**: Product Sales, Product Performance
    *   **Inventory Reports**: Current Stock, Stock by Outlet, Stock Movement, Stock Adjustment, Stock Receiving
    *   **Order Reports**: Online Orders list, Click & Collect orders, Order Status summary
*   **Out-of-Scope (R1)**:
    *   Advanced Business Intelligence (BI) dashboard reports
    *   Sales forecasting and demand planning

### 2.12 Email Receipt
*   **In-Scope (R1)**: Capture customer email at cashier POS and trigger automatic digital receipt delivery.
*   **Rule**: No dedicated permission code exists for Email Receipt. It is a runtime capability covered by standard sale / receipt authorization.

### 2.13 Security, Access Control & Isolation
*   **In-Scope (R1)**:
    *   Staff Authentication (JWT / Sessions)
    *   Tenant Data Isolation (TenantId scoping on DB queries)
    *   Role-Based Access Control (RBAC)
    *   Feature-Based Permissions
    *   Outlet access scoping
    *   Till/Device mapping scoping
    *   API authorization policy enforcement
    *   Audit Logging of critical actions
    *   Tenant entitlement ceiling (e.g., maximum outlets/tills allowed by plan)
    *   Delegation ceiling (roles cannot grant permissions they do not possess)

> [!IMPORTANT]
> **Database Isolation**  
> Row-Level Security (RLS) is NOT used. Multi-tenant isolation is enforced at the application/EF Core query-filtering layer using TenantId scoping.

### 2.14 Offline Operations
*   **In-Scope (R1)**:
    *   Offline POS transactions (cash sales only)
    *   Local SQLite / client persistence
    *   Outbox queue storage
    *   Automatic background sync upon reconnection
    *   Local POS receipt printing
    *   Last-known permission state cache enforcement
    *   Last-known TenantFeatureEntitlement state enforcement
*   **Clarification**:
    *   Offline runtime sync capability = **R1**
    *   Manual sync trigger permission (`pos.offline.sync`) = **R2 / Deferred**

---

## 3. Scope Status & Lock

*   **Release 1 Business Scope**: `LOCKED — OWNER APPROVED`
*   **Release 1 Module Set**: `LOCK CANDIDATE`
*   **Release 1 Feature Set**: `LOCK CANDIDATE`
*   **Release 1 Permission Set**: `OWNER DECISIONS COMPLETE — TECHNICAL VALIDATION PENDING`
