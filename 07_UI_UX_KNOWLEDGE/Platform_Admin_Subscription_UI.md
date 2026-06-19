<!-- title: Platform Admin Subscription UI -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-19 -->

## Scope

Super Admin subscription plan template management only. This is not a tenant
purchase or payment checkout flow.

## Routes

| Route | Page |
|---|---|
| `/admin/subscriptions` | Subscription Plans list |
| `/admin/subscriptions/create` | Create Subscription Plan wizard |

Sidebar item **Subscriptions** stays active for all routes under
`/admin/subscriptions/*`.

Do not show sidebar collapse button on subscription screens.

## Create Plan Wizard — Step 1 Basics (Latest UI)

Layout:

- Page breadcrumb: `Subscriptions / Create Plan`
- Title: **Create Subscription Plan**
- Subtitle: Build a subscription package for your tenants.
- Six-step stepper: Basics → Modules → Features → Pricing → Limits → Review & Publish
- Left card: Plan Basics
- Right sticky card: Draft Summary
- Top-right action buttons: Back, Save Draft, Next
- Bottom sticky action bar:
  - Left: **Back** (step 1 returns to list)
  - Right: **Save Draft** and **Next**

### Allowed Step 1 fields (Release 1 DB-backed)

| UI field | DB column |
|---|---|
| Plan Name | `subscription_plans.name` |
| Plan Code | `subscription_plans.plan_code` |
| Description | `subscription_plans.description` |
| Billing Cycle | `subscription_plans.billing_cycle` |
| Currency | `subscription_plans.base_currency` |
| Status (read-only Draft) | `subscription_plans.status = draft` |

Billing cycle options:

- `monthly`
- `yearly`
- `custom`
- `trial`
- `demo`

### Removed non-R1 fields

Do not render in Create Plan UI:

- `taxMode`
- `visibility`
- `setupFee`
- `effectiveFrom`
- `planType`

### Draft Summary rules

Shows live values for:

- Plan Name
- Plan Code
- Billing Cycle
- Currency
- Status: Draft

Progress placeholders until later steps are configured:

- Modules: Not selected
- Features: Not selected
- Limits: Not configured
- Pricing: Not configured

Do not show tenant monthly price in Step 1 summary.

### Status wording

UI label may say **Publish**, but database status uses existing DB values:

- draft → `draft`
- publish → `active`
- archive → `retired`

Status info box text:

> Plan is in draft until you publish it. Only active plans can be assigned to tenants.

### Save Draft behavior

Minimum required fields:

- planName
- planCode
- billingCycle
- baseCurrency

Calls `POST /api/v1/platform/subscription-plans`.

Success toast only after backend success:

> Subscription plan saved as draft

## Create Plan Wizard — Step 4 Pricing (Latest UI)

Layout matches Step 1 shell:

- Step 4 **Pricing** active in stepper
- Left card: **Base Pricing**
- Right sticky card: **Draft Summary**
- Top-right and bottom action bars: Back, Save Draft, Next

### Allowed Pricing fields (Release 1 DB-backed)

| UI field | DB column | Editable |
|---|---|---|
| Billing Cycle | `subscription_plans.billing_cycle` | Read-only (from Basics) |
| Currency | `subscription_plans.base_currency` | Read-only (from Basics) |
| Base Price | `subscription_plans.base_price` | Yes |

Helper text:

- Billing Cycle / Currency: Selected in Basics step.
- Base Price: This is the base subscription price for the selected billing cycle.

Blue info box:

> This base price will be used for tenant subscription billing based on the selected billing cycle.

### Removed non-R1 pricing fields

Do not render:

- Monthly Price
- Annual Price
- Trial Days
- Setup Fee
- Add-on Pricing
- Revenue Preview
- Annual discount / Save percentage
- Tax fields
- Payment checkout wording

### Draft Summary on Pricing step

Top rows:

- Plan Name
- Plan Code
- Billing Cycle
- Currency
- Base Price (when on Pricing step or value entered)
- Status: Draft

Progress order (must follow wizard order):

1. Modules — e.g. `5 selected`
2. Features — e.g. `12 enabled`
3. Pricing — `Not configured` | `In progress` | `Configured`
4. Limits — `Not configured` until Limits step completed

Pricing status rules:

- **Not configured** — base price empty
- **In progress** — value entered but invalid
- **Configured** — valid base price `>= 0`

Limits must not show **Configured** on Pricing step unless user completed Limits and navigated back.

### Save Draft on Pricing step

1. Validate Basics minimum fields
2. Validate base price when on Pricing step
3. If no draft id → `POST /api/v1/platform/subscription-plans`
4. Then `PATCH /api/v1/platform/subscription-plans/{id}/pricing` with `{ basePrice }`
5. Success toast only after backend success

### Save Draft on Limits step

1. Validate basics + limits (maxOutlets, maxTills, maxUsers)
2. Create draft if no `savedPlanId`
3. `PATCH .../limits`
4. Toast only on backend success; Draft Summary Limits = Configured after save

### Publish

1. PATCH pricing + PATCH limits (if not already saved)
2. `POST .../publish` → response `status: active`
3. Navigate to `/admin/subscriptions` with success toast; list reloads from backend

## Verified end-to-end (2026-06-19)

API + DB flow on `nytroz_pos_dev`:

- POST create → `status: draft`
- PATCH pricing → `base_price: 12900`
- PATCH limits → `5/10/25`
- POST publish → `status: active`
- GET list → item `status: active`, UI label Published

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/platform/subscription-plans` | List plans |
| `POST /api/v1/platform/subscription-plans` | Create draft plan |
| `PATCH /api/v1/platform/subscription-plans/{id}/pricing` | Update draft base price |
| `PATCH /api/v1/platform/subscription-plans/{id}/limits` | Update draft limits |
| `POST /api/v1/platform/subscription-plans/{id}/publish` | Publish draft to active |

## Status display contract

| Backend/API status | UI label | Badge color |
|---|---|---|
| `draft` | Draft | Amber/orange |
| `active` | Published | Green |
| `retired` | Archived | Gray |

- Backend returns `draft`, `active`, `retired` only
- Frontend must not expect `published` or `archived` in API row status
- List tabs: Published → filter `active`; Archived → filter `retired`
- `statusCounts.published` / `statusCounts.archived` are count bucket keys only

## Related Files

- [[../09_ANGULAR_ADMIN_KNOWLEDGE/Subscription_UI_Implementation]]
- [[../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
- [[../14_AI_DEVELOPER_PROMPTS/Frontend_Subscription_UI]]
