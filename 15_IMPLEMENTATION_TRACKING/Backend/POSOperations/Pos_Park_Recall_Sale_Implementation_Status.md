<!-- title: POS Park Recall Sale Backend Implementation Status -->
<!-- status: Draft -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-06 -->

# POS Park Recall Sale Backend Implementation Status

## Status

**IN PROGRESS — CONTRACT ALIGNMENT REQUIRED.** Existing code is substantial, but the approved reference, expiry and permission-provisioning contract is not complete.

## Current Verified Evidence

| Area | Evidence |
|---|---|
| Controller | Tenant-authorized POST/GET `/api/v1/pos/holds`, POST recall and DELETE cancel |
| DTOs | Typed create, list item/list response, recall request/response and line DTOs |
| Service | Canonical permission checks and validation for lines, reason, expiry and idempotency |
| Repository | Backend summary calculation, held order/lines, user/till list scope, recall recalculation and atomic update |
| Entity/config | `PosOrderHold`, mappings, FKs, unique tenant/reference and tenant/id indexes, lifecycle check |
| Tests | Controller and service test files exist; full target coverage remains pending |
| Reference | Current `HOLD-000001` style |
| Expiry | Current nullable client `ExpiresAt`; future-only validation when supplied |
| Idempotency | Stable key required, hashed request comparison; same request replay, changed request conflict |

## Permission Evidence

`sales.park.create`, `sales.park.view`, `sales.park.recall` and legacy aliases are defined in `SalesPermissions`; service checks canonical permissions. Source search did not prove canonical permission-definition insertion, catalogue exposure or development Cashier-role assignment. These remain gaps. Cancel currently uses create permission; no `sales.park.cancel` is approved.

## Database Evidence

Initial migration source creates `pos_order_holds`; later model snapshot contains current columns, indexes, FKs and status constraint. A read-only Local Development check on 2026-08-06 confirmed `public.pos_order_holds` and migration `20260629203129_InitialCreate` in `__EFMigrationsHistory`. This is not cross-environment application proof. No migration for PS reference/mandatory server expiry exists; every other target environment remains unverified.

## Required Backend Work

- Generate tenant-safe `PS-{YYYY}-{NNNNN}` reference atomically.
- Remove client authority over standard expiry and set `held_at + 24 hours` from server time.
- Guarantee newly parked cashier holds have populated expiry greater than held time; decide whether schema enforcement/migration is required.
- Verify/fix canonical permission seed, catalogue and Cashier assignment.
- Preserve current status, user/till scope, idempotency and atomic recall/cancel behavior.
- Add target tests for expiry, reference concurrency, permission provisioning, tenant/till/user isolation and lifecycle races.
- Run build/tests, apply approved migration if required, then verify runtime DB/API.

## Acceptance Pending

No code was changed in documentation Phase 1. Backend alignment, automated tests, authenticated API validation and database evidence are pending. Do not mark Completed.

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/21_POS_Operations/08_Park_Recall_Sale_Feature]]
- [[../../../13_DECISIONS_AND_CHANGES/ADR/ADR_008_Park_Recall_Sale_Authority_And_Expiry]]
