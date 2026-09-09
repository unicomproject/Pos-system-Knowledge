<!-- title: Tenant Admin Online Store Setup And Publish Flow -->
<!-- status: Canonical Desired Contract / Reconciliation Blocked -->
<!-- journey_ids: EC-TA-UJ-02, TA-UJ-063 -->
<!-- last_updated: 2026-08-31 -->

# Tenant Admin Online Store Setup And Publish Flow

## Scope And Ownership

This is the canonical OneVerz native Online Store Tenant Admin journey. `EC-TA-UJ-02` maps to `TA-UJ-063`. It is separate from Platform Admin bootstrap `SA-ST-UJ-011` and from the customer storefront. Release 1 is registered-customer Click & Collect with Pay at Pickup, required email verification, and no delivery, guest checkout, or online payment gateway scope.

## Canonical Nine Steps

1. **Online Store Overview** — backend-derived status, progress, URL/domain, branding, support, collection, catalogue, policies and next action.
2. **Enable Online Store** — enable setup only; do not publish or activate public sales channel.
3. **Configure Store Identity** — store/business names, description, email, phone and support tagline.
4. **Storefront URL & Domain** — hosted slug and optional custom-domain verification, SSL and primary lifecycle.
5. **Branding & Appearance** — tenant logo, favicon, primary colour and secondary colour. Banner readiness remains backend-owned and is not fabricated by this editor.
6. **Contact & Support** — support contacts, address, hours, WhatsApp, help URL and Contact Us state.
7. **Configure Click & Collect** — enable pickup, tenant-owned eligible outlets, hours, lead/cut-off/window rules.
8. **Products & Policies** — channel visibility plus policy drafts, publishing, versions and archive in one wizard step.
9. **Review & Publish** — rerun readiness, resolve blockers, idempotently publish, then show Store Live as the Step 9 result state.

## Permission Matrix

| Permission | Steps | Actions |
|---|---|---|
| `tenant.online_store.view` | 1–9 | Read overview/readiness and all configuration projections |
| `tenant.online_store.manage` | 2–4 | Activate setup, update identity and hosted slug |
| `tenant.online_store.domains.manage` | 4 | Add, verify, rotate token, provision SSL, set primary, remove |
| `tenant.online_store.branding.manage` | 5 | Upload/remove media; update branding and banners |
| `tenant.online_store.support.manage` | 6 | Update contact and support configuration |
| `tenant.online_store.fulfillment.manage` | 7 | Configure Click & Collect and outlet mappings |
| `tenant.online_store.catalog.manage` | 8 | Product/variant/bulk channel visibility |
| `tenant.online_store.policies.manage` | 8 | Draft, publish, list versions and archive policies |
| `tenant.online_store.publish` | 9 | Final authoritative publish |

## Field And Lifecycle Contract

### Step 3 Identity

| Field | Current backend rule |
|---|---|
| Store Name | Required, trimmed, stored in `sales_channels.custom_name`; DB maximum 150 |
| Business Display Name | Required and trimmed; JSON setting has no source-enforced maximum |
| Store Description | Optional; blank becomes null; no source-enforced maximum |
| Store Email | Optional; blank becomes null; current service does not validate email syntax |
| Store Phone | Optional; blank becomes null; current service does not validate phone syntax |
| Support Tagline | Optional; blank becomes null; no source-enforced maximum |

The missing JSON-field length and email/phone format rules are a backend validation gap; Flutter must not invent authoritative limits.

### Step 4 Domain Lifecycle

Desired UI labels map to current persistence as follows: `DOMAIN_ADDED / DNS_PENDING` → `verification_status=PENDING`; `DNS_VERIFIED` → `VERIFIED`; `SSL_PROVISIONING` → `ssl_status=PENDING`; `SSL_ACTIVE` → `ACTIVE`; `PRIMARY_DOMAIN` → `is_primary=true`. Token rotation returns verification to PENDING. Removal is soft deletion (`status=DELETED`, `is_primary=false`). Current `SetPrimary` does not itself require VERIFIED/SSL ACTIVE; final readiness enforces those states for a primary custom domain.

### Step 5 Media

Purposes are `ONLINE_STORE_LOGO`, `ONLINE_STORE_FAVICON`, and `STOREFRONT_BANNER`. Current backend accepts matching JPG/JPEG, PNG, WEBP, SVG and ICO files, 1 byte–5 MB, and limits raster images to 16 megapixels. Storage must be configured and every reused media asset must belong to the current tenant. Upload creates media first; Flutter then attaches the returned media ID with `PUT /branding`. Removal detaches the ID before deleting the media asset.

