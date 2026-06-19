<!-- title: Frontend Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-19 -->

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
- Bottom action bar required: Back left, Save Draft + Next right
- No sidebar collapse button

## Step 1 Allowed Fields

- Plan Name → `name`
- Plan Code → `plan_code`
- Description → `description`
- Billing Cycle → `billing_cycle`
- Currency → `base_currency`
- Status read-only Draft → `status = draft`

## API Methods

- `getSubscriptionPlans()`
- `createSubscriptionPlanDraft()`
- `updateSubscriptionPlanPricing()`
- `updateSubscriptionPlanLimits()`
- `publishSubscriptionPlan()`

Base URL: `/api/v1` (proxy to `http://localhost:5050`)

## Status mapping utility

`src/app/features/admin/models/subscription-plan-status.util.ts`

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
