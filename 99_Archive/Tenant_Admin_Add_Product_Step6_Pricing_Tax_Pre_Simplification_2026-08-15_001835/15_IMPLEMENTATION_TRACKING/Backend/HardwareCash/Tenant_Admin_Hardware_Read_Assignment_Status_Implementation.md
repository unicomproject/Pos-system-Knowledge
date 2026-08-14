<!-- title: Tenant Admin Hardware Read Assignment Status Implementation -->
<!-- status: Implemented (physical verification pending) -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-08-01 -->

# Tenant Admin Hardware Read / Assignment Implementation Status

## Status (2026-08-01 implementation)

Backend hardware inventory, assignment, readiness enrichment, peripheral heartbeat and test-result reporting are implemented in Unified-Commerce. Physical device verification remains **PHYSICAL VERIFICATION PENDING**.

## Completed

| Capability | Status |
|---|---|
| `GET .../tills/{id}/hardware-readiness` enriched | **COMPLETED** |
| `tenant.hardware.view` enforced on readiness | **COMPLETED** |
| Cashier / POS device / lastActivity / attentionReasons / alertCount | **COMPLETED** |
| Merge Till + POS-device hardware assignments + dedupe | **COMPLETED** |
| Canonical `HardwareConnectionStatusResolver` | **COMPLETED** |
| Offline ≠ Inactive summary/list | **COMPLETED** |
| `GET/POST /api/v1/tenant-admin/hardware-devices` | **COMPLETED** |
| Till / POS-device assignment + release | **COMPLETED** |
| `POST /api/v1/pos/devices/{id}/hardware-heartbeat` | **COMPLETED** (API; not physical-verified) |
| `POST /api/v1/pos/hardware-tests` | **COMPLETED** (API; not physical-verified) |
| Unit + PostgreSQL translation tests | **COMPLETED** |
| Live API verification (Oneverce) | **COMPLETED** |

## Physical verification

**PHYSICAL VERIFICATION PENDING** — no native POS printer/scanner/drawer/card-reader test was run.

## Routes

Reuse:
- `GET /api/v1/tenant-admin/tills/{id}/hardware-readiness`
- `GET /api/v1/tenant-admin/tills/summary`
- `POST /api/v1/devices/heartbeat` (POS device)

Added:
- `GET/POST /api/v1/tenant-admin/hardware-devices`
- `GET /api/v1/tenant-admin/hardware-devices/{id}`
- `POST /api/v1/tenant-admin/tills/{tillId}/hardware-assignments`
- `POST /api/v1/tenant-admin/pos-devices/{posDeviceId}/hardware-assignments`
- `POST /api/v1/tenant-admin/hardware-assignments/{assignmentId}/release`
- `POST /api/v1/pos/devices/{posDeviceId}/hardware-heartbeat`
- `POST /api/v1/pos/hardware-tests`

## Migrations

None. Existing `hardware_devices` / `hardware_device_assignments` / `hardware_test_logs` reused.

## Live verification notes (Oneverce)

- Summary after Offline fix: total=5, online=0, offline=5, inactive=0, needsAttention=5
- Empty readiness returns 200 with connections=[] and derived attentionReasons
- Register → assign → readiness connections=1 (UNKNOWN until heartbeat) → release → connections=0
- Duplicate assign returns 409

## Related

- [[../../../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../../99_AUDITS/2026-08-01_Tenant_Admin_Till_Hardware_Second_Brain_Audit]]
