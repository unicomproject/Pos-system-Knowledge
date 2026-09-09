# TENANT ADMIN + CASHIER ROLE ACCESS FE-BE GAP AUDIT

Date: 2026-08-20  
Scope: Audit only. No product code changed in this task.

---

## 1. Executive Summary

The current Role & Access implementation is **partially implemented end-to-end**, with a solid backend base already present, but it is **not fully closed** against the new canonical 2-role / 5-step contract.

What is already strong:

- Backend role CRUD, permission catalog, permission replacement, and assignment replacement endpoints exist.
- Backend build passes.
- EF model snapshot is aligned with migrations.
- Focused AccessControl unit and API tests pass.
- Flutter already has a 5-step wizard structure.

What is not closed yet:

- Flutter Step 1 still hardcodes legacy role choices and still shows `Super Admin`.
- The frontend wizard is not fully canonical for `TENANT_ADMIN` + `CASHIER`.
- Final save is still split across separate APIs, so atomic FE-BE “review & save” behavior is not guaranteed.
- Edit/update flows do not consistently propagate concurrency tokens.
- The strongest backend security gap is in `TenantAdminContextRepository`, which still contains ad-hoc effective-permission resolution with missing revoked filters on multiple paths.
- Canonical Second Brain verification is only partial because the `Pos-system-Knowledge` repository was not present locally in this workspace.

---

## 2. Repository State

| Repository | Branch | HEAD | Dirty/Clean | Notes |
| --- | --- | --- | --- | --- |
| `Unified-Commerce` | `prmissionscreen` | `5a95d03` | Dirty | Modified: `src/E_POS.Api/appsettings.json` |
| `Tenantadmin/Nytroz-POS-App` | `tenantpermision` | `7530c7b` | Clean | No local changes observed during audit |
| `Pos-system-Knowledge` | N/A | N/A | N/A | Repository not present in current workspace |

Recent git evidence was collected from current working trees only. No reset, checkout, merge, commit, or discard operations were performed.

---

## 3. Canonical Contract Verified

### Canonical Flow

1. Select Role
2. Select Modules
3. Configure Permissions
4. Assign Users & Access Scope
5. Review & Save

### Canonical Role Set

- `TENANT_ADMIN`
- `CASHIER`

### Verification Status

| Item | Status | Severity | Notes |
| --- | --- | --- | --- |
| 5-step flow recognized in audit task | PASS | P2 | Used as current audit contract |
| Canonical 2-role target recognized | PASS | P2 | Used as current audit contract |
| Local canonical Second Brain repo available | MISSING | P3 | `Pos-system-Knowledge` repo not present locally |
| Contradictory active docs locally rechecked | PARTIAL | P3 | Could not fully verify without missing repo |

---

## 4. Step 1 Audit — Select Role

### Expected

Only:

- `TENANT_ADMIN`
- `CASHIER`

### Current Flutter Evidence

`Tenantadmin/Nytroz-POS-App/lib/features/tenant_admin/role_permissions/presentation/screens/role_setup_step1_role_screen.dart`

Current Step 1 is **hardcoded** and currently exposes:

- `tenant-admin`
- `super-admin`
- `cashier`

The wizard provider also hardcodes template semantics in:

`Tenantadmin/Nytroz-POS-App/lib/features/tenant_admin/role_permissions/presentation/providers/role_setup_wizard_provider.dart`

### Current Backend Evidence

`Unified-Commerce/src/E_POS.Api/Controllers/V1/Tenant/AccessControl/TenantAdminRolesController.cs`

Backend exposes role list endpoints, but there is **no dedicated setup-options endpoint** discovered for canonical Step 1 filtering.

### Step 1 Verdict

| Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Only `TENANT_ADMIN` and `CASHIER` shown in setup UI | PARTIAL | PARTIAL | PARTIAL | MISSING | MISSING | PARTIAL | P1 |
| Step 1 is backend-driven | PARTIAL | PARTIAL | N/A | MISSING | MISSING | PARTIAL | P1 |
| `Super Admin` removed from current setup flow | PARTIAL | N/A | N/A | MISSING | MISSING | MISSING | P1 |

### `GET /roles/setup-options`

Classification: **RECOMMENDED**

Reason:

