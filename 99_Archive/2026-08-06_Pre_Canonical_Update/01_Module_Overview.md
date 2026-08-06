<!-- Archived: 2026-08-06 -->
<!-- Reason: Superseded by new canonical Outlet Management specification. -->

# ARCHIVED: Outlet, Till & POS Device Foundation Module Overview

## Purpose

Model outlets, outlet addresses, business hours, tills, POS devices, till-device assignments, and linked hardware profiles for mobile and desktop EPOS operation.

This module is part of the new OneVerz POS MVP scope: mobile and desktop EPOS,
responsive online store, offline-capable operation, click and collect, multi-device
support, and low-cost hardware usage for events, stalls, food and beverage,
merchandising, attractions, and temporary retail locations.

## MVP Position

| Item | Decision |
|---|---|
| Module | `Outlet_Till_POS_Device_Foundation` |
| Module number | 07 |
| Primary users | Tenant Admin, Business Owner, Operations Manager, Outlet Manager, Cashier |
| Frontend surfaces | Outlet management, Till management, Till monitoring, Device activation/pairing, POS context selection |
| API groups | `/api/v1/outlets`, `/api/v1/tills`, `/api/v1/devices`, `/api/v1/device-pairing`, `/api/v1/tenant-admin/outlets`, `/api/v1/tenant-admin/tills` |

## Approved Tenant Admin Shell (UI)

The Outlet Management screen operates within the existing Tenant Admin office shell:
- Fixed black OneVerz POS header with logo, Till Session status, current outlet/till selectors, and notification icon.
- Light Tenant Admin sidebar ("Outlets" is active).
- Fixed black footer navigation bar (Home, New Sale, Orders, Customers, Settings).
- The screen must NOT replace this shell with a generic admin dashboard shell.

## User Categories

**Primary:**
- **Tenant Admin / Business Owner:**
  - **Goal:** Manage all outlets across the tenant.
  - **Allowed actions:** View, Create, Edit, Delete/Deactivate, View Summaries and Reports.
  - **Permission:** `tenant.outlets.manage`, `tenant.outlets.view`.
- **Operations Manager:**
  - **Goal:** Monitor outlet health and performance.
  - **Allowed actions:** View, Edit, View Reports.

**Conditional:**
- **Outlet Manager / Cashier:**
  - **Goal:** Operate a specific assigned outlet.
  - **Restricted data:** Can only view their assigned outlet. Cannot create/delete outlets.

## Responsive Behaviour & Accessibility

**Desktop:**
- Summary cards displayed in one row.
- Outlet table with full columns.
- Overview and performance panels on the right.

**Tablet:**
- Summary cards in 2-column layout.
- Outlet overview moves below the table.
- Less important columns may collapse. Actions remain touch-friendly.

**Mobile:**
- Outlet rows rendered as cards (Name, code, type, status, city, till count).
- Actions in overflow menu. Filters in bottom sheet/full-screen dialog.
- Fixed Tenant Admin footer navigation remains available. No horizontal overflow.

**Accessibility:**
- Minimum touch target size. Keyboard navigation. Visible focus state.
- Screen-reader labels for icon-only actions. Status is not represented by colour alone.
- Appropriate contrast. Error text linked to form fields.


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
- Till operational status (Online/Offline) is determined by device heartbeat, not just lifecycle status.
- Current cashier is resolved dynamically from the open till session.
- Trusted POS device must match tenant, outlet, and assigned till policy.
- One active device assignment per till/device where defined.
- One device assignment cannot silently bypass permissions.
- Hardware configuration and assignment are device-specific, tenant/outlet
  scoped, versioned, revocable, and auditable.
- The active shift must retain the hardware identity/configuration version used;
  printer/drawer changes during a shift require an approved policy and audit.
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

- Hardware execution and test-result storage are owned by Module 08.
- Cash reconciliation
- Order fulfilment events
- Customer device/browser identity

## Related Files

- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/03_Technical_Contract]]
