<!-- title: Cash Drawer Chunk 2 Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Cash Drawer Chunk 2 Implementation Status

> Historical UI acceptance evidence only. It does not certify the canonical
> Cash In architecture. Current authority is
> [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
> and [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification]].

**Status:** UI CHUNK COMPLETE — CANONICAL CASH IN DATA ALIGNMENT PENDING

| Item | Value |
|---|---|
| Platform | Flutter (+ Chunk 1 backend contracts unchanged) |
| Module | Hardware / Till / Cash Control |
| Feature | Cash Drawer final UI + responsive + acceptance |
| Status | Completed |
| Completed Date | 2026-08-13 |
| Tests | Passed (focused Cash Drawer + related regressions) |

## Feature Summary

Final Cash Drawer production UI on top of Chunk 1 backend-authoritative summary, movements, and mutations. One white main content card under the POS shell with Till Summary, Drawer Actions, and Recent Cash Movements. Phone / tablet / desktop layouts use shared `TenantAdminBreakpoints`. Permissions follow `cash_drawer.view`, `cash_drawer.manage`, `cash_drawer.movement.create`, and `pos.till.close`.

## Final UI

- Cash Drawer title + subtitle **inside** the main white content card
- No main-screen back arrow
- No Continue-to-Dashboard button
- Till Summary: Till, Status, Opening Cash, Cash Sales, Current Expected Cash (emphasized via `TenantAdminColors.expectedCashSurface`)
- Drawer Actions: Open Drawer, Cash In, Cash Out / Drop, Close Till
- Recent Cash Movements (table on tablet+, cards on phone)
- Loading / error / empty / till-closed / forbidden states

## Components

| Area | Path |
|---|---|
| Main screen | `lib/features/cash_drawer/presentation/screens/pos_cash_drawer_screen.dart` |
| Header | `.../widgets/cash_drawer_page_header.dart` |
| Summary | `.../widgets/cash_drawer_till_summary_section.dart` |
| Actions | `.../widgets/cash_drawer_actions_section.dart` |
| Movements | `.../widgets/cash_drawer_movements_section.dart` |
| Provider (Chunk 1 reused) | `.../providers/cash_drawer_provider.dart` |
| Theme tokens | `lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart` |
| Permission helper | `lib/core/access/pos_permission_access.dart` (`canCreateCashDrawerMovement` → `cash_drawer.movement.create`) |

## Shared theme tokens reused

- Primary orange: `TenantAdminColors.posHomeAccentOrange`
- Shell/background: `TenantAdminColors.background` / `posHomeDarkBackground`
- Surface: `TenantAdminColors.surface`
- Text: `bodyText`, `mutedText`
- Border: `TenantAdminColors.border`
- Success / Error / Info: `success`, `danger`, `info`
- Warning banners: `warningSurface`, `warningBorder`
- Expected cash emphasis: `expectedCashSurface`

### New shared tokens added (canonical theme only)

- `TenantAdminColors.successSurface` / `successBorder`
- `TenantAdminColors.dangerSurface` / `dangerBorder`
- `TenantAdminColors.expectedCashSurface` (Chunk 2)
- `warningSurface` / `warningBorder` (shared; used by Cash Drawer banners)

Direct Cash Drawer feature hex colours introduced: **NO**

## Responsive

Breakpoints: `TenantAdminBreakpoints.mobile` (600), `tablet` (900), `desktop` (1280); insets via `TenantAdminInsets.pageForWidth`.

| Size | Summary | Actions | Movements |
|---|---|---|---|
| Phone | 1-column tiles | stacked action cards | movement cards |
| Tablet portrait | 2–3 wrap columns | stacked or 2×2 when wide enough | cards until tablet width |
| Tablet landscape | wrap / 3 columns | 2×2 grid at tablet+ | table when ≥ tablet |
| Desktop | 5-column summary | actions \|\| movements side-by-side | table |

## Permissions

| Permission | UI |
|---|---|
| no `cash_drawer.view` | Forbidden screen |
| no `cash_drawer.manage` | Open Drawer disabled |
| no `cash_drawer.movement.create` | Cash In / Cash Out / Drop disabled |
| no `pos.till.close` | Close Till disabled |

## Actions

| Action | Integration |
|---|---|
| Open Drawer | Existing `hardware.cashDrawerControllerProvider.triggerManualNoSaleOpen` |
| Cash In | Route `/pos/cash-drawer/cash-in` + Chunk 1 `recordCashIn` → refresh |
| Cash Out / Drop | Route `/pos/cash-drawer/cash-drop` + Chunk 1 mutation → refresh |
| Close Till | Route `/pos/cash-drawer/close-till` existing flow |

## Verification (2026-08-13)

### Flutter

- Cash Drawer path analyze: PASS (no issues)
- Focused Cash Drawer tests: PASS (provider, repository, screen/widget/permission/nav/responsive, close-till form/provider)
- Related permission + till + hardware recovery regression: PASS (58 combined in till/cash_drawer/hardware/permission run)
- Full `flutter analyze`: pre-existing unrelated errors in `test/features/sale/pos_authoritative_checkout_pricing_test.dart` only; **no Cash Drawer analyzer errors**
- `git diff --check` on Cash Drawer touched files: PASS

### Backend (Chunk 1 contracts unchanged)

- `dotnet build` API Release: PASS (0 errors, 0 warnings)
- Cash Drawer unit filter: PASS 24/24
- Cash Drawer + TillSession + Checkout + Return integration filter: PASS 201/201

### E2E / runtime

- Widget + provider integration covers load, permission, navigation, mutation success refresh, mutation failure (no local fake totals)
- Live device + physical cash-drawer pulse not executed in this verification environment
- Software Open Drawer path remains the existing hardware controller/API integration

## Known environment limitation

Physical cash-drawer hardware pulse confirmation was not available in the development verification environment. Software integration path is complete and covered by existing hardware recovery tests.

## Production gate

Historical Cash Drawer UI Chunk 2 evidence remains valid for layout and
permissions. Cash In Flutter canonical API integration is tracked in
[[Cash_In_Chunk_2_Flutter_Backend_Integration_Status]]. Final responsive and
authenticated runtime acceptance remains pending.