- Current backend role list is generic CRUD/list behavior.
- Canonical Step 1 now needs curated system-role setup choices.
- This can be derived in Flutter, but a dedicated options contract would reduce drift and hardcoding.

---

## 5. Step 2 Audit — Select Modules

### Expected Presentation Groups

- Dashboard
- Outlets
- Tills
- Users
- Products
- Inventory
- Sales (POS)
- Reports
- Online Store

### Current Backend Source of Truth

The permission catalog is backend-driven through:

- `platform_modules`
- `platform_features`
- `permission_definitions`
- `tenant_feature_entitlements`

Route:

- `GET /api/v1/tenant-admin/permission-catalog`

### Current Flutter

Step 2 is structurally connected to backend catalog data, which is good.  
However, UI grouping and role-template defaults are still partly frontend-owned.

### Backend Module / Feature → UI Card Mapping

| Backend Family | UI Presentation Card | Mapping Status |
| --- | --- | --- |
| `dashboard` / dashboard features | Dashboard | PASS |
| `outlets` / outlet management features | Outlets | PASS |
| `tills` / till management features | Tills | PASS |
| `users`, `roles`, `permissions` families | Users / Roles & Access | PARTIAL |
| `catalog.products`, `brands`, related catalog families | Products | PASS WITH GAPS |
| `inventory`, stock families | Inventory | PASS |
| `sales`, `pos`, `payments`, cash drawer families | Sales (POS) | PARTIAL |
| `reports` | Reports | PASS |
| `online_store` / storefront families | Online Store | PASS WITH GAPS |

### Step 2 Verdict

| Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Backend-driven module source | PASS | PASS | PASS | PASS | PARTIAL | PASS | P2 |
| 9 presentation cards map cleanly from catalog | PARTIAL | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P2 |
| Entitlement-aware Online Store card | PARTIAL | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P1 |

---

## 6. Step 3 Audit — Configure Permissions

### Current Backend

Current routes exist:

- `GET /api/v1/tenant-admin/roles/{roleId}/permissions`
- `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`

The backend service/repository path for permission replacement exists and is materially implemented.

### Current Flutter

Step 3 is structured around backend catalog data, but the screen still needs stronger evidence for:

- dynamic counts only
- locked/blocked permission representation
- actor ceiling / template ceiling clarity

Any hardcoded presentation counts are a gap against the canonical contract.

### Historical Permission Gaps Re-Audit

| Permission / Family | Defined | Seeded | Granted Evidence | Controller Enforced | Tests | Final Status |
| --- | --- | --- | --- | --- | --- | --- |
| `tenant.roles.create` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `tenant.roles.update` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `tenant.roles.delete` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `tenant.roles.permissions.view` | PASS | PARTIAL | PARTIAL | PASS | PARTIAL | PARTIAL |
| `tenant.roles.permissions.update` | PASS | PARTIAL | PARTIAL | PASS | PARTIAL | PARTIAL |
| `tenant.roles.assignments.view` | PASS | PARTIAL | PARTIAL | PASS | PARTIAL | PARTIAL |
| `tenant.roles.assignments.update` | PASS | PARTIAL | PARTIAL | PASS | PARTIAL | PARTIAL |
| `tenant.dashboard.view` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `tenant.reports.*` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| `catalog.products.publish` | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| tax namespaces | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| discount namespaces | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |

Note: this audit did not regenerate a fresh canonical permission census from the missing Second Brain repository, so these remain **PARTIAL** instead of green.

### Advanced Product Permission Audit

| Permission | Status |
| --- | --- |
| `catalog.variants.manage` | PARTIAL |
| `catalog.barcodes.manage` | PARTIAL |
| `catalog.products.restore` | PARTIAL |
| `catalog.product_cost.view` | PARTIAL |
| `catalog.products.import` | PARTIAL |

### Step 3 Verdict

| Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Permission catalog endpoint exists | PASS | PASS | PASS | PASS | PASS | PASS | P2 |
| Permission replacement endpoint exists | PASS | PASS | PASS | PASS | PASS | PASS | P2 |
| Dynamic UI counts only | PARTIAL | N/A | N/A | PARTIAL | MISSING | PARTIAL | P2 |
| Locked / blocked reasons surfaced clearly | PARTIAL | PARTIAL | N/A | PARTIAL | MISSING | PARTIAL | P2 |

---

## 7. Step 4 Audit — Assign Users & Access Scope

