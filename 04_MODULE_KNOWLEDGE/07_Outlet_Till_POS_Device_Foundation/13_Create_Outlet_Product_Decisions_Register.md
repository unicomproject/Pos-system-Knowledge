# 13 Create Outlet Product Decisions Register

> Last Verified Date: 2026-08-06
> Source basis: OneVerz Product Requirements Document

## Open Decisions Register

### PD-OUT-001: Is Outlet Manager optional or mandatory during creation?
- **Question**: Should the user be required to assign an Outlet Manager when creating a new outlet?
- **Current Evidence**: The database column `Outlet.manager_user_id` does not exist; manager is mapped via `OutletUserRole`. The EF Core schema allows outlets to exist without any manager role assigned.
- **Options**:
  - *Option A*: Mandatory. Admin must select an active tenant user.
  - *Option B*: Optional. Outlet can be created without an assigned manager.
- **Recommendation**: Option B (Optional). New retail locations may be set up before a local manager is hired or assigned.
- **Impact**: Frontend validator will treat manager selection as optional.
- **Status**: Open (Recommendation pending approval).
- **Required-by Date**: P0 Freeze.

---

### PD-OUT-002: Does a new outlet default to Active or Inactive status?
- **Question**: When a new outlet is created, should it default to Active or Inactive status?
- **Current Evidence**: Currently, `status` defaults to `ACTIVE` in `defaults` from lookup API.
- **Options**:
  - *Option A*: Active by default. Outlet is operational immediately.
  - *Option B*: Inactive by default. Admin must configure tills and hardware before manual activation.
- **Recommendation**: Option B (Inactive). Prevents transactions or till pairings from occurring on partially configured locations.
- **Status**: Open.

---

### PD-OUT-003: Storage strategy for Default for New Tills
- **Question**: Where should the "Default for New Tills" setting reference be stored?
- **Current Evidence**: The database has no column mapping this relationship.
- **Options**:
  - *Option A*: Store as a key-value pair in `tenant_settings`.
  - *Option B*: Introduce `default_till_outlet_id` as a foreign key on the `tenants` table.
- **Recommendation**: Option A (tenant_settings). Avoids changing core tenant schemas and fits existing configuration patterns.
- **Status**: Open.

---

### PD-OUT-004: Business Hours storage schema
- **Question**: Should business hours use the existing JSON column `opening_hours` or be refactored into relational tables?
- **Current Evidence**: `outlets.opening_hours` exists as a JSON column, but `outlet_business_hours` relational table also exists from migration.
- **Options**:
  - *Option A*: Standardize on `outlet_business_hours` and `outlet_special_hours` relational tables.
  - *Option B*: Overwrite the relational model and store all schedules in the `opening_hours` JSON column.
- **Recommendation**: Option A (Relational tables). Relational models allow for easier query filtering, reporting, and index validation of dates.
- **Status**: Open.
