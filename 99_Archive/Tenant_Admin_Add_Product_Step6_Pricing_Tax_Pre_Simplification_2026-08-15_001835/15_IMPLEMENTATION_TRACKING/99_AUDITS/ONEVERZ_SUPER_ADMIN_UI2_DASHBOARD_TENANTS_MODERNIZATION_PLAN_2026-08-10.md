# OneVerz Super Admin UI-2 — Dashboard, Tenant List, & Tenant Detail Modernization Plan

## 1. Executive Summary
This document defines the technical execution plan for Super Admin UI-2 page-level modernization. Building upon the verified UI-1 Design System Foundation, we map the step-by-step layout upgrades, shared primitive adoptions, and responsive/accessibility plans for the Dashboard, Tenant List, and Tenant Detail pages. All business operations, lifecycle guards, and APIs will be strictly preserved, while legacy ad-hoc styles are replaced by system tokens.

---

## 2. Repository Baseline
- **Platform Admin Repository**: `C:\Users\User\Desktop\Nytroz__POS\nytroz-pos-platform-admin`
- **Platform Admin SHA**: `f7d1cb81e9c1c0a7c8f94e942c782046a8f253bf`
- **Second Brain Repository**: `C:\Users\User\Desktop\Nytroz__POS\Nytroz POS - Second Brain\Pos-system-Knowledge`
- **Second Brain Audit Branch**: `audit/super-admin-ui2-dashboard-tenants-planning-2026-08-10`

---

## 3. UI-1 Foundation Available
All core primitives and styles are verified and ready for page-level consumption:
- **Design Tokens**: Standard spacing, colors, heights, radii, and shadows inside `src/styles.scss`.
- **Button primitive**: `src/app/shared/ui/button/button.ts` (`app-button` with variants and sizes).
- **PageHeader primitive**: `src/app/shared/components/page-header/page-header.ts`.
- **FormField primitive**: `src/app/shared/ui/form-field/form-field.ts`.
- **StatusBadge primitive**: `src/app/shared/ui/status-badge/status-badge.ts`.
- **DataTable styling**: `.data-table-container` and `.data-table` declared in `styles.scss`.
- **FilterBar layout**: `.filter-bar-container` declared in `styles.scss`.
- **Shared States**: `LoadingSkeleton` and `ErrorState` components.

---

## 4. UI-2 Scope
Modernization is restricted to:
1. **Dashboard** (`/admin/dashboard`)
2. **Tenant List** (`/admin/tenants`)
3. **Tenant Detail** (`/admin/tenants/:tenantId`)

All other platform areas (Wizard, Drafts, Billing, Subscriptions, Settings, Users, Logs) are explicitly out of scope.

---

## 5. Dashboard Current Architecture
- **Component**: `PlatformDashboardPage` (`src/app/features/admin/pages/platform-dashboard-page/platform-dashboard-page.ts`)
- **Route**: `/admin/dashboard`
- **Data service**: `PlatformDashboardApiService` (`getDashboard()`)
- **Models**: `PlatformDashboard` inside `src/app/features/admin/models/platform-dashboard.model.ts`
- **Stylesheet size**: 579 lines of inline SCSS.
- **Tests**: `platform-dashboard-page.spec.ts`

---

## 6. Dashboard Data Reality
All metrics rendered on the dashboard are backed by real API response fields:
- **Total Tenants**: Real (`kpis.totalTenants`, `kpis.totalTenantsChangePercent`)
- **Active Subscriptions**: Real (`kpis.activeSubscriptions`, `kpis.activeSubscriptionsChangePercent`)
- **Monthly Recurring Revenue (MRR)**: Real (`revenue.groups`)
- **Items Requiring Attention**: Real (`kpis.itemsRequiringAttention`)
- **System Health Status**: Real (`kpis.systemHealthStatus`, `kpis.systemHealthLabel`)
- **Trends (Tenant growth, subscriptions, MRR)**: Real (`statusOverview.trend` points)
- **Attention List**: Real (`attention` list)
- **Recent Tenants**: Real (`recentTenants` list)
- **Status Snapshot**: Real (`tenantStatusSnapshot`, `subscriptionSnapshot`)
- **Platform Footprint**: Real (`footprint`)

No fake metrics or trends will be introduced.

---

## 7. Dashboard Problems
- **DIY Line Chart**: Utilizes a raw SVG polyline block with manual coordinate math.
- **DIY Donut Chart**: Conic-gradients bound inline using `[style.background]` with custom logic.
- **KPI Gradient Backgrounds**: Custom colors (`blue`, `violet`, `green`, `orange`) with hardcoded backgrounds, borders, and shadows bypassing design variables.
- **Huge SCSS File**: 579 lines of inline styles that duplicate page layout margins and flex properties.

