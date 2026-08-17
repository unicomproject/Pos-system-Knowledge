<!-- title: POS Hardware Chunk 2 Receipt Printer Production Acceptance 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware Chunk 2 — Receipt Printer Production Acceptance (2026-08-16)

## Result

```text
CHUNK 2 STATUS: PARTIAL — SPOOLER/RUNTIME SOFTWARE PATH STRONG; FULL PHYSICAL SIGN-OFF INCOMPLETE
Overall hardware production readiness: STILL BLOCKED
Chunk 3 cash drawer: NOT READY TO START
```

Do **not** treat spooler `printed` / `bytesWritten > 0` as photographic paper proof
for every receipt field. Operator visual content checklist and interactive POS UI
sale-complete print remain open where noted below.

## Production-supported transport (this release)

| Transport | Code | Physical / runtime evidence | Production support |
|---|---|---|---|
| Local Print Agent → Windows RAW spooler → USB ESC/POS | Implemented | POS80 queue `POSPrinter POS80` on USB001; agent 1.1.0 published exe; Flutter client live test PASS | **SUPPORTED** |
| Network TCP ESC/POS direct | Implemented adapter | Not physically accepted this session | NOT production-accepted |
| Direct USB adapter | Stub; `selectAdapter` throws | N/A | **NOT supported** (hidden from hardware testing UI) |
| Direct Bluetooth adapter | Stub; `selectAdapter` throws | N/A | **NOT supported** |

## Physical environment recorded

```text
Manufacturer/model: POSPrinter POS80 (Windows queue name)
Connection: USB001 (Windows spooler)
Paper width tested: 80mm and 58mm (agent PaperWidth config)
Agent version: 1.1.0 (published self-contained win-x64)
POS / Flutter: LocalPrintAgentClient live acceptance test (not interactive Hardware Testing UI)
Windows: non-elevated session (IsAdmin=False)
Listen: http://127.0.0.1:9101 (loopback CIDR)
```

Evidence directory (no secrets):

```text
POS Backend/Unified-Commerce/artifacts/local-print-agent/chunk2-runtime/evidence/
```

## PR matrix outcomes (this session)

| PR ID | Automated / runtime | Physical paper visual | Result |
|---|---|---|---|
| PR-01 saleOriginal | Spooler PASS (`bytesWritten`>0) | Visual field checklist NOT VERIFIED | PARTIAL |
| PR-02 saleReprint | Spooler PASS | Visual NOT VERIFIED | PARTIAL |
| PR-03 80mm | Spooler PASS | Barcode scan / cut inspect NOT VERIFIED | PARTIAL |
| PR-04 58mm | Spooler PASS after PaperWidth=58mm | Visual NOT VERIFIED | PARTIAL |
| PR-05 non-LKR (USD) currency | Spooler PASS | Visual NOT VERIFIED | PARTIAL |
| PR-06 return/exchange/refund/report | Spooler PASS (with originalReceiptReference for return/exchange/refund) | Visual NOT VERIFIED | PARTIAL |

Additional runtime:

| Scenario | Result |
|---|---|
| Flutter client → Agent → spooler print + exact-body duplicate reject | **PASS** (live test with Windows platform override) |
| Missing / wrong API key on print | **401**, no print |
| Correct API key | **200 printed** |
| Exact idempotency duplicate | **409 duplicate_request** (no second spooler accept) |
| Agent stopped mid-flow | Client timeout / unreachable (agent offline) |
| Invalid printer name | ready **503**; print **503 printer_not_found**; bytesWritten=0; restore → next print PASS |
| USB/BT production selectAdapter | Throws `PrinterUnsupportedException` (unit covered) |
| Printer power-off / paper-out / cover-open | **NOT VERIFIED** / not detectable via current RAW transport |
| Interactive Flutter POS Hardware Testing UI button | **NOT VERIFIED** this session (client library path verified) |
| Elevated Windows Service / reboot continuity | **NOT VERIFIED** (Chunk 1 ops gap) |

## Software fixes in this chunk

| File | Change |
|---|---|
| `pos_receipt_printer_service.dart` | USB/BT `selectAdapter` hard-fail (production must use Local Print Agent) |
| `local_print_agent_client.dart` | Explicit Dio timeouts; DIRECT proxy (no system proxy for agent) |
| `local_print_agent_physical_acceptance_test.dart` | Live acceptance + USB/BT rejection; Windows platform override for host loopback |

## Automated tests

```text
LocalPrintAgent: 60 passed (Release)
Flutter test/features/hardware: 43 passed
flutter analyze (touched files): 0 errors (1 prefer_const info fixed)
Backend API: untouched for Chunk 2 transport
```

## Remaining Chunk 2 gaps (mandatory for full PASS)

```text
1. Operator visual paper checklist (branding, totals, cut, barcode scanability)
2. Interactive Flutter POS UI → print (Hardware Testing / sale completion UI)
3. Printer powered-off / disconnected physical offline
4. Windows Print Spooler stop/start recovery (controlled machine)
5. Paper-out/cover-open if/when transport can detect (else document NOT DETECTABLE)
6. Post-reboot print continuity (depends on Chunk 1 service auto-start)
7. Android release HTTPS tablet→agent if LAN Android remains in production scope
```

## Chunk 1 linkage

Chunk 1 remains:

```text
SOFTWARE PASS — OPERATIONAL ACCEPTANCE INCOMPLETE
```

Service install/start/stop/reboot/SCM recovery were **not** executed under elevation
in this environment (`IsAdmin=False`).

## Authority

- [[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../../../12_INTEGRATIONS/Local_Print_Agent]]
- [[POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]
- [[POS_Hardware_Production_Readiness_Implementation_Status]]
