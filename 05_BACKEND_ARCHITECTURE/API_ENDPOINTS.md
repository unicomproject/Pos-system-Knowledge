<!-- title: Platform Subscription Plan API Endpoints -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-10 -->

# Platform Subscription Plan API Endpoints

## Tenant POS Login (Unified Commerce)

Base route: `/api/v1/tenant-auth`

| Method | Route | Unified Commerce status |
|---|---|---|
| POST | `/api/v1/tenant-auth/login` | **Implemented** — Flutter `ApiEndpoints.tenantLogin` |
| POST | `/api/v1/tenant-auth/logout` | **Implemented** |

Obsolete route `POST /api/v1/auth/tenant-login` belonged to legacy `SCS.Api`.
Do not use it for Unified-Commerce integration.

Request body (Flutter contract):

```json
{
  "email": "cashier001@gmail.com",
  "password": "123456"
}
```

Tenant Code is not accepted from the POS login screen. Backend resolves tenant
from the tenant user email.

> **Active backend:** `POS Backend/Unified-Commerce` · `E_POS.Api`
>
> **Obsolete:** `Nytroz-POS-Backend` / `SCS.Api` — see
> [[../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]]

## Unified Commerce Cashier Bootstrap APIs (Verified 2026-07-10)

| Method | Route | Status | Flutter wired |
|---|---|---|---|
| POST | `/api/v1/tenant-auth/login` | Implemented | Yes |
| GET | `/api/v1/devices/current` | Implemented | Yes |
| POST | `/api/v1/devices/activate` | Implemented | Yes |
| GET | `/api/v1/tills/current-session` | Implemented | Yes |
| POST | `/api/v1/tills/open` | Implemented | Yes |
| POST | `/api/v1/tills/close` | Implemented | Yes |
| GET | `/api/v1/pos/home` | Implemented | Yes |
| GET | `/api/v1/pos/products` | Implemented on `Sale_Screen` branch | Yes |

Query notes:

- `GET /api/v1/pos/home` and `GET /api/v1/pos/products` accept optional
  `deviceId`, `tillId`, `outletId` where documented in implementation status
  files.
- `GET /api/v1/pos/products` requires `deviceId` and `products.view`.
- `GET /api/v1/pos/products/by-barcode/{barcode}` requires `deviceId`, product
  view/search permission, and an active trusted device assigned to an active
  outlet. It performs exact, tenant-scoped active barcode equality and returns
  the exact matched barcode, resolved variant, `quantityPerScan`, default active
  price, and current-outlet stock. Product-level barcodes with multiple sellable
  variants return `409 pos_barcode.ambiguous`.

See [[../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Pos_Home_Dashboard_Implementation_Status]]
and [[../15_IMPLEMENTATION_TRACKING/Backend/CatalogProduct/Pos_Products_List_Implementation_Status]].

Base route: `/api/v1/platform/subscription-plans`

All endpoints require platform JWT authentication.

## Endpoints

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.view` | List subscription plans |
| POST | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.create` | Create draft plan |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/pricing` | `platform.subscription_plans.edit` | Save draft `base_price` |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/limits` | `platform.subscription_plans.edit` | Save draft outlet/till/user limits |
| POST | `/api/v1/platform/subscription-plans/{planId}/publish` | `platform.subscription_plans.edit` | Publish draft → DB `active` |

## Release 1 write flow

1. **Create draft** — basics fields on `subscription_plans`
2. **Update pricing** — `base_price` only, draft status required
3. **Update limits** — `max_outlets`, `max_tills`, `max_users`, draft status required
4. **Publish** — status `draft` → `active`; API response returns `status: active`

## Status contract

| Layer | Values |
|---|---|
| Database | `draft`, `active`, `retired` |
| API plan `status` field | Same DB values (no `published`/`archived` in responses) |
| Frontend labels | UI may show Published for `active`; backend does not |

Publish response example: `{ "status": "active", ... }`

## Verification (2026-06-22)

- Swagger at `http://localhost:5050`
- Full flow: POST create → PATCH pricing → PATCH limits → POST publish → GET list
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

---

# Documented Release 1 Implementations

The sections below record confirmed Release 1 endpoints already implemented in the
backend and integrated by frontends.

---

# Platform Dashboard API Endpoints

Base route: `/api/v1/platform-admin/dashboard`

