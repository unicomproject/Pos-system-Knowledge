<!-- title: POS Hardware Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->
# POS Hardware Integration
## Purpose
Authoritative production architecture, readiness and implementation order for
cashier-side hardware. Device-specific documents own detailed contracts.

## Purpose

Single architecture source of truth for how physical peripherals relate to native POS, Backend trust, and Tenant Admin Till monitoring.

Device-specific transport details remain in:

- [[Receipt_Printer_Integration]]
- [[Barcode_Scanner_Integration]]
- [[Cash_Drawer_Integration]]
- [[Card_Reader_Integration]]

## Final Architecture Rule

```text
Physical Hardware
    ↓
Native Flutter POS Application or Local Hardware Agent
    ↓
Hardware Connection and Test Logic
    ↓
Backend Device-Authenticated API
    ↓
Hardware Status, Heartbeat and Test Records
    ↓
Tenant Admin Till Detail / Hardware-Readiness API
    ↓
Tenant Admin Right-Side Hardware Monitoring Card
```

**The Tenant Admin browser must not directly connect to a physical printer, scanner, cash drawer, or card reader.**

Tenant Admin is a monitoring and management interface. It consumes Backend status only.

Flutter Web must not be treated as the primary raw TCP integration layer for network receipt printers.

## Supported Hardware Types (Catalogue)

| Type code (approved) | Meaning |
|---|---|
| `RECEIPT_PRINTER` | Receipt printer |
| `BARCODE_SCANNER` | External barcode scanner |
| `CASH_DRAWER` | Cash drawer |
| `CARD_READER` | Payment terminal / card reader |
| `CUSTOMER_DISPLAY` | Customer-facing display |
| `SCALE` | Weighing scale |
| `BUILT_IN_CAMERA_SCANNER` | Built-in camera capability where approved |

Store types as uppercase varchar domain values (no CLR enums as DB types).

## Connection Types

| Connection type | Notes |
|---|---|
| `NETWORK` | Host/IP + port (e.g. typical 9100, configurable) |
| `USB` | Native USB where supported |
| `BLUETOOTH` | Native BT where supported |
| `BUILT_IN` | Device-integrated capability |
| `PROVIDER` | Provider SDK / cloud terminal |
| `SERIAL` | Where platform-supported |

Configured ≠ assigned ≠ connected ≠ healthy.

## Hardware Registration (Inventory)

Required device information:

- Hardware device ID
- Tenant ID
- Outlet ID where applicable
- Device code
- Device name
- Hardware type
- Manufacturer, model, serial number, asset tag
- Connection type
- Lifecycle status
- Created/updated audit fields

Network-printer configuration may include host/IP, port, timeout, paper width, printer profile, character encoding, test-print capability.

Sensitive local settings may stay on the activated POS device where appropriate.

**Never** store PAN, CVV, or payment-card secrets.

### Actual database entity (Unified-Commerce)

Table / entity: `hardware_devices` / `HardwareDevice`

Key attributes present in code: `TenantId`, `OutletId`, `HardwareProfileId`, `HardwareDeviceCode`, `HardwareDeviceName`, `HardwareDeviceType`, `ConnectionType`, `Manufacturer`, `Model`, `SerialNumber`, `AssetTag`, `FirmwareVersion`, `ConfigJson`, `LastSeenAt`, `Status`, audit user IDs.

See [[../06_DATABASE_KNOWLEDGE/Tables/09_Hardware_Operations_Till_Session_And_Cash_Control_UPDATED]].

## Assignment Models

### Model A — Direct Till Assignment

```text
Hardware Device → Till
```

### Model B — POS Device Assignment

```text
Hardware Device → POS Device → Current Till Assignment
```

Till-side hardware lookup **must** merge:

1. Active hardware assignments linked directly to the Till
2. Active POS device currently assigned to the Till
3. Active hardware assignments linked to that POS device

Then remove duplicates. Released assignments must be excluded. Tenant and outlet compatibility must be validated.

Assignment attributes (schema-backed): assignment ID, tenant, outlet, hardware device ID, till ID **or** POS device ID (exactly one), is primary, assigned at/by, released at/by, release reason.

Soft-release only; do not physically delete history rows when history is required.

### Current code evidence (2026-08-01)

`GetHardwareReadinessDataAsync` currently joins **direct Till assignments only** (`assignment.TillId == tillId` and `ReleasedAt == null`). POS-device-linked hardware merge is **NOT IMPLEMENTED**.

