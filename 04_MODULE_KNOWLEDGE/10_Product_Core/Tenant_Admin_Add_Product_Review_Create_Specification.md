# Tenant Admin Add Product Review & Create Specification

## 1. Overview
This document serves as the canonical source of truth for the Tenant Admin Add Product **Step 7: Review & Create**. It replaces all older 8-step wizard references and "Channel Visibility" standalone step concepts. The wizard is strictly 7 steps.

## 2. Source of Truth
The Review & Create screen is a **data-driven projection** of the product draft persisted on the backend.
- **Backend-Authoritative:** Review snapshot data is loaded from the backend. The frontend must not fabricate validation logic or hardcode any sample values.
- **Actual Persisted Values Only:** Only fields that have been saved in Steps 1-6 are displayed. Skipped steps or not-applicable structures do not display fake data.

## 3. Review Sections Rendering Rules

### A. Basic Details
Displays fields from Step 1:
- Product Name, Short Name, Internal Product Code
- Category, Brand
- Descriptions
- Product Images
- Channel Visibility (POS, Online Store)

### B. Product Type & Tracking
Displays fields from Step 2:
- Product Structure (Simple, Variant, Bundle)
- Track Inventory (Yes/No)
- Batch Tracking, Expiry Tracking, Serial Tracking
- POS Sellable
- Desired Publish Status

### C. Units & Pack Conversion
Displays fields from Step 3 (if applicable):
- Base Unit, Selling Unit, Purchase Unit, Outer Pack Unit
- Conversion factors, decimal quantity configuration

### D. Product Configuration
Displays fields from Step 4 (structure-specific):
- **Variant:** Options, values, included variant count, labels, default info, image associations.
- **Bundle:** Components, required quantities, UOMs.

### E. Barcode & SKU
Displays fields from Step 5:
- Saved identifiers for the sellable variant(s).

### F. Pricing & Tax
Displays fields from Step 6 (Simplified Pricing & Tax):
- Cost Price, Standard Selling Price, Discount Price
- Tax Name, Tax Rate, Tax Exclusive

## 4. Edit Flow
Each Review section can trigger an `Edit` action:
1. User clicks `Edit`.
2. Frontend opens corresponding wizard step.
3. User edits and saves changes.
4. Backend persists data and frontend reloads authoritative Review snapshot.

## 5. Functional Requirements
- **FR-RC-001:** Review page loads persisted wizard data.
- **FR-RC-002:** Only applicable/current configured fields render.
- **FR-RC-003:** No screenshot/sample value is hardcoded.
- **FR-RC-004:** Review is product-structure aware.
- **FR-RC-005:** Edit action returns to corresponding wizard step.
- **FR-RC-006:** Saved edits reload authoritative Review state.
- **FR-RC-007:** Backend calculates final validation state.
- **FR-RC-008:** Create Product is disabled/blocked when required validation fails.
- **FR-RC-009:** Create Product publishes the existing draft rather than creating a second product row.
- **FR-RC-010:** Publish performs full server-side revalidation.
- **FR-RC-011:** Publish is transactional.
- **FR-RC-012:** Publish applies configured ACTIVE/INACTIVE final status.
- **FR-RC-013:** Publish records publication/audit metadata.
- **FR-RC-014:** Success redirects to Product List.
- **FR-RC-015:** Product List refreshes from backend.
- **FR-RC-016:** Failure preserves draft and user data.
- **FR-RC-017:** Concurrency conflict does not overwrite newer state.
- **FR-RC-018:** Tenant isolation is mandatory.

## 6. Business Rules
- **BR-RC-001:** Review is read-only except explicit Edit actions.
- **BR-RC-002:** Review data source is persisted wizard state.
- **BR-RC-003:** No Review-only product copy exists.
- **BR-RC-004:** Not-applicable step data cannot block publication.
- **BR-RC-005:** Required applicable step data must block publication if invalid.
- **BR-RC-006:** All uniqueness rules are rechecked at publish time.
- **BR-RC-007:** Tax data must still reference a valid tenant tax configuration.
- **BR-RC-008:** Referenced category/brand/UOM/media/variant/component records must still be valid.
- **BR-RC-009:** Product must belong to the authenticated tenant.
- **BR-RC-010:** Successful publish keeps the same Product ID.
- **BR-RC-011:** Successful publish creates exactly one final product lifecycle transition.
- **BR-RC-012:** Product List is rebuilt/read from persisted backend state.
- **BR-RC-013:** No hardcoded Review value is allowed.
- **BR-RC-014:** 7-step workflow is authoritative.

## 7. Non-Functional Requirements (NFRs)
- **Transaction Integrity:** Final publication is atomic.
- **Optimistic Concurrency:** Uses `rowVersion` / `expectedRowVersion`.
- **Tenant Isolation:** Every read/write is scoped by `tenant_id`.
- **Authorization:** Permissions enforced server-side.
- **Retry Safety:** Repeated submission does not duplicate a product.
- **Performance:** Review projection uses optimized queries.
- **Auditability:** Successful creation writes a canonical product audit event.

