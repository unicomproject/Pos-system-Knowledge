<!-- title: POS Home Dashboard Backend Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-15 -->


# POS Home Dashboard Backend Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | POSOperations |
| Feature | `GET /api/v1/pos/home` |
| Status | Completed |
| Completed Date | 2026-07-08 |
| Branch | `POS_UI` (merged) |
| PR / Commit | `5c6ae7a`, `9bdf4f9` |
| Tests | Pass (`PosHomeDashboardRepositoryTests`, controller tests) |

## Feature Summary

Returns cashier dashboard payload: context resolution, card enablement,
permissions, unread notification count, cashier/till/device labels, and summary
metrics (returns count, customers count, parked sales count, cash drawer balance).

When device/till/session cannot be resolved, returns structured
`contextResolved: false` with `reasonCode` and `requiredAction` instead of 404.

## Integration Status

| Layer | Status | Notes |
|---|---|---|
| Backend | Integrated | `PosHomeController`, `PosHomeDashboardService` |
| Flutter home screen | Integrated | `pos_home_remote_datasource.dart` |
| Card click destinations | Partial | Several cards still route to placeholders |

## Verification Update (2026-07-13)

- Corrected `PosHomeController` to forward `deviceFingerprint` before the request
  `CancellationToken` when calling `GetPosHomeAsync`.
- Exact fingerprint hashing and trusted, active tenant/device/till/outlet assignment
  validation remain in the existing repository flow; no fallback lookup was added.
- Release solution build passed with 0 warnings and 0 errors.
- POS Home controller, service, and repository focused tests passed (11 total).
- Full solution tests passed 715 of 721; six unrelated PlatformAdministration
  integration tests require the local PostgreSQL column
  `platform_users.created_by_platform_user_id`.
- No schema or data change was made, and no migration is required for this fix.

## Dashboard Contract Extension (2026-07-23)

- Added additive `branding` projection using `tenant_profiles.trading_name` and
  `tenants.display_name` fallback. The historical `tenant_profiles.logo_url`
  projection has been superseded: current schema resolves logo through
  `tenant_profiles.logo_media_asset_id` -> `media_assets.id`.
- Added cashier effective tenant-role label from the latest active tenant role.
- Added explicit `CURRENT_TILL_SESSION` summary scope, business date, session ID,
  currency, gross sales, completed transaction count, completed refunds,
  discounts, and net sales.
- Summary includes non-cancelled `COMPLETED` orders in `PAID`,
  `PARTIALLY_REFUNDED`, or `REFUNDED` payment state for the resolved till session.
  Gross is subtotal (tax is not added); net is total minus refunded amount,
  matching the Tenant Admin reporting projection.
- No database migration was required.
- Focused verification: controller 1/1 pass; repository integration 5/5 pass.
  Application/API/Infrastructure projects compile in Release. Full solution build
  is blocked by the pre-existing duplicate `GetProductByBarcodeAsync` method in
  `PosReturnServiceTests.FakeProductCatalogRepository`.

## Current-session production hardening (2026-09-15)

- Restored the typed `summary` response and repository aggregation to current
  tenant/outlet/till/open-session scope.
- Added explicit Returns and Discounts applicability while preserving meaningful
  zero for base metrics and null for unavailable/unauthorized fields.
- Enforced the existing section and five metric permissions in the application
  service; Flutter permission filtering remains UX enforcement.
- Backend API build passed with 0 warnings/errors. Focused service tests passed
  7/7, repository tests 6/6, and controller tests 1/1.
- No migration was required; existing `sales_orders`, `sales_refunds`, till and
  session relationships are used.

## Financial semantics correction (2026-09-15)

- Corrected Gross Sales from `TotalAmount + DiscountAmount` to `SubtotalAmount`,
  preventing tax from being counted in Gross.
- Retained completed partially/fully refunded orders in transaction, gross,
  discount, return and net aggregates.
- Net Sales now directly sums `TotalAmount - RefundedAmount`, matching the
  established reporting implementation.
- Regression coverage uses `SalesOrder.RecordRefund()` for partial and full
  refunds and verifies tax, unpaid/cancelled exclusion and tenant/outlet/till/
  session isolation. This is implemented and focused-test verified; PostgreSQL,
  live API and live Flutter acceptance remain pending.

## Permissions

Requires `pos.home.view` or compatibility alias `pos.dashboard.view`. Start Sale card also
depends on trusted device + open till session in backend payload and Flutter
access rules.

## Related Files

- [[../../Flutter/Pos_Shell/Pos_Home_Dashboard_Implementation_Status]]
- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/03_Technical_Contract]]
- [[../Full_Feature_Status_Index]]
