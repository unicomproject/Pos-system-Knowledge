# OneVerz Canonical Permission and Feature Entitlement Contract (Release 1)

<!-- title: Canonical Permission and Feature Entitlement Contract (Release 1) -->
<!-- status: CANONICAL — LOCKED & MERGED -->
<!-- system: OneVerz POS MVP / Unified Commerce -->
<!-- last_updated: 2026-08-28 -->

> [!NOTE]
> **Authoritative Single Source of Truth for Entitlements**  
> Reconciled capability catalog is locked in [CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md](file:///c:/Users/User/Desktop/Nytroz__POS/Nytroz%20POS%20-%20Second%20Brain/Pos-system-Knowledge/02_ACCESS_CONTROL/CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md).

---

## 1. Authority Order

This document follows the strict authority hierarchy locked for Release 1:

1.  **Owner-approved Release 1 Business Scope** (Primary business authority deciding WHAT is in R1)
2.  **Canonical R1 Module → Feature → Permission contract** (This document, specifying technical tokens)
3.  **Global technical Module / Feature / Permission catalog** (All system-wide capabilities)
4.  **Current backend implementation** (Code constants, services, controllers)
5.  **Database seeds / migrations** (Applied EF Core migrations, raw SQL definitions)
6.  **Frontend implementation** (Angular Platform Admin and Flutter POS/Tenant clients)
7.  **Tests** (Integration and unit test authorization assertions)
8.  **Historical / archived documents** (Older wiki pages or design drafts)

> [!NOTE]
> **Business Scope vs. Implementation Evidence**  
> Business scope decides *what* must be in Release 1. Implementation evidence decides *whether* that R1 capability is currently complete.
## 2. Naming Standards & Conventions

| Domain | Format / Style | Example | Rules |
|---|---|---|---|
| Module Code | snake_case | product_management | Lowercase, underscore separated identifier |
| Commercial Entitlement Key | snake_case | product_catalog | Commercial tier key assigned in tenant_feature_entitlements |
| Feature Code | snake_case | inventory_tracking | Technical feature code under a module |
| Permission Code | module.feature.action | catalog.products.create | Dot-separated hierarchical string |
| Platform Permission Code | platform.resource.action | platform.tenants.create | Prefixed with platform. |
| Selected-Tenant Mode Code | platform.tenants.bootstrap.scope | platform.tenants.bootstrap.outlets.manage | Prefixed with platform.tenants.bootstrap. |

### Legacy and Invalid Tokens Classification (19 Tokens)

The following tokens exist in legacy documentation, database migrations, or code constants. They are audited and classified below to clarify their correct release scope and usage, resolving early-draft inconsistencies.

| # | Token Code | Classification Type | Replacement Entitlement / Permission | Counted as Active Permission? | Reason and Audit Verdict |
|---|---|---|---|---|---|
| 1 | pos.cash_drawer | INVALID_TECHNICAL_GROUPING | cash_drawer.view / cash_drawer.manage | No | Group header placeholder; not a granular check token. |
| 2 | pos.customers | INVALID_TECHNICAL_GROUPING | customers.view / customers.create | No | Group header placeholder; replaced by specific CRM tokens. |
| 3 | pos.exchanges | INVALID_TECHNICAL_GROUPING | exchanges.view / exchanges.create | No | Group header placeholder; replaced by return/refund/exchange actions. |
| 4 | pos.home | INVALID_TECHNICAL_GROUPING | pos.home.view | No | Group header placeholder; replaced by specific POS pages. |
| 5 | pos.notifications | INVALID_TECHNICAL_GROUPING | notifications.view | No | Group header placeholder; replaced by user system notifications. |
| 6 | pos.orders | INVALID_TECHNICAL_GROUPING | orders.view | No | Group header placeholder; replaced by specific order listings. |
| 7 | pos.payments | INVALID_TECHNICAL_GROUPING | payments.*.accept | No | Group header placeholder; replaced by individual checkout types. |
| 8 | pos.products | INVALID_TECHNICAL_GROUPING | products.view / products.search | No | Group header placeholder; replaced by catalog and cashier view permissions. |
| 9 | pos.receipts | INVALID_TECHNICAL_GROUPING | receipts.view / receipts.print | No | Group header placeholder; replaced by specific receipt action tokens. |
| 10 | pos.returns | INVALID_TECHNICAL_GROUPING | returns.view / returns.create | No | Group header placeholder; replaced by return policy actions. |
| 11 | pos.sales | INVALID_TECHNICAL_GROUPING | sales.create / sales.view / sales.checkout | No | Group header placeholder; replaced by active transaction tokens. |
| 12 | pos.till | INVALID_TECHNICAL_GROUPING | pos.till.open / pos.till.close | No | Group header placeholder; replaced by cashier open/close shift flows. |
| 13 | tenant.till_ops | LEGACY_ALIAS | pos.till.open / pos.till.close | No | Deprecated prefix used in early drafts; replaced by pos_sales module. |
| 14 | tenant.till.manage | LEGACY_ALIAS | tenant.tills.manage | Yes (in DB seeds only) | Seeded as active in DB for backward compatibility, but legacy duplicate. Replaced in C# by tenant.tills.manage. |
| 15 | product_barcodes | INVALID_ENTITLEMENT_KEY | product_catalog | No | Early entitlement key placeholder; correct key is product_catalog. |
| 16 | product_brands | INVALID_ENTITLEMENT_KEY | product_catalog | No | Early entitlement key placeholder; correct key is product_catalog. |
| 17 | product_categories | INVALID_ENTITLEMENT_KEY | product_catalog | No | Early entitlement key placeholder; correct key is product_catalog. |
| 18 | product_images | INVALID_ENTITLEMENT_KEY | product_catalog | No | Early entitlement key placeholder; correct key is product_catalog. |
| 19 | product_variants | INVALID_ENTITLEMENT_KEY | product_catalog | No | Early entitlement key placeholder; correct key is product_catalog. |

---

## 3. Module Master Catalog

Commercially, OneVerz operates on **33 Commercial Modules** (reconciling the 3 capacity add-ons under capacity_addons). Technically, the database seeding structures resolve **35 Technical Modules**.

### Category Sub-Totals
- **Core System Modules**: 10
- **Commercial Feature Modules**: 16
- **Add-on Feature Modules**: 9 (6 functional integrations, 3 capacity add-ons)
- **Total Technical Modules**: 35

| # | Module Code | Module Name | Category | Core / Commercial | Source of Evidence | Scope | R1 / R2 | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | authentication | Authentication | System | Core System | platform-module-catalog.seed.json | Platform/Tenant | R1 | COMPLETE |
| 2 | tenant_management | Tenant Operations | System | Core System | platform-module-catalog.seed.json | Platform/Tenant | R1 | COMPLETE |
| 3 | user_management | User Management | System | Core System | platform-module-catalog.seed.json | Platform/Tenant | R1 | COMPLETE |
| 4 | 
ole_permission_management | Access Control & Roles | System | Core System | platform-module-catalog.seed.json | Security | R1 | COMPLETE |
| 5 | billing_core | Billing & Subscriptions | System | Core System | platform-module-catalog.seed.json | Commercial | R1 | COMPLETE |
| 6 | 
otification_system | Notification System | System | Core System | platform-module-catalog.seed.json | Operations | R1 | COMPLETE |
| 7 | integration_core | Integration Core | System | Core System | platform-module-catalog.seed.json | Developer API | R1 | COMPLETE |
| 8 | audit_logging | Audit & Logging | System | Core System | platform-module-catalog.seed.json | Compliance | R1 | COMPLETE |
| 9 | outlet_till_core | Outlet & Till Core | System | Core System | platform-module-catalog.seed.json | Physical Foundation | R1 | COMPLETE |
| 10 | master_data | Master Data | System | Core System | platform-module-catalog.seed.json | Reference Data | R1 | COMPLETE |
| 11 | pos_sales | POS Sales | Feature | Commercial Feature | platform-module-catalog.seed.json | POS / Cashier | R1 | COMPLETE |
| 12 | product_management | Product Management | Feature | Commercial Feature | TenantAdminProductPermissions.cs | Catalog | R1 | COMPLETE |
| 13 | catalog_extensions | Catalog Extensions | Feature | Commercial Feature | platform-module-catalog.seed.json | Catalog | R1 | COMPLETE |
| 14 | inventory_management | Inventory Management | Feature | Commercial Feature | StockPermissions.cs | Inventory | R1 | COMPLETE |
| 15 | stock_management | Stock Management | Feature | Commercial Feature | StockPermissions.cs | Inventory | R1 | COMPLETE |
| 16 | customer_management | Customer Management | Feature | Commercial Feature | CustomerPermissions.cs | CRM / POS | R1 | COMPLETE |
| 17 | pricing_tax_engine | Pricing & Tax Engine | Feature | Commercial Feature | PricingTaxPermissions.cs | Finance | R1 | COMPLETE |
| 18 | discount_engine | Pricing & Discount Engine | Feature | Commercial Feature | DevelopmentPosDiscountWorkflowSeedData.cs | Sales | R1 | COMPLETE |
| 19 | orders_management | Orders Management | Feature | Commercial Feature | SalesPermissions.cs | Orders | R1 | COMPLETE |
| 20 | cart_checkout | Cart & Checkout | Feature | Commercial Feature | TenantAdminOnlineStorePermissions.cs | Storefront | R1 | COMPLETE |
| 21 | payment_processing | Payment Processing | Feature | Commercial Feature | PaymentPermissions.cs | Finance | R1 | COMPLETE |
| 22 | returns_refunds | Returns & Refunds | Feature | Commercial Feature | ReturnsPermissions.cs | POS / Sales | R1 | COMPLETE |
| 23 | 
eporting_analytics | Reporting & Analytics | Feature | Commercial Feature | TenantAdminReportPermissions.cs | BI / Admin | R1 | COMPLETE |
| 24 | fulfillment_pickupp | Fulfilment & Pickup | Feature | Commercial Feature | TenantAdminOnlineStorePermissions.cs | E-Commerce | R1 | COMPLETE |
| 25 | hardware_cash_control | Hardware & Cash Control | Feature | Commercial Feature | CashDrawerPermissions.cs | Hardware / POS | R1 | COMPLETE |
| 26 | offline_sync | Offline Operations | Feature | Commercial Feature | PosPermissions.cs | POS Device | R1 | PARTIAL |
| 27 | whatsapp_integration | WhatsApp Integration | Addon | Commercial Addon | platform-module-catalog.seed.json | Integrations | R2 | DEFERRED |
| 28 | advanced_ai_analyticsytics | Advanced AI Analytics | Addon | Commercial Addon | platform-module-catalog.seed.json | Analytics | R2 | DEFERRED |
| 29 | loyalty_program | Loyalty Program | Addon | Commercial Addon | platform-module-catalog.seed.json | CRM | R2 | DEFERRED |
| 30 | delivery_integration | Delivery Integration | Addon | Commercial Addon | platform-module-catalog.seed.json | Fulfilment | R2 | DEFERRED |
| 31 | accounting_integrationration | Accounting Integration | Addon | Commercial Addon | platform-module-catalog.seed.json | Finance | R2 | DEFERRED |
| 32 | marketing_automation | Marketing Automation | Addon | Commercial Addon | platform-module-catalog.seed.json | Marketing | R2 | DEFERRED |
| 33 | extra_outlet | Extra Outlet Capacity | Addon | Capacity Addon | platform-module-catalog.seed.json | Capacity | R1 | COMPLETE |
| 34 | extra_till | Extra Till Capacity | Addon | Capacity Addon | platform-module-catalog.seed.json | Capacity | R1 | COMPLETE |
| 35 | extra_user | Extra User Capacity | Addon | Capacity Addon | platform-module-catalog.seed.json | Capacity | R1 | COMPLETE |

---

## 4. Feature Master Table

This table contains all **154 features** seeded into platform_features from the global modules configuration.

- **System Features**: 50 (10 Modules * 5 Features)
- **Commercial Features**: 77
- **Add-on Features**: 27
- **Total Seeded Features**: 154

### Feature Details (Modules 1 - 10: System Core)
| Module Code | Feature Code | Feature Name | Core / Commercial | Scope | R1 / R2 | Status |
|---|---|---|---|---|---|---|
| authentication | auth_login | User Login | Core System | Platform/Tenant | R1 | ACTIVE |
| authentication | auth_session_management | Session Management | Core System | Platform/Tenant | R1 | ACTIVE |
| authentication | auth_password_reset | Password Reset | Core System | Platform/Tenant | R1 | ACTIVE |
| authentication | auth_multi_factor | Multi-Factor Authentication | Core System | Platform/Tenant | R1 | ACTIVE |
| authentication | auth_token_refresh | Token Refresh | Core System | Platform/Tenant | R1 | ACTIVE |
| tenant_management | tenant_profile | Tenant Profile | Core System | Platform/Tenant | R1 | ACTIVE |
| tenant_management | tenant_settings | Tenant Settings | Core System | Platform/Tenant | R1 | ACTIVE |
| tenant_management | tenant_domains | Custom Domains | Core System | Platform/Tenant | R1 | ACTIVE |
| tenant_management | tenant_addresses | Tenant Addresses | Core System | Platform/Tenant | R1 | ACTIVE |
| tenant_management | tenant_onboarding | Tenant Onboarding Wizard | Core System | Platform/Tenant | R1 | ACTIVE |
| user_management | user_accounts | User Accounts | Core System | Platform/Tenant | R1 | ACTIVE |
| user_management | user_invitations | User Invitations | Core System | Platform/Tenant | R1 | ACTIVE |
| user_management | user_profiles | User Profiles | Core System | Platform/Tenant | R1 | ACTIVE |
| user_management | user_deactivation | User Deactivation | Core System | Platform/Tenant | R1 | ACTIVE |
| user_management | user_activity_status | User Activity Status | Core System | Platform/Tenant | R1 | ACTIVE |
| 
ole_permission_management | 
ole_management | Role Management | Core System | Security | R1 | ACTIVE |
| 
ole_permission_management | permission_management | Permission Management | Core System | Security | R1 | ACTIVE |
| 
ole_permission_management | 
ole_assignment | Role Assignment | Core System | Security | R1 | ACTIVE |
| 
ole_permission_management | permission_assignment | Direct Permission Assignment | Core System | Security | R1 | ACTIVE |
| 
ole_permission_management | access_policy_enforcement | Access Policy Enforcement | Core System | Security | R1 | ACTIVE |
| billing_core | subscription_overview | Subscription Overview | Core System | Commercial | R1 | ACTIVE |
| billing_core | invoice_history | Invoice History | Core System | Commercial | R1 | ACTIVE |
| billing_core | payment_method_management | Payment Method Management | Core System | Commercial | R1 | ACTIVE |
| billing_core | billing_notificationstions | Billing Notifications | Core System | Commercial | R1 | ACTIVE |
| billing_core | usage_summary | Usage Summary | Core System | Commercial | R1 | ACTIVE |
| 
otification_system | in_app_notifications | In-App Notifications | Core System | Operations | R1 | ACTIVE |
| 
otification_system | 
otification_preferences | Notification Preferences | Core System | Operations | R1 | ACTIVE |
| 
otification_system | email_delivery_core | Core Email Delivery | Core System | Operations | R1 | ACTIVE |
| 
otification_system | 
otification_templates_core | Core Notification Templates | Core System | Operations | R1 | ACTIVE |
| 
otification_system | 
otification_event_dispatch | Event Dispatch | Core System | Operations | R1 | ACTIVE |
| integration_core | api_key_management | API Key Management | Core System | Developer API | R1 | ACTIVE |
| integration_core | webhook_management | Webhook Management | Core System | Developer API | R1 | ACTIVE |
| integration_core | integration_logs | Integration Logs | Core System | Developer API | R1 | ACTIVE |
| integration_core | integration_health_monitoring | Integration Health Monitoring | Core System | Developer API | R1 | ACTIVE |
| integration_core | oauth_client_management | OAuth Client Management | Core System | Developer API | R1 | ACTIVE |
| audit_logging | audit_trail | Audit Trail | Core System | Compliance | R1 | ACTIVE |
| audit_logging | login_audit | Login Audit | Core System | Compliance | R1 | ACTIVE |
| audit_logging | activity_log | Activity Log | Core System | Compliance | R1 | ACTIVE |
| audit_logging | data_change_history | Data Change History | Core System | Compliance | R1 | ACTIVE |
| audit_logging | security_event_log | Security Event Log | Core System | Compliance | R1 | ACTIVE |
| outlet_till_core | outlet_management | Outlet Management | Core System | Physical Foundation | R1 | ACTIVE |
| outlet_till_core | till_management | Till Management | Core System | Physical Foundation | R1 | ACTIVE |
| outlet_till_core | device_registration | Device Registration | Core System | Physical Foundation | R1 | ACTIVE |
| outlet_till_core | outlet_business_hours | Outlet Business Hours | Core System | Physical Foundation | R1 | ACTIVE |
| outlet_till_core | sales_channel_configuration | Sales Channel Configuration | Core System | Physical Foundation | R1 | ACTIVE |
| master_data | currency_management | Currency Management | Core System | Reference Data | R1 | ACTIVE |
| master_data | unit_of_measure | Unit of Measure | Core System | Reference Data | R1 | ACTIVE |
| master_data | business_type_catalog | Business Type Catalog | Core System | Reference Data | R1 | ACTIVE |
| master_data | 	ax_category_reference | Tax Category Reference | Core System | Reference Data | R1 | ACTIVE |
| master_data | global_setting_definitions | Global Setting Definitions | Core System | Reference Data | R1 | ACTIVE |

### Feature Details (Modules 11 - 26: Commercial Features)
| Module Code | Feature Code | Feature Name | Core / Commercial | Scope | R1 / R2 | Status |
|---|---|---|---|---|---|---|
| pos_sales | pos_checkout | POS Checkout | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| pos_sales | pos_order_hold | Order Hold & Recall | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| pos_sales | pos_quick_sale | Quick Sale | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| pos_sales | pos_barcode_scan | Barcode Scanning | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| pos_sales | pos_receipt_print | Receipt Printing | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| pos_sales | pos_till_session | Till Session Management | Commercial Feature | POS / Cashier | R1 | ACTIVE |
| product_management | product_catalog | Product Catalog | Commercial Feature | Catalog | R1 | ACTIVE |
| catalog_extensions | product_attributes | Product Attributes | Commercial Feature | Catalog | R1 | ACTIVE |
| catalog_extensions | product_options | Product Options & Modifiers | Commercial Feature | Catalog | R1 | ACTIVE |
| catalog_extensions | combo_bundles | Combo & Bundle Products | Commercial Feature | Catalog | R1 | ACTIVE |
| catalog_extensions | product_collections | Product Collections | Commercial Feature | Catalog | R1 | ACTIVE |
| catalog_extensions | channel_visibility | Channel Visibility Rules | Commercial Feature | Catalog | R1 | ACTIVE |
| inventory_management | inventory_tracking | Inventory Tracking | Commercial Feature | Inventory | R1 | ACTIVE |
| inventory_management | inventory_adjustments | Inventory Adjustments | Commercial Feature | Inventory | R1 | ACTIVE |
| inventory_management | inventory_transfers | Inter-Location Transfers | Commercial Feature | Inventory | R1 | ACTIVE |
| inventory_management | inventory_alerts | Low Stock Alerts | Commercial Feature | Inventory | R1 | ACTIVE |
| inventory_management | inventory_valuation | Inventory Valuation | Commercial Feature | Inventory | R1 | ACTIVE |
| stock_management | stock_movement | Stock Movement Ledger | Commercial Feature | Inventory | R1 | ACTIVE |
| stock_management | stock_reconciliation | Stock Reconciliation | Commercial Feature | Inventory | R1 | ACTIVE |
| stock_management | multi_location_stock | Multi-Location Stock | Commercial Feature | Inventory | R1 | ACTIVE |
| stock_management | stock_reservations | Stock Reservations | Commercial Feature | Inventory | R1 | ACTIVE |
| stock_management | stock_take_counts | Stock Take & Cycle Counts | Commercial Feature | Inventory | R1 | ACTIVE |
| customer_management | customer_profiles | Customer Profiles | Commercial Feature | CRM / POS | R1 | ACTIVE |
| customer_management | customer_groups | Customer Groups | Commercial Feature | CRM / POS | R1 | ACTIVE |
| customer_management | customer_addresses | Customer Addresses | Commercial Feature | CRM / POS | R1 | ACTIVE |
| customer_management | customer_purchase_history | Purchase History | Commercial Feature | CRM / POS | R1 | ACTIVE |
| customer_management | customer_notes | Customer Notes & Tags | Commercial Feature | CRM / POS | R1 | ACTIVE |
| pricing_tax_engine | price_lists | Price Lists | Commercial Feature | Finance | R1 | ACTIVE |
| pricing_tax_engine | 	ax_rules | Tax Rules | Commercial Feature | Finance | R1 | ACTIVE |
| pricing_tax_engine | 	ax_calculation | Tax Calculation | Commercial Feature | Finance | R1 | ACTIVE |
| pricing_tax_engine | price_overrides | Price Overrides | Commercial Feature | Finance | R1 | ACTIVE |
| pricing_tax_engine | inclusive_exclusive_tax | Inclusive / Exclusive Tax Modes | Commercial Feature | Finance | R1 | ACTIVE |
| discount_engine | discount_rules | Discount Rules | Commercial Feature | Sales | R1 | ACTIVE |
| discount_engine | promo_codes | Promo Codes | Commercial Feature | Sales | R1 | ACTIVE |
| discount_engine | automatic_discounts | Automatic Discounts | Commercial Feature | Sales | R1 | ACTIVE |
| discount_engine | line_item_discounts | Line Item Discounts | Commercial Feature | Sales | R1 | ACTIVE |
| discount_engine | cart_level_discounts | Cart-Level Discounts | Commercial Feature | Sales | R1 | ACTIVE |
| orders_management | sales_orders | Sales Orders | Commercial Feature | Orders | R1 | ACTIVE |
| orders_management | order_status_workflow | Order Status Workflow | Commercial Feature | Orders | R1 | ACTIVE |
| orders_management | order_fulfilment | Order Fulfilment | Commercial Feature | Orders | R1 | ACTIVE |
| orders_management | order_notes | Order Notes | Commercial Feature | Orders | R1 | ACTIVE |
| orders_management | order_document_numbers | Document Number Sequences | Commercial Feature | Orders | R1 | ACTIVE |
| cart_checkout | shopping_cart | Shopping Cart | Commercial Feature | Storefront | R1 | ACTIVE |
| cart_checkout | checkout_flow | Checkout Flow | Commercial Feature | Storefront | R1 | ACTIVE |
| cart_checkout | guest_checkout | Guest Checkout | Commercial Feature | Storefront | R1 | ACTIVE |
| cart_checkout | online_store | Online Store Channel | Commercial Feature | Storefront | R1 | ACTIVE |
| cart_checkout | checkout_events | Checkout Event Tracking | Commercial Feature | Storefront | R1 | ACTIVE |
| payment_processing | payment_methods | Payment Methods | Commercial Feature | Finance | R1 | ACTIVE |
| payment_processing | split_payments | Split Payments | Commercial Feature | Finance | R1 | ACTIVE |
| payment_processing | payment_capture | Payment Capture | Commercial Feature | Finance | R1 | ACTIVE |
| payment_processing | payment_void | Payment Void | Commercial Feature | Finance | R1 | ACTIVE |
| payment_processing | payment_reconciliation | Payment Reconciliation | Commercial Feature | Finance | R1 | ACTIVE |
| returns_refunds | returns_processing | Returns Processing | Commercial Feature | POS / Sales | R1 | ACTIVE |
| returns_refunds | refunds_processing | Refunds Processing | Commercial Feature | POS / Sales | R1 | ACTIVE |
| returns_refunds | exchanges | Product Exchanges | Commercial Feature | POS / Sales | R1 | ACTIVE |
| returns_refunds | 
eturn_reasons | Return Reason Codes | Commercial Feature | POS / Sales | R1 | ACTIVE |
| returns_refunds | partial_returns | Partial Returns | Commercial Feature | POS / Sales | R1 | ACTIVE |
| 
eporting_analytics | sales_dashboard | Sales Dashboard | Commercial Feature | BI / Admin | R1 | ACTIVE |
| 
eporting_analytics | sales_reports | Sales Reports | Commercial Feature | BI / Admin | R1 | ACTIVE |
| 
eporting_analytics | inventory_reports | Inventory Reports | Commercial Feature | BI / Admin | R1 | ACTIVE |
| 
eporting_analytics | staff_performance_reports | Staff Performance Reports | Commercial Feature | BI / Admin | R1 | ACTIVE |
| 
eporting_analytics | 
eport_export | Report Export | Commercial Feature | BI / Admin | R1 | ACTIVE |
| fulfillment_pickupp | click_collect | Click & Collect | Commercial Feature | E-Commerce | R1 | ACTIVE |
| fulfillment_pickupp | pickup_scheduling | Pickup Scheduling | Commercial Feature | E-Commerce | R1 | ACTIVE |
| fulfillment_pickupp | order_ready_notifications | Order Ready Notifications | Commercial Feature | E-Commerce | R1 | ACTIVE |
| fulfillment_pickupp | fulfillment_statuss_tracking | Fulfilment Status Tracking | Commercial Feature | E-Commerce | R1 | ACTIVE |
| fulfillment_pickupp | pickup_verification | Pickup Verification | Commercial Feature | E-Commerce | R1 | ACTIVE |
| hardware_cash_control | cash_drawer_control | Cash Drawer Control | Commercial Feature | Hardware / POS | R1 | ACTIVE |
| hardware_cash_control | cash_reconciliation | Cash Reconciliation | Commercial Feature | Hardware / POS | R1 | ACTIVE |
| hardware_cash_control | cash_drawer_limits | Cash Drawer Limits | Commercial Feature | Hardware / POS | R1 | ACTIVE |
| hardware_cash_control | cash_drawer_discrepancy | Drawer Discrepancy Alerts | Commercial Feature | Hardware / POS | R1 | ACTIVE |
| hardware_cash_control | cash_in_out_reason | Cash In/Out Reason Codes | Commercial Feature | Hardware / POS | R1 | ACTIVE |
| offline_sync | local_sqlite_outbox | SQLite Client Outbox Cache | Commercial Feature | POS Device | R1 | ACTIVE |
| offline_sync | 
econnect_sync_outbox| Reconnect Outbox Sync | Commercial Feature | POS Device | R1 | ACTIVE |
| offline_sync | catalog_local_caching | Catalog Local Caching | Commercial Feature | POS Device | R1 | ACTIVE |
| offline_sync | dynamic_reconnection | Dynamic Reconnection Sync | Commercial Feature | POS Device | R1 | ACTIVE |
| offline_sync | manual_discount_outbox| Manual Discount Outbox Cache| Commercial Feature | POS Device | R1 | ACTIVE |

### Feature Details (Modules 27 - 35: Add-on Features)
| Module Code | Feature Code | Feature Name | Core / Commercial | Scope | R1 / R2 | Status |
|---|---|---|---|---|---|---|
| whatsapp_integration | whatsapp_messaging | WhatsApp Messaging | Commercial Addon | Integrations | R2 | INACTIVE |
| whatsapp_integration | whatsapp_order_updates | WhatsApp Order Updates | Commercial Addon | Integrations | R2 | INACTIVE |
| whatsapp_integration | whatsapp_customer_notifications| WhatsApp Customer Notifications| Commercial Addon | Integrations | R2 | INACTIVE |
| whatsapp_integration | whatsapp_template_messages| WhatsApp Template Messages | Commercial Addon | Integrations | R2 | INACTIVE |
| advanced_ai_analyticsytics | ai_demand_forecaststing | AI Demand Forecasting | Commercial Addon | Analytics | R2 | INACTIVE |
| advanced_ai_analyticsytics | ai_product_recommendationmendations| AI Product Recommendations | Commercial Addon | Analytics | R2 | INACTIVE |
| advanced_ai_analyticsytics | ai_anomaly_detectiontion | AI Anomaly Detection | Commercial Addon | Analytics | R2 | INACTIVE |
| advanced_ai_analyticsytics | ai_sales_insightss | AI Sales Insights | Commercial Addon | Analytics | R2 | INACTIVE |
| loyalty_program | loyalty_points_earn | Loyalty Points Earning | Commercial Addon | CRM | R2 | INACTIVE |
| loyalty_program | loyalty_points_redeem | Loyalty Points Redemption | Commercial Addon | CRM | R2 | INACTIVE |
| loyalty_program | loyalty_tier_management | Loyalty Tier Management | Commercial Addon | CRM | R2 | INACTIVE |
| loyalty_program | loyalty_rewards_catalog | Loyalty Rewards Catalog | Commercial Addon | CRM | R2 | INACTIVE |
| delivery_integration | delivery_uber_eats_sync | Uber Eats Integration | Commercial Addon | Fulfilment | R2 | INACTIVE |
| delivery_integration | delivery_local_courier | Local Courier Integration | Commercial Addon | Fulfilment | R2 | INACTIVE |
| delivery_integration | delivery_order_routing | Delivery Order Routing | Commercial Addon | Fulfilment | R2 | INACTIVE |
| delivery_integration | delivery_status_tracking | Delivery Status Tracking | Commercial Addon | Fulfilment | R2 | INACTIVE |
| accounting_integrationration | accounting_quickbooksbooks_sync| QuickBooks Sync | Commercial Addon | Finance | R2 | INACTIVE |
| accounting_integrationration | accounting_xero_sync | Xero Sync | Commercial Addon | Finance | R2 | INACTIVE |
| accounting_integrationration | accounting_journalal_export | Journal Entry Export | Commercial Addon | Finance | R2 | INACTIVE |
| accounting_integrationration | accounting_tax_mappingapping | Tax Account Mapping | Commercial Addon | Finance | R2 | INACTIVE |
| marketing_automation | marketing_sms_campaigns | SMS Campaigns | Commercial Addon | Marketing | R2 | INACTIVE |
| marketing_automation | marketing_email_campaigns | Email Campaigns | Commercial Addon | Marketing | R2 | INACTIVE |
| marketing_automation | marketing_customer_segments| Customer Segmentation | Commercial Addon | Marketing | R2 | INACTIVE |
| marketing_automation | marketing_campaign_analytics| Campaign Analytics | Commercial Addon | Marketing | R2 | INACTIVE |
| extra_outlet | capacity_extra_outlet | Extra Outlet Capacity | Capacity Addon | Physical Foundation | R1 | ACTIVE |
| extra_till | capacity_extra_till | Extra Till Capacity | Capacity Addon | Physical Foundation | R1 | ACTIVE |
| extra_user | capacity_extra_user | Extra User Capacity | Capacity Addon | Staff Foundation | R1 | ACTIVE |

---

## 5. Explicit Permission Master Table (217 Seeded Entries)

The following tables list the exact **217 active permission definitions** compiled in the backend constant catalogs and seeded into the DB permissions library.

### Platform Administration Permissions (46)
| # | Permission Code | Domain Module | Technical Scope | R1 / R2 | Evidence of Seeding |
|---|---|---|---|---|---|
| 1 | `platform.admin.access` | platform_admin | PLATFORM | R1 | 20260701053000_SeedPlatformAdmin.cs |
| 2 | `platform.dashboard.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 3 | `platform.tenants.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 4 | `platform.tenant_subscriptions.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 5 | `platform.tenants.create` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 6 | `platform.tenants.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 7 | `platform.tenants.activate` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 8 | `platform.tenants.suspend` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 9 | `platform.tenants.entitlements.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 10 | `platform.tenants.bootstrap.access` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 11 | `platform.tenants.bootstrap.outlets.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 12 | `platform.tenants.bootstrap.tills.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 13 | `platform.tenants.bootstrap.roles.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 14 | `platform.tenants.bootstrap.users.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 15 | `platform.tenants.bootstrap.products.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 16 | `platform.tenants.bootstrap.products.import` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 17 | `platform.tenants.bootstrap.online_store.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 18 | `platform.subscription_plans.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 19 | `platform.subscription_plans.create` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 20 | `platform.subscription_plans.edit` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 21 | `platform.subscription_plans.duplicate` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 22 | `platform.subscription_plans.archive` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 23 | `platform.subscription_plans.delete` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 24 | `platform.return_policy_templates.view` | platform_admin | PLATFORM | R2 | PlatformAdminPermissionsSeedData.cs |
| 25 | `platform.return_policy_templates.create` | platform_admin | PLATFORM | R2 | PlatformAdminPermissionsSeedData.cs |
| 26 | `platform.return_policy_templates.update` | platform_admin | PLATFORM | R2 | PlatformAdminPermissionsSeedData.cs |
| 27 | `platform.return_policy_templates.delete` | platform_admin | PLATFORM | R2 | PlatformAdminPermissionsSeedData.cs |
| 28 | `platform.return_policy_templates.manage` | platform_admin | PLATFORM | R2 | PlatformAdminPermissionsSeedData.cs |
| 29 | `platform.modules.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 30 | `platform.features.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 31 | `platform.users.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 32 | `platform.users.create` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 33 | `platform.users.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 34 | `platform.users.roles.assign` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 35 | `platform.audit.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 36 | `platform.settings.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 37 | `platform.settings.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 38 | `platform.billing.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 39 | `platform.billing.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 40 | `platform.integrations.manage` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 41 | `platform.permissions.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 42 | `platform.roles.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 43 | `platform.roles.create` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 44 | `platform.roles.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 45 | `platform.roles.permissions.view` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |
| 46 | `platform.roles.permissions.update` | platform_admin | PLATFORM | R1 | PlatformAdminPermissionsSeedData.cs |


### Tenant Operations & Cashier Permissions (171)
| # | Permission Code | Domain Module | Technical Scope | R1 / R2 | Evidence of Seeding |
|---|---|---|---|---|---|
| 47 | `tenant.dashboard.view` | tenant_foundation | TENANT | R1 | SeedTenantLoginUsers.cs |
| 48 | `tenant.settings.manage` | tenant_foundation | TENANT | R1 | SeedTenantLoginUsers.cs |
| 49 | `tenant.users.view` | user_management | TENANT | R1 | SeedTenantAdminUserManagementPermissions.cs |
| 50 | `tenant.users.create` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 51 | `tenant.users.invite` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 52 | `tenant.users.update` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 53 | `tenant.users.delete` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 54 | `tenant.users.disable` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 55 | `tenant.users.details.view` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 56 | `tenant.users.permission_override` | user_management | TENANT | R2 | TenantAdminUserPermissions.cs |
| 57 | `tenant.users.manage` | user_management | TENANT | R1 | SeedTenantLoginUsers.cs |
| 58 | `tenant.roles.view` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 59 | `tenant.roles.create` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 60 | `tenant.roles.update` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 61 | `tenant.roles.delete` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 62 | `tenant.roles.permissions.view` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 63 | `tenant.roles.permissions.update` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 64 | `tenant.roles.assignments.view` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 65 | `tenant.roles.assignments.update` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 66 | `tenant.roles.manage` | user_management | TENANT | R1 | SeedTenantLoginUsers.cs |
| 67 | `tenant.permissions.view` | user_management | TENANT | R1 | TenantAdminUserPermissions.cs |
| 68 | `tenant.outlets.view` | outlet_till_core | TENANT | R1 | AddTenantOutletViewPermission.cs |
| 69 | `tenant.outlets.details.view` | outlet_till_core | TENANT | R1 | SeedTenantAdminOutletDetailPermissions.cs |
| 70 | `tenant.outlets.revenue.view` | outlet_till_core | TENANT | R1 | SeedTenantOutletsDetailsViewPermission.cs |
| 71 | `tenant.outlets.users.view` | outlet_till_core | TENANT | R1 | SeedTenantOutletsDetailsViewPermission.cs |
| 72 | `tenant.outlets.tills.view` | outlet_till_core | TENANT | R1 | SeedTenantOutletsDetailsViewPermission.cs |
| 73 | `tenant.outlets.update` | outlet_till_core | TENANT | R1 | TenantAdminOutletPermissions.cs |
| 74 | `tenant.outlets.manage` | outlet_till_core | TENANT | R1 | SeedTenantLoginUsers.cs |
| 75 | `tenant.tills.view` | outlet_till_core | OUTLET | R1 | AddTenantTillActionPermissions.cs |
| 76 | `tenant.tills.create` | outlet_till_core | OUTLET | R1 | AddTenantTillActionPermissions.cs |
| 77 | `tenant.tills.update` | outlet_till_core | OUTLET | R1 | AddTenantTillActionPermissions.cs |
| 78 | `tenant.tills.delete` | outlet_till_core | OUTLET | R1 | AddTenantTillActionPermissions.cs |
| 79 | `tenant.tills.manage` | outlet_till_core | OUTLET | R1 | AddTenantTillActionPermissions.cs |
| 80 | `tenant.tills.assign_outlet` | outlet_till_core | OUTLET | R1 | SeedTenantAdminTillHardwarePermissions.cs |
| 81 | `tenant.tills.details.view` | outlet_till_core | OUTLET | R1 | SeedTenantAdminTillHardwarePermissions.cs |
| 82 | `tenant.hardware.view` | outlet_till_core | DEVICE | R2 | SeedTenantAdminTillHardwarePermissions.cs |
| 83 | `tenant.hardware.manage` | outlet_till_core | DEVICE | R2 | SeedTenantAdminTillHardwarePermissions.cs |
| 84 | `tenant.devices.view` | outlet_till_core | DEVICE | R1 | AddTenantDevicePermissions.cs |
| 85 | `tenant.devices.create` | outlet_till_core | DEVICE | R1 | AddTenantDevicePermissions.cs |
| 86 | `tenant.devices.update` | outlet_till_core | DEVICE | R1 | AddTenantDevicePermissions.cs |
| 87 | `tenant.devices.delete` | outlet_till_core | DEVICE | R1 | AddTenantDevicePermissions.cs |
| 88 | `tenant.devices.manage` | outlet_till_core | DEVICE | R1 | AddTenantDevicePermissions.cs |
| 89 | `tenant.products.view` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 90 | `tenant.products.dashboard.view` | product_catalog | TENANT | R1 | SeedTenantAdminProductDashboardPermissions.cs |
| 91 | `tenant.products.details.view` | product_catalog | TENANT | R1 | SeedTenantAdminProductDashboardPermissions.cs |
| 92 | `tenant.products.create` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 93 | `tenant.products.update` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 94 | `tenant.products.delete` | product_catalog | TENANT | R1 | SeedTenantAdminProductPermissions.cs |
| 95 | `catalog.products.view` | product_catalog | TENANT | R1 | SeedTenantLoginUsers.cs |
| 96 | `catalog.products.create` | product_catalog | TENANT | R1 | SeedTenantLoginUsers.cs |
| 97 | `catalog.products.update` | product_catalog | TENANT | R1 | SeedTenantLoginUsers.cs |
| 98 | `catalog.products.delete` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 99 | `catalog.products.manage` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 100 | `catalog.products.publish` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 101 | `catalog.variants.manage` | product_catalog | TENANT | R1 | SeedTenantAdminProductMediaPermissions.cs |
| 102 | `catalog.product_media.manage` | product_catalog | TENANT | R1 | SeedTenantAdminProductMediaPermissions.cs |
| 103 | `catalog.combo_components.manage` | product_catalog | TENANT | R1 | SeedTenantAdminProductMediaPermissions.cs |
| 104 | `catalog.product_cost.view` | product_catalog | TENANT | R1 | SeedTenantAdminProductMediaPermissions.cs |
| 105 | `catalog.barcodes.manage` | product_catalog | TENANT | R1 | SeedTenantAdminProductMediaPermissions.cs |
| 106 | `tenant.product_media.manage` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 107 | `catalog.departments.view` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 108 | `catalog.departments.create` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 109 | `catalog.departments.update` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 110 | `catalog.departments.delete` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 111 | `catalog.departments.manage` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 112 | `catalog.categories.view` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 113 | `catalog.categories.create` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 114 | `catalog.categories.update` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 115 | `catalog.categories.delete` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 116 | `catalog.categories.manage` | product_catalog | TENANT | R1 | AddDepartmentCategoryCrudSupport.cs |
| 117 | `catalog.brands.view` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 118 | `catalog.brands.create` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 119 | `catalog.brands.update` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 120 | `catalog.brands.delete` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 121 | `catalog.brands.manage` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 122 | `catalog.collections.view` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 123 | `catalog.collections.create` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 124 | `catalog.collections.update` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 125 | `catalog.collections.delete` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 126 | `catalog.collections.manage` | product_catalog | TENANT | R1 | AddBrandCollectionCrudPermissions.cs |
| 127 | `catalog.product_channels.manage` | product_catalog | TENANT | R1 | TenantAdminProductPermissions.cs |
| 128 | `catalog.return_policies.view` | product_catalog | TENANT | R2 | AddReturnPolicyTemplatesAndPolicyStatus.cs |
| 129 | `catalog.return_policies.create` | product_catalog | TENANT | R2 | AddReturnPolicyTemplatesAndPolicyStatus.cs |
| 130 | `catalog.return_policies.update` | product_catalog | TENANT | R2 | AddReturnPolicyTemplatesAndPolicyStatus.cs |
| 131 | `catalog.return_policies.delete` | product_catalog | TENANT | R2 | AddReturnPolicyTemplatesAndPolicyStatus.cs |
| 132 | `catalog.return_policies.manage` | product_catalog | TENANT | R2 | AddReturnPolicyTemplatesAndPolicyStatus.cs |
| 133 | `inventory.stock.view` | inventory_tracking | OUTLET | R1 | SeedTenantLoginUsers.cs |
| 134 | `tenant.stock.view` | inventory_tracking | OUTLET | R1 | StockPermissions.cs |
| 135 | `tenant.stock.dashboard.view` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 136 | `tenant.stock.in` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 137 | `tenant.stock.out` | inventory_tracking | OUTLET | **R2_DEFERRED** | ACTIVE | Process stock write-offs / shrinkage outflows (deferred from R1 scope lock) |
| 138 | `tenant.stock.value.view` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 139 | `tenant.stock.movements.view` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 140 | `tenant.stock.expiry.view` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 141 | `tenant.stock.adjustments.view` | inventory_tracking | OUTLET | R1 | SeedTenantAdminInventoryDashboardPermission.cs |
| 142 | `tenant.stock.transfers.view` | inventory_tracking | OUTLET | **R2_DEFERRED** | ACTIVE | View details of stock transfer sheets (deferred from R1 scope lock) |
| 143 | `tenant.stock.opening` | inventory_tracking | OUTLET | R1 | SeedTenantStockOpeningPermission.cs |
| 144 | `pricing.price_lists.view` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 145 | `pricing.price_lists.create` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 146 | `pricing.price_lists.update` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 147 | `pricing.price_lists.delete` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 148 | `pricing.price_lists.manage` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 149 | `pricing.product_tax_assignments.view` | pricing_tax | TENANT | R1 | PricingTaxPermissions.cs |
| 150 | `pricing.product_tax_assignments.create` | pricing_tax | TENANT | R1 | PricingTaxPermissions.cs |
| 151 | `pricing.product_tax_assignments.update` | pricing_tax | TENANT | R1 | PricingTaxPermissions.cs |
| 152 | `pricing.product_tax_assignments.delete` | pricing_tax | TENANT | R1 | PricingTaxPermissions.cs |
| 153 | `pricing.product_tax_assignments.manage` | pricing_tax | TENANT | R1 | PricingTaxPermissions.cs |
| 154 | `tax.classes.view` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 155 | `tax.classes.create` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 156 | `tax.classes.update` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 157 | `tax.classes.delete` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 158 | `tax.classes.manage` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 159 | `tax.rates.view` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 160 | `tax.rates.create` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 161 | `tax.rates.update` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 162 | `tax.rates.delete` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 163 | `tax.rates.manage` | pricing_tax | TENANT | R1 | AddPricingTaxPermissions.cs |
| 164 | `discount.policy.view` | discount_engine | TENANT | R1 | SalesPermissions.cs |
| 165 | `discount.policy.create` | discount_engine | TENANT | R1 | SalesPermissions.cs |
| 166 | `discount.policy.update` | discount_engine | TENANT | R1 | SalesPermissions.cs |
| 167 | `discount.policy.activate` | discount_engine | TENANT | R1 | SalesPermissions.cs |
| 168 | `discount.policy.delete` | discount_engine | TENANT | R1 | SalesPermissions.cs |
| 169 | `pos.home.view` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 170 | `pos.dashboard.view` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 171 | `pos.new_sale.view` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 172 | `pos.till.open` | pos_sales | TILL | R1 | SeedTenantLoginUsers.cs |
| 173 | `pos.till.close` | pos_sales | TILL | R1 | SeedTenantLoginUsers.cs |
| 174 | `till.session.view` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 175 | `pos.hardware.settings` | pos_sales | DEVICE | R2 | PosPermissions.cs |
| 176 | `pos.refund.approve` | pos_sales | TILL | **R2_DEFERRED** | ACTIVE | Provide manager approval code to unlock cashier refund override (deferred from R1 scope lock) |
| 177 | `sales.discount.approve` | pos_sales | TILL | R1 | SeedPosCashierPermissions.cs |
| 178 | `sales.create` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 179 | `sales.view` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 180 | `sales.checkout` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 181 | `sales.cart.manage` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 182 | `sales.cart.add_item` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 183 | `sales.cart.update_item` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 184 | `sales.cart.remove_item` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 185 | `sales.cart.clear` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 186 | `sales.discount.apply` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 187 | `sales.park.create` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 188 | `sales.park.view` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 189 | `sales.park.recall` | pos_sales | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 190 | `orders.view` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 191 | `returns.view` | returns_refunds | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 192 | `returns.create` | returns_refunds | TILL | R1 | DevelopmentPosReturnsExchangePermissionsSeedData.cs |
| 193 | `refunds.view` | returns_refunds | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 194 | `refunds.create` | returns_refunds | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 195 | `exchanges.view` | returns_refunds | TILL | R1 | DevelopmentPosReturnsExchangePermissionsSeedData.cs |
| 196 | `exchanges.create` | returns_refunds | TILL | R1 | DevelopmentPosReturnsExchangePermissionsSeedData.cs |
| 197 | `receipts.view` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 198 | `receipts.print` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 199 | `receipts.reprint` | pos_sales | TILL | R1 | SeedPosReceiptReprintPermission.cs |
| 200 | `cash_drawer.view` | hardware_cash | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 201 | `cash_drawer.manage` | hardware_cash | TILL | **R2_DEFERRED** | ACTIVE | Open cash drawer manually (restricted action, deferred from R1 scope lock) |
| 202 | `cash_drawer.movement.create` | hardware_cash | TILL | R1 | DevelopmentPosCashDrawerPermissionsSeedData.cs |
| 203 | `payments.cash.accept` | payment_processing | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 204 | `payments.card.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Accept card terminal payments at checkout (deferred from R1 scope lock) |
| 205 | `payments.qr.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Accept digital QR code payments at checkout (deferred from R1 scope lock) |
| 206 | `payments.split.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Split checkout transaction across multiple payment methods (deferred from R1 scope lock) |
| 207 | `notifications.view` | pos_sales | TILL | R1 | DevelopmentPosPaymentReceiptPermissionsSeedData.cs |
| 208 | `customers.view` | customer_management | TILL | R1 | DevelopmentPosNewSalePermissionsSeedData.cs |
| 209 | `customers.create` | customer_management | TILL | R1 | DevelopmentPosCustomerCreatePermissionSeedData.cs |
| 210 | `customers.update` | customer_management | TILL | R1 | DevelopmentPosCustomerUpdatePermissionSeedData.cs |
| 211 | `products.view` | product_catalog | TILL | R1 | ProductPosPermissions.cs |
| 212 | `products.search` | product_catalog | TILL | R1 | ProductPosPermissions.cs |
| 213 | `reports.sales.view` | reporting_analytics | OUTLET | R1 | SeedTenantLoginUsers.cs |
| 214 | `fulfillment.orders.view` | fulfilment_pickup | OUTLET | R1 | SeedTenantLoginUsers.cs |
| 215 | `fulfillment.orders.manage` | fulfilment_pickup | OUTLET | R1 | SeedTenantLoginUsers.cs |
| 216 | `tenant.online_store.view` | cart_checkout | TENANT | R1 | AddTenantAdminOnlineStoreSetupSupport.cs |
| 217 | `tenant.online_store.manage` | cart_checkout | TENANT | R1 | AddTenantAdminOnlineStoreSetupSupport.cs |


---

## 6. Complete 33-Module Tree View

Here is the fully itemized canonical directory tree, mapping all **171 active tenant-level & POS permissions** and **46 platform permissions** directly to their functional components.

### Platform Administration Module Tree
`	ext
PLATFORM ADMINISTRATION (Platform Scope)
â”œâ”€â”€ platform.admin.access (Base internal credential)
â”œâ”€â”€ Dashboard
â”‚   â””â”€â”€ platform.dashboard.view
â”œâ”€â”€ Tenant Management
â”‚   â”œâ”€â”€ platform.tenants.view
â”‚   â”œâ”€â”€ platform.tenant_subscriptions.view
â”‚   â”œâ”€â”€ platform.tenants.create
â”‚   â”œâ”€â”€ platform.tenants.update
â”‚   â”œâ”€â”€ platform.tenants.activate
â”‚   â”œâ”€â”€ platform.tenants.suspend
â”‚   â””â”€â”€ platform.tenants.entitlements.update
â”œâ”€â”€ Selected-Tenant Bootstrap
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.access
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.outlets.manage
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.tills.manage
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.roles.manage
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.users.manage
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.products.manage
â”‚   â”œâ”€â”€ platform.tenants.bootstrap.products.import
â”‚   â””â”€â”€ platform.tenants.bootstrap.online_store.manage
â”œâ”€â”€ Subscription Plans
â”‚   â”œâ”€â”€ platform.subscription_plans.view
â”‚   â”œâ”€â”€ platform.subscription_plans.create
â”‚   â”œâ”€â”€ platform.subscription_plans.edit
â”‚   â”œâ”€â”€ platform.subscription_plans.duplicate
â”‚   â”œâ”€â”€ platform.subscription_plans.archive
â”‚   â””â”€â”€ platform.subscription_plans.delete
â”œâ”€â”€ Return Policy Templates
â”‚   â”œâ”€â”€ platform.return_policy_templates.view
â”‚   â”œâ”€â”€ platform.return_policy_templates.create
â”‚   â”œâ”€â”€ platform.return_policy_templates.update
â”‚   â”œâ”€â”€ platform.return_policy_templates.delete
â”‚   â””â”€â”€ platform.return_policy_templates.manage
â”œâ”€â”€ Modules Catalog
â”‚   â”œâ”€â”€ platform.modules.view
â”‚   â””â”€â”€ platform.features.view
â”œâ”€â”€ Platform Users
â”‚   â”œâ”€â”€ platform.users.view
â”‚   â”œâ”€â”€ platform.users.create
â”‚   â”œâ”€â”€ platform.users.update
â”‚   â””â”€â”€ platform.users.roles.assign
â”œâ”€â”€ Audit & Settings
â”‚   â”œâ”€â”€ platform.audit.view
â”‚   â”œâ”€â”€ platform.settings.view
â”‚   â””â”€â”€ platform.settings.update
â”œâ”€â”€ Platform Billing
â”‚   â”œâ”€â”€ platform.billing.view
â”‚   â””â”€â”€ platform.billing.manage
â”œâ”€â”€ Platform Integrations
â”‚   â””â”€â”€ platform.integrations.manage
â””â”€â”€ Access Catalog
    â”œâ”€â”€ platform.permissions.view
    â”œâ”€â”€ platform.roles.view
    â”œâ”€â”€ platform.roles.create
    â”œâ”€â”€ platform.roles.update
    â”œâ”€â”€ platform.roles.permissions.view
    â””â”€â”€ platform.roles.permissions.update
`

### Tenant Operations & POS Cashier Module Tree
`	ext
TENANT OPERATIONS & ADMINISTRATION (Tenant / Outlet / Till Scope)
â”œâ”€â”€ Tenant Profile & Settings (Entitlement: tenant_profile / tenant_settings)
â”‚   â”œâ”€â”€ tenant.dashboard.view
â”‚   â””â”€â”€ tenant.settings.manage
â”œâ”€â”€ User Account Management (Entitlement: user_accounts)
â”‚   â”œâ”€â”€ tenant.users.view
â”‚   â”œâ”€â”€ tenant.users.create
â”‚   â”œâ”€â”€ tenant.users.invite
â”‚   â”œâ”€â”€ tenant.users.update
â”‚   â”œâ”€â”€ tenant.users.delete
â”‚   â”œâ”€â”€ tenant.users.disable
â”‚   â”œâ”€â”€ tenant.users.details.view
â”‚   â”œâ”€â”€ tenant.users.permission_override
â”‚   â””â”€â”€ tenant.users.manage
â”œâ”€â”€ Role & Permission Setup (Entitlement: role_management / permission_management)
â”‚   â”œâ”€â”€ tenant.roles.view
â”‚   â”œâ”€â”€ tenant.roles.create
â”‚   â”œâ”€â”€ tenant.roles.update
â”‚   â”œâ”€â”€ tenant.roles.delete
â”‚   â”œâ”€â”€ tenant.roles.permissions.view
â”‚   â”œâ”€â”€ tenant.roles.permissions.update
â”‚   â”œâ”€â”€ tenant.roles.assignments.view
â”‚   â”œâ”€â”€ tenant.roles.assignments.update
â”‚   â”œâ”€â”€ tenant.roles.manage
â”‚   â””â”€â”€ tenant.permissions.view
â”œâ”€â”€ Outlet & Location Management (Entitlement: outlet_management)
â”‚   â”œâ”€â”€ tenant.outlets.view
â”‚   â”œâ”€â”€ tenant.outlets.details.view
â”‚   â”œâ”€â”€ tenant.outlets.revenue.view
â”‚   â”œâ”€â”€ tenant.outlets.users.view
â”‚   â”œâ”€â”€ tenant.outlets.tills.view
â”‚   â”œâ”€â”€ tenant.outlets.update
â”‚   â””â”€â”€ tenant.outlets.manage
â”œâ”€â”€ Register & Till Operations (Entitlement: till_management)
â”‚   â”œâ”€â”€ tenant.tills.view
â”‚   â”œâ”€â”€ tenant.tills.create
â”‚   â”œâ”€â”€ tenant.tills.update
â”‚   â”œâ”€â”€ tenant.tills.delete
â”‚   â”œâ”€â”€ tenant.tills.manage
â”‚   â”œâ”€â”€ tenant.tills.assign_outlet
â”‚   â”œâ”€â”€ tenant.tills.details.view
â”‚   â”œâ”€â”€ tenant.hardware.view
â”‚   â””â”€â”€ tenant.hardware.manage
â”œâ”€â”€ POS Devices (Entitlement: hardware_device_management)
â”‚   â”œâ”€â”€ tenant.devices.view
â”‚   â”œâ”€â”€ tenant.devices.create
â”‚   â”œâ”€â”€ tenant.devices.update
â”‚   â”œâ”€â”€ tenant.devices.delete
â”‚   â””â”€â”€ tenant.devices.manage
â”œâ”€â”€ Product Catalog (Entitlement: product_catalog)
â”‚   â”œâ”€â”€ tenant.products.view
â”‚   â”œâ”€â”€ tenant.products.dashboard.view
â”‚   â”œâ”€â”€ tenant.products.details.view
â”‚   â”œâ”€â”€ tenant.products.create
â”‚   â”œâ”€â”€ tenant.products.update
â”‚   â”œâ”€â”€ tenant.products.delete
â”‚   â”œâ”€â”€ catalog.products.view
â”‚   â”œâ”€â”€ catalog.products.create
â”‚   â”œâ”€â”€ catalog.products.update
â”‚   â”œâ”€â”€ catalog.products.delete
â”‚   â”œâ”€â”€ catalog.products.manage
â”‚   â”œâ”€â”€ catalog.products.publish
â”‚   â”œâ”€â”€ catalog.variants.manage
â”‚   â”œâ”€â”€ catalog.product_media.manage
â”‚   â”œâ”€â”€ catalog.combo_components.manage
â”‚   â”œâ”€â”€ catalog.product_cost.view
â”‚   â”œâ”€â”€ catalog.barcodes.manage
â”‚   â”œâ”€â”€ tenant.product_media.manage
â”‚   â”œâ”€â”€ catalog.departments.view
â”‚   â”œâ”€â”€ catalog.departments.create
â”‚   â”œâ”€â”€ catalog.departments.update
â”‚   â”œâ”€â”€ catalog.departments.delete
â”‚   â”œâ”€â”€ catalog.departments.manage
â”‚   â”œâ”€â”€ catalog.categories.view
â”‚   â”œâ”€â”€ catalog.categories.create
â”‚   â”œâ”€â”€ catalog.categories.update
â”‚   â”œâ”€â”€ catalog.categories.delete
â”‚   â”œâ”€â”€ catalog.categories.manage
â”‚   â”œâ”€â”€ catalog.brands.view
â”‚   â”œâ”€â”€ catalog.brands.create
â”‚   â”œâ”€â”€ catalog.brands.update
â”‚   â”œâ”€â”€ catalog.brands.delete
â”‚   â”œâ”€â”€ catalog.brands.manage
â”‚   â”œâ”€â”€ catalog.collections.view
â”‚   â”œâ”€â”€ catalog.collections.create
â”‚   â”œâ”€â”€ catalog.collections.update
â”‚   â”œâ”€â”€ catalog.collections.delete
â”‚   â”œâ”€â”€ catalog.collections.manage
â”‚   â”œâ”€â”€ catalog.product_channels.manage
â”‚   â”œâ”€â”€ catalog.return_policies.view
â”‚   â”œâ”€â”€ catalog.return_policies.create
â”‚   â”œâ”€â”€ catalog.return_policies.update
â”‚   â”œâ”€â”€ catalog.return_policies.delete
â”‚   â””â”€â”€ catalog.return_policies.manage
â”œâ”€â”€ Inventory & Stock Ledger (Entitlement: inventory_tracking)
â”‚   â”œâ”€â”€ inventory.stock.view
â”‚   â”œâ”€â”€ tenant.stock.view
â”‚   â”œâ”€â”€ tenant.stock.dashboard.view
â”‚   â”œâ”€â”€ tenant.stock.in
â”‚   â”œâ”€â”€ tenant.stock.out
â”‚   â”œâ”€â”€ tenant.stock.value.view
â”‚   â”œâ”€â”€ tenant.stock.movements.view
â”‚   â”œâ”€â”€ tenant.stock.expiry.view
â”‚   â”œâ”€â”€ tenant.stock.adjustments.view
â”‚   â”œâ”€â”€ tenant.stock.transfers.view
â”‚   â””â”€â”€ tenant.stock.opening
â”œâ”€â”€ Pricing & Tax Engine (Entitlement: pricing_tax_engine)
â”‚   â”œâ”€â”€ pricing.price_lists.view
â”‚   â”œâ”€â”€ pricing.price_lists.create
â”‚   â”œâ”€â”€ pricing.price_lists.update
â”‚   â”œâ”€â”€ pricing.price_lists.delete
â”‚   â”œâ”€â”€ pricing.price_lists.manage
â”‚   â”œâ”€â”€ pricing.product_tax_assignments.view
â”‚   â”œâ”€â”€ pricing.product_tax_assignments.create
â”‚   â”œâ”€â”€ pricing.product_tax_assignments.update
â”‚   â”œâ”€â”€ pricing.product_tax_assignments.delete
â”‚   â”œâ”€â”€ pricing.product_tax_assignments.manage
â”‚   â”œâ”€â”€ tax.classes.view
â”‚   â”œâ”€â”€ tax.classes.create
â”‚   â”œâ”€â”€ tax.classes.update
â”‚   â”œâ”€â”€ tax.classes.delete
â”‚   â”œâ”€â”€ tax.classes.manage
â”‚   â”œâ”€â”€ tax.rates.view
â”‚   â”œâ”€â”€ tax.rates.create
â”‚   â”œâ”€â”€ tax.rates.update
â”‚   â”œâ”€â”€ tax.rates.delete
â”‚   â””â”€â”€ tax.rates.manage
â”œâ”€â”€ Discount Engine (Entitlement: discount_engine)
â”‚   â”œâ”€â”€ discount.policy.view
â”‚   â”œâ”€â”€ discount.policy.create
â”‚   â”œâ”€â”€ discount.policy.update
â”‚   â”œâ”€â”€ discount.policy.activate
â”‚   â””â”€â”€ discount.policy.delete
â”œâ”€â”€ POS Checkout & Cart (Entitlement: pos_checkout)
â”‚   â”œâ”€â”€ pos.home.view
â”‚   â”œâ”€â”€ pos.dashboard.view
â”‚   â”œâ”€â”€ pos.new_sale.view
â”‚   â”œâ”€â”€ pos.till.open
â”‚   â”œâ”€â”€ pos.till.close
â”‚   â”œâ”€â”€ till.session.view
â”‚   â”œâ”€â”€ pos.hardware.settings
â”‚   â”œâ”€â”€ pos.refund.approve
â”‚   â”œâ”€â”€ sales.discount.approve
â”‚   â”œâ”€â”€ sales.create
â”‚   â”œâ”€â”€ sales.view
â”‚   â”œâ”€â”€ sales.checkout
â”‚   â”œâ”€â”€ sales.cart.manage
â”‚   â”œâ”€â”€ sales.cart.add_item
â”‚   â”œâ”€â”€ sales.cart.update_item
â”‚   â”œâ”€â”€ sales.cart.remove_item
â”‚   â”œâ”€â”€ sales.cart.clear
â”‚   â”œâ”€â”€ sales.discount.apply
â”‚   â”œâ”€â”€ sales.park.create
â”‚   â”œâ”€â”€ sales.park.view
â”‚   â”œâ”€â”€ sales.park.recall
â”‚   â”œâ”€â”€ orders.view
â”‚   â”œâ”€â”€ returns.view
â”‚   â”œâ”€â”€ returns.create
â”‚   â”œâ”€â”€ refunds.view
â”‚   â”œâ”€â”€ refunds.create
â”‚   â”œâ”€â”€ exchanges.view
â”‚   â”œâ”€â”€ exchanges.create
â”‚   â”œâ”€â”€ receipts.view
â”‚   â”œâ”€â”€ receipts.print
â”‚   â”œâ”€â”€ receipts.reprint
â”‚   â”œâ”€â”€ cash_drawer.view
â”‚   â”œâ”€â”€ cash_drawer.manage
â”‚   â”œâ”€â”€ cash_drawer.movement.create
â”‚   â”œâ”€â”€ payments.cash.accept
â”‚   â”œâ”€â”€ payments.card.accept
â”‚   â”œâ”€â”€ payments.qr.accept
â”‚   â”œâ”€â”€ payments.split.accept
â”‚   â”œâ”€â”€ notifications.view
â”‚   â”œâ”€â”€ customers.view
â”‚   â”œâ”€â”€ customers.create
â”‚   â”œâ”€â”€ customers.update
â”‚   â”œâ”€â”€ products.view
â”‚   â””â”€â”€ products.search
â”œâ”€â”€ E-Commerce (Entitlement: online_store)
â”‚   â”œâ”€â”€ tenant.online_store.view
â”‚   â””â”€â”€ tenant.online_store.manage
â”œâ”€â”€ Fulfilment & Click & Collect (Entitlement: click_collect / sales_orders)
â”‚   â”œâ”€â”€ fulfillment.orders.view
â”‚   â””â”€â”€ fulfillment.orders.manage
â””â”€â”€ Reports & Analytics (Entitlement: sales_reports)
    â””â”€â”€ reports.sales.view
`

---

## 7. Commercial Entitlement â†’ Permission Mapping Matrix

| Commercial Entitlement Key | Included Feature | Primary Permission Codes Granted | Domain Scope |
|---|---|---|---|
| tenant_profile | Tenant Profile | tenant.dashboard.view | Tenant Wide |
| tenant_settings | Tenant Settings | tenant.settings.manage | Tenant Wide |
| user_accounts | User Accounts | tenant.users.view, tenant.users.create, tenant.users.invite, tenant.users.update, tenant.users.delete, tenant.users.disable, tenant.users.details.view, tenant.users.manage | Tenant Wide |
| 
ole_management | Role Setup | tenant.roles.view, tenant.roles.create, tenant.roles.update, tenant.roles.delete, tenant.roles.permissions.view, tenant.roles.permissions.update, tenant.roles.assignments.view, tenant.roles.assignments.update, tenant.roles.manage | Tenant Wide |
| permission_management | Permission Assignment | tenant.roles.manage, tenant.permissions.view | Tenant Wide |
| outlet_management | Physical Outlets | tenant.outlets.view, tenant.outlets.details.view, tenant.outlets.revenue.view, tenant.outlets.users.view, tenant.outlets.tills.view, tenant.outlets.update, tenant.outlets.manage | Tenant Wide |
| till_management | Till Registers | tenant.tills.view, tenant.tills.create, tenant.tills.update, tenant.tills.delete, tenant.tills.manage, tenant.tills.assign_outlet, tenant.tills.details.view, tenant.hardware.view, tenant.hardware.manage | Outlet Scoped |
| product_catalog | Product Master | tenant.products.view, tenant.products.dashboard.view, tenant.products.details.view, tenant.products.create, tenant.products.update, tenant.products.delete, catalog.products.view, catalog.products.create, catalog.products.update, catalog.products.delete, catalog.products.manage, catalog.products.publish, catalog.variants.manage, catalog.product_media.manage, catalog.combo_components.manage, catalog.product_cost.view, catalog.barcodes.manage, tenant.product_media.manage, catalog.departments.view, catalog.departments.create, catalog.departments.update, catalog.departments.delete, catalog.departments.manage, catalog.categories.view, catalog.categories.create, catalog.categories.update, catalog.categories.delete, catalog.categories.manage, catalog.brands.view, catalog.brands.create, catalog.brands.update, catalog.brands.delete, catalog.brands.manage, catalog.collections.view, catalog.collections.create, catalog.collections.update, catalog.collections.delete, catalog.collections.manage, catalog.product_channels.manage, catalog.return_policies.view, catalog.return_policies.create, catalog.return_policies.update, catalog.return_policies.delete, catalog.return_policies.manage, products.view, products.search | Tenant Wide |
| inventory_tracking | Stock Ledger | inventory.stock.view, tenant.stock.view, tenant.stock.dashboard.view, tenant.stock.in, tenant.stock.out, tenant.stock.value.view, tenant.stock.movements.view, tenant.stock.expiry.view, tenant.stock.adjustments.view, tenant.stock.transfers.view, tenant.stock.opening | Outlet Scoped |
| pos_checkout | POS Checkout | pos.home.view, pos.dashboard.view, pos.new_sale.view, pos.till.open, pos.till.close, till.session.view, pos.hardware.settings, pos.refund.approve, sales.discount.approve, sales.create, sales.view, sales.checkout, sales.cart.manage, sales.cart.add_item, sales.cart.update_item, sales.cart.remove_item, sales.cart.clear, sales.discount.apply, sales.park.create, sales.park.view, sales.park.recall, orders.view, returns.view, returns.create, refunds.view, refunds.create, exchanges.view, exchanges.create, receipts.view, receipts.print, receipts.reprint, cash_drawer.view, cash_drawer.manage, cash_drawer.movement.create, payments.cash.accept, payments.card.accept, payments.qr.accept, payments.split.accept, notifications.view, customers.view, customers.create, customers.update | Till / Device Scoped |
| online_store | E-Commerce Store | tenant.online_store.view, tenant.online_store.manage | Tenant Wide |
| sales_orders | Sales Orders | fulfillment.orders.view, fulfillment.orders.manage | Outlet Scoped |
| click_collect | Pickup Orders | fulfillment.orders.view, fulfillment.orders.manage | Outlet Scoped |
| sales_reports | Business Reports | reports.sales.view, tenant.reports.dashboard.view, tenant.reports.sales.view, tenant.reports.products.view, tenant.reports.payments.view, tenant.reports.tax.view, tenant.reports.discounts.view, tenant.reports.returns.view, tenant.reports.cashiers.view, tenant.reports.daily-sales.view, tenant.reports.outlets.view, tenant.reports.tills.view, tenant.reports.export, tenant.reports.customer-pii.view | Tenant / Outlet Scoped |
| hardware_device_management | Cash Drawer & Devices | tenant.devices.view, tenant.devices.create, tenant.devices.update, tenant.devices.delete, tenant.devices.manage, tenant.hardware.view, tenant.hardware.manage | Device Scoped |
| offline_operation_sync | Offline Sync | Device auto-token validation | POS Device Scoped |

---

## 8. Role Template Default Permission Sets

Seed default permissions are loaded automatically during tenant bootstrap:

### 1. TENANT_ADMIN (Tenant Administrator)
Includes all entitled tenant-scoped permission definitions (bounded by subscription entitlements):
- `tenant.dashboard.view`
- `tenant.settings.manage`
- `tenant.users.view`
- `tenant.users.create`
- `tenant.users.invite`
- `tenant.users.update`
- `tenant.users.delete`
- `tenant.users.disable`
- `tenant.users.details.view`
- `tenant.users.permission_override`
- `tenant.users.manage`
- `tenant.roles.view`
- `tenant.roles.create`
- `tenant.roles.update`
- `tenant.roles.delete`
- `tenant.roles.permissions.view`
- `tenant.roles.permissions.update`
- `tenant.roles.assignments.view`
- `tenant.roles.assignments.update`
- `tenant.roles.manage`
- `tenant.permissions.view`
- `tenant.outlets.view`
- `tenant.outlets.details.view`
- `tenant.outlets.revenue.view`
- `tenant.outlets.users.view`
- `tenant.outlets.tills.view`
- `tenant.outlets.update`
- `tenant.outlets.manage`
- `tenant.tills.view`
- `tenant.tills.create`
- `tenant.tills.update`
- `tenant.tills.delete`
- `tenant.tills.manage`
- `tenant.tills.assign_outlet`
- `tenant.tills.details.view`
- `tenant.hardware.view`
- `tenant.hardware.manage`
- `tenant.devices.view`
- `tenant.devices.create`
- `tenant.devices.update`
- `tenant.devices.delete`
- `tenant.devices.manage`
- `tenant.products.view`
- `tenant.products.dashboard.view`
- `tenant.products.details.view`
- `tenant.products.create`
- `tenant.products.update`
- `tenant.products.delete`
- `catalog.products.view`
- `catalog.products.create`
- `catalog.products.update`
- `catalog.products.delete`
- `catalog.products.manage`
- `catalog.products.publish`
- `catalog.variants.manage`
- `catalog.product_media.manage`
- `catalog.combo_components.manage`
- `catalog.product_cost.view`
- `catalog.barcodes.manage`
- `tenant.product_media.manage`
- `catalog.departments.view`
- `catalog.departments.create`
- `catalog.departments.update`
- `catalog.departments.delete`
- `catalog.departments.manage`
- `catalog.categories.view`
- `catalog.categories.create`
- `catalog.categories.update`
- `catalog.categories.delete`
- `catalog.categories.manage`
- `catalog.brands.view`
- `catalog.brands.create`
- `catalog.brands.update`
- `catalog.brands.delete`
- `catalog.brands.manage`
- `catalog.collections.view`
- `catalog.collections.create`
- `catalog.collections.update`
- `catalog.collections.delete`
- `catalog.collections.manage`
- `catalog.product_channels.manage`
- `catalog.return_policies.view`
- `catalog.return_policies.create`
- `catalog.return_policies.update`
- `catalog.return_policies.delete`
- `catalog.return_policies.manage`
- `inventory.stock.view`
- `tenant.stock.view`
- `tenant.stock.dashboard.view`
- `tenant.stock.in`
- `tenant.stock.value.view`
- `tenant.stock.movements.view`
- `tenant.stock.expiry.view`
- `tenant.stock.adjustments.view`
- `tenant.stock.opening`
- `pricing.price_lists.view`
- `pricing.price_lists.create`
- `pricing.price_lists.update`
- `pricing.price_lists.delete`
- `pricing.price_lists.manage`
- `pricing.product_tax_assignments.view`
- `pricing.product_tax_assignments.create`
- `pricing.product_tax_assignments.update`
- `pricing.product_tax_assignments.delete`
- `pricing.product_tax_assignments.manage`
- `tax.classes.view`
- `tax.classes.create`
- `tax.classes.update`
- `tax.classes.delete`
- `tax.classes.manage`
- `tax.rates.view`
- `tax.rates.create`
- `tax.rates.update`
- `tax.rates.delete`
- `tax.rates.manage`
- `discount.policy.view`
- `discount.policy.create`
- `discount.policy.update`
- `discount.policy.activate`
- `discount.policy.delete`
- `pos.home.view`
- `pos.dashboard.view`
- `pos.new_sale.view`
- `pos.till.open`
- `pos.till.close`
- `till.session.view`
- `pos.hardware.settings`
- `sales.discount.approve`
- `sales.create`
- `sales.view`
- `sales.checkout`
- `sales.cart.manage`
- `sales.cart.add_item`
- `sales.cart.update_item`
- `sales.cart.remove_item`
- `sales.cart.clear`
- `sales.discount.apply`
- `sales.park.create`
- `sales.park.view`
- `sales.park.recall`
- `orders.view`
- `returns.view`
- `returns.create`
- `refunds.view`
- `refunds.create`
- `exchanges.view`
- `exchanges.create`
- `receipts.view`
- `receipts.print`
- `receipts.reprint`
- `cash_drawer.view`
- `cash_drawer.movement.create`
- `payments.cash.accept`
- `notifications.view`
- `customers.view`
- `customers.create`
- `customers.update`
- `products.view`
- `products.search`
- `reports.sales.view`
- `fulfillment.orders.view`
- `fulfillment.orders.manage`
- `tenant.online_store.view`
- `tenant.online_store.manage`

### 2. STORE_MANAGER (Store Manager)
Assigned to manage physical outlet environments:
- tenant.outlets.view
- tenant.outlets.details.view
- tenant.tills.view
- tenant.tills.create
- tenant.tills.update
- tenant.tills.details.view
- catalog.products.view
- catalog.products.create
- catalog.products.update
- inventory.stock.view
- tenant.stock.view
- tenant.stock.dashboard.view
- tenant.stock.in
- tenant.stock.movements.view
- tenant.stock.adjustments.view
- pos.home.view
- pos.dashboard.view
- pos.new_sale.view
- pos.till.open
- pos.till.close
- till.session.view
- sales.discount.approve
- sales.create
- sales.view
- sales.checkout
- sales.cart.manage
- sales.cart.add_item
- sales.cart.update_item
- sales.cart.remove_item
- sales.cart.clear
- sales.discount.apply
- sales.park.create
- sales.park.view
- sales.park.recall
- orders.view
- returns.view
- returns.create
- refunds.view
- refunds.create
- exchanges.view
- exchanges.create
- receipts.view
- receipts.print
- receipts.reprint
- cash_drawer.view
- cash_drawer.movement.create
- payments.cash.accept
- notifications.view
- customers.view
- customers.create
- customers.update
- products.view
- products.search
- reports.sales.view
- fulfillment.orders.view
- fulfillment.orders.manage

### 3. CASHIER (POS Cashier)
Granular, till-scoped checkout capabilities (strictly excludes manager approval overrides):
- pos.home.view
- pos.dashboard.view
- pos.new_sale.view
- pos.till.open
- pos.till.close
- till.session.view
- sales.create
- sales.checkout
- sales.cart.manage
- sales.cart.add_item
- sales.cart.update_item
- sales.cart.remove_item
- sales.cart.clear
- sales.discount.apply
- sales.park.create
- sales.park.view
- sales.park.recall
- payments.cash.accept
- sales.view
- receipts.view
- receipts.print
- orders.view
- returns.view
- returns.create
- refunds.view
- refunds.create
- exchanges.view
- exchanges.create
- cash_drawer.view
- cash_drawer.movement.create
- notifications.view
- customers.view
- customers.create
- customers.update
- products.view
- products.search

### 4. INVENTORY_MANAGER (Inventory Manager)
Back-office stock levels and product visibility management:
- catalog.products.view
- inventory.stock.view
- tenant.stock.view
- tenant.stock.dashboard.view
- tenant.stock.in
- tenant.stock.movements.view
- tenant.stock.adjustments.view
- fulfillment.orders.view
- fulfillment.orders.manage

---

## 9. Interface Configurations & Access Views

### Super Admin Commercial Configuration View
Super Admin handles commercial licensing and plan assignments during Step 3 and 5 of the tenant creation wizard:
- Selects SubscriptionPlan which contains core features.
- Enables/disables SubscriptionAddon items (e.g. whatsapp_integration, advanced_ai_analyticsytics, capacity_extra_outlet).
- Toggles specific platform_features directly to override active entitlements.
- Resolves effective entitlements array: [ "outlet_management", "till_management", "product_catalog", "pos_checkout" ].
- Calls bootstrap resolver to configure the delegate ceiling for the new tenant.

### Tenant Admin Role Configuration View
Tenant Admin builds and maintains user roles dynamically through the Flutter Roles screen:
- Selects a tenant role (e.g. Store Manager).
- Frontend queries GET api/v1/tenant-admin/roles/permission-catalog which returns the subset of active permission_definitions that belong to the tenant's licensed feature set.
- Gated by actor's delegation ceiling (cannot select permissions not possessed by the current tenant administrator user).
- Checkboxes represent each granular permission code grouped under its parent module section.
- Saves changes by sending the explicit array of checked permission codes to the backend.

---

## 10. Release Status Classifications (R1_ACTIVE vs R2_DEFERRED vs LEGACY_ACTIVE)

Every one of the **217 active permission definitions** is audited and grouped into exactly one of three status categories to ensure release scope stability.

### Status Totals
- **R1_ACTIVE (Active & Enforced)**: 196 permissions (41 Platform Administration + 155 Tenant Operations & Cashier)
- **R2_DEFERRED (Deferred UI/Unseeded)**: 21 permissions (5 Platform Administration templates + 16 Tenant/POS operations)
- **FUTURE (Unimplemented Addons)**: 0 permissions (Commercial add-on features like Loyalty, Accounting, AI, and Delivery do not introduce active permissions in Release 1)
- **LEGACY_ACTIVE (Seeded Legacy)**: 0 permissions in the 217 active canonical list (Legacy database-only active permissions like tenant.till.manage and pos.sale.create are tracked under Section 2 legacy tokens and excluded from the active 217 catalog to maintain release sanity).
- **Total**: 217 Permissions

### Release 1 vs Release 2 Reclassified Summary Table
| Capability / Permission Code | R1 | R2 | Notes / Audit Verdict |
|---|---|---|---|
| `payments.cash.accept` | **Yes** | No | Cash payments are the only active payment channel for R1 POS. |
| `payments.card.accept` | No | **Yes** | Integrated card payment terminals are deferred to R2. |
| `payments.qr.accept` | No | **Yes** | LankaQR / digital QR codes are deferred to R2. |
| `payments.split.accept` | No | **Yes** | Split checkout transaction methods are deferred to R2. |
| `returns.view` | **Yes** | No | View returns transaction history is locked for R1. |
| `returns.create` | **Yes** | No | Create/process customer returns is locked for R1. |
| `refunds.view` | **Yes** | No | View refund records is locked for R1. |
| `refunds.create` | **Yes** | No | Issue cashier cash refunds is locked for R1. |
| `exchanges.view` | **Yes** | No | View retail exchange transactions is locked for R1. |
| `exchanges.create` | **Yes** | No | Process item exchanges is locked for R1. |
| `pos.refund.approve` | No | **Yes** | Manager refund override approval code screen is deferred to R2. |
| `customers.view` | **Yes** | No | Browse CRM customer records is locked for R1. |
| `customers.create` | **Yes** | No | Register new customer accounts is locked for R1. |
| `customers.update` | **Yes** | No | Edit CRM customer profiles is locked for R1. |
| `cash_drawer.view` | **Yes** | No | View cash drawer status is locked for R1. |
| `cash_drawer.movement.create` | **Yes** | No | Add cash drawer drop/payout transaction is locked for R1. |
| `cash_drawer.manage` | No | **Yes** | Unrestricted manual drawer open commands are deferred to R2. |
| `tenant.stock.expiry.view` | **Yes** | No | View stock item batch expiry dates is locked for R1. |
| `tenant.stock.value.view` | **Yes** | No | View monetary stock valuation is locked for R1. |
| `tenant.stock.adjustments.view` | **Yes** | No | View adjustments history (used for adjustment mutation, tech validation required, not business pending). |
| `tenant.stock.out` | No | **Yes** | Manual stock write-offs / disposals are deferred to R2. |
| `tenant.stock.transfers.view` | No | **Yes** | Inter-outlet stock transfer documents are deferred to R2. |
| `catalog.product_channels.manage` | **Yes** | No | Candidate mapping for Channel Allocation (technical mapping validation required). |
| `tenant.reports.sales.view` | **Yes** | No | Canonical R1 reports view permission code. |
| `reports.sales.view` | No | **Yes** | Legacy/alias compatibility token (subject to cleanup). |
### Itemized Release Classification Master Table (217 Permissions)
| # | Permission Code | Domain Module | Technical Scope | Release Classification | Implementation Status | Reason and Audit Verdict |
|---|---|---|---|---|---|---|
| 1 | `platform.admin.access` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Enforced as base bootstrap platform access credential |
| 2 | `platform.dashboard.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Platform dashboard overview screen |
| 3 | `platform.tenants.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View tenant listings and summary details |
| 4 | `platform.tenant_subscriptions.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View subscriptions associated with tenants |
| 5 | `platform.tenants.create` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Provision new platform tenant |
| 6 | `platform.tenants.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Update platform tenant details |
| 7 | `platform.tenants.activate` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Activate suspended tenant workspace |
| 8 | `platform.tenants.suspend` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Suspend tenant workspace due to payment/policy |
| 9 | `platform.tenants.entitlements.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Override or update commercial features for tenant |
| 10 | `platform.tenants.bootstrap.access` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Special selected-tenant bootstrap dashboard access |
| 11 | `platform.tenants.bootstrap.outlets.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage physical outlets on behalf of selected tenant |
| 12 | `platform.tenants.bootstrap.tills.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage tills/registers on behalf of selected tenant |
| 13 | `platform.tenants.bootstrap.roles.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage tenant roles/permissions on behalf of tenant |
| 14 | `platform.tenants.bootstrap.users.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage staff accounts on behalf of selected tenant |
| 15 | `platform.tenants.bootstrap.products.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage catalog items on behalf of selected tenant |
| 16 | `platform.tenants.bootstrap.products.import` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Execute product bulk data imports for selected tenant |
| 17 | `platform.tenants.bootstrap.online_store.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Configure online store storefront for selected tenant |
| 18 | `platform.subscription_plans.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View commercial subscription plan tiers |
| 19 | `platform.subscription_plans.create` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Create new commercial subscription plan tier |
| 20 | `platform.subscription_plans.edit` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Edit commercial subscription plan properties |
| 21 | `platform.subscription_plans.duplicate` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Clone existing subscription plan template |
| 22 | `platform.subscription_plans.archive` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Archive obsolete subscription plan tier |
| 23 | `platform.subscription_plans.delete` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Delete inactive subscription plan tier |
| 24 | `platform.return_policy_templates.view` | platform_admin | PLATFORM | **R2_DEFERRED** | ACTIVE | Deferred return policy templates view (backend ready) |
| 25 | `platform.return_policy_templates.create` | platform_admin | PLATFORM | **R2_DEFERRED** | ACTIVE | Deferred return policy templates creation (backend ready) |
| 26 | `platform.return_policy_templates.update` | platform_admin | PLATFORM | **R2_DEFERRED** | ACTIVE | Deferred return policy templates update (backend ready) |
| 27 | `platform.return_policy_templates.delete` | platform_admin | PLATFORM | **R2_DEFERRED** | ACTIVE | Deferred return policy templates deletion (backend ready) |
| 28 | `platform.return_policy_templates.manage` | platform_admin | PLATFORM | **R2_DEFERRED** | ACTIVE | Deferred return policy templates administration (backend ready) |
| 29 | `platform.modules.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View master modules catalog |
| 30 | `platform.features.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View technical features configurations |
| 31 | `platform.users.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View platform super admin users listing |
| 32 | `platform.users.create` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Create new platform super admin user |
| 33 | `platform.users.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Update platform super admin details |
| 34 | `platform.users.roles.assign` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Assign administrative roles to platform users |
| 35 | `platform.audit.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View global platform audit logs |
| 36 | `platform.settings.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View global platform system configuration |
| 37 | `platform.settings.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Update global platform system configuration |
| 38 | `platform.billing.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View platform invoice billing records |
| 39 | `platform.billing.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage platform billing structures |
| 40 | `platform.integrations.manage` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Manage global system integration configurations |
| 41 | `platform.permissions.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View list of platform permission definitions |
| 42 | `platform.roles.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View super admin role listings |
| 43 | `platform.roles.create` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Create super admin custom roles |
| 44 | `platform.roles.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Update super admin custom roles properties |
| 45 | `platform.roles.permissions.view` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | View permissions assigned to a platform role |
| 46 | `platform.roles.permissions.update` | platform_admin | PLATFORM | **R1_ACTIVE** | ACTIVE | Update permissions assigned to a platform role |
| 47 | `tenant.dashboard.view` | tenant_foundation | TENANT | **R1_ACTIVE** | ACTIVE | View tenant back-office operations dashboard |
| 48 | `tenant.settings.manage` | tenant_foundation | TENANT | **R1_ACTIVE** | ACTIVE | Configure tenant-wide organizational settings |
| 49 | `tenant.users.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View tenant staff user account listings |
| 50 | `tenant.users.create` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Provision new tenant staff user |
| 51 | `tenant.users.invite` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Dispatch email invitations to potential staff |
| 52 | `tenant.users.update` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Update details of existing staff user |
| 53 | `tenant.users.delete` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Soft-delete staff user account from system |
| 54 | `tenant.users.disable` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Deactivate/enable user account dynamically |
| 55 | `tenant.users.details.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View full details and activity of staff user |
| 56 | `tenant.users.permission_override` | user_management | TENANT | **R2_DEFERRED** | ACTIVE | Assign direct permission overrides to staff (deferred UI) |
| 57 | `tenant.users.manage` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for staff accounts |
| 58 | `tenant.roles.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View tenant role definitions and rights |
| 59 | `tenant.roles.create` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Define custom role configurations |
| 60 | `tenant.roles.update` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Update custom role properties |
| 61 | `tenant.roles.delete` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Delete custom role definitions |
| 62 | `tenant.roles.permissions.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View role permission assignment catalog |
| 63 | `tenant.roles.permissions.update` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Update custom role permission bounds |
| 64 | `tenant.roles.assignments.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View assigned roles on active users |
| 65 | `tenant.roles.assignments.update` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Change role assignments of active staff |
| 66 | `tenant.roles.manage` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for role profiles |
| 67 | `tenant.permissions.view` | user_management | TENANT | **R1_ACTIVE** | ACTIVE | View tenant-level action permission library |
| 68 | `tenant.outlets.view` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | View list of physical outlets |
| 69 | `tenant.outlets.details.view` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | View detailed profile of specific outlet |
| 70 | `tenant.outlets.revenue.view` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | View financial metrics of specific outlet |
| 71 | `tenant.outlets.users.view` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | View staff assigned to specific outlet |
| 72 | `tenant.outlets.tills.view` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | View till registers deployed at physical outlet |
| 73 | `tenant.outlets.update` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | Update outlet attributes and layout options |
| 74 | `tenant.outlets.manage` | outlet_till_core | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for outlet entities |
| 75 | `tenant.tills.view` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | View till register status and summary profiles |
| 76 | `tenant.tills.create` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | Add new register till to outlet |
| 77 | `tenant.tills.update` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | Update register properties and peripherals mapping |
| 78 | `tenant.tills.delete` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | Delete till register configuration from system |
| 79 | `tenant.tills.manage` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | Full management delegation for tills |
| 80 | `tenant.tills.assign_outlet` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | Reassign till registers across physical locations |
| 81 | `tenant.tills.details.view` | outlet_till_core | OUTLET | **R1_ACTIVE** | ACTIVE | View register operation status and log history |
| 82 | `tenant.hardware.view` | outlet_till_core | DEVICE | **R2_DEFERRED** | ACTIVE | View till register device hardware configurations (deferred UI) |
| 83 | `tenant.hardware.manage` | outlet_till_core | DEVICE | **R2_DEFERRED** | ACTIVE | Manage till register device hardware settings (deferred UI) |
| 84 | `tenant.devices.view` | outlet_till_core | DEVICE | **R1_ACTIVE** | ACTIVE | View list of registered client devices |
| 85 | `tenant.devices.create` | outlet_till_core | DEVICE | **R1_ACTIVE** | ACTIVE | Register new terminal device client |
| 86 | `tenant.devices.update` | outlet_till_core | DEVICE | **R1_ACTIVE** | ACTIVE | Update terminal device properties |
| 87 | `tenant.devices.delete` | outlet_till_core | DEVICE | **R1_ACTIVE** | ACTIVE | Delete registered terminal device client |
| 88 | `tenant.devices.manage` | outlet_till_core | DEVICE | **R1_ACTIVE** | ACTIVE | Full management delegation for client devices |
| 89 | `tenant.products.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View listing of custom tenant products |
| 90 | `tenant.products.dashboard.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View tenant product performance analytics dashboard |
| 91 | `tenant.products.details.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View detailed profile of custom product catalog entry |
| 92 | `tenant.products.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create custom product catalog entry |
| 93 | `tenant.products.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update custom product catalog entry properties |
| 94 | `tenant.products.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Soft-delete custom product catalog entry |
| 95 | `catalog.products.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View global system products listing |
| 96 | `catalog.products.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create new product in master catalog |
| 97 | `catalog.products.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update product master attributes |
| 98 | `catalog.products.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Soft-delete product from master catalog |
| 99 | `catalog.products.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for catalog products |
| 100 | `catalog.products.publish` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Publish products to active channels (Vite/Ecommerce) |
| 101 | `catalog.variants.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage master variant configurations and pricing grids |
| 102 | `catalog.product_media.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage master catalog media attachments |
| 103 | `catalog.combo_components.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage bundle combo component maps |
| 104 | `catalog.product_cost.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View cost of goods sold/purchase price fields |
| 105 | `catalog.barcodes.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage barcode allocations and print scripts |
| 106 | `tenant.product_media.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage tenant custom product catalog media attachments |
| 107 | `catalog.departments.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View product department catalog entries |
| 108 | `catalog.departments.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create product department catalog entries |
| 109 | `catalog.departments.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update product department attributes |
| 110 | `catalog.departments.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Delete product department from catalog |
| 111 | `catalog.departments.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for catalog departments |
| 112 | `catalog.categories.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View product category structures |
| 113 | `catalog.categories.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create new product category level |
| 114 | `catalog.categories.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update category attributes and nested hierarchy |
| 115 | `catalog.categories.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Delete product category from system |
| 116 | `catalog.categories.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for catalog categories |
| 117 | `catalog.brands.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View catalog brands directory |
| 118 | `catalog.brands.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create catalog brand entry |
| 119 | `catalog.brands.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update catalog brand entry properties |
| 120 | `catalog.brands.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Delete catalog brand entry |
| 121 | `catalog.brands.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for catalog brands |
| 122 | `catalog.collections.view` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | View product collection maps |
| 123 | `catalog.collections.create` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Create product collection definition |
| 124 | `catalog.collections.update` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Update product collection attributes |
| 125 | `catalog.collections.delete` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Delete product collection definition |
| 126 | `catalog.collections.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for collections |
| 127 | `catalog.product_channels.manage` | product_catalog | TENANT | **R1_ACTIVE** | ACTIVE | Manage commercial channel placements |
| 128 | `catalog.return_policies.view` | product_catalog | TENANT | **R2_DEFERRED** | ACTIVE | Deferred catalog return policies list (deferred UI) |
| 129 | `catalog.return_policies.create` | product_catalog | TENANT | **R2_DEFERRED** | ACTIVE | Deferred catalog return policies creation (deferred UI) |
| 130 | `catalog.return_policies.update` | product_catalog | TENANT | **R2_DEFERRED** | ACTIVE | Deferred catalog return policies update (deferred UI) |
| 131 | `catalog.return_policies.delete` | product_catalog | TENANT | **R2_DEFERRED** | ACTIVE | Deferred catalog return policies deletion (deferred UI) |
| 132 | `catalog.return_policies.manage` | product_catalog | TENANT | **R2_DEFERRED** | ACTIVE | Deferred catalog return policies administration (deferred UI) |
| 133 | `inventory.stock.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View stock ledger levels at outlet |
| 134 | `tenant.stock.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View stock listings across outlet locations |
| 135 | `tenant.stock.dashboard.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View inventory alerts dashboard |
| 136 | `tenant.stock.in` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | Process stock receiving / intake flows |
| 137 | `tenant.stock.out` | inventory_tracking | OUTLET | **R2_DEFERRED** | ACTIVE | Process stock write-offs / shrinkage outflows (deferred from R1 scope lock) |
| 138 | `tenant.stock.value.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View financial valuation profiles of stock |
| 139 | `tenant.stock.movements.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View history log of stock movement items |
| 140 | `tenant.stock.expiry.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | View alerts of stock expiry items |
| 141 | `tenant.stock.adjustments.view` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | Adjust stock levels manually |
| 142 | `tenant.stock.transfers.view` | inventory_tracking | OUTLET | **R2_DEFERRED** | ACTIVE | View details of stock transfer sheets (deferred from R1 scope lock) |
| 143 | `tenant.stock.opening` | inventory_tracking | OUTLET | **R1_ACTIVE** | ACTIVE | Record initial stock count data |
| 144 | `pricing.price_lists.view` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | View custom price list configurations |
| 145 | `pricing.price_lists.create` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Create custom price list configurations |
| 146 | `pricing.price_lists.update` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Update custom price list configurations |
| 147 | `pricing.price_lists.delete` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Delete custom price list configurations |
| 148 | `pricing.price_lists.manage` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for price lists |
| 149 | `pricing.product_tax_assignments.view` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | View tax assignments assigned to products |
| 150 | `pricing.product_tax_assignments.create` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Create tax assignments for catalog products |
| 151 | `pricing.product_tax_assignments.update` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Update tax assignments for catalog products |
| 152 | `pricing.product_tax_assignments.delete` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Delete tax assignments for catalog products |
| 153 | `pricing.product_tax_assignments.manage` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for tax assignments |
| 154 | `tax.classes.view` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | View tax classes definitions |
| 155 | `tax.classes.create` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Create tax class definition |
| 156 | `tax.classes.update` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Update tax class attributes |
| 157 | `tax.classes.delete` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Delete tax class definition |
| 158 | `tax.classes.manage` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for tax classes |
| 159 | `tax.rates.view` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | View tax rate structures |
| 160 | `tax.rates.create` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Create tax rate structure |
| 161 | `tax.rates.update` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Update tax rate structure |
| 162 | `tax.rates.delete` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Delete tax rate structure |
| 163 | `tax.rates.manage` | pricing_tax | TENANT | **R1_ACTIVE** | ACTIVE | Full management delegation for tax rates |
| 164 | `discount.policy.view` | discount_engine | TENANT | **R1_ACTIVE** | ACTIVE | View dynamic discount policy configurations |
| 165 | `discount.policy.create` | discount_engine | TENANT | **R1_ACTIVE** | ACTIVE | Create dynamic discount policy rules |
| 166 | `discount.policy.update` | discount_engine | TENANT | **R1_ACTIVE** | ACTIVE | Update dynamic discount policy properties |
| 167 | `discount.policy.activate` | discount_engine | TENANT | **R1_ACTIVE** | ACTIVE | Toggle active activation state of discount policy |
| 168 | `discount.policy.delete` | discount_engine | TENANT | **R1_ACTIVE** | ACTIVE | Soft-delete discount policy rules |
| 169 | `pos.home.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Access POS home layout grid |
| 170 | `pos.dashboard.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View cashier daily shift dashboard metrics |
| 171 | `pos.new_sale.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Open cashier checkout new sale screen |
| 172 | `pos.till.open` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Open till register and record opening float |
| 173 | `pos.till.close` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Close till register and reconcile cash drawer balance |
| 174 | `till.session.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View till register session details |
| 175 | `pos.hardware.settings` | pos_sales | DEVICE | **R2_DEFERRED** | ACTIVE | Configure local POS device settings (deferred UI) |
| 176 | `pos.refund.approve` | pos_sales | TILL | **R2_DEFERRED** | ACTIVE | Provide manager approval code to unlock cashier refund override (deferred from R1 scope lock) |
| 177 | `sales.discount.approve` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Provide manager approval code to unlock cashier discount override |
| 178 | `sales.create` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Initiate new POS sale checkout block |
| 179 | `sales.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View listing of completed cashier checkout sales |
| 180 | `sales.checkout` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Execute payment checkout processing flow |
| 181 | `sales.cart.manage` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Full management delegation for active cashier cart |
| 182 | `sales.cart.add_item` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Add item lines to cashier cart |
| 183 | `sales.cart.update_item` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Update quantities/modifiers of items in cashier cart |
| 184 | `sales.cart.remove_item` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Remove item lines from cashier cart |
| 185 | `sales.cart.clear` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Discard all lines in cashier cart |
| 186 | `sales.discount.apply` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Apply line item or cart discount manually |
| 187 | `sales.park.create` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Park current cashier cart session into hold state |
| 188 | `sales.park.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View held parked cart sessions at current register till |
| 189 | `sales.park.recall` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Recall parked checkout cart to continue checkout |
| 190 | `orders.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View client orders at till |
| 191 | `returns.view` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | View completed returns listing |
| 192 | `returns.create` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | Initiate new returns workflow |
| 193 | `refunds.view` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | View completed refunds listing |
| 194 | `refunds.create` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | Initiate new refunds processing |
| 195 | `exchanges.view` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | View listing of completed product exchange receipts |
| 196 | `exchanges.create` | returns_refunds | TILL | **R1_ACTIVE** | ACTIVE | Execute product exchanges checkout flow |
| 197 | `receipts.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View register transaction receipts listing |
| 198 | `receipts.print` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Print receipt copy via hardware |
| 199 | `receipts.reprint` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | Reprint receipt copies (restricted action) |
| 200 | `cash_drawer.view` | hardware_cash | TILL | **R1_ACTIVE** | ACTIVE | View cash drawer audit counts and history logs |
| 201 | `cash_drawer.manage` | hardware_cash | TILL | **R2_DEFERRED** | ACTIVE | Open cash drawer manually (restricted action, deferred from R1 scope lock) |
| 202 | `cash_drawer.movement.create` | hardware_cash | TILL | **R1_ACTIVE** | ACTIVE | Record cash drawer cash in / cash out movements |
| 203 | `payments.cash.accept` | payment_processing | TILL | **R1_ACTIVE** | ACTIVE | Accept cash payments at till register checkout |
| 204 | `payments.card.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Accept card terminal payments at checkout (deferred from R1 scope lock) |
| 205 | `payments.qr.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Accept digital QR code payments at checkout (deferred from R1 scope lock) |
| 206 | `payments.split.accept` | payment_processing | TILL | **R2_DEFERRED** | ACTIVE | Split checkout transaction across multiple payment methods (deferred from R1 scope lock) |
| 207 | `notifications.view` | pos_sales | TILL | **R1_ACTIVE** | ACTIVE | View in-app notifications at till register |
| 208 | `customers.view` | customer_management | TILL | **R1_ACTIVE** | ACTIVE | View CRM customer listings at till register checkout |
| 209 | `customers.create` | customer_management | TILL | **R1_ACTIVE** | ACTIVE | Register new CRM customer profile at till register |
| 210 | `customers.update` | customer_management | TILL | **R1_ACTIVE** | ACTIVE | Update CRM customer details at till register |
| 211 | `products.view` | product_catalog | TILL | **R1_ACTIVE** | ACTIVE | View master catalog items at till register checkout |
| 212 | `products.search` | product_catalog | TILL | **R1_ACTIVE** | ACTIVE | Query catalog products at till register |
| 213 | `reports.sales.view` | reporting_analytics | OUTLET | **R1_ACTIVE** | ACTIVE | View outlet daily sales reports |
| 214 | `fulfillment.orders.view` | fulfilment_pickup | OUTLET | **R1_ACTIVE** | ACTIVE | View listing of pickup/fulfilment orders |
| 215 | `fulfillment.orders.manage` | fulfilment_pickup | OUTLET | **R1_ACTIVE** | ACTIVE | Process click-collect orders status changes |
| 216 | `tenant.online_store.view` | cart_checkout | TENANT | **R1_ACTIVE** | ACTIVE | View online store setup profile |
| 217 | `tenant.online_store.manage` | cart_checkout | TENANT | **R1_ACTIVE** | ACTIVE | Update online store settings details |


---

## 11. Core Verification Audit and Gap Identifications

### A. Previously Omitted Permissions Summary Reconciliation
A manual calculation error in the previous candidate summary reported: "46 Platform R1 + 160 Tenant/POS R1 = 206 R1", leaving exactly **10 permissions** outside the R1/R2 total. The table below identifies these 10 permissions, their correct release status, and the calculation gap.

| # | Permission Code | Previously Omitted From Summary? | Correct Release Classification | Detailed Reason and Audit Verdict |
|---|---|---|---|---|
| 1 | catalog.return_policies.view | Yes | **R2_DEFERRED** | Seeded in DB, but tenant-level return policy setup UI is deferred. |
| 2 | catalog.return_policies.create | Yes | **R2_DEFERRED** | Seeded in DB, but return policy manager setup UI is deferred. |
| 3 | catalog.return_policies.update | Yes | **R2_DEFERRED** | Seeded in DB, but return policy manager setup UI is deferred. |
| 4 | catalog.return_policies.delete | Yes | **R2_DEFERRED** | Seeded in DB, but return policy manager setup UI is deferred. |
| 5 | catalog.return_policies.manage | Yes | **R2_DEFERRED** | Seeded in DB, but return policy manager setup UI is deferred. |
| 6 | pos.hardware.settings | Yes | **R2_DEFERRED** | Seeded in DB, but POS client hardware configuration screen is unwired in POS UI. |
| 7 | tenant.hardware.view | Yes | **R2_DEFERRED** | Seeded in DB, but till register hardware mapping is unwired in Flutter admin. |
| 8 | tenant.hardware.manage | Yes | **R2_DEFERRED** | Seeded in DB, but till register hardware mapping is unwired in Flutter admin. |
| 9 | fulfillment.orders.view | Yes | **R1_ACTIVE** | Omitted by summary calculation error; fully active click & collect order viewer. |
| 10 | fulfillment.orders.manage | Yes | **R1_ACTIVE** | Omitted by summary calculation error; fully active click & collect status controller. |

**Audit Calculation Explanatory Note**:
The previous turns incorrectly calculated Tenant/POS R1 as 160 by omitting active click-and-collect permissions (fulfillment.orders.view and fulfillment.orders.manage) due to a catalog grouping oversight, while simultaneously grouping the deferred return policy configurations (5 permissions) and register hardware settings (3 permissions) into the active candidate lists without adjusting summary totals. This left exactly 10 permissions unaccounted for.

### E. Reclassification of the 37 Missing DB Permissions
The previous database parity audit identified 37 permissions defined in C# constants but missing from the database, classifying them as `R1_REQUIRED_DB_SEED` blockers.

Following the **business-owner approved Release 1 scope lock**, these 37 permissions have been re-evaluated and reclassified against the active R1 business requirements. They are no longer treated as immediate R1 database blockers if the underlying capability is deferred to Release 2.

**Reclassified Examples**:
- `tenant.stock.out` → **OUT OF R1 (R2)**: No longer an R1 database blocker.
- `tenant.stock.transfers.view` → **OUT OF R1 (R2)**: No longer an R1 database blocker.
- `tenant.online_store.view` → **R1**: Remains a true R1 database blocker.
- `tenant.online_store.manage` → **R1**: Remains a true R1 database blocker.
- `tenant.roles.create` → **R1**: Remains a true R1 database blocker.
- `catalog.variants.manage` → **R1**: Remains a true R1 database blocker.

### E. Reclassification of the 37 Missing DB Permissions
The previous database parity audit identified 37 permissions defined in C# constants but missing from the database, classifying them as `R1_REQUIRED_DB_SEED` blockers.

Following the **business-owner approved Release 1 scope lock**, these 37 permissions have been re-evaluated and reclassified against the active R1 business requirements. They are no longer treated as immediate R1 database blockers if the underlying capability is deferred to Release 2.

**Reclassified Examples**:
- `tenant.stock.out` → **OUT OF R1 (R2)**: No longer an R1 database blocker.
- `tenant.stock.transfers.view` → **OUT OF R1 (R2)**: No longer an R1 database blocker.
- `tenant.online_store.view` → **R1**: Remains a true R1 database blocker.
- `tenant.online_store.manage` → **R1**: Remains a true R1 database blocker.
- `tenant.roles.create` → **R1**: Remains a true R1 database blocker.
- `catalog.variants.manage` → **R1**: Remains a true R1 database blocker.

### B. Seeded but Unused in UI Permissions
There are exactly **8 permissions** that are actively seeded in the database during system bootstrap but have **no corresponding user interface wiring** in Release 1.

| # | Permission Code | UI Gap Classification | Reason and Intended Release Scope |
|---|---|---|---|
| 1 | platform.return_policy_templates.view | INTENTIONALLY_NO_UI | Platform-admin backend/API-only return template catalog configurations; does not belong in tenant UI. |
| 2 | platform.return_policy_templates.create | INTENTIONALLY_NO_UI | Platform-admin backend/API-only return template configurations. |
| 3 | platform.return_policy_templates.update | INTENTIONALLY_NO_UI | Platform-admin backend/API-only return template configurations. |
| 4 | platform.return_policy_templates.delete | INTENTIONALLY_NO_UI | Platform-admin backend/API-only return template configurations. |
| 5 | platform.return_policy_templates.manage | INTENTIONALLY_NO_UI | Platform-admin backend/API-only return template configurations. |
| 6 | pos.hardware.settings | TRUE_UI_GAP | POS checkout local printer/cash drawer selection layout is a hardcoded mock; POS settings screen is unwired. |
| 7 | tenant.hardware.view | TRUE_UI_GAP | Physical till serial registers device attachment listings are unwired in Flutter Tenant Admin. |
| 8 | tenant.hardware.manage | TRUE_UI_GAP | Physical till serial registers device attachment actions are unwired in Flutter Tenant Admin. |

- **Intentionally No UI**: Platform-level return template endpoints (platform.return_policy_templates.* - 5 codes) and bootstrap permissions (platform.tenants.bootstrap.access) are intended as backend support credentials and system-internal APIs, having no frontend UI exposure by design.
- **True UI Gaps**: POS register local hardware configuration (pos.hardware.settings - 1 code) and till registers physical device attachments (tenant.hardware.view, tenant.hardware.manage - 2 codes) represent actual UI gaps where database seeding is complete but the frontends remain unwired.

### C. pos.offline.sync Reconciliation
To resolve naming and conceptual ambiguities regarding local POS checkout resilience, the architecture is audited and separated into four distinct layers:

| Layer | Code / Concept | Type | R1/R2 Status | Runtime Implemented? | Permission Enforced? | Reason and Audit Verdict |
|---|---|---|---|---|---|---|
| A | offline_sync | **Technical Module** | **R1** | Yes | No (Module level gating) | Seeded as active technical module container. |
| B | offline_operation_sync | **Commercial Feature** | **R1** | Yes (Tenant Entitled) | No (Permissionless feature) | Commercial capability key verified in platform entitlements seed. |
| C | SQLite transaction queue / reconnection outbox | **Runtime Capability** | **R1** | Yes (Client Outbox Cache) | No (No permission check) | Flutter client sqlite transaction queue cache for cash checkout is fully operational. |
| D | pos.offline.sync | **Granular Permission** | **R2_DEFERRED** | No | No (Unseeded/Unenforced) | Direct cashier manual sync trigger token is unseeded in DB and deferred. |

**Wording of offline capability**:
*Dynamic SQLite outbox transaction queue and reconnection synchronization are fully operational at the client runtime layer for POS Cashiers. However, the granular permission pos.offline.sync is unseeded in the database and deferred as a Release 2 requirement.*

### D. R2 Features vs R2 Permissions Separation
Commercial add-on features and modules deferred to Release 2 do **not** introduce active permissions in Release 1. The table below explicitly separates deferred features from deferred permissions:

| R2/Future Commercial Feature Keys (0 Permissions Seeded) | R2/Deferred Permissions (21 Seeded in Constants) |
|---|---|
| - whatsapp_integration (WhatsApp Messaging) | - platform.return_policy_templates.view |
| - advanced_ai_analytics (AI Analytics & Insights) | - platform.return_policy_templates.create |
| - loyalty_program (Loyalty Points & Tiers) | - platform.return_policy_templates.update |
| - delivery_integration (Uber Eats & Courier Sync) | - platform.return_policy_templates.delete |
| - accounting_integration (QuickBooks & Xero Sync) | - platform.return_policy_templates.manage |
| - marketing_automation (Email & SMS Campaigns) | - tenant.users.permission_override |
| | - catalog.return_policies.view |
| | - catalog.return_policies.create |
| | - catalog.return_policies.update |
| | - catalog.return_policies.delete |
| | - catalog.return_policies.manage |
| | - pos.hardware.settings |
| | - tenant.hardware.view |
| | - tenant.hardware.manage |
| | - payments.card.accept |
| | - payments.qr.accept |
| | - payments.split.accept |
| | - tenant.stock.out |
| | - tenant.stock.transfers.view |
| | - pos.refund.approve |
| | - cash_drawer.manage |
---

## 12. Final Mathematical Block and Lock Gate Verification

`	ext
======================================================================
ONEVERZ RELEASE 1 AUTHORIZATION CONTRACT FINAL MATHEMATICAL RECONCILIATION
======================================================================

1. Module Configuration:
   - Technical Modules Seeded in Catalog: 35
   - Capacity Add-ons Commercially Grouped: 3 (extra_outlet, extra_till, extra_user)
   - Commercially Reported Modules: 33
   Reconciliation Formula: 35 (Technical) - 3 (Addons) + 1 (Umbrella Addon) = 33 Modules. (MATCHED)

2. Feature Configuration:
   - System Core Features (10 Modules * 5 Features): 50
   - Commercial Feature Module Features: 77
   - Commercial Add-on Features: 27
   - Total Seeded Features in Database: 154
   Reconciliation: Verified against database platform_features. (MATCHED)

3. Permission Definitions:
   - Platform Administration Permissions: 46
   - Tenant Operations & Cashier Permissions: 171
   - Total Active Permission Definitions Seeded in Constants: 217
    Reconciliation by Release Status:
      * R1_ACTIVE (Platform: 41, Tenant/POS: 155): 196
      * R2_DEFERRED (Platform: 5, Tenant/POS: 16): 21
      * FUTURE (Add-ons): 0
      * LEGACY_ACTIVE: 0 (pos.sale.create and tenant.till.manage listed under legacy tokens)
      * Total Reconciled: 196 + 21 + 0 + 0 = 217. (MATCHED)
