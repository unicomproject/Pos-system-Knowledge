<!-- title: Hardware Operations, Till Session & Cash Control Module Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Hardware Operations, Till Session & Cash Control Module Overview

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
| API groups | Verified: `/api/v1/tills/current-session`, `/api/v1/tills/open`, `/api/v1/tills/close`, `/api/v1/pos/hardware/drawer/*`. Approved target (not implemented): `/api/v1/pos/cash-drawer/summary`, `/api/v1/pos/cash-drawer/movements` |

## Main Tables

| Table | Role |
|---|---|
| `hardware_devices` | Used by this module |
| `hardware_device_assignments` | Used by this module |
| `hardware_test_logs` | Used by this module |
| `till_sessions` | Used by this module |
| `cash_movement_types` | Type catalog / `affects_expected_cash` (read today) |
| `till_cash_movements` | **Current runtime** financial movement ledger (partial writes; no cashier Cash In/Out API yet) |
| `cash_movements` | Schema present; **SCHEMA_ONLY** (no app writer); long-term ERD target with `cash_movement_types` |
| `cash_drawer_operations` | Physical Open Drawer audit (implemented) |
| `cash_reconciliations` | Schema exists; current Close Till does not persist it |
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
- Current hardware-test logging and cashier Cash In/Out financial APIs are not
  end-to-end implemented; schema presence is not operational API behavior.
- Cash Drawer screen contract is documented in [[06_Cash_Drawer_Feature]];
  financial `/pos/cash-drawer/*` APIs remain APPROVED_TARGET_NOT_IMPLEMENTED.
- One financial cash-movement ledger is mandatory; do not dual-write
  `till_cash_movements` and `cash_movements`.
- Close Till route and CLOSED event exist, but production close is blocked until
  Expected Cash is backend-calculated and `cash_reconciliations` is committed.

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
- [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Implementation_Specification]]
- [[../../12_INTEGRATIONS/Cash_Drawer_Integration]]


## Tenant Admin Monitoring Surface (2026-08-01)

Tenant Admin Till right-side hardware card is an approved monitoring surface for this module. It reads Backend readiness/assignment status; it does not perform physical device I/O.

See [[../../12_INTEGRATIONS/POS_Hardware_Integration]] and [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]].
