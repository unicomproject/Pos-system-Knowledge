<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-27 -->

# Permission Code List

> **Permission & Entitlement Contract Reconciled: 2026-08-21 — SUPERSEDED BY OWNER-APPROVED R1 SCOPE LOCK**  
> The authoritative Release 1 scope is locked in [ONEVERZ_RELEASE_1_SCOPE_LOCK.md](file:///c:/Users/User/Desktop/Nytroz__POS/Nytroz%20POS%20-%20Second%20Brain/Pos-system-Knowledge/01_RELEASE_SCOPE/ONEVERZ_RELEASE_1_SCOPE_LOCK.md).  
> The reconciled Release 1 permission catalog is locked in [CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md](file:///c:/Users/User/Desktop/Nytroz__POS/Nytroz%20POS%20-%20Second%20Brain/Pos-system-Knowledge/02_ACCESS_CONTROL/CANONICAL_MODULE_FEATURE_PERMISSION_CATALOG_R1.md).  
> Where this working list conflicts with the Canonical Scope and Catalog, **the Canonical Scope and Catalog win**.

## Purpose

This document is the **Single Source of Truth** for permission codes across the OneVerz POS / Unified Commerce system.

The database `permission_definitions` and `platform_permissions` tables are the authoritative runtime source of truth. The catalog hierarchy (`platform_modules` → `platform_features` → `permission_definitions`) is exposed through backend catalog APIs and must not be duplicated into static frontend-only permission trees. See [[Backend_Driven_Permission_Catalog]].

Code constants in Backend (`PlatformPermissionCodes.cs`, `SalesPermissionCodes.cs`, etc.) and Flutter POS (`pos_access_codes.dart`) are safe compile-time references for API attributes, services, route guards, UI checks, seed data, and automated tests.

---

## Permission Code Rule

All permission codes must strictly follow the **Canonical 4-Tier Permission Taxonomy**:

$$\mathbf{domain.module.feature.action}$$

### Taxonomy Architecture

| Segment | Meaning | Naming Convention | Examples |
|---|---|---|---|
| **`domain`** | Top-level product or application boundary | Lowercase noun | `platform`, `tenant`, `catalog`, `pricing`, `inventory`, `pos`, `commerce` |
| **`module`** | Functional/business module within the domain | Lowercase noun (plural where representing entities) | `admin`, `tenants`, `subscription_plans`, `outlets`, `tills`, `products`, `sales`, `payments`, `receipts`, `returns`, `refunds`, `exchanges`, `cash_drawer`, `online_order` |
| **`feature`** | Specific capability, operational sub-area, or resource surface | Lowercase noun / snake_case | `dashboard`, `lifecycle`, `master`, `new_sale`, `cart`, `checkout`, `manual_discount`, `held_sales`, `session`, `physical`, `movements`, `picking`, `packing`, `collection` |
| **`action`** | Granular operation verb permitted on that feature | Lowercase action verb | `view`, `create`, `update`, `delete`, `manage`, `apply`, `approve`, `open`, `close`, `print`, `reprint`, `accept`, `pick`, `pack`, `publish`, `archive`, `duplicate`, `restore`, `import`, `assign` |

### Core Invariants

1. **Strict 4-Tier Depth:** All canonical codes must have exactly four dot-separated segments.
2. **No Role Names in Codes:** Capability codes represent operations on resources and must never contain role names (e.g. `cashier.sale.create` is an anti-pattern).
3. **Plural Resource Nouns:** Resource entity segments must use plural nouns (e.g. `tenants`, `products`, `departments`, `tills`, `subscription_plans`).
4. **No Monolithic Enum:** Do not create a single monolithic `PermissionCode` enum. Use module-wise static constant classes in domain folders.
5. **No Collapsed Umbrella Codes:** Implemented granular action codes must not be collapsed into generic `*.manage` umbrellas in runtime authorization.
6. **Decisions Authority:** Defined under [[../13_DECISIONS_AND_CHANGES/ADR/ADR_007_Permission_Code_Strategy]].

---

## Canonical Master Permission Registry

### 1. Platform Administration (`platform.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `platform.admin.dashboard.view` | View platform admin dashboard | `platform.dashboard.view` |
| `platform.tenants.lifecycle.view` | View tenant list, summary, filters | `platform.tenants.view` |
| `platform.tenants.lifecycle.create` | Create tenant | `platform.tenants.create`, `platform.tenant.create` |
| `platform.tenants.lifecycle.update` | Update tenant profile/setup | `platform.tenants.update`, `platform.tenant.update` |
| `platform.tenants.lifecycle.activate` | Activate tenant | `platform.tenants.activate`, `platform.tenant.activate` |
| `platform.tenants.lifecycle.suspend` | Suspend tenant | `platform.tenants.suspend` |
| `platform.tenants.entitlements.update` | Assign or update tenant feature entitlements | `platform.tenants.entitlements.update` |
| `platform.tenants.subscriptions.view` | View tenant subscriptions & dashboard widgets | `platform.tenant_subscriptions.view` |
| `platform.tenants.bootstrap.access` | Enter Selected-Tenant Mode and view Setup Hub | `platform.tenants.bootstrap.access` |
| `platform.tenants.bootstrap.outlets_manage` | Create bootstrap outlet for selected tenant | `platform.tenants.bootstrap.outlets.manage` |
| `platform.tenants.bootstrap.tills_manage` | Create bootstrap till for selected tenant | `platform.tenants.bootstrap.tills.manage` |
| `platform.tenants.bootstrap.roles_manage` | Create bootstrap tenant role | `platform.tenants.bootstrap.roles.manage` |
| `platform.tenants.bootstrap.users_manage` | Add additional bootstrap tenant user | `platform.tenants.bootstrap.users.manage` |
| `platform.tenants.bootstrap.products_manage` | Manual bootstrap product onboarding | `platform.tenants.bootstrap.products.manage` |
| `platform.tenants.bootstrap.products_import` | CSV bootstrap product import | `platform.tenants.bootstrap.products.import` |
| `platform.tenants.bootstrap.online_store_manage` | Configure initial Online Store bootstrap | `platform.tenants.bootstrap.online_store.manage` |
| `platform.subscription_plans.lifecycle.view` | View subscription plans list & details | `platform.subscription_plans.view` |
| `platform.subscription_plans.lifecycle.create` | Create draft subscription plan | `platform.subscription_plans.create` |
| `platform.subscription_plans.lifecycle.edit` | Edit and publish draft subscription plan | `platform.subscription_plans.edit` |
| `platform.subscription_plans.lifecycle.duplicate` | Duplicate subscription plan | `platform.subscription_plans.duplicate` |
| `platform.subscription_plans.lifecycle.archive` | Archive or reactivate subscription plan | `platform.subscription_plans.archive` |
| `platform.subscription_plans.lifecycle.delete` | Delete eligible unused draft plan | `platform.subscription_plans.delete` |
| `platform.return_policy_templates.master.view` | View platform return policy templates | `platform.return_policy_templates.view` |
| `platform.return_policy_templates.master.create` | Create platform return policy template | `platform.return_policy_templates.create` |
| `platform.return_policy_templates.master.update` | Update platform return policy template | `platform.return_policy_templates.update` |
| `platform.return_policy_templates.master.delete` | Delete platform return policy template | `platform.return_policy_templates.delete` |
| `platform.return_policy_templates.master.manage` | Manage all platform return policy template actions | `platform.return_policy_templates.manage` |
| `platform.catalog.permissions.view` | View permission catalog tree | `platform.permissions.view` |
| `platform.catalog.modules.view` | View modules catalog | `platform.modules.view` |
| `platform.catalog.features.view` | View features catalog | `platform.features.view` |
| `platform.roles.management.view` | View platform roles | `platform.roles.view` |
| `platform.roles.management.create` | Create platform roles | `platform.roles.create` |
| `platform.roles.management.update` | Update platform role metadata | `platform.roles.update` |
| `platform.roles.permissions.view` | View role permission assignments | `platform.roles.permissions.view` |
| `platform.roles.permissions.update` | Replace role permission assignments | `platform.roles.permissions.update` |
| `platform.users.management.view` | View platform users | `platform.users.view` |
| `platform.users.management.create` | Create platform users | `platform.users.create` |
| `platform.users.management.update` | Update platform users | `platform.users.update` |
| `platform.users.roles.assign` | Assign platform roles to users | `platform.users.roles.assign` |
| `platform.settings.configuration.view` | View platform settings | `platform.settings.view` |
| `platform.settings.configuration.update` | Update platform settings | `platform.settings.update` |
| `platform.billing.invoices.view` | View tenant billing and invoices | `platform.billing.view` |
| `platform.billing.invoices.manage` | Manage billing invoices / mutations | `platform.billing.manage` |
| `platform.audit_logs.security.view` | View platform security audit logs | `platform.audit.view` |
| `platform.integrations.setup.manage` | Manage platform integrations | `platform.integrations.manage` |

---

### 2. Tenant Administration (`tenant.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `tenant.admin.dashboard.view` | View tenant admin dashboard | `tenant.dashboard.view` |
| `tenant.admin.settings.manage` | Manage tenant business settings | `tenant.settings.manage` |
| `tenant.outlets.management.view` | View outlets list and summary | `tenant.outlets.view` |
| `tenant.outlets.management.manage` | Manage tenant outlets | `tenant.outlets.manage` |
| `tenant.tills.management.view` | View tills list and summary | `tenant.tills.view` |
| `tenant.tills.management.create` | Create tills | `tenant.tills.create` |
| `tenant.tills.management.update` | Update tills | `tenant.tills.update` |
| `tenant.tills.management.delete` | Delete tills | `tenant.tills.delete` |
| `tenant.tills.management.manage` | Umbrella till management / device activation gate | `tenant.tills.manage`, `tenant.till.manage` |
| `tenant.tills.details.view` | View till details panel | `tenant.tills.details.view` |
| `tenant.tills.assignment.assign_outlet` | Assign till outlet | `tenant.tills.assign_outlet` |
| `tenant.devices.management.manage` | Manage POS devices | `tenant.devices.manage` |
| `tenant.hardware.management.view` | View hardware status, warnings, and alerts | `tenant.hardware.view` |
| `tenant.hardware.management.manage` | Register, edit, release hardware and run tests | `tenant.hardware.manage` |
| `tenant.users.management.manage` | Manage tenant staff users | `tenant.users.manage`, `tenant.user.manage` |
| `tenant.roles.management.manage` | Manage tenant roles and permissions | `tenant.roles.manage`, `tenant.role.manage` |
| `tenant.roles.permissions.view` | View tenant role permission assignments | `roles.permissions.view` |
| `tenant.roles.permissions.update` | Update tenant role permission assignments | `roles.permissions.update` |

---

### 3. Product Catalog & Pricing (`catalog.*`, `pricing.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `catalog.departments.master.view` | View departments list and details | `catalog.departments.view` |
| `catalog.departments.master.create` | Create departments | `catalog.departments.create` |
| `catalog.departments.master.update` | Update departments | `catalog.departments.update` |
| `catalog.departments.master.delete` | Delete/deactivate departments | `catalog.departments.delete` |
| `catalog.departments.master.manage` | Manage all department actions | `catalog.departments.manage` |
| `catalog.categories.master.view` | View product categories | `catalog.categories.view` |
| `catalog.categories.master.create` | Create product categories | `catalog.categories.create` |
| `catalog.categories.master.update` | Update product categories | `catalog.categories.update` |
| `catalog.categories.master.delete` | Delete/deactivate categories | `catalog.categories.delete` |
| `catalog.categories.master.manage` | Manage all category actions | `catalog.categories.manage` |
| `catalog.brands.master.view` | View brands | `catalog.brands.view` |
| `catalog.brands.master.create` | Create brands | `catalog.brands.create` |
| `catalog.brands.master.update` | Update brands | `catalog.brands.update` |
| `catalog.brands.master.delete` | Delete/deactivate brands | `catalog.brands.delete` |
| `catalog.brands.master.manage` | Manage all brand actions | `catalog.brands.manage` |
| `catalog.collections.master.view` | View collections | `catalog.collections.view` |
| `catalog.collections.master.create` | Create collections | `catalog.collections.create` |
| `catalog.collections.master.update` | Update collections | `catalog.collections.update` |
| `catalog.collections.master.delete` | Delete/deactivate collections | `catalog.collections.delete` |
| `catalog.collections.master.manage` | Manage all collection actions | `catalog.collections.manage` |
| `catalog.return_policies.master.view` | View tenant return policies | `catalog.return_policies.view` |
| `catalog.return_policies.master.create` | Create tenant return policies | `catalog.return_policies.create` |
| `catalog.return_policies.master.update` | Update tenant return policies | `catalog.return_policies.update` |
| `catalog.return_policies.master.delete` | Delete/deactivate tenant return policies | `catalog.return_policies.delete` |
| `catalog.return_policies.master.manage` | Manage all tenant return policy actions | `catalog.return_policies.manage` |
| `catalog.products.master.view` | View product list and details | `catalog.products.view` |
| `catalog.products.master.create` | Create product drafts | `catalog.products.create` |
| `catalog.products.master.update` | Update product drafts and fields | `catalog.products.update` |
| `catalog.products.master.delete` | Archive products | `catalog.products.delete` |
| `catalog.products.master.publish` | Publish completed product drafts | `catalog.products.publish` |
| `catalog.products.master.restore` | Restore archived products to inactive | `catalog.products.restore` |
| `catalog.products.master.duplicate` | Duplicate product settings to draft | `catalog.products.duplicate` |
| `catalog.products.import.execute` | Import products from CSV templates | `catalog.products.import` |
| `catalog.variants.options.manage` | Manage variant configurations & options | `catalog.variants.manage` |
| `catalog.barcodes.sku.manage` | Manage SKU and barcode identifiers | `catalog.barcodes.manage` |
| `catalog.media.images.manage` | Manage product images and media | `catalog.product_media.manage` |
| `catalog.pricing.overrides.manage` | Manage price list overrides | `catalog.product_pricing.manage` |
| `catalog.cost.sensitive.view` | View sensitive cost details | `catalog.product_cost.view` |
| `catalog.channels.visibility.manage` | Manage sales channel visibility matrix | `catalog.product_channels.manage` |
| `catalog.audit.history.view` | View standard product audit histories | `catalog.product_audit.view` |
| `catalog.audit.sensitive.view` | View sensitive product audit details | `catalog.product_audit_sensitive.view` |
| `catalog.combos.components.manage` | Manage bundle kits and combo component rules | `catalog.combo_components.manage` |
| `pricing.tax_classes.master.view` | View tax classes | `pricing.tax_classes.view`, `catalog.tax_classes.view` (deprecated) |
| `pricing.tax_rates.master.view` | View tax rates | `pricing.tax_rates.view` |
| `pricing.price_lists.master.view` | Read price list setups | `catalog.price_lists.view` |

---

### 4. Inventory Management (`inventory.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `inventory.stock.levels.view` | View stock levels and balance counts | `inventory.stock.view` |
| `inventory.stock.adjustments.adjust` | Adjust stock levels manually | `inventory.stock.adjust`, `inventory.adjust` |
| `inventory.movements.history.view` | View inventory movement history | `inventory.movements.view` |
| `inventory.alerts.stock.view` | View low stock and expiry stock alerts | `inventory.alerts.view` |

---

### 5. Cashier & POS Operations (`pos.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `pos.sales.dashboard.view` | View POS home dashboard and metrics | `pos.home.view`, `pos.dashboard.view` |
| `pos.sales.new_sale.view` | Access New Sale route and catalog surface | `pos.new_sale.view` |
| `pos.sales.new_sale.create` | Initiate sale transaction | `sales.create`, `pos.sale.start`, `pos.sale.create` |
| `pos.sales.catalog.view` | View sellable products in POS grid | `products.view` |
| `pos.sales.catalog.search` | Use product search & scanner lookup | `products.search` |
| `pos.sales.cart.manage` | Manage cart (umbrella alias) | `sales.cart.manage` |
| `pos.sales.cart.add_item` | Add item line to POS cart | `sales.cart.add_item` |
| `pos.sales.cart.update_item` | Update item quantity / modifiers / note | `sales.cart.update_item` |
| `pos.sales.cart.remove_item` | Remove item line from cart | `sales.cart.remove_item` |
| `pos.sales.cart.clear` | Clear entire active cart | `sales.cart.clear` |
| `pos.sales.checkout.execute` | Proceed to Payment / execute checkout | `sales.checkout` |
| `pos.sales.manual_discount.apply` | Validate, apply, and cancel manual discount | `sales.discount.apply`, `pos.discount.apply` |
| `pos.sales.discount.approve` | Approve discount exceeding authority (deferred) | `sales.discount.approve` |
| `pos.sales.held_sales.create` | Park active cart / cancel parked sale | `sales.park.create`, `pos.sale.park` |
| `pos.sales.held_sales.view` | View active held/parked sales list & count | `sales.park.view`, `pos.sale.park.view` |
| `pos.sales.held_sales.recall` | Recall eligible held/parked sale to cart | `sales.park.recall`, `pos.sale.recall` |
| `pos.sales.order_history.view` | View completed sale summary and lines | `sales.view` |
| `pos.payments.cash.accept` | Accept cash payment in payment sheet | `payments.cash.accept` |
| `pos.payments.card.accept` | Accept card payment (placeholder route) | `payments.card.accept` |
| `pos.payments.qr.accept` | Accept QR / mobile payment (placeholder route) | `payments.qr.accept` |
| `pos.payments.split.accept` | Accept split payment (placeholder route) | `payments.split.accept` |
| `pos.receipts.digital.view` | View payment success / email receipt screen | `receipts.view` |
| `pos.receipts.physical.print` | Print physical receipt | `receipts.print`, `pos.receipt.print` |
| `pos.receipts.history.reprint` | Authorized Receipt History reprint with audit | `receipts.reprint` |
| `pos.orders.history.view` | View historical order history list | `orders.view` |
| `pos.customers.management.view` | View customers list and checkout customer picker | `customers.view`, `pos.customers.view` |
| `pos.customers.management.create` | Create new customer from POS | `customers.create`, `pos.customers.create` |
| `pos.customers.management.update` | Edit customer details from POS | `customers.update`, `pos.customers.update` |
| `pos.returns.search_sale.view` | Search original sale and view returns entry | `returns.view` |
| `pos.returns.workflow.create` | Proceed with return item inspection & draft | `returns.create` |
| `pos.refunds.processing.view` | View refund calculation and details | `refunds.view` |
| `pos.refunds.processing.create` | Complete refund settlement branch | `refunds.create`, `pos.refund.process` |
| `pos.refunds.approval.approve` | Approve exception refund requiring manager review | `pos.refund.approve` |
| `pos.exchanges.processing.view` | View exchange replacements and details | `exchanges.view` |
| `pos.exchanges.processing.create` | Complete exchange settlement branch | `exchanges.create`, `pos.exchange.process` |
| `pos.cash_drawer.position.view` | View till cash drawer position & balance | `cash_drawer.view` |
| `pos.cash_drawer.physical.manage` | Physical / manual trigger open cash drawer | `cash_drawer.manage` |
| `pos.cash_drawer.movements.create` | Record Cash In, Cash Out, and Cash Drop | `cash_drawer.movement.create`, `pos.cash.movement` |
| `pos.till.session.open` | Open till session with opening float | `pos.till.open` |
| `pos.till.session.close` | Close till session / End Shift with cash count | `pos.till.close` |
| `pos.till.session.view` | View top bar / header till session status | `till.session.view`, `pos.till.view` |
| `pos.hardware.local_agent.settings` | Configure & test Local Print Agent hardware | `pos.hardware.settings` |
| `pos.notifications.alerts.view` | View notification bell alerts | `notifications.view` |

---

### 6. Commerce & Click & Collect (`commerce.*`)

| Canonical 4-Tier Permission Code | Meaning / Surface | Legacy / Deprecated Alias |
|---|---|---|
| `commerce.online_order.orders.access` | Enter staff Online Orders capability | `pos.online_orders.manage` |
| `commerce.online_order.orders.view` | List and view online store orders | `orders.view` (in commerce context) |
| `commerce.online_order.orders.cancel` | Cancel online order when lifecycle permits | `orders.cancel` |
| `commerce.online_order.fulfilment.start` | Start order fulfilment process | `fulfillment.orders.manage` |
| `commerce.online_order.picking.view` | View order picking queue and items | `pos.online_orders.picking.view` |
| `commerce.online_order.picking.pick` | Pick quantity for order lines | `pos.online_orders.picking.pick` |
| `commerce.online_order.picking.scan` | Use barcode scanner during picking | `pos.online_orders.picking.scan` |
| `commerce.online_order.picking.manual_entry` | Use manual barcode entry during picking | `pos.online_orders.picking.manual_entry` |
| `commerce.online_order.picking.report_issue` | Record issue on picking line | `pos.online_orders.picking.report_issue` |
| `commerce.online_order.packing.view` | View order packing screen | `pos.online_orders.packing.view` |
| `commerce.online_order.packing.pack` | Create and complete package | `pos.online_orders.packing.pack` |
| `commerce.online_order.collection.mark_ready` | Mark package ready for customer collection | `pos.online_orders.collection.mark_ready` |
| `commerce.online_order.collection.notify_customer` | Dispatch ready-for-pickup notification | `pos.online_orders.collection.notify` |
| `commerce.online_order.collection.view_ready` | View collection ready queue | `pos.online_orders.collection.view` |
| `commerce.online_order.collection.scan_qr` | Scan customer collection QR code | `pos.online_orders.collection.scan_qr` |
| `commerce.online_order.collection.validate_qr` | Validate collection QR token server-side | `pos.online_orders.collection.validate_qr` |
| `commerce.online_order.collection.manual_lookup` | Perform manual collection lookup by order ID | `pos.online_orders.collection.lookup` |
| `commerce.online_order.collection.verify_items` | Verify package items with customer | `pos.online_orders.collection.verify` |
| `commerce.online_order.collection.handover` | Confirm physical handover of collection | `pos.online_orders.collection.handover` |
| `commerce.online_order.collection.collect` | Finalize collected state in database | `pos.online_orders.collection.collect` |
| `commerce.online_order.payment.accept_cash` | Accept pay-on-collection cash payment | `payments.cash.accept` (in collection context) |
| `commerce.online_order.payment.retry` | Retry failed collection payment | `pos.online_orders.payment.retry` |

---

## Migration & Deprecation Strategy

1. **Seed Data Normalization:** Database migrations must insert canonical 4-tier rows into `permission_definitions`.
2. **Backward Compatibility Aliasing:** During the client transition phase, authorization handlers and Flutter helper classes (`PosPermissionAccess`) may map legacy codes (2-tier/3-tier) to their canonical 4-tier counterparts.
3. **No Duplicate Database Rows:** Do not insert duplicate database permission rows for legacy aliases. Aliases are handled strictly in the application translation layer.
4. **Deprecation Status:** All legacy 2-tier and 3-tier codes listed in the tables above are formally designated as **Deprecated / Migration Reference Only**.

---

## Related Files

- [[CANONICAL_PERMISSION_AND_FEATURE_ENTITLEMENT_CONTRACT_R1]]
- [[Backend_Driven_Permission_Catalog]]
- [[Access_Control_Overview]]
- [[API_Authorization_Rules]]
- [[../13_DECISIONS_AND_CHANGES/ADR/ADR_007_Permission_Code_Strategy]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Permission_Based_UI_Rendering]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Routing_Guards]]
- [[../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]]
- [[../06_DATABASE_KNOWLEDGE/Tables/06_Tenant_Users_Roles_Permissions_And_Outlet_Access_UPDATED]]
