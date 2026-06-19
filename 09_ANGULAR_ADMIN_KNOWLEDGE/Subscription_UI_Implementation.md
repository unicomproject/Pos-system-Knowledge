<!-- title: Subscription UI Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-19 -->

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

- Back (step 1 → `/admin/subscriptions`; pricing → features)
- Save Draft
- Next

Top-right action group duplicates bottom controls on all wizard steps.

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

Pricing summary states: `Not configured` | `In progress` | `Configured`

Limits summary shows `Configured` only after Limits step completed (`limitsStepCompleted` signal).

## Save Draft on Limits

1. Validate limits fields
2. Create draft if no `savedPlanId`
3. `PATCH .../limits`
4. Set `limitsSaved` signal; summary shows Configured

## Publish

1. Validate basics, pricing, limits
2. PATCH pricing → PATCH limits → POST publish
3. Navigate to list with toast; list reloads via `loadPage()` on init

## Tests

`platform-create-subscription-plan-page.spec.ts` verifies:

- Removed fields not rendered
- R1 basics fields rendered
- Save Draft calls API
- Success toast only after API success
- Back navigation from step 1

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../06_DATABASE_KNOWLEDGE/Subscription_Tables]]
