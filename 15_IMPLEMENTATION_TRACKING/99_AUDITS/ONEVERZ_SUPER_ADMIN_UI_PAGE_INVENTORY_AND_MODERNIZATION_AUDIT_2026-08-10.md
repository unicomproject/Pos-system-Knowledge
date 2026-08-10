# OneVerz Super Admin — Complete UI Page Inventory & Modernization Audit

```text
Audit date: 2026-08-10
Timezone: Asia/Colombo
Application: nytroz-pos-platform-admin (Platform / Super Admin)
Audited commit: 9349cee75d3dddee7aebabf9a414959022339183
origin/main tip: Merge pull request #39 from unicomproject/merge/flow4-phase5-pa-to-main
Audit type: READ-ONLY (no Angular source changes)
Audit branch: audit/super-admin-ui-modernization-inventory-2026-08-10
```

## Final Verdict

```text
SUPER ADMIN UI MODERNIZATION BLOCKED — DESIGN SYSTEM FOUNDATION REQUIRED FIRST
```

Routes and business pages are inventory-complete and largely functional. Visual modernization must **not** start as per-page CSS rewrites. Three competing button dialects, unused shared primitives (`PageHeader`, `app-button`, `Footer`), zero design tokens, and per-page style islands (hundreds–1500+ lines) mean page-level redesign without a shared foundation will create a second generation of inconsistency.

---

## 1. Executive Summary

Platform Admin at `9349cee` is a **standalone Angular 21** operations console with **no Bootstrap / Material**. UI is mostly **inline templates + inline styles** per page.

| Metric | Count |
| --- | ---: |
| Total route path entries | **39** |
| Redirects (of those) | **5** |
| `loadComponent` screen routes | **28** |
| Distinct routed user-facing screens | **27** |
| Active business pages | **20** |
| Auth/system pages | **4** |
| Placeholder (legacy tenant leftovers) | **3** |
| Dead / unrouted page components | **1** |
| Sidebar nav items | **10** (all resolve) |

**Overall scores (console-wide):** Visual quality **5.5/10** · UX **6/10** · Modern SaaS readiness **4.5/10**

**Brand inconsistency (evidence):** sidebar/login use **SCS-TIX**; recipient portal uses **Nytroz**; settings/tests reference **OneVerz**; header specs expect “OneVerz Platform Admin”.

**Recommended first slice:** Global shell cleanup + design tokens + shared `PageHeader` / buttons / form fields / table / status badge primitives — then Dashboard + Tenant list/detail + Create Tenant wizard.

---

## 2. Repository Baseline

| Item | Value |
| --- | --- |
| Primary workspace (dirty/behind) | `nytroz-pos-platform-admin` @ `9e13169` feature branch |
| Audit worktree | `worktrees/phase5-final-pa-validation` |
| HEAD = origin/main | `9349cee` |
| Remote | `unicomproject/Nytroz-POS-Platform_Admin` |
| Stack | Angular 21, RxJS; no UI kit dependency |

Commands run: `git fetch origin`, `rev-parse`, `log -1`, `status`, `branch -vv`, `worktree list`.

---

## 3. Route Inventory

### Routing files

- `src/app/app.routes.ts`
- `src/app/features/admin/routes/admin.routes.ts`
- `src/app/features/products/routes/products.routes.ts`
- `src/app/features/categories/routes/categories.routes.ts`
- `src/app/features/reports/routes/reports.routes.ts`

### Guards

| Guard | Role |
| --- | --- |
| `authGuard` | Session required |
| `guestGuard` | Login only when unauthenticated |
| `permissionGuard` | Permission / alternate permissions |
| `featureEntitlementGuard` | Feature entitlement (tenant leftovers) |
| `tenantContextGuard` | Valid `tenantId` UUID |

### Route map (user screens)

