<!-- title: Cash Drop Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->
<!-- source_audit: Backend Tharmi_CashDrawer_012 + Flutter Tharmi_tenant_set; Chunk 1 core OUT implemented 2026-08-16 -->

# Cash Drop Feature

## 1. Purpose

Canonical production contract for Cashier **Cash Drop / Cash Out**: remove cash
from the open till drawer and reduce backend-authoritative expected cash via the
**generic financial cash-movement** model (`Direction = OUT`).

This document is the Second Brain authority for Cash Drop. It separates physical
drawer hardware from financial movements and forbids duplicate Cash Drop
tables/APIs/modules.

## 2. Scope

| In scope | Out of scope |
|---|---|
| Cash Drop UI contract (existing screen) | Full banking / bank deposit module |
| Generic OUT cash movement via existing API | Separate `POST /cash-drop` route |
| OUT movement types in `cash_movement_types` | New `cash_drops` / `cash_outs` tables |
| Expected / available cash rules | Manager PIN as authorization |
| Permissions, tenant, currency, idempotency | Rolling back finance because print failed |
| Tablet fixed non-scroll layout (Chunk 2 acceptance) | Inventing unsupported OUT type codes |

## 3. Current implementation status

| Area | Status | Evidence class |
|---|---|---|
| Cash Drop Flutter UI | **IMPLEMENTED** | Flutter `features/cash_drawer` |
| Cash Drop Flutter submit (canonical) | **IMPLEMENTED** (Chunk 1) | `createCashDropMovement` + catalog |
| `GET .../cash-movement-types?direction=OUT` | **IMPLEMENTED** (Chunk 1) | Service accepts IN\|OUT |
| `POST .../cash-drawer/movements` with OUT type | **IMPLEMENTED** (Chunk 1) | Repository accepts OUT |
| Seeded OUT types | **IMPLEMENTED** (Chunk 1) | Migration `20260816034300_...` |
| Persist Cash Drop to `cash_movements` | **IMPLEMENTED** (Chunk 1) | Integration tests |
| Dual-write to `till_cash_movements` | **FORBIDDEN / not used** | Asserted in tests |
| Server available-cash check for OUT | **IMPLEMENTED** (Chunk 1) | `insufficient_expected_cash` |
| Expected-cash subtraction | **IMPLEMENTED** (Chunk 1) | Automated |
| Physical Cash Movement Slip print | **NOT IMPLEMENTED** | Optional; banner honest |
| Cash Drop automated CD / UI matrix | **VERIFIED** | Chunk 2 acceptance record |
| Cash Drop live authenticated E2E | **VERIFIED** | Pixel Tablet 2026-08-16 |
| Cash In (sibling feature) | **VERIFIED** | Chunk 3 acceptance |

**Chunk 1 core financial path: FULLY CLOSED** (incl. concurrent over-drop).  
**Production acceptance: PASS** — software Cash Drop complete (print optional).

Evidence: [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drop_Chunk_1_Core_Implementation_Status]] · [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]

## 4. UI specification

### Parent layout

```text
POS shell (black top bar / bottom nav) — unchanged
        ↓
Large white parent card (CashDrawerSectionCard / surface token)
├── Cash Drop Page Header
├── Till Information Card
├── Main 2-column Row (tablet+)
│   ├── Cash Drop Details (~60–65%)
│   └── Cash Drop Summary (~35–40%)
└── Bottom Action Row (Cancel | Confirm Cash Drop)
```

### Page header

- Title: **Cash Drop**
- Subtitle: **Record a safe drop from the drawer and reduce the till cash balance.**

### Till information

| Segment | Source |
|---|---|
| Till | Backend summary / till session display |
| Current Expected Cash | Backend `CurrentExpectedCash` |
| Available Cash in Drawer | **Currently identical** to Current Expected Cash from summary |

### Cash Drop Details

