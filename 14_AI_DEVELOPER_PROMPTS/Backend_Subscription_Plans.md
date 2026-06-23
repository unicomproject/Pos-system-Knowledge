<!-- title: Backend Subscription Plans -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->

# Backend Subscription Plans

## Purpose

Implementation notes for the Super Admin Subscription Plans list backend API.

## Rules

- Reuse existing `subscription_plans`, `subscription_plan_features`, `platform_modules`, `platform_features`, and `tenant_subscriptions` entities.
- Do not hardcode plan rows, module names, or feature names in API/service code.
- Use Repository + Service pattern; no CQRS or MediatR.
- Platform Admin API only at `/api/v1/platform/subscription-plans`.
- Backend permission check is required; frontend checks are UX only.
- Do not add tenant e-commerce operational flow in this module.

## API

`GET /api/v1/platform/subscription-plans`

`POST /api/v1/platform/subscription-plans`

`POST /api/v1/platform/subscription-plans/{planId}/publish`

Query parameters:

- `pageNumber`, `pageSize`, `search`, `planType`, `status`, `billingCycle`, `currencyCode`, `sortBy`, `sortDirection`

Response includes:

- paginated `items`
- `statusCounts` (`all`, `draft`, `published`, `archived`)
- per-item action flags (`canView`, `canEdit`, `canDuplicate`, `canArchive`, `canDelete`)

## Development Seed

Development-only idempotent seed is provided through migration `SeedPlatformSubscriptionPlanPermissions`.

Do not seed production fake plan data.
