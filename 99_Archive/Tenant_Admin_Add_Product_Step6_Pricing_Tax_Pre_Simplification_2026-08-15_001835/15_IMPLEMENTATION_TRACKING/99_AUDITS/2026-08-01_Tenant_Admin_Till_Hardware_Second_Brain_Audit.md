<!-- title: 2026-08-01 Tenant Admin Till Hardware Second Brain Audit -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-08-01 -->

# Documentation Audit Report — Tenant Admin Till Hardware & Network Integration

**Date:** 2026-08-01  
**Scope:** Second Brain documentation only  
**Code changes:** None (Backend and Flutter were read-only for evidence)

## 1. Second Brain files reviewed

- `08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI.md`
- `15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Till_Monitoring_UI_Implementation_Status.md`
- `03_USER_JOURNEYS/Tenant_Admin/05_Till_Management_Flow.md`
- `03_USER_JOURNEYS/Tenant_Admin/19_Device_Hardware_Management_Flow.md`
- `03_USER_JOURNEYS/Cashier/13_Hardware_Testing_Flow.md`
- `04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/03_Technical_Contract.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules.md`
- `04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract.md`
- `06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED.md`
- `02_ACCESS_CONTROL/Permission_Code_List.md`
- `02_ACCESS_CONTROL/Feature_Entitlement_Matrix.md`
- `12_INTEGRATIONS/POS_Hardware_Integration.md` (+ Receipt/Barcode/Cash Drawer/Card Reader)
- `10_TESTING_QA/Test_Case/07_Outlet_Till_POS_Device_Foundation/Till_Monitoring_Test_Cases.md`
- `15_IMPLEMENTATION_TRACKING/Backend/OutletTillDevice/Till_CRUD_Implementation_Status.md`

**Code evidence reviewed:** Unified-Commerce Till controllers/DTOs/repos/resolvers/HardwareCash entities; Nytroz-POS-App Till monitoring workspace/side panel/mapper/datasource.

## 2. Files updated

- Till Monitoring UI (rewritten with final split-view decision + status)
- POS Hardware Integration (canonical architecture SoT)
- Till Management + Device Hardware journeys
- Module 07 technical contract correction
- Module 08 overview, functional rules, technical contract addendum
- Hardware DB tables addendum
- Permission code list + feature entitlement (`till_management`)
- Receipt / Barcode / Cash Drawer / Card Reader integration boundaries
- Flutter Till Monitoring implementation status (rewritten)
- Till Monitoring test cases expansion
- Cashier Hardware Testing journey link

## 3. New files created

- `15_IMPLEMENTATION_TRACKING/Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation.md`
- `15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Till_Hardware_Side_Panel_Implementation.md`
- This audit report

## 4. Duplicate documents avoided

- Did not create a second Till UI SoT; updated `Tenant_Admin_Till_Monitoring_UI.md`.
- Did not invent a parallel API contract; extended Module 07/08 contracts and POS Hardware Integration.
- Did not invent `hardware_alerts` table.
- Device-specific transport details remain in existing integration notes; POS_Hardware_Integration is the architecture hub.

## 5. Contradictions found

| Contradiction | Evidence |
|---|---|
| Docs said desktop master-detail not implemented | Flutter split-view now exists |
| Module 07 said list lacks cashier/lastDeviceSeen/operationalStatus | DTOs already include these fields |
| Docs implied hardware readiness only flat strings | `GET .../hardware-readiness` exists over assignments |
| Permission list omitted `tenant.hardware.view` / details.view / assign_outlet | Seeded in migration |
| Entitlement matrix omitted `till_management` | Present in Backend seed |
| Tracking said layout not implemented | Outdated |
| Summary Offline vs product "offline operational" | Repository maps `OfflineTills` to inactive count — product risk |
| Connection status resolvers disagree | Service CONNECTED/DISCONNECTED vs `HardwareConnectionStatusResolver` labels |

## 6. Contradictions resolved

- Split-view marked final; list-only desktop marked DEPRECATED.
- Module 07 corrected for implemented monitoring fields; remaining gaps listed.
- Permissions/entitlements aligned to seeded codes.
- Architecture rule recorded: Tenant Admin does not talk to hardware directly.
- Status honesty: empty hardware card ≠ completed physical integration.

## 7–18. Decisions recorded

| Topic | Recorded in |
|---|---|
| Final Till UI decision | Till Monitoring UI + journeys |
| Hardware architecture | POS_Hardware_Integration |
| Database contract | DB table 09 + Module 08 |
| API contracts | Module 08 addendum + HardwareCash tracking |
| Flutter contract | Till Monitoring UI + Flutter tracking |
| Permissions | Permission_Code_List |
| Heartbeat rule | POS_Hardware_Integration + options default 300s |
| Test flow | POS_Hardware_Integration + journeys |
| Alert rules | Derived MVP; no alerts table |
| Network-printer limitation | Receipt Printer + POS Hardware |
| Cash-drawer limitation | Cash Drawer + POS Hardware |
| Card-reader security | Card Reader + POS Hardware |

## 19. Current implementation status (summary)

