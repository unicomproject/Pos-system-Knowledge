<!-- title: Tenant Admin Sidebar Navigation -->
<!-- status: Active — black sidebar + orange active style approved; submenu order locked -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Sidebar Navigation

## Purpose

Define the **final approved** shared Tenant Admin sidebar navigation layout, styles, order, and behaviors for all `/tenant-admin/*` screens.

Parent layout architecture: [[Flutter_Tenant_Admin_Layout]]

---

## Visual Design (Locked & Approved)

The sidebar visual design is optimized for high-end operational readability and must be applied consistently across all Tenant Admin routes. The previous white/light sidebar and purple active styles are completely superseded.

| Parameter | Approved Rule / Value |
| :--- | :--- |
| **Background** | Solid Black |
| **Sidebar Text** | White |
| **Inactive Items** | Muted light icons |
| **Active Item Style** | Orange rounded background container |
| **Active Route Active indication** | Active child item receives its child active style indicator |
| **Products Parent Highlight** | Products parent remains highlighted in orange while any Product-area child route is active |

**Prohibitions**:
- Do **not** use a white or light sidebar.
- Do **not** use dark text on the sidebar.
- Do **not** use light-purple active backgrounds or purple icons.
- Do **not** use dark-blue gradients as the final sidebar style.
- Individual Product pages are strictly prohibited from duplicating the sidebar, header, footer, or shell.

---

## Top-Level Menu Order

The top-level menu order is locked and must be implemented as follows:
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

---

## Products Collapsible Submenu Tree

The `Products` menu item acts as a collapsible parent.
- **Parent Navigation Action**: Clicking the `Products` parent label itself navigates to the Product List screen `/tenant-admin/products`.
- **Submenu Toggle**: Clicking the expand/collapse indicator chevron toggles the visibility of the child items.
- **Submenu Children**: The submenu must contain exactly these three items in this exact order:
  1. **Add Product** (navigates to the verified Add Product route)
  2. **Categories & Subcategories** (navigates to the category/subcategory route)
  3. **Brand** (navigates to the brand route)

**Prohibited Submenu Items**:
- Do **not** display "Product List", "Product Dashboard", "Popular Products", "Inventory", "Product Inventory", "Import Products", "Import CSV", "Variant Templates", or any other child item in the submenu list.
- If a user lacks permission to access an item, it must be hidden without leaving visual gaps. The parent remains visible as long as the user has access to at least one submenu item or capability.

---

## Related Files
- [[Flutter_Tenant_Admin_Layout]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
- [[Tenant_Admin_Product_List_Flutter_Implementation_Specification]]
