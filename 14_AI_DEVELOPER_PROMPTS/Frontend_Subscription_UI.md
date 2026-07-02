<!-- title: Frontend Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Frontend Subscription UI â€” Implementation Notes

## Rules for Future Changes

- Use only Release 1 DB-backed subscription plan fields in Create Plan UI
- Do not add taxMode, visibility, setupFee, effectiveFrom, or planType to Step 1
- Billing cycle options must match DB: monthly, yearly, custom, trial, demo
- Backend status values: `draft`, `active`, `retired` â€” never expect `published`/`archived` in API responses
- UI labels: Draft / Published (for active) / Archived (for retired)
- No mock subscription plan rows in list or wizard
- Save Draft / Pricing / Limits / Publish must call real backend APIs
- Show success toast only after backend `success: true`
- Bottom sticky action bar is the **only** wizard action source (Back, Save Draft, Next or Publish Plan)
- **No duplicate top-right** Back / Save Draft / Next / Publish buttons on any wizard step
- No sidebar collapse button on subscription screens

## Wizard steps

1. Basics â†’ 2. Modules â†’ 3. Features â†’ 4. Pricing â†’ 5. Limits â†’ 6. Review & Publish

## Real API save flow

| Action | API |
|---|---|
| Basics Save Draft / Next | POST create draft â†’ store `planId`, `basicsSaved` |
| Pricing Save Draft / Next | PATCH pricing (`ensureDraftExistsBeforePricing` if needed) |
| Limits Save Draft / Next | PATCH limits (requires `planId` + `pricingSaved`) |
| Publish | POST publish |
| List | GET list reload |

## Step 1 Allowed Fields

- Plan Name â†’ `name`
- Plan Code â†’ `plan_code`
- Description â†’ `description`
- Billing Cycle â†’ `billing_cycle`
- Currency â†’ `base_currency`
- Status read-only Draft â†’ `status = draft`

## Step 4 Pricing

- Base Price â†’ `base_price` via PATCH pricing only
- Billing Cycle / Currency read-only from Basics
- Pricing summary **Configured** only after PATCH success

## Step 5 Allowed Fields

- Outlet Limit â†’ `max_outlets` (API: `maxOutlets`)
- Till Limit â†’ `max_tills` (API: `maxTills`)
- User Limit â†’ `max_users` (API: `maxUsers`)

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
- `npm test -- --watch=false` â€” **90/90 passed**
- End-to-end: create â†’ pricing â†’ limits â†’ publish â†’ list
- Active plan displays as **Published** in UI

## Related Files

- [[../07_UI_UX_KNOWLEDGE/Platform_Admin_Subscription_UI]]
- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]

## Second Brain Pre-Implementation Audit For Module/Feature Catalog Work

Second Brain path:

`C:\Users\User\Desktop\Nytroz POS - Second Brain\Pos-system-Knowledge`

Before editing backend or Angular for subscription wizard module/feature catalog work, read and verify these Second Brain files/folders:

1. `00_START_HERE/Current_Source_Of_Truth.md`
2. `01_RELEASE_SCOPE/Release_1_Scope.md`
3. `02_ACCESS_CONTROL/`
4. `05_BACKEND_ARCHITECTURE/`
5. `06_DATABASE_KNOWLEDGE/`
6. `09_ANGULAR_ADMIN_KNOWLEDGE/`
7. Any subscription-related docs, especially files whose names contain:
   - `Subscription`
   - `subscription`
   - `Feature_Catalog`
   - `feature_catalog`
   - `Module`
   - `Entitlement`
   - `Permission_Catalog`
   - `permission_catalog`

Specifically search for and inspect:

- `05_Subscription_Plans_Feature_Catalog.md`

Second Brain audit requirements:

- Confirm whether the subscription wizard module/feature catalog contract is already documented.
- Confirm whether the docs still say module/feature catalog endpoints are pending.
- Confirm whether subscription statuses are documented as `draft`, `active`, `retired`.
- Confirm whether any stale `published` / `archived` wording exists.
- Confirm whether the subscription wizard selects modules/features only, not permissions.
- Confirm whether permissions are documented as role-permission responsibility.
- Confirm whether `addon` is documented as Release 1 scope or out of scope.

If Second Brain already has correct documentation:

- Follow it.
- Do not create duplicate documentation.
- Update only stale or incomplete sections.

If Second Brain is missing this topic:

- Create or update the most appropriate subscription documentation file.
- Do not create random new folders.
- Prefer updating an existing subscription-related file.
- If no suitable file exists, create a clearly named file under the existing subscription/backend/admin documentation structure.

After implementation, update Second Brain with:

1. Final catalog read source: `GET /api/v1/platform/subscription-plans/catalog`
2. Final feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`
3. Wizard rule: Subscription wizard selects modules/features only. It must not select permissions.
4. Responsibility split: Subscription Plan = module/feature entitlement. Role Permission = permission assignment.
5. Release 1 availability behavior:
   - `included` = persisted in `subscription_plan_features`
   - `not_available` = removed/not persisted
   - `addon` = rejected/out of scope unless real add-on pricing is implemented
6. Status truth: current backend statuses are `draft`, `active`, `retired`.
7. Filtering rule: subscription wizard must show only tenant/POS entitlement-relevant modules/features. Platform-admin-only modules/features must not be shown unless explicitly documented as tenant-entitled.
8. Final API request/response contracts.
9. Files changed.
10. Tests/build verification results.

Final implementation report must include:

- Which Second Brain files were read.
- Which Second Brain files were updated or created.
- Any stale documentation found.
- Any documentation gaps fixed.
- Any remaining mismatches between code and Second Brain.

## Subscription Wizard Modules/Features Implementation Result (2026-06-25)

Angular now uses the commercial subscription catalog as the subscription wizard catalog source:

- Read: `GET /api/v1/platform/subscription-plans/catalog`
- Save: `PATCH /api/v1/platform/subscription-plans/{planId}/features`

The wizard maps only modules/features and does not expose permission selection. Add-on is out of scope for Release 1 and is not sent.

Filtering rule implemented in Angular:

- Active catalog modules/features only.
- Include `tenant` and `pos` scoped modules/features.
- Fall back to permission `scope`/`source` when module scope is unavailable.
- Exclude platform-admin-only entries.

Verification:

- Angular tests: 117/117 passed.
- Angular build: passed with existing style-budget warnings.
- Live backend smoke covered catalog read, draft create, features save, pricing save, limits save, and publish.

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



