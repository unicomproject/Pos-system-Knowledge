<!-- status: Active canonical contract and current-source ledger -->
<!-- last_updated: 2026-08-15 -->
# Tenant Admin Add/Edit Brand — Canonical Contract and Source Truth

## Authority and truth labels

This file separates **LOCKED TARGET** from **CURRENT IMPLEMENTATION**. A locked target is not evidence that source exists. Executable source, migrations and tests remain authoritative for implementation status.

## Canonical architecture

- **BRAND-FE-LAYOUT-001 — LOCKED TARGET:** Add/Edit must render Brand-specific content inside the existing Tenant Admin common layout. Reuse `TenantAdminLayout`, shell scaffold, sidebar, header, footer, navigation, theme, spacing, responsive outer layout and breadcrumb pattern. Do not create a second shell.
- **BRAND-FE-LAYOUT-002 — LOCKED TARGET:** Add and Edit use one reusable Brand form/content implementation. Add initializes empty/default state; Edit loads by `brandId`, shows loading, then performs guarded one-time prefill.
- Brand Management remains full-width list when nothing is selected and list plus **read-only** Brand Details when selected. Do not convert that detail region into an editor.
- Add/Edit are separate route-content flows inside the common shell. No modal, drawer, editable side panel or Brand Preview.

## Locked Add/Edit UX

| Mode | Heading | Breadcrumb | Initialization |
|---|---|---|---|
| Add | `Add Brand` | `Product / Brand / Brand Management / Add Brand` | Empty/default fields |
| Edit | `Edit Brand` | `Product / Brand / Brand Management / Edit Brand` | Loading, GET by `brandId`, guarded one-time prefill |

Fields: Brand Name*, Code*, Sort Order, Brand Logo, Description, Status*. Actions: Back to List, Cancel, Save Brand. Brand Preview is **NOT REQUIRED**.

Edit must prefill Name, Code, Sort Order, existing logo, Description and Status. It must not show an editable empty form and later overwrite user-entered values.

## Business rules

| ID | Canonical rule | Current implementation |
|---|---|---|
| BR-Brand-001 | Brand belongs to authenticated Tenant; UI TenantId is never authoritative | IMPLEMENTED |
| BR-Brand-002 | Name required, trimmed, max 150 | IMPLEMENTED backend/DB; Flutter form MISSING |
| BR-Brand-003 | Code required, trimmed, uppercase, max 80 | IMPLEMENTED backend/DB; Flutter form MISSING |
| BR-Brand-004 | Normalized code unique within Tenant | IMPLEMENTED |
| BR-Brand-005 | Edit may retain its own code; another Brand's code conflicts | IMPLEMENTED repository logic; targeted tests incomplete |
| BR-Brand-006 | Description optional, trimmed, max 255 | IMPLEMENTED backend; DB text has no 255 check |
| BR-Brand-007 | Sort Order integer and >= 0 | IMPLEMENTED backend/DB |
| BR-Brand-008 | Editable statuses are ACTIVE and INACTIVE | IMPLEMENTED backend; Flutter form MISSING |
| BR-Brand-009 | DELETED is internal and absent from Add/Edit | IMPLEMENTED backend lifecycle; Flutter form MISSING |
| BR-Brand-010 | BrandSlug is server-managed and hidden | IMPLEMENTED derivation; max/conflict gaps remain |
| BR-Brand-011 | Logo optional | IMPLEMENTED backend capability |
| BR-Brand-012 | Logo JPG/JPEG/PNG, <= 2 MB | IMPLEMENTED backend; Flutter picker MISSING |
| BR-Brand-013 | Initial logo belongs to authorized Create journey without broad update authority | FAIL/P0 |
| BR-Brand-014 | Later logo replacement is an Update action | IMPLEMENTED |
| BR-Brand-015 | Created Brand remains created if optional logo fails; expose retryable partial success | MISSING/P0 |
| BR-Brand-016 | Cross-tenant GET/update/logo/delete prohibited | IMPLEMENTED |
| BR-Brand-017 | Unchanged Edit logo is not uploaded | LOCKED TARGET; form MISSING |
| BR-Brand-018 | Stale Edit must not overwrite newer update | MISSING/P1; mechanism OPEN DECISION |
| BR-Brand-019 | Repeated submit must be guarded | Flutter MISSING; server idempotency MISSING |
| BR-Brand-020 | Backend is authoritative for permissions/validation | IMPLEMENTED principle |
| BR-Brand-021 | Brand owns content only and reuses common shell | LOCKED TARGET |
| BR-Brand-022 | Add/Edit share one reusable form/content implementation | LOCKED TARGET; MISSING |

Brand Code allowed-character rule is **OPEN/GAP**; no regex is currently defined. Deleted-code reuse and restore semantics are also open.

## Field and validation contract

| Field | Frontend target | Backend current | Database current |
|---|---|---|---|
| Name | required, trim, max 150 | required/max 150 | varchar(150), non-null |
| Code | required, trim, uppercase, max 80 | required/max 80/normalized | tenant-unique varchar(80) |
| Description | optional, trim, max 255 | max 255 | nullable text; no 255 check |
| Sort Order | integer >=0; initial value OPEN | integer >=0; fallback 0 | integer default 0; check >=0 |
| Status | Active/Inactive only | ACTIVE/INACTIVE writes | lifecycle also permits DELETED |
| Logo | JPG/JPEG/PNG <=2 MB | size/MIME/extension/signature/dimensions checked | tenant-safe media FK |
| BrandSlug | hidden | derived from normalized code if omitted | required, max 180, tenant-unique |

