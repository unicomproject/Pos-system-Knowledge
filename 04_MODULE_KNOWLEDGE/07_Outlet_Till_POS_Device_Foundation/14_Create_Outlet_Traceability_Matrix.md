# 14 Create Outlet Traceability Matrix

> Last Verified Date: 2026-08-06

## Traceability Grid

| Requirement ID | UI Screen/Field | Business Rule | Frontend File | API Endpoint | Backend Handler | Entity/Table | Permission | Audit Event | QA Test Case | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **TA-OUT-WIZ-001** | Stepper Layout | 4-step wizard sequence | `outlet_form.dart` | — | — | — | `tenant.outlets.view` | `outlet.create.started` | QA-OUT-002 | VERIFIED IMPLEMENTED |
| **TA-OUT-WIZ-002** | Header/Sidebar | Hidden POS context controls | `add_outlet_screen.dart` | — | — | — | — | — | QA-OUT-001 | VERIFIED IMPLEMENTED |
| **TA-OUT-WIZ-004** | Form Inputs | Data retention across steps | `outlet_form.dart` | — | — | — | — | — | QA-OUT-002 | VERIFIED IMPLEMENTED |
| **TA-OUT-WIZ-005** | Outlet Code field | Read-only auto-generated | `outlet_form.dart` | `GET .../create-options` | `GetCreateOptionsAsync` | `outlets.outlet_code` | `tenant.outlets.view` | — | — | PARTIALLY IMPLEMENTED |
| **TA-OUT-WIZ-006** | Outlet Manager dropdown | Tenant scoped searchable | Missing | Proposed | Proposed | `outlet_user_roles` | `tenant.outlets.manage` | `outlet.manager_assigned` | — | NOT IMPLEMENTED |
| **TA-OUT-WIZ-008** | Submit Action | Prevent duplicate submits | Proposed | `POST /api/v1/outlets` | Proposed | — | `tenant.outlets.manage` | — | QA-OUT-005 | NOT IMPLEMENTED |
| **TA-OUT-WIZ-010** | Central Outlet Toggle | One central outlet | `outlet_form.dart` | `POST /api/v1/outlets` | `CreateAsync` | `outlets.is_default_outlet` | `tenant.outlets.manage` | `outlet.central_changed` | QA-OUT-003 | PARTIALLY IMPLEMENTED |
| **TA-OUT-WIZ-011** | Default Till Outlet | One default tills outlet | `outlet_form.dart` | Proposed | Proposed | `tenant_settings` | `tenant.outlets.manage` | `outlet.default_till_outlet_changed` | — | NOT IMPLEMENTED |
| **TA-OUT-WIZ-013** | Overnight hours | Spans next day valid check | `outlet_form.dart` | `POST /api/v1/outlets` | `CreateAsync` | `outlet_business_hours` | `tenant.outlets.manage` | — | QA-OUT-004 | PARTIALLY IMPLEMENTED |
| **TA-OUT-WIZ-014** | Special Days grid | Override weekday hours | Missing | Proposed | Proposed | `outlet_special_hours` | `tenant.outlets.manage` | `outlet.special_hours_updated` | — | NOT IMPLEMENTED |
| **TA-OUT-WIZ-015** | Success Screen CTAs | Permission-gated actions | `add_outlet_screen.dart` | — | — | — | — | — | — | NOT IMPLEMENTED |
