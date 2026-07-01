<!-- title: Discount Technical Contract -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Discount Technical Contract

## Purpose

This file defines the technical contract for the `Discount` module.

## API Contract

| Area | Contract |
|---|---|
| API group | `/api/v1/discounts, /api/v1/pos/sales` |
| Request format | Typed request DTOs |
| Response format | Typed response DTOs |
| Error format | Standard API error response |
| Tenant context | Resolved server-side |
| Auth | JWT/session based where protected |

## Frontend Contract

Frontend implementation must use:

- Feature folder ownership.
- Typed API services.
- Feature-level state/store.
- Reactive Forms for forms.
- Shared loading/error/empty states.
- Permission and entitlement directives/guards.
- No hardcoded API URLs.
- No hardcoded role checks.
- Tenant-state cleanup on tenant switch.

## Backend Contract

Backend implementation must use:

- Thin API controllers.
- Application services for use cases.
- Domain entities/rules for stable business behavior.
- Repository interfaces in Application layer.
- Repository implementations in Infrastructure layer.
- EF Core mappings and migrations from the updated database design.
- Audit logging for sensitive changes.

## Database Contract

Main database tables:

- `discount_types`
- `discount_scopes`
- `discount_policies`
- `product_discounts`
- `pos_discount_applications`
- `expiry_discount_rules`
- `expiry_discount_applications`
- `product_batches`

Entity mappings must preserve table names, column names, tenant foreign keys,
constraints, tenant-aware indexes, and append-only behavior where applicable.

## Permission Contract

Permission codes must be database-seeded values and referenced through
module-wise constants where needed.

Do not implement one global permission enum as the source of truth.

## Data Safety Contract

Never expose password hashes, POS PIN hashes, token hashes, raw setup tokens, raw
activation codes, provider secrets, card data, or cross-tenant records.

## Test Contract

Test cases should cover:

- Happy path.
- Missing authentication.
- Permission denied.
- Feature disabled.
- Tenant isolation.
- Validation failure.
- Duplicate/conflict.
- State cleanup after tenant switch.
- Safe error display.
- Audit creation where required.

## Implementation Sequence

1. Confirm scope and table coverage.
2. Create backend DTOs and services.
3. Create repository and EF mapping if missing.
4. Add permission and entitlement checks.
5. Build frontend route/page/component/store.
6. Add loading/error/empty states.
7. Add tests.
8. Review against Release 1 scope.

## Out of Scope

No coupon engine or campaign builder.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Discount/01_Module_Overview]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Discount/02_Functional_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Module_Implementation_Guide]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Module_Implementation_Guide]]
