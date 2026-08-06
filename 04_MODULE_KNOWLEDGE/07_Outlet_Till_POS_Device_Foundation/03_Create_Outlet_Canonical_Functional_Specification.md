# 03 Create Outlet Canonical Functional Specification

> Last Verified Date: 2026-08-06
> Source basis: OneVerz Create Outlet Journey specification

## 1. Functional Scope

The Tenant Admin Create Outlet journey must support a responsive, 4-step wizard interface. The primary objective is to allow authorized administrators (`tenant.outlets.manage` permission) to register new stores and warehouses under their tenant.

### Functional Requirements List

| ID | Requirement Description | Priority | Target Status |
|---|---|---|---|
| TA-OUT-WIZ-001 | **4-Step Wizard Stepper**: Step sequence: Details → Location & Contact → Business Hours → Review & Create. | High | Implemented |
| TA-OUT-WIZ-002 | **Tenant Admin Shell Integration**: The page must run within the Tenant Admin shell and hide POS elements (till selection, cashier shifts, open session header). | Critical | Implemented |
| TA-OUT-WIZ-003 | **Unsaved Data Warnings**: Show confirmation dialog when attempting to discard a dirty form. | High | Missing (Draft) |
| TA-OUT-WIZ-004 | **State Persistence**: Preserve form parameters across steps and during recoverable validation failures. | High | Implemented |
| TA-OUT-WIZ-005 | **Auto-Generated Outlet Code**: Displays read-only preview code (`OUT-YYYY-NNNN`) matching UI mockups. | Medium | Proposed |
| TA-OUT-WIZ-006 | **Searchable Manager Selector**: Exclude cross-tenant, suspended, or inactive users. Manager selection does not auto-grant access. | High | Missing |
| TA-OUT-WIZ-007 | **Double-Click Protection**: Disable create button and show loading state on submission. | High | Implemented |
| TA-OUT-WIZ-008 | **Idempotent Create Request**: Prevent duplicate database entries using client-generated headers. | Critical | Proposed |
| TA-OUT-WIZ-009 | **Timezone Preselection**: Preselect tenant default timezone, storing canonical IANA ID. | High | Implemented |
| TA-OUT-WIZ-010 | **Central Outlet Swap Handling**: Prompt user to confirm replacing the existing central outlet when toggle is selected. | High | Proposed |
| TA-OUT-WIZ-011 | **Default Till Outlet Reference**: Dedicated option to preselect this outlet for future tills. | Medium | Proposed |
| TA-OUT-WIZ-012 | **Business Hours Timezone Note**: Explicit timezone label reminder for opening hours config. | Medium | Missing |
| TA-OUT-WIZ-013 | **24 Hours / Overnight Hours**: Day-specific status toggles allowing overnight span and 24h operational states. | High | Missing |
| TA-OUT-WIZ-014 | **Special Days & Holidays Table**: Configure specific calendar date overrides with unique date constraints. | High | Missing |
| TA-OUT-WIZ-015 | **Permission-Gated Success Actions**: Success screen next steps (Add Till, Assign Users, View Outlet) must display conditionally. | High | Missing |

---

## 2. Shared Wizard Behavior

### 2.1 Navigation & Stepper States
- The wizard stepper must visually communicate step progression:
  - **Active step**: Orange color.
  - **Completed step**: Green checkmark icon.
  - **Unvisited step**: Neutral grey style.
- Clicking prior completed steps in the stepper returns the user to that step, preserving all input.

### 2.2 Unsaved Changes Protection
- Trigger a confirmation dialog if the user clicks "Cancel" or attempts navigation away from a dirty form:
  - **Dialog Title**: `Discard outlet setup?`
  - **Message**: `Your entered information will be lost.`
  - **CTAs**: `Continue editing` (dismisses dialog), `Discard and return` (cancels wizard).

### 2.3 Success States
- Upon successful creation, show a success status summary and provide conditional, permission-gated navigation options:
  - **Add Till**: Only visible if `tenant.tills.create` permission exists.
  - **Assign Users**: Only visible if user/role assignment permission exists.
  - **View Outlet**: Only visible if `tenant.outlets.view` exists.
  - **Back to Outlets**: Default fallback.
