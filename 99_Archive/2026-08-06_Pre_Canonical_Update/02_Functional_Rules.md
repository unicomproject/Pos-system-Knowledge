<!-- Archived: 2026-08-06 -->
<!-- Reason: Superseded by new canonical Outlet Management specification. -->

# ARCHIVED: Outlet, Till & POS Device Foundation Functional Rules

## 1. Module Scope

- **Purpose**: Manage physical and logical locations (Outlets) where business operations, sales, and inventory movements occur.
- **In-scope**: Creating and managing Outlets, assigning managers, associating Tills, viewing aggregated operational health and sales summaries.
- **Out-of-scope**: Cash reconciliation, Order fulfilment execution, Hardware test execution.
- **Roles and Permissions**: Handled via Tenant Admin feature entitlements and permissions (`tenant.outlets.view`, `tenant.outlets.manage`).
- **Feature Entitlement**: Requires active POS or Inventory subscription.

## 2. Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| TA-OUT-FR-001 | **Split-view selection**: The Outlet list and selected Outlet details must display in a split-view panel on desktop and tablet. | Proposed |
| TA-OUT-FR-002 | **Search debounce**: Search by Name or Code must apply a debounce to prevent excessive API calls. | Proposed |
| TA-OUT-FR-003 | **Filters**: Users must be able to filter the list by Type (`Store`, `Warehouse`), Status (`Active`, `Inactive`), and Operational Health (`Needs Attention`). | Proposed |
| TA-OUT-FR-004 | **Sorting**: The Outlet list must support sorting by Name, Code, and Status. | Proposed |
| TA-OUT-FR-005 | **Pagination**: The list must support server-side pagination. | Confirmed |
| TA-OUT-FR-006 | **Refresh**: The user must be able to manually refresh the list and the overview panel. | Proposed |
| TA-OUT-FR-007 | **Selected Outlet persistence**: The currently selected Outlet should remain selected after a refresh if it still matches the filter criteria. | Proposed |
| TA-OUT-FR-008 | **Close detail panel**: The user must be able to close the right-side detail panel to return to a full list view. | Proposed |
| TA-OUT-FR-009 | **Add Outlet**: Tenant Admins with `tenant.outlets.manage` can create a new Outlet. | Confirmed |
| TA-OUT-FR-010 | **View Outlet**: Tenant Admins with `tenant.outlets.view` can view Outlet details and the overview summary. | Confirmed |
| TA-OUT-FR-011 | **Edit Outlet**: Tenant Admins with `tenant.outlets.manage` can edit Outlet details. | Confirmed |
| TA-OUT-FR-012 | **Activate Outlet**: Tenant Admins can change an Outlet's status from `Inactive` to `Active`. | Confirmed |
| TA-OUT-FR-013 | **Disable Outlet**: Tenant Admins can change an Outlet's status from `Active` to `Inactive`. | Confirmed |
| TA-OUT-FR-014 | **Manager mapping**: Users must be able to assign a primary manager from the list of active Tenant Users. | Proposed |
| TA-OUT-FR-015 | **Image handling**: Users must be able to upload or replace an Outlet image. | Proposed |
| TA-OUT-FR-016 | **Overview Metrics**: The detail panel must display Till summary, Sales summary, Inventory stock value, Open orders, Operational alerts, Last activity, and Last synchronization. | Proposed |
| TA-OUT-FR-017 | **UI States**: The UI must handle Loading, Empty, Error, and Permission-Denied states gracefully. | Confirmed |

## 3. Business Rules

### Outlet Lifecycle & Identity
- **Unique Outlet code**: Outlet code is tenant-unique within the tenant.
- **Outlet Types**: Supported types are `STORE` and `WAREHOUSE`.
- **Default Outlet**: Only one default outlet per tenant is allowed.
- **Active and Inactive lifecycle**: Outlet status is strictly `ACTIVE` or `INACTIVE`.
- **Disable restrictions**: Disabling means setting status to `INACTIVE`. Disabling the default Outlet is prohibited unless another is set as default. Disabling an Outlet with active tills or open orders requires a confirmation dialog and audit log.
- **Soft delete restrictions**: Outlets with active tills, orders, stock, or users cannot be hard deleted. Deletion becomes deactivation (disable) when dependencies exist.

### Operational Health (Derived)
- **Operational Health**: Derived separately from lifecycle status. Values are `HEALTHY`, `NEEDS_ATTENTION`, `CRITICAL`, `UNKNOWN`.
- **Needs Attention derivation**: `NEEDS_ATTENTION` is triggered if there are offline tills, POS heartbeat failures, or active hardware warnings. It is NEVER stored in the Outlet status column.

