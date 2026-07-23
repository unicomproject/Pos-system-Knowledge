<!-- title: SA-P1-02 Platform Admin Stub Navigation Cleanup -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-20 -->

# SA-P1-02 — Platform Admin Stub Navigation Cleanup

## Final status

**COMPLETE**

## Branches and commits

| Repo | Branch | Base | Task commit |
|---|---|---|---|
| Platform Admin | `fix/platform-admin-stub-navigation-cleanup` | `dfadb0b` | (this task) |
| Unified-Commerce | `fix/platform-admin-stub-navigation-cleanup` | `5f7539e` | **No changes** |
| Pos-system-Knowledge | `docs/platform-admin-stub-navigation-cleanup` | `9d8e3bf` | (this task) |

## Scope classification

| Menu Item | Platform Admin R1 Scope | Route Exists (before) | Real Page | Real API | Current Behaviour (before) | Correct Action |
| --------- | ----------------------- | --------------------- | --------- | -------- | --------------------------- | -------------- |
| Outlets | **Out of scope** — tenant ops (`Platform_Admin_UI_Rules`) | Yes (`/admin/outlets`) | `AdminSectionPage` placeholder | No platform list API | Empty integration stub | **Remove menu + route** |
| Tills & Devices | **Out of scope** — tenant ops | Yes (`/admin/tills-devices`) | Placeholder | No | Stub | **Remove menu + route** |
| Products | **Out of scope** — tenant catalog ops | Yes (`/admin/products`) | Placeholder | No platform products API | Stub (tenant products live under `/admin/tenant/:id/products`) | **Remove menu + route** |
| Alerts Center | **Future / not R1** | Yes (`/admin/alerts`) | Placeholder | No | Stub | **Remove menu + route** |
| Reports | **Future / not R1** platform reports | Yes (`/admin/reports`) | Placeholder | No platform reports API | Stub (tenant reports live under `/admin/tenant/:id/reports` with guards) | **Remove menu + route** |

### Classification summary

| Item | Status |
|------|--------|
| Outlets | `OUT_OF_SCOPE` / `TENANT_ADMIN_ONLY` |
| Tills | `OUT_OF_SCOPE` / `TENANT_ADMIN_ONLY` |
| Products (platform nav) | `OUT_OF_SCOPE` / `TENANT_ADMIN_ONLY` |
| Alerts | `PLACEHOLDER` / `FUTURE_PLATFORM_ADMIN_FEATURE` |
| Reports (platform nav) | `PLACEHOLDER` / `FUTURE_PLATFORM_ADMIN_FEATURE` |

## Routes inspected

**Removed platform stub routes (`admin.routes.ts`):**

- `outlets`, `tills-devices`, `products`, `alerts`, `reports`
- Tenant placeholder routes: `tenant/:tenantId/{outlets,tills,users,roles-permissions,settings}` (all `AdminSectionPage`)

**Retained:**

- All working Platform Admin routes (dashboard, tenants, subscriptions, modules, return-policy-templates, users, roles, billing, audit, settings)
- Tenant-context feature routes in `app.routes.ts`: `tenant/:tenantId/products`, `categories`, `reports` (guarded, real lazy modules)
- `AdminSectionPage` component file (unused but preserved for future integration)

**Added:**

- Admin wildcard `{ path: '**', redirectTo: 'dashboard' }` so direct stub URLs redirect safely

## Items removed or hidden

**Sidebar menu (`menu.config.ts`):** Outlets, Tills & Devices, Products, Alerts Center, Reports

**Routes:** All corresponding platform and tenant placeholder routes listed above

## Items retained

| Item | Why |
|------|-----|
| Dashboard, Tenants, Subscriptions, Modules, Return Policy Templates, Users, Roles, Billing, Platform Login Audit, System Settings | Release 1 working Platform Admin features |
| Return Policy Templates | SA-P1-04 complete; permission-guarded |
| Tenant product/report routes in `app.routes.ts` | Tenant-context modules with real pages; not in platform sidebar |

## Frontend files changed

- `src/app/core/config/menu.config.ts`
- `src/app/core/config/menu.config.spec.ts` (new)
- `src/app/features/admin/routes/admin.routes.ts`
- `src/app/features/admin/routes/admin.routes.spec.ts` (new)
- `src/app/layout/sidebar/sidebar.spec.ts`

## Backend files changed

**None.**

## Tests

| Suite | Result |
|---|---|
| Angular unit tests | **383/383 PASS** (baseline 378) |
| Production build | **PASS** |

New specs: menu config scope, admin routes stub removal, sidebar 10-item Release 1 menu.

## Runtime evidence

Local FE dev server (`http://127.0.0.1:4200`):

| Check | Result |
|---|---|
| Sidebar shows 10 items | Verified via unit test + menu config |
| Stub labels absent | Outlets/Tills/Products/Alerts/Reports not in `platformMenuConfig` |
| Return Policy Templates present | Menu path `/admin/return-policy-templates` |
| Direct `/admin/outlets` etc. | Wildcard redirects to `/admin/dashboard` (SPA route table) |
| Working routes (`/admin/dashboard`, `/admin/return-policy-templates`) | 200 SPA shell |

Mobile: sidebar uses same `platformMenuConfig` filter (`@media max-width: 820px` full-width stack) — no separate stub entries.

## Score impact

| Metric | Before | After |
|---|---:|---:|
| Release 1 Super Admin | 82% | **83%** |
| Full planned Super Admin | 65% | **66%** |

Rationale: demo/navigation UX +1 (no misleading stub links); one open P1 stub-nav gap closed.

## Remaining risks

- `AdminSectionPage` remains in codebase unused until a future feature wires it
- Tenant-context product/report routes are not linked from platform sidebar (by design)
- Browser pixel walkthrough optional; config + unit tests verify menu composition

## Related

- [[Platform_Admin_UI_Rules]]
- [[Super_Admin_Current_Status_Audit]]
- [[SA-P1-04_Return_Policy_Template_UI_Implementation]]
