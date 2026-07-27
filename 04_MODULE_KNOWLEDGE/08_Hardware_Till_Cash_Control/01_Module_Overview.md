<!-- title: Hardware Operations, Till Session & Cash Control Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-23 -->

# Hardware Operations, Till Session & Cash Control Module Overview

## Purpose

Control hardware devices, hardware assignments, hardware tests, till sessions, cash movements, cash reconciliation, and denomination counts.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Hardware_Till_Cash_Control` |
| Module number | 08 |
| Primary users | Cashier, Store Manager, Tenant Admin |
| Frontend surfaces | Till open/close, Cash in/out, Hardware testing, Printer/scanner/drawer/card reader status |
| API groups | Verified Cashier APIs: `/api/v1/tills/current-session`, `/api/v1/tills/open`, `/api/v1/tills/close`; hardware/cash-movement test APIs are not implemented |

## Main Tables

| Table | Role |
|---|---|
| `hardware_devices` | Used by this module |
| `hardware_device_assignments` | Used by this module |
| `hardware_test_logs` | Used by this module |
| `till_sessions` | Used by this module |
| `till_cash_movements` | Schema foundation exists; cashier mutation API is not wired |
| `cash_reconciliations` | Used by this module |
| `cash_count_denominations` | Used by this module |

## Core Business Rules

- Till session is required for POS sale, payment, receipt, and cash movements.
- Cash movement amount is positive and uses a movement type.
- Cash reconciliation records expected cash, counted cash, and variance.
- Hardware tests are logged but physical communication is handled by app/local service.
- Cash drawer open requires permission, till context, and audit.
- Current hardware-test logging and cashier Cash In/Out are not end-to-end
  implemented; schema presence is not operational API behavior.

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

- [[../07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]]
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
