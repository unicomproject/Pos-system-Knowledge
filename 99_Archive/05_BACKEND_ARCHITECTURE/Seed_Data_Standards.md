<!-- title: Seed Data Standards -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->

# Seed Data Standards

## Purpose

This file defines seed data standards for SCS-TIX EPOS Release 1.

Seed data must support platform setup, permissions, features, reference values,
and safe development/testing.

## Seed Data Rule

Seed only Release 1-supported data.

Do not seed active Release 2 modules as usable Release 1 features.

Future/deferred catalog values must be clearly disabled or excluded if present.

## Seeded Data Areas

Release 1 may seed:

- Platform roles.
- Platform permissions.
- Platform modules.
- Platform features.
- Subscription plans.
- Subscription plan features.
- Tenant permissions.
- Payment method types.
- Discount types.
- Discount scopes.
- Stock movement types.
- Cash movement types.
- Return reason examples where tenant setup requires them.
- Default receipt template where required.
- Report type references where required.

## Permission Seed Rule

Permission seed data must match:

- `permissions.code`.
- `platform_permissions.code`.
- Module-wise permission constants.
- Role-permission assignments.
- API authorization checks.
- UI permission checks.
- Permission test cases.

Do not rename permission codes casually.

## Permission Catalog Seed (Verified 2026-06-18)

Migration `20260620120100_SeedPermissionCatalogRelease1` seeds Release 1 catalog
hierarchy through `PermissionCatalogSeedData`:

- Modules and features on `platform_modules` / `platform_features`.
- Tenant permissions on `permissions`.
- Platform permissions on `platform_permissions`.
- Existing canonical codes preserved; aliases handled in application layer only.

See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]].

## Feature Seed Rule

Feature seed data must align with Release 1 included features.

Do not enable e-commerce, offline sync, supplier management, delivery, kiosk,
coupon engine, AI, or accounting as active Release 1 features.

## Reference Data Rule

Reference data may use stable values from database design.

Examples:

| Reference | Example Values |
|---|---|
| Payment method types | cash, card, qr, store_credit |
| Discount types | percentage, fixed_amount, price_override |
| Discount scopes | product, variant, sale_line, bill, expiry |
| Cash movement types | cash_in, cash_out, safe_drop, float_add, paid_out |
| Sale statuses | draft, held, completed, voided, cancelled |

## Tenant Seed Rule

Production tenant data must not be hardcoded.

Demo or test tenants must be clearly separated from production seed data.

Tenant-specific products, users, outlets, tills, and inventory should not be
global seed data.

## Secret Rule

Never seed real secrets.

Do not seed:

- Real passwords.
- Raw setup links.
- Raw activation codes.
- Real payment provider keys.
- Real AWS secrets.
- Real card data.

Use hashes or safe placeholders only where required.

## Migration Rule

Seeds must be deterministic.

Do not create random values that break repeatable migrations or tests.

Document any seed dependency between modules.

## Development POS Activation Seed Dependency (Verified 2026-06-17)

`DevelopmentPosActivationSeedData` depends on:

| Dependency               | Source                                            |
| ------------------------ | ------------------------------------------------- |
| TENANT001 tenant         | `DevelopmentAuthSeedData.EnsureTenantAndUsersSql` |
| tenantadmin001@gmail.com | Tenant admin user                                 |
| manager001@gmail.com     | Manager user                                      |
| cashier001@gmail.com     | Cashier user                                      |
| cashier002@gmail.com     | Second cashier user                               |
| pos_operator_dev role    | Created in same POS activation seed               |

Rules:

- Bootstrap tenant/users at the start of POS activation seed when auth migration was skipped.
- Use `INSERT ... SELECT ... JOIN` for role/outlet/till rows; never insert NULL foreign keys.
- Match partial unique indexes in `ON CONFLICT`, e.g. `WHERE revoked_at IS NULL`.

## Related Files

- [[Backend_Coding_Principles]]
- [[Authorization_And_Permissions]]
- [[Multi_Tenant_Handling]]
- [[../02_ACCESS_CONTROL/Permission_Code_List]]

## Platform Role Management Seed (Verified 2026-06-23)

Migration `20260623120000_SeedPlatformRoleManagementPermissions` seeds the `platform_role_management` feature under `platform_users`, adds five Platform Admin role-management permissions, and grants them to `super_administrator`.

The same seed helper is used by the Development platform permission seeder so local startup stays aligned with migrated databases.
