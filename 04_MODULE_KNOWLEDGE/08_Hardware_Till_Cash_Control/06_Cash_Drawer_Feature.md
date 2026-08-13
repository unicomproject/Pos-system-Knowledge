<!-- title: Cash Drawer Feature -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Cash Drawer Feature

## Purpose

Authoritative product/backend contract for Cashier **Cash Drawer** management:
till cash position monitoring, physical Open Drawer, Cash In / Cash Out·Drop,
recent movements, and entry to Close Till.

Flutter presentation authority:
[[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Implementation_Specification]].
Journey: [[../../03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow]].
Physical pulse: [[../../12_INTEGRATIONS/Cash_Drawer_Integration]].

## Implementation Readiness

| Layer | Status |
|---|---|
| Requirements / Second Brain | **DOCUMENTED / READY FOR IMPLEMENTATION PLANNING** (2026-08-13) |
| Backend Till session APIs | **EXISTING / REUSE** |
| Backend physical drawer APIs | **EXISTING / REUSE** (`/api/v1/pos/hardware/drawer/*`) |
| Backend Cash Drawer financial APIs | **APPROVED_TARGET_NOT_IMPLEMENTED** |
| New DB table for Cash Drawer screen | **NOT REQUIRED / NOT APPROVED** |
| New summary DB columns for UI | **NOT REQUIRED / NOT APPROVED** |
| New permission codes | **NOT REQUIRED** (reuse catalog; seed/enforce `cash_drawer.movement.create`) |
| Flutter Cash In/Out | **FRONTEND_ONLY** today |
| Feature Completed | **Not claimed** |

## Screen Contract (summary)

- Title **Cash Drawer** and subtitle inside the main **white** content card,
  below the standard POS top bar.
- No back-arrow; no “Continue to Dashboard”.
- Normal POS bottom navigation remains available.
- Simplified Till Summary: Till, Status, Opening Cash, Cash Sales, Current
  Expected Cash.
- Actions: Open Drawer, Cash In, Cash Out/Drop, Close Till.
- Recent cash movements newest first with typed semantics.

## Permissions

| Code | Purpose |
|---|---|
| `cash_drawer.view` | View Cash Drawer |
| `cash_drawer.manage` | Physical/manual Open Drawer management |
| `cash_drawer.movement.create` | Create Cash In / Cash Out / Cash Drop |
| `pos.till.close` | Close Till |

## Approved Target Financial APIs

| API | Status |
|---|---|
| `GET /api/v1/pos/cash-drawer/summary` | APPROVED_TARGET_NOT_IMPLEMENTED |
| `GET /api/v1/pos/cash-drawer/movements` | APPROVED_TARGET_NOT_IMPLEMENTED |
| `POST /api/v1/pos/cash-drawer/movements` | APPROVED_TARGET_NOT_IMPLEMENTED |

## Database Decision

One financial cash-movement source of truth is mandatory.

| Role | Table / source |
|---|---|
| Canonical long-term ERD target | `cash_movement_types` + `cash_movements` |
| Current runtime ledger | `till_cash_movements` |
| Cash sale contribution today | `sales_payments` (CASH, paid statuses) |
| Physical drawer audit | `cash_drawer_operations` |

Do not create `cash_drawer_summary` / `cash_drawer_history`.
Do not dual-write both movement tables.

## Expected Cash

Backend-authoritative. Conceptual:

```text
Opening Cash + Cash Sales + Cash In − Cash Refunds − Cash Out − Cash Drops
```

No double counting of the same payment as both payment row and movement row.

## Offline

Cash In / Out / Drop: **ONLINE / BACKEND AUTHORITATIVE** until an approved
offline contract exists.

## Related Files

- [[01_Module_Overview]]
- [[02_Functional_Rules]]
- [[03_Technical_Contract]]
- [[04_Open_Till_Feature]]
- [[05_Close_Till_Feature]]
- [[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Second_Brain_Alignment_2026-08-13]]
