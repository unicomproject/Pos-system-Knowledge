<!-- title: Clean Architecture Layers -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-01 -->


# Clean Architecture Layers

## Purpose

This file defines how backend code is separated into layers.

The layer rule remains valid after the TM-EPOS MVP scope update.

## Layer Order

```text
API -> Application -> Domain -> Infrastructure
```

Each layer must depend inward, not outward. The API composition root may reference Infrastructure only to register implementations; controllers must not depend on Infrastructure or EF Core directly.

## API Layer

The API layer contains controllers, request binding, authentication entry points,
response formatting, Swagger metadata, and versioned route grouping.

API controllers must not contain business rules.

## Application Layer

The Application layer contains use-case services, validators, DTO contracts,
authorization orchestration, transaction boundary coordination, and calls to
repositories, domain services, and infrastructure abstractions.

Application services own workflow logic such as checkout completion, offline sync
upload, pickup status change, refund processing, till close, and product setup.

## Domain Layer

The Domain layer contains entities, value objects, domain services, business
rules, repository contracts, constants, and permission-code constants.

Domain must not know EF Core, HTTP, controllers, database migrations, or external
provider SDKs.

## Infrastructure Layer

Infrastructure contains EF Core DbContext, entity configurations, repository
implementations, PostgreSQL migrations, external provider clients, file storage,
email/SMS/payment adapters, cache adapters, and sync persistence adapters.

## Allowed Dependencies

| Layer | Can Depend On |
|---|---|
| API | Application; Infrastructure only in the composition root for dependency registration |
| Application | Domain |
| Domain | Nothing project-specific outside Domain |
| Infrastructure | Application contracts and Domain |

## Composition Root Rule

`Program.cs` may call Infrastructure dependency registration because it is the application composition root.

Controllers, filters, middleware business logic, and Application services must not directly use Infrastructure repositories, EF Core DbContext, or provider SDKs.

## Module Consistency

Every business-heavy module should follow the same layer structure.

Examples: Orders, CartCheckout, POS, Payment, Refund, FulfilmentPickup,
OfflineSync, Product, Inventory, Notification, Integration.

## Transaction Boundary Rule

Use Application services to coordinate database transactions.

Do not start transactions inside controllers.

Offline sync batch processing, checkout completion, refund, exchange, payment
status change, and till close must be transaction-safe.

## Validation Rule

Use layered validation:

- Request shape validation in API/Application.
- Business rule validation in Application/Domain.
- Database constraints in Infrastructure/PostgreSQL.

## Anti-Patterns

- API controller directly using DbContext.
- UI-specific DTOs inside Domain.
- EF Core attributes controlling domain behavior.
- Infrastructure calling API controllers.
- Business rules inside repository implementation.
- Duplicated checkout or payment rules across controllers.

## Related Files

- [[Backend_Overview]]
- [[Backend_Coding_Principles]]
- [[DTO_And_Mapping_Rules]]
