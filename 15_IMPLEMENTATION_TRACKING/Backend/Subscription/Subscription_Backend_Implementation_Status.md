<!-- title: Subscription Backend Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-25 -->

# Subscription Backend Implementation Status

## Summary

| Item | Value |
|---|---|
| Module | Platform Subscription Plans |
| Status | Release 1 draft/pricing/features/limits/publish flow complete |
| Latest update | 2026-06-25 (feature entitlement save endpoint) |

## Status contract fix (2026-06-19)

- **Issue:** Publish/list responses returned `published` while DB stores `active`.
- **Fix:** `SubscriptionPlanMapper.ToApiStatus` now returns DB values (`draft`, `active`, `retired`).
- **Rule:** Backend must not return UI-only status aliases; frontend maps `active` → Published label.

## Verified endpoints

- `GET /api/v1/platform/subscription-plans`
- `POST /api/v1/platform/subscription-plans`
- `PATCH /api/v1/platform/subscription-plans/{planId}/pricing`
- `PATCH /api/v1/platform/subscription-plans/{planId}/limits` (added 2026-06-19)
- `PATCH /api/v1/platform/subscription-plans/{planId}/features` (added 2026-06-25)
- `POST /api/v1/platform/subscription-plans/{planId}/publish`

## Tests

- Unit tests: create, publish (response `active`), list item status `active`, pricing/limits/features update, permission/validation cases
- Build/test: **127/127 passed** after feature endpoint implementation (2026-06-25)

## Manual verification (2026-06-19)

Swagger/API flow on `http://localhost:5050`:

1. Platform login → JWT
2. POST create draft → `status: draft`
3. PATCH pricing → `base_price: 12900`
4. PATCH limits → `max_outlets/tills/users` saved
5. POST publish → `status: active`
6. GET list → item `status: active`

DB (`nytroz_pos_dev.subscription_plans`, plan `VERIFY-164143`):

- `base_price = 12900`, limits 5/10/25, `status = active`

## Remaining TODOs

- Angular integration for Modules/Features wizard steps using the existing permission catalog read source and the feature save endpoint
- Archive/delete/duplicate plan write endpoints if required by list UI actions

## Related Files

- [[../../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../../04_MODULE_KNOWLEDGE/Subscription/03_Technical_Contract]]

## Feature Entitlement Save Endpoint (Implemented 2026-06-25)

Endpoint: `PATCH /api/v1/platform/subscription-plans/{planId}/features`

Request data:

```json
{
  "featureAvailability": {
    "feature-guid": "included",
    "another-feature-guid": "not_available"
  }
}
```

Response data:

```json
{
  "id": "plan-guid",
  "includedFeatureIds": ["feature-guid"],
  "status": "draft"
}
```

Rules implemented:

- Reuses `GET /api/v1/platform-admin/permission-catalog` as catalog read source.
- Does not add a duplicate subscription catalog read endpoint.
- Draft plans only.
- Requires `platform.subscription_plans.edit`.
- Validates GUID feature IDs and active `platform_features` rows.
- Allows `included` and `not_available` only.
- Rejects `addon` for Release 1.
- Persists included features in `subscription_plan_features`.
- Removes not_available features from `subscription_plan_features`.
- Subscription wizard selects modules/features only; permission assignment remains role-permission responsibility.

Verification:

- `dotnet test tests\SCS.UnitTests\SCS.UnitTests.csproj --no-restore`: 127/127 passed.
- `dotnet build SCS.sln --no-restore`: passed after stopping stale local `.NET Host` process that locked API DLLs.

Remaining backend TODOs:

- Archive/delete/duplicate plan write endpoints if required by list UI actions.
- Angular still needs to integrate Modules/Features wizard steps with the catalog read source and feature save endpoint.

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
