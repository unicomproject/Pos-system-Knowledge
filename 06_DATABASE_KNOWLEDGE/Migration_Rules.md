<!-- title: Migration Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-23 -->


# Migration Rules

## Purpose

This file defines Release 1 database migration rules for SCS-TIX EPOS.

Migrations must preserve tenant isolation, append-only ledgers, and predictable
reference data.

## Migration Principle

A migration must be safe, repeatable, reviewable, and aligned with the updated
Release 1 database design.

Do not introduce Release 2 active behavior in Release 1 migrations.

## Migration Content

A Release 1 migration may include table creation, column creation, primary keys,
foreign keys, tenant-aware unique indexes, check constraints, seed reference
data, platform modules/features/permissions, and safe default values.

## Required Constraints

Use constraints for status values, payment method codes, discount type/scope
codes, movement direction, positive quantities, non-negative monetary totals,
tenant-aware uniqueness, and one open till session per tenant/till.

Status/type/check-value columns must be implemented as varchar/text columns with
database CHECK constraints. Do not require matching C# enum classes in the
Domain layer for these values; Domain models keep string properties and
Infrastructure owns the CHECK constraint mapping.

## Hash Storage Rule

Never store raw tokens/codes.

Migrations and seed data must support hash columns for setup tokens, invite
tokens, password reset tokens, refresh tokens, payment links, till activation
codes, and session token hashes.

## Append-Only Tables

| Table | Reason |
|---|---|
| `audit_logs` | Business audit trail |
| `stock_movements` | Inventory ledger |
| `loyalty_transactions` | Points ledger |
| `customer_credit_transactions` | Store-credit ledger |
| `tenant_subscription_history` | Subscription lifecycle history |

Do not add normal update/delete workflows for append-only rows.

## Seed Data Warning

Do not seed tenant-specific production data.

Do not seed real passwords, raw tokens, activation codes, provider secrets, card
data, or real AWS/payment credentials.

## Migration Review Checklist

- Tenant-owned table has `tenant_id`.
- Foreign keys are present.
- Tenant-aware unique indexes are present.
- Check constraints match database design.
- No Release 2 active module was added.
- Sensitive data is stored as hash/reference only.
- Table and column names match updated database design.

## Development Seed SQL Rules (Verified 2026-06-17)

For development-only data migrations such as `20260613120000_SeedDevelopmentPosActivationData`:

1. Guard with `ASPNETCORE_ENVIRONMENT=Development` only.
2. Bootstrap prerequisite tenant/users before role assignment inserts.
3. Prefer `INSERT ... SELECT ... JOIN` over scalar subqueries in `VALUES`.
4. If a join target is missing, insert zero rows instead of NULL FK values.
5. Include all NOT NULL columns in seed inserts (`is_system` on `platform_roles`, etc.).
6. Match partial unique indexes in `ON CONFLICT` clauses exactly.

Fixed issue: `tenant_user_roles.user_id` NULL when auth users were missing or subqueries returned NULL.

## Permission Catalog Migrations (Verified 2026-06-18)

| Migration | Purpose |
|---|---|
| `20260620120000_AddPermissionCatalogHierarchyColumns` | Additive hierarchy/display columns on existing catalog tables |
| `20260620120100_SeedPermissionCatalogRelease1` | Seed Release 1 module → feature → permission catalog |
| `20260623103000_LinkTenantAdminSalesPermissions` | Correct already-migrated databases by linking tenant-admin `sales.*` permissions to the `sales` feature |

Rules:

- Additive only; do not create duplicate catalog tables.
- Preserve existing permission codes as canonical.
- If a seed helper changes after its migration already ran, add a corrective migration for existing databases.
- See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]].

Final verification note:

- Migration `20260623103000_LinkTenantAdminSalesPermissions` was needed because `tenant_admin_dev` had `sales.*` permissions assigned, but those permissions were outside the entitlement-filtered catalog.
- Backend build passed and the migration applied successfully.
- Real API save verification passed by toggling `activity.view` off and back on through `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`.

## Related Files

- [[Database_Overview]]
- [[Tenant_Id_Rules]]
- [[Table_Naming_Standards]]
- [[../05_BACKEND_ARCHITECTURE/Seed_Data_Standards]]