### Manager Assignment
- **Manager assignment**: Manager assignment is done via the `OutletUserRole` (or a proposed `OutletUserAssignment`) mapping, by setting `IsPrimaryManager = true`.
- **Manager Names**: Manager names must come from `TenantUser` records and must NEVER be stored as free-text in the Outlet table.
- **Rules**: Maximum one primary manager per Outlet. One user may manage multiple Outlets. The Manager must be an active Tenant User. Assignment and removal require audit logging.

### Image Validation
- **Image validation**: Outlet images should prefer the existing `MediaAsset` architecture. Allowed file types: JPG, PNG, WEBP. Maximum size: 5MB. Replacement overrides the old asset link.

### Metrics Calculations
- **Active and online till calculation**: Active Tills have status `ACTIVE`. Online Tills have an active POS device heartbeat within the configured threshold.
- **Today's sales calculation**: Sum of completed sales orders where business date is today (in Tenant Timezone).
- **Yesterday comparison calculation**: Today's net sales compared to yesterday's net sales `((Today - Yesterday) / Yesterday) * 100`.
- **Stock valuation**: Follows canonical Inventory rules (Sum of remaining cost layers: `remaining_quantity * unit_cost`).
- **Open-order definition**: Orders with Status not `COMPLETED` and not `CANCELLED`.
- **Timezone and business date**: Calculations must resolve `from` and `to` in the tenant timezone before querying UTC database instants.

### Security & Scope
- **Tenant isolation**: Strictly enforced via `TenantId` foreign keys and `TenantRequestContext`.
- **Outlet access scope**: Users may only view or manage Outlets they are explicitly permitted to access.
- **Audit logging**: All mutations (Add, Edit, Activate, Disable, Assign Manager, Upload Image) must generate an audit event.

## 4. Permissions

The following feature permissions govern the Outlet module:

| Action | Permission | Enforcement |
|---|---|---|
| View Outlet List | `tenant.outlets.view` | Backend Endpoint, Flutter Route Visibility |
| View Outlet Details | `tenant.outlets.view` | Backend Endpoint, Flutter Detail Panel |
| Manage Outlets (Add/Edit) | `tenant.outlets.manage` | Backend Endpoint, Flutter Form Buttons |
| Activate/Disable Outlet | `tenant.outlets.manage` | Backend Endpoint, Flutter Status Toggle |
| Assign Manager | `tenant.outlets.manage` | Backend Endpoint, Flutter Manager Selection |
| Manage Image | `tenant.outlets.manage` | Backend Endpoint, Flutter Image Upload |
| View Tills | `tenant.tills.view` | Backend Endpoint, Flutter Till Overview Card |
| View Sales | `tenant.reports.sales.view` | Backend Endpoint, Flutter Sales Overview Card |
| View Inventory | `tenant.stock.view` | Backend Endpoint, Flutter Stock Overview Card |
| View Orders | `tenant.orders.view` | Backend Endpoint, Flutter Orders Overview Card |

*Note*: Granular permissions are not created if `tenant.outlets.manage` sufficiently covers the action based on the existing architecture.

## 5. Flutter Navigation and UI States

- **Canonical Route**: `/tenant-admin/outlets`
- **Child Routes**: `/tenant-admin/outlets/{id}`
- **Split-view Selection**: Selecting an item from the list pushes the detail panel to the right without leaving the route on Desktop/Tablet.
- **Direct-link Behavior**: Accessing `/tenant-admin/outlets/{id}` directly will load the list and automatically select and open the detail panel for `{id}`.
- **Mobile Detail Route**: On mobile (width < 768px), selecting an Outlet navigates to a full-screen detail view. Browser back returns to the list.
- **Shared Shell**: Reuse the existing Sidebar and Header. Do not duplicate.
- **UI States**:
  - `Loading`: Shimmer effect on list and detail cards.
  - `Empty`: Clear illustration with "Add Outlet" CTA.
  - `Error`: Retry button with safe error message.
  - `Permission Denied`: Standard unauthorized illustration.
- **Accessibility**: Support keyboard navigation (Tab, Enter, Space) and ARIA semantics for the split-panel states (aria-expanded, aria-controls).

## 6. Testing

### Flutter Tests
- List loading and empty states
- Populated list with search, filter, and pagination
- Split-view selection and detail panel rendering
- Add, Edit, Activate, Disable actions
- Manager assignment and Image upload UI
- Operational health badge rendering
- Responsive desktop, tablet, and mobile layouts

### Backend Tests
- List endpoints with Search (Name, Code), Filter (Type, Status), and Pagination.
- Detail endpoints.
- Overview aggregate endpoint (Mocking sales, inventory, and till counts to verify calculations).
- Create, Update, Activate, Disable Outlets.
- Manager assignment logic (Verify `is_primary_manager`).
- Image handling logic (Verify `MediaAsset` integration).
- Tenant isolation and Permission enforcement.
- Default Outlet disable restrictions.
- Audit logging verification.
