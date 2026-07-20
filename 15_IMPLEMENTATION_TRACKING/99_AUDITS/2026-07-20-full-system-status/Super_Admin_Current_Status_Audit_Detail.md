<!-- title: Super Admin Current Status Audit Detail -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# Super Admin Audit Detail (Matrix, Gaps, SB)

Companion to [[Super_Admin_Current_Status_Audit]]. SA-P0-01: [[SA-P0-01_Tenant_Wizard_Field_Persistence_Fix]]. SA-P0-02: [[SA-P0-02_Dashboard_Attention_Count_Fix]].

## 2–7. Feature status matrix

| Feature | Scope | Status | FE | BE | DB | Perm | Tests | Missing | Next |
|---|---|---|---|---|---|---|---|---|---|
| Platform login/refresh/logout | R1 | COMPLETE | `AuthApiService` `/auth/platform-*` | `PlatformAuthLegacyController` | sessions/tokens | PlatformOnly | auth specs + ApiTests | Forgot-password | — |
| Guards / 401 refresh | R1 | COMPLETE | auth/permission guards; interceptor | JWT + session validator | sessions | codes on routes | guard specs | — | — |
| Dashboard | R1 | COMPLETE | `PlatformDashboardPage` + attention RouterLinks | `GET …/dashboard` (counts unswapped) | real aggregates | `dashboard.view` | dashboard + repository swap tests | Browser UI pixel verify optional | — |
| Tenant list/filter/page | R1 | COMPLETE | list page + API | TenantsController | tenants | `tenants.view` | tenant specs | — | — |
| Tenant detail/edit | R1 | COMPLETE | detail page | GET/PUT tenants | tenant/profile | view/update | specs | — | — |
| Create tenant wizard | R1 | PARTIAL | 7 steps create page | wizard write txn; locale/mode/type/country mapped | `tenants.default_locale`/`operating_mode`; profile business type; address country | `tenants.create` | wizard + mapper + validator + repo tests | Optional outlet/till/domain steps; live migration apply | SA-P2-02 |
| Activate/Suspend | R1 | COMPLETE | buttons + API | POST activate/suspend | status | activate/suspend | specs | — | — |
| Soft-delete / status history | R1 | NOT_STARTED | none | none | — | — | — | Design + API | SA-P1-07 |
| Entitlements update | R1 | COMPLETE | detail entitlements | PUT entitlements | `TenantFeatureEntitlement` | entitlements.update | specs | — | — |
| Subscription plans lifecycle | R1 | COMPLETE | list/create/detail | PlansController + reactivate | plans | subscription_plans.* | plan specs | — | — |
| Modules catalog | R1 | COMPLETE (read) | modules page | GET catalog/modules | modules/features | modules.view | specs | Mutations N/A | — |
| Platform users | R1 | PARTIAL | users page | users CRUD/roles | platform_users | users.* | user specs | Reset password; rich edit | SA-P1-06 |
| Roles + perm assign | R1 | COMPLETE | catalog page (API-driven 36) + return-policy static keys | roles + permissions | roles/maps | roles.* + return_policy.* | role + permission-keys specs | — | — |
| Settings | R1 | COMPLETE | system settings | GET/PUT settings | platform_settings | settings.* | settings specs | — | — |
| Billing issue/mark-paid | R1 | COMPLETE* | billing page | BillingController | invoices | billing.view/manage | billing suite | *within scoped ops | — |
| Payment links | R1 (mandatory) | DATABASE_ONLY | none | entity only | `subscription_payment_links` | billing.manage reserved | domain tests | PayHere API/UI/webhook/public page | [[SA-P1_Payment_Links_Release_1_Scope_And_Sequencing]] |
| Domain/SSL | R1 | DATABASE_ONLY | none | none | `tenant_domains` | — | — | API+UI | SA-P1-03 |
| Audit logs | R1 | PARTIAL | audit page | audit-logs | login_audits | audit.view | specs | Business audit | SA-P1-05 |
| Platform reports/alerts | R1 | OUT_OF_SCOPE (nav) | removed from menu | none | — | — | — | Future platform product | Hidden until implemented |
| Return policy templates | R1 | COMPLETE | list/create/detail pages + API service | return-policy-templates CRUD | templates | return_policy.* | ApiTests + Angular specs | — | — |
| Modern `/platform-auth` | — | BACKEND_ONLY | unused | PlatformAuthController | — | — | ApiTests | Adopt or doc legacy-only | SA-P2-01 |

