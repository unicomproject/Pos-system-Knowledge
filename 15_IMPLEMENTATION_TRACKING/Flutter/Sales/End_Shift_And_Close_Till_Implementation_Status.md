<!-- title: End Shift And Close Till Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# End Shift And Close Till Implementation Status

## Summary

| Item | Value |
|---|---|
| Platform | Flutter + backend dependency |
| Feature | Close Till and End Shift |
| Documentation | Complete for production implementation |
| Screen/API wiring | Implemented |
| Production status | Close Till financial sync complete; combined End Shift acceptance blocked |
| Blockers | Authenticated variance and End Shift runtime acceptance remain |
| Runtime acceptance | Started 2026-08-12; release-critical matrix not completed |

Chunk 1 backend remediation and Chunk 2 Flutter implementation are present in
the current working trees. Production status remains blocked until the full
Chunk 3 runtime matrix is executed against a build containing those changes.

### Financial contract sync verification — 2026-08-15

- Flutter no longer sends `expectedCash` in the Close Till request.
- `TillSession` parses `currencyCode`, `expectedCash`, `tillName` and
  `openedByName`; `ClosedTillSession` parses `outletId`.
- `CashMovement` parses backend `direction` and `currencyCode`.
- Focused Flutter contract/provider tests: 8/8 PASS.
- `flutter analyze`: PASS; full Flutter regression: 1048/1048 PASS.
- Backend focused Close Till repository tests: 15/15 PASS; full backend:
  2174/2174 PASS; EF pending model changes: none.

## Implemented Current Behaviour

- End Shift routes to `/pos/cash-drawer/close-till?endShift=true`.
- Normal Close Till uses `/pos/cash-drawer/close-till`.
- Existing componentized form accepts counted cash, mismatch reason and note.
- `POST /api/v1/tills/close` is integrated.
- Normal success refreshes POS bootstrap; End Shift success clears auth and opens
  tenant login.
- Failure does not intentionally log out or report local CLOSED success.

## Chunk 3 Runtime Acceptance — 2026-08-12

- Backend API listened on `http://localhost:5150`; PostgreSQL listened on 5432;
  the authenticated Pixel Tablet Flutter runtime was available.
- Real context resolved as Development Main Store / Front Till 01 / Kavin.
- Read-only PostgreSQL evidence found open session `TS-0167`
  (`6b873b84-b926-4b55-af8e-45f416879a7c`) with zero opening float.
- Runtime Close Till loaded the authoritative zero expected cash and displayed
  `Balanced`, but the running build exposed a legacy purple primary action.
- The Close Till action now explicitly uses centralized OneVerz orange token
  `TenantAdminColors.posHomeAccentOrange`; analyze passed and 11 focused tests
  passed. The running APK was not rebuilt after this correction.
- No Close Till submission was made during this acceptance attempt. The open
  session was preserved; no new reconciliation or CLOSED event was created.
- Balanced, Short, Over, repeated-submit, real PostgreSQL concurrency,
  permission/device/till/tenant negatives, network/rollback, normal navigation,
  End Shift, post-fix Phone/Tablet/Desktop and desktop keyboard acceptance remain
  unverified. Production readiness must not be claimed.

### Orange visual alignment (2026-08-14)

Close Till primary CTA, Save Draft outline, counted-cash focus border and info
icons use OneVerz orange tokens. Canonical visual contract:
[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Open_Close_Till_Orange_Visual_Direction]]
and status [[../Till/Open_Close_Till_Orange_Theme_Implementation_Status]].

## Integration Status

The current workspace implements server-authoritative Expected Cash, ignores
caller authority, atomically persists reconciliation/session/event, validates
canonical reasons and note length, and protects concurrent close. Previous
Chunk 1 regression evidence is 1,883 passed with a clean Release build. Chunk 3
still requires real runtime/database proof of those behaviours.

No new permission, table, attribute or migration is required by the verified
schema. Existing API routes are reused; their implementation/read model changes.

## Required Verification

| Gate | Required result |
|---|---|
| Backend focused tests | authoritative expected, balanced/variance, rollback, concurrency |
| Flutter focused tests | state, validation, one tap, navigation, responsive layout |
| Authenticated E2E | real normal close and End Shift behavior |
| Database read-only evidence | one session, reconciliation and CLOSED event |
| Failure evidence | no logout/fake close/duplicate on known failure |

## Change History

| Date | Correction |
|---|---|
| 2026-07-09 | Route, API and logout wiring recorded as completed |
| 2026-08-11 | Reclassified production feature to Blocked after source/schema audit |
| 2026-08-12 | Chunk 1/2 implementation present; Chunk 3 runtime started and remains blocked pending full post-fix acceptance matrix |

## Related Files

- [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]
- [[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Close_Till_Screen_Implementation_Specification]]
- [[../../Backend/OutletTillDevice/Till_Session_Open_Close_Implementation_Status]]
- [[../../../03_USER_JOURNEYS/Cashier/11_Till_Close_Flow]]
- [[../../Full_Feature_Status_Index]]
