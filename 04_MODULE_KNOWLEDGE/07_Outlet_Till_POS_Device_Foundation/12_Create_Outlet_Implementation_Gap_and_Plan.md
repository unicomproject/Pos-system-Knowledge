# 12 Create Outlet Implementation Gap and Plan

> Last Verified Date: 2026-08-06
> Source basis: OneVerz Delivery Roadmap

## Phased Implementation Plan

### 1. Phase P0: Contract and Data Correctness (Immediate Priority)

#### P0.1 Differentiate Central Outlet and Default Till Outlet
- **Frontend Impact**: Display two separate toggles: "Main / Central Outlet" and "Default for New Tills" on Step 1.
- **Backend Impact**: Update creation logic to map `isCentralOutlet` to `IsDefaultOutlet` (or proposed column), and save the default till outlet reference in `tenant_settings`.
- **Database Impact**: Add unique partial constraint for active central outlet. No changes if mapping via settings.
- **Permission Impact**: Require `tenant.outlets.set_central` and `tenant.tills.set_default_outlet` if granular permissioning is enabled.
- **Dependency**: None.
- **Risk**: Low.
- **Acceptance Criteria**: Changing the default till outlet does not modify the central outlet column.

#### P0.2 Align Frontend/Backend/Database Fields
- **Frontend Impact**: Remove `manager` text input from the primary create payload, passing `managerTenantUserId` instead.
- **Backend Impact**: Map request address properties to the `OutletAddress` entity fields correctly.
- **Database Impact**: Add `contact_email` to the `outlet_addresses` table.
- **Dependency**: Database migrations.
- **Acceptance Criteria**: Contact email is persisted to the database.

---

### 2. Phase P1: Complete Functional Journey (Functional MVP)

#### P1.1 Searchable Outlet Manager Selector
- **Frontend Impact**: Replace free-text fields with a searchable user dropdown.
- **Backend Impact**: Implement user lookup API `GET /api/v1/tenant-admin/users` filtered by tenant ID and active status.
- **Acceptance Criteria**: Administrators can only search and assign users who belong to the same tenant.

#### P1.2 Overnight and 24 Hours Operating States
- **Frontend Impact**: Implement custom row status selectors (Open/Closed/24h) and overnight span checkboxes in Step 3.
- **Backend Impact**: Validate that open status requires times and spans next day logic matches the JSON schema rules.
- **Database Impact**: Extend business hours storage to support `spans_next_day`.
- **Dependency**: Business hours schema validation freeze.

---

### 3. Phase P2: Governance and Hardening (Release-Ready)

#### P2.1 Subscription Limit Enforcement
- **Backend Impact**: Introduce check count limit validation on `POST /api/v1/outlets` checking tenant's active plan `max_outlets` against existing active outlet counts.
- **Acceptance Criteria**: Return `422 Unprocessable Entity` when limit is exceeded.

#### P2.2 Idempotency Hardening
- **Frontend Impact**: Generate client-side UUID key for header `Idempotency-Key` on clicking submit.
- **Backend Impact**: Check cache/db for processed key before execution. Return original response if matches.
