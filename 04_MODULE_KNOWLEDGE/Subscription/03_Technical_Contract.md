<!-- title: Subscription Technical Contract -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->


# Subscription Technical Contract

## Purpose

This file defines the technical contract for the `Subscription` module.

## API Contract

| Area | Contract |
|---|---|
| API group | `/api/v1/subscriptions` |
| Request format | Typed request DTOs |
| Response format | Typed response DTOs |
| Error format | Standard API error response |
| Tenant context | Resolved server-side |
| Auth | JWT/session based where protected |

## Frontend Contract

Frontend implementation must use:

- Feature folder ownership.
- Typed API services.
- Feature-level state/store.
- Reactive Forms for forms.
- Shared loading/error/empty states.
- Permission and entitlement directives/guards.
- No hardcoded API URLs.
- No hardcoded role checks.
- Tenant-state cleanup on tenant switch.

## Backend Contract

Backend implementation must use:

- Thin API controllers.
- Application services for use cases.
- Domain entities/rules for stable business behavior.
- Repository interfaces in Application layer.
- Repository implementations in Infrastructure layer.
- EF Core mappings and migrations from the updated database design.
- Audit logging for sensitive changes.

## Database Contract

Main database tables:

- `subscription_plans`
- `subscription_plan_features`
- `tenant_subscriptions`
- `tenant_subscription_history`
- `subscription_invoices`
- `subscription_invoice_lines`
- `subscription_payment_links`
- `subscription_payment_transactions`

Entity mappings must preserve table names, column names, tenant foreign keys,
constraints, tenant-aware indexes, and append-only behavior where applicable.

## Permission Contract

Permission codes must be database-seeded values and referenced through
module-wise constants where needed.

Do not implement one global permission enum as the source of truth.

## Data Safety Contract

Never expose password hashes, POS PIN hashes, token hashes, raw setup tokens, raw
activation codes, provider secrets, card data, or cross-tenant records.

## Test Contract

Test cases should cover:

- Happy path.
- Missing authentication.
- Permission denied.
- Feature disabled.
- Tenant isolation.
- Validation failure.
- Duplicate/conflict.
- State cleanup after tenant switch.
- Safe error display.
- Audit creation where required.

## Implementation Sequence

1. Confirm scope and table coverage.
2. Create backend DTOs and services.
3. Create repository and EF mapping if missing.
4. Add permission and entitlement checks.
5. Build frontend route/page/component/store.
6. Add loading/error/empty states.
7. Add tests.
8. Review against Release 1 scope.

## Out of Scope

No full accounting; no direct gateway UI in Angular.

## Platform Admin Subscription Plans List API (Implemented 2026-06-17)

| Item | Contract |
|---|---|
| Endpoint | `GET /api/v1/platform/subscription-plans` |
| Auth | Platform JWT (`PlatformBearer`) |
| Permission | `platform.subscription_plans.view` |
| Data source | `subscription_plans`, `subscription_plan_features`, `tenant_subscriptions` |
| Status values | API returns DB truth: `draft`, `active`, `retired` (no `published`/`archived` aliases in responses) |
| Status filter aliases | List query may accept `published`/`archived` as input aliases; they map to DB `active`/`retired` |
| UI display mapping | Frontend may label DB `active` as **Published** and DB `retired` as **Archived** |
| Billing mapping | DB `yearly` â†’ API `annual`, DB `custom` â†’ API `both` |
| Active tenant count | `tenant_subscriptions` where status in (`trial`, `active`) |
| Add-ons count | Returns `0` until add-on pricing table is confirmed in Release 1 database design |

## Platform Admin Subscription UI (Implemented 2026-06-19)

Frontend status integration:

- API model accepts `draft`, `active`, `retired`
- UI maps labels: Draft / Published / Archived
- List tabs filter with DB values (`active`, `retired`, `draft`)
- Full wizard API flow verified 2026-06-19 (create â†’ pricing â†’ limits â†’ publish â†’ list)

| Item | Contract |
|---|---|
| List route | `/admin/subscriptions` |
| Create route | `/admin/subscriptions/create` |
| List API | `GET /api/v1/platform/subscription-plans` |
| Data binding | Plans, tab counts, pagination, and action flags from API only |
| Modules/features | Loaded via API service; not hardcoded in templates |
| UX rule | Super Admin creates plan templates, not tenant purchases |

## Platform Admin Create/Publish API (Implemented 2026-06-18)

| Item | Contract |
|---|---|
| Create endpoint | `POST /api/v1/platform/subscription-plans` |
| Pricing endpoint | `PATCH /api/v1/platform/subscription-plans/{planId}/pricing` |
| Limits endpoint | `PATCH /api/v1/platform/subscription-plans/{planId}/limits` |
| Publish endpoint | `POST /api/v1/platform/subscription-plans/{planId}/publish` |
| List endpoint | `GET /api/v1/platform/subscription-plans` |
| Create permission | `platform.subscription_plans.create` |
| Pricing permission | `platform.subscription_plans.edit` |
| Limits permission | `platform.subscription_plans.edit` |
| Publish permission | `platform.subscription_plans.edit` |
| List permission | `platform.subscription_plans.view` |
| Create request fields | `planName`, `planCode`, `description`, `billingCycle`, `currencyCode`, optional limits/pricing |
| Pricing request fields | `basePrice` only |
| Limits request fields | `maxOutlets`, `maxTills`, `maxUsers` (>= 0 if provided) |
| DB status on create | `draft` |
| DB status on publish | `active` |
| Publish response status | `active` (same as DB; backend must not return `published`) |
| List item status | `draft`, `active`, or `retired` from DB |

