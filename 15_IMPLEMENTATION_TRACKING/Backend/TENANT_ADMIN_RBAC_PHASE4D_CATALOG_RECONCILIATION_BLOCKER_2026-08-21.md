# Tenant Admin RBAC Catalog Reconciliation Blocker — 2026-08-21

## Status

`BLOCKED — NOT READY FOR PRODUCTION ROLE EDITING`

## Verified baseline

- The Tenant Admin role aggregate API routes are implemented, including setup
  options, permission catalog, role permissions, assignments, and atomic setup
  save.
- Tenant Admin setup options expose only `TENANT_ADMIN` and `CASHIER`.
- No Flutter or backend mutation was performed during the authenticated runtime
  validation that exposed this blocker.

## Blocking evidence

The authenticated Cashier role had 44 active persisted role-permission grants.
The authenticated Tenant Admin permission catalog returned no matching
permissions. The role-edit wizard therefore could not map those active grants
to selected modules or selected permissions.

## Required closure

1. Reconcile permission seeds, active permission definitions, feature
   entitlements, and delegation projection.
2. Ensure every active persisted role grant is assignable or explicitly locked
   and preserved during editing.
3. Reject any final-save request that would remove a catalog-invisible grant
   without an explicit authorized removal.
4. Add and execute PostgreSQL/API and authenticated UI regression coverage.

## Exit criterion

The seeded Cashier role can be loaded and saved by an authorized Tenant Admin
without silently losing any active permission grant.
