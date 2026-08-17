<!-- title: Receipt Printer Local Agent Implementation Status -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# Receipt Printer Local Agent Implementation Status

## Status Summary

| Item | Value |
|---|---|
| Platform | Backend / Windows Local Service |
| Module | POS Operations / Hardware |
| Feature | Windows Local Print Agent (`E_POS.LocalPrintAgent`) |
| Status | **Chunk 1 software foundation PASS** — Windows service/reboot runtime **NOT VERIFIED** |
| Completed Date | 2026-08-16 (software) |
| PR / Commit | Current working tree |
| Tests | LocalPrintAgent **60** Release passed; published artifact health verified |

## Canonical production note (2026-08-16)

```text
Overall hardware: STILL BLOCKED — HARDWARE NOT PRODUCTION READY
Customer must NOT rely on daily `dotnet run` for production POS
Windows Service scripts + packaging: IMPLEMENTED
Production install → reboot → auto-start acceptance: NOT VERIFIED in this environment
```

Chunk 1 evidence:

[[../../Flutter/Hardware/POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]

Authority: [[../../../12_INTEGRATIONS/Local_Print_Agent]] ·
[[../../Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]

## Feature Summary

A separate Windows process/service exposes a laptop USB receipt printer (and
drawer kick) to an activated Flutter POS over a restricted private LAN. It
validates source network, local API key, contract, receipt/drawer data, and
request identity before generating ESC/POS and sending RAW bytes to the Windows
spooler.

## Production packaging

| Item | Value |
|---|---|
| Publish model | `dotnet publish -c Release -r win-x64 --self-contained` |
| Runtime | win-x64 |
| Output | `artifacts/local-print-agent/publish` |
| Self-contained | YES |
| Single file | NO (dependency-friendly) |
| Install | `scripts/local-print-agent/install-print-agent.ps1` |
| Update | `update-print-agent.ps1` (preserves config + env key) |
| Uninstall | `uninstall-print-agent.ps1` (preserves ProgramData unless `-DeleteOperationalData`) |

## Security (Chunk 1)

- `X-Local-Print-Key` via service environment (not appsettings JSON)
- Empty / placeholder / low-entropy keys fail closed at startup
- CIDR allow-list required; invalid CIDR fails validation
- Loopback-only → bind `127.0.0.1`, skip inbound firewall
- LAN → bind `0.0.0.0`, Private-profile firewall scoped to CIDR + program
- Logs sanitize; key never logged
- HTTPS optional via `-UseHttps` (Android release requires HTTPS)

## Drawer safety

Drawer requests require fresh `requestedAt` (default max age 120s). Duplicate
request IDs are idempotent. Stale delayed pulses are rejected.

## Related Files

- [[../../../12_INTEGRATIONS/Local_Print_Agent]]
- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../../Flutter/Hardware/POS_Hardware_Chunk_1_Local_Print_Agent_Production_Foundation_2026-08-16]]
- [[../../Flutter/Hardware/POS_Hardware_Production_Readiness_Canonicalization_2026-08-16]]
