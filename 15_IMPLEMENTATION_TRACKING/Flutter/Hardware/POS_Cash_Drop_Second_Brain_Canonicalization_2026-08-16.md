<!-- title: POS Cash Drop Second Brain Canonicalization 2026-08-16 -->
<!-- status: Historical evidence — superseded by Chunk 2 software acceptance -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Cash Drop — Second Brain Canonicalization (2026-08-16)

> **Supersession:** This morning’s pre-implementation canonicalization is retained
> as historical evidence. Runtime Cash Drop software acceptance is now recorded in
> [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]]
> (`PASS — CASH DROP SOFTWARE PRODUCTION ACCEPTANCE COMPLETE`).
>
> Statements below that say OUT/Cash Drop **NOT IMPLEMENTED** or
> **NOT production ready** are **historical pre-Chunk-2 snapshots** and must not
> be used as current SoT.
>
> Overall POS **physical hardware** remains
> `BLOCKED — HARDWARE NOT PRODUCTION READY` —
> [[POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]].

**Original verdict (pre-implementation):** `PASS — CASH DROP SECOND BRAIN CANONICALIZATION COMPLETE`  
**Code changes in that task:** None (documentation only)

## 1. Objective

Make POS Second Brain the canonical production specification for Cash Drop /
Cash Out before any further backend or Flutter Cash Drop implementation, aligned
to actual checked-out code.

## 2. Files read (Second Brain)

