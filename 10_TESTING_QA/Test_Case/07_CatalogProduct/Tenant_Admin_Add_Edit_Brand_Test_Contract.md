<!-- status: Active required test contract; coverage incomplete -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Add/Edit Brand — Required QA Contract

This is required coverage, not a claim that tests exist.

## Add

- Route renders content inside the common Tenant Admin layout with no duplicated shell; heading/breadcrumb/actions are exact; no preview.
- Empty/default fields; UI initial Sort Order follows the pending product decision; backend/DB fallback remains 0; default status Active.
- Name required/trim; 150 valid, 151 invalid. Code required/trim/uppercase; 80 valid, 81 invalid; same-tenant duplicate conflicts.
- Description empty and 255 valid, 256 invalid. Sort 0/1 valid, negative/noninteger invalid. Active/Inactive valid; DELETED unavailable.
- JPG/JPEG/PNG valid; WebP, >2 MB and corrupt files rejected.
- create/manage/denied and create-only+initial-logo authorization.
- Submit lock/double tap, network/validation/409 errors, successful create, logo partial failure, logo-only retry, list refresh, Cancel/Back/dirty confirmation.
- Tablet portrait/landscape, 1024×768, 1280×800, common Android tablets and desktop; keyboard/scroll/focus/semantics.

## Edit

- Route receives `brandId`, reuses common layout and shared form, shows loading, calls detail GET, and guarded-prefills Name/Code/Sort Order/Description/Status/logo.
- Same code accepted; another Brand's code rejected. Change each editable field independently.
- Unchanged logo produces no upload; changed logo produces replacement.
- update/manage/denied/view-only; cross-tenant ID, 404, 403 and network error.
- Double Save, dirty navigation, stale update conflict, successful update, list/detail refresh.

## Backend/API/media

- Stable field-addressable 400, unauthenticated 401, denied 403, not found 404, duplicate/stale 409, size 413, unsupported 415 and safe 500.
- Tenant isolation for GET/update/logo/delete. Initial-logo permission differs correctly from later replacement.
- Explicit create/update/status/logo/delete audit events after implementation.

## PostgreSQL

Use a real production-like PostgreSQL provider for tenant+code uniqueness, tenant+slug uniqueness, `sort_order >= 0`, Product→Brand tenant-safe FK, cross-tenant rejection, RESTRICT behavior, migration correctness and uniqueness races. EF InMemory/SQLite is not equivalent to PostgreSQL constraint verification.

Current coverage: list/detail Flutter MVP and limited service/repository/controller behavior only. Add/Edit Flutter, permission/media edge cases and Brand-specific PostgreSQL constraint coverage are **MISSING/PARTIAL**.
