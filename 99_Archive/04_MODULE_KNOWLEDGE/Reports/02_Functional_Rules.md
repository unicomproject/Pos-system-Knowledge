<!-- title: Reports Functional Rules -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Reports Functional Rules

## Purpose

This file defines functional rules for the `Reports` module.

## Business Rules

- Reports respect tenant/outlet/permission boundaries; exports are tenant-owned jobs.
- Frontend validation improves UX but backend validation remains authoritative.
- Tenant-owned data must stay inside the resolved tenant context.
- UI hiding is not enough; backend APIs must enforce access.
- Final UI must not use hardcoded business data.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | Can access only platform-permitted setup actions |
| Tenant Admin | Can access only tenant-entitled and permitted operations |
| Cashier | Can access only POS actions allowed by role, outlet, device, and till context |
| Manager | Can approve only actions where approval permission is granted |

## Access-Control Rules

| Control | Required Rule |
|---|---|
| Authentication | Required for protected actions |
| Tenant status | Tenant must be active/allowed |
| Feature entitlement | Required where the module is feature-controlled |
| Permission | Required in UI and backend |
| Outlet access | Required for outlet-scoped actions |
| Trusted device | Required for POS device-scoped actions |
| Open till session | Required for sale/payment/cash flows where applicable |

## UI Rules

- Use permission-based menu and action rendering.
- Never rely on hardcoded role names.
- Show empty, loading, error, permission-denied, and feature-disabled states.
- Prevent duplicate submit.
- Display backend validation errors safely.
- Rebuild UI state when tenant, permission, or entitlement changes.

## Backend Rules

- Validate server-side tenant context.
- Enforce feature entitlement and permission.
- Validate foreign-key ownership within the same tenant.
- Use DTOs and mapping.
- Return 400, 401, 403, 404, 409, and 500 consistently.
- Avoid exposing secrets, hashes, raw tokens, raw activation codes, and internals.

## State Rules

- Feature state belongs in the feature store/service.
- Tenant-scoped state clears on tenant switch.
- Form submit state includes loading, success, and error.
- List state includes pagination, filters, sorting, loading, and errors.

## Error Rules

| Case | UI/API Behavior |
|---|---|
| Missing login | 401 and login state |
| Permission denied | 403 and permission-denied UI |
| Feature disabled | 403 and feature-not-enabled UI |
| Validation failure | 400 with field/form errors |
| Duplicate/conflict | 409 with safe conflict message |

## Out of Scope

No AI analytics or full accounting reports.

## Related Files

- [[99_Archive/04_MODULE_KNOWLEDGE/Reports/01_Module_Overview]]
- [[99_Archive/04_MODULE_KNOWLEDGE/Reports/03_Technical_Contract]]
- [[../../07_UI_UX_KNOWLEDGE/Permission_Based_UI_Rules]]
- [[../../05_BACKEND_ARCHITECTURE/Error_Response_Standards]]
