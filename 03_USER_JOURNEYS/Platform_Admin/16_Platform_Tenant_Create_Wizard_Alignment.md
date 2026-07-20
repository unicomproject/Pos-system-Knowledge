<!-- title: Platform Tenant Create Wizard Alignment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Platform Tenant Create Wizard Alignment

## Uploaded UI vs Implemented Contract

| Uploaded Super Admin step | Angular route step | Backend endpoint / tables |
|---|---|---|
| Business Information | 1 | `POST /tenants` basics + `tenant_profiles` + `tenant_addresses` + `tenants.default_locale` / `operating_mode` |
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
| Country | Sri Lanka | `countryCode: "LK"` | `tenant_addresses.country_code` char(2) |
| Address country | Sri Lanka | `address.countryCode: "LK"` | `tenant_addresses.country_code` char(2) |
| Locale | English (United Kingdom) | `defaultLocale: "en-GB"` | `tenants.default_locale` varchar(20) |
| Operating mode | POS Only | `operatingMode: "pos_only"` | `tenants.operating_mode` varchar(40) |
| Business type | Retail | `businessType: "retail"` | `tenant_profiles.business_type_id` → `business_types` |
| Currency | LKR - Sri Lankan Rupee | `baseCurrency: "LKR"` | `tenants.base_currency_code` char(3) |
| Billing status | Pending | `billingStatus: "pending"` | billing fields on subscription / tenant billing status |
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
| `defaultLocale` | locale |
| `operatingMode` | operating mode |

## SA-P0-01 verification (2026-07-20)

See [[SA-P0-01_Tenant_Wizard_Field_Persistence_Fix]].

- Branches: BE/FE `fix/platform-admin-tenant-wizard-field-persistence`; docs `docs/platform-admin-tenant-wizard-persistence-verification`
- Migration: `20260720053000_AddTenantLocaleOperatingModeColumns` applied to local Development `UnifiedCommerceDb` (nullable columns). Production not applied.
- Country rules: equal codes OK; top-level-only creates primary address; conflicting codes rejected.
- Runtime: create `en-GB` / `pos_only` / `retail` / `GB` → details + name-only update + reload preserved values; DB matched.
- Status: **COMPLETE**

## Source file anchors

### Backend (Unified-Commerce)

- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Services/PlatformTenantService.Wizard.cs`
- `src/E_POS.Application/Modules/Platform/PlatformAdmin/Validators/PlatformTenantCreateRequestValidator.cs`
- `src/E_POS.Domain/Modules/Tenant/TenantFoundation/Entities/Tenant.cs`
- `src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Configurations/TenantConfiguration.cs`
- `src/E_POS.Infrastructure/Persistence/Migrations/20260720053000_AddTenantLocaleOperatingModeColumns.cs`
- `tests/E_POS.UnitTests/PlatformAdministration/PlatformTenantCreateRequestValidatorTests.cs`
- `tests/E_POS.UnitTests/PlatformAdministration/PlatformTenantWizardServiceTests.cs`
- `tests/E_POS.IntegrationTests/PlatformAdministration/PlatformTenantRepositoryTests.cs`

### Frontend (nytroz-pos-platform-admin)

- `src/app/features/admin/pages/platform-create-tenant-page/platform-create-tenant-page.ts`
- `src/app/features/admin/mappers/platform-tenant-create.mapper.ts`
- `src/app/features/admin/models/platform-tenant-create.model.ts`
- `src/app/features/admin/validators/platform-tenant-create.validators.ts`
- `src/app/core/services/api-error.service.ts`
- `src/app/features/admin/services/platform-tenant-api.service.ts`
