<!-- title: Platform Administration Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-03 -->

# Platform Administration Technical Contract

## Purpose

Defines the implementation contract for `Platform_Administration`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/platform-admin/users`, `/api/v1/platform-admin/roles`, `/api/v1/platform-admin/permissions`, `/api/v1/platform-admin/settings`, `/api/v1/platform-admin/audit-logs`, `/api/v1/platform-admin/tenants`, `/api/v1/platform-admin/catalog` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/platform-admin/users` | Module API group |
| `/api/v1/platform-admin/roles` | Module API group |
| `/api/v1/platform-admin/permissions` | Module API group |
| `/api/v1/platform-admin/settings` | Module API group |
| `/api/v1/platform-admin/audit-logs` | Read-only platform login/security audit list (`platform_login_audits`) |
| `/api/v1/platform-admin/tenants` | Tenant list, detail, create-options, create, update, activate, suspend, entitlements |
| `/api/v1/platform-admin/catalog` | Platform modules catalog read for Modules & Features admin page |

## Database Contract

| Table | Contract |
|---|---|
| `platform_users` | Used by this module |
| `platform_roles` | Used by this module |
| `platform_permissions` | Used by this module |
| `platform_user_roles` | Used by this module |
| `platform_role_permissions` | Used by this module |
| `platform_user_permissions` | Used by this module |
| `platform_auth_sessions` | Used by this module |
| `platform_refresh_tokens` | Used by this module |
| `platform_password_reset_tokens` | Used by this module |
| `platform_login_audits` | Used by this module (R1 audit read API source) |
| `platform_settings` | Used by this module |
| `audit_logs` | **Not implemented in Unified Commerce R1** — archived target design only; future business audit migration |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.

## Platform Tenant Create Validation

Wizard create (`POST /api/v1/platform-admin/tenants` with full payload) is validated by `PlatformTenantCreateRequestValidator.ValidateWizard` in `E_POS.Application/Modules/PlatformAdministration/Validators/` **before** any DB transaction starts.

The service routes to the wizard path when `tenantAdmin`, `subscription`, `addons`, `address`, `primaryContact`, or profile fields (`legalName`, `registrationNumber`, `taxNumber`) are present; otherwise the legacy minimal create path runs.

Validated fields:

- Country codes (`countryCode`, `address.countryCode`): exactly 2 ISO letters and in create-options catalogue (e.g. `LK`).
- Locale (`defaultLocale`): create-options locale catalogue when present (e.g. `en-LK`).
- Operating mode (`operatingMode`): `unified_epos`, `pos_online_store`, `pos_only` when present.
- Currency (`baseCurrency`): exactly 3 ISO letters (e.g. `LKR`).
- `billingStatus`: `pending`, `paid`, `overdue`, `failed`, `waived` only.
- `subscription.subscriptionStatus`: `trial`, `active`, `past_due`, `cancelled`, `expired` when present.
- `subscription.paymentMethod`: seeded values (`manual`, `bank_transfer`) when present.
- `tenantAdmin.email`: required and must be a valid email when `tenantAdmin` block is sent.

Persisted mapping: `defaultLocale`/`operatingMode` → `tenants`; `businessType` → `tenant_profiles.business_type_id`; country → `tenant_addresses.country_code`. Update validation uses `ValidateUpdate` and does not clear omitted locale/mode.

Failures return `ApplicationError.ValidationFailed` (`errorCode: platform_tenants.validation_failed`) with `ApplicationFieldError` items; `PlatformAdminTenantsController` maps these to HTTP 400 with `errors[]` in the legacy API envelope.

Angular wizard mirrors ISO/billing rules client-side via `platform-tenant-create.validators.ts` but backend remains authoritative.

## Platform Users UI Contract

Controller: `PlatformAdminUsersController` · Angular route `/admin/platform-users`.

| Screen action | API | Permission |
|---|---|---|
| List + search | `GET /api/v1/platform-admin/users` | `platform.users.view` |
| Open edit panel | `GET /api/v1/platform-admin/users/{userId}` | `platform.users.view` |
| Create user | `POST /api/v1/platform-admin/users` | `platform.users.create` |
| Save status | `PUT /api/v1/platform-admin/users/{userId}` | `platform.users.update` |
| Save roles | `PUT /api/v1/platform-admin/users/{userId}/roles` | `platform.users.roles.assign` |
| Role checkbox options | `GET /api/v1/platform-admin/roles` | `platform.roles.view` |

Implementation notes:

- `PlatformUserApiService` owns HTTP calls; the page component does not call APIs directly except through services.
- Role pickers load from the roles API and filter to non-inactive roles; no hardcoded Super Admin / Support Admin lists in UI code.
- Create requires email plus at least one `roleId`; edit splits status update and role assignment into separate save actions matching backend endpoints.
- UI exposes loading, empty, error-with-retry, and editor error states.

See [[03_USER_JOURNEYS/Platform_Admin/13_Platform_User_Management_Flow]] and [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] for DTO shapes and error codes.

## Platform Tenant Detail Entitlements UI Contract

Angular route: `/admin/tenants/{tenantId}` · component `PlatformTenantDetailPage`.