| Route | Page/Component | Module | Guard | Active? |
| --- | --- | --- | --- | --- |
| `/login` | `LoginPage` | Auth | guest | YES |
| `/payment/:accessToken` | `ManualPaymentRecipientPage` | Billing public | none | YES |
| `/admin/dashboard` | `PlatformDashboardPage` | Dashboard | auth+perm | YES |
| `/admin/tenants` | `PlatformTenantListPage` | Tenants | auth+perm | YES |
| `/admin/tenants/create` | `PlatformCreateTenantPage` | Tenants | auth+perm | YES |
| `/admin/tenants/onboarding/drafts` | `PlatformTenantOnboardingDraftsPage` | Tenants | auth+perm | YES |
| `/admin/tenants/onboarding/operations/:operationId` | `PlatformTenantOnboardingResultPage` | Tenants | auth+perm | YES |
| `/admin/tenants/onboarding/:draftId` | `PlatformCreateTenantPage` | Tenants | auth+perm | YES (resume) |
| `/admin/tenants/:tenantId` | `PlatformTenantDetailPage` | Tenants | auth+perm | YES |
| `/admin/subscriptions` | `PlatformSubscriptionPlansPage` | Subscriptions | auth+perm | YES |
| `/admin/subscriptions/create` | `PlatformCreateSubscriptionPlanPage` | Subscriptions | auth+perm | YES |
| `/admin/subscriptions/:planId` | `PlatformSubscriptionPlanDetailPage` | Subscriptions | auth+perm | YES |
| `/admin/modules` | `PlatformModulesCatalogPage` | Catalog | auth+perm | YES |
| `/admin/return-policy-templates` | `PlatformReturnPolicyTemplatesPage` | Return policies | auth+perm | YES |
| `/admin/return-policy-templates/create` | `PlatformCreateReturnPolicyTemplatePage` | Return policies | auth+perm | YES |
| `/admin/return-policy-templates/:templateId` | `PlatformReturnPolicyTemplateDetailPage` | Return policies | auth+perm | YES |
| `/admin/roles-permissions` | `PlatformPermissionCatalogPage` | Access | auth+perm | YES |
| `/admin/platform-users` | `PlatformUsersPage` | Users | auth+perm | YES |
| `/admin/billing` | `PlatformBillingPage` | Billing | auth+perm | YES |
| `/admin/billing/manual-payments` | `PlatformManualPaymentsPage` | Billing | auth+perm | YES |
| `/admin/billing/manual-payments/:paymentId` | `PlatformManualPaymentDetailPage` | Billing | auth+perm | YES |
| `/admin/settings/system` | `PlatformSystemSettingsPage` | Settings | auth+perm | YES |
| `/admin/audit-logs` | `PlatformAuditLogsPage` | Audit | auth+perm | YES |
| `/admin/permission-denied` | `PermissionDenied` | System | auth | YES |
| `/admin/feature-not-enabled` | `FeatureNotEnabled` | System | auth | YES |
| `/admin/tenant/:tenantId/products` | `ProductListPage` | Legacy leftover | tenant+perm+feature | PLACEHOLDER |
| `/admin/tenant/:tenantId/categories` | `CategoryListPage` | Legacy leftover | tenant+perm+feature | PLACEHOLDER |
| `/admin/tenant/:tenantId/reports` | `ReportListPage` | Legacy leftover | tenant+perm+feature | PLACEHOLDER |

### Redirects (not counted as pages)

| From | To |
| --- | --- |
| `/` | `/admin/dashboard` |
| `/admin` | `dashboard` |
| `/admin/settings` | `settings/system` |
| `/admin/**` unknown | `dashboard` |
| `/**` unknown | `/admin/dashboard` |

---

## 4. Exact Page Count

```text
Total route entries:                 39
Actual user-facing pages:            27
Active business pages:               20
Auth/system pages:                    4
Placeholder pages:                    3
Legacy/duplicate pages:               3 legacy placeholders; 0 duplicate page files
Dead/unrouted pages:                  1 (AdminSectionPage)
```

