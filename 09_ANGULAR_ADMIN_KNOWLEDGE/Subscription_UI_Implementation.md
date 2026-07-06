<!-- title: Subscription UI Implementation -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

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
| `updateSubscriptionPlanFeatures()` | `PATCH /api/v1/platform/subscription-plans/{id}/features` |
| `publishSubscriptionPlan()` | `POST /api/v1/platform/subscription-plans/{id}/publish` |

## Status model

```typescript
type SubscriptionPlanStatus = 'draft' | 'active' | 'retired';
```

Display mapping in `subscription-plan-status.util.ts`:

- `draft` â†’ Draft
- `active` â†’ Published
- `retired` â†’ Archived

List tab filters send DB values (`active`, `retired`, `draft`) to backend.

## Create Wizard â€” Step 1 Form State

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

- Back (step 1 â†’ `/admin/subscriptions`; other steps â†’ previous step)
- Save Draft
- Next (steps 1â€“5)
- Publish Plan (Review & Publish step only; opens publish modal)

## Create Wizard â€” Step 4 Pricing Form State

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

## Create Wizard â€” Step 5 Limits Form State

`limitsForm`:

- `maxOutlets` required, min 1 â†’ `subscription_plans.max_outlets`
- `maxTills` required, min 1 â†’ `subscription_plans.max_tills`
- `maxUsers` required, min 1 â†’ `subscription_plans.max_users`

Guards before PATCH limits:

- `savedPlanId` must exist â†’ else redirect Basics
- `pricingSaved` must be true â†’ else redirect Pricing

Centralized save: `persistLimits({ advanceToReview })`

- Save Draft â†’ PATCH limits, stay on Limits, toast on success
- Next â†’ PATCH limits, navigate to Review & Publish

Limits summary shows `Configured` only after `limitsSaved` signal (backend PATCH success).

Stepper done checkmarks: Basics (`basicsSaved`), Modules/Features (passed after Basics saved), Pricing (`pricingSaved`), Limits (`limitsSaved`).

## Save Draft on Limits

1. Validate limits fields
2. Require `savedPlanId` and `pricingSaved`
3. `PATCH .../limits`
4. Set `limitsSaved` signal; summary shows Configured only after success

## Publish

1. Validate basics, pricing, limits
2. PATCH pricing â†’ PATCH limits â†’ POST publish
3. Navigate to list with toast; list reloads via `loadPage()` on init

## Tests

`platform-create-subscription-plan-page.spec.ts` â€” **90 tests** including:

- Removed non-R1 fields not rendered
- Real API save flows (create, pricing, limits, publish)
- No duplicate top-right wizard buttons
- Bottom sticky action bar controls
- Pricing/Limits Configured only after backend success
- planId and pricingSaved guards

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../06_DATABASE_KNOWLEDGE/Subscription_Tables]]

## Create Wizard Modules/Features Integration (Implemented 2026-06-25)

API service updates:

- `getSubscriptionCatalog()` reads `GET /api/v1/platform/subscription-plans/catalog` and maps commercial subscription modules.
- Features are mapped from nested commercial catalog module features, not from permission catalog modules.
- `updateSubscriptionPlanFeatures(planId, request)` calls `PATCH /api/v1/platform/subscription-plans/{planId}/features`.

Request shape:

```typescript
{
  featureAvailability: Record<string, 'included' | 'not_available'>;
}
```

Response shape:

```typescript
{
  id: string;
  includedFeatureIds: string[];
  status: 'draft' | 'active' | 'retired' | string;
}
```

Wizard behavior:

- Step order remains Basics -> Modules -> Features -> Pricing -> Limits -> Review & Publish.
- Modules load from the backend permission catalog.
- Module selection controls which feature groups appear.
- Features are grouped by selected module.
- Features can be marked `included` or `not_available` only.
- `addon` is not rendered and is not sent.
- Features step Next/Save Draft persists through the PATCH features endpoint.
- Review/Draft Summary shows selected module count, selected feature count, selected module names, and selected feature names grouped by module.
- Pricing, limits, and publish behavior remain unchanged.

Filtering rule:

- Active modules/features only.
- Primary rule: `module.scope in ('tenant', 'pos')`.
- Fallback rule: include features only if permission `scope` or `source` is `tenant` or `pos` when module scope is missing.
- Platform-admin-only catalog entries are excluded.

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


