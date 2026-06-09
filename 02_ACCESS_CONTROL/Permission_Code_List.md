<!-- title: Permission Code List -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Permission Code List

## Purpose

This file defines the Release 1 permission-code strategy.

The database `permissions` and `platform_permissions` tables are the source of
truth.

Code constants are only safe references for API attributes, services, seed data,
and tests.

## Permission Code Rule

Do not create one large `PermissionCode` enum.

Do not place permission codes inside generic `Domain/Enums`.

Use module-wise static constants inside the Domain module folder.

Stable business statuses may be enums. Permission catalog values must be seeded
and stored in the database.

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
| `pos.till.open` | Open till |
| `pos.till.close` | Close till |

POS permission alone is not enough; device and till-session checks still apply.

## Seed Data Rule

Seeded permissions must match database codes, module constants, role-permission
setup, API authorization attributes, UI checks, and test cases.

Never rename a permission code casually after development starts.

## Related Files

- [[Access_Control_Overview]]
- [[Feature_Entitlement_Matrix]]
- [[API_Authorization_Rules]]
- [[../05_BACKEND_ARCHITECTURE/Authorization_And_Permissions]]
- [[../06_DATABASE_KNOWLEDGE/Tables/Permissions]]
