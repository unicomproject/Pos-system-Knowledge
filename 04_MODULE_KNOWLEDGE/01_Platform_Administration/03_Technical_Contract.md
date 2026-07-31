<!-- title: Platform Administration Technical Contract -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-07-29 -->
<!-- note: Platform Dashboard contract added; journey SoT is 02_Platform_Dashboard_Flow -->

# Platform Administration Technical Contract

## Purpose

Defines the implementation contract for `Platform_Administration`. This contract is based on
new TM-EPOS MVP scope images and the uploaded Unified Commerce database design.

## Email and tenant lifecycle (approved 2026-07-27)

- Email architecture: [[../../12_INTEGRATIONS/Email_Architecture_And_Provider_Decisions]]
- Event catalog: [[../../12_INTEGRATIONS/Email_Event_And_Template_Catalog]]
- Onboarding journeys: [[../../03_USER_JOURNEYS/Platform_Admin/18_Tenant_Onboarding_Email_Flows]]
- `tenants.status` = lifecycle only (`DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, `CANCELLED`)
- Paid verification or approved waiver recorded -> `PENDING_ACTIVATION`; manual Release 1 paid activation -> `ACTIVE`
- Trial/Demo create orchestration records separate `TENANT_CREATED` and `TENANT_ACTIVATED` events and ends with `ACTIVE`
- Never email plaintext/temporary passwords
- Platform password reset ACS: **IMPLEMENTED**; tenant onboarding emails: **NOT IMPLEMENTED**

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/platform-auth`, `/api/v1/platform-admin/dashboard`, `/api/v1/platform-admin/users`, `/api/v1/platform-admin/roles`, `/api/v1/platform-admin/permissions`, `/api/v1/platform-admin/settings`, `/api/v1/platform-admin/audit-logs`, `/api/v1/platform-admin/tenants`, `/api/v1/platform-admin/catalog`, `/api/v1/platform-auth/password-reset` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

Tenant API lifecycle transition:

- authoritative response field = `lifecycleStatus`
- billing concern field = `billingStatus`
- temporary lifecycle compatibility aliases, if retained, must be marked **deprecated**

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/platform-auth` | **Official** Platform User login, refresh, logout |
| `/api/v1/platform-admin/dashboard` | Platform Dashboard aggregate (see Platform Dashboard Contract) |
| `/api/v1/platform-admin/users` | Module API group |
| `/api/v1/platform-admin/roles` | Module API group |
| `/api/v1/platform-admin/permissions` | Module API group |
| `/api/v1/platform-admin/settings` | Module API group |
| `/api/v1/platform-admin/audit-logs` | Read-only platform login/security audit list (`platform_login_audits`) |
| `/api/v1/platform-admin/tenants` | Tenant list, summary, filter-options, create-options, detail, create, update, activate, suspend, reactivate, entitlements, and tenant audit-logs |
| `/api/v1/platform-admin/catalog` | Platform modules catalog read for Modules & Features admin page |

## Platform Tenant Management Technical Contract

Canonical Journey: [[../../03_USER_JOURNEYS/Platform_Admin/03_Tenant_Management_Flow]]

### Key Rules & Contracts (Approved Decisions Closed 2026-07-31)

1. **Permission Gating & Data Redaction:**
   - Tenant profile/footprint read requires `platform.tenants.view`.
   - Subscription data requires `platform.tenant_subscriptions.view`. Without it, backend MUST omit/redact the `Subscription` payload object (permission leakage fix `SA-TENANT-GAP-01`).
   - Commercial billing data requires `platform.billing.view`.
   - Tenant audit history tab requires `platform.audit.view`.
2. **Reactivation Contract:**
   - `POST /api/v1/platform-admin/tenants/{tenantId}/reactivate` is the dedicated endpoint.
   - Permitted strictly when `tenants.status == SUSPENDED`. Uses canonical permission `platform.tenants.activate`.
   - Emits distinct audit event `tenant.reactivated`.
3. **No Self-Service Cancellation in Release 1:**
   - No Cancel Tenant UI button or `POST .../cancel` endpoint in Release 1 (`SA-TENANT-DECISION-PENDING-01`). `CANCELLED` is a terminal read-only state.
4. **Tenant Audit History Tab:**
   - `GET /api/v1/platform-admin/tenants/{tenantId}/audit-logs` requires `platform.audit.view`.
   - Returns paginated, tenant-isolated audit log events (`tenant.created`, `tenant.profile_updated`, `tenant.entitlements_updated`, `tenant.activated`, `tenant.suspended`, `tenant.reactivated`). Scrubbed of sensitive credentials/tokens.
5. **Optimistic Concurrency Control:**
   - Tenant updates (`PUT .../tenants/{id}` and `PUT .../entitlements`) validate `concurrencyVersion`. Stale updates return HTTP 409 `platform_tenants.conflict`.

## Platform Dashboard Contract


Canonical endpoint: `GET /api/v1/platform-admin/dashboard`  
Controller: `PlatformAdminDashboardController` · Auth: `PlatformOnly` · Permission: `platform.dashboard.view`.

| Item | Contract |
|---|---|
| Current status | **Mostly Implemented** — not Completed |
| Current response | Atomic aggregate `PlatformDashboardResponse` (tenant/subscription counts, attention items, recent tenants, outlets/tills/tenant-user totals, `generatedAt` UTC) |
| Current failure | Whole-response success or failure (no section-level status yet) |

### Dashboard Revenue Rules

- Per-currency MRR; **no FX** conversion or cross-currency totals.
- Include `ACTIVE` paid subscriptions only; exclude `TRIAL`, `PAST_DUE`, `CANCELLED`, `EXPIRED`, one-time.
- Normalise: monthly ÷ 1, yearly ÷ 12; quarterly ÷ 3 when the data model supports quarterly (not in current billing-cycle constants).
- Round using currency precision; display separate currency groups (e.g. LKR MRR, USD MRR).

### Dashboard Lifecycle Rules

- Buckets: Setup Pending / Active / Suspended / Inactive (mutually exclusive).
- Map: `draft`, `setup_pending`, `pending_activation`, `pending_payment` → Setup Pending; `active` → Active; `suspended` → Suspended; `inactive` → Inactive.
- Trial is subscription-only. Inactive is never residual arithmetic.
- `pending_payment` may also raise Pending Billing attention when payment action is required.

### Dashboard Health Rules

- Real technical health: API, database, background jobs, email, payment provider, blob storage.
- Statuses: `HEALTHY`, `DEGRADED`, `CRITICAL`, `UNKNOWN` (critical vs non-critical aggregation).
- Not derived from attention/billing/suspended counts. R1 basic summary under `platform.dashboard.view`.

### Dashboard Permission Rules

| Concern | Permission |
|---|---|
| Page / basic health summary | `platform.dashboard.view` |
| Tenant widget data / navigation | `platform.tenants.view` |
| Billing / MRR | `platform.billing.view` |
| Platform Users count | `platform.users.view` |
| Dedicated tenant-subscription view | `platform.tenant_subscriptions.view` (catalogue + Super Administrator seed/migration; BE+FE Dashboard gating verified 2026-07-30 via SUBS persona — SA-DASH-GAP-13 Completed and Verified) |

### Dashboard Subscription Access

- Approved permission: `platform.tenant_subscriptions.view`
- Purpose: view tenant-level subscription lifecycle and subscription summary widgets.
- Distinction:
  - Not `platform.subscription_plans.view` (plan catalogue/definitions).
  - Not `platform.billing.view` (invoices/payments/revenue).
- MRR requires BOTH `platform.tenant_subscriptions.view` and `platform.billing.view`.
- Default role assignment (approved): `super_administrator` receives this permission by default; Billing Admin, Support Admin, and custom platform roles require explicit assignment.
- Runtime authorization remains permission-based, not role-name-based.
- Current status: **Completed and Verified** (2026-07-30) — catalogue/seed/migration + BE/FE Dashboard gating via SUBS persona; omit/hide (not fake-zero) verified (Gap: `SA-DASH-GAP-13`).
- Evidence audit: [[../../15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-07-29-platform-dashboard/Platform_Dashboard_Implementation_Evidence_2026-07-29]].

See the full product contract: [[../../03_USER_JOURNEYS/Platform_Admin/02_Platform_Dashboard_Flow]].

### Dashboard Trend Timezone

- Platform Default Timezone is authoritative for all dashboard trend-period boundaries.
- Data remains stored/queried using UTC instants; backend converts local period edges (in Platform Default Timezone) to UTC for queries.
- DST-safe rules apply using timezone identifiers (no fixed offsets).
- If Platform Default Timezone is missing/invalid/unresolvable, classify trends as unavailable.
- Current status: **Completed and Verified** (2026-07-30) — historical daily trends + Platform Default Timezone (Gap: `SA-DASH-GAP-02`).

### Currency Metadata Authority

- Central backend currency metadata source aligned with ISO 4217 is authoritative for currency minor-unit precision.
- Minor-unit precision comes from `currencies.decimal_places` for each ISO `currencies.currency_code`.
- Dashboard/Frontend must not hard-code per-currency decimal maps; rounding uses the approved backend currency-precision contract.
- MRR rounding is applied at the final currency-group output boundary per `CurrencyCode` (no FX).
- Approved target API/DTO contract (conceptual — not implemented): each per-currency MRR group in the dashboard response includes `currencyCode`, `decimalPlaces`, and `amount`.
- Approved monetary rounding mode (target contract): when rounding to `decimalPlaces`, use `MidpointRounding.ToEven`.
- **Missing/invalid currency metadata (closed SA-DASH-DECISION-PENDING-01):** if any eligible ACTIVE MRR currency cannot be resolved (no row, missing/null/invalid `decimal_places`, unsupported precision, duplicate/conflicting metadata, or otherwise unresolvable), mark the **entire Revenue / MRR section** UNAVAILABLE. Do not omit silently, default precision, assume 2 dp, infer from locale, substitute tenant default currency, FX-convert, or return zero for the affected group. Preserve other successful sections; HTTP 200 when another useful section succeeds; safe error-code concept `platform_dashboard.currency_metadata_unavailable` (not claimed implemented); secure backend log of CurrencyCode; FE safe unavailable + Refresh retry. Empty eligible ACTIVE subscriptions → successful empty/zero Revenue state (not a metadata failure).
- Current status: **Completed and Verified** (unit + live single-currency MRR groups) — Gap: `SA-DASH-GAP-14`. Forced missing-metadata UNAVAILABLE UI remains under GAP-07 live verification.

### Dashboard Failure Contract

| Mode | Rule |
|---|---|
| Current | Atomic aggregate; whole-page error |
| Target | HTTP **200** with per-section status when any section succeeds; **5xx** only when no useful section; conceptual sectioned DTO not implemented |

Full journey, metric definitions, acceptance criteria, and gap IDs **SA-DASH-GAP-01…14**:

[[../../03_USER_JOURNEYS/Platform_Admin/02_Platform_Dashboard_Flow]]

## Platform Authentication API Group

Official group: `/api/v1/platform-auth` · Controller: `PlatformAuthController`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/platform-auth/login` | Platform User login | Anonymous + rate limit |
| POST | `/api/v1/platform-auth/refresh` | Rotate session via refresh cookie | Anonymous + refresh cookie |
| POST | `/api/v1/platform-auth/logout` | Revoke current platform session | `PlatformOnly` |

Contract rules:

- Refresh token is cookie-only (`platform_refresh_token`, path `/api/v1/platform-auth`); not returned in JSON.
- Canonical login/refresh response model is `PlatformAdminLoginResponse` (`accessToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`, `permissions`).
- Logout success is HTTP **204 No Content**.
- Login requires at least one active `platform.*` permission after credential validation.
- Login security events are written to `platform_login_audits`; retrieval uses `GET /api/v1/platform-admin/audit-logs` with `platform.audit.view`.

### Legacy compatibility aliases

| Legacy endpoint | Role |
|---|---|
| `POST /api/v1/auth/platform-login` | Compatibility only (`PlatformAuthLegacyController`) |
| `POST /api/v1/auth/platform-refresh` | Compatibility only |
| `POST /api/v1/auth/platform-logout` | Compatibility only |

Legacy aliases share `PlatformAuthService` but use a different response envelope, cookie path (`/api/v1/auth`), and logout semantics. They are **not** an equal primary contract.

### Current Angular migration gap

The Platform Admin Angular app currently calls the legacy `/api/v1/auth/platform-*` endpoints and expects the legacy envelope. Migration to `/api/v1/platform-auth/*` is documented as **SA-AUTH-GAP-01** and is not completed.

Full journey, lockout, refresh reuse, error codes, and acceptance criteria:

[[../../03_USER_JOURNEYS/Platform_Admin/01_Login_Flow]]

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
- Platform Admin tenant badges and filters must support `DRAFT`, `PENDING_PAYMENT`, `PENDING_ACTIVATION`, `ACTIVE`, `SUSPENDED`, and `CANCELLED`.
- Pending Activation KPI counts `PENDING_ACTIVATION` only.
- Billing-cycle API values: Monthly -> `monthly`, Annual -> `yearly`, Both/All -> omit the filter parameter (never send literal `both`).

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

`billingStatus` validation is independent from tenant lifecycle. It must never be persisted into `tenants.status`.

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
| Send password reset | `POST /api/v1/platform-admin/users/{userId}/password-reset` | `platform.users.update` |
| Role checkbox options | `GET /api/v1/platform-admin/roles` | `platform.roles.view` |

Public password reset (no platform JWT; rate-limited):

| Action | API |
|---|---|
| Validate token | `POST /api/v1/platform-auth/password-reset/validate` (legacy: `/api/v1/auth/platform-password-reset/validate`) |
| Complete reset | `POST /api/v1/platform-auth/password-reset/complete` (legacy: `/api/v1/auth/platform-password-reset/complete`) |

See [[03_USER_JOURNEYS/Platform_Admin/17_Platform_User_Password_Reset_Flow]] and [[15_IMPLEMENTATION_TRACKING/Backend/Auth/SA-P1-06_Platform_Admin_User_Password_Reset_Implementation]].

Password reset delivery: ACS Email when configured (`deliveryMode=email`, `resetUrl=null`); Dev may fall back to `admin_secure_link`. Self-service Forgot Password and tenant resets remain out of scope.

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

Tenant lifecycle alignment minimum future tests:

- Paid create -> `PENDING_PAYMENT`
- Paid cannot activate before payment verification or approved waiver
- Paid verification / waiver -> `PENDING_ACTIVATION`
- Trial create -> create + auto-activate -> `ACTIVE`
- Demo create -> create + auto-activate -> `ACTIVE`
- Billing cycle / subscription type / payment status never write into `tenants.status`
- Invalid lifecycle value rejected before or at DB constraint

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
- [[../../03_USER_JOURNEYS/Platform_Admin/01_Login_Flow]]
- [[../../03_USER_JOURNEYS/Platform_Admin/02_Platform_Dashboard_Flow]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
