<!-- title: Backend Subscription Plans -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Backend Subscription Plans

## Purpose

Implementation notes for the Super Admin Subscription Plans list backend API.

## Rules

- Reuse existing `subscription_plans`, `subscription_plan_features`, `platform_modules`, `platform_features`, and `tenant_subscriptions` entities.
- Do not hardcode plan rows, module names, or feature names in API/service code.
- Use Repository + Service pattern; no CQRS or MediatR.
- Platform Admin API only at `/api/v1/platform/subscription-plans`.
- Backend permission check is required; frontend checks are UX only.
- Do not add tenant e-commerce operational flow in this module.

## API

`GET /api/v1/platform/subscription-plans`

`POST /api/v1/platform/subscription-plans`

`POST /api/v1/platform/subscription-plans/{planId}/publish`

Query parameters:

- `pageNumber`, `pageSize`, `search`, `planType`, `status`, `billingCycle`, `currencyCode`, `sortBy`, `sortDirection`

Response includes:

- paginated `items`
- `statusCounts` (`all`, `draft`, `published`, `archived`)
- per-item action flags (`canView`, `canEdit`, `canDuplicate`, `canArchive`, `canDelete`)

## Development Seed

Development-only idempotent seed is provided through migration `SeedPlatformSubscriptionPlanPermissions`.

Do not seed production fake plan data.

## Second Brain Pre-Implementation Audit For Module/Feature Catalog Work

Second Brain path:

`C:\Users\User\Desktop\Nytroz POS - Second Brain\Pos-system-Knowledge`

Before editing backend or Angular for subscription wizard module/feature catalog work, read and verify these Second Brain files/folders:

1. `00_START_HERE/Current_Source_Of_Truth.md`
2. `01_RELEASE_SCOPE/Release_1_Scope.md`
3. `02_ACCESS_CONTROL/`
4. `05_BACKEND_ARCHITECTURE/`
5. `06_DATABASE_KNOWLEDGE/`
6. `09_ANGULAR_ADMIN_KNOWLEDGE/`
7. Any subscription-related docs, especially files whose names contain:
   - `Subscription`
   - `subscription`
   - `Feature_Catalog`
   - `feature_catalog`
   - `Module`
   - `Entitlement`
   - `Permission_Catalog`
   - `permission_catalog`

Specifically search for and inspect:

- `05_Subscription_Plans_Feature_Catalog.md`

Second Brain audit requirements:

- Confirm whether the subscription wizard module/feature catalog contract is already documented.
- Confirm whether the docs still say module/feature catalog endpoints are pending.
- Confirm whether subscription statuses are documented as `draft`, `active`, `retired`.
- Confirm whether any stale `published` / `archived` wording exists.
- Confirm whether the subscription wizard selects modules/features only, not permissions.
- Confirm whether permissions are documented as role-permission responsibility.
- Confirm whether `addon` is documented as Release 1 scope or out of scope.

If Second Brain already has correct documentation:

- Follow it.
- Do not create duplicate documentation.
- Update only stale or incomplete sections.

If Second Brain is missing this topic:

- Create or update the most appropriate subscription documentation file.
- Do not create random new folders.
- Prefer updating an existing subscription-related file.
- If no suitable file exists, create a clearly named file under the existing subscription/backend/admin documentation structure.

After implementation, update Second Brain with:

1. Final catalog read source: `GET /api/v1/platform/subscription-plans/catalog`
2. Final feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`
3. Wizard rule: Subscription wizard selects modules/features only. It must not select permissions.
4. Responsibility split: Subscription Plan = module/feature entitlement. Role Permission = permission assignment.
5. Release 1 availability behavior:
   - `included` = persisted in `subscription_plan_features`
   - `not_available` = removed/not persisted
   - `addon` = rejected/out of scope unless real add-on pricing is implemented
6. Status truth: current backend statuses are `draft`, `active`, `retired`.
7. Filtering rule: subscription wizard must show only tenant/POS entitlement-relevant modules/features. Platform-admin-only modules/features must not be shown unless explicitly documented as tenant-entitled.
8. Final API request/response contracts.
9. Files changed.
10. Tests/build verification results.

Final implementation report must include:

- Which Second Brain files were read.
- Which Second Brain files were updated or created.
- Any stale documentation found.
- Any documentation gaps fixed.
- Any remaining mismatches between code and Second Brain.

## Subscription Catalog Architecture Correction 2026-06-25

Supersedes earlier guidance that the subscription wizard should read `GET /api/v1/platform-admin/permission-catalog` directly.

Final catalog read source: `GET /api/v1/platform/subscription-plans/catalog`.

Final feature save endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`.

Rules:

- Permission Catalog = technical access-control hierarchy for role-permission assignment.
- Subscription Catalog = commercial entitlement hierarchy for subscription plan creation.
- Subscription wizard selects commercial modules/features only; it must not select permissions.
- Core/default subscription features are locked included and protected by backend validation.
- Optional features support only `included` and `not_available`.
- `addon` is out of Release 1 and must not be rendered or sent.
- `included` persists enabled rows in `subscription_plan_features`.
- `not_available` removes or does not persist rows in `subscription_plan_features`.
- Status truth remains `draft`, `active`, `retired`.
- POS Online Orders / E-commerce is Release 2/deferred and must not appear in the R1 subscription wizard.

Commercial modules returned to UI:

- Core POS: locked included.
- Tenant Operations: locked included.
- Inventory: optional.
- Customers & Loyalty: optional.
- Returns & Exchanges: optional.
- Reports: optional.

See [[04_Subscription_Catalog_Model]] for the final contract, metadata fields, response shape, validation behavior, and verification results.

