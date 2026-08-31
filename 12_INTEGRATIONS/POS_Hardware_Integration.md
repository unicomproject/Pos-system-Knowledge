<!-- title: POS Hardware Integration -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-17 -->

# POS Hardware Integration

## Canonical production status (2026-08-16)

```text
BLOCKED — HARDWARE NOT PRODUCTION READY
```

Do **not** treat Cash In / Cash Drop software acceptance as physical hardware
production readiness. Overall peripheral deployment to real customer stores is
**blocked**.

Authoritative summary:

[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]

Physical gate matrix:

[[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]

## Purpose

Single architecture source of truth for how physical peripherals relate to
native POS, Backend trust, Local Print Agent, and Tenant Admin Till monitoring.

Device-specific contracts:

- [[Local_Print_Agent]]
- [[Receipt_Printer_Integration]]
- [[Barcode_Scanner_Integration]]
- [[Cash_Drawer_Integration]]
- [[Card_Reader_Integration]]

## Separation rule (mandatory)

| Concern | Status |
|---|---|
| Financial Cash In / Cash Drop | **SOFTWARE PRODUCTION ACCEPTED** — not physical I/O |
| Receipt Printer | **PARTIAL** — software path; physical PR-* incomplete |
| Physical Cash Drawer pulse | **PARTIAL** — automatic Cash Sale physically passed on POS80 / drawerPin2; other DR-* rows incomplete |
| Barcode Scanner | **PARTIAL** — HID/camera path; physical SC-* incomplete |
| Payment Terminal | **NOT IMPLEMENTED** — out of current hardware release unless reopened |
| Scale | **NOT IMPLEMENTED** — deferred |
| Customer Display | **NOT IMPLEMENTED** — deferred / out of Release 1 |
| Kitchen Printer | **NOT IMPLEMENTED** — registry type only |

## Actual architecture (implemented)

```text
Flutter POS
   │
   ├── Barcode Scanner
   │      ├── HID keyboard-wedge capture
   │      └── Camera scanner
   │      └── Backend exact product lookup
   │
   ├── Financial Cash Operations (In / Drop / summary)
   │      └── Backend HardwareCash APIs → cash_movements
   │
   └── Receipt Printer / (future) Physical Cash Drawer pulse
          │
          ├── Backend: config / permissions / drawer ops audit / device trust
          │
          ├── PRIMARY (Android tablet)
          │      ├── USB Host → USB-C hub / USB ESC/POS printer
          │      └── Bluetooth Classic SPP → ESC/POS printer
          │
          └── OPTIONAL (Windows-connected printer)
                 └── E_POS.LocalPrintAgent → Windows RAW spooler / ESC/POS
                        ├── Receipt Printer
                        └── Cash Drawer Pulse (later chunk)
```

Optional path: Flutter **direct network TCP ESC/POS** (non-web) — not production-accepted
until physically verified.

`E_POS.LocalPrintAgent` is a **supported optional Windows printing path**, not the
primary Android tablet printer requirement.

Authority for Android direct work:
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Android_Direct_Printer_Integration_2026-08-16]]

There is **no** generic multi-device hardware agent. The optional Windows bridge is:

```text
E_POS.LocalPrintAgent
```

See [[Local_Print_Agent]].

Tenant Admin browser must **not** connect directly to printers, scanners,
drawers, or terminals. It consumes Backend status only.

## Target production operating model

### Android tablet (primary)

```text
Store Android POS tablet
      ↓
USB-C hub and/or Bluetooth ESC/POS printer configured on device
      ↓
Flutter direct adapters write ESC/POS bytes
      ↓
No Windows LocalPrintAgent required for this path
```

### Windows-connected printer (optional)

```text
Store Windows host with printer
      ↓
Local Print Agent as managed Windows service
      ↓
Secure store-specific configuration
      ↓
Automatic startup after reboot
      ↓
POS (Windows or LAN Android) connects to configured agent
      ↓
Printer / drawer available
      ↓
No developer command required for daily operation
```
Printer / drawer available
      ↓
