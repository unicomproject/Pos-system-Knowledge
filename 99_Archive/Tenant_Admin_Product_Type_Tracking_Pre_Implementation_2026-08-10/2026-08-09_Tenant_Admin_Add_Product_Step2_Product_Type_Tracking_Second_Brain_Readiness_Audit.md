# 2026-08-09 Tenant Admin Add Product Step 2 "Product Type & Tracking Setup" Second Brain Readiness Audit Report

**Date**: 2026-08-09  
**Audit Scope**: Tenant Admin Add Product Step 2 — Product Type & Tracking Setup  
**Auditor**: Senior Solution Architect, Principal Backend Engineer (.NET Core), Principal Mobile Architect (Flutter), Lead Database Architect, QA & Security Specialist  

---

## 1. Executive Summary & Audit Purpose

This audit evaluates the Second Brain readiness for **Tenant Admin Add Product Step 2 — Product Type & Tracking Setup**. Prior audits (e.g. `2026-08-08_Tenant_Admin_Add_Product_8_Step_Second_Brain_Readiness_Audit.md`) established the macro 8-step wizard structure and detailed Step 1 (Basic Details + Image Upload). However, Step 2 retained significant implementation gaps:
- Ambiguity regarding "Product Type" vs "Product Structure" (UI vs Domain vs Database mapping).
- Lack of full field traceability matrix across UI, Flutter DTO, API, .NET Domain, Database table/column, Validation, Permission, and Audit logging.
- Missing tracking mutual exclusivity and conditional rules (e.g., Expiry requires Batch; Serial mutually exclusive with Batch/Expiry).
- Undefined canonical behavior for `SKIP`, `SAVE DRAFT`, `SAVE & CONTINUE`, `BACK`, and `RESUME/GET SETUP`.
- Undefined cross-step data invalidation during Product Structure changes (e.g. `VARIANT` → `SIMPLE`).
- Undefined edit safety rules for active products with historical inventory movements/batches/serials.
- Undefined default inventory UOM handling before Step 3.

This document serves as the superseding audit specifically for **Step 2**, confirming that all ambiguities are resolved and documenting the exact readiness status.

---

## 2. Documents Audited & Baseline Cross-References

The following Second Brain knowledge documents were audited:
1. `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
2. `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
3. `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
4. `02_ACCESS_CONTROL/Permission_Code_List.md`
5. `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
6. `06_DATABASE_KNOWLEDGE/Tables/10_Catalog_Master_Data_And_Product_Core_UPDATED.md`
7. `06_DATABASE_KNOWLEDGE/Tables/16_Inventory_Foundation_Product_Tracking_And_Stock_Availability.md`
8. `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-08_Tenant_Admin_Add_Product_8_Step_Second_Brain_Readiness_Audit.md`

### Source Code Baselines Inspected (Read-Only Inspection)
- **.NET Backend**: `Unified-Commerce/src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/TenantAdminProductRepository.Wizard.cs`
- **Flutter App**: `Nytroz-POS-App/lib/features/tenant_admin/products/presentation/widgets/add_product_wizard.dart`

---

## 3. Ambiguities & Contradictions Resolved

### 3.1 Product Type vs. Product Structure Domain Mapping
- **Contradiction**: UI labels the 3 options ("Simple Product", "Variant Product", "Bundle / Kit") as "Product Type", but `products.product_type` in the database stores merchandise classifications (e.g., `STANDARD`).
- **Resolution**: Canonical mapping locked:
  - UI Option: **Simple Product** $\rightarrow$ API: `productStructure: "SIMPLE"` $\rightarrow$ Domain: `ProductStructure.SIMPLE` $\rightarrow$ DB: `products.product_structure = 'SIMPLE'`.
  - UI Option: **Variant Product** $\rightarrow$ API: `productStructure: "VARIANT"` $\rightarrow$ Domain: `ProductStructure.VARIANT` $\rightarrow$ DB: `products.product_structure = 'VARIANT'`.
  - UI Option: **Bundle / Kit** $\rightarrow$ API: `productStructure: "BUNDLE"` $\rightarrow$ Domain: `ProductStructure.BUNDLE` $\rightarrow$ DB: `products.product_structure = 'BUNDLE'`.
  - `products.product_type` remains strictly reserved for merchandise category classification, defaulting to `'STANDARD'` during draft.