| Area | Status |
|---|---|
| Till split-view UI | **PARTIALLY COMPLETED** |
| Till summary/list Backend binding | **COMPLETED** (real values) |
| Selected Till details panel | **PARTIALLY COMPLETED** |
| Cashier on panel | **PARTIALLY COMPLETED** |
| Last activity on panel | **PARTIALLY COMPLETED** |
| Hardware inventory entities | **PARTIALLY COMPLETED** |
| Hardware registration API | **NOT IMPLEMENTED** |
| Hardware assignment API | **NOT IMPLEMENTED** |
| Hardware readiness read | **PARTIALLY COMPLETED** |
| POS device heartbeat | **COMPLETED** |
| Peripheral hardware heartbeat | **NOT IMPLEMENTED** |
| Test-result reporting | **NOT IMPLEMENTED** |
| Derived alerts | **NOT IMPLEMENTED** |
| Till hardware monitoring card | **PARTIALLY COMPLETED** |

## 20. Physical-verification status

**PHYSICAL VERIFICATION PENDING** for network printer, USB/BT printer, scanner acceptance, cash-drawer pulse, card-reader provider pairing. Not marked complete.

## 21. Remaining decisions

- Whether to embed hardware connections into `GET .../tills/{id}` vs keep readiness related-read only (both allowed if JSON compatible).
- Single connection-status vocabulary convergence (`HardwareConnectionStatusResolver` vs readiness service).
- Offline summary semantics (inactive vs heartbeat-offline).
- Whether `tenant.hardware.view` must gate readiness GET (currently Till view/details/manage).
- Post-MVP persistent alert acknowledge/resolve workflow.

## 22. Recommended implementation sequence

Recorded in `12_INTEGRATIONS/POS_Hardware_Integration.md` (steps 1–18).

## 23. Confirmation — no Backend or Flutter code modified

**Confirmed.** Documentation-only task.

## 24. Confirmation — no feature marked complete without evidence

**Confirmed.** Physical integrations and incomplete APIs remain NOT IMPLEMENTED / PHYSICAL VERIFICATION PENDING / PARTIALLY COMPLETED as evidenced.

## Audit matrix (condensed)

| Requirement | Document | Code evidence | DB evidence | Gap | Update action | Status |
|---|---|---|---|---|---|---|
| Split-view UI | Till Monitoring UI | workspace + side panel | n/a | panel data incomplete | Updated UI + Flutter tracking | PARTIALLY COMPLETED |
| Summary/list | Journey + Module 07 | summary/list APIs | tills/pos_devices/sessions | Offline mapping risk | Corrected contracts | COMPLETED / risk noted |
| Hardware registration | POS Hardware | no controller | hardware_devices | no API | Documented expected APIs | NOT IMPLEMENTED |
| Assignment | POS Hardware | readiness Till-only join | hardware_device_assignments | no merge Model B; no mutate API | Documented | PARTIALLY COMPLETED / NOT IMPLEMENTED |
| Heartbeat peripheral | POS Hardware | entity method only; device heartbeat exists | last_seen_at | no peripheral route | Documented conceptual route | NOT IMPLEMENTED |
| Alerts | UI + Module 08 | alertCount hard 0 | derived | no derivation | Documented MVP derived | NOT IMPLEMENTED |
| Physical printer | Receipt Printer | ESC/POS facade | n/a | not verified | Boundary append | PHYSICAL VERIFICATION PENDING |


## Cross-document consistency check (2026-08-01)

Verified during documentation audit:

- User journeys and POS_Hardware_Integration agree: Tenant Admin monitors; native POS executes physical I/O.
- Module 08 technical contract uses actual routes/DTO field names from Unified-Commerce.
- Permission codes aligned to seed migration + `TenantAdminTillPermissions`.
- Flutter `selectedTillId` + readiness endpoint documented; alertCount currently forced 0 in mapper — tracked as NOT IMPLEMENTED.
- Heartbeat threshold documented as configuration-driven (`HeartbeatTimeoutSeconds`, default 300).
- Implementation tracking does not claim physical verification complete.
- Full-width list-only desktop marked DEPRECATED relative to approved split-view.


## Follow-up from code audits (2026-08-01)

Read-only audits ([Audit Till hardware Flutter](f01d35f4-9d21-484e-9b59-7eeae23e9281), [Audit Till hardware backend](ec5a48f7-0db8-496e-b1ea-0b57c906c26e)) confirmed and refined the documentation matrix:

- Split-view **widgets** = COMPLETED; panel **binding** remains PARTIALLY COMPLETED
- Empty hardware = missing assignments/APIs/seeds, not a UI defect alone
- Backend discards AttentionReasons on list/detail; readiness omits alertCount
- Flutter readiness DTO/mapper drops cashier/activity/alerts
- `hardware_device_management` catalog feature unwired
- Tracking notes updated under Backend HardwareCash + Flutter Till Hardware Side Panel

No Backend or Flutter code was modified in this follow-up.


## Backend implementation update 2026-08-01

Unified-Commerce Backend hardware readiness/inventory/assignment/heartbeat/test APIs implemented and API-verified. Flutter unchanged. Physical verification remains pending.

See [[../Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]].
