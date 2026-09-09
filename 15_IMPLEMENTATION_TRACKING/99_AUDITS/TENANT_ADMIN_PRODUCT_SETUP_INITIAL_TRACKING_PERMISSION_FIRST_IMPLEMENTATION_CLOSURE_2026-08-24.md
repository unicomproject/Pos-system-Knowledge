<!-- title: Tenant Admin Product Setup Initial Tracking Permission-First Implementation Closure -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-24 -->

# Tenant Admin Product Setup Initial Tracking + Permission-First Implementation Closure

## Final Verdict

**PRODUCT SETUP INITIAL TRACKING IMPLEMENTATION STILL HAS BLOCKERS**

Permission-first Product Setup and Step 1 Initial Tracking were implemented in backend, migration, and Flutter against the approved Second Brain contract. Focused CatalogProduct unit tests and focused Flutter wizard/tracking tests passed. Live PostgreSQL E2E, persona permission E2E, tablet 1024×768 verification, and scenarios A–G were not executed to completion in this session, so COMPLETE is not claimed.

---

## Source audited

Inspected current Unified Commerce and Nytroz POS App source before and during implementation, including:

- `ProductWizardAccessPolicy`
- `TenantAdminProductService` / `TenantAdminProductsController`
- Draft DTOs, wizard-create DTOs, validators, repositories
- `ProductConstants` / `TenantAdminProductPermissions` / `TenantPermissionAliases`
- Flutter `AddProductWizardState`, controller, Step 1–7 widgets, mapper, access checker
- EF model and PostgreSQL naming conventions

Historical risks confirmed in CURRENT source at start of implementation:

- Dual `tenant.products.*` vs `catalog.products.*` authorization
- Policy Step 4 always required variants.manage
- No Initial Tracking DTO/table
- `Math.Clamp(..., 1, 8)` leftover
- Flutter Save Draft local-only; Step 7 uses `POST wizard-create`
- No `POST {id}/publish` originally

---

## Second Brain contracts used

- `00_START_HERE/Current_Source_Of_Truth.md`
- `05_Tenant_Admin_Add_Product_7_Step_Contract.md`
- `Tenant_Admin_Add_Product_Step1_Initial_Tracking_Details_Specification.md`
- Product Type & Tracking, Draft Lifecycle, Review & Create, Barcode & SKU, Units & Pack, Variant, Bundle, Media, Channel, Pricing & Tax
- Inventory tracking tables
- `Tenant_Admin_Add_Product_7_Step_Permission_Matrix.md`
- `API_Authorization_Rules.md`, `Permission_Code_List.md`, `Feature_Entitlement_Matrix.md`
- `2026-08-24_Tenant_Admin_Product_Setup_Permission_NFR_API_DB_Contract_Closure_Audit.md`

Phase 0 contract verdict was:

`PRODUCT SETUP CONTRACT READY FOR PERMISSION-FIRST IMPLEMENTATION`

Implementation proceeded.

---

## Permission discrepancies found

| Finding | Resolution |
|---|---|
| Policy and some CRUD checks used `tenant.products.*` | Wizard policy now checks `catalog.*` only |
| JWT claims may still carry legacy codes | `TenantRequestContext.HasPermission` expands `tenant.products.*` → `catalog.products.*` and `tax.classes.view` → `pricing.tax_classes.view` |
| Step 4 always required `catalog.variants.manage` | Required only for VARIANT mutation / VARIANT structure |
| Bundle required variants.manage | Bundle uses `catalog.combo_components.manage` |
| Generic draft authorized by `currentSetupStep` only | Policy inspects populated subgraphs (pricing, barcode, variant, bundle, cost, tracking, assignment) |
| Flutter Add Product gated by create only | Start eligibility now create + barcodes.manage + pricing.manage + tax lookup |
| Cost always shown on Review | Hidden when `catalog.product_cost.view` is missing |

---

## Legacy permission codes removed/mapped

Not deleted from the seeded catalog.

Compatibility boundary (one-way):

- `tenant.products.view|create|update|delete` → `catalog.products.*`
- `tax.classes.view` / `tax.rates.view` → `pricing.tax_classes.view` / `pricing.tax_rates.view`

Application authorization decisions consume canonical `catalog.*` / `pricing.*` codes via `HasPermission` expansion.

