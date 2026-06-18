<!-- title: Subscription UI Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-17 -->

# Subscription UI Implementation

## Summary

Implemented Super Admin Subscription Plans list page and Create Plan wizard in
`nytroz-pos-platform-admin`.

## Components

| Component | Path |
|---|---|
| `PlatformSubscriptionPlansPage` | `features/admin/pages/platform-subscription-plans-page/` |
| `PlatformCreateSubscriptionPlanPage` | `features/admin/pages/platform-create-subscription-plan-page/` |

Standalone components with inline templates/styles (matches tenant list pattern).

## Data Layer

| File | Purpose |
|---|---|
| `platform-subscription-plan.model.ts` | UI models and query types |
| `platform-subscription-plan-api.service.ts` | HTTP client for list + wizard stubs |

API endpoint config: `apiEndpoints.platform.subscriptionPlans =
'/platform/subscription-plans'`.

## Routes

Updated `admin.routes.ts`:

- `subscriptions` → list page
- `subscriptions/create` → create wizard (defined before list route segment)

## Permissions

Frontend permission keys in `permission-keys.ts`:

- `platform.subscription_plans.view`
- `platform.subscription_plans.create`
- `platform.subscription_plans.edit`
- `platform.subscription_plans.duplicate`
- `platform.subscription_plans.archive`
- `platform.subscription_plans.delete`

Create button checks `.create` or legacy `.manage`. Action buttons respect API
`canView`, `canEdit`, `canDuplicate`, `canArchive`, `canDelete`.

## State Management

- Angular signals for loading, error, filters, pagination, wizard step
- RxJS debounced search (300ms)
- Reactive forms for wizard basics/pricing/limits steps

## Tests

| File | Coverage |
|---|---|
| `platform-subscription-plan-api.service.spec.ts` | GET list endpoint |
| `platform-subscription-plans-page.spec.ts` | loading, data, empty, error, create link |
| `platform-create-subscription-plan-page.spec.ts` | wizard steps, publish modal |
| `sidebar.spec.ts` | Subscriptions active on create route |

Verified: `npm run build` success, 48 unit tests passed.

## Permission Integration Fix (Verified 2026-06-17)

| Item | Detail |
|---|---|
| Root cause | Backend returned `403 AccessDenied` because Super Administrator role was not assigned subscription plan permissions in the database |
| API path | `GET /api/v1/platform/subscription-plans` (via `apiEndpoints.platform.subscriptionPlans`) |
| Auth state | Login/refresh now maps `user.platformPermissions` from backend into `AuthSession` |
| Create button | Uses `AccessControlService.hasPermission('platform.subscription_plans.create')` |
| Tab counts | Show `—` while loading; real `statusCounts` after API success |
| Sidebar | Active for `/admin/subscriptions` and child routes |

Backend dev startup now applies pending migrations and idempotent platform permission seed.

## TODO (Backend Pending)

- `GET` module catalog for wizard step 2
- `GET` feature catalog for wizard step 3
- `POST` save draft
- `POST` publish plan
- View/edit/duplicate/archive/delete actions

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[Angular_API_Integration_Guide]]
- [[Angular_Error_Loading_Handling]]
