<!-- title: Brand Collection CRUD Implementation Status -->
<!-- status: Completed with Brand MVP extensions 2026-07-28 -->
<!-- system: OneVerz POS MVP -->
<!-- module: CatalogProduct -->
<!-- feature: Brand CRUD / Collection CRUD / Brand MVP fields -->
<!-- last_updated: 2026-07-28 -->

# Brand CRUD / Collection CRUD Implementation Status

## Implementation Status

| Item | Value |
|---|---|
| Feature | Brand CRUD / Collection CRUD + Brand MVP fields |
| Module | CatalogProduct |
| Platform | Backend |
| Status | Brand MVP fields added 2026-07-28 (Sort Order, Product Count; Logo already present) |
| Migration | `20260728103522_AddBrandSortOrder` |
| Tests | Brand unit/API/integration targeted suites passed |

## Implemented Scope

- Tenant-protected Brand CRUD under `/api/v1/brands`.
- Brand logo via `LogoMediaAssetId` + `POST /api/v1/brands/{brandId}/logo`.
- Brand list/detail responses include `description`, `logoUrl`, `logoMediaAssetId`, `sortOrder`, `productCount`, `status`, timestamps.
- Create/update accept `sortOrder` (default 0; negative rejected).
- Product count calculated from `products.brand_id` for same tenant, excluding `DELETED` products (not a persisted column).
- List ordered by `SortOrder` then `BrandCode`.
- Permissions: `catalog.brands.view|create|update|delete|manage`.
- Soft delete brands by status `DELETED`.

## Supersedes Older Note Text

Earlier “Not Included” claims that product had no brand relationship and brands had no image/media are **outdated**. Current code has optional `Product.BrandId` and Brand logo media.

## Collection Scope (unchanged summary)

- Collection CRUD under `/api/v1/collections` remains as previously completed.

## Related

- [[Tenant_Admin_Settings_Layout_Implementation_Status]]
- [[Brands_Management_Screen_Specification]]
- [[Permission_Code_List]]


## Verification update 2026-07-29 (Tenant Admin shell + Brands MVP backend)

### Backend files changed
- `CatalogMediaController.UploadBrandLogo` — after successful media upload, returns `{ data: BrandResponse }` (Flutter `BrandDto` contract).
- `BrandService.GetByIdAsync` — read access allows view **or** update **or** manage (logo upload reload).
- `CatalogMediaService` — storage upload failures return `media.storage_unavailable` (HTTP 503) instead of opaque 500.
- `OneverceAdminAndTillSeedData` — documents local password as `Admin@12345` (shared with platform admin seed hash).
- Tests: `CatalogMediaBrandLogoControllerTests`, `OneverceAdminPasswordSeedTests`.

### Product Count rule (verified)
Tenant-scoped `products.brand_id` matches; includes ACTIVE + INACTIVE; excludes `DELETED`. Not stored on brands.

### Media / logo contract (verified live)
- `POST /api/v1/brands/{id}/logo` multipart `file`
- Response envelope `{ data: BrandResponse }` with `id`, `brandName`, `logoUrl`, `logoMediaAssetId`, `sortOrder`, `productCount`, `status`
- Replace upload verified HTTP 200
- Local Azurite requires `--skipApiVersionCheck` with current Azure.Storage.Blobs SDK

### Real API verification (Oneverce tenant)
- Context: 200 — tenant/user/roles/outlets/permissions/subscription/timezone/currency/locale
- Brand list/search/create/update/delete/duplicate-code: verified
- SortOrder + ProductCount: verified
- Unauthorized brands: 401
- Migration pending model changes: none

### Remaining gaps
- Context does **not** include tills / till-session / notification unread (Flutter uses separate till providers; notification count still FE placeholder).
- Seeded Oneverce subscription status `NONE` → `enabledFeatureCodes` empty (Online Store entitlement empty until subscription features are seeded).
- Top-level Inventory vs Products→Inventory remain one inventory backend capability (FE navigation distinction only).
