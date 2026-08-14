<!-- title: Product Option Templates & Variant Configuration Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

# Product Option Templates & Variant Configuration Technical Contract

## Purpose

Defines the implementation contract for `Product_Option_Variant_Configuration`. This contract is aligned with OneVerz POS MVP scope and the canonical Step 4 specification.

## API Contract

| Area | Contract |
|---|---|
| API Endpoints | `PUT /api/v1/tenant-admin/products/{productId}/draft`, `GET /api/v1/tenant-admin/products/{productId}/setup`, `GET /api/v1/tenant-admin/products/create-options` |
| Create Options Extension | Extended `TenantAdminProductCreateOptionsResponse` so `VariantOptionTemplates` includes nested `Values` array (`IReadOnlyList<TenantAdminProductVariantOptionTemplateValueResponse>`) |
| Request format | Typed `SaveProductDraftRequest` with `variantConfiguration` payload (`currentSetupStep = 4`) |
| Response format | Typed `ProductDraftResponse` / `ProductSetupWizardDto` with full `variantConfiguration` graph |
| Error format | Standard API error response with field-level validation errors |
| Tenant context | Resolved server-side from authenticated JWT claims (`TenantId`) |

## Database Contract

| Table | Role | Column Details |
|---|---|---|
| `product_option_templates` | Master option templates | `id`, `template_code`, `template_name`, `option_type` |
| `product_option_template_values` | Master option values | `id`, `product_option_template_id`, `value_code`, `value_name` |
| `product_options` | Tenant product options | `id`, `tenant_id`, `product_id`, `option_code`, `option_name` |
| `product_option_values` | Tenant product option values | `id`, `tenant_id`, `product_option_id`, `image_media_asset_id`, `value_code`, `value_name` |
| `product_variants` | Sellable product variants | `id`, `tenant_id`, `product_id`, `variant_code`, `variant_name` (`displayLabel`), `is_sellable` (`included`), `option_combination_hash` (`char(64)`), `stock_uom_id`, `sales_uom_id`, `status` |
| `product_variant_option_values` | Variant-value join table | `tenant_id`, `product_variant_id`, `product_option_value_id` |
| `product_images` | Exact variant image overrides | `id`, `tenant_id`, `product_id`, `product_variant_id`, `media_asset_id` |

> [!NOTE]
> Database Migration Required: **NO**. All required tables and columns already exist in EF Core ModelSnapshot.

## Permission & Entitlement Contract

- Entitlement: `product_catalog` (Module: `product_management`).
- Permissions:
  - Draft Create: `catalog.products.create` + `catalog.variants.manage`
  - Draft Update: `catalog.products.update` + `catalog.variants.manage`
  - Image Override: `catalog.product_media.manage`
  - Setup Resume: `catalog.products.view`

## Technical Specifications

- [[Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/12_Product_Option_Variant_Configuration/02_Functional_Rules]]