All endpoints require platform JWT authentication.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/dashboard` | `platform.dashboard.view` | Load platform dashboard KPIs and attention items |

### Dashboard response contract (attention)

Top-level counts include `totalTenants`, `activeTenants`, `suspendedTenants`, `trialTenants`, subscription totals, `pendingBillingCount`, outlet/till/user totals, `recentTenants`, `attentionItems`, `generatedAt`.

`attentionItems[]` types (authoritative):

| `type` | Count definition |
|---|---|
| `suspended_tenants` | Tenants with status `suspended` |
| `setup_pending` | Tenants with status `setup_pending` or `pending_payment` |
| `past_due_subscriptions` | Tenant subscriptions with status `PAST_DUE` |
| `pending_billing` | Subscription invoices with status `PENDING` and `balance_due > 0` |

`pendingBillingCount` must equal the `pending_billing` attention count. SA-P0-02 fixed a crossed assignment between `past_due_subscriptions` and `pending_billing` counts (2026-07-20).

Verification on 2026-07-02:

- Migration `20260618180000_SeedPlatformAdminPermissions` applied.
- Historical verification on 2026-07-02: login `posunique001@gmail.com` returned 31 platform permissions for `super_administrator`. This is a point-in-time test observation, not the current catalogue size; the authoritative catalogue now contains 36 permission codes (see [[02_ACCESS_CONTROL/Permission_Code_List]]).
- Dashboard GET returned 200 with valid JWT.

Local re-verify 2026-07-20: dashboard attention counts agreed with PostgreSQL; see [[SA-P0-02_Dashboard_Attention_Count_Fix]].

---

# Platform Tenant List API Endpoints

Base route: `/api/v1/platform-admin/tenants`

All endpoints require platform JWT authentication.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/tenants` | `platform.tenants.view` | List tenants with paging/filter/sort |
| GET | `/api/v1/platform-admin/tenants/summary` | `platform.tenants.view` | Load tenant summary cards |
| GET | `/api/v1/platform-admin/tenants/filter-options` | `platform.tenants.view` | Load filter dropdown options |
| GET | `/api/v1/platform-admin/tenants/create-options` | `platform.tenants.create` | Load tenant create wizard options |
| GET | `/api/v1/platform-admin/tenants/{tenantId}` | `platform.tenants.view` | Tenant detail |
| POST | `/api/v1/platform-admin/tenants` | `platform.tenants.create` | Create tenant (legacy minimal or full 7-step wizard payload) |
| PUT | `/api/v1/platform-admin/tenants/{tenantId}` | `platform.tenants.update` | Update tenant |
| POST | `/api/v1/platform-admin/tenants/{tenantId}/activate` | `platform.tenants.activate` | Activate tenant |
| POST | `/api/v1/platform-admin/tenants/{tenantId}/suspend` | `platform.tenants.suspend` | Suspend tenant |
| PUT | `/api/v1/platform-admin/tenants/{tenantId}/entitlements` | `platform.tenants.entitlements.update` | Replace tenant plan/features |

## Tenant Detail Entitlements (2026-07-03)

Backend branch: `feat/platform-tenant-entitlements-read-contract` · commit `8e65c32`.

Alignment doc: [[../03_USER_JOURNEYS/Platform_Admin/17_Platform_Tenant_Detail_Entitlements_Alignment]].

### GET tenant detail — entitlement fields

`GET /api/v1/platform-admin/tenants/{tenantId}` · permission `platform.tenants.view`.

Detail response includes authoritative enabled sets from `tenant_feature_entitlements`:

```json
{
  "enabledFeatureIds": ["88888888-8888-4888-8888-888888888801"],
  "enabledFeatureCodes": ["online_store"],
  "onlineStoreEnabled": true,
  "clickCollectEnabled": false,
  "offlineEnabled": false,
  "canManageEntitlements": true
}
```

Legacy boolean flags remain for summary display; Angular entitlement editor should prefer `enabledFeatureIds` / `enabledFeatureCodes`.

### GET entitlement-options

`GET /api/v1/platform-admin/tenants/{tenantId}/entitlement-options` · permission `platform.tenants.entitlements.update`.

**Do not** use `GET .../tenants/create-options` for the tenant detail entitlement editor.

Requires tenant subscription; missing subscription → HTTP 400 `platform_tenants.validation_failed`.

