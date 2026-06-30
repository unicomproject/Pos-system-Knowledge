<!-- title: Subscription Catalog Model -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Subscription Catalog Model

## Purpose

This file defines the Release 1 commercial subscription catalog used by the Platform Admin Create Subscription Plan wizard.

## Architecture Decision

The permission catalog and subscription catalog are different views of the same backend source tables.

| Catalog | Purpose | UI Owner |
|---|---|---|
| Permission catalog | Technical access-control tree: module -> feature -> permission | Role/permission screens |
| Subscription catalog | Commercial entitlement tree: commercial module -> feature/capability | Subscription plan wizard |

The subscription wizard must not map permission catalog modules directly as commercial subscription modules.

## Backend Source Of Truth

The subscription catalog is projected from existing `platform_features` rows, joined to `platform_modules`, using Release 1 subscription metadata on `platform_features`:

- `is_subscription_visible`
- `release_scope`
- `subscription_group_code`
- `subscription_group_name`
- `subscription_group_sort_order`
- existing `is_core`
- existing `entitlement_key`
- existing `sort_order`
- existing `status`

No duplicate module/feature seed table is used.

## Catalog Read Endpoint

`GET /api/v1/platform/subscription-plans/catalog`

Permission: `platform.subscription_plans.view`

The endpoint returns only active, Release 1, subscription-visible commercial modules/features. It does not return platform-admin-only permission catalog features and does not return Release 2/deferred items.

## Feature Save Endpoint

`PATCH /api/v1/platform/subscription-plans/{planId}/features`

Permission: `platform.subscription_plans.edit`

Request:

```json
{
  "featureAvailability": {
    "feature-guid": "included",
    "another-feature-guid": "not_available"
  }
}
```

Response data:

```json
{
  "id": "plan-guid",
  "includedFeatureIds": ["feature-guid"],
  "status": "draft"
}
```

## Response Shape

```json
{
  "modules": [
    {
      "id": "core_pos",
      "code": "core_pos",
      "name": "Core POS",
      "description": null,
      "sortOrder": 10,
      "isCore": true,
      "isLocked": true,
      "defaultAvailability": "included",
      "features": [
        {
          "id": "feature-guid",
          "code": "pos.sales",
          "name": "POS Sales",
          "description": "Start sale and checkout capabilities.",
          "entitlementKey": "pos.sales",
          "sortOrder": 10,
          "isCore": true,
          "isLocked": true,
          "defaultAvailability": "included"
        }
      ]
    }
  ]
}
```

## Release 1 Commercial Modules

The live catalog returns these commercial modules:

| Module | Availability | Notes |
|---|---|---|
| Core POS | locked included | Required POS selling and checkout capabilities |
| Tenant Operations | locked included | Required tenant setup and administration capabilities |
| Inventory | optional | Product and inventory management entitlement |
| Customers & Loyalty | optional | Customer/loyalty-related Release 1 entitlement currently backed by customer capability rows |
| Returns & Exchanges | optional | Return/refund/exchange capabilities |
| Reports | optional | Reports analytics capability |

## Core/Default Rule

Core features are locked included. The backend automatically includes required core subscription features during feature save and rejects attempts to save a core feature as `not_available`.

## Optional Feature Rule

Optional features can be saved as `included` or `not_available`. `included` persists an enabled row in `subscription_plan_features`; `not_available` removes or does not persist the row.

## Release 1 Exclusions

`addon` remains out of scope and is rejected/hidden.

Online Orders, E-commerce, Click & Collect, delivery, offline sync, supplier management, stock transfer, kiosk, coupons/promotions engine, AI modules, and full accounting are not Release 1 subscription wizard options.

`pos.online_orders` is kept out of the subscription catalog with `release_scope = r2` and `is_subscription_visible = false`.

## Responsibility Split

Subscription Plan = module/feature entitlement.

Role Permission = permission assignment.

The subscription wizard selects commercial modules/features only. It must not select permissions.

## Angular Behavior

Angular uses `PlatformSubscriptionPlanApiService.getSubscriptionCatalog()` to load `GET /api/v1/platform/subscription-plans/catalog`.

The wizard maps commercial modules to module options and nested catalog features to feature options. Locked modules/features initialize as `included` and cannot be changed to `not_available`. Optional modules/features initialize as `not_available`.

PATCH payloads send only `included` and `not_available`; no `addon` is rendered or sent.

## Verification 2026-06-25

- Backend unit tests: 132/132 passed.
- Backend solution build: passed after stopping stale `.NET Host` PID 1176 that locked API DLLs.
- Angular tests: 117/117 passed.
- Angular build: passed with existing component style-budget warnings.
- Live API smoke: catalog returned six commercial modules, Online Orders count was 0, draft feature save auto-included core features, pricing/limits save passed, publish returned `active`.

## Related Files

- [[03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/05_Subscription_Plans_Feature_Catalog]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
