<!-- title: Tenant Admin UI Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->

# Tenant Admin UI Rules

## Purpose

Tenant Admin UI rules for OneVerz POS MVP.

Tenant Admin works inside the same Flutter POS app, but uses a separate operational admin layout.

## Layout Decision (Updated 2026-07-29)

Tenant Admin uses one shared reusable shell for all pages:

```text
TenantAdminSharedShell
├── Shared Fixed Black Header
├── Shared White Tenant Admin Sidebar
├── Responsive Dynamic Content Area
└── Shared Fixed Black Footer Navigation
```

Canonical: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]

### Superseded visual statement

Older text in this file said Tenant Admin should look like a **dark-blue and white** operational control panel.

For the **shared sidebar**, that dark-blue full sidebar guidance is **superseded**.

**Final approved sidebar:** white / very light background, dark text, muted outline icons, light purple active background, purple active icon/text, rounded active container.

See [[Tenant_Admin_Sidebar_Navigation]].

## Sidebar / Navigation (Approved Order)

| # | Item |
|---|---|
| 1 | Dashboard |
| 2 | Outlets |
| 3 | Tills |
| 4 | Users |
| 5 | Online Store |
| 6 | Roles & Access |
| 7 | Hardware |
| 8 | Inventory |
| 9 | Products (expandable) |
| 10 | Settings (final item) |

Products children: Product List, Add Product, Categories, Brands, Inventory, Import.

Do not place Settings inside Products. Do not place Inventory under Hardware.

Older Release 1 menu lists in this note (Discounts, Loyalty, Reports as primary peers, etc.) may conflict — prefer the approved order above for the shared OneVerz Tenant Admin sidebar.

## Shared Header / Footer

- Shared fixed black header on all Tenant Admin pages
- Shared fixed black footer: Home, New Sale, Orders, Customers, Settings
- On Settings screens: sidebar Settings + footer Settings both active

## Till Monitoring UI Layout

The approved Till Monitoring screen operates within the TenantAdminSharedShell.
- **Header**: Standard black header. Do not hardcode dynamic values (like outlet name, notification count).
- **Sidebar**: "Tills" is the active item.
- **Footer**: Active item must be route-aware, do not hardcode "Settings" as active.
- **Desktop/Tablet Layout**: Uses a Master-Detail pattern. The Till list on the left, and a selected Till detail panel on the right displaying hardware readiness and alerts.
- **Mobile Layout**: Stacks vertically. Shows the Till list first. Selecting a Till navigates to a separate detail route/screen. Do not force a squished two-column layout.
- **Summary Cards**: Show Total, Online, and Offline percentages/counts.
- **Search & Filters**: Support filtering by status (Online, Offline, Needs Attention, Inactive).

## Permission Rules

Navigation is permission + feature-entitlement based. Do not hardcode cashier/manager/admin access in UI. Do not invent permission keys.

## Inventory Dual Context

Top-level Inventory ≠ Products → Inventory. See [[Tenant_Admin_Inventory_Navigation]].

## Out of Scope

- Separate Tenant Admin web app
- Customer-facing storefront UI as POS chrome

## Related Files

- [[Design_System]]
- [[Permission_Based_UI_Rules]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Sidebar_Navigation]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Tenant_Admin_Layout]]
