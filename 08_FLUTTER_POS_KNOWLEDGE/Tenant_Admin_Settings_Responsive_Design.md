<!-- title: Tenant Admin Settings Responsive Design -->
<!-- status: Active — responsive rules for white sidebar + shared shell -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation only; implementation not complete -->

# Tenant Admin Settings Responsive Design

## Purpose

Define adaptive responsive behaviour for the shared Tenant Admin shell:

`TenantAdminSharedShell` = fixed black header + **white/light sidebar** + content + fixed black footer.

Parent: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]  
Sidebar: [[Tenant_Admin_Sidebar_Navigation]]

**Do not** simply shrink the desktop sidebar.

## Breakpoints

| Name | Width |
|---|---|
| Desktop | ≥ 1280 |
| Tablet landscape | 900–1279 |
| Small tablet | 700–899 |
| Mobile | < 700 |

## Desktop — Width ≥ 1280

- Full white sidebar visible (icons + labels)
- Products nested menu expands inline
- Content and optional side panel visible
- Header and footer remain fixed

## Tablet Landscape — Width 900–1279

- Sidebar remains visible
- Sidebar width may reduce slightly
- Products children remain readable
- Long labels must not overflow
- Content receives enough width
- Right-side panel remains when space permits
- Header and footer remain fixed

## Small Tablet — Width 700–899

- Sidebar may use compact width
- Child indentation may reduce
- Sidebar may become collapsible
- Optional side panel may become modal / full-height sheet
- No horizontal overflow
- Header and footer remain fixed

## Mobile — Width < 700

- Sidebar becomes a drawer (`TenantAdminSidebarMobileDrawer`)
- Same menu order preserved
- Products remains expandable
- Active route remains visible
- Drawer closes after successful navigation
- Main content uses full width
- Right-side panel becomes full-screen form
- Footer remains fixed and safe-area aware
- Header remains fixed (menu opens drawer)

## Shared Header / Footer Responsive Rules

- Header fixed; must not scroll with content; compact chips on narrow widths without overflow
- Footer fixed; all five items usable; active ownership follows the route. Brand keeps Product/Brand active and Settings inactive.
- Main content height subtracts header + footer (+ safe area on mobile)

## Scrolling Rules

| Region | Behaviour |
|---|---|
| Header | Fixed |
| Footer | Fixed |
| Sidebar | Fixed on desktop/tablet; may scroll internally only when menu height exceeds viewport |
| Main content | Scrollable |
| Right-side panel | Scrollable independently |

Prevent: footer/header overlap; sidebar disappearing while scrolling; double scrolling; unnecessary horizontal scrolling; RenderFlex overflow; unbounded-height errors; hidden Save/Cancel buttons.

## Design Tokens (Required Shared)

Document / use shared tokens for:

- Header height
- Footer height
- Sidebar width
- Compact sidebar width
- Sidebar child indent
- Page padding
- Content gap
- Card radius
- Card border
- Form field height
- Button height
- Table header height
- Side-panel width
- Active sidebar background
- Active sidebar foreground
- Desktop / tablet / small-tablet / mobile breakpoints

Do not define random spacing and color values separately in every feature screen.

## Related Files

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Brands_Management_Screen_Specification]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Flutter_Tenant_Admin_Layout]]
