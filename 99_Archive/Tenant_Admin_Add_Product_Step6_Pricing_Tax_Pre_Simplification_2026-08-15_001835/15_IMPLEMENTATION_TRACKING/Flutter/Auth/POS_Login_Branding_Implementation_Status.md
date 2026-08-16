<!-- title: POS Login Branding Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# POS Login Branding Implementation Status

## Status

| Track | Status |
|---|---|
| Second Brain specification | Complete |
| Backend public/admin APIs | Chunk 1 complete; purpose-scoped branding media upload added in Chunk 2 |
| Database definition/media-purpose seed | Implemented; subtitle correction migration applied in Local Development |
| Flutter public DTO/cache/rendering | Implemented and tablet runtime verified for COLOR, IMAGE, logo, hero, subtitle and offline cache |
| Tenant Admin branding UI | Implemented with preview, save/reset and JPG/PNG/WEBP upload controls |
| Automated tests | Flutter 931/931 pass including relative media URL resolution; focused backend branding 6/6 |
| Authenticated E2E/runtime/visual verification | Blocked only on current Local Development Tenant Admin/Cashier fixture authentication |

## Chunk 1 Implemented Current State

- Flutter login/auth shell hardcodes OneVerz copy, colours and imagery.
- Device context backend response now includes the provisioned `tenantSlug`;
  Flutter persistence/consumption remains Chunk 2.
- Anonymous `GET /api/v1/pos/public/login-branding/{tenantSlug}` is implemented
  with safe defaults, slug validation, rate limiting, `Cache-Control` and ETag.
- Tenant Admin GET/PUT are implemented at
  `/api/v1/tenant-admin/settings/pos-login-branding`, guarded by
  `tenant.settings.manage` and tenant-scoped media validation.
- All seven `pos.login.*` setting definitions are active in Local Development.
- Media purposes `POS_LOGIN_BACKGROUND` and `POS_LOGIN_HERO` are supported on
  the existing `media_assets` architecture; no branding table or column exists.
- Existing tenant authentication is implemented and must remain unchanged.

## Final Chunk 1 Verification Evidence — 2026-08-10

- Release API and full solution builds: PASS, zero warnings/errors.
- Focused branding/auth/device tests: PASS, 13/13.
- Backend unit suite: PASS, 940/940.
- Data-only migrations applied to Local Development: PASS.
- Approved Tenant Admin and Cashier login: PASS (`200`); canonical password
  verification, access/refresh issuance, active sessions and permission loading
  were exercised without changing authentication semantics.
- The earlier `401` was caused by using `ADMIN@ONEVERCE.LK`, not the approved
  Local Development Tenant Admin fixture email. The approved fixture and stored
  canonical hash were valid; no password repair was required.
- Public GET for `arenasports`: PASS (`200`), safe DTO resolved.
- Conditional ETag request: PASS (`304`); malformed slug `400`; unavailable
  tenant `404`.
- Admin route without a bearer token: PASS (`401`).
- Authenticated Admin GET and PUT COLOR/IMAGE/hero/subtitle: PASS (`200`).
- Invalid subtitle: PASS (`400`) with no mutation.
- Cashier without `tenant.settings.manage`: PASS (`403`).
- Same-tenant media resolution: PASS; cross-tenant media and mixed atomic update
  rejection: PASS (`422`) with no partial persistence.
- Cashier refresh and provisioned device activation/current-context regression:
  PASS (`200`); both responses expose `tenantSlug=arenasports`.
- Deterministic Local Development branding media fixtures use the existing
  `media_assets` table and a data-only migration. No branding table or physical
  branding columns were added.
- Release solution build: PASS, zero warnings/errors.

## Chunk 2 Continuation Evidence — 2026-08-10

- The existing Login screen was refactored into branding panel and login form
  components; no duplicate Login route or screen was created.
- Provisioned `tenantSlug` is persisted in the existing device context and is
  used to namespace schema-versioned secure-storage cache entries.
- Cached/default-first rendering, anonymous refresh, ETag forwarding, 24-hour
  stale limit and network-failure fallback are implemented.
- COLOR and IMAGE rendering, dynamic logo/name/system name/description/hero and
  resolved subtitle are implemented with packaged fallbacks.
- Tenant Admin route `/tenant-admin/settings` uses the existing permission gate
  for `tenant.settings.manage` and provides componentized editor/preview UI.
