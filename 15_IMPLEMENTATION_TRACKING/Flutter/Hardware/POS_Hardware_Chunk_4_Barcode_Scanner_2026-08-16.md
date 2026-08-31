<!-- title: POS Hardware Chunk 4 Barcode Scanner 2026-08-16 -->
<!-- status: Active — software hardened; physical acceptance pending -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-16 -->

# POS Hardware Chunk 4 — Barcode Scanner (2026-08-16)

## Final result (this session)

```text
PARTIAL — BARCODE SCANNER SOFTWARE HARDENED, PHYSICAL ACCEPTANCE PENDING
CHUNK 4 REMAINS OPEN
Overall hardware production readiness: BLOCKED
```

Emulator / unit tests are **not** physical PASS.

## Canonical release numbering

```text
Chunk 1 — Local Print Agent
Chunk 2 — Receipt Printer
Chunk 3 — Physical Cash Drawer
Chunk 4 — Barcode Scanner   ← this record
```

## Architecture (production)

```text
USB HID / Bluetooth HID (keyboard wedge) / Camera
        ↓
PosHidScannerInputService / mobile_scanner
        ↓
PosBarcodeScannerListener → canonical barcode string
        ↓
PosBarcodeScanController (FIFO, serial lookup)
        ↓
GET /api/v1/pos/products/by-barcode/{barcode}?deviceId=
        ↓
Tenant-scoped PosProductCatalog → cart add
```

## Software delivered / hardened this session

| Area | Result |
|---|---|
| USB HID wedge | Existing + Enter terminator consume |
| Bluetooth HID mode | First-class `bluetoothHid` (same wedge pipeline) |
| Camera | Existing `mobile_scanner` |
| Leading zeros | Preserved (string path) |
| `inputSuffix` enter/newline(+Tab) | Wired to HID service |
| `allowRapidScan=false` debounce | 400ms same-barcode suppression |
| Hardware Testing UI | Mode dropdown includes Bluetooth HID |
| Offline lookup | **Still missing** (online Dio only) |
| Physical USB/BT/Camera on real tablet | **NOT VERIFIED** |

## Physical acceptance matrix (this session)

| Test | Android USB HID | Android BT HID | Camera |
|---|---|---|---|
| Detected | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Scan captured | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Leading zeros | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Known product | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Unknown handled | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| One scan = one event | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Disconnect/reconnect | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

## Decision

```text
CHUNK 4 REMAINS OPEN
```

Required for CLOSE: real Android tablet + real USB HID (and/or BT/camera per mandatory scope) physical evidence.
