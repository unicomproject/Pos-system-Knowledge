<!-- title: Regression Checklist -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Regression Checklist

## Purpose

This file defines the backend regression checklist to run after changes that affect shared architecture, database mappings, auth, permissions, tenant handling, or critical workflows.

## Always Check

- Solution builds successfully.
- EF Core model and migrations are valid.
- No CQRS or MediatR pattern introduced.
- Controllers remain thin.
- Application services own workflow logic.
- Repository contracts and implementations are aligned.
- Tenant isolation still holds.
- Permission denied cases still return the expected response.
- Validation failures return the expected response format.
- Sensitive data is not logged or returned.

## Critical Flow Regression

Run targeted regression for changed areas:

| Area | Regression Focus |
|---|---|
| Auth | login/session/current user behavior |
| Tenant | tenant resolution, tenant status, cross-tenant access |
| AccessControl | role, permission, outlet access checks |
| CatalogProduct | create/update/list product boundaries |
| PricingTax | price and tax calculation safety |
| Discount | discount eligibility and approval rules |
| Orders/Checkout | totals, order creation, idempotency |
| Payment | duplicate payment prevention and provider references |
| Refund/Return | refund allocation and stock/financial safety |
| Inventory | stock movement and quantity constraints |
| OfflineSync | duplicate sync, conflict handling, client isolation |

## Migration Regression

After database/schema changes verify:

- Migration generates successfully.
- Migration applies successfully to local PostgreSQL.
- Table, column, FK, unique, partial unique, and check constraints match database knowledge.
- Postgres identifier names do not collide after 63-character truncation.

## Done Criteria

A backend change is regression-safe only when:

- Required tests pass.
- Manual verification steps are recorded when tests are not yet available.
- Known warnings are identified separately from failures.
- Any untested risk is explicitly documented.

## Related Files

- [[Testing_Strategy]]
- [[API_Testing_Standards]]
- [[Permission_Test_Cases]]
- [[Tenant_Isolation_Test_Cases]]