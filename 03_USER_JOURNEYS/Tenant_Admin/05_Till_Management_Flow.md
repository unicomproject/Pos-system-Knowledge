<!-- title: Tenant Admin Till Management Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-06-30 -->

# Tenant Admin Till Management Flow

## Purpose

Defines how the Tenant Admin monitors and manages tills, including viewing till status, hardware readiness, and basic till creation/editing.

## Actor

Tenant Admin

## Source

Approved Till Monitoring UI design and TM-EPOS MVP Second Brain scope.

## Trigger

Tenant Admin navigates to the Tills monitoring page from the sidebar.

## Preconditions

- Tenant Admin has `tenant.tills.view` or `tenant.tills.manage` permission.
- At least one outlet exists.

## Main Flow (Monitoring & Management)

| Step | Action | System Behavior |
|---:|---|---|
| 1 | Navigate to Tills | System displays the Tills page with a summary and till list. |
| 2 | View Summary | System displays Total, Online, and Offline till percentages and counts based on heartbeat logic. |
| 3 | Filter/Search Tills | Tenant Admin searches by name, code, outlet, cashier, or filters by status (Online, Offline, Needs Attention, Inactive). |
| 4 | Desktop Till Selection | Tenant Admin selects a till from the list; the right-hand detail panel updates with the selected till's information. |
| 5 | View Till Details | System displays Till name, code, outlet, operational status, and Last Activity. |
| 6 | View Current Cashier | System resolves and displays the current cashier from the active, open till session. |
| 7 | View Hardware Readiness | System displays connected hardware (scanner, printer, drawer, card reader) and their status. |
| 8 | View Alerts | Tenant Admin clicks "View Alerts" to see a complete list of hardware warnings and system alerts for the till. |
| 9 | Add New Till | Tenant Admin clicks "New Till" to open the creation flow. System validates unique code and assigns to an outlet. |
| 10 | Edit Till | Tenant Admin edits till details or lifecycle status (Active/Inactive/Maintenance). |

## Mobile Behavior

- Does not use a two-column layout.
- The Till list is displayed first.
- Selecting a Till opens its details in a separate route or full-screen page.

## Data Used Or Captured

- Till name, Till code
- Outlet
- Lifecycle status (Active, Inactive, Maintenance, Deleted)
- Operational status (Online, Offline, Needs Attention)
- Current Cashier (Resolved from Open Till Session)
- Last Activity (Resolved from POS Device last_seen_at)
- Hardware Connections (Scanner, Printer, Drawer, Card Reader)
- Hardware Alerts and warnings

## Access And Security Rules

- `tenant.tills.view` or `tenant.tills.manage` required to view the page and list.
- `tenant.tills.details.view` or general view/manage required for detail panel.
- `tenant.tills.create`, `tenant.tills.update`, `tenant.tills.delete` required for modifications.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Device binding and hardware management are linked but separate flows.
- Cashier open/close shift is a separate flow.

## Validation And Error Cases

- Missing device assignment (triggers "Needs Attention" or "Offline").
- Stale heartbeat (triggers "Offline").
- Hardware disconnected or failed test (triggers "Needs Attention" or hardware warning).
- No current open till session (Current cashier displays as "—").
- Duplicate till code during creation.
- Invalid outlet.
- Permission denied.

## Outcome

Tenant Admin has a real-time overview of all tills, their operational status, current cashiers, and hardware readiness. Tills can be created, updated, or deactivated.

## Related Modules

- 07_Outlet_Till_POS_Device_Foundation
- 08_Hardware_Till_Cash_Control

## Related Files

- [[08_Outlet_Till_And_POS_Device_Foundation_UPDATED]]
- [[Tenant_Admin_Till_Monitoring_UI]]


## Documentation Update 2026-08-01 — Final Till Split-View + Hardware Monitoring Architecture

### Final UI decision

Desktop Till Monitoring uses approved split-view (left list ~65–70%, right details ~30–35%). Full-width list-only desktop is **DEPRECATED** as the final design. Shared shell (black header, white sidebar, black footer, OneVerz branding) remains unchanged. Selection uses stable Till ID (`selectedTillId`).

### Hardware architecture (mandatory)

Tenant Admin does **not** talk to physical hardware. Native POS / local agent performs connection, test, and heartbeat; Backend stores trusted state; Tenant Admin monitors.

See [[../../12_INTEGRATIONS/POS_Hardware_Integration]] and [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]].

### Cashier / Last activity

- Cashier: open `till_sessions` → `opened_by_tenant_user_id` → display name; else Unassigned / —.
- Last activity: Backend `lastDeviceSeenAt` (POS device last-seen); else "No recent activity".

### Implementation honesty

Journey steps 6–8 (cashier, hardware readiness, alerts) remain the **target** UX. As of 2026-08-01: split-view UI is partially present; summary/list bind to real Backend; hardware card often empty ("No hardware connections found"); alerts and peripheral heartbeat are not complete. Do not treat UI appearance as COMPLETED physical integration.
