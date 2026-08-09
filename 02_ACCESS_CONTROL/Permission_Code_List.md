<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-09 -->

# Permission Code List

## Purpose

This file defines the Release 1 permission-code strategy.

The database `permissions` and `platform_permissions` tables are the source of
truth.

The catalog hierarchy (module → feature → permission) is seeded in
`platform_modules`, `platform_features`, and the permission tables, then
exposed through backend catalog APIs. Frontends must not duplicate this tree in
code. See [[Backend_Driven_Permission_Catalog]].

Code constants are only safe references for API attributes, services, seed data,
and tests.

## Permission Code Rule

Do not create one large `PermissionCode` enum.

Do not place permission codes inside generic `Domain/Enums`.

Platform Admin uses **Option A** permission strategy (OneVerz POS MVP):

- Plural domain codes for tenant lifecycle, users, settings, billing, audit, dashboard.
- **Granular action codes** for subscription plans, platform roles, and permission catalog (already implemented in backend and Angular).
- Do **not** collapse implemented granular codes into umbrella codes such as `platform.subscriptions.manage`.
- Do **not** use legacy singular codes such as `platform.tenant.create`.

Use module-wise static constants inside the Domain module folder for permission
code references.

### Platform dashboard and tenants

| Code | Meaning |
|---|---|
| platform.dashboard.view | View platform dashboard |
| platform.tenants.view | View tenant list, summary, filters |
| platform.tenants.create | Create tenant |
| platform.tenants.update | Update tenant profile/setup |
| platform.tenants.activate | Activate tenant |
| platform.tenants.suspend | Suspend tenant |
| platform.tenants.entitlements.update | Assign or update tenant feature entitlements |
| platform.tenant_subscriptions.view | View tenant subscriptions (subscription lifecycle + dashboard subscription widgets) |

#### Platform Dashboard page vs widget permissions

Page access and widget data/destination access are separate.

| Surface | Required permission | Notes |
|---|---|---|
| Open `/admin/dashboard` / call dashboard API / R1 basic System Health summary | `platform.dashboard.view` | Broad category: Platform User; actor: Platform Admin. Roles do not bypass this code. |
| Tenant metrics / attention / Recent Tenants data and navigation | `platform.tenants.view` | Without it: non-sensitive summary only if allowed; **disable** navigation (no dead-end 403). |
| MRR, Pending Billing, Past Due commercial values; open Billing | `platform.billing.view` | Without it: **hide** sensitive commercial widgets/values and links. |
| Platform Users footprint count / nav | `platform.users.view` | Distinct from tenant-user count (`totalUsers`). |
| Tenant subscription metric widgets (Active Paid / Trial / Past Due / trend / subscription navigation) | `platform.tenant_subscriptions.view` | Subscription lifecycle + subscription summary widgets and subscription-aware navigation are protected by this permission. MRR additionally requires `platform.billing.view` (§14). |

Default role assignment for `platform.tenant_subscriptions.view` (approved; **Partially Implemented** — Super Administrator seed/migration present; FE gating incomplete):

| Platform Role | Default Assignment |
|---|---|
| Super Administrator (`super_administrator`) | Grant (by default once seeded) |
| Billing Admin | Explicit assignment only |
| Support Admin | Explicit assignment only |
| Custom platform roles | Explicit assignment only |

Runtime authorization remains permission-based, not role-name-based. Do not mark SA-DASH-GAP-13 Completed and Verified until Frontend gating, omit/hide semantics, and E2E tests pass.

Full matrix and gaps: [[03_USER_JOURNEYS/Platform_Admin/02_Platform_Dashboard_Flow]] §14 / SA-DASH-GAP-13. Audit: [[15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-29-platform-dashboard/Platform_Dashboard_Second_Brain_Gap_Completion_Audit]].

### Platform subscription plans (granular — implemented)

| Code | Meaning |
|---|---|
| platform.subscription_plans.view | View subscription plans |
| platform.subscription_plans.create | Create draft plan |
| platform.subscription_plans.edit | Edit/publish draft plan |
| platform.subscription_plans.duplicate | Duplicate plan |
| platform.subscription_plans.archive | Archive/retire plan |
| platform.subscription_plans.delete | Delete draft plan |

`platform.subscription_plans.edit` also authorizes publishing an eligible
draft. `platform.subscription_plans.archive` authorizes both archiving an
active plan and reactivating an archived plan; there is no separate live
reactivate permission code.

### Platform return-policy templates

