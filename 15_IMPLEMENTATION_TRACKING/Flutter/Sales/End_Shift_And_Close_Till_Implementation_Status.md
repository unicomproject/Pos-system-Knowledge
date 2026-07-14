<!-- title: End Shift And Close Till Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-10 -->


# End Shift And Close Till Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Cash Drawer / Till |
| Feature | Close till + End Shift logout |
| Status | Completed |
| Completed Date | 2026-07-09 |
| Branch | `POS_UI` / `Log_in_01` (merged) |
| PR / Commit | `a58e446`, `d04ecf0` |
| Tests | Manual / widget coverage partial |

## Feature Summary

Cashier sidebar **End Shift** replaces direct logout when till session is open.
Flow: End Shift → `/pos/cash-drawer/close-till?endShift=true` →
`POST /api/v1/tills/close` success → clear session → `/tenant-login`.

Normal close-till (without end shift) re-bootstraps POS session and returns to
post-login route.

## Integration Status

| Step | Status | API |
|---|---|---|
| Open till required check | Integrated | `GET /api/v1/tills/current-session` |
| Close till form | Integrated | UI + local form state |
| Close till submit | Integrated | `POST /api/v1/tills/close` |
| End shift logout | Integrated | No extra API; uses tenant session clear |
| Tenant Admin logout | Unchanged | Separate sidebar/logout path |

## Tenant Admin Impact

None. End Shift is cashier POS sidebar only.

## Files Changed

```text
lib/features/pos_shell/presentation/widgets/sidebar/pos_sidebar.dart
lib/features/cash_drawer/presentation/screens/pos_close_till_screen.dart
lib/features/cash_drawer/presentation/providers/cash_drawer_provider.dart
lib/features/till/data/datasources/till_remote_datasource.dart
```

## Related Files

- [[../../Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- [[../../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../Full_Feature_Status_Index]]
