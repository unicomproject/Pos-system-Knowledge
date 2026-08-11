<!-- title: Flutter Tenant Admin Layout -->
<!-- status: Active — shared shell + black sidebar approved -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Flutter Tenant Admin Layout

## Purpose

Define the unified application layout rules for all operational Tenant Admin screens.

---

## Layout Structure

All Tenant Admin views must load inside a single shared reusable shell layout. Responsive behavior handles device scaling; the shell structure remains identical.

```text
TenantAdminSharedShell
├── Shared Fixed Black Header
├── Shared Black Tenant Admin Sidebar (White text, Orange active item)
├── Responsive Dynamic Content Area (White rounded canvas on dark background)
└── Shared Fixed Black Footer Navigation
```

### Shared Shell Components

| Layout Piece | Approved Rule / Visual Style |
| :--- | :--- |
| **Header** | Fixed black bar displaying session context. Same across all pages. |
| **Sidebar** | Solid black background, white text, orange rounded background active indicator. |
| **Content Area** | White rounded canvas enclosing screen content, framed by a dark outer shell. |
| **Footer** | Shared fixed black footer navigation bar. |

---

## Behavior Rules

- **No Duplication**: Individual feature pages (such as Product List, Categories, or Brands) must never instantiate their own sidebars, headers, footers, or outer shell scaffolds. They must sit within the dynamic content area of the shared shell.
- **Entitlements & Permissions**: Sidebars must conditionally render parent and child items based on the user's active permissions. Denied routes are hidden entirely (no greyed-out or empty spaces).

---

## Superseded Layout Rules

The following visual rules are superseded and must not be documented or implemented:
- White or light sidebars.
- Dark text on sidebars.
- Light-purple active highlights or purple icons.
- Dark-blue/navy gradient layouts.

---

## Related Files
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_UI_Rules]]