| Code | Meaning |
|---|---|
| platform.return_policy_templates.view | View platform return policy templates |
| platform.return_policy_templates.create | Create platform return policy templates |
| platform.return_policy_templates.update | Update platform return policy templates |
| platform.return_policy_templates.delete | Delete platform return policy templates |
| platform.return_policy_templates.manage | Manage all platform return policy template actions |

### Platform catalog (granular — implemented)

| Code | Meaning |
|---|---|
| platform.permissions.view | View permission catalog tree |
| platform.modules.view | View modules catalog |
| platform.features.view | View features catalog |

### Platform roles (granular — implemented)

| Code | Meaning |
|---|---|
| platform.roles.view | View platform roles |
| platform.roles.create | Create platform roles |
| platform.roles.update | Update platform role metadata |
| platform.roles.permissions.view | View role permission assignments |
| platform.roles.permissions.update | Replace role permission assignments |

### Platform users, settings, billing, audit, integrations

| Code | Meaning |
|---|---|
| platform.users.view | View platform users |
| platform.users.create | Create platform users |
| platform.users.update | Update platform users |
| platform.users.roles.assign | Assign platform roles to users |
| platform.settings.view | View platform settings |
| platform.settings.update | Update platform settings |
| platform.billing.view | View tenant billing |
| platform.billing.manage | Manage current billing mutations; reserved for payment-link management when that capability is implemented |
| platform.audit.view | View platform audit logs |
| platform.integrations.manage | Manage platform integrations |

#### Platform Billing page and action mapping

This table describes the current implemented Platform Admin Billing surface.

| Page or Action | Required Permission |
|---|---|
| View Billing menu | `platform.billing.view` |
| Open Billing page | `platform.billing.view` |
| View summary | `platform.billing.view` |
| View invoices | `platform.billing.view` |
| View invoice details | `platform.billing.view` |
| View payment history | `platform.billing.view` |
| Issue invoice | `platform.billing.manage` |
| Mark invoice paid | `platform.billing.manage` |

Angular menu, route, and action visibility are UX enforcement only. The backend
must enforce the applicable permission on every Billing request.

Exact current endpoints and lifecycle rules are documented in
[[../05_BACKEND_ARCHITECTURE/Platform_Billing_API_Contract]].

### Deprecated platform codes (do not seed or use)

| Code | Replacement |
|---|---|
| platform.tenant.create | platform.tenants.create |
| platform.tenant.update | platform.tenants.update |
| platform.tenant.activate | platform.tenants.activate |
| platform.subscription.manage | platform.subscription_plans.* |
| platform.feature.entitle | platform.features.view / platform.tenants.entitlements.update |

### Super Administrator seed expectation

Development role `super_administrator` should receive all **36** codes exposed by
`PlatformPermissionCodes.All` when the platform admin permission foundation is
fully seeded, plus bootstrap `platform.admin.access` for login routing.

Angular Platform Admin static `platformPermissions` lists **36** codes including
all five `platform.return_policy_templates.*` codes guarded on routes, menus, and
actions. See [[SA-P1-04_Return_Policy_Template_UI_Implementation]] and
[[Platform_Admin_Permission_Catalogue_Alignment]].

Do not generate C# enum classes for database status/type/check-value columns.
Those Domain properties remain strings, while allowed values are enforced through
Application validation and database CHECK constraints. Permission catalog values
must be seeded and stored in the database.
## Tenant Admin Permissions

| Code | Meaning |
|---|---|
| tenant.dashboard.view | View tenant dashboard |
| tenant.settings.manage | Manage tenant settings |
| tenant.outlets.view | View outlets |
| tenant.outlets.manage | Manage outlets |
| tenant.tills.view | View tills |
| tenant.tills.create | Create tills |
| tenant.tills.update | Update tills |
| tenant.tills.delete | Delete tills |
| tenant.tills.manage | Manage all till actions |
| tenant.devices.manage | Manage POS devices |
| tenant.hardware.manage | Manage hardware profiles/devices |
| tenant.users.manage | Manage tenant users |
| tenant.roles.manage | Manage roles and permissions |

## Code Ownership Pattern

| Module | Constant File |
|---|---|
| Platform | `PlatformPermissionCodes.cs` |
| Tenant | `TenantPermissionCodes.cs` |
| Catalog | `CatalogPermissionCodes.cs` |
| Inventory | `InventoryPermissionCodes.cs` |
| Discounts | `DiscountPermissionCodes.cs` |
| Sales | `SalesPermissionCodes.cs` |
| Returns | `ReturnsPermissionCodes.cs` |
| Customer | `CustomerPermissionCodes.cs` |
| Loyalty (future/deferred; not Release 1) | `LoyaltyPermissionCodes.cs` |
| Reports | `ReportPermissionCodes.cs` |
| Hardware | `HardwarePermissionCodes.cs` |

