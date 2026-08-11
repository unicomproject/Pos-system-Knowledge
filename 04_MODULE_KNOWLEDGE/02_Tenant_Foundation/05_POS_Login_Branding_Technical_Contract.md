<!-- title: POS Login Branding Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# POS Login Branding Technical Contract

## Current and Target State
Current schema already contains `tenants`, `tenant_profiles`, `media_assets`,
`setting_definitions` and `tenant_settings`. `tenant_profiles.logo_media_asset_id`
is canonical; legacy `logo_url` is not. Public/admin branding APIs, typed
settings/media purposes, tenant-scoped Flutter cache and the reusable Login
branding renderer are implemented. Device Activation does not yet consume that
renderer; this is a pending presentation integration, not a reason to create
another branding implementation.
## Database Decision
No dedicated login-branding table and no new physical branding columns are
allowed. New configuration is seeded as `setting_definitions` rows and stored per
tenant in `tenant_settings.setting_value` JSONB. Implementation also adds the two
media-purpose catalogue/constants according to existing conventions.

| Key | Type | Default JSON | Editable | Validation / null behaviour |
|---|---|---|---:|---|
| `pos.login.system_name` | `STRING` | `"Smart Cashier System"` | Yes | 1-80 trimmed; missing/empty -> default |
| `pos.login.description` | `STRING` | `"Powering every sale. Every venue. Every day."` | Yes | 0-300 trimmed; missing/empty -> default |
| `pos.login.subtitle_template` | `STRING` | `"Sign in to continue to {tenantName} POS"` | Yes | 1-160; only approved placeholder |
| `pos.login.background_mode` | `STRING` | `"COLOR"` | Yes | enum `IMAGE|COLOR`; missing/invalid -> `COLOR` |
| `pos.login.background_color` | `STRING` | `"#020B1F"` | Yes | uppercase `#RRGGBB`; missing/invalid -> platform default |
| `pos.login.background_media_asset_id` | `STRING` | `null` | Yes | nullable UUID; valid `POS_LOGIN_BACKGROUND` asset |
| `pos.login.hero_media_asset_id` | `STRING` | `null` | Yes | nullable UUID; valid `POS_LOGIN_HERO` asset |

Only the resolved minimized DTO is public-safe. Raw settings, internal IDs and
storage keys are not public. Cache values are tenant scoped. A migration/seed
adds definitions and purposes as configuration data, not schema.

## Screen-to-Data Mapping
| Screen element | Table / setting / attribute | State |
|---|---|---|
| Brand name | `tenant_profiles.trading_name` -> `tenants.display_name` | Existing |
| Logo | `tenant_profiles.logo_media_asset_id` -> `media_assets.id` | Existing |
| System name | `pos.login.system_name` | New definition planned |
| Description | `pos.login.description` | New definition planned |
| Subtitle | `pos.login.subtitle_template` | New definition planned |
| Mode | `pos.login.background_mode` | New definition planned |
| Colour | `pos.login.background_color` | New definition planned |
| Background image | `pos.login.background_media_asset_id` -> `media_assets.id` | New definition planned |
| Hero image | `pos.login.hero_media_asset_id` -> `media_assets.id` | New definition planned |
| Auth controls | Existing Flutter/auth DTO and tenant-auth service | Existing |

## Pre-Login Tenant Resolution
Canonical target is an installation/provisioning-owned `tenantSlug`, stored in
secure device configuration before the branded login route opens. The app reads
that slug; it never derives tenant identity from email and never presents a
Tenant Code field. A successful device activation/bootstrap must retain the same
slug for subsequent launches. On tenant reprovision/switch, clear branding cache
before storing the new slug.

Current `PosDeviceContext` stores both `tenantId` and the non-secret
`tenantSlug`; activation/current-device mapping and secure persistence include
the slug. Never use tenant UUID in the public URL.

## Public Read API — IMPLEMENTED
`GET /api/v1/pos/public/login-branding/{tenantSlug}` is `AllowAnonymous`, has no
application permission, accepts only a normalized valid slug, uses public-read
rate limits, and returns `200` with the safe effective DTO for an accessible
tenant. Malformed slug returns generic `400`; unknown, cancelled, suspended,
draft or pending tenant returns the same generic `404 branding_unavailable`.
Only `ACTIVE` tenant branding is public. This avoids lifecycle/account leakage.

