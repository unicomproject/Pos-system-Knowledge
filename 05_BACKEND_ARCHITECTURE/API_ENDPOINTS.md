<!-- title: Platform Subscription Plan API Endpoints -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-03 -->

# Platform Subscription Plan API Endpoints

## Tenant POS Login

Base route: `/api/v1/auth`

| Method | Route | Unified Commerce status |
|---|---|---|
| POST | `/api/v1/auth/tenant-login` | **Not implemented** (Flutter still calls this — returns 404 on port 5187) |

This is not the final full endpoint catalogue. Exact endpoint tables must be
created module-by-module after module contracts are finalized.

Confirmed Release 1 implemented endpoints are documented in the sections below.
Use those tables for active backend, Angular, and Flutter integration work.

> **Active backend:** `Nytroz POS - Backend New/Unified-Commerce` · Platform Admin dev URL `http://localhost:5150`
>
> **Obsolete:** port **5052**, `Nytroz-POS-Backend` / `SCS.Api` — see
> [[../11_DEVELOPER_ONBOARDING/Unified_Commerce_Backend_Known_Limitations]]

Request body (Flutter contract — pending backend implementation):

```json
{
  "email": "cashier001@gmail.com",
  "password": "123456"
}
```

Tenant Code is not accepted from the POS login screen. Backend resolves tenant
from the tenant user email. If the email exists in multiple tenants, the API
returns `TENANT_SELECTION_REQUIRED` with: "Multiple tenants found for this
email. Tenant selection is required."

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

Verification on 2026-07-02:

- Migration `20260618180000_SeedPlatformAdminPermissions` applied.
- Login `posunique001@gmail.com` returned 31 platform permissions for `super_administrator`.
- Dashboard GET returned 200 with valid JWT.

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
| `countryCode` | Exactly 2 letters when present | `LK` | `Sri Lanka` |
| `address.countryCode` | Exactly 2 letters when present | `LK` | `Sri Lanka` |
| `baseCurrency` | Exactly 3 letters when present | `LKR` | `LK` |
| `billingStatus` | One of allowed billing statuses | `pending` | `trial` |
| `subscription.subscriptionStatus` | Valid subscription lifecycle value | `trial` | (empty when subscription block sent) |
| `subscription.paymentMethod` | One of seeded payment methods | `manual`, `bank_transfer` | `pending` |
| `tenantAdmin.email` | Required valid email when `tenantAdmin` block sent | `admin@tenant.com` | `not-an-email` |

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

Checkout/cart line requests use backend product variant IDs. `GET
/api/v1/pos/products` exposes `variantId` for simple/non-variant products so
Flutter can send `{ variantId, qty }` to checkout summary/start-payment without
substituting product IDs.

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