## Confirmed Example Codes

| Area | Permission Code | Usage |
|---|---|---|
| Platform | `platform.tenants.create` | Create tenant |
| Catalog | `catalog.product.create` | Create product |
| Catalog | `catalog.product.update` | Update product |
| Inventory | `inventory.adjust` | Adjust stock |
| Sales | `pos.sale.create` | Create POS sale |
| Sales | `pos.sale.discount.apply` | Apply discount |
| Refund | `pos.refund.approve` | Approve refund |
| Loyalty (future/deferred; not Release 1) | `loyalty.redeem` | Reserved future code; not a Release 1 Cashier Customer Management permission |
| Platform catalog | `platform.permissions.view` | View platform permission catalog (Angular `/admin/roles-permissions`) |
| Tenant roles | `roles.permissions.view` | View tenant permission catalog and role assignments |
| Tenant roles | `roles.permissions.update` | Update role permission assignments |

## Alias Rule

Canonical seeded codes remain authoritative. Newer or plural alias names may be
accepted in the application layer for compatibility. Do not insert duplicate
permission rows for aliases.

## Required Permission Groups

| Group | Scope |
|---|---|
| Platform | Tenant, subscription, entitlement, audit |
| Tenant | Tenant profile and setup |
| User/role | Users, roles, permissions |
| Outlet | Outlet management and assignment |
| Till | Till setup, activation code, session |
| Device | Pairing, trust, hardware testing |
| Catalog | Product, category, variant, import |
| Inventory | Stock, adjustment, stocktake, expiry |
| Discount | Product, POS, approval, expiry |
| Sales | Sale, park, recall, complete, void |
| Payment | Payment capture and allocation |
| Receipt | Generate, print, reprint |
| Return/refund | Return, refund, approval |
| Exchange | Exchange creation and completion |
| Loyalty (future/deferred; not Release 1) | Reserved earn, redeem, and membership architecture only |
| Reports | Dashboard, report, export |
| Cash drawer | Cash in/out and till close |

## Platform Examples

| Code Pattern | Meaning |
|---|---|
| `platform.tenants.create` | Create tenant |
| `platform.tenants.update` | Update tenant setup |
| `platform.tenants.activate` | Activate tenant |
| `platform.subscription_plans.*` | Granular subscription-plan lifecycle actions |
| `platform.tenants.entitlements.update` | Assign tenant feature entitlement |
| `platform.audit.view` | View audit logs |

## Subscription Plans (Implemented 2026-06-17)

| Code | Meaning |
|---|---|
| `platform.subscription_plans.view` | View subscription plans list and detail |
| `platform.subscription_plans.create` | Create subscription plans |
| `platform.subscription_plans.edit` | Edit and publish draft subscription plans |
| `platform.subscription_plans.duplicate` | Duplicate subscription plans |
| `platform.subscription_plans.archive` | Archive or reactivate subscription plans |
| `platform.subscription_plans.delete` | Delete eligible unused draft plans |

## Catalog and Inventory Codes Present in the Current Permission Catalog

| Code | Meaning |
|---|---|
| catalog.departments.view | View departments |
| catalog.departments.create | Create departments |
| catalog.departments.update | Update departments |
| catalog.departments.delete | Delete/deactivate departments |
| catalog.departments.manage | Manage all department actions |
| catalog.categories.view | View categories |
| catalog.categories.create | Create categories |
| catalog.categories.update | Update categories |
| catalog.categories.delete | Delete/deactivate categories |
| catalog.categories.manage | Manage all category actions |
| catalog.brands.view | View brands |
| catalog.brands.create | Create brands |
| catalog.brands.update | Update brands |
| catalog.brands.delete | Delete/deactivate brands |
| catalog.brands.manage | Manage all brand actions |
| catalog.collections.view | View collections |
| catalog.collections.create | Create collections |
| catalog.collections.update | Update collections |
| catalog.collections.delete | Delete/deactivate collections |
| catalog.collections.manage | Manage all collection actions |
| catalog.return_policies.view | View tenant return policies |
| catalog.return_policies.create | Create tenant return policies |
| catalog.return_policies.update | Update tenant return policies |
| catalog.return_policies.delete | Delete/deactivate tenant return policies |
| catalog.return_policies.manage | Manage all tenant return policy actions |
| catalog.products.view | View products |
| catalog.products.create | Create product drafts |
| catalog.products.update | Update product drafts/fields |
| catalog.products.delete | Archive products |
| catalog.products.publish | Publish completed drafts to POS/storefront |
| catalog.products.restore | Restore archived products to inactive |
| catalog.products.duplicate | Duplicate product settings to draft |
| catalog.products.import | Import products from CSV templates |
| catalog.variants.manage | Manage variant configuration combinations |
| catalog.barcodes.manage | Manage SKU and barcode identifiers |
| catalog.product_media.manage | Manage product images and uploads |
| catalog.product_pricing.manage | Manage price lists and overrides |
| catalog.product_cost.view | View sensitive cost details |
| catalog.product_channels.manage | Manage channel visibility matrices |
| catalog.product_audit.view | View standard product audit histories |
| catalog.product_audit_sensitive.view | View sensitive product audit details |
| catalog.bundle_components.manage | Manage bundle kits and component rules |
| catalog.tax_classes.view | Read tax classes |
| catalog.price_lists.view | Read price list setups |
| inventory.stock.view | View stock levels |
| inventory.stock.adjust | Adjust stock |
| inventory.movements.view | View movement history |
| inventory.alerts.view | View low/expiry stock alerts |

