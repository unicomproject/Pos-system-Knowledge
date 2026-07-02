<!-- title: Testing Strategy -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Testing Strategy

## Purpose

This file defines the testing approach for TM-EPOS MVP across backend APIs, application services, repositories, database behavior, POS workflows, offline sync, permissions, and tenant isolation.

## Testing Principles

- Every implemented feature must have test cases.
- Test depth is risk-based: critical money, inventory, auth, tenant, offline, and payment flows need stronger coverage.
- Controllers must be tested through API tests, not by placing business logic in controllers.
- Application services must be unit tested for workflow behavior and business rules.
- Repositories and EF Core mappings must be covered through integration tests where database behavior matters.
- Permission denied, tenant isolation, validation failure, idempotency, and regression cases must be tested, not only success paths.
- Do not weaken production validation, authorization, constraints, or transaction behavior to make tests pass.

## Test Types

| Test Type | Main Coverage |
|---|---|
| Unit tests | Application services, validators, calculation services, permission helpers |
| Integration tests | EF Core repositories, transactions, database constraints, tenant filters |
| API tests | Controllers, routing, auth, permissions, response format, status codes |
| Regression tests | Existing critical flows after backend changes |
| Flow tests | Multi-step workflows such as checkout, payment, refund, till close, offline sync |

## Feature Test Minimum

Each backend feature must define at least:

- Success case.
- Validation failure case.
- Permission denied case.
- Tenant isolation case.
- Expected database state change.
- Expected error response shape.

## Critical Feature Test Minimum

Critical features must additionally define:

- Transaction rollback behavior.
- Idempotency behavior when retry is possible.
- Audit/log expectation where applicable.
- Concurrency or duplicate submission behavior where applicable.
- Boundary values for money, quantity, status, and date/time rules.

## Critical Feature Areas

- Authentication and session handling.
- Tenant resolution and tenant status checks.
- Permissions and role changes.
- Product creation and pricing/tax/discount rules.
- Checkout and sales order completion.
- Payment and refund recording.
- Inventory movement and stock availability.
- Till open, cash movement, and till close.
- Offline sync batch upload and conflict handling.

## Test Data Rules

- Test data must be explicit and readable.
- Tenant A and Tenant B data must be separated in tenant isolation tests.
- Use realistic business codes and statuses from backend constants/check rules.
- Avoid relying on test execution order.
- Keep seed data minimal and purpose-specific.

## Related Files

- [[API_Testing_Standards]]
- [[Permission_Test_Cases]]
- [[Tenant_Isolation_Test_Cases]]
- [[Idempotency_Test_Cases]]
- [[Offline_Sync_Test_Cases]]
- [[Regression_Checklist]]