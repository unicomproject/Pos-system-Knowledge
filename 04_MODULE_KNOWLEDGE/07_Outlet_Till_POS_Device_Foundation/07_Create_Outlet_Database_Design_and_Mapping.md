# 07 Create Outlet Database Design and Mapping

> Last Verified Date: 2026-08-06
> Source basis: EF Core Entity mapping definitions (`OutletConfiguration.cs`, `OutletAddressConfiguration.cs`)

## 1. Database Schema Field Mapping

| UI Field | Frontend Model | API Property | Domain/Application Model | EF Entity | Database Column/Table | Current Status | Required Change |
|---|---|---|---|---|---|---|---|
| **Outlet Name** | `outletName` | `outletName` | `OutletName` | `Outlet.OutletName` | `outlet_name` (outlets) | Implemented | None |
| **Outlet Code** | `code` | `outletCode` | `OutletCode` | `Outlet.OutletCode` | `outlet_code` (outlets) | Implemented | None |
| **Outlet Type** | `outletType` | `outletType` | `OutletType` | `Outlet.OutletType` | `outlet_type` (outlets) | Implemented | None |
| **Status** | `status` | `status` | `Status` | `Outlet.Status` | `status` (outlets) | Implemented | None |
| **Timezone** | `timezone` | `timezone` | `Timezone` | `Outlet.Timezone` | `timezone` (outlets) | Implemented | None |
| **Outlet Phone** | `mainPhoneNumber` | `phone` | `Phone` | `Outlet.Phone` | `phone` (outlets) | Implemented | None |
| **Outlet Email** | `emailAddress` | `email` | `Email` | `Outlet.Email` | `email` (outlets) | Implemented | None |
| **Image** | `imageAssetId` | `mediaAssetId` | `MediaAssetId` | `Outlet.MediaAssetId` | `media_asset_id` (outlets) | Implemented | None |
| **Outlet Manager** | `manager` | `manager` | `OutletUserRole.IsPrimaryManager` | `OutletUserRole` | `is_primary_manager` (outlet_user_roles) | Implemented | None |
| **Main / Central Outlet** | `isDefaultOutlet` | `isDefaultOutlet` | `IsDefaultOutlet` | `Outlet.IsDefaultOutlet` | `is_default_outlet` (outlets) | Partial | Rename to `is_central_outlet` |
| **Default for New Tills** | `isDefaultTillOutlet` | `isDefaultTillOutlet` | Proposed | Proposed | `default_till_outlet_id` (tenant_settings) | Missing | Add mapping in settings |
| **Address Line 1** | `addressLine1` | `address.addressLine1` | `AddressLine1` | `OutletAddress.AddressLine1` | `address_line1` (outlet_addresses) | Implemented | None |
| **City** | `city` | `address.city` | `City` | `OutletAddress.City` | `city` (outlet_addresses) | Implemented | None |
| **Country** | `country` | `address.countryCode` | `CountryCode` | `OutletAddress.CountryCode` | `country_code` (outlet_addresses) | Implemented | None |
| **Contact Person** | `contactName` | `address.contactName` | `ContactName` | `OutletAddress.ContactName` | `contact_name` (outlet_addresses) | Implemented | None |
| **Contact Phone** | `contactPhone` | `address.contactPhone` | `ContactPhone` | `OutletAddress.ContactPhone` | `contact_phone` (outlet_addresses) | Implemented | None |
| **Contact Email** | Missing | `address.contactEmail` | Proposed | Proposed | `contact_email` (outlet_addresses) | Missing | Add database column |
| **Regular Hours** | `openingHours` | `regularHours` | `OutletBusinessHour` | `OutletBusinessHour` | `outlet_business_hours` | Partial | Add `spans_next_day` / status columns |
| **Special Hours** | Missing | `specialHours` | Proposed | Proposed | `outlet_special_hours` (table) | Missing | Create table |

---

## 2. Table Mappings & Key Constraints

### 2.1 Mappings
- `uq_outlets_tenant_id_outlet_code` -> Unique constraint on `(tenant_id, outlet_code)`.
- `uq_outlets_tenant_id_default_outlet` -> Partial unique index on `(tenant_id)` with filter `is_default_outlet = true AND status <> 'DELETED'`. Enforces only one active default outlet per tenant.

### 2.2 Recommended Corrections (Database Level)
1. **Differentiate Toggles**:
   - Do not reuse `is_default_outlet` to represent both "Main / Central Outlet" and "Default for New Tills".
   - Keep `is_default_outlet` mapped as "Main / Central Outlet" (or rename to `is_central_outlet`).
   - Store "Default for New Tills" as a key-value record in `tenant_settings` under the key `default_till_outlet_id`.
2. **Contact Email**: Add `contact_email` (varchar(255), nullable) to the `outlet_addresses` table.
3. **Special Hours**: Create a new table `outlet_special_hours` with columns `id`, `tenant_id`, `outlet_id`, `special_date`, `name`, `status`, `opening_time`, `closing_time`, `spans_next_day`. Add a UNIQUE constraint on `(outlet_id, special_date)`.
