# Till remote diagnostics — 2026-09-18

Status: implemented development slice; **not production or physical acceptance**.

## A. Audit and reuse

Existing Till/PosDevice identities, trusted native device proof, TillDeviceAssignments,
HardwareDeviceAssignments, hardware registry configuration versions, permissions,
entitlements and hardware_test_logs are reused. Existing remote Test All remains an
operator-assisted physical test flow. Previously there was no SignalR hardware command
transport; the notification WebSocket is a separate protocol and is unchanged.

## B. Architecture

```mermaid
sequenceDiagram
  participant A as Tenant Admin
  participant API as Backend
  participant POS as Bound native POS
  participant OS as Local OS
  A->>API: WatchTill (JWT + authorized till)
  POS->>API: RegisterPos (JWT + native proof)
  API->>API: Resolve current trusted POS and assignment
  A->>API: POST hardware-scans (requestId)
  API->>API: Permission, entitlement, scope, binding; persist snapshot
  API->>POS: RunDeviceScan (one current connection)
  POS->>API: ScanStarted
  POS->>OS: Enumerate USB/PnP/local print queues
  OS-->>POS: Identifiers and available observations
  POS->>API: DeviceScanResult
  API->>API: Revalidate session, assignment, version, identities; persist
  API-->>A: TillHardwareScanUpdated
```

Till codes remain display identifiers. GUIDs and the existing active assignment ID
are authoritative. Client-supplied tenant/till IDs do not establish POS ownership.
Targeting uses server-authorized individual connection IDs rather than allowing
client-supplied group joins. One latest authenticated connection per POS wins.

## C. Database

No schema migration. Existing hardware_test_logs stores REMOTE_SCAN sessions with
registered device/version/identity snapshot and results in result_payload_json.
Request IDs use the existing tenant/request unique constraint. Per-tenant advisory
transaction lock serializes creation/completion. Terminal records are immutable.
Generic physical-test create/complete routes cannot write REMOTE_SCAN records.
These records do not overwrite physical confirmation or make dashboard devices ready.
Existing unrelated payment seed/migration work is untouched.

## D. API and transport

- POST `/api/v1/tenant-admin/tills/{tillId}/hardware-scans`: `{requestId: UUID}`.
- GET same path `/{scanId}`: authorized persisted scan recovery.
- GET same path `/runtime`: ONLINE/OFFLINE and last heartbeat.
- Hub `/hubs/till-runtime`, JWT authentication, closes on authentication expiry.
- Methods: RegisterPos(proof), WatchTill(tillId), Heartbeat(), ScanStarted(scanId),
  DeviceScanResult(scanId, results).
- Events: RunDeviceScan, TillHardwareScanUpdated, TillRuntimeUpdated.
- States: REQUESTED → DISPATCHED → RUNNING → COMPLETED; FAILED, TIMED_OUT,
  TILL_OFFLINE are terminal alternatives. COMPLETED is not physical-test PASSED.
- Default timeout 60 seconds, configurable `HardwareDiagnostics:TimeoutSeconds`
  (10–300); worker sweeps every 5 seconds. Runtime lease expires after 60 seconds.
- At most 50 registered devices per scan, one active scan per till, five-second
  request cooldown, 64 KiB hub inbound limit, bounded result fields.
- Reconnection uses 2/5/10/30 second backoff, fresh auth, and new binding registration.
  Admin re-subscribes and recovers its known scan over HTTP. Interrupted POS scans
  expire; they are not automatically redelivered or physically executed.

## E. Tenant Admin

Hardware Overview has a separate Scan Till action. Only authorized outlet tills are
selectable. UI shows live connection, POS heartbeat, session progress, per-device
detection, health and explicit physical-test-not-performed text. Existing Test All
retains its physical/operator meaning. Configuration accepts optional stable device
path / Windows queue name and manufacturer serial. Registered IDs must come from
the assigned POS, not the Admin browser machine.

## F. Cashier adapters