No Tenant Admin `hardware-devices` list/create or `hardware-assignments` POST/release controller was found. Entities and EF mappings exist; management APIs are outstanding.

## Connection Status Rules (Approved Labels)

Configuration-driven heartbeat threshold (`TillMonitoringOptions.HeartbeatTimeoutSeconds`, default 300).

| Status | Rule |
|---|---|
| `CONNECTED` | Active hardware + active assignment + last heartbeat within threshold + no active connection failure |
| `DISCONNECTED` | Active assignment + heartbeat missing/expired |
| `NEEDS_ATTENTION` | Reachable but latest health/test has warning or failure |
| `MAINTENANCE` | Hardware lifecycle is Maintenance |
| `NOT_ASSIGNED` | No active assignment |
| `UNKNOWN` | Assignment exists but no reliable status yet |

Do not hardcode Connected in Flutter.

### Code note

- Live readiness mapping currently emits mainly `CONNECTED` / `DISCONNECTED` from `hardware_devices.last_seen_at` vs timeout.
- `HardwareConnectionStatusResolver` exists with `CONNECTED` / `WARNING` / `FAILED` / `OFFLINE` / `UNKNOWN` but is **not** fully wired as the single SoT in the readiness service path — treat aligned labels above as the **approved** contract; implementation must converge.

## POS Hardware Heartbeat

Approved conceptual route (create if missing; do not invent a duplicate if an equivalent exists):

`POST /api/v1/pos/devices/{posDeviceId}/hardware-heartbeat`

**Existing today:** `POST /api/v1/devices/heartbeat` updates **POS device** last-seen (device context), not per-peripheral hardware rows.

`HardwareDevice.RecordHeartbeat` exists on the entity but has **no** verified public hardware-heartbeat API.

Payload may include: observed timestamp, hardware device ID, connection status, health status, warning code/message, optional diagnostics.

Security:

- Do not trust client-supplied `tenantId`
- Resolve tenant/outlet/till from activated POS device identity
- Validate trusted activation state
- Prevent cross-tenant hardware updates
- Do not log device secrets
- Rate-limit where appropriate
- Audit meaningful state changes

## Hardware Test Flow

```text
Tenant Admin requests a test (optional MVP path)
    ↓
Backend records or queues the test request
    ↓
Native POS / agent performs physical test
    ↓
Native app reports result
    ↓
Backend records append-only `hardware_test_logs`
    ↓
Tenant Admin displays latest test state
```

MVP may initiate tests from native POS Hardware Settings only.

Test types: `CONNECTION_TEST`, `PRINT_TEST`, `SCAN_TEST`, `DRAWER_OPEN_TEST`, `CARD_READER_PAIRING_TEST`, `DISPLAY_TEST`, `SCALE_TEST`.

Test statuses: `PENDING`, `PASSED`, `FAILED`, `WARNING`, `TIMEOUT`, `NOT_SUPPORTED`.

**Status:** schema exists; end-to-end Cashier/Tenant Admin test-result reporting APIs are **NOT IMPLEMENTED** / **PHYSICAL VERIFICATION PENDING**.

## MVP Derived Alerts (No Dedicated Alerts Table Required)

Do **not** require `hardware_alerts` for MVP unless a later ADR mandates acknowledge/resolve workflows.

Derive from: lifecycle status, last heartbeat, latest test result, warning payload.

Possible conditions: heartbeat expired, offline, latest test failed, paper low, maintenance, assignment conflict, card reader unpaired, status unknown too long.

Till detail / readiness may expose `alertCount`, warning code/message, severity.

UI shows **View Alerts (count)** only when real active alerts exist.

Persistent acknowledge/resolve/history is **post-MVP** / **NOT IMPLEMENTED**.

## Network Printer

Native flow: load local config → open socket (IP/port) → timeout → safe test → record → report Backend → Tenant Admin card updates.

Flutter Web is not the primary raw TCP layer. Use Android/Windows native or approved bridge.

Physical matrix: **PHYSICAL VERIFICATION PENDING** (see [[Receipt_Printer_Integration]]).

## Barcode Scanner

- USB HID: keyboard wedge + Enter; POS listens; product lookup.
- Camera: built-in capability; may not need a separate hardware-device row.
- Do not show Connected merely because a scanner name string exists on Till flat fields.

Physical TB-00D / camera acceptance: **PHYSICAL VERIFICATION PENDING** (see [[Barcode_Scanner_Integration]]).

