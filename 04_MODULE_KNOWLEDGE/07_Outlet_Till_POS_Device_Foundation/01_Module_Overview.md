<!-- title: Outlet, Till & POS Device Foundation Module Overview -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-06-29 -->

# Outlet, Till & POS Device Foundation Module Overview

## Purpose

Model outlets, outlet addresses, business hours, tills, POS devices, till-device assignments, and linked hardware profiles for mobile and desktop EPOS operation.

This module is part of the new TM-EPOS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Outlet_Till_POS_Device_Foundation` |
| Module number | 07 |
| Primary users | Tenant Admin, Cashier, Store Manager |
| Frontend surfaces | Outlet management, Till management, Device activation/pairing, POS context selection |
| API groups | `/api/v1/outlets`, `/api/v1/tills`, `/api/v1/devices`, `/api/v1/device-pairing` |

## Main Tables

| Table | Role |
|---|---|
| `outlets` | Used by this module |
| `outlet_addresses` | Used by this module |
| `outlet_business_hours` | Used by this module |
| `tills` | Used by this module |
| `pos_devices` | Used by this module |
| `till_device_assignments` | Used by this module |
| `hardware_profiles` | Used by this module |

## Core Business Rules

- Outlet code is tenant-unique.
- Till belongs to an outlet and is used for POS sessions.
- Trusted POS device must match tenant, outlet, and assigned till policy.
- One device assignment cannot silently bypass permissions.
- Business hours can guide online store and pickup availability but do not replace backend validation.

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

- [[../02_Tenant_Foundation/01_Module_Overview]]
- [[../05_Tenant_User_Permission_Access/01_Module_Overview]]
- [[../08_Hardware_Till_Cash_Control/01_Module_Overview]]

## Out Of Scope

- Hardware test result storage
- Cash reconciliation
- Order fulfilment events
- Customer device/browser identity

## Related Files

- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/03_Technical_Contract]]
