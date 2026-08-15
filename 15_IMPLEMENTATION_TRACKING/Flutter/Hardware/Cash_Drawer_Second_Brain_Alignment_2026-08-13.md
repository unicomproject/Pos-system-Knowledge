<!-- title: Cash Drawer Second Brain Alignment 2026-08-13 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Cash Drawer Second Brain Alignment — 2026-08-13

## Result

**SECOND BRAIN CASH DRAWER ALIGNMENT COMPLETE** for documentation /
implementation-planning readiness.

No Flutter or Backend source code was modified in this alignment task.
No migrations were created.

## Why this folder

Tracking placed under `15_IMPLEMENTATION_TRACKING/Flutter/Hardware/` because
Cash Drawer spans HardwareCash physical drawer + Hardware_Till_Cash_Control
financial cash control. A duplicate under `Flutter/Sales` was not created.

## Evidence summary

| Area | Verified classification |
|---|---|
| Till current-session / open / close APIs | IMPLEMENTED |
| Hardware drawer APIs | IMPLEMENTED |
| Cash Drawer financial `/pos/cash-drawer/*` APIs | APPROVED_TARGET_NOT_IMPLEMENTED |
| Flutter Cash Drawer UI | PARTIAL |
| Flutter Cash In / Drop | FRONTEND_ONLY |
| `till_cash_movements` | PARTIAL runtime ledger |
| `cash_movements` | SCHEMA_ONLY |
| `cash_drawer.movement.create` | SCHEMA_ONLY (constant; seed/enforce gap) |

## Conflicts recorded

1. `cash_movements` (ERD target) vs `till_cash_movements` (runtime).
2. Local Flutter movements vs backend-authoritative state.
3. Approved Cash Drawer financial APIs vs no current endpoints.
4. Cashier orange/black POS direction vs navy→violet shared CTA default.
5. Approved bottom-nav-on-Cash-Drawer vs current shell whitelist omission.
6. Canonical `cash_drawer.movement.create` vs Flutter gating via `manage`.

## Documents produced / updated

Canonical Flutter spec:
[[../../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Implementation_Specification]]

Feature contract:
[[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]

Also updated: Current_Source_Of_Truth, Cash In/Out journey, Module 08 overview /
functional / technical docs, API_ENDPOINTS, DB table 09, Design_System,
POS_App_UI_Rules, Permission_Code_List clarification, Flutter implementation map,
Cash_Drawer_Integration cross-links, Full_Feature_Status_Index.

## Development readiness

**READY FOR CASH DRAWER IMPLEMENTATION CHUNK PLANNING**

Implementation must not mark production Complete until financial APIs, Flutter
data layer, permission alignment, and responsive E2E pass.
