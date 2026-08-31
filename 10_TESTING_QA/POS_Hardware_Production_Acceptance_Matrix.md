<!-- title: POS Hardware Production Acceptance Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-17 -->

# POS Hardware Production Acceptance Matrix

## Overall gate (2026-08-16)

```text
Overall hardware production sign-off: BLOCKED
BLOCKED — HARDWARE NOT PRODUCTION READY
Chunk 2 Receipt Printer: OPEN (closure attempt PARTIAL — physical gaps)
```

Closure attempt evidence:
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]]

This matrix is a **first-class production gate**. No production PASS for a
claimed supported peripheral without physical evidence.

Financial Cash In / Cash Drop software acceptance is **preserved separately**
and is **not** a substitute for DR-* physical drawer rows.

Canonical hardware authority:

[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Android_Direct_Printer_Integration_2026-08-16]]
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]]
[[../12_INTEGRATIONS/POS_Hardware_Integration]]
[[../12_INTEGRATIONS/Receipt_Printer_Integration]]
[[../12_INTEGRATIONS/Local_Print_Agent]]

## Purpose

Authoritative automated-versus-physical acceptance and failure matrix for
cashier hardware. Unexecuted rows remain `Not Run` or `Blocked`.

Every row must distinguish evidence class:

```text
Automated | Simulated | Physical
PASS | FAIL | BLOCKED | NOT RUN | NOT APPLICABLE
```

## Test Environment Record

Record date, build/commit, tenant/outlet/till/device, phone/OS, laptop/Windows,
network, Agent version, printer/scanner/drawer/terminal model and configuration
version. Known development hardware includes physical Android, Windows laptop,
USB `POSPrinter POS80` and `TURBOGEAR TB-00D`; do not infer unrecorded results.

## Evidence Rules

Health, spooler acceptance, emulator, build, package and automated tests are not
paper/device completion. Physical `Passed` requires operator-observed result plus
evidence reference. Never store keys, PAN/CVV/PIN or receipt customer secrets.

## Receipt Printer Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| PR-01 | POS80 | Cash original v2 | Paid cash sale; Agent ready | Complete and print | One correct copy/audit | Spooler accepted 2026-08-16 (`printed`, bytesWritten>0); visual field checklist open | Passed | Partial (spooler) | `chunk2-runtime/evidence/PR-01.json` + Flutter live test | Partial |
| PR-02 | POS80 | History reprint | Authorized receipt/reason | Reprint once | No new sale/payment; one audit | Spooler accepted saleReprint; visual open | Passed | Partial (spooler) | `chunk2-runtime/evidence/PR-02.json` | Partial |
| PR-03 | POS80 | 80 mm barcode/cut | Valid receipt barcode | Print/scan/inspect edge | Scannable; footer above cut | Spooler accepted 80mm; barcode scan/cut visual NOT VERIFIED | Passed bytes | Partial (spooler) | `chunk2-runtime/evidence/PR-03.json` | Partial |
| PR-04 | 58 mm | Long/large receipt | 58 mm configured | Print long names/many lines | Wrapped, complete, one cut | Spooler accepted after PaperWidth=58mm; visual open | Passed bytes | Partial (spooler) | `chunk2-runtime/evidence/PR-04-58mm.json` | Partial |
| PR-05 | POS80 | Discount/tax/copies | Authoritative v2 details | Print intended copies | Exact details/labels | USD currency spooler accepted; visual open | Passed targeted | Partial (spooler) | `chunk2-runtime/evidence/PR-05.json` | Partial |
| PR-06 | Printer | Return/exchange/refund/report | Completed authoritative document | Print each type | Correct document; no sale mutation | All four purposes spooler PASS 2026-08-16; visual open | Passed | Partial (spooler) | `chunk2-runtime/evidence/PR-06-*.txt` | Partial |

