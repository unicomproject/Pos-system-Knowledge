# Tenant Admin Add Product Step 2 — Final Verification Audit

**Date**: August 9, 2026  
**Module**: 10 Product Core / Catalog & Inventory Management  
**Status**: APPROVED & IMPLEMENTATION READY FOR FLUTTER STEP 2  

> **HISTORICAL IMPLEMENTATION EVIDENCE — PRE-SCANNER-FIRST NUMBERING.**
>
> This audit used the wizard numbering that was current on 2026-08-09.
> Product Type & Tracking was then global Step 2.
>
> **CURRENT** scanner-first numbering:
> - Step 1 = Scan Barcode
> - Step 2 = Basic Details
> - Step 3 = Product Type & Tracking
>
> Therefore every “Step 2 Product Type & Tracking” implementation reference in this audit maps to **CURRENT Step 3**.
>
> Historical code symbols (e.g. `Step2WizardProcessor`) are preserved as written — historical code symbol ≠ current global wizard number.
>
> This audit does **NOT** prove the new scanner-first Step 1 is implemented.
>
> **Current authority:**
> - [[../../00_START_HERE/Current_Source_Of_Truth]]
> - [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_STEP1_DECISION_2026-09-11]]
> - [[../../13_DECISIONS_AND_CHANGES/PRODUCT_SETUP_SCANNER_FIRST_TECHNICAL_CONTRACT_DECISION_2026-09-12]]
> - [[05_Tenant_Admin_Add_Product_7_Step_Contract]]

---

## Executive Summary

This document certifies that **Tenant Admin Add Product Step 2: Product Type & Tracking Setup** is fully audited, aligned with the Second Brain specification, and completely implemented on the backend.

The backend implementation strictly adheres to:
1. **Single Access Owner Architecture**: Centralized under `ProductWizardAccessPolicy.cs` covering tenant operational status check (`GetTenantStatusAsync` → `TenantAuthConstants.IsTenantLoginStatusAllowed`), tenant feature entitlement (`PlatformTenantFeatureCodes.ProductCatalog`), and workflow permissions (`catalog.products.create` vs `catalog.products.update`).
2. **Canonical Tracking Truth Matrix**: Implemented in domain service `ProductTrackingRules.cs` and enforced at domain entity creation/update, application request validation (`TenantAdminProductRequestValidator`), step processor (`Step2WizardProcessor`), and EF Core database check constraints (`ck_product_inventory_settings_serial_no_batch_or_expiry`).
3. **Lifecycle Preservation**: `ACTIVE` and `INACTIVE` products retain their operational status when wizard updates occur, preventing accidental status downgrades to `DRAFT`.
4. **Bundle Release 1 Tracking Semantics**: Bundle parent item has `IsStockTracked = false`, `RequiresBatchTracking = false`, `RequiresExpiryTracking = false`, `RequiresSerialTracking = false` on its parent `ProductInventorySetting`. Component inventory (`combo_components`) controls stock availability.
5. **Transactional Audit Logging**: Material Step 2 updates emit an `AuditLog` entity into `EPosDbContext.AuditLogs` (`audit_logs` table) inside the same database transaction.
6. **Optimistic Concurrency & Concurrency Safety**: Stale or missing `expectedRowVersion` values are handled gracefully with 409 Conflict (`product.concurrency_conflict`) or 400 Bad Request (`product.row_version_required`).
7. **Complete Product Setup Summary**: `GetSetupAsync` returns all summary card fields (`categoryName`, `brandName`, `createdByName`, `createdAt`, `primaryImageUrl`, `sku`, `rowVersion`) to populate the right-hand preview panel during wizard editing.

---

## Audit Verification Checklist

| Requirement ID | Requirement Description | Verification Method | Status |
|---|---|---|---|
| DOD-01 | Entitlement key locked to `product_catalog` (`PlatformTenantFeatureCodes.ProductCatalog`) | Verified `ProductWizardAccessPolicy.cs` uses `PlatformTenantFeatureCodes.ProductCatalog` | PASS |
| DOD-02 | Single Access Policy Owner | Verified `ProductWizardAccessPolicy` handles tenant status, entitlement, and permissions without duplication in `TenantAdminProductService` | PASS |
| DOD-03 | Workflow Permissions (`create` vs `update`) | Initial creation draft uses `catalog.products.create`; existing product edit uses `catalog.products.update` | PASS |
| DOD-04 | Lifecycle Preservation | Verified `Product.UpdateWizardStep1Profile`, `UpdateWizardStep2Profile`, and `SaveWizardDraft` preserve `ACTIVE` / `INACTIVE` status | PASS |
| DOD-05 | Tracking Combination Matrix | Enforced in `ProductTrackingRules.cs` with 12-case truth table validation | PASS |
| DOD-06 | Bundle Tracking Rules | Bundle parent forces all tracking flags to `false` | PASS |
| DOD-07 | Persistent Transactional Audit | `AuditLog` written to `_dbContext.AuditLogs` in same DB transaction | PASS |
| DOD-08 | DB Check Constraint | `ck_product_inventory_settings_serial_no_batch_or_expiry` added to EF Core config & migration `20260809120000_AddSerialMutualExclusivityCheckConstraint.cs` | PASS |
| DOD-09 | Structure Transition Safety | Stale draft variants/combos removed transactionally on structure changes (`VARIANT` → `SIMPLE`, `BUNDLE` → `SIMPLE`) | PASS |
| DOD-10 | Product Setup Summary DTO | `ProductSetupWizardDto` and `ProductDraftResponse` expanded with `categoryName`, `brandName`, `createdByName`, `createdAt`, `primaryImageUrl` | PASS |
| DOD-11 | Lowercase Error Mapping | Lowercase namespaced error codes (`product.<error_code>`) mapped to HTTP 400, 403, 404, 409 in `TenantAdminProductsController.cs` | PASS |

---

## Conclusion & Flutter Readiness

The backend and Second Brain documentation are 100% synchronized and ready for Flutter Step 2 implementation. Flutter developers can now integrate Step 2 screens against the standard `/v1/tenant-admin/products/draft` APIs.