### Expected

Per selected user:

- `TENANT_WIDE`
- `SELECTED_OUTLETS`

### Current Backend

Current assignment APIs exist:

- `GET /api/v1/tenant-admin/roles/{roleId}/assignments`
- `GET /api/v1/tenant-admin/roles/{roleId}/users`
- `PUT /api/v1/tenant-admin/roles/{roleId}/assignments`

Related supporting APIs used by FE:

- `GET /api/v1/tenant-admin/users`
- `GET /api/v1/tenant-admin/outlets/options`
- `GET /api/v1/tenant-admin/context`

### Current Flutter Evidence

`role_setup_step4_assignments_screen.dart` currently:

- loads users through generic `tenant-admin/users`
- uses fixed `pageSize: 50`
- reads outlets from `tenantAdminContextProvider`, not a dedicated setup options contract
- relies on `RoleSetupFooterActions` default `canContinue = true`

This means validation and setup-specific curation are still incomplete.

### Step 4 Scope Persistence Semantics

Repository/service evidence indicates:

- `TENANT_WIDE` → `tenant_user_roles`
- `SELECTED_OUTLETS` → `outlet_user_roles`

Soft revoke/reactivation behavior is implemented in repository patterns, but PostgreSQL integration verification was not fully stable in this environment.

### Step 4 Verdict

| Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Per-user scope model exists | PASS | PASS | PASS | PASS | PARTIAL | PASS WITH GAPS | P1 |
| Setup screen uses setup-specific curated options | PARTIAL | PARTIAL | N/A | MISSING | MISSING | PARTIAL | P1 |
| Continue only when state is valid | PARTIAL | N/A | N/A | MISSING | MISSING | MISSING | P1 |
| Staff code search/display fully evidenced | PARTIAL | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P2 |

---

## 8. Step 5 Audit — Review & Save

### Current Flutter Evidence

`role_setup_step5_review_screen.dart` currently:

- shows review structure
- calls final create action
- still shows raw selected user IDs
- still shows raw outlet IDs
- computes access level heuristically from permission count

Current button language is still oriented around create flow rather than canonical “save role access / update access”.

### Current Save Model

Current backend save behavior is **split**:

1. metadata create/update
2. permissions replace
3. assignments replace

There is no confirmed single FE-BE atomic “role setup save” endpoint.

### Step 5 Verdict

| Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Review sections exist | PASS | N/A | N/A | PASS | MISSING | PASS | P2 |
| Edit-to-step navigation exists | PASS | N/A | N/A | PARTIAL | MISSING | PARTIAL | P2 |
| Review shows resolved display data, not raw IDs | PASS | PARTIAL | N/A | MISSING | MISSING | MISSING | P1 |
| Final save is atomic | PASS | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P1 |

---

## 9. Tenant Admin Role Template Audit

Expected direction:

- Business administration role
- Does not automatically inherit cashier operational POS permissions unless explicitly intended

### Audit Result

Current source confirms roles/permissions infrastructure exists, but this audit could not fully prove a clean canonical `TENANT_ADMIN` template closure for every tenant from local evidence alone.

### Tenant Admin Matrix

| UI Module | Permission Families | Default Selected | Locked / Protected | Entitlement Dependent | Status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | dashboard view/report access | Expected Yes | Partial | No | PARTIAL |
| Outlets | outlet management | Expected Yes | Partial | No | PARTIAL |
| Tills | till management/readiness | Expected Yes | Partial | No | PARTIAL |
| Users | users + role access | Expected Yes | Partial | No | PARTIAL |
| Products | catalog management | Expected Yes | Partial | No | PARTIAL |
| Inventory | inventory management | Expected Yes | Partial | No | PARTIAL |
| Sales (POS) | cashier operational families | Expected No/limited by default | Partial | No | PARTIAL |
| Reports | tenant reports | Expected Yes | Partial | No | PARTIAL |
| Online Store | storefront families | Expected Entitled only | Partial | Yes | PARTIAL |

### Gap

Search-based evidence is still needed to prove `TENANT_ADMIN` does **not** accidentally receive cashier-only POS families by default.

---

## 10. Cashier Role Template Audit

Expected direction:

- System role
- Operational
- Till-scoped
- POS-focused
- Must not receive tenant-administration permissions

### Cashier Matrix

