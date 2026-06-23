<!-- title: Frontend Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-22 -->

# Frontend Subscription UI — Implementation Notes

## Rules for Future Changes

- Use only Release 1 DB-backed subscription plan fields in Create Plan UI
- Do not add taxMode, visibility, setupFee, effectiveFrom, or planType to Step 1
- Billing cycle options must match DB: monthly, yearly, custom, trial, demo
- Backend status values: `draft`, `active`, `retired` — never expect `published`/`archived` in API responses
- UI labels: Draft / Published (for active) / Archived (for retired)
- No mock subscription plan rows in list or wizard
- Save Draft / Pricing / Limits / Publish must call real backend APIs
- Show success toast only after backend `success: true`
- Bottom sticky action bar is the **only** wizard action source (Back, Save Draft, Next or Publish Plan)
- **No duplicate top-right** Back / Save Draft / Next / Publish buttons on any wizard step
- No sidebar collapse button on subscription screens

## Wizard steps

1. Basics → 2. Modules → 3. Features → 4. Pricing → 5. Limits → 6. Review & Publish

## Real API save flow

| Action | API |
|---|---|
| Basics Save Draft / Next | POST create draft → store `planId`, `basicsSaved` |
| Pricing Save Draft / Next | PATCH pricing (`ensureDraftExistsBeforePricing` if needed) |
| Limits Save Draft / Next | PATCH limits (requires `planId` + `pricingSaved`) |
| Publish | POST publish |
| List | GET list reload |

## Step 1 Allowed Fields

- Plan Name → `name`
- Plan Code → `plan_code`
- Description → `description`
- Billing Cycle → `billing_cycle`
- Currency → `base_currency`
- Status read-only Draft → `status = draft`

## Step 4 Pricing

- Base Price → `base_price` via PATCH pricing only
- Billing Cycle / Currency read-only from Basics
- Pricing summary **Configured** only after PATCH success

## Step 5 Allowed Fields

- Outlet Limit → `max_outlets` (API: `maxOutlets`)
- Till Limit → `max_tills` (API: `maxTills`)
- User Limit → `max_users` (API: `maxUsers`)

Guards: require `savedPlanId` and `pricingSaved` before PATCH limits.

Do not render product/storage/API/transaction limits or extra pricing fields.

## Draft Summary rules

- Modules / Features: **Not selected** unless real catalog selection exists
- Pricing / Limits: **Configured** only after backend PATCH success
- No fake counts

## API Methods

- `getSubscriptionPlans()`
- `createSubscriptionPlanDraft()`
- `updateSubscriptionPlanPricing()`
- `updateSubscriptionPlanLimits()`
- `publishSubscriptionPlan()`

Base URL: `/api/v1` (proxy to `http://localhost:5050`)

## Status mapping utility

`src/app/features/admin/models/subscription-plan-status.util.ts`

## Verification (2026-06-22)

- `npm run build` passed
- `npm test -- --watch=false` — **90/90 passed**
- End-to-end: create → pricing → limits → publish → list
- Active plan displays as **Published** in UI

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