```json
{
  "tenantSlug": "chelsea-store",
  "brandDisplayName": "Chelsea Store",
  "systemName": "Smart Cashier System",
  "description": "Powering every sale. Every venue. Every day.",
  "loginSubtitle": "Sign in to continue to Chelsea Store POS",
  "backgroundMode": "COLOR",
  "backgroundColor": "#020B1F",
  "logoUrl": "https://public.example/assets/logo.png",
  "backgroundImageUrl": null,
  "heroImageUrl": "https://public.example/assets/hero.webp",
  "updatedAt": "2026-08-10T00:00:00Z"
}
```

It returns resolved public URLs, never tenant/user/account/permission/audit,
storage or secret data. It supports `ETag`, `304`, and five-minute public caching.
`updatedAt` is the maximum relevant update time; no version column is added.

## Tenant Admin API — IMPLEMENTED
No existing generic tenant-settings controller provides safe typed CRUD, so use:
- `GET /api/v1/tenant-admin/settings/pos-login-branding`
- `PUT /api/v1/tenant-admin/settings/pos-login-branding`

Both require authenticated `TenantOnly` context and `tenant.settings.manage`.
Tenant ID comes only from claims. GET returns configured values plus separately
named effective values/media summaries for preview. PUT accepts only:
`systemName`, `description`, `subtitleTemplate`, `backgroundMode`,
`backgroundColor`, `backgroundMediaAssetId`, `heroMediaAssetId`. It validates
all values and media in one transaction, upserts the seven tenant settings,
writes an audit event and invalidates the tenant branding cache. Success is
`200`; validation `400`; auth `401`; permission `403`; missing/wrong-tenant/
unusable media `422`; concurrency `409`; server failure `500`. PUT is naturally
idempotent for the same complete representation; no idempotency key is required.

Brand name/logo remain in profile/media management. Reset uses PUT with canonical
default/null semantics; it is not a separate endpoint.

## Permissions
Public branding read and opening login require no authenticated application
permission. All Tenant Admin view, edit, mode switch, colour/media selection,
preview/save/reset and applicable profile/logo management require the existing
`tenant.settings.manage`. No new permission is created.

## Runtime and Cache Logic
1. Read provisioned `tenantSlug`.
2. Read cached public DTO keyed by normalized slug and schema version.
3. Render valid cache immediately; otherwise render packaged defaults.
4. Fetch public DTO without blocking credential form.
5. Validate/map response, replace UI atomically and persist public fields only.
6. On timeout/offline/5xx/malformed result, keep cache/defaults and log a safe
   branding-fetch event.
7. On tenant switch/reprovision/logout-with-device-reset, evict the old key.
8. A stale cache may render for up to 24 hours while refresh is attempted; after
   24 hours render defaults until a valid response arrives.

Image failure falls back per element. Logs contain correlation/slug hash and
failure class, never credentials, tokens, raw settings or private URLs. Admin
audit records actor, changed field names, result and correlation, not payloads.

## Authentication Preservation
Branding endpoint never validates credentials, issues tokens, returns
permissions or creates sessions. Existing login/refresh/logout, password hash,
generic invalid-credential response, tenant/user lock state, token storage,
session rotation, permission load, device/till bootstrap and audit remain
unchanged. Branding fetch failure cannot change login eligibility.

## Shared Login / Device Activation Presentation

The existing `PosLoginBrandingPanel` is the single left-panel renderer for both
`LoginScreen` and `DeviceActivationScreen`. It accepts resolved branding state
and owns background mode/colour/image, logo, brand name, system name,
description, hero and element-level fallback behavior. It does not render
`loginSubtitle`.

During unprovisioned first activation, the same component receives packaged
OneVerz fallback branding. Activation must not introduce a tenant-code input,
activation-specific branding endpoint, cache, table or settings. The current
Activation private `_ActivationBrandPanel` is implementation drift and must be
replaced by shared component consumption before UI/runtime sign-off.

## Related Files
- [[04_POS_Login_Branding_Functional_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/Authentication]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/02_Tenant_Foundation_UPDATED]]
- [[../../02_ACCESS_CONTROL/Permission_Code_List]]
- [[../../03_USER_JOURNEYS/Cashier/02_Device_Activation_Flow]]