| Field | Rule |
|---|---|
| Drop Amount * | Required; `> 0`; UI must not exceed available cash |
| Reason * | Required; **TARGET:** `movement_type_id` from OUT catalog |
| Note | Optional; max **500** characters (matches backend note limit) |
| Manager PIN | Optional; UI-only; max 6 digits; obscure toggle |

### Cash Drop Summary

- Current Expected Cash
- Cash Drop Amount (live preview)
- Remaining Expected Cash = Expected − Drop Amount (preview only)
- Info banner about cash movement slip (**print not claimed as implemented**)

### Bottom actions

- **Cancel** — outlined theme orange
- **Confirm Cash Drop** — filled theme orange; disabled when invalid/submitting

### Theme

Use shared tokens only (e.g. `TenantAdminColors.posHomeAccentOrange`, surface,
body text, borders). Do not hardcode `#FF6A00` / raw black/white in widgets.

Primary brand orange token value: `#FF6A00`. Shell black: `#000000`.

## 5. Functional requirements

1. Authenticated cashier opens Cash Drop only with view + movement-create
   permissions (screen gates both today).
2. Open till session and backend summary are required before confirm.
3. Reasons come from backend OUT movement types (**TARGET**); hardcoded labels
   are interim UI only and must be removed when OUT catalog ships.
4. Confirm submits one financial OUT movement through the **existing** generic
   movements API (**TARGET** payload aligned to Cash In: `requestId`,
   `deviceId`, `movementTypeId`, `amount`, optional `note`).
5. Success UI only after backend confirmation; then refresh summary.
6. No optimistic expected-cash mutation.

## 6. Business rules

| ID | Rule | Implementation class |
|---|---|---|
| BR-01 | Authenticated tenant user required | IMPLEMENTED (API auth) |
| BR-02 | Tenant context server-resolved | IMPLEMENTED |
| BR-03 | Trusted active POS device required | IMPLEMENTED (Cash In path) |
| BR-04 | Device resolves correct outlet/till | IMPLEMENTED (Cash In path) |
| BR-05 | Till active | IMPLEMENTED (Cash In path) |
| BR-06 | Till session OPEN | IMPLEMENTED (Cash In path) |
| BR-07 | `cash_drawer.view` for summary/types | IMPLEMENTED |
| BR-08 | `cash_drawer.movement.create` for mutation | IMPLEMENTED |
| BR-09 | Drop amount mandatory | TARGET for OUT path |
| BR-10 | Amount `> 0` | IMPLEMENTED for IN; TARGET for OUT |
| BR-11 | Amount ≤ backend-authoritative available cash | **REQUIRED** (not enforced today) |
| BR-12 | Valid active OUT movement type | **REQUIRED** |
| BR-13 | Foreign-tenant movement type rejected | IMPLEMENTED pattern on IN; TARGET OUT |
| BR-14 | Currency from till session | IMPLEMENTED (IN) |
| BR-15 | Server owns tenant/outlet/till/session/user | IMPLEMENTED (IN) |
| BR-16 | Cash Drop reduces expected cash | TARGET (formula ready; create blocked) |
| BR-17 | Atomic persistence | TARGET for OUT |
| BR-18 | Retry-safe / no duplicate rows | Schema ready (`request_id`); TARGET OUT |
| BR-19 | Auditable successful movement | TARGET for OUT |
| BR-20 | UI success only after backend confirm | Flutter Drop already requires API success today, but API cannot succeed for OUT |

## 7. Financial rules

Cash Drop is a **Cash Movement** with `Direction = OUT`.

Cash In is the sibling with `Direction = IN`.

Do not create a second financial subsystem.

### Expected cash (backend authority)

POS summary (`GetFinancialSummaryAsync`) conceptually:

```text
ExpectedCash =
  OpeningFloatAmount
  + cash sales (CASH payments)
  − cash refunds
  + IN movements (affects_expected_cash)
  − OUT movements where code != CASH_DROP
  − OUT movements where code == CASH_DROP
```

After a successful Cash Drop:

```text
ExpectedCashAfter = ExpectedCashBefore − CashDropAmount
```