| UI Module | Permission Families | Default Selected | Locked / Protected | Entitlement Dependent | Status |
| --- | --- | --- | --- | --- | --- |
| Dashboard | POS dashboard view | Expected Yes | Partial | No | PARTIAL |
| Outlets | outlet administration | Expected No | Partial | No | PARTIAL |
| Tills | till operations | Expected Yes | Partial | No | PARTIAL |
| Users | tenant user administration | Expected No | Partial | No | PARTIAL |
| Products | search/view only | Expected Limited | Partial | No | PARTIAL |
| Inventory | tenant stock administration | Expected No | Partial | No | PARTIAL |
| Sales (POS) | sales, payment, receipt, cashier ops | Expected Yes | Partial | No | PARTIAL |
| Reports | tenant admin reports | Expected No/limited | Partial | No | PARTIAL |
| Online Store | tenant online-store admin | Expected No | Partial | Yes | PARTIAL |

### Gap

Cashier production-grade tenant bootstrap and over-grant closure are **not yet evidenced strongly enough** to mark PASS.

---

## 11. Permission Catalog Reconciliation

### Current State

- Backend catalog exists and is reusable.
- Flutter uses it for Step 2 and Step 3.
- Entitlement-aware filtering appears designed into backend shape, but local canonical cross-check is incomplete.

### Role-Template Ceiling

Status: **PARTIALLY ENFORCED / NOT FULLY EVIDENCED**

Reason:

- Schema foundation exists through role templates and template version permissions.
- Full end-to-end evidence that replacement always applies:
  - active permission catalog
  - tenant entitlements
  - actor delegation ceiling
  - selected role template ceiling

was not conclusively proven from current local audit evidence.

---

## 12. Permission Seed Reconciliation

### Summary

The permissions system is clearly active, but this audit did **not** produce a final canonical permission census that should replace historical counts.

Status: **PASS WITH GAPS**

Reason:

- Current backend clearly relies on `permission_definitions`.
- Focused AccessControl tests pass.
- But the local canonical documentation repo was missing, so “final canonical seed closure” cannot honestly be marked green.

---

## 13. Effective Permission Resolver Audit

### Strongest Backend Risk

`Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Repositories/TenantAdminContextRepository.cs`

This repository still performs **ad-hoc effective permission aggregation** for tenant-admin context.

Observed gaps:

- missing `RevokedAt == null` filtering on several permission/role joins
- missing canonical single-resolver usage
- a direct tenant-user-permission path without sufficiently strong tenant/revocation evidence in the current query path

### Status

| Requirement | Status | Severity |
| --- | --- | --- |
| Single canonical effective permission resolver used everywhere | PARTIAL | P0 |
| Revoked grants excluded on all context paths | MISSING | P0 |
| Tenant isolation consistently enforced on all resolution paths | PARTIAL | P0 |

---

## 14. Delegation Ceiling Audit

### Current State

Delegation ceiling behavior exists in backend role mutation flows and error mapping includes:

- `tenant_roles.delegation_ceiling_exceeded`

Focused AccessControl backend tests passed, which is a positive signal.

### Gap

Full canonical closure for actor ceiling **plus** role-template ceiling **plus** 2-role setup UX was not fully evidenced end-to-end.

Status: **PASS WITH GAPS**  
Severity: **P1**

---

## 15. Last Admin Protection Audit

### Current State

Backend error mapping includes:

- `tenant_roles.last_admin_protected`

Focused backend AccessControl test coverage passed in unit/API layers.

### Gap

PostgreSQL integration closure was not fully reliable in this environment, so the race/transaction closure cannot be declared fully complete from this audit alone.

Status: **PASS WITH GAPS**  
Severity: **P1**

---

## 16. Revocation / Reactivation Audit

### Current State

Repository patterns and test names indicate intended behavior:

- revoke old mapping
- reactivate historical row when re-added
- avoid duplicate unique-key insertion

### Gap

Focused PostgreSQL integration tests were partially blocked by environment/shared-memory issues, so final DB-backed proof is incomplete here.

Status: **PASS WITH GAPS**  
Severity: **P1**

---

## 17. Tenant Isolation Audit

### Current State

Backend architecture is tenant-scoped and role endpoints are clearly tenant-admin namespaced.

### Gap

The context repository permission-resolution path remains the main isolation risk because it is not fully canonical and misses revoked filters.