\*Billing Phase docs claim RELEASE READY for issue/mark-paid; payment links mandatory R1 but not started — treat billing issue/mark-paid as scoped COMPLETE.

### Navigation cleanup (SA-P1-02)

Platform sidebar no longer lists Outlets, Tills, Products, Alerts, or Reports. Stub routes and tenant `AdminSectionPage` placeholders removed from `admin.routes.ts`. Direct unknown `/admin/*` paths redirect to dashboard. See [[SA-P1-02_Platform_Admin_Stub_Navigation_Cleanup]].
### Wizard FE→BE field persistence (SA-P0-01)

| Field | Persist target | Notes |
|---|---|---|
| `defaultLocale` | `tenants.default_locale` | Nullable; catalogue-validated; returned on detail/list |
| `operatingMode` | `tenants.operating_mode` | `unified_epos` / `pos_online_store` / `pos_only` |
| `businessType` | `tenant_profiles.business_type_id` | Resolved from active `business_types.business_code` |
| `countryCode` | `tenant_addresses.country_code` | Top-level and/or `address.countryCode`; no hardcoded country default |

Update omits locale/mode when those properties are null so unrelated edits do not wipe values.

**Local Development DB migration apply:** verified on `UnifiedCommerceDb` @ localhost (2026-07-20). **Production DB:** not applied in this task.

Country write-path:

- Matching top-level + address country → one primary address
- Top-level country only → creates primary REGISTERED address
- Conflicting codes → validation failure on both fields

See [[SA-P0-01_Tenant_Wizard_Field_Persistence_Fix]].

### Dashboard attention metrics (SA-P0-02)

| Type | Count definition | Card navigation |
|---|---|---|
| `suspended_tenants` | Tenant status `suspended` | `/admin/tenants?status=suspended` |
| `setup_pending` | Tenant status `setup_pending` or `pending_payment` | `/admin/tenants?status=setup_pending` |
| `past_due_subscriptions` | Subscription status `PAST_DUE` | `/admin/tenants?billingStatus=PAST_DUE` |
| `pending_billing` | Invoices `PENDING` with `balance_due > 0` | `/admin/billing` |

Root cause was crossed assignment of past-due vs pending-billing counts in `PlatformDashboardRepository`. Alleged dashboard `"UNKNOWN"` billing was unused dead code (removed). FE `itemsRequiringAttention` = sum of attention counts.

See [[SA-P0-02_Dashboard_Attention_Count_Fix]].

---

## 8. API contract gaps

| Gap | FE | BE | Issue |
|---|---|---|---|
| Dual auth | `/auth/platform-*` | also `/platform-auth/*` | FE legacy only |
| Dead constant | `features: '/features'` | no controller | Unused |
| Flat catalog | constant unused | GET `…/flat` exists | Unused FE |
| Return policy | no endpoints | full CRUD | BACKEND_ONLY |
| Payment links | none | entity only | DATABASE_ONLY |
| Domains | none | table only | DATABASE_ONLY |
| Perm keys | guarded UI 31 | assignable 36 | Static FE keys are UI-guard subset; role form uses catalogue API — [[Platform_Admin_Permission_Catalogue_Alignment]] |
| Plan reactivate | **wired** | POST reactivate | Prior gap doc stale |

---

## 9. Second Brain conflicts

| File | Claim | Actual | Severity |
|---|---|---|---|
| `Platform_Billing_UI_Implementation_Status.md` | RELEASE READY | Issue/mark-paid only; payment links R1 planned last | P1 |
| `Permission_Code_List` / Role Mgmt | 36 codes | BE 36 assignable; FE guarded UI 31; role UI loads 36 from API | Resolved — not a P0 |
| `Full_Feature_Status_Index.md` | Angular tenant In Progress | Wired complete | P2 |
| `ADR_006` | Ecommerce → R2 (empty Draft) | Out of SA; conflicts MVP scope | P1 (planning) |
| `Platform_Admin_UI_Rules` | Wizard includes domain | No domain step/API | P2 |
| Jul-20 `01_Super_Admin_Feature_Status` | Reports stub; domains NS | Matches | OK |

---

## Related Files

- [[Super_Admin_Current_Status_Audit]]
- [[SA-P0-01_Tenant_Wizard_Field_Persistence_Fix]]
- [[SA-P0-02_Dashboard_Attention_Count_Fix]]
- [[Platform_Admin_Permission_Catalogue_Alignment]]
- `PlatformPermissionCodes.cs`, `permission-keys.ts`
- `PlatformDashboardRepository.cs`, `platform-tenant-create.mapper.ts`
