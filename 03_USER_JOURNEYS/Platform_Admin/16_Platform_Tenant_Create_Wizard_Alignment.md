<!-- title: Platform Tenant Create Wizard Alignment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Platform Tenant Create Wizard Alignment

## Uploaded UI vs Implemented Contract

| Uploaded Super Admin step | Angular route step | Backend endpoint / tables |
|---|---|---|
| Business Information | 1 | `POST /tenants` basics + `tenant_profiles` + `tenant_addresses` |
| Plan Selection | 2 | `subscriptionPlanId` → `tenant_subscriptions` |
| Limits & Add-ons | 3 | `limits` overrides + `tenant_subscription_addons` |
| Feature Entitlements | 4 | `enabledFeatureIds/Codes` → `tenant_feature_entitlements` |
| Tenant Admin | 5 | `tenantAdmin` → `tenant_users`, roles, invites |
| Billing & Subscription | 6 | `billingStatus`, `subscription` billing fields, draft invoice |
| Review & Create | 7 | Same `POST /tenants` transaction |

## Create-Options Response

`GET /api/v1/platform-admin/tenants/create-options` returns:

- `plans[]` with `includedFeatureIds` / `includedFeatureCodes`
- `addons[]` with `limitIncrementByKey`
- `catalogModules[]` with nested `features[]`
- lookup arrays: `billingStatuses`, `paymentMethods`, `currencies`, `timezones`, `locales`, `businessTypes`, `operatingModes`, `subscriptionStatuses`, `billingCycles` — each item is `{ value, label }`
- `countryCodes[]` — each item is `{ code, name }` (not `{ value, label }`); Angular maps `code` → dropdown value and `name` → label

Permission: `platform.tenants.create`.

## UI Label vs API Value Mapping

Dropdowns bind to lookup `value` (API code), not `label` (display text).

| UI field | Label example | Posted JSON value | DB column |
|---|---|---|---|
| Country | Sri Lanka | `countryCode: "LK"` | `tenant_profiles.country_code` char(2) |
| Address country | Sri Lanka | `address.countryCode: "LK"` | `tenant_addresses.country_code` char(2) |
| Currency | LKR - Sri Lankan Rupee | `baseCurrency: "LKR"` | `tenants.base_currency` char(3) |
| Billing status | Pending | `billingStatus: "pending"` | `tenants.billing_status` |
| Subscription status | Trial | `subscription.subscriptionStatus: "trial"` | `tenant_subscriptions.subscription_status` |
| Payment method | Manual | `subscription.paymentMethod: "manual"` | subscription billing fields |

**Do not** post full country names into `countryCode`, 2-letter currency codes into `baseCurrency`, or map `subscriptionStatus` into `billingStatus` / `paymentMethod`.

## Billing Field Separation

| Concept | Request field | Allowed values (lowercase API) |
|---|---|---|
| Billing status (tenant) | `billingStatus` | `pending`, `paid`, `overdue`, `failed`, `waived` |
| Subscription lifecycle | `subscription.subscriptionStatus` | `trial`, `active`, `past_due`, `cancelled`, `expired` |
| Payment method | `subscription.paymentMethod` | From create-options `paymentMethods` (`manual`, `bank_transfer`) |

`trial` is a subscription status, not a billing status.

## Create Request Shape (camelCase JSON)

### Wizard vs legacy routing

Backend treats the request as a **wizard create** when any of these are present:

- `tenantAdmin`, `subscription`, non-empty `addons`, `address`, `primaryContact`
- or non-empty `legalName`, `registrationNumber`, `taxNumber`

Otherwise the **legacy minimal** path runs (code + name + plan only).

Wizard requests are validated by `PlatformTenantCreateRequestValidator.ValidateWizard` in the application layer **before** the DB transaction starts.

### Required for wizard path

- `code`, `name`, `subscriptionPlanId`, `tenantAdmin` (with valid `email`)

### Top-level optional fields

- `legalName`, `registrationNumber`, `taxNumber`, `countryCode`, `baseCurrency`, `defaultTimezone`, `defaultLocale`, `operatingMode`, `businessType`, `billingStatus`
- `address`, `primaryContact`, `limits`, `addons`, `enabledFeatureIds`, `enabledFeatureCodes`, `subscription`

### Nested shapes (camelCase)

