<!-- title: Hardware Operations, Till Session & Cash Control Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Hardware Operations, Till Session & Cash Control Module Overview

## Hardware production banner (2026-08-16)

```text
BLOCKED — HARDWARE NOT PRODUCTION READY
```

Physical receipt printer, physical cash drawer, barcode scanner, and Local Print
Agent production deployment acceptance remain incomplete. Financial Cash In /
Cash Drop are software-accepted and are **not** physical hardware I/O.

Canonical hardware authority:

[[../../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[../../12_INTEGRATIONS/POS_Hardware_Integration]]
[[../../12_INTEGRATIONS/Local_Print_Agent]]

## Purpose

Control hardware devices, hardware assignments, hardware tests, till sessions, cash movements, cash reconciliation, and denomination counts.

This module is part of the new OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Hardware_Till_Cash_Control` |
| Module number | 08 |
| Primary users | Cashier, Store Manager, Tenant Admin |
| Frontend surfaces | Till open/close, Cash Drawer (summary/actions/movements), Cash in/out, Hardware testing, Printer/scanner/drawer/card reader status, Hardware readiness monitoring |
| API groups | Implemented: `/api/v1/tills/current-session`, `/api/v1/tills/open`, `/api/v1/tills/close`, `/api/v1/pos/hardware/drawer/*`, `GET /api/v1/pos/cash-drawer/summary`, and `GET/POST /api/v1/pos/cash-drawer/movements` |

## Main Tables

| Table | Role |
|---|---|
| `hardware_devices` | Used by this module |
| `hardware_device_assignments` | Used by this module |
| `hardware_test_logs` | Used by this module |
| `till_sessions` | Used by this module |
| `cash_movement_types` | Canonical type/reason catalog; system-global plus tenant-owned entries |
| `cash_movements` | Canonical manual financial movement ledger; POS Cash In writer verified |
| `till_cash_movements` | Legacy/compatibility (e.g. some returns); no POS Cash In/Drop dual-write |
| `cash_drawer_operations` | Physical Open Drawer audit (implemented) — not a financial Drop |
| `cash_reconciliations` | Used by Close Till reconciliation persistence |
| `cash_count_denominations` | Used by this module |

## Core Business Rules

- Till session is required for POS sale, payment, receipt, and cash movements.
- Cash movement amount is positive and uses a movement type.
- Cash reconciliation records expected cash, counted cash, and variance.
- Hardware tests are logged but physical communication is handled by app/local service.
- Cash drawer open requires permission, till context, and audit.
- A physical Android POS may reach a laptop USB printer through the separate
  Windows Local Print Agent on an explicitly allowed private LAN.
- Printer process health, printer readiness, and paper completion are separate
  states; spooler acceptance does not prove that paper printed successfully.
- Cash Drawer financial APIs exist under `/api/v1/pos/cash-drawer/*` plus
  `GET /api/v1/pos/cash-movement-types`. Cash In (`Direction=IN`) and Cash Drop
  (`Direction=OUT`) persist to `cash_movements` with `request_id` idempotency
  (**software production-accepted**). Optional slip print remains not
  implemented and is not a finance blocker — see [[07_Cash_Drop_Feature]].
- Physical drawer routes under `/api/v1/pos/hardware/drawer/*` are separate from
  financial movements (**PARTIAL** — physical acceptance incomplete).
- Cash Drawer screen contract: [[06_Cash_Drawer_Feature]] and
  [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]].
- One financial cash-movement ledger is mandatory: `cash_movements`. Do not
  dual-write POS Cash In/Drop with `till_cash_movements`.
- Close Till Expected Cash is backend-calculated with atomic reconciliation
  persistence (see [[05_Close_Till_Feature]]); End Shift runtime matrix may
  still block combined release acceptance.

## Access Summary

| Control | Rule |
|---|---|
| Authentication | Required for protected staff/customer/admin actions |
| Tenant status | Tenant must be active or allowed for the requested operation |
| Feature entitlement | Required when this module is plan or add-on controlled |
| Permission | Required for staff/admin protected actions |
| Tenant isolation | Tenant-owned records must never leak across tenants |
| Audit/event history | Required for sensitive status, payment, inventory, auth, and access changes |

## Dependencies

- [[../07_Outlet_Till_POS_Device_Foundation/01_Outlet_Management_Overview]]
- [[../24_Payment_Refund/01_Module_Overview]]
- [[../21_POS_Operations/01_Module_Overview]]

## Out Of Scope

- Full accounting ledger
- Bank deposit workflow
- Supplier payment handling
- Customer online checkout UI

## Related Files

- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Screen_Implementation_Specification]]
- [[../../12_INTEGRATIONS/Cash_Drawer_Integration]]


## Tenant Admin Monitoring Surface (2026-08-01)

Tenant Admin Till right-side hardware card is an approved monitoring surface for this module. It reads Backend readiness/assignment status; it does not perform physical device I/O.

See [[../../12_INTEGRATIONS/POS_Hardware_Integration]] and [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]].