```text
Total active Super Admin user-facing pages: 27
```

(Includes 20 business + 2 auth + 2 utility + 3 placeholders. Excludes redirects and dead `AdminSectionPage`.)

### Numbered inventory (every user-facing page)

```text
01 Dashboard                         /admin/dashboard
02 Tenant List                       /admin/tenants
03 Create Tenant Wizard              /admin/tenants/create (+ onboarding/:draftId)
04 Onboarding Drafts                 /admin/tenants/onboarding/drafts
05 Onboarding Result                 /admin/tenants/onboarding/operations/:operationId
06 Tenant Details                    /admin/tenants/:tenantId
07 Subscription Plans                /admin/subscriptions
08 Create Subscription Plan          /admin/subscriptions/create
09 Subscription Plan Detail          /admin/subscriptions/:planId
10 Modules & Features Catalog        /admin/modules
11 Return Policy Templates           /admin/return-policy-templates
12 Create Return Policy Template     /admin/return-policy-templates/create
13 Return Policy Template Detail     /admin/return-policy-templates/:templateId
14 Roles & Permissions               /admin/roles-permissions
15 Platform Users                    /admin/platform-users
16 Billing                           /admin/billing
17 Manual Payments                   /admin/billing/manual-payments
18 Manual Payment Detail             /admin/billing/manual-payments/:paymentId
19 System Settings                   /admin/settings/system
20 Platform Login Audit              /admin/audit-logs
21 Login                             /login
22 Manual Payment Recipient (public) /payment/:accessToken
23 Permission Denied                 /admin/permission-denied
24 Feature Not Enabled               /admin/feature-not-enabled
25 Tenant Products (placeholder)     /admin/tenant/:tenantId/products
26 Tenant Categories (placeholder)   /admin/tenant/:tenantId/categories
27 Tenant Reports (placeholder)      /admin/tenant/:tenantId/reports
```

---

## 5. Navigation Inventory

Config: `src/app/core/config/menu.config.ts` · Rendered: `layout/sidebar/sidebar.ts`

| Navigation Item | Route | Page Exists | Correct? | UI Issue |
| --- | --- | ---: | ---: | --- |
| Dashboard | `/admin/dashboard` | Y | Y | — |
| Tenants | `/admin/tenants` | Y | Y | `hasSubmenu: true` shows chevron but **no nested children** |
| Subscriptions | `/admin/subscriptions` | Y | Y | Same false submenu |
| Modules & Features | `/admin/modules` | Y | Y | Icon key `'roles'` reused (misleading) |
| Return Policy Templates | `/admin/return-policy-templates` | Y | Y | Icon key `'products'` reused |
| Users | `/admin/platform-users` | Y | Y | False submenu chevron |
| Roles & Permissions | `/admin/roles-permissions` | Y | Y | — |
| Billing | `/admin/billing` | Y | Y | False submenu; manual payments not nested |
| Platform Login Audit | `/admin/audit-logs` | Y | Y | Label accurate (login-scope); may surprise users expecting full audit |
| System Settings | `/admin/settings/system` | Y | Y | False submenu |

**Nav items with no page:** 0  
**Hidden active pages (no sidebar):** create/detail/onboarding/manual-payment flows, auth, utilities, tenant leftovers — expected for child routes.  
**Misleading:** submenu chevrons without children; icon reuse; brand **SCS-TIX** in sidebar vs OneVerz product naming.

---

## 6. Global Shell Audit

| Element | Current | Assessment |
| --- | --- | --- |
| Sidebar | 16.5rem navy gradient; brand mark; flat nav; user card; Sign out; hardcoded “Version 2.4.0” | **DATED / PARTIAL** |
| Logo | “SCS-TIX” strong | Brand mismatch |
| Header | min-height 4.25rem; search (tenant list only); decorative date-range / notification / help / settings; avatar | **DATED** — dead chrome |
| Content canvas | `#f7f9fc`, padding `1.5rem 1.6rem 2rem` | Acceptable base |
| Breadcrumb | Per-page hand-rolled, not shell-level | Inconsistent |
| Profile | Duplicated in sidebar + header | Noise |
| Footer | `app-footer` exists | **DEAD / UNROUTED** in shell |
| Responsive | ≤820px sidebar stacks full width | No drawer pattern |

