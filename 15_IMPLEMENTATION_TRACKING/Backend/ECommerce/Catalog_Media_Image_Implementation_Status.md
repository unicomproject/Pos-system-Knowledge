<!-- title: Catalog Media Image Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Catalog Media Image Implementation Status

## Purpose

Track backend implementation status for catalog image upload and media asset
projection used by products, variants, categories, brands, and storefront reads.
This file documents the current Azure Blob/media-asset implementation without
recording secrets.

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | CatalogProduct / Shared Media / ECommerce Storefront |
| Feature | Catalog Media Image Upload And Projection |
| Status | Testing |
| Completed Date | - |
| PR / Commit | - |
| Tests | Unit/integration coverage exists; latest full regression not recorded here |

## Feature Summary

Tenant-authenticated catalog media APIs upload product images, category images,
and brand logos. Uploaded files are stored through the media storage abstraction,
recorded as `media_assets`, and projected into catalog/storefront read models
through `product_images`, category image references, brand logo references, and
storefront banner media references.

## API Surface

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| POST | `/api/v1/products/{productId}/images` | Upload product or variant image | `TenantOnly` plus media permission checks |
| POST | `/api/v1/categories/{categoryId}/image` | Upload category image | `TenantOnly` plus media permission checks |
| POST | `/api/v1/brands/{brandId}/logo` | Upload brand logo | `TenantOnly` plus media permission checks |

## Backend Files Covered

```text
src/E_POS.Api/Controllers/V1/Tenant/CatalogProduct/CatalogMediaController.cs
src/E_POS.Application/Modules/Tenant/CatalogProduct/Contracts/ICatalogMediaService.cs
src/E_POS.Application/Modules/Tenant/CatalogProduct/Contracts/ICatalogMediaRepository.cs
src/E_POS.Application/Modules/Tenant/CatalogProduct/Services/CatalogMediaService.cs
src/E_POS.Application/Modules/Shared/Media/
src/E_POS.Infrastructure/Modules/Shared/Media/
src/E_POS.Infrastructure/Modules/Shared/Storage/Services/AzureBlobSasTokenProvider.cs
src/E_POS.Infrastructure/Modules/Tenant/CatalogProduct/Repositories/CatalogMediaRepository.cs
src/E_POS.Infrastructure/Modules/ECommerce/Storefront/Repositories/
tests/E_POS.UnitTests/CatalogProduct/CatalogMediaServiceTests.cs
tests/E_POS.UnitTests/CatalogProduct/CatalogMediaServicePhase4ETests.cs
tests/E_POS.UnitTests/CatalogProduct/DevelopmentMediaAssetsSeedTests.cs
tests/E_POS.IntegrationTests/CatalogProduct/TenantAdminProductImageProjectionTests.cs
tests/E_POS.IntegrationTests/CatalogProduct/CategoryBrandMediaProjectionTests.cs
tests/E_POS.UnitTests/Shared/Media/MediaUrlResolverTests.cs
tests/E_POS.UnitTests/Shared/Media/LegacyMediaAssetFactoryTests.cs
```

## Access Checks Implemented

| Check | Status | Notes |
|---|---|---|
| Authentication | Done | `TenantOnly` controller policy. |
| Tenant status | Done | Tenant request context and repository filters. |
| Feature entitlement | Needs review | Confirm catalog/online-store entitlement split for upload versus storefront projection. |
| Permission | Done | Media service returns `media.permission_denied` when access is missing. |
| Tenant isolation | Done | Media assets and linked catalog entities are tenant scoped. |
| File validation | Partial | Controller checks file exists; service tests cover deeper upload rules. |

## Database Tables Used

| Table | Usage |
|---|---|
| `media_assets` | Canonical uploaded media metadata and public URL/storage key. |
| `product_images` | Product/variant image links and display order. |
| `products` / `product_variants` | Upload target validation. |
| `categories` | Category image reference. |
| `brands` | Brand logo reference. |
| `storefront_banners` | Storefront banner media projection. |

## Storage Rules

- Azure Blob configuration keys must not be written into Second Brain with real values.
- Backend stores object metadata and storage keys; raw files live in object storage.
- Storefront reads prefer active `media_assets.public_url` where linked and available.
- Legacy image columns should remain only as documented migration compatibility until safe removal is complete.

## Test Result Summary

Media upload/projection unit and integration tests exist. This status remains
`Testing` because latest full regression, deployment migration status, and final
legacy-column cleanup evidence are not recorded in this file.

## Known Follow-up

- Record latest catalog media unit/integration/full regression results.
- Verify real Azure Blob upload manually with non-secret configuration.
- Confirm permission/entitlement mapping for product, category, and brand image uploads.
- Confirm legacy media column removal status after migrations are safely applied.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/11_Product_Media_Attributes_Channel_Visibility/01_Module_Overview]]
- [[../../../06_DATABASE_KNOWLEDGE/Tables/11_Product_Mapping_Media_Attributes_And_Channel_Visibility_UPDATED]]
- [[Storefront_Browse_Implementation_Status]]
- [[../../Online_Store/01_ECommerce_Implementation_Status]]