## 8. Flutter Implementation Contract
```text
UI -> Controller/Notifier -> Repository -> API Service -> Backend
```
- **States:** `ProductReviewState`, `ProductReviewSnapshot`, `ProductReviewSection`, `ProductReviewValidationItem`, `ProductPublishState`.
- **Responsibilities:** `loadReview`, `refreshReview`, `openSectionForEdit`, `returnFromEdit`, `publishProduct`, `handleValidationFailure`, `handleConcurrencyConflict`, `handlePermissionFailure`, `handlePublishSuccess`.
- **Rule:** Review widget must not calculate validation status or inject sample values.

## 9. API Contract
- **Review Snapshot API:** `GET /api/v1/tenant-admin/products/{productId}/setup` (Returns `ProductSetupWizardDto` with validation checklist)
- **Publish API:** `POST /api/v1/tenant-admin/products/{productId}/publish`
  - Payload: `{ "expectedRowVersion": <number> }`
  - Permission: `catalog.products.publish`

## 10. Database Graph
- Master: `products`
- Mapping: `product_categories`
- Units: `product_unit_settings`, `product_unit_conversions`
- Variants: `product_variants`, `product_options`, `product_option_values`, `product_variant_option_values`
- Bundle: `combo_definitions`, `combo_components`
- Identifiers: `product_barcodes`
- Images: `media_assets`, `product_images`
- Channel: `product_channel_visibility`
- Pricing: `price_lists`, `price_list_items`
- Tax: `product_tax_assignments`, `tax_classes`, `tax_class_rates`, `tax_rates`
- **Rule:** No Review-specific persistence table.

## 11. Field-to-Table Matrix
| Review Display Field | Source Step | Request Attribute | Backend DTO | Entity | Table.Column | Review DTO Field | Product List Effect |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Product Name | 1 | ProductName | SaveProductDraftRequest | Product | products.product_name | ProductName | Display Name |
| Product Code | 1 | ProductCode | SaveProductDraftRequest | Product | products.product_code | ProductCode | Code Search |
| Category | 1 | CategoryId | SaveProductDraftRequest | Category | categories.category_name | CategoryName | Category Filter |
| Brand | 1 | BrandId | SaveProductDraftRequest | Brand | brands.brand_name | BrandName | Brand Filter |
| Product Structure | 2 | ProductStructure | SaveProductDraftRequest | Product | products.product_structure | ProductStructure | Type Icon |
| Track Inventory | 2 | TrackInventory | SaveProductDraftRequest | ProductInventorySetting | product_inventory_settings.is_stock_tracked | TrackInventory | Stock Visibility |
| Channel Visibility | 1 | PosSellable/AllowOnlineSale | SaveProductDraftRequest | ProductChannelVisibility | product_channel_visibility | PosSellable | Sales Check |
| Unit Fields | 3 | UnitModel etc. | SaveProductDraftRequest | ProductUnitSetting | product_unit_settings.* | BaseUnitName etc. | UOM Display |
| Variant/Bundle Info | 4 | VariantConfiguration | SaveProductDraftRequest | ProductVariant | product_variants.* | VariantConfiguration | Variant Count |
| SKU | 5 | BarcodeSkuConfiguration | SaveProductDraftRequest | ProductVariant | product_variants.sku | Sku | SKU Search |
| Barcode | 5 | BarcodeSkuConfiguration | SaveProductDraftRequest | ProductBarcode | product_barcodes.barcode | Barcode | Barcode Scan |
| Cost Price | 6 | PricingTax.CostPrice | SaveProductDraftRequest | Product | products.reference_cost_price | PricingTax.CostPrice | Cost Calc |
| Standard Selling Price | 6 | PricingTax.StandardSellingPrice | SaveProductDraftRequest | PriceListItem | price_list_items.compare_at_price | PricingTax.StandardSellingPrice | Price Display |
| Discount Price | 6 | PricingTax.DiscountPrice | SaveProductDraftRequest | PriceListItem | price_list_items.selling_price | PricingTax.DiscountPrice | Active Price |
| Tax Name | 6 | PricingTax.TaxClassId | SaveProductDraftRequest | TaxClass | tax_classes.tax_class_name | PricingTax.TaxName | Tax Details |
| Tax Rate | 6 | PricingTax.TaxClassId | SaveProductDraftRequest | TaxRate | tax_rates.rate_percent | PricingTax.TaxRatePercentage | Tax Calc |
| Tax Exclusive | 6 | PricingTax.TaxExclusive | SaveProductDraftRequest | N/A | Calculated | PricingTax.TaxExclusive | Price Type |
| Desired Product Status | 2 | DesiredPublishActive | SaveProductDraftRequest | Product | products.desired_publish_status | DesiredPublishStatus | Publish State |

## 12. Test Contract
- **Review Rendering:** Asserts structure-specific rendering, no sample values leak, skipped steps hide.
- **Review Edit:** Asserts edit/cancel behavior against `GetSetupAsync`.
- **Publish Validation:** Asserts missing fields, duplicate identifiers, invalid graphs return 400/409.
- **Publish Transaction:** Asserts single row update, no duplicate creation, `published_at` set.
- **Rollback:** Asserts transactional failure leaves product as DRAFT.
- **Permission & Concurrency:** Asserts 403 and 409 responses correctly.
- **Product List Re-hydration:** Asserts Product List fetches updated records from DB post-publish.
