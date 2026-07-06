<!-- title: Tenant Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Tenant Management Flow

## Purpose

Defines how Platform Admin searches, reviews, manages tenant accounts, and edits tenant feature entitlements from tenant detail.

## Actor

Platform Admin

## Source

Derived from `Slide 3 - Tenant Management Flow` in `SYSTEM_USER_JOURNEY.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Platform Admin opens Tenant Management from dashboard or menu.

## Preconditions

- Platform Admin is authenticated.
- Tenant list/detail requires `platform.tenants.view`.
- Entitlement editing requires `platform.tenants.entitlements.update` and an existing tenant subscription.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open tenant management | System opens tenant management module. |
| 2 | Load tenant list | System loads tenants with summary information via `GET /api/v1/platform-admin/tenants`. |
| 3 | Search or filter tenants | Platform Admin narrows tenants by status, billing, plan, or search term. |
| 4 | Review tenant row summary | System shows tenant name, plan, status, outlet/till counts, and derived online-store flags. |
| 5 | Open tenant detail | System loads `GET /api/v1/platform-admin/tenants/{tenantId}` including `enabledFeatureIds`, `enabledFeatureCodes`, subscription, and action flags (`canActivate`, `canSuspend`, `canManageEntitlements`). |
| 6 | Activate or suspend | When permitted, lifecycle actions use `POST .../activate` or `POST .../suspend`. |
| 7 | Edit entitlements | When `canManageEntitlements` is true, editor loads `GET .../tenants/{tenantId}/entitlement-options` (not create-options). |
| 8 | Select plan and features | UI shows active plans and catalog modules from entitlement-options. Checkboxes are limited to features included in the selected plan. |
| 9 | Save entitlements | UI posts `PUT .../tenants/{tenantId}/entitlements` with `subscriptionPlanId` (optional plan change) and selected `enabledFeatureIds` / `enabledFeatureCodes`. |
| 10 | Refresh detail | System reloads tenant detail so enabled arrays and boolean flags reflect saved state. |

## Entitlement Editor Rules

- Load editor data from `GET /api/v1/platform-admin/tenants/{tenantId}/entitlement-options` only.
- Do **not** use `GET /api/v1/platform-admin/tenants/create-options` (requires `platform.tenants.create`).
- Do **not** hardcode feature codes in UI; use `catalogModules[].features` and plan `includedFeatureIds/Codes` from the API.
- Pre-select current enabled features from `enabledFeatureIds` on detail or entitlement-options.
- Allowed selections must stay within the selected plan's included feature set (same rule as create wizard step 4).

See [[17_Platform_Tenant_Detail_Entitlements_Alignment]] for full DTO shapes.

## Data Used Or Captured

- Tenant profile and subscription summary
- Tenant status and billing status
- Outlet, till, and user counts
- Enabled feature IDs and codes (`tenant_feature_entitlements`)
- Optional subscription plan change on entitlement save

## Access And Security Rules

- Platform Admin must be authenticated.
- Backend enforces permission codes; frontend guards and `canManageEntitlements` are UX only.
- Platform-level actions must not use frontend-provided `tenant_id` as trusted authority.
- Tenant status changes and entitlement updates must be audit logged.
- Entitlement updates require `platform.tenants.entitlements.update`.

## Validation And Error Cases

- Tenant not found → HTTP 404 `platform_tenants.not_found`
- Permission denied → HTTP 403 `platform_tenants.access_denied`
- Invalid status transition → HTTP 409 `platform_tenants.invalid_transition`
- Tenant subscription missing on entitlement edit → HTTP 400 `platform_tenants.validation_failed`
- Feature not included in plan → HTTP 400 validation failure from entitlement service
- Concurrent tenant update conflict

## Outcome

Platform Admin has central control over tenant records and can adjust plan-bound feature entitlements without using the create wizard.

## Related Modules

- 01_Platform_Administration
- 02_Tenant_Foundation
- 03_Subscription_Catalog_Entitlements
- 04_Subscription_Billing_Usage

## Related Files

- [[17_Platform_Tenant_Detail_Entitlements_Alignment]]
- [[16_Platform_Tenant_Create_Wizard_Alignment]]
- [[06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation]]
- [[02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