Only confirmed platform actions should be seeded.

## Tenant Examples

| Code Pattern | Meaning |
|---|---|
| `tenant.outlet.manage` | Manage outlets |
| `tenant.till.manage` | Manage tills |
| `tenant.user.manage` | Manage users |
| `tenant.role.manage` | Manage roles |
| `tenant.permission.manage` | Manage permissions |
| `tenant.product.import` | Import products |

Exact seed list must be reviewed against UI journeys before production seeding.

## Tenant Admin Catalog Verification 2026-06-23

Final verification found that `sales.*` permissions were assigned to the
development `tenant_admin_dev` role but were not linked to the tenant-admin
`sales` catalog feature. Migration
`20260623103000_LinkTenantAdminSalesPermissions` links these codes to the
correct feature so role-permission saves can pass entitlement validation.

Verified through real backend APIs, not mock data:

- Tenant Admin catalog returned 5 modules and 99 permissions.
- `tenant_admin_dev` returned 84 assigned permissions.
- `activity.view` was removed with `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`.
- `activity.view` was restored with the same PUT endpoint.
- Search codes `role.view`, `roles.permissions.view`, and `outlet.view` were present.

## POS Examples

| Code Pattern | Meaning |
|---|---|
| `pos.sale.create` | Start sale |
| `pos.sale.complete` | Complete sale |
| `pos.sale.park` | Legacy / demoted — use `sales.park.create` |
| `pos.sale.recall` | Legacy / demoted — use `sales.park.recall` |
| `pos.sale.discount.apply` | Apply POS discount |
| `pos.payment.capture` | Take payment |
| `pos.receipt.print` | Print receipt |
| `pos.cash.movement` | Cash in/out |

## POS New Sale Codes (Seeded + Used in Flutter)

These codes are seeded in `DevelopmentPosNewSalePermissionsSeedData` plus
`DevelopmentPosPaymentReceiptPermissionsSeedData` and referenced
in `lib/core/access/pos_access_codes.dart` for cashier New Sale UI.

