<!-- title: Brands Management Screen Specification -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP / OneVerz POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Screen specification — shared shell composition -->

# Brands Management Screen Specification

## Purpose

Brands Management is the reference screen for [[Tenant_Admin_Settings_Shared_Layout_Architecture]].

**Host:** `TenantAdminSharedShell`  
**Sidebar:** Shared white sidebar — Products expanded, Brands active  
**Footer:** Fixed black footer — Settings active

## Target Structure

```text
TenantAdminSharedShell
├── Shared Header
├── Shared White Sidebar
│   ├── Products expanded
│   └── Brands active
├── BrandsManagementScreen
│   ├── Breadcrumb
│   ├── Page Header Card
│   ├── Search and Filter Card
│   ├── Brand Table Card
│   └── Optional Brand Details Side Panel
└── Shared Fixed Footer
    └── Settings active
```

Do **not** omit shared header/sidebar/footer. Do **not** duplicate them inside `BrandsManagementScreen`.

## Brand Table Fields

| Column | Rule |
|---|---|
| Brand Logo | Real media — no fake logos |
| Brand Name | API name |
| Code | API code |
| Product Count | Server-calculated — no fake counts |
| Sort Order | API/DB supported |
| Status | API status |
| Updated On | API `updatedAt` |
| Actions | Edit / Delete per permission |

## Permissions

| Action | Flutter | Backend |
|---|---|---|
| View | `tenant.brands.view` | `catalog.brands.view` |
| Create | `tenant.brands.create` | `catalog.brands.create` |
| Update | `tenant.brands.update` | `catalog.brands.update` |
| Delete | `tenant.brands.delete` | `catalog.brands.delete` |

## Route

`/tenant-admin/brands` (existing)

## Related Files

- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Settings_Responsive_Design]]
- [[Tenant_Admin_Settings_Component_Catalogue]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Brand_Collection_CRUD_Implementation_Status]]