**Shell score:** Visual 7 · Usability 5 · Consistency 5 · Modern SaaS 6 · Priority **P1**

**Modern direction:** Slim restrained nav; single user menu in header; remove non-functional header controls; contextual search only; tokenized widths; OneVerz brand; collapse false submenu affordances.

```text
Global Shell: DATED / PARTIAL
Navigation: NEEDS MODERNIZATION
```

---

## 7. Design-System Audit

| Area | Reality |
| --- | --- |
| Global CSS | `styles.scss` = reset + Inter + body color only |
| Design tokens | **None** |
| UI kit | **None** (no Bootstrap/Material) |
| Button systems | **3 dialects:** `.btn.*` (most lists), `.button.*` (billing/onboarding), `.primary-button` (roles/settings) |
| Shared `app-button` | Exists with teal `#145c72` — **unused** |
| `PageHeader` | Used only by placeholders + dead `AdminSectionPage` |
| Status badges | Multiple local systems (tenant / plan / user / roles chips / manual payment tones) |
| Forms / tables | Copied per page |
| Shadows / radius | Per-page (`10–14px`, heavy `0 7px 22px` cards) |
| Accent | Blue `#0b5cff` dominant; plan detail drifts `#155eef`; purple in header avatar gradient |

```text
Design System: MISSING / INCONSISTENT
```

### Recommended future tokens (not implemented)

```text
spacing: 4 / 8 / 12 / 16 / 24 / 32
radius: sm 6 / md 10 / lg 14
surfaces: canvas / panel / elevated
text: primary / secondary / muted / inverse
semantic: success / info / warning / danger / neutral
brand: OneVerz orange used sparingly for primary CTA only
control heights: input 40 / button 40 / table row compact
```

---

## 8. Dashboard

| Field | Value |
| --- | --- |
| Route | `/admin/dashboard` |
| Purpose | Platform KPIs, attention queue, recent tenants |
| Data | `PlatformDashboardApiService` (real API) |
| Layout | Heading; KPI grid; overview+attention; recent tenants + DIY SVG donut; optional snapshots |
| Scores | V6 U7 C5 M5 · **P1** |

**Problems:** Letter/glyph icons (`TT`, `!`); prototype SVG charts; dense multi-panel first paint; loading text not skeletons; refresh button off shared system.

**Before:** Busy multi-card dashboard with placeholder iconography.  
**After:** Page heading + ≤4 compact KPIs + operational attention list + recent tenants table; shared skeletons; no invented metrics.

---

## 9. Tenant Pages

### Tenant List — `/admin/tenants` · P2

KPI strip + filter card + bordered table + pagination. Disabled Import / More Filters still visible. Dual search (header + page). Row click + View link redundancy. Scores V7 U7 C6 M6.

### Tenant Detail — `/admin/tenants/:tenantId` · P1

Tabs Details/Audit; checklist; summary cards; profile/subscription/entitlements; slide-over editor. Button soup (`primary|secondary|ghost|success|danger`); inline `style=""`; free-text enums. Scores V6 U7 C5 M5.

**After:** Sticky header with status badge + one primary lifecycle CTA; structured sections; selects; shared drawer; no inline styles.

### Functionality to preserve

| Page | API | Actions | Must preserve |
| --- | --- | --- | --- |
| Tenant List | `PlatformTenantApiService` | Create, View, search/filter/page | All filters + create CTA |
| Tenant Detail | same | Edit, Activate/Suspend/Reactivate, entitlements save, audit paging | All lifecycle + entitlement edits |

---

