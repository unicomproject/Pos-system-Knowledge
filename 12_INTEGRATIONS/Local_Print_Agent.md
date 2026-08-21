<!-- title: Local Print Agent -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Local Print Agent (`E_POS.LocalPrintAgent`)

## Purpose

Canonical documentation for the **Windows Local Print Agent** — the optional
Windows hardware bridge for receipt printing and physical cash drawer pulse when
the printer is attached to a Windows host.

**Primary Android tablet printing uses direct USB Host / Bluetooth Classic**, not
this agent. See [[Receipt_Printer_Integration]] and
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Android_Direct_Printer_Integration_2026-08-16]].

Component name in repository:

```text
E_POS.LocalPrintAgent
```

Role:

```text
SUPPORTED OPTIONAL WINDOWS PRINTING PATH
```


## Responsibilities (current software)

- Receipt printing via ESC/POS RAW to a Windows spooler printer
- Physical cash drawer pulse (`ESC p`) via the configured printer drawer port
- Local HTTP API for POS clients on a trusted private LAN
- Request validation (no arbitrary raw command injection from untrusted bodies)
- Idempotency / durable request store for receipt and drawer operations
- Health/live/ready and diagnostics endpoints
- Local API key authentication + network CIDR allow-list

## What it is not

- Not a multi-device driver for scale, customer display, or payment terminal
- Not the backend sale/receipt authority (`E_POS.Api` remains authoritative)
- Not a substitute for financial Cash In / Cash Drop APIs

## Actual runtime architecture

```text
Flutter POS
   ↓ (configured AgentBaseUrl + X-Local-Print-Key)
E_POS.LocalPrintAgent  (typically listen http://0.0.0.0:9101)
   ↓
Windows RAW print spooler
   ↓
USB ESC/POS receipt printer
   └── (optional) RJ11/RJ12 cash drawer kick
```

Backend participates for POS hardware configuration, permissions, drawer
operation audit/finalize, and receipt print audit — **not** for pushing ESC/POS
bytes to the USB printer.

## Current routes (agent)

| Route | Auth | Purpose |
|---|---|---|
| `GET /health/live` | LAN allow-list | Process liveness |
| `GET /health/ready` | LAN allow-list | Readiness |
| `GET /api/print/health` | Local API key | Detailed safe status |
| `GET /api/print/operations/{requestId}` | Local API key | Prior outcome |
| `POST /api/print/receipt` | Local API key | Print one receipt |
| `POST /api/drawer/open` | Local API key | One drawer pulse |

## Current runtime model (truth)

### Development / common path today

```text
Configure PrintAgent__LocalApiKey (≥24 chars)
+
run agent process (including `dotnet run` during development)
```

### Windows Service scripts

Installation/update scripts exist under the backend repository
(`scripts/local-print-agent/`, including `install-print-agent.ps1`).

**Canonical status (updated 2026-08-16 Chunk 1):**

```text
Production packaging + service install scripts: IMPLEMENTED (software PASS)
Published artifact health verified without `dotnet run`
Production install → reboot → auto-start → reconnect acceptance: NOT VERIFIED in this environment
Overall hardware module: STILL BLOCKED (physical PR/DR/SC pending)
```

Evidence: [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]

Do **not** mark Windows Service deployment fully production-accepted until reboot
auto-start is signed on a real store machine.

## Target production operating model (mandatory)

```text
Store installation
      ↓
Local Print Agent installed as managed Windows service
      ↓
Secure store-specific configuration (key, CIDR, printer name, paper width)
      ↓
Automatic startup after machine reboot
      ↓
POS starts and connects to configured agent
      ↓
Printer / drawer available
      ↓
No developer command required for daily operation
```

**A production customer must NOT be required to run `dotnet run`
or manually start developer tooling for daily POS operation.**

This target is the acceptance criterion for **Hardware Code Chunk 1**.

## Security model (current + production requirements)

### Current

- Header: `X-Local-Print-Key`
- Network: CIDR allow-list (defaults commonly loopback-only in sample config)
- Listen: typically port **9101**
- Failed-auth throttling options exist
- Placeholder keys such as `CHANGE_ME` must be rejected

### Production requirements

- Fail closed when key missing/invalid
- No placeholder/default production key in shipped config
- No public internet exposure
- Private firewall profile / trusted LAN only
- Secure secret provisioning and rotation
- Logging without secret leakage
- HTTPS production acceptance remains **incomplete** for Android → LAN → Agent
  deployments until signed (see SE-* matrix). It is **NOT APPLICABLE** when the
  Android tablet prints via direct USB/Bluetooth without LocalPrintAgent.

Local Agent authentication is **not** the same boundary as cloud POS device trust
(JWT / trusted device). Both are required in the overall model.

## Idempotency / retry

- Receipt and drawer requests use durable request IDs + payload hash.
- Identical replay must not print/pulse again.
- Payload conflict must fail safely.
- Spooler acceptance is **not** proof that paper printed or drawer opened.

### Dangerous behaviours (forbidden)

- Blindly queueing drawer-open after reconnect
- Auto-retry that can open the drawer twice
- Treating HTTP 200 from agent as physical customer-visible success without policy

## Configuration owners

| Owner | Settings |
|---|---|
| POS device (Flutter secure store) | Agent URL, timeout, printer transport selection, API key |
| Agent process | Listen URL, printer name, paper width, auto-cut, CIDR, key, retention |
| Backend | POS hardware configuration records, drawer ops audit, permissions |

Never store real API keys in Second Brain.

## Production status

```text
SOFTWARE: implemented for print + drawer pulse
DEPLOYMENT ACCEPTANCE: NOT COMPLETE (service/reboot/SCM NOT VERIFIED — non-elevated)
CHUNK 2 RECEIPT SPOOLER/RUNTIME: PARTIAL (see Chunk 2 record)
PHYSICAL PAPER VISUAL SIGN-OFF: NOT COMPLETE
PHYSICAL DRAWER ACCEPTANCE: NOT STARTED (Chunk 3)
OVERALL HARDWARE MODULE: BLOCKED
```

Authority for overall hardware readiness:

[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_2_Receipt_Printer_Production_Acceptance_2026-08-16]]

Related:

- [[Receipt_Printer_Integration]]
- [[Cash_Drawer_Integration]]
- [[POS_Hardware_Integration]]
- [[../15_IMPLEMENTATION_TRACKING/Backend/POSOperations/Receipt_Printer_Local_Agent_Implementation_Status]]
- [[../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Hardware/POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]