No developer command required
```

**A production customer must NOT be required to run `dotnet run`
or manually start developer tooling for daily POS operation.**

Windows Service scripts exist; **reboot → auto-start acceptance is NOT signed off.**

## Canonical hardware release-scope table

| Hardware | Current implementation | Current release scope | Production gate |
|---|---|---|---|
| Receipt Printer | Partial | Required | Physical PR-* acceptance |
| Physical Cash Drawer | Cash Sale path physically accepted; overall Partial | Required | Remaining physical DR-* acceptance |
| Barcode Scanner | Partial | Required | Physical SC-* acceptance |
| Cash In / Cash Drop (financial) | Software accepted | Financial (separate from physical HW) | Optional slip print only |
| Payment Terminal | Not implemented | **OUT OF CURRENT HARDWARE RELEASE** unless product reopens | Provider + CT-* |
| Scale | Not implemented | Deferred | Future |
| Customer Display | Not implemented | Deferred / out of Release 1 | Future |
| Kitchen Printer | Not implemented | Deferred | Runtime integration |

## Production readiness definition

Hardware is production-ready **only when**:

```text
Software implementation complete
+ security complete
+ tenant isolation complete
+ deployment model complete
+ automatic startup/recovery complete
+ physical supported-device validation complete
+ fault handling validated
+ documentation aligned
+ release acceptance signed
```

**Not sufficient:** UI exists, API HTTP 200, mock/unit tests, agent builds,
hardware enum exists, or docs claiming complete without physical evidence.

## Next code implementation order (source of truth)

```text
Chunk 1 — Local Print Agent production packaging / Windows service autostart /
          restart recovery / production security-configuration acceptance
