<!-- title: Tenant Admin Inventory Navigation -->
<!-- status: Active — dual Inventory contexts documented; alias gap recorded -->
<!-- system: OneVerz POS MVP POS -->
<!-- last_updated: 2026-08-15 -->
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
- [[../07_UI_UX_KNOWLEDGE/Tenant_Admin_Inventory_Approved_UI_Prototype]]
- [[../07_UI_UX_KNOWLEDGE/Inventory_UI_Prototype_Screen_Registry]]

## Approved UI Prototype Reference

Prototype Status: APPROVED

Implementation Audit: PASS

UI/UX Lock: NOT LOCKED — READY TO LOCK

Canonical HTML/CSS pack:

```text
07_UI_UX_KNOWLEDGE/prototypes/inventory_ui_prototype_29_screens/inventory_html_prototype/
```

**Production shell:** Tenant Admin shared black sidebar; Inventory is top-level (label Inventory). Routes may keep `/tenant-admin/stock/*` as aliases; canonical `/tenant-admin/inventory/*`.

**Prototype content:** the 29-screen workspace is the visual contract. Prototype Settings-nesting / white sidebar / POS till chrome is **not** the production shell (GAP-INV-008 RESOLVED).
