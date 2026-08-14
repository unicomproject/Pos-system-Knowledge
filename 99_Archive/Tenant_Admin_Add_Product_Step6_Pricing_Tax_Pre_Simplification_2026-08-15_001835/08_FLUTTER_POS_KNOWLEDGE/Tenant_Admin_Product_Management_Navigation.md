<!-- title: Tenant Admin Product Management Navigation -->
<!-- status: Active — Products nested menu approved; import removed -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# Tenant Admin Product Management Navigation

## Purpose

Document the routing, layout states, and navigation paths for all product-related screens under the Tenant Admin context.

---

## Approved Navigation Structure

The Products collapsible parent menu item handles list loading, while its expander chevron controls the submenu.

```text
Products (Parent label: clicks to /tenant-admin/products)
├── Add Product (clicks to /tenant-admin/products/add)
├── Categories & Subcategories (clicks to /tenant-admin/categories)
└── Brand (clicks to /tenant-admin/brands)
```

### Route Mapping Table

| Child Item | Display Label | go_router Route Path | Required Permission |
| :--- | :--- | :--- | :--- |
| **Products Parent** / Product List | Products | `/tenant-admin/products` | `catalog.products.view` |
| **Add Product** | Add Product | `/tenant-admin/products/add` | `catalog.products.create` |
| **Categories** | Categories & Subcategories | `/tenant-admin/categories` | `catalog.categories.view` |
| **Brand** | Brand | `/tenant-admin/brands` | `catalog.brands.view` |

---

## Submenu & Highlight Behaviors

1. **Expander Toggle**: Clicking the expand/collapse indicator (chevron) on the `Products` parent toggles the submenu expansion.
2. **Parent Click**: Clicking the `Products` label text itself immediately navigates the user to the Product List `/tenant-admin/products`.
3. **Orange Persistence**: The `Products` parent menu item must remain expanded and styled with an orange rounded background whenever any of the following paths are active:
  - Product List: `/tenant-admin/products`
  - Add Product: `/tenant-admin/products/add`
  - Categories & Subcategories: `/tenant-admin/categories`
  - Brand: `/tenant-admin/brands`
  - Product Details: `/tenant-admin/products/:id`
  - Product Edit: `/tenant-admin/products/:id/edit`
4. **Child Selection**: Only the specific active child submenu item receives its active selection indication.
5. **Entitlement Filtering**: If a child submenu item is restricted (due to user role permissions), it must be hidden without leaving visual gaps. The `Products` parent remains visible as long as the user can access at least one approved submenu capability.

---

## Related Files
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Flutter_Tenant_Admin_Layout]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_Contract]]
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Product_List_UI_UX_Specification]]
