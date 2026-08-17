<!-- title: Flutter Cash Drawer Management Screen Implementation Specification -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-15 -->

# Flutter Cash Drawer Management Screen Implementation Specification

## Purpose

This is the canonical product, Flutter, API, persistence, security, and
acceptance contract for the existing Cashier Cash Drawer Management screen.
It records current code truth as of 2026-08-14. It does not authorize a second
screen, a duplicate feature, or a new cash ledger.

## Scope and status

| Layer | Status | Evidence |
|---|---|---|
| Cash Drawer screen and route | IMPLEMENTED | `features/cash_drawer`, `/pos/cash-drawer` |
| Backend financial summary | IMPLEMENTED | `GET /api/v1/pos/cash-drawer/summary` |
| Backend recent movements | IMPLEMENTED | `GET /api/v1/pos/cash-drawer/movements` |
| Backend manual movement | IMPLEMENTED | `POST /api/v1/pos/cash-drawer/movements` |
| Cash In / Cash Out / Cash Drop Flutter wiring | IMPLEMENTED | remote datasource, repository, provider refresh |
| Till current/open/close | IMPLEMENTED / REUSED | `/api/v1/tills/*` |
| Physical Open Drawer software path | IMPLEMENTED / REUSED | `/api/v1/pos/hardware/drawer/*` + Local Print Agent |
| Physical device acceptance | PHYSICAL ACCEPTANCE PENDING | no installed-drawer smoke evidence in this audit |
| New table for this screen | NOT REQUIRED | current runtime sources are sufficient |

Documentation completion is not physical production acceptance.

## Screen anatomy

```text
Shared POS shell
  Shared POS top header
  Cash Drawer white content surface
    Cash Drawer title and helper text
    TillSummarySection
      TillSummaryCard x 5
    DrawerActionsSection
      DrawerActionCard x 4
    RecentCashMovementsSection
      loading | empty | data | error | restricted
  Shared POS bottom navigation
```

On supported tablet/desktop width, the five summary cards form one horizontal
row. Smaller widths may wrap or stack without changing data or permissions.
The existing route, business flow, and visual language must be preserved.

## Till Summary field mapping

| Card | Authoritative source | Rule |
|---|---|---|
| Till | trusted device assignment -> active Till Session -> `tills.till_name` | never hardcoded |
| Status | `till_sessions.status` | never inferred from a local button state |
| Opening Cash | `till_sessions.opening_float_amount` | later Cash In never mutates the original float |
| Cash Sales | successful CASH portions in `sales_payments.paid_amount` for this session/currency | excludes CARD/QR, failed, cancelled, pending |
| Current Expected Cash | backend repository calculation | Flutter displays; it is not accounting authority |

Currency comes from `till_sessions.currency_code`. Shared formatting must be
used; the screen is not LKR-only.

## Authoritative calculations

Current implementation in `PosDrawerRepository.GetFinancialSummaryAsync`:

```text
Current Expected Cash
= Opening Float
+ successful CASH paid amount
- CASH refunded amount
+ CASH_IN
+ OPENING_FLOAT adjustments
- CASH_OUT
- CASH_DROP
- CLOSING_REMOVE
```

Cash sales include only payment method `CASH` with payment status `PAID`,
`PARTIALLY_REFUNDED`, or `REFUNDED`. Cash refunds use `refunded_amount`.
Split tender contributes only its CASH payment portion.

To prevent double counting, a `CASH_IN` movement whose `reference_number`
matches an authoritative cash payment number is excluded from manual totals and
the combined recent-movement projection.

## Drawer actions

| Action | Permission | Persistence / integration |
|---|---|---|
| Open Drawer | `cash_drawer.manage` | physical-operation audit; no financial movement |
| Cash In | `cash_drawer.movement.create` | Canonical `cash_movements` + IN movement type |
| Cash Out / Drop | `cash_drawer.movement.create` | Canonical `cash_movements` + OUT movement type |
| Close Till | `pos.till.close` | existing `/api/v1/tills/close` flow |

`cash_drawer.view` gates screen financial reads. `pos.till.open`,
`till.session.view`, and `pos.hardware.settings` remain relevant to their own
Till/hardware surfaces; they do not replace the action permissions above.
Authorization is never based on role names.

## Open Drawer flow

```text
authenticated POS action
  -> backend tenant/permission/policy/device/session validation
  -> cash_drawer_operations registration
  -> Flutter hardware orchestration
  -> configured Local Print Agent POST /api/drawer/open
  -> linked receipt-printer drawer port
  -> safe ESC/POS pulse
  -> operation finalization / recovery
```

The client must not expose arbitrary pulse bytes. A payment committed before a
drawer pulse failure remains committed; hardware failure is separately audited
and recovered. Reuse [[../12_INTEGRATIONS/Cash_Drawer_Integration]].

## Cash In and Cash Out / Drop

Canonical minimum client-owned fields are stable `requestId`, trusted device
context where required by the existing POS boundary, `movementTypeId`, positive
decimal `amount`, and optional note. Tenant, outlet, till, session, user,
currency, movement number, and expected cash are server-resolved.