---

## 8. Dashboard Target IA
A clean grid layout designed around the operator workflow:
1. **Page Header**: Standard `PageHeader` component with refresh button projected.
2. **KPI Strip**: Row of 4–5 compact, standardized KPI cards using token values.
3. **Operational Attention Needed**: Highlighted sidebar row listing warnings and counts.
4. **Platform Status Overview**: Clean trend display (line chart simplified or styled strictly via tokens).
5. **Snapshot & Recent Lists**: Converted to clean standard lists/tables using DataTable styling.

---

## 9. Dashboard Before/After
- **BEFORE**: 
  - Raw SVG DIY charts and custom conic gradient donut circles.
  - Large custom SCSS, hardcoded shadow values, and ad-hoc colors.
  - DIY header titles and custom refresh buttons.
- **AFTER**:
  - `PageHeader` handles titles and projects a unified compact `app-button` for refresh actions.
  - KPI cards use semantic tokens (`var(--bg-surface-primary)`, standard borders).
  - Attention list rows use standard hover styling.
  - Donut stats are styled cleanly using CSS color tokens.

---

## 10. Tenant List Current Architecture
- **Component**: `PlatformTenantListPage` (`src/app/features/admin/pages/platform-tenant-list-page/platform-tenant-list-page.ts`)
- **Route**: `/admin/tenants`
- **API**: `PlatformTenantApiService`
- **Filters**: Search, Lifecycle Status, Subscription Plan.
- **Pagination**: Client-side range calculation with page controls.
- **Actions**: Create Tenant, View Details, Continue Setup.
- **Styles**: 422 lines of inline SCSS.
- **Tests**: `platform-tenant-list-page.spec.ts`

---

## 11. Tenant List API/Filters
- **Search**: Integrated via `PlatformTenantSearchService`.
- **Status**: lifecycle status select options.
- **Plan**: subscription plan select options.
- All filters map to the existing backend query model `PlatformTenantListQuery`.

---

## 12. Tenant List Problems
- **Ad-Hoc Table Layout**: Hardcoded borders, hover transitions, and paddings inside the component styles.
- **Custom Status Badges**: Custom class selectors (`.status-badge.active`, etc.) instead of the shared `StatusBadge` primitive.
- **Ad-Hoc Filter Panel**: Custom layouts duplicating margins and padding.

---

## 13. Tenant List Target IA
- **PageHeader**: Standardized header with a primary "Create Tenant" CTA button.
- **Filter Bar**: Shared `.filter-bar-container` layout containing the search input and select dropdowns, with a unified compact "Reset" button.
- **DataTable**: Table wrapped in `.data-table-container`, using `.data-table` rules.
- **Pagination**: Styled clean page navigation buttons at the bottom.

---

## 14. Tenant List Before/After
- **BEFORE**:
  - Custom table styling and custom `.btn` variants.
  - Duplicated status badge classes and local padding variables.
- **AFTER**:
  - Integrates the `.data-table` and `.filter-bar-container` structures.
  - Replaces all table badges with the unified `<app-status-badge>`.
  - Replaces all CTAs with `<app-button>`.

---

## 15. Tenant Detail Current Architecture
- **Component**: `PlatformTenantDetailPage` (`src/app/features/admin/pages/platform-tenant-detail-page/platform-tenant-detail-page.ts`)
- **Route**: `/admin/tenants/:tenantId`
- **Tabs**: Local state tabs for "Details" and "Audit History".
- **Actions**: Edit Profile, Activate, Reactivate, Suspend, Edit Entitlements.
- **Styles**: 390 lines of inline SCSS.
- **Tests**: `platform-tenant-detail-page.spec.ts`

---

## 16. Tenant Detail Tabs/Sections
- **Details tab**: Displays profile details, subscription info, enabled features list, and checklist setup progress card.
- **Audit History tab**: Shows actor actions and occurrence logs in a tabular format.

---

## 17. Tenant Detail Actions/Lifecycle
- **Profile Edit Form**: Name, operating mode, base currency, default locale, default timezone, and billing status edit controls.
- **Lifecycle Buttons**: Activate, reactivate, suspend triggers mapped to tenant status flags.
- **Entitlement Editor**: Side panel drawer enabling/disabling plan features.

---

## 18. Tenant Detail Problems
- **No Confirmation Dialogs**: Suspend/Activate triggers execute state changes immediately on click.
- **Raw Form Inputs**: Profile edit inputs use unstyled elements instead of the unified `FormField` component.
- **Inline Tab Styles**: Tab buttons have local hover transitions and hardcoded backgrounds.

---