Close Till may still **dual-read** legacy `till_cash_movements` for historical
rows; POS Cash In/Drop **must not dual-write**.

### Available cash

Today the drawer summary exposes **Current Expected Cash** as the authoritative
drawer cash figure used by Flutter as **Available Cash in Drawer**.

Until a separate physical-count authority exists, treat:

```text
Available Cash in Drawer ≡ Current Expected Cash (backend summary)
```

Client max-amount checks are UX only. Concurrent drops require **server**
enforcement of BR-11 before production sign-off.

## 8. Validation

### Frontend (current / retain)

| Case | Message / behaviour |
|---|---|
| Empty amount | Drop amount is required |
| Invalid number | Enter a valid amount |
| `<= 0` | Amount must be greater than zero |
| `> Available Cash` | Amount cannot exceed available cash in drawer |
| Missing reason | Reason is required |
| Note | max 500 |
| Manager PIN | optional, digits, max 6; not validated as required |

### Backend (TARGET for OUT; IN already enforces amount/note/type)

- Amount `> 0`
- Note length `<= 500` → `cash_drawer.invalid_note`
- Eligible active OUT type owned globally or by current tenant
- **Amount ≤ authoritative available/expected cash** → map
  `cash_drawer.insufficient_expected_cash` (code exists; producer missing)
- Reject IN types for Cash Drop and OUT types for Cash In

## 9. Permission rules

| Code | Responsibility |
|---|---|
| `cash_drawer.view` | Summary, movement history, movement-type reads |
| `cash_drawer.movement.create` | Create Cash In **and** Cash Drop financial movements |
| `cash_drawer.manage` | Physical/manual Open Drawer only — **not** financial Drop |

Frontend gating ≠ backend authorization. Backend must enforce independently.

No new permission codes for Cash Drop.

## 10. API contract

### Physical drawer (separate domain)

Base: `/api/v1/pos/hardware/drawer/*` → `cash_drawer_operations`.

Opening the physical drawer is **not** a Cash Drop.

### Financial (reuse — do not invent Cash Drop routes)

| Method | Route | Auth | Permission | Purpose | Cash Drop status |
|---|---|---|---|---|---|
| GET | `/api/v1/pos/cash-drawer/summary` | Tenant staff | `cash_drawer.view` | Authoritative expected cash | IMPLEMENTED |
| GET | `/api/v1/pos/cash-drawer/movements` | Tenant staff | `cash_drawer.view` | History | IMPLEMENTED |
| GET | `/api/v1/pos/cash-movement-types?direction=` | Tenant staff | `cash_drawer.view` | Type catalog | **IN and OUT** (software-accepted) |
| POST | `/api/v1/pos/cash-drawer/movements` | Tenant staff | `cash_drawer.movement.create` | Create movement | **IN and OUT** (Cash In + Cash Drop software-accepted) |

### Canonical mutation body (aligned to verified Cash In)

```text
requestId      Guid (required for durable idempotency)
deviceId       Guid
movementTypeId Guid   // OUT catalog id for Cash Drop
amount         decimal > 0
note           string? max 500  // persisted as cash_movements.reason
```

Currency, tenant, outlet, till, session, and performer are **server-resolved**.

### Idempotency

`cash_movements.request_id` nullable Guid with partial unique index
`uq_cash_movements_tenant_id_request_id` on `(tenant_id, request_id)` where
`request_id IS NOT NULL` (migration `20260815133611_CanonicalizeCashInMovements`).

Semantics:

```text
Same RequestId + same logical request → safe replay / same result
Same RequestId + conflicting payload → conflict
```

Flutter Cash Drop today generates a **new** request id per submit (gap vs Cash
In stable `pendingRequestId`).

## 11. Database contract

