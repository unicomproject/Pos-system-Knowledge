<!-- title: Cash Drawer Runtime Integration Issue Resolution -->
<!-- status: Resolved -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-17 -->

# Cash Drawer Runtime Integration Issue Resolution

## Status Summary

| Item | Value |
|---|---|
| Platform | Flutter + Windows Local Print Agent + POS Hardware |
| Module | Hardware / Cash Drawer / Checkout |
| Feature | Automatic Cash Drawer Open After Cash Checkout |
| Status | Resolved |
| Completed Date | 2026-08-17 |
| Developer | - |
| Reviewer | Operator-confirmed physical acceptance |
| PR / Commit | - |
| Tests | Passed — analyze clean; 40 focused passed, 1 skipped; 1,119 full-suite passed, 1 skipped; debug APK built |

## Issue

Cash checkout completed successfully and receipt auto-print worked, but the
physical cash drawer did not automatically open.

## Expected Runtime Flow

```text
Cash payment succeeds
→ backend drawer operation returned
→ Flutter triggerAutoOpenForCheckout()
→ local printer configuration resolved
→ CashDrawerTransport
→ LocalPrintAgentClient
→ POST /api/drawer/open
→ ESC/POS ESC p pulse
→ POSPrinter POS80
→ drawerPin2
→ physical drawer opens
```

## Investigation Evidence

```text
Cash payment response                         PASS
drawerOperationId                             PASS
drawerRequestId                               PASS
openOnCashSale=true                           PASS
drawerPort=drawerPin2                          PASS
100/200 pulse timing                          PASS

Flutter auto-open entry                       PASS
Flutter local printer config                  PASS
Agent base URL                                PASS
Agent API key configured                      PASS
Printer name                                  PASS

Direct Agent hardwareTest pulse               PASS
Physical drawer from direct pulse             PASS
```

## Exact Failure

```text
HTTP 400
code=invalid_drawer_request
message=Drawer-open request validation failed.

requestedAt:
Drawer request is stale (older than 120 seconds) and was not pulsed.
```

## Root Cause

The Android Pixel Tablet emulator clock was approximately nine hours behind
the Windows host running the Local Print Agent. Flutter correctly generated
`requestedAt` using the emulator UTC clock. The Agent compared that value with
Windows host time and correctly rejected the request because it exceeded the
120-second stale-request window.

Classification: **Environment/runtime clock synchronization issue**.

This was not a Cash Drawer hardware defect, Flutter business-rule defect,
Backend checkout defect, printer defect, or Local Print Agent pulse defect.

## Clock Evidence

```text
Windows UTC before resolution:
2026-08-17T10:25:09.2923842Z

Pixel Tablet emulator UTC before resolution:
Mon Aug 17 01:11:40 UTC 2026

Pixel Tablet emulator UTC after reboot:
Mon Aug 17 10:27:20 UTC 2026
```

## Resolution

The Android emulator was rebooted through ADB. After reboot, its clock
synchronized with the current host time. No production Cash Drawer business
logic, transport logic, Agent validation, or stale-request threshold changed.

## Final Runtime Acceptance

Environment:

```text
Flutter target: Pixel Tablet emulator
Backend: localhost:5150
Local Print Agent: v1.1.0, port 9101
Flutter Agent URL: http://10.0.2.2:9101
Printer: POSPrinter POS80
Drawer port: drawerPin2
Pulse: 100 ms ON / 200 ms OFF
```

Operator-confirmed result after clock synchronization:

```text
Checkout completed      PASS
Receipt auto-print      PASS
Cash drawer auto-open   PASS
Physical drawer opened  PASS
```

**RESOLVED — RUNTIME ACCEPTANCE PASSED**

Physical drawer-open PASS is based on explicit operator observation; it is not
inferred from Agent acceptance alone.

## What Was Proven NOT To Be the Root Cause

```text
Cash drawer cable
Physical drawer lock
Drawer solenoid
POS80 cash drawer port
Cashbox #1
drawerPin2
ESC/POS pulse bytes
100/200 pulse timing
Windows RAW spooler
POSPrinter POS80 queue
Local Print Agent process
Local Print Agent authentication
Flutter Agent URL
Flutter Local Agent API-key configuration
Flutter printer configuration
drawerOperationId
drawerRequestId
openOnCashSale
cashSale purpose mapping
```

## Production Safety Note

The Local Print Agent 120-second stale-request validation must remain enabled.
It successfully prevented a stale drawer pulse. Production POS devices must
maintain reliable system-time synchronization; stale-request validation must
not be weakened to compensate for clock drift. An emulator reboot is incident
recovery evidence, not a production architecture.

## Temporary Diagnostics Cleanup

The following investigation-only diagnostics were removed from Flutter:

```text
[DRAWER-DIAG]
[DRAWER-CONFIG-DIAG]
[DRAWER-AUTO-ENTRY]
[DRAWER-AUTO-CONFIG]
[DRAWER-AUTO-PULSE-BEFORE]
[DRAWER-AUTO-PULSE-AFTER]
[DRAWER-AUTO-ERROR]
[DRAWER-AGENT-400]
```

Production drawer behavior and existing `developer.log(...)` operations were
preserved.

## Regression Validation

```text
dart format (3 targeted files): PASS
flutter analyze: PASS — No issues found
focused drawer/Agent suite: PASS — 40 passed, 0 failed, 1 skipped
flutter test: PASS — 1,119 passed, 0 failed, 1 skipped
flutter build apk --debug: PASS
backend tests: Not rerun — no backend production code changed during cleanup
Local Agent tests: Not rerun — no Local Agent production code changed during cleanup
```

The skipped focused test is the opt-in live physical Agent test; this closure
uses the separately completed operator-observed runtime acceptance above.

## Final Classification

```text
PASS — CASH DRAWER RUNTIME INTEGRATION ISSUE RESOLVED AND DOCUMENTED
```

This closes only the proven automatic Cash Sale path on the recorded
POS80/Cashbox #1/drawerPin2 environment. Split Cash, refund, manual no-sale,
drawerPin5, other printer models, Android direct printer transports, scanner,
and remaining hardware deployment rows retain their existing status.

## Related Files

- [[../../../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[POS_Hardware_Production_Readiness_Implementation_Status]]
- [[POS_Hardware_Chunk_3_Physical_Cash_Drawer_2026-08-16]]