```json
{
  "success": true,
  "data": {
    "tenantId": "guid",
    "currentSubscriptionPlanId": "guid",
    "currentSubscriptionPlanCode": "STARTER",
    "currentSubscriptionPlanName": "Starter Plan",
    "enabledFeatureIds": ["guid"],
    "enabledFeatureCodes": ["online_store"],
    "plans": [
      {
        "id": "guid",
        "code": "STARTER",
        "name": "Starter Plan",
        "status": "active",
        "includedFeatureIds": ["guid"],
        "includedFeatureCodes": ["online_store"]
      }
    ],
    "catalogModules": [
      {
        "id": "guid",
        "code": "commerce",
        "name": "Commerce",
        "features": [
          {
            "id": "guid",
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

UI rule: only features included in the selected plan may be checked. Feature list comes from `catalogModules`; do not hardcode codes in frontend.

### PUT entitlements

`PUT /api/v1/platform-admin/tenants/{tenantId}/entitlements` · permission `platform.tenants.entitlements.update`.

Replaces enabled tenant features and optionally changes subscription plan.

```json
{
  "subscriptionPlanId": "guid",
  "enabledFeatureIds": ["guid"],
  "enabledFeatureCodes": ["online_store"]
}
```

Response: updated `PlatformTenantDetailResponse` (same shape as GET detail, including new `enabledFeatureIds/Codes`).

Validation: features must resolve to active platform features and belong to the effective plan's included set; tenant subscription must exist.

Verification on 2026-07-03: backend `dotnet test` **291/291 passed**.

## Tenant Create Wizard (2026-07-02)

`GET /api/v1/platform-admin/tenants/create-options` returns active plans (with included features), addons, commercial catalog modules/features, and lookup values for `billingStatuses`, `paymentMethods`, `countryCodes`, currencies, timezones, locales, business types, operating modes, subscription statuses, and billing cycles.

Lookup items use `{ value, label }` except `countryCodes[]`, which uses `{ code, name }`.

`POST /api/v1/platform-admin/tenants` wizard payload persists in one transaction:

- tenant + profile + registered address
- subscription with billing/limit override fields
- subscription addons
- tenant feature entitlements (auto-seeded from plan when omitted)
- tenant admin user + TENANT_ADMIN role + permissions + invite row
- optional draft subscription invoice

Tenant admin invite is persisted as `INVITED` with pending password hash; email is not sent in this slice.

### CreateTenant validation contract (before SaveChanges)

Application validator `PlatformTenantCreateRequestValidator.ValidateWizard` runs in the wizard service before any DB transaction. Invalid payloads return HTTP 400 with the standard error envelope and field-level `errors[]`; PostgreSQL length overflow (e.g. `22001`) must not reach the UI.

Wizard path is selected when the request includes wizard-only blocks (`tenantAdmin`, `subscription`, `addons`, `address`, `primaryContact`, or profile identifiers). See [[../03_USER_JOURNEYS/Platform_Admin/16_Platform_Tenant_Create_Wizard_Alignment]] for the full request shape.

| Field | Rule | Example valid | Example invalid |
|---|---|---|---|
| `countryCode` | Exactly 2 letters and in create-options catalogue when present | `LK` | `Sri Lanka`, unsupported ISO |
| `address.countryCode` | Exactly 2 letters and in create-options catalogue when present | `LK` | `Sri Lanka` |
| `baseCurrency` | Exactly 3 letters when present | `LKR` | `LK` |
| `defaultLocale` | Create-options locale catalogue when present | `en-LK`, `en-GB` | `xx-YY` |
| `operatingMode` | `unified_epos`, `pos_online_store`, `pos_only` when present | `pos_only` | `STANDARD` |
| `businessType` | Active `business_types.business_code` when present (service resolve) | `retail` | unknown code |
| `billingStatus` | One of allowed billing statuses | `pending` | `trial` |
| `subscription.subscriptionStatus` | Valid subscription lifecycle value | `trial` | (empty when subscription block sent) |
| `subscription.paymentMethod` | One of seeded payment methods | `manual`, `bank_transfer` | `pending` |
| `tenantAdmin.email` | Required valid email when `tenantAdmin` block sent | `admin@tenant.com` | `not-an-email` |

Persistence (wizard create):

| Request field | Column / join |
|---|---|
| `defaultLocale` | `tenants.default_locale` |
| `operatingMode` | `tenants.operating_mode` |
| `businessType` | `tenant_profiles.business_type_id` → `business_types` |
| `countryCode` / `address.countryCode` | `tenant_addresses.country_code` |

Country consistency: when both top-level and `address.countryCode` are present they must match; top-level-only country creates a primary REGISTERED address so country is not silently dropped.

`PUT /api/v1/platform-admin/tenants/{id}` validates `defaultLocale` / `operatingMode` when sent; omitted values are not cleared.

Validation failure response shape:

```json
{
  "success": false,
  "message": "One or more tenant create fields are invalid.",
  "errorCode": "platform_tenants.validation_failed",
  "errors": [
    { "field": "countryCode", "message": "Country code must be exactly 2 letters (for example LK)." }
  ]
}
```

Verification on 2026-07-03:

- Backend `dotnet test`: **266/266 passed** (136 unit + 81 API + 49 integration)
- Angular `npm test -- --watch=false`: **158/158 passed**
- Angular `npm run build`: passed (style budget warnings only)

---

# Platform Subscription Plan API Endpoints

Base route: `/api/v1/platform/subscription-plans`

All endpoints require platform JWT authentication.

## Endpoints

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.view` | List subscription plans |
| GET | `/api/v1/platform/subscription-plans/catalog` | `platform.subscription_plans.view` | Read commercial subscription catalog (**subscription wizard only**; not the Modules & Features admin page) |
| POST | `/api/v1/platform/subscription-plans` | `platform.subscription_plans.create` | Create draft plan |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/pricing` | `platform.subscription_plans.edit` | Save draft `base_price` |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/limits` | `platform.subscription_plans.edit` | Save draft outlet/till/user limits |
| PATCH | `/api/v1/platform/subscription-plans/{planId}/features` | `platform.subscription_plans.edit` | Save draft module/feature entitlements |
| POST | `/api/v1/platform/subscription-plans/{planId}/publish` | `platform.subscription_plans.edit` | Publish draft → DB `active` |

## Release 1 write flow

1. **Create draft** — basics fields on `subscription_plans`
2. **Update pricing** — `base_price` only, draft status required
3. **Update features** — module/feature entitlement only, draft status required
4. **Update limits** — `max_outlets`, `max_tills`, `max_users`, draft status required
5. **Publish** — status `draft` → `active`; API response returns `status: active`

## Status contract

| Layer | Values |
|---|---|
| Database | `draft`, `active`, `retired` |
| API plan `status` field | Same DB values (no `published`/`archived` in responses) |
| Frontend labels | UI may show Published for `active`; backend does not |

Publish response example: `{ "status": "active", ... }`

## Verification (2026-06-22)

- Swagger at `http://localhost:5052`
- Full flow: POST create → PATCH pricing → PATCH limits → POST publish → GET list
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

---

# Platform Modules & Features Catalog API Endpoints

