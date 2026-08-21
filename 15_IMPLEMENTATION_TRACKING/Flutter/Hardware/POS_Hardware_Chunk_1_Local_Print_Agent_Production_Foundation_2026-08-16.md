<!-- title: POS Hardware Chunk 1 Local Print Agent Production Foundation 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware Chunk 1 — Local Print Agent Production Foundation (2026-08-16)

## Result

```text
SOFTWARE IMPLEMENTATION: PASS
WINDOWS SERVICE / REBOOT RUNTIME ACCEPTANCE: NOT VERIFIED (non-elevated environment)
Overall hardware production readiness: STILL BLOCKED
```

Chunk 1 makes `E_POS.LocalPrintAgent` production-packagable as a managed Windows
service so customers do **not** need `dotnet run` for daily POS operation.

Physical printer / drawer / scanner acceptance remain **later chunks**.

## What was implemented

- Self-contained `win-x64` publish via `scripts/local-print-agent/publish-print-agent.ps1`
- Hardened `install-print-agent.ps1` (loopback bind, CIDR firewall, AppDirectory,
  delayed-auto start, SCM failure recovery, `-Force` reinstall, fail-closed key prompt)
- `update-print-agent.ps1` / `uninstall-print-agent.ps1` retained (config preserved by default)
- API key policy fail-closed (empty / placeholder / low-entropy)
- Content root fixed to `AppContext.BaseDirectory` for service cwd independence
- Readiness includes `configurationValid`
- Drawer `requestedAt` freshness gate (default 120s) — no delayed stale pulse
- Flutter: debug-only emulator localhost remap; Android release HTTPS; private-LAN HTTP rules for desktop; `requestedAt` on drawer requests; clearer `AGENT_UNAVAILABLE`

## Evidence executed in this environment

| Check | Result |
|---|---|
| LocalPrintAgent tests | **60 passed** (Release) |
| `dotnet publish` self-contained win-x64 | **PASS** → `artifacts/local-print-agent/publish` |
| Published exe empty key | **FAIL CLOSED** (startup exception) |
| Published exe + key → `/health/live` | **PASS** (`agentVersion=1.1.0`) |
| Published exe → missing key on `/api/print/health` | **401** |
| Published exe → valid key health | **PASS** |
| Flutter focused hardware tests | **All passed** (local_print_agent + cash_drawer_recovery) |
| `flutter analyze` (changed files) | **No issues** |
| Windows Service install/start/reboot | **NOT VERIFIED** (session not elevated / reboot not executed) |

## Customer startup requirement

```text
Does customer need `dotnet run`? NO
```

Production path: publish → `install-print-agent.ps1` → Automatic (Delayed) service.

## Remaining Chunk 1 gaps

```text
Windows Service install/start/stop runtime on a store machine (elevated)
Machine reboot → auto-start acceptance
Crash recovery observed under SCM
HTTPS certificate provisioning acceptance (Android → LAN → LocalPrintAgent only;
Android direct USB/Bluetooth = N/A)
Firewall/CIDR runtime against installed service instance
```

These remain environment/ops verifications. Chunk 2 spooler work does **not**
close them. See also [[POS_Hardware_Chunk_2_Receipt_Printer_Production_Acceptance_2026-08-16]].

## Next

```text
Close Chunk 1 elevated ops on a real store Windows machine, then finish Chunk 2
visual/UI/offline paper acceptance before Chunk 3 drawer.
```

Do **not** mark overall hardware production-ready.

## Authority

- [[../../../12_INTEGRATIONS/Local_Print_Agent]]
- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
- [[POS_Hardware_Chunk_2_Receipt_Printer_Production_Acceptance_2026-08-16]]
- [[../../Backend/POSOperations/Receipt_Printer_Local_Agent_Implementation_Status]]