| Decision | Verdict |
|---|---|
| New Cash Drop table | **NO** |
| New Cash Drop-specific API | **NO** |
| New Cash Drop DB columns for UI fields | **NO** |
| New permission | **NO** |
| New backend module `CashDrop/` | **NO** |
| Duplicate Flutter feature module | **NO** |
| Reuse `cash_movement_types` + `cash_movements` | **YES** |
| OUT support | **IMPLEMENT / VERIFY** |

Supporting tables (context only): `till_sessions`, `tills`, `pos_devices`,
`till_device_assignments`, `outlets`, `tenants`, `tenant_users`, `currencies`,
`cash_reconciliations`.

Physical: `cash_drawer_operations` only.

Legacy: `till_cash_movements` = compatibility / other flows; **no dual-write**
for one Cash Drop.

## 12. Attributes (`cash_movements` verified)

| Column | Notes |
|---|---|
| `id` | PK |
| `tenant_id` | Required |
| `outlet_id` | Required |
| `till_id` | Required |
| `till_session_id` | Required |
| `pos_device_id` | Nullable |
| `request_id` | Nullable Guid; tenant-unique when present |
| `movement_type_id` | FK → `cash_movement_types` |
| `movement_number` | Server-assigned |
| `amount` | `> 0` |
| `currency_code` | From till session |
| `reason` | Optional note text |
| `order_id` / `payment_id` / `refund_id` | Optional business refs |
| `performed_by_tenant_user_id` | Server |
| `performed_at` / `created_at` / `updated_at` | Server |

**Do not persist:** `current_expected_cash`, `available_cash`,
`remaining_expected_cash`, `cash_drop_total`, `manager_pin`.

## 13. Backend authority

```text
Cash Drop Screen
     ↓
cash_drop form provider + cash_drawer controller
     ↓
Cash Drawer repository / datasource
     ↓
POST /api/v1/pos/cash-drawer/movements
     ↓
PosDrawerService (HardwareCash application)
     ↓
PosDrawerRepository
     ↓
cash_movement_types + cash_movements
```

Ownership folders (actual):

```text
E_POS.Application/Modules/Tenant/HardwareCash/{Contracts,Dtos,Services}
E_POS.Domain/Modules/Tenant/HardwareCash/{Constants,Entities}
E_POS.Infrastructure/Modules/Tenant/HardwareCash/{Configurations,Repositories}
E_POS.Api/Controllers/V1/Tenant/PosDrawerController.cs
  (PosCashDrawerController + PosCashMovementTypesController)
```

## 14. Flutter authority

**Actual ownership is `features/cash_drawer`, not `features/pos`.**

```text
lib/features/cash_drawer/
  presentation/screens/pos_cash_drop_screen.dart
  presentation/providers/cash_drop_provider.dart
  presentation/widgets/cash_drop_*.dart
  domain/entities/cash_drop_reason.dart   # interim hardcoded labels
  data/... shared cash drawer repository/datasource
```

Routes: `/pos/cash-drawer/cash-drop`.

Do not create `cash_drop_v2_screen.dart` or parallel feature trees.

Conceptual target folder under `features/pos/...` remains a future
non-destructive alignment option only (same rule as Cash In).

## 15. Idempotency

Required for Cash Drop before production. Schema exists. OUT create path and
Flutter stable request-id behaviour are **REQUIRED gaps**.

## 16. Concurrency

Two cashiers / devices must not both overdraw available cash. Server must
re-read authoritative expected/available cash inside the mutation transaction
and reject oversize OUT amounts.

## 17. Error behaviour

| Failure | Behaviour |
|---|---|
| Network | Preserve amount/reason/note |
| Backend validation | Preserve form; show typed error |
| Closed till | Block submit |
| Permission denied | Forbidden UI / 403 |
| Stale/inactive type | Reject; refresh catalog |
| Insufficient cash after concurrent change | Reject; refresh summary |
| Double tap | Disable confirm / single in-flight mutation |
| Timeout after commit | Replay same `requestId` |

## 18. Multi-tenant rules

Tenant A cannot read Tenant B types, write Tenant B sessions, or use foreign
`movementTypeId`. Flutter never supplies authoritative `tenantId`.

