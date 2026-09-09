<!-- title: Tenant Admin User Creation 5-Step Corrected Test Cases -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-26 -->

# Tenant Admin User Creation 5-Step Corrected Test Cases

| ID | Scenario | Expected result |
|---|---|---|
| TC-UCR-001 | Open Step 1 | No Role selector; identity/profile/account mode only |
| TC-UCR-002 | Select role | Base Role can be selected only in Step 2 |
| TC-UCR-003 | Add user-specific permission | Direct user grant changes; Base Role permission rows remain unchanged |
| TC-UCR-004 | Configure Role A, go back, select Role B | Role A-derived state is removed; Role B baseline/effective set/counts recalculate |
| TC-UCR-005 | Attempt No Outlet Access | Option is absent/disabled because current empty-list contract means tenant-wide |
| TC-UCR-006 | Select Selected Outlets with none | Validation blocks Next/Create until one valid tenant outlet is selected |
| TC-UCR-007 | Attempt unsupported till/default control | Control is absent/unavailable; no false required validation or payload field |
| TC-UCR-008 | Future contract removes an outlet with dependent tills | Invalid tills/defaults are cleared; test remains pending until implementation exists |
| TC-UCR-009 | Compare Step 3 and Step 5 | Module/effective permission counts match final wizard state |
| TC-UCR-010 | Compare Step 4 and Step 5 | Outlet scope/count match; no invented till count |
| TC-UCR-011 | Create inactive mode | Review shows login disabled and does not show `Will be invited` |
| TC-UCR-012 | Create invited mode | Review shows destination/setup flow; user becomes active only after invite acceptance |
| TC-UCR-013 | Review permissions | No Low/Medium/High Access Level appears |
| TC-UCR-014 | Review security features | Temporary password, 2FA, Access Start Date, Force Password Change, and draft are not shown as implemented |

## Security and Data Tests

- Direct grant requires `tenant.users.permission_override` and remains within actor delegation ceiling.
- Unknown, inactive, unentitled, platform, and cross-tenant IDs fail without partial mutation.
- Same idempotency key/body returns one logical user; changed body conflicts.
- Empty outlet IDs persist tenant-wide assignment; selected IDs persist only tenant-owned outlet assignments.
- Invite token is one-time/expiring and no plaintext password/token is logged or persisted as a reusable credential.

## Responsive Tests

Verify tablet landscape, tablet portrait, desktop, and compact widths. Step actions remain visible, controls meet 44px targets, permission states are understandable, and no overflow or nested page scroll is introduced.
