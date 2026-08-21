<!-- title: Cash Drawer Chunk 1 Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Cash Drawer Chunk 1 Implementation Status

> Historical implementation evidence for the legacy writer. Current canonical
> authority is [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]].

**Status:** CANONICAL CASH IN BACKEND COMPLETE — FLUTTER PENDING

## Source of truth

- Canonical manual movement ledger: `cash_movements` linked to
  `cash_movement_types`.
- Request-id idempotency is persisted on `cash_movements`.
- Cash movement type catalog is canonical and read through the movement-type
  API.
- Cash sales/refunds continue to come from `sales_payments` filtered to the CASH
  payment method.
- Drawer hardware audit remains `cash_drawer_operations`.
- Legacy `till_cash_movements` remains historical / compatibility state only;
  Cash In no longer dual-writes to it.

## Implemented

- Secured summary, paginated movement read, and manual movement endpoints under
  `/api/v1/pos/cash-drawer`.
- Added canonical movement-type read API for Cash In (`GET
  /api/v1/pos/cash-movement-types?direction=IN`).
- Backend-authoritative opening + cash sales - cash refunds + cash in - cash
  out - cash drops calculation now derives from canonical `cash_movements` and
  `cash_movement_types`.
- Canonical Cash In persistence uses `cash_movements` with server-side
  validation for permission, trusted device, till assignment, open session,
  movement type, amount, and tenant isolation.
- Request-id idempotency and tenant-scoped uniqueness are enforced with
  PostgreSQL-safe constraints and repository replay/conflict handling.
- Migration `20260815133611_CanonicalizeCashInMovements` created and applied
  locally; approved global IN movement types were seeded deterministically.
- Existing hardware drawer and close-till flows remain reused.

## Final acceptance matrix (Chunk 1 backend closure)

| Area | Result |
| --- | --- |
| Permission denial (summary / movements / create) + role-name bypass | PASS |
| Untrusted / inactive / cross-tenant device | PASS |
| Closed / no-open till / session mismatch | PASS |
| Zero / negative amount, unsupported type, missing reason | PASS |
| Same request same payload / conflicting payload | PASS |
| Same request ID across tenants / distinct request IDs | PASS |
| Relational simultaneous duplicate | PASS |
| Payment status filter PAID vs FAILED/CANCELLED/PENDING | PASS |
| CARD / QR / mixed split exclusion | PASS |
| Cash refund partial + full; CARD/QR refunds excluded | PASS |
| History newest-first, session + tenant isolation, pagination totals without mirrored inflation | PASS |

## Verification counts (2026-08-15 canonical cash-in final closure pass)

- Final migration: `20260815133611_CanonicalizeCashInMovements`.
- EF pending-model check: PASS — `No changes have been made to the model since the last migration.`
- Schema update: PASS — applied locally to PostgreSQL.
- API solution Release build: PASS — 0 errors, 0 warnings.
- Focused UnitTests (`PosCashDrawerServiceTests`): PASS, 13/13.
- Focused IntegrationTests (`PosCashDrawerFinancialRepositoryTests` [11/11] + `PosCashDrawerPostgreSqlConcurrencyTests` [1/1] + `PosTillSessionRepositoryTests` [14/14]): PASS.
- Focused ApiTests (`PosCashDrawerControllerTests`): PASS, 7/7.
- Full backend solution build: PASS — 0 errors.
- Full backend solution test sweep: PASS, 2,172 / 2,172 — UnitTests 1092/1092, IntegrationTests 546/546, ApiTests 469/469, Flow4FixtureCli.Tests 17/17, LocalPrintAgent.Tests 48/48.
- Backend `git diff --check`: PASS.

## Implementation status summary

```text
Canonical cash_movements persistence = IMPLEMENTED
Cash movement type API = IMPLEMENTED
Canonical generic POST = IMPLEMENTED
Global system Cash In types = IMPLEMENTED
Idempotency = IMPLEMENTED
PostgreSQL uniqueness hardening = IMPLEMENTED
Tenant isolation = VERIFIED
Permission enforcement = VERIFIED
Trusted device/till/open-session validation = VERIFIED
Expected cash canonical integration = VERIFIED
Backend regression = VERIFIED
Flutter backend wiring = COMPLETE (Chunk 2)
Responsive runtime acceptance = PENDING
```

## Flutter note (gap-closure pass)

- Flutter production files were not changed in the backend Chunk 1 closure task.
- Flutter Cash In API integration is tracked separately in
  [[../../Flutter/Hardware/Cash_In_Chunk_2_Flutter_Backend_Integration_Status]].
- Expected cash remains backend-authoritative via `GET
  /api/v1/pos/cash-drawer/summary`.

## Remaining scope (Chunk 2)

Backend Chunk 1 closure is complete. Flutter API integration is tracked under
Cash In Chunk 2; final responsive/runtime acceptance remains pending.
