<!-- title: Online Storefront, Cart & Checkout Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-31 -->

# Online Storefront, Cart & Checkout Technical Contract

## Purpose

Defines the implementation contract for `Online_Store_Cart_Checkout`. This contract is based on
new OneVerz POS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/storefront/catalog`, `/api/v1/storefront/products`, `/api/v1/carts`, `/api/v1/checkout`, `/api/v1/checkout/events` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/storefront/catalog` | Module API group |
| `/api/v1/storefront/products` | Module API group |
| `/api/v1/carts` | Module API group |
| `/api/v1/checkout` | Module API group |
| `/api/v1/checkout/events` | Module API group |

## Database Contract

| Table | Contract |
|---|---|
| `shopping_carts` | Used by this module |
| `shopping_cart_items` | Used by this module |
| `shopping_cart_item_options` | Used by this module |
| `shopping_cart_item_components` | Used by this module |
| `checkout_sessions` | Used by this module |
| `checkout_session_lines` | Used by this module |
| `checkout_session_line_options` | Used by this module |
| `checkout_session_line_components` | Used by this module |
| `checkout_events` | Used by this module |
| `product_channel_visibility` | Used by this module |
| `price_list_channels` | Used by this module |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new OneVerz POS MVP module boundaries.

## Out Of Scope

- Native customer mobile app
- Own delivery management
- Marketplace seller portal
- Offline customer checkout

## Related Files

- [[04_MODULE_KNOWLEDGE/22_Online_Store_Cart_Checkout/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/22_Online_Store_Cart_Checkout/02_Functional_Rules]]

## Tenant Admin Nine-Step Technical Contract — 2026-08-27

Base API: `/api/v1/tenant-admin/online-store`. Controller → `ITenantAdminOnlineStoreService` → `TenantAdminOnlineStoreService` → EF Core/PostgreSQL. The current service enforces tenant context, permission, feature entitlement, media ownership, readiness, audit events and idempotent publish.

Persistence owners are `tenant_settings` (`online_store.defaults` JSON), `sales_channels`, `platform_sales_channels`, `tenant_domains`, `media_assets`, `storefront_banners`, `storefront_policies`, `product_channel_visibilities`, `products`, `product_variants`, `fulfillment_methods`, `fulfillment_method_outlets`, `outlet_business_hours`, `outlets`, `tenant_users`, `audit_logs`, and `idempotency_requests`.

The source service exposes readiness steps only as `PASS` or `BLOCKED`. Desired `NOT_STARTED / IN_PROGRESS / COMPLETE / BLOCKED` progress is not persisted and must not be independently inferred as business truth by Flutter.

Full matrix and gap register: [[../../03_USER_JOURNEYS/Tenant_Admin/22_Online_Store_Setup_And_Publish_Flow]].

## Tenant Admin Step 5 Branding Integration — 2026-08-31

Flutter reads and writes `/api/v1/tenant-admin/online-store/branding` with typed DTO/entity/provider layers. The persisted contract is limited to logo media ID, favicon media ID, primary colour and secondary colour; response image URLs are preserved for rendering.

Logo and favicon uploads use `/media/ONLINE_STORE_LOGO` and `/media/ONLINE_STORE_FAVICON`. A successful upload is attached with `PUT /branding`; replaced media is deleted only after attachment succeeds. Removal first persists a null branding reference, then deletes the media asset, with rollback attempted if deletion fails. Flutter prevents concurrent branding media operations and preserves the previous asset on attach failure.

Client validation mirrors the backend's 5 MB and supported MIME contract, while backend tenant ownership, permission, entitlement, signature and raster-dimension validation remain authoritative. Step readiness is always reloaded from backend projections.