Server rules:

- active tenant and authenticated operator are resolved from the token;
- trusted active device, assigned Till, and open matching Till Session required;
- selected type must be active, direction-compatible, system-global or owned by
  the current tenant;
- amount must be greater than zero;
- Cash In Reason selects `cash_movement_types.id`; optional explanatory text is
  stored as `cash_movements.reason`;
- currency comes from the Till Session;
- Cash Out/Drop cannot exceed current expected cash;
- success is shown only after backend acceptance;
- successful mutation refreshes summary and recent movements.

No offline successful Cash In/Out/Drop is supported by this contract.

## Close Till reuse

Cash Drawer must reuse:

```http
GET  /api/v1/tills/current-session?deviceId={deviceId}
POST /api/v1/tills/close
```

It must reuse `features/till` and the existing
`pos_close_till_screen.dart`. Expected cash, counted cash, variance validation,
reconciliation, and session closure remain backend authoritative. No second
Close Till datasource or workflow is permitted.

## Recent Cash Movements

The implemented read model merges, newest first:

- `CASH_SALE` projections from successful CASH `sales_payments`;
- `CASH_REFUND` projections from CASH payment refund amounts;
- manual IN/OUT rows from canonical `cash_movements`. The existing legacy read
  projection remains implementation drift until cut-over.

The API returns `movementId`, `movementType`, `direction`, `amount`,
`currencyCode`, `reason`, `reference`, `performedBy`, and `performedAt`, plus
page metadata. Payment/refund truth is projected, not copied into another UI
table. Required UI states are loading, empty, data, error, forbidden, offline
or backend unavailable, refresh, and paged/load-more behaviour where needed.

## Implemented API contract

All routes use `TenantOnly`; services enforce permission and trusted
device/session rules.

| Method | Route | Permission | Status |
|---|---|---|---|
| GET | `/api/v1/pos/cash-drawer/summary?deviceId=` | `cash_drawer.view` | IMPLEMENTED |
| GET | `/api/v1/pos/cash-drawer/movements?deviceId=&page=&pageSize=` | `cash_drawer.view` | IMPLEMENTED |
| POST | `/api/v1/pos/cash-drawer/movements` | `cash_drawer.movement.create` | LEGACY IMPLEMENTED / CANONICAL ALIGNMENT PENDING |
| GET | `/api/v1/pos/cash-movement-types?direction=IN` | `cash_drawer.view` | TARGET / NOT IMPLEMENTED |
| GET/POST/PUT | `/api/v1/pos/hardware/drawer/*` | view/manage by operation | IMPLEMENTED / REUSED |
| GET/POST | `/api/v1/tills/current-session`, `/open`, `/close` | Till permission by operation | IMPLEMENTED / REUSED |

Summary response fields are `tillSessionId`, `tillId`, `tillName`, `status`,
`currencyCode`, `openingCash`, `cashSales`, `cashRefunds`, `cashIn`, `cashOut`,
`cashDrops`, `currentExpectedCash`, `openedBy`, and `openedAt`.

Errors use the shared error envelope. Important codes include permission denied,
invalid context/request/pagination/type/amount/reason/reference, untrusted or
unassigned device, missing/open-session mismatch, idempotency conflict, and
insufficient expected cash.

## Database mapping and canonical ownership

New table required: **NO**.

New normal business attribute required: **NO**. Durable idempotency is a
required implementation/schema delta because canonical `cash_movements` has no
request identifier today.

| Concern | Canonical runtime source |
|---|---|
| Till/session/opening/currency | `tills`, `till_sessions` |
| Cash tender/refund | `sales_payments` + `payment_methods` |
| Manual financial movements | `cash_movements` linked to `cash_movement_types` |
| Movement type policy metadata | `cash_movement_types` where configured |
| Till closure/reconciliation | `cash_reconciliations`, Till close transaction |
| Physical drawer attempt/result | `cash_drawer_operations` |
| Operational projections | `till_session_summaries`, `till_session_payment_summaries`, `till_session_events` where their owning flows use them |

### `cash_movements` versus `till_cash_movements`

Both EF/schema concepts exist. Current runtime code still uses
`till_cash_movements`, but the approved production authority is
`cash_movements` linked to `cash_movement_types`. Therefore:

```text
CANONICAL MANUAL LEDGER: cash_movements
till_cash_movements: LEGACY IMPLEMENTATION DRIFT
dual-write: FORBIDDEN
```

Implementation must provide migration, compatibility, reconciliation, and
cut-over evidence before canonical Cash In is complete.

## Idempotency

Legacy movement idempotency is implemented with
`till_cash_movements.request_id`, but it does not protect the future canonical
writer. Canonical `cash_movements` must add tenant-scoped durable `request_id`
uniqueness or reuse an approved generic idempotency store. Same key and payload
must replay; different payload must conflict.

Physical drawer operations keep their separate, appropriate `RequestId` and
payload-hash idempotency in `cash_drawer_operations`; this does not create a
second financial ledger.

## Existing Flutter ownership