Controller: `PlatformAdminCatalogController`  
Base: `/api/v1/platform-admin/catalog`

All endpoints require platform JWT authentication (`PlatformOnly` policy).

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/catalog/modules` | `platform.modules.view` | Read active platform modules catalog for the Modules & Features admin page |

## Feature visibility rule

- Caller must have `platform.modules.view` to call the endpoint.
- Nested `features[]` are returned only when the caller also has `platform.features.view`.
- Without `platform.features.view`, each module is returned with `features: []` (modules-only response).

## Data source

- Modules from `platform_modules` where `status = ACTIVE`.
- Features from `platform_features` where `status = ACTIVE` and `platform_module_id` matches the module.
- Do not use this endpoint for the subscription plan wizard; the wizard continues to use `GET /api/v1/platform/subscription-plans/catalog` (`platform.subscription_plans.view`).

## Response shape

```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "guid",
        "moduleCode": "core_pos",
        "name": "Core POS",
        "description": "Core point of sale module",
        "sortOrder": 10,
        "status": "ACTIVE",
        "features": [
          {
            "id": "guid",
            "featureCode": "pos.sales",
            "name": "POS Sales",
            "description": "Start sale",
            "sortOrder": 1,
            "status": "ACTIVE"
          }
        ]
      }
    ]
  }
}
```

## Angular integration

- Route: `/admin/modules` · component `PlatformModulesCatalogPage`
- Service: `PlatformModulesCatalogApiService.getCatalog()` → `GET /api/v1/platform-admin/catalog/modules`
- Route guard: `platform.modules.view`
- Feature table in UI is hidden when the session lacks `platform.features.view` (backend also omits feature rows without that permission).

## Verification (2026-07-03)

| Layer | Result |
|---|---|
| Backend | `dotnet test`: 300/300 passed · commit `fd60e5a` |
| Angular | `npm test -- --watch=false`: 186/186 passed · commit `1b67f1b` |

---

# Platform Audit Logs API Endpoints

Controller: `PlatformAdminAuditLogsController`  
Base: `/api/v1/platform-admin/audit-logs`

All endpoints require platform JWT authentication (`PlatformOnly` policy).

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/audit-logs` | `platform.audit.view` | Read paginated platform login/security audit list |

## R1 data scope

- Generic `audit_logs` table **does not exist** in Unified Commerce Release 1.
- This endpoint reads **`platform_login_audits` only**.
- Response `auditScope` is always `platform_login_security`.
- Business audit events (tenant update, entitlement changes, role edits, settings changes) are **future scope** until a generic `audit_logs` migration exists.

## Query parameters

| Parameter | Purpose |
|---|---|
| `pageNumber` | Page index (default `1`) |
| `pageSize` | Page size (default `20`, max `100`) |
| `from` | Inclusive start of date range on `occurredAt` |
| `to` | Inclusive end of date range on `occurredAt` |
| `action` | Filter by mapped action (`platform.login.success` / `platform.login.failed` / `platform.login.locked`) or raw login result (`SUCCESS` / `FAILED` / `LOCKED`) |
| `actorPlatformUserId` | Filter by platform user actor |
| `entityType` | R1 rows use `platform_user` only; other values return empty page |
| `search` | Match actor email, login result, or action code |

Invalid date range (`from > to`) returns HTTP 400 `platform_audit.validation_failed`.

## Response shape

```json
{
  "success": true,
  "data": {
    "auditScope": "platform_login_security",
    "auditScopeDescription": "Platform login and authentication security events from platform_login_audits. Generic business audit logs are not available in Release 1.",
    "items": [
      {
        "id": "guid",
        "occurredAt": "2026-07-03T12:00:00Z",
        "actor": {
          "platformUserId": "guid",
          "email": "admin@nytroz.local"
        },
        "action": "platform.login.success",
        "area": "platform_auth",
        "entityType": "platform_user",
        "entityId": "guid",
        "summary": "Platform login succeeded.",
        "ipAddress": null,
        "userAgent": null
      }
    ],
    "pageNumber": 1,
    "pageSize": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

## Field notes

| Field | R1 note |
|---|---|
| `auditScope` | Always `platform_login_security` until generic audit migration |
| `auditScopeDescription` | Explains login-only scope to UI consumers |
| `ipAddress` | Always `null` — not stored on `platform_login_audits` |
| `userAgent` | Always `null` — not stored on `platform_login_audits` |
| `action` | Mapped from `login_result`: `SUCCESS` → `platform.login.success`, `FAILED` → `platform.login.failed`, `LOCKED` → `platform.login.locked` |

Ordering: latest first (`occurredAt` descending, then `id` descending).

## Verification (2026-07-03)

| Layer | Result |
|---|---|
| Backend | `dotnet test`: 380/380 passed · branch `feat/platform-audit-logs-minimal` · commit `ac1afae` |

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

# Platform Admin Users API Endpoints

Controller: `PlatformAdminUsersController`  
Base: `/api/v1/platform-admin/users`

All endpoints require platform JWT authentication (`PlatformOnly` policy).

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/platform-admin/users` | `platform.users.view` | List platform users with role summaries |
| GET | `/api/v1/platform-admin/users/{userId}` | `platform.users.view` | Load one platform user detail |
| POST | `/api/v1/platform-admin/users` | `platform.users.create` | Create platform user invite |
| PUT | `/api/v1/platform-admin/users/{userId}` | `platform.users.update` | Update platform user status |
| PUT | `/api/v1/platform-admin/users/{userId}/roles` | `platform.users.roles.assign` | Replace assigned platform roles |

