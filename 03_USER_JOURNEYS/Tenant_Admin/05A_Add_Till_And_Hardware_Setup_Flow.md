<!-- title: Tenant Admin Add Till and Hardware Setup Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-04 -->

# Tenant Admin Add Till and Hardware Setup Flow

## Purpose
Defines the journey for creating a new Till and performing initial hardware assignment in a single, streamlined page, replacing the legacy four-step Till Wizard.

## Actor
Tenant Admin

## Source
Approved Add Till Single-Page UI reference and TM-EPOS MVP Second Brain scope.

## Trigger
Tenant Admin clicks "New Till" or "Add Till" from the Tills monitoring page.

## Preconditions
- Tenant Admin has `tenant.tills.create` permission.
- At least one active outlet exists in the tenant.
- Entitlement `till_management` is enabled.

## Main Flow (Single Page Layout)

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Navigate to Add Till | System displays the single-page `/tenant-admin/tills/add` route. |
| 2 | Enter Till Details | User provides Till Name (required), Till Code (required, manual), and selects an Assign Outlet (required). Default Status is Active. |
| 3 | Enter Financials/Cashier | User sets Default Cashier (required in UI) and Opening Float. System uses default currency. |
| 4 | Change Outlet (Optional) | If outlet is changed, system clears any selected incompatible POS or hardware devices. |
| 5 | Setup POS Device | User selects POS Device from active devices assigned to the chosen outlet. |
| 6 | Setup Peripherals | User selects Scanner, Receipt Printer, Cash Drawer, and Card Reader from available hardware for the outlet. |
| 7 | View Quick Pair Status | System updates the right-hand panel with selected hardware. Status shown is based on real trusted heartbeat and readiness APIs. |
| 8 | Submit | User clicks "Create Till". |
| 9 | Validation & Save | System validates data (e.g., unique code, outlet scope). Submits Create Till API, then assigns selected hardware (Strategy B). |
| 10 | Success | System returns to Till list and displays success message. |

## Data Used Or Captured
- **Till Details:** Till Name, Till Code, Outlet ID, Status, Default Cashier (Requires DB update), Default Opening Float Amount (maps to `tills.default_opening_float_amount`).
- **Hardware Assignments:** `posDeviceId`, scanner `hardwareDeviceId`, printer `hardwareDeviceId`, drawer `hardwareDeviceId`, card reader `hardwareDeviceId`.

## Access And Security Rules
- Missing `tenant.tills.create` blocks access to the page entirely.
- Missing `tenant.hardware.view` hides or disables the Hardware Setup and Quick Pair sections.
- Missing `tenant.hardware.manage` makes Hardware Setup read-only.
- Hardware must belong to the selected outlet (server-side validation).

## Validation And Error Cases
- **Duplicate Till Code:** 409 Conflict. Data remains safe on screen.
- **Cross-tenant or Invalid Outlet:** 404/403.
- **Negative Opening Float:** Rejected.
- **Hardware Assignment Conflict:** 409 Conflict (e.g., device already assigned to another till).
- **Partial Assignment Failure:** Creation succeeds, but one or more assignments fail. Retry Hardware Setup action provided.
- **Double Submission:** "Create Till" button disabled while processing.
- Cancel with unsaved data shows standard warning.

## Outcome
A new Till is successfully created and persisted. Initial hardware devices are assigned to the Till via normalized assignments (`hardware_device_assignments`).

## Related Modules
- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control

## Related Files
- [[Tenant_Admin_Add_Till_Single_Page_UI]]
- [[05_Till_Management_Flow]]
- [[19_Device_Hardware_Management_Flow]]

## Documentation Update 2026-08-04 — Single Page UI Replacement
This document supersedes any previous references to the Add Till four-step wizard. Orchestration relies on Strategy B: Create Till, followed by sequential hardware assignments, and a refresh. "Connected" status in the Quick Pair panel is NEVER hardcoded; it is derived from real heartbeat/test states, leaving physical verification PENDING until real devices are tested via native POS.
