<!-- title: Subscription UI Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-22 -->

# Subscription UI Implementation

## Summary

Super Admin Subscription Plans list page and Create Plan wizard in
`nytroz-pos-platform-admin`.

## Components

| Component | Path |
|---|---|
| `PlatformSubscriptionPlansPage` | `features/admin/pages/platform-subscription-plans-page/` |
| `PlatformCreateSubscriptionPlanPage` | `features/admin/pages/platform-create-subscription-plan-page/` |

## API Service

`platform-subscription-plan-api.service.ts`

| Method | Endpoint |
|---|---|
| `getSubscriptionPlans()` | `GET /api/v1/platform/subscription-plans` |
| `createSubscriptionPlanDraft()` | `POST /api/v1/platform/subscription-plans` |
| `updateSubscriptionPlanPricing()` | `PATCH /api/v1/platform/subscription-plans/{id}/pricing` |
| `updateSubscriptionPlanLimits()` | `PATCH /api/v1/platform/subscription-plans/{id}/limits` |
| `publishSubscriptionPlan()` | `POST /api/v1/platform/subscription-plans/{id}/publish` |

## Status model

```typescript
type SubscriptionPlanStatus = 'draft' | 'active' | 'retired';
```

Display mapping in `subscription-plan-status.util.ts`:

- `draft` → Draft
- `active` → Published
- `retired` → Archived

List tab filters send DB values (`active`, `retired`, `draft`) to backend.

## Create Wizard — Step 1 Form State

Reactive form group `basicsForm`:

- `planName` required
- `planCode` required, auto uppercase
- `description` max 500
- `billingCycle` required (`monthly|yearly|custom|trial|demo`)
- `baseCurrency` required

Read-only status display: Draft

Removed from UI/model:

- taxMode
- visibility
- setupFee
- effectiveFrom
- planType

## Validation Rules

- Plan name is required
- Plan code is required
- Billing cycle is required
- Currency is required
- Description cannot exceed 500 characters

## Save Draft Behavior

1. Validate Step 1 minimum fields
2. Map to backend request:
   - `planName`, `planCode`, `description`, `billingCycle`, `currencyCode`
3. POST create endpoint
4. Store returned `id` in wizard state
5. Show toast only on success:
   - `Subscription plan saved as draft`

## Bottom Action Bar

Single source of wizard navigation/actions (no duplicate top-right buttons):

- Back (step 1 → `/admin/subscriptions`; other steps → previous step)
- Save Draft
- Next (steps 1–5)
- Publish Plan (Review & Publish step only; opens publish modal)

## Create Wizard — Step 4 Pricing Form State

`pricingForm`:

- `basePrice` required, min 0, maps to `subscription_plans.base_price`

Read-only from Basics:

- `billingCycle` label via `billingCycleLabel()`
- `baseCurrency` label via `currencyLabel()`

Formatted input:

- Display `12,900.00` with currency prefix
- Parse commas before API call

Draft summary progress order:

1. Modules
2. Features
3. Pricing
4. Limits

Pricing summary states: `Not configured` | `Configured` (Configured only after backend PATCH success)

Limits summary shows `Configured` only after `limitsSaved` signal (backend PATCH success).

## Create Wizard — Step 5 Limits Form State

`limitsForm`:

- `maxOutlets` required, min 1 → `subscription_plans.max_outlets`
- `maxTills` required, min 1 → `subscription_plans.max_tills`
- `maxUsers` required, min 1 → `subscription_plans.max_users`

Guards before PATCH limits:

- `savedPlanId` must exist → else redirect Basics
- `pricingSaved` must be true → else redirect Pricing

Centralized save: `persistLimits({ advanceToReview })`

- Save Draft → PATCH limits, stay on Limits, toast on success
- Next → PATCH limits, navigate to Review & Publish

Limits summary shows `Configured` only after `limitsSaved` signal (backend PATCH success).

Stepper done checkmarks: Basics (`basicsSaved`), Modules/Features (passed after Basics saved), Pricing (`pricingSaved`), Limits (`limitsSaved`).

## Save Draft on Limits

1. Validate limits fields
2. Require `savedPlanId` and `pricingSaved`
3. `PATCH .../limits`
4. Set `limitsSaved` signal; summary shows Configured only after success

## Publish

1. Validate basics, pricing, limits
2. PATCH pricing → PATCH limits → POST publish
3. Navigate to list with toast; list reloads via `loadPage()` on init

## Tests

`platform-create-subscription-plan-page.spec.ts` — **90 tests** including:

- Removed non-R1 fields not rendered
- Real API save flows (create, pricing, limits, publish)
- No duplicate top-right wizard buttons
- Bottom sticky action bar controls
- Pricing/Limits Configured only after backend success
- planId and pricingSaved guards

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../06_DATABASE_KNOWLEDGE/Subscription_Tables]]