## 10. Tenant Create Wizard

| Field | Value |
| --- | --- |
| Routes | `/admin/tenants/create`, `/admin/tenants/onboarding/:draftId` |
| Data | create options, drafts, create APIs |
| Layout | 7-step stepper; large card; sticky Back / Save Draft / Next |
| Scores | V5 U4 C4 M4 · **P1** |

**Evidence:** Step **labels** are correct (`Business & Contact Information`, `Subscription Plan`), but internal keys remain legacy misnames (`plan-selection`, `limits-addons`) — maintainability / future-doc trap. Dense grids; nested plan cards; review thin vs step count; host bg fights shell.

**Before:** Dense multi-step form island with legacy key names.  
**After:** Same business steps; clearer grouping; progressive disclosure; shared field components; rename keys without changing flow order; stronger review step.

### Onboarding Drafts — P1 (worst visual)

Raw table, unstyled buttons, raw `<progress>`, no discard confirm. Scores **V2 U4 C2 M2**.

### Onboarding Result — P2

Lifecycle stepper + cards + resend/activate. Uses `.button` dialect. Scores V7 U7 C6 M6.

---

## 11. Subscription Pages

| Page | Priority | Notes |
| --- | --- | --- |
| Plans list | P2 | Status tabs **and** Status select (double filter); wide table; good skeleton rare elsewhere |
| Create plan | P2 | ~1100 style lines; wizard + preview sidebar; diverges from tenant wizard visuals |
| Plan detail | P2 | Action overload; primary blue `#155eef` drift |

**Layout recommendation:** Keep **table** for operator console (not marketing pricing cards). Use detail page / drawer for modules & limits.

---

## 12. Billing Pages

| Page | Priority | Notes |
| --- | --- | --- |
| Billing | P2 | Filters + summary cards + invoice table + detail drawer; better componentization; still local tokens |
| Manual payments list | P2 | Dense HTML; `.button` dialect |
| Manual payment detail | P2 | Highest polish in billing; fixed review bar may collide with shell |
| Recipient (public) | P2 | Outside shell; **Nytroz** brand; upload/submit flow |

Focus modernization on status scanability and dialect unification — not decorative charts.

---

## 13. Platform User Pages

Single page `/admin/platform-users` with create/edit slide-over. Client-side search; split Save Status / Save Roles. Scores V7 U7 C7 M6 · **P2**.

---

## 14. Audit Log Pages

`/admin/audit-logs` — login-scope notice + filters + table. No row detail drawer. Clone-of-list chrome. Scores V6 U7 C7 M5 · **P3**.

Modern direction: compact filters, dense readable table, optional side drawer for payload — without inventing new event types.

---

## 15. Settings Pages

Only `/admin/settings/system`. Form + redundant summary aside; `.primary-button` dialect; sticky save. Scores V6 U7 C6 M5 · **P3**.

Future settings nav only if more sections appear; today one page is enough.

---

## 16. Auth/System Pages

| Page | Priority | Notes |
| --- | --- | --- |
| Login | P2 | Split brand/auth; polished but **SCS-TIX**, stub Privacy/Terms, Forgot disabled, footer year 2025 |
| Permission Denied | P1 | Bare box, no CTA |
| Feature Not Enabled | P1 | Twin of permission denied |
| Recipient | P2 | Covered under billing |

---

## 17. Table Audit

Major tables: Tenants, Subscriptions, Users, Return policies, Audit logs, Manual payments, Billing invoices, Modules feature tables, Onboarding drafts, Roles list.

**Shared problems:** box-in-box (filter card + table card); heavy borders; inconsistent density; mixed row-action styles; pagination cloned; drafts table unfinished.

**ONE future table language:** flat surface, light header, compact rows, hover, badge statuses, overflow menu for secondary actions, shared pagination, shared empty/loading/error slots.

---

## 18. Form Audit

Recurring: full-width grids, local label styles, mixed required marking, wizard sticky bars vs settings sticky bars vs roles sticky bar — three implementations.

