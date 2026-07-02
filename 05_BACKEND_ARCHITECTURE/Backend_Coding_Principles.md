<!-- title: Backend Coding Principles -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->


# Backend Coding Principles

## Purpose

This file defines backend coding rules for TM-EPOS MVP.

The rules prevent duplicated logic, tenant leaks, unsafe offline behavior, and
unreviewable code.

## General Principles

- Keep controllers thin.
- Keep business logic outside controllers.
- Use Application services for feature workflows.
- Keep Domain free from infrastructure concerns.
- Use repositories through contracts.
- Keep DTOs separate from entities.
- Use explicit transactions for critical workflows.
- Use idempotency for duplicate-sensitive commands.
- Keep permissions backend-driven.
- Do not hardcode role names.

## Comment Principle

Write comments only when they explain non-obvious business, security, data, or architectural intent.

Do not add comments that merely repeat what the code already says.

Use short single-line comments for important reasons such as generic login failure responses, token/cookie security, tenant isolation, idempotency, audit intent, cache authority limits, or unusual database constraints.

Example good comment:

```csharp
// Return the same failure for missing users to avoid account enumeration.
```

Example bad comment:

```csharp
// Gets user by email.
```

## Scope Principle

Do not implement excluded MVP areas such as kiosk, delivery management, supplier
management, stock transfer, advanced coupons, AI modules, or full accounting.

Online store, cart/checkout, click and collect, and offline operation are active
MVP areas.

## Naming Principles

| Item | Rule |
|---|---|
| Entities | Business names such as SalesOrder, CheckoutSession |
| DTOs | Request/Response suffix |
| Application services | Module/business service names such as CheckoutService; feature actions are service methods such as CompleteCheckoutAsync |
| Repositories | Interface in Application Contracts or Domain Repositories based on ownership; implementation in Infrastructure |
| Permissions | Stable dot-separated permission codes |
| Routes | Versioned and module grouped |

## SOLID Principles

| Principle | TM-EPOS Usage |
|---|---|
| Single Responsibility | Controller handles HTTP only; service handles use case only |
| Open/Closed | Add provider adapters without rewriting core payment flow |
| Liskov Substitution | Interfaces must be replaceable by implementations safely |
| Interface Segregation | Avoid large service interfaces with unrelated methods |
| Dependency Inversion | Application depends on abstractions, Infrastructure implements them |

## Service Rules

Application services must:

- Validate feature entitlement and permission where the feature requires protected access.
- Validate tenant/outlet/device/till context where required.
- Call repositories through interfaces.
- Use transaction boundaries for checkout, payment, refund, exchange, stock, and
  till close operations.
- Write audit records for sensitive actions.

## Unit Of Work Rules

- Application service owns the transaction boundary for multi-step critical workflows.
- Use Unit of Work for checkout, payment, refund, exchange, stock, and till
  close workflows.
- Single-step commands may save through the repository when intentionally simple.
- Use one commit per use case where possible.

## Repository Rules

Repositories must:

- Apply tenant filtering for tenant-owned data.
- Use `AsNoTracking` for read-only queries.
- Use projections for list APIs.
- Avoid loading large object graphs unnecessarily.
- Respect tenant-aware unique constraints.
- Never bypass append-only ledger rules.

## Error Handling Rules

- Use `ApplicationResult` / `ApplicationError` for expected business failures.
- Use global exception middleware.
- Use 401 for unauthenticated requests.
- Use 403 for permission, entitlement, outlet, device, or till denial.
- Use 409 for conflicts and duplicates.
- Never expose stack traces or database internals to clients.
- Reserve exceptions for unexpected system, infrastructure, or configuration failures.

## Transaction Safety

Critical workflows must be transaction-safe:

- Checkout completion.
- POS sale completion.
- Payment transaction recording.
- Refund allocation.
- Return/exchange posting.
- Offline sync batch processing.
- Till close.
- Inventory movement posting.

## Idempotency Rule

Use idempotency keys for payment, checkout, offline sync batch upload, refund,
exchange, and any retryable command that may create duplicate records.

## Cache Rule

Cache is allowed only for safe reference/config/read data.

Do not use cache as final authority for payment, inventory, refund, exchange,
till close, loyalty/store credit, or final sale total.

## Security Rule

Never log or expose passwords, raw tokens, card data, POS PINs, provider secrets,
payment credentials, or raw activation/setup tokens.

## Review Rule

Every backend change must be reviewed against scope, tenant isolation,
authorization, audit, idempotency, error handling, and database constraints.

## Related Files

- [[Virtual_Caching_Architecture]]
- [[Offline_Operation_Architecture]]
- [[Authorization_And_Permissions]]
