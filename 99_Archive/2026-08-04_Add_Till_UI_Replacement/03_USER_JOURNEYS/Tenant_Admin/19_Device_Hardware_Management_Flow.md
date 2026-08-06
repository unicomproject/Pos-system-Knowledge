<!-- title: Tenant Admin Device Hardware Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Device Hardware Management Flow

## Purpose

Defines device/hardware checks, test flow, and hardware readiness monitoring for printers, scanners, payment devices, and drawers.

## Actor

Tenant Admin

## Source

Approved Till Monitoring UI design, `tenant-full-journey.pptx`, and TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin opens device/hardware management or views hardware details on the Till Monitoring page.

## Preconditions

- Tenant Admin has `tenant.hardware.view` or `tenant.hardware.manage` permission.
- Outlet/till exists where device is linked.

## Main Flow

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Open Till Monitoring / Hardware | System displays Till details and assigned hardware list. |
| 2 | View registered hardware | System shows hardware assigned to the Till (Scanner, Printer, Drawer, Card Reader). |
| 3 | View hardware readiness | System displays connection status, latest test result, and warnings/errors for each item. |
| 4 | Open Alerts | Tenant Admin clicks "View Alerts" on the Till to see detailed hardware alerts. |
| 5 | Run test | Tenant Admin with `tenant.hardware.manage` runs device test. |
| 6 | Validate result | System checks success/failure, logs the test, and updates the latest test state. |
| 7 | If failed / warning | System shows device error, connection check, warning message (e.g. paper low UI example), and retry path. |
| 8 | If successful | System confirms main device is working and connection is healthy. |

## Data Used Or Captured

- Hardware type (Scanner, Printer, Cash Drawer, Card Reader, Customer Display, Scale)
- Device name, Manufacturer, Model
- Connection status
- Latest test result
- Warning or error message
- Last seen time
- Outlet/till binding

## Access And Security Rules

- `tenant.hardware.view` or `tenant.hardware.manage` required to view hardware section.
- `tenant.hardware.manage` required to retry/test/manage hardware.
- `tenant.tills.details.view` required to open the Till panel that hosts the hardware list.
- Hardware availability may vary by platform.
- Payment device final result requires backend/provider validation.
- All hardware test logs are append-only.

## Validation And Error Cases

- Device offline
- Connection failed
- Warning (e.g., paper low - UI example, if supported)
- Missing hardware assignment
- Permission denied
- Unsupported hardware state

## Outcome

Device/hardware readiness is verified, and the Tenant Admin is aware of any warnings or errors preventing operation.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control
- 24_Payment_Refund

## Related Files

- [[09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED]]
- [[Tenant_Admin_Till_Monitoring_UI]]
- 12_INTEGRATIONS/POS_Hardware_Integration.md
- 12_INTEGRATIONS/Receipt_Printer_Integration.md
- 12_INTEGRATIONS/Card_Reader_Integration.md


## Documentation Update 2026-08-01 — Monitoring vs Physical Integration

### Architecture

```text
Physical Hardware → Native POS / Agent → Backend APIs → Tenant Admin Till hardware card
```

Tenant Admin browser must never open raw sockets to printers/scanners/drawers/readers.

### Assignment models

- Model A: Hardware → Till
- Model B: Hardware → POS Device → current Till

Backend must merge both and exclude released/cross-tenant rows. Current readiness query uses **direct Till assignments only** (gap).

### Test flow

Tenant Admin may request/queue tests; native POS executes; Backend append-only `hardware_test_logs`; Tenant Admin shows latest state. MVP may start tests only from native POS settings.

### Alerts (MVP)

Derived alerts only — no dedicated `hardware_alerts` table required for MVP. View Alerts only when real count &gt; 0. Acknowledge/resolve workflow is post-MVP.

### Status

Registration/assignment management APIs: **NOT IMPLEMENTED**. Readiness read: **PARTIALLY COMPLETED**. Physical verification: **PHYSICAL VERIFICATION PENDING**. Do not mark COMPLETED from reference images.

Canonical architecture: [[../../12_INTEGRATIONS/POS_Hardware_Integration]].
