<!-- title: Subscription UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-24 -->

# Subscription UI Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Angular + .NET backend |
| Feature | Super Admin Subscription Plans |
| Status | Plan list/create/pricing/limits/publish flow implemented; module/feature catalog pending |
| Latest update | 2026-06-24 |

## Implemented

- List page: real `GET /api/v1/platform/subscription-plans`, empty state when no rows
- Status model: `draft`, `active`, `retired` from backend; UI labels Draft / Published / Archived
- Create wizard: `POST` create -> `PATCH` pricing -> `PATCH` limits -> `POST` publish
- Basics Next/Save Draft: `POST` create draft, store `planId`, set `basicsSaved`
- Pricing step: polished UI, `persistPricing()`, `ensureDraftExistsBeforePricing()`
- Limits step: polished UI, `persistLimits()`, `planId` + `pricingSaved` guards
- Draft Summary: Modules/Features = Not selected when catalog empty; Pricing/Limits = Configured only after backend save
- Stepper checkmarks for completed/saved steps
- Bottom sticky action bar only
- Success toasts only after backend success
- No hardcoded subscription plan rows in runtime UI

## Current Catalog Boundary

Backend module/feature catalog endpoints are not implemented yet.

Angular `getModules()` and `getFeatures()` must not return fake or empty-success data. The current active flow treats these catalogs as unavailable and keeps module/feature selections empty instead of pretending real catalog data exists.

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
- Catalog endpoints remain pending and must not be marked completed.
- Current verification for this audit pass is recorded in the fix report, not in this older 2026-06-22 verification table.

## Remaining TODOs

- Module/feature catalog backend endpoints for wizard steps 2-3
- View/edit/duplicate/archive/delete UI actions
- Full browser manual verification of Limits step with live backend

## Related Files

- `subscription-plan-status.util.ts`
- `platform-subscription-plan-api.service.ts`
- `platform-subscription-plans-page.ts`
- `platform-create-subscription-plan-page.ts`
