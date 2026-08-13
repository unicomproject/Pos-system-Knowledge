<!-- title: Hardware Operations, Till Session & Cash Control Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-13 -->

# Hardware Operations, Till Session & Cash Control Functional Rules

## Purpose

Defines business and UX rules for `Hardware_Till_Cash_Control` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- Till session is required for POS sale, payment, receipt, and cash movements.
- Cash movement amount is positive and uses a movement type.
- Cash reconciliation records expected cash, counted cash, and variance.
- Physical communication is handled by Flutter/local device code. A hardware test must not be reported as logged because no complete Cashier test-log API chain is currently implemented.
- Cash drawer open requires permission, till context, and audit.
- Local printer access must be device-configured, API-key authenticated, CIDR
  allow-listed, and limited to the trusted private LAN.
- A timeout after print submission is an unknown outcome. Do not silently resend.
- Manual printer tests must be labelled non-sale and must not create a sale,
  payment, receipt record, or completed-sale print audit.

## Hardware Readiness Rules

- **Assignment Source**: Hardware assignments must target exactly one Till or POS device via normalized `hardware_device_assignments`.
- **Last-seen Source**: The live monitoring Last Activity should primarily come from the assigned POS device activity (`pos_devices.last_seen_at`), not static Till timestamps.
- **Latest Test Result**: Hardware test success/failure must be derived from `hardware_test_logs`.
- **Warning/Error Rules**: A hardware device in warning (e.g., low paper) or error (e.g., disconnected) state contributes to the "Needs Attention" status of the Till.
- **Alert Limitation**: Do not invent a `hardware_alerts` table. Alerts must be derived from missing assignments, offline devices, or failed `hardware_test_logs`.
- **Current vs Planned Implementation**: The current backend implementation relies mostly on flat Till fields (`printerName`, `scannerName`). The planned implementation requires proper assignment checks, heartbeats, and test log resolution to support live readiness monitoring.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Cash In/Cash Drop forms are currently frontend-only and must not show a
  persisted-success outcome until a backend mutation succeeds.
- Cash Drawer main screen must follow [[06_Cash_Drawer_Feature]] and
  [[../../08_FLUTTER_POS_KNOWLEDGE/Flutter_Cash_Drawer_Management_Implementation_Specification]]:
  title inside white content card, no back-arrow / Continue-to-Dashboard,
  bottom nav available, orange/black Cashier POS tokens via shared theme only,
  Phone + Tablet + Desktop.
- Open Drawer is hardware-only and must not create financial movements.
- Expected Cash is backend-authoritative; Flutter totals are preview only.
- Scanner/printer package or adapter presence is not physical verification.
- Hardware Testing must show Local Agent unreachable, unauthorized, incompatible
  contract, printer unavailable, and ready states without exposing the API key.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.
- **Open Till** is online backend-authoritative. Do not fake OPEN offline, claim
  local-only success, or let the cashier operate as if a till was opened without
  backend confirmation. Cached current-session restore applies only to an already
  confirmed OPEN session. See [[04_Open_Till_Feature]].
- **Close Till** is online backend-authoritative. Expected Cash is calculated by
  the backend from canonical session cash activity; Flutter supplies Counted Cash,
  an approved variance reason when required and an optional note. Session close,
  `cash_reconciliations` and CLOSED event commit atomically. Current code does not
  yet meet the first and reconciliation requirements. See [[05_Close_Till_Feature]].
- **Cash In / Cash Out / Cash Drop** are online backend-authoritative until an
  approved offline cash-control contract exists. Do not silently queue high-risk
  cash-control mutations. See [[06_Cash_Drawer_Feature]].

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Full accounting ledger
- Bank deposit workflow
- Supplier payment handling
- Customer online checkout UI

## Related Files

- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/04_Open_Till_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/05_Close_Till_Feature]]
- [[04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/06_Cash_Drawer_Feature]]


## Tenant Admin Till Hardware Functional Rules Addendum (2026-08-01)

### Monitoring vs physical I/O

Tenant Admin is monitoring/management only. Physical I/O is native POS / local agent only.

### Assignment models

Model A (Hardware → Till) and Model B (Hardware → POS Device → Till) are both approved. Lookup must merge active assignments and exclude released/cross-tenant rows.

### Status honesty

Configured, assigned, connected, and healthy are separate. Do not treat flat Till `printerName`/`scannerName` strings as connection proof.

**Correction to "Current vs Planned" above:** Backend now exposes `GET .../hardware-readiness` over normalized assignment tables for **direct Till assignments**. Flat fields still exist on Till create/update/detail and remain non-authoritative for readiness. Inventory/assignment mutation APIs, POS-device merge, peripheral heartbeat, and derived alerts remain incomplete.

### MVP alerts

Derived only — no `hardware_alerts` table for MVP.

Canonical architecture: [[../../12_INTEGRATIONS/POS_Hardware_Integration]].
