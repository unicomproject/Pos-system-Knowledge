<!-- title: Tenant Users, Roles, Permissions & Outlet Access Functional Rules -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP Unified Commerce Scope -->
<!-- last_updated: 2026-08-26 -->

# Tenant Users, Roles, Permissions & Outlet Access Functional Rules

## Purpose

Defines business and UX rules for `Tenant_User_Permission_Access` in the new OneVerz POS MVP scope.
These rules must be applied before creating backend APIs, Flutter screens,
responsive online store screens, Angular/admin screens, tests, or database changes.

## Business Rules

- No hardcoded cashier, manager, or administrator behavior.
- Permission definitions are database-driven and module-scoped.
- Outlet access can narrow a user role to specific outlets.
- Tenant user email and phone uniqueness are tenant-scoped.
- Backend authorization remains final even when UI hides actions.

## User Rules

| User Type | Rule |
|---|---|
| Platform Admin | May manage platform-owned setup only when platform permission exists |
| Tenant Admin | May manage tenant-owned configuration only when entitlement and permission pass |
| Cashier / Stall Operator | May perform POS actions only with outlet, trusted device, and till context |
| Customer | May access online store/customer actions only through customer-facing APIs |
| Backend Worker | May process derived records, sync, notifications, or reports using service identity and audit |

## UI Rules

- Show this module only when the tenant plan, feature entitlement, and user permission allow it.
- Use loading, empty, error, permission-denied, feature-disabled, offline, and conflict states where relevant.
- Do not hardcode role names such as cashier, manager, or administrator as authorization logic.
- Do not show fake data, fake counts, fake success states, or hardcoded module rows.
- Mobile, tablet, iPad, laptop, and desktop layouts must keep the same business rules.

## Backend Rules

## User Creation Rules — Corrected 2026-08-26

- `UCR-001`: Five UI steps produce one idempotent atomic create command.
- `UCR-002`: Step 1 contains identity/profile/account mode only; it never selects a role.
- `UCR-003`: Step 2 is the only owner of the selected Base Role.
- `BR-UCR-PERM-001`: Step 3 must never mutate the Base Role or `tenant_role_permissions`.
- `UCR-004`: Direct user overrides are additive grants only and require actor override authority.
- `UCR-005`: Inherited, User Override, and Locked/Not Assignable states are distinct.
- `UCR-006`: Changing Base Role invalidates old role-derived state and recalculates access.
- `UCR-007`: Empty outlet IDs mean tenant-wide; non-empty IDs mean selected outlets.
- `UCR-008`: `No Outlet Access` is omitted because it conflicts with current empty-list semantics.
- `UCR-009`: Till selection/default till/per-user default outlet remain unavailable until contracts exist.
- `UCR-010`: Review counts derive from final wizard state and match prior-step summaries.
- `UCR-011`: Access Level Low/Medium/High is prohibited until a deterministic formula exists.
- `UCR-012`: Create supports `INACTIVE` or `INVITED`, not direct `ACTIVE`.
- `UCR-013`: Invitation review appears only for invited mode.
- `UCR-014`: Temporary passwords and partial Save Draft behavior are not canonical.
- `UCR-015`: Role, outlet, permission, media, entitlement, and delegation validation remains server-side.

- Resolve tenant context server-side for every tenant-owned mutation.
- Validate foreign-key ownership within the same tenant before saving.
- Use typed request/response DTOs and map them to domain models/entities.
- Return standard 400, 401, 403, 404, 409, and 500 responses.
- Never expose passwords, POS PINs, token hashes, payment secrets, card data, or cross-tenant records.

## Offline And Cache Rules

- Cache can speed up safe reference data only.
- Backend database remains final truth for sale totals, stock, payments, refunds, exchanges, permissions, and sync acceptance.
- Offline operations must be marked pending until accepted by backend sync.
- Conflicts must be visible; do not silently overwrite backend truth.

## Error Rules

| Case | Expected Behavior |
|---|---|
| Missing login | Return 401 and send user to login/session recovery |
| Permission denied | Return 403 and show access denied state |
| Feature disabled | Return 403 and show feature not enabled state |
| Invalid business data | Return 400 with safe field/form errors |
| Duplicate or conflict | Return 409 with safe conflict message |
| Offline blocked action | Explain that online backend validation is required |

## Out Of Scope

- Platform role management
- Customer website accounts
- Payment provider credentials
- Offline conflict resolution

## Related Files

- [[04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/01_Module_Overview]]
- [[04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract]]
