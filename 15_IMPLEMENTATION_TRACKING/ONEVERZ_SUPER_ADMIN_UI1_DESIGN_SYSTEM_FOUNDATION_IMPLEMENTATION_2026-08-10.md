# OneVerz Super Admin UI-1 — Design System Foundation & Global Shell Modernization

## Before Implementation Audit Baseline

### Design Tokens
- No centralized styling tokens or design vars existed. Colors, border-radii, spacing scale, typography sizes, and shadows were all hardcoded in component decorators and global styles.

### Button Dialects
- **Count**: 3 active styles.
- **Implementations**:
  - Global `.btn` and `.primary` button CSS rules.
  - Generic `.button` inline styles.
  - Legacy `app-button` component (only supported background `#145c72` and disabled state).

### Shared Component Usage
- `PageHeader` component existed but was completely unused on real feature pages.
- No unified status badges, error handling layout cards, loading skeletons, or form wrappers existed in the shared component catalog.

### Shell Issues
- **False Submenus**: Navigation items in the sidebar had chevrons (`›`) indicating a submenu structure, even though all routes were flat pages with no actual child submenus.
- **Duplicate User Identity**: The user initials/name and platform account indicators were rendered both in the bottom of the sidebar and the top header.
- **Decorative Chrome**: Non-functional help, settings, and notifications buttons in the header cluttered the layout with no backing features.
- **Footer**: An unused MVP footer (`TM-EPOS MVP Platform Admin`) existed in the layout directory but was never rendered.
- **Branding Drift**: Brand text references drifted between `SCS-TIX`, `Nytroz`, and `OneVerz`.

---

## Implemented Foundation