## Android Direct USB Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| USB-01 | Android tablet | Discovery | USB Host / hub | Enumerate bulk-OUT devices | Candidates listed; no silent random pick | Software implemented | Passed mocked | Not Run | Android direct record | Not Run |
| USB-02 | Android tablet | Permission | Device present | Request USB permission | Grant/deny typed | Software implemented | Passed mocked | Not Run | - | Not Run |
| USB-03 | Android tablet | Test print | Configured USB | Hardware Testing test print | Bytes accepted; typed errors | Software implemented | Passed mocked | Not Run | - | Not Run |
| USB-04 | Android tablet | Sale receipt | Paid sale | Complete and print | One ESC/POS write; sale intact | Software path | Partial | Not Run | - | Not Run |
| USB-05 | Android tablet | Reprint | Authorized reprint | Reprint once | No sale/payment duplicate | Software path | Partial | Not Run | - | Not Run |
| USB-06 | Android tablet | 80mm | 80mm config | Print | Layout/cut bytes | Generator covered | Passed bytes | Not Run | - | Not Run |
| USB-07 | Android tablet | 58mm | 58mm config | Print | Layout/cut bytes | Generator covered | Passed bytes | Not Run | - | Not Run |
| USB-08 | Android tablet | Disconnect | Printer unplugged | Print | Safe typed failure | Software path | Passed mocked | Not Run | - | Not Run |
| USB-09 | Android tablet | Reconnect | Reattach | Next deliberate print | Succeeds without blind replay | Software path | Passed mocked | Not Run | - | Not Run |
| USB-10 | Android tablet | App restart | Saved config | Restart app / reprint | No stale auto print | Software path | Not Run | Not Run | - | Not Run |
| USB-11 | Android tablet | Barcode/QR | Receipt with barcode | Print/scan | Scannable | Bytes preserved | Partial | Not Run | - | Not Run |
| USB-12 | Android tablet | Cut | Auto-cut enabled | Print | Cut command present | Generator covered | Passed bytes | Not Run | - | Not Run |
| USB-13 | Android tablet | Sale integrity | Print fails after pay | Observe sale | Sale/payment unchanged | Contract preserved | Passed related | Not Run | - | Not Run |

## Android Direct Bluetooth Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| BT-01 | Android tablet | Paired selection | Bonded printer | Discover / select address | Explicit configured address | Software implemented | Passed mocked | Not Run | Android direct record | Not Run |
| BT-02 | Android tablet | Permission | Android 12+ | List/connect | PERMISSION_DENIED typed if missing | Software implemented | Passed mocked | Not Run | - | Not Run |
| BT-03 | Android tablet | Connect | Paired + enabled | Connect SPP | Bound timeout | Software implemented | Passed mocked | Not Run | - | Not Run |
| BT-04 | Android tablet | Test print | Configured BT | Test print | Bytes accepted | Software implemented | Passed mocked | Not Run | - | Not Run |
| BT-05 | Android tablet | Sale receipt | Paid sale | Complete and print | One write; sale intact | Software path | Partial | Not Run | - | Not Run |
| BT-06 | Android tablet | Reprint | Authorized reprint | Reprint once | No sale/payment duplicate | Software path | Partial | Not Run | - | Not Run |
| BT-07 | Android tablet | Disconnect / OOR | Printer off/range | Print | Safe failure | Software path | Passed mocked | Not Run | - | Not Run |
| BT-08 | Android tablet | Reconnect | Printer returns | Next deliberate print | Succeeds; no blind replay | Software path | Passed mocked | Not Run | - | Not Run |
| BT-09 | Android tablet | Bluetooth off/on | Toggle radio | Print / recover | Typed BLUETOOTH_DISABLED then recover | Software path | Passed mocked | Not Run | - | Not Run |
| BT-10 | Android tablet | Tablet restart | Saved config | Restart | No stale auto print | Software path | Not Run | Not Run | - | Not Run |
| BT-11 | Android tablet | Barcode/QR | Receipt barcode | Print/scan | Scannable | Bytes preserved | Partial | Not Run | - | Not Run |
| BT-12 | Android tablet | Cut | Auto-cut | Print | Cut bytes | Generator covered | Passed bytes | Not Run | - | Not Run |
| BT-13 | Android tablet | Sale integrity | Print fails after pay | Observe sale | Sale/payment unchanged | Contract preserved | Passed related | Not Run | - | Not Run |

## Barcode Scanner Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SC-01 | TB-00D | Leading zero/Enter | HID suffix Enter | Scan printed code | Exact preserved lookup | Not recorded | Passed | Not Run | - | Not Run |
| SC-02 | TB-00D | Rapid/repeated scans | Same variant in stock | Scan burst | FIFO; exact quantity increment | Not recorded | Passed | Not Run | - | Not Run |
| SC-03 | Android camera | Permission/lifecycle | Camera device | Deny/allow/background/resume | Safe state; one scan | Not recorded | Passed widget | Not Run | - | Not Run |
| SC-04 | Scanner | Not-found/ambiguous | Invalid/duplicate data | Scan | No cart mutation; safe error | Not recorded | Partial | Not Run | - | Not Run |

