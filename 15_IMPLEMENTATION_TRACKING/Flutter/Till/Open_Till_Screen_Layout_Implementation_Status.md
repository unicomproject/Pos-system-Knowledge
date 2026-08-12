<!-- title: Open Till Screen Layout Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-11 -->

# Open Till Screen Layout Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Till |
| Feature | Open Till screen (approved UI contract) |
| Requirements | **DOCUMENTED** |
| Backend contract | **EXISTING / REUSE** |
| New API / table / attribute / permission | **NOT REQUIRED** |
| Frontend vs approved contract | **COMPLETED** |
| Production runtime / E2E acceptance | **PASSED (2026-08-11)** |

## Feature Summary

Open Till Flutter presentation aligns with the approved 2026-08-11 contract:
Dashboard Top Bar reuse via `PosShellScaffold` (`isDashboard: true`), OneVerz
orange theme, white parent surface, bold/dark important text, and Phone +
Tablet + Desktop responsive behaviour. Authenticated Local Development E2E,
DB session verification, already-open conflict, offline failure safety, and
focused automated tests passed.

Canonical specs:

- [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Open_Till_Screen_Implementation_Specification]]

## API Dependency

| API | Status |
|---|---|
| `GET /api/v1/devices/current` | Integrated (bootstrap) |
| `GET /api/v1/tills/current-session` | Integrated |
| `POST /api/v1/tills/open` | Integrated |

## Known Gaps (documented, non-blocking)

- Opening note `0/100` remains UI-only (backend `opening_note` is unconstrained text).
- Open Till does **not** write `till_session_events.OPENED` (Close writes `CLOSED`). Classified as documented non-blocking future gap.

## Related Files

- [[../../../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]]
- [[../../Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- [[../../Full_Feature_Status_Index]]
