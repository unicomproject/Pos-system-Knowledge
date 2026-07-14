<!-- title: POS Home Dashboard Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-10 -->


# POS Home Dashboard Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | POS Shell |
| Feature | POS Home Dashboard |
| Status | In Progress |
| Completed Date | - |
| PR / Commit | `POS_UI` merged; home API on `5c6ae7a` |
| Tests | Pass (`test/widget_test.dart` home cases) |

## Feature Summary

`PosHomeScreen` loads `GET /api/v1/pos/home` after POS session bootstrap. Shows
start-sale hero, optional online orders card, and bottom action cards (returns,
customer, parked sales, cash drawer). Uses shell fallback state while loading or
on API error. Card enablement and metrics come from backend payload; start sale
also requires trusted device and open till in UI access rules.

Placeholder routes exist for several bottom cards. Online orders action has no
route (`routeExists: false`).

## Related Second Brain Files

| Area | File |
|---|---|
| Implementation map | [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cashier_POS_Implementation_Map]] |
| Backend status | [[../Backend/POSOperations/Pos_Home_Dashboard_Implementation_Status]] |
| User journey | [[../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]] |

## Files Changed

```text
lib/features/pos_shell/presentation/screens/pos_home_screen.dart
lib/features/pos_shell/presentation/providers/pos_home_dashboard_provider.dart
lib/features/pos_shell/application/state/pos_home_dashboard_state.dart
lib/features/pos_shell/data/datasources/pos_home_remote_datasource.dart
lib/features/pos_shell/presentation/widgets/home/*
```

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Widget | `widget_test.dart` — `/pos/home`, Start Sale hero, disabled start sale | Pass |

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] | Home flow and API |
| [[../Full_Feature_Status_Index]] | Status row |

## Related Files

- [[../Full_Feature_Status_Index]]