### Step 1 UI field mapping

| UI | DB |
|---|---|
| Plan Name | `subscription_plans.name` |
| Plan Code | `subscription_plans.plan_code` |
| Description | `subscription_plans.description` |
| Billing Cycle | `subscription_plans.billing_cycle` |
| Currency | `subscription_plans.base_currency` |
| Status Draft | `subscription_plans.status = draft` |

Do not send or store in R1 UI:

- taxMode
- visibility
- setupFee
- effectiveFrom
- planType column

### Step 4 Pricing UI field mapping

| UI | DB | Editable on Pricing step |
|---|---|---|
| Billing Cycle | `subscription_plans.billing_cycle` | No (from Basics) |
| Currency | `subscription_plans.base_currency` | No (from Basics) |
| Base Price | `subscription_plans.base_price` | Yes |

Pricing PATCH request: `{ basePrice }` only. Do not update billing cycle or currency on pricing endpoint.

Do not create monthly_price, annual_price, setup_fee, trial_days, or add-on pricing tables in R1.

### Step 5 Limits API field mapping

| Request field | DB column | Editable on Limits step |
|---|---|---|
| `maxOutlets` | `subscription_plans.max_outlets` | Yes |
| `maxTills` | `subscription_plans.max_tills` | Yes |
| `maxUsers` | `subscription_plans.max_users` | Yes |

Limits PATCH request updates only provided fields on **draft** plans.
Response returns saved limits and `status: draft` (DB value).

## Status contract (verified 2026-06-19)

| Layer | Values | Notes |
|---|---|---|
| Database | `draft`, `active`, `retired` | Source of truth |
| API responses | `draft`, `active`, `retired` | Must match DB; no UI-only aliases |
| Frontend display | e.g. Published for `active` | Presentation only; not returned by backend |
| List statusCounts | `published`, `archived` tab bucket names | Count keys only; not plan row status |

Do not create a separate limits table or UI-only limit fields.

## Subscription wizard flow (Platform Admin)

1. Basics
2. Modules
3. Features
4. Pricing
5. Limits
6. Review & Publish

## Real API save flow (verified)

| Step action | API |
|---|---|
| Basics Save Draft / Next | `POST /api/v1/platform/subscription-plans` |
| Pricing Save Draft / Next | `PATCH .../{planId}/pricing` |
| Limits Save Draft / Next | `PATCH .../{planId}/limits` |
| Publish | `POST .../{planId}/publish` |
| List reload | `GET /api/v1/platform/subscription-plans` |

## Frontend UI rules (Release 1)

- No mock/stub/hardcoded runtime subscription rows
- No fake success toast; toast only after backend `success: true`
- No fake module/feature counts (`5 selected`, `12 enabled`)
- Draft Summary from wizard state + backend responses only
- Pricing **Configured** only after PATCH pricing success
- Limits **Configured** only after PATCH limits success
- Bottom sticky action bar is the **single** wizard action source
- No duplicate top-right Back / Save Draft / Next / Publish buttons

## Release 1 DB-backed `subscription_plans` fields

`plan_code`, `name`, `description`, `billing_cycle`, `base_currency`, `base_price`, `max_outlets`, `max_tills`, `max_users`, `status`, `created_at`, `updated_at`

## Not allowed in Release 1 Create Plan UI

taxMode, visibility, setupFee, effectiveFrom, monthlyPrice, annualPrice, trialDays, add-on pricing, revenue preview, extra outlet/till/user price, storage limit, API access limit, product limit

## Verification status (2026-06-22)

| Layer | Result |
|---|---|
| Backend build | Passed (prior); local build may fail if API process locks DLLs |
| Backend tests | 109/109 passed |
| Frontend build | Passed |
| Frontend tests | 90/90 passed |
| Swagger/API manual | create â†’ pricing â†’ limits â†’ publish â†’ list |
| DB manual | `base_price`, limits, `status = active` confirmed |

## Permission and Error State Rules (Verified 2026-06-17)

| Action | Permission |
|---|---|
| List plans API | `platform.subscription_plans.view` |
| Create Plan button | `platform.subscription_plans.create` |
| Edit / duplicate / archive / delete | Respective `platform.subscription_plans.*` codes via API `can*` flags |

Login response includes resolved `platformPermissions` from role-permission mapping.
Frontend permission checks are UX only; backend remains final authority.

## Related Files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/Clean_Architecture_Layers]]
- [[../../09_ANGULAR_ADMIN_KNOWLEDGE/Angular_Module_Implementation_Guide]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Module_Implementation_Guide]]

## Platform Admin Modules/Features Save Contract (Implemented 2026-06-25)

Catalog read source:

- `GET /api/v1/platform/subscription-plans/catalog`
- The endpoint projects commercial subscription modules/features from backend `platform_features` subscription metadata.
- Do not map permission catalog modules directly as subscription modules.
- Platform-admin-only and Release 2/deferred features must not be shown.

Feature save endpoint:

- `PATCH /api/v1/platform/subscription-plans/{planId}/features`
- Permission: `platform.subscription_plans.edit`
- Draft-only: active/retired plans must be rejected.

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

Release 1 availability behavior:

- `included` = persisted as enabled rows in `subscription_plan_features`.
- `not_available` = removed/not persisted in `subscription_plan_features`.
- `addon` = rejected/out of scope unless real add-on pricing is implemented.

Responsibility split:

- Subscription Plan = module/feature entitlement.
- Role Permission = permission assignment.
- Subscription wizard selects modules/features only and must not select permissions.

Verification:

- Backend unit tests: 127/127 passed.
- Backend solution build: passed.

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