## List response shape

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "guid",
        "email": "staff@nytroz.local",
        "displayName": "Staff User",
        "status": "ACTIVE",
        "roleCodes": ["support_admin"],
        "roleNames": ["Support Admin"],
        "permissionCount": 12,
        "lastLoginAt": null,
        "createdAt": "2026-07-01T00:00:00Z",
        "updatedAt": "2026-07-01T00:00:00Z"
      }
    ]
  }
}
```

## Detail response shape

Same fields as list item plus `invitePending: boolean`.

## Create request

At least one role is required (`roleIds` and/or `roleCodes`).

```json
{
  "email": "new@nytroz.local",
  "status": "INACTIVE",
  "roleIds": ["role-guid"]
}
```

## Update request

Status only on this endpoint:

```json
{
  "status": "LOCKED"
}
```

## Assign roles request

Replaces the user's platform roles:

```json
{
  "roleIds": ["role-guid-1", "role-guid-2"]
}
```

Allowed statuses: `ACTIVE`, `INACTIVE`, `LOCKED`, `DELETED`.

Role options for Angular create/edit must come from `GET /api/v1/platform-admin/roles`; do not hardcode role names in the users UI.

## Angular route

| Route | Permission | Component |
|---|---|---|
| `/admin/platform-users` | `platform.users.view` | `PlatformUsersPage` |

Frontend tests (2026-07-03): `platform-users-page.spec.ts`, `platform-user-api.service.spec.ts`.

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

Catalog read source for the subscription wizard is the commercial subscription catalog: `GET /api/v1/platform/subscription-plans/catalog`. Do not map permission catalog modules directly as commercial subscription modules. The Modules & Features admin page at `/admin/modules` uses `GET /api/v1/platform-admin/catalog/modules` instead (`platform.modules.view` / `platform.features.view`).

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

See [[../99_Archive/04_MODULE_KNOWLEDGE/Subscription/04_Subscription_Catalog_Model]] for the final contract, metadata fields, response shape, validation behavior, and verification results.

## Related Files

- [[API_Standards]]
- [[Authorization_And_Permissions]]
- [[Offline_Operation_Architecture]]
- [[../02_ACCESS_CONTROL/Backend_Driven_Permission_Catalog]]
- [[../02_ACCESS_CONTROL/Platform_Admin_Role_Management]]
- [[../04_MODULE_KNOWLEDGE/03_Subscription_Catalog_Entitlements/03_Technical_Contract]]
- [[../99_Archive/04_MODULE_KNOWLEDGE/Subscription/04_Subscription_Catalog_Model]]
- [[../06_DATABASE_KNOWLEDGE/Subscription_Tables]]
- [[../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]]

---

# POS Payment And Receipt API Endpoints

> **Unified-Commerce status (2026-07-10):** The routes below are the **target
> contract** carried forward from legacy `SCS.Api` documentation. They are
> **not implemented** in `E_POS.Api` yet. Flutter datasources still reference
> these paths; checkout will fail until backend work is completed. See
> [[../15_IMPLEMENTATION_TRACKING/Backend/Sales/Create_Sale_Implementation_Status]].

Base routes: `/api/v1/pos/cart`, `/api/v1/pos/checkout`,
`/api/v1/pos/sales`, `/api/v1/pos/payments`, `/api/v1/pos/receipts`.

| Method | Route | Permission | Purpose |
|---|---|---|---|
| POST | `/api/v1/pos/cart/calculate` | `sales.cart.update_item` in the direct controller; `sales.checkout` when called through checkout summary/start-payment | Backend cart totals without saving a sale |
| POST | `/api/v1/pos/checkout/summary` | `sales.checkout` | Payment screen billing summary and permitted methods |
| POST | `/api/v1/pos/checkout/start-payment` | `sales.checkout` + selected payment permission | Existing Flutter cash checkout entry point; creates sale/payment/receipt for cash |
| POST | `/api/v1/pos/sales` | `sales.checkout` | Create draft POS sale |
| POST | `/api/v1/pos/sales/checkout` | `sales.checkout` | Alias for draft sale creation; does not complete payment by itself |
| GET | `/api/v1/pos/sales/{saleId}` | `sales.view` | Completed sale details |
| POST | `/api/v1/pos/payments` | Payment method permission such as `payments.cash.accept` | Record payment against an existing draft sale |
| GET | `/api/v1/pos/receipts/{saleId}` | `receipts.view` or `receipts.print` | Receipt preview data with `barcodeValue` |
| POST | `/api/v1/pos/receipts/{saleId}/print` | `receipts.print` | Receipt print audit row |

Cash checkout writes `sales`, `sale_lines`, `payments`,
`sale_payment_allocations`, and `receipts`. Print audit writes
`receipt_print_logs`.

Cash checkout request includes `cashReceived`. Successful cash checkout response
includes backend-sourced `cashReceived` and `changeDue`; Flutter must display
those returned values instead of recalculating or defaulting locally. Sale detail
and receipt detail responses also expose `cashReceived` and `changeDue` from the
saved sale/payment outcome.

`GET /api/v1/pos/products` is **implemented** in Unified-Commerce on branch
`Sale_Screen` (see implementation status file). It exposes `variantId` for
simple/non-variant products so Flutter can send `{ variantId, qty }` to checkout
summary/start-payment without substituting product IDs.

`GET /api/v1/pos/products` product summaries expose variant search metadata for
New Sale filtering. Product name remains the primary search key; variant terms
only refine product-name searches, while exact SKU/barcode remains a direct
lookup/search path.

## Needs Verification

- The permission catalog contains `sales.cart.manage`, but current verified
  backend code still protects direct `POST /api/v1/pos/cart/calculate` with
  `sales.cart.update_item`. Treat any documentation that says the direct endpoint
  requires only `sales.cart.manage` as a mismatch until backend access rules are
  updated.
- `GET /api/v1/pos/payment-methods` and `GET /api/v1/pos/printer-settings` were
  not found in the current backend. Flutter payment methods come from checkout
  summary, and printer selection/config remains local or future scope.

---

# POS Returns — Step 1 Sale Search

> **Unified-Commerce status (2026-07-17):** Implemented for Search Original Sale.

Flutter route: `/pos/returns-refunds`

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/pos/returns/sales/search` | exact `returns.view` | Search/list original outlet-scoped completed sales |
| GET | `/api/v1/pos/returns/sales/{saleId}/eligibility` | exact `returns.view` | Sale eligibility/detail for the current till outlet |
| POST | `/api/v1/pos/returns/sales/{saleId}/eligibility-check` | exact `returns.view` | Selected-line eligibility check; same outlet isolation |