The Step 5 editor exposes only backend-persisted fields: `logoMediaAssetId`, `faviconMediaAssetId`, `primaryColor`, and `secondaryColor`. Typography, background/text palettes and button-style controls are out of contract until backend persistence exists. Colours use exact `#RRGGBB`; readiness and active-banner requirements remain backend-owned.

## API And Database Matrix

| Step | Source-verified endpoint(s) | Permission | Main entities/tables |
|---:|---|---|---|
| 1 | `GET /overview`, `GET /readiness` | view | all setup projections |
| 2 | `GET/PUT /activation` | manage | `tenant_settings`, `sales_channels` |
| 3 | `GET/PUT /identity` | manage | `sales_channels`, `tenant_settings` |
| 4 | `GET /url-domain`, `PUT /url`, domain lifecycle endpoints | domains.manage | `tenant_settings`, `tenant_domains` |
| 5 | branding/media and banner endpoints | branding.manage | `tenant_settings`, `media_assets`, `storefront_banners` |
| 6 | `GET/PUT /support` | support.manage | `tenant_settings` |
| 7 | Click & Collect and outlet endpoints | fulfillment.manage | `fulfillment_methods`, `fulfillment_method_outlets`, `outlet_business_hours`, `outlets` |
| 8 | catalogue visibility and policy endpoints | catalog.manage / policies.manage | `product_channel_visibilities`, `products`, `product_variants`, `storefront_policies` |
| 9 | `POST /publish` | publish | `tenant_settings`, `sales_channels`, `audit_logs`, `idempotency_requests` |

Base path for every row is `/api/v1/tenant-admin/online-store`. Every action requires authenticated tenant context, active tenant, effective entitlement, permission, ownership validation and business validation.

## Locked Business Rules

- Setup enablement, `PUBLISHED` store state and `ACTIVE` sales channel are distinct.
- Every save is server-persisted; Flutter must not own readiness truth.
- Hosted slug is sufficient if no custom primary domain exists. A configured primary custom domain must be VERIFIED with SSL ACTIVE.
- At least one active banner is currently required by backend readiness.
- Support email and phone are current backend blockers.
- At least one active collection mapping with business hours is required.
- Catalogue visibility is channel-specific; Product Master is reused.
- Publish requires `tenant.online_store.publish`, readiness PASS and `Idempotency-Key`.
- Tenant A cannot read or mutate Tenant B configuration, domains, media, outlets, products, policies or channel records.

## Gap Register

| Gap | Finding | Classification | Closure |
|---|---|---|---|
| GAP-OS-01 / `ONLINE_STORE_REQUIRED_POLICY_MISMATCH` | Approved UI shows four policies; backend and DB require five including `RETURN_REFUND` | **PRODUCT_DECISION_REQUIRED** | Blocking: choose and align one required set before implementation acceptance |
| GAP-OS-02 / `ONLINE_STORE_PRIMARY_DOMAIN_READINESS_MISMATCH` | Backend accepts hosted slug when no primary custom domain exists; configured primary domain must be verified + SSL active | **ALIGNED** with optional-domain interpretation B | UI must not require custom domain when none is configured |
| GAP-OS-03 / `ONLINE_STORE_SUPPORT_READINESS_MISMATCH` | UI marks address/hours as required; backend readiness checks only support email + phone | **PRODUCT_DECISION_REQUIRED** | Decide whether backend or UI mandatory set changes |
| GAP-OS-04 | Desired four-state progress vs backend `PASS/BLOCKED` only | **BACKEND_GAP** | Do not persist/infer unsupported states in Flutter |
| GAP-OS-05 | Backend requires active mapping + business hours; UI also describes weekend/blackout rules not used in readiness | **PRODUCT_DECISION_REQUIRED** | Lock extended eligibility before making it publish-blocking |
| GAP-OS-06 | Multiple save labels vs immediate endpoint persistence | **DOCUMENTATION_STALE** | Canonical meaning: persist current step, then remain or continue |
| GAP-OS-07 | Store Live exists as Step 9 result but live-management contract was not canonical | **DOCUMENTATION_STALE** | This document locks result/live overview ownership; implementation evidence still required |

## Final Contract Status

`TENANT ADMIN ONLINE STORE SECOND BRAIN CONTRACT — BLOCKED BY RECONCILIATION`

The nine-step journey is locked, but policy count and other mandatory-readiness product decisions prevent a non-contradictory implementation-ready claim.
