<!-- title: POS Login Branding Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# POS Login Branding Test Cases

## Acceptance Matrix

| Category | Required cases |
|---|---|
| Background | defaults; valid/invalid colour; valid image; missing/inactive/deleted/broken image; image-to-colour and colour-to-image; inactive mode never leaks |
| Logo | tenant logo; absent/inactive/broken; platform fallback |
| Name | trading name; display-name/default fallback; valid special and long values |
| Text | custom/default/empty/max-length system name and description; multiline description |
| Hero | valid, absent, inactive, deleted, wrong-tenant, broken and fallback |
| Subtitle | default/custom; `{tenantName}` replacement; unknown placeholder rejection; empty fallback |
| Public API | pre-login access; valid/malformed/unknown/unavailable slug; minimized DTO; generic response; ETag/304/cache headers; rate protection |
| Tenant Admin | permission allow/deny; configured/effective read; every field update; preview; reset; validation; atomic failure |
| Isolation | cross-tenant background/hero rejected; no cross-tenant admin read/write/public result/cache reuse |
| Cache | no-cache default; immediate valid cache; refresh; refresh failure; stale expiry; tenant switch eviction |
| Network | offline, timeout, malformed response and 5xx retain usable credential form |
| Auth regression | success, invalid credentials, locked user, inactive tenant, session/token/permission/logout unchanged; duplicate submit prevented |
| Responsive | tablet landscape, supported desktop, no overflow, crop/fit, long name/text |
| Accessibility | labels, focus order, show-password semantics, touch targets, contrast, decorative media semantics |
| Security | no email lookup/enumeration; slug validation; output encoding; no secret logs; HTTPS; unsafe template/CSS rejected |

## API Assertions

- Public response never contains internal tenant ID, users, emails, permissions,
  subscription, audit metadata, storage keys or secrets.
- Unknown and inaccessible tenants are externally indistinguishable.
- Admin update takes tenant only from authenticated claims.
- A failed multi-field update writes no tenant setting or audit success record.
- Wrong-tenant/wrong-purpose/non-active media returns `422`.

## Database Assertions

- No login-branding table or physical tenant/profile branding columns exist.
- Exactly seven active setting definitions exist with canonical keys/defaults.
- At most one `tenant_settings` row exists per tenant/definition.
- Logo reference remains `tenant_profiles.logo_media_asset_id`.
- Media purpose/status/tenant constraints are enforced before persistence.

## Flutter Assertions

- First frame is cached branding or packaged default, never blank.
- Credential fields work while branding refresh is pending or failed.
- Mode change replaces background atomically without flashing retained inactive media.
- Broken individual media uses its element fallback without losing other branding.
- Reprovisioning from Tenant A to B cannot display Tenant A cached content.

## Runtime Evidence Required

Automated unit/API/integration/widget tests, authenticated Tenant Admin save,
cold/warm/offline POS launch, tenant-switch isolation, supported tablet visual
captures and auth regression must pass before runtime implementation is complete.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/04_POS_Login_Branding_Functional_Rules]]
- [[../../../04_MODULE_KNOWLEDGE/02_Tenant_Foundation/05_POS_Login_Branding_Technical_Contract]]