## Cash Drawer

Often pulsed via receipt printer ESC/POS drawer kick.

Where detection is unavailable, use truthful states: Configured, Connected via Printer, Status Unavailable, Test Passed/Failed — never fake Connected.

**PHYSICAL VERIFICATION PENDING** (see [[Cash_Drawer_Integration]]).

## Card Reader

Provider-specific. Never store PAN/CVV. Status examples: PAIRED, ONLINE, OFFLINE, UNPAIRED, UNKNOWN, NEEDS_ATTENTION.

**NOT IMPLEMENTED** / **PHYSICAL VERIFICATION PENDING** (see [[Card_Reader_Integration]]).

## Cashier and Last Activity (Till Monitoring)

Preferred cashier source: current open `till_sessions.opened_by_tenant_user_id` → tenant user display name. Fallback: Unassigned / —.

Last activity: prefer Backend rule using POS device `last_seen_at` (`lastDeviceSeenAt` on Till list/detail). Future MAX of session/device/hardware/transaction timestamps may be approved later — document Backend rule as implemented, do not invent sample times.

When none: "No recent activity".

## Tenant Admin Monitoring Card Contract

Displays real assigned hardware categories and statuses from Backend. Empty assignment list → truthful empty message (current UI: "No hardware connections found.").

## Permissions and Entitlements

| Code | Allows |
|---|---|
| `tenant.tills.view` | Summary, list, basic Till detail |
| `tenant.tills.manage` / create/update/delete | Lifecycle mutations as seeded |
| `tenant.tills.details.view` | Detail panel access (seeded) |
| `tenant.tills.assign_outlet` | Till/outlet assignment |
| `tenant.hardware.view` | Hardware connections, status, warnings, alerts, test history where allowed |
| `tenant.hardware.manage` | Register, edit, assign, release, configure, initiate supported tests |

Feature entitlement key confirmed in Backend seed: **`till_management`**. Related group also uses **`device_hardware`** for peripheral capability at tenant plan level.

Hardware readiness GET currently authorizes via Till view/details/manage and does **not** separately require `tenant.hardware.view` — converge permissions with this matrix when implementing hardware-restricted UI states.

## Security

- Tenant-scoped queries and RLS where applied
- Outlet validation
- Device-authenticated heartbeat
- Permission + entitlement checks
- Audit logging for writes
- No cross-tenant assignment or heartbeat
- No trust of untrusted tenant ID payload
- No sensitive card storage / device-secret logging
- Validate IP/port/config safely
- Rate-limit heartbeats

## Implementation Sequence (Recommended)

1. Finalize Second Brain hardware contract (this file + module contracts)
2. Verify existing tables/migrations
3. Complete hardware repository/service
4. Hardware inventory APIs
5. Till/POS-device assignment APIs
6. Extend Till detail read model (or keep readiness related-read consistent)
7. Trusted POS hardware heartbeat
8. Hardware test-result reporting
9. Connection-status calculation (single resolver)
10. Derived alerts
11. Flutter DTO/domain binding without mocks
12. Bind selected Till details to real Backend data
13. Assign Hardware flow
14. Permission-restricted states
15. Automated tests
16. Android/Windows physical verification
17. Tenant Admin monitoring card verification
18. Update implementation tracking and sign-off

## Current Implementation Status Summary

| Capability | Status |
|---|---|
| Schema `hardware_devices` / assignments / test_logs | **PARTIALLY COMPLETED** (tables/entities exist) |
| Hardware inventory/assignment APIs | **NOT IMPLEMENTED** |
| Till hardware-readiness read | **PARTIALLY COMPLETED** (direct Till assignments only) |
| POS device heartbeat | **COMPLETED** (device last-seen) |
| Peripheral hardware heartbeat API | **NOT IMPLEMENTED** |
| Derived alerts | **NOT IMPLEMENTED** |
| Physical printer/scanner/drawer/card | **PHYSICAL VERIFICATION PENDING** |
| Tenant Admin monitoring card | **PARTIALLY COMPLETED** (UI; empty without assignments) |

## Camera barcode scanner status (legacy note 2026-07-22)

The Flutter New Sale camera scanner is implemented with `mobile_scanner` for Android/iOS. Physical Android camera acceptance remains pending. See [[Barcode_Scanner_Integration]].

## Related Files

- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[../03_USER_JOURNEYS/Tenant_Admin/19_Device_Hardware_Management_Flow]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]]