### Step 3 — Select Items (2026-07-17)

Flutter route: `/pos/returns-refunds/eligibility`

- Open Step 3 with `GET .../eligibility?deviceId=`.
- Continue is local only (`selectedReturnLines` → `/pos/returns-refunds/check-eligibility`).
- Step 4 opens with `POST .../eligibility-check`.
- Route view: `returns.view`. Selection/Continue mutation: `returns.view` + `returns.create`.
- Line DTO includes `barcode` from `product_barcodes` (variant primary, then product-level).
- Search matches name, SKU, barcode — not internal variant UUID.
- Non-returnable lines (`isReturnable=false` or `availableReturnQty<=0`) cannot be selected.
- POST rejects duplicate `saleLineId`, non-returnable lines (`pos_returns.line_not_returnable` → 409), and quantity above remaining.
- Prior returned qty counts only `sales_returns.return_status = COMPLETED`.
- Images prefer variant `product_images`, then product-level.
- Migration: `20260717120000_HardenReturnEligibilityTenantConstraints` (tenant-composite return/image FKs, return-line uniqueness, quantity CHECKs).
- Held POS sale lines use `line_status=ACTIVE` (not `PENDING`) to match `ck_sales_order_lines_line_status`.

### Step 4 — Check Eligibility (2026-07-17)

Flutter route: `/pos/returns-refunds/check-eligibility`

- Opens with non-mutating `POST .../eligibility-check?deviceId=` using `selectedReturnLines` from Step 3.
- Permission: exact `returns.view`. Continue to Step 5 requires `returns.view` + `returns.create` + `canContinue=true`.
- Result is transient Flutter state and is recomputed on every Step 4 entry (no eligibility draft table).
- No separate `/eligibility-result`, `/eligibility/continue`, or policy/receipt/payment APIs.

#### Checklist contract (`policyChecks`)

| Code | Evaluation |
|---|---|
| `RETURN_WINDOW` | Line eligibility vs receipt `issued_at` + resolved policy window |
| `ORIGINAL_RECEIPT` | Uses `return_policies.requires_receipt`. Required + ISSUED SALE receipt for till outlet → `PASSED`. Required missing/invalid → `FAILED`. Not required → `NOT_APPLICABLE` (never claims verified when optional). |
| `PAYMENT_VERIFICATION` | Persisted `sales_payments` with status `PAID` or `PARTIALLY_REFUNDED`, positive `paid_amount`, currency match. Does **not** use display `paymentMethod` text. |
| `PRODUCT_RETURN_POLICY` | Product `return_policy_id` → ACTIVE policy, else tenant default ACTIVE policy. Categories have no return-policy attribute; code is not a fake category pass. |
| `INSPECTION_REQUIRED` | Preliminary only. `ReturnPolicy` has no `requires_inspection`; Step 4 flag is false/`NOT_APPLICABLE` until Step 5 reason may require inspection. |
| `MANAGER_APPROVAL_REQUIRED` | From `return_policies.requires_manager_approval` → `REQUIRES_REVIEW` (Continue still allowed). No approval record is created at Step 4. |

Statuses: `PASSED` | `FAILED` | `REQUIRES_REVIEW` | `NOT_APPLICABLE`.

Response also includes `requiresInspection`, `requiresManagerApproval`, `canContinue`, `overallStatus`, `overallMessage`, `policyNote`.

`policyNote` comes from configured `return_policies.description`, else a neutral `Return window: {n} days` summary. No hardcoded packaging copy.

Hard request conflicts remain HTTP **409** (`line_not_returnable`, `quantity_exceeds_available`). Unexpected eligibility failure maps to **500** (`eligibility_check_failed`).