## 19. Tenant Detail Target IA
- **Header**: Standard `PageHeader` component with structured breadcrumbs (`Tenants / Detail`).
- **Profile Form**: Input labels wrapped in `<app-form-field>` controls.
- **Action Buttons**: Unified button states with modal suspension confirmation.
- **Audit Table**: Styled using the DataTable design tokens.

---

## 20. Tenant Detail Before/After
- **BEFORE**:
  - Raw HTML input labels and immediate SUSPEND actions without warnings.
  - Custom panel tabs and legacy buttons.
- **AFTER**:
  - Adopts `PageHeader` breadcrumbs and `<app-form-field>` presentation.
  - Suspend action triggers a clean confirmation overlay.
  - Unified `<app-button>` primitives replace legacy buttons.

---

## 21. Shared Component Needs
| Need | Existing UI-1 Primitive | Sufficient? | UI-2 Extension Needed? |
| ---- | ----------------------- | ----------: | ---------------------: |
| Page title & breadcrumbs | PageHeader | Yes | No |
| Text inputs validation | FormField | Yes | No |
| Lifecycle status | StatusBadge | Yes | No |
| Data grids | DataTable styles | Yes | No |
| Confirmation warnings | None | No | Yes (Propose ConfirmationDialog) |
| Side panels | None | No | Yes (Propose DetailsDrawer styling) |

---

## 22. Legacy Dialect Migration
- **Legacy button styling**: Replace `.btn`, `.btn.primary`, `.btn.outline` with `<app-button>`.
- **Legacy status styling**: Replace `.status-badge.active`, `.status-badge.suspended` with `<app-status-badge>`.
- **Legacy table styling**: Replace local table stylesheets with global `.data-table` classes.

---

## 23. F-SA-UI1-V-001 Decision
- **Decision**: `INCLUDE IN UI-2`
- Modernizing `appName` inside `app-settings.ts` and `<title>` in `index.html` represents a safe, non-breaking metadata cleanup that will be fully resolved in UI-2.

---

## 24. Responsive Strategy
- All grids and flex blocks adapt using percentages and flex-wrap.
- At tablet widths (768px/1024px), columns stack vertically.
- Table grids use `overflow-x: auto` on small viewports to prevent layout breakages.

---

## 25. Accessibility Strategy
- Form inputs have associated IDs and aria-describedby links.
- Interactive table rows support keyboard navigation (`tabindex="0"`) and clear focus styles.
- Contrast ratios satisfy WCAG AA levels.

---

## 26. API/Business Preservation
- **State management**: Component signals are preserved exactly.
- **Data queries**: List filters and page number structures are kept.
- **API calls**: Component HTTP flows are untouched.
- **Entitlement rules**: Feature enablement checks are preserved.

---

## 27. Test Strategy
- Ensure all 475 baseline unit tests pass.
- Update page spec files to resolve selector changes (e.g. searching for `app-button` instead of `.btn`).
- Add spec assertions for new validation states.

---

## 28. Findings
- **F-SA-UI2-P-001** (Severity: P1, Page: Dashboard): DIY SVG chart coordinates are calculated manually via string interpolation. Recommended: Keep the logic intact but style the SVG lines strictly using CSS token variables.
- **F-SA-UI2-P-002** (Severity: P2, Page: Tenant Detail): Destructive lifecycle triggers like "Suspend Tenant" execute immediately. Recommended: Add a confirmation dialog check before executing the API request.
- **F-SA-UI2-P-003** (Severity: P2, Page: Tenant List): Table rows use custom `.status-badge` classes instead of the unified shared StatusBadge primitive. Recommended: Replace with `<app-status-badge>`.

---

## 29. Implementation Split
- **Split Strategy**:
  - `UI-2A Dashboard`
  - `UI-2B Tenant List`
  - `UI-2C Tenant Detail`
- Spreading the implementation across three focused PRs minimizes the risk of regression.

---

## 30. Recommended Order
1. **Tenant List (UI-2B)**: Unlocks table and filter bar patterns.
2. **Tenant Detail (UI-2C)**: High operational value for forms and action flows.
3. **Dashboard (UI-2A)**: Least risk of business logic regressions.

---

## 31. UI-2 Definition of Done
- Dashboard consumes standard card tokens.
- Tenant List incorporates DataTable and StatusBadge.
- Tenant Detail uses FormField, PageHeader, and StatusBadge.
- No route, guard, or API modifications.
- Responsive and accessibility baselines pass.
- Full unit test suite compiles and passes.

---

## 32. Recommended First Implementation Slice
`UI-2B Tenant List`

---

## 33. Final Verdict
SUPER ADMIN UI-2 READY FOR CONTROLLED IMPLEMENTATION