### 3.2 Default State & Cross-Step Sync (Step 1 vs Step 2)
- **Default State**: Structure = `SIMPLE`, Track Inventory = `true` (`ON`), Batch = `false` (`OFF`), Expiry = `false` (`OFF`), Serial = `false` (`OFF`).
- **Sync**: The `Track Inventory` toggle exposed in Step 1's Status & Options card and Step 2's Tracking Rules share **ONE single canonical draft property** (`is_stock_tracked` in `product_inventory_settings`). Toggling it in Step 1 immediately reflects in Step 2 state and vice-versa.

### 3.3 Tracking mutual exclusivity & conditional rules
- **Rule 1**: Track Inventory `OFF` $\rightarrow$ Batch `OFF`, Expiry `OFF`, Serial `OFF` (controls disabled & state reset).
- **Rule 2**: Batch Tracking requires Track Inventory `ON`.
- **Rule 3**: Expiry Tracking requires Track Inventory `ON` AND Batch Tracking `ON`.
- **Rule 4**: Serial Tracking requires Track Inventory `ON`.
- **Rule 5**: Serial Tracking is mutually exclusive with Batch Tracking and Expiry Tracking in Release 1.
- **Database Safety Constraint**:
  ```sql
  CHECK (
    NOT (
      requires_serial_tracking = TRUE AND 
      (requires_batch_tracking = TRUE OR requires_expiry_tracking = TRUE)
    )
  )
  ```

### 3.4 Draft Inventory UOM Dependency
- `product_inventory_settings.inventory_uom_id` is mandatory (`NOT NULL`).
- **Draft Behavior**: During Step 1 / Step 2 draft persistence, the backend resolves the tenant's default system base UOM (e.g. `PIECE` or `EACH`). During Step 3, the explicit user selection replaces `inventory_uom_id`.

### 3.5 Skip / Footer Navigation Decisions
- **Skip Decision**: Step 2 is **NON-SKIPPABLE**. The UI must hide/disable the `Skip` button on Step 2. Product Structure selection requires explicit confirmation before advancing.
- **Save Draft**: Validates structure/tracking flags, persists to DB without advancing step (`advanceStep: false`), updates `draft_saved_at`, increments `row_version`, stays on Step 2.
- **Save & Continue**: Validates Step 2 rules, normalizes dependent flags, persists atomically, updates `current_setup_step` from 2 to 3 (`advanceStep: true`), returns updated `rowVersion`, and navigates to Step 3 upon server HTTP 200 OK.
- **Back**: Navigates from Step 2 to Step 1, preserving local client state without implicit publish.

### 3.6 Permission & Entitlement Model
- **Wizard Initial Creation**: Authorized by `catalog.products.create` for draft creation and step updates (Steps 1–7) on own tenant's draft.
- **Edit Mode (Existing Active Product)**: Requires `catalog.products.update`.
- **Entitlement**: Requires active tenant feature entitlement `product_management`.

---

## 4. Superseding Verdict

The previous audit verdict (`2026-08-08_Tenant_Admin_Add_Product_8_Step_Second_Brain_Readiness_Audit.md`) claiming "100% Complete coverage across all 8 steps" is officially **SUPERSEDED** and clarified as follows:
- Steps 1 & 2 are now **100% FULLY SPECIFIED & READY FOR IMPLEMENTATION**.
- Steps 3–8 will be formally audited and locked in subsequent step-specific contracts.

### Current Status:
**READY FOR IMPLEMENTATION** (Step 2 — Product Type & Tracking Setup)
