<!-- title: Platform Tenant Create Wizard Alignment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-02 -->

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
- `catalogModules[]`
- lookup arrays: `billingModes`, `currencies`, `timezones`, `locales`, `businessTypes`, `operatingModes`, `subscriptionStatuses`, `billingCycles`

## Create Request Shape (camelCase JSON)

Required for wizard path:

- `code`, `name`, `subscriptionPlanId`, `tenantAdmin`
- Optional: `legalName`, `registrationNumber`, `taxNumber`, `countryCode`, `address`, `primaryContact`, `limits`, `addons`, `enabledFeatureIds`, `enabledFeatureCodes`, `billingStatus`, `subscription`

Legacy minimal create (code + name + plan only) remains supported when wizard-only fields are omitted.

## Deferred (not fake in UI)

- Real invite email delivery
- Payment gateway / live payment links
- Post-create outlet/till/product onboarding inside wizard
- Generic audit log table (login audits only exist today)

## Branches

- Angular: `feat/platform-tenant-create-wizard-ui`
- Backend: `feat/platform-tenant-create-wizard-support`
- Docs: `docs/platform-tenant-create-wizard-alignment`