| Screen action | API | Permission |
|---|---|---|
| Load detail (includes enabled arrays) | `GET /api/v1/platform-admin/tenants/{tenantId}` | `platform.tenants.view` |
| Open entitlement editor | `GET /api/v1/platform-admin/tenants/{tenantId}/entitlement-options` | `platform.tenants.entitlements.update` |
| Save plan / features | `PUT /api/v1/platform-admin/tenants/{tenantId}/entitlements` | `platform.tenants.entitlements.update` |

Implementation notes:

- Detail response includes `enabledFeatureIds` and `enabledFeatureCodes` sourced from `tenant_feature_entitlements` (ENABLED rows only), in addition to legacy boolean flags.
- Entitlement editor must call **entitlement-options**, not `GET .../tenants/create-options`. Create-options requires `platform.tenants.create` and is reserved for the tenant create wizard.
- Feature checkboxes come from `catalogModules[].features`; allowed selections are constrained by the selected plan's `includedFeatureIds` / `includedFeatureCodes` from entitlement-options `plans[]`.
- Do not hardcode feature codes in UI components or constants.
- Save sends `{ subscriptionPlanId?, enabledFeatureIds?, enabledFeatureCodes? }`; backend replaces tenant entitlements and may change plan when `subscriptionPlanId` differs from current subscription.
- Expose loading, error, permission-denied, and empty-catalog states on the editor panel.

See [[03_USER_JOURNEYS/Platform_Admin/17_Platform_Tenant_Detail_Entitlements_Alignment]] and [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] for JSON shapes.

## Platform Modules & Features Catalog UI Contract

Angular route: `/admin/modules` · component `PlatformModulesCatalogPage`.

| Screen action | API | Permission |
|---|---|---|
| Load modules catalog | `GET /api/v1/platform-admin/catalog/modules` | `platform.modules.view` |
| View nested feature rows | same response `modules[].features[]` | `platform.features.view` (backend omits features without this permission) |

Implementation notes:

- `PlatformModulesCatalogApiService` calls **`GET /api/v1/platform-admin/catalog/modules` only**. Do not use `GET /api/v1/platform/subscription-plans/catalog` on this page.
- Subscription wizard catalog (`GET /api/v1/platform/subscription-plans/catalog`, `platform.subscription_plans.view`) remains reserved for create/edit subscription plan flows.
- Map response fields `moduleCode`, `featureCode`, `sortOrder`, and `status` from the backend; do not hardcode module or feature lists in UI code.
- Search/filter is client-side over module name, `moduleCode`, feature name, and `featureCode`.
- Feature detail table is hidden in UI when the session lacks `platform.features.view`; show modules with feature counts and a permission notice instead.
- Expose loading, empty, error-with-retry, and no-search-results states.
- No create/edit/delete on this page unless a future backend write contract is documented.

See [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] and [[09_ANGULAR_ADMIN_KNOWLEDGE/Routing_And_Guards]] for route guard and response JSON.

## Platform Audit Logs UI Contract (R1)

Controller: `PlatformAdminAuditLogsController` · future Angular route `/admin/audit-logs`.

| Screen action | API | Permission |
|---|---|---|
| Load paginated audit list | `GET /api/v1/platform-admin/audit-logs` | `platform.audit.view` |

### R1 data scope

- Generic `audit_logs` table **does not exist** in Unified Commerce R1.
- R1 endpoint reads **`platform_login_audits` only**.
- Response includes `auditScope: platform_login_security` and `auditScopeDescription` so UI must not imply full business audit coverage.
- Business events such as tenant update, entitlement changes, role edits, and settings changes are **future scope** until generic `audit_logs` migration exists.

### Response fields

Paginated envelope: `auditScope`, `auditScopeDescription`, `items[]`, `pageNumber`, `pageSize`, `totalCount`, `totalPages`.

Each item: `id`, `occurredAt`, `actor.platformUserId`, `actor.email`, `action`, `area`, `entityType`, `entityId`, `summary`, `ipAddress`, `userAgent`.

`ipAddress` and `userAgent` are **`null` in R1** because `platform_login_audits` does not store them.

### Supported query filters

`pageNumber`, `pageSize`, `from`, `to`, `action`, `actorPlatformUserId`, `entityType`, `search`.

### Implementation notes

- Read-only in R1; no create/update/delete audit endpoints.
- Order: latest first (`occurredAt` descending).
- Map login results to actions: `platform.login.success`, `platform.login.failed`, `platform.login.locked`.
- Expose loading, empty, error-with-retry, and invalid-date-range states on future UI.
- Do not fake business audit rows in UI when backend scope is login/security only.

See [[03_USER_JOURNEYS/Platform_Admin/14_Audit_Logs_Flow]] and [[05_BACKEND_ARCHITECTURE/API_ENDPOINTS]] for JSON shapes and verification.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new TM-EPOS MVP module boundaries.

## Out Of Scope

- Tenant staff login
- Customer login
- POS sale operation
- Tenant-owned operational data mutation except through approved setup/support APIs

## Related Files

- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/01_Platform_Administration/02_Functional_Rules]]
