<!-- title: Platform Subscription Plan API Endpoints -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Platform Subscription Plan API Endpoints

Base route: `/api/v1/platform/subscription-plans`

All endpoints require platform JWT authentication.

## Endpoints

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.view` | List subscription plans |
| GET | `/api/v1/platform/subscription-plans/catalog` | `platform.subscription_plans.view` | Read commercial subscription catalog |
| POST | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.create` | Create draft plan |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/pricing` | `platform.subscription_plans.edit` | Save draft `base_price` |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/limits` | `platform.subscription_plans.edit` | Save draft outlet/till/user limits |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/features` | `platform.subscription_plans.edit` | Save draft module/feature entitlements |
| POST | `/api/v1/platform/subscription-plans/{planId}/publish` | `platform.subscription_plans.edit` | Publish draft â†’ DB `active` |

## Release 1 write flow

1. **Create draft** â€” basics fields on `subscription_plans`
2. **Update pricing** â€” `base_price` only, draft status required
3. **Update features** â€” module/feature entitlement only, draft status required
4. **Update limits** â€” `max_outlets`, `max_tills`, `max_users`, draft status required
5. **Publish** â€” status `draft` â†’ `active`; API response returns `status: active`

## Status contract

| Layer | Values |
|---|---|
| Database | `draft`, `active`, `retired` |
| API plan `status` field | Same DB values (no `published`/`archived` in responses) |
| Frontend labels | UI may show Published for `active`; backend does not |

Publish response example: `{ "status": "active", ... }`

## Verification (2026-06-22)

- Swagger at `http://localhost:5050`
- Full flow: POST create â†’ PATCH pricing â†’ PATCH limits â†’ POST publish â†’ GET list
- DB table `subscription_plans`: `base_price`, `max_outlets`, `max_tills`, `max_users`, `status = active`
- Backend unit tests: **109/109 passed**

## Limits request example

```json
{
  "maxOutlets": 5,
  "maxTills": 10,
  "maxUsers": 25
}
```

## Related Files

- [[../../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]
- [[../../06_DATABASE_KNOWLEDGE/Subscription_Tables]]

---

# Permission Catalog API Endpoints

See [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]] for full
architecture, frontend routes, alias rules, and known gaps.

## Platform Admin

Base: `/api/v1/platform-admin/permission-catalog`

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/platform-admin/permission-catalog` | `platform.permissions.view` |
| GET | `/api/v1/platform-admin/permission-catalog/flat` | `platform.permissions.view` |

## Tenant Admin

| Method | Route | Permission |
|---|---|---|
| GET | `/api/v1/tenant-admin/permission-catalog` | `roles.permissions.view` |
| GET | `/api/v1/tenant-admin/roles/{roleId}/permissions` | `roles.permissions.view` |
| PUT | `/api/v1/tenant-admin/roles/{roleId}/permissions` | `roles.permissions.update` |
| GET | `/api/v1/tenant-admin/context` | Authenticated; includes `effectivePermissions`, `enabledFeatures` |

## Verification (2026-06-23)

| Layer | Tests | Commit |
|---|---|---|
| Backend | Build passed; migration applied; catalog GET/role GET/role PUT passed | `0c7008e8fda4c9eb0892b44cfe2468155f73ebf6` |
| Angular | 95/95 passed | `9626a85f28bccf379b3bf48d6f51de9718b2bace` |
| Flutter | 90/90 passed | `18e1b29` (`Nytroz-POS-App`) |

Tenant Admin save verification used real backend APIs, not mock data:

- `GET /api/v1/tenant-admin/permission-catalog`: 5 modules / 99 permissions.
- `GET /api/v1/tenant-admin/roles/{roleId}/permissions`: `tenant_admin_dev`, 84 assigned permissions.
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`: `activity.view` toggled off successfully.
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`: `activity.view` toggled back on successfully.

The final backend fix was migration
`20260623103000_LinkTenantAdminSalesPermissions`, which links `sales.*`
tenant-admin permissions to the Tenant Admin `sales` catalog feature.

---

# Platform Admin Role Management API Endpoints

See [[../02_ACCESS_CONTROL/Platform_Admin_Role_Management]] for the full contract, DTOs, system-role protection, validation, and smoke-test result.

Base: `/api/v1/platform-admin/roles`

All endpoints require platform JWT authentication.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/roles` | `platform.roles.view` | List platform roles with user and permission counts |
| POST | `/api/v1/platform-admin/roles` | `platform.roles.create` | Create non-system platform role |
| PUT | `/api/v1/platform-admin/roles/{roleId}` | `platform.roles.update` | Update non-system role name, description, status |
| GET | `/api/v1/platform-admin/roles/{roleId}/permissions` | `platform.roles.permissions.view` | Read assigned platform permissions |
| PUT | `/api/v1/platform-admin/roles/{roleId}/permissions` | `platform.roles.permissions.update` | Replace assigned platform permissions |

Verification on 2026-06-23 used real backend APIs: login `posunique001@gmail.com` / `123456`, catalog returned 15 modules, `super_administrator` returned 14 assigned permissions including the new role codes, smoke role `qa_platform_role_145431` was created, and two permissions were assigned through PUT successfully.

## Platform Admin Role Detail Endpoint 2026-06-23

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/roles/{roleId}` | `platform.roles.view` | Load one platform role detail for edit/view screens |

Response data includes `id`, `code`, `name`, `description`, `isSystem`, `status`, `assignedUserCount`, `permissionCount`, `createdAt`, and `updatedAt`.

Missing roles return the standard API error response with HTTP 404 and error code `NOT_FOUND`.

Smoke verification used a real Platform Admin JWT and passed for role list, role detail, and role permissions endpoints.

## Subscription Features Endpoint Update (2026-06-25)

Endpoint added: `PATCH /api/v1/platform/subscription-plans/{planId}/features`

Permission: `platform.subscription_plans.edit`

Catalog read source for the subscription wizard is the commercial subscription catalog: `GET /api/v1/platform/subscription-plans/catalog`. Do not map permission catalog modules directly as commercial subscription modules.

Request shape:

```json
{
  "featureAvailability": {
    "11111111-1111-1111-1111-111111111111": "included",
    "22222222-2222-2222-2222-222222222222": "not_available"
  }
}
```

Response data shape:

```json
{
  "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "includedFeatureIds": ["11111111-1111-1111-1111-111111111111"],
  "status": "draft"
}
```

Validation and persistence rules:

- Plan must exist and must be `draft`.
- Feature IDs must parse as GUIDs and exist as active `platform_features` rows.
- Allowed values are `included` and `not_available` only.
- `addon` is rejected in Release 1 unless real add-on pricing is implemented.
- `included` rows are persisted in `subscription_plan_features`.
- `not_available` rows are removed from `subscription_plan_features`.
- Subscription wizard selects modules/features only; it must not select permissions.
- Role Permission screens/APIs remain responsible for permission assignment.
- Wizard must show only tenant/POS entitlement-relevant modules/features; platform-admin-only catalog entries must stay hidden unless explicitly documented as tenant-entitled.

Verification:

- `dotnet test tests\SCS.UnitTests\SCS.UnitTests.csproj --no-restore`: 127/127 passed.
- `dotnet build SCS.sln --no-restore`: passed after stopping a stale local `.NET Host` process that locked API DLLs.

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