Chunk 2 — Receipt Printer physical production acceptance
Chunk 3 — Physical Cash Drawer production acceptance
Chunk 4 — Barcode Scanner physical production acceptance
Chunk 5 — Payment Terminal ONLY if included in production release scope
Chunk 6 — Scale / Customer Display / Kitchen Printer when product requires
```

## Supported Hardware Types (Catalogue)

| Type code (approved) | Meaning | Runtime integration |
|---|---|---|
| `RECEIPT_PRINTER` | Receipt printer | Partial (Agent / network) |
| `BARCODE_SCANNER` | External barcode scanner | Partial (HID / camera) |
| `CASH_DRAWER` | Cash drawer | Cash Sale physical Agent pulse passed; other scenarios partial |
| `CARD_READER` | Payment terminal / card reader | **NOT IMPLEMENTED** (provider absent) |
| `CUSTOMER_DISPLAY` | Customer-facing display | **NOT IMPLEMENTED** |
| `SCALE` | Weighing scale | **NOT IMPLEMENTED** |
| `BUILT_IN_CAMERA_SCANNER` | Built-in camera capability | Partial (camera path) |
| Kitchen printer (if catalogued) | Kitchen ticket printer | **NOT IMPLEMENTED** — enum/registry ≠ runtime |

Store types as uppercase varchar domain values (no CLR enums as DB types).

## Connection Types

| Connection type | Notes | Production note |
|---|---|---|
| `NETWORK` | Host/IP + port (e.g. 9100) | Software path exists; physical incomplete |
| `USB` | Native USB where supported | Agent USB via Windows spooler is the verified print path; Flutter direct USB adapter = **NOT_VERIFIED stub** |
| `BLUETOOTH` | Native BT where supported | **NOT_VERIFIED stub** — not production |
| `BUILT_IN` | Device-integrated capability | Camera scanner partial |
| `PROVIDER` | Provider SDK / cloud terminal | Payment terminal not implemented |
| `SERIAL` | Where platform-supported | Scale future |

Configured ≠ assigned ≠ connected ≠ healthy.

## Multi-tenant hardware rules

Every cloud/backend hardware resource must be scoped to:

```text
Tenant → Outlet → POS Device → Hardware Device → Till (where applicable)
→ User/Cashier (where applicable)
```

**Canonical rule:** Tenant A must never read, configure, operate, or audit
Tenant B hardware.

- Client-provided `TenantId` alone is insufficient
- Tenant identity must come from trusted authentication context
- Backend must enforce ownership
- Device trust must be checked server-side
- A copied DeviceId alone is never sufficient trust

Separate:

| Boundary | Purpose |
|---|---|
| Cloud POS device trust | JWT / activation / trusted device |
| Local Print Agent auth | `X-Local-Print-Key` + CIDR |

## Hardware Device Trust

Documented concerns: registration, Trusted / Untrusted, tenant/outlet
assignment, revocation, disabled device, credential handling, heartbeat where
applicable.

POS device heartbeat exists. Peripheral hardware-heartbeat and test-report APIs
exist in Tenant Admin / POS hardware management work (see implementation
tracking) but **physical verification remains incomplete**.

## Permissions (actual codes — do not invent)

| Code | Allows |
|---|---|
| `pos.hardware.settings` | Configure/test Local Print Agent for activated POS device |
| `receipts.view` / `receipts.print` / `receipts.reprint` | Receipt view/print/reprint |
| `cash_drawer.view` | Cash Drawer screen / nav |
| `cash_drawer.manage` | Physical Open Drawer |
| `cash_drawer.movement.create` | Cash In / Cash Drop financial movements |
| `pos.till.open` / `pos.till.close` | Till session |
| `payments.card.accept` | Card payment accept (provider still absent) |
| `tenant.tills.view` / `tenant.tills.manage` / `tenant.tills.details.view` / `tenant.tills.assign_outlet` | Tenant Admin tills |
| `tenant.hardware.view` / `tenant.hardware.manage` | Tenant Admin hardware |

**Canonical security rule:**

```text
Flutter visibility
+ Backend authorization
+ Tenant/resource ownership validation
```

UI-only permission checks are not security.

Feature entitlement keys include `till_management` and `device_hardware`.

## Local Agent security (summary)

Current: `X-Local-Print-Key`, LAN/CIDR allow-list, local API, typically port
**9101**.

Production requirements: fail closed; no placeholder production key; no public
internet exposure; private firewall; secure provisioning/rotation; no secret
leakage in logs. HTTPS production acceptance incomplete (SE-02 Blocked).

Full detail: [[Local_Print_Agent]].

## Failure model (propagation)

```text
Physical device
↓
Local Agent (typed result codes)
↓
Backend where applicable (config / audit / finalize)
↓
Flutter provider
↓
UI
↓
Actionable cashier message
```

Use project-existing codes where present (examples: agent unavailable,
unauthorized key, printer missing/offline, timeout/unknown, drawer open failed,
permission denied, configuration invalid). Do not invent conflicting taxonomies
when typed Agent/backend codes already exist.

## Retry and idempotency

Dangerous duplicates: print twice, open drawer twice, charge card twice, replay
stale hardware commands.

| Device | Rule |
|---|---|
| Printer | Retry only where duplicate-print behaviour is controlled (stable request ID + durable store) |
| Drawer | Do **not** blindly queue/replay drawer-open after reconnect |
| Payment terminal | Strong idempotency + reconciliation (when implemented) |

## Offline hardware rules

Do **not** use a generic “queue everything offline” policy.

| Device | Offline principle |
|---|---|
| Barcode scanner | Local capture may continue; catalogue resolution depends on approved offline catalogue architecture |
| Printer | May work locally when Agent/device available |
| Cash drawer | Never blindly replay stale open commands |
| Payment terminal | Provider-specific offline/reconciliation only |
| Scale / Customer display | Local only when future integration exists |

Align with Offline Operation module documents.

## Worldwide / multi-currency rules

Production architecture must not hardcode LKR, Sri Lanka, one timezone, one
decimal format, one paper layout, or one encoding.

Require tenant/store currency, locale, timezone, receipt encoding, international
characters, currency formatting, and configurable paper/device behaviour.

Current limitation: ESC/POS builders are largely printer-safe single-byte;
Tamil/Unicode may degrade — **partial / unverified**.

## Hardware Registration (Inventory)

Required device information: Hardware device ID, Tenant ID, Outlet ID, device
code/name, type, manufacturer/model/serial/asset tag, connection type, lifecycle
status, audit fields.

Network-printer configuration may include host/IP, port, timeout, paper width,
profile, encoding, test-print capability.

Sensitive local settings may stay on the activated POS device where appropriate.

**Never** store PAN, CVV, or payment-card secrets.

### Actual database entity

Table / entity: `hardware_devices` / `HardwareDevice`

Key attributes: `TenantId`, `OutletId`, `HardwareProfileId`,
`HardwareDeviceCode`, `HardwareDeviceName`, `HardwareDeviceType`,
`ConnectionType`, `Manufacturer`, `Model`, `SerialNumber`, `AssetTag`,
`FirmwareVersion`, `ConfigJson`, `LastSeenAt`, `Status`, audit user IDs.

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

Till-side hardware lookup **must** merge direct Till assignments and POS-device
assignments, dedupe, exclude released rows, and validate tenant/outlet
compatibility.

### Current code evidence (updated 2026-08-16)

Tenant Admin hardware inventory, assignment/release, readiness merge
(Till + POS-device), connection-status resolver wiring, hardware-heartbeat and
hardware-test report APIs are recorded as **COMPLETED** (API / software) in:

[[../15_IMPLEMENTATION_TRACKING/Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]]

Physical peripheral acceptance remains **incomplete**. Older notes that said
“Device APIs not implemented” are superseded for those APIs.

## Connection Status Rules (Approved Labels)

Configuration-driven heartbeat threshold
(`TillMonitoringOptions.HeartbeatTimeoutSeconds`, default 300).

| Status | Rule |
|---|---|
| `CONNECTED` | Active hardware + active assignment + last heartbeat within threshold + no active connection failure |
| `DISCONNECTED` | Active assignment + heartbeat missing/expired |
| `NEEDS_ATTENTION` | Reachable but latest health/test has warning or failure |
| `MAINTENANCE` | Hardware lifecycle is Maintenance |
| `NOT_ASSIGNED` | No active assignment |
| `UNKNOWN` | Assignment exists but no reliable status yet |

Do not hardcode Connected in Flutter.

## POS Hardware Heartbeat

`POST /api/v1/pos/devices/{posDeviceId}/hardware-heartbeat` — implemented in
Tenant Admin hardware work (software). Existing
`POST /api/v1/devices/heartbeat` updates POS device last-seen.

Security: do not trust client `tenantId`; resolve from activated device;
validate trust; prevent cross-tenant updates; no secret logging; rate-limit;
audit meaningful changes.

## Hardware Test Flow

Native POS / Agent performs physical test → reports result →
`hardware_test_logs` → Tenant Admin displays latest state.

Test types may include: `CONNECTION_TEST`, `PRINT_TEST`, `SCAN_TEST`,
`DRAWER_OPEN_TEST`, `CARD_READER_PAIRING_TEST`, `DISPLAY_TEST`, `SCALE_TEST`.

Statuses: `PENDING`, `PASSED`, `FAILED`, `WARNING`, `TIMEOUT`, `NOT_SUPPORTED`.

**Status:** APIs exist for reporting; **physical verification pending**. Card /
display / scale tests remain unsupported in production runtime.

## Network Printer / Receipt Printer

Native or Agent path only. Flutter Web is not the primary raw TCP layer.

Canonical status: **PARTIAL** — see [[Receipt_Printer_Integration]].

## Barcode Scanner

USB HID keyboard wedge + camera (`mobile_scanner`). Capture may be local;
product lookup remains POS/catalogue backend flow.

Canonical status: **PARTIAL** — see [[Barcode_Scanner_Integration]].

## Physical Cash Drawer

Printer-driven RJ11/RJ12 ESC/POS kick via Local Print Agent.

Canonical status: **AUTOMATIC CASH-SALE PATH PHYSICALLY ACCEPTED; OVERALL
PARTIAL** — see [[Cash_Drawer_Integration]] and
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]].

Financial Cash In/Drop is a **separate** concern — see module Cash Drawer /
Cash Drop features.

## Card Reader / Payment Terminal

**NOT IMPLEMENTED** as a production provider integration.

Provider-neutral safety boundary exists (`card_provider_unavailable`). Registry
slots / mocks ≠ integration.

**OUT OF CURRENT HARDWARE RELEASE** unless product explicitly reopens scope.

Target flow (future):

```text
POS authoritative amount
→ Payment provider / terminal integration
→ Physical terminal
→ Approved / Declined / Cancelled / Unknown
→ Backend payment record
→ Idempotent sale completion
→ Reconciliation
```

See [[Card_Reader_Integration]].

## Scale / Customer Display / Kitchen Printer

**NOT IMPLEMENTED.** Catalogue / enum presence does not count as integration.
Release 1 intentionally defers Customer Display. Scale and Kitchen Printer are
future / deferred.

## Cashier and Last Activity (Till Monitoring)

Preferred cashier source: current open
`till_sessions.opened_by_tenant_user_id`. Last activity: prefer POS device
`last_seen_at`. When none: "No recent activity".

## Tenant Admin Monitoring Card Contract

Displays Backend-reported assigned hardware categories/statuses. Empty
assignment list → truthful empty message.

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

## Current Implementation Status Summary

| Capability | Status |
|---|---|
| Schema `hardware_devices` / assignments / test_logs | Present |
| Hardware inventory/assignment APIs | **COMPLETED** (software) — physical acceptance separate |
| Till hardware-readiness read (Till + POS merge) | **COMPLETED** (software) |
| POS device heartbeat | **COMPLETED** |
| Peripheral hardware heartbeat / test report APIs | **COMPLETED** (software; not physically signed) |
| Receipt print via Local Print Agent | **PARTIAL** — physical PR-* open |
| Physical drawer pulse via Agent | **Cash Sale physical PASS** on POS80 / drawerPin2; remaining DR-* open |
| Barcode HID / camera | **PARTIAL** — physical SC-* open |
| Payment terminal provider | **NOT IMPLEMENTED** |
| Scale / Customer Display / Kitchen | **NOT IMPLEMENTED** |
| Local Agent Windows Service production acceptance | **NOT COMPLETE** |
| Overall hardware production | **BLOCKED** |

## Related Files

- [[Local_Print_Agent]]
- [[../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[../03_USER_JOURNEYS/Tenant_Admin/19_Device_Hardware_Management_Flow]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/HardwareCash/Tenant_Admin_Hardware_Read_Assignment_Status_Implementation]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]
