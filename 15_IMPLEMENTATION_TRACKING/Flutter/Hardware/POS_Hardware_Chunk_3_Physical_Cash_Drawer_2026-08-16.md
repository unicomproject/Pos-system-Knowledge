<!-- title: POS Hardware Chunk 3 Physical Cash Drawer 2026-08-16 -->
<!-- status: Historical evidence — superseded for automatic Cash Sale physical acceptance -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-18 -->

# POS Hardware Chunk 3 — Physical Cash Drawer (2026-08-16)

> **Supersession (2026-08-17 runtime acceptance):** The automatic Cash Sale path
> on Windows Local Print Agent + POSPrinter POS80 + Cashbox #1 / `drawerPin2`
> physically passed after resolving emulator clock drift. See
> [[Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]].
> This 2026-08-16 file remains historical evidence for the pre-acceptance
> software/runtime hardening session. Split Cash, refund, manual/no-sale,
> `drawerPin5`, Android direct printer transports and alternate hardware remain
> unverified.

## Final result (this session)

```text
PARTIAL — CASH DRAWER SOFTWARE/RUNTIME COMPLETE ON WINDOWS AGENT PATH;
PHYSICAL DRAWER OPEN NOT VERIFIED; ANDROID PHYSICAL NOT VERIFIED
CHUNK 3 REMAINS OPEN
NOT READY TO CLAIM PRODUCTION HARDWARE PASS
Overall hardware production readiness: BLOCKED
```

Do **not** treat transport accept / spooler / USB write as physical drawer open.
At the time of this 2026-08-16 session, physical RJ11/RJ12 movement was **NOT
VERIFIED** on Windows, Android USB, or Android BT. The Windows POS80 automatic
Cash Sale path was later physically accepted on 2026-08-17; other scenarios
remain unverified.

## Canonical release numbering

```text
Chunk 1 — Local Print Agent
Chunk 2 — Receipt Printer
Chunk 3 — Physical Cash Drawer   ← this record
Chunk 4 — Barcode Scanner
```

Older “Hardware Chunk 4 — Drawer” notes remain **historical evidence** only.

## Software delivered / hardened this session

| Area | Result |
|---|---|
| Typed `CashDrawerTransport` (USB / BT / LocalPrintAgent / unsupported) | Implemented |
| Shared Dart `EscPosDrawerPulseBuilder` + exact-byte tests | Implemented (parity with Agent) |
| `CashDrawerController` routes all pulses through transport | Wired |
| Transport accept ≠ physical confirmation (`AGENT_ACCEPTED`) | Fixed (no overclaim) |
| Stable backend drawer `RequestId` from sale/return + purpose | Implemented |
| Split cash purpose `splitPaymentCash` | Implemented |
| Manual open reason + manager credentials when policy requires approval | Wired in Cash Drawer screen |
| Idempotency / unknown / no blind replay | Covered by recovery tests |
| Receipt print ≠ drawer pulse | Preserved (separate ownership) |

## Business rules (canonical)

| Trigger | Drawer |
|---|---|
| Cash-only payment success | One automatic intent (`cashSale`) |
| Split containing Cash (`SPLIT_CASH`) | One automatic intent (`splitPaymentCash`) |
| Card-only / QR-only | Suppressed (no register / no pulse) |
| Receipt print / reprint / report / printer test | Never pulses |
| Manual / no-sale | `cash_drawer.manage` + reason; manager auth when policy contains `approval` |
| Cash refund | Automatic when settlement is `CASH_REFUND` and `OpenOnCashRefund` |
| Non-cash refund | Suppressed |

## Physical acceptance matrix (this session)

| Test | Windows | Android USB | Android BT |
|---|---|---|---|
| Config resolved | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Test pulse sent | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Drawer physically opens | NOT VERIFIED | NOT VERIFIED | N/A until BT printer has drawer port |
| Cash checkout opens | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Split Cash opens once | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Card-only suppressed | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Reprint suppressed | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Double tap suppressed | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Offline/disconnect safe | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Reconnect works | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Restart recovery | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

## Chunk boundaries

- Chunk 2 remains **OPEN / PARTIAL** — this work does **not** flip Chunk 2 to PASS.
- Chunk 4 (Barcode Scanner) must **not** start until Chunk 3 mandatory gates close.

## Incident follow-up — physical open failure (2026-08-16 evening)

### Problem A — HTTP 400 (backend)

Hardware Test `POST /api/v1/pos/hardware/tests` omitted `requestId` (and
`hardwareConfigurationId` / `configurationVersion`). Empty `requestId` maps to
`Guid.Empty` → `pos_hardware.invalid_test` → **HTTP 400**.

Physical confirmation also sent `resultCategory: SUCCESS|FAILURE`, which is
rejected by `PosHardwareService` (canonical: `drawer_opened` /
`drawer_did_not_open`).

### Problem B — Agent accepted, drawer closed

LocalPrintAgent RAW spooler accepted ESC/POS pulse (`ResultCode` historically
`printed` = shared spooler success). Public drawer code now
`drawer_pulse_accepted`. Physical open remains **operator-confirmed only**.

Agent log `purpose=cashSale` with identical requestId/operationId is the
**cash checkout auto-open** path, not Hardware Test (`hardwareTest`).

### Policy `never`

UI policy `never` means **no manager-approval requirement** for manual open.
Automatic cash open is controlled by `openOnCashSale` / `openOnCashSplit` /
`openOnCashRefund`, not by the `never` label alone.

### Retest required

Publish/restart LocalPrintAgent, restart Flutter, run Hardware Test once,
observe drawer, confirm Yes/No.

### Runtime E2E session (2026-08-16 night) — evidence

```text
FIXED — CASH DRAWER SOFTWARE/RUNTIME PATH COMPLETE, PHYSICAL RETEST REQUIRED
CHUNK 3 REMAINS OPEN
```

**Runtime API**

- Port **5150** still held by elevated/stale `dotnet` PID (CommandLine inaccessible;
  Stop-Process Access Denied). Launcher intentionally syncs to
  `%USERPROFILE%\source\nytroz-pos-api-run` via `scripts/run-api.ps1`.
- Current Unified-Commerce build **proven on 5151**:
  `dotnet exec C:\artifacts\epos-api-current\E_POS.Api.dll`
  (copied from `POS Backend\Unified-Commerce\src\E_POS.Api\bin\Debug\net10.0`).
  `CashDrawerStableRequestId` present in Application.dll.
- Flutter restarted with `--dart-define=API_BASE_URL=http://10.0.2.2:5151`.
- UAC elevation to reclaim 5150 / read ProgramData agent logs: not completed.

**LocalPrintAgent**

- Health ready: receiptContractVersion=3; printerExists/Ready; POSPrinter POS80.
- Installed DLL contains `drawer_pulse_accepted` + `bytesHex`.
- Controlled RAW pulses:
  - Pin2 100/200 → `drawer_pulse_accepted`, bytesWritten=5, physicalOpenConfirmed=false
  - Pin5 100/200 → `drawer_pulse_accepted`, bytesWritten=5, physicalOpenConfirmed=false
- Expected bytes (unit tests): Pin2 `1B 70 00 32 64`; Pin5 `1B 70 01 32 64`.
- Physical open: **NOT VERIFIED**.

**Source contracts confirmed present** (createTest requestId, hardwareTest purpose,
drawer_opened/drawer_did_not_open, safe error UX, agent drawer_pulse_accepted).

**Automated this session:** Agent publish suite 50; focused drawer Agent 10;
backend filter ApiTests 10 / Unit 43 / Integration 21; Flutter hardware folder
76 passed / 1 skipped; flutter analyze hardware: no issues.
