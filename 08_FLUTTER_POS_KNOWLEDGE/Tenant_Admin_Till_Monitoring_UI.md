<!-- title: Tenant Admin Till Monitoring UI -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-08-01 -->

# Tenant Admin Till Monitoring UI

## Purpose

Defines the UI and UX rules for the Tenant Admin Till Monitoring screen, separating it from standard Till CRUD and highlighting operational status, hardware readiness monitoring, and current cashier information.

## Final UI Decision (Approved 2026-08-01)

The Tenant Admin Tills page **must** follow the approved desktop split-view design.

The previous full-width list-only implementation is **incomplete** and is **not** the final approved desktop design. Mark any documentation that still describes list-only desktop as **DEPRECATED** for desktop layout.

### Desktop layout

**LEFT (approximately 65%–70%):**

- Page title and description
- Total Tills summary
- Online summary
- Offline summary
- Search
- All / Online / Offline / Needs Attention filters
- Till list
- Pagination or result count

**RIGHT (approximately 30%–35%):**

- Selected Till icon and name
- Till status
- Outlet
- Assigned cashier
- Last activity
- Assigned POS device (when available from Backend)
- Hardware connections
- Hardware health warnings
- Active hardware alerts
- View Alerts action (only when real alert count &gt; 0)

### Application shell (unchanged)

- Tenant Admin black header
- Tenant Admin white/light sidebar
- Main content container
- Fixed black footer navigation
- OneVerz POS branding

### Selection rules

- Till selection uses a stable `selectedTillId` (Till ID), not a list index.
- When Till records exist on desktop: the first valid Till may be selected automatically; the selected row is highlighted; clicking another Till updates the right panel without full page reload.
- When no Till is available: `selectedTillId` must be null; no fake Till details; no index-zero access.

## Shared Shell Behaviour

- **Header**: Fixed black header. Does not use mock data; must reflect actual authenticated Tenant Admin context.
- **Sidebar**: White/light Tenant Admin sidebar. "Tills" is the active item.
- **Footer**: Fixed black footer navigation. Route-aware.

## Desktop Master-Detail Behaviour

- On desktop and usable wide tablets, left list + right details are visible together.
- Selecting a Till updates the right panel only.
- Summary cards remain full-width above the split where implemented.

## Tablet Behaviour

- Prefer a narrow split view where usable.
- Otherwise the right panel may open as a side drawer.
- Do not squeeze the desktop panel into an unusable width.

## Mobile Behaviour

- Till list displayed full width.
- Selected Till details open on a separate detail route (approved: `/tenant-admin/tills/:id`) or approved modal.
- Fixed black footer navigation remains.

## Summary Cards

Display real Backend summary values only (never reference-image sample values):

- **Total Tills** ← `totalTills`
- **Online** ← `onlineTills`
- **Offline** ← `offlineTills`

Safe percentage rule when UI shows percentages:

- `onlinePercentage = totalTills == 0 ? 0 : onlineTills / totalTills * 100`
- `offlinePercentage = totalTills == 0 ? 0 : offlineTills / totalTills * 100`

Retain inactive and needs-attention API values for badges/filters even if not primary cards.

**Evidence note (2026-08-01):** Live tenant example observed as Total 6 / Online 0 / Offline 1 — these come from Backend, not UI mocks.

## Search and Filters

- Search: Till name, Till code, Outlet name, Current cashier name (cashier search requires Backend support).
- Filters: All, Online, Offline, Needs Attention.
- Inactive lifecycle filter may remain as advanced/retained filter.

## Till List Row

- Till name and Till code
- Operational / display badge (Online, Offline, Needs Attention)
- Outlet name
- Current cashier (open till session; fallback "Unassigned" or "—")
- Last activity
- Selected highlight
- Open-detail action on mobile

## Selected Till Panel

For the currently selected Till:

- Till name and Till code
- Operational status badge
- Outlet name
- Current cashier
- Last activity timestamp
- Hardware connections section
- Hardware alert count
- "View Alerts" only when real active alerts exist

## Hardware Connections Card (Monitoring Only)

**Architecture rule:** The Tenant Admin browser must **not** connect directly to a physical printer, scanner, cash drawer, or card reader.

Physical connection, testing, and heartbeat reporting happen on:

- Android native Flutter POS application
- Windows native Flutter POS application
- Or an approved local hardware bridge/agent

Tenant Admin reads trusted Backend assignment / heartbeat / health / warning / alert information and displays it.

### Display slots (UI categories, not invented records)

Supported category slots may be rendered for:

- Scanner
- Receipt Printer
- Cash Drawer
- Card Reader

Assignment and status **must** come from real Backend data (`hardwareConnections[]` / readiness endpoint).

Do **not** hardcode four devices as existing records.
Do **not** copy Connected / paper-low sample values from the reference image.