## Cash Drawer Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DR-01 | POS80 / Cashbox #1 / drawerPin2 | Cash auto-open | Approved config/open till | Complete Cash | Receipt auto-print; one automatic pulse; physical open | Checkout, receipt auto-print, authenticated Agent request, POS80 pulse and physical drawer movement observed PASS after clock synchronization on 2026-08-17 | Passed focused regression | Passed (operator observed) | [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]] | Passed |
| DR-02 | Drawer | Card/reprint suppression | Non-cash/reprint | Complete action | No pulse | Software ready 2026-08-16 | Not Run | Not Run | - | Blocked (physical) |
| DR-03 | Drawer | Manual/no-sale | Permission/reason/approval | Open once | One audited pulse | Software ready 2026-08-16 | Not Run | Not Run | - | Blocked (physical) |
| DR-04 | POS80 / Cashbox #1 / drawerPin2 | Direct Local Agent pulse | Agent authenticated and printer configured | Send controlled hardware-test pulse | One pulse; physical open | Direct Agent pulse and physical movement observed PASS on 2026-08-17 | Passed contract/pulse tests | Passed (operator observed) | [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]] | Passed |
| DR-05 | Local Print Agent | Stale request safety | Device clock intentionally drifted beyond safe window | Submit checkout drawer request | HTTP 400; no stale physical pulse | `invalid_drawer_request`; request older than 120 seconds rejected; synchronized checkout subsequently passed | Passed root-cause/focused regression | Passed runtime observation | [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]] | Passed |

## Card Terminal Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CT-01 | Approved terminal | Approved/declined/cancel | Provider configured | Run outcomes | Correct mutation/no mutation | Provider absent | Safety passed | Not Run | - | Blocked |
| CT-02 | Terminal | Timeout/unknown | Provider lookup | Interrupt response | Reconcile; no blind retry | Provider absent | Partial | Not Run | - | Blocked |
| CT-03 | Terminal | Slips/POS receipt | Approved capture | Complete/print | Separate safe documents | Provider absent | Not Run | Not Run | - | Blocked |

## Till And Cash-Control Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| TL-01 | Till/printer | Open with health state | Assigned device | Open till | Correct session/audit | Till works; hardware snapshot gap | Passed till | Not Run | - | Not Run |
| TL-02 | Till/printer | Close/report | Open session/counts | Close and print | Close remains valid if print fails | Report incomplete | Partial | Not Run | - | Blocked |
| TL-03 | Till hardware | Change during shift | Active session | Attempt change | Policy/audit enforced | Backend version/reason/audit rules implemented; physical runtime not recorded | Passed targeted | Not Run | - | Not Run |

## Network And Recovery Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| NR-01 | Local Agent | App/Agent restart | Persisted request | Interrupt/restart | Query/recover; no duplicate | Automated only | Passed | Not Run | - | Not Run |
| NR-02 | LAN printer | Timeout/partial | Controlled network loss | Submit/intercept | Unknown; no auto resend | Automated only | Passed | Not Run | - | Not Run |
| NR-03 | Printer | Paper/cover/jam/cutter | Fault injection | Trigger each | Safe category/retest | Driver-limited | Partial | Not Run | - | Not Run |

## Security Matrix

| ID | Hardware | Scenario | Preconditions | Steps | Expected | Actual | Automated | Physical | Evidence | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SE-01 | Agent | CIDR/key rejection | Invalid source/key | Call APIs | Reject; no secret/log leak | Automated only | Passed | Not Run | - | Not Run |
| SE-02 | Agent | Production HTTPS/firewall | Release deployment | Phone call | Trusted private endpoint | Not deployed | Partial | Not Run | - | Blocked |
| SE-03 | Device | Revocation/isolation | Revoked/cross-tenant | Load/use hardware | Denied | Incomplete E2E | Partial | Not Run | - | Not Run |

## Authoritative Error And Recovery Matrix

| Hardware/failure | Cashier message/action | Business effect | Retry/idempotency/audit |
|---|---|---|---|
| Agent unavailable/key unauthorized/wrong printer | Check approved config/access | No sale rollback; no false print | Retry health/config; same receipt needs explicit action |
| Offline/paper/cover/jam/cutter | Show detected safe category; operator fixes/retests | Payment unchanged | No silent resend; audit confirmed outcome |
| Timeout/partial/unknown/restart | Outcome unknown; query/review | Do not assume printed/failed | Stable ID; operation lookup; operator decision |
| HID disconnected/incomplete | Use manual search/reconnect | No cart mutation | New complete frame only; no audit |
| Rapid scans | Processing indicator | FIFO cart mutations | One queue item per frame |
| Barcode not found/ambiguous | Safe not-found/config error | No cart mutation | Correct data then rescan |
| Camera denied/unavailable/lifecycle | Permission/settings or HID fallback | No cart mutation | New intentional session |
| Drawer printer unavailable/pulse unsupported/cable | Controlled manual procedure | Payment remains complete | No blind pulse; audit failure/recovery |
| Card provider unavailable/decline/cancel/fail | Outcome-specific message | No paid sale | Explicit new attempt per provider rules |
| Card timeout/unknown/reconciliation mismatch | Pending review/reconcile | Do not mark paid | Same operation lookup; manager/ops review |

