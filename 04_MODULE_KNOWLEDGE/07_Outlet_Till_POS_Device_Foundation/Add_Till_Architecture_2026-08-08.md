# Add Till Screen Implementation Architecture

## Overview
This document serves as the canonical reference for the **Add Till** single-page screen in the Tenant Admin (Flutter frontend) and the corresponding `.NET 10` Backend logic.

## 1. Backend Architecture

### 1.1 `GetCreateOptionsAsync` (API: `GET /api/v1/tenant/outlets/{outletId}/tills/options`)
When the UI loads, it MUST fetch options specific to the selected outlet to populate dropdowns.

- **Cashiers**: `GetCreateOptionsAsync` returns cashiers that have an `"ACTIVE"` account status AND either have the `"admin"` role OR are mapped to the given `outletId` via `OutletUserRole`.
- **POS Devices**: It returns all PosDevices for the tenant/outlet. `IsAssigned` indicates if it is already bound to any Till globally (via `TillDeviceAssignment`).
- **Hardware Devices**: It returns all HardwareDevices for the tenant/outlet. `IsAssigned` indicates if it is already bound to any Till/POS device (via `HardwareDeviceAssignment`).
- **Outlets**: Included so the dropdown can let the user re-select outlets if they want (triggering a reload of options for the new outlet).
- **Tenant Base Currency**: Included in options so the default float amount uses the correct currency code.

### 1.2 `CreateAsync` (API: `POST /api/v1/tenant/tills`)
When the Add Till form is submitted, the backend enforces the following atomic transaction logic:

1. **Till Entity Validation**:
   - `TillName` max length 150, `TillCode` max length 60.
   - `TillCode` is unique per Tenant.
   - `DefaultOpeningFloatAmount` must be >= 0.
2. **Cashier Validation**:
   - `DefaultCashierTenantUserId` must be an active user with access to the outlet.
3. **POS Device Assignment** (Optional but common):
   - Only permitted if user has `tenant.hardware.manage` permission.
   - Asserts the selected POS device belongs to the *same outlet*.
   - Asserts the selected POS device is NOT assigned globally to another Till.
4. **Hardware Assignments** (Optional but common):
   - Only permitted if user has `tenant.hardware.manage` permission.
   - Asserts the hardware belongs to the *same outlet*.
   - Asserts the hardware is NOT assigned globally.
   - Hardware types typically expected: Scanner, Receipt Printer, Cash Drawer, Card Reader.
5. **Atomic Execution**:
   - Till is created, POS assignment created, Hardware assignments created in a single EF Core Unit of Work (`SaveChangesAsync`).
   - Reverts entirely if any device is found assigned.

## 2. Frontend (Flutter) Architecture Guidelines

When implementing or fixing the Add Till screen in Flutter (`Nytroz-POS-App`), developers MUST adhere to the following architecture rules based on the backend setup:

### 2.1 State Management
- Use Riverpod for state.
- **Provider**: A `tillCreateOptionsProvider(outletId)` should fetch `GetCreateOptionsAsync(outletId)`.
- When the `Assign Outlet` dropdown changes, invalidate and refresh the options provider with the new `outletId` so that Cashiers, POS Devices, and Hardware Devices reflect the new outlet.

### 2.2 Fields & Dropdowns
- **Till Name**: Required text field, max 150 chars.
- **Till Code**: Required text field, max 60 chars.
- **Assign Outlet**: Required dropdown. Changing this refreshes all other dropdowns.
- **Status**: Required dropdown (Active/Inactive).
- **Default Cashier**: Dropdown populated from `Options.Cashiers`.
- **Opening Float**: Numeric text field. Validation: >= 0.

### 2.3 Hardware Setup Section
- Contains fields: `POS Device`, `Scanner`, `Receipt Printer`, `Cash Drawer`, `Card Reader`.
- **Dropdown Options**:
  - Filter `Options.PosDevices` for the `POS Device` dropdown.
  - Filter `Options.HardwareDevices` by `Type == 'SCANNER'` for the `Scanner` dropdown, etc.
  - IMPORTANT: Only show items where `IsAssigned == false` in the dropdowns. If a device is `IsAssigned == true`, it must be disabled or excluded from selection because the backend will reject it.

### 2.4 Quick Pair & Status constraints
- The UI reference dictates "Never fake 'Connected'".
- Since hardware connectivity is determined at runtime by the local PosDevice agent, the Tenant Admin Add Till screen SHOULD NOT artificially display a green "Connected" status immediately upon selection from the dropdown. 
- The selection in the dropdown merely establishes the relational DB assignment. The real status comes from the heartbeat/monitoring tables. The UI should show "Pending Connection" or a neutral status for newly assigned hardware until a heartbeat is received.

### 2.5 Submit Action
- Collect the `TillDetails` (Name, Code, OutletId, Status, Float, Cashier).
- Collect the selected `PosDeviceId` and `HardwareDeviceIds`.
- Dispatch to the `POST /api/v1/tenant/tills` endpoint.
- Upon success, navigate back to the Till List and refresh.

---
**Audited By**: Senior Architecture Team (Agent)
**Date**: 2026-08-08
