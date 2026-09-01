<!-- title: Cash In Chunk 3 Final Production Acceptance -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Cash In Chunk 3 — Final Production Acceptance

**Status:** CASH IN PRODUCTION ACCEPTANCE COMPLETE

## Hierarchy completed

```text
Cash In Chunk 1:
COMPLETE

Cash In Chunk 2:
COMPLETE

Authenticated runtime:
PASS

Canonical database persistence:
PASS

Expected Cash E2E:
PASS

History:
PASS

Close Till financial consistency:
PASS

Permissions runtime:
PASS (view-denied live; create-denied live user unavailable without role mutation — API/Flutter gated + ApiTests)

No-open-till runtime:
PASS

Idempotency runtime:
PASS

Multi-currency:
PASS (runtime LKR session + automated USD persistence/UI evidence)

Responsive tablet:
PASS

Responsive narrow/mobile:
PASS

Keyboard-open:
PASS (focus/entry path verified; OS keyboard live on emulator not separately instrumented)

Text scaling:
PASS (1.5x widget matrix)

Long movement-type name:
PASS

Accessibility:
PASS (semantics/labels/actions; physical screen reader not available)

Flutter analyze:
PASS

Flutter regression:
PASS

Production acceptance:
PASS
```

## Runtime context (safe identifiers only)

- Backend: `http://localhost:5150` (Development)
- PostgreSQL: `UnifiedCommerceDb` @ localhost:5432
- Tenant: `DEV-TENANT-001` / OneVerz POS
- Outlet: Development Main Store (`bbbbbbbb-0001-...`)
- Cashier: Kavin (`CASHIER001@GMAIL.COM`)
- Device: POS-02 Web POS (trusted)
- Till: Front Till 02
- Till Session: OPEN `8ac7063c-66bf-4efc-a416-7f74b0b9ba30`
- Currency: LKR (session authoritative)

## Primary E2E Cash In

- BEFORE expected cash: `0.00`
- Movement type: Float Added (`FLOAT_ADDED` / global type id)
- Amount: `50.00`
- Note: `Final Cash In E2E acceptance`
- POST `/api/v1/pos/cash-drawer/movements` → 200
- Payload fields only: `requestId`, `deviceId`, `movementTypeId`, `amount`, `note`
- Manager PIN / tenant / till / currency authority fields: absent
- `cash_movements`: exactly 1 row for request id
- `till_cash_movements` CASH_IN duplicate write: 0
- AFTER expected cash / summary cashIn: `50.00`
- History: one Float Added entry by Kavin
- Idempotent replay same payload: 200, still 1 row
- Conflicting payload same requestId: 409 `cash_drawer.idempotency_conflict`, still 1 row

## Additional runtime

- Movement types API returned global IN catalog (backend-supplied)
- Temporary tenant custom type `Evening Shift Float` visible to DEV tenant, then removed
- Cross-tenant isolation: repository integration test `MovementTypes_DoesNotReturnOtherTenantTypes` + foreign type rejection
- No-open-till device POS-01: summary/post 404 `till_session.not_found`
- Zero/negative amount: 400
- Admin/inventory without cash drawer view: 403
- Close Till input formula matches summary (`opening + sales - refunds + cashIn - cashOut - drops`)

## Flutter validation

- Overflow fix: Reason dropdown `isExpanded` + selected ellipsis; summary value Flexible/ellipsis
- Focused cash_drawer tests: PASS
- `flutter analyze` cash_drawer: No issues found
- Full regression: recorded in closure report

## Limitations (non-blockers for Cash In financial acceptance)

- Physical cash-drawer hardware pulse: not required for Cash In financial journey
- Live separate user with `cash_drawer.view` but without `movement.create`: not available without role mutation
- Live non-LKR OPEN till session: not present; USD covered by automated persistence/UI tests
- Physical screen reader / second trusted device concurrent UI: not executed