**Shared field system needed:** label, input, select, textarea, toggle, checkbox, helper, error, section heading, form actions.

---

## 19. Status/Action Audit

| Domain | Pattern |
| --- | --- |
| Tenant lifecycle | `.status-badge.*` green/orange/slate/amber/blue/red |
| Plans | published/draft/archived |
| Users | active/inactive/locked/deleted |
| Roles | separate chips + scope badges |
| Manual payments | `ManualPaymentStatusBadge` tones |

**Button hierarchy recommendation:** Primary · Secondary · Tertiary/Ghost · Destructive · Icon Action — one implementation only.

---

## 20. Responsive Audit

| Breakpoint | Current | Strategy |
| --- | --- | --- |
| 1440+ | Primary | Keep desktop-first |
| 1280 | Works with horizontal scroll risk on wide tables | Constrain table columns / overflow menu |
| 1024 | Usable | Collapse secondary columns |
| 768 / ≤820 | Sidebar becomes full-width stack | Prefer collapsible drawer later; do **not** force consumer mobile UX |

Super Admin remains **desktop-first operations console**.

---

## 21. Accessibility Audit

Recurring gaps:

- Decorative/non-functional header buttons without disabled semantics
- Icon-only actions dense (some have titles — keep and standardize)
- Focus styles not tokenized / inconsistent
- Duplicate landmark identity (sidebar + header user)
- Permission/feature dead-ends lack recovery CTA
- Some engineer-facing copy on onboarding result
- Table semantics vary by page

Baseline targets: keyboard nav, visible focus, contrast, labeled controls, table headers, icon tooltips, clear disabled states.

---

## 22. Legacy UI Patterns

| Pattern | Where | Why dated | Modern replacement |
| --- | --- | --- | --- |
| Box-in-box cards | Most list pages | Heavy chrome | Flat page + one data surface |
| Blue title accent bar | Many headings | Template-y | Typography hierarchy only |
| Decorative header chrome | Header | Fake SaaS | Remove or wire |
| Letter icons | Dashboard | Prototype | Real icon set |
| Three button dialects | Cross-app | Inconsistent | One button primitive |
| False submenu chevrons | Sidebar | Misleading | Flat links or real children |
| Per-page CSS islands | Almost all | Unmaintainable | Tokens + shared components |
| Unused PageHeader / app-button / Footer | Shared | Dead code | Adopt or quarantine |
| Brand name drift | Shell/login/recipient | Unprofessional | OneVerz everywhere |
| Tenant leftover routes | products/categories/reports | Legacy TM-EPOS | Hide/quarantine later |

---

## 23. Page-by-Page Modernization Matrix

