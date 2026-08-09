# Add Till Single Page Screen: FE/BE Source Audit (2026-08-08)

## 1. Overview
This document records a full source-code-based audit of the Tenant Admin "Add Till" functionality across the Flutter frontend (`Nytroz-POS-App`) and the .NET backend (`Unified-Commerce`), mapping current source truths against the UI design targets.

## 2. P0/P1 Critical Gaps (Contract & Logic Mismatches)

### P0 Gap: Create Options API Contract Mismatch
The backend `TenantAdminTillsController.GetCreateOptions` returns an options DTO that completely mismatches the JSON structure expected by the Flutter frontend `TillCreateOptionsDto.fromJson`.

*   **Frontend Expectation (`till_create_options_dto.dart`)**:
    *   `posDevices`: expects `{ id, code, name, outletId, status, isTrusted, isAssigned, lastSeenAt }`
    *   `hardwareDevices`: expects `{ id, code, name, type, outletId, status, isAssigned, connectionType, lastSeenAt, connectionStatus }`
    *   `cashiers`: expects `{ id, displayName, outletIds }`
*   **Backend Reality (`TenantAdminTillCreateOptionsResponse`)**:
    *   `PosDevices`: returns `{ PosDeviceId, DeviceCode, DeviceName }` (Missing outlet scope, status, assignment state, etc.)
    *   `HardwareDevices`: returns `{ HardwareDeviceId, HardwareDeviceCode, HardwareDeviceName, HardwareType }` (Missing outlet scope, assignment state, etc.)
    *   `Cashiers`: returns `{ TenantUserId, DisplayName }` (Missing outlet scope)

### P1 Gap: Hardware Selection Filtering Logic in UI
*   `add_till_hardware_section.dart` erroneously filters `pos_terminal` from the `hardwareDevices` list instead of using the dedicated `posDevices` list provided by the backend options payload.

### P0 Gap: Backend Atomicity & Silent Failures (`TenantAdminTillService.CreateAsync`)
*   When assigning a POS device or Hardware during Till Creation, the backend queries the database for the provided IDs.
*   If `GetPosDeviceAsync` or `GetEditableDeviceAsync` returns `null` (device doesn't exist, belongs to wrong outlet, or is already assigned), the backend **silently skips** the assignment rather than failing the transaction with a validation error.
*   **Result**: The user believes they've created a Till with hardware assigned, but the hardware is silently dropped.

### P1 Gap: Backend Missing Hardware Authorization Check
*   The `CreateAsync` endpoint successfully checks `TenantAdminTillPermissions.Create` to allow Till creation.
*   However, if `request.PosDeviceId` or `request.HardwareAssignments` is provided, the backend **does not verify** that the user also holds `TenantAdminHardwarePermissions.Manage`. A user with only Till Create access can bypass hardware management security by assigning hardware during till creation.

## 3. Database Constraints vs Backend Validation

*   **Till Code**:
    *   Database (`TillConfiguration.cs`): `varchar(60)`
    *   Backend API Validation (`TenantAdminTillService.cs`): Maximum 40 characters.
    *   Uniqueness Constraint: `uq_tills_tenant_id_till_code` -> Unique TillCode for Tenant where status != DELETED. This replaces the old Outlet-scoped Till Code uniqueness.
*   **Till Name**:
    *   Database: `varchar(150)`
    *   Backend API Validation: Maximum 120 characters.
*   **Default Opening Float**: Defaults to `0` as `numeric(18,4)`.

## 4. UI Implementation Status
*   **Single-Page Form**: `AddTillSinglePageForm` correctly implements a single scrollable view rather than a multi-step wizard.
*   **Quick Pair Panel**: The `AddTillQuickPairPanel` widget is currently a static UI stub. It contains no telemetry logic or live status polling. It only renders the title "Quick Pair & Status".
*   **Responsive Layout**: Handled using `TenantAdminPageScaffold`.

## 5. Next Steps
1. Align the `.NET backend` DTO `TenantAdminTillCreateOptionsResponse` to fulfill the `TillCreateOptionsDto` expectations.
2. Fix the silent failure logic in `TenantAdminTillService.CreateAsync` by explicitly returning `ApplicationError` if requested hardware IDs are missing or unavailable.
3. Fix the frontend filtering logic in `AddTillHardwareSection` to properly use the `options.posDevices` collection.
4. Implement actual telemetry mapping for the Quick Pair panel.