- Windows: present USB/HID PnP instance paths, available USB serial, VID/PID, COM
  port identity; local spooler queue identities and driver-reported fault flags.
  Zero spooler flags remain UNKNOWN, never assumed READY.
- Android: USB Host device enumeration in background; serial only with existing
  OS permission. Enumeration does not silently request permissions or operate devices.
- Browser and other platforms: UNSUPPORTED. No browser/cloud USB enumeration.
- Exact registered strong identity is required. VID/PID or a generic keyboard alone
  cannot establish scanner identity. Multiple matching observations yield UNKNOWN.
- Drawer: UNSUPPORTED by passive scan; use existing operator-confirmed drawer test.
- Provider terminal/network/Bluetooth readiness, scale/display and vendor-specific
  protocols are not implemented by this slice. No payment, drawer pulse, receipt or
  automatic scanner-to-cart action is invoked by remote diagnostics.

## G. Security

Every request checks tenant, hardware permission/entitlement, active user/outlet/till,
outlet/till membership and configured account restriction. POS requires trusted
native fingerprint proof and a single current assignment. Hub invocations revalidate
auth sessions. Dispatch and results revalidate active binding and assignment identity;
results also check hardware assignment and configuration version. Monitor events
recheck session and authorization. Logs contain IDs/status, not JWTs or device proofs.

## H. Verification

Completed checks as of this implementation:
- Debug API build: 0 errors / 0 warnings.
- Hardware unit regression: 97 passed (includes identity, scope and reassignment).
- Hardware API regression: 57 passed, including three dispatch tests with five mocked tills and cross-tenant watchers.
- Flutter diagnostics/setup/Test All: 11 passed; expanded diagnostics suite subsequently 5 passed (12 distinct tests across these runs).
- Targeted Flutter analyzer: no issues.
- Android debug APK built successfully; existing mobile_scanner KGP warning.
- Release API: 0 errors / 0 warnings. Web build passed, existing CupertinoIcons font warning.
- Windows build blocked: suitable Visual Studio C++ toolchain absent.

These tests do not establish live PostgreSQL scan persistence or five real authenticated
WebSocket clients. The dispatcher isolation test uses fake hub clients. Full persisted
five-client acceptance, signed-in browser visual inspection and physical tests remain
unverified. Later test/build results should be appended rather than inferred.

## I. Physical validation plan

1. Install Windows C++ desktop toolchain; compile and run native POS.
2. Activate trusted POS and assign Front Till 01; log in with authorized cashier.
3. Register actual device serial/path/queue from that machine. Do not invent IDs.
4. Open Admin Scan Till; confirm ONLINE and updated heartbeat.
5. Scan with scanner/printer connected, then unplug each and scan again; compare
   OS evidence and UI, retaining UNKNOWN where drivers cannot report status.
6. Separately run operator tests: scan real barcode into cart; print receipt; open
   voltage/pin-compatible printer-linked drawer. Record observed physical output.
7. Revoke user access, release/reassign POS, disconnect/reconnect and restart backend;
   verify no old connection can submit and pending scans terminate.
8. Connect five authenticated test POS clients; scan only Till-03; persist its three
   controlled adapter results; verify the other four receive zero commands and Admin
   updates without refresh. Test tenant/outlet negatives and duplicate result replay.

## J. Deployment limitations

Registry/monitor state is process-local: use a single API process for this implementation.
Multiple API replicas need a distributed registry and SignalR backplane with routing
tests. No production deployment was performed. Windows native build is unverified;
enumeration currently uses a synchronous native method callback and needs measured
latency acceptance on target hardware. End-to-end DB/session/concurrency acceptance
and complete device adapter coverage remain before a production-ready declaration.

## K. Git

Both code repositories use `feature/till-realtime-hardware-diagnostics`.
Changes remain uncommitted. No main merge, force push or discard of existing work. No push performed for this slice.

Protocol reference: [ASP.NET Core SignalR Hub Protocol](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/HubProtocol.md).
