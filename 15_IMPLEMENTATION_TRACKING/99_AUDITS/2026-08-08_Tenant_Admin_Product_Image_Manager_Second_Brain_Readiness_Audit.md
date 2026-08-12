<!-- title: Tenant Admin Product Image Manager Readiness Audit -->
<!-- status: Active -->
<!-- system: OneVerz POS Unified Commerce Scope -->
<!-- last_updated: 2026-08-08 -->

# Tenant Admin Product Image Manager Readiness Audit

## 1. Source Files Inspected
- Flutter Frontend:
  - `lib/features/tenant_admin/products/presentation/widgets/add_product_wizard.dart`
  - `lib/features/tenant_admin/products/presentation/widgets/product_detail_form.dart`
  - `lib/features/tenant_admin/products/presentation/widgets/product_detail_view_card.dart`
  - `lib/features/tenant_admin/presentation/screens/tenant_admin_placeholder_screen.dart`
- Backend .NET:
  - `src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/CatalogMediaController.cs`
  - `src/E_POS.Domain/Modules/Tenant/CatalogProduct/Entities/ProductImage.cs`
  - `src/E_POS.Infrastructure/Persistence/Migrations/20260723152932_AddMediaAssetsPhase1.cs`
  - `src/E_POS.Infrastructure/Persistence/Migrations/20260726184431_RemoveLegacyMediaColumnsPhase4F.cs`

## 2. Second Brain Files Inspected
- `03_USER_JOURNEYS/Tenant_Admin/09_Product_Management_Flow.md`
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification.md`
- `15_IMPLEMENTATION_TRACKING/FULL_PROJECT_ACTUAL_STATUS_AUDIT_2026-07-31.md`

## 3. Archive Created
- Archive Path: `99_Archive/Tenant_Admin_Product_Image_Manager_Pre_Target_UI_2026-08-08_163017/`

## 4. Files Archived
- `05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- `Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification.md`

## 5. Files Modified
- `04_MODULE_KNOWLEDGE/10_Product_Core/05_Tenant_Admin_Add_Product_8_Step_Contract.md`
- `07_UI_UX_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_UI_UX_Specification.md`
- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Add_Product_8_Step_Flutter_Implementation_Specification.md`

## 6. Files Created
- `04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/Tenant_Admin_Product_Image_Manager_Specification.md`
- `15_IMPLEMENTATION_TRACKING/99_AUDITS/2026-08-08_Tenant_Admin_Product_Image_Manager_Second_Brain_Readiness_Audit.md`

## 7. Current Implementation Discovered
- Current Flutter wizard renders `_ProductImagesPanel` with a permanently expanded inline drop zone (`height: 170`), cover tile, and 3 hardcoded `_AddImageTile` placeholders.
- Backend provides `CatalogMediaController` with single product image upload (`POST /api/v1/products/{productId}/images`) backing `ProductImage` entity linked to `MediaAsset`.

## 8. Legacy Behaviour Identified
- Permanently expanded large black/gray drag-and-drop box on Step 1 form (Reference Image 2 style).
- Multiple empty Add Image tiles occupying the main Step 1 form layout.

## 9. New Target Behaviour Documented (Reference Image 1 Alignment)
- Step 1 displays a compact **Product Image upload card** containing `"Upload Product Image"`.
- Clicking `"Upload Product Image"` opens the floating/overlay **Product Images Manager** panel without navigating away from the wizard or resetting Step 1 form fields.
- Panel contains header (`Product Images`, Close `X`, `Replace Images`), counter (`N / 10`), drag/drop reorder grid, `Primary` badge, `Upload More` tile, and `Image Guidelines` card.

## 10. Backend APIs Reused
- `POST /api/v1/products/{productId}/images` (`EXISTS — REUSE`)

## 11. Backend Gaps (Target Enforced)
- `POST /api/v1/tenant/catalog/media/stage` (`TARGET — IMPLEMENTATION REQUIRED`): Staging media assets for fresh wizard sessions.
- `PUT /api/v1/tenant/catalog/products/{productId}/images/reorder` (`TARGET — IMPLEMENTATION REQUIRED`): Batch reorder and set primary image.
- `DELETE /api/v1/tenant/catalog/products/{productId}/images/{productImageId}` (`TARGET — IMPLEMENTATION REQUIRED`): Delete image and update primary image automatically if primary deleted.

## 12. DB Gaps
- Schema tables `media_assets` and `product_images` already exist (`EXISTS — REUSE`).
- No migration required for tables; partial unique index on primary image and status `STAGED` check constraint verification needed.

## 13. Permission Gaps
- Explicit rule defined: `tenant.products.create` permits image staging/upload during draft product creation; `tenant.products.update` required for modifying published products.

## 14. Flutter Gaps
- Implementation required for `ProductImageUploadCard`, `ProductImagesManagerPanel`, `ProductImageTile`, and `ProductImageGuidelinesCard`.

## 15. Validation Gaps
- Enforced 10-image maximum, 5MB file size limit, and PNG/JPG MIME validation documented cleanly across client and server.

## 16. Test Specification
- Unit tests, widget tests, state machine tests, API contract tests, and integration test scenarios documented in specification.

## 17. Traceability Result
- 100% of UI elements, actions, business rules, endpoints, and DB columns mapped cleanly without ambiguity.

## 18. Remaining Blockers
- None.

## 19. Final Readiness Verdict
**SECOND BRAIN READY FOR PRODUCT IMAGE MANAGER IMPLEMENTATION**
