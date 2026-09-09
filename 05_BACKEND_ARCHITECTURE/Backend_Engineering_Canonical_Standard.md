<!-- title: Backend Engineering Canonical Standard -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-19 -->

# Backend Engineering Canonical Standard

## Purpose and Authority

This is the mandatory backend engineering concern map. It complements—not
replaces—the existing architecture, module, journey, API, permission, database,
security, and testing authorities.

Before implementation, follow [[Backend_Feature_Development_Second_Brain_Workflow]]
and [[Backend_Reusable_Service_Logic_Governance]].

## Architecture Constraint

Respect the current `API → Application → Domain → Infrastructure` architecture
in [[Clean_Architecture_Layers]], the module structure in
[[Module_Based_Folder_Structure]], and repository source truth. The concerns
below are review questions, not automatic technology decisions.

Do **not** introduce CQRS, MediatR, Redis, an API Gateway, a Saga framework, or a
new message broker unless a current approved architecture decision explicitly
requires it.

## Concern Map

| Concern group | Mandatory considerations | Canonical detail / evidence |
|---|---|---|
| HTTP/API | Endpoints, controllers, request/response models, DTOs, mapping, status codes, standard error contract, API versioning/compatibility, OpenAPI, CORS/security headers, payload limits | [[API_Standards]], [[DTO_And_Mapping_Rules]], [[Error_Response_Standards]], [[API_ENDPOINTS]] |
| Application | Application services/use cases, workflow orchestration, validation, transactions, authorization, mapping, graceful degradation | [[Clean_Architecture_Layers]], relevant module technical contract |
| Domain | Business/domain logic, entities, value objects, aggregates, domain services, domain events, state machines, approval/override workflows | Relevant module functional rules; do not force patterns absent from current architecture |
| Infrastructure | Repositories, EF Core/ORM, database connections, dependency injection, external clients, object/file/image storage | [[Clean_Architecture_Layers]], [[Module_Based_Folder_Structure]] |
| Data integrity | Migrations, indexes, constraints, soft delete, retention, partitioning concerns, seeding, backup/restore, disaster recovery, migration safety, zero-downtime compatibility, data repair/reconciliation | [[../06_DATABASE_KNOWLEDGE/Database_Overview]], [[../06_DATABASE_KNOWLEDGE/Migration_Rules]], relevant table authority |
| Tenancy | Tenant isolation, ownership, provisioning/configuration, tenant context, cache-key isolation, tenant tests | [[Multi_Tenant_Handling]], [[../06_DATABASE_KNOWLEDGE/Tenant_Id_Rules]] |
| Identity/security | Authentication, authorization, roles, permissions, token lifecycle, credential policy, MFA concerns, session handling/revocation, secrets, encryption, PII/compliance, input sanitization, rate limiting | [[Authentication]], [[Authorization_And_Permissions]], and the relevant access-control or security/compliance authority |
| Reliability | Retry, circuit breaker, timeout, graceful degradation, health checks, distributed locking, optimistic/pessimistic concurrency, duplicate-request detection, idempotency | Existing infrastructure and feature contract; do not add new infrastructure without approval |
| Messaging/work | Background/scheduled jobs, events, integration events, messaging/queues, outbox/inbox, eventual consistency, distributed workflow/Saga concerns, queue ordering, dead letters | Current approved integration architecture only; concern does not mandate a broker/framework |
| Transactions | Transaction boundaries, concurrency, rollback, idempotency, constraints, sequence/number generation | Application service + repository/database contract |
| Finance | Money precision, currency, tax, payments, refunds, payment state machine, financial reconciliation, auditability | Relevant pricing/payment/order module and database authority |
| Commerce operations | Sale/order state machine, inventory consistency, approval/override workflows, reporting read models, import/export and import validation | Relevant module, journey, API, database and test documents |
| Integrations | External APIs, payment integration, hardware server logic, webhooks and webhook idempotency, email/SMS, notifications, file/image/object storage and file validation | Relevant file in `12_INTEGRATIONS` and module contract |
| Observability | Structured logging, correlation IDs, distributed tracing, metrics, alerts, operational dashboards, audit logging, log redaction, monitoring | [[Audit_Log_Standards]], standard error/logging contracts |
| Configuration | Environment/configuration validation, secrets management, feature flags, dependency governance, DI | Repository configuration and approved architecture |
| Performance | Query projection, pagination/search/filter/sort, caching, indexes, load behaviour, database connections, resource limits | [[Backend_Coding_Principles]], API/database contracts |
| Testing | Unit, integration, API, contract, end-to-end, load, security, migration, resilience, architecture, tenant isolation, permission, concurrency tests; fixtures and clock abstraction | [[../10_TESTING_QA/Testing_Strategy]], feature test cases |
| Operations | Maintenance operations, backup/restore, disaster recovery, reconciliation, data repair, operational dashboards, backend module documentation | Operational runbooks and implementation tracking |

## Core Engineering Rules

1. Controllers bind/authorize/dispatch/format; they do not own business logic or
   use DbContext directly.
2. Application services orchestrate use cases and transaction boundaries.
3. Domain has no HTTP, EF Core, controller, migration, or provider-SDK dependency.
4. Infrastructure implements persistence and external contracts without owning
   duplicate business rules.
5. Never trust client totals, tenant IDs, permissions, or protected decisions.
6. Tenant scope, permission, validation, transaction, concurrency, idempotency,
   audit, and error semantics are considered for every command.
7. Do not return entities, secrets, stack traces, SQL details, or sensitive data.
8. Database constraints complement—not replace—application/domain validation.
9. Reuse or extend existing services/policies/validators before creating logic.
10. Update Second Brain when reusable engineering knowledge changes.

## When to Update Second Brain

Update canonical knowledge for a new reusable service, business/domain rule, API
contract, permission, database rule, integration contract, architecture decision,
workflow/state, or important operational rule. If existing logic is merely
reused, reference its authority instead of copying it.

## Required Companion Documents

- [[Backend_Reusable_Service_Logic_Governance]]
- [[Backend_Feature_Development_Second_Brain_Workflow]]
- [[Backend_Feature_Implementation_Specification_Template]]
- [[../00_START_HERE/Current_Source_Of_Truth]]
- [[../00_START_HERE/Developer_Reading_Guide]]
