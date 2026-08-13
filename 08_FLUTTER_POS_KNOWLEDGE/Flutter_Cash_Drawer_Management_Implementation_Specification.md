<!-- title: Flutter Cash Drawer Management Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Flutter Cash Drawer Management Implementation Specification

## 1. Purpose

Canonical production contract for the Cashier **Cash Drawer** management screen
and its related Cash In / Cash Out·Drop / Open Drawer / Close Till entry points
in `Nytroz-POS-App`, before implementation chunks begin.

Functional / API / DB authority also lives in:

- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[../12_INTEGRATIONS/Cash_Drawer_Integration]] (physical hardware pulse only)
- [[../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]

## 2. Scope

| In scope | Out of scope |
|---|---|
| Cash Drawer main screen UI + state | Accounting GL / bank deposit |
| Till summary (simplified) | Duplicate Close Till business logic |
| Drawer actions (Open / Cash In / Cash Out·Drop / Close Till) | New physical drawer subsystem |
| Recent cash movements list | Offline completion of Cash In/Out/Drop |
| Phone + Tablet + Desktop responsive layout | Inventing new permission codes when catalog exists |
| Wiring to approved Cash Drawer financial APIs | Client-authoritative Expected Cash |

## 3. Screen Layout

Route target: `/pos/cash-drawer` (existing).

```text
[ Standard POS Top Bar — reused shell header ]
[ White main content card ]
    Title: Cash Drawer
    Subtitle: Monitor the till cash position and perform drawer actions.
    (NO back-arrow, NO "Continue to Dashboard")

    Till Summary (simplified visible metrics):
      Till | Status | Opening Cash | Cash Sales | Current Expected Cash

    Wide layout:
      [ Drawer Actions ]  [ Recent Cash Movements ]

    Phone / narrow:
      stacked vertical sections; movements as cards
[ Normal POS bottom navigation remains available ]
```

Domain may carry more fields than the simplified summary UI.

## 4. Component Boundaries

| Component | Ownership |
|---|---|
| Cash Drawer screen | Composition, route, permission gate, shell |
| Cash Drawer content | White parent surface + sections |
| Till Summary section | Summary row / wrap of metric cards |
| Summary metric cards | Till, Status, Opening Cash, Cash Sales, Expected Cash |
| Drawer Actions section | Four action cards |
| Drawer Action card | Entire card tappable; title + description |
| Recent Cash Movements section | Header + list/table |
| Desktop/tablet movement row | Table/list row |
| Mobile movement card | Touch-friendly card |
| Loading / Empty / Error / Forbidden / Till closed / No till / Untrusted / Hardware unavailable / Backend unavailable | Shared state surfaces |
| Action in progress / success / failure | Provider-driven; no local fake success |

Do not collapse HTTP, domain rules, and UI into one oversized screen file.
Do not duplicate business logic per breakpoint.

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| CD-F1 | Authenticated cashier with `cash_drawer.view` can open Cash Drawer |
| CD-F2 | Screen shows backend-authoritative till summary for current device/session |
| CD-F3 | Four actions: Open Drawer, Cash In, Cash Out/Drop, Close Till |
| CD-F4 | Open Drawer is hardware-only; does not create a cash movement |
| CD-F5 | Cash In navigates to Cash In flow |
| CD-F6 | Cash Out/Drop navigates to Cash Out / Cash Drop flow |
| CD-F7 | Close Till reuses canonical Close Till flow (no duplicated close rules) |
| CD-F8 | Recent movements show newest first with typed direction semantics |
| CD-F9 | Phone + Tablet + Desktop layouts share one provider/repository stack |
| CD-F10 | Missing permissions hide/disable actions per Permission_Based_UI_Rules |
| CD-F11 | Movements persist only after backend success |
| CD-F12 | Duplicate submit must not create duplicate movements |

## 6. Business Rules

1. Authenticated cashier required.
2. Active tenant required.
3. Trusted active POS device required.
4. Device must resolve to correct outlet/till context.
5. Open Till Session required for financial movements and expected-cash display as open.
6. Only one open session per Till.
7. Cash movement amount must be > 0.
8. Currency comes from the active Till Session.
9. User cannot arbitrarily change movement currency.
10. Cash Out / Cash Drop requires a reason.
11. Cash In reason follows configured business policy; if the movement type requires reason, it is mandatory.
12. Movement must be auditable.
13. Movement is persisted only after backend success.
14. Local Flutter movement objects are not final truth.
15. Duplicate submit/retry must not create duplicate movements.
16. Cash refund affects drawer only when the actual refund method is cash.
17. Failed/cancelled cash payment must not affect expected cash.
18. Open Drawer does not alter expected cash.
19. Close Till compares counted cash against authoritative expected cash.
20. Variance handling follows canonical Till Close rules
    ([[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]).

## 7. Expected Cash Calculation

Conceptual formula (documentation):

```text
Opening Cash
+ Cash Sales
+ Cash In
- Cash Refunds
- Cash Out
- Cash Drops
= Current Expected Cash
```

**Backend owns `currentExpectedCash`.** Frontend-derived totals are display
previews only and must never override backend totals.

### No double counting

Implementation must use one authoritative contribution strategy per cash event.

If a cash sale/refund exists as both a payment/refund record and a cash
movement row, only one strategy may contribute it to Expected Cash.

Verified current runtime calculator
(`PosTillSessionRepository.CalculateExpectedCashAsync`):

- Cash sales from `sales_payments` where method = `CASH` and status in
  `PAID` / `PARTIALLY_REFUNDED` / `REFUNDED`
- Manual/adjust movements from **`till_cash_movements`**
- Skips `CASH_IN` movements whose `reference_number` matches a cash payment
  number (anti-double-count)
- Uses `cash_movement_types.affects_expected_cash` when configured

Future Cash Drawer APIs must preserve this anti-double-count rule (or migrate
to a single ledger with an equally explicit rule).

## 8. Movement Types

Canonical display types for Cash Drawer recent movements:

| Type | Direction (business) | UI semantic colour purpose |
|---|---|---|
| `CASH_SALE` | positive | success |
| `CASH_IN` | positive | success |
| `CASH_REFUND` | negative | error |
| `CASH_OUT` | negative | error |
| `CASH_DROP` | negative | information |

Colour never determines accounting direction. Backend/domain type + direction do.

Newest first.

### Runtime type gap

Current `till_cash_movements.movement_type` CHECK allows
`CASH_IN`, `CASH_OUT`, `OPENING_FLOAT`, `CLOSING_REMOVE` only.
`CASH_SALE` / `CASH_REFUND` / `CASH_DROP` may be **derived for display** from
payments/refunds/movements or require a future type-alignment migration.
Do not invent parallel ledgers.

## 9. Open Drawer Hardware Behaviour

Physical open reuses the existing Hardware Cash Drawer stack:

- Backend: `api/v1/pos/hardware/drawer/*` (`PosDrawerController` /
  `PosDrawerService`)
- Flutter: `CashDrawerController` + Local Print Agent `POST /api/drawer/open`
- Integration authority: [[../12_INTEGRATIONS/Cash_Drawer_Integration]]

Must **not** create a financial Cash In/Out/Drop movement.
Must **not** invent a second pulse subsystem.

Permission: `cash_drawer.manage` (backend authoritative).

## 10. Cash In Behaviour

- Navigate to Cash In flow (`/pos/cash-drawer/cash-in` today).
- Capture amount (+ reason per policy).
- Submit via approved `POST /api/v1/pos/cash-drawer/movements` with
  `movementType=CASH_IN`.
- Refresh summary/movements from backend after success.
- Current Flutter path is **FRONTEND_ONLY** (local `Future.delayed` +
  in-memory movement) and is **not** production truth.

## 11. Cash Out / Drop Behaviour

- Navigate to Cash Out / Drop flow (`/pos/cash-drawer/cash-drop` today;
  UI label “Cash Out / Drop”).
- Reason required.
- Submit via same mutation endpoint with `CASH_OUT` or `CASH_DROP`.
- Current Flutter path is **FRONTEND_ONLY**.
- `recordCashOut()` in current provider is unused dead surface — do not treat
  as implemented API.

## 12. Close Till Integration

Reuse canonical Close Till:

- Route: `/pos/cash-drawer/close-till`
- API: `POST /api/v1/tills/close` (+ current-session)
- Spec: [[Flutter_Close_Till_Screen_Implementation_Specification]]
- Feature: [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]

Do not duplicate close/variance/reconciliation logic inside Cash Drawer.

Permission: `pos.till.close`.

## 13. Permissions

Reuse existing codes (do not invent duplicates):

| Code | Cash Drawer UI behaviour |
|---|---|
| `cash_drawer.view` | Missing → Forbidden / Access Denied |
| `cash_drawer.manage` | Missing → Open Drawer hidden/disabled per POS convention |
| `cash_drawer.movement.create` | Missing → Cash In and Cash Out/Drop unavailable |
| `pos.till.close` | Missing → Close Till unavailable |

Also preserve Till/device/session gates already required by backend
(`pos.till.open` for open elsewhere, trusted device, open session, etc.).

Flutter checks are UX only. Backend authorization is authoritative.
No role-name bypass.

### Verified permission gap

- Codes exist in Flutter `PosPermissionCodes` and Backend
  `CashDrawerPermissions`.
- `cash_drawer.view` / `cash_drawer.manage` are seeded and used.
- `cash_drawer.movement.create` is **constant-only today** (not seeded, not
  enforced). Flutter currently gates Cash In/Drop with **`cash_drawer.manage`**
  instead. Future implementation must align Flutter UX + Backend seed + API
  checks to the canonical mapping above.

## 14. API Contracts

### Reuse (IMPLEMENTED)

| Method | Path | Status |
|---|---|---|
| GET | `/api/v1/tills/current-session` | IMPLEMENTED_AND_VERIFIED |
| POST | `/api/v1/tills/open` | IMPLEMENTED_AND_VERIFIED |
| POST | `/api/v1/tills/close` | IMPLEMENTED (Close Till production gaps remain — see Close Till feature) |
| POST | `/api/v1/pos/hardware/drawer/operations` | IMPLEMENTED_AND_VERIFIED |
| PUT | `/api/v1/pos/hardware/drawer/operations/{operationId}/finalize` | IMPLEMENTED_AND_VERIFIED |
| POST | `/api/v1/pos/hardware/drawer/operations/manual-open` | IMPLEMENTED_AND_VERIFIED |
| GET | `/api/v1/pos/hardware/drawer/operations/history` | IMPLEMENTED_AND_VERIFIED |
| GET | `/api/v1/pos/hardware/drawer/operations/{operationId}` | IMPLEMENTED_AND_VERIFIED |
| GET | `/api/v1/pos/hardware/drawer/operations/by-request/{requestId}` | IMPLEMENTED_AND_VERIFIED |

### Approved target financial APIs (NOT_IMPLEMENTED)

#### API A — Summary

```http
GET /api/v1/pos/cash-drawer/summary?deviceId={deviceId}
```

Status: **APPROVED_TARGET_NOT_IMPLEMENTED**

Response at least:

```text
tillSessionId, tillId, tillName, status, currencyCode,
openingCash, cashSales, cashRefunds, cashIn, cashOut, cashDrops,
currentExpectedCash, openedBy, openedAt
```

Backend owns `currentExpectedCash`.

#### API B — Recent movements

```http
GET /api/v1/pos/cash-drawer/movements?deviceId=&page=&pageSize=
```

Status: **APPROVED_TARGET_NOT_IMPLEMENTED**

Do not trust tenantId/outletId/cashierId from Flutter when backend can derive
them. Pagination follows project API standards.

Item at least:

```text
movementId, movementType, direction, amount, currencyCode,
reason, reference, performedBy, performedAt
```

#### API C — Create manual movement

```http
POST /api/v1/pos/cash-drawer/movements
```

Status: **APPROVED_TARGET_NOT_IMPLEMENTED**

Manual types: `CASH_IN`, `CASH_OUT`, `CASH_DROP`.

Request concept:

```text
deviceId, tillSessionId, movementType, amount, reason, referenceNumber?
```

Backend validates authoritative tenant/outlet/till/session/user.
Do not accept client-provided computed expected cash.

No existing equivalent cashier mutation endpoint was found under another path.

## 15. Data Mapping

| UI field | Source |
|---|---|
| Till / tillName | Device → Till assignment / session |
| Status | Till session status |
| Opening Cash | `till_sessions.opening_float_amount` |
| Cash Sales / Refunds / In / Out / Drops | Backend summary aggregates |
| Current Expected Cash | Backend `currentExpectedCash` |
| Recent movements | Backend movements feed (typed) |
| Open Drawer | Hardware drawer operation APIs |
| Close Till | Existing tills close contract |

Do not persist UI summary totals as duplicate DB columns.

## 16. Database Ownership

**No new Cash Drawer table approved.**
**No new summary columns approved merely for UI.**

Foundation tables:

```text
till_sessions
cash_movement_types
cash_movements          (schema present; no app writer today)
till_cash_movements     (current runtime ledger writes/reads)
cash_reconciliations
cash_count_denominations
cash_drawer_operations  (physical open audit)
```

Do not create `cash_drawer_summary` / `cash_drawer_history`.

### Source-of-truth conflict (recorded)

| Layer | Decision |
|---|---|
| Canonical long-term ERD target | `cash_movement_types` + `cash_movements` |
| Current runtime financial ledger | `till_cash_movements` (+ cash sales from `sales_payments`) |
| Type catalog / affects_expected_cash | `cash_movement_types` (read today) |
| Physical drawer audit | `cash_drawer_operations` |
| Migration / alignment gap | Dual ledger exists; one financial source required before claiming Complete. Prefer implementing Cash Drawer mutations against **current runtime** `till_cash_movements` unless a dedicated migration chunk first unifies onto `cash_movements`. Never dual-write two ledgers. |

## 17. Source-of-Truth Rules

- Backend database is final for Expected Cash and movements.
- Flutter local list/summary is provisional until API success.
- Physical Open Drawer uses HardwareCash drawer operations — not cash movements.
- Close Till uses Till Close feature authority.
- Offline: Cash In / Out / Drop are **ONLINE / BACKEND AUTHORITATIVE** until an
  approved offline contract exists. Do not silently queue high-risk cash-control
  mutations.

## 18. Frontend Folder Ownership

Preserve existing feature folders. Target layering under
`lib/features/cash_drawer/`:

```text
cash_drawer/
  data/
    datasources/          # remote Dio datasources for summary/movements
    dtos/
    repositories/         # repository implementations
  domain/
    entities/             # already exists (summary, movement, reasons)
    repositories/         # abstractions
    usecases/             # optional; match project till-style if used
  presentation/
    providers/            # replace frontend-only controller with API-backed
    screens/
    widgets/
```

Also reuse (do not duplicate):

- `lib/features/till/...` for open/close/current-session
- `lib/features/hardware/receipt_printer/...` for physical drawer pulse

Dependency direction:

```text
Screen/Widget → Provider → Use case/Repository → Datasource → API
```

Widgets must not call Dio/SQL.

### Conflict — current Flutter

Today `cash_drawer` has **no `data/` layer**; movements are local-only.
Approved target requires the data/domain stack above.

### Shell / bottom nav conflict

Approved contract: normal POS bottom navigation remains available on Cash Drawer.
Current code: `/pos/cash-drawer*` is outside the bottom-nav whitelist and uses
page-local headers. Future UI chunk must align shell to this contract without
inventing a private Cash Drawer navigation system.

## 19. Backend Folder Ownership

Do **not** create a second unrelated CashDrawer architecture.

Prefer extending existing **HardwareCash** + **POSOperations** ownership:

| Concern | Module |
|---|---|
| Cash Drawer financial summary/movements APIs | HardwareCash application services (preferred) or POSOperations if session coupling requires it — pick one module; do not split conflicting writers |
| Till session open/close/current | POSOperations (`PosTillsController`, `PosTillSessionService`) |
| Physical drawer | HardwareCash (`PosDrawerController`, `PosDrawerService`) |
| Entities | Reuse `TillSession`, `TillCashMovement` / future `CashMovement`, `CashMovementType`, `CashDrawerOperation` |

Controller → Application service → Repository abstraction → EF repository →
Domain entities / DTOs / Validators / Authorization.

## 20. Theme / Shared Token Rules

Approved Cashier POS visual direction for this screen:

| Purpose | Hex (documentation only) | Canonical token (reuse) |
|---|---|---|
| Primary orange | `#FF6A00` | `TenantAdminColors.posHomeAccentOrange` |
| Shell black | `#000000` / near-black workspace | `TenantAdminColors.posHomeDarkBackground` / `background` (`#030303`) |
| Success | — | `TenantAdminColors.success` (+ surfaces) |
| Error | — | `TenantAdminColors.danger` (+ surfaces) |
| Information | — | existing info/primary-soft tokens; if missing → **theme token gap** (add to shared theme file, then reuse) |
| White surface | — | existing white/surface tokens |

**Mandatory:**

```text
NO direct Color(0x...) in Cash Drawer widgets/screens
NO direct #hex in feature widgets
NO feature-local CashDrawerColors theme file
NO duplicate orange/black constants
```

Token file:
`lib/features/tenant_admin/presentation/theme/tenant_admin_theme.dart`

Cash Drawer primary actions use orange tokens (same Cashier POS exception as
Open Till / Close Till), not the navy→violet `PosPrimaryActionButton` gradient,
unless a shared orange CTA component already exists and is reused.

## 21. Responsive Phone / Tablet / Desktop Behaviour

Reuse `TenantAdminBreakpoints` (`mobile` 600, `smallTablet` 700, `tablet` 900,
`desktop` 1280). Prefer available-width layout; do not use device-name checks as
the main contract.

| Breakpoint | Layout |
|---|---|
| Wide tablet / desktop | Title inside white card; summary metrics in a row; Actions ‖ Movements side-by-side |
| Medium / portrait tablet | Summary may wrap; Actions and Movements may stack |
| Phone | Vertical stack; movement **cards** (not forced desktop table); no horizontal overflow; actions reachable |

Same providers/repositories on all sizes.

## 22. Touch / Accessibility Rules

- Entire action card is tappable.
- Clear pressed/disabled states.
- Minimum practical touch target per existing POS standard.
- No tiny desktop-only icon-only interactions for primary actions.
- No horizontal overflow.
- Amounts remain readable; long text must not break layout.
- Loading blocks duplicate submissions.
- Keyboard / viewInsets must not hide Cash In / Cash Out form actions.
- Semantics labels required on phone/tablet/desktop.

## 23. Loading / Empty / Error / Forbidden States

Canonical states:

```text
Loading
Loaded / Till Open
Till Closed
Empty Recent Movements
Error
Forbidden
No Till Assigned
Untrusted Device
Drawer Hardware Unavailable
Backend Unavailable
Action In Progress
Action Success
Action Failure
```

Never fabricate successful financial movement state when backend persistence fails.

## 24. Security

- Tenant isolation mandatory.
- Backend authorization mandatory.
- Device / till / session ownership validated server-side.
- No client-authoritative user/tenant permission.
- No manager credentials logged.
- No hardware secrets / pulse configuration exposed unnecessarily.

## 25. Audit

Cash-sensitive operations must be traceable by:

```text
tenant, outlet, till, tillSession, device, user,
movement type, amount, reason, business reference, performedAt
```

Physical Drawer Open retains existing `cash_drawer_operations` audit.

## 26. Idempotency

Duplicate taps, timeout retries, navigation rebuilds must not duplicate
Cash In / Out / Drop.

Reuse the project’s canonical request/idempotency pattern (Hardware drawer
already uses `RequestId` + payload hash on `cash_drawer_operations`). Do not
invent a second scheme for financial movements — extend the existing cash /
POS mutation idempotency conventions.

## 27. Offline Boundary

Cash In / Cash Out / Cash Drop: **ONLINE / BACKEND AUTHORITATIVE**.

Till final close: backend-final
([[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]).

Physical drawer offline recovery follows
[[../12_INTEGRATIONS/Cash_Drawer_Integration]] (pulse recovery only — not
financial movements).

## 28. Current Implementation Status (verified 2026-08-13)

| Area | Classification |
|---|---|
| Cash Drawer main UI + route `/pos/cash-drawer` | PARTIAL (UI exists; summary mixes real till session + local movement maths) |
| Cash In / Cash Drop UI | FRONTEND_ONLY |
| Close Till UI → `POST /api/v1/tills/close` | IMPLEMENTED_NOT_RUNTIME_VERIFIED for production close gaps |
| Till current-session / open | IMPLEMENTED_AND_VERIFIED |
| Physical Open Drawer (hardware APIs + agent) | IMPLEMENTED_AND_VERIFIED |
| `GET/POST /api/v1/pos/cash-drawer/*` financial APIs | APPROVED_TARGET_NOT_IMPLEMENTED |
| `cash_movements` EF entity | SCHEMA_ONLY |
| `till_cash_movements` writes | PARTIAL (returns/exchange side-effects; no cashier Cash In/Out API) |
| Expected Cash calculator | IMPLEMENTED (used on close/current-session paths; Close Till still has documented production gaps) |
| Flutter `cash_drawer` data layer | NOT_FOUND / FRONTEND_ONLY |
| Bottom nav on Cash Drawer | CONFLICT vs approved contract (currently hidden) |

## 29. Known Gaps

1. Financial Cash Drawer APIs not implemented.
2. Flutter Cash In/Out local-only persistence.
3. Dual cash ledger (`cash_movements` vs `till_cash_movements`).
4. `cash_drawer.movement.create` not seeded/enforced; Flutter gates with manage.
5. Movement display types `CASH_SALE`/`CASH_REFUND`/`CASH_DROP` vs runtime CHECK.
6. Shell bottom-nav / title-in-card contract vs current page-local headers.
7. Close Till production gaps remain (authoritative expected cash persistence /
   reconciliation — see Close Till feature).
8. Possible missing dedicated **information** semantic token for Cash Drop colour.

## 30. Production Completion Criteria

Cash Drawer is production-complete only when:

- Summary + movements + create-movement APIs are implemented, authorized, audited, idempotent.
- Flutter uses data/domain layer; no local fake success.
- Expected Cash is backend-authoritative with no double counting.
- Permissions match canonical mapping including `cash_drawer.movement.create`.
- Open Drawer reuses hardware path only.
- Close Till reuses canonical close.
- Phone + Tablet + Desktop runtime acceptance passes.
- Theme uses shared tokens only (no feature hex).
- Single financial cash-movement source of truth is explicit in runtime
  (migration closed or consciously deferred with runtime = `till_cash_movements`).
- Second Brain status updated after verified E2E — not from documentation alone.

## 31. Related Files

- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Second_Brain_Alignment_2026-08-13]]
- [[Flutter_Close_Till_Screen_Implementation_Specification]]
- [[Flutter_Open_Till_Screen_Implementation_Specification]]
- [[Flutter_Cashier_POS_Implementation_Map]]
- [[../07_UI_UX_KNOWLEDGE/Design_System]]
- [[../07_UI_UX_KNOWLEDGE/POS_App_UI_Rules]]
