<!-- title: Tenant Admin User Creation 5-Step Role-Based Access Flow -->
<!-- status: Active -->
<!-- system: OneVerz POS MVP -->
<!-- last_updated: 2026-08-25 -->

# Tenant Admin User Creation 5-Step Role-Based Access Flow

## Purpose

Defines the canonical Tenant Admin journey for creating a tenant user and assigning role-based access. The five screens are a frontend workflow over the current atomic `POST /api/v1/tenant-admin/users` command; they are not five independent database saves.

## Preconditions

- Actor is authenticated in the tenant context.
- Actor has the required user create/invite permission.
- `GET /api/v1/tenant-admin/users/create-options` has loaded assignable roles, active outlets, permission groups, and supported statuses.
- Backend remains the authority for tenant isolation, role delegation, entitlements, and permission assignment.

## Step 1 — Basic Information

Capture full name, email, optional phone, optional employee ID, account status, and one optional profile image. Staff code is generated server-side. Supported create statuses are `INACTIVE` and `INVITED`; `ACTIVE` is not a create option.

Profile media is attached through `profileMediaAssetId`. The current backend has no dedicated user-photo staging endpoint; Flutter currently reuses the outlet image upload contract. This is an implementation gap, not a canonical authorization dependency.

## Step 2 — Assign Role

Display only roles returned by `create-options`. This user-assignment list may contain active system and custom tenant roles that pass the actor delegation policy. It is different from Role Setup Options, which exposes only `TENANT_ADMIN` and `CASHIER` templates.

Selecting a role must load a permission/module preview from the backend catalog and role detail. Never infer access from role names. A role change clears stale role-derived preview state and revalidates direct permission overrides.

## Step 3 — Configure Permissions

Show the selected role's effective baseline and optional direct user grants grouped by backend catalog module/feature. Direct overrides are additive grants only. Explicit deny/revoke is not supported by the current create contract.

The override control is available only when the actor can use `tenant.users.permission_override`. Unknown, inactive, unentitled, platform, or non-delegable permissions must be rejected server-side rather than silently removed.

## Step 4 — Outlet, Till & Access Scope

Canonical supported scope choices:

- **Tenant-wide / All Outlets**: send an empty `outletIds` list; persistence uses `tenant_user_roles`.
- **Selected Outlets**: send one or more tenant-owned active outlet IDs; persistence uses `outlet_user_roles`.

`No Outlet Access` is not supported because an empty list means tenant-wide. User-specific selected tills and default till are not represented by the current user-create API or canonical assignment tables. `tills.default_cashier_tenant_user_id` is a till-owned default-cashier field, not a general user-to-till access mapping.

## Step 5 — Security & Review

Review identity, selected role, permission counts, direct grants, outlet scope, status, and invite choice. The create request requires `Idempotency-Key`. The backend revalidates every identifier and writes the user, role/outlet assignments, direct grants, invite state, outbox request, and audit records atomically.

For `INVITED`, the system generates a setup token, stores only protected/hash material, and the user sets a password through onboarding. Plaintext or administrator-selected temporary passwords are prohibited. `INACTIVE` creates an account that cannot sign in until a later supported activation/update path.

## Success

Return the authoritative created user projection, show a non-duplicating success state, and refresh the user list. An idempotent replay must return the original logical result.

## Failure Handling

| Condition | Expected behavior |
|---|---|
| Duplicate tenant email | Show safe validation/conflict; preserve entered state |
| Role exceeds actor ceiling | `403`; return to role selection |
| Permission is invalid or unentitled | `400/403`; identify invalid selection safely |
| User/outlet belongs to another tenant | Safe not-found/validation response without leakage |
| Duplicate submit | Idempotency returns original result or conflict for changed body |
| Invite delivery unavailable | User/invite state remains authoritative; delivery is reported separately |

## Related

- [[../../07_UI_UX_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Wizard]]
- [[../../08_FLUTTER_POS_KNOWLEDGE/Tenant_Admin_User_Creation_5_Step_Flutter_Contract]]
- [[../../10_TESTING_QA/Test_Case/05_Tenant_User_Permission_Access/Tenant_Admin_User_Creation_5_Step_Test_Cases]]
- [[../../04_MODULE_KNOWLEDGE/05_Tenant_User_Permission_Access/03_Technical_Contract]]
