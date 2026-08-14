<!-- title: Tenant Admin UI Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin UI Rules

## Purpose

This document defines UI guidelines and layout behaviors for the Tenant Admin area of the OneVerz POS system.

---

## Layout Structure

All Tenant Admin views must load inside a single shared reusable shell layout:

```text
TenantAdminSharedShell
├── Shared Fixed Black Header
├── Shared Black Tenant Admin Sidebar (White text, Orange active background)
├── Responsive Dynamic Content Area (White rounded canvas on dark background)
└── Shared Fixed Black Footer Navigation
```

### Layout Visual Rules (Updated 2026-08-06)

The sidebar and shell layouts must adhere to these locked guidelines:
- **Sidebar Background**: Solid Black.
- **Sidebar Text**: White.
- **Inactive Items**: Muted light icons.
- **Active Item Indicator**: Orange rounded background container.
- **Products Parent Highlight**: The Products parent item remains highlighted in orange whenever any Product-area route is active.
- **Content Area**: White rounded canvas containing screen content, surrounded by a dark application outer shell.

**Prohibited Elements**:
- White or light sidebars.
- Dark text on sidebars.
- Light-purple active highlights or purple active icons.
- Dark-blue/navy gradient layouts.
- Individual Product pages duplicating the sidebar, header, footer, or shell.

---

## Sidebar / Navigation (Top-Level Order)

The top-level menu order is:
1. Dashboard
2. Outlets
3. Tills
4. Users
5. Online Store
6. Roles & Access
7. Hardware
8. Inventory
9. Products (collapsible parent)
10. Settings (final item)

### Products Collapsible Submenu
- **Submenu Children**: Add Product, Categories & Subcategories, Brand (exactly these three in this exact order).
- **Submenu Exclusions**: Product List, Product Dashboard, Popular Products, Inventory, Product Inventory, Import, Variant Templates are absent.

---

## Related Files
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Sidebar_Navigation]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Flutter_Tenant_Admin_Layout]]
- [[Tenant_Admin_Product_List_UI_UX_Specification]]
- [[Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[Inventory_UI_Prototype_Screen_Registry]]
- [[Tenant_Admin_Inventory_Implementation_Audit]]
