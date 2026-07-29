<!-- title: Tenant Admin Settings Layout Implementation Status -->
<!-- status: Architecture approved — white sidebar + shared shell; code incomplete -->
<!-- system: TM-EPOS MVP / OneVerz POS -->
<!-- module: Tenant Admin Shared Layout -->
<!-- platform: Flutter Tenant Admin + Backend -->
<!-- last_updated: 2026-07-29 -->

# Tenant Admin Layout Implementation Status

## Module

Tenant Admin shared shell (header + white sidebar + footer) + reusable component architecture.

## Current State (Truthful — 2026-07-29)

**Documentation decision recorded.** Implementation is **not** fully complete.

| Area | Status |
|---|---|
| Shared Header | **Approved** — required on all Tenant Admin pages |
| Shared Sidebar | **Approved** — white/light reusable sidebar |
| Sidebar Order | Approved: Dashboard, Outlets, Tills, Users, Online Store, Roles & Access, Hardware, Inventory, Products, Settings |
| Products Children | Approved: Product List, Add Product, Categories, Brands, Inventory, Import |
| Shared Footer | **Approved** — required |
| Responsive Behaviour | **Documented** |
| Code Status | Partial existing chrome (`TenantAdminLayout`, `TenantAdminAppHeader`, dark `TenantAdminSidebar`, `TenantAdminFooterNavigation`) — **white sidebar + approved menu order + shared shell rename not verified complete** |

Canonical docs:

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Inventory_Navigation]]

## Checklist

- [x] White sidebar visual decision approved
- [x] Sidebar menu order approved
- [x] Products nested menu approved
- [x] Shared header approved
- [x] Shared footer approved
- [x] Responsive behaviour documented
- [x] Existing routes inspected (2026-07-29)
- [x] Existing permissions / menu catalog inspected (2026-07-29)
- [ ] Shared white sidebar implemented
- [ ] Shared shell (`TenantAdminSharedShell`) implemented / aligned
- [ ] Product child routes verified against approved list
- [ ] Desktop verified
- [ ] Tablet verified
- [ ] Mobile verified
- [ ] No overflow verified
- [ ] Tests added

## Inspected Route / Permission Gaps

| Gap | Detail |
|---|---|
| Online Store | No `/tenant-admin/...` route found |
| Hardware | No `/tenant-admin/...` route found |
| Products → Inventory | Not in current Products children; must not silently duplicate full Stock module |
| Import child | Route `/tenant-admin/products/import` exists; not in current children visibility list |
| Inventory label | Approved "Inventory"; current catalog uses "Stock" |
| Menu extras | Reports, Billing, Activity present in current catalog; not in approved top-level order |
| Orders footer | Still unavailable |
| Dark sidebar | Current `TenantAdminSidebar` still dark navy gradient |

## Remaining Implementation Actions

1. Restyle shared sidebar to white/light tokens (active light purple)
2. Reorder top-level menu to approved list; add Online Store + Hardware when routes/permissions exist
3. Align Products children to approved list; resolve Inventory dual-context without duplicate screens
4. Align shell naming/structure to `TenantAdminSharedShell` + catalogue components
5. Verify desktop / tablet / mobile / overflow
6. Add tests for sidebar order, expand/active, permissions, footer Settings active

## Related

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Brands_Management_Screen_Specification]]
- [[Brand_Collection_CRUD_Implementation_Status]]
