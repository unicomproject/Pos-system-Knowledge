<!-- title: Tenant Admin Inventory Navigation -->
<!-- status: Active — dual Inventory contexts documented; alias gap recorded -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-07-29 -->
<!-- doc_type: Architecture approval — documentation only -->

# Tenant Admin Inventory Navigation

## Purpose

Clarify the **two approved Inventory navigation contexts** so implementation does not duplicate screens incorrectly.

Parent shell: [[Tenant_Admin_Settings_Shared_Layout_Architecture]]  
Sidebar: [[Tenant_Admin_Sidebar_Navigation]]  
Products children: [[Tenant_Admin_Product_Management_Navigation]]

## Dual Context Decision

| Context | Purpose |
|---|---|
| **Top-level Inventory** | Main stock/inventory operations module — stock overview, movements, adjustments, transfers, stocktake, or other approved inventory operations |
| **Products → Inventory** | Product-specific inventory configuration / product stock setup |

**Rule:** Products → Inventory must **not** duplicate the complete top-level Inventory module without an approved business rule.

Do not create duplicate screen implementations.

## Current Code Reality (Inspected 2026-07-29)

| Item | Reality |
|---|---|
| Top-level menu label | **Stock** (not "Inventory") in `tenantAdminMenuCatalog` |
| Top-level default route | `/tenant-admin/stock/current` |
| Inventory area helper | `InventoryRoutes` — `/tenant-admin/stock`, `/stock/current`, `/stock/in`, … |
| Products → Inventory child | **Missing** from `ProductsSidebarVisibility` |
| Shared screen alias today | N/A for Products→Inventory — child does not exist yet |

If implementation temporarily points Products → Inventory at `/tenant-admin/stock/current` (or any full Stock screen), record that as a **navigation gap / temporary alias**, not as final approved product setup UX.

## Label Alignment Gap

Approved top-level label is **Inventory**. Current label is **Stock**. Renaming is a documentation-approved IA change; route paths may keep `/tenant-admin/stock/*` until product renames routes.

## Not Approved

- Inventory nested under Hardware
- Settings nested under Products
- Two identical full Inventory modules with no business distinction

## Related Files

- [[Tenant_Admin_Sidebar_Navigation]]
- [[Tenant_Admin_Product_Management_Navigation]]
- [[Tenant_Admin_Settings_Shared_Layout_Architecture]]
- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
