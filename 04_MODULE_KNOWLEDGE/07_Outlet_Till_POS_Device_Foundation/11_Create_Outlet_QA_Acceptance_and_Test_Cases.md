# 11 Create Outlet QA Acceptance and Test Cases

> Last Verified Date: 2026-08-06
> Source basis: OneVerz QA Standards

## Test Case Registry

### QA-OUT-001: Navigation and Shell Authorization
- **Requirement ID**: TA-OUT-WIZ-002, TA-OUT-FR-009
- **Preconditions**: User has logged in.
- **User Role**: Tenant Staff without `tenant.outlets.manage` permission.
- **Input**: Navigate directly to `/tenant-admin/outlets/add`.
- **Steps**:
  1. Login with a low-privilege cashier account.
  2. Paste `/tenant-admin/outlets/add` into the browser address bar and press Enter.
- **Expected Frontend**: Displays the standard unauthorized error page ("No access to Outlets") within the Tenant Admin shell. The wizard form is not rendered.
- **Expected API Result**: Any background option queries return `403 Forbidden`.
- **Expected Database Result**: No changes.
- **Expected Audit Result**: Logged auth denial.
- **Priority**: Critical.
- **Automation Suitability**: High (E2E).

---

### QA-OUT-002: Step 1 Required Field Validations
- **Requirement ID**: TA-OUT-WIZ-001, TA-OUT-WIZ-004
- **Preconditions**: User is on Step 1 of the Create Outlet wizard.
- **User Role**: Tenant Admin with `tenant.outlets.manage` permission.
- **Input**: Empty Outlet Name, select Store, active Status.
- **Steps**:
  1. Leave the Outlet Name field empty.
  2. Select "Store" type.
  3. Click "Next".
- **Expected Frontend**: Highlights the Outlet Name field with validation error text: `Enter an outlet name.` Stepper does not advance to Step 2.
- **Expected API Result**: No request sent.
- **Expected Database Result**: No changes.
- **Priority**: High.
- **Automation Suitability**: High (Widget/Unit).

---

### QA-OUT-003: Central Outlet DESIGNATION SWAP Prompt
- **Requirement ID**: TA-OUT-WIZ-010
- **Preconditions**: Tenant already has an active outlet marked as `is_central_outlet = true`.
- **User Role**: Tenant Admin.
- **Input**: Toggle "Main / Central Outlet" to enabled.
- **Steps**:
  1. Fill in all Step 1 fields.
  2. Toggle the "Main / Central Outlet" switch on.
- **Expected Frontend**: Shows confirmation modal: `Change central outlet? Main Outlet is currently the central outlet. This change will make [Name] the new central outlet.`
- **Expected API Result**: No request sent yet (occurs on Step 4 submit).
- **Expected Database Result**: No changes.
- **Priority**: High.
- **Automation Suitability**: Medium.

---

### QA-OUT-004: Step 3 Business Hours overnight validation
- **Requirement ID**: TA-OUT-WIZ-013
- **Preconditions**: User is on Step 3 (Business Hours).
- **User Role**: Tenant Admin.
- **Input**: Monday hours: Opens 10:00 PM, Closes 06:00 AM, Overnight = Off.
- **Steps**:
  1. Set Monday opens at 10:00 PM.
  2. Set Monday closes at 06:00 AM.
  3. Leave the "Overnight" switch turned off.
  4. Click "Next".
- **Expected Frontend**: Inline validation error appears: `Closing time must be after opening time, or enable Overnight.` Stepper does not advance.
- **Expected API Result**: No request sent.
- **Priority**: High.
- **Automation Suitability**: High (Widget).

---

### QA-OUT-005: Atomic Transaction Rollback on Address Failure
- **Requirement ID**: TA-OUT-WIZ-007, TA-OUT-WIZ-008
- **Preconditions**: User is on Step 4 (Review & Create).
- **User Role**: Tenant Admin.
- **Input**: Valid details, but address line is empty or country code is invalid.
- **Steps**:
  1. Fill out the wizard and click submit.
  2. Simulate backend address database constraint validation failure.
- **Expected Frontend**: Displays page-level error indicating submission failed. Wizard state is preserved.
- **Expected API Result**: `400 Bad Request` or `500 Server Error`.
- **Expected Database Result**: Outlet record is NOT created (rolled back completely).
- **Priority**: Critical.
- **Automation Suitability**: High (Backend Integration).