### Design Tokens
Declared CSS custom properties in the `:root` pseudo-class inside `src/styles.scss` for:
- **Brand**: `--primary` (`#0b5cff`), `--primary-hover` (`#004de6`), `--primary-active` (`#003cbd`) following the OneVerz electric blue direction.
- **Surfaces**: `--bg-page` (`#f8fafc`), `--bg-surface-primary` (`#ffffff`), `--bg-surface-secondary` (`#f1f5f9`), `--bg-surface-hover` (`#f8fafc`), `--bg-surface-selected` (`#eff6ff`).
- **Text**: `--text-primary` (`#0f172a`), `--text-secondary` (`#475569`), `--text-muted` (`#64748b`), `--text-inverse` (`#ffffff`), `--text-disabled` (`#94a3b8`).
- **Borders**: `--border-default` (`#e2e8f0`), `--border-subtle` (`#f1f5f9`), `--border-strong` (`#cbd5e1`), `--border-focus` (`#0b5cff`).
- **Semantic Status**: Colors and background/text tokens mapping to success, info, warning, danger, and neutral states.
- **Spacing Scale**: `--space-1` (4px) to `--space-7` (48px).
- **Radius**: `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-pill` (9999px).
- **Control Heights**: Default (40px), Compact (32px), Large (48px) heights.
- **Shadows**: Restrained elevation variables (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-focus`).

### Shared Button Primitive
- Standardized `app-button` in `src/app/shared/ui/button/button.ts` to support inputs:
  - `variant`: `'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' | 'icon'`
  - `size`: `'default' | 'compact'`
- Wired all hover, active, focus, and disabled states directly to the centralized CSS variable design tokens.

### PageHeader
- Extended `PageHeader` in `src/app/shared/components/page-header/page-header.ts` to accept optional `breadcrumbs` arrays: `Array<{ label: string, path?: string }>`.
- Adopts breadcrumbs navigation with `RouterLink` and active classes, falls back to text `eyebrow` if breadcrumbs are not provided.
- Added support for subtitle description and flexible actions slot content projection (`<div class="header-actions">`).

### FormField
- Created `FormField` in `src/app/shared/ui/form-field/form-field.ts` to manage label presentation, optional required markers (`*`), helper/hint descriptions, and reactive error message strings.

### StatusBadge
- Created `StatusBadge` in `src/app/shared/ui/status-badge/status-badge.ts` providing visual indicator badges for `success`, `info`, `warning`, `danger`, and `neutral` semantic statuses.

### DataTable Foundation
- Created global layout utility classes (`.data-table-container`, `.data-table`) in `src/styles.scss` supporting header borders, zebra striping, row hovers, and clean spacing.

### FilterBar Foundation
- Created `.filter-bar-container` flex layout classes in `src/styles.scss` to style search inputs, selector filters, and reset buttons consistently.

### Empty/Loading/Error Primitives
- **EmptyState**: Normalised text color and structure.
- **LoadingSkeleton**: Created `LoadingSkeleton` in `src/app/shared/components/loading-skeleton/loading-skeleton.ts` for pulse-loading animations.
- **ErrorState**: Created `ErrorState` in `src/app/shared/components/error-state/error-state.ts` providing standard error cards with icons, messages, and retry outputs.

---

## Shell Changes
- Aligned padding, canvas width, and gutters using space variables.
- MainLayout content container styled with `var(--bg-page)` to eliminate inner container box-in-box nesting borders.

---

## Navigation Changes
- Removed false chevron indicators (`hasSubmenu`) from the sidebar template.
- Sidebar menu item selection states styled using the electric blue primary color.

---

## Brand Changes
- Normalised visible branding from "SCS-TIX" to "OneVerz" in the logo block, footer copyrights, version displays, and LoginPage header cards.

---

## Accessibility Changes
- Ensured keyboard focus ring indicators exist on buttons (`--shadow-focus`), form fields, and sidebar item layouts.
- Preserved semantic HTML headers (`<header>`, `<nav>`, `<aside>`, `<h1>`, `<main>`).

---

## Responsive Changes
- MainLayout sidebar and header adapt cleanly from 1440px desktop downs to 768px viewports.
- The sidebar collapses to a static block layout on screens smaller than 820px to prevent navigation clipping.

---

## Build/Test Verification

- **Build Output**: `npm run build` completes successfully.
- **Test Output**: `npm run test -- --watch=false` passes 475/475 tests (68 test files).

### Unit Test Suit Summary
- Added specs for `Button`, `PageHeader`, `FormField`, `StatusBadge`, `LoadingSkeleton`, and `ErrorState`.
- All baseline tests verified as passing.

| Suite | Passed | Failed | Blocked/Skipped |
| ----- | -----: | -----: | --------------: |
| Unit  |    475 |      0 |               0 |

---

## Files Changed

- `src/styles.scss` (Design tokens, layout classes)
- `src/app/shared/ui/button/button.ts` (Button primitive)
- `src/app/shared/ui/button/button.spec.ts` (Button tests)
- `src/app/shared/components/page-header/page-header.ts` (PageHeader primitive)
- `src/app/shared/components/page-header/page-header.spec.ts` (PageHeader tests)
- `src/app/shared/ui/form-field/form-field.ts` (New FormField primitive)
- `src/app/shared/ui/form-field/form-field.spec.ts` (New FormField tests)
- `src/app/shared/ui/status-badge/status-badge.ts` (New StatusBadge primitive)
- `src/app/shared/ui/status-badge/status-badge.spec.ts` (New StatusBadge tests)
- `src/app/shared/components/loading-skeleton/loading-skeleton.ts` (New LoadingSkeleton primitive)
- `src/app/shared/components/loading-skeleton/loading-skeleton.spec.ts` (New LoadingSkeleton tests)
- `src/app/shared/components/error-state/error-state.ts` (New ErrorState primitive)
- `src/app/shared/components/error-state/error-state.spec.ts` (New ErrorState tests)
- `src/app/layout/main-layout/main-layout.ts` (MainLayout modernization)
- `src/app/layout/sidebar/sidebar.ts` (Sidebar modernization)
- `src/app/layout/sidebar/sidebar.spec.ts` (Sidebar spec updates)
- `src/app/layout/header/header.ts` (Header modernization)
- `src/app/features/auth/pages/login-page/login-page.ts` (Branding normalization)
- `src/app/layout/footer` (Deleted unused footer directory)

---

## Recommended Next Steps

### Recommended UI-2 Scope
- **UI-2 — Dashboard + Tenant List + Tenant Detail**: Rewrite Dashboard metrics and migrate the Tenant pages to consume the new design tokens, FormField controls, StatusBadge states, unified buttons, loading skeletons, and PageHeader.

### Required Next Action
- Run an independent read-only UI-1 verification before starting UI-2.
