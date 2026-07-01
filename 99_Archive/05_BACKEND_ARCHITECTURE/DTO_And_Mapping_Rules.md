<!-- title: DTO And Mapping Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->

# DTO And Mapping Rules

## Purpose

This file defines DTO and mapping rules for SCS-TIX EPOS Release 1 backend.

DTOs protect API contracts from database entity leakage.

Entities must not be returned directly from controllers.

## DTO Rule

Use DTOs for all request and response payloads.

Do not expose EF Core entities directly to Flutter POS or Angular Platform Admin.

## DTO Types

| DTO Type | Purpose |
|---|---|
| Request DTO | Input for create, update, action, or search |
| Response DTO | Output returned to client |
| List item DTO | Lightweight list/search result |
| Detail DTO | Full detail view |
| Filter DTO | Pagination, sorting, filtering |
| Action DTO | Business command such as close till or apply discount |

## Naming Examples

| Use Case | DTO Name |
|---|---|
| Create product | `CreateProductRequest` |
| Update till | `UpdateTillRequest` |
| Product list row | `ProductListItemResponse` |
| Sale detail | `SaleDetailResponse` |
| Apply discount | `ApplyDiscountRequest` |
| Close till | `CloseTillRequest` |

## Mapping Direction

```mermaid
flowchart LR
    A[Request DTO] --> B[Application Service]
    B --> C[Domain Entity]
    C --> D[Projection/Mapper]
    D --> E[Response DTO]
```

## Request DTO Rules

Request DTOs must contain only fields needed by the action.

They must exclude server-controlled fields such as tenant ID, created date, and
audit actor.

They must not accept trusted values from frontend for permissions, entitlements,
device trust, or till-session validity.

## Response DTO Rules

Response DTOs must return only client-needed fields.

Never return password hashes, token hashes, POS PIN hashes, secrets, or payment
sensitive data.

Include status and readable display values where useful.

## Tenant ID Rule

Tenant-owned request DTOs must not use frontend-provided `tenant_id` as source of
truth.

Tenant context is resolved server-side.

The service may use tenant ID internally after resolution.

## Mapping Rules

Mapping must be explicit enough to avoid accidental field leaks.

Allowed approaches:

- Manual mapping for sensitive flows.
- Small mapper classes for module DTOs.
- Projection DTOs in EF queries for read/list endpoints.

Avoid automatic mapping that exposes unwanted fields.

## Validation Rules

Use validators for required fields, length limits, positive amounts, date ranges,
status values, email/phone format, payment amount rules, and return/refund
quantity limits.

Business rules still belong in services/domain.

## List and Search DTOs

List endpoints must support page number, page size, search term, status filter,
date range filter, outlet filter where relevant, and sorting where relevant.

Use projection DTOs for list performance.

## POS DTO Safety

POS DTOs must not allow the frontend to decide tenant ownership, feature access,
permission result, trusted device result, till session result, stock movement
result, or refund eligibility.

The backend calculates and validates these.

## Related Files

- [[API_Standards]]
- [[Backend_Coding_Principles]]
- [[Multi_Tenant_Handling]]
- [[Error_Response_Standards]]
