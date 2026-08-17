<!-- title: POS Hardware Production Readiness Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-17 -->

# POS Hardware Production Readiness Implementation Status

## Status Summary

| Item | Value |
|---|---|
| Platform | Flutter, Backend, Windows Local Agent |
| Module | Hardware / POS Operations / Payment |
| Feature | Cashier hardware production readiness |
| Status | **ANDROID DIRECT USB/BT SOFTWARE PASS**; physical tablet acceptance **NOT VERIFIED**; overall hardware still **BLOCKED** |
| Completed Date | - |
| PR / Commit | Documentation canonicalization 2026-08-16; no production code commit in that task |
| Tests | Automated regression passed; Cash Sale drawer physical row passed; other physical matrix rows open |

## Canonical authority (supersedes older chunk narrative where conflicting)

[[POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
[[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
[[../../../12_INTEGRATIONS/Local_Print_Agent]]
[[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]]

## Feature Summary

Tracks the complete production path for device configuration, receipt printer,
scanner, drawer, terminal, till hardware, recovery and sign-off. Overall status
**cannot** be Completed while required physical/deployment rows remain open.

Financial Cash In / Cash Drop software acceptance is **preserved** and is
**not** physical hardware production readiness.

## Current canonical matrix

| Hardware | Status |
|---|---|
| Receipt Printer | PARTIAL |
| Physical Cash Drawer | Automatic Cash Sale path physically accepted 2026-08-17; other scenarios PARTIAL |
| Cash In / Cash Drop (financial) | SOFTWARE ACCEPTED |
| Barcode Scanner | PARTIAL |
| Payment Terminal | NOT IMPLEMENTED / OUT OF CURRENT HARDWARE RELEASE |
| Scale / Customer Display / Kitchen | NOT IMPLEMENTED / deferred |

## Next code implementation order

```text
Chunk 1 — Local Print Agent production packaging / Windows service autostart
           → SOFTWARE PASS 2026-08-16 (service/reboot runtime NOT VERIFIED)
           → evidence: [[POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]
Chunk 2 — Receipt Printer physical production acceptance
           → OPEN / PARTIAL 2026-08-16 closure attempt
             ([[POS_Hardware_Chunk_2_Receipt_Printer_Closure_Attempt_2026-08-16]];
              Android physical NOT VERIFIED; installed agent still v2 without elevation)
           → evidence: [[POS_Hardware_Chunk_2_Receipt_Printer_Production_Acceptance_2026-08-16]]
Checkout Print Receipt (manual policy) — first-print trigger FIXED 2026-08-16
           → evidence: [[POS_Hardware_Checkout_Receipt_Print_Manual_Policy_Fix_2026-08-16]]
Chunk 3 — Physical Cash Drawer
           → AUTOMATIC CASH SALE PHYSICAL PASS 2026-08-17 on POS80 /
             Cashbox #1 / drawerPin2; other physical scenarios remain open
             ([[Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]])
Chunk 4 — Barcode Scanner physical production acceptance (NOT READY)
Chunk 5 — Payment Terminal ONLY if release scope reopens
Chunk 6 — Deferred hardware when product requires
```

Older 2026-07-29 chunk numbering in historical sections below is **historical
evidence** of prior software work. The sequence above is the current SoT for
upcoming **code** work.

## Related Second Brain Files

| Area | File |
|---|---|
| Hardware module | [[../../../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]] |
| Device module | [[../../../04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/01_Module_Overview]] |
| POS integration | [[../../../12_INTEGRATIONS/POS_Hardware_Integration]] |
| Local Print Agent | [[../../../12_INTEGRATIONS/Local_Print_Agent]] |
| QA matrix | [[../../../10_TESTING_QA/POS_Hardware_Production_Acceptance_Matrix]] |
| Hardware journey | [[../../../03_USER_JOURNEYS/Cashier/13_Hardware_Testing_Flow]] |

## Access Checks Implemented

| Category | Verified codes/status |
|---|---|
| Hardware settings | `pos.hardware.settings` |
| Receipt | `receipts.view`, `receipts.print`, `receipts.reprint` |
| Drawer | `cash_drawer.view` / `manage` / `movement.create` |
| Payment | `payments.card.accept` (provider absent) |
| Till | `pos.till.open`, `pos.till.close` |
| Tenant Admin hardware | `tenant.hardware.view` / `tenant.hardware.manage` |

## Known Gaps (P1 blockers)

1. Local Print Agent production packaging / reboot / auto-start acceptance
2. Receipt Printer physical PR-* matrix
3. Remaining Cash Drawer DR-* scenarios outside accepted automatic Cash Sale
4. Barcode Scanner physical SC-* matrix
5. USB/Bluetooth printer stubs if exposed as production options
6. Payment Terminal — only if product reopens release scope

## Historical software chunk evidence (2026-07-29)

Prior Chunks 1–5 recorded software foundations (config/test audit, receipt
contract, scanner pipeline, Agent drawer pulse, provider-neutral card safety).
Those remain valid historical software evidence. They do **not** override the
2026-08-16 overall **BLOCKED** production verdict or the new Chunk 1–6 code
sequence.

### Historical notes retained below for audit trail

Local Agent client/service, private-LAN hardening, RAW spooler, receipt v2,
exact barcode lookup, provider-neutral Card boundary, till open/close, and
device-scoped printer configuration exist in software.

Physical POS80 development paper was observed historically; release PR-* rows
remain incomplete. The automatic Cash Sale drawer path was physically accepted
on 2026-08-17 after resolving emulator clock drift; untested drawer scenarios
remain open. Card provider remains absent.

## Final Completion Checklist

| Check | Status |
|---|---|
| Production architecture/security documented | Yes (2026-08-16) |
| Required application implementation | Incomplete for physical/deployment |
| Automated suites | Partial |
| Physical acceptance | Cash Sale drawer path passed; other required hardware rows incomplete |
| Local Agent production service acceptance | Incomplete |
| External provider decisions | Terminal out of current release |
| May mark Completed / production-ready | **No** |

## Related Files

- [[POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
- [[../../../12_INTEGRATIONS/Receipt_Printer_Integration]]
- [[../../../12_INTEGRATIONS/Barcode_Scanner_Integration]]
- [[../../../12_INTEGRATIONS/Cash_Drawer_Integration]]
- [[../../../12_INTEGRATIONS/Card_Reader_Integration]]
- [[../../../12_INTEGRATIONS/Local_Print_Agent]]
- [[Cash_Drawer_Runtime_Integration_Issue_Resolution_2026-08-17]]
