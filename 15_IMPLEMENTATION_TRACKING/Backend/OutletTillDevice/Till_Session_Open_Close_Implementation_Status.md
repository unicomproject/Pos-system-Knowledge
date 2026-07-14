<!-- title: Till Session Open Close Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-10 -->


# Till Session Open Close Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Backend |
| Module | OutletTillDevice / POSOperations |
| Feature | Till session current / open / close |
| Status | Completed |
| Completed Date | 2026-07-09 |
| Branch | `POS_UI` (merged) |
| PR / Commit | `5c99b66`, `06048db` |
| Tests | Pass (`PosTillsControllerTests`, integration repository tests) |

## API Contract

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/tills/current-session` | Resolve open session for device |
| POST | `/api/v1/tills/open` | Open till with opening float |
| POST | `/api/v1/tills/close` | Close till with counted cash |

Permissions include `pos.till.open`, `pos.till.close`, and related till session
codes seeded in development POS permission data.

## Integration Status

| Layer | Status | Notes |
|---|---|---|
| Backend | Integrated | `PosTillsController`, `PosTillSessionService` |
| Database | Integrated | `till_sessions`, till/device assignment tables |
| Flutter till datasource | Integrated | open, close, current-session wired |
| Close Till screen | Integrated | `POST /api/v1/tills/close` |
| End Shift flow | Integrated | Close till then logout on Flutter |

## Migrations / Seeds

- `AddTillAuditableColumns`
- `AddTillActivationCodes`
- `SeedDevelopmentPosHomeContext` (dev outlet/till/device/cashier context)

## Known Limitations

- Cash drawer summary/movements API not implemented for cashier detail screens
- Close till uses counted vs expected cash validation on backend

## Related Files

- [[../../Flutter/Sales/End_Shift_And_Close_Till_Implementation_Status]]
- [[../../../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]]
- [[../../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../Full_Feature_Status_Index]]
