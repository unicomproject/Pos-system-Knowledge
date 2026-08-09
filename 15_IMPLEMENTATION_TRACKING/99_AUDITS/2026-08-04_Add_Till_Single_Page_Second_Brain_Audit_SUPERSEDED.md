# Audit Report: Add Till Single-Page UI Replacement
system: OneVerz POS MVP
last_updated: 2026-08-04

## Overview
This audit compares the active runtime implementation (Flutter and Backend) and the current Second Brain documentation against the approved "Add Till" single-page UI reference.

## 1. Current Runtime Behavior

### Current Flutter Behavior
- **Implementation Status:** The active Flutter frontend still uses a four-step wizard layout for Till creation (`TillWizardStepper` in `till_wizard_stepper.dart`).
- **Gap:** The approved single-page Add Till layout (Reference Image 1) is NOT IMPLEMENTED.

### Current Backend Behavior
- **API Endpoint:** `POST /api/v1/tenant-admin/tills` exists and handles creation.
- **Orchestration:** Currently uses separate commands (Create Till -> Hardware Assignments). A unified transaction is not natively supported for both. We will document Strategy B (sequential calls).
- **Default Cashier:** The backend `Till` entity does NOT contain a `DefaultCashier` property (e.g., `DefaultCashierTenantUserId`).
- **Gap:** Persisting the `Default Cashier` is not supported by the current API/Database mapping and requires a future backend migration.
- **Hardware Integration:** Flat legacy string properties exist (`DeviceName`, `PrinterName`, etc.). 

### Current Database Support
- `tills.till_name`, `tills.till_code`, `tills.outlet_id`, `tills.status`, `tills.default_opening_float_amount`, `tills.currency_code` are supported.
- `Default Cashier` is unsupported (NO `default_cashier_tenant_user_id` column).
- Hardware assignments should rely on `hardware_devices` and `hardware_device_assignments` normalized tables, not the legacy flat strings in `tills`.

### Current Permissions and Entitlements
- `tenant.tills.create` controls till creation.
- `tenant.hardware.view` and `tenant.hardware.manage` control hardware visibility and assignment.
- Entitlement: `till_management`.

## 2. Current Second Brain Behavior
- **Existing Documentation:** References the old four-step Till wizard with "Next", "Previous", "Review", and "Create" steps.
- **Contradictions:** 
  - Some docs claim Till code is auto-generated; API/UI actually accept manual `tillCode`.
  - Some docs conflate "Configured/Assigned" hardware with "Connected" hardware.
  - Flat hardware-name strings are treated as authoritative in some older docs.

## 3. Target Behavior
- **UI:** A single responsive page with `Till Details` (Left), `Hardware Setup` (Center/Right), and `Quick Pair & Status` (Far Right). No horizontal stepper.
- **Properties:**
  - `Till Name`, `Till Code` (Manual), `Assign Outlet`, `Status` (Active default), `Default Cashier` (Required in UI, but DB gap), `Opening Float` (Accepts 0, maps to `default_opening_float_amount`).
- **Hardware:** Selects real hardware device IDs (`posDeviceId`, `hardwareDeviceId`).
- **Status:** Driven by real trusted heartbeat/test state (CONNECTED, DISCONNECTED, etc.). Not hardcoded merely because a device is assigned.
- **Submission:** Single "Cancel" and "Create Till" actions at the bottom.

## 4. Contract Gaps & Contradictions Resolved
| Issue | Previous Statement | Verified Current Source-Code Truth | Approved Target Contract | Runtime Gap |
|---|---|---|---|---|
| **Till Code** | Auto-generated in some docs | Backend API and UI accept manual input | Till Code is manually entered and validated for uniqueness | None |
| **Default Cashier** | Not in old docs | Backend `Till.cs` lacks this property | UI displays as required field | **NOT IMPLEMENTED** - Requires DB/API migration |
| **Hardware Assignment** | Uses flat fields (DeviceName, PrinterName) | Flat fields exist but normalized tables are preferred | Target architecture uses `hardware_device_assignments` | None (Legacy fields deprecated) |
| **Connection Status** | Inferred from configuration strings | Heartbeat/readiness APIs partially exist | CONNECTED requires trusted fresh heartbeat/health test | **PHYSICAL VERIFICATION PENDING** |
| **Opening Float** | Always saves 0 | DB has `default_opening_float_amount` | UI accepts float >= 0; saves to DB | Partially Implemented (Frontend to pass value) |
| **UI Layout** | Four-step wizard | Flutter uses `TillWizardStepper` | Single-page layout without steps | **NOT IMPLEMENTED** - Flutter uses wizard |
| **Create Orchestration** | Ambiguous | `POST /api/v1/tenant-admin/tills` | Strategy B (Sequential Create -> Assign -> Refresh) | None |

## 5. Documents Status
- **Documents Requiring Updates:** 
  - User Journeys (05, 19)
  - Module Knowledge (07, 08)
  - Database Tables Knowledge (08, 09)
  - Flutter UI/UX Knowledge
  - Implementation Tracking
  - Test Cases
- **Documents that Remain Valid:** 
  - Core database design (outside of gaps)
  - Existing Till Monitoring split-view journey (must NOT be overwritten).
- **Runtime implementation status:** 
  - UI remains NOT IMPLEMENTED.
  - Physical verification remains PHYSICAL VERIFICATION PENDING.