| Code | Flutter usage |
|---|---|
| `pos.home.view` | POS home route and sidebar |
| `pos.dashboard.view` | POS home route/sidebar alias |
| `pos.new_sale.view` | New Sale route and sidebar |
| `sales.create` | New Sale route/sidebar alias |
| `products.view` | Product grid |
| `products.search` | Top-bar search on New Sale |
| `sales.cart.manage` | Add/update/remove/clear cart alias |
| `sales.cart.add_item` | Add product to cart |
| `sales.cart.update_item` | Change cart quantity |
| `sales.cart.remove_item` | Remove cart line |
| `sales.cart.clear` | Clear cart |
| `customers.view` | Customers nav / action visibility |
| `customers.create` | Create customer from POS/Customer Management. Approved for the normal Cashier New Sale flow, but the current definition/role seed was removed and must be restored before checkout Add Customer can be enabled. **APPROVED REQUIREMENT — IMPLEMENTATION/PERMISSION SEED FIX PENDING.** |
| `customers.update` | Edit customer on POS Customer Management (`77777777-0338-4000-8000-000000000001`; Cashier seed assignment) |
| `sales.discount.apply` | Current Release MANUAL list/context, validate, apply and cancel; offline snapshot is provisional |
| `sales.discount.approve` | Existing/deferred approval capability; not used by current Cashier Discount flow |
| `sales.park.create` | Create Park Sale; also authorizes cancel (no separate cancel code) |
| `sales.park.view` | View active Parked Sales and home/list count |
| `sales.park.recall` | Recall an eligible Parked Sale |
| `sales.checkout` | Proceed to Payment button |
| `payments.cash.accept` | Cash in payment sheet |
| `payments.card.accept` | Show Card method when granted; current payment route is still a placeholder |
| `payments.qr.accept` | Show QR method when granted; current payment route is still a placeholder |
| `payments.split.accept` | Show Split method when granted; current payment route is still a placeholder |
| `sales.view` | Completed payment sale summary and line items |
| `receipts.view` | Payment success / email receipt access |
| `receipts.print` | Print receipt screen and print action |
| `receipts.reprint` | Authorized Receipt History reprint with reason/audit |
| `orders.view` | Orders sidebar (no route yet) |
| `returns.view` | Returns & Exchanges nav, Step 1 Search Original Sale, shared early Returns workflow |
| `returns.create` | Continue from Step 1 into Step 2 Sale Summary and later shared create steps |
| `refunds.view` / `exchanges.view` | Branch view only; do not unlock shared Step 1 search |
| `refunds.create` / `exchanges.create` | Branch processing after resolution is selected |
| `cash_drawer.view` / `cash_drawer.manage` | Cash drawer nav |
| `cash_drawer.movement.create` | Create authorized Cash In/Out movement when backend flow exists |
| `notifications.view` | Notification bell |
| `pos.till.open` | Till open flow (`canOpenPosTill`) |
| `pos.till.close` | End Shift / close currently assigned open till session |
| `pos.hardware.settings` | Configure/test Local Print Agent for the activated POS device |
| `tenant.till.manage` | Device activation gate (`canActivatePosDevice`) |
| `till.session.view` | Home header till status chip |

Park/Recall: canonical trio `sales.park.create|view|recall` is required for
Flutter home and New Sale Park actions. Legacy `pos.sale.park*` aliases are
demoted and must not authorize those UI paths. Seed/catalogue evidence
(2026-08-06): definitions present in `DevelopmentPosNewSalePermissionsSeedData`,
Cashier assignment, and seed tests.
`sales.park.view` also covers the read-only View action; `sales.create` protects
Start New Sale. No `sales.park.cancel` is approved. Screen mapping:
[[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Parked_Sales_Recall_Screen_Implementation_Specification]].

Implementation map: [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]].

POS permission alone is not enough; device and till-session checks still apply.

Receipt printing and hardware configuration are separate:
`receipts.print` protects printing, while `pos.hardware.settings` protects the
activated-device Local Print Agent settings/testing surface.

Permission visibility does not prove implementation. In particular,
`cash_drawer.manage` currently gates Flutter surfaces without verified drawer
pulse execution. `pos.hardware.settings` exists, but backend hardware-test-log
persistence is not wired. No distinct merchant-copy or sensitive-reprint
permission is approved; do not invent one.

## Seed Data Rule

Seeded permissions must match database codes, module constants, role-permission
setup, API authorization attributes, UI checks, and test cases.

Never rename a permission code casually after development starts.

## Related Files

- [[Backend_Driven_Permission_Catalog]]
- [[Access_Control_Overview]]
- [[Feature_Entitlement_Matrix]]
- [[API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]]
- [[../06_DATABASE_KNOWLEDGE/Tables/Permissions]]


## Tenant Admin Till / Hardware Permission Alignment (2026-08-01)

Seeded / Backend constants (migration `SeedTenantAdminTillHardwarePermissions` + `TenantAdminTillPermissions`):

| Code | Meaning |
|---|---|
| `tenant.tills.view` | View tills / summary / list |
| `tenant.tills.create` | Create tills |
| `tenant.tills.update` | Update tills |
| `tenant.tills.delete` | Delete tills |
| `tenant.tills.manage` | Manage umbrella |
| `tenant.tills.details.view` | View till details panel |
| `tenant.tills.assign_outlet` | Assign till outlet |
| `tenant.hardware.view` | View hardware connections/status/warnings/alerts |
| `tenant.hardware.manage` | Register/edit/assign/release hardware; initiate supported tests |

**Note:** The Tenant Admin Permissions table above previously listed only `tenant.hardware.manage`. `tenant.hardware.view`, `tenant.tills.details.view`, and `tenant.tills.assign_outlet` are confirmed seeded codes and must be treated as canonical.

Feature entitlement for till management APIs: **`till_management`** (see platform module catalog seed). Peripheral capability may also be gated by **`device_hardware`**.

Hardware-denied users must still view permitted Till list/summary; show hardware-restricted state instead of failing the whole page.
