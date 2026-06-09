<!-- title: Backend Coding Principles -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# Backend Coding Principles

## Purpose

This file defines backend coding principles for SCS-TIX EPOS Release 1.

It is written for both developers and AI coding assistants.

## Core Principles

The backend must be:

- Tenant-safe.
- Permission-safe.
- POS-context-safe.
- Testable.
- Maintainable.
- Clear by module.
- Free of Release 2 hidden implementation.

## SOLID Principles

| Principle | SCS-TIX Usage |
|---|---|
| Single Responsibility | Controller handles HTTP only; service handles use case only |
| Open/Closed | Add provider adapters without rewriting core payment flow |
| Liskov Substitution | Interfaces must be replaceable by implementations safely |
| Interface Segregation | Avoid large service interfaces with unrelated methods |
| Dependency Inversion | Application depends on abstractions, Infrastructure implements them |

## Clean Code Rules

- Keep controllers thin.
- Keep business workflows in Application services.
- Keep stable business rules in Domain.
- Keep EF Core code in Infrastructure.
- Do not inject DbContext into controllers.
- Do not place tenant checks only in UI.
- Do not store raw secrets, tokens, passwords, or POS PINs.
- Do not hardcode tenant-specific business data.
- Do not add Release 2 logic into Release 1 services.

## Naming Principles

| Item | Naming Rule |
|---|---|
| Controller | Plural resource name, e.g. `ProductsController` |
| Service | Use-case area, e.g. `PosSalesService` |
| Repository | Entity/module name, e.g. `SalesRepository` |
| DTO | Action-based name, e.g. `CreateProductRequest` |
| Validator | DTO name + `Validator` |
| Permission constants | Module name + `PermissionCodes` |
| Database tables | snake_case plural names |
| C# classes | PascalCase |
| C# methods | PascalCase |
| Private fields | `_camelCase` |

## Method Rules

Methods should:

- Do one business task.
- Validate required context before mutation.
- Return predictable results.
- Avoid hidden side effects.
- Avoid long parameter lists when a request object is clearer.
- Use async for I/O operations.

## Service Rules

Application services must:

- Validate feature entitlement and permission.
- Validate tenant/outlet/device/till context where required.
- Call repositories through interfaces.
- Use transaction boundaries for checkout, payment, refund, exchange, stock, and
  till close operations.
- Write audit records for sensitive actions.

## Repository Rules

Repositories must:

- Apply tenant filtering for tenant-owned data.
- Use `AsNoTracking` for read-only queries.
- Use projections for list APIs.
- Avoid loading large object graphs unnecessarily.
- Respect tenant-aware unique constraints.
- Never bypass append-only ledger rules.

## Error Handling Rules

- Throw application-specific exceptions for business errors.
- Use global exception middleware.
- Use 401 for unauthenticated requests.
- Use 403 for permission, entitlement, outlet, device, or till denial.
- Use 409 for conflicts and duplicates.
- Never expose stack traces or database internals to clients.

## Security Rules

- Store password hashes only.
- Store POS PIN hashes only.
- Store setup, invite, refresh, payment link, and till activation tokens as hashes.
- Do not log passwords, tokens, PINs, card data, or secrets.
- Keep provider secrets outside source code.

## Related Files

- [[Clean_Architecture_Layers]]
- [[DTO_And_Mapping_Rules]]
- [[Error_Response_Standards]]
- [[Audit_Log_Standards]]
