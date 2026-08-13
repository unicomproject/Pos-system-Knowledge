# Cash Drawer Chunk 1 Implementation Status

**Status:** CASH DRAWER CHUNK 1 COMPLETE — READY FOR CHUNK 2

## Source of truth

- Runtime financial movement ledger: `till_cash_movements`.
- Cash sales/refunds: `sales_payments` filtered to the CASH payment method.
- `cash_movements` / `cash_movement_types` is not used as a second runtime ledger.
- Drawer hardware audit remains `cash_drawer_operations`.

## Implemented

- Secured summary, paginated movement read, and manual movement endpoints under `/api/v1/pos/cash-drawer`.
- Backend-authoritative opening + cash sales - cash refunds + cash in - cash out - cash drops calculation.
- CASH_IN, CASH_OUT and CASH_DROP persistence with open-session/device/tenant validation, permission checks, request-id idempotency and audit fields.
- Flutter Cash Drawer loads through a remote datasource/repository and refreshes summary and movements after a successful mutation.
- Artificial delay, local movement identifiers and client-side authoritative balance mutation removed from the production path.
- Existing hardware drawer and close-till flows remain reused.
- Concurrent same-request-id races are resolved by PostgreSQL unique index `uq_till_cash_movements_tenant_request_id` plus repository handling of unique/serialization failures into canonical replay or conflict responses (no unhandled 500).

## Final acceptance matrix (Chunk 1 gap closure)

| Area | Result |
| --- | --- |
| Permission denial (summary / movements / create) + role-name bypass | PASS (service) |
| Untrusted / inactive / cross-tenant device | PASS (service via till_session resolve codes) |
| Closed / no-open till / session mismatch | PASS (service + repository) |
| Zero / negative amount, unsupported type, missing reason | PASS (service) |
| Over-withdraw / exact boundary | PASS (repository) |
| Same request same payload / conflicting payload | PASS (repository) |
| Same request ID across tenants / distinct request IDs | PASS (repository) |
| Relational simultaneous duplicate | PASS (PostgreSQL concurrency, exactly 1 row) |
| Payment status filter PAID vs FAILED/CANCELLED/PENDING | PASS |
| CARD / QR / mixed split exclusion | PASS |
| Cash refund partial + full; CARD/QR refunds excluded | PASS |
| History newest-first, session + tenant isolation, pagination totals without mirrored inflation | PASS |

## Verification counts (2026-08-13 gap-closure pass)

- Final migration: `20260813125656_CompleteCanonicalCashDrawerDeviceAudit`.
- EF pending-model check: PASS — no changes since the latest migration.
- New migration created during this pass: NO.
- Schema changed during this pass: NO (production race-handler only).
- API project Release build: PASS — 0 errors, 0 warnings.
- Cash Drawer repository tests: PASS, 14/14.
- Cash Drawer PostgreSQL concurrency: PASS, 1/1 (exactly one financial row).
- Cash Drawer service acceptance tests: PASS, 18/18.
- Cash Drawer permission seed tests: PASS, 2/2.
- Related integration regressions (Till Session / Checkout / Cash Drawer / Return filter set): PASS, 65/65.
- Related unit regressions (Return / Cash Drawer / Hardware filter set): PASS, 85/85.
- Till / checkout API regressions: PASS, 17/17.
- Flutter Cash Drawer focused tests: PASS — repository/impl 2/2, close-till form 3/3, close-till provider 4/4, hardware drawer recovery 6/6 (15/15 combined focused run).
- Flutter Cash Drawer path analyze (`lib/features/cash_drawer` + cash-drawer endpoints): PASS — no issues found.
- Backend `git diff --check` on this-pass files: PASS (CRLF notices only).

## Flutter note (gap-closure pass)

- Restored backend-authoritative Cash Drawer provider/repository wiring after an accidental working-tree reset during verification.
- Confirmed: no `local-*` movement IDs and no artificial 250ms success simulation on the production mutation path.
- Expected cash remains backend-authoritative via `GET /api/v1/pos/cash-drawer/summary`.

## Remaining scope (Chunk 2)

**Completed.** See [[../../Flutter/Hardware/Cash_Drawer_Chunk_2_Implementation_Status]].

Overall Cash Drawer feature status: **PRODUCTION READY** (Chunk 1 + Chunk 2).
