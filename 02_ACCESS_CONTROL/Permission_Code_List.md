<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-23 -->

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

Use module-wise static constants inside the Domain module folder for permission
code references.

Do not generate C# enum classes for database status/type/check-value columns.
Those Domain properties remain strings, while allowed values are enforced through
Application validation and database CHECK constraints. Permission catalog values
must be seeded and stored in the database.

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
| Loyalty | `LoyaltyPermissionCodes.cs` |
| Reports | `ReportPermissionCodes.cs` |
| Hardware | `HardwarePermissionCodes.cs` |

## Confirmed Example Codes

| Area | Permission Code | Usage |
|---|---|---|
| Platform | `platform.tenant.create` | Create tenant |
| Catalog | `catalog.product.create` | Create product |
| Catalog | `catalog.product.update` | Update product |
| Inventory | `inventory.adjust` | Adjust stock |
| Sales | `pos.sale.create` | Create POS sale |
| Sales | `pos.sale.discount.apply` | Apply discount |
| Refund | `pos.refund.approve` | Approve refund |
| Loyalty | `loyalty.redeem` | Redeem loyalty points |
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
| Loyalty | Earn, redeem, membership |
| Reports | Dashboard, report, export |
| Cash drawer | Cash in/out and till close |

## Platform Examples

| Code Pattern | Meaning |
|---|---|
| `platform.tenant.create` | Create tenant |
| `platform.tenant.update` | Update tenant setup |
| `platform.tenant.activate` | Activate tenant |
| `platform.subscription.manage` | Manage subscription setup |
| `platform.feature.entitle` | Assign tenant feature entitlement |
| `platform.audit.view` | View audit logs |

## Subscription Plans (Implemented 2026-06-17)

| Code | Meaning |
|---|---|
| `platform.subscription_plans.view` | View subscription plans list |
| `platform.subscription_plans.create` | Create subscription plans |
| `platform.subscription_plans.edit` | Edit subscription plans |
| `platform.subscription_plans.duplicate` | Duplicate subscription plans |
| `platform.subscription_plans.archive` | Archive subscription plans |
| `platform.subscription_plans.delete` | Delete subscription plans |

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
| `pos.sale.park` | Park sale |
| `pos.sale.recall` | Recall sale |
| `pos.sale.discount.apply` | Apply POS discount |
| `pos.payment.capture` | Take payment |
| `pos.receipt.print` | Print receipt |
| `pos.cash.movement` | Cash in/out |

## POS New Sale Codes (Seeded + Used in Flutter)

These codes are seeded in `DevelopmentPosNewSalePermissionsSeedData` and referenced
in `lib/core/access/pos_access_codes.dart` for cashier New Sale UI.

| Code | Flutter usage |
|---|---|
| `pos.home.view` | POS home route and sidebar |
| `pos.new_sale.view` | New Sale route and sidebar |
| `products.view` | Product grid |
| `products.search` | Top-bar search on New Sale |
| `sales.cart.add_item` | Add product to cart |
| `sales.cart.update_item` | Change cart quantity |
| `sales.cart.remove_item` | Remove cart line |
| `sales.cart.clear` | Clear cart |
| `customers.view` | Customers nav / action visibility |
| `customers.create` | Add customer button visibility |
| `sales.discount.apply` | Apply discount button (stub) |
| `sales.park.create` | Park sale button (stub) |
| `sales.checkout` | Proceed to Payment button |
| `payments.cash.accept` | Cash in payment sheet |
| `payments.card.accept` | Card in payment sheet |
| `payments.qr.accept` | QR in payment sheet |
| `payments.split.accept` | Split in payment sheet |
| `orders.view` | Orders sidebar (no route yet) |
| `returns.view` / `refunds.view` | Returns nav |
| `cash_drawer.view` | Cash drawer nav |
| `notifications.view` | Notification bell |
| `pos.till.open` | Till open flow (`canOpenPosTill`) |
| `tenant.till.manage` | Device activation gate (`canActivatePosDevice`) |
| `till.session.view` | Home header till status chip |

Implementation map: [[../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]].

POS permission alone is not enough; device and till-session checks still apply.

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

## Platform Role Management Codes (Implemented 2026-06-23)

| Code | Meaning |
|---|---|
| `platform.roles.view` | View platform roles |
| `platform.roles.create` | Create non-system platform roles |
| `platform.roles.update` | Update non-system platform role metadata |
| `platform.roles.permissions.view` | View platform role permission assignments |
| `platform.roles.permissions.update` | Replace non-system platform role permission assignments |

These codes are seeded under `platform_users` / `platform_role_management` and granted to `super_administrator` by `20260623120000_SeedPlatformRoleManagementPermissions`.

See [[Platform_Admin_Role_Management]].
