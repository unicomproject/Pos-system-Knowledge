# 02 Create Outlet Current State Audit

> Last Verified Date: 2026-08-06
> Source Files Reviewed:
> - Frontend: `add_outlet_screen.dart`, `outlet_form.dart`, `outlet_providers.dart`
> - Backend: `TenantAdminOutletsController.cs`, `Outlet.cs`, `OutletConfiguration.cs`, `OutletAddress.cs`, `OutletBusinessHour.cs`

## 1. Frontend Audit (`Nytroz-POS-App`)

### 1.1 Routes & Entry Points
- **Create Outlet Route**: `/tenant-admin/outlets/add` (mapped via Router to [AddOutletScreen](file:///c:/Users/User/Desktop/pos%20final%20wep/Tenantadmin/Nytroz-POS-App/lib/features/tenant_admin/outlets/presentation/screens/add_outlet_screen.dart)).
- **Outlet List Route**: `/tenant-admin/outlets`.
- **Navigation Shell**: Handled by the `TenantAdminPageScaffold`.
- **Form Persistence**: Wizard state is saved in the local state of `_OutletFormState` in [outlet_form.dart](file:///c:/Users/User/Desktop/pos%20final%20wep/Tenantadmin/Nytroz-POS-App/lib/features/tenant_admin/outlets/presentation/widgets/outlet_form.dart). No persistent draft model exists.
- **Unsaved Data / Cancel**: Cancel redirects to `/tenant-admin/outlets` immediately; no confirmation dialog is displayed.

### 1.2 State Management & Providers
- **optionsState**: `outletCreateOptionsProvider` fetchesLookup data (types, timezones, countries) via `GET /api/v1/outlets/create-options`.
- **createOutletProvider**: Encapsulates `CreateOutlet` use case which calls the repository layer.
- **Form Fields Controller**: Form text controllers are managed inside the Stateful widget `_OutletFormState`.

### 1.3 Wizard Stepper Implementation
- Implements `OutletWizardStepper` with 4 steps:
  1. Outlet Details
  2. Location & Contact
  3. Business Hours
  4. Review & Create

### 1.4 Frontend Request Payload (`toJson()`)
```json
{
  "outletName": "Downtown Store",
  "outletType": "STORE",
  "status": "ACTIVE",
  "mainPhoneNumber": "+94770000000",
  "emailAddress": "downtown@oneverz.com",
  "contactName": "James Anderson",
  "contactPhone": "+94770000000",
  "isDefaultOutlet": false,
  "addressLine1": "123 Main Street",
  "addressLine2": null,
  "city": "Colombo",
  "state": "Western",
  "country": "LK",
  "postalCode": "00100",
  "timezone": "Asia/Colombo",
  "openingHours": []
}
```

### 1.5 Manager Field Audit
- **Frontend Model**: Has a display value in UI, but is completely missing from the create request payload.
- **Dropdown/Selector**: Current `OutletForm` does not contain a searchable manager selector. It only contains a free-text name field in old mocks.
- **Database Mappings**: The `outlets` table does not contain a `manager_user_id` column. Rather, it is mapped via `OutletUserRole.IsPrimaryManager` under the access control module.

---

## 2. Backend Audit (`Unified-Commerce`)

### 2.1 API Endpoints
- **Create Outlet**: `POST /api/v1/outlets` -> Handled by `OutletsController.Create`.
- **Update Outlet**: `PUT /api/v1/outlets/{id}` -> Handled by `OutletsController.Update`.
- **Get Options**: `GET /api/v1/outlets/create-options`.
- **Admin Specifics**: `TenantAdminOutletsController` handles manager assignments:
  - `PUT /api/v1/tenant-admin/outlets/{id}/manager` with `{ "tenantUserId": "uuid" }`.
  - `DELETE /api/v1/tenant-admin/outlets/{id}/manager`.
  - `PUT /api/v1/tenant-admin/outlets/{id}/image` with `{ "mediaAssetId": "uuid" }`.

### 2.2 Permissions & Access Gates
- `tenant.outlets.view` (View Outlets)
- `tenant.outlets.manage` (Manage Outlets)
- `tenant.outlets.details.view` (View details)
- `tenant.outlets.update` (Update outlets)

### 2.3 Transaction Boundaries & Idempotency
- **Transaction**: The create outlet use case registers the outlet, address, and opening hours. If one fails, the database rolls back.
- **Idempotency**: There is currently no `Idempotency-Key` header checking implemented on `POST /api/v1/outlets`. Double-clicking can result in duplicate requests.

---

## 3. Database Audit

### 3.1 `outlets` Table Columns
- `id` (uuid, primary key)
- `tenant_id` (uuid)
- `outlet_code` (varchar(60))
- `outlet_name` (varchar(200))
- `outlet_type` (varchar(40))
- `phone` (varchar(40), nullable)
- `email` (varchar(255), nullable)
- `timezone` (varchar(80))
- `is_default_outlet` (boolean)
- `status` (varchar(40))
- `media_asset_id` (uuid, nullable)
- `created_at` / `updated_at` (timestamp with timezone)

### 3.2 `outlet_addresses` Table Columns
- `id` (uuid, primary key)
- `tenant_id` (uuid)
- `outlet_id` (uuid)
- `address_type` (varchar(40))
- `address_line1` (varchar(250))
- `address_line2` (varchar(250), nullable)
- `city` (varchar(120))
- `state_or_province` (varchar(120), nullable)
- `postal_code` (varchar(30), nullable)
- `country_code` (char(2))
- `contact_name` (varchar(150), nullable)
- `contact_phone` (varchar(40), nullable)
- **Missing Column**: `contact_email` is not in the database table schema.

### 3.3 `outlet_business_hours` Table Columns
- `id`, `tenant_id`, `outlet_id`, `day_of_week`, `opening_time`, `closing_time`, `is_closed`, `valid_from`, `valid_until`.
- **Missing Column**: `spans_next_day` (Overnight) and 24 Hours state are missing.
- **Missing Table**: No `outlet_special_hours` table is defined.
