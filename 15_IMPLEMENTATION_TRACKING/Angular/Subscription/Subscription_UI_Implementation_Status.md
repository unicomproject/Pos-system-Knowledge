<!-- title: Subscription UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Subscription UI Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Angular + .NET backend |
| Feature | Super Admin Subscription Plans |
| Status | Plan list/create/modules/features/pricing/limits/publish flow implemented |
| Latest update | 2026-06-25 |

## Implemented

- List page: real `GET /api/v1/platform/subscription-plans`, empty state when no rows
- Status model: `draft`, `active`, `retired` from backend; UI labels Draft / Published / Archived
- Create wizard: `POST` create -> `PATCH` pricing -> `PATCH` limits -> `POST` publish
- Basics Next/Save Draft: `POST` create draft, store `planId`, set `basicsSaved`
- Pricing step: polished UI, `persistPricing()`, `ensureDraftExistsBeforePricing()`
- Limits step: polished UI, `persistLimits()`, `planId` + `pricingSaved` guards
- Draft Summary: real selected module/feature counts and names from catalog state; Pricing/Limits = Configured only after backend save
- Stepper checkmarks for completed/saved steps
- Bottom sticky action bar only
- Success toasts only after backend success
- No hardcoded subscription plan rows in runtime UI

## Current Catalog Boundary

Catalog read source is the existing `GET /api/v1/platform-admin/permission-catalog`; do not create a duplicate subscription module/feature catalog read endpoint. Backend feature save is implemented at `PATCH /api/v1/platform/subscription-plans/{planId}/features`.

Angular `getModules()` and `getFeatures()` must use backend catalog data, filter to tenant/POS entitlement-relevant modules/features, and must not return fake or empty-success data. The wizard selects modules/features only, not permissions.

## Verification (2026-06-22)

| Check | Result |
|---|---|
| `npm run build` | Passed |
| `npm test -- --watch=false` | 90/90 passed |
| API create draft | `status: draft` |
| API PATCH pricing | `base_price: 12900` |
| API PATCH limits | `5/10/25` |
| API POST publish | `status: active` |
| GET list | `status: active` |
| DB `nytroz_pos_dev.subscription_plans` | Row verified (prior session) |
| UI status mapping | `active` -> Published label |

## Current Audit Update (2026-06-24)

- Removed stale `of([])` fake-success behavior from the active catalog service methods.
- Duplicate catalog endpoints remain out of scope; use the existing platform-admin permission catalog for read.
- Current verification for this audit pass is recorded in the fix report, not in this older 2026-06-22 verification table.

## Remaining TODOs

- Browser click-through verification of the full Angular wizard with live backend
- View/edit/duplicate/archive/delete UI actions
- Full browser manual verification of Limits step with live backend

## Related Files

- `subscription-plan-status.util.ts`
- `platform-subscription-plan-api.service.ts`
- `platform-subscription-plans-page.ts`
- `platform-create-subscription-plan-page.ts`

## Backend Feature Catalog Boundary Update (2026-06-25)

Current backend truth for Angular integration:

- Catalog read source: `GET /api/v1/platform-admin/permission-catalog`.
- Duplicate subscription module/feature catalog read endpoint is out of scope for Release 1.
- Feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`.
- Wizard must select modules/features only, not permissions.
- Permission assignment remains role-permission responsibility.
- Angular must filter the catalog to tenant/POS entitlement-relevant modules/features. Platform-admin-only modules/features must not be shown unless explicitly documented as tenant-entitled.
- `included` persists to `subscription_plan_features`; `not_available` removes/not persists; `addon` is rejected/out of scope unless real add-on pricing is implemented.
- Do not return fake, static, mock, or empty-success module/feature catalog data.

Angular remaining TODO:

- Browser click-through verification of the full Angular wizard with live backend remains to be completed.

## Angular Module/Feature Catalog Integration (Implemented 2026-06-25)

Final Angular behavior:

- Catalog read source: `GET /api/v1/platform-admin/permission-catalog` through `PlatformPermissionCatalogApiService.getPermissionCatalog()`.
- Feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features` through `PlatformSubscriptionPlanApiService.updateSubscriptionPlanFeatures()`.
- No duplicate subscription catalog read endpoint was added.
- No mock/static/local module or feature catalog data is used.
- The wizard selects modules/features only; it does not show or select permissions.
- `moduleAvailability` remains frontend-only selection/grouping state and is not sent for backend persistence.
- Feature persistence sends only `included` and `not_available`; `addon` is not rendered or sent.