| # | Page | Route | Current UI Problem | Recommended Change | Priority |
| -: | --- | --- | --- | --- | --- |
| 1 | Dashboard | `/admin/dashboard` | Dense panels, letter icons, DIY charts | KPI strip + attention + recent tenants; skeletons | P1 |
| 2 | Tenant List | `/admin/tenants` | Box-in-box, disabled CTAs, dual search | Flat filters + clean table + badges + one CTA | P2 |
| 3 | Create Tenant | `/admin/tenants/create` | Dense wizard; legacy step keys | Shared form system; rename keys; clearer review | P1 |
| 4 | Onboarding Drafts | `.../drafts` | Unfinished raw UI | Match list pattern; confirm discard; badges | P1 |
| 5 | Onboarding Result | `.../operations/:id` | `.button` dialect; dense dl | Align to tokens; operator-friendly copy | P2 |
| 6 | Tenant Detail | `/admin/tenants/:id` | Button soup; inline styles | Sticky header; sectioned layout; shared drawer | P1 |
| 7 | Subscription Plans | `/admin/subscriptions` | Double status filter; wide table | Single filter control; overflow actions | P2 |
| 8 | Create Plan | `.../create` | Huge style island; noisy field icons | Shared wizard kit aligned to tenant wizard | P2 |
| 9 | Plan Detail | `.../:planId` | Action overload; blue drift | Primary/secondary action hierarchy | P2 |
| 10 | Modules Catalog | `/admin/modules` | Static nested tables | Compact accordion + search only | P3 |
| 11 | Return Policy List | `/admin/return-policy-templates` | Clone list chrome | Shared table language | P3 |
| 12 | Return Policy Create | `.../create` | Thin inconsistent form | Shared form sections | P3 |
| 13 | Return Policy Detail | `.../:id` | Basic dl/edit | Shared detail pattern | P3 |
| 14 | Roles & Permissions | `/admin/roles-permissions` | Unique dialect; extreme density | Align buttons; collapse tree; PageHeader | P1 |
| 15 | Platform Users | `/admin/platform-users` | Dual save; client search only | Unified save; shared drawer | P2 |
| 16 | Billing | `/admin/billing` | Token drift; unclassed refresh | Shared filters/table/drawer | P2 |
| 17 | Manual Payments | `.../manual-payments` | Dense markup; button dialect | Shared table + filters | P2 |
| 18 | Manual Payment Detail | `.../:paymentId` | Card scroll fatigue; fixed bar | Streamlined hero + review dock | P2 |
| 19 | System Settings | `/admin/settings/system` | Redundant summary; button dialect | Single form column + sticky save | P3 |
| 20 | Audit Logs | `/admin/audit-logs` | No detail; clone chrome | Dense table + optional drawer | P3 |
| 21 | Login | `/login` | Brand/stubs/year | OneVerz brand; remove stubs or wire | P2 |
| 22 | Payment Recipient | `/payment/:token` | Brand drift | Align brand + tokens | P2 |
| 23 | Permission Denied | `/admin/permission-denied` | Dead end | Illustrated error + Dashboard CTA | P1 |
| 24 | Feature Not Enabled | `/admin/feature-not-enabled` | Twin dead end | Same shared error pattern | P1 |
| 25–27 | Product/Category/Report placeholders | `/admin/tenant/:id/...` | Legacy empty states | Quarantine / hide from IA | P3 |

---

## 24. P1 / P2 / P3 Priorities

### P1 — Modernize first (after foundation)

1. Design-system foundation (prerequisite — see phases)  
2. Shell (sidebar/header)  
3. Onboarding Drafts  
4. Create Tenant Wizard  
5. Tenant Detail  
6. Dashboard  
7. Roles & Permissions  
8. Permission Denied / Feature Not Enabled  

### P2 — Next

Tenant List · Login · Subscriptions suite · Users · Billing · Manual payments list/detail · Onboarding Result · Recipient  

### P3 — Polish

Modules · Return policies · Settings · Audit · Tenant leftover placeholders  

---

## 25. Shared Components to Reuse/Create Later

| Component | Status |
| --- | --- |
| `PageHeader` | Exists — **adopt on all real pages** |
| `EmptyState` | Exists — align tokens |
| `app-button` | Exists unused — replace dialects or rewrite to OneVerz tokens |
| `ManualPaymentStatusBadge` | Exists — generalize to `StatusBadge` |
| `Footer` | Dead — do not wire unless needed |
| DataTable / FilterBar / MetricCard / LoadingSkeleton / FormSection / ConfirmationDialog / DetailsDrawer / Pagination | **Create later** from extracted patterns |

---

## 26. Legacy Cleanup Candidates

| Item | Classification |
| --- | --- |
| `AdminSectionPage` | **SAFE CLEANUP CANDIDATE** (unrouted) |
| `Footer` unused | **SAFE CLEANUP CANDIDATE** (confirm no dynamic load) |
| Tenant products/categories/reports routes | **NEEDS ROUTE TRACE** / **DO NOT REMOVE YET** (guards wired; may be intentional leftovers) |
| False `hasSubmenu` flags | **SAFE CLEANUP CANDIDATE** (config-only) |
| Unused `app-button` teal theme | **DO NOT REMOVE YET** — migrate then delete |
| Disabled Import / More Filters on tenant list | **SAFE CLEANUP CANDIDATE** (hide until real) |
| Decorative header controls | **SAFE CLEANUP CANDIDATE** (remove or implement) |