Status: **PASS WITH GAPS**  
Severity: **P0**

---

## 18. Database Table Matrix

| Table | Purpose | Read/Write Step | Current Schema | Current Repository Use | Gap |
| --- | --- | --- | --- | --- | --- |
| `tenant_roles` | tenant role aggregate | 1, 5 | Present | Active | None |
| `role_templates` | system template source | 1, 2, 3 | Present | Partial evidence | Template closure proof incomplete |
| `role_template_versions` | versioned template state | 1, 2, 3 | Present | Partial evidence | Needs stronger enforcement proof |
| `role_template_version_permissions` | template permission ceiling | 2, 3 | Present | Partial evidence | Ceiling enforcement not fully proven |
| `platform_modules` | module catalog | 2, 3 | Present | Active | None |
| `platform_features` | feature catalog | 2, 3 | Present | Active | None |
| `permission_definitions` | canonical permission catalog | 2, 3 | Present | Active | Final census not fully reconciled |
| `tenant_role_permissions` | role grants | 3 | Present | Active | Need stronger PG proof for reactivation closure |
| `tenant_users` | selectable tenant users | 4 | Present | Active | StaffCode support needs clearer FE closure |
| `tenant_user_roles` | tenant-wide role assignments | 4 | Present | Active | Need stronger PG proof for reactivation closure |
| `tenant_user_permissions` | direct tenant grants | resolver | Present | Active | Context query path needs re-audit/fix |
| `outlets` | outlet scope options | 4 | Present | Active | Setup flow still depends on context data |
| `outlet_user_roles` | outlet-scoped role assignments | 4 | Present | Active | Need stronger PG proof for reactivation closure |
| `outlet_user_permissions` | outlet direct grants | resolver | Present | Active | Context query path needs re-audit/fix |
| `tenant_feature_entitlements` | subscription gating | 2, 3 | Present | Active | Online Store UX contract not fully closed |
| `audit_logs` | mutation audit trail | 5 | Present | Active | Needs deeper event-level closure proof |
| `idempotency_requests` | safe command replay | 5 | Present | Active | Create-flow closure not fully reverified here |

---

## 19. API Matrix

| API | Current? | Used by Step | Permission | Backend Status | Flutter Integration | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| `GET /api/v1/tenant-admin/roles` | Yes | 1 | tenant role view | PASS | PARTIAL | Generic list, not setup-curated |
| `GET /api/v1/tenant-admin/roles/{roleId}` | Yes | 5/edit | tenant role view | PASS | PASS | None |
| `POST /api/v1/tenant-admin/roles` | Yes | 5 | tenant role create | PASS | PARTIAL | Response-shape mapping risk |
| `PUT /api/v1/tenant-admin/roles/{roleId}` | Yes | edit | tenant role update | PASS | PARTIAL | FE ignores concurrency in edit flow |
| `PATCH /api/v1/tenant-admin/roles/{roleId}/status` | Yes | lifecycle | tenant role update | PASS | PARTIAL | Not central to wizard |
| `DELETE /api/v1/tenant-admin/roles/{roleId}` | Yes | lifecycle | tenant role delete | PASS | PARTIAL | Not central to wizard |
| `GET /api/v1/tenant-admin/permission-catalog` | Yes | 2,3 | `roles.permissions.view` equivalent | PASS | PASS | Needs stronger metadata/ceiling surfacing |
| `GET /api/v1/tenant-admin/roles/{roleId}/permissions` | Yes | 3/edit | permission view | PASS | PASS | None |
| `PUT /api/v1/tenant-admin/roles/{roleId}/permissions` | Yes | 3,5 | permission update | PASS | PARTIAL | Concurrency not clearly propagated in FE |
| `GET /api/v1/tenant-admin/roles/{roleId}/assignments` | Yes | 4/edit | assignment view | PASS | PARTIAL | None |
| `GET /api/v1/tenant-admin/roles/{roleId}/users` | Yes | compat read | assignment view | PASS | PARTIAL | Compatibility projection only |
| `PUT /api/v1/tenant-admin/roles/{roleId}/assignments` | Yes | 4,5 | assignment update | PASS | PARTIAL | No FE concurrency token |
| `GET /api/v1/tenant-admin/users` | Yes | 4 | user view | PASS | PASS | Setup still generic |
| `GET /api/v1/tenant-admin/outlets/options` | Yes | 4 | outlet view | PASS | PARTIAL | FE currently prefers context for scope list |
| `GET /api/v1/tenant-admin/context` | Yes | 4 / global guards | context view | FAIL | PASS | Main security gap in permission resolution |
| `GET /api/v1/tenant-admin/users/create-options` | Yes | adjacent | user create | PASS | N/A | Not used by role setup |