## Regression Matrix

Run login/device/till, catalog/cart, Cash checkout, receipt/audit/reprint,
return/exchange/refund, end shift, permissions, responsive UI and offline/restart
regressions. No unrelated failing suite may be hidden.

## Production Sign-Off

QA, product owner, security, operations and hardware owner record names/date,
build, evidence links, accepted exceptions and rollback/support readiness.

```text
Overall sign-off: BLOCKED
```

Required physical gates still open for current hardware release:

- Local Agent production packaging / reboot / auto-start (deployment)
- PR-* Receipt Printer
- Remaining DR-* Physical Cash Drawer scenarios (automatic Cash Sale on the
  recorded POS80 / drawerPin2 setup is passed)
- SC-* Barcode Scanner

CT-* Card Terminal remains **Blocked / Not Applicable** while payment terminal
is **OUT OF CURRENT HARDWARE RELEASE** (provider absent).

Financial Cash In / Cash Drop software PASS records remain valid historical /
software evidence and must not be downgraded because physical hardware is blocked.

## Hardware Chunk 1 automated evidence (2026-07-29)

| Area | Command/result | Physical meaning |
|---|---|---|
| Backend Release | `dotnet build E_POS.sln --configuration Release --no-restore -m:1` — passed, 0 warnings/errors | No physical evidence |
| Backend tests | 627 unit + 375 integration + 339 API passed | Validates existing suite and Chunk 1 service/controller cases |
| Local Agent | 30 tests passed | Validates contract/security/byte behavior, not paper output |
| Flutter | `flutter analyze --no-pub` passed; 20 targeted hardware tests passed | No device evidence |
| Android | Debug APK built successfully | Installation/runtime still required |
| Full Flutter | 653 passed, 7 failed in pre-existing/unrelated New Sale widget expectations/overflows | Full regression is not green |

Hardware Chunk 1 physical printer/scanner/active-shift rows remain `Not Run`.
No physical success is inferred from these automated results.

## Hardware Chunk 2C automated evidence (2026-07-29)

| Area | Command/result | Physical meaning |
|---|---|---|
| Backend Release | Build passed, 0 warnings/errors | No paper evidence |
| Backend suites | 627 unit + 379 integration + 339 API passed | Historical authorization/audit covered |
| Local Agent | 41/41 passed | Purpose/reprint/copy/validation bytes covered |
| Flutter targeted/analyze | 40 targeted passed; analyze clean | Provider/contract evidence only |
| Flutter full | 660 passed, 7 existing New Sale failures | Regression remains red |
| Android | Debug APK built | Runtime/device acceptance pending |
| Migration | `20260729111244_HardwareChunk2CReprintCopies` applied | Development schema verified |

Receipt physical cases—original/reprint for Refund/Return and Exchange,
customer/merchant/multiple copies, partial failure, barcode/cut and fault
injection—remain `Not Run`.

## Related Files

- [[../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../12_INTEGRATIONS/Barcode_Scanner_Integration]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Implementation_Status]]

## Hardware Chunk 3 automated evidence (2026-07-29)

- Backend Release build: 0 warnings, 0 errors.
- Backend suites: 1390 passed, 0 failed.
- Flutter scanner-targeted suite: 29 passed, 0 failed.
- Flutter analyze: no issues.
- Android debug APK: built successfully.
- Full Flutter suite: 662 passed, 7 unrelated existing New Sale UI failures.

| Physical evidence | Status |
|---|---|
| TB-00D Notepad/POS | Pending |
| Emulator host-HID forwarding | Pending |
| Physical Android HID and camera | Pending |
| 50-scan counts/latency | Pending |
| Background, lock and resume | Pending |
| POS80 printed barcode exact match | Pending |
| Backend Hardware Testing lifecycle | Pending |

No physical measurements were inferred from automated tests.

## Chunk 3 Attempt (2026-08-06)

| Check | Result |
|---|---|
| Local Print Agent listening on 9101 | Pass |
| POS80 host printer available | Pass |
| Sale receipt routing assignment | Fail — `PRINTER_NOT_CONFIGURED` |
| Explicit print physical output | Not produced |
| Cash drawer operation | Fail — `INVALIDCONFIGURATION` |
| Duplicate financial transaction | None |

Physical hardware acceptance remains pending; no print or sale retry was made.