```text
lib/features/cash_drawer/
  data/datasources/cash_drawer_remote_datasource.dart
  data/repositories/cash_drawer_repository_impl.dart
  domain/entities/{cash_drawer_summary,cash_movement,reasons}.dart
  domain/repositories/cash_drawer_repository.dart
  presentation/providers/{cash_drawer,cash_in,cash_drop,close_till}_provider.dart
  presentation/screens/{pos_cash_drawer,pos_cash_in,pos_cash_drop,pos_close_till}_screen.dart
  presentation/widgets/...

lib/features/till/
  application/usecases/open_till.dart
  data/datasources/{till_remote_datasource,till_session_storage}.dart
  data/repositories/till_repository_impl.dart
  domain/...
  presentation/providers/till_provider.dart
  presentation/screens/till_open_screen.dart
```

Existing files and routes stay in place. Do not create
`features/hardware/cash_drawer`.

## Component boundaries and future refactor

The implemented screen is already divided into page header, till summary,
drawer actions, movements, and action-specific screens/widgets. Future refactor
is permitted only where responsibility is still mixed:

```text
PosCashDrawerScreen
  -> CashDrawerTillSummarySection -> five summary cards
  -> CashDrawerActionsSection -> four action cards
  -> CashDrawerMovementsSection -> table/cards/empty state
```

The current `cash_drawer_provider` coordinates summary, movement, mutation, and
Close Till compatibility. Separate summary/movements/action providers only when
state lifetime or testability requires it; do not split for file-count alone.
Widgets must not call Dio directly.

## Backend ownership and folders

- `Tenant/HardwareCash`: Cash Drawer controller/service/repository contracts,
  financial summary/read/mutation, physical operation policy and audit.
- `Tenant/POSOperations`: Till Session resolution/lifecycle and current runtime
  `TillCashMovement` entity/configuration.
- Payment/refund modules: payment/refund lifecycle authority.
- `OutletTillDevice`: Till, device, and assignment authority.

Use existing `E_POS.Api`, `E_POS.Application`, `E_POS.Domain`, and
`E_POS.Infrastructure` layers. Do not create a top-level
`CashDrawerManagement` module.

## Loading, failure, offline, and security

Never substitute failed/unknown financial reads with `0.00`. Distinguish no
auth, denied permission, disabled feature, untrusted device, no assignment, no
open session, backend/offline failure, conflict, duplicate, validation failure,
Local Agent unavailable, printer/drawer configuration missing, unknown hardware
result, and physical failure.

Backend resolves tenant/operator authority and validates device, Till, outlet,
and session isolation. Client tenant/user/outlet/Till identifiers are not
accepted as authority. Logs must not expose credentials, tokens, or manager
approval secrets. Mutations and drawer operations are audited.

## Refresh rules

Reload backend-authoritative summary/history after Till open, cash payment,
cash-bearing split payment, applicable cash refund, Cash In, Cash Out, Cash Drop,
Till close, manual refresh, and screen resume where stale state is possible.
Flutter must not recompute the persisted balance after these events.

## Non-functional requirements

- responsive phone/tablet/desktop layout without overflow;
- supported tablet/desktop shows five summary cards in one row;
- shared POS header, navigation, `#FF6A00` orange and black theme tokens reused;
- accessible labels, keyboard navigation, and practical touch targets;
- no duplicate submit while mutation is in flight;
- paginated movement reads bounded to page size 1..100;
- deterministic monetary precision and server currency;
- safe telemetry and actionable error states;
- tenant-scoped query/index discipline and newest-first movement ordering.

## Testing expectations

- permission denial and no role-name bypass;
- trusted/inactive/cross-tenant device and Till/session mismatch;
- missing/closed session;
- zero/negative amount, type, reason, reference, and currency rules;
- over-withdraw and exact boundary;
- idempotent replay, payload conflict, tenant isolation, concurrent race;
- CASH-only sales/refunds, split tender, failed/cancelled exclusion;
- anti-double-count behaviour;
- pagination, ordering, loading/empty/error/refresh;
- Flutter repository mapping and mutation refresh/no fake success;
- phone/tablet/desktop overflow and permission rendering;
- Local Agent unavailable, recovery, and physical installed-device smoke.

## Known gaps

1. Physical cash-drawer pulse acceptance is pending on installed hardware.
2. Full authenticated runtime/E2E acceptance for every device/printer policy
   combination is not evidenced by this documentation audit.
3. `cash_movements` is the canonical manual movement ledger. Existing
   `till_cash_movements` use is implementation drift; cut-over must not
   dual-write.
4. Cash In details are governed by
   [[Flutter_Cash_In_Screen_Implementation_Specification]].

## Definition of Done

Documentation is complete when current code, APIs, schema, ownership, statuses,
and cross-links agree. Runtime production acceptance additionally requires live
authenticated financial flows and installed physical drawer smoke evidence.

## Related Second Brain files

- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED]]
- [[../06_DATABASE_KNOWLEDGE/Tables/21_POS_Operations_UPDATED]]
- [[../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/Hardware_Cash/Cash_Drawer_Chunk_1_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Chunk_2_Implementation_Status]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Management_Screen_Second_Brain_Alignment_2026-08-14]]
