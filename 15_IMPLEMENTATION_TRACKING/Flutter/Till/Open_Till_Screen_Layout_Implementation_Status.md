<!-- title: Open Till Screen Layout Implementation Status -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-10 -->


# Open Till Screen Layout Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Till |
| Feature | Open Till tablet full-screen layout |
| Status | Completed |
| Completed Date | 2026-07-10 |
| Branch | `Sale_Screen` (uncommitted at audit) |
| PR / Commit | - |
| Tests | Pass (`open_till_form_test.dart` 3/3) |

## Feature Summary

Removed dark scaffold frame and unnecessary margins on cashier Open Till screen.
Layout now uses full-screen `Row` with stretched setup sidebar and embedded open
till form on tablet.

## API Dependency

| API | Status |
|---|---|
| `POST /api/v1/tills/open` | Integrated (pre-existing) |
| `GET /api/v1/devices/current` | Integrated (bootstrap) |

Screen data comes from device bootstrap and form defaults, not a separate open
till fetch API.

## Files Changed

```text
lib/features/till/presentation/screens/till_open_screen.dart
lib/features/till/presentation/widgets/open_till_form.dart
lib/shared/widgets/pos_setup_sidebar.dart (stretchVertically)
test/features/till/open_till_form_test.dart
```

## Related Files

- [[../../../03_USER_JOURNEYS/Cashier/03_Till_Open_Flow]]
- [[../../Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- [[../Full_Feature_Status_Index]]
