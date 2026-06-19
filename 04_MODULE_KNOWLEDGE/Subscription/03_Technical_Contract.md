<!-- title: Subscription Technical Contract -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Subscription Technical Contract

## Purpose

This file defines the technical contract for the `Subscription` module.

## API Contract

| Area | Contract |
|---|---|
| API group | `/api/v1/subscriptions` |
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

- `subscription_plans`
- `subscription_plan_features`
- `tenant_subscriptions`
- `tenant_subscription_history`
- `subscription_invoices`
- `subscription_invoice_lines`
- `subscription_payment_links`
- `subscription_payment_transactions`

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

No full accounting; no direct gateway UI in Angular.

## Platform Admin Subscription Plans List API (Implemented 2026-06-17)

| Item | Contract |
|---|---|
| Endpoint | `GET /api/v1/platform/subscription-plans` |
| Auth | Platform JWT (`PlatformBearer`) |
| Permission | `platform.subscription_plans.view` |
| Data source | `subscription_plans`, `subscription_plan_features`, `tenant_subscriptions` |
| Status mapping | DB `active` → API `published`, DB `retired` → API `archived`, DB `draft` → API `draft` |
| Billing mapping | DB `yearly` → API `annual`, DB `custom` → API `both` |
| Active tenant count | `tenant_subscriptions` where status in (`trial`, `active`) |
| Add-ons count | Returns `0` until add-on pricing table is confirmed in Release 1 database design |

## Platform Admin Subscription UI (Implemented 2026-06-17)

| Item | Contract |
|---|---|
| List route | `/admin/subscriptions` |
| Create route | `/admin/subscriptions/create` |
| List API | `GET /api/v1/platform/subscription-plans` |
| Data binding | Plans, tab counts, pagination, and action flags from API only |
| Modules/features | Loaded via API service; not hardcoded in templates |
| Wizard | 6 steps with draft summary; create/publish API stubbed pending backend |
| UX rule | Super Admin creates plan templates, not tenant purchases |

### Permission Enforcement (Verified 2026-06-17)

| Action | Permission |
|---|---|
| List plans API | `platform.subscription_plans.view` |
| Create Plan button | `platform.subscription_plans.create` |
| Edit / duplicate / archive / delete | Respective `platform.subscription_plans.*` codes via API `can*` flags |

Login response includes resolved `platformPermissions` from role-permission mapping.
Frontend permission checks are UX only; backend remains final authority.

## Related Files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Module_Implementation_Guide]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Module_Implementation_Guide]]
