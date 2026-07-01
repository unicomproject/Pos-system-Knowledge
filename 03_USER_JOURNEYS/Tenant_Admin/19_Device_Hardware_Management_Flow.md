<!-- title: Tenant Admin Device Hardware Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Device Hardware Management Flow

## Purpose

Defines device/hardware checks and test flow for printers, scanners, payment devices, and drawers.

## Actor

Tenant Admin

## Source

Derived from `Slide 19 - Device / Hardware Management Flow` in `tenant-full-journey.pptx` and aligned to TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens device/hardware management.

## Preconditions

- Tenant Admin has hardware/device permission.
- Outlet/till exists where device is linked.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open device/hardware management | System opens device list. |
| 2 | View registered devices | System shows known devices. |
| 3 | Select device | Tenant Admin selects device. |
| 4 | View device status | System shows connection/health. |
| 5 | Run test | Tenant Admin runs device test. |
| 6 | Validate result | System checks success/failure. |
| 7 | If failed | System shows device error, connection check, and retry path. |
| 8 | If successful | System confirms main device working. |

## Data Used Or Captured

- Device type
- Device status
- Connection status
- Test result
- Outlet/till binding

## Access And Security Rules

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Hardware availability may vary by platform.
- Payment device final result requires backend/provider validation.

## Validation And Error Cases

- Device offline
- Connection failed
- Permission denied
- Unsupported device

## Outcome

Device/hardware status is verified and ready for operations if test passes.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control
- 24_Payment_Refund

## Related Files

- 12_INTEGRATIONS/POS_Hardware_Integration.md
- 12_INTEGRATIONS/Receipt_Printer_Integration.md
- 12_INTEGRATIONS/Card_Reader_Integration.md