- Admin GET/PUT, save, reset, validation and editor-preserving error behavior are
  implemented.
- A missing media integration was found and closed with a minimal
  purpose-scoped endpoint using existing `media_assets`, object storage, tenant
  context and permission infrastructure. It accepts JPG, PNG and WEBP up to
  5 MiB for `POS_LOGIN_BACKGROUND` and `POS_LOGIN_HERO` only.
- Default subtitle was corrected from
  `Sign in to continue to {tenantName} POS` to
  `Sign in to continue to {tenantName}` because tenant display names may
  already contain `POS`. Data-only migration
  `20260810120300_CorrectPosLoginBrandingSubtitleTemplate` was applied locally.
- Release backend solution build: PASS, zero warnings/errors.
- Focused backend branding tests: PASS, 6/6.
- Flutter analyze: PASS, no issues.
- Full Flutter suite: PASS, 931/931 including IMAGE fallback and API-relative
  media URL resolution; focused backend branding suite: PASS, 6/6.
- Flutter and backend scoped `git diff --check`: PASS. The Second Brain
  repository-wide check remains blocked by a pre-existing unrelated blank line
  at EOF in
  `15_IMPLEMENTATION_TRACKING/POS_Cashier_Discount_Second_Brain_Alignment_2026-08-09.md`;
  it was preserved because it is outside this feature scope.
- Pixel Tablet Android 15, 2560x1600: dynamic tenant branding, COLOR background,
  logo, hero, corrected subtitle, orange Sign In action, hidden Forgot Password
  and no overflow visually verified.
- Final screenshot:
  `C:\tmp\pos_login_branding_chunk2_final.png`.
- API-offline cold start rendered the tenant-scoped cached branding successfully;
  evidence:
  `C:\tmp\pos_login_branding_chunk2_cached_fallback.png`.
- Development target assets are now registered through `media_assets` as
  `TENANT_LOGO`, `POS_LOGIN_BACKGROUND` and `POS_LOGIN_HERO`; the logo is linked
  through `tenant_profiles.logo_media_asset_id`, and the background/hero IDs are
  stored in `tenant_settings`.
- Data-only migrations `20260810120400_SeedTargetPosLoginBrandingAssets` and
  `20260810120500_EnsureTargetPosLoginBrandingProfile` were applied locally.
- Public `GET /api/v1/pos/public/login-branding/arenasports` returns OneVerz,
  Smart Cashier System, multiline description, IMAGE mode, resolved subtitle,
  and separate logo/background/hero URLs; all three URLs return `200 image/png`.
- API-relative media URLs are resolved against the configured Dio base origin;
  cache schema version 2 invalidates previously cached unresolved paths.
- Pixel Tablet IMAGE-mode runtime composition: PASS with separate dynamic
  background, logo, text and hero; evidence:
  `C:\tmp\pos-login-branding-seeded-final.png`.
- The repository-approved Tenant Admin and Cashier seed credential did not
  authenticate against the current Local Development database during this
  continuation (`tenant_auth.invalid_credentials`). No password/hash/database
  repair was attempted. Therefore Tenant Admin save, cashier regression and
  permission behavior remain blocked. Seeded IMAGE-mode public Login rendering
  is independently verified and PASS, but Chunk 2 is not marked complete.

## Final State

- Backend Chunk 1: **COMPLETE**
- Flutter dynamic branding Chunk 2 implementation: **COMPLETE**
- Tenant Admin Flutter branding UI implementation: **COMPLETE**
- Final responsive visual acceptance for COLOR and seeded IMAGE fixtures: **PASS**
- Authenticated Chunk 2 E2E completion: **BLOCKED — Local Development fixture authentication mismatch**
- Repository-wide diff hygiene: **BLOCKED — unrelated pre-existing Second Brain EOF whitespace**

## Implementation Order

1. Seed definitions and media purposes without adding schema.
2. Add provisioned public tenant slug contract.
3. Add public resolver/API, media checks, caching headers and tests.
4. Add authorized Tenant Admin read/update and audit tests.
5. Add Flutter cache/fallback/rendering while preserving auth.
6. Add Tenant Admin preview/editor.
7. Run automated, authenticated, isolation, offline and visual acceptance matrix.

## Authority

- [[../../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/04_POS_Login_Branding_Functional_Rules]]
- [[../../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]]