Flutter aliases added for specialized Product Setup codes (`publish`, media, channels, variants, combo, barcodes, pricing, cost, tax lookup).

---

## Backend files modified

Primary:

- `ProductConstants.cs`
- `TenantPermissionAliases.cs`
- `TenantRequestContext.cs`
- `ProductWizardAccessPolicy.cs`
- `ProductSetupInitialTracking.cs` (new)
- `ProductSetupInitialTrackingRules.cs` (new)
- `ProductSetupInitialTrackingConfiguration.cs` (new)
- `TenantAdminProductWizardDtos.cs`
- `SaveProductDraftCommand.cs`
- `TenantAdminWizardProductCreateRequest.cs`
- `TenantAdminProductService.cs`
- `ITenantAdminProductService.cs`
- `TenantAdminProductRequestValidator.cs`
- `TenantAdminProductsController.cs`
- `EPosDbContext.cs`
- `TenantAdminProductRepository.Wizard.cs`
- `TenantAdminProductRepository.WizardCreate.cs`
- `TenantAdminProductRepository.InitialTracking.cs` (new)
- `20260824095742_AddProductSetupInitialTracking.cs` (new)

---

## Flutter files modified

- `tenant_admin_access_codes.dart`
- `tenant_admin_permission_aliases.dart`
- `tenant_admin_access_checker.dart`
- `product_wizard_capabilities.dart` (new)
- `add_product_wizard_state.dart` + codec
- `save_product_draft_request_dto.dart`
- `wizard_product_create_mapper.dart`
- `add_product_wizard_controller.dart`
- `add_product_wizard.dart`
- `add_product_screen.dart`
- `step_1` form + `product_initial_tracking_card.dart` (new)
- `product_type_tracking.dart`
- `step_7_review_create.dart`

---

## Migration created

`20260824095742_AddProductSetupInitialTracking`

Table: `product_setup_initial_tracking`

Verified columns: tenant/product FKs, nullable batch/expiry/serial, assigned variant FK, clear-confirmed, consumed, audit, `row_version` default 1, unique `(tenant_id, product_id)` and `(tenant_id, id)`, cascade delete with product, restrict on variant/tenant/users.

`dotnet ef migrations has-pending-model-changes` after generation: **No changes have been made to the model since the last migration.**

Migration is generated. It was **not** applied to a live PostgreSQL instance in this session.

---

## API DTO changes

Request (`SaveProductDraftRequest` / wizard-create):

- `InitialBatchNumber` (`string?`)
- `InitialExpiryDate` (`DateOnly?`)
- `InitialSerialNumber` (`string?`)
- `ConfirmClearIncompatibleInitialTracking` (`bool`)
- `InitialTrackingAssignedVariantId` (`Guid?`)

Response / setup:

- same identity fields plus assigned variant id

New: `PublishProductRequest` and `POST /api/v1/tenant/products/{id}/publish`

Flutter live create path remains `POST wizard-create` (pre-existing).

---

## Step 1 fields implemented

Optional Initial Batch, Expiry, Serial. Trim/max 100/150. Empty → null. Save Draft and Save & Continue do not require them. Not stored on Product master.

---

## Step 2 reconciliation implemented

Backend `ProductSetupInitialTrackingRules.EvaluateClear` plus confirmation flag.

Flutter confirmation dialog; local values are not replaced until the user confirms. `confirmClearIncompatibleInitialTracking` is sent on wizard-create after confirm.

---

## Step 7 publish implemented

Same transaction as product create/publish:

- upsert `product_setup_initial_tracking`
- create `product_batches` or `serial_numbers` identity-only (`status = ACTIVE`, no `FirstReceivedAt` / `ReceivedAt`, no inventory balance, no stock movement)
- mark row `consumed_at`
- uniqueness 409
- VARIANT assignment: same tenant/product, sellable, non-deleted; auto-select if exactly one valid variant
- BUNDLE remaining values: `product.initial_tracking.bundle_parent_not_supported`

---

## Permission matrix implementation result

Implemented in `ProductWizardAccessPolicy` + sanitization:

