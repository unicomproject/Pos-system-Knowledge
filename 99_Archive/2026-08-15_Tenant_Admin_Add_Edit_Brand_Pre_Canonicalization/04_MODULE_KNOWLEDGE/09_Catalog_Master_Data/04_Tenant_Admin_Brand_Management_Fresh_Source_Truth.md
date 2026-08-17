<!-- status: Active canonical source truth -->
<!-- last_updated: 2026-08-12 -->
# Tenant Admin Brand Management — Fresh Source Truth

## Baseline and verdict

Second Brain `main@4d8918d`; Flutter `main@5d9eb91`; Backend `suganya/Category@808b73e`. Previous Second Brain reliability: LOW.

| Area | Current status |
|---|---|
| Frontend | NOT READY |
| Backend | PARTIALLY READY |
| Database | NOT READY |
| API | NOT READY |
| Permissions | PARTIALLY READY |
| Responsive | NOT READY |
| NFR | PARTIALLY READY |
| Tests | NOT READY |
| Overall | NOT READY |

## Verified existing source

- Tenant-protected CRUD at `/api/v1/brands`; tenant-filtered list/detail/update/delete, Name+Code server search, bounded paging, uppercase code normalization, tenant code uniqueness, ACTIVE/INACTIVE writes and DELETED soft delete.
- Composite tenant-safe Brand-to-media FK and Brand logo upload with MIME/extension/signature checking and replacement cleanup.
- Flutter data/domain layers, search request, form field order, Description counter, SortOrder UI validation, image preview and CRUD permission visibility.
- Black/white/orange sidebar and approved Product submenu.

## Gap register

| ID | Priority | Current source | Target/status |
|---|---|---|---|
| BRAND-P0-001 | P0 | Edit uses list summary; detail response omits Description; save can overwrite it with null. | Full detail before edit; preserve Description/SortOrder. TO BE IMPLEMENTED. |
| BRAND-P0-002 | P0 | Backend Name validator max 200; DB `varchar(150)`. | Required/trim/max 150 everywhere. TO BE IMPLEMENTED. |
| BRAND-P0-003 | P0 | nullable `Product.BrandId`; service tenant check only; no DB FK/index. | `(tenant_id,brand_id)` FK to Brands, Restrict, index, safe preflight. TO BE IMPLEMENTED. |
| BRAND-P1-001 | P1 | Desktop modal/dark overlay. | Continuous two-region workspace. |
| BRAND-P1-002 | P1 | SortOrder only in Flutter concept; backend/DB/migration absent. | End-to-end integer default 0/check >=0/order. |
| BRAND-P1-003 | P1 | ProductCount absent; Flutter defaults missing data to zero. | Set-based server projection; never stored. |
| BRAND-P1-004 | P1 | selection/detail/no-selection state absent. | `selectedBrandId` journey and regional loading. |
| BRAND-P1-005 | P1 | Flutter fixed page 1/50; no pagination UI. | initial size 10 and target footer. |
| BRAND-P1-006 | P1 | mutation invalidates provider not watched by screen. | one authoritative list state/refetch. |
| BRAND-P1-007 | P1 | upload Update/Manage then response reload View/Manage. | internal reload without unrelated View requirement. |
| BRAND-P1-008 | P1 | shared media accepts JPEG/PNG/WebP up to 5 MB. | Brand boundary JPEG/PNG max 2 MB. |
| BRAND-P1-009 | P1 | footer treats Brand as Settings-active. | Settings inactive; Product/Brand active. |
| BRAND-P1-010 | P1 | profile update then image upload is non-atomic. | explicit partial-success UX/recovery. |
| BRAND-P2-001 | P2 | table has Sort Order; default alignment/intrinsic sizing. | exact seven centered proportional columns. |
| BRAND-P2-002 | P2 | search has no debounce/stale protection. | canonical debounce/page reset/cancellation. |
| BRAND-P2-003 | P2 | semantics/focus/touch/text-scale coverage incomplete. | accessibility contract and tests. |
| BRAND-P2-004 | P2 | active documentation contained false implementation claims. | this reconciled contract. |
| BRAND-P2-005 | P2 | Brand observability/rate limiting not verified. | verify/document platform behavior. |

## Current and target API

CURRENT: list summaries contain ID/code/name/logo/media/status/timestamps; detail is the same shape. Description, SortOrder and ProductCount are absent. Create/update accept Description but not SortOrder. Backend paging returns items/pageNumber/pageSize/totalCount.

TARGET list: `GET /api/v1/brands?pageNumber&pageSize&search`, returning items/pageNumber/pageSize/totalCount/totalPages. Summary: id, brandCode, brandName, resolved logo/media, productCount, status, updatedAt.

TARGET detail: id, brandCode, brandName, description, sortOrder, logoMediaAssetId/resolved media, status, createdAt, updatedAt. Create/update editable profile: brandCode, name, description, sortOrder, status. BrandSlug remains **UNRESOLVED — KEEP CURRENT BEHAVIOR UNTIL DECISION**.

## Current and target database

CURRENT Brand fields: id, tenant_id, brand_code(80), brand_name(150), brand_slug(180), nullable text description, nullable logo_media_asset_id, status, audit users and timestamps. Tenant/code and tenant/slug are unique; status check permits ACTIVE/INACTIVE/DELETED. No SortOrder exists.

TARGET adds `sort_order integer NOT NULL DEFAULT 0`, check `sort_order >= 0`, and—subject to query-plan approval—index `(tenant_id,sort_order,brand_code)`. The claimed `20260728103522_AddBrandSortOrder` migration does not exist.

Product lifecycle verified from `ProductConfiguration`: DRAFT, ACTIVE, INACTIVE, ARCHIVED. Target ProductCount includes same-tenant DRAFT/ACTIVE/INACTIVE rows for BrandId and excludes ARCHIVED; use a set-based projection/no N+1 and do not persist the count on Brand.

## Implementation status

Backend/DB work must precede dependent Flutter integration. Targets are not implemented until source, migrations and tests prove them.