Frontend Add/Edit validation is **NOT IMPLEMENTED**. BrandSlug explicit max validation and duplicate-slug domain translation are **GAPS**. Backend validation is PARTIAL because the Brand API does not expose stable field-addressable errors; Flutter must not parse messages.

## API and permissions

| Method | Route | Current permission | Status |
|---|---|---|---|
| GET | `/api/v1/brands` | view or manage | IMPLEMENTED |
| GET | `/api/v1/brands/{id}` | view or manage | IMPLEMENTED; sufficient Edit prefill |
| POST | `/api/v1/brands` | create or manage | IMPLEMENTED |
| PUT | `/api/v1/brands/{id}` | update or manage | IMPLEMENTED |
| DELETE | `/api/v1/brands/{id}` | delete or manage | IMPLEMENTED soft delete |
| POST | `/api/v1/brands/{brandId}/logo` | update or manage | IMPLEMENTED; initial-create authorization FAIL/P0 |

Dedicated logo removal endpoint: **MISSING / DOES NOT EXIST**. Unsupported Brand media currently maps to HTTP 400; target is 415 (**P1 GAP**).

Initial logo authorization outcome is LOCKED: a create-authorized user must complete initial logo attachment without receiving broad update authority. Atomic create-with-logo, narrowly scoped initial authorization, or another reviewed design remain implementation options.

Create then logo upload is not atomic. If logo fails after POST success, report Brand **CREATED**, logo **FAILED/NOT ATTACHED**, retain Brand ID, and allow logo-only retry without another create. Exact API/result mechanism is OPEN.

## Database contract

`brands`: `id`, `tenant_id`, `brand_code varchar(80)`, `brand_name varchar(150)`, `brand_slug varchar(180)`, nullable `description text`, `sort_order integer NOT NULL DEFAULT 0`, nullable `logo_media_asset_id`, `status varchar(40)`, `created_at`, `updated_at`, `created_by_tenant_user_id`, `updated_by_tenant_user_id`.

Implemented in source: unique `(tenant_id, brand_code)`, unique `(tenant_id, brand_slug)`, check `sort_order >= 0`, status ACTIVE/INACTIVE/DELETED, tenant-safe logo FK, and `products(tenant_id, brand_id) -> brands(tenant_id, id) ON DELETE RESTRICT`.

Migration `20260812163014_ImplementTenantAdminBrandContract` is **PRESENT IN SOURCE**. Database contract is **IMPLEMENTED IN SOURCE**. Application/deployment to a target PostgreSQL environment is **NOT VERIFIED BY THIS AUDIT**.

## Current implementation tracking

| Capability | Status | Priority |
|---|---|---|
| Brand List | IMPLEMENTED | — |
| Read-only Brand Details | IMPLEMENTED | — |
| Common Tenant Admin Layout | IMPLEMENTED / REUSE | — |
| Add route | MISSING | P0/Frontend phase |
| Edit route | MISSING | P0/Frontend phase |
| Shared Add/Edit content | MISSING/BLOCKED | P0/Frontend phase |
| CRUD/detail APIs | IMPLEMENTED | — |
| Database contract | IMPLEMENTED IN SOURCE | deployment unverified |
| Tenant isolation | IMPLEMENTED | — |
| BrandSlug derivation | IMPLEMENTED | — |
| Initial-logo authorization | FAIL/GAP | P0 |
| Create→logo recovery | MISSING | P0 |
| Field-addressable errors | MISSING | P1 |
| HTTP 415 mapping | GAP | P1 |
| Edit concurrency | MISSING | P1 |
| Explicit Brand audit events/logging | MISSING | P1 |
| Server idempotency | MISSING | P2/shared decision |
| Flutter Add/Edit QA | MISSING | P1 |
| PostgreSQL Brand constraint QA | MISSING/PARTIAL | P1 |

## Open decisions

- Exact UI initial Sort Order; persisted/backend fallback remains 0.
- Optimistic concurrency mechanism.
- Initial-logo authorization implementation mechanism.
- Partial-success API/result and retry mechanism.
- Brand soft-delete behavior when products reference it.
- Server idempotency priority/mechanism.
- Code character rule and deleted-code reuse/restore semantics.

## Locked implementation sequence and backend gate

Phase 0 canonicalization → Phase 1 backend/API/RBAC P0 closure → Phase 2 backend/API/permission/PostgreSQL tests → Phase 3 backend gate → Phase 4 Flutter Brand **content only** inside common layout → Phase 5 validation/loading/dirty/responsive behavior → Phase 6 end-to-end QA → Phase 7 final documentation sync.

Before Flutter integration: Create, Update, Detail, server slug, SortOrder and tenant isolation must remain acceptable; initial-logo authorization and create/logo recovery must PASS; validation contract must be approved; required RBAC and PostgreSQL tests must PASS.
