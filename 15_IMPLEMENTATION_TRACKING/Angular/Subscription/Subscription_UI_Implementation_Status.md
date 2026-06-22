<!-- title: Subscription UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-22 -->

# Subscription UI Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Angular + .NET backend |
| Feature | Super Admin Subscription Plans |
| Status | Full wizard flow verified end-to-end |
| Latest update | 2026-06-22 |

## Implemented

- List page: real `GET /api/v1/platform/subscription-plans`, empty state when no rows
- Status model: `draft`, `active`, `retired` from backend; UI labels Draft / Published / Archived
- Create wizard: POST create → PATCH pricing → PATCH limits → POST publish
- Basics Next/Save Draft: POST create draft, store `planId`, set `basicsSaved`
- Pricing step: polished UI, `persistPricing()`, `ensureDraftExistsBeforePricing()`
- Limits step: polished UI, `persistLimits()`, planId + pricingSaved guards
- Draft Summary: Modules/Features = Not selected when catalog empty; Pricing/Limits = Configured only after backend save
- Stepper checkmarks for completed/saved steps
- Bottom sticky action bar only (duplicate top-right wizard buttons removed 2026-06-22)
- Success toasts only after backend success
- No hardcoded subscription plan rows in runtime UI

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
| UI status mapping | `active` → Published label |

## Remaining TODOs

- Module/feature catalog endpoints for wizard steps 2–3
- View/edit/duplicate/archive/delete UI actions
- Full browser manual verification of Limits step with live backend

## Related Files

- `subscription-plan-status.util.ts`
- `platform-subscription-plan-api.service.ts`
- `platform-subscription-plans-page.ts`
- `platform-create-subscription-plan-page.ts`
