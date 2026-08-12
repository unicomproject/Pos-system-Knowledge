<!-- title: Hardware Operations, Till Session & Cash Control Technical Contract -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-12 -->

# Hardware Operations, Till Session & Cash Control Technical Contract

## Purpose

Defines the implementation contract for `Hardware_Till_Cash_Control`. This contract is based on
new OneVerz POS MVP scope images and the uploaded Unified Commerce database design.

## API Contract

| Area | Contract |
|---|---|
| API groups | `/api/v1/tills/current-session`, `/api/v1/tills/open`, `/api/v1/tills/close` |
| Request format | Typed request DTOs; no raw map payloads in application layer |
| Response format | Typed response DTOs with safe fields only |
| Error format | Standard API error response |
| Tenant context | Resolved server-side for tenant-owned records |
| Auth | Staff/customer/platform auth boundary must match module surface |

## API Groups

| API Group | Purpose |
|---|---|
| `/api/v1/tills/current-session` | Resolve the assigned open till session |
| `/api/v1/tills/open` | Open the assigned till with opening float |
| `/api/v1/tills/close` | Close the open session with counted cash and variance reason |
| Cash movement / hardware test | No verified Cashier mutation API currently exists |

### Open Till reuse clarification — 2026-08-11

Open Till reuses the existing groups above plus `GET /api/v1/devices/current`.
No new endpoint, table, attribute, permission or migration is required for the
Open Till screen. Full contract: [[04_Open_Till_Feature]].

Known audit gap (not blocking API reuse): Open Till does not currently write
`till_session_events` `OPENED`; Close Till does write `CLOSED`.

### Close Till production clarification — 2026-08-11

Close Till reuses current-session and close routes, `pos.till.close`, and the
existing schema. The current repository trusts request `ExpectedCash` (fallback:
opening float) and omits `cash_reconciliations`; therefore close is production
blocked. Target: calculate expected cash server-side and atomically write the
closed session, one reconciliation and one CLOSED event. Full contract:
[[05_Close_Till_Feature]].

## Database Contract

| Table | Contract |
|---|---|
| `hardware_devices` | Used by this module |
| `hardware_device_assignments` | Used by this module |
| `hardware_test_logs` | Used by this module |
| `till_sessions` | Used by this module |
| `till_cash_movements` | Canonical cash-movement table; existing writes are partial and cashier mutation API is absent |
| `cash_reconciliations` | Schema exists; current Close Till write is missing |
| `cash_count_denominations` | Used by this module |

## Hardware Readiness UI Mapping

| UI Field | Source / Derivation |
|---|---|
| Hardware Type | `hardware_devices.type` (e.g. Scanner, Printer, Cash Drawer) |
| Device Name | `hardware_devices.name` |
| Connection Status | Derived from heartbeat logic, `pos_devices.last_seen_at`, and `hardware_test_logs.status`. |
| Last Seen | `pos_devices.last_seen_at` of the POS device hosting the hardware. |
| Warning / Error | Derived from missing assignments, offline host device, or failed `hardware_test_logs`. |
| Latest Test Result | Latest `hardware_test_logs` entry for the device. |

Entity mappings must preserve exact table names, column names, tenant foreign keys,
unique constraints, CHECK constraints, hash-only token rules, and append-only
history/ledger behavior where applicable.

## Frontend Contract

- Use feature-owned folders and typed services/providers.
- Widgets/components must not call HTTP APIs directly.
- Flutter stores printer configuration per activated device; the Local Agent
  URL and timeout are configuration, while its API key uses secure storage.
- Local Agent HTTP belongs in the printer client/adapter, not widgets or sale
  business logic.
- Use DTOs in data layer, domain/view models in UI layer.
- Permission and entitlement checks are UX helpers only; backend remains final authority.
- Browser online store and Flutter business app must share backend rules but keep separate user/auth surfaces.

## Backend Contract

- Controllers stay thin.
- Application services own use cases.
- Domain entities/value objects hold stable business invariants.
- Repository interfaces stay in application layer; EF implementations stay in infrastructure layer.
- Audit/event rows are written for sensitive state changes.
- Idempotency keys are required for retryable commands that can create duplicates.
- `E_POS.LocalPrintAgent` is a separate Windows service boundary, not an
  `E_POS.Api` controller. It validates LAN source, API key, contract, request,
  and idempotency identity before writing RAW bytes to the Windows spooler.
- Local Agent operation state must survive restart and distinguish completed,
  failed-confirmed, and unknown outcomes.

## Permission And Entitlement Contract

- Permission codes must be database-seeded and module-scoped.
- Do not create one giant global enum as the source of truth.
- Tenant feature entitlement must be checked before tenant staff permission where the feature is plan-controlled.
- Customer-facing actions use customer account/session rules, not tenant staff role permissions.

