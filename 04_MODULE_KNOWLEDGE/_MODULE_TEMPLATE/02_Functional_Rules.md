<!-- title: Functional Rules Template -->
<!-- status: Active -->
<!-- system: SCS-TIX EPOS Release 1 -->
<!-- last_updated: 2026-06-08 -->


# Functional Rules Template

## Purpose

Use this template to document module functional behavior.

Functional rules define how the business feature must behave for frontend,
backend, and QA implementation.

## Required Sections

- Business rules.
- User rules.
- Permission rules.
- Feature entitlement rules.
- Validation rules.
- State/status rules.
- Error/empty rules.
- Audit rules.
- Out-of-scope rules.

## Rule Format

Use direct rules.

Example:

```text
The backend must reject the action when the user lacks the required permission.
```

## Access-Control Format

| Control | Required |
|---|---|
| Authentication | Yes/No |
| Tenant status | Yes/No |
| Feature entitlement | Yes/No |
| Permission | Yes/No |
| Outlet access | Yes/No |
| Trusted device | Yes/No |
| Open till session | Yes/No |

## Error Rule

| Condition | Response |
|---|---|
| Missing login | 401 |
| Permission/entitlement denied | 403 |
| Validation failure | 400 |
| Duplicate/conflict | 409 |

## Related Files

- [[99_Archive/02_ACCESS_CONTROL/API_Authorization_Rules]]
- [[99_Archive/05_BACKEND_ARCHITECTURE/Error_Response_Standards]]
- [[../../07_UI_UX_KNOWLEDGE/Empty_Error_Loading_States]]
