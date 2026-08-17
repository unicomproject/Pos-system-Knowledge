<!-- title: Till Session Open Close Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->


# Till Session Open Close Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | OutletTillDevice / POSOperations |
| Feature | Till session current / open / close |
| Status | Open completed; Close financial sync completed |
| Original API wiring date | 2026-07-09 |
| Branch | `POS_UI` (merged) |
| PR / Commit | `5c99b66`, `06048db` |
| Tests | Pass (`PosTillsControllerTests`, integration repository tests) |
| Close Till documentation | Synced to verified backend implementation |

Open Till product contract (2026-08-11): requirements documented; backend
**EXISTING / REUSE**; new API/table/attribute/permission/migration **NOT
REQUIRED**. Canonical:
[[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]].

Close Till product contract (verified 2026-08-15): existing route/schema and
permission are reused; authoritative calculation and atomic reconciliation are
implemented. Canonical:
[[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]].

## API Contract

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/tills/current-session` | Resolve open session for device |
| POST | `/api/v1/tills/open` | Open till with opening float |
| POST | `/api/v1/tills/close` | Close till with counted cash |

Also used for Open Till bootstrap: `GET /api/v1/devices/current`.

Permissions: `pos.till.open` (open), `pos.till.close` (close), and for current
session resolve any of `pos.till.open` / `pos.till.close` / `till.session.view`.

## Integration Status

| Layer | Status | Notes |
|---|---|---|
| Backend | Integrated | `PosTillsController`, `PosTillSessionService`, `PosTillSessionRepository` |
| Database | Integrated | `till_sessions` + unique open-session partial index; device/till assignment tables |
| Flutter till datasource | Integrated | open, close, current-session wired |
| Close Till screen | Integrated | Caller omits expectedCash; response financial values are authoritative |
| End Shift flow | Wired, runtime gate pending | Financial close is safe; complete authenticated End Shift acceptance remains |
| Open Till approved UI contract | Completed | Production runtime accepted 2026-08-11 |

## Migrations / Seeds

- `AddTillAuditableColumns`
- `AddTillActivationCodes`
- `SeedDevelopmentPosHomeContext` (dev outlet/till/device/cashier context)

No new migration is required for the Open Till screen or verified Close Till
target: existing `cash_reconciliations`, `till_session_events` and
`till_cash_movements` structures are reused.

## Verified Close Till State — 2026-08-15

- Cash Drawer summary/movement APIs and Flutter flow are implemented.
- Close ignores compatibility-only caller `ExpectedCash` and uses persisted,
  tenant/session/currency-scoped cash activity.
- One submitted reconciliation, session close and CLOSED event commit together.
- Approved mismatch reasons and 500-character closing-note maximum are enforced.
- Focused repository suite: 15/15 PASS; focused API suite: 10/10 PASS; full
  backend regression: 2174/2174 PASS;
  Release build: 0 errors; EF pending model changes: none.

## Known Limitations

- **Audit gap:** Open Till creates `till_sessions` only and does **not** write
  `till_session_events` with `OPENED`. Close Till **does** write `CLOSED` via
  `TillSessionEvent.RecordClosed`. Schema allows `OPENED`; no `RecordOpened`
  factory exists. Separate future gap — do not invent API/table for Open Till UI.

## Related Files

- [[../../Flutter/Sales/End_Shift_And_Close_Till_Implementation_Status]]
- [[../../Flutter/Till/Open_Till_Screen_Layout_Implementation_Status]]
- [[../../../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]]
- [[../../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Close_Till_Screen_Implementation_Specification]]
- [[../Full_Feature_Status_Index]]