## Test Contract

Test coverage must include:

- Happy path for each primary API group.
- Missing authentication.
- Permission denied or customer access denied.
- Feature disabled / entitlement missing.
- Tenant isolation failure.
- Validation failure.
- Duplicate/conflict behavior.
- Safe error display.
- Audit/event/history creation where required.
- Offline/cache behavior where this module touches POS, checkout, order, inventory, payment, or sync.
- Byte-order tests must prove footer → feed → optional cut and no printable
  content after cut for 58 mm and 80 mm.

## Implementation Sequence

1. Confirm scope and table coverage from this module file.
2. Create DTOs, validators, and application service methods.
3. Create repository interface and EF repository/mapping if missing.
4. Add entitlement, permission, tenant, outlet, till, device, customer, or offline checks as relevant.
5. Build frontend route/screen/component/provider/service.
6. Add loading, empty, error, denied, feature-disabled, offline, and conflict states.
7. Add unit/integration/API/widget tests.
8. Review against new OneVerz POS MVP module boundaries.

## Out Of Scope

- Full accounting ledger
- Bank deposit workflow
- Supplier payment handling
- Customer online checkout UI

## Related Files

- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/02_Functional_Rules]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]

## Barcode scanner device contract (2026-07-29)

`hardware_devices.config_json` remains authoritative device-scoped storage.
Scanner settings cover enabled state, `usbHid` or `camera` mode, Enter/newline
suffix, 20-1000 ms timeout, 1-512 character range, rapid-scan policy,
camera-enabled flag and enabled formats. Existing version, assignment,
trusted-device, outlet/till and active-session audit rules apply.

Scanner tests reuse `hardware_test_logs`; `result_payload_json` stores only
privacy-safe typed evidence and `(tenant_id, request_id)` remains idempotent.

## Tenant Admin Till Hardware Technical Contract Addendum (2026-08-01)

### API groups (actual Tenant Admin Till routes)

| Method | Route | Status |
|---|---|---|
| GET | `/api/v1/tenant-admin/tills` | List with monitoring fields (`currentCashierName`, `lastDeviceSeenAt`, `operationalStatus`, `displayStatus`, `needsAttention`, …) — **PARTIALLY COMPLETED** |
| GET | `/api/v1/tenant-admin/tills/summary` | Summary counts — **COMPLETED** (verify Offline mapping vs product intent; code currently maps offline count to inactive in repository — known risk) |
| GET | `/api/v1/tenant-admin/tills/{id}` | Detail including flat legacy hardware name fields — **PARTIALLY COMPLETED** |
| GET | `/api/v1/tenant-admin/tills/{id}/hardware-readiness` | Normalized connections for Till — **PARTIALLY COMPLETED** (direct Till assignments only; no alertCount) |
| POST | `/api/v1/devices/heartbeat` | POS device heartbeat — **COMPLETED** |
| POST | hardware peripheral heartbeat | **NOT IMPLEMENTED** |
| GET/POST | `/api/v1/tenant-admin/hardware-devices` | **NOT IMPLEMENTED** (approved capability when built) |
| POST | `/api/v1/tenant-admin/tills/{tillId}/hardware-assignments` | **NOT IMPLEMENTED** (approved capability) |
| POST | `/api/v1/tenant-admin/hardware-assignments/{assignmentId}/release` | **NOT IMPLEMENTED** (approved capability) |

Do not document a new endpoint when an existing route already performs the same action. Prefer extending `GET .../tills/{id}` **or** keeping `.../hardware-readiness` as the related read without a second incompatible JSON contract.

### Hardware connection read model (actual DTO fields)

`TenantAdminHardwareConnectionResponse`:

- `hardwareDeviceId`, `hardwareDeviceName`, `hardwareDeviceType`, `hardwareDeviceCode`
- `operationalStatus` (currently hardware lifecycle/status string)
- `connectionStatus`, `lastTestStatus`, `lastTestAt`, `lastSeenAt`

Approved future additive fields where needed: assignment ID, connection type, manufacturer, model, health status, warning code/message, alertCount on parent response.

### Database tables used

Unchanged module tables: `hardware_devices`, `hardware_device_assignments`, `hardware_test_logs`, `till_sessions`, plus foundation `tills`, `pos_devices`, `till_device_assignments`.

No MVP requirement for dedicated `hardware_alerts` table.

### Frontend monitoring rule

Tenant Admin Flutter must bind real readiness data; empty list is valid; never mock connections from the reference image.

Canonical architecture: [[../../12_INTEGRATIONS/POS_Hardware_Integration]].
