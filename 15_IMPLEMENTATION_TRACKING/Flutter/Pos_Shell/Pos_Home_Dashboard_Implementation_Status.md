<!-- title: POS Home Dashboard Implementation Status -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-07-24 -->


# POS Home Dashboard Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter |
| Module | POS Shell |
| Feature | POS Home Dashboard |
| Status | Testing |
| Completed Date | - |
| PR / Commit | `POS_UI` merged; home API on `5c6ae7a` |
| Tests | Pass (`pos_home_dashboard_test.dart`, 4/4); `flutter analyze` clean |

## Feature Summary

`PosHomeScreen` loads `GET /api/v1/pos/home` after POS session bootstrap. Shows
start-sale hero, optional online orders card, and bottom action cards (returns,
customer, parked sales, cash drawer). Uses shell fallback state while loading or
on API error. Card enablement and metrics come from backend payload; start sale
also requires trusted device and open till in UI access rules.

Placeholder routes exist for several bottom cards. Online orders action has no
route (`routeExists: false`).

## Production Dashboard Redesign (2026-07-23)

- Replaced the hero/summary-card composition with a responsive cashier profile,
  six-action configuration grid, and current-session summary.
- Added one reusable `PosHomeActionTile` with 52/48 media/content composition,
  code-based arrow, `CustomPainter` dots, disabled semantics and fallback icon.
- Added tenant branding, cashier role, device status, read-only outlet/till
  context, and API-backed current-session currency metrics.
- End Shift routes to `/pos/cash-drawer/close-till`; it never logs out directly.
- Online Orders remains disabled because no production destination exists.
- Resume Held Sales remains disabled because `/pos/parked-sales` is still a
  placeholder and the backend Holds API is not connected to the Flutter screen.
- All six supplied action illustrations are integrated as transparent RGBA
  assets. Safe code-icon fallbacks remain for asset-load failure.

Final mapped paths:

```text
assets/images/pos_home_start_new_sale.png
assets/images/pos_home_returns_exchanges.png
assets/images/pos_home_cash_drawer.png
assets/images/pos_home_online_orders.png
assets/images/pos_home_resume_held_sales.png
assets/images/pos_home_end_shift.png
```

## File-Level UI Modularization (2026-07-24)

The former 1078-line `pos_home_dashboard.dart` was reduced to a 96-line
high-level composition widget without changing rendered behaviour. Components
now live in separate files under the existing `widgets/home` folder:

```text
pos_home_dashboard.dart
pos_dashboard_header.dart
pos_branding.dart
pos_session_status_chip.dart
pos_operational_context_card.dart
cashier_profile_card.dart
cashier_profile_status.dart
dashboard_action_builder.dart
dashboard_action_grid.dart
dashboard_action_card.dart
dashboard_dot_pattern.dart
session_summary_panel.dart
session_summary_card.dart
pos_home_bottom_navigation.dart
```

`dashboard_action_builder.dart` owns the existing card definitions and delegates
permission decisions to `PosHomeDashboardState.accessFor`; access logic is not
duplicated. Semantics, tooltips, disabled overlays, full-card `InkWell`
interaction, routes, responsive breakpoints and loading/error composition are
preserved.

## Summary Metric Icon Styling (2026-07-24)

Summary values remain API-backed. The shared `SessionSummaryCard` now accepts
metric-specific foreground and pastel background colours. Total Sales is
orange, Transactions green, Returns purple, Discounts amber and Net Sales blue.
Icon containers are 56x56 logical pixels with 30 logical-pixel Material icons.

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
lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart
test/features/pos_shell/pos_home_dashboard_test.dart
```

## Tests Written

| Test Type | File / Test Name | Result |
|---|---|---|
| Widget | `widget_test.dart` — `/pos/home`, Start Sale hero, disabled start sale | Pass |
| Widget | `pos_home_dashboard_test.dart` — context, summary, disabled semantics, tablet, mobile and desktop overflow | Pass (4/4) |
| Static | `flutter analyze` | Pass, no issues |

## Second Brain Updates

| File Updated | Update Summary |
|---|---|
| [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter/Flutter_Cashier_New_Sale_Implementation]] | Home flow and API |
| [[../Full_Feature_Status_Index]] | Status row |

## Related Files

- [[../Full_Feature_Status_Index]]
