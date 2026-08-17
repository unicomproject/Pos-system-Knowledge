<!-- title: Cash Drawer Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Cash Drawer Feature

## Purpose

Canonical Cashier contract for backend-authoritative drawer position, physical
Open Drawer, Cash In/Out/Drop, recent movements, and Close Till reuse.

## Domain separation

| Concern | API / table | Notes |
|---|---|---|
| Physical Open Drawer | `/api/v1/pos/hardware/drawer/*` → `cash_drawer_operations` | Hardware audit only |
| Financial Cash In | `POST /api/v1/pos/cash-drawer/movements` + `Direction=IN` | Canonical `cash_movements` |
| Financial Cash Drop | Same movements API + `Direction=OUT` | **SOFTWARE PRODUCTION ACCEPTED** (Chunk 2) |
| Summary / history | `GET .../summary`, `GET .../movements` | Backend-authoritative |

## Current implementation classification

| Capability | Status |
|---|---|
| Cash Drawer Management Flutter UI | IMPLEMENTED |
| Physical drawer APIs | SOFTWARE hardened 2026-08-16 ([[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_3_Physical_Cash_Drawer_2026-08-16]]); physical DR-* PENDING |
| Summary / movement list APIs | IMPLEMENTED |
| Cash movement type read API (`direction=IN`) | **VERIFIED** |
| Cash movement type read API (`direction=OUT`) | **IMPLEMENTED** (Chunk 1) |
| Canonical Cash In mutation → `cash_movements` | **VERIFIED** |
| Canonical Cash Drop / OUT mutation | **IMPLEMENTED** + **SOFTWARE PRODUCTION ACCEPTED** (Chunk 2) |
| `cash_movements.request_id` + tenant unique index | **IMPLEMENTED** |
| Dual-write POS Cash In/Drop to `till_cash_movements` | **FORBIDDEN / not used** |
| Cash In Phone/Tablet/Desktop acceptance | **VERIFIED** (Chunk 3) |
| Cash Drop UI | IMPLEMENTED |
| Cash Drop available-cash server validation | **IMPLEMENTED** (Chunk 1) |
| Cash Drop E2E / production acceptance | **VERIFIED** — [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]] |

## Canonical financial authority

```text
cash_movement_types -> cash_movements -> till_sessions
```

- `sales_payments` remains payment/refund truth.
- `cash_movements` is the only approved manual movement ledger for POS Cash In/Drop.
- `cash_movement_types` is the reason/type catalog authority.
- `till_cash_movements` is legacy/compatibility (e.g. some return flows), not a
  second POS Cash In/Drop ledger.
- Never dual-write one financial Cash In/Drop.
- Never add a screen-specific summary table.

Expected Cash is calculated by the backend from opening float, successful cash
payments/refunds, and canonical movements whose type affects expected cash.
Flutter displays the returned value and must not recalculate final authority.

Available Cash in Drawer is currently the same backend figure as Current
Expected Cash unless a future separate authority is approved.

## Cash In reason model

System IN types: `FLOAT_ADDED`, `PETTY_CASH_ADDED`, `CASH_CORRECTION`, `OTHER`.
They are global (`tenant_id = NULL`), system-owned, active, direction `IN`, and
affect expected cash. Active tenant-owned IN types may also be returned.

UI **Reason \*** selects `cash_movement_types.id` as `movementTypeId`.
`cash_movements.reason` is optional explanatory note text.

## Cash Drop reason model

**TARGET:** OUT catalog via `GET .../cash-movement-types?direction=OUT`.
Summary formula already anticipates system code `CASH_DROP` for drop totals.
OUT seeds and API acceptance are **REQUIRED gaps**. Hardcoded Flutter Drop
labels are interim only. A "Bank Deposit" label does not authorize a banking
module. Full contract: [[07_Cash_Drop_Feature]].

## Permissions and preconditions

- `cash_drawer.view`: read summary, history, movement types.
- `cash_drawer.manage`: physical/manual Open Drawer only.
- `cash_drawer.movement.create`: create Cash In/Out/Drop.
- `pos.till.close`: Close Till.
- Authentication, active tenant, trusted active device, resolved outlet/till,
  and an OPEN till session are mandatory.
- Backend authorization is permission-based; role-name bypasses are forbidden.
- No new permission codes for Cash Drop.

## API direction

| Method | Route | Status |
|---|---|---|
| GET | `/api/v1/pos/cash-drawer/summary` | IMPLEMENTED |
| GET | `/api/v1/pos/cash-drawer/movements` | IMPLEMENTED |
| GET | `/api/v1/pos/cash-movement-types?direction=IN` | VERIFIED |
| GET | `/api/v1/pos/cash-movement-types?direction=OUT` | **PENDING** (currently rejected) |
| POST | `/api/v1/pos/cash-drawer/movements` | **IN VERIFIED; OUT REJECTED** |

Do **not** create `POST /cash-drop` or `POST /cash-out`.

Canonical body uses `requestId`, `deviceId`, `movementTypeId`, `amount`,
optional `note`. Currency/session/user/tenant are server-owned.

Idempotency uses `cash_movements.request_id` with
`UNIQUE(tenant_id, request_id) WHERE request_id IS NOT NULL`.

## Screen contracts

- Cash Drawer Management: [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
- Cash In: [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification]]
- Cash Drop: [[07_Cash_Drop_Feature]]

Manager PIN remains UI-only future placeholder on In/Drop forms.

## No-new-schema decision for Cash Drop

```text
New Cash Drop table        → NO
New Cash Drop-specific API → NO
New Cash Drop DB columns   → NO
New permission             → NO
New backend module         → NO
Duplicate Flutter feature  → NO
Existing generic movement  → REUSE / EXTEND
OUT movement support       → IMPLEMENT / VERIFY
```

## Related files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[07_Cash_Drop_Feature]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
- [[../../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Second_Brain_Canonicalization_2026-08-16]]
