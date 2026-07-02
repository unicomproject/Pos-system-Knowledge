<!-- title: DTO And Mapping Rules -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-29 -->


# DTO And Mapping Rules

## Purpose

This file defines DTO and mapping rules for TM-EPOS backend APIs.

DTOs protect the domain model and prevent internal database structure from being
leaked to clients.

## DTO Rule

API request and response models must be explicit DTOs.

Do not return EF Core entities directly.

Do not accept database entities directly from API requests.

## DTO Types

| DTO Type | Purpose |
|---|---|
| Request DTO | Input from API client |
| Response DTO | Output to API client |
| Summary DTO | List/table/card display |
| Detail DTO | Single record detail |
| Command DTO | Command request payload |
| Sync DTO | Offline sync upload/download payload |
| Error DTO | Standard error response |

## Mapping Rule

Map between DTOs, domain models, and persistence models intentionally.

Do not expose internal fields such as token hashes, credential values,
idempotency internals, sync payload hashes, or provider secrets.

## Sensitive Fields

Never return:

- Password hash.
- Refresh token hash.
- Setup token hash.
- Payment credential secrets.
- Raw card data.
- POS PIN.
- Provider private keys.
- Internal stack trace.

## Unified Order DTO Rule

Sales order DTOs must clearly separate header, lines, options, components,
discounts, taxes, charges, payment state, fulfilment state, and audit/status
history where needed.

## Checkout DTO Rule

Checkout DTOs must not trust frontend totals.

Backend recalculates price, tax, discount, fulfilment, stock rules, and payment
readiness.

## Offline Sync DTO Rule

Offline sync DTOs must include idempotency, client record IDs, entity names,
operation types, server versions where needed, and safe payload structure.

Do not expose conflict resolution internals unless required by sync UI.

## Versioning Rule

If DTO contracts change in a breaking way, version API route or response shape.

## Related Files

- [[API_Standards]]
- [[Error_Response_Standards]]
- [[Offline_Operation_Architecture]]
