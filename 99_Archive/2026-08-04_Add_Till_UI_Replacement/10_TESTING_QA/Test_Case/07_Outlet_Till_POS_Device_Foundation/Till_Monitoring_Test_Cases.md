<!-- title: Till Monitoring Test Cases -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-31 -->

# Till Monitoring Test Cases

## Purpose

Defines QA and automated test scenarios for the Tenant Admin Till Monitoring UI and underlying APIs.

## Test Cases

### 1. Summary & Counters
- **Summary count accuracy**: Verify Total, Online, and Offline counts match the actual data returned by the API.
- **Zero-total percentage handling**: Verify no divide-by-zero errors occur when Total Tills = 0 (percentages should gracefully show 0%).

### 2. Search & Filtering
- **Search by Till name**: Verify list filters correctly when partial/full till name is entered.
- **Search by Till code**: Verify list filters correctly when till code is entered.
- **Search by outlet**: Verify list filters correctly when outlet name is searched.
- **Search by current cashier**: Verify list filters correctly when a current cashier's name is searched.
- **Online filter**: Verify only tills with an active assignment and valid heartbeat are shown.
- **Offline filter**: Verify only tills without an active device, or with a stale heartbeat, are shown.
- **Inactive filter**: Verify only tills with lifecycle status `Inactive` are shown.
- **Needs Attention filter**: Verify tills with missing hardware, warnings, or failed tests are shown.

### 3. Layout & Navigation
- **Desktop Till selection**: Verify selecting a Till on a wide screen updates the right-hand master-detail panel without full page reload.
- **Mobile detail navigation**: Verify selecting a Till on a narrow screen navigates to the full detail view and back navigation works.
- **Responsive layouts**: Verify the layout transitions from master-detail to vertical stack gracefully at breakpoints without horizontal scrolling.

### 4. Data Resolution & Business Logic
- **No current cashier**: Verify Till displays "—" for cashier when there is no open till session.
- **Missing device assignment**: Verify Till shows "Needs Attention" or "Offline" if `ACTIVE` but lacks a POS device assignment.
- **Stale heartbeat**: Verify Till transitions to "Offline" if the POS device's `last_seen_at` exceeds the 5-minute threshold.

### 5. Hardware Readiness
- **Hardware connected**: Verify connected scanner/printer/drawer/card reader show as Online with recent test results.
- **Hardware warning**: Verify UI displays a warning state (e.g., paper low UI example) if reported by the test log.
- **Hardware failed**: Verify UI displays a failed/error state and flags the Till as "Needs Attention".
- **No hardware permission**: Verify users without `tenant.hardware.view` or `tenant.hardware.manage` cannot see or interact with hardware details.

### 6. Security & Isolation
- **Tenant isolation**: Verify a Tenant Admin can only see tills belonging to their own tenant.
- **Outlet isolation**: Verify an Outlet Manager (if given access) can only see tills for their assigned outlet.

### 7. UX & States
- **API failure**: Verify a safe error message and retry button appear when the API returns 500 or timeout.
- **Empty state**: Verify clear messaging and "Add New Till" CTA appear when no tills exist.
- **Refresh state**: Verify pull-to-refresh (mobile) and refresh button (desktop) reload data without losing the currently selected Till (if it still exists).
- **Pagination**: Verify scrolling or clicking next page loads the subsequent batch of Tills correctly.

### 8. Accessibility
- **Keyboard navigation**: Verify Tab and Enter keys can navigate the Till list, select a Till, and trigger hardware actions.
- **Screen-reader labels**: Verify icon-only buttons (like refresh, add) and status badges have descriptive `aria-labels` or Semantics applied.

## Related Files
- [[../../03_USER_JOURNEYS/Tenant_Admin/05_Till_Management_Flow]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_Till_Monitoring_UI]]


## Hardware Integration Test Expansion (2026-08-01)

Add Backend coverage for:

- Direct Till hardware assignment
- POS-device hardware assignment
- Combination + duplicate removal
- Released assignment excluded
- Different tenant excluded
- Invalid outlet rejected
- Missing hardware returns empty list
- Expired heartbeat → disconnected
- Current heartbeat → connected
- Latest warning → Needs Attention
- Permission denied / entitlement denied
- RLS isolation
- Assignment conflict
- Test-result history append-only

Add Flutter coverage for:

- Selected Till hardware rendering; selection reload; clear stale data
- Assigned / not-assigned / no-hardware states
- Connected / Disconnected / Needs Attention / warning message / alert count
- Permission denied; API error + Retry
- Null cashier / null activity
- Tablet / mobile layouts; no RangeError on empty selection

Physical verification checklist:

- Native app connects to network printer; test page prints; status reaches Backend; Tenant Admin card Connected; disconnect updates; warning updates; scanner/drawer/card reader where supported

Do not mark physical items COMPLETED without device evidence.
