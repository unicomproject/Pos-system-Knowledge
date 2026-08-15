<!-- title: Product Core Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-11 -->

# Product Core Technical Contract

## Purpose

Defines the technical implementation contract for `Product_Core` in the OneVerz POS MVP scope.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/tenant-admin/products`, `/api/v1/tenant-admin/products/draft`, `/api/v1/tenant-admin/products/{id}/setup`, `/api/v1/pos/products`, `/api/v1/storefront/products` |
| Draft API Pipeline | Single `PUT /api/v1/tenant-admin/products/{productId}/draft` endpoint supporting polymorphic step graph payloads (`currentSetupStep=1..8`). |
| Request format | Typed request DTOs (`SaveProductDraftRequest`); step-specific graphs passed via polymorphic payload structures. |
| Response format | Typed `ProductDraftResponse` and `ProductSetupWizardDto` with full setup projections. |
| Tenant context | Resolved server-side for tenant-owned records. |

## Database Contract

| Table | Role |
|---|---|
| `products` | Stores parent product records, setup steps (`current_setup_step`), status, and row version. |
| `product_variants` | Stores sellable variant details, SKU, `variant_name` (`displayLabel`), `is_sellable` (`included`), `option_combination_hash` (`char(64)`), and UOM links for VARIANT products. |
| `product_options` | Stores product option headers owned by tenant. |
| `product_option_values` | Stores product option values owned by tenant (`image_media_asset_id`). |
| `product_variant_option_values` | Maps `product_variants` to `product_option_values`. |

> [!NOTE]
> Database Migration Required: **NO**. All required tables and columns already exist in EF Core ModelSnapshot.

## Related Specifications

- [[../12_Product_Option_Variant_Configuration/Tenant_Admin_Product_Variant_Configuration_Specification]]
- [[Tenant_Admin_Product_Type_Tracking_Specification]]
- [[Tenant_Admin_Product_Units_Pack_Conversion_Specification]]
- [[05_Tenant_Admin_Add_Product_8_Step_Contract]]