---

## 27. Recommended Modernization Phases

```text
Phase UI-1  Design tokens + button/input/badge/table/page-header primitives + shell cleanup
Phase UI-2  Dashboard + Tenant List + Tenant Detail
Phase UI-3  Create Tenant Wizard + Onboarding Drafts + Onboarding Result
Phase UI-4  Subscription Plans suite
Phase UI-5  Billing + Manual Payments (+ recipient brand align)
Phase UI-6  Platform Users + Roles & Permissions
Phase UI-7  Settings + Audit + Auth polish + error utilities + leftover quarantine
```

Order rationale: foundation prevents rework; tenants/dashboard are highest operator visibility; wizard is Flow 4 critical path; billing/subscriptions secondary ops; roles densest outlier; settings/audit lowest frequency.

---

## 28. Recommended First UI Implementation Slice

```text
Global shell cleanup + design tokens + PageHeader adoption + shared Button / FormField / StatusBadge / DataTable primitives
```

**Why this one slice:** Without it, every page PR will invent another local skin. Shell fixes brand/nav/header noise immediately. Primitives unlock Phases UI-2+ without API/business changes.

**Explicitly out of scope for first slice:** Rewriting wizard business steps, billing APIs, permission tree logic, removing tenant leftover routes.

---

## 29. Final Verdict

```text
SUPER ADMIN UI MODERNIZATION BLOCKED — DESIGN SYSTEM FOUNDATION REQUIRED FIRST
```

- Route architecture is **not** the primary blocker (inventory is clean enough for controlled work).  
- Design-system absence **is** the blocker for quality modernization.  
- After UI-1 foundation lands, the app becomes ready for controlled page modernization starting with Dashboard + Tenants.

### What must not change during UI work

- Permission / feature / tenant guards  
- Flow 4 onboarding draft → finalize → invitation/payment APIs  
- Tenant lifecycle actions  
- Billing manual payment review/approve/reject/activate  
- Subscription plan publish/archive semantics  
- Role permission save contracts  
- Public recipient payment token flow  

---

## Appendix — Scores rollup

| Surface | V | U | C | M | Pri |
| --- | ---: | ---: | ---: | ---: | --- |
| Shell | 7 | 5 | 5 | 6 | P1 |
| Login | 8 | 7 | 6 | 7 | P2 |
| Dashboard | 6 | 7 | 5 | 5 | P1 |
| Tenant List | 7 | 7 | 6 | 6 | P2 |
| Tenant Detail | 6 | 7 | 5 | 5 | P1 |
| Create Tenant | 5 | 4 | 4 | 4 | P1 |
| Onboarding Drafts | 2 | 4 | 2 | 2 | P1 |
| Onboarding Result | 7 | 7 | 6 | 6 | P2 |
| Subscriptions suite | 7 | 6–7 | 5–6 | 6–7 | P2 |
| Modules | 6 | 7 | 7 | 5 | P3 |
| Return policies | 5–6 | 6–7 | 6–7 | 4–5 | P3 |
| Roles | 6 | 6 | 4 | 5 | P1 |
| Users | 7 | 7 | 7 | 6 | P2 |
| Billing suite | 7 | 7 | 5–6 | 6–7 | P2 |
| Settings | 6 | 7 | 6 | 5 | P3 |
| Audit | 6 | 7 | 7 | 5 | P3 |
| Error utilities | 3 | 3 | 4 | 2 | P1 |
| Placeholders | 4 | 4 | 8 | 3 | P3 |

---

*End of audit. No Angular source modified. No roadmap updated.*
