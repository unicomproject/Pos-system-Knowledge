<!-- title: Tenant Admin Add Till Single-Page UI -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-04 -->

# Tenant Admin Add Till Single-Page UI

## Purpose
Defines the approved single-page UI contract for creating a Till and assigning its initial hardware, replacing the deprecated four-step wizard.

## Route
`/tenant-admin/tills/add`

## Layout and Shared Shell
- **Shell:** Reuses the existing OneVerz POS Tenant Admin header, sidebar (Tills active), and fixed black footer navigation. Do NOT create a generic dashboard shell.
- **Route Guards:** Preserves existing Tenant Admin route and permission guards (`tenant.tills.create`).
- **Page Header:**
  - **Title:** Add Till
  - **Subtitle:** Create a till and connect its hardware.
- **Wizard Removal:** The four-step wizard and horizontal stepper are permanently removed.

## Section 1: Till Details (Left Card)
- **Till Name:** Required. Trimmed. Field-level validation according to Backend rules.
- **Till Code:** Required. Manually entered. Must be unique within the tenant/outlet scope. Displays 409 conflict on duplicate.
- **Assign Outlet:** Required. Filtered to active tenant-owned outlets. Changing this clears incompatible POS and hardware selections.
- **Status:** Required. (Active, Inactive, Maintenance). Active is the default. Operational statuses (Online, Offline) are derived and NOT submitted here.
- **Default Cashier:** Required in UI. Filtered to active tenant users allowed to operate POS at the selected outlet. Distinct from "Current Cashier" which is resolved from open sessions. *(Implementation Gap: Requires future database migration, no canonical property exists currently)*.
- **Opening Float:** Required. Numeric >= 0. Default currency displayed. Maps to `tills.default_opening_float_amount`. Suggested amount on till open.

## Section 2: Hardware Setup (Center/Right Card)
Uses normalized real registered records (`hardware_devices`, `hardware_device_assignments`), NOT free-text strings.
- **POS Device (Device Name):** Dropdown/searchable selector using `posDeviceId`. Filtered by outlet. Must not be assigned to another Till.
- **Scanner:** Optional selector using `hardwareDeviceId`. Filtered by scanner type and outlet.
- **Receipt Printer:** Optional selector using `hardwareDeviceId`. Filtered by printer type and outlet.
- **Cash Drawer:** Optional selector using `hardwareDeviceId`. Filtered by drawer type and outlet. Supports printer-linked behavior.
- **Card Reader:** Optional selector using `hardwareDeviceId`. Filtered by card-reader type and outlet. (No sensitive payment data stored).

## Section 3: Quick Pair & Status (Right Panel)
Dynamic panel showing cards only for selected hardware.
- **Content:** Hardware type, display name, connection/health status, last-seen context, and supported test actions (e.g., Test Scan, Print Test).
- **Truth Rule:** "CONNECTED" status requires active assignment, trusted POS identity, fresh heartbeat, and health/test state. Never hardcoded.
- **Test Actions:** Disabled/hidden before save. Actions executed by the native POS application only after creation. Tenant Admin is monitoring-only. Physical Verification Pending.

## Submission Actions (Bottom Row)
- **Cancel:** Returns to `/tenant-admin/tills`. Unsaved changes warning applies.
- **Create Till:** Validates all required fields. Disables duplicate submission. Displays Backend errors.
  - On Success: Refreshes Till list/summary and navigates back or shows success dialog.
- Orchestration (Strategy B): Submits Create Till API (`POST /api/v1/tenant-admin/tills`) -> Submits Hardware Assignments -> Refreshes.

## Responsive Design
- **Desktop:** Single-page layout (Till Details left, Hardware middle/right, Quick Pair far right). Bottom actions visible. No horizontal scrolling.
- **Tablet:** Two columns for Till Details/Hardware where space permits. Quick Pair moves below selectors if needed.
- **Mobile:** Vertically stacked (Till Details -> Hardware Setup -> Quick Pair). Cancel/Create remain accessible. No horizontal overflow.
- **Accessibility:** Keyboard navigation, visible focus state, required indicators, minimum touch targets, proper screen-reader labels. Status not reliant on color alone.

## Permissions & Entitlements
- **Till Creation:** `tenant.tills.create`. If missing, access denied.
- **Hardware Visibility:** `tenant.hardware.view`. If missing, hardware section shows truthful permission state/read-only.
- **Hardware Assignment:** `tenant.hardware.manage`. If missing, read-only status viewing.
- **Entitlement:** `till_management` (for Till CRUD), `device_hardware` (for Hardware).

## Documentation Updates
This document supersedes all references to the Add Till four-step wizard.