### Step 5 — Select Return / Exchange Reason (2026-07-17)

Flutter route: `/pos/returns-refunds/return-reason`

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/pos/returns/reasons` | `returns.view` + `returns.create` | Load active tenant Return/BOTH reasons |
| POST | `/api/v1/pos/returns/sales/{saleId}/reasons/validate` | `returns.view` + `returns.create` | Validation-only reason/note assignment |

Rules:

- Step 5 is intentionally **transient** (Flutter flow state only). Validate does **not** persist. Final `return_reason_id` / notes are written at Return completion into `sales_returns` / `sales_return_lines`.
- No reason-draft save/restore API or table.
- Reason catalog fields are database-driven from `return_reasons`: `description`, `requires_note`, `requires_inspection`, `requires_manager_approval`.
- Notes max length is **1000** (backend + Flutter). Whitespace-only notes are treated as empty.
- `applySameReasonToAll=true` shows one global reason/notes control; `false` shows per-line reason/notes controls. Every selected line is still validated individually.
- Final flow flags: `requiresInspection = Step4 OR any reason.requiresInspection`; `requiresManagerApproval = Step4 OR any reason.requiresManagerApproval`.
- Unexpected failures map to **500** (`reasons_load_failed`, `reasons_validate_failed`).
- Migration: `20260717140000_HardenReturnReasonsConfigurableFlags` (adds configurable columns + restores `applies_to` / `sort_order` CHECKs).

### Step 6 — Inspect Items (2026-07-17)

Flutter route: `/pos/returns-refunds/inspect-items`

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/pos/returns/inspection/conditions` | `returns.view` + `returns.create` | Active tenant condition catalog |
| GET | `/api/v1/pos/returns/sales/{saleId}/inspection/draft` | `returns.view` + `returns.create` | Load persisted draft (`version`, `expiresAt`) |
| PUT | `/api/v1/pos/returns/sales/{saleId}/inspection/draft` | `returns.view` + `returns.create` | Save draft lines; optional `version` for optimistic concurrency |
| POST | `/api/v1/pos/returns/sales/{saleId}/inspection/validate` | `returns.view` + `returns.create` | Validate persisted draft; marks `VALIDATED` when `canContinue` |
| POST | `/api/v1/pos/returns/sales/{saleId}/inspection/media` | `returns.view` + `returns.create` | Multipart photo upload to staging |
| DELETE | `/api/v1/pos/returns/inspection/media/{mediaId}` | `returns.view` + `returns.create` | Soft-delete staging row + remove file |
| GET | `/api/v1/pos/returns/inspection/media/{mediaId}` | `returns.view` + `returns.create` | Authenticated photo bytes for preview |

Rules:

- All Step 6 routes require `deviceId`; outlet resolved from open till session (never from Flutter).
- Sale scope enforced via till outlet + matching sale receipt outlet (`SaleBelongsToOutletAsync`).
- Draft statuses: `DRAFT` / `VALIDATED` / `CONSUMED` / `CANCELLED`. Line or media changes reset to `DRAFT`.
- Draft `version` optimistic concurrency: request `version` must match persisted value → **409** `pos_returns.inspection_draft_conflict`.
- Draft and staging `expires_at` default 24h; refreshed on save/validate; expired → **409** `pos_returns.inspection_draft_expired`.
- Staging media statuses: `STAGED` / `DELETED` / `EXPIRED` / `CONSUMED` (soft lifecycle; `CONSUMED` never deleted).
- Validate merges Step 4 eligibility + Step 5 reason flags (DB re-read via `reasonRefs`) + Step 6 conditions — **OR**, never downgrade. Response includes `requiresInspection`, `requiresManagerApproval`, `requiresReview`, `version`, `expiresAt`, `status`.
- No Step 6 Continue/finalize/approval APIs. Continue is local; `CompleteReturnAsync` atomically consumes a `VALIDATED` draft.
- Photo limits: max 5 per line, 5 MiB, JPEG/PNG/WebP with magic-byte check → **413** / **415**.
- Migration: `20260717150000_HardenReturnInspectionDraftMediaLifecycle`.
- Local media storage (`ReturnInspectionMedia:StorageRoot`) acceptable with `LOCAL_SHARED_VOLUME_ACCEPTED` (single instance or shared volume); multi-instance without shared volume requires object storage.

### Steps 7–10 — Resolution, Branches, and Completion (2026-07-17)

| Method | Route | Permission | Purpose |
|---|---|---|---|
| GET | `/api/v1/pos/returns/sales/{saleId}/resolution` | `returns.view` + `returns.create` | Authoritative Step 7 hydration and branch availability |
| PUT | `/api/v1/pos/returns/sales/{saleId}/resolution` | shared permissions + `refunds.create` or `exchanges.create` | Persist REFUND/EXCHANGE with `expectedVersion` |
| GET/PUT | `/api/v1/pos/returns/sales/{saleId}/refund-method(s)` | `returns.view` + `returns.create` + `refunds.create` | Refund branch draft |
| GET/PUT | `/api/v1/pos/returns/sales/{saleId}/exchange/replacement` | `returns.view` + `returns.create` + `exchanges.create` | Exchange replacement draft (`expectedVersion` on PUT; returns `version`, `expiresAt`) |
| GET | `/api/v1/pos/returns/sales/{saleId}/exchange/products` | Exchange permissions | Name/SKU/barcode search with **current-outlet** sellable stock only |
| POST | `/api/v1/pos/returns/sales/{saleId}/exchange-preview` | Exchange permissions | Authoritative exchange pricing/stock/difference (`canProceed`, tax/discount from return credit) |
| POST | `/api/v1/pos/returns/sales/{saleId}/complete` | selected branch permissions | Idempotent Return/Refund or Return/Exchange completion |

