<!-- title: POS Hardware Production Readiness Canonicalization 2026-08-16 -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware Production Readiness — Canonicalization (2026-08-16)

## Current Result

```text
BLOCKED — HARDWARE NOT PRODUCTION READY
```

This document is the **canonical Second Brain summary** of the 2026-08-16
hardware production-readiness audit. It does **not** claim physical peripherals
are deployable to real stores.

**Code was not modified during this documentation task.**

## Separation rule (mandatory)

| Concern | What it is | Production status |
|---|---|---|
| **Financial Cash In / Cash Drop** | Backend-authoritative cash movements (`cash_movements`) | **SOFTWARE PRODUCTION ACCEPTED** (see Cash In Chunk 3 + Cash Drop Chunk 2) |
| **Physical cash drawer pulse** | ESC/POS drawer kick via Local Print Agent | **PARTIAL** — software path exists; physical acceptance incomplete |
| **Receipt printing** | ESC/POS via Local Print Agent / network | **PARTIAL** — software path exists; physical matrix incomplete |
| **Barcode scanning** | HID + camera capture + backend lookup | **PARTIAL** — software path exists; physical matrix incomplete |

Do **not** treat Cash In/Drop acceptance as physical drawer production readiness.

## Canonical hardware matrix

| Hardware | Canonical status | Release scope | Next gate |
|---|---|---|---|
| Receipt Printer | PARTIAL | Required for hardware release | Physical PR-* acceptance |
| Physical Cash Drawer | PARTIAL | Required for hardware release | Physical DR-* acceptance |
| Cash In / Cash Drop (financial) | SOFTWARE ACCEPTED | Financial release (separate from physical HW) | Optional slip print only |
| Barcode Scanner | PARTIAL | Required for hardware release | Physical SC-* acceptance |
| Payment Terminal | NOT IMPLEMENTED | **OUT OF CURRENT HARDWARE RELEASE** unless product reopens scope | Provider integration |
| Scale | NOT IMPLEMENTED | Deferred | Future |
| Customer Display | NOT IMPLEMENTED | Deferred / out of Release 1 | Future |
| Kitchen Printer | NOT IMPLEMENTED | Deferred (registry type only) | Runtime integration |

## Actual architecture (implemented)

```text
Flutter POS
   │
   ├── Barcode Scanner
   │      ├── HID keyboard-wedge capture
   │      └── Camera scanner (mobile_scanner)
   │      └── Backend exact product lookup
   │
   ├── Financial Cash Operations (In / Drop / summary)
   │      └── Backend HardwareCash APIs → cash_movements
   │
   └── Receipt Printer / Physical Cash Drawer
          │
          ├── Backend: config, permissions, drawer ops audit, device trust
          │
          └── E_POS.LocalPrintAgent (Windows, typically :9101)
                 │
                 └── Windows RAW spooler / ESC/POS
                        ├── Receipt print
                        └── Cash drawer pulse (ESC p)
```

Optional additional path: Flutter **network TCP ESC/POS** adapter (non-web).  
USB and Bluetooth Flutter adapters are **stubs** (`NOT_VERIFIED`) — not production-supported.

There is **no** generic multi-device “hardware agent”. The local bridge is specifically:

```text
E_POS.LocalPrintAgent
```

## Local Print Agent — current vs target

### Current runtime (truth)

- Common/dev path: configure `PrintAgent__LocalApiKey` + run the agent process
  (including `dotnet run` during development).
- Windows Service **installation scripts exist** under
  `scripts/local-print-agent/`.
- **Production install → reboot → auto-start → POS reconnect acceptance is NOT signed off.**

### Target production operating model (canonical requirement)

```text
Store installation
      ↓
Local Print Agent installed as managed Windows service
      ↓
Secure store-specific configuration
      ↓
Automatic startup after machine reboot
      ↓
POS starts
      ↓
POS connects to configured local agent
      ↓
Printer / drawer available
      ↓
No developer command required
```

**A production customer must NOT be required to run `dotnet run` or manually
start developer tooling for daily POS operation.**

## Production readiness definition

Hardware is production-ready **only when** all of the following are true:

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

**Not sufficient alone:** UI exists, HTTP 200, mock/unit tests, agent builds,
hardware enum exists, or documentation claiming complete without physical evidence.

## P1 production blockers (current)

1. Local Print Agent production packaging / reboot / auto-start acceptance  
2. Receipt Printer physical acceptance (PR-*)  
3. Physical Cash Drawer acceptance (DR-*)  
4. Barcode Scanner physical acceptance (SC-*)  
5. USB/Bluetooth printer paths if exposed as production options while stubs  

Payment Terminal is **NOT IMPLEMENTED** and **out of current hardware release**
unless product scope explicitly reopens it (then it becomes a P1).

## Next code implementation order (source of truth)

```text
Chunk 1 — Local Print Agent production packaging / Windows service autostart /
          restart recovery / production security-configuration acceptance
Chunk 2 — Receipt Printer physical production acceptance
Chunk 3 — Physical Cash Drawer production acceptance
Chunk 4 — Barcode Scanner physical production acceptance
Chunk 5 — Payment Terminal ONLY if included in production release scope
Chunk 6 — Scale / Customer Display / Kitchen Printer when product scope requires
```

Do **not** start Chunk 2–6 code claiming production hardware complete before
Chunk 1 deployment model is accepted.

## Authority links

| Topic | Canonical file |
|---|---|
| Architecture / release scope | [[../../../12_INTEGRATIONS/POS_Hardware_Integration]] |
| Local Print Agent | [[../../../12_INTEGRATIONS/Local_Print_Agent]] |
| Receipt printer | [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]] |
| Physical drawer | [[../../../12_INTEGRATIONS/Cash_Drawer_Integration]] |
| Scanner | [[../../../12_INTEGRATIONS/Barcode_Scanner_Integration]] |
| Card terminal | [[../../../12_INTEGRATIONS/Card_Reader_Integration]] |
| Physical gate matrix | [[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]] |
| Financial Cash Drawer | [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]] |
| Financial Cash Drop | [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/07_Cash_Drop_Feature]] |
| Cash Drop software acceptance | [[POS_Cash_Drop_Chunk_2_Production_Acceptance_2026-08-16]] |
| Cash In software acceptance | [[Cash_In_Chunk_3_Final_Production_Acceptance]] |

## Related audit

This canonicalization encodes the 2026-08-16 production-readiness audit verdict:

```text
BLOCKED — HARDWARE NOT PRODUCTION READY
```
