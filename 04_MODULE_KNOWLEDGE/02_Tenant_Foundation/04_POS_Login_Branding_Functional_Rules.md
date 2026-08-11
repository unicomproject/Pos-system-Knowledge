<!-- title: POS Login Branding Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-10 -->

# POS Login Branding Functional Rules

## Authority and Scope
This is the canonical product contract for tenant-configurable branding shown on
the POS login and first-time Device Activation presentation. It changes presentation only; the
credential form and `POST /api/v1/tenant-auth/login` remain authoritative for
authentication. The OneVerz primary action colour remains orange. Tenant login
branding is not application-wide theme customization.

## Configurable Elements

| Element | Tenant configurable | Canonical source |
|---|---:|---|
| Background | Yes: exactly one active mode, `IMAGE` or `COLOR` | Typed settings and tenant media |
| Logo | Yes | `tenant_profiles.logo_media_asset_id` -> `media_assets.id` |
| Brand name | Yes | `tenant_profiles.trading_name`, then `tenants.display_name` |
| System name | Yes | `pos.login.system_name` |
| Login description | Yes | `pos.login.description` |
| Hero image | Yes | `pos.login.hero_media_asset_id` |
| Login subtitle | Yes | `pos.login.subtitle_template` |
| Email, password, visibility, Sign In and auth states | Existing behaviour | Tenant authentication module |

There is no separate `pos.login.brand_display_name` setting. The existing
tenant/profile update flow owns the login-facing name. Login description is
login-specific and must not be bound to `tenant_profiles.description`.

## Business Rules

- **BR-01:** Branding is tenant scoped.
- **BR-02:** Tenant A cannot read, edit, select or render Tenant B media/config.
- **BR-03:** Branding affects only approved login-screen properties.
- **BR-04:** Background supports `IMAGE` and `COLOR`.
- **BR-05:** Only `pos.login.background_mode` is active at runtime.
- **BR-06:** Logo reuses the canonical tenant logo.
- **BR-07:** Description is login-specific presentation copy.
- **BR-08:** Hero media is tenant-specific.
- **BR-09:** Subtitle supports only `{tenantName}`.
- **BR-10:** Public branding is readable before authentication.
- **BR-11:** The public response contains no private tenant/account data.
- **BR-12:** Branding failure never hides or disables the credential form.
- **BR-13:** Existing tenant-auth controls authentication and session state.
- **BR-14:** Branding management requires `tenant.settings.manage`.
- **BR-15:** Cross-tenant media references are rejected.
- **BR-16:** Missing or unusable values resolve by deterministic fallback.
- **BR-17:** The OneVerz product primary action remains orange.
- **BR-18:** Tenant context change clears and reloads the branding cache.
- **BR-19:** Branding lookup never derives tenant identity from entered email.
- **BR-20:** Normal Cashier login has no Tenant Code field.
- **BR-21:** Login and Device Activation reuse one shared left branding panel;
  separate feature-specific branding renderers are prohibited.
- **BR-22:** `loginSubtitle` remains Login-form copy and is not rendered inside
  the shared branding panel or Activation form.

## Background Contract

`pos.login.background_mode` is a tenant-editable string enum with only `IMAGE`
and `COLOR`; default is `COLOR`.

- `IMAGE`: render the active, valid tenant-owned background media. If unusable,
  use the valid configured colour; otherwise use the platform default background.
- `COLOR`: render the validated configured colour; never render a previously
  selected image. Invalid/missing colour uses the platform default background.
- Switching mode does not delete the inactive value. It changes only the active
  presentation, so switching back restores the retained valid configuration.

## Fallback Hierarchy

| Element | Resolution order |
|---|---|
| Brand name | non-empty `trading_name` -> `display_name` -> `OneVerz` |
| Logo | active tenant `TENANT_LOGO` asset -> packaged OneVerz logo |
| System name | valid setting -> `Smart Cashier System` |
| Description | valid setting -> `Powering every sale. Every venue. Every day.` |
| Background `IMAGE` | valid image -> valid configured colour -> platform default |
| Background `COLOR` | valid colour -> platform default |
| Hero | valid tenant hero -> packaged platform hero |
| Subtitle | valid template -> `Sign in to continue to {tenantName} POS`; then substitute effective brand name |

