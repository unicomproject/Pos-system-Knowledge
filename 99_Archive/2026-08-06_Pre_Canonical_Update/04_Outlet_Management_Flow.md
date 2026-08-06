<!-- Archived: 2026-08-06 -->
<!-- Reason: Superseded by new canonical Outlet Management specification. -->

# ARCHIVED: Tenant Admin Outlet Management User Journey

# Outlet Management Flow

## Journey 1: View Outlet List

- **Actor**: Tenant Admin
- **Preconditions**: User is logged in and has `tenant.outlets.view` permission.
- **Trigger**: User clicks "Outlets" from the Tenant Admin Sidebar.
- **Main Flow**:
  1. System requests the paginated list of Outlets from the backend.
  2. System renders the list containing Outlet Image, Name, Code, Manager Avatar, Type, Status, and Active Tills.
- **Validation Failures**: None.
- **Permission Failures**: System shows Permission Denied state if `tenant.outlets.view` is missing.
- **Empty State**: System shows illustration with "Add Outlet" button.
- **Error State**: System shows "Failed to load outlets" with a Retry button.
- **Postconditions**: Outlet list is displayed.
- **Related APIs**: `GET /api/v1/tenant-admin/outlets`
- **Related Tables**: `Outlets`

## Journey 2: Search and Filter Outlets

- **Actor**: Tenant Admin
- **Trigger**: User types in the search bar or selects a filter dropdown (Type, Status, Operational Health).
- **Main Flow**:
  1. User enters a search term (Name or Code).
  2. System debounces the input.
  3. System appends query parameters and requests the filtered list.
  4. System updates the Outlet list.
- **Alternative Flow**: If "Needs Attention" filter is selected, the system filters by operational health on the backend.
- **Postconditions**: Filtered list is displayed.

## Journey 3: Select Outlet and View Split-Panel Details

- **Actor**: Tenant Admin
- **Trigger**: User clicks on an Outlet row in the list.
- **Main Flow**:
  1. System slides in the right-side detail panel.
  2. System requests `GET /api/v1/tenant-admin/outlets/{outletId}/overview`.
  3. System populates the detail panel with Info, Contacts, Till summary, Sales summary, Stock value, Open orders, and Operational alerts.
- **Related APIs**: `GET /api/v1/tenant-admin/outlets/{outletId}/overview` (Proposed)

## Journey 4: Add Outlet

- **Actor**: Tenant Admin
- **Permissions**: `tenant.outlets.manage`
- **Trigger**: User clicks "Add Outlet".
- **Main Flow**:
  1. System displays the Add Outlet form.
  2. User provides required details (Name, Code, Type, Address).
  3. System sends `POST /api/v1/tenant-admin/outlets`.
  4. System refreshes the list and selects the new Outlet.
- **Validation Failures**: System highlights missing or duplicate fields (e.g. duplicate Outlet Code).
- **Audit Events**: `OutletCreated`

## Journey 5: Edit Outlet

- **Actor**: Tenant Admin
- **Permissions**: `tenant.outlets.manage`
- **Trigger**: User clicks "Edit" on the Outlet detail panel.
- **Main Flow**:
  1. System displays the Edit Outlet form pre-populated with data.
  2. User modifies data.
  3. System sends `PUT /api/v1/tenant-admin/outlets/{outletId}`.
  4. System updates the detail panel and list row.
- **Audit Events**: `OutletUpdated`

## Journey 6: Activate / Disable Outlet

- **Actor**: Tenant Admin
- **Permissions**: `tenant.outlets.manage`
- **Trigger**: User toggles the Outlet status.
- **Main Flow (Disable)**:
  1. User selects Disable.
  2. System checks if Outlet is Default, has active tills, or open orders.
  3. If restrictions exist, system shows a confirmation dialog.
  4. Upon confirmation, system sends `PUT /api/v1/tenant-admin/outlets/{outletId}/disable`.
  5. Status updates to `Inactive`.
- **Audit Events**: `OutletDeactivated`, `OutletActivated`

## Journey 7: Assign or Change Manager

- **Actor**: Tenant Admin
- **Permissions**: `tenant.outlets.manage`
- **Trigger**: User clicks "Assign Manager" in the detail panel.
- **Main Flow**:
  1. System shows a list of active Tenant Users.
  2. User selects a user.
  3. System sends `PUT /api/v1/tenant-admin/outlets/{outletId}/manager`.
  4. Backend creates/updates `OutletUserRole` (or equivalent assignment table) with `IsPrimaryManager = true`.
- **Audit Events**: `OutletManagerAssigned`

## Journey 8: Upload or Replace Outlet Image

- **Actor**: Tenant Admin
- **Permissions**: `tenant.outlets.manage`
- **Trigger**: User clicks the Image upload placeholder.
- **Main Flow**:
  1. User selects an image file (JPG/PNG/WEBP).
  2. System validates file size (< 5MB).
  3. System sends `PUT /api/v1/tenant-admin/outlets/{outletId}/image`.
  4. System updates the image preview.

## Journey 9: View Responsive Mobile Outlet Details

- **Actor**: Tenant Admin
- **Trigger**: User clicks an Outlet row on a mobile device (< 768px).
- **Main Flow**:
  1. System navigates to a full-screen detail view (hiding the list).
  2. User interacts with the detail view.
  3. User clicks the browser Back button or a UI "Back to List" button to return.
