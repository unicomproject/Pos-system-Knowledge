<!-- title: Start Sale UI Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-18 -->


# Start Sale UI Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | Sales |
| Feature | Start Sale UI (POS home + New Sale) |
| Status | In Progress |
| Completed Date | - |
| Developer | POS team |
| Reviewer | - |
| PR / Commit | `pos-home-dashboard` branch |
| Tests | Passed (`flutter test`) |

## Feature Summary

POS shell, home dashboard, and New Sale catalog/cart UI are implemented on branch
`pos-home-dashboard`. Sale checkout, backend cart APIs, payment capture,
barcode scan, customer/discount/park actions, and receipt flow are not wired.

See [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]]
for the full implementation map.

## Related Second Brain Files

| Area | File |
|---|---|
| Implementation map | [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] |
| User journey (target) | [[../../03_USER_JOURNEYS/Cashier/04_Start_Sale_Flow]] |
| Module overview | [[../../04_MODULE_KNOWLEDGE/Sales/01_Module_Overview]] |
| Functional rules | [[../../04_MODULE_KNOWLEDGE/Sales/02_Functional_Rules]] |

## Files Changed

```text
lib/features/pos_shell/**
lib/features/sale/presentation/**
lib/features/cart/**
lib/core/access/pos_access_codes.dart
lib/shared/pos_session/**
lib/app/router/app_router.dart
test/widget_test.dart
```

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Widget | `test/widget_test.dart` — home, New Sale, cart, permissions | Pass |
| Unit | `posNewSaleProductMatchesCategory`, cart ordering | Pass |

## Test Commands Run

```text
flutter analyze
flutter test
```

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] | Added implementation map |
| [[../Full_Feature_Status_Index]] | Updated status row |
| This file | Status In Progress |

## Related Files

- [[../Full_Feature_Status_Index]]