Broken, missing, deleted, inactive, wrong-purpose, wrong-type or wrong-tenant
media is treated as unavailable per element and does not blank the screen.

## Validation

| Value | Contract |
|---|---|
| `systemName` | trim; 1-80 plain-text characters; empty means default |
| `description` | trim; 0-300 plain-text characters; empty means platform default |
| `subtitleTemplate` | trim; 1-160 characters; only `{tenantName}` placeholder; empty means default |
| `backgroundColor` | uppercase `#RRGGBB`; exactly six hex digits; no CSS names, URLs, gradients or alpha |
| Media ID | UUID string; asset must exist, be tenant-owned, active, image type and approved purpose |

HTML, scripts and executable templates are prohibited. Template replacement is
plain-text substitution and output is rendered as text.

## Media Rules

Reuse `media_assets`; do not create another media table. Reuse `TENANT_LOGO` for
the logo and add planned purposes `POS_LOGIN_BACKGROUND` and `POS_LOGIN_HERO`.
Accepted target MIME types follow the current image pipeline:
`image/jpeg`, `image/png`, and `image/webp`; SVG is excluded. Maximum file size
is 5 MiB. Signature, extension and MIME must agree. `ACTIVE`, a safe renderable
URL and tenant ownership are mandatory.

Transparent PNG/WebP is accepted for logo/hero; transparent background imagery
renders over the fallback colour. Recommended assets: logo square/wide,
background at least 1600x900 (16:9), hero at least 800x800 with safe padding.

## Accessibility and Layout

The approved split-screen composition is preserved on supported landscape
tablet/desktop widths and collapses responsively without overflow. The credential
form remains usable at every supported width. Critical text must meet WCAG AA
contrast. Admin preview shows actual text over the chosen background; a
product-controlled dark readability overlay is applied to background images.
Decorative hero/background imagery is excluded from accessibility semantics;
logo semantics use the effective tenant name. Interactive controls retain
project touch-target and keyboard/focus standards.

## Device Activation Reuse

The existing `DeviceActivationScreen` must consume the same shared branding
component, dynamic fields, cache result and per-element fallback behavior as
Login. Before a tenant can be resolved, that shared component renders packaged
OneVerz fallback branding; Activation must not add a Tenant Code field or a
separate branding API/storage/cache. After activation, the returned
`tenantSlug` is persisted in the existing device context so subsequent Login
Branding can resolve the tenant.

Activation right-panel copy, validation and action are Activation-owned and do
not change `loginSubtitle` semantics.

## Error and Loading Behaviour

The first frame shows tenant-scoped cached branding when valid, otherwise
platform defaults. Branding refresh runs in the background. Timeout, offline,
5xx, malformed DTO, unknown/unavailable tenant, invalid setting and individual
media failure all degrade to cached/default branding while credentials remain
visible and usable. Sign In loading, duplicate-submit prevention and auth errors
remain owned by the authentication flow.

## Forgot Password and Tenant Code

Tenant POS staff Forgot Password is not implemented in Release 1 and the control
is hidden. Customer e-commerce password reset is unrelated. Normal Cashier login
does not display or request Tenant Code; tenant identity comes from provisioning.

## Related Files

- [[05_POS_Login_Branding_Technical_Contract]]
- [[../../03_USER_JOURNEYS/Cashier/01_Login_Flow]]
- [[../../03_USER_JOURNEYS/Cashier/02_Device_Activation_Flow]]
- [[../../03_USER_JOURNEYS/Tenant_Admin/21_POS_Login_Branding_Flow]]
- [[../../10_TESTING_QA/Test_Case/02_Tenant_Foundation/POS_Login_Branding_Test_Cases]]
