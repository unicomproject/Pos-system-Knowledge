<!-- title: 2026-08-08 Tenant Admin Add Product Step1 + Image Manager Final Sync Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-08 -->

# 2026-08-08 Tenant Admin Add Product Step 1 + Image Manager Final Sync Audit

## Purpose
Final correction/sync pass aligning active Second Brain Product contracts with the implemented Unified Commerce backend for:

- Tenant Admin Add Product Step 1 (Basic Details)
- Product Image Manager

## Active Documents Updated
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/Tenant_Admin_Product_Image_Manager_Specification.md`

## Conflicts Removed From Active Contracts
1. Forced `current_setup_step = 1` interpretation for every Save Draft → replaced with Step N semantics.
2. Ambiguous Product Name placeholder → documented as draft-only `Untitled Product`, rejected on Save & Continue.
3. Stage route `POST /api/v1/tenant/catalog/media/stage` → superseded; canonical is `POST /api/v1/tenant-admin/products/images/stage`.
4. Image permissions `tenant.products.create/update` → superseded; canonical is `catalog.product_media.manage`.
5. Duplicate `POST /api/v1/media/stage` → documented as removed/non-canonical.

## Canonical Facts Confirmed
- Create Options: `GET /api/v1/tenant-admin/products/create-options` + `catalog.products.create`
- Media model: `media_assets` + `product_images`
- Brand optional; Category optional on Save Draft / required on Step 1 Save & Continue
- Product remains `DRAFT` until Publish; Active toggle maps to `desired_publish_status`

## Backend Code Touched In This Pass
- `TenantAdminProductService` setup-step semantics + create-options catalog permission
- `TenantAdminProductRequestValidator` placeholder rejection for Save & Continue
- `ProductConstants.IsDraftProductNamePlaceholder`
- Related unit tests

## Remaining Non-Blocking Gaps
- Draft/image audit event names not defined in active Second Brain catalogue
- Migration `20260808120000_AddProductWizardStep1AndStagedMedia` may still be pending apply in environments