Angular mapping:

| Wizard option | Backend catalog field |
|---|---|
| Module `id` | `module.id` |
| Module `moduleKey` | `module.code` |
| Module `name` | `module.name` |
| Module `description` | `module.description` |
| Module `scope` | `module.scope` |
| Feature `id` | `feature.id` |
| Feature `moduleId` | parent `module.id` |
| Feature `moduleName` | parent `module.name` |
| Feature `featureKey` | `feature.code` |
| Feature `name` | `feature.name` |
| Feature `description` | `feature.description` |
| Feature `entitlementKey` | `feature.entitlementKey` |

Filtering rule used:

- Include only active modules/features.
- Include modules with `module.scope` equal to `tenant` or `pos`.
- If module scope is missing, include only features whose permissions expose `scope` or `source` as `tenant` or `pos`.
- Platform-admin-only modules/features are excluded by this rule.
- Known catalog classification risk: the live backend catalog currently returns `POS Online Orders` as POS-scoped. Angular follows backend scope/source data rather than hardcoding a module-key exclusion.

PATCH payload example:

```json
{
  "featureAvailability": {
    "41000000-0000-0000-0000-000000000030": "included",
    "41000000-0000-0000-0000-000000000031": "not_available"
  }
}
```

Verification:

- `npm test -- --watch=false`: 19 files / 117 tests passed.
- `npm run build`: passed with existing component style-budget warnings.
- Live backend smoke on `http://127.0.0.1:5050`: login succeeded, catalog returned 15 modules / 12 tenant-POS eligible modules, draft created, features PATCH saved, pricing PATCH saved, limits PATCH saved, publish returned `status: active`.
- Angular dev server route `/admin/subscriptions/create` responded with HTTP 200.

Files changed:

- `src/app/features/admin/models/platform-subscription-plan.model.ts`
- `src/app/features/admin/services/platform-subscription-plan-api.service.ts`
- `src/app/features/admin/services/platform-subscription-plan-api.service.spec.ts`
- `src/app/features/admin/pages/platform-create-subscription-plan-page/platform-create-subscription-plan-page.ts`
- `src/app/features/admin/pages/platform-create-subscription-plan-page/platform-create-subscription-plan-page.spec.ts`

## Subscription Catalog Architecture Correction 2026-06-25

Supersedes earlier guidance that the subscription wizard should read `GET /api/v1/platform-admin/permission-catalog` directly.

Final catalog read source: `GET /api/v1/platform/subscription-plans/catalog`.

Final feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`.

Rules:

- Permission Catalog = technical access-control hierarchy for role-permission assignment.
- Subscription Catalog = commercial entitlement hierarchy for subscription plan creation.
- Subscription wizard selects commercial modules/features only; it must not select permissions.
- Core/default subscription features are locked included and protected by backend validation.
- Optional features support only `included` and `not_available`.
- `addon` is out of Release 1 and must not be rendered or sent.
- `included` persists enabled rows in `subscription_plan_features`.
- `not_available` removes or does not persist rows in `subscription_plan_features`.
- Status truth remains `draft`, `active`, `retired`.
- POS Online Orders / E-commerce is Release 2/deferred and must not appear in the R1 subscription wizard.

Commercial modules returned to UI:

- Core POS: locked included.
- Tenant Operations: locked included.
- Inventory: optional.
- Customers & Loyalty: optional.
- Returns & Exchanges: optional.
- Reports: optional.

See [[04_Subscription_Catalog_Model]] for the final contract, metadata fields, response shape, validation behavior, and verification results.