## 19. Currency rules

Currency is backend-authoritative from `till_sessions.currency_code`.
Flutter formats with `summary.currencyCode`. Not LKR-hardcoded.

## 20. Manager PIN rule

```text
Manager PIN is NOT financial authorization.
Manager PIN is NOT approval authority.
Manager PIN is NOT persisted in cash_movements.
Manager PIN must not appear in logs.
Manager PIN must not be added to the mutation API without a separate approved workflow.
```

No `manager_pin` / hash / approval columns for this feature.

## 21. Print-slip rule

```text
Cash Drop financial mutation may succeed independently.
Cash Movement Slip physical print remains separate/pending.
Financial commit must not roll back merely because printing fails.
```

Do not claim printer production acceptance without evidence.

## 22. Responsive requirements

### Tablet landscape (primary)

- Fixed layout; **no full-page scrolling**
- No overflow
- Header + till info + form + summary + actions visible
- Fit via adaptive padding, compact typography, flex columns

### Tablet portrait

Adapt safely; avoid clipping / RenderFlex overflow.

### Phone

Single-column / stacked; remain responsive (FittedBox scale-down acceptable).

### Desktop

Bounded / balanced max-width; do not stretch fields across ultra-wide.

## 23. Performance

- No API call per amount keystroke
- Local remaining-cash preview only
- Avoid unnecessary rebuilds / duplicate mutations
- Refresh authoritative summary after success

## 24. Accessibility

Usable touch targets, semantic labels, focus order, accessible errors,
PIN visibility semantics, disabled/loading semantics, text scaling without
major clipping.

## 25. Security

Authenticated endpoint; server permission; tenant isolation; trusted
device/till; no PIN/JWT/secret logging; no client-authoritative currency,
tenant, session, or user.

## 26. Reliability

Retry-safe, duplicate-safe, form preserved on transient error, no partial
financial transaction.

## 27. Maintainability

Component-wise UI; no duplicate full screen; shared cash-drawer
provider/repository; generic HardwareCash backend; theme tokens; no business
rules buried only in widgets.

## 28. Backend folder ownership

See §13. **Do not** add `Modules/Tenant/CashDrop/`.

## 29. Flutter folder ownership

See §14. Keep under `features/cash_drawer`.

## 30. Test / acceptance criteria

Minimum cases (document IDs in [[../../10_TESTING_QA/POS_Flow_Test_Cases]]):

`CD-001` … `CD-022` covering valid drop, amount/reason failures, closed till,
permissions, inactive/IN/foreign types, currency authority, expected-cash
decrease, duplicate tap, RequestId replay/conflict, concurrent insufficient
cash, timeout-after-commit, form preservation, summary refresh, tenant
isolation, print failure must not reverse finance.

Mark **PASS** only with dated evidence. As of 2026-08-16 Chunk 2:

```text
PASS — CASH DROP SOFTWARE PRODUCTION ACCEPTANCE COMPLETE
```

Evidence:

[[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]

## 31. Known gaps (non-blocking vs physical hardware)

1. Cash Movement Slip print (optional/separate; not a finance blocker).
2. Physical cash-drawer pulse acceptance remains a **separate hardware gate**
   (DR-*) and must not be confused with Cash Drop finance.

**Bank Deposit** as a reason label does **not** authorize a banking module.

## 32. Production readiness status

```text
CASH DROP SOFTWARE FLOW: PRODUCTION ACCEPTED (2026-08-16)
PHYSICAL HARDWARE MODULE: BLOCKED (separate concern)
```

Do not mark overall POS hardware production-ready from Cash Drop software PASS.

## Related files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[06_Cash_Drawer_Feature]]
- [[../../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification]]
- [[../../06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED]]
- [[../../05_BACKEND_ARCHITECTURE/API_ENDPOINTS]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Second_Brain_Canonicalization_2026-08-16]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_In_Chunk_3_Final_Production_Acceptance]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
