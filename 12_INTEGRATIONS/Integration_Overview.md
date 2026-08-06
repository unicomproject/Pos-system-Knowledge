<!-- title: Integration Overview -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# Integration Overview

## Purpose

Index the external service and POS peripheral boundaries used by OneVerz POS MVP.

## Integration Ownership

| Integration | Primary document | Current status |
|---|---|---|
| Receipt printer | [[Receipt_Printer_Integration]] | Implemented — physical matrix incomplete |
| POS peripherals | [[POS_Hardware_Integration]] | Partially Implemented |
| Barcode scanner | [[Barcode_Scanner_Integration]] | Implemented — physically unverified |
| Cash drawer | [[Cash_Drawer_Integration]] | Not Implemented |
| Card reader | [[Card_Reader_Integration]] | Blocked By External Dependency |
| Payment gateway | [[Payment_Gateway_Integration]] | Partially Implemented |
| QR payment | [[QR_Payment_Integration]] | Not Implemented end to end |
| Email | [[Email_Service_Integration]] | Integration-specific status |
| File storage | [[AWS_S3_File_Storage]] | Integration-specific status |

## Boundary Rules

- Backend owns configuration, authoritative business values, persistence,
  authorization, audit, and provider-facing business outcomes.
- Flutter owns user interaction, per-device configuration, orchestration, and
  supported adapters; widgets do not perform raw HTTP/hardware I/O.
- The Windows Local Print Agent is a LAN-local device service. It owns Windows
  spooler communication and final ESC/POS bytes for that transport.
- Code presence, tests, spooler acceptance, and paper completion are separate
  evidence levels.

## Security

- Tenant APIs require normal authentication and permissions.
- Local device APIs require private-network restriction and local authentication.
- Never document/log real keys, payment secrets, PAN, CVV, track data, access
  tokens, or unsanitized provider responses.
- Unknown provider or hardware outcomes require explicit recovery; do not
  manufacture success or silently retry irreversible actions.

## Status Interpretation

`Implemented` means the active path exists. `Physically Verified` requires
explicit device evidence. `Blocked By External Dependency` means a provider or
terminal decision is absent. Implementation tracking owns current evidence.

## Related Files

- [[../00_START_HERE/Current_Source_Of_Truth]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[../04_MODULE_KNOWLEDGE/21_POS_Operations/01_Module_Overview]]
- [[../04_MODULE_KNOWLEDGE/24_Payment_Refund/01_Module_Overview]]
- [[../15_IMPLEMENTATION_TRACKING/Full_Feature_Status_Index]]