- Product create/update (catalog)
- Media IDs without media.manage: ignored on draft save
- Channels without channel.manage: ignored (create defaults POS ON / Online OFF)
- VARIANT mutation: variants.manage
- BUNDLE mutation: combo_components.manage
- Barcode subgraph: barcodes.manage
- Pricing subgraph: product_pricing.manage
- Cost present without cost.view: 403
- Non-empty Initial Tracking / advanced toggles: `inventory_tracking` entitlement
- Publish: `catalog.products.publish` + subgraph recheck
- Resume GET setup: view OR create OR update
- Cost redacted on GET setup without cost.view

Payload bypass: Step 1 + `PricingTax` without pricing.manage → 403 (unit test added).

---

## Entitlement result

- `product_catalog` remains Product Setup baseline
- `inventory_tracking` required for advanced tracking and non-empty Initial Tracking
- `inventory.stock.adjust` is **not** required for identity-only draft/publish

---

## API result

Controller maps:

- 403 `product.permission_denied` / `product.entitlement_denied`
- 400 tracking confirmation / validation codes
- 409 duplicate batch/serial and concurrency
- 404 `product.not_found`

New publish endpoint exists. Full HTTP matrix against a live API host was not run.

---

## DB result

Schema matches Second Brain Option B. No Product master identity columns. Unique 1:1 tracking row. Migration not applied live.

---

## Flutter result

- Central `ProductWizardCapabilities`
- Step 1 compact Initial Tracking Details card
- Helper text: `Tracking behaviour will be configured in the next step.`
- Step 2 summary + confirmation
- Step 7 compatible values + VARIANT assignment selector + cost redaction
- Canonical wizard-create mapper includes Initial Tracking
- Wizard remains **local-only until Step 7 wizard-create** (pre-existing architecture)

---

## Unit tests

CatalogProduct filter: **148 passed** (includes new tracking rules tests and payload/entitlement policy tests).

Legacy `tenant.products.create` create-options test updated to the approved compatibility mapping (now succeeds).

---

## API tests

`E_POS.ApiTests` **builds**. Focused HTTP tracking/permission cases were not added/run as a live suite.

---

## PostgreSQL tests

Existing `WizardProductCreatePostgreSqlTests` was not extended with Initial Tracking assertions. No new live PG tests were executed.

---

## Flutter tests

Passed in this session:

- `product_setup_initial_tracking_test.dart` (state/codec/mapper/reconciliation)
- `add_product_wizard_step4_test.dart`
- `product_type_tracking_widget_test.dart`
- `add_product_wizard_controller_test.dart`

Widget/tablet 1024×768 overflow tests for the new Step 1 card were not added.

---

## 1024×768 result

Not verified in a running tablet viewport. The card is compact and added below existing Step 1 fields inside the current SingleChildScrollView. Visual overflow remains a blocker for COMPLETE.

---

## E2E scenarios

| Scenario | Status |
|---|---|
| A SIMPLE quantity-only | Not run live |
| B SIMPLE Batch | Not run live |
| C SIMPLE Batch + Expiry | Not run live |
| D SIMPLE Serial | Not run live |
| E VARIANT Batch + assigned Variant | Not run live |
| F VARIANT Serial + assigned Variant | Not run live |
| G BUNDLE with Step 1 values requiring clear | Not run live |
| Permission personas / revocation | Not run live |

---

## Remaining gaps

1. Apply migration to the target PostgreSQL and add PG integration tests (upsert, uniqueness, tenant isolation, consume, rollback, no inventory balance/movement).
2. Execute scenarios A–G Flutter → API → DB → Product List.
3. Permission persona E2E (creator-only, variant/barcode/pricing managers, no cost view, publisher, revoked grants).
4. Tablet 1024×768 verification of Step 1 after the new card.
5. Flutter Steps 1–6 still do not call remote draft APIs (pre-existing). Tracking is persisted at wizard-create / draft endpoints when those APIs are used.
6. VARIANT assignment during first-time wizard-create cannot send a server variant id until variants exist; backend auto-assigns when exactly one valid variant exists.
7. Bundle Step 4 composition UI remains a placeholder (pre-existing).
8. Specialized catalog permissions must be seeded/granted to tenant roles or start eligibility will hide Add Product.

---

## Second Brain synchronized

- `Current_Source_Of_Truth.md` updated with implementation status and this closure link.
- Approved architecture was **not** changed to match incomplete E2E.

---

## Final Verdict

**PRODUCT SETUP INITIAL TRACKING IMPLEMENTATION STILL HAS BLOCKERS**