| Block | Fields |
|---|---|
| `address` | `line1`, `line2`, `city`, `state`, `postalCode`, `countryCode` |
| `primaryContact` | `name`, `email`, `phone` |
| `limits` | `maxOutlets`, `maxTills`, `maxUsers` |
| `addons[]` | `addonId`, `quantity` |
| `tenantAdmin` | `firstName`, `lastName`, `email`, `phone`, `sendInvite` (default `true`), `temporaryPassword` (optional) |
| `subscription` | `billingCycle`, `subscriptionStatus`, `autoRenew`, `createDraftInvoice`, `invoiceEmail`, `paymentMethod`, `notes` |

Angular posts ISO codes uppercased for `countryCode`, `address.countryCode`, and `baseCurrency`.

Legacy minimal create (code + name + plan only) remains supported when wizard-only fields are omitted.

### Validation failure envelope

HTTP 400, `errorCode: platform_tenants.validation_failed`, field-level `errors[]`:

```json
{
  "success": false,
  "message": "One or more tenant create fields are invalid.",
  "errorCode": "platform_tenants.validation_failed",
  "errors": [
    { "field": "countryCode", "message": "Country code must be exactly 2 letters (for example LK)." }
  ],
  "traceId": "..."
}
```

Backend model: `ApplicationError.ValidationFailed` with `ApplicationFieldError(Field, Message)` items. Controller maps to the legacy API envelope above.

### Angular server field mapping

`ApiErrorService.applyFieldErrors` maps backend `errors[].field` to wizard form controls:

| API field | Form control |
|---|---|
| `countryCode` | business country |
| `address.countryCode` | address country |
| `baseCurrency` | currency |
| `billingStatus` | billing status |
| `subscription.subscriptionStatus` | subscription status |
| `subscription.paymentMethod` | payment method |
| `tenantAdmin.email` | tenant admin email |

Raw PostgreSQL/Npgsql messages must not be shown; `isRawDatabaseMessage` replaces them with a safe summary.

## Deferred (not fake in UI)

- Real invite email delivery
- Payment gateway / live payment links
- Post-create outlet/till/product onboarding inside wizard
- Generic audit log table (login audits only exist today)

## Source Files (implementation)

### Backend (Unified-Commerce)

- `src/E_POS.Api/Controllers/PlatformAdminTenantsController.cs`
- `src/E_POS.Application/Modules/PlatformAdministration/Services/PlatformTenantService.Wizard.cs`
- `src/E_POS.Application/Modules/PlatformAdministration/Validators/PlatformTenantCreateRequestValidator.cs`
- `src/E_POS.Application/Modules/PlatformAdministration/Dtos/PlatformTenantCreateOptionsDtos.cs`
- `src/E_POS.Application/Modules/PlatformAdministration/Dtos/PlatformTenantCreateWizardDtos.cs`
- `src/E_POS.Application/Modules/PlatformAdministration/Dtos/PlatformTenantMutationDtos.cs`
- `src/E_POS.Application/Common/Models/ApplicationError.cs`, `ApplicationFieldError.cs`
- `src/E_POS.Infrastructure/Modules/PlatformAdministration/Repositories/PlatformTenantRepository.Wizard.cs`
- `tests/E_POS.UnitTests/PlatformAdministration/PlatformTenantCreateRequestValidatorTests.cs`
- `tests/E_POS.UnitTests/PlatformAdministration/PlatformTenantWizardServiceTests.cs`

### Frontend (nytroz-pos-platform-admin)

- `src/app/features/admin/pages/platform-create-tenant-page/platform-create-tenant-page.ts`
- `src/app/features/admin/mappers/platform-tenant-create.mapper.ts`
- `src/app/features/admin/models/platform-tenant-create.model.ts`
- `src/app/features/admin/validators/platform-tenant-create.validators.ts`
- `src/app/core/services/api-error.service.ts`
- `src/app/features/admin/services/platform-tenant-api.service.ts`

## Branches (pre-commit)

- Angular: `feat/platform-tenant-create-wizard-ui`
- Backend: `feat/platform-tenant-create-wizard-support`
- Docs: `docs/platform-tenant-create-wizard-alignment`

## Verification (2026-07-03)

- Backend `dotnet test`: **266/266 passed** (136 unit + 81 API + 49 integration)
- Frontend `npm test -- --watch=false`: **158/158 passed**
- Frontend `npm run build`: passed (style budget warnings only)
