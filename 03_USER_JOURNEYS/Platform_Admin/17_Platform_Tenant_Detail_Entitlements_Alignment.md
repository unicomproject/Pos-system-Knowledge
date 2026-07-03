<!-- title: Platform Tenant Detail Entitlements Alignment -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Platform Tenant Detail Entitlements Alignment

## Scope

Platform Admin edits tenant feature entitlements from **Tenant Detail** (`/admin/tenants/{tenantId}`), not from the tenant create wizard.

This slice uses dedicated read endpoints under `platform.tenants.view` / `platform.tenants.entitlements.update`. It does **not** call `GET /api/v1/platform-admin/tenants/create-options` (that endpoint requires `platform.tenants.create`).

## Screen vs Backend

| UI action | API | Permission |
|---|---|---|
| Load tenant detail (read-only flags + full enabled list) | `GET /api/v1/platform-admin/tenants/{tenantId}` | `platform.tenants.view` |
| Open entitlement editor | `GET /api/v1/platform-admin/tenants/{tenantId}/entitlement-options` | `platform.tenants.entitlements.update` |
| Save plan and/or features | `PUT /api/v1/platform-admin/tenants/{tenantId}/entitlements` | `platform.tenants.entitlements.update` |

Detail also exposes `canManageEntitlements` when the session has `platform.tenants.entitlements.update`.

## Detail response — entitlement fields

In addition to legacy boolean flags (`onlineStoreEnabled`, `clickCollectEnabled`, `offlineEnabled`), tenant detail now returns the authoritative enabled set from `tenant_feature_entitlements`:

```json
{
  "enabledFeatureIds": ["88888888-8888-4888-8888-888888888801"],
  "enabledFeatureCodes": ["online_store"]
}
```

Only rows with `entitlement_status = ENABLED` are included. Angular should prefer these arrays over inferring state from the three boolean flags alone.

## Entitlement-options response

`GET /api/v1/platform-admin/tenants/{tenantId}/entitlement-options`

Requires an existing tenant subscription; otherwise backend returns HTTP 400 `platform_tenants.validation_failed` with message `Tenant subscription was not found.`

```json
{
  "success": true,
  "data": {
    "tenantId": "11111111-1111-4111-8111-111111111111",
    "currentSubscriptionPlanId": "77777777-7777-4777-8777-777777777711",
    "currentSubscriptionPlanCode": "STARTER",
    "currentSubscriptionPlanName": "Starter Plan",
    "enabledFeatureIds": ["88888888-8888-4888-8888-888888888801"],
    "enabledFeatureCodes": ["online_store"],
    "plans": [
      {
        "id": "77777777-7777-4777-8777-777777777711",
        "code": "STARTER",
        "name": "Starter Plan",
        "status": "active",
        "includedFeatureIds": ["88888888-8888-4888-8888-888888888801"],
        "includedFeatureCodes": ["online_store"]
      }
    ],
    "catalogModules": [
      {
        "id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "code": "commerce",
        "name": "Commerce",
        "features": [
          {
            "id": "88888888-8888-4888-8888-888888888801",
            "code": "online_store",
            "name": "Online Store",
            "description": "Online store entitlement"
          }
        ]
      }
    ]
  }
}
```

Source tables:

- Current enabled set → `tenant_feature_entitlements` joined to `platform_features`
- Plans + inclusions → `subscription_plans` + `subscription_plan_features` (status `included`)
- Catalog → `platform_modules` + `platform_features` (active only)

## Save request

`PUT /api/v1/platform-admin/tenants/{tenantId}/entitlements`

Replaces the tenant's enabled feature rows and may change subscription plan when `subscriptionPlanId` is supplied.

```json
{
  "subscriptionPlanId": "77777777-7777-4777-8777-777777777711",
  "enabledFeatureIds": ["88888888-8888-4888-8888-888888888801"],
  "enabledFeatureCodes": ["online_store"]
}
```

`enabledFeatureIds` and/or `enabledFeatureCodes` may be sent; backend resolves against active platform features. At least one enabled feature is required when the update runs. Features must belong to the effective subscription plan's included set.

## Plan-constrained feature selection (UI rule)

Mirror the create wizard step 4 rule, but use **entitlement-options** data:

1. User selects a plan from `plans[]` (defaults to `currentSubscriptionPlanId`).
2. Allowed checkboxes = intersection of `catalogModules[].features` and the selected plan's `includedFeatureIds` / `includedFeatureCodes`.
3. Pre-check boxes using `enabledFeatureIds` from entitlement-options (or detail).
4. On save, POST only resolved `enabledFeatureIds` / `enabledFeatureCodes` through the PUT entitlements endpoint.

**Do not** hardcode feature codes such as `online_store`, `click_collect`, or `offline_operation_sync` in the tenant detail UI. **Do not** call `GET .../tenants/create-options` for this editor.

## Permissions

| Permission | Use |
|---|---|
| `platform.tenants.view` | Tenant list, tenant detail (includes `enabledFeatureIds/Codes`) |
| `platform.tenants.entitlements.update` | Load entitlement-options, save entitlements |

## Verification (2026-07-03)

- Backend branch `feat/platform-tenant-entitlements-read-contract` commit `8e65c32`
- Backend `dotnet test`: **291/291 passed** (148 unit + 52 integration + 91 API)

## Related Files

- [[03_USER_JOURNEYS/Platform_Admin/03_Tenant_Management_Flow]]
- [[03_USER_JOURNEYS/Platform_Admin/16_Platform_Tenant_Create_Wizard_Alignment]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/03_Technical_Contract]]
- [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
