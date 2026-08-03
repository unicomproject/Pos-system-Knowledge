<!-- title: Tenant Admin Outlet Management Flow -->
<!-- status: Active -->
<!-- system: TM-EPOS MVP -->
<!-- last_updated: 2026-07-29 -->

# Tenant Admin Outlet Management Flow

## Purpose

Defines all Outlet Management user journeys for Tenant Admins based on the approved UI specification.

## Core Journeys

### 1. View Outlet List
- **Actor**: Tenant Admin, Operations Manager
- **Preconditions**: User is logged in, has `tenant.outlets.view` permission.
- **Trigger**: Clicks "Outlets" from the Tenant Admin Sidebar.
- **Main flow**: System fetches outlet list via `GET /api/v1/outlets` and displays the paginated list, along with summary cards (Total, Active, Warehouses, Needs Attention).
- **API interaction**: `GET /api/v1/outlets`
- **Permission failure**: System shows no-access state.

### 2. Search Outlets
- **Actor**: Tenant Admin
- **Trigger**: Enters text in search bar (Name or Code).
- **Main flow**: System queries API with `search` param and updates table.

### 3. Filter Outlets
- **Actor**: Tenant Admin
- **Trigger**: Selects Type or Status filter.
- **Main flow**: System queries API with filter params and updates table.

### 4. View Outlet Details
- **Actor**: Tenant Admin
- **Trigger**: Clicks "View" on an outlet row.
- **Main flow**: System fetches details (`GET /api/v1/tenant-admin/outlets/{id}`), displays overview panel, till assignments, users.

### 5. Create Outlet
- **Actor**: Tenant Admin
- **Preconditions**: Has `tenant.outlets.manage` permission.
- **Trigger**: Clicks "Add outlet" primary action.
- **Main flow**: Fetches create-options. User fills form (Name, Code, Type, Address/City, Timezone). Submits. System calls `POST /api/v1/outlets`.
- **Validation flow**: Checks unique code.
- **Database impact**: Inserts into `outlets` and `outlet_addresses`.
- **Audit event**: OutletCreated audit log written.

### 6. Edit Outlet
- **Actor**: Tenant Admin
- **Trigger**: Clicks "Edit" action.
- **Main flow**: Edits fields, submits. Calls `PUT /api/v1/outlets/{id}`.

### 7. Activate or Deactivate Outlet
- **Actor**: Tenant Admin
- **Trigger**: Toggles status.
- **Main flow**: Calls `PUT /api/v1/outlets/{id}` with updated Status (`Active`/`Inactive`).

### 8. Delete or Archive Outlet
- **Actor**: Tenant Admin
- **Trigger**: Clicks "Delete".
- **Alternate flow**: If outlet has active tills, orders, stock, or users, the system blocks deletion and may offer deactivation instead. Calls `DELETE /api/v1/outlets/{id}` (Soft delete).

### 9. View Outlet Operational Summary
- **Actor**: Tenant Admin
- **Trigger**: Views the Outlet Overview panel.
- **Main flow**: Displays Total, Active, Attention, Inactive counts. (Depends on new/pending summary API).

### 10. View Top Performing Outlet
- **Actor**: Tenant Admin
- **Preconditions**: Has report viewing permission.
- **Trigger**: Views "Top Performing Outlet" panel.
- **Main flow**: Displays outlet with highest sales/transactions. (Backend API pending).

### 11. Navigate from Outlet to its Tills
- **Actor**: Tenant Admin
- **Trigger**: Clicks till count or view tills action on an outlet.
- **Main flow**: Navigates to Till Management screen pre-filtered for the outlet.

### 12. Assign or change Outlet Manager
- **Actor**: Tenant Admin
- **Trigger**: Clicks Assign Manager (UI Approved, Backend Pending).
- **Alternate flow**: Documented as future scope.

### 13. Configure an outlet as an e-commerce collection point
- **Actor**: Tenant Admin
- **Main flow**: Set in create/edit form if applicable to e-commerce setup.
