<!-- title: POS Hardware Production Acceptance Matrix -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-07-29 -->

# POS Hardware Production Acceptance Matrix

## Purpose

Authoritative automated-versus-physical acceptance and failure matrix for
cashier hardware. Unexecuted rows remain `Not Run` or `Blocked`.

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
| PR-01 | POS80 | Cash original v2 | Paid cash sale; Agent ready | Complete and print | One correct copy/audit | Not recorded for current contract | Passed | Not Run | - | Not Run |
| PR-02 | POS80 | History reprint | Authorized receipt/reason | Reprint once | No new sale/payment; one audit | Not recorded | Passed | Not Run | - | Not Run |
| PR-03 | POS80 | 80 mm barcode/cut | Valid receipt barcode | Print/scan/inspect edge | Scannable; footer above cut | Earlier output observed; current fix unconfirmed | Passed bytes | Not Run | - | Not Run |
| PR-04 | 58 mm | Long/large receipt | 58 mm configured | Print long names/many lines | Wrapped, complete, one cut | Not recorded | Passed bytes | Not Run | - | Not Run |
| PR-05 | POS80 | Discount/tax/copies | Authoritative v2 details | Print intended copies | Exact details/labels | Not recorded | Passed targeted | Not Run | - | Not Run |
| PR-06 | Printer | Return/exchange/refund/report | Completed authoritative document | Print each type | Correct document; no sale mutation | Not complete | Partial | Not Run | - | Blocked |

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
| DR-01 | RJ11/RJ12 drawer | Cash auto-open | Approved config/open till | Complete Cash | One audited pulse | Not implemented | Not Run | Not Run | - | Blocked |
| DR-02 | Drawer | Card/reprint suppression | Non-cash/reprint | Complete action | No pulse | Not implemented | Not Run | Not Run | - | Blocked |
| DR-03 | Drawer | Manual/no-sale | Permission/reason/approval | Open once | One audited pulse | Not implemented | Not Run | Not Run | - | Blocked |

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
Overall sign-off remains `Blocked` while required physical rows are open.

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
