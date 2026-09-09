<!-- title: Tenant Admin User Creation 5-Step Corrected Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-09-09 -->

# Tenant Admin User Creation 5-Step Corrected Flow

## Canonical Journey

`Users → Add New User → Basic Information → Assign Base Role → Configure This User's Effective Permissions → Define Outlet & Till Scope → Security & Final Review → Create User`

The five screens are one frontend workflow over the atomic `POST /api/v1/tenant-admin/users` command. No step performs an independent persistent draft save.

## Step 1 — Basic Information

Step 1 owns identity/profile only. It must not contain a Role selector.

| Field | Contract |
|---|---|
| Full Name | Required |
| Email | Required and tenant-unique after normalization |
| Phone | Canonical UX requirement; current backend accepts null, so backend enforcement is a gap |
| Employee ID | Optional and supported |
| Staff Code | Backend-generated, read-only after generation |
| Profile Photo | Optional media attachment; dedicated user upload endpoint remains a gap |
| Account mode | `INVITED` or `INACTIVE` only |

Actions: `Cancel`, `Next`.

## Step 2 — Assign Base Role

This is the only step that selects `roleId`. Roles come from `GET /api/v1/tenant-admin/users/create-options` and must pass tenant ownership and actor delegation policy. Show role name, description, module preview, and inherited permission preview. Role Setup Options (`TENANT_ADMIN`, `CASHIER`) are a different contract from assignable user roles.

Changing the selected role reloads the new role baseline, removes stale Role A-derived state, revalidates additive user grants, and recalculates all summaries.

Actions: `Back`, `Cancel`, `Next`.

## Step 3 — Configure This User's Effective Permissions

Supporting text: `Configure this user's effective access based on the selected role.`

Information message: `Changes made here apply only to this user and do not modify the selected base role.`

Current architecture supports additive direct user grants only:

| State | Meaning |
|---|---|
| Inherited | Granted by selected Base Role; not removed from this wizard |
| User Override | Additional direct grant for this user through `tenant_user_permissions` |
| Locked / Not Assignable | Blocked by actor authority, delegation ceiling, entitlement, system protection, or inactive catalog state |

`BR-UCR-PERM-001`: Add New User must never update `tenant_role_permissions` or the selected role's global permission set. Role-level changes belong only to Roles & Access.

### Shared tenant and profile safeguards

- Tenant Admin must be authenticated unless the flow is a setup/payment link flow before first login.
- Tenant status, feature entitlement, permission, and outlet access must be enforced where applicable.
- Tenant-owned data must be isolated by tenant context resolved server-side.
- All create/update/status actions should be audit logged.
- Tenant user is tenant-scoped.
- Do not mix tenant user with platform user or customer account.
- User profile photos are stored as tenant-scoped media assets; list and detail
  APIs expose a nullable resolved URL so clients can fall back to initials.

Effective permissions are the role baseline plus supported additive user grants, filtered by tenant, entitlement, active definitions, actor delegation, and context. Explicit deny/removal of inherited role grants is not supported.

Actions: `Back`, `Next`. `Save Draft` is absent.

## Step 4 — Define Outlet & Till Scope

Current supported access modes are:

- **All Outlets / Tenant-wide**: send empty `outletIds`; persist active `tenant_user_roles`.
- **Selected Outlets**: require at least one active tenant-owned outlet; persist active `outlet_user_roles`.

`No Outlet Access` is not supported because empty `outletIds` already means tenant-wide. It must not appear as an active option.

User-specific selected tills, Default Till, and per-user Default Outlet are not supported by the current user-create DTO. These controls must be omitted or clearly unavailable; they must not create required-field validation. `tills.default_cashier_tenant_user_id` is not a general user-to-till assignment contract.

Future till/default support must enforce outlet membership, clear tills when an outlet is removed, clear Default Till when invalid, and clear/reselect Default Outlet when invalid. These are implementation requirements, not current capabilities.

Actions: `Back`, `Next`.

## Step 5 — Security & Final Review

Review is derived from final wizard state; no static example counts are authoritative.

| Review area | Source |
|---|---|
| User Information | Final Step 1 state |
| Base Role | Final Step 2 role |
| Module Count | Distinct modules represented by final effective permissions |
| Effective Permission Count | Final inherited plus accepted additive direct grants |
| Outlet Count | Final effective outlet scope; selected count or authoritative active-outlet count for tenant-wide |
| Till Count / defaults | Omit until supported; never invent zero or sample values |

`Access Level` Low/Medium/High is removed because no deterministic canonical formula exists.

For `INVITED`, show destination, invite/setup behavior, and invitation state. A one-time expiring setup token lets the user set a password; no administrator-selected temporary password is allowed. For `INACTIVE`, show that login is disabled and do not display `Will be invited` unless invite mode is actually selected. Direct `ACTIVE` creation is not supported.

Final checklist: identity valid, Base Role selected, permissions reconciled, outlet scope valid, account/invitation state valid. Final CTA: `Create User`.

## Final Validation

Before create, validate identity, Base Role, effective permissions, outlet scope, account mode, tenant ownership, entitlement, delegation ceiling, and idempotency. Till/default validation is activated only after a canonical backend contract exists.

## Related

- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Wizard]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Flutter_Contract]]
- [[../../04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract]]
- [[../../10_TESTING_QA/Test_Case/05_Tenant_User_Permission_Access/Tenant_Admin_User_Creation_5_Step_Test_Cases]]