### Existing APIs Reusable

Count: **16**

---

## 20. Flutter Integration Matrix

| Area | Files | Status | Gap |
| --- | --- | --- | --- |
| Wizard state | `role_setup_wizard_provider.dart` | PARTIAL | Hardcoded templates, heuristic access level, placeholder draft |
| Step 1 | `role_setup_step1_role_screen.dart` | FAIL | Still shows `Super Admin` |
| Step 2 | `role_setup_step2_modules_screen.dart` | PASS WITH GAPS | Backend-driven, but still needs canonical role-template defaults |
| Step 3 | `role_setup_step3_permissions_screen.dart` | PASS WITH GAPS | Needs stronger dynamic counts / blocked-state closure |
| Step 4 | `role_setup_step4_assignments_screen.dart` | FAIL | Generic users/context dependency, default continue enablement |
| Step 5 | `role_setup_step5_review_screen.dart` | FAIL | Raw IDs, heuristic summary, non-canonical final wording |
| Edit flow | `edit_role_providers.dart` | FAIL | Concurrency intentionally skipped for metadata |
| Repo contract | `role_permission_repository.dart` | FAIL | Assignment update lacks `expectedUpdatedAt` |
| Remote mapping | `role_permission_repository_impl.dart` | PARTIAL | Create response mapping may drift from backend shape |
| Shell/session refresh | tenant admin providers/layout | PARTIAL | Context invalidation exists broadly, but role-save-specific refresh closure is not clearly centralized |

---

## 21. Automated Test Evidence

### Backend Build

Command:

`dotnet build E_POS.sln --configuration Release -m:1`

Result: **PASS**

### Pending Model Check

Command:

`dotnet ef migrations has-pending-model-changes --project src/E_POS.Infrastructure/E_POS.Infrastructure.csproj --startup-project src/E_POS.Api/E_POS.Api.csproj`

Result: **PASS**  
Output: no pending model changes

### Focused AccessControl Unit Tests

Command:

`dotnet test tests/E_POS.UnitTests/E_POS.UnitTests.csproj --configuration Release --filter "FullyQualifiedName~AccessControl"`

Result: **PASS**  
Count: **94 passed**

### Focused AccessControl API Tests

Command:

`dotnet test tests/E_POS.ApiTests/E_POS.ApiTests.csproj --configuration Release --filter "FullyQualifiedName~AccessControl"`

Result: **PASS**  
Count: **11 passed**

### Focused AccessControl PostgreSQL Integration Tests

Command:

`dotnet test tests/E_POS.IntegrationTests/E_POS.IntegrationTests.csproj --configuration Release --filter "FullyQualifiedName~AccessControl"`

Result: **FAIL / ENVIRONMENT-BLOCKED**  
Observed summary: **8 passed, 7 failed**

Primary blocker observed:

- PostgreSQL/shared-memory environment instability during test setup and migrations

### Full Backend Test Suite

Command:

`dotnet test E_POS.sln --configuration Release -m:1`

Result: **PASS WITH GAPS**

Observed summary:

- **2235 passed**
- **3 failed**

Observed failures were outside the audited Role & Access closure path:

- inventory/current stock SQL column mismatch
- idempotency deadlock test elsewhere
- migration seed FK issue elsewhere

### Flutter Analyze / Flutter Test

Attempted, but the local Flutter command execution was not conclusively returning usable output in this environment.

Result: **NOT COMPLETELY VERIFIED**

This audit does **not** claim green Flutter validation.

---

## 22. Existing APIs

Reusable current APIs:

1. `GET /api/v1/tenant-admin/roles`
2. `GET /api/v1/tenant-admin/roles/{roleId}`
3. `POST /api/v1/tenant-admin/roles`
4. `PUT /api/v1/tenant-admin/roles/{roleId}`
5. `PATCH /api/v1/tenant-admin/roles/{roleId}/status`
6. `DELETE /api/v1/tenant-admin/roles/{roleId}`
7. `GET /api/v1/tenant-admin/permission-catalog`
8. `GET /api/v1/tenant-admin/roles/{roleId}/permissions`
9. `PUT /api/v1/tenant-admin/roles/{roleId}/permissions`
10. `GET /api/v1/tenant-admin/roles/{roleId}/assignments`
11. `GET /api/v1/tenant-admin/roles/{roleId}/users`
12. `PUT /api/v1/tenant-admin/roles/{roleId}/assignments`
13. `GET /api/v1/tenant-admin/users`
14. `GET /api/v1/tenant-admin/outlets/options`
15. `GET /api/v1/tenant-admin/context`
16. `GET /api/v1/tenant-admin/users/create-options`

---

## 23. Proposed APIs

1. `GET /api/v1/tenant-admin/roles/setup-options`
2. `PUT /api/v1/tenant-admin/roles/{roleId}/setup`

### Classification

| API | Status |
| --- | --- |
| `GET /roles/setup-options` | RECOMMENDED |
| `PUT /roles/{id}/setup` | REQUIRED FOR ATOMIC UX |

---

## 24. P0 Gaps

1. `TenantAdminContextRepository` still contains ad-hoc effective-permission resolution with missing revoked filters on multiple grant paths.  
2. Tenant-admin context permission resolution is not yet clearly routed through one canonical resolver everywhere.  
3. Tenant isolation / revocation safety in context resolution is therefore not strong enough to mark green.  

P0 Count: **3**

---

## 25. P1 Gaps

1. Step 1 still exposes `Super Admin` instead of canonical `TENANT_ADMIN` + `CASHIER` only.  
2. Step 1 remains frontend-hardcoded instead of setup-driven.  
3. Step 4 uses generic users/context data instead of setup-specific curated options.  
4. Step 4 footer can continue with default enablement instead of strong validation gating.  
5. Step 5 review shows raw user IDs and outlet IDs.  
6. Final save is split across separate permission + assignment APIs, creating partial-save risk.  
7. Edit-role metadata update explicitly skips concurrency token usage.  
8. Assignment update contract lacks explicit concurrency token propagation from Flutter.  

P1 Count: **8**

---

## 26. P2 Gaps

1. Role access level in review is heuristic, not backend-authoritative.  
2. Dynamic permission/module selected counts need stronger no-hardcode assurance.  
3. Role list backend default page size is `10`, while canonical FE list behavior is `5`.  
4. Create-role response mapping in Flutter may drift from backend payload wrapper/field shape.  
5. Role-template ceiling enforcement is not fully evidenced end-to-end.  
6. Online Store entitlement UX is only partially closed.  
7. Staff code support is not fully evidenced across search/display contract.  
8. Save Draft is still placeholder behavior in wizard provider.  
9. Final button language and review wording are not fully canonical.  
10. Flutter validation coverage for the new 5-step flow is insufficiently evidenced.  

P2 Count: **10**

---

## 27. Deferred Items

1. Full canonical Second Brain contradiction sweep after `Pos-system-Knowledge` repo is available locally.  
2. Fresh canonical permission census and family-by-family closure report.  
3. Full PostgreSQL integration rerun in a stable DB/shared-memory environment.  
4. Full Flutter analyze/test closure in a stable local Flutter runtime.  

---

## 28. Exact Implementation Plan

### PHASE 1 — P0 Security / Permission Closure

Files:

- `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/TenantFoundation/Repositories/TenantAdminContextRepository.cs`
- canonical effective-permission resolver service/repository path

APIs:

- `GET /api/v1/tenant-admin/context`

Tables:

- `tenant_user_roles`
- `tenant_user_permissions`
- `tenant_role_permissions`
- `outlet_user_roles`
- `outlet_user_permissions`
- `permission_definitions`

Tests:

- focused AccessControl PostgreSQL integration
- revoked-grant exclusion tests
- tenant isolation tests

Acceptance:

- all context permission resolution paths exclude revoked grants
- canonical resolver reused
- tenant context reflects current active grants only

### PHASE 2 — Backend Contract Closure

Files:

- role service / repository / controller stack

APIs:

- optional `GET /roles/setup-options`
- optional atomic `PUT /roles/{id}/setup`

Tables:

- `tenant_roles`
- `tenant_role_permissions`
- `tenant_user_roles`
- `outlet_user_roles`
- template tables

Tests:

- atomic save / concurrency / last-admin / delegation tests

Acceptance:

- canonical 2-role setup contract is backend-supported cleanly

### PHASE 3 — Flutter 5-Step Flow

Files:

- step1–step5 screens
- wizard provider
- edit role providers
- repository contracts

APIs:

- consume canonical setup options / atomic save if introduced

Tests:

- widget tests for each step
- state persistence tests
- validation gating tests

Acceptance:

- no hardcoded `Super Admin`
- review shows resolved data
- validation and concurrency handling are explicit

### PHASE 4 — FE-BE Integration

Files:

- datasource / repository / providers

APIs:

- role create/update/permissions/assignments or atomic setup endpoint

Tests:

- integration-style repository tests

Acceptance:

- response shapes match exactly
- refresh/invalidation behavior is correct after save

### PHASE 5 — Automated Tests

Files:

- backend unit/api/integration tests
- Flutter widget/repository tests

Acceptance:

- 5-step role access flow covered in both FE and BE where applicable

### PHASE 6 — Runtime E2E

Acceptance:

- tenant admin role setup
- cashier role setup
- self-role edits
- sidebar/menu permission refresh
- online store entitlement locked-state validation

### PHASE 7 — Second Brain Final Status Update

Acceptance:

- canonical docs updated after verified implementation
- stale contradictory active docs removed or marked superseded

---

## 29. Final Verdict

The current implementation is **not ready to be marked fully closed** against the canonical `TENANT_ADMIN` + `CASHIER` 5-step Role Access contract.

### Final Status Summary

| Area | Verdict |
| --- | --- |
| Backend | PASS WITH GAPS |
| Database | PASS WITH GAPS |
| Permission Seeds | PASS WITH GAPS |
| Flutter | FAIL |
| Security | FAIL |
| Tests | PASS WITH GAPS |

### Concise Verdict

The backend foundation is strong enough to continue from, but the implementation is still blocked by one real security gap in tenant-admin context permission resolution and several frontend contract gaps in the 5-step wizard.

---

## 30. Required 5-Step Implementation Matrix

| Step | Requirement | Second Brain | Backend | DB | Flutter | Tests | Status | Severity |
| ---- | ----------- | ------------ | ------- | -- | ------- | ----- | ------ | -------- |
| 1 | Only `TENANT_ADMIN` and `CASHIER` in setup | PARTIAL | PARTIAL | PARTIAL | MISSING | MISSING | PARTIAL | P1 |
| 1 | Setup role selection is backend-driven | PARTIAL | PARTIAL | N/A | MISSING | MISSING | PARTIAL | P1 |
| 2 | Module catalog is backend-driven | PASS | PASS | PASS | PASS | PARTIAL | PASS | P2 |
| 2 | Online Store entitlement-aware | PARTIAL | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P1 |
| 3 | Permission mutation exists | PASS | PASS | PASS | PASS | PASS | PASS | P2 |
| 3 | Dynamic selected/available counts | PARTIAL | N/A | N/A | PARTIAL | MISSING | PARTIAL | P2 |
| 3 | Template ceiling enforced | PARTIAL | PARTIAL | PASS | N/A | PARTIAL | PARTIAL | P2 |
| 4 | Per-user scope model exists | PASS | PASS | PASS | PASS | PARTIAL | PASS WITH GAPS | P1 |
| 4 | Setup-specific user/outlet options | PARTIAL | PARTIAL | N/A | MISSING | MISSING | PARTIAL | P1 |
| 4 | Validation blocks invalid continue | PASS | N/A | N/A | MISSING | MISSING | MISSING | P1 |
| 5 | Review sections exist | PASS | N/A | N/A | PASS | MISSING | PASS | P2 |
| 5 | Review shows resolved names/data | PASS | PARTIAL | N/A | MISSING | MISSING | MISSING | P1 |
| 5 | Final save is atomic | PASS | PARTIAL | PASS | PARTIAL | MISSING | PARTIAL | P1 |

---

## 31. Audit Notes

- This file is the only artifact created during this task.
- No backend or Flutter product logic was changed in this audit.
- The strongest next move is **PHASE 1 — P0 Security / Permission Closure**.

