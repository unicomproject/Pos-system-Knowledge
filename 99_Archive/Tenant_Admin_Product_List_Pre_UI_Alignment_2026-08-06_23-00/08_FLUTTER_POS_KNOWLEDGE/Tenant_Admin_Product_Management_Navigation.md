<!-- title: Tenant Admin Product Management Navigation -->
<!-- status: Active — Products nested menu approved; route gaps recorded -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation only -->

# Tenant Admin Product Management Navigation

## Purpose

Document the approved **Products** collapsible sidebar parent and child routes for Tenant Admin.

Parent: [[Tenant_Admin_Sidebar_Navigation]]  
Shell: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]  
Inventory dual-context: [[Tenant_Admin_Inventory_Navigation]]

## Approved Products Tree

```text
Products
├── Product List
├── Add Product
├── Categories
├── Brands
├── Inventory
└── Import
```

## Existing Routes (Inspected 2026-07-29)

| Child | Existing route | In current Products sidebar children? |
|---|---|---|
| Product List | `/tenant-admin/products` | Yes |
| Add Product | `/tenant-admin/products/add` | Yes |
| Categories | `/tenant-admin/categories` | Yes |
| Brands | `/tenant-admin/brands` | Yes |
| Import | `/tenant-admin/products/import` | **Yes** — route integrated into Products sidebar children |
| Inventory (product-specific) | **Gap** — no dedicated Products→Inventory child route | **No** |

Also present in code today (not in approved child list):

| Extra current child | Route |
|---|---|
| Product Dashboard | `/tenant-admin/products/dashboard` |
| Variant Templates | `/tenant-admin/variant-templates` |

Do not remove those without product confirmation. Do not invent replacement paths.

## Behaviour Rules

- Products parent shows expand/collapse indicator
- Products remains expanded when any child route is active
- Active child uses light purple highlight
- Only one active child at a time
- Child visibility follows permissions + feature entitlements
- Deep links into a child must expand Products and mark that child active

## Brands Active Example

When route is `/tenant-admin/brands`:

- Sidebar Products expanded
- Brands child active
- Footer Settings active (catalog/settings area)

See [[Brands_Management_Screen_Specification]].

## Related Files

- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]
- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Brands_Management_Screen_Specification]]
- [[../04_MODULE_KNOWLEDGE/10_Product_Core/04_Tenant_Admin_Product_List_And_Import_Contract]]