| Assigned state | Display |
|---|---|
| Assigned | Type, device/model name, connection status, warning, detail action where supported |
| Not assigned | Type + Not assigned |
| No hardware rows | No hardware assigned / No hardware connections found |
| Manage permission | Assign Hardware action (when assignment API exists) |
| Hardware permission denied | Hardware permission-restricted state; Till page must not fail entirely |

Configured, assigned, connected, and healthy are **separate** states.

## Loading / Empty / Error / Permission States

- Skeleton loaders for summary, list, and detail panel.
- Empty: no tills — CTA to add till if permitted.
- Error: safe message + Retry; no raw traces.
- Missing `tenant.tills.view` / manage: access denied for page.
- Missing `tenant.hardware.view`: show restricted hardware section; keep permitted Till info visible.

## Data Binding (Flutter)

Required layers:

- Remote datasource
- Repository
- DTO
- Domain model
- `selectedTillId` provider
- Till detail / hardware readiness provider
- Hardware connection model
- Hardware alert model
- Right-side panel widget
- Loading / empty / error / permission states

Rules:

- Reload detail when `selectedTillId` changes.
- Safely support null cashier, null POS device, null last activity, empty hardware list, unknown state, warnings, empty alerts.
- Do not silently convert parsing failures into an empty hardware list.
- Do not use mock hardware records.
- Do not hardcode Connected in the UI.

### Current Backend field names (list/detail)

List/detail include (among others): `tillId`, `tillName`, `tillCode`, `outletId`, `outletName`, `status`, `operationalStatus`, `displayStatus`, `needsAttention`, `currentCashierName`, `lastDeviceSeenAt`, `hasActiveAssignment`, flat legacy `printerName` / `scannerName` / `cashDrawerName` / `cardReaderName`.

### Hardware readiness endpoint (related read)

`GET /api/v1/tenant-admin/tills/{id}/hardware-readiness`

Connection fields: `hardwareDeviceId`, `hardwareDeviceName`, `hardwareDeviceType`, `hardwareDeviceCode`, `operationalStatus`, `connectionStatus`, `lastTestStatus`, `lastTestAt`, `lastSeenAt`.

Preferred long-term: embed hardware connections into `GET /api/v1/tenant-admin/tills/{id}` **or** keep the related readiness route as the approved related read — do not invent a second incompatible JSON shape.

## Routing

- Desktop: `/tenant-admin/tills` (list + side panel)
- Mobile: `/tenant-admin/tills` → `/tenant-admin/tills/:id`

## Current Implementation Status (Evidence-Based, 2026-08-01)

| Area | Status |
|---|---|
| Desktop split-view UI shell | **PARTIALLY COMPLETED** — layout implemented in Flutter (`till_monitoring_workspace.dart`, side panel, row selection by ID) |
| Till summary/list Backend binding | **COMPLETED** (real summary/list; values not from reference image) |
| Selected Till details (cashier/activity from readiness) | **PARTIALLY COMPLETED** — panel exists; readiness DTO currently lacks cashier/activity; mapper leaves them null / incomplete |
| Hardware monitoring card | **PARTIALLY COMPLETED** — empty state "No hardware connections found" when Backend returns empty assignments |
| Hardware registration / assignment APIs | **NOT IMPLEMENTED** (no Tenant Admin hardware-devices CRUD controller found) |
| POS / hardware heartbeat for peripherals | **NOT IMPLEMENTED** for hardware devices; POS device heartbeat exists at `POST /api/v1/devices/heartbeat` |
| Derived hardware alerts / View Alerts | **NOT IMPLEMENTED** — Flutter hardcodes `alertCount: 0` |
| Physical network printer / drawer / card reader verification | **PHYSICAL VERIFICATION PENDING** |

## Related Files

- [[07_Tenant_Admin_UI_Rules]]
- [[../03_USER_JOURNEYS/Tenant_Admin/05_Till_Management_Flow]]
- [[../03_USER_JOURNEYS/Tenant_Admin/19_Device_Hardware_Management_Flow]]
- [[../04_MODULE_KNOWLEDGE/07_Outlet_Till_POS_Device_Foundation/03_Technical_Contract]]
- [[../04_MODULE_KNOWLEDGE/08_Hardware_Till_Cash_Control/03_Technical_Contract]]
- [[../12_INTEGRATIONS/POS_Hardware_Integration]]
- [[../15_IMPLEMENTATION_TRACKING/Flutter/Tenant_Admin/Till_Monitoring_UI_Implementation_Status]]


## Layout / binding status refinement (2026-08-01)

Code audit confirmation:

- Desktop split-view **shell** is **COMPLETED** (`Row` flex **6 : 4**, breakpoint width ≥ 1000).
- Recommended allocation ~65–70% / 30–35% remains the product guidance; implemented flex is 60/40 and is acceptable until a deliberate resize pass.
- Hardware panel **data binding** remains **PARTIALLY COMPLETED** (see Flutter side-panel tracking).