- `00_START_HERE/Current_Source_Of_Truth.md`
- `00_START_HERE/Developer_Reading_Guide.md` (routing context)
- `00_START_HERE/Project_Glossary.md` (routing context)
- `03_USER_JOURNEYS/Cashier/03_Till_Open_Flow.md` (context)
- `03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow.md`
- `03_USER_JOURNEYS/Cashier/11_Till_Close_Flow.md` (context)
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/*` (all six existing + new Drop)
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- `06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification.md`
- `10_TESTING_QA/POS_Flow_Test_Cases.md`
- `10_TESTING_QA/Idempotency_Test_Cases.md`
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`
- Cash In Chunk 1–3 / Cash Drawer tracking under `15_IMPLEMENTATION_TRACKING/`

Related architecture docs were consulted for standards consistency (API,
permissions, Flutter folder rules) without inventing unsupported contracts.

## 3. Backend code inspected

Branch: `Tharmi_CashDrawer_012` (`Unified-Commerce`)

- `PosDrawerController.cs` (physical + financial controllers)
- `PosDrawerService` / `PosDrawerRepository`
- `CashMovement`, `CashMovementType` entities + EF configurations
- `CashDrawerPermissions`
- Migration `20260815133611_CanonicalizeCashInMovements`
- IN type seed data; OUT reject paths; summary expected-cash formula
- Unit/integration tests rejecting OUT / excluding OUT from IN catalog

## 4. Flutter code inspected

Branch: `Tharmi_tenant_set` (`Nytroz-POS-App`)

- `features/cash_drawer/presentation/screens/pos_cash_drop_screen.dart`
- `cash_drop_*` widgets + `cash_drop_provider.dart`
- `cash_drop_reason.dart` (hardcoded labels)
- `cash_drawer` repository/datasource (`createMovement` legacy vs
  `createCashInMovement` canonical)
- Parallel Cash In path for contrast

## 5. Stale statements found

| Location | Stale claim |
|---|---|
| `10_Cash_In_Out_Flow.md` | Cash In still pending; persistence on `till_cash_movements` |
| `06_Cash_Drawer_Feature.md` | Canonical mutation pending; no types API; no `request_id` |
| `01_Module_Overview.md` | Cash In writer still `till_cash_movements`; Close Till no reconciliation |
| `03_Technical_Contract.md` | POST implements CASH_IN/OUT/DROP all |
| Table `09_...UPDATED.md` | `cash_movements` SCHEMA_ONLY / not active writer |
| `API_ENDPOINTS.md` | POST creates CASH_IN/OUT/DROP |
| `Permission_Code_List.md` | Canonical persistence still pending |
| `Flutter_Cash_In_...Specification.md` | Integration + acceptance still pending |
| `POS_Flow_Test_Cases.md` | Cash In/Out mutation API missing |
| `Current_Source_Of_Truth.md` | Cash Drawer wording treated Out as equal to In readiness |

## 6. Conflicts resolved

- Financial ledger authority: **`cash_movements`** for POS Cash In (verified).
- Legacy: **`till_cash_movements`** compatibility only; no dual-write for POS
  Cash In/Drop.
- Physical drawer vs financial Drop clearly separated.
- OUT/Cash Drop marked **NOT IMPLEMENTED**, not falsely verified.
- `request_id` documented as **implemented** on `cash_movements`.
- Flutter ownership documented as **`features/cash_drawer`** (actual).

## 7. Database decision

```text
New Cash Drop table        → NO
New Cash Drop DB columns   → NO
Reuse cash_movement_types + cash_movements → YES
OUT type seeds             → REQUIRED GAP
```

## 8. API decision

```text
New Cash Drop-specific API → NO
Reuse POST /api/v1/pos/cash-drawer/movements → YES
OUT create / OUT types GET → REQUIRED GAP
```

## 9. Permission decision

Reuse only:

- `cash_drawer.view`
- `cash_drawer.manage` (physical)
- `cash_drawer.movement.create`

No new codes.

## 10. Folder-structure decision

- Backend: existing `HardwareCash` module + `PosDrawerController.cs`
- Flutter: existing `features/cash_drawer` — no duplicate Drop feature tree

## 11. Cash In current verified state

| Area | Status |
|---|---|
| UI | IMPLEMENTED |
| API | VERIFIED |
| Persistence | VERIFIED (`cash_movements`) |
| Idempotency | VERIFIED |
| Expected cash | VERIFIED |
| Permissions | VERIFIED |
| E2E | VERIFIED (Chunk 3) |

## 12. Cash Drop current verified state

| Area | Status |
|---|---|
| UI | IMPLEMENTED (layout) |
| OUT API support | NOT IMPLEMENTED |
| Persistence | NOT IMPLEMENTED |
| Available cash validation (server) | NOT IMPLEMENTED |
| Expected cash subtraction | BLOCKED |
| Permissions (codes exist) | PARTIAL (UI gated; OUT path N/A) |
| Printing | NOT IMPLEMENTED |
| E2E | NOT VERIFIED |

## 13. Remaining implementation gaps

1. Seed OUT / `CASH_DROP` (and any approved OUT catalog rows)
2. Accept `direction=OUT` on types GET
3. Accept OUT on movements POST
4. Enforce amount ≤ authoritative available/expected cash
5. Flutter Drop: catalog + canonical body + stable `requestId`
6. Remove hardcoded Drop reasons as authority
7. Optional slip print (separate from finance)
8. CD-001…CD-022 evidence

## 14. Documents updated

- `00_START_HERE/Current_Source_Of_Truth.md`
- `03_USER_JOURNEYS/Cashier/10_Cash_In_Out_Flow.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature.md`
- `05_BACKEND_ARCHITECTURE/API_ENDPOINTS.md`
- `06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_In_Screen_Implementation_Specification.md`
- `10_TESTING_QA/POS_Flow_Test_Cases.md`
- `10_TESTING_QA/Idempotency_Test_Cases.md`
- `15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index.md`

## 15. Documents created

- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature.md`
- `15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Cash_Drop_Second_Brain_Canonicalization_2026-08-16.md` (this file)

## 16. Tests / evidence inspected

- Cash In Chunk 3 production acceptance record
- Backend OUT-reject / IN-only catalog tests (code)
- No Cash Drop successful E2E evidence exists

## 17. Final Second Brain readiness verdict

```text
SECOND BRAIN READY FOR CASH DROP IMPLEMENTATION
```

Runtime Cash Drop remains **NOT production ready** until gaps in §13 close.