Resolution GET/PUT require `deviceId`, open till context, outlet-owned sale/draft,
`VALIDATED`, unexpired, unconsumed draft. GET returns `draftId`, `version`,
`draftStatus`, `expiresAt`, selection actor/time, `availableOptions`,
`refundAllowed`, `exchangeAllowed`, durable inspection/approval flags, and
`nextStep`. A user lacking a branch permission cannot resume or mutate that branch.

PUT body is `{ resolutionType, expectedVersion }`. Unsupported values are rejected;
version mismatch is 409 `inspection_draft_conflict`; selecting the same option at the
latest version is idempotent. Branch changes and Step 6 re-edits transactionally remove
incompatible downstream draft data.

Completion body includes `reasonCode`, `settlementMethodCode`, `notes`, selected
lines, `expectedVersion`, and `idempotencyKey`. The server recalculates all monetary
and stock values. Refund completions persist `sales_returns.idempotency_key`
(unique per tenant when not null); same-key replay returns the existing receipt.
Exchange completions persist `sales_exchanges.idempotency_key` the same way.
Exchange settlement direction is enforced:

- even: `NO_SETTLEMENT`
- customer pays: `CASH_PAYMENT` (real cash payment/till movement)
- customer receives: `CASH_REFUND` or `CARD_REFUND`

### Step 8B — Exchange replacement (2026-07-18)

Canonical routes (no separate stock/price/Continue APIs):

- `GET .../exchange/products` — trim/case-insensitive name + SKU; barcode via `product_barcodes`; current-outlet `AvailableQuantity` only (`InventoryBalances` ∩ sellable `InventoryLocations` for resolved outlet).
- `GET|PUT .../exchange/replacement` — persist product/variant/quantity in `return_exchange_replacement_draft_lines`; PUT requires `expectedVersion`; version bump via `MarkExchangeReplacementChanged`; expired/consumed/wrong-resolution → conflict; stock over-qty rejected.
- `POST .../exchange-preview` (hyphen, not `/exchange/preview`) — return credit from original sale lines; **replacement totals from shared `IPosSaleLinePricingCalculator`** (same price-list / quantity-tier / inclusive-exclusive / compound-tax pipeline as POS checkout). Returns `replacementSubtotal`, `replacementDiscount`, `replacementTax`, `replacementItemValue`, amounts due, `canProceed`, `requiresApproval`, `draftVersion`.
- Completion re-runs the same calculator inside the transaction; mismatches → `exchange_price_changed` / `exchange_tax_changed` / `exchange_discount_changed` / `exchange_preview_stale`. Replacement `sales_order_lines` persist unit price, subtotal, discount, and tax (not hardcoded zeros). Outlet stock and price revalidated. `STORE_CREDIT` remains unsupported.

`pos_returns.approval_required` is HTTP 409. The approval grant workflow is not
implemented; therefore a durable approval requirement remains an intentional hard
completion blocker.

Search query parameters:

- `deviceId` (required)
- `searchType`: `invoice`, `receipt` (invoice alias), `sale`, `mobile`, `customer`, `recent`
- `search` (required for non-`recent`)
- optional filters: `fromDate`, `toDate`, `paymentMethodCode`, `minAmount`, `maxAmount`
- `page`, `pageSize` (default 20, backend-capped)

Search response:

- `items`, `page`, `pageSize`, `totalCount`
- optional `paymentMethods` filter options
- each item includes safe `paymentMethod` and `maskedCard` (never raw provider/card references)

Rules:

- Outlet is resolved from trusted device + open till session; Flutter must not supply outlet ID.
- Step 1 creates no return or return-draft row.
- Continue into Step 2 is local navigation and requires `returns.view` + `returns.create`.
- Primary tables: `sales_orders`, `sales_order_lines`, `receipts`, `customers`, `sales_payments`, `sales_payment_transactions`, `payment_methods`.

### Masked payment projection (Search + Eligibility)

Same rule for `GET .../sales/search` and `GET .../sales/{saleId}/eligibility`:

- Successful payments only (`PAID`, `PARTIALLY_REFUNDED`), ordered by `paid_at`, then payment id.
- Split tenders → `paymentMethod: "Multiple"`, `maskedCard: ""`.
- Card last4 comes from sanitized `sales_payment_transactions.provider_response_json.cardLast4`
  (or from `external_reference` only when it is exactly four digits).
- Display mask: `•••• {last4}`. Never derive last4 by truncating provider tokens.
- Cash/QR/non-card: no fabricated card mask.
- Provider transaction ids remain server-side only.

> **Checkout write path (2026-07-17):** Cash persists without card tips. Card production
> authorization still requires provider integration (`pos_checkout.payment_provider_required`).
> Domain factory `PosCompletedPaymentPersistence.CreateProviderCapture` maps successful
> provider outcomes into the fields above when provider support is enabled.